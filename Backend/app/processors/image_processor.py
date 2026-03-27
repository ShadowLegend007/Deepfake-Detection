"""
image_processor.py  –  Multi-signal image authenticity analyser
----------------------------------------------------------------
Signals used
  1. ELA  (Error Level Analysis)   – JPEG recompression residuals
  2. Frequency analysis            – FFT high-frequency content ratio
  3. Noise analysis                – Laplacian variance + residual stats
  4. EXIF / metadata               – Missing or suspicious fields
  5. Colour-stat features          – Channel mean/std/skew
  6. Block-artefact grid           – 8×8 DCT blocking visible in real photos
  7. (Optional) ML model score     – Only used when model is loaded

All signals are combined into a weighted ensemble so that the
system degrades gracefully when the ML model is absent or weak.
"""

import io
import base64
import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import numpy as np
from PIL import Image, ImageChops, ImageFilter
from fastapi import HTTPException

try:
    import piexif
    _PIEXIF = True
except ImportError:
    _PIEXIF = False

try:
    from scipy import stats as _scipy_stats
    _SCIPY = True
except ImportError:
    _SCIPY = False

from app.models.classifiers import MODELS
from app.core.config import get_logger

logger = get_logger("ImageProcessor")



@dataclass
class SignalResult:
    """Holds the raw score (0-1, higher = more suspicious) and a label."""
    score: float          # 0.0 = clean / authentic, 1.0 = suspicious
    label: str
    weight: float = 1.0


@dataclass
class AnalysisResult:
    signals:      Dict[str, SignalResult] = field(default_factory=dict)
    ela_b64:      str                     = ""
    raw_features: List[float]             = field(default_factory=list)

    @property
    def ensemble_score(self) -> float:
        """Weighted average manipulation probability (0–1)."""
        total_w = sum(s.weight for s in self.signals.values())
        if total_w == 0:
            return 0.5
        return sum(s.score * s.weight for s in self.signals.values()) / total_w

    def per_signal_summary(self) -> dict:
        return {
            k: {"score": round(v.score, 3), "label": v.label}
            for k, v in self.signals.items()
        }



def _pil_to_base64_jpeg(img: Image.Image, quality: int = 85) -> str:
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=quality)
    return f"data:image/jpeg;base64,{base64.b64encode(buf.getvalue()).decode()}"


def _load_image(image_bytes: bytes) -> Image.Image:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()                            # catches truncated files early
        img = Image.open(io.BytesIO(image_bytes))  # re-open after verify
        return img
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image: {exc}")


def _to_float_array(img: Image.Image) -> np.ndarray:
    """Convert PIL image to float32 RGB array in [0, 255]."""
    return np.array(img.convert("RGB"), dtype=np.float32)



def _ela_signal(img_rgb: Image.Image, quality: int = 90) -> Tuple[SignalResult, Image.Image, np.ndarray]:
    """
    Compute ELA and return (SignalResult, amplified ELA PIL image).

    Analyses the *spatial distribution* of ELA residuals:
      - High CV (localised bright patches)  → region-level splice (suspicious)
      - Low mean + low CV (uniform noise)   → AI-generated (moderately suspicious)
      - Low mean + low CV overall           → pristine JPEG (authentic)
    """
    buf = io.BytesIO()
    img_rgb.convert("RGB").save(buf, format="JPEG", quality=quality)
    buf.seek(0)
    recompressed = Image.open(buf).convert("RGB")

    ela     = ImageChops.difference(img_rgb.convert("RGB"), recompressed)
    ela_arr = np.array(ela, dtype=np.float32)

    ela_amplified = np.clip(ela_arr * 20.0, 0, 255).astype(np.uint8)
    ela_pil       = Image.fromarray(ela_amplified)

    h, w  = ela_arr.shape[:2]
    gray  = ela_arr.mean(axis=2)

    global_mean = float(gray.mean())
    global_std  = float(gray.std())

    block = 8
    bh, bw = h // block, w // block
    if bh > 0 and bw > 0:
        patches    = gray[:bh*block, :bw*block].reshape(bh, block, bw, block)
        block_means = patches.mean(axis=(1, 3)).ravel().astype(np.float32)
        block_cv   = float(block_means.std() / (block_means.mean() + 1e-6))
    else:
        block_cv = 0.0

    norm_mean = min(global_mean / 30.0, 1.0)
    norm_cv   = min(block_cv   / 2.0,  1.0)

    ai_gen_score   = max(0.0, (1.0 - norm_cv) * 0.5 + norm_mean * 0.3)
    splicing_score = min(norm_cv * 0.8 + norm_mean * 0.2, 1.0)
    combined       = max(ai_gen_score, splicing_score)

    label = (
        f"ELA mean={global_mean:.1f}, std={global_std:.1f}, "
        f"block-CV={block_cv:.3f}"
    )
    return SignalResult(score=float(combined), label=label, weight=1.5), ela_pil, ela_arr



def _frequency_signal(img_gray: np.ndarray) -> SignalResult:
    """
    Measures high-frequency energy ratio and spectral flatness.
    AI-generated images often have reduced high-freq energy (smooth textures)
    or artificial GAN artefacts (excess high-freq).
    """
    fft    = np.fft.fft2(img_gray)
    fshift = np.fft.fftshift(fft)
    mag    = np.abs(fshift) + 1e-8
    h, w   = mag.shape
    cy, cx = h // 2, w // 2

    Y, X  = np.ogrid[:h, :w]
    dist  = np.sqrt((X - cx)**2 + (Y - cy)**2)
    r_max = min(cx, cy)

    low_mask  = dist < r_max * 0.25
    high_mask = dist > r_max * 0.75

    total_energy = mag.sum()
    high_energy  = mag[high_mask].sum()
    low_energy   = mag[low_mask].sum()

    high_ratio = float(high_energy / (total_energy + 1e-8))
    low_ratio  = float(low_energy  / (total_energy + 1e-8))

    if high_ratio < 0.04:
        score = 0.75
        desc  = "very low high-freq energy (AI-smooth)"
    elif high_ratio > 0.40:
        score = 0.70
        desc  = "abnormally high high-freq energy (GAN artefact?)"
    else:
        score = 0.0
        desc  = "normal spectral distribution"

    label = f"FFT high-ratio={high_ratio:.3f}, low-ratio={low_ratio:.3f} – {desc}"
    return SignalResult(score=score, label=label, weight=1.2)



def _noise_signal(img_gray: np.ndarray) -> SignalResult:
    """
    Camera images have sensor noise with specific statistical properties.
    AI images either have no sensor noise or unnaturally uniform noise.

    Uses Laplacian variance, residual noise std, and kurtosis.
    """
    gray_f32  = img_gray.astype(np.float32)
    gray_u8   = np.clip(gray_f32, 0, 255).astype(np.uint8)
    pil_gray  = Image.fromarray(gray_u8, mode="L")

    laplacian = pil_gray.filter(ImageFilter.Kernel(
        size=(3, 3),
        kernel=[-1, -1, -1, -1, 8, -1, -1, -1, -1],
        scale=1, offset=0,
    ))
    lap_arr = np.array(laplacian, dtype=np.float32)
    lap_var = float(np.var(lap_arr))

    blurred  = np.array(
        pil_gray.filter(ImageFilter.GaussianBlur(radius=1)),
        dtype=np.float32,
    )
    residual = gray_f32 - blurred        # float32 – float32, no underflow
    res_std  = float(residual.std())

    if _SCIPY:
        kurtosis = float(_scipy_stats.kurtosis(residual.ravel()))
    else:
        mu       = residual.mean()
        sig4     = (residual.std() ** 4) + 1e-8
        kurtosis = float(np.mean((residual - mu) ** 4) / sig4 - 3.0)

    lap_score   = max(0.0, 1.0 - lap_var / 800.0)
    noise_score = max(0.0, 1.0 - res_std / 12.0)
    kurt_score  = min(abs(kurtosis) / 10.0, 1.0)
    combined    = lap_score * 0.4 + noise_score * 0.4 + kurt_score * 0.2

    label = (
        f"Laplacian-var={lap_var:.1f}, noise-std={res_std:.2f}, "
        f"kurtosis={kurtosis:.2f}"
    )
    return SignalResult(score=float(combined), label=label, weight=1.3)



def _metadata_signal(image_bytes: bytes, img: Image.Image) -> SignalResult:
    """
    Real photographs almost always carry EXIF data.
    AI-generated images typically have none, or generic software metadata.
    Also checks for AI-typical power-of-two dimensions.
    """
    score = 0.0
    notes: List[str] = []

    fmt = (img.format or "").upper()
    if _PIEXIF and fmt in ("JPEG", "JPG", "TIFF"):
        try:
            exif_data = piexif.load(image_bytes)
            ifd0      = exif_data.get("0th", {})
            exif_ifd  = exif_data.get("Exif", {})
            has_exif  = bool(ifd0 or exif_ifd)

            if not has_exif:
                score += 0.3
                notes.append("no EXIF data")
            else:
                make  = ifd0.get(piexif.ImageIFD.Make,  b"")
                model = ifd0.get(piexif.ImageIFD.Model, b"")
                if not make and not model:
                    score += 0.2
                    notes.append("EXIF present but no camera make/model")
                else:
                    notes.append(
                        f"camera={make.decode(errors='replace').strip()}"
                    )
                software = ifd0.get(piexif.ImageIFD.Software, b"")
                if software:
                    sw = software.decode(errors="replace").lower()
                    ai_hints = [
                        "stable diffusion", "midjourney", "dall", "comfy",
                        "automatic1111", "novelai", "invoke",
                    ]
                    if any(h in sw for h in ai_hints):
                        score += 0.5
                        notes.append(f"AI software tag: {sw[:40]}")
        except Exception:
            score += 0.15
            notes.append("EXIF parse error")
    elif fmt in ("PNG", "WEBP", "BMP", "GIF"):
        exif_info = img.info.get("exif", None)
        if not exif_info:
            score += 0.2
            notes.append(f"no EXIF ({fmt} — common in AI-generated images)")
    else:
        exif_info = img.info.get("exif", None)
        if not exif_info:
            score += 0.25
            notes.append("no EXIF (basic check)")

    w, h = img.size
    ai_dims = {512, 768, 1024, 1280, 2048}
    if w in ai_dims and h in ai_dims:
        score += 0.2
        notes.append(f"AI-typical dimensions {w}×{h}")
    elif w == h and w in {256, 512, 1024}:
        score += 0.15
        notes.append(f"square power-of-2 dimensions {w}×{h}")

    score = min(score, 1.0)
    label = "; ".join(notes) if notes else "metadata looks normal"
    return SignalResult(score=score, label=label, weight=0.8)



def _colour_signal(arr: np.ndarray) -> SignalResult:
    """
    AI-generated images often have unusually high saturation, narrow channel
    histograms, or very symmetric luminance distributions.
    """
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    avg_std  = float((r.std() + g.std() + b.std()) / 3.0)
    sat      = (
        np.sqrt((r - g)**2 + (g - b)**2 + (b - r)**2) / (np.sqrt(6) + 1e-8)
    )
    mean_sat = float(sat.mean())

    score  = 0.0
    notes: List[str] = []

    if avg_std < 20:
        score += 0.3
        notes.append(f"unusually uniform channels (std={avg_std:.1f})")
    if mean_sat > 80:
        score += 0.25
        notes.append(f"hyper-saturated colours (sat={mean_sat:.1f})")
    elif mean_sat < 5:
        score += 0.15
        notes.append("near-greyscale image")

    lum = 0.299 * r + 0.587 * g + 0.114 * b
    if _SCIPY:
        skew = float(abs(_scipy_stats.skew(lum.ravel())))
    else:
        mu   = lum.mean()
        sig  = lum.std() + 1e-8
        skew = float(abs(np.mean(((lum - mu) / sig) ** 3)))
    if skew < 0.1:
        score += 0.15
        notes.append("very symmetric luminance (possibly synthetic)")

    score = min(score, 1.0)
    label = (
        "; ".join(notes) if notes
        else f"colour stats normal (std={avg_std:.1f}, sat={mean_sat:.1f})"
    )
    return SignalResult(score=score, label=label, weight=0.9)



def _block_artefact_signal(img_gray: np.ndarray) -> SignalResult:
    """
    Authentic JPEG photos show 8×8 DCT blocking artefacts at block boundaries.
    AI-generated images (often PNG or re-encoded) typically lack these.
    """
    h, w = img_gray.shape
    gy   = np.diff(img_gray, axis=0)
    gx   = np.diff(img_gray, axis=1)

    row_bounds = list(range(7, h - 1, 8))
    col_bounds = list(range(7, w - 1, 8))

    if not row_bounds or not col_bounds:
        return SignalResult(score=0.0, label="image too small for block analysis", weight=0.5)

    boundary_gy = np.abs(gy[row_bounds, :]).mean()
    overall_gy  = np.abs(gy).mean() + 1e-8
    boundary_gx = np.abs(gx[:, col_bounds]).mean()
    overall_gx  = np.abs(gx).mean() + 1e-8

    blocking = float(
        ((boundary_gy / overall_gy) + (boundary_gx / overall_gx)) / 2.0
    )

    if blocking < 1.05:
        score = 0.4
        desc  = "no JPEG blocking artefacts detected"
    elif blocking > 2.5:
        score = 0.3
        desc  = "heavy JPEG blocking (screenshot / re-encoded?)"
    else:
        score = 0.0
        desc  = "natural JPEG blocking present"

    label = f"block-ratio={blocking:.3f} – {desc}"
    return SignalResult(score=score, label=label, weight=0.7)



def _ml_model_signal(features: List[float]) -> Optional[SignalResult]:
    """Uses the loaded RF model as one extra signal. Returns None if unavailable."""
    model = MODELS.get("image")
    if model is None:
        return None
    try:
        arr   = np.array(features, dtype=np.float32).reshape(1, -1)
        proba = model.predict_proba(arr)[0]
        score = float(proba[1])
        return SignalResult(
            score=score, label=f"ML model confidence={score:.3f}", weight=1.0
        )
    except Exception as exc:
        logger.warning(f"ML model inference failed: {exc}")
        return None



def extract_features(image_bytes: bytes) -> AnalysisResult:
    """Run all signals and return a populated AnalysisResult."""
    result = AnalysisResult()
    img    = _load_image(image_bytes)

    MAX_SIDE = 1024
    if max(img.size) > MAX_SIDE:
        img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)

    img_rgb = img.convert("RGB")
    arr     = _to_float_array(img_rgb)
    gray    = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]

    ela_signal_result, ela_pil, raw_ela_arr = _ela_signal(img_rgb)
    result.signals["ela"]                   = ela_signal_result
    result.ela_b64                          = _pil_to_base64_jpeg(ela_pil)

    result.signals["frequency"]   = _frequency_signal(gray)

    result.signals["noise"]       = _noise_signal(gray)

    result.signals["metadata"]    = _metadata_signal(image_bytes, img)

    result.signals["colour"]      = _colour_signal(arr)

    result.signals["blocking"]    = _block_artefact_signal(gray)

    r_ela   = raw_ela_arr[:, :, 0]
    g_ela   = raw_ela_arr[:, :, 1]
    b_ela   = raw_ela_arr[:, :, 2]

    result.raw_features = [
        float(np.std(r_ela)),                          # std_r
        float(np.std(g_ela)),                          # std_g
        float(np.std(b_ela)),                          # std_b
        float(np.mean(raw_ela_arr)),                   # mean_ela
        float(np.max(raw_ela_arr)),                    # max_ela
        float(gray.std()),                             # gray_std
        float(gray.mean()),                            # gray_mean
        result.signals["frequency"].score,             # freq_score
        result.signals["noise"].score,                 # noise_score
        result.signals["colour"].score,                # colour_score
        result.signals["blocking"].score,              # blocking_score
    ]  # 11 dimensions — matches image RF training data

    ml_sig = _ml_model_signal(result.raw_features)
    if ml_sig is not None:
        result.signals["ml_model"] = ml_sig

    return result



def extract_ela_features(image_bytes: bytes) -> Tuple[List[float], str]:
    """
    Return a 5-dim ELA feature vector and the b64 ELA image.

    Feature layout: [std_r, std_g, std_b, mean_ela, max_ela]
    This matches the first 5 dimensions expected by the video RF model
    (which appends inter_frame_variance as dim 6).
    """
    img = _load_image(image_bytes)
    if max(img.size) > 1024:
        img.thumbnail((1024, 1024), Image.LANCZOS)
    img_rgb = img.convert("RGB")

    _, ela_pil, raw_ela_arr = _ela_signal(img_rgb)

    features: List[float] = [
        float(np.std(raw_ela_arr[:, :, 0])),   # std_r
        float(np.std(raw_ela_arr[:, :, 1])),   # std_g
        float(np.std(raw_ela_arr[:, :, 2])),   # std_b
        float(np.mean(raw_ela_arr)),           # mean_ela
        float(np.max(raw_ela_arr)),            # max_ela
    ]
    ela_b64 = _pil_to_base64_jpeg(ela_pil)
    return features, ela_b64



def process_image(image_bytes: bytes) -> dict:
    """Full analysis — returns the response dict consumed by the API layer."""
    result = extract_features(image_bytes)

    manip_prob  = result.ensemble_score
    trust_score = round((1.0 - manip_prob) * 100, 2)

    if manip_prob < 0.30:
        indicator = "Authentic"
    elif manip_prob < 0.55:
        indicator = "Suspicious"
    else:
        indicator = "Manipulated"

    per_signal = result.per_signal_summary()
    logger.info(
        f"Image analysis complete – indicator={indicator}, "
        f"trust={trust_score}, signals={per_signal}"
    )

    return {
        "media_type":               "image",
        "authenticity_indicator":   indicator,
        "trust_score":              trust_score,
        "manipulation_probability": round(manip_prob, 4),
        "signal_breakdown":         per_signal,
        "visual_evidence_base64":   result.ela_b64,
    }
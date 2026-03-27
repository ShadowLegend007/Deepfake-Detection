"""
audio_processor.py  –  Audio authenticity analyser
----------------------------------------------------
Pipeline:
  1. Decode audio with soundfile (WAV / FLAC / OGG / AIFF)
  2. Extract 26-dim MFCC feature vector [mean(13) + std(13)]
  3. Run RF classifier for manipulation probability
  4. Generate waveform plot from decoded samples (not raw bytes)
"""

import io
import base64
from typing import Tuple

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from fastapi import HTTPException

from app.models.classifiers import MODELS
from app.core.config import get_logger

logger = get_logger("AudioProcessor")

try:
    import soundfile as sf
    _SOUNDFILE = True
except ImportError:
    _SOUNDFILE = False

try:
    from scipy.fft import dct as _scipy_dct
    _SCIPY_DCT = True
except ImportError:
    _SCIPY_DCT = False



def _load_audio(audio_bytes: bytes) -> Tuple[np.ndarray, int]:
    """
    Decode audio bytes into a mono float32 sample array and sample rate.

    Supported formats: WAV, FLAC, OGG/Vorbis, AIFF (via soundfile / libsndfile).
    MP3 is NOT supported without ffmpeg — raise a clear 422 in that case.
    """
    if not _SOUNDFILE:
        raise HTTPException(
            status_code=503,
            detail=(
                "soundfile library is not installed. "
                "Run: pip install soundfile"
            ),
        )
    try:
        samples, sr = sf.read(
            io.BytesIO(audio_bytes), dtype="float32", always_2d=False
        )
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Cannot decode audio file. "
                f"Supported formats: WAV, FLAC, OGG, AIFF. "
                f"For MP3, please convert to WAV first. "
                f"Error: {exc}"
            ),
        )

    if samples.ndim > 1:
        samples = samples.mean(axis=1)

    return samples.astype(np.float32), int(sr)



def _compute_mfcc(
    samples: np.ndarray,
    sr: int,
    n_mfcc: int = 13,
    n_mels: int = 40,
) -> np.ndarray:
    """
    Compute MFCC matrix (n_frames × n_mfcc) from mono float32 samples.

    Steps: pre-emphasis → framing → Hamming window → power spectrum →
           mel filterbank → log → DCT-II.
    """
    samples = np.append(samples[0], samples[1:] - 0.97 * samples[:-1])

    frame_len = min(int(sr * 0.025), len(samples))   # 25 ms
    hop_len   = max(1, int(sr * 0.010))              # 10 ms
    n_fft     = max(512, int(2 ** np.ceil(np.log2(frame_len))))

    if len(samples) < frame_len:
        samples = np.pad(samples, (0, frame_len - len(samples) + 1))

    n_frames = max(1, 1 + (len(samples) - frame_len) // hop_len)
    indices  = (
        np.arange(frame_len)[None, :]
        + hop_len * np.arange(n_frames)[:, None]
    )
    indices  = np.clip(indices, 0, len(samples) - 1)
    frames   = samples[indices] * np.hamming(frame_len)   # (n_frames, frame_len)

    n_bins = n_fft // 2 + 1
    mag    = np.abs(np.fft.rfft(frames, n=n_fft))         # (n_frames, n_bins)
    power  = (mag ** 2) / n_fft

    low_mel  = 0.0
    high_mel = 2595.0 * np.log10(1.0 + (sr / 2.0) / 700.0)
    mel_pts  = np.linspace(low_mel, high_mel, n_mels + 2)
    hz_pts   = 700.0 * (10.0 ** (mel_pts / 2595.0) - 1.0)
    bin_pts  = np.clip(
        np.floor((n_fft + 1) * hz_pts / sr).astype(int), 0, n_bins - 1
    )

    fbank = np.zeros((n_mels, n_bins), dtype=np.float32)
    for m in range(1, n_mels + 1):
        f0, f1, f2 = bin_pts[m - 1], bin_pts[m], bin_pts[m + 1]
        if f1 > f0:
            fbank[m - 1, f0:f1] = (np.arange(f0, f1) - f0) / (f1 - f0)
        if f2 > f1:
            fbank[m - 1, f1:f2] = (f2 - np.arange(f1, f2)) / (f2 - f1)

    mel_energy = np.maximum(power @ fbank.T, 1e-10)   # (n_frames, n_mels)
    log_mel    = np.log(mel_energy)

    if _SCIPY_DCT:
        mfcc = _scipy_dct(log_mel, type=2, axis=1, norm="ortho")[:, :n_mfcc]
    else:
        N       = log_mel.shape[1]
        k       = np.arange(n_mfcc)
        n_idx   = np.arange(N)
        dct_mat = np.cos(
            np.pi * k[:, None] * (2 * n_idx[None, :] + 1) / (2 * N)
        )  # (n_mfcc, N)
        mfcc            = (log_mel @ dct_mat.T) * np.sqrt(2.0 / N)
        mfcc[:, 0]     /= np.sqrt(2)   # ortho normalisation for DC term

    return mfcc.astype(np.float32)   # (n_frames, n_mfcc)


def _extract_mfcc_features(samples: np.ndarray, sr: int) -> np.ndarray:
    """Return 26-dim feature vector: [mfcc_mean(13), mfcc_std(13)]."""
    mfcc = _compute_mfcc(samples, sr, n_mfcc=13)
    return np.concatenate([mfcc.mean(axis=0), mfcc.std(axis=0)]).astype(np.float32)



def _generate_waveform_plot(samples: np.ndarray, sr: int) -> str:
    """Plot the decoded audio waveform and return a base64-encoded JPEG."""
    max_pts = 4_000
    if len(samples) > max_pts:
        step    = len(samples) // max_pts
        samples = samples[::step]

    time_axis = np.linspace(0.0, len(samples) / max(sr, 1), num=len(samples))

    fig, ax = plt.subplots(figsize=(8, 3), facecolor="#0f0f1a")
    ax.set_facecolor("#0f0f1a")
    ax.plot(time_axis, samples, color="#7c3aed", linewidth=0.6, alpha=0.85)
    ax.set_xlabel("Time (s)",  color="#a0aec0", fontsize=9)
    ax.set_ylabel("Amplitude", color="#a0aec0", fontsize=9)
    ax.set_title(
        "Audio Waveform — DeepTrust", color="#ffffff", fontsize=11, fontweight="bold"
    )
    ax.tick_params(colors="#a0aec0")
    for spine in ax.spines.values():
        spine.set_edgecolor("#2d2d4e")
    ax.grid(True, color="#2d2d4e", linestyle="--", linewidth=0.5, alpha=0.6)
    plt.tight_layout()

    buf = io.BytesIO()
    fig.savefig(
        buf, format="jpeg", dpi=110, bbox_inches="tight",
        facecolor=fig.get_facecolor(),
    )
    plt.close(fig)
    buf.seek(0)
    return f"data:image/jpeg;base64,{base64.b64encode(buf.read()).decode()}"



def process_audio(audio_bytes: bytes) -> dict:
    """Decode, analyse, and return a response dict matching the image format."""
    model = MODELS["audio"]
    if model is None:
        raise HTTPException(status_code=503, detail="Audio model not yet loaded.")

    samples, sr = _load_audio(audio_bytes)

    features     = _extract_mfcc_features(samples, sr)
    waveform_b64 = _generate_waveform_plot(samples, sr)

    duration_s = len(samples) / sr
    logger.info(
        f"Audio decoded — sr={sr} Hz, duration={duration_s:.2f}s, "
        f"MFCC mean_μ={features[:13].mean():.2f}, std_μ={features[13:].mean():.2f}"
    )

    try:
        proba      = model.predict_proba(features.reshape(1, -1))[0]
        manip_prob = float(proba[1])
    except Exception as exc:
        logger.error(f"Audio model inference failed: {exc}")
        raise HTTPException(status_code=500, detail="Audio model inference failed.")

    trust_score = round((1.0 - manip_prob) * 100, 2)

    if manip_prob < 0.35:
        indicator = "Authentic"
    elif manip_prob < 0.65:
        indicator = "Suspicious"
    else:
        indicator = "Manipulated"

    mfcc_energy_score = float(
        min(np.abs(features[:13]).mean() / 50.0, 1.0)
    )
    mfcc_var_score = float(
        min(features[13:].mean() / 20.0, 1.0)
    )
    signal_breakdown = {
        "mfcc_energy": {
            "score": round(mfcc_energy_score, 3),
            "label": f"MFCC mean energy={features[:13].mean():.2f}",
        },
        "mfcc_variance": {
            "score": round(max(mfcc_var_score, 0.0), 3),
            "label": f"MFCC mean std={features[13:].mean():.2f}",
        },
        "ml_model": {
            "score": round(manip_prob, 3),
            "label": f"RF model confidence={manip_prob:.3f}",
        },
    }

    return {
        "media_type":               "audio",
        "authenticity_indicator":   indicator,
        "trust_score":              trust_score,
        "manipulation_probability": round(manip_prob, 4),
        "signal_breakdown":         signal_breakdown,
        "visual_evidence_base64":   waveform_b64,
    }
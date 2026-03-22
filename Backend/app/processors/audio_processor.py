import io
import base64

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from fastapi import HTTPException

from app.models.classifiers import MODELS
from app.core.config import get_logger

logger = get_logger("AudioProcessor")


def _generate_synthetic_mfcc_features(audio_bytes: bytes) -> np.ndarray:
    samples = np.frombuffer(audio_bytes, dtype=np.uint8).astype(np.float32) - 128.0

    if len(samples) < 13:
        samples = np.pad(samples, (0, 13 - len(samples)))

    segments  = np.array_split(samples, 13)
    mfcc_mean = np.array([seg.mean() for seg in segments], dtype=np.float32)
    mfcc_std  = np.array([seg.std()  for seg in segments], dtype=np.float32)

    return np.concatenate([mfcc_mean, mfcc_std])


def _generate_waveform_plot(audio_bytes: bytes) -> str:
    samples = np.frombuffer(audio_bytes, dtype=np.uint8).astype(np.float32) - 128.0

    max_pts = 4_000
    if len(samples) > max_pts:
        step    = len(samples) // max_pts
        samples = samples[::step]

    time_axis = np.linspace(0, len(samples) / 8_000, num=len(samples))

    fig, ax = plt.subplots(figsize=(8, 3), facecolor="#0f0f1a")
    ax.set_facecolor("#0f0f1a")
    ax.plot(time_axis, samples, color="#7c3aed", linewidth=0.6, alpha=0.85)
    ax.set_xlabel("Time (s)", color="#a0aec0", fontsize=9)
    ax.set_ylabel("Amplitude", color="#a0aec0", fontsize=9)
    ax.set_title("Audio Waveform — DeepTrust", color="#ffffff", fontsize=11, fontweight="bold")
    ax.tick_params(colors="#a0aec0")
    for spine in ax.spines.values():
        spine.set_edgecolor("#2d2d4e")
    ax.grid(True, color="#2d2d4e", linestyle="--", linewidth=0.5, alpha=0.6)
    plt.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="jpeg", dpi=110, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    buf.seek(0)

    b64 = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"


def process_audio(audio_bytes: bytes) -> dict:
    model = MODELS["audio"]
    if model is None:
        raise HTTPException(status_code=503, detail="Audio model not yet loaded.")

    features     = _generate_synthetic_mfcc_features(audio_bytes)
    waveform_b64 = _generate_waveform_plot(audio_bytes)
    logger.info(f"Audio MFCC features extracted: mean_μ={features[:13].mean():.2f}, std_μ={features[13:].mean():.2f}")

    proba       = model.predict_proba(features.reshape(1, -1))[0]
    manip_prob  = float(proba[1])
    trust_score = round((1.0 - manip_prob) * 100, 2)

    if manip_prob < 0.35:
        indicator = "Authentic"
    elif manip_prob < 0.65:
        indicator = "Suspicious"
    else:
        indicator = "Manipulated"

    return {
        "media_type": "audio",
        "authenticity_indicator": indicator,
        "trust_score": trust_score,
        "visual_evidence_base64": waveform_b64,
    }

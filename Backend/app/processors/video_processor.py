"""
video_processor.py  –  Video authenticity analyser
----------------------------------------------------
Pipeline:
  1. Write video bytes to a temp file (cv2 requires a file path)
  2. Sample frames at 25 %, 50 %, 75 % (+ extra frames for long videos)
  3. Per-frame: extract 5-dim ELA feature vector via extract_ela_features
  4. Average frame features + inter-frame ELA variance → 6-dim vector
  5. RF classifier → manipulation probability
"""

import io
import os
import tempfile
from typing import List, Tuple

import cv2
import numpy as np
from PIL import Image
from fastapi import HTTPException

from app.models.classifiers import MODELS
from app.processors.image_processor import extract_ela_features   # 5-dim ELA + b64
from app.core.config import get_logger

logger = get_logger("VideoProcessor")



def _sample_frame_indices(total_frames: int, n_samples: int = 5) -> List[int]:
    """
    Return up to n_samples evenly-spaced frame indices, avoiding exact
    duplicates that can occur with very short clips.
    """
    n = min(n_samples, total_frames)
    raw = [int(total_frames * (i + 1) / (n + 1)) for i in range(n)]
    seen: set = set()
    indices: List[int] = []
    for idx in raw:
        clamped = max(0, min(idx, total_frames - 1))
        if clamped not in seen:
            seen.add(clamped)
            indices.append(clamped)
    return indices



def process_video(video_bytes: bytes) -> dict:
    """Analyse a video and return a response dict matching the image/audio format."""
    model = MODELS["video"]
    if model is None:
        raise HTTPException(status_code=503, detail="Video model not yet loaded.")

    tmp = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    tmp_path = tmp.name
    try:
        tmp.write(video_bytes)
        tmp.flush()
        tmp.close()   # must close before cv2 opens it (especially on Windows)

        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=422, detail="Unable to open video file.")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps          = cap.get(cv2.CAP_PROP_FPS) or 25.0

        if total_frames < 3:
            cap.release()
            raise HTTPException(
                status_code=422,
                detail="Video too short — at least 3 frames are required.",
            )

        indices = _sample_frame_indices(total_frames, n_samples=5)

        frame_features: List[List[float]] = []
        frame_ela_b64s: List[str]         = []
        frame_ela_means: List[float]      = []

        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret:
                logger.warning(f"Could not read frame {idx} — skipping.")
                continue

            rgb_frame   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_frame   = Image.fromarray(rgb_frame)
            frame_buf   = io.BytesIO()
            pil_frame.save(frame_buf, format="JPEG", quality=95)
            frame_bytes = frame_buf.getvalue()

            feats, ela_b64 = extract_ela_features(frame_bytes)  # (5-dim, b64)
            frame_features.append(feats)
            frame_ela_b64s.append(ela_b64)
            frame_ela_means.append(feats[3])   # mean_ela (index 3)
            logger.info(
                f"Frame {idx}: ELA feats={[round(f, 2) for f in feats]}"
            )

        cap.release()

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
            logger.debug(f"Cleaned up temp file: {tmp_path}")

    if not frame_features:
        raise HTTPException(
            status_code=422,
            detail="Could not extract any usable frames from the video.",
        )

    avg_features: List[float] = np.mean(frame_features, axis=0).tolist()   # 5-dim

    inter_frame_variance = (
        float(np.var(frame_ela_means)) if len(frame_ela_means) > 1 else 0.0
    )

    video_feature_vec = np.array(
        avg_features + [inter_frame_variance], dtype=np.float32
    ).reshape(1, -1)   # shape (1, 6) — matches video RF training data

    logger.info(
        f"Video feature vec: {[round(v, 3) for v in video_feature_vec[0]]}"
    )

    try:
        proba      = model.predict_proba(video_feature_vec)[0]
        manip_prob = float(proba[1])
    except Exception as exc:
        logger.error(f"Video model inference failed: {exc}")
        raise HTTPException(status_code=500, detail="Video model inference failed.")

    trust_score = round((1.0 - manip_prob) * 100, 2)

    if manip_prob < 0.35:
        indicator = "Authentic"
    elif manip_prob < 0.65:
        indicator = "Suspicious"
    else:
        indicator = "Manipulated"

    best_idx        = int(np.argmax(frame_ela_means)) if frame_ela_means else 0
    visual_evidence = frame_ela_b64s[best_idx] if frame_ela_b64s else ""

    avg_ela_mean   = float(np.mean(frame_ela_means))
    ela_mean_score = min(avg_ela_mean / 40.0, 1.0)
    ifc_score      = min(inter_frame_variance / 50.0, 1.0)

    signal_breakdown = {
        "ela_mean": {
            "score": round(ela_mean_score, 3),
            "label": f"avg ELA mean across frames={avg_ela_mean:.2f}",
        },
        "temporal_variance": {
            "score": round(ifc_score, 3),
            "label": (
                f"inter-frame ELA variance={inter_frame_variance:.2f} "
                f"({len(frame_features)} frames sampled)"
            ),
        },
        "ml_model": {
            "score": round(manip_prob, 3),
            "label": f"RF model confidence={manip_prob:.3f}",
        },
    }

    return {
        "media_type":               "video",
        "authenticity_indicator":   indicator,
        "trust_score":              trust_score,
        "manipulation_probability": round(manip_prob, 4),
        "signal_breakdown":         signal_breakdown,
        "visual_evidence_base64":   visual_evidence,
    }
import io
import os
import tempfile

import cv2
import numpy as np
from PIL import Image
from fastapi import HTTPException

from app.models.classifiers import MODELS
from app.processors.image_processor import extract_ela_features
from app.core.config import get_logger

logger = get_logger("VideoProcessor")


def process_video(video_bytes: bytes) -> dict:
    model = MODELS["video"]
    if model is None:
        raise HTTPException(status_code=503, detail="Video model not yet loaded.")

    tmp = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    try:
        tmp.write(video_bytes)
        tmp.flush()
        tmp.close()

        cap = cv2.VideoCapture(tmp.name)
        if not cap.isOpened():
            raise HTTPException(status_code=422, detail="Unable to open video file.")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames < 3:
            cap.release()
            raise HTTPException(
                status_code=422,
                detail="Video too short — at least 3 frames are required.",
            )

        indices = [
            int(total_frames * 0.25),
            int(total_frames * 0.50),
            int(total_frames * 0.75),
        ]

        frame_features: list[list[float]] = []
        frame_ela_b64s: list[str]         = []
        frame_variances: list[float]      = []

        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if not ret:
                logger.warning(f"Could not read frame at index {idx} — skipping.")
                continue

            rgb_frame   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_frame   = Image.fromarray(rgb_frame)
            frame_buf   = io.BytesIO()
            pil_frame.save(frame_buf, format="JPEG", quality=95)
            frame_bytes = frame_buf.getvalue()

            feats, ela_b64 = extract_ela_features(frame_bytes)
            frame_features.append(feats)
            frame_ela_b64s.append(ela_b64)
            frame_variances.append(float(np.var(feats[:3])))
            logger.info(f"Frame {idx}: ELA features={[round(f, 2) for f in feats]}")

        cap.release()

    finally:
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)
            logger.info(f"Cleaned up temp file: {tmp.name}")

    if not frame_features:
        raise HTTPException(
            status_code=422,
            detail="Could not extract any usable frames from the video.",
        )

    avg_features         = np.mean(frame_features, axis=0).tolist()
    inter_frame_variance = float(np.var(frame_variances)) if len(frame_variances) > 1 else 0.0
    video_feature_vec    = np.array(avg_features + [inter_frame_variance]).reshape(1, -1)
    logger.info(f"Video feature vector: {[round(v, 3) for v in video_feature_vec[0]]}")

    proba       = model.predict_proba(video_feature_vec)[0]
    manip_prob  = float(proba[1])
    trust_score = round((1.0 - manip_prob) * 100, 2)

    if manip_prob < 0.35:
        indicator = "Authentic"
    elif manip_prob < 0.65:
        indicator = "Suspicious"
    else:
        indicator = "Manipulated"

    best_idx        = int(np.argmax(frame_variances)) if frame_variances else 0
    visual_evidence = frame_ela_b64s[best_idx] if frame_ela_b64s else ""

    return {
        "media_type": "video",
        "authenticity_indicator": indicator,
        "trust_score": trust_score,
        "visual_evidence_base64": visual_evidence,
    }

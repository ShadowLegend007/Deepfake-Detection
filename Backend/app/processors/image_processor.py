import io
import base64

import numpy as np
from PIL import Image, ImageChops
from fastapi import HTTPException

from app.models.classifiers import MODELS
from app.core.config import get_logger

logger = get_logger("ImageProcessor")


def _pil_image_to_base64_jpeg(img: Image.Image, quality: int = 85) -> str:
    buffer = io.BytesIO()
    img.convert("RGB").save(buffer, format="JPEG", quality=quality)
    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"


def extract_ela_features(image_bytes: bytes) -> tuple[list[float], str]:
    original = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    recompressed_buf = io.BytesIO()
    original.save(recompressed_buf, format="JPEG", quality=90)
    recompressed_buf.seek(0)
    recompressed = Image.open(recompressed_buf).convert("RGB")

    ela_image = ImageChops.difference(original, recompressed)

    ela_array     = np.array(ela_image, dtype=np.float32)
    ela_amplified = np.clip(ela_array * 20.0, 0, 255).astype(np.uint8)
    ela_pil       = Image.fromarray(ela_amplified)

    r, g, b  = ela_amplified[:, :, 0], ela_amplified[:, :, 1], ela_amplified[:, :, 2]
    features = [
        float(np.std(r)),
        float(np.std(g)),
        float(np.std(b)),
        float(np.mean(ela_amplified)),
        float(np.max(ela_amplified)),
    ]

    ela_b64 = _pil_image_to_base64_jpeg(ela_pil, quality=85)
    return features, ela_b64


def process_image(image_bytes: bytes) -> dict:
    model = MODELS["image"]
    if model is None:
        raise HTTPException(status_code=503, detail="Image model not yet loaded.")

    features, ela_b64 = extract_ela_features(image_bytes)
    logger.info(f"Image ELA features extracted: {[round(f, 2) for f in features]}")

    proba       = model.predict_proba(np.array(features).reshape(1, -1))[0]
    manip_prob  = float(proba[1])
    trust_score = round((1.0 - manip_prob) * 100, 2)

    if manip_prob < 0.35:
        indicator = "Authentic"
    elif manip_prob < 0.65:
        indicator = "Suspicious"
    else:
        indicator = "Manipulated"

    return {
        "media_type": "image",
        "authenticity_indicator": indicator,
        "trust_score": trust_score,
        "visual_evidence_base64": ela_b64,
    }

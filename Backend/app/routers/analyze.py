from fastapi import APIRouter, File, HTTPException, UploadFile

from app.processors.audio_processor import process_audio
from app.processors.image_processor import process_image
from app.processors.video_processor import process_video
from app.core.config import get_logger

logger = get_logger("Router.Analyze")

router = APIRouter()


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content_type: str = file.content_type or ""
    logger.info(f"📥 Received: '{file.filename}'  type='{content_type}'")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if content_type.startswith("image/"):
        result = process_image(file_bytes)

    elif content_type.startswith("audio/"):
        result = process_audio(file_bytes)

    elif content_type.startswith("video/"):
        result = process_video(file_bytes)

    else:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Unsupported media type '{content_type}'. "
                "Please upload an image (image/*), audio (audio/*), "
                "or video (video/*) file."
            ),
        )

    logger.info(
        f"📤 {result['media_type'].upper()} → "
        f"{result['authenticity_indicator']} | "
        f"trust={result['trust_score']}%"
    )
    return result

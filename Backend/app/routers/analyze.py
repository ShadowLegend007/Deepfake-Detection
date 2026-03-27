from fastapi import APIRouter, File, HTTPException, UploadFile

from app.processors.audio_processor import process_audio
from app.processors.image_processor import process_image
from app.processors.video_processor import process_video
from app.core.config import get_logger

logger = get_logger("Router.Analyze")

router = APIRouter()

_MAX_IMAGE_BYTES = 20  * 1024 * 1024   #  20 MB
_MAX_AUDIO_BYTES = 50  * 1024 * 1024   #  50 MB
_MAX_VIDEO_BYTES = 200 * 1024 * 1024   # 200 MB


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content_type: str = file.content_type or ""
    logger.info(f"📥 Received: '{file.filename}'  type='{content_type}'")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    n_bytes = len(file_bytes)

    if content_type.startswith("image/"):
        if n_bytes > _MAX_IMAGE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Image too large ({n_bytes // 1024} KB). Max: {_MAX_IMAGE_BYTES // 1024 // 1024} MB.",
            )
        result = process_image(file_bytes)

    elif content_type.startswith("audio/"):
        if n_bytes > _MAX_AUDIO_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Audio too large ({n_bytes // 1024 // 1024} MB). Max: {_MAX_AUDIO_BYTES // 1024 // 1024} MB.",
            )
        result = process_audio(file_bytes)

    elif content_type.startswith("video/"):
        if n_bytes > _MAX_VIDEO_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Video too large ({n_bytes // 1024 // 1024} MB). Max: {_MAX_VIDEO_BYTES // 1024 // 1024} MB.",
            )
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
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_CONFIG, get_logger
from app.models.classifiers import train_all_models
from app.routers.analyze import router as analyze_router

logger = get_logger("Main")

app = FastAPI(
    title="DeepTrust",
    description="Comprehensive Deepfake Detection System — Supports Image (ELA), Audio (MFCC), and Video (temporal ELA) analysis.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(CORSMiddleware, **CORS_CONFIG)

app.include_router(analyze_router)


@app.on_event("startup")
async def startup_event() -> None:
    train_all_models()


@app.get("/", tags=["Health"])
async def root():
    from app.models.classifiers import MODELS
    models_status = {k: ("ready" if v is not None else "not loaded") for k, v in MODELS.items()}
    return {
        "service": "DeepTrust",
        "status": "operational",
        "models": models_status,
    }

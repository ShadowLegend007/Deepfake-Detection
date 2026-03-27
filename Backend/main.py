from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_CONFIG, get_logger
from app.models.classifiers import train_all_models
from app.routers.analyze import router as analyze_router

logger = get_logger("Main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle handler (replaces deprecated on_event)."""
    train_all_models()
    yield


app = FastAPI(
    title="DeepTrust",
    description=(
        "Comprehensive Deepfake Detection System — "
        "Supports Image (multi-signal ELA), Audio (MFCC), and Video (temporal ELA) analysis."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(CORSMiddleware, **CORS_CONFIG)
app.include_router(analyze_router)


@app.get("/ping", tags=["Health"])
async def ping():
    return {"ping": "pong"}


@app.get("/", tags=["Health"])
async def root():
    from app.models.classifiers import MODELS
    models_status = {k: ("ready" if v is not None else "not loaded") for k, v in MODELS.items()}
    return {
        "service": "DeepTrust",
        "status": "operational",
        "models": models_status,
    }
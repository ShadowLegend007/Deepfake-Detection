import numpy as np
from sklearn.ensemble import RandomForestClassifier

from app.core.config import get_logger

logger = get_logger("Models")

MODELS: dict[str, RandomForestClassifier | None] = {
    "image": None,
    "audio": None,
    "video": None,
}


def _generate_image_training_data(n_samples: int = 600):
    rng = np.random.default_rng(42)
    X, y = [], []

    for _ in range(n_samples // 2):
        X.append([
            rng.uniform(1.0, 6.0),
            rng.uniform(1.0, 6.0),
            rng.uniform(1.0, 6.0),
            rng.uniform(0.5, 5.0),
            rng.uniform(5.0, 25.0),
        ])
        y.append(0)

    for _ in range(n_samples // 2):
        X.append([
            rng.uniform(10.0, 35.0),
            rng.uniform(10.0, 35.0),
            rng.uniform(10.0, 35.0),
            rng.uniform(12.0, 40.0),
            rng.uniform(60.0, 200.0),
        ])
        y.append(1)

    return np.array(X), np.array(y)


def _generate_audio_training_data(n_samples: int = 600):
    rng = np.random.default_rng(7)
    X, y = [], []

    for _ in range(n_samples // 2):
        mfcc_mean = rng.normal(loc=-5.0, scale=15.0, size=13)
        mfcc_std  = rng.uniform(5.0, 20.0, size=13)
        X.append(np.concatenate([mfcc_mean, mfcc_std]))
        y.append(0)

    for _ in range(n_samples // 2):
        mfcc_mean = rng.normal(loc=-2.0, scale=6.0, size=13)
        mfcc_std  = rng.uniform(1.0, 7.0, size=13)
        X.append(np.concatenate([mfcc_mean, mfcc_std]))
        y.append(1)

    return np.array(X), np.array(y)


def _generate_video_training_data(n_samples: int = 600):
    rng = np.random.default_rng(13)
    X, y = [], []

    for _ in range(n_samples // 2):
        feat = list(rng.uniform(1.0, 7.0, size=5))
        feat.append(rng.uniform(0.1, 2.0))
        X.append(feat)
        y.append(0)

    for _ in range(n_samples // 2):
        feat = list(rng.uniform(12.0, 40.0, size=5))
        feat.append(rng.uniform(10.0, 50.0))
        X.append(feat)
        y.append(1)

    return np.array(X), np.array(y)


def train_all_models() -> None:
    logger.info("🚀 Training models on startup …")

    X_img, y_img = _generate_image_training_data()
    MODELS["image"] = RandomForestClassifier(n_estimators=100, random_state=42)
    MODELS["image"].fit(X_img, y_img)
    logger.info("✅ Image RF model ready  (ELA residuals, 5-dim)")

    X_aud, y_aud = _generate_audio_training_data()
    MODELS["audio"] = RandomForestClassifier(n_estimators=100, random_state=42)
    MODELS["audio"].fit(X_aud, y_aud)
    logger.info("✅ Audio RF model ready  (MFCC stats, 26-dim)")

    X_vid, y_vid = _generate_video_training_data()
    MODELS["video"] = RandomForestClassifier(n_estimators=100, random_state=42)
    MODELS["video"].fit(X_vid, y_vid)
    logger.info("✅ Video RF model ready  (avg ELA + inter-frame variance, 6-dim)")

    logger.info("🎯 All models loaded — DeepTrust is live.")

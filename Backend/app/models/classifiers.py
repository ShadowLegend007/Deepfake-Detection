from typing import Dict, Optional

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.utils import shuffle as sk_shuffle

from app.core.config import get_logger

logger = get_logger("Models")

MODELS: Dict[str, Optional[RandomForestClassifier]] = {
    "image": None,
    "audio": None,
    "video": None,
}



def _generate_image_training_data(n_samples: int = 800):
    rng = np.random.default_rng(42)
    X, y = [], []

    for _ in range(n_samples // 2):
        X.append([
            rng.uniform(1.0, 6.0),    # std_r
            rng.uniform(1.0, 6.0),    # std_g
            rng.uniform(1.0, 6.0),    # std_b
            rng.uniform(0.5, 5.0),    # mean_ela
            rng.uniform(5.0, 30.0),   # max_ela
            rng.uniform(20.0, 65.0),  # gray_std
            rng.uniform(60.0, 180.0), # gray_mean
            rng.uniform(0.0, 0.15),   # freq_score
            rng.uniform(0.0, 0.20),   # noise_score
            rng.uniform(0.0, 0.15),   # colour_score
            rng.uniform(0.0, 0.15),   # blocking_score
        ])
        y.append(0)

    for _ in range(n_samples // 2):
        X.append([
            rng.uniform(10.0, 35.0),  # std_r
            rng.uniform(10.0, 35.0),  # std_g
            rng.uniform(10.0, 35.0),  # std_b
            rng.uniform(12.0, 40.0),  # mean_ela
            rng.uniform(60.0, 200.0), # max_ela
            rng.uniform(10.0, 55.0),  # gray_std
            rng.uniform(40.0, 210.0), # gray_mean
            rng.uniform(0.40, 0.95),  # freq_score
            rng.uniform(0.50, 0.95),  # noise_score
            rng.uniform(0.30, 0.85),  # colour_score
            rng.uniform(0.25, 0.75),  # blocking_score
        ])
        y.append(1)

    X_arr, y_arr = np.array(X, dtype=np.float32), np.array(y)
    return sk_shuffle(X_arr, y_arr, random_state=42)



def _generate_audio_training_data(n_samples: int = 800):
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

    X_arr, y_arr = np.array(X, dtype=np.float32), np.array(y)
    return sk_shuffle(X_arr, y_arr, random_state=7)



def _generate_video_training_data(n_samples: int = 800):
    rng = np.random.default_rng(13)
    X, y = [], []

    for _ in range(n_samples // 2):
        feat = list(rng.uniform(1.0, 7.0, size=5))
        feat.append(rng.uniform(0.1, 2.0))   # inter_frame_variance
        X.append(feat)
        y.append(0)

    for _ in range(n_samples // 2):
        feat = list(rng.uniform(12.0, 40.0, size=5))
        feat.append(rng.uniform(10.0, 50.0))  # inter_frame_variance
        X.append(feat)
        y.append(1)

    X_arr, y_arr = np.array(X, dtype=np.float32), np.array(y)
    return sk_shuffle(X_arr, y_arr, random_state=13)



def train_all_models() -> None:
    logger.info("🚀 Training models on startup …")

    X_img, y_img = _generate_image_training_data()
    MODELS["image"] = RandomForestClassifier(n_estimators=100, random_state=42)
    MODELS["image"].fit(X_img, y_img)
    logger.info("✅ Image  RF model ready  (11-dim: ELA + spectral + noise + colour)")

    X_aud, y_aud = _generate_audio_training_data()
    MODELS["audio"] = RandomForestClassifier(n_estimators=100, random_state=42)
    MODELS["audio"].fit(X_aud, y_aud)
    logger.info("✅ Audio  RF model ready  (26-dim: MFCC mean + std)")

    X_vid, y_vid = _generate_video_training_data()
    MODELS["video"] = RandomForestClassifier(n_estimators=100, random_state=42)
    MODELS["video"].fit(X_vid, y_vid)
    logger.info("✅ Video  RF model ready  (6-dim: avg ELA + inter-frame variance)")

    logger.info("🎯 All models loaded — DeepTrust is live.")
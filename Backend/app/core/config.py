import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)

def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"DeepTrust.{name}")


CORS_CONFIG = {
    "allow_origins": ["*"],
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

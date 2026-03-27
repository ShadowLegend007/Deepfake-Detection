import io, numpy as np, os, sys
from PIL import Image

sys.path.append('d:/Web/pp/Deepfake-Detection/Backend')

from app.processors.image_processor import process_image
from app.models.classifiers import train_all_models

train_all_models()

img_array = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
original = Image.fromarray(img_array).convert('RGB')
buf = io.BytesIO()
original.save(buf, format='JPEG', quality=95)
img_bytes = buf.getvalue()

try:
    process_image(img_bytes)
except Exception:
    import traceback
    traceback.print_exc()

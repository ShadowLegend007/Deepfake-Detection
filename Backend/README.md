# DeepTrust — Backend

A FastAPI backend for detecting deepfakes across **Images**, **Audio**, and **Video** using Machine Learning. Models are trained in-memory on startup using synthetic datasets — no pre-trained weights or external model files required.

---

## Project Structure

```
Backend/
├── main.py                          # Application entry point
├── requirements.txt                 # Pinned dependencies
└── app/
    ├── core/
    │   └── config.py                # Logging factory + CORS configuration
    ├── models/
    │   └── classifiers.py           # Synthetic data generators + RF model store + startup trainer
    ├── processors/
    │   ├── image_processor.py       # ELA feature extraction + image inference
    │   ├── audio_processor.py       # MFCC feature extraction + waveform plot + audio inference
    │   └── video_processor.py       # Frame sampling + per-frame ELA + video inference
    └── routers/
        └── analyze.py               # POST /analyze — master routing endpoint
```

---

## Quick Start

```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8064 --reload
```

Once running:
- **Interactive API docs** → [http://localhost:8064/docs](http://localhost:8064/docs)
- **ReDoc** → [http://localhost:8064/redoc](http://localhost:8064/redoc)
- **Health check** → [http://localhost:8064/](http://localhost:8064/)

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| `fastapi` | 0.111.0 | Web framework |
| `uvicorn[standard]` | 0.29.0 | ASGI server |
| `python-multipart` | 0.0.9 | File upload parsing |
| `Pillow` | 10.3.0 | ELA image processing |
| `numpy` | 1.26.4 | Numerical feature extraction |
| `scikit-learn` | 1.4.2 | RandomForestClassifier |
| `opencv-python` | 4.9.0.80 | Video frame extraction |
| `matplotlib` | 3.9.0 | Audio waveform plot generation |

---

## API Reference

### `GET /`
Health check endpoint. Returns the operational status and load state of all three ML models.

**Response:**
```json
{
  "service": "DeepTrust",
  "status": "operational",
  "models": {
    "image": "ready",
    "audio": "ready",
    "video": "ready"
  }
}
```

---

### `POST /analyze`
The master detection endpoint. Accepts any image, audio, or video file and returns a unified detection result.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field: `file` — the media file to analyze

**Accepted MIME types:**

| Prefix | Example Formats | Routed To |
|---|---|---|
| `image/*` | `.jpg`, `.png`, `.webp` | Image Processor |
| `audio/*` | `.mp3`, `.wav`, `.ogg` | Audio Processor |
| `video/*` | `.mp4`, `.mov`, `.avi` | Video Processor |

**Response:**
```json
{
  "media_type": "image",
  "authenticity_indicator": "Authentic",
  "trust_score": 91.50,
  "visual_evidence_base64": "data:image/jpeg;base64,..."
}
```

| Field | Type | Description |
|---|---|---|
| `media_type` | `string` | `"image"`, `"audio"`, or `"video"` |
| `authenticity_indicator` | `string` | `"Authentic"` (< 35% manipulation probability), `"Suspicious"` (35–65%), or `"Manipulated"` (> 65%) |
| `trust_score` | `float` | Confidence the file is authentic, on a scale of 0–100 |
| `visual_evidence_base64` | `string` | A `data:image/jpeg;base64,...` encoded image — ELA heatmap for images/video, waveform plot for audio |

**Error codes:**

| Code | Meaning |
|---|---|
| `400` | Uploaded file is empty |
| `415` | Unsupported MIME type |
| `422` | File could not be parsed or is too short (video) |
| `503` | A required ML model has not loaded yet |

---

## Module Breakdown

### `main.py`
The application entry point. Responsibilities:
- Creates the `FastAPI` app instance with title, description, and version metadata.
- Registers `CORSMiddleware` using settings from `app.core.config`.
- Mounts the `analyze` router.
- Defines the `@app.on_event("startup")` handler that calls `train_all_models()`.
- Exposes the `GET /` health-check route.

---

### `app/core/config.py`

**`get_logger(name: str) → logging.Logger`**
Returns a `logging.Logger` namespaced under `DeepTrust.<name>`. All modules use this factory so logs are consistently structured and easy to filter.

**`CORS_CONFIG`**
A dict consumed by `CORSMiddleware` that sets `allow_origins=["*"]`, enabling the frontend (React/Next.js) to call the API from any origin without CORS errors.

---

### `app/models/classifiers.py`

**`MODELS`**
A module-level dict holding the three trained `RandomForestClassifier` instances keyed by `"image"`, `"audio"`, and `"video"`. Populated once on startup, then read concurrently by all processor modules without any re-training overhead per request.

**`_generate_image_training_data(n_samples=800)`**
Generates a synthetic **11-dimensional** image forensic dataset.

- **Class 0 (Authentic):** Low ELA residuals (`std_R/G/B ∈ [1, 6]`, `mean ∈ [0.5, 5]`), high-frequency stability, natural noise kurtosis, and presence of JPEG blocking artifacts.
- **Class 1 (Manipulated):** High ELA residuals (`std_R/G/B ∈ [10, 35]`, `mean ∈ [12, 40]`), spectral anomalies (GAN artifacts), and lack of natural camera noise or blocking signatures.

**`_generate_audio_training_data(n_samples=600)`**
Generates a synthetic 26-dimensional MFCC training dataset (13 mean + 13 std values).

- **Class 0 (Authentic):** Higher variance coefficients — natural voice has a rich, broad spectral envelope.
- **Class 1 (Manipulated):** Lower, more uniform coefficients — TTS/voice-cloning systems produce smoother spectral envelopes.

**`_generate_video_training_data(n_samples=600)`**
Generates a synthetic 6-dimensional video training dataset (averaged ELA features across frames + inter-frame variance).

- **Class 0 (Authentic):** Low inter-frame variance — frames are temporally coherent with consistent compression signatures.
- **Class 1 (Manipulated):** High inter-frame variance — each synthetic face frame carries a different compression history, causing ELA spikes across the clip.

**`train_all_models() → None`**
Called once by the FastAPI startup event. Generates all three datasets, fits a `RandomForestClassifier(n_estimators=100, random_state=42)` on each, and stores the fitted models in `MODELS`. After this function returns, all models are ready for zero-latency inference.

---

### `app/processors/image_processor.py`

**`_pil_image_to_base64_jpeg(img, quality=85) → str`**
Encodes a `PIL.Image` object into a `data:image/jpeg;base64,...` data-URI string. Used internally to prepare the ELA heatmap for the JSON response.

**`extract_features(image_bytes) → AnalysisResult`**
The primary image analysis entry point. It runs 6 parallel forensic signals:
1. **ELA**: JPEG recompression residuals.
2. **Frequency**: FFT-based spectral distribution.
3. **Noise**: Laplacian variance and residual statistical analysis.
4. **Metadata**: EXIF and file-format heuristic check.
5. **Colour**: Channel-wise statistic (std, saturation, skew).
6. **Blocking**: 8x8 DCT grid detection.

Returns an `AnalysisResult` containing an 11-dimensional feature vector: `[std_R, std_G, std_B, mean_ela, max_ela, gray_std, gray_mean, freq_score, noise_score, colour_score, blocking_score]`.

> **Why this works:** Authentic JPEG images have already settled at their optimal compression level. Re-compressing them produces very small, uniform residuals (dark in ELA). A pixel that was edited in an uncompressed state and then saved as JPEG has only been through one compression cycle — it shows much larger residuals (bright in ELA) when re-compressed again.

**`process_image(image_bytes) → dict`**
Orchestrates the full image analysis pipeline:
1. Calls `extract_ela_features` to get the feature vector and heatmap.
2. Runs `model.predict_proba` on the feature vector.
3. Maps manipulation probability → `"Authentic"` / `"Suspicious"` / `"Manipulated"` and calculates `trust_score = (1 - manip_prob) × 100`.
4. Returns the unified response dict.

---

### `app/processors/audio_processor.py`

**`_generate_synthetic_mfcc_features(audio_bytes) → np.ndarray`**
Extracts a 26-dimensional MFCC-like feature vector from raw audio bytes without requiring a DSP library like `librosa`. The pipeline:

1. Treat each byte as a signed 8-bit PCM sample by shifting `[0, 255]` to `[-128, 127]`.
2. Split the entire byte stream into **13 equal segments** — one per MFCC coefficient band.
3. Compute the `mean` and `std` of each segment as proxies for spectral energy and bandwidth in that frequency band.
4. Concatenate to form `[mean×13 || std×13]` — a 26-dimensional vector matching the training feature space.

**`_generate_waveform_plot(audio_bytes) → str`**
Renders a dark-themed waveform visualisation suitable for display as forensic evidence:

1. Converts raw bytes to float samples (same PCM treatment as above).
2. Downsamples to ≤ 4,000 points for rendering performance.
3. Plots using `matplotlib` on a dark `#0f0f1a` background with a purple (`#7c3aed`) trace — styled to match a modern dark UI.
4. Saves the figure to a `BytesIO` buffer at 110 DPI and encodes it as a base64 JPEG data-URI.

**`process_audio(audio_bytes) → dict`**
Orchestrates the full audio analysis pipeline:
1. Extracts the 26-dim MFCC feature vector.
2. Generates the waveform plot for visual evidence.
3. Runs `model.predict_proba` and maps probability → label + trust score.
4. Returns the unified response dict.

---

### `app/processors/video_processor.py`

**`process_video(video_bytes) → dict`**
Orchestrates the complete video analysis pipeline. This is the most complex processor due to the need to extract and analyse individual frames:

| Step | What Happens |
|---|---|
| 1 | Writes the uploaded bytes to a **named temporary `.mp4` file** — required because `cv2.VideoCapture` needs a filesystem path, not a byte buffer. |
| 2 | Reads the total frame count and selects **3 evenly-spaced indices** at 25%, 50%, and 75% of the clip's duration. |
| 3 | For each frame: converts BGR (OpenCV) → RGB → JPEG bytes, then calls `extract_ela_features` from the image processor. |
| 4 | **Averages** the three 5-dim ELA feature vectors into a single representative feature set. |
| 5 | Computes the **variance of per-frame ELA standard deviations** as a 6th feature — the temporal inconsistency signal. High value = likely deepfake. |
| 6 | Passes the final 6-dim vector to the Video RF classifier and maps probability → label. |
| 7 | Returns the ELA heatmap of the **highest-variance frame** as visual evidence. |
| Cleanup | The temporary file is unconditionally deleted in a `finally` block, even if an exception is raised. |

---

### `app/routers/analyze.py`

**`analyze(file: UploadFile) → dict`**

The single `POST /analyze` route handler. Contains zero business logic — its only responsibility is:

1. Read the file bytes.
2. Inspect `content_type` and delegate to the appropriate processor (`process_image`, `process_audio`, or `process_video`).
3. Return the processor's response dict directly.
4. Raise `HTTP 415` for unrecognised MIME types and `HTTP 400` for empty files.

---

## End-to-End Workflow

```
Client uploads file
        │
        ▼
POST /analyze (analyze.py)
        │
        ├── image/* ──► extract_features()
        │                    └── 11-Signal Pipeline → features [std_R, ..., blocking_score]
        │                         └── MODELS["image"].predict_proba()
        │
        ├── audio/* ──► _generate_synthetic_mfcc_features()
        │                    └── 13-band PCM segmentation → 26-dim feature vector
        │               _generate_waveform_plot()
        │                    └── matplotlib dark-theme plot → base64 JPEG
        │                         └── MODELS["audio"].predict_proba()
        │
        └── video/* ──► NamedTemporaryFile → cv2.VideoCapture
                             └── 3 frames at 25%, 50%, 75%
                                  └── extract_ela_features() per frame
                                       └── avg ELA features + inter-frame variance
                                            └── MODELS["video"].predict_proba()
        │
        ▼
{
  "media_type": "...",
  "authenticity_indicator": "Authentic | Suspicious | Manipulated",
  "trust_score": 0.0–100.0,
  "visual_evidence_base64": "data:image/jpeg;base64,..."
}
```

---

## Authenticity Scoring

| Manipulation Probability | `authenticity_indicator` | Typical `trust_score` |
|---|---|---|
| < 35% | `Authentic` | > 65 |
| 35% – 65% | `Suspicious` | 35 – 65 |
| > 65% | `Manipulated` | < 35 |

`trust_score = (1 − manipulation_probability) × 100`

---

## CORS Policy

All origins are permitted (`allow_origins=["*"]`) to allow the frontend to communicate with this backend without CORS restrictions during development and deployment. Restrict this to specific origins in a production environment if needed.

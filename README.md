# DeepTrust — Advanced Deepfake & Media Manipulation Detection

![DeepTrust Banner](https://img.shields.io/badge/Status-Operational-success?style=for-the-badge) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Licence-MIT](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)

**DeepTrust** is a state-of-the-art forensic analysis suite designed to identify AI-generated media, face-swaps, and manual edits in images, audio, and video. By combining traditional digital forensics (like ELA) with modern machine learning (RandomForest ensembles), DeepTrust provides high-confidence authenticity assessments and visual evidence for digital investigators and curious users alike.

---

## 🚀 Key Features

### 🖼️ Image Forensics (11-Signal Pipeline)
DeepTrust doesn't just look at pixels; it analyzes the digital "DNA" of an image:
- **Error Level Analysis (ELA)**: Detects inconsistent JPEG compression levels across an image.
- **Frequency Domain Mapping**: Uses FFT to identify unnatural high-frequency patterns typical of GAN/Diffusion models.
- **Noise Analysis**: Measures sensor noise variance and kurtosis to find region-level splicing.
- **Metadata Scrubbing**: Inspects EXIF fields for AI software signatures and suspicious power-of-two dimensions.
- **Block Artifact Grid (BAG)**: Detects the 8×8 DCT grid boundaries naturally present in real camera photos.

### 🎙️ Audio Forensics
Detects voice clones and synthetic speech using spectral analysis:
- **MFCC Feature Extraction**: Analyzes the spectral envelope of audio tracks.
- **Spectral Flatness**: Identifies the unnaturally smooth frequencies found in TTS systems.
- **Waveform Visualization**: Renders high-fidelity PCM waveform plots as forensic evidence.

### 🎥 Video Forensics
Analyzes temporal consistency to unmask deepfakes:
- **Temporal Sampled ELA**: Analyzes key frames across the video for compression inconsistencies.
- **Inter-Frame Variance**: Measures temporal "jitter" — a primary indicator of face-swapping and frame-level manipulation.

---

## 🏗️ Architecture

DeepTrust is built on a high-performance **FastAPI** backend and a reactive **React** frontend.

### [Backend](./Backend/) (Python 3.12+)
- **FastAPI**: Asynchronous API layer for high-concurrency file processing.
- **Scikit-Learn**: In-memory `RandomForestClassifier` trained on startup for zero-latency inference.
- **Pillow / OpenCV**: Core image and video manipulation libraries.
- **Weighted Ensemble Scoring**: Combines multiple signals into a single "Authenticity Indicator."

### [Frontend](./Frontend/) (React / Vite)
- **Modern UI**: A premium, dark-themed dashboard built with Tailwind CSS and Radix UI.
- **Live Monitoring**: Real-time backend status tracking via a persistent health-check pill.
- **Evidence Canvas**: Interactive rendering of ELA heatmaps and audio waveforms.

---

## ⚡ Quick Start

### 1. Requirements
Ensure you have **Python 3.9+** and **Node.js 18+** installed.

### 2. Setup Backend
```bash
cd Backend
pip install -r requirements.txt
python -m uvicorn main:app --port 8064 --host 127.0.0.1
```
*Backend runs at `http://localhost:8064`. API docs available at `/docs`.*

### 3. Setup Frontend
```bash
cd Frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`. Ensure `.env` is set to `VITE_API_URL=http://localhost:8064`.*

---

## 🧠 Forensic Workflow
1. **Pinging**: The frontend checks the backend health and model training status.
2. **Analysis**: Upon upload, the backend routes the file to the appropriate forensic processor.
3. **Evidence**: Statistical features are extracted and piped into the ML model while a visual heatmap/waveform is generated.
4. **Verdict**: The system returns a **Trust Score (0-100)** and a verdict: `Authentic`, `Suspicious`, or `Manipulated`.

---

## 👥 The Team
- **Rajdeep Pal** - Team Lead & Backend Architect
- **Ritabhas Barick** - ML Engineer
- **Subhodeep Mondal** - Frontend Developer

---

**DeepTrust** — Restoring digital truth in the age of AI.


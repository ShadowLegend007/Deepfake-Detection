# DeepTrust — Comprehensive Deepfake Detection System

![DeepTrust Verification Banner](https://img.shields.io/badge/Verification-DeepTrust-7c3aed?style=for-the-badge) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Machine Learning](https://img.shields.io/badge/Machine%20Learning-RandomForest-ff69b4?style=for-the-badge)

**DeepTrust** is an AI-powered forensic tool designed to detect manipulated media in an era where generative AI and deepfakes are increasingly sophisticated. By analyzing imperceptible artifacts in Images, Audio, and Video files, DeepTrust provides an instant **Trust Score** and clear visual evidence to determine authenticity.

## 🚀 Features

- **Multi-Modal Analysis**: Supports three types of media testing:
  - 🖼️ **Images** (`.jpg`, `.png`): Uses Error Level Analysis (ELA) to find spliced, manipulated, or GAN-generated regions.
  - 🎙️ **Audio** (`.mp3`, `.wav`): Uses MFCC feature extraction to detect unnatural spectral variance and voice clones.
  - 🎥 **Video** (`.mp4`): Extracts frames to perform per-frame ELA and measures temporal inter-frame variance to flag face-swapping or deepfake artifacts.
- **Zero-Latency Inference**: 3 custom RandomForest models are trained in-memory on application startup, resulting in instant predictions (milliseconds).
- **Visual Evidence**: Returns an actionable ELA Heatmap (for visuals) or a PCM Waveform Plot (for audio), allowing users to see exactly *why* media was flagged.
- **Interactive UI**: A beautiful, responsive React frontend featuring Dark Mode, glassmorphic UI elements, and real-time backend health monitoring.

---

## 🏗️ Project Structure

The repository is divided into two fully modularized directories:

### 1. [`/Backend`](./Backend/)
A robust, high-performance Python backend built with **FastAPI**.
- **Stack**: FastAPI, Scikit-learn, OpenCV (`cv2`), Pillow (PIL), NumPy, Matplotlib.
- **Key Flow**: Routes file uploads (`POST /analyze`) -> MIME type detection -> Dedicated Processor (`image_processor.py`, `audio_processor.py`, `video_processor.py`) -> ML Inference -> JSON response with Base64 visual evidence.
- *See the detailed [Backend README](./Backend/README.md) for full API documentation and endpoint details.*

### 2. [`/Frontend`](./Frontend/)
A sleek, user-centric web interface built with **React** and **Vite**.
- **Stack**: React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Key Flow**: Drag-and-drop upload -> Fetch API call -> Forensic Dashboard (Gauge UI, Authenticity Badges, Evidence Canvas).
- *See the detailed [Frontend README](./Frontend/README.md) for setup instructions and UI component structure.*

---

## ⚡ Getting Started (Local Development)

To run the full DeepTrust system locally, you need to spin up both the Front-end and Back-end servers.

### Prerequisites
- **Python 3.9+**
- **Node.js 18+** & npm (or yarn)

### Step 1: Start the Backend (FastAPI)
```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload
```
*The backend will be live at `http://localhost:8064`.*

### Step 2: Start the Frontend (Vite/React)
Open a new terminal window:
```bash
cd Frontend
npm install
npm run dev
```
*The frontend will be live at `http://localhost:5173`.*

---

## 🧠 How it Works

1. **Upload**: User drags a suspicious `.mp4` video into the DeepTrust web UI.
2. **Transfer**: The frontend posts the file via `FormData` to the `POST /analyze` endpoint on the FastAPI server.
3. **Extraction**: The backend `video_processor` uses OpenCV to slice the video into frames.
4. **Analysis**: It applies Error Level Analysis to detect differing compression levels (indicating manipulation) and calculates the temporal variance between frames.
5. **Prediction**: The data is piped into the in-memory `RandomForestClassifier` trained specifically for Video forensics.
6. **Result**: The API returns a `trust_score` (e.g., 23% - Manipulated), along with an ELA heatmap of the analyzed frames.
7. **Display**: The React app renders the trust score in a visual gauge and displays the heatmap so the user can see the tampered region.

---

## 👥 The Team
Built by the Hackathon team dedicated to fighting digital misinformation:
- **Rajdeep Pal** - Team Lead
- **Ritabhas Barick** - ML Expert
- **Subhodeep Mondal** - Frontend Developer

---

**DeepTrust** — Bringing forensic truth to the masses.

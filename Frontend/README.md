# DeepTrust — Frontend

A responsive, highly interactive React frontend for the DeepTrust Deepfake Detection system. Built with Vite, React, TypeScript, and Tailwind CSS.

## Features

- **Drag & Drop Upload**: Seamlessly upload Images (`.jpg`, `.png`), Audio (`.mp3`, `.wav`), or Video (`.mp4`) files.
- **Forensic Results Dashboard**: Real-time display of the trust score and model verdict.
- **Visual Evidence Rendering**: Directly renders the Error Level Analysis (ELA) heatmap for visual media, or the PCM waveform plot for audio, making the AI's decision transparent.
- **Backend Status Indicator**: A live-pulsing indicator in the navigation bar checking the FastAPI backend health every 10 seconds.
- **Dark/Light Theme**: Fully styled with Tailwind's dark mode, adapting to system preferences or user toggle.

## Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) + Custom GSAP elements
- **Icons**: [Lucide React](https://lucide.dev/)

## Quick Start

### 1. Requirements
Ensure you are running Node.js 18 or higher.

### 2. Environment Setup
Create a `.env` file in the `Frontend/` directory to point to your FastAPI backend:
```env
VITE_API_URL=http://127.0.0.1:8064
```

### 3. Install Dependencies
```bash
cd Frontend
npm install
```

### 4. Run the Dev Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## Application Structure

- `src/app/App.tsx`: Main routing and theme orchestration.
- `src/app/pages/`:
  - `Home.tsx`: Landing page highlighting features.
  - `Analysis.tsx`: The core forensic tool — handles file drops, API calls, and rendering evidence.
  - `About.tsx`: Team and mission statement.
  - `Help.tsx`: User guide explaining Trust Scores and Heatmaps.
- `src/app/components/`: Reusable UI elements (Navbar, ThemeToggle, animated text effects).
- `src/hooks/useBackendStatus.ts`: Polling hook to drive the live backend health pill.
- `src/api.ts`: Typed fetch wrapper communicating with `POST /analyze`.
- `src/types.ts`: TypeScript contracts matching the FastAPI response models.

## Building for Production

```bash
npm run build
```
The compiled static files will be placed in the `dist/` directory, ready to be served by Nginx, Vercel, or any static host.

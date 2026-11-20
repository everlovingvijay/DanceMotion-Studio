# DanceMotion Studio

Offline-first browser studio for converting dance videos into grey silhouette motion references for Gemini.

- **Deployment**: GitHub Pages (Static hosting via GitHub Actions)
- **Development**: Google Antigravity
- **Processing**: 100% Local browser (MediaPipe Tasks Vision, WebCodecs, Web Workers, Canvas)

---

## Overview

DanceMotion Studio converts raw dance video files into full-body grey human silhouettes (`#888888`) on pure black backgrounds (`#000000`). The result is intended as an identity-neutral visual motion reference for Gemini models without needing token-based video models or cloud uploads.

## Key Features

- **Local & Private**: All video decoding, tracking, and rendering happen inside your browser. No footage or frames are uploaded to any server.
- **Sprint 1 Foundation**:
  - Dark professional UI shell with Studio, Motion, Render, Export, Projects, and Settings navigation.
  - Video import with drag-and-drop, metadata extraction (resolution, duration, FPS estimation, aspect ratio).
  - Side-by-side split view with source video playback, timeline scrubber, frame stepping, and speed controls.
  - Browser capability detection for WebCodecs, Web Workers, OffscreenCanvas, WebGL2, and WebGPU.
  - PWA service worker foundation with offline asset caching and cache purge controls.
  - GitHub Actions deployment workflow for automated static publishing to GitHub Pages.

## Project Structure

```
DanceMotion-Studio/
├── public/
│   ├── models/
│   ├── wasm/
│   ├── icons/
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── AppShell.tsx
│   ├── components/
│   │   ├── navigation/
│   │   ├── studio/
│   │   ├── motion/
│   │   ├── render/
│   │   ├── export/
│   │   ├── projects/
│   │   └── settings/
│   ├── engine/
│   │   ├── VideoDecoder.ts
│   │   ├── PoseEngine.ts
│   │   ├── HandEngine.ts
│   │   ├── FootTracker.ts
│   │   ├── MotionSmoother.ts
│   │   ├── SilhouetteRenderer.ts
│   │   └── VideoEncoder.ts
│   ├── services/
│   ├── hooks/
│   ├── types/
│   └── utils/
├── tests/
├── .github/workflows/deploy.yml
├── index.html
├── package.json
└── vite.config.ts
```

## Getting Started

```bash
# Install dependencies
npm ci

# Run type checks
npm run typecheck

# Run unit tests
npm test

# Build production bundle
npm run build

# Start local development server
npm run dev
```

## GitHub Pages Deployment

The project is preconfigured to deploy automatically to GitHub Pages using GitHub Actions from the `main` branch. The base path is configured in `vite.config.ts` as `/DanceMotion-Studio/`.

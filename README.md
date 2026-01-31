# MUSE - Multi-sensory Emotional Regulation System

<p align="center">
  <strong>Intelligent Music Recommendation & Stress Management Platform</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#core-algorithms">Core Algorithms</a>
</p>

---

## Introduction

MUSE is an intelligent emotional regulation system prototype based on physiological signals. By real-time monitoring of user's heart rate and Mental Workload (MWL), the system automatically identifies user's work state and recommends matching music for intervention, helping users perceive, regulate, and recover from stress in a non-intrusive manner.

### Product Scope

- ✅ Complete Web frontend application (React + TypeScript)
- ✅ Local data storage (IndexedDB)
- ✅ Offline-first architecture
- ✅ 5 core features fully implemented
- ✅ Backend-Ready architecture design

## Features

### 🎵 Local Music Upload & BPM Analysis
- Supports MP3, WAV, OGG formats
- Automatic BPM detection (60-180 range)
- Drag-and-drop upload with Web Worker background processing

### Real-time Heart Rate Signal Reception
- Connect Arduino pulse sensor via Web Serial API
- Real-time data parsing and visualization
- Automatic outlier filtering (heart rate range: 40-200 bpm)

### MWL Data Simulation
- Simulated data generation based on fNIRS theoretical model
- Supports 4 state pattern simulations
- 1Hz data generation frequency

### Intelligent State Classification
Multimodal fusion algorithm based on academic research, identifying 4 work states:

| State | Description | Color |
|:------|:------------|:------|
| **Stressed** | Overloaded, needs relaxation | 🔴 Red |
| **Calm** | Calm state, maintain stability | 🟢 Green |
| **Productive** | Working efficiently | 🔵 Blue |
| **Distracted** | Attention scattered, needs focus | 🟡 Yellow |

### 🎧 State-Driven Music Recommendation
Intelligent music recommendation based on user's current state:

| State | Goal | BPM Strategy |
|:------|:-----|:-------------|
| Stressed | Lower physiological arousal | Current HR × 0.7-0.8 |
| Distracted | Increase alertness | Current HR × 1.1-1.3 |
| Calm | Maintain state | Current HR ± 5 |
| Productive | Low-disturbance maintenance | Current HR ± 3 |

## Tech Stack

### Core Framework
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool

### State Management & Data
- **Zustand** - Global state management
- **Dexie.js** - IndexedDB wrapper
- **Recharts** - Data visualization

### UI Components
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - Component library
- **Lucide React** - Icon library

### Audio Processing
- **Tone.js** - BPM detection and audio processing
- **Web Audio API** - Audio playback control

### Hardware Interface
- **Web Serial API** - Arduino serial communication
- **Web Workers** - Background audio analysis

## Getting Started

### Requirements
- Node.js 18+
- Modern browser (Chrome/Edge 89+ recommended for Web Serial API support)

### Installation

```bash
# Clone the repository
git clone https://github.com/alexchen57/muse-app-frontend.git
cd muse-app-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/           # UI Components
│   ├── ui/              # Base UI components (shadcn/ui)
│   └── figma/           # Figma exported components
├── src/
│   ├── components/      # Business components
│   │   ├── HomeView.tsx        # Home / Real-time monitoring
│   │   ├── HistoryView.tsx     # History records
│   │   ├── MusicLibraryView.tsx # Music library
│   │   ├── MusicPlayer.tsx     # Music player
│   │   ├── RealtimeChart.tsx   # Real-time charts
│   │   └── StateIndicator.tsx  # State indicator
│   ├── services/        # Business logic layer
│   │   ├── StateClassificationService.ts  # State classification
│   │   ├── MusicRecommendationService.ts  # Music recommendation
│   │   ├── HeartRateSimulator.ts          # Heart rate simulation
│   │   └── MWLSimulator.ts                # MWL simulation
│   ├── stores/          # State management
│   │   └── useAppStore.ts
│   ├── hooks/           # Custom Hooks
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
└── styles/              # Global styles
```

## Core Algorithms

### State Classification Algorithm

Multimodal fusion based on heart rate and mental workload:

```typescript
interface StateClassificationInput {
  heartRate: number;
  heartRateBaseline: number;
  mwlIndex: number;
  mwlBaseline: number;
  hrVariability?: number;
}

// Classification Logic:
// 1. Data preprocessing: Calculate HR/MWL deviation from baseline
// 2. Feature extraction: Normalize deviation values
// 3. State determination: Threshold-based rule classification
// 4. State persistence confirmation (>30 seconds)
```

### Music Recommendation Algorithm

Content-based recommendation system:

```typescript
function recommendMusic(
  currentState: State,
  currentHeartRate: number,
  musicLibrary: MusicMetadata[],
  userPreferences: UserPreferences
): MusicMetadata | null {
  // 1. Calculate target BPM based on state
  // 2. Filter candidate music (BPM error ≤ 10)
  // 3. Score and sort comprehensively
  // 4. Return optimal recommendation
}
```

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|:--------|:------:|:----:|:-------:|:------:|
| Core Features | ✅ | ✅ | ✅ | ✅ |
| Web Serial API | ✅ 89+ | ✅ 89+ | ❌ | ❌ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |

> ⚠️ To use Arduino heart rate sensor connection, please use Chrome or Edge browser.

## Design Resources

Original Figma design file: [Frontend Design for MUSE App](https://www.figma.com/design/FZDsfocQ49v6p04DNuhin4/Frontend-Design-for-MUSE-App)

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [Product Requirements Document](./PRD_Multi-sensory_Emotional_Regulation_System.md)
- [Type Definitions](./TYPES_SUMMARY.md)
- [History View Implementation](./HISTORY_VIEW_README.md)

## License

MIT License

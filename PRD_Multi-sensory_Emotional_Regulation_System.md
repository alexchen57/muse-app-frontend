# Multi-sensory Emotional Regulation System - Web APP Prototype
## Intelligent Music Recommendation & Stress Management Platform [MUSE]

**Version**: v1.0 (Prototype)  
**Date**: January 11, 2025  
**Status**: Prototype Development Phase  
**Project Type**: Portfolio Showcase Project

---

## 1. Product Overview

### 1.1 Product Positioning
This project is a **frontend-first Web APP prototype** designed to demonstrate the core concepts of a multi-sensory emotional regulation system. The system provides personalized music intervention by real-time monitoring of heart rate and mental workload (MWL), helping users regulate work stress in a non-intrusive, low-disturbance manner.

**Prototype Scope**:
- ✅ Complete Web frontend application (React + TypeScript)
- ✅ Local data storage (localStorage / IndexedDB)
- ✅ Offline-first architecture
- ✅ 5 core features fully implemented
- ⚠️ MWL data uses simulated data (fNIRS device for proof of concept)
- ⚠️ Architecture designed as "Backend-ready" for future expansion

### 1.2 Product Goals
- **Core Goal**: Help knowledge workers perceive, regulate, and recover from stress during work in a non-intrusive, personalized manner
- **Prototype Goals**: 
  - Demonstrate core system features and workflow
  - Validate feasibility of state classification algorithm
  - Showcase engineering architecture design capabilities (Backend-ready frontend)
  - Provide technical foundation for future complete product development

### 1.3 Target Users
1. **High Cognitive Load Workers** (Programmers, Researchers)
   - Characteristics: Tend to ignore physical sensations, stress accumulates and erupts
   - Needs: Passive monitoring, automatic intervention

2. **Creative Workers** (Designers, Content Creators)
   - Characteristics: Emotions significantly impact content output
   - Needs: Emotional state visualization, personalized music recommendations

3. **High-Pressure Workplace Workers** (Product Managers, Consultants)
   - Characteristics: Many interpersonal interactions, high psychological pressure, lack of outlets
   - Needs: Work state tracking, stress alerts

---

## 2. System Architecture

### 2.1 Prototype Hardware Interface

#### 2.1.1 Heart Rate Sensor (Real Hardware)
- **Arduino Pulse Sensor Module**
  - Connected via serial communication (Web Serial API)
  - Real-time heart rate data collection (sampling frequency ≥ 1Hz)
  - Data format: JSON `{timestamp, heartRate, signalQuality}`
  - Connection method: USB serial or Bluetooth serial (HC-05/HC-06)

#### 2.1.2 MWL Data (Simulated Data - Proof of Concept)
- **Simulated MWL Data Generator**
  - Generates simulated data based on fNIRS theoretical model
  - Simulates prefrontal cortex blood oxygen changes (HbO₂ concentration)
  - Data format: JSON `{timestamp, mwlIndex, hbO2Level, region}`
  - **Note**: Since fNIRS equipment requires advanced hardware, prototype phase uses simulated data to demonstrate system concept

### 2.2 Software Architecture (Backend-Ready Frontend)

```
┌─────────────────────────────────────────────────────────┐
│                    Web APP (Frontend)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │         React + TypeScript Application           │  │
│  │                                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │  UI Layer    │  │  State Mgmt │             │  │
│  │  │  (Components)│  │  (Zustand/  │             │  │
│  │  │              │  │   Redux)    │             │  │
│  │  └──────┬───────┘  └──────┬───────┘             │  │
│  │         │                 │                      │  │
│  │  ┌──────┴─────────────────┴───────┐            │  │
│  │  │      Service Layer              │            │  │
│  │  │  - DataService (API abstraction)│            │  │
│  │  │  - MusicService                 │            │  │
│  │  │  - StateClassificationService   │            │  │
│  │  │  - BPMAnalysisService           │            │  │
│  │  └──────┬─────────────────┬───────┘            │  │
│  │         │                 │                      │  │
│  │  ┌──────┴──────┐  ┌───────┴───────┐            │  │
│  │  │ Local Store │  │  Web Workers  │            │  │
│  │  │ (IndexedDB) │  │  (BPM Analysis)│            │  │
│  │  └─────────────┘  └───────────────┘            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Hardware Interface Layer                   │  │
│  │  - Web Serial API (Arduino HR Sensor)            │  │
│  │  - MWL Simulator (Simulated Data Generation)     │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                              │ Future: Backend API
                              ▼
                    ┌─────────────────┐
                    │  Backend API    │
                    │  (Reserved)     │
                    └─────────────────┘
```

**Architecture Design Principles**:
- **Frontend-first**: All features implemented in browser
- **Backend-ready**: Service layer abstraction for future migration to backend API
- **Offline-first**: Uses IndexedDB storage, supports offline use
- **Modular**: Clear hierarchical structure for testing and maintenance

---

## 3. Core Feature Requirements (Prototype Scope)

This Prototype focuses on implementing 5 core features to demonstrate the system's core value and technical capabilities.

### 3.1 Feature 1: Local Music Upload & BPM Analysis

**Feature Description**: Users can upload local music files, system automatically detects BPM using open-source audio processing library

**User Stories**:
- As a user, I want to upload my favorite music files
- As a user, I want the system to automatically identify music BPM

**Technical Implementation**:
- **Frontend Library**: `librosa.js` or `tone.js` + `web-audio-api`
- **File Format Support**: MP3, WAV, OGG
- **BPM Detection Algorithm**: 
  - Uses librosa beat detection algorithm
  - Based on audio spectrum analysis and autocorrelation function
  - Supports 60-180 BPM range

**Features**:
- [x] File upload interface (drag-and-drop upload)
- [x] Audio file parsing and validation
- [x] BPM automatic detection (Web Worker background processing)
- [x] Music metadata storage (IndexedDB)
- [x] Upload progress display
- [x] Error handling (unsupported formats, corrupted files)

**Data Storage**:
```typescript
interface MusicMetadata {
  id: string;
  fileName: string;
  title: string;
  bpm: number | null; // null indicates detection failure
  duration: number;
  fileSize: number;
  uploadDate: Date;
  audioBlob: Blob; // Stored in IndexedDB
}
```

**Acceptance Criteria**:
- BPM detection accuracy > 85% (based on standard test audio)
- Support file size < 50MB
- Processing time < 10 seconds (3-minute audio)

---

### 3.2 Feature 2: Simulated MWL Data Reception

**Feature Description**: Receive and process simulated MWL (Mental Workload) data for proof of concept

**User Stories**:
- As a developer, I need simulated MWL data to test state classification algorithm
- As a user, I want to see how the system makes state judgments based on MWL data

**Technical Implementation**:
- **Data Generator**: JavaScript simulator based on fNIRS theoretical model
- **Data Format**: 
```typescript
interface MWLData {
  timestamp: number;
  mwlIndex: number; // 0-1, represents MWL intensity
  hbO2Level: number; // Simulated HbO₂ concentration change
  region: 'leftPFC' | 'rightPFC' | 'mPFC' | 'vlPFC'; // Simulated brain region
  signalQuality: number; // 0-1
}
```

**Features**:
- [x] MWL data simulator (configurable parameters)
- [x] Real-time data stream reception (WebSocket simulation or timer)
- [x] Data visualization (real-time MWL index display)
- [x] Data caching (last 1 hour of data)
- [x] Simulate different state data patterns (Stressed/Calm/Productive/Distracted)

**Simulation Algorithm**:
- Generate corresponding MWL patterns based on state labels
- Add random noise to simulate real signals
- Support smooth transitions to simulate state switching

**Acceptance Criteria**:
- Data generation frequency: 1Hz
- Data latency < 100ms
- Support 4 state simulation switching

---

### 3.3 Feature 3: Real HR Signal Reception

**Feature Description**: Receive real heart rate data from Arduino pulse sensor via Web Serial API

**User Stories**:
- As a user, I want to connect my Arduino heart rate sensor
- As a user, I want the system to display my heart rate data in real-time

**Technical Implementation**:
- **Hardware Interface**: Web Serial API (Chrome/Edge support)
- **Arduino Communication Protocol**: 
  - Baud rate: 9600
  - Data format: JSON string `{"hr": 75, "quality": 0.95, "timestamp": 1234567890}`

**Features**:
- [x] Web Serial API connection interface
- [x] Serial device selection and connection
- [x] Real-time data parsing and validation
- [x] Data quality detection (signal quality threshold)
- [x] Outlier filtering (heart rate range: 40-200 bpm)
- [x] Connection status display
- [x] Disconnect reconnection mechanism
- [x] Data caching (IndexedDB)

**Data Format**:
```typescript
interface HeartRateData {
  timestamp: number;
  heartRate: number; // bpm
  signalQuality: number; // 0-1
  rrInterval?: number; // RR interval (if Arduino provides)
}
```

**Acceptance Criteria**:
- Connection success rate > 95%
- Data reception latency < 200ms
- Support heart rate range: 40-200 bpm
- Automatic outlier filtering

---

### 3.4 Feature 4: State Classification Algorithm

**Feature Description**: Identify user's current state based on HR and MWL data using multimodal fusion algorithm

**User Stories**:
- As a user, I want the system to accurately identify my work state
- As a user, I want to see real-time feedback on state changes

**State Classification Rules** (Based on Academic Research):

| State Label | MWL Intensity (fNIRS HbO₂) | Dominant Brain Region | HRV (RMSSD/HF) | Heart Rate (BPM) | Label |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Stressed** | Excessive / High | Left PFC / VLPFC | Low | High | Stressed |
| **Calm** | Low / Baseline | mPFC (Static) | High | Low / Stable | Calm |
| **Productive** | High / Optimal | Right PFC Dominant | Moderate | Moderate | Productive |
| **Distracted** | Fluctuating / Low | mPFC (Transient) | Moderate-High | Fluctuating | Distracted |

**Algorithm Implementation**:
```typescript
interface StateClassificationInput {
  heartRate: number;
  heartRateBaseline: number; // User baseline
  mwlIndex: number;
  mwlBaseline: number;
  hrVariability?: number; // HRV metric (if available)
}

interface StateClassificationOutput {
  state: 'stressed' | 'calm' | 'productive' | 'distracted';
  confidence: number; // 0-1
  reasoning: string; // Classification reasoning
}
```

**Classification Logic**:
1. **Data Preprocessing**:
   - Heart rate deviation from baseline calculation
   - MWL deviation from baseline calculation
   - Sliding window smoothing (30-second window)

2. **Feature Extraction**:
   - Heart rate deviation normalization
   - MWL deviation normalization
   - HRV calculation (if RR interval available)

3. **State Determination**:
   - Threshold-based rule classification
   - Consider multimodal fusion
   - State persistence confirmation (>30 seconds)

**Features**:
- [x] Real-time state classification (1Hz update)
- [x] State confidence calculation
- [x] State change detection and notification
- [x] State history recording
- [x] Baseline adaptation (based on historical data)

**Acceptance Criteria**:
- State classification accuracy > 75% (based on simulated data testing)
- State switching response time < 3 seconds
- Support accurate distinction of 4 states

---

### 3.5 Feature 5: State-Based Music Recommendation & Playback

**Feature Description**: Select appropriate music from music library based on current state label and auto-play

**User Stories**:
- As a user, when I'm stressed, I want the system to automatically play soothing music
- As a user, when I'm distracted, I want the system to play slightly stimulating music to help me focus

**Recommendation Strategy**:

| State | Goal | BPM Strategy | Music Type Preference | Volume Range |
| :---- | :---- | :---- | :---- | :---- |
| **Stressed** | Lower physiological arousal | Current HR × 0.7-0.8 | Soothing types (Classical, White Noise) | 40-50 dB |
| **Distracted** | Increase alertness | Current HR × 1.1-1.3 | Focus types (Pop, Electronic) | 50-60 dB |
| **Calm** | Maintain state | Current HR ± 5 bpm | User preference types | 45-55 dB |
| **Productive** | Low-disturbance maintenance | Current HR ± 3 bpm | Low-disturbance types (Instrumental, White Noise) | 40-50 dB |

**Features**:
- [x] Music library query (based on BPM and type)
- [x] Recommendation algorithm implementation
- [x] Auto-play control
- [x] Smooth transition (fade in/out)
- [x] Playback control UI (Play/Pause/Skip)
- [x] Volume control
- [x] User feedback collection (Like/Dislike)

**Recommendation Algorithm**:
```typescript
function recommendMusic(
  currentState: State,
  currentHeartRate: number,
  musicLibrary: MusicMetadata[],
  userPreferences: UserPreferences
): MusicMetadata | null {
  // 1. Calculate target BPM range
  const targetBPM = calculateTargetBPM(currentState, currentHeartRate);
  
  // 2. Filter candidate music
  const candidates = musicLibrary.filter(music => {
    if (!music.bpm) return false; // Skip music without BPM
    return Math.abs(music.bpm - targetBPM) <= 10;
  });
  
  // 3. Score and sort
  const scored = candidates.map(music => ({
    music,
    score: calculateScore(music, targetBPM, userPreferences)
  }));
  
  // 4. Return highest scored music
  return scored.sort((a, b) => b.score - a.score)[0]?.music || null;
}
```

**Acceptance Criteria**:
- Recommended music BPM match: error < 10 bpm
- Music transition smooth (2-second fade in/out)
- Playback latency < 1 second

### 3.6 Auxiliary Features (Optional, for demonstration)

#### 3.6.1 Real-time Data Visualization
- [x] Real-time heart rate curve chart
- [x] Real-time MWL index display
- [x] State label visualization (with color coding)
- [x] Current playing music info display

#### 3.6.2 Data History
- [x] State history recording (IndexedDB storage)
- [x] Simple timeline view
- [x] Data export (JSON format)

---

## 4. Technical Specifications (Prototype)

### 4.1 Frontend Tech Stack

#### 4.1.1 Core Framework
- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (fast development)

#### 4.1.2 State Management
- **Zustand** or **Redux Toolkit** - Global state management
- **React Query** (optional) - Data fetching and caching (Backend-ready)

#### 4.1.3 UI Component Library
- **Tailwind CSS** - Styling framework
- **shadcn/ui** or **Material-UI** - Component library
- **Recharts** or **Chart.js** - Data visualization

#### 4.1.4 Audio Processing
- **librosa.js** or **tone.js** - BPM detection
- **Web Audio API** - Audio playback and control
- **howler.js** (optional) - Advanced audio control

#### 4.1.5 Data Storage
- **IndexedDB** (via Dexie.js) - Local database
  - Music file storage (Blob)
  - Metadata storage
  - Historical data storage
- **localStorage** - User preference settings

#### 4.1.6 Hardware Interface
- **Web Serial API** - Arduino serial communication
- **Web Workers** - BPM analysis background processing

### 4.2 Project Structure (Backend-Ready Architecture)

```
src/
├── api/                    # API abstraction layer (Backend-ready)
│   ├── client.ts          # HTTP client (reserved)
│   ├── endpoints.ts       # API endpoint definitions
│   └── types.ts           # API type definitions
├── services/              # Business logic layer
│   ├── DataService.ts     # Data service (switchable local/remote)
│   ├── MusicService.ts    # Music service
│   ├── StateService.ts   # State classification service
│   └── BPMAnalysisService.ts
├── stores/                # State management
│   ├── useMusicStore.ts
│   ├── useStateStore.ts
│   └── useDeviceStore.ts
├── components/            # UI components
│   ├── MusicUpload/
│   ├── HeartRateMonitor/
│   ├── StateDisplay/
│   └── MusicPlayer/
├── hooks/                 # Custom Hooks
│   ├── useSerialPort.ts
│   ├── useBPMDetection.ts
│   └── useStateClassification.ts
├── utils/                 # Utility functions
│   ├── audio.ts
│   ├── classification.ts
│   └── storage.ts
├── workers/               # Web Workers
│   └── bpmWorker.ts
└── types/                 # TypeScript type definitions
    ├── music.ts
    ├── state.ts
    └── device.ts
```

### 4.3 Data Flow Design

```
Hardware Data Sources
    │
    ├─ Arduino HR Sensor ──Web Serial API──> DataService
    │
    └─ MWL Simulator ────────Timer────────> DataService
                                    │
                                    ▼
                            StateClassificationService
                                    │
                                    ▼
                            MusicRecommendationService
                                    │
                                    ▼
                            MusicPlayer (Auto-play)
```

### 4.4 Algorithm Implementation

#### 4.4.1 BPM Detection Algorithm
- **Library**: librosa.js (WebAssembly version)
- **Methods**: 
  - Autocorrelation
  - Spectrum Analysis (FFT)
  - Beat Tracking

#### 4.4.2 State Classification Algorithm
- **Method**: Rule-based classifier
- **Input**: HR deviation, MWL deviation
- **Output**: State label + Confidence
- **Future Expansion**: Can be replaced with machine learning model

#### 4.4.3 Music Recommendation Algorithm
- **Method**: Content-based recommendation
- **Features**: BPM match, User preferences, Play history
- **Future Expansion**: Can add collaborative filtering

### 4.5 Performance Requirements

- **BPM Detection**: < 10 seconds (3-minute audio)
- **State Classification**: < 100ms (real-time)
- **Music Transition**: < 1 second (fade in/out)
- **Data Storage**: Support at least 1000 songs
- **Memory Usage**: < 500MB (including audio cache)

### 4.6 Browser Compatibility

- **Required**: Chrome/Edge 89+ (Web Serial API support)
- **Recommended**: Chrome/Edge/Firefox (latest versions)
- **Fallback**: 
  - No IndexedDB support → localStorage (limited storage)

---

## 5. User Interface Design

**Feature Description**: Dynamically recommend appropriate music based on user's current state and personalized preferences

**User Stories**:
- As a user, when I'm stressed, I want the system to automatically play soothing music to help me relax
- As a user, when I'm distracted, I want the system to play slightly stimulating music to help me focus
- As a user, I want the recommended music to match my personal preferences

**Features**:
- [ ] Music library management (support multiple music types)
- [ ] BPM automatic detection and classification
- [ ] Personalized recommendation algorithm
- [ ] Real-time music switching (smooth transition)
- [ ] Music playback control (Play/Pause/Skip)

### 5.1 Main Interfaces

#### 5.1.1 Home/Real-time Monitoring Interface
**Layout**:
```
┌─────────────────────────────┐
│  [Device Status] [Settings] [History]    │
├─────────────────────────────┤
│                              │
│      [Heart Rate Display]    │
│        85 bpm                │
│      ↗ Normal Range          │
│                              │
│      [MWL Index]             │
│        0.65                  │
│      → Moderate              │
│                              │
│      [Current State]         │
│      🟢 Normal               │
│                              │
│  ┌─────────────────────┐    │
│  │  🎵 Now Playing      │    │
│  │  Classical - 60 BPM │    │
│  │  [⏸] [⏭] [❤️]      │    │
│  └─────────────────────┘    │
│                              │
│  [Volume Control] ━━━━━━━━━━━●    │
└─────────────────────────────┘
```

**Interactions**:
- Click heart rate/MWL area to view detailed trends
- Click music area to enter playback control
- Slide volume control bar to adjust volume

#### 5.1.2 State History Interface
**Layout**:
```
┌─────────────────────────────┐
│  ← Back   Today's State    [Filter] │
├─────────────────────────────┤
│                              │
│  [Timeline View]             │
│  09:00 ━━━━━━━━━━━━━━━━━━  │
│        🟢 Normal             │
│  10:00 ━━━━━━━━━━━━━━━━━━  │
│        🔵 Productive         │
│  11:00 ━━━━━━━━━━━━━━━━━━  │
│        🔴 Stressed           │
│                              │
│  [Statistics Cards]          │
│  ┌──────┐ ┌──────┐          │
│  │Normal │ │Productive│      │
│  │4.5h  │ │2.0h  │          │
│  └──────┘ └──────┘          │
│  ┌──────┐ ┌──────┐          │
│  │Distracted│ │Stressed│    │
│  │0.5h  │ │1.0h  │          │
│  └──────┘ └──────┘          │
│                              │
│  [Trend Chart]               │
│  ┌─────────────────────┐    │
│  │   Heart Rate Trend  │    │
│  │   [Line Chart]      │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

#### 5.1.3 Music Library Interface
**Layout**:
```
┌─────────────────────────────┐
│  ← Back   My Music    [Search] │
├─────────────────────────────┤
│  [Genre Filter]              │
│  [All] [Classical] [Pop] [White Noise] │
├─────────────────────────────┤
│  [BPM Range] 60-80 bpm      │
│  ─────●──────────────        │
├─────────────────────────────┤
│  [Music List]                │
│  🎵 Moonlight Sonata - 72 BPM │
│  🎵 Rain White Noise - No BPM │
│  🎵 Canon - 68 BPM           │
│  ...                         │
│                              │
│  [+ Add Music]               │
└─────────────────────────────┘
```

#### 5.1.4 Settings Interface
**Layout**:
```
┌─────────────────────────────┐
│  ← Back   Settings           │
├─────────────────────────────┤
│  [Device Management]         │
│  → Heart Rate Earbuds (Connected 85%)    │
│  → Stress Headband (Connected 90%)    │
├─────────────────────────────┤
│  [Music Preferences]         │
│  → Music Style Settings      │
│  → Volume Settings           │
├─────────────────────────────┤
│  [Personalization]           │
│  → Baseline Settings         │
│  → Recommendation Preferences │
├─────────────────────────────┤
│  [Account]                   │
│  → Data Sync                 │
│  → Privacy Settings          │
└─────────────────────────────┘
```

### 5.2 Design Specifications
- **Color Scheme**:
  - Normal State: Green (#4CAF50)
  - Productive State: Blue (#2196F3)
  - Distracted State: Yellow (#FFC107)
  - Stressed State: Red (#F44336)
- **Font**: System default fonts, supports accessible font sizes
- **Icons**: Use Material Design icon library
- **Animation**: Smooth transition animations (300ms)

---

## 6. Appendix

### 6.1 Glossary
- **BPM**: Beats Per Minute
- **MWL**: Mental Workload
- **PPG**: Photoplethysmography
- **fNIRS**: functional Near-Infrared Spectroscopy

### 6.2 Reference Documents
- Project Design Document: `Project_Design.md`
- Academic Research References (see Project Design Document)

### 6.3 Changelog
- v1.0 (2025-01-11): Prototype Version
  - Focus on Web APP prototype development
  - Defined 5 core feature requirements
  - Updated tech stack to React + TypeScript
  - Architecture designed as Backend-ready frontend
  - State classification rules based on academic research

---

**End of Document**

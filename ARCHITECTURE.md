# MUSE System - Frontend Architecture Design
## Domain Model Analysis Based on PRD

---

## 1. Core Domain Concept Extraction

### 1.1 Entities
Core data entities extracted from PRD:

1. **Music**
   - Music files and their metadata
   - BPM, duration, genre, and other attributes
   - Stored in IndexedDB

2. **BiometricData**
   - HeartRate (heart rate)
   - MWL (Mental Workload)
   - Real-time collection and historical records

3. **UserState**
   - 4 state classification results
   - Confidence and classification reasoning
   - State transition history

4. **Device**
   - Heart rate sensor
   - MWL simulator
   - Connection status management

5. **UserPreferences**
   - Music genre preferences
   - Baseline data
   - Personalized settings

6. **PlaybackSession**
   - Currently playing music
   - Playback status
   - Volume control

### 1.2 State Enums

1. **UserStateType**: stressed | calm | productive | distracted
2. **DeviceStatus**: connected | disconnected | connecting | error
3. **PlaybackStatus**: playing | paused | stopped | loading
4. **SignalQuality**: excellent | good | fair | poor

### 1.3 Services

Services extracted from PRD Section 3 "Core Functional Requirements":

1. **BPMDetectionService** - Feature 1: BPM Analysis
2. **MWLSimulator** - Feature 2: MWL Data Simulation
3. **HeartRateService** - Feature 3: Heart Rate Data Reception
4. **StateClassificationService** - Feature 4: State Classification Algorithm
5. **MusicRecommendationService** - Feature 5: Music Recommendation
6. **MusicPlayerService** - Music Playback Control
7. **DataStorageService** - Data Persistence (IndexedDB)
8. **SerialPortService** - Hardware Communication (Web Serial API)

---

## 2. Frontend Module Structure

Backend-Ready architecture based on PRD Section 4.2 "Project Structure":

```
src/
├── types/                          # TypeScript type definitions
│   ├── music.ts                    # Music-related types
│   ├── biometric.ts                # Biometric data types
│   ├── state.ts                    # State classification types
│   ├── device.ts                   # Device-related types
│   ├── preferences.ts              # User preference types
│   └── common.ts                   # Common types
│
├── services/                       # Business logic layer (pure function services)
│   ├── BPMDetectionService.ts     # BPM detection service
│   ├── StateClassificationService.ts  # State classification service
│   ├── MusicRecommendationService.ts  # Music recommendation service
│   ├── HeartRateSimulator.ts      # Heart rate data simulator
│   ├── MWLSimulator.ts             # MWL data simulator
│   └── SerialPortService.ts        # Serial port communication service
│
├── utils/                          # Utility function library
│   ├── db.ts                       # IndexedDB wrapper (Dexie.js)
│   ├── audio.ts                    # Audio processing utilities
│   ├── signal.ts                   # Signal processing utilities
│   ├── validation.ts               # Data validation utilities
│   └── calculation.ts              # Mathematical calculation utilities
│
├── stores/                         # State management (Zustand)
│   ├── useAppStore.ts              # Global application state
│   ├── useMusicStore.ts            # Music library state
│   ├── useBiometricStore.ts       # Biometric data state
│   ├── useDeviceStore.ts           # Device connection state
│   └── usePlayerStore.ts           # Player state
│
├── hooks/                          # Custom React Hooks
│   ├── useSerialPort.ts            # Serial port connection Hook
│   ├── useBPMDetection.ts          # BPM detection Hook
│   ├── useStateClassification.ts  # State classification Hook
│   ├── useRealtimeData.ts          # Real-time data subscription Hook
│   └── useMusicRecommendation.ts  # Music recommendation Hook
│
├── components/                     # UI components
│   ├── DeviceStatus/               # Device status components
│   ├── BiometricDisplay/           # Biometric data display
│   ├── StateIndicator/             # State indicator
│   ├── MusicPlayer/                # Music player
│   ├── MusicLibrary/               # Music library management
│   └── HistoryView/                # Historical data view
│
├── workers/                        # Web Workers
│   └── bpmWorker.ts                # BPM analysis background processing
│
└── constants/                      # Constant definitions
    ├── states.ts                   # State-related constants
    ├── thresholds.ts               # Algorithm threshold constants
    └── defaults.ts                 # Default value constants
```

---

## 3. Core Concept to Code Mapping

### 3.1 PRD Concepts → TypeScript Interfaces

| PRD Concept | Corresponding File | Description |
|-------------|-------------------|-------------|
| MusicMetadata (PRD 3.1) | `types/music.ts` | Music metadata interface |
| HeartRateData (PRD 3.3) | `types/biometric.ts` | Heart rate data interface |
| MWLData (PRD 3.2) | `types/biometric.ts` | MWL data interface |
| StateClassificationInput/Output (PRD 3.4) | `types/state.ts` | State classification interface |
| UserPreferences | `types/preferences.ts` | User preferences interface |
| Device Connection | `types/device.ts` | Device connection interface |

### 3.2 PRD Features → Service Services

| PRD Feature | Corresponding Service | Responsibility |
|-------------|----------------------|----------------|
| Feature 1: Local Music Upload and BPM Analysis | `BPMDetectionService.ts` | BPM detection algorithm |
| Feature 2: Simulated MWL Data Reception | `MWLSimulator.ts` | Generate simulated MWL data |
| Feature 3: Real HR Signal Reception | `HeartRateSimulator.ts` / `SerialPortService.ts` | Heart rate data collection |
| Feature 4: State Classification Algorithm | `StateClassificationService.ts` | Multi-modal state classification |
| Feature 5: State-Based Music Recommendation | `MusicRecommendationService.ts` | Music recommendation algorithm |

### 3.3 Data Flow Mapping

```
PRD Data Flow (see Section 4.3)     Code Implementation
────────────────────────────        ────────────────────
Arduino HR Sensor            →      SerialPortService
                             →      useBiometricStore
                     
MWL Simulator                →      MWLSimulator
                             →      useBiometricStore
                     
BiometricData                →      StateClassificationService
                             →      useAppStore (state)
                     
Current State                →      MusicRecommendationService
                             →      useMusicStore
                     
Recommended Music            →      MusicPlayerService
                             →      usePlayerStore
```

---

## 4. Design Principles

### 4.1 Backend-Ready Design
- All Service layer uses interface abstractions
- Data access through unified DataService
- Easy to migrate to backend API in the future

### 4.2 Separation of Concerns
- **Types**: Pure type definitions, no business logic
- **Services**: Pure functions, no state management
- **Stores**: State management, no business logic
- **Components**: UI rendering, no direct data processing

### 4.3 Testability
- Service layer pure functions, easy to unit test
- Store layer using Zustand, supports independent testing
- Algorithm logic independent, can be verified offline

---

## 5. Next Steps Implementation Plan

1. **Phase 1**: Define all TypeScript interfaces (types/ directory)
2. **Phase 2**: Implement Service interface definitions (function signatures)
3. **Phase 3**: Implement data storage layer (utils/db.ts)
4. **Phase 4**: Implement state management (stores/ directory)
5. **Phase 5**: Implement core algorithms (services/ directory)
6. **Phase 6**: Implement UI components (components/ directory)

---

**Document Version**: v1.0  
**Created**: 2026-01-16  
**Based on**: PRD_Multi-Sensory Emotion Regulation System.md v1.0

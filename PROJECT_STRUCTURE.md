# MUSE System - Project Structure Overview

## 📂 Complete File Structure

```
Frontend Design for MUSE App/
│
├── 📄 PRD_Multi-sensory_Emotional_Regulation_System.md  # Product Requirements Document
├── 📄 ARCHITECTURE.md                     # Architecture Design Document
├── 📄 DOMAIN_MODELS_SUMMARY.md            # Domain Model Summary
├── 📄 PROJECT_STRUCTURE.md                # This file
├── 📄 README.md                           # Project Description
│
└── src/
    └── src/
        │
        ├── 📁 types/                      # TypeScript Type Definitions ✅
        │   ├── common.ts                  # Common Types
        │   ├── music.ts                   # Music-related Types
        │   ├── biometric.ts               # Biometric Data Types
        │   ├── state.ts                   # State Classification Types
        │   ├── device.ts                  # Device-related Types
        │   ├── preferences.ts             # User Preference Types
        │   ├── session.ts                 # Session Types (New) ✅
        │   └── index.ts                   # Unified Type Exports ✅
        │
        ├── 📁 services/                   # Business Logic Services ✅ (Interfaces)
        │   ├── BPMDetectionService.ts     # BPM Detection Service Interface
        │   ├── StateClassificationService.ts  # State Classification Service Interface
        │   ├── MusicRecommendationService.ts  # Music Recommendation Service Interface
        │   ├── HeartRateSimulator.ts      # Heart Rate Simulator Interface
        │   └── MWLSimulator.ts            # MWL Simulator Interface
        │
        ├── 📁 components/                 # React Components ✅ (Partial)
        │   ├── Header.tsx
        │   ├── Sidebar.tsx
        │   ├── HomeView.tsx
        │   ├── MusicLibraryView.tsx
        │   ├── PlaceholderView.tsx
        │   ├── DeviceStatusCard.tsx
        │   ├── MetricCard.tsx
        │   ├── StateIndicator.tsx
        │   ├── MusicPlayer.tsx
        │   └── ... (more components to be developed)
        │
        ├── 📁 stores/                     # State Management ⏳ (To be implemented)
        │   ├── useAppStore.ts             # Global App State
        │   ├── useMusicStore.ts           # Music Library State
        │   ├── useBiometricStore.ts       # Biometric Data State
        │   ├── useDeviceStore.ts          # Device State
        │   └── usePlayerStore.ts          # Player State
        │
        ├── 📁 hooks/                      # Custom Hooks ⏳ (To be implemented)
        │   ├── useSerialPort.ts
        │   ├── useBPMDetection.ts
        │   ├── useStateClassification.ts
        │   ├── useRealtimeData.ts
        │   └── useMusicRecommendation.ts
        │
        ├── 📁 utils/                      # Utility Functions ⏳ (To be implemented)
        │   ├── db.ts                      # IndexedDB Wrapper
        │   ├── audio.ts                   # Audio Processing
        │   ├── signal.ts                  # Signal Processing
        │   ├── validation.ts              # Data Validation
        │   └── calculation.ts             # Mathematical Calculations
        │
        ├── 📁 workers/                    # Web Workers ⏳ (To be implemented)
        │   └── bpmWorker.ts               # BPM Analysis Worker
        │
        ├── 📁 constants/                  # Constant Definitions ⏳ (To be implemented)
        │   ├── states.ts
        │   ├── thresholds.ts
        │   └── defaults.ts
        │
        ├── 📁 views/                      # Page Views (Existing)
        │   ├── HomeView.tsx
        │   ├── HistoryView.tsx
        │   ├── MusicLibraryView.tsx
        │   └── SettingsView.tsx
        │
        ├── 📁 styles/                     # Style Files
        │   └── globals.css
        │
        ├── App.tsx                        # Main App Component
        └── main.tsx                       # App Entry Point
```

---

## 📊 Module Dependency Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                             │
│                    (Main App + Routing)                     │
└────────────────────┬───────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼────────┐
│   Components   │      │     Stores      │
│   (UI Layer)   │◄─────┤  (State Mgmt)   │
└───────┬────────┘      └────────┬────────┘
        │                        │
        │                ┌───────▼────────┐
        │                │     Hooks      │
        │                │ (Business Logic)│
        │                └───────┬────────┘
        │                        │
        └────────────┬───────────┘
                     │
        ┌────────────▼────────────┐
        │       Services          │
        │   (Pure Functions)      │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │         Types           │
        │   (Type Definitions)    │
        └─────────────────────────┘
```

---

## 🔗 Data Flow Architecture

```
┌─────────────────┐
│  Hardware       │
│  (Arduino/      │
│   Simulator)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Services       │
│  - HRSimulator  │
│  - MWLSimulator │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Biometric      │
│  Store          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  State          │
│  Classification │
│  Service        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  App Store      │
│  (Current State)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Music          │
│  Recommendation │
│  Service        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Music Store    │
│  & Player       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  UI Components  │
│  (User sees)    │
└─────────────────┘
```

---

## 📦 Module Responsibilities

### 1. Types Layer (Type Definitions)
**Responsibility**: Define data structures for the entire system  
**Principle**: Pure types, no business logic  
**File Count**: 6  
**Status**: ✅ Complete

#### Module List:
- `common.ts` - Common base types
- `music.ts` - Music metadata, BPM detection results
- `biometric.ts` - Heart rate, MWL data
- `state.ts` - 4 state classifications and statistics
- `device.ts` - Device connection, serial port configuration
- `preferences.ts` - User preferences, music feedback

---

### 2. Services Layer (Business Logic)
**Responsibility**: Implement core algorithms and data processing  
**Principle**: Pure functions, no state management  
**File Count**: 5 interfaces + implementations pending  
**Status**: ✅ Interfaces complete, ⏳ Implementation pending

#### Module List:
1. **BPMDetectionService**
   - Audio file BPM detection
   - Uses Web Worker for background processing
   - Supports batch detection

2. **StateClassificationService**
   - Multi-modal state classification algorithm
   - Baseline calculation and adaptation
   - State change detection

3. **MusicRecommendationService**
   - State-based music recommendation
   - BPM matching algorithm
   - Personalized learning

4. **HeartRateSimulator**
   - Simulated heart rate data generation
   - Supports different state modes
   - Configurable noise

5. **MWLSimulator**
   - Simulated MWL data generation
   - Simulates multi-region brain activation
   - Supports automatic state transitions

---

### 3. Stores Layer (State Management)
**Responsibility**: Manage global application state  
**Tech Stack**: Zustand  
**Principle**: Only manage state, no business logic  
**Status**: ⏳ To be implemented

#### Modules to Create:
- `useAppStore.ts` - Global state (current state, view, etc.)
- `useMusicStore.ts` - Music library management
- `useBiometricStore.ts` - Biometric data cache
- `useDeviceStore.ts` - Device connection state
- `usePlayerStore.ts` - Player state

---

### 4. Hooks Layer (React Integration)
**Responsibility**: Connect Services and Stores to React components  
**Principle**: Custom Hooks, handle side effects  
**Status**: ⏳ To be implemented

#### Modules to Create:
- `useSerialPort` - Arduino serial port connection
- `useBPMDetection` - BPM detection Hook
- `useStateClassification` - Real-time state classification
- `useRealtimeData` - Real-time data subscription
- `useMusicRecommendation` - Music recommendation Hook

---

### 5. Components Layer (UI Components)
**Responsibility**: UI rendering and user interaction  
**Principle**: Presentation components, minimal logic  
**Status**: ✅ Base components complete, ⏳ Feature components pending

#### Completed:
- Header, Sidebar (Navigation)
- HomeView (Home page view)
- DeviceStatusCard, MetricCard (Data cards)
- StateIndicator (State indicator)
- MusicPlayer (Music player)

#### To be Developed:
- BiometricChart (Biometric data chart)
- MusicUploader (Music upload)
- DeviceConnector (Device connection)
- StateHistory (State history)

---

### 6. Utils Layer (Utility Functions)
**Responsibility**: Common utilities and helper functions  
**Status**: ⏳ To be implemented

#### Modules to Create:
- `db.ts` - IndexedDB wrapper (Dexie.js)
- `audio.ts` - Audio processing utilities
- `signal.ts` - Signal processing utilities
- `validation.ts` - Data validation
- `calculation.ts` - Mathematical calculations

---

## 🎯 Development Priority

### Phase 1: Core Foundation ✅ Complete
- [x] Type definitions (types/ directory)
- [x] Service interface definitions (services/ directory)
- [x] Basic UI components

### Phase 2: Data Layer ⏳ In Progress
- [ ] Implement data storage (utils/db.ts)
- [ ] Implement state management (stores/ directory)
- [ ] Implement data simulators

### Phase 3: Algorithm Layer ⏳ Not Started
- [ ] Implement BPM detection algorithm
- [ ] Implement state classification algorithm
- [ ] Implement music recommendation algorithm

### Phase 4: Integration Layer ⏳ Not Started
- [ ] Implement custom Hooks
- [ ] Connect Services and Stores
- [ ] Implement serial port communication

### Phase 5: UI Refinement ⏳ Not Started
- [ ] Complete feature components
- [ ] Data visualization
- [ ] Interaction optimization

---

## 📈 Completion Statistics

| Module | File Count | Completed | In Progress | Pending | Completion |
|--------|-----------|-----------|-------------|---------|------------|
| Types | 8 | 8 | 0 | 0 | 100% |
| Services (Interface) | 5 | 5 | 0 | 0 | 100% |
| Services (Implementation) | 5 | 0 | 0 | 5 | 0% |
| Stores | 5 | 0 | 0 | 5 | 0% |
| Hooks | 5 | 0 | 0 | 5 | 0% |
| Utils | 5 | 0 | 0 | 5 | 0% |
| Components | 15 | 9 | 0 | 6 | 60% |
| Workers | 1 | 0 | 0 | 1 | 0% |
| **Total** | **49** | **22** | **0** | **27** | **45%** |

---

## 🔍 Code Quality Checklist

### ✅ Implemented
- [x] All types have complete TypeScript definitions
- [x] All Service interfaces have documentation comments
- [x] All entities in PRD have corresponding types
- [x] All features in PRD have corresponding service interfaces
- [x] Architecture documentation complete
- [x] Domain model mapping documentation complete

### ⏳ To be Completed
- [ ] Unit test coverage
- [ ] E2E testing
- [ ] Performance benchmark testing
- [ ] Standardized error handling
- [ ] Logging system
- [ ] Code formatting configuration (Prettier/ESLint)

---

## 📚 Related Documentation

1. **PRD_Multi-sensory_Emotional_Regulation_System.md**  
   Product Requirements Document, defines system features and goals

2. **ARCHITECTURE.md**  
   Architecture design document, explains overall system architecture

3. **DOMAIN_MODELS_SUMMARY.md**  
   Domain model summary, detailed mapping from PRD to code

4. **PROJECT_STRUCTURE.md** (This file)  
   Project structure overview, shows file organization

---

**Document Version**: v1.1  
**Last Updated**: 2026-01-16  
**Total Files**: 49  
**Completion**: 45%  
**Latest Update**: Added session.ts type definitions (MusicTrack, UserPreference, UserState, ListeningSession)  
**Next Step**: Implement data storage and state management layer

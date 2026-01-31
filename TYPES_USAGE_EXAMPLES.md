# MUSE System - Type Usage Examples

This document demonstrates how to use MUSE system TypeScript type definitions in frontend code.

---

## 📦 Importing Types

```typescript
// Import single types
import { MusicTrack, UserState, ListeningSession } from '@/types';

// Import multiple related types
import { 
  UserPreference, 
  UserStateType,
  BiometricSnapshot 
} from '@/types';

// Import all types (not recommended)
import * as Types from '@/types';
```

---

## 🎵 MusicTrack Usage Examples

### Creating a Music Track

```typescript
import { MusicTrack } from '@/types/session';
import { v4 as uuidv4 } from 'uuid';

// Create MusicTrack object after user uploads music
const createMusicTrack = (file: File, bpm: number | null): MusicTrack => {
  return {
    id: uuidv4(),
    title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
    artist: undefined,
    album: undefined,
    bpm: bpm,
    duration: 0, // Will be updated after audio loads
    genre: undefined,
    audioSource: `indexed_db_key_${uuidv4()}`, // Key in IndexedDB
    coverImage: undefined,
    addedAt: Date.now(),
    isFavorite: false,
    playCount: 0,
    lastPlayedAt: undefined,
    rating: undefined,
    tags: [],
  };
};

// Usage example
const file = new File(['...'], 'my-song.mp3');
const track = createMusicTrack(file, 120);
```

### Updating Play Count

```typescript
const incrementPlayCount = (track: MusicTrack): MusicTrack => {
  return {
    ...track,
    playCount: track.playCount + 1,
    lastPlayedAt: Date.now(),
  };
};
```

### Filtering Music

```typescript
const filterTracksByBPM = (
  tracks: MusicTrack[], 
  minBPM: number, 
  maxBPM: number
): MusicTrack[] => {
  return tracks.filter(track => 
    track.bpm !== null && 
    track.bpm >= minBPM && 
    track.bpm <= maxBPM
  );
};

// Usage example
const allTracks: MusicTrack[] = [...]; // Load from IndexedDB
const calmTracks = filterTracksByBPM(allTracks, 60, 80);
```

---

## 👤 UserPreference Usage Examples

### Creating Default User Preferences

```typescript
import { UserPreference, UserStateType } from '@/types';

const createDefaultPreference = (): UserPreference => {
  return {
    id: uuidv4(),
    userId: undefined, // Offline mode
    createdAt: Date.now(),
    updatedAt: Date.now(),
    
    music: {
      favoriteGenres: ['classical', 'ambient', 'instrumental'],
      preferredBPMRange: { min: 60, max: 120 },
      defaultVolume: 50,
      enableCrossfade: true,
      crossfadeDuration: 2,
    },
    
    stateMappings: {
      [UserStateType.STRESSED]: {
        preferredGenres: ['classical', 'ambient'],
        bpmMultiplier: 0.75,
        volume: 45,
      },
      [UserStateType.CALM]: {
        preferredGenres: ['instrumental', 'nature'],
        bpmMultiplier: 1.0,
        volume: 50,
      },
      [UserStateType.PRODUCTIVE]: {
        preferredGenres: ['instrumental', 'electronic'],
        bpmMultiplier: 1.0,
        volume: 40,
      },
      [UserStateType.DISTRACTED]: {
        preferredGenres: ['pop', 'electronic'],
        bpmMultiplier: 1.2,
        volume: 55,
      },
    },
    
    system: {
      autoPlay: true,
      enableNotifications: true,
      notificationInterval: 30,
      darkMode: true,
      language: 'en-US',
    },
    
    privacy: {
      saveHistory: true,
      historyRetentionDays: 90,
      enableAnalytics: false,
    },
  };
};
```

### Updating User Preferences

```typescript
const updateMusicPreference = (
  preference: UserPreference,
  updates: Partial<UserPreference['music']>
): UserPreference => {
  return {
    ...preference,
    music: {
      ...preference.music,
      ...updates,
    },
    updatedAt: Date.now(),
  };
};

// Usage example
let preference = createDefaultPreference();
preference = updateMusicPreference(preference, {
  defaultVolume: 60,
  favoriteGenres: ['jazz', 'classical'],
});
```

### Saving to localStorage

```typescript
import { STORAGE_KEYS } from '@/types/session';

const savePreference = (preference: UserPreference): void => {
  localStorage.setItem(
    STORAGE_KEYS.USER_PREFERENCE, 
    JSON.stringify(preference)
  );
};

const loadPreference = (): UserPreference | null => {
  const json = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCE);
  if (!json) return null;
  
  try {
    return JSON.parse(json) as UserPreference;
  } catch (error) {
    console.error('Failed to parse user preference:', error);
    return null;
  }
};
```

---

## 📊 UserState Usage Examples

### Creating User State Snapshot

```typescript
import { UserState, UserStateType } from '@/types';

const createUserState = (
  stateType: UserStateType,
  heartRate: number,
  mwl: number,
  confidence: number
): UserState => {
  // Assume baseline values
  const HR_BASELINE = 75;
  const MWL_BASELINE = 0.5;
  
  return {
    id: uuidv4(),
    timestamp: Date.now(),
    stateType,
    confidence,
    biometric: {
      heartRate,
      heartRateBaseline: HR_BASELINE,
      mwl,
      mwlBaseline: MWL_BASELINE,
      hrv: undefined,
    },
    duration: 0,
    description: `User currently in ${stateType} state`,
    triggers: [],
    isAbnormal: stateType === UserStateType.STRESSED && confidence > 0.8,
  };
};

// Usage example
const currentState = createUserState(
  UserStateType.CALM,
  70,
  0.4,
  0.85
);
```

### Detecting State Changes

```typescript
const hasStateChanged = (
  previous: UserState,
  current: UserState
): boolean => {
  return previous.stateType !== current.stateType;
};

const getStateDuration = (state: UserState): number => {
  return Date.now() - state.timestamp;
};
```

---

## 🎧 ListeningSession Usage Examples

### Starting a New Session

```typescript
import { ListeningSession, UserState } from '@/types';

const startListeningSession = (
  initialState: UserState,
  sessionType: 'manual' | 'auto' | 'recommended' = 'manual'
): ListeningSession => {
  return {
    id: uuidv4(),
    startTime: Date.now(),
    endTime: undefined,
    duration: 0,
    tracks: [],
    initialState,
    finalState: undefined,
    stateChanges: [initialState],
    stats: {
      totalTracks: 0,
      completedTracks: 0,
      skippedTracks: 0,
      avgHeartRate: initialState.biometric.heartRate,
      avgMWL: initialState.biometric.mwl,
      stateImprovement: 0,
    },
    sessionType,
    tags: [],
    notes: undefined,
    isCompleted: false,
  };
};
```

### Adding Track to Session

```typescript
import { ListeningSession, ListeningSessionTrack, MusicTrack } from '@/types';

const addTrackToSession = (
  session: ListeningSession,
  track: MusicTrack,
  currentState: UserState
): ListeningSession => {
  const sessionTrack: ListeningSessionTrack = {
    trackId: track.id,
    trackSnapshot: {
      title: track.title,
      artist: track.artist,
      bpm: track.bpm,
      duration: track.duration,
    },
    startTime: Date.now(),
    endTime: undefined,
    playedDuration: 0,
    wasCompleted: false,
    wasSkipped: false,
    skipReason: undefined,
    userState: currentState.stateType,
    feedback: undefined,
  };
  
  return {
    ...session,
    tracks: [...session.tracks, sessionTrack],
    stats: {
      ...session.stats,
      totalTracks: session.stats.totalTracks + 1,
    },
  };
};
```

### Completing Track Playback

```typescript
const completeTrackPlayback = (
  session: ListeningSession,
  trackIndex: number,
  wasCompleted: boolean
): ListeningSession => {
  const updatedTracks = [...session.tracks];
  const track = updatedTracks[trackIndex];
  
  if (!track) return session;
  
  const now = Date.now();
  updatedTracks[trackIndex] = {
    ...track,
    endTime: now,
    playedDuration: (now - track.startTime) / 1000,
    wasCompleted,
    wasSkipped: !wasCompleted,
    skipReason: wasCompleted ? undefined : 'user',
  };
  
  return {
    ...session,
    tracks: updatedTracks,
    stats: {
      ...session.stats,
      completedTracks: wasCompleted 
        ? session.stats.completedTracks + 1 
        : session.stats.completedTracks,
      skippedTracks: !wasCompleted 
        ? session.stats.skippedTracks + 1 
        : session.stats.skippedTracks,
    },
  };
};
```

### Ending Session

```typescript
const endListeningSession = (
  session: ListeningSession,
  finalState: UserState
): ListeningSession => {
  const now = Date.now();
  const duration = (now - session.startTime) / 1000;
  
  // Calculate state improvement metric
  const stateImprovement = calculateStateImprovement(
    session.initialState,
    finalState
  );
  
  return {
    ...session,
    endTime: now,
    duration,
    finalState,
    stateChanges: [...session.stateChanges, finalState],
    stats: {
      ...session.stats,
      stateImprovement,
    },
    isCompleted: true,
  };
};

// Helper function: Calculate state improvement
const calculateStateImprovement = (
  initial: UserState,
  final: UserState
): number => {
  // Simplified scoring system
  const stateScores = {
    [UserStateType.STRESSED]: -1,
    [UserStateType.DISTRACTED]: 0,
    [UserStateType.CALM]: 0.5,
    [UserStateType.PRODUCTIVE]: 1,
  };
  
  const initialScore = stateScores[initial.stateType] || 0;
  const finalScore = stateScores[final.stateType] || 0;
  
  return finalScore - initialScore;
};
```

### Saving Session to IndexedDB

```typescript
import { INDEXEDDB_CONFIG } from '@/types/session';

const saveSession = async (session: ListeningSession): Promise<void> => {
  const db = await openDatabase();
  const transaction = db.transaction(
    INDEXEDDB_CONFIG.STORES.LISTENING_SESSIONS, 
    'readwrite'
  );
  const store = transaction.objectStore(
    INDEXEDDB_CONFIG.STORES.LISTENING_SESSIONS
  );
  
  await store.put(session);
};

const loadSession = async (sessionId: string): Promise<ListeningSession | null> => {
  const db = await openDatabase();
  const transaction = db.transaction(
    INDEXEDDB_CONFIG.STORES.LISTENING_SESSIONS, 
    'readonly'
  );
  const store = transaction.objectStore(
    INDEXEDDB_CONFIG.STORES.LISTENING_SESSIONS
  );
  
  return await store.get(sessionId) || null;
};

// IndexedDB initialization helper function
const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      INDEXEDDB_CONFIG.DATABASE_NAME,
      INDEXEDDB_CONFIG.VERSION
    );
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores
      if (!db.objectStoreNames.contains(INDEXEDDB_CONFIG.STORES.LISTENING_SESSIONS)) {
        db.createObjectStore(
          INDEXEDDB_CONFIG.STORES.LISTENING_SESSIONS,
          { keyPath: 'id' }
        );
      }
    };
  });
};
```

---

## 🔄 Complete Workflow Example

### Music Recommendation and Playback Flow

```typescript
import {
  MusicTrack,
  UserState,
  UserPreference,
  ListeningSession,
  UserStateType,
} from '@/types';

class MusicRecommendationFlow {
  private currentSession: ListeningSession | null = null;
  private userPreference: UserPreference;
  
  constructor(preference: UserPreference) {
    this.userPreference = preference;
  }
  
  // 1. Get current user state
  async getCurrentState(): Promise<UserState> {
    // Get from biometric data service
    const heartRate = 75; // Simulated value
    const mwl = 0.6; // Simulated value
    
    return createUserState(UserStateType.PRODUCTIVE, heartRate, mwl, 0.85);
  }
  
  // 2. Recommend music based on state
  recommendTrack(
    currentState: UserState,
    availableTracks: MusicTrack[]
  ): MusicTrack | null {
    const stateMapping = this.userPreference.stateMappings[currentState.stateType];
    if (!stateMapping) return null;
    
    // Calculate target BPM
    const targetBPM = currentState.biometric.heartRate * stateMapping.bpmMultiplier;
    
    // Filter matching tracks
    const candidates = availableTracks.filter(track => 
      track.bpm !== null &&
      Math.abs(track.bpm - targetBPM) <= 10 &&
      (track.genre && stateMapping.preferredGenres.includes(track.genre))
    );
    
    // Return track with lowest play count (avoid repetition)
    return candidates.sort((a, b) => a.playCount - b.playCount)[0] || null;
  }
  
  // 3. Start playback session
  startSession(initialState: UserState): void {
    this.currentSession = startListeningSession(initialState, 'auto');
    this.saveCurrentSession();
  }
  
  // 4. Play track
  playTrack(track: MusicTrack, currentState: UserState): void {
    if (!this.currentSession) {
      this.startSession(currentState);
    }
    
    this.currentSession = addTrackToSession(
      this.currentSession!,
      track,
      currentState
    );
    
    this.saveCurrentSession();
  }
  
  // 5. End session
  async endSession(finalState: UserState): Promise<void> {
    if (!this.currentSession) return;
    
    this.currentSession = endListeningSession(this.currentSession, finalState);
    
    // Save to IndexedDB
    await saveSession(this.currentSession);
    
    // Clear current session
    this.currentSession = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }
  
  // Save current session to localStorage (for page refresh recovery)
  private saveCurrentSession(): void {
    if (this.currentSession) {
      localStorage.setItem(
        STORAGE_KEYS.CURRENT_SESSION,
        JSON.stringify(this.currentSession)
      );
    }
  }
}

// Usage example
const runMusicFlow = async () => {
  // Load user preferences
  const preference = loadPreference() || createDefaultPreference();
  
  // Create recommendation flow
  const flow = new MusicRecommendationFlow(preference);
  
  // Get current state
  const currentState = await flow.getCurrentState();
  
  // Load music library
  const tracks: MusicTrack[] = []; // Load from IndexedDB
  
  // Recommend music
  const recommendedTrack = flow.recommendTrack(currentState, tracks);
  
  if (recommendedTrack) {
    // Start playback
    flow.startSession(currentState);
    flow.playTrack(recommendedTrack, currentState);
    
    // ... play music ...
    
    // End session
    const finalState = await flow.getCurrentState();
    await flow.endSession(finalState);
  }
};
```

---

## ✅ Type Checking Best Practices

### Using Type Guards

```typescript
// Check if object is a valid MusicTrack
const isMusicTrack = (obj: any): obj is MusicTrack => {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.duration === 'number' &&
    typeof obj.addedAt === 'number'
  );
};

// Usage example
const loadTracksFromStorage = (): MusicTrack[] => {
  const json = localStorage.getItem(STORAGE_KEYS.MUSIC_TRACKS);
  if (!json) return [];
  
  try {
    const data = JSON.parse(json);
    return Array.isArray(data) ? data.filter(isMusicTrack) : [];
  } catch {
    return [];
  }
};
```

### Using Partial and Required

```typescript
// Partial update user preferences
const updatePreferencePartial = (
  current: UserPreference,
  updates: Partial<UserPreference>
): UserPreference => {
  return { ...current, ...updates, updatedAt: Date.now() };
};

// Ensure required fields
type RequiredMusicTrack = Required<Pick<MusicTrack, 'id' | 'title' | 'duration'>>;
```

---

## 📚 Related Documentation

- **types/session.ts** - Complete type definitions
- **ARCHITECTURE.md** - System architecture design
- **PROJECT_STRUCTURE.md** - Project structure

---

**Document Version**: v1.0  
**Created**: 2026-01-16  
**Scope**: MUSE System Frontend Development

/**
 * Listening Session Type Definitions
 * Used for tracking user's music listening history and behavior patterns
 * 
 * Features:
 * - Frontend-first design
 * - Supports offline storage (IndexedDB)
 * - Fully serializable
 */

import { UUID, Timestamp } from './common';
import { UserStateType } from './state';

/**
 * Music Track (Frontend-first version)
 * Simplified version focusing on core fields needed for playback and recommendations
 */
export interface MusicTrack {
  /** Unique identifier */
  id: UUID;
  
  /** Track title */
  title: string;
  
  /** Artist */
  artist?: string;
  
  /** Album name */
  album?: string;
  
  /** BPM (Beats Per Minute) */
  bpm: number | null;
  
  /** Duration (seconds) */
  duration: number;
  
  /** Music genre tag */
  genre?: string;
  
  /** Local file path or IndexedDB key */
  audioSource: string;
  
  /** Cover image (Base64 or URL) */
  coverImage?: string;
  
  /** Added time */
  addedAt: Timestamp;
  
  /** Is favorite */
  isFavorite: boolean;
  
  /** Play count */
  playCount: number;
  
  /** Last played time */
  lastPlayedAt?: Timestamp;
  
  /** User rating (1-5 stars) */
  rating?: number;
  
  /** Custom tags */
  tags?: string[];
}

/**
 * User Preference (Frontend-first version)
 * Stores user's music preferences and system settings
 */
export interface UserPreference {
  /** User ID (optional, can be empty in offline mode) */
  userId?: string;
  
  /** Preference ID */
  id: UUID;
  
  /** Creation time */
  createdAt: Timestamp;
  
  /** Last update time */
  updatedAt: Timestamp;
  
  /** Music preference settings */
  music: {
    /** Preferred music genre list */
    favoriteGenres: string[];
    
    /** Preferred BPM range */
    preferredBPMRange: {
      min: number;
      max: number;
    };
    
    /** Default volume (0-100) */
    defaultVolume: number;
    
    /** Enable crossfade */
    enableCrossfade: boolean;
    
    /** Crossfade duration (seconds) */
    crossfadeDuration: number;
  };
  
  /** State-music mapping preferences */
  stateMappings: {
    [K in UserStateType]?: {
      /** Preferred music genres for this state */
      preferredGenres: string[];
      
      /** Preferred BPM multiplier for this state */
      bpmMultiplier: number;
      
      /** Preferred volume for this state */
      volume: number;
    };
  };
  
  /** System settings */
  system: {
    /** Enable auto-play */
    autoPlay: boolean;
    
    /** Enable state notifications */
    enableNotifications: boolean;
    
    /** Notification interval (minutes) */
    notificationInterval: number;
    
    /** Enable dark mode */
    darkMode: boolean;
    
    /** Language setting */
    language: 'zh-CN' | 'en-US';
  };
  
  /** Privacy settings */
  privacy: {
    /** Save play history */
    saveHistory: boolean;
    
    /** History retention days */
    historyRetentionDays: number;
    
    /** Enable analytics */
    enableAnalytics: boolean;
  };
}

/**
 * User State (Frontend-first version)
 * Represents user's current physiological and psychological state
 */
export interface UserState {
  /** State ID */
  id: UUID;
  
  /** Timestamp */
  timestamp: Timestamp;
  
  /** State type */
  stateType: UserStateType;
  
  /** Confidence (0-1) */
  confidence: number;
  
  /** Biometric data */
  biometric: {
    /** Current heart rate */
    heartRate: number;
    
    /** Heart rate baseline */
    heartRateBaseline: number;
    
    /** Current MWL index */
    mwl: number;
    
    /** MWL baseline */
    mwlBaseline: number;
    
    /** HRV metric (optional) */
    hrv?: number;
  };
  
  /** State duration (seconds) */
  duration: number;
  
  /** State description */
  description?: string;
  
  /** Triggers (optional) */
  triggers?: string[];
  
  /** Is abnormal state */
  isAbnormal: boolean;
}

/**
 * Listening Session
 * Records a complete music listening session
 */
export interface ListeningSession {
  /** Session ID */
  id: UUID;
  
  /** Start time */
  startTime: Timestamp;
  
  /** End time (optional, undefined for ongoing sessions) */
  endTime?: Timestamp;
  
  /** Session duration (seconds) */
  duration: number;
  
  /** Played track list */
  tracks: ListeningSessionTrack[];
  
  /** User state at session start */
  initialState: UserState;
  
  /** User state at session end */
  finalState?: UserState;
  
  /** State changes during session */
  stateChanges: UserState[];
  
  /** Session statistics */
  stats: {
    /** Total tracks played */
    totalTracks: number;
    
    /** Completed tracks count */
    completedTracks: number;
    
    /** Skipped tracks count */
    skippedTracks: number;
    
    /** Average heart rate */
    avgHeartRate: number;
    
    /** Average MWL */
    avgMWL: number;
    
    /** State improvement indicator (-1 to 1, negative means deterioration) */
    stateImprovement: number;
  };
  
  /** Session type */
  sessionType: 'manual' | 'auto' | 'recommended';
  
  /** Session tags */
  tags?: string[];
  
  /** User notes */
  notes?: string;
  
  /** Is completed (user actively ended) */
  isCompleted: boolean;
}

/**
 * Listening Session Track Record
 */
export interface ListeningSessionTrack {
  /** Track ID */
  trackId: UUID;
  
  /** Track info snapshot (prevents data loss if track is deleted) */
  trackSnapshot: {
    title: string;
    artist?: string;
    bpm: number | null;
    duration: number;
  };
  
  /** Playback start time */
  startTime: Timestamp;
  
  /** Playback end time */
  endTime?: Timestamp;
  
  /** Actual played duration (seconds) */
  playedDuration: number;
  
  /** Was completed */
  wasCompleted: boolean;
  
  /** Was skipped */
  wasSkipped: boolean;
  
  /** Skip reason (if skipped) */
  skipReason?: 'user' | 'state_change' | 'error';
  
  /** User state during playback */
  userState: UserStateType;
  
  /** User feedback */
  feedback?: {
    /** Liked/disliked */
    liked: boolean;
    
    /** Feedback time */
    timestamp: Timestamp;
    
    /** Feedback comment */
    comment?: string;
  };
}

/**
 * Listening History Summary
 * Used for quick viewing and analyzing user's listening patterns
 */
export interface ListeningHistorySummary {
  /** Total listening time (seconds) */
  totalListeningTime: number;
  
  /** Total sessions count */
  totalSessions: number;
  
  /** Total tracks played count */
  totalTracksPlayed: number;
  
  /** Most played tracks (Top 10) */
  topTracks: Array<{
    trackId: UUID;
    title: string;
    playCount: number;
  }>;
  
  /** Most common state */
  dominantState: UserStateType;
  
  /** State distribution */
  stateDistribution: {
    [K in UserStateType]: {
      count: number;
      percentage: number;
      avgDuration: number;
    };
  };
  
  /** Average biometric data */
  avgBiometric: {
    heartRate: number;
    mwl: number;
  };
  
  /** Statistics time range */
  timeRange: {
    start: Timestamp;
    end: Timestamp;
  };
  
  /** Last updated time */
  lastUpdated: Timestamp;
}

/**
 * Local Storage Key Constants
 * Used for localStorage and IndexedDB
 */
export const STORAGE_KEYS = {
  MUSIC_TRACKS: 'muse_music_tracks',
  USER_PREFERENCE: 'muse_user_preference',
  USER_STATES: 'muse_user_states',
  LISTENING_SESSIONS: 'muse_listening_sessions',
  LISTENING_HISTORY: 'muse_listening_history',
  CURRENT_SESSION: 'muse_current_session',
  APP_VERSION: 'muse_app_version',
} as const;

/**
 * IndexedDB Database Configuration
 */
export const INDEXEDDB_CONFIG = {
  DATABASE_NAME: 'muse_db',
  VERSION: 1,
  STORES: {
    MUSIC_TRACKS: 'music_tracks',
    AUDIO_FILES: 'audio_files',
    USER_STATES: 'user_states',
    LISTENING_SESSIONS: 'listening_sessions',
    BIOMETRIC_DATA: 'biometric_data',
  },
} as const;

/**
 * Serialization Helper Type
 * Ensures all types can be serialized to JSON
 */
export type Serializable<T> = {
  [K in keyof T]: T[K] extends Function
    ? never
    : T[K] extends object
    ? Serializable<T[K]>
    : T[K];
};

/**
 * Validate if object is serializable
 */
export function isSerializable<T>(obj: T): obj is Serializable<T> {
  try {
    JSON.stringify(obj);
    return true;
  } catch {
    return false;
  }
}

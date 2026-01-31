/**
 * User Preference Type Definitions
 * Corresponds to PRD Section 3.1.6: Music Style Preference Settings
 */

import { MusicGenre } from './music';
import { UserStateType } from './state';
import { Timestamp, UUID } from './common';

/**
 * Music Genre Preference Weight
 */
export interface GenrePreference {
  /** Music genre */
  genre: MusicGenre;
  
  /** Preference weight (0-1) */
  weight: number;
}

/**
 * State-Music Genre Mapping
 * Corresponds to PRD Section 3.5 Recommendation Strategy
 */
export interface StateMusicMapping {
  /** State type */
  state: UserStateType;
  
  /** Preferred music genres list */
  preferredGenres: MusicGenre[];
  
  /** Volume preference (dB, optional) */
  volumePreference?: number;
}

/**
 * Time of Day Preference
 */
export enum TimeOfDay {
  MORNING = 'morning',       // Morning 06:00-12:00
  AFTERNOON = 'afternoon',   // Afternoon 12:00-18:00
  EVENING = 'evening',       // Evening 18:00-22:00
  NIGHT = 'night'            // Night 22:00-06:00
}

/**
 * User Preference Settings
 */
export interface UserPreferences {
  /** User ID */
  userId?: string;
  
  /** Music genre preferences */
  genrePreferences: GenrePreference[];
  
  /** State-music mappings */
  stateMusicMappings: StateMusicMapping[];
  
  /** Time of day preferences */
  timePreferences?: Record<TimeOfDay, MusicGenre[]>;
  
  /** Weekday/weekend preference differences */
  weekdayPreferences?: MusicGenre[];
  weekendPreferences?: MusicGenre[];
  
  /** Default volume (0-100) */
  defaultVolume: number;
  
  /** Enable auto-play */
  autoPlayEnabled: boolean;
  
  /** Enable state notifications */
  stateNotificationEnabled: boolean;
  
  /** Last update time */
  updatedAt: Timestamp;
}

/**
 * Music Feedback
 * Used for personalized learning
 */
export interface MusicFeedback {
  /** Feedback ID */
  id: UUID;
  
  /** Music ID */
  musicId: UUID;
  
  /** User state (at feedback time) */
  state: UserStateType;
  
  /** Feedback type */
  feedbackType: 'like' | 'dislike' | 'skip';
  
  /** Play duration (seconds) */
  playDuration: number;
  
  /** Feedback time */
  timestamp: Timestamp;
}

/**
 * Recommendation Preference Settings
 */
export interface RecommendationPreferences {
  /** BPM match strictness (0-1, 0 is most lenient) */
  bpmMatchStrictness: number;
  
  /** Allow repeat recommendations */
  allowRepeat: boolean;
  
  /** Minimum repeat recommendation interval (minutes) */
  repeatInterval: number;
  
  /** Consider play history */
  considerHistory: boolean;
  
  /** Consider time of day preferences */
  considerTimeOfDay: boolean;
  
  /** Enable learning algorithm */
  enableLearning: boolean;
}

/**
 * Complete User Configuration
 */
export interface UserConfiguration {
  /** User preferences */
  preferences: UserPreferences;
  
  /** Recommendation preferences */
  recommendationPreferences: RecommendationPreferences;
  
  /** Creation time */
  createdAt: Timestamp;
  
  /** Last update time */
  updatedAt: Timestamp;
}

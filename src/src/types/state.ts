/**
 * State Classification Type Definitions
 * Corresponds to PRD Section 3.4: State Classification Algorithm
 */

import { Timestamp } from './common';

/**
 * User State Types
 * Corresponds to PRD Section 3.4 State Classification Table
 */
export enum UserStateType {
  STRESSED = 'stressed',       // Stressed/Anxious
  CALM = 'calm',               // Calm
  PRODUCTIVE = 'productive',   // Productive
  DISTRACTED = 'distracted'    // Distracted
}

/**
 * Type alias for backward compatibility
 * (Used by useAppStore)
 */
export type StateType = UserStateType;

/**
 * State Label Mappings
 */
export const STATE_LABELS: Record<UserStateType, string> = {
  [UserStateType.STRESSED]: 'Stressed',
  [UserStateType.CALM]: 'Calm',
  [UserStateType.PRODUCTIVE]: 'Productive',
  [UserStateType.DISTRACTED]: 'Distracted'
};

/**
 * State Color Mappings (Corresponds to PRD Section 5.2 Design Specifications)
 */
export const STATE_COLORS: Record<UserStateType, string> = {
  [UserStateType.STRESSED]: '#F44336',   // Red
  [UserStateType.CALM]: '#4CAF50',       // Green
  [UserStateType.PRODUCTIVE]: '#2196F3', // Blue
  [UserStateType.DISTRACTED]: '#FFC107'  // Yellow
};

/**
 * State Classification Input
 * Corresponds to PRD Section 3.4 Algorithm Implementation
 */
export interface StateClassificationInput {
  /** Current heart rate */
  heartRate: number;
  
  /** Heart rate baseline */
  heartRateBaseline: number;
  
  /** Current MWL index */
  mwlIndex: number;
  
  /** MWL baseline */
  mwlBaseline: number;
  
  /** HRV metric (optional) */
  hrVariability?: number;
  
  /** Dominant brain region (optional) */
  dominantRegion?: string;
}

/**
 * State Classification Output
 * Corresponds to PRD Section 3.4 Algorithm Implementation
 */
export interface StateClassificationOutput {
  /** State type */
  state: UserStateType;
  
  /** Confidence (0-1) */
  confidence: number;
  
  /** Classification reasoning */
  reasoning: string;
  
  /** Timestamp */
  timestamp: Timestamp;
}

/**
 * State Change Event
 */
export interface StateChangeEvent {
  /** Previous state */
  previousState: UserStateType;
  
  /** Current state */
  currentState: UserStateType;
  
  /** State duration (milliseconds) */
  duration: number;
  
  /** Change timestamp */
  timestamp: Timestamp;
  
  /** Confidence */
  confidence: number;
}

/**
 * State History Entry
 */
export interface StateHistoryEntry {
  /** State type */
  state: UserStateType;
  
  /** Start time */
  startTime: Timestamp;
  
  /** End time */
  endTime: Timestamp;
  
  /** Duration (seconds) */
  duration: number;
  
  /** Average confidence */
  avgConfidence: number;
}

/**
 * State History (for database storage)
 * Extends StateHistoryEntry with an ID field
 */
export interface StateHistory extends StateHistoryEntry {
  /** Unique identifier */
  id: string;
}

/**
 * State Statistics
 * Corresponds to PRD Section 3.1.8: Work State Tracking and Visualization
 */
export interface StateStatistics {
  /** Statistics time range */
  timeRange: {
    start: Timestamp;
    end: Timestamp;
  };
  
  /** Duration distribution per state (seconds) */
  stateDurations: Record<UserStateType, number>;
  
  /** Percentage per state (%) */
  statePercentages: Record<UserStateType, number>;
  
  /** State transition count */
  transitionCount: number;
  
  /** Most common state */
  dominantState: UserStateType;
  
  /** Stress peak periods */
  stressPeaks: Timestamp[];
}

/**
 * State Classification Thresholds
 */
export interface StateClassificationThresholds {
  /** Heart rate deviation thresholds */
  heartRate: {
    high: number;      // How much above baseline is considered "high"
    low: number;       // How much below baseline is considered "low"
  };
  
  /** MWL deviation thresholds */
  mwl: {
    high: number;      // High MWL threshold
    low: number;       // Low MWL threshold
    excessive: number; // Excessive MWL threshold
  };
  
  /** State confirmation window (seconds) */
  confirmationWindow: number;
  
  /** Minimum confidence threshold */
  minConfidence: number;
}

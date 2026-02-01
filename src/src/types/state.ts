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
 * State Color Mappings (Warm Design System)
 * - Stressed: Coral #E07A5F
 * - Calm: Sage Green #81B29A
 * - Productive: Soft Blue #A8DADC
 * - Distracted: Orange #F4A261
 */
export const STATE_COLORS: Record<UserStateType, string> = {
  [UserStateType.STRESSED]: '#E07A5F',   // Coral
  [UserStateType.CALM]: '#81B29A',       // Sage Green
  [UserStateType.PRODUCTIVE]: '#A8DADC', // Soft Blue
  [UserStateType.DISTRACTED]: '#F4A261'  // Orange
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
 * State History Metrics (optional snapshot of metrics at state detection)
 */
export interface StateHistoryMetrics {
  heartRate: number;
  mwlIndex: number;
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
  
  /** Metrics snapshot (optional) */
  metrics?: StateHistoryMetrics;
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

/**
 * Biometric Data Type Definitions
 * Corresponds to PRD Section 3.2 (MWL Data) and Section 3.3 (Heart Rate Data)
 */

import { Timestamp, DataPoint, SignalQuality } from './common';

/**
 * Heart Rate Data
 * Corresponds to PRD Section 3.3: Real HR Signal Reception
 */
export interface HeartRateData {
  /** Timestamp */
  timestamp: Timestamp;
  
  /** Heart rate (bpm) */
  heartRate: number;
  
  /** Signal quality (0-1) */
  signalQuality: number;
  
  /** RR interval (milliseconds, optional) */
  rrInterval?: number;
}

/**
 * Heart Rate Variability (HRV) Metrics
 */
export interface HRVMetrics {
  /** RMSSD (Root Mean Square of Successive Differences) */
  rmssd: number;
  
  /** SDNN (Standard Deviation of NN intervals) */
  sdnn: number;
  
  /** High Frequency Power (HF) */
  hf?: number;
  
  /** Low Frequency Power (LF) */
  lf?: number;
  
  /** LF/HF Ratio */
  lfHfRatio?: number;
}

/**
 * Brain Region Type
 * Corresponds to PRD Section 3.2: Simulated fNIRS Brain Regions
 */
export enum BrainRegion {
  LEFT_PFC = 'leftPFC',     // Left Prefrontal Cortex
  RIGHT_PFC = 'rightPFC',   // Right Prefrontal Cortex
  M_PFC = 'mPFC',           // Medial Prefrontal Cortex
  VL_PFC = 'vlPFC'          // Ventrolateral Prefrontal Cortex
}

/**
 * MWL Data
 * Corresponds to PRD Section 3.2: Simulated MWL Data Reception
 */
export interface MWLData {
  /** Timestamp */
  timestamp: Timestamp;
  
  /** MWL index (0-1) */
  mwlIndex: number;
  
  /** Simulated HbO₂ concentration change */
  hbO2Level: number;
  
  /** Brain region */
  region: BrainRegion;
  
  /** Signal quality (0-1) */
  signalQuality: number;
}

/**
 * Biometric Data Baseline
 */
export interface BiometricBaseline {
  /** User ID */
  userId?: string;
  
  /** Baseline heart rate */
  baselineHeartRate: number;
  
  /** Baseline MWL */
  baselineMWL: number;
  
  /** Calculation time */
  calculatedAt: Timestamp;
  
  /** Sample count */
  sampleCount: number;
}

/**
 * Real-time Biometric Data Snapshot
 */
export interface BiometricSnapshot {
  /** Timestamp */
  timestamp: Timestamp;
  
  /** Current heart rate */
  currentHeartRate: number;
  
  /** Current MWL */
  currentMWL: number;
  
  /** HRV metrics (if available) */
  hrv?: HRVMetrics;
  
  /** Heart rate trend (relative to baseline) */
  heartRateTrend: 'increasing' | 'stable' | 'decreasing';
  
  /** MWL trend (relative to baseline) */
  mwlTrend: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Biometric Data History
 */
export interface BiometricHistory {
  /** Time range */
  timeRange: {
    start: Timestamp;
    end: Timestamp;
  };
  
  /** Heart rate data series */
  heartRateData: DataPoint<number>[];
  
  /** MWL data series */
  mwlData: DataPoint<number>[];
  
  /** Average heart rate */
  avgHeartRate: number;
  
  /** Average MWL */
  avgMWL: number;
}

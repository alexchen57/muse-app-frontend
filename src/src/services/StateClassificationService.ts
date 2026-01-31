/**
 * State Classification Service
 * Corresponds to PRD Section 3.4: State Classification Algorithm
 * 
 * Responsibilities:
 * - State classification based on HR and MWL data
 * - Multimodal fusion algorithm
 * - State change detection
 */

import { 
  StateClassificationInput, 
  StateClassificationOutput,
  StateClassificationThresholds,
  UserStateType,
  StateChangeEvent
} from '../types/state';
import { BiometricBaseline } from '../types/biometric';

/**
 * State Classification Service Interface
 */
export interface IStateClassificationService {
  /**
   * Classify current user state
   * @param input - State classification input data
   * @returns State classification result
   */
  classifyState(input: StateClassificationInput): StateClassificationOutput;
  
  /**
   * Batch classify states (for historical data analysis)
   * @param inputs - Array of state classification inputs
   * @returns Array of state classification results
   */
  batchClassify(inputs: StateClassificationInput[]): StateClassificationOutput[];
  
  /**
   * Detect state change
   * @param previousState - Previous state
   * @param currentState - Current state
   * @param duration - Duration of previous state
   * @returns State change event, null if no change
   */
  detectStateChange(
    previousState: UserStateType,
    currentState: UserStateType,
    duration: number
  ): StateChangeEvent | null;
  
  /**
   * Calculate biometric data baseline
   * @param heartRateData - Heart rate data array
   * @param mwlData - MWL data array
   * @returns Biometric data baseline
   */
  calculateBaseline(
    heartRateData: number[],
    mwlData: number[]
  ): BiometricBaseline;
  
  /**
   * Update classification thresholds
   * @param thresholds - New threshold configuration
   */
  updateThresholds(thresholds: Partial<StateClassificationThresholds>): void;
  
  /**
   * Get current threshold configuration
   * @returns Current threshold configuration
   */
  getThresholds(): StateClassificationThresholds;
}

/**
 * Default State Classification Thresholds
 * Based on PRD Section 3.4 classification rules
 */
export const DEFAULT_STATE_THRESHOLDS: StateClassificationThresholds = {
  heartRate: {
    high: 15,   // 15 bpm above baseline
    low: -10    // 10 bpm below baseline
  },
  mwl: {
    high: 0.65,      // MWL > 0.65 considered high
    low: 0.35,       // MWL < 0.35 considered low
    excessive: 0.80  // MWL > 0.80 considered excessive
  },
  confirmationWindow: 30,  // 30 second confirmation window
  minConfidence: 0.60      // Minimum 60% confidence
};

/**
 * Classification thresholds based on deviation from baseline
 * Used in the rule-based classifier per PRD 3.4
 */
interface DeviationThresholds {
  hrDeviationHigh: number;      // HR deviation threshold for stressed
  hrDeviationLow: number;       // HR deviation threshold for calm
  mwlDeviationHigh: number;     // MWL deviation threshold for stressed
  mwlDeviationLow: number;      // MWL deviation threshold for calm
  mwlDeviationModerate: number; // MWL deviation threshold for productive
  hrStableRange: number;        // Range within which HR is considered stable
}

const DEFAULT_DEVIATION_THRESHOLDS: DeviationThresholds = {
  hrDeviationHigh: 0.15,     // 15% above baseline -> stressed
  hrDeviationLow: -0.10,     // 10% below baseline -> calm
  mwlDeviationHigh: 0.20,    // MWL 0.2 above baseline -> stressed
  mwlDeviationLow: -0.15,    // MWL 0.15 below baseline -> calm
  mwlDeviationModerate: 0.10, // MWL 0.1 above baseline -> productive
  hrStableRange: 0.10        // HR within ±10% is considered stable
};

/**
 * State Classification Service Implementation
 * Implements rule-based classifier per PRD Section 3.4
 */
export class StateClassificationService implements IStateClassificationService {
  private thresholds: StateClassificationThresholds;
  private deviationThresholds: DeviationThresholds;
  
  // Sliding window for state confirmation (stores recent classifications)
  private recentClassifications: Array<{
    state: UserStateType;
    timestamp: number;
  }> = [];
  
  constructor(
    thresholds?: Partial<StateClassificationThresholds>,
    deviationThresholds?: Partial<DeviationThresholds>
  ) {
    this.thresholds = { ...DEFAULT_STATE_THRESHOLDS, ...thresholds };
    this.deviationThresholds = { ...DEFAULT_DEVIATION_THRESHOLDS, ...deviationThresholds };
  }
  
  /**
   * Classify current user state using rule-based algorithm
   * @param input - State classification input data
   * @returns State classification result
   */
  classifyState(input: StateClassificationInput): StateClassificationOutput {
    const timestamp = Date.now();
    
    // Step 1: Preprocessing - Calculate deviations
    const hrDeviation = this.calculateHeartRateDeviation(
      input.heartRate, 
      input.heartRateBaseline
    );
    const mwlDeviation = this.calculateMWLDeviation(
      input.mwlIndex, 
      input.mwlBaseline
    );
    
    // Step 2: Rule-based classification
    const { state, confidence, reasoning } = this.applyClassificationRules(
      hrDeviation,
      mwlDeviation,
      input
    );
    
    // Step 3: Add to recent classifications for state persistence
    this.addToRecentClassifications(state, timestamp);
    
    // Step 4: Apply state persistence confirmation
    const confirmedState = this.confirmStateWithPersistence(state, timestamp);
    const adjustedConfidence = confirmedState === state 
      ? confidence 
      : confidence * 0.9; // Reduce confidence if state differs from persistent
    
    return {
      state: confirmedState,
      confidence: Math.max(this.thresholds.minConfidence, adjustedConfidence),
      reasoning,
      timestamp
    };
  }
  
  /**
   * Batch classify states for historical data analysis
   * @param inputs - Array of state classification inputs
   * @returns Array of state classification results
   */
  batchClassify(inputs: StateClassificationInput[]): StateClassificationOutput[] {
    // Clear recent classifications for fresh batch analysis
    this.recentClassifications = [];
    
    return inputs.map(input => this.classifyState(input));
  }
  
  /**
   * Detect state change event
   * @param previousState - Previous state
   * @param currentState - Current state
   * @param duration - Duration of previous state in milliseconds
   * @returns State change event, or null if no change
   */
  detectStateChange(
    previousState: UserStateType,
    currentState: UserStateType,
    duration: number
  ): StateChangeEvent | null {
    if (previousState === currentState) {
      return null;
    }
    
    // Only trigger state change if duration exceeds confirmation window
    const confirmationMs = this.thresholds.confirmationWindow * 1000;
    if (duration < confirmationMs) {
      return null;
    }
    
    return {
      previousState,
      currentState,
      duration,
      timestamp: Date.now(),
      confidence: this.calculateTransitionConfidence(previousState, currentState)
    };
  }
  
  /**
   * Calculate biometric baseline from data arrays
   * @param heartRateData - Heart rate data array
   * @param mwlData - MWL data array
   * @returns Calculated baseline
   */
  calculateBaseline(
    heartRateData: number[],
    mwlData: number[]
  ): BiometricBaseline {
    const sampleCount = Math.min(heartRateData.length, mwlData.length);
    
    // Calculate baseline as mean of data (excluding outliers)
    const baselineHeartRate = this.calculateRobustMean(heartRateData);
    const baselineMWL = this.calculateRobustMean(mwlData);
    
    return {
      baselineHeartRate,
      baselineMWL,
      calculatedAt: Date.now(),
      sampleCount
    };
  }
  
  /**
   * Update classification thresholds
   * @param thresholds - Partial threshold configuration to update
   */
  updateThresholds(thresholds: Partial<StateClassificationThresholds>): void {
    this.thresholds = {
      ...this.thresholds,
      ...thresholds,
      heartRate: { ...this.thresholds.heartRate, ...thresholds.heartRate },
      mwl: { ...this.thresholds.mwl, ...thresholds.mwl }
    };
  }
  
  /**
   * Get current threshold configuration
   * @returns Current thresholds
   */
  getThresholds(): StateClassificationThresholds {
    return { ...this.thresholds };
  }
  
  // ============ Private Helper Methods ============
  
  /**
   * Calculate heart rate deviation from baseline (normalized)
   */
  private calculateHeartRateDeviation(currentHR: number, baselineHR: number): number {
    if (baselineHR <= 0) {
      return 0;
    }
    return (currentHR - baselineHR) / baselineHR;
  }
  
  /**
   * Calculate MWL deviation from baseline
   */
  private calculateMWLDeviation(currentMWL: number, baselineMWL: number): number {
    return currentMWL - baselineMWL;
  }
  
  /**
   * Apply rule-based classification logic per PRD 3.4
   */
  private applyClassificationRules(
    hrDeviation: number,
    mwlDeviation: number,
    input: StateClassificationInput
  ): { state: UserStateType; confidence: number; reasoning: string } {
    const dt = this.deviationThresholds;
    
    // Rule 1: STRESSED - High HR deviation AND high MWL deviation
    // Condition: hrDeviation > 0.15 && mwlDeviation > 0.2
    if (hrDeviation > dt.hrDeviationHigh && mwlDeviation > dt.mwlDeviationHigh) {
      const confidence = this.calculateConfidence(
        hrDeviation, dt.hrDeviationHigh,
        mwlDeviation, dt.mwlDeviationHigh,
        0.80, 0.95
      );
      return {
        state: UserStateType.STRESSED,
        confidence,
        reasoning: `心率偏离基线 ${(hrDeviation * 100).toFixed(1)}% (阈值>${(dt.hrDeviationHigh * 100).toFixed(0)}%)，` +
                   `MWL偏离 ${mwlDeviation.toFixed(2)} (阈值>${dt.mwlDeviationHigh.toFixed(2)})，` +
                   `符合压力状态特征`
      };
    }
    
    // Rule 2: CALM - Low HR deviation AND low MWL deviation
    // Condition: hrDeviation < -0.1 && mwlDeviation < -0.15
    if (hrDeviation < dt.hrDeviationLow && mwlDeviation < dt.mwlDeviationLow) {
      const confidence = this.calculateConfidence(
        Math.abs(hrDeviation), Math.abs(dt.hrDeviationLow),
        Math.abs(mwlDeviation), Math.abs(dt.mwlDeviationLow),
        0.80, 0.95
      );
      return {
        state: UserStateType.CALM,
        confidence,
        reasoning: `心率偏离基线 ${(hrDeviation * 100).toFixed(1)}% (阈值<${(dt.hrDeviationLow * 100).toFixed(0)}%)，` +
                   `MWL偏离 ${mwlDeviation.toFixed(2)} (阈值<${dt.mwlDeviationLow.toFixed(2)})，` +
                   `符合平静状态特征`
      };
    }
    
    // Rule 3: PRODUCTIVE - Moderate MWL deviation AND stable HR
    // Condition: mwlDeviation > 0.1 && abs(hrDeviation) < 0.1
    if (mwlDeviation > dt.mwlDeviationModerate && 
        Math.abs(hrDeviation) < dt.hrStableRange) {
      const confidence = this.calculateProductiveConfidence(
        hrDeviation,
        mwlDeviation,
        dt
      );
      return {
        state: UserStateType.PRODUCTIVE,
        confidence,
        reasoning: `MWL偏离 ${mwlDeviation.toFixed(2)} (阈值>${dt.mwlDeviationModerate.toFixed(2)})，` +
                   `心率稳定 (偏离 ${(hrDeviation * 100).toFixed(1)}%，在 ±${(dt.hrStableRange * 100).toFixed(0)}% 范围内)，` +
                   `符合专注高效状态特征`
      };
    }
    
    // Rule 4: DISTRACTED - Default state when no other rules match
    const confidence = this.calculateDistractedConfidence(hrDeviation, mwlDeviation, dt);
    return {
      state: UserStateType.DISTRACTED,
      confidence,
      reasoning: `心率偏离 ${(hrDeviation * 100).toFixed(1)}%，MWL偏离 ${mwlDeviation.toFixed(2)}，` +
                 `不满足其他状态判定规则，判定为分心/游离状态`
    };
  }
  
  /**
   * Calculate confidence score for stressed/calm states
   */
  private calculateConfidence(
    hrDeviation: number,
    hrThreshold: number,
    mwlDeviation: number,
    mwlThreshold: number,
    minConfidence: number,
    maxConfidence: number
  ): number {
    // Confidence increases as deviations exceed thresholds
    const hrExcess = Math.min(hrDeviation / hrThreshold, 2.0);
    const mwlExcess = Math.min(mwlDeviation / mwlThreshold, 2.0);
    
    // Weighted average with HR weighted slightly more
    const combinedExcess = hrExcess * 0.55 + mwlExcess * 0.45;
    
    // Map combined excess to confidence range
    const confidence = minConfidence + (maxConfidence - minConfidence) * 
                       Math.min(combinedExcess - 1.0, 1.0);
    
    return Math.max(minConfidence, Math.min(maxConfidence, confidence));
  }
  
  /**
   * Calculate confidence score for productive state
   */
  private calculateProductiveConfidence(
    hrDeviation: number,
    mwlDeviation: number,
    dt: DeviationThresholds
  ): number {
    // Higher confidence when:
    // - MWL is in optimal range (0.55-0.75)
    // - HR is very stable (close to 0 deviation)
    
    const hrStability = 1.0 - Math.abs(hrDeviation) / dt.hrStableRange;
    const mwlOptimality = Math.min(mwlDeviation / dt.mwlDeviationModerate, 1.5);
    
    // Optimal MWL range bonus
    const optimalMWLBonus = (mwlDeviation >= 0.10 && mwlDeviation <= 0.30) ? 0.10 : 0;
    
    const confidence = 0.75 + hrStability * 0.10 + mwlOptimality * 0.05 + optimalMWLBonus;
    
    return Math.max(0.70, Math.min(0.90, confidence));
  }
  
  /**
   * Calculate confidence score for distracted state
   */
  private calculateDistractedConfidence(
    hrDeviation: number,
    mwlDeviation: number,
    dt: DeviationThresholds
  ): number {
    // Base confidence for distracted state
    let confidence = 0.60;
    
    // Increase confidence if indicators show fluctuation patterns
    // (moderate deviations that don't fit other patterns)
    const hrModerate = Math.abs(hrDeviation) > 0.05 && Math.abs(hrDeviation) < dt.hrDeviationHigh;
    const mwlModerate = Math.abs(mwlDeviation) > 0.05 && mwlDeviation < dt.mwlDeviationModerate;
    
    if (hrModerate) confidence += 0.08;
    if (mwlModerate) confidence += 0.07;
    
    return Math.max(0.55, Math.min(0.75, confidence));
  }
  
  /**
   * Add classification to recent history for persistence checking
   */
  private addToRecentClassifications(state: UserStateType, timestamp: number): void {
    // Remove old entries outside confirmation window
    const windowMs = this.thresholds.confirmationWindow * 1000;
    const cutoff = timestamp - windowMs;
    
    this.recentClassifications = this.recentClassifications.filter(
      entry => entry.timestamp >= cutoff
    );
    
    // Add new entry
    this.recentClassifications.push({ state, timestamp });
    
    // Limit array size
    if (this.recentClassifications.length > 100) {
      this.recentClassifications = this.recentClassifications.slice(-100);
    }
  }
  
  /**
   * Confirm state using persistence (majority voting in window)
   */
  private confirmStateWithPersistence(
    currentState: UserStateType,
    timestamp: number
  ): UserStateType {
    if (this.recentClassifications.length < 3) {
      return currentState;
    }
    
    // Count state occurrences in window
    const stateCounts = new Map<UserStateType, number>();
    
    for (const entry of this.recentClassifications) {
      const count = stateCounts.get(entry.state) || 0;
      stateCounts.set(entry.state, count + 1);
    }
    
    // Find most frequent state
    let maxCount = 0;
    let dominantState = currentState;
    
    for (const [state, count] of stateCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        dominantState = state;
      }
    }
    
    // Return dominant state if it has clear majority (>50%)
    const threshold = this.recentClassifications.length * 0.5;
    if (maxCount > threshold) {
      return dominantState;
    }
    
    return currentState;
  }
  
  /**
   * Calculate transition confidence between states
   */
  private calculateTransitionConfidence(
    previousState: UserStateType,
    currentState: UserStateType
  ): number {
    // Define typical transition patterns and their confidence
    const transitionConfidence: Record<string, number> = {
      // Natural transitions (higher confidence)
      [`${UserStateType.PRODUCTIVE}-${UserStateType.CALM}`]: 0.85,
      [`${UserStateType.CALM}-${UserStateType.PRODUCTIVE}`]: 0.85,
      [`${UserStateType.DISTRACTED}-${UserStateType.PRODUCTIVE}`]: 0.80,
      [`${UserStateType.DISTRACTED}-${UserStateType.CALM}`]: 0.80,
      
      // Stress-related transitions
      [`${UserStateType.PRODUCTIVE}-${UserStateType.STRESSED}`]: 0.75,
      [`${UserStateType.CALM}-${UserStateType.STRESSED}`]: 0.70,
      [`${UserStateType.STRESSED}-${UserStateType.CALM}`]: 0.80,
      [`${UserStateType.STRESSED}-${UserStateType.DISTRACTED}`]: 0.75,
      
      // Other transitions
      [`${UserStateType.PRODUCTIVE}-${UserStateType.DISTRACTED}`]: 0.70,
      [`${UserStateType.CALM}-${UserStateType.DISTRACTED}`]: 0.70,
      [`${UserStateType.DISTRACTED}-${UserStateType.STRESSED}`]: 0.70,
      [`${UserStateType.STRESSED}-${UserStateType.PRODUCTIVE}`]: 0.65
    };
    
    const key = `${previousState}-${currentState}`;
    return transitionConfidence[key] || 0.65;
  }
  
  /**
   * Calculate robust mean (excluding outliers using IQR method)
   */
  private calculateRobustMean(data: number[]): number {
    if (data.length === 0) return 0;
    if (data.length < 4) {
      return data.reduce((a, b) => a + b, 0) / data.length;
    }
    
    // Sort data
    const sorted = [...data].sort((a, b) => a - b);
    
    // Calculate quartiles
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    // Filter outliers (values outside Q1-1.5*IQR to Q3+1.5*IQR)
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const filtered = sorted.filter(v => v >= lowerBound && v <= upperBound);
    
    // Return mean of filtered data
    if (filtered.length === 0) {
      return sorted[Math.floor(sorted.length / 2)]; // Return median if all filtered
    }
    
    return filtered.reduce((a, b) => a + b, 0) / filtered.length;
  }
}

// Create singleton instance for convenience
export const stateClassificationService = new StateClassificationService();

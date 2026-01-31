/**
 * Heart Rate Data Simulator
 * Corresponds to PRD Section 3.3: Real HR Signal Reception
 * 
 * Responsibilities:
 * - Generate simulated heart rate data (for development and demo)
 * - Simulate heart rate patterns for different states
 */

import { HeartRateData } from '../types/biometric';
import { UserStateType } from '../types/state';

/**
 * Heart Rate Simulator Interface
 */
export interface IHeartRateSimulator {
  /**
   * Start heart rate data simulation
   * @param callback - Data callback function
   * @param frequency - Data generation frequency (Hz)
   */
  start(callback: (data: HeartRateData) => void, frequency?: number): void;
  
  /**
   * Stop heart rate data simulation
   */
  stop(): void;
  
  /**
   * Set simulated state (affects generated heart rate pattern)
   * @param state - Target state
   */
  setSimulatedState(state: UserStateType): void;
  
  /**
   * Set baseline heart rate
   * @param baseline - Baseline heart rate (bpm)
   */
  setBaseline(baseline: number): void;
  
  /**
   * Generate single heart rate data point
   * @returns Heart rate data
   */
  generateDataPoint(): HeartRateData;
  
  /**
   * Whether simulator is running
   */
  isRunning(): boolean;
}

/**
 * Heart Rate Simulator Configuration
 */
export interface HeartRateSimulatorConfig {
  /** Baseline heart rate */
  baselineHeartRate: number;
  
  /** Data generation frequency (Hz) */
  frequency: number;
  
  /** Initial state */
  initialState: UserStateType;
  
  /** Add noise */
  addNoise: boolean;
  
  /** Noise level */
  noiseLevel: number;
  
  /** Signal quality */
  signalQuality: number;
}

/**
 * Default Heart Rate Simulator Configuration
 */
export const DEFAULT_HR_SIMULATOR_CONFIG: HeartRateSimulatorConfig = {
  baselineHeartRate: 75,
  frequency: 1,
  initialState: UserStateType.CALM,
  addNoise: true,
  noiseLevel: 0.1,
  signalQuality: 0.95
};

/**
 * State-specific heart rate configuration
 * Based on PRD Section 3.4 State Classification Rules
 */
interface StateHeartRateConfig {
  minBPM: number;
  maxBPM: number;
  variability: number; // Standard deviation for noise
}

const STATE_HR_CONFIGS: Record<UserStateType, StateHeartRateConfig> = {
  [UserStateType.STRESSED]: {
    minBPM: 85,
    maxBPM: 100,
    variability: 5, // High variability
  },
  [UserStateType.CALM]: {
    minBPM: 60,
    maxBPM: 70,
    variability: 2, // Low variability
  },
  [UserStateType.PRODUCTIVE]: {
    minBPM: 70,
    maxBPM: 85,
    variability: 3, // Moderate variability
  },
  [UserStateType.DISTRACTED]: {
    minBPM: 65,
    maxBPM: 80,
    variability: 4, // High fluctuation
  },
};

/**
 * Heart Rate Simulator Implementation
 * Generates realistic simulated heart rate data based on user state
 */
export class HeartRateSimulator implements IHeartRateSimulator {
  private config: HeartRateSimulatorConfig;
  private currentState: UserStateType;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private callback: ((data: HeartRateData) => void) | null = null;
  
  // For smooth state transitions
  private targetHeartRate: number;
  private currentHeartRate: number;
  private readonly transitionSpeed: number = 0.1; // Interpolation factor per tick
  
  // For generating realistic RR intervals
  private lastRRInterval: number = 800; // ~75 bpm baseline

  constructor(config: Partial<HeartRateSimulatorConfig> = {}) {
    this.config = { ...DEFAULT_HR_SIMULATOR_CONFIG, ...config };
    this.currentState = this.config.initialState;
    this.currentHeartRate = this.config.baselineHeartRate;
    this.targetHeartRate = this.getTargetHeartRateForState(this.currentState);
  }

  /**
   * Start heart rate data simulation
   */
  start(callback: (data: HeartRateData) => void, frequency?: number): void {
    if (this.intervalId) {
      this.stop();
    }

    this.callback = callback;
    const freq = frequency ?? this.config.frequency;
    const intervalMs = Math.round(1000 / freq);

    this.intervalId = setInterval(() => {
      const data = this.generateDataPoint();
      if (this.callback) {
        this.callback(data);
      }
    }, intervalMs);
  }

  /**
   * Stop heart rate data simulation
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.callback = null;
  }

  /**
   * Set simulated state (affects generated heart rate pattern)
   */
  setSimulatedState(state: UserStateType): void {
    this.currentState = state;
    this.targetHeartRate = this.getTargetHeartRateForState(state);
  }

  /**
   * Set baseline heart rate
   */
  setBaseline(baseline: number): void {
    this.config.baselineHeartRate = baseline;
  }

  /**
   * Generate single heart rate data point
   */
  generateDataPoint(): HeartRateData {
    // Smooth transition towards target heart rate
    this.currentHeartRate = this.interpolate(
      this.currentHeartRate,
      this.targetHeartRate,
      this.transitionSpeed
    );

    // Add Gaussian noise if enabled
    let heartRate = this.currentHeartRate;
    if (this.config.addNoise) {
      const stateConfig = STATE_HR_CONFIGS[this.currentState];
      const noise = this.gaussianNoise(0, stateConfig.variability * this.config.noiseLevel);
      heartRate += noise;
    }

    // Clamp heart rate to valid range
    heartRate = Math.max(40, Math.min(180, Math.round(heartRate)));

    // Generate RR interval (inverse relationship with heart rate)
    // RR interval in ms = 60000 / bpm
    const baseRRInterval = 60000 / heartRate;
    // Add some natural variation to RR interval
    const rrVariation = this.gaussianNoise(0, 20);
    const rrInterval = Math.round(baseRRInterval + rrVariation);
    this.lastRRInterval = rrInterval;

    // Calculate signal quality with slight variation
    const signalQuality = Math.min(1, Math.max(0.5, 
      this.config.signalQuality + this.gaussianNoise(0, 0.02)
    ));

    return {
      timestamp: Date.now(),
      heartRate,
      signalQuality,
      rrInterval,
    };
  }

  /**
   * Whether simulator is running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  /**
   * Get target heart rate for a given state
   */
  private getTargetHeartRateForState(state: UserStateType): number {
    const config = STATE_HR_CONFIGS[state];
    // Return a value in the middle of the range with some variation
    const midpoint = (config.minBPM + config.maxBPM) / 2;
    const range = (config.maxBPM - config.minBPM) / 4;
    return midpoint + this.gaussianNoise(0, range);
  }

  /**
   * Linear interpolation between two values
   */
  private interpolate(current: number, target: number, factor: number): number {
    return current + (target - current) * factor;
  }

  /**
   * Generate Gaussian (normal distribution) random noise
   * Uses Box-Muller transform
   */
  private gaussianNoise(mean: number, stdDev: number): number {
    let u1 = Math.random();
    let u2 = Math.random();
    
    // Prevent log(0)
    while (u1 === 0) u1 = Math.random();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
}

// Export singleton instance for convenience
export const heartRateSimulator = new HeartRateSimulator();

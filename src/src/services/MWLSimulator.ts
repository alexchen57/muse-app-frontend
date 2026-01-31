/**
 * MWL Data Simulator
 * Corresponds to PRD Section 3.2: Simulated MWL Data Reception
 * 
 * Responsibilities:
 * - Generate simulated MWL data (based on fNIRS theoretical model)
 * - Simulate MWL patterns for different states
 * - Simulate activation patterns for different brain regions
 */

import { MWLData, BrainRegion } from '../types/biometric';
import { UserStateType } from '../types/state';

/**
 * MWL Simulator Interface
 */
export interface IMWLSimulator {
  /**
   * Start MWL data simulation
   * @param callback - Data callback function
   * @param frequency - Data generation frequency (Hz)
   */
  start(callback: (data: MWLData) => void, frequency?: number): void;
  
  /**
   * Stop MWL data simulation
   */
  stop(): void;
  
  /**
   * Set simulated state (affects generated MWL pattern)
   * @param state - Target state
   */
  setSimulatedState(state: UserStateType): void;
  
  /**
   * Set baseline MWL
   * @param baseline - Baseline MWL (0-1)
   */
  setBaseline(baseline: number): void;
  
  /**
   * Generate single MWL data point
   * @param region - Brain region
   * @returns MWL data
   */
  generateDataPoint(region?: BrainRegion): MWLData;
  
  /**
   * Generate data for all brain regions
   * @returns Array of MWL data for all brain regions
   */
  generateAllRegions(): MWLData[];
  
  /**
   * Whether simulator is running
   */
  isRunning(): boolean;
  
  /**
   * Enable/disable auto state transition
   * @param enabled - Whether enabled
   */
  setAutoTransition(enabled: boolean): void;
}

/**
 * State-Brain Region Mapping
 * Corresponds to PRD Section 3.4 State Classification Rules Table
 */
export interface StateBrainRegionMapping {
  state: UserStateType;
  dominantRegion: BrainRegion;
  mwlRange: { min: number; max: number };
  hbO2Range: { min: number; max: number };
}

/**
 * Default State-Brain Region Mappings
 */
export const DEFAULT_STATE_BRAIN_MAPPINGS: StateBrainRegionMapping[] = [
  {
    state: UserStateType.STRESSED,
    dominantRegion: BrainRegion.LEFT_PFC,
    mwlRange: { min: 0.70, max: 0.90 },
    hbO2Range: { min: 0.75, max: 0.95 }
  },
  {
    state: UserStateType.CALM,
    dominantRegion: BrainRegion.M_PFC,
    mwlRange: { min: 0.20, max: 0.40 },
    hbO2Range: { min: 0.25, max: 0.45 }
  },
  {
    state: UserStateType.PRODUCTIVE,
    dominantRegion: BrainRegion.RIGHT_PFC,
    mwlRange: { min: 0.55, max: 0.75 },
    hbO2Range: { min: 0.60, max: 0.80 }
  },
  {
    state: UserStateType.DISTRACTED,
    dominantRegion: BrainRegion.M_PFC,
    mwlRange: { min: 0.30, max: 0.50 },
    hbO2Range: { min: 0.35, max: 0.55 }
  }
];

/**
 * MWL Simulator Configuration
 */
export interface MWLSimulatorConfig {
  /** Baseline MWL */
  baselineMWL: number;
  
  /** Data generation frequency (Hz) */
  frequency: number;
  
  /** Initial state */
  initialState: UserStateType;
  
  /** Add noise */
  addNoise: boolean;
  
  /** Noise level */
  noiseLevel: number;
  
  /** Enable auto state transition */
  autoTransition: boolean;
  
  /** State transition interval (seconds) */
  transitionInterval: number;
}

/**
 * Default MWL Simulator Configuration
 */
export const DEFAULT_MWL_SIMULATOR_CONFIG: MWLSimulatorConfig = {
  baselineMWL: 0.50,
  frequency: 1,
  initialState: UserStateType.CALM,
  addNoise: true,
  noiseLevel: 0.05,
  autoTransition: false,
  transitionInterval: 120
};

/**
 * Brain region activation configuration for each state
 */
interface RegionActivationConfig {
  /** Activation level relative to dominant region (0-1) */
  activationMultiplier: number;
}

/**
 * Get state mapping by state type
 */
function getStateMappingByState(state: UserStateType): StateBrainRegionMapping {
  const mapping = DEFAULT_STATE_BRAIN_MAPPINGS.find(m => m.state === state);
  if (!mapping) {
    // Default to CALM if state not found
    return DEFAULT_STATE_BRAIN_MAPPINGS.find(m => m.state === UserStateType.CALM)!;
  }
  return mapping;
}

/**
 * All brain regions for iteration
 */
const ALL_BRAIN_REGIONS: BrainRegion[] = [
  BrainRegion.LEFT_PFC,
  BrainRegion.RIGHT_PFC,
  BrainRegion.M_PFC,
  BrainRegion.VL_PFC,
];

/**
 * All user states for auto-transition
 */
const ALL_USER_STATES: UserStateType[] = [
  UserStateType.STRESSED,
  UserStateType.CALM,
  UserStateType.PRODUCTIVE,
  UserStateType.DISTRACTED,
];

/**
 * MWL Simulator Implementation
 * Generates realistic simulated MWL data based on fNIRS theoretical model
 */
export class MWLSimulator implements IMWLSimulator {
  private config: MWLSimulatorConfig;
  private currentState: UserStateType;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private autoTransitionIntervalId: ReturnType<typeof setInterval> | null = null;
  private callback: ((data: MWLData) => void) | null = null;
  
  // For smooth state transitions
  private targetMWL: number;
  private currentMWL: number;
  private targetHbO2: number;
  private currentHbO2: number;
  private readonly transitionSpeed: number = 0.08; // Slower than HR for more gradual changes
  
  // Current brain region index for rotation
  private currentRegionIndex: number = 0;

  constructor(config: Partial<MWLSimulatorConfig> = {}) {
    this.config = { ...DEFAULT_MWL_SIMULATOR_CONFIG, ...config };
    this.currentState = this.config.initialState;
    this.currentMWL = this.config.baselineMWL;
    this.currentHbO2 = this.config.baselineMWL;
    
    const stateMapping = getStateMappingByState(this.currentState);
    this.targetMWL = this.getValueInRange(stateMapping.mwlRange);
    this.targetHbO2 = this.getValueInRange(stateMapping.hbO2Range);
  }

  /**
   * Start MWL data simulation
   */
  start(callback: (data: MWLData) => void, frequency?: number): void {
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

    // Start auto-transition if enabled
    if (this.config.autoTransition) {
      this.startAutoTransition();
    }
  }

  /**
   * Stop MWL data simulation
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.autoTransitionIntervalId) {
      clearInterval(this.autoTransitionIntervalId);
      this.autoTransitionIntervalId = null;
    }
    this.callback = null;
  }

  /**
   * Set simulated state (affects generated MWL pattern)
   */
  setSimulatedState(state: UserStateType): void {
    this.currentState = state;
    const stateMapping = getStateMappingByState(state);
    this.targetMWL = this.getValueInRange(stateMapping.mwlRange);
    this.targetHbO2 = this.getValueInRange(stateMapping.hbO2Range);
  }

  /**
   * Set baseline MWL
   */
  setBaseline(baseline: number): void {
    this.config.baselineMWL = Math.max(0, Math.min(1, baseline));
  }

  /**
   * Generate single MWL data point
   */
  generateDataPoint(region?: BrainRegion): MWLData {
    const stateMapping = getStateMappingByState(this.currentState);
    
    // Use provided region or rotate through regions
    const targetRegion = region ?? this.getNextRegion();
    
    // Smooth transition towards target values
    this.currentMWL = this.interpolate(
      this.currentMWL,
      this.targetMWL,
      this.transitionSpeed
    );
    this.currentHbO2 = this.interpolate(
      this.currentHbO2,
      this.targetHbO2,
      this.transitionSpeed
    );

    // Calculate region-specific activation
    const regionActivation = this.getRegionActivation(targetRegion, stateMapping);
    
    // Apply activation multiplier to base values
    let mwlIndex = this.currentMWL * regionActivation;
    let hbO2Level = this.currentHbO2 * regionActivation;

    // Add noise if enabled
    if (this.config.addNoise) {
      mwlIndex += this.gaussianNoise(0, this.config.noiseLevel);
      hbO2Level += this.gaussianNoise(0, this.config.noiseLevel);
    }

    // Clamp values to valid range [0, 1]
    mwlIndex = Math.max(0, Math.min(1, mwlIndex));
    hbO2Level = Math.max(0, Math.min(1, hbO2Level));

    // Calculate signal quality with slight variation
    const signalQuality = Math.min(1, Math.max(0.6, 
      0.92 + this.gaussianNoise(0, 0.03)
    ));

    return {
      timestamp: Date.now(),
      mwlIndex,
      hbO2Level,
      region: targetRegion,
      signalQuality,
    };
  }

  /**
   * Generate data for all brain regions
   */
  generateAllRegions(): MWLData[] {
    return ALL_BRAIN_REGIONS.map(region => this.generateDataPoint(region));
  }

  /**
   * Whether simulator is running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  /**
   * Enable/disable auto state transition
   */
  setAutoTransition(enabled: boolean): void {
    this.config.autoTransition = enabled;
    
    if (enabled && this.isRunning() && !this.autoTransitionIntervalId) {
      this.startAutoTransition();
    } else if (!enabled && this.autoTransitionIntervalId) {
      clearInterval(this.autoTransitionIntervalId);
      this.autoTransitionIntervalId = null;
    }
  }

  /**
   * Get the current simulated state
   */
  getCurrentState(): UserStateType {
    return this.currentState;
  }

  /**
   * Start automatic state transitions
   */
  private startAutoTransition(): void {
    if (this.autoTransitionIntervalId) {
      clearInterval(this.autoTransitionIntervalId);
    }

    const intervalMs = this.config.transitionInterval * 1000;
    
    this.autoTransitionIntervalId = setInterval(() => {
      this.transitionToRandomState();
    }, intervalMs);
  }

  /**
   * Transition to a random different state
   */
  private transitionToRandomState(): void {
    const availableStates = ALL_USER_STATES.filter(s => s !== this.currentState);
    const randomIndex = Math.floor(Math.random() * availableStates.length);
    const newState = availableStates[randomIndex];
    this.setSimulatedState(newState);
  }

  /**
   * Get the next region in rotation
   */
  private getNextRegion(): BrainRegion {
    const region = ALL_BRAIN_REGIONS[this.currentRegionIndex];
    this.currentRegionIndex = (this.currentRegionIndex + 1) % ALL_BRAIN_REGIONS.length;
    return region;
  }

  /**
   * Get activation level for a specific region based on state
   */
  private getRegionActivation(
    region: BrainRegion, 
    stateMapping: StateBrainRegionMapping
  ): number {
    if (region === stateMapping.dominantRegion) {
      // Dominant region has full activation
      return 1.0;
    }
    
    // Non-dominant regions have reduced activation based on state
    switch (this.currentState) {
      case UserStateType.STRESSED:
        // Stressed: high activation across regions but Left PFC dominant
        return region === BrainRegion.RIGHT_PFC ? 0.75 : 0.6;
        
      case UserStateType.CALM:
        // Calm: balanced, low activation across all regions
        return 0.85;
        
      case UserStateType.PRODUCTIVE:
        // Productive: focused activation on Right PFC
        return region === BrainRegion.LEFT_PFC ? 0.7 : 0.5;
        
      case UserStateType.DISTRACTED:
        // Distracted: transient, variable activation
        return 0.6 + Math.random() * 0.3;
        
      default:
        return 0.7;
    }
  }

  /**
   * Get a random value within a range
   */
  private getValueInRange(range: { min: number; max: number }): number {
    return range.min + Math.random() * (range.max - range.min);
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
export const mwlSimulator = new MWLSimulator();

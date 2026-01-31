/**
 * Heart Rate Simulator Hook
 * Corresponds to PRD Section 3.3: Real HR Signal Reception
 * 
 * Responsibilities:
 * - Initialize and manage HeartRateSimulator lifecycle
 * - Connect simulator output to Zustand store
 * - Provide control methods for start/stop
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  HeartRateSimulator, 
  HeartRateSimulatorConfig,
  DEFAULT_HR_SIMULATOR_CONFIG 
} from '../services/HeartRateSimulator';
import { useAppStore } from '../stores/useAppStore';
import { HeartRateData } from '../types/biometric';
import { UserStateType } from '../types/state';

/**
 * Hook options
 */
export interface UseHeartRateSimulatorOptions {
  /** Simulator configuration */
  config?: Partial<HeartRateSimulatorConfig>;
  
  /** Auto-start simulation on mount */
  autoStart?: boolean;
  
  /** Data generation frequency (Hz) */
  frequency?: number;
  
  /** Callback for each data point (optional) */
  onData?: (data: HeartRateData) => void;
}

/**
 * Hook return type
 */
export interface UseHeartRateSimulatorReturn {
  /** Start simulation */
  start: () => void;
  
  /** Stop simulation */
  stop: () => void;
  
  /** Whether simulator is running */
  isRunning: boolean;
  
  /** Set simulated state */
  setSimulatedState: (state: UserStateType) => void;
  
  /** Set baseline heart rate */
  setBaseline: (baseline: number) => void;
  
  /** Current simulated state */
  currentState: UserStateType;
  
  /** Latest data point */
  latestData: HeartRateData | null;
}

/**
 * useHeartRateSimulator Hook
 * 
 * Manages heart rate simulation and connects to app store.
 * 
 * @example
 * ```tsx
 * const { start, stop, isRunning, setSimulatedState } = useHeartRateSimulator({
 *   autoStart: true,
 *   frequency: 1
 * });
 * ```
 */
export function useHeartRateSimulator(
  options: UseHeartRateSimulatorOptions = {}
): UseHeartRateSimulatorReturn {
  const {
    config = {},
    autoStart = false,
    frequency = DEFAULT_HR_SIMULATOR_CONFIG.frequency,
    onData
  } = options;

  // Refs
  const simulatorRef = useRef<HeartRateSimulator | null>(null);
  
  // Local state
  const [isRunning, setIsRunning] = useState(false);
  const [currentState, setCurrentState] = useState<UserStateType>(
    config.initialState ?? DEFAULT_HR_SIMULATOR_CONFIG.initialState
  );
  const [latestData, setLatestData] = useState<HeartRateData | null>(null);
  
  // Store actions
  const setCurrentHeartRate = useAppStore((state) => state.setCurrentHeartRate);
  const addHeartRateData = useAppStore((state) => state.addHeartRateData);
  const setHRDeviceStatus = useAppStore((state) => state.setHRDeviceStatus);

  // Initialize simulator
  useEffect(() => {
    simulatorRef.current = new HeartRateSimulator({
      ...DEFAULT_HR_SIMULATOR_CONFIG,
      ...config
    });

    return () => {
      if (simulatorRef.current?.isRunning()) {
        simulatorRef.current.stop();
      }
    };
  }, []); // Only initialize once

  // Handle data callback
  const handleData = useCallback((data: HeartRateData) => {
    // Update store
    setCurrentHeartRate(data.heartRate);
    addHeartRateData(data);
    
    // Update local state
    setLatestData(data);
    
    // Update device status
    setHRDeviceStatus({
      isConnected: true,
      lastUpdate: data.timestamp
    });
    
    // Call user callback if provided
    onData?.(data);
  }, [setCurrentHeartRate, addHeartRateData, setHRDeviceStatus, onData]);

  // Start simulation
  const start = useCallback(() => {
    if (!simulatorRef.current || simulatorRef.current.isRunning()) {
      return;
    }

    simulatorRef.current.start(handleData, frequency);
    setIsRunning(true);
    
    // Update device status
    setHRDeviceStatus({
      isConnected: true,
      lastUpdate: Date.now()
    });
  }, [handleData, frequency, setHRDeviceStatus]);

  // Stop simulation
  const stop = useCallback(() => {
    if (!simulatorRef.current || !simulatorRef.current.isRunning()) {
      return;
    }

    simulatorRef.current.stop();
    setIsRunning(false);
    
    // Update device status
    setHRDeviceStatus({
      isConnected: false,
      lastUpdate: Date.now()
    });
  }, [setHRDeviceStatus]);

  // Set simulated state
  const setSimulatedState = useCallback((state: UserStateType) => {
    if (simulatorRef.current) {
      simulatorRef.current.setSimulatedState(state);
      setCurrentState(state);
    }
  }, []);

  // Set baseline
  const setBaseline = useCallback((baseline: number) => {
    if (simulatorRef.current) {
      simulatorRef.current.setBaseline(baseline);
    }
  }, []);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && simulatorRef.current && !simulatorRef.current.isRunning()) {
      start();
    }

    return () => {
      if (simulatorRef.current?.isRunning()) {
        stop();
      }
    };
  }, [autoStart, start, stop]);

  return {
    start,
    stop,
    isRunning,
    setSimulatedState,
    setBaseline,
    currentState,
    latestData
  };
}

export default useHeartRateSimulator;

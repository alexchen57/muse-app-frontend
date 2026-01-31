/**
 * MWL Simulator Hook
 * Corresponds to PRD Section 3.2: Simulated MWL Data Reception
 * 
 * Responsibilities:
 * - Initialize and manage MWLSimulator lifecycle
 * - Connect simulator output to Zustand store
 * - Provide control methods for start/stop
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  MWLSimulator, 
  MWLSimulatorConfig,
  DEFAULT_MWL_SIMULATOR_CONFIG 
} from '../services/MWLSimulator';
import { useAppStore } from '../stores/useAppStore';
import { MWLData } from '../types/biometric';
import { UserStateType } from '../types/state';

/**
 * Hook options
 */
export interface UseMWLSimulatorOptions {
  /** Simulator configuration */
  config?: Partial<MWLSimulatorConfig>;
  
  /** Auto-start simulation on mount */
  autoStart?: boolean;
  
  /** Data generation frequency (Hz) */
  frequency?: number;
  
  /** Enable auto state transition */
  autoTransition?: boolean;
  
  /** Callback for each data point (optional) */
  onData?: (data: MWLData) => void;
}

/**
 * Hook return type
 */
export interface UseMWLSimulatorReturn {
  /** Start simulation */
  start: () => void;
  
  /** Stop simulation */
  stop: () => void;
  
  /** Whether simulator is running */
  isRunning: boolean;
  
  /** Set simulated state */
  setSimulatedState: (state: UserStateType) => void;
  
  /** Set baseline MWL */
  setBaseline: (baseline: number) => void;
  
  /** Enable/disable auto transition */
  setAutoTransition: (enabled: boolean) => void;
  
  /** Current simulated state */
  currentState: UserStateType;
  
  /** Latest data point */
  latestData: MWLData | null;
  
  /** Whether auto transition is enabled */
  autoTransitionEnabled: boolean;
}

/**
 * useMWLSimulator Hook
 * 
 * Manages MWL simulation and connects to app store.
 * 
 * @example
 * ```tsx
 * const { start, stop, isRunning, setSimulatedState } = useMWLSimulator({
 *   autoStart: true,
 *   frequency: 1,
 *   autoTransition: false
 * });
 * ```
 */
export function useMWLSimulator(
  options: UseMWLSimulatorOptions = {}
): UseMWLSimulatorReturn {
  const {
    config = {},
    autoStart = false,
    frequency = DEFAULT_MWL_SIMULATOR_CONFIG.frequency,
    autoTransition = false,
    onData
  } = options;

  // Refs
  const simulatorRef = useRef<MWLSimulator | null>(null);
  
  // Local state
  const [isRunning, setIsRunning] = useState(false);
  const [currentState, setCurrentState] = useState<UserStateType>(
    config.initialState ?? DEFAULT_MWL_SIMULATOR_CONFIG.initialState
  );
  const [latestData, setLatestData] = useState<MWLData | null>(null);
  const [autoTransitionEnabled, setAutoTransitionEnabled] = useState(autoTransition);
  
  // Store actions
  const setCurrentMWL = useAppStore((state) => state.setCurrentMWL);
  const addMWLData = useAppStore((state) => state.addMWLData);
  const setMWLDeviceStatus = useAppStore((state) => state.setMWLDeviceStatus);

  // Initialize simulator
  useEffect(() => {
    simulatorRef.current = new MWLSimulator({
      ...DEFAULT_MWL_SIMULATOR_CONFIG,
      ...config,
      autoTransition
    });

    return () => {
      if (simulatorRef.current?.isRunning()) {
        simulatorRef.current.stop();
      }
    };
  }, []); // Only initialize once

  // Handle data callback
  const handleData = useCallback((data: MWLData) => {
    // Update store with MWL index
    setCurrentMWL(data.mwlIndex);
    addMWLData(data);
    
    // Update local state
    setLatestData(data);
    
    // Update device status
    setMWLDeviceStatus({
      isConnected: true,
      lastUpdate: data.timestamp
    });
    
    // Call user callback if provided
    onData?.(data);
  }, [setCurrentMWL, addMWLData, setMWLDeviceStatus, onData]);

  // Start simulation
  const start = useCallback(() => {
    if (!simulatorRef.current || simulatorRef.current.isRunning()) {
      return;
    }

    simulatorRef.current.start(handleData, frequency);
    setIsRunning(true);
    
    // Update device status
    setMWLDeviceStatus({
      isConnected: true,
      lastUpdate: Date.now()
    });
  }, [handleData, frequency, setMWLDeviceStatus]);

  // Stop simulation
  const stop = useCallback(() => {
    if (!simulatorRef.current || !simulatorRef.current.isRunning()) {
      return;
    }

    simulatorRef.current.stop();
    setIsRunning(false);
    
    // Update device status
    setMWLDeviceStatus({
      isConnected: false,
      lastUpdate: Date.now()
    });
  }, [setMWLDeviceStatus]);

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

  // Set auto transition
  const setAutoTransition = useCallback((enabled: boolean) => {
    if (simulatorRef.current) {
      simulatorRef.current.setAutoTransition(enabled);
      setAutoTransitionEnabled(enabled);
    }
  }, []);

  // Sync current state from simulator (for auto-transition)
  useEffect(() => {
    if (!autoTransitionEnabled || !isRunning) {
      return;
    }

    // Poll for state changes when auto-transition is enabled
    const interval = setInterval(() => {
      if (simulatorRef.current) {
        const simState = simulatorRef.current.getCurrentState();
        if (simState !== currentState) {
          setCurrentState(simState);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [autoTransitionEnabled, isRunning, currentState]);

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
    setAutoTransition,
    currentState,
    latestData,
    autoTransitionEnabled
  };
}

export default useMWLSimulator;

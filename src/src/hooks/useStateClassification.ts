/**
 * State Classification Hook
 * Corresponds to PRD Section 3.4: State Classification Algorithm
 * 
 * Responsibilities:
 * - Subscribe to HR and MWL data from store
 * - Call StateClassificationService for classification
 * - Update store with classification results
 * - Debounce/throttle for performance
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  StateClassificationService,
  stateClassificationService 
} from '../services/StateClassificationService';
import { useAppStore } from '../stores/useAppStore';
import { 
  UserStateType, 
  StateClassificationInput,
  StateClassificationOutput,
  StateChangeEvent 
} from '../types/state';

/**
 * Hook options
 */
export interface UseStateClassificationOptions {
  /** Enable auto classification (default: true) */
  enabled?: boolean;
  
  /** Classification interval in milliseconds (default: 1000) */
  interval?: number;
  
  /** Minimum data points required before classification (default: 5) */
  minDataPoints?: number;
  
  /** Use custom service instance */
  service?: StateClassificationService;
  
  /** Callback on state change */
  onStateChange?: (event: StateChangeEvent) => void;
  
  /** Callback on classification */
  onClassification?: (result: StateClassificationOutput) => void;
}

/**
 * Hook return type
 */
export interface UseStateClassificationReturn {
  /** Current classified state */
  currentState: UserStateType | null;
  
  /** Classification confidence (0-1) */
  confidence: number;
  
  /** Classification reasoning */
  reasoning: string;
  
  /** Whether classification is active */
  isActive: boolean;
  
  /** Enable/disable classification */
  setEnabled: (enabled: boolean) => void;
  
  /** Manually trigger classification */
  classify: () => StateClassificationOutput | null;
  
  /** Recent state change event */
  lastStateChange: StateChangeEvent | null;
  
  /** Number of classifications performed */
  classificationCount: number;
}

/**
 * useStateClassification Hook
 * 
 * Automatically classifies user state based on biometric data.
 * 
 * @example
 * ```tsx
 * const { currentState, confidence, reasoning } = useStateClassification({
 *   enabled: true,
 *   interval: 1000,
 *   onStateChange: (event) => console.log('State changed:', event)
 * });
 * ```
 */
export function useStateClassification(
  options: UseStateClassificationOptions = {}
): UseStateClassificationReturn {
  const {
    enabled: initialEnabled = true,
    interval = 1000,
    minDataPoints = 5,
    service = stateClassificationService,
    onStateChange,
    onClassification
  } = options;

  // Local state
  const [isActive, setIsActive] = useState(initialEnabled);
  const [confidence, setConfidence] = useState(0);
  const [reasoning, setReasoning] = useState('');
  const [lastStateChange, setLastStateChange] = useState<StateChangeEvent | null>(null);
  const [classificationCount, setClassificationCount] = useState(0);
  
  // Refs for tracking state duration
  const lastStateRef = useRef<UserStateType | null>(null);
  const stateStartTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Store data
  const currentHeartRate = useAppStore((state) => state.currentHeartRate);
  const currentMWL = useAppStore((state) => state.currentMWL);
  const heartRateBaseline = useAppStore((state) => state.heartRateBaseline);
  const mwlBaseline = useAppStore((state) => state.mwlBaseline);
  const recentHeartRateData = useAppStore((state) => state.recentHeartRateData);
  const recentMWLData = useAppStore((state) => state.recentMWLData);
  const currentState = useAppStore((state) => state.currentState);
  const setCurrentState = useAppStore((state) => state.setCurrentState);

  // Perform classification
  const classify = useCallback((): StateClassificationOutput | null => {
    // Check if we have enough data
    if (currentHeartRate === null || currentMWL === null) {
      return null;
    }

    if (recentHeartRateData.length < minDataPoints || recentMWLData.length < minDataPoints) {
      return null;
    }

    // Prepare input
    const input: StateClassificationInput = {
      heartRate: currentHeartRate,
      heartRateBaseline,
      mwlIndex: currentMWL,
      mwlBaseline
    };

    // Classify
    const result = service.classifyState(input);
    
    // Update local state
    setConfidence(result.confidence);
    setReasoning(result.reasoning);
    setClassificationCount(prev => prev + 1);
    
    // Update store - map UserStateType to StateType string
    setCurrentState(result.state as unknown as typeof currentState, result.confidence);
    
    // Call callback
    onClassification?.(result);

    // Check for state change
    if (lastStateRef.current !== null && lastStateRef.current !== result.state) {
      const duration = Date.now() - stateStartTimeRef.current;
      
      const changeEvent = service.detectStateChange(
        lastStateRef.current,
        result.state,
        duration
      );
      
      if (changeEvent) {
        setLastStateChange(changeEvent);
        onStateChange?.(changeEvent);
      }
      
      // Reset state timer
      stateStartTimeRef.current = Date.now();
    }
    
    // Update last state
    lastStateRef.current = result.state;

    return result;
  }, [
    currentHeartRate,
    currentMWL,
    heartRateBaseline,
    mwlBaseline,
    recentHeartRateData.length,
    recentMWLData.length,
    minDataPoints,
    service,
    setCurrentState,
    currentState,
    onClassification,
    onStateChange
  ]);

  // Enable/disable classification
  const setEnabled = useCallback((enabled: boolean) => {
    setIsActive(enabled);
  }, []);

  // Classification interval effect
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start classification interval
    intervalRef.current = setInterval(() => {
      classify();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, interval, classify]);

  // Initialize state tracking
  useEffect(() => {
    if (currentState) {
      lastStateRef.current = currentState as unknown as UserStateType;
    }
  }, []);

  return {
    currentState: currentState as unknown as UserStateType | null,
    confidence,
    reasoning,
    isActive,
    setEnabled,
    classify,
    lastStateChange,
    classificationCount
  };
}

export default useStateClassification;

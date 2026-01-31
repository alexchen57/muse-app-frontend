/**
 * MUSE System Custom Hooks
 * 
 * Usage:
 * import { useHeartRateSimulator, useMWLSimulator, useStateClassification, useMusicRecommendation } from '@/hooks';
 */

// Heart Rate Simulator Hook
export { 
  useHeartRateSimulator,
  type UseHeartRateSimulatorOptions,
  type UseHeartRateSimulatorReturn 
} from './useHeartRateSimulator';

// MWL Simulator Hook
export { 
  useMWLSimulator,
  type UseMWLSimulatorOptions,
  type UseMWLSimulatorReturn 
} from './useMWLSimulator';

// State Classification Hook
export { 
  useStateClassification,
  type UseStateClassificationOptions,
  type UseStateClassificationReturn 
} from './useStateClassification';

// Music Recommendation Hook
export { 
  useMusicRecommendation,
  type UseMusicRecommendationOptions,
  type UseMusicRecommendationReturn 
} from './useMusicRecommendation';

/**
 * Music Recommendation Hook
 * Corresponds to PRD Section 3.5: State-Based Music Recommendation and Playback
 * 
 * Responsibilities:
 * - React to user state changes
 * - Query music library from IndexedDB
 * - Call MusicRecommendationService for recommendations
 * - Trigger playback on state change
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  MusicRecommendationService,
  musicRecommendationService 
} from '../services/MusicRecommendationService';
import { useAppStore } from '../stores/useAppStore';
import { db } from '../utils/db';
import { MusicMetadata, MusicGenre } from '../types/music';
import { UserStateType } from '../types/state';
import { UserPreferences } from '../types/preferences';

/**
 * Default user preferences
 */
const DEFAULT_USER_PREFERENCES: UserPreferences = {
  genrePreferences: [
    { genre: MusicGenre.AMBIENT, weight: 0.8 },
    { genre: MusicGenre.CLASSICAL, weight: 0.7 },
    { genre: MusicGenre.INSTRUMENTAL, weight: 0.6 },
    { genre: MusicGenre.JAZZ, weight: 0.5 },
    { genre: MusicGenre.ELECTRONIC, weight: 0.4 },
  ],
  stateMusicMappings: [
    { state: UserStateType.STRESSED, preferredGenres: [MusicGenre.AMBIENT, MusicGenre.CLASSICAL, MusicGenre.NATURE] },
    { state: UserStateType.CALM, preferredGenres: [MusicGenre.JAZZ, MusicGenre.CLASSICAL, MusicGenre.AMBIENT] },
    { state: UserStateType.PRODUCTIVE, preferredGenres: [MusicGenre.ELECTRONIC, MusicGenre.INSTRUMENTAL, MusicGenre.POP] },
    { state: UserStateType.DISTRACTED, preferredGenres: [MusicGenre.ELECTRONIC, MusicGenre.POP, MusicGenre.INSTRUMENTAL] },
  ],
  defaultVolume: 70,
  autoPlayEnabled: true,
  stateNotificationEnabled: true,
  updatedAt: Date.now()
};

/**
 * Hook options
 */
export interface UseMusicRecommendationOptions {
  /** Enable auto recommendation on state change */
  autoRecommend?: boolean;
  
  /** Enable auto play on recommendation */
  autoPlay?: boolean;
  
  /** User preferences (optional, uses defaults if not provided) */
  userPreferences?: UserPreferences;
  
  /** Custom recommendation service */
  service?: MusicRecommendationService;
  
  /** Callback when music is recommended */
  onRecommendation?: (music: MusicMetadata | null) => void;
  
  /** Minimum state stability before recommending (ms) */
  stateStabilityThreshold?: number;
  
  /** Play history limit for avoiding repeats */
  playHistoryLimit?: number;
}

/**
 * Hook return type
 */
export interface UseMusicRecommendationReturn {
  /** Recommended music */
  recommendedMusic: MusicMetadata | null;
  
  /** Recommendation playlist */
  playlist: MusicMetadata[];
  
  /** Request single recommendation */
  recommend: () => Promise<MusicMetadata | null>;
  
  /** Request playlist */
  recommendPlaylist: (count?: number) => Promise<MusicMetadata[]>;
  
  /** Whether recommendation is in progress */
  isLoading: boolean;
  
  /** Target BPM for current state */
  targetBPM: { min: number; max: number; target: number } | null;
  
  /** Recommended volume for current state */
  recommendedVolume: { min: number; max: number } | null;
  
  /** Music library size */
  librarySize: number;
  
  /** Play history */
  playHistory: string[];
  
  /** Add to play history */
  addToPlayHistory: (musicId: string) => void;
  
  /** Clear play history */
  clearPlayHistory: () => void;
  
  /** Refresh music library from DB */
  refreshLibrary: () => Promise<void>;
}

/**
 * useMusicRecommendation Hook
 * 
 * Provides music recommendations based on user state.
 * 
 * @example
 * ```tsx
 * const { 
 *   recommendedMusic, 
 *   recommend, 
 *   recommendPlaylist,
 *   targetBPM 
 * } = useMusicRecommendation({
 *   autoRecommend: true,
 *   autoPlay: true
 * });
 * ```
 */
export function useMusicRecommendation(
  options: UseMusicRecommendationOptions = {}
): UseMusicRecommendationReturn {
  const {
    autoRecommend = false,
    autoPlay = false,
    userPreferences = DEFAULT_USER_PREFERENCES,
    service = musicRecommendationService,
    onRecommendation,
    stateStabilityThreshold = 3000, // 3 seconds
    playHistoryLimit = 10
  } = options;

  // Local state
  const [musicLibrary, setMusicLibrary] = useState<MusicMetadata[]>([]);
  const [recommendedMusic, setRecommendedMusic] = useState<MusicMetadata | null>(null);
  const [playlist, setPlaylist] = useState<MusicMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [targetBPM, setTargetBPM] = useState<{ min: number; max: number; target: number } | null>(null);
  const [recommendedVolume, setRecommendedVolume] = useState<{ min: number; max: number } | null>(null);
  const [playHistory, setPlayHistory] = useState<string[]>([]);
  
  // Refs for state stability tracking
  const lastStateRef = useRef<UserStateType | null>(null);
  const stateChangeTimeRef = useRef<number>(Date.now());
  const stabilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Store data
  const currentState = useAppStore((state) => state.currentState);
  const currentHeartRate = useAppStore((state) => state.currentHeartRate);
  const setCurrentMusic = useAppStore((state) => state.setCurrentMusic);
  const setIsPlaying = useAppStore((state) => state.setIsPlaying);
  const setVolume = useAppStore((state) => state.setVolume);

  // Load music library from IndexedDB
  const refreshLibrary = useCallback(async () => {
    try {
      const music = await db.music.toArray();
      setMusicLibrary(music);
    } catch (error) {
      console.error('Failed to load music library:', error);
    }
  }, []);

  // Initialize music library
  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  // Add to play history
  const addToPlayHistory = useCallback((musicId: string) => {
    setPlayHistory(prev => {
      const updated = [musicId, ...prev.filter(id => id !== musicId)];
      return updated.slice(0, playHistoryLimit);
    });
  }, [playHistoryLimit]);

  // Clear play history
  const clearPlayHistory = useCallback(() => {
    setPlayHistory([]);
  }, []);

  // Recommend single track
  const recommend = useCallback(async (): Promise<MusicMetadata | null> => {
    if (musicLibrary.length === 0 || currentHeartRate === null || currentState === null) {
      return null;
    }

    setIsLoading(true);

    try {
      // Calculate target BPM
      const bpmResult = service.calculateTargetBPM(
        currentState as unknown as UserStateType,
        currentHeartRate
      );
      setTargetBPM(bpmResult);

      // Get recommended volume
      const volumeResult = service.getRecommendedVolume(
        currentState as unknown as UserStateType
      );
      setRecommendedVolume(volumeResult);

      // Get recommendation
      const recommended = service.recommendMusic(
        currentState as unknown as UserStateType,
        currentHeartRate,
        musicLibrary,
        userPreferences,
        playHistory
      );

      setRecommendedMusic(recommended);
      
      // Call callback
      onRecommendation?.(recommended);

      // Auto-play if enabled
      if (autoPlay && recommended) {
        setCurrentMusic(recommended);
        setIsPlaying(true);
        
        // Set recommended volume (convert from dB range to 0-1)
        const avgVolume = (volumeResult.min + volumeResult.max) / 2;
        const normalizedVolume = Math.max(0, Math.min(1, avgVolume / 100));
        setVolume(normalizedVolume);
        
        // Add to play history
        addToPlayHistory(recommended.id);
      }

      return recommended;
    } catch (error) {
      console.error('Failed to recommend music:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    musicLibrary,
    currentHeartRate,
    currentState,
    service,
    userPreferences,
    playHistory,
    autoPlay,
    setCurrentMusic,
    setIsPlaying,
    setVolume,
    addToPlayHistory,
    onRecommendation
  ]);

  // Recommend playlist
  const recommendPlaylist = useCallback(async (count: number = 5): Promise<MusicMetadata[]> => {
    if (musicLibrary.length === 0 || currentHeartRate === null || currentState === null) {
      return [];
    }

    setIsLoading(true);

    try {
      // Calculate target BPM
      const bpmResult = service.calculateTargetBPM(
        currentState as unknown as UserStateType,
        currentHeartRate
      );
      setTargetBPM(bpmResult);

      // Get playlist
      const recommended = service.recommendPlaylist(
        currentState as unknown as UserStateType,
        currentHeartRate,
        musicLibrary,
        userPreferences,
        count,
        playHistory
      );

      setPlaylist(recommended);
      
      // Set first track as recommended
      if (recommended.length > 0) {
        setRecommendedMusic(recommended[0]);
        onRecommendation?.(recommended[0]);
      }

      return recommended;
    } catch (error) {
      console.error('Failed to recommend playlist:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [
    musicLibrary,
    currentHeartRate,
    currentState,
    service,
    userPreferences,
    playHistory,
    onRecommendation
  ]);

  // Auto-recommend on state change effect
  useEffect(() => {
    if (!autoRecommend || currentState === null) {
      return;
    }

    const currentStateTyped = currentState as unknown as UserStateType;

    // Check if state has changed
    if (lastStateRef.current === currentStateTyped) {
      return;
    }

    // Clear previous stability timer
    if (stabilityTimerRef.current) {
      clearTimeout(stabilityTimerRef.current);
    }

    // Update state tracking
    lastStateRef.current = currentStateTyped;
    stateChangeTimeRef.current = Date.now();

    // Wait for state stability before recommending
    stabilityTimerRef.current = setTimeout(() => {
      // Verify state is still the same
      if (currentState === currentStateTyped) {
        recommend();
      }
    }, stateStabilityThreshold);

    return () => {
      if (stabilityTimerRef.current) {
        clearTimeout(stabilityTimerRef.current);
      }
    };
  }, [currentState, autoRecommend, stateStabilityThreshold, recommend]);

  return {
    recommendedMusic,
    playlist,
    recommend,
    recommendPlaylist,
    isLoading,
    targetBPM,
    recommendedVolume,
    librarySize: musicLibrary.length,
    playHistory,
    addToPlayHistory,
    clearPlayHistory,
    refreshLibrary
  };
}

export default useMusicRecommendation;

/**
 * Music Recommendation Service
 * Corresponds to PRD Section 3.5: State-Based Music Recommendation and Playback
 * 
 * Responsibilities:
 * - Recommend music based on user state
 * - BPM matching algorithm
 * - Personalized recommendations
 */

import { MusicMetadata, MusicFilterCriteria, MusicGenre } from '../types/music';
import { UserStateType } from '../types/state';
import { UserPreferences, MusicFeedback, GenrePreference } from '../types/preferences';

/**
 * Music Recommendation Service Interface
 */
export interface IMusicRecommendationService {
  /**
   * Recommend music based on current state
   * @param currentState - Current user state
   * @param currentHeartRate - Current heart rate
   * @param musicLibrary - Available music library
   * @param userPreferences - User preferences
   * @returns Recommended music, null if no suitable music found
   */
  recommendMusic(
    currentState: UserStateType,
    currentHeartRate: number,
    musicLibrary: MusicMetadata[],
    userPreferences: UserPreferences
  ): MusicMetadata | null;
  
  /**
   * Recommend multiple songs (playlist)
   * @param currentState - Current user state
   * @param currentHeartRate - Current heart rate
   * @param musicLibrary - Available music library
   * @param userPreferences - User preferences
   * @param count - Number of recommendations
   * @returns Array of recommended music
   */
  recommendPlaylist(
    currentState: UserStateType,
    currentHeartRate: number,
    musicLibrary: MusicMetadata[],
    userPreferences: UserPreferences,
    count: number
  ): MusicMetadata[];
  
  /**
   * Calculate target BPM range
   * @param currentState - Current user state
   * @param currentHeartRate - Current heart rate
   * @returns Target BPM range
   */
  calculateTargetBPM(
    currentState: UserStateType,
    currentHeartRate: number
  ): { min: number; max: number };
  
  /**
   * Calculate music recommendation score
   * @param music - Music metadata
   * @param targetBPM - Target BPM
   * @param userPreferences - User preferences
   * @param playHistory - Play history (music ID array)
   * @returns Recommendation score (0-100)
   */
  calculateScore(
    music: MusicMetadata,
    targetBPM: number,
    userPreferences: UserPreferences,
    playHistory?: string[]
  ): number;
  
  /**
   * Learn preferences from user feedback
   * @param feedback - User feedback
   * @param currentPreferences - Current preferences
   * @returns Updated preferences
   */
  learnFromFeedback(
    feedback: MusicFeedback,
    currentPreferences: UserPreferences
  ): UserPreferences;
  
  /**
   * Filter music matching criteria
   * @param musicLibrary - Music library
   * @param criteria - Filter criteria
   * @returns Filtered music array
   */
  filterMusic(
    musicLibrary: MusicMetadata[],
    criteria: MusicFilterCriteria
  ): MusicMetadata[];
}

/**
 * BPM Recommendation Strategy
 * Corresponds to PRD Section 3.5 Recommendation Strategy Table
 */
export interface BPMStrategy {
  /** State type */
  state: UserStateType;
  
  /** BPM calculation multiplier (relative to heart rate) */
  bpmMultiplier: { min: number; max: number };
  
  /** Volume range (dB) */
  volumeRange: { min: number; max: number };
  
  /** Recommendation goal */
  goal: string;
}

/**
 * Default BPM Recommendation Strategies
 */
export const DEFAULT_BPM_STRATEGIES: BPMStrategy[] = [
  {
    state: UserStateType.STRESSED,
    bpmMultiplier: { min: 0.7, max: 0.8 },
    volumeRange: { min: 40, max: 50 },
    goal: 'Lower physiological arousal'
  },
  {
    state: UserStateType.DISTRACTED,
    bpmMultiplier: { min: 1.1, max: 1.3 },
    volumeRange: { min: 50, max: 60 },
    goal: 'Increase alertness'
  },
  {
    state: UserStateType.CALM,
    bpmMultiplier: { min: 0.95, max: 1.05 },
    volumeRange: { min: 45, max: 55 },
    goal: 'Maintain state'
  },
  {
    state: UserStateType.PRODUCTIVE,
    bpmMultiplier: { min: 0.97, max: 1.03 },
    volumeRange: { min: 40, max: 50 },
    goal: 'Low-disturbance maintenance'
  }
];

/**
 * Recommendation configuration
 */
export interface RecommendationConfig {
  /** BPM tolerance range (default: 10 bpm) */
  bpmTolerance: number;
  /** Maximum BPM score (base score for perfect BPM match) */
  maxBpmScore: number;
  /** Genre match bonus score */
  genreMatchBonus: number;
  /** Recently played penalty */
  recentlyPlayedPenalty: number;
  /** High rating bonus */
  highRatingBonus: number;
  /** Low play count bonus (for variety) */
  lowPlayCountBonus: number;
}

/**
 * Default recommendation configuration
 */
export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationConfig = {
  bpmTolerance: 10,
  maxBpmScore: 100,
  genreMatchBonus: 50,
  recentlyPlayedPenalty: 30,
  highRatingBonus: 20,
  lowPlayCountBonus: 10
};

/**
 * Music Recommendation Service Implementation
 * Implements content-based recommendation algorithm per PRD 3.5
 */
export class MusicRecommendationService implements IMusicRecommendationService {
  private config: RecommendationConfig;
  private strategies: Map<UserStateType, BPMStrategy>;

  constructor(config: Partial<RecommendationConfig> = {}) {
    this.config = { ...DEFAULT_RECOMMENDATION_CONFIG, ...config };
    
    // Build strategy lookup map
    this.strategies = new Map();
    DEFAULT_BPM_STRATEGIES.forEach(strategy => {
      this.strategies.set(strategy.state, strategy);
    });
  }

  /**
   * Calculate target BPM based on user state and heart rate
   * Per PRD 3.5:
   * - Stressed: HR * 0.75 (reduce arousal)
   * - Distracted: HR * 1.2 (increase alertness)
   * - Calm: HR +/- 5 (maintain)
   * - Productive: HR +/- 3 (low disturbance)
   */
  calculateTargetBPM(
    currentState: UserStateType,
    currentHeartRate: number
  ): { min: number; max: number; target: number } {
    const strategy = this.strategies.get(currentState);
    
    if (!strategy) {
      // Default fallback: use heart rate as target
      return {
        min: currentHeartRate - 10,
        max: currentHeartRate + 10,
        target: currentHeartRate
      };
    }

    const minBPM = Math.round(currentHeartRate * strategy.bpmMultiplier.min);
    const maxBPM = Math.round(currentHeartRate * strategy.bpmMultiplier.max);
    const targetBPM = Math.round((minBPM + maxBPM) / 2);

    // Clamp to reasonable music BPM range (60-180)
    return {
      min: Math.max(60, minBPM),
      max: Math.min(180, maxBPM),
      target: Math.max(60, Math.min(180, targetBPM))
    };
  }

  /**
   * Filter music candidates by BPM range
   */
  private filterByBPM(
    musicLibrary: MusicMetadata[],
    targetBPM: number,
    tolerance: number = this.config.bpmTolerance
  ): MusicMetadata[] {
    return musicLibrary.filter(track => {
      if (track.bpm === null || track.bpm === undefined) {
        return false;
      }
      return Math.abs(track.bpm - targetBPM) <= tolerance;
    });
  }

  /**
   * Get preferred genres for a given state
   */
  private getPreferredGenres(
    currentState: UserStateType,
    userPreferences: UserPreferences
  ): MusicGenre[] {
    // Check state-specific mappings first
    const stateMapping = userPreferences.stateMusicMappings?.find(
      mapping => mapping.state === currentState
    );
    
    if (stateMapping && stateMapping.preferredGenres.length > 0) {
      return stateMapping.preferredGenres;
    }

    // Fall back to general genre preferences (sorted by weight)
    if (userPreferences.genrePreferences && userPreferences.genrePreferences.length > 0) {
      return userPreferences.genrePreferences
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3)
        .map(pref => pref.genre);
    }

    // Default genre recommendations based on state
    const defaultGenres: Record<UserStateType, MusicGenre[]> = {
      [UserStateType.STRESSED]: [MusicGenre.AMBIENT, MusicGenre.CLASSICAL, MusicGenre.NATURE],
      [UserStateType.CALM]: [MusicGenre.JAZZ, MusicGenre.CLASSICAL, MusicGenre.AMBIENT],
      [UserStateType.PRODUCTIVE]: [MusicGenre.ELECTRONIC, MusicGenre.INSTRUMENTAL, MusicGenre.POP],
      [UserStateType.DISTRACTED]: [MusicGenre.ELECTRONIC, MusicGenre.POP, MusicGenre.INSTRUMENTAL]
    };

    return defaultGenres[currentState] || [MusicGenre.INSTRUMENTAL];
  }

  /**
   * Calculate recommendation score for a track
   * Per PRD 3.5:
   * - bpmScore = 100 - abs(track.bpm - targetBPM) * 5
   * - genreScore = genre in preferences ? 50 : 0
   * - historyPenalty = recentlyPlayed ? -30 : 0
   */
  calculateScore(
    music: MusicMetadata,
    targetBPM: number,
    userPreferences: UserPreferences,
    playHistory: string[] = []
  ): number {
    let score = 0;

    // BPM Score: 100 points max, lose 5 points per BPM difference
    if (music.bpm !== null && music.bpm !== undefined) {
      const bpmDiff = Math.abs(music.bpm - targetBPM);
      const bpmScore = Math.max(0, this.config.maxBpmScore - bpmDiff * 5);
      score += bpmScore;
    } else {
      // No BPM data - give partial score
      score += this.config.maxBpmScore * 0.3;
    }

    // Genre Score: bonus for matching preferred genres
    if (music.genre) {
      const genrePrefs = userPreferences.genrePreferences || [];
      const genrePref = genrePrefs.find(pref => pref.genre === music.genre);
      
      if (genrePref) {
        // Scale genre bonus by preference weight
        score += this.config.genreMatchBonus * genrePref.weight;
      }
    }

    // Recently Played Penalty
    if (playHistory.includes(music.id)) {
      score -= this.config.recentlyPlayedPenalty;
    }

    // High Rating Bonus
    if (music.rating && music.rating >= 4) {
      score += this.config.highRatingBonus * (music.rating / 5);
    }

    // Low Play Count Bonus (encourage variety)
    if (music.playCount < 3) {
      score += this.config.lowPlayCountBonus;
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Recommend single best music track
   */
  recommendMusic(
    currentState: UserStateType,
    currentHeartRate: number,
    musicLibrary: MusicMetadata[],
    userPreferences: UserPreferences,
    playHistory: string[] = []
  ): MusicMetadata | null {
    if (!musicLibrary || musicLibrary.length === 0) {
      return null;
    }

    // Calculate target BPM
    const { target: targetBPM } = this.calculateTargetBPM(currentState, currentHeartRate);

    // Get preferred genres for current state
    const preferredGenres = this.getPreferredGenres(currentState, userPreferences);

    // First pass: filter by BPM (strict tolerance)
    let candidates = this.filterByBPM(musicLibrary, targetBPM, this.config.bpmTolerance);

    // If no strict matches, widen tolerance
    if (candidates.length === 0) {
      candidates = this.filterByBPM(musicLibrary, targetBPM, this.config.bpmTolerance * 2);
    }

    // If still no matches, use all music with valid BPM
    if (candidates.length === 0) {
      candidates = musicLibrary.filter(track => track.bpm !== null);
    }

    // If no music with BPM, use all music
    if (candidates.length === 0) {
      candidates = musicLibrary;
    }

    // Score all candidates
    const scoredCandidates = candidates.map(music => ({
      music,
      score: this.calculateScore(music, targetBPM, userPreferences, playHistory),
      // Bonus for matching preferred genre
      genreBonus: music.genre && preferredGenres.includes(music.genre) ? 25 : 0
    }));

    // Sort by total score (score + genre bonus)
    scoredCandidates.sort((a, b) => (b.score + b.genreBonus) - (a.score + a.genreBonus));

    // Return top recommendation
    return scoredCandidates.length > 0 ? scoredCandidates[0].music : null;
  }

  /**
   * Recommend multiple songs for a playlist
   */
  recommendPlaylist(
    currentState: UserStateType,
    currentHeartRate: number,
    musicLibrary: MusicMetadata[],
    userPreferences: UserPreferences,
    count: number = 5,
    playHistory: string[] = []
  ): MusicMetadata[] {
    if (!musicLibrary || musicLibrary.length === 0 || count <= 0) {
      return [];
    }

    const { target: targetBPM } = this.calculateTargetBPM(currentState, currentHeartRate);
    const preferredGenres = this.getPreferredGenres(currentState, userPreferences);

    // Score all tracks
    const scoredTracks = musicLibrary.map(music => ({
      music,
      score: this.calculateScore(music, targetBPM, userPreferences, playHistory),
      genreBonus: music.genre && preferredGenres.includes(music.genre) ? 25 : 0
    }));

    // Sort by score
    scoredTracks.sort((a, b) => (b.score + b.genreBonus) - (a.score + a.genreBonus));

    // Return top N tracks
    return scoredTracks.slice(0, count).map(item => item.music);
  }

  /**
   * Filter music by various criteria
   */
  filterMusic(
    musicLibrary: MusicMetadata[],
    criteria: MusicFilterCriteria
  ): MusicMetadata[] {
    let filtered = [...musicLibrary];

    // Filter by BPM range
    if (criteria.bpmRange) {
      filtered = filtered.filter(track => {
        if (track.bpm === null || track.bpm === undefined) return false;
        return track.bpm >= criteria.bpmRange!.min && track.bpm <= criteria.bpmRange!.max;
      });
    }

    // Filter by genres
    if (criteria.genres && criteria.genres.length > 0) {
      filtered = filtered.filter(track => 
        track.genre && criteria.genres!.includes(track.genre)
      );
    }

    // Filter by search text
    if (criteria.searchText && criteria.searchText.trim()) {
      const searchLower = criteria.searchText.toLowerCase().trim();
      filtered = filtered.filter(track =>
        track.title.toLowerCase().includes(searchLower) ||
        track.artist?.toLowerCase().includes(searchLower) ||
        track.fileName.toLowerCase().includes(searchLower)
      );
    }

    // Filter by minimum rating
    if (criteria.minRating !== undefined) {
      filtered = filtered.filter(track => 
        track.rating !== undefined && track.rating >= criteria.minRating!
      );
    }

    return filtered;
  }

  /**
   * Learn from user feedback to update preferences
   * Adjusts genre weights based on like/dislike feedback
   */
  learnFromFeedback(
    feedback: MusicFeedback,
    currentPreferences: UserPreferences
  ): UserPreferences {
    const updatedPreferences = { ...currentPreferences };
    
    // Find the music genre from feedback
    // Note: In real implementation, we'd look up the music by ID
    // For now, we adjust based on the feedback type
    
    const learningRate = 0.1;
    
    // Clone genre preferences
    const genrePrefs = [...(currentPreferences.genrePreferences || [])];
    
    // Adjust weights based on feedback
    // This is a simplified learning algorithm
    if (feedback.feedbackType === 'like') {
      // Increase weight for positive feedback
      // In real implementation, we'd know the genre of the liked music
      genrePrefs.forEach(pref => {
        if (pref.weight < 1.0) {
          pref.weight = Math.min(1.0, pref.weight + learningRate);
        }
      });
    } else if (feedback.feedbackType === 'dislike') {
      // Decrease weight for negative feedback
      genrePrefs.forEach(pref => {
        if (pref.weight > 0.1) {
          pref.weight = Math.max(0.1, pref.weight - learningRate);
        }
      });
    }
    // Skip feedback doesn't change preferences much
    
    updatedPreferences.genrePreferences = genrePrefs;
    updatedPreferences.updatedAt = Date.now();
    
    return updatedPreferences;
  }

  /**
   * Get recommended volume for a state
   */
  getRecommendedVolume(currentState: UserStateType): { min: number; max: number } {
    const strategy = this.strategies.get(currentState);
    return strategy?.volumeRange || { min: 45, max: 55 };
  }

  /**
   * Get strategy goal description
   */
  getStrategyGoal(currentState: UserStateType): string {
    const strategy = this.strategies.get(currentState);
    return strategy?.goal || 'Maintain current state';
  }
}

// Export singleton instance
export const musicRecommendationService = new MusicRecommendationService();

/**
 * Music Related Type Definitions
 * Corresponds to PRD Section 3.1: Local Music Upload and BPM Analysis
 */

import { UUID, Timestamp } from './common';

/**
 * Music File Format
 */
export enum MusicFormat {
  MP3 = 'mp3',
  WAV = 'wav',
  OGG = 'ogg',
  AAC = 'aac',
  FLAC = 'flac'
}

/**
 * Music Type/Genre
 * Corresponds to PRD Section 3.1.6: Music Style Preference Settings
 */
export enum MusicGenre {
  CLASSICAL = 'classical',      // Classical
  POP = 'pop',                  // Pop
  JAZZ = 'jazz',                // Jazz
  ELECTRONIC = 'electronic',    // Electronic
  AMBIENT = 'ambient',          // Ambient/White Noise
  NATURE = 'nature',            // Nature Sounds
  INSTRUMENTAL = 'instrumental' // Instrumental
}

/**
 * Music Metadata
 * Corresponds to PRD Section 3.1 Data Storage Structure
 */
export interface MusicMetadata {
  /** Unique identifier */
  id: UUID;
  
  /** File name */
  fileName: string;
  
  /** Music title */
  title: string;
  
  /** Artist */
  artist?: string;
  
  /** BPM (Beats Per Minute) */
  bpm: number | null;
  
  /** Duration (seconds) */
  duration: number;
  
  /** File size (bytes) */
  fileSize: number;
  
  /** File format */
  format: MusicFormat;
  
  /** Music genre */
  genre?: MusicGenre;
  
  /** Upload date */
  uploadDate: Timestamp;
  
  /** Audio data (IndexedDB storage) */
  audioBlob: Blob;
  
  /** Cover image URL */
  coverUrl?: string;
  
  /** User rating (1-5) */
  rating?: number;
  
  /** Play count */
  playCount: number;
}

/**
 * BPM Detection Result
 */
export interface BPMDetectionResult {
  /** Detected BPM */
  bpm: number | null;
  
  /** Detection confidence (0-1) */
  confidence: number;
  
  /** Processing time (milliseconds) */
  processingTime: number;
  
  /** Whether detection succeeded */
  success: boolean;
  
  /** Error message */
  error?: string;
}

/**
 * Music Upload Progress
 */
export interface MusicUploadProgress {
  /** File ID */
  fileId: UUID;
  
  /** Upload progress (0-100) */
  progress: number;
  
  /** Current stage */
  stage: 'uploading' | 'parsing' | 'analyzing' | 'complete' | 'error';
  
  /** Stage description */
  message: string;
}

/**
 * Music Filter Criteria
 */
export interface MusicFilterCriteria {
  /** BPM range */
  bpmRange?: {
    min: number;
    max: number;
  };
  
  /** Music genres */
  genres?: MusicGenre[];
  
  /** Search keyword */
  searchText?: string;
  
  /** Minimum rating */
  minRating?: number;
}

/**
 * Playlist
 */
export interface Playlist {
  id: UUID;
  name: string;
  description?: string;
  musicIds: UUID[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

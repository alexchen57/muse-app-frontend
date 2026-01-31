/**
 * BPM Detection Service
 * Corresponds to PRD Section 3.1: Local Music Upload and BPM Analysis
 * 
 * Responsibilities:
 * - Audio file parsing using Web Audio API
 * - Automatic BPM detection via onset detection and autocorrelation
 * - Background processing to avoid UI blocking
 * 
 * Algorithm:
 * 1. Decode audio file to AudioBuffer
 * 2. Apply low-pass filter to isolate bass/kick frequencies
 * 3. Calculate energy envelope using spectral flux
 * 4. Detect onsets (beat candidates)
 * 5. Use autocorrelation to find periodicity
 * 6. Convert to BPM and validate against expected range
 */

import { BPMDetectionResult } from '../types/music';

/**
 * BPM Detection Service Interface
 */
export interface IBPMDetectionService {
  /**
   * Detect BPM from audio file
   * @param audioBlob - Audio file Blob object
   * @returns BPM detection result
   */
  detectBPM(audioBlob: Blob): Promise<BPMDetectionResult>;
  
  /**
   * Detect BPM from audio buffer
   * @param audioBuffer - Web Audio API AudioBuffer
   * @returns BPM detection result
   */
  detectBPMFromBuffer(audioBuffer: AudioBuffer): Promise<BPMDetectionResult>;
  
  /**
   * Batch detect BPM for multiple audio files
   * @param audioBlobs - Array of audio file Blobs
   * @returns Array of BPM detection results
   */
  batchDetectBPM(audioBlobs: Blob[]): Promise<BPMDetectionResult[]>;
  
  /**
   * Cancel ongoing BPM detection
   */
  cancelDetection(): void;
  
  /**
   * Validate audio file format
   * @param file - File object
   * @returns Whether format is supported
   */
  validateAudioFile(file: File): boolean;
}

/**
 * BPM Detection Configuration
 */
export interface BPMDetectionConfig {
  /** BPM detection range */
  bpmRange: {
    min: number;
    max: number;
  };
  
  /** Use Web Worker (reserved for future implementation) */
  useWebWorker: boolean;
  
  /** Timeout (milliseconds) */
  timeout: number;
  
  /** FFT size for frequency analysis */
  fftSize: number;
  
  /** Low-pass filter cutoff frequency (Hz) */
  lowPassCutoff: number;
  
  /** Analysis sample length (seconds) - analyze first N seconds */
  sampleLength: number;
}

/**
 * Default BPM Detection Configuration
 */
export const DEFAULT_BPM_CONFIG: BPMDetectionConfig = {
  bpmRange: {
    min: 60,
    max: 180
  },
  useWebWorker: true,
  timeout: 30000, // 30 seconds
  fftSize: 2048,
  lowPassCutoff: 150, // Focus on bass/kick drum frequencies
  sampleLength: 30 // Analyze first 30 seconds for efficiency
};

/**
 * Supported audio formats
 */
const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'];
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a'];

/**
 * BPM Detection Service Implementation
 * Uses Web Audio API for audio analysis and onset detection with autocorrelation for tempo estimation
 */
export class BPMDetectionService implements IBPMDetectionService {
  private audioContext: AudioContext | null = null;
  private config: BPMDetectionConfig;
  private isCancelled: boolean = false;

  constructor(config: Partial<BPMDetectionConfig> = {}) {
    this.config = { ...DEFAULT_BPM_CONFIG, ...config };
  }

  /**
   * Get or create AudioContext
   */
  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  /**
   * Validate audio file format
   */
  validateAudioFile(file: File): boolean {
    // Check MIME type
    if (file.type && SUPPORTED_FORMATS.includes(file.type)) {
      return true;
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    return SUPPORTED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  }

  /**
   * Load audio file and decode to AudioBuffer
   */
  async loadAudioFile(file: File): Promise<AudioBuffer> {
    const audioContext = this.getAudioContext();
    const arrayBuffer = await file.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  }

  /**
   * Detect BPM from audio Blob
   */
  async detectBPM(audioBlob: Blob): Promise<BPMDetectionResult> {
    const startTime = performance.now();
    this.isCancelled = false;

    try {
      const audioContext = this.getAudioContext();
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      if (this.isCancelled) {
        return this.createCancelledResult(startTime);
      }

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return await this.detectBPMFromBuffer(audioBuffer);
    } catch (error) {
      return {
        bpm: null,
        confidence: 0,
        processingTime: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during BPM detection'
      };
    }
  }

  /**
   * Detect BPM from AudioBuffer using onset detection and autocorrelation
   */
  async detectBPMFromBuffer(audioBuffer: AudioBuffer): Promise<BPMDetectionResult> {
    const startTime = performance.now();
    this.isCancelled = false;

    try {
      // Get mono channel data
      const channelData = this.getMixedChannelData(audioBuffer);
      
      if (this.isCancelled) {
        return this.createCancelledResult(startTime);
      }

      // Limit analysis to first N seconds for performance
      const sampleRate = audioBuffer.sampleRate;
      const maxSamples = Math.min(
        channelData.length,
        Math.floor(this.config.sampleLength * sampleRate)
      );
      const analysisData = channelData.slice(0, maxSamples);

      // Step 1: Apply low-pass filter to isolate bass frequencies
      const filteredData = this.applyLowPassFilter(analysisData, sampleRate);
      
      if (this.isCancelled) {
        return this.createCancelledResult(startTime);
      }

      // Step 2: Calculate energy envelope
      const energyEnvelope = this.calculateEnergyEnvelope(filteredData, sampleRate);
      
      if (this.isCancelled) {
        return this.createCancelledResult(startTime);
      }

      // Step 3: Detect onsets using spectral flux
      const onsets = this.detectOnsets(energyEnvelope);
      
      if (this.isCancelled) {
        return this.createCancelledResult(startTime);
      }

      // Step 4: Calculate inter-onset intervals
      const intervals = this.calculateIntervals(onsets);
      
      if (intervals.length < 4) {
        // Not enough beats detected, try autocorrelation method
        return this.detectBPMByAutocorrelation(energyEnvelope, sampleRate, startTime);
      }

      // Step 5: Find most common interval (tempo)
      const { bpm, confidence } = this.findDominantTempo(intervals, sampleRate, energyEnvelope.length);

      const processingTime = performance.now() - startTime;

      return {
        bpm: Math.round(bpm),
        confidence,
        processingTime,
        success: true
      };
    } catch (error) {
      return {
        bpm: null,
        confidence: 0,
        processingTime: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during BPM detection'
      };
    }
  }

  /**
   * Mix all channels to mono
   */
  private getMixedChannelData(audioBuffer: AudioBuffer): Float32Array {
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const mixed = new Float32Array(length);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        mixed[i] += channelData[i] / numChannels;
      }
    }

    return mixed;
  }

  /**
   * Apply simple low-pass filter to isolate bass frequencies
   * Uses a moving average filter as a simple low-pass
   */
  private applyLowPassFilter(data: Float32Array, sampleRate: number): Float32Array {
    // Calculate filter window size based on cutoff frequency
    const cutoffHz = this.config.lowPassCutoff;
    const windowSize = Math.floor(sampleRate / cutoffHz);
    
    const filtered = new Float32Array(data.length);
    let sum = 0;

    // Initialize window
    for (let i = 0; i < windowSize && i < data.length; i++) {
      sum += Math.abs(data[i]);
    }

    for (let i = 0; i < data.length; i++) {
      filtered[i] = sum / windowSize;
      
      // Slide window
      if (i >= windowSize) {
        sum -= Math.abs(data[i - windowSize]);
      }
      if (i + windowSize < data.length) {
        sum += Math.abs(data[i + windowSize]);
      }
    }

    return filtered;
  }

  /**
   * Calculate energy envelope using windowed RMS
   */
  private calculateEnergyEnvelope(data: Float32Array, sampleRate: number): Float32Array {
    // Use ~10ms windows for energy calculation
    const windowSize = Math.floor(sampleRate * 0.01);
    const hopSize = Math.floor(windowSize / 2);
    const numFrames = Math.floor((data.length - windowSize) / hopSize);
    
    const envelope = new Float32Array(numFrames);

    for (let frame = 0; frame < numFrames; frame++) {
      const start = frame * hopSize;
      let sum = 0;
      
      for (let i = 0; i < windowSize; i++) {
        const sample = data[start + i];
        sum += sample * sample;
      }
      
      envelope[frame] = Math.sqrt(sum / windowSize);
    }

    return envelope;
  }

  /**
   * Detect onsets using spectral flux (difference between consecutive frames)
   */
  private detectOnsets(envelope: Float32Array): number[] {
    const onsets: number[] = [];
    
    // Calculate spectral flux (positive differences)
    const flux = new Float32Array(envelope.length);
    for (let i = 1; i < envelope.length; i++) {
      const diff = envelope[i] - envelope[i - 1];
      flux[i] = Math.max(0, diff);
    }

    // Calculate adaptive threshold using moving median
    const windowSize = 10;
    const multiplier = 1.5;
    
    for (let i = windowSize; i < flux.length - windowSize; i++) {
      // Get local window
      const window: number[] = [];
      for (let j = i - windowSize; j <= i + windowSize; j++) {
        window.push(flux[j]);
      }
      window.sort((a, b) => a - b);
      const median = window[Math.floor(window.length / 2)];
      const threshold = median * multiplier + 0.001;

      // Detect onset if flux exceeds threshold and is a local maximum
      if (flux[i] > threshold && 
          flux[i] > flux[i - 1] && 
          flux[i] >= flux[i + 1]) {
        onsets.push(i);
      }
    }

    return onsets;
  }

  /**
   * Calculate intervals between consecutive onsets
   */
  private calculateIntervals(onsets: number[]): number[] {
    const intervals: number[] = [];
    
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i - 1]);
    }

    return intervals;
  }

  /**
   * Find dominant tempo from intervals using histogram analysis
   */
  private findDominantTempo(
    intervals: number[], 
    sampleRate: number,
    envelopeLength: number
  ): { bpm: number; confidence: number } {
    const hopSize = Math.floor(sampleRate * 0.01 / 2); // Same as in calculateEnergyEnvelope
    
    // Convert intervals to BPM
    const bpms = intervals.map(interval => {
      const seconds = (interval * hopSize) / sampleRate;
      return 60 / seconds;
    }).filter(bpm => bpm >= this.config.bpmRange.min && bpm <= this.config.bpmRange.max);

    if (bpms.length === 0) {
      return { bpm: 120, confidence: 0.3 }; // Default fallback
    }

    // Create histogram with 1 BPM resolution
    const histogram = new Map<number, number>();
    const tolerance = 2; // Group BPMs within 2 BPM

    for (const bpm of bpms) {
      const rounded = Math.round(bpm);
      
      // Find closest existing bin or create new one
      let found = false;
      for (const [key, value] of histogram) {
        if (Math.abs(key - rounded) <= tolerance) {
          histogram.set(key, value + 1);
          found = true;
          break;
        }
      }
      
      if (!found) {
        histogram.set(rounded, 1);
      }
    }

    // Find peak in histogram
    let maxCount = 0;
    let dominantBPM = 120;
    
    for (const [bpm, count] of histogram) {
      if (count > maxCount) {
        maxCount = count;
        dominantBPM = bpm;
      }
    }

    // Calculate confidence based on histogram peak prominence
    const confidence = Math.min(0.95, maxCount / bpms.length + 0.3);

    // Check for double/half time
    const halfTime = dominantBPM / 2;
    const doubleTime = dominantBPM * 2;
    
    if (halfTime >= this.config.bpmRange.min && histogram.has(Math.round(halfTime))) {
      const halfTimeCount = histogram.get(Math.round(halfTime)) || 0;
      if (halfTimeCount > maxCount * 0.7) {
        // Likely detecting double time, use half
        dominantBPM = halfTime;
      }
    }

    // Ensure BPM is in valid range
    let finalBPM = dominantBPM;
    while (finalBPM < this.config.bpmRange.min) finalBPM *= 2;
    while (finalBPM > this.config.bpmRange.max) finalBPM /= 2;

    return { bpm: finalBPM, confidence };
  }

  /**
   * Alternative BPM detection using autocorrelation
   * Used when onset detection doesn't find enough beats
   */
  private detectBPMByAutocorrelation(
    envelope: Float32Array, 
    sampleRate: number,
    startTime: number
  ): BPMDetectionResult {
    const hopSize = Math.floor(sampleRate * 0.01 / 2);
    
    // Calculate autocorrelation for lag values corresponding to BPM range
    const minLag = Math.floor((60 / this.config.bpmRange.max) * sampleRate / hopSize);
    const maxLag = Math.floor((60 / this.config.bpmRange.min) * sampleRate / hopSize);
    
    // Normalize envelope
    let mean = 0;
    for (let i = 0; i < envelope.length; i++) {
      mean += envelope[i];
    }
    mean /= envelope.length;
    
    const normalized = new Float32Array(envelope.length);
    for (let i = 0; i < envelope.length; i++) {
      normalized[i] = envelope[i] - mean;
    }

    // Calculate autocorrelation
    let maxCorrelation = 0;
    let bestLag = minLag;
    
    for (let lag = minLag; lag <= maxLag && lag < envelope.length / 2; lag++) {
      let correlation = 0;
      let norm1 = 0;
      let norm2 = 0;
      
      for (let i = 0; i < envelope.length - lag; i++) {
        correlation += normalized[i] * normalized[i + lag];
        norm1 += normalized[i] * normalized[i];
        norm2 += normalized[i + lag] * normalized[i + lag];
      }
      
      const normalizedCorrelation = correlation / (Math.sqrt(norm1 * norm2) + 1e-10);
      
      if (normalizedCorrelation > maxCorrelation) {
        maxCorrelation = normalizedCorrelation;
        bestLag = lag;
      }
    }

    // Convert lag to BPM
    const lagSeconds = (bestLag * hopSize) / sampleRate;
    let bpm = 60 / lagSeconds;
    
    // Ensure BPM is in valid range
    while (bpm < this.config.bpmRange.min) bpm *= 2;
    while (bpm > this.config.bpmRange.max) bpm /= 2;

    const confidence = Math.min(0.85, maxCorrelation * 0.5 + 0.35);

    return {
      bpm: Math.round(bpm),
      confidence,
      processingTime: performance.now() - startTime,
      success: true
    };
  }

  /**
   * Batch detect BPM for multiple files
   */
  async batchDetectBPM(audioBlobs: Blob[]): Promise<BPMDetectionResult[]> {
    const results: BPMDetectionResult[] = [];
    
    for (const blob of audioBlobs) {
      if (this.isCancelled) {
        results.push(this.createCancelledResult(performance.now()));
        continue;
      }
      
      const result = await this.detectBPM(blob);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Cancel ongoing detection
   */
  cancelDetection(): void {
    this.isCancelled = true;
  }

  /**
   * Create cancelled result
   */
  private createCancelledResult(startTime: number): BPMDetectionResult {
    return {
      bpm: null,
      confidence: 0,
      processingTime: performance.now() - startTime,
      success: false,
      error: 'Detection cancelled'
    };
  }

  /**
   * Close audio context and release resources
   */
  dispose(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Export singleton instance
export const bpmDetectionService = new BPMDetectionService();

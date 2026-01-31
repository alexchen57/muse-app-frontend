import { useRef, useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';

/**
 * Fade duration in milliseconds (per PRD requirement: 2 seconds)
 */
const FADE_DURATION = 2000;
const FADE_INTERVAL = 50; // Update every 50ms

/**
 * Format duration in seconds to mm:ss
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function MusicPlayer() {
  // Store state
  const { 
    currentMusic, 
    isPlaying, 
    volume,
    setIsPlaying,
    setVolume 
  } = useAppStore();

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Local state for UI
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

  // Create object URL for audio blob when music changes
  useEffect(() => {
    if (currentMusic?.audioBlob) {
      const url = URL.createObjectURL(currentMusic.audioBlob);
      setAudioUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setAudioUrl(null);
    }
  }, [currentMusic]);

  // Fade in effect
  const fadeIn = useCallback(() => {
    if (!audioRef.current) return;
    
    setIsFading(true);
    const targetVolume = volume;
    const steps = FADE_DURATION / FADE_INTERVAL;
    const volumeStep = targetVolume / steps;
    let currentVol = 0;
    
    audioRef.current.volume = 0;
    audioRef.current.play().catch(console.error);
    
    fadeIntervalRef.current = setInterval(() => {
      currentVol += volumeStep;
      if (audioRef.current) {
        audioRef.current.volume = Math.min(currentVol, targetVolume);
      }
      
      if (currentVol >= targetVolume) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
        setIsFading(false);
      }
    }, FADE_INTERVAL);
  }, [volume]);

  // Fade out effect
  const fadeOut = useCallback(() => {
    if (!audioRef.current) return;
    
    setIsFading(true);
    const startVolume = audioRef.current.volume;
    const steps = FADE_DURATION / FADE_INTERVAL;
    const volumeStep = startVolume / steps;
    let currentVol = startVolume;
    
    fadeIntervalRef.current = setInterval(() => {
      currentVol -= volumeStep;
      if (audioRef.current) {
        audioRef.current.volume = Math.max(0, currentVol);
      }
      
      if (currentVol <= 0) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
        }
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsFading(false);
      }
    }, FADE_INTERVAL);
  }, []);

  // Handle play/pause with fade
  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;
    
    // Clear any existing fade
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }
    
    if (isPlaying) {
      fadeIn();
    } else {
      fadeOut();
    }
    
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, [isPlaying, audioUrl, fadeIn, fadeOut]);

  // Update volume (without fade)
  useEffect(() => {
    if (audioRef.current && !isFading) {
      audioRef.current.volume = volume;
    }
  }, [volume, isFading]);

  // Toggle play/pause
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  }, [setVolume]);

  // Handle seek
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  // Update current time
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  // Handle audio loaded
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  // Handle audio ended
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [setIsPlaying]);

  // Derived values
  const displayVolume = Math.round(volume * 100);
  const hasMusic = currentMusic !== null;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(71, 85, 105, 0.5)'
    }}>
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Album Art / Placeholder */}
        <div style={{
          width: '80px',
          height: '80px',
          background: hasMusic 
            ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
            : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {currentMusic?.coverUrl ? (
            <img 
              src={currentMusic.coverUrl} 
              alt="Album art"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>{hasMusic ? '🎵' : '🎧'}</span>
          )}
          {isFading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              {isPlaying ? '⏫' : '⏬'}
            </div>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          {/* Track Info */}
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
            {hasMusic ? currentMusic.title : 'No Track Selected'}
          </div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px' }}>
            {hasMusic 
              ? `${currentMusic.artist || 'Unknown Artist'} • ${currentMusic.bpm || '?'} BPM`
              : 'Waiting for recommendation...'}
          </div>
          
          {/* Progress Bar */}
          {hasMusic && (
            <div style={{ marginBottom: '12px' }}>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={!hasMusic}
                style={{
                  width: '100%',
                  height: '4px',
                  appearance: 'none',
                  background: `linear-gradient(to right, #8b5cf6 ${progress}%, #475569 ${progress}%)`,
                  borderRadius: '2px',
                  cursor: hasMusic ? 'pointer' : 'default'
                }}
              />
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '11px', 
                color: '#64748b',
                marginTop: '4px'
              }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
          
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Play/Pause Button */}
            <button 
              onClick={handlePlayPause}
              disabled={!hasMusic}
              style={{
                width: '48px',
                height: '48px',
                background: hasMusic ? 'white' : '#475569',
                color: '#0f172a',
                border: 'none',
                borderRadius: '50%',
                fontSize: '18px',
                cursor: hasMusic ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: hasMusic ? 1 : 0.5,
                transition: 'transform 0.1s ease'
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            
            {/* Volume Control */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                {displayVolume === 0 ? '🔇' : displayVolume < 50 ? '🔉' : '🔊'}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                style={{
                  flex: 1,
                  height: '4px',
                  appearance: 'none',
                  background: `linear-gradient(to right, white ${displayVolume}%, #475569 ${displayVolume}%)`,
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ 
                fontSize: '12px', 
                color: '#94a3b8', 
                width: '32px', 
                textAlign: 'right' 
              }}>
                {displayVolume}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* State-based recommendation indicator */}
      {hasMusic && currentMusic.genre && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(71, 85, 105, 0.3)',
          fontSize: '12px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🎯</span>
          <span>
            Recommended based on your current state • Genre: {currentMusic.genre}
          </span>
        </div>
      )}
    </div>
  );
}

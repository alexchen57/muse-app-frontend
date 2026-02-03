import { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Volume1, Music, Headphones, ArrowUp, ArrowDown, Target } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

/**
 * Fade duration in milliseconds (per PRD requirement: 2 seconds)
 */
const FADE_DURATION = 2000;
const FADE_INTERVAL = 50;

/**
 * Format duration in seconds to mm:ss
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function MusicPlayer() {
  const { 
    currentMusic, 
    isPlaying, 
    volume,
    setIsPlaying,
    setVolume 
  } = useAppStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

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

  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;
    
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

  useEffect(() => {
    if (audioRef.current && !isFading) {
      audioRef.current.volume = volume;
    }
  }, [volume, isFading]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  }, [setVolume]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [setIsPlaying]);

  const displayVolume = Math.round(volume * 100);
  const hasMusic = currentMusic !== null;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const VolumeIcon = displayVolume === 0 ? VolumeX : displayVolume < 50 ? Volume1 : Volume2;

  return (
    <div style={{
      background: 'var(--card)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--beige)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease'
    }}>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Album Art / Placeholder */}
        <div style={{
          width: '80px',
          height: '80px',
          background: hasMusic 
            ? 'linear-gradient(135deg, #E07A5F 0%, #F4A261 100%)'
            : 'linear-gradient(135deg, var(--beige) 0%, var(--beige-light) 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: hasMusic ? '0 4px 12px rgba(224, 122, 95, 0.3)' : 'none'
        }}>
          {currentMusic?.coverUrl ? (
            <img 
              src={currentMusic.coverUrl} 
              alt="Album art"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            hasMusic ? <Music size={32} style={{ color: 'white' }} /> : <Headphones size={32} style={{ color: 'var(--text-muted)' }} />
          )}
          {isFading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isPlaying ? <ArrowUp size={18} style={{ color: 'white' }} /> : <ArrowDown size={18} style={{ color: 'white' }} />}
            </div>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          {/* Track Info */}
          <div style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '4px',
            color: 'var(--text-dark)'
          }}>
            {hasMusic ? currentMusic.title : 'No Track Selected'}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--text-muted)', 
            marginBottom: '16px' 
          }}>
            {hasMusic 
              ? `${currentMusic.artist || 'Unknown Artist'} • ${currentMusic.bpm || '?'} BPM`
              : 'Waiting for recommendation...'}
          </div>
          
          {/* Progress Bar */}
          {hasMusic && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ position: 'relative', height: '6px' }}>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  disabled={!hasMusic}
                  style={{
                    width: '100%',
                    height: '6px',
                    appearance: 'none',
                    background: 'var(--beige)',
                    borderRadius: '3px',
                    cursor: hasMusic ? 'pointer' : 'default',
                    position: 'relative',
                    zIndex: 1
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '6px',
                  width: `${progress}%`,
                  background: '#E07A5F',
                  borderRadius: '3px',
                  pointerEvents: 'none'
                }} />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '12px', 
                color: 'var(--text-muted)',
                marginTop: '6px'
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
                width: '52px',
                height: '52px',
                background: hasMusic ? '#E07A5F' : 'var(--beige)',
                color: hasMusic ? 'white' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '50%',
                fontSize: '18px',
                cursor: hasMusic ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: hasMusic ? 1 : 0.5,
                transition: 'all 0.2s ease',
                boxShadow: hasMusic ? '0 4px 12px rgba(224, 122, 95, 0.3)' : 'none'
              }}
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
            </button>
            
            {/* Volume Control */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <VolumeIcon size={18} style={{ color: 'var(--text-muted)' }} />
              <div style={{ flex: 1, position: 'relative', height: '6px' }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  style={{
                    width: '100%',
                    height: '6px',
                    appearance: 'none',
                    background: 'var(--beige)',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '6px',
                  width: `${displayVolume}%`,
                  background: '#A8DADC',
                  borderRadius: '3px',
                  pointerEvents: 'none'
                }} />
              </div>
              <span style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)', 
                width: '36px', 
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
          borderTop: '1px solid var(--beige)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            background: 'var(--beige-light)',
            borderRadius: '6px'
          }}>
            <Target size={14} style={{ color: '#E07A5F' }} />
          </span>
          <span>
            Recommended based on your current state • Genre: {currentMusic.genre}
          </span>
        </div>
      )}
    </div>
  );
}

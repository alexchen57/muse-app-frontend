import React, { useState, useEffect, useRef } from 'react';
import { Home, History, Music, Settings, Activity, Heart, Brain, Play, Pause, Volume2, TrendingUp, Calendar, Clock } from 'lucide-react';
import { MusicLibraryView } from './src/views/MusicLibraryView';
import { MusicPlayer } from './src/components/MusicPlayer';
import { db } from './src/utils/db';
import { MusicMetadata } from './src/types/music';
import { UserStateType } from './src/types/state';
import { musicRecommendationService } from './src/services/MusicRecommendationService';
import { useAppStore } from './src/stores/useAppStore';

// Simplified state types
type WorkState = 'calm' | 'anxious' | 'focused' | 'distracted';

// Map WorkState to UserStateType
const stateMapping: Record<WorkState, UserStateType> = {
  calm: UserStateType.CALM,
  anxious: UserStateType.STRESSED,
  focused: UserStateType.PRODUCTIVE,
  distracted: UserStateType.DISTRACTED
};

// History record type
interface HistoryRecord {
  timestamp: number;
  heartRate: number;
  mwl: number;
  state: WorkState;
}

class MusicErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  state = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('Music view crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          color: '#fca5a5'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            Music Library failed to load
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            {this.state.errorMessage || 'Unknown error'}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [heartRate, setHeartRate] = useState(75);
  const [mwl, setMwl] = useState(50);
  const [currentState, setCurrentState] = useState<WorkState>('calm');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [musicLibrary, setMusicLibrary] = useState<MusicMetadata[]>([]);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const previousStateRef = useRef<WorkState>(currentState);
  const playHistoryRef = useRef<string[]>([]);

  // Zustand store for music player
  const { 
    setCurrentMusic, 
    setIsPlaying: setStoreIsPlaying,
    currentMusic 
  } = useAppStore();

  // State configuration
  const stateConfig = {
    calm: { emoji: '😌', label: 'Calm', color: '#4CAF50', description: 'Stable heart rate, low MWL, good condition' },
    anxious: { emoji: '😰', label: 'Stressed', color: '#F44336', description: 'Elevated heart rate and MWL, need relaxation' },
    focused: { emoji: '🎯', label: 'Productive', color: '#2196F3', description: 'Moderate heart rate and MWL, high efficiency' },
    distracted: { emoji: '😵', label: 'Distracted', color: '#FF9800', description: 'High MWL but low output, need adjustment' }
  };

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate heart rate fluctuation (60-100 bpm)
      setHeartRate(prev => {
        const change = (Math.random() - 0.5) * 5;
        return Math.max(60, Math.min(100, prev + change));
      });

      // Simulate MWL fluctuation (30-90%)
      setMwl(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(30, Math.min(90, prev + change));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Load music library on mount
  useEffect(() => {
    const loadMusicLibrary = async () => {
      try {
        const music = await db.music.toArray();
        setMusicLibrary(music);
      } catch (error) {
        console.error('Failed to load music library:', error);
      }
    };
    loadMusicLibrary();

    // Refresh music library periodically (in case user uploads new music)
    const refreshInterval = setInterval(loadMusicLibrary, 10000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Determine state based on heart rate and MWL
  useEffect(() => {
    if (heartRate > 85 && mwl > 70) {
      setCurrentState('anxious');
    } else if (heartRate < 75 && mwl < 50) {
      setCurrentState('calm');
    } else if (heartRate >= 75 && heartRate <= 85 && mwl >= 50 && mwl <= 70) {
      setCurrentState('focused');
    } else if (mwl > 70 && heartRate < 75) {
      setCurrentState('distracted');
    }
  }, [heartRate, mwl]);

  // Recommend and play music when state changes
  useEffect(() => {
    if (!autoPlayEnabled || musicLibrary.length === 0) return;
    
    // Only trigger when state actually changes
    if (previousStateRef.current === currentState) return;
    previousStateRef.current = currentState;

    // Map to UserStateType
    const userStateType = stateMapping[currentState];

    // Default user preferences (can be customized later)
    const defaultPreferences = {
      id: 'default',
      userId: 'user',
      genrePreferences: [],
      stateMusicMappings: [],
      volume: volume,
      autoPlay: true,
      fadeEnabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Get recommendation
    const recommendedMusic = musicRecommendationService.recommendMusic(
      userStateType,
      heartRate,
      musicLibrary,
      defaultPreferences,
      playHistoryRef.current
    );

    if (recommendedMusic) {
      // Add to play history (keep last 10)
      playHistoryRef.current = [
        recommendedMusic.id,
        ...playHistoryRef.current.slice(0, 9)
      ];

      // Set music and start playing
      setCurrentMusic(recommendedMusic);
      setStoreIsPlaying(true);
      
      console.log(`State changed to ${currentState}, playing: ${recommendedMusic.title} (${recommendedMusic.bpm} BPM)`);
    }
  }, [currentState, musicLibrary, autoPlayEnabled, heartRate, volume, setCurrentMusic, setStoreIsPlaying]);

  // Record history data
  useEffect(() => {
    const recordInterval = setInterval(() => {
      const record: HistoryRecord = {
        timestamp: Date.now(),
        heartRate,
        mwl,
        state: currentState
      };
      setHistory(prev => {
        const newHistory = [...prev, record];
        // Keep only the last 100 records
        return newHistory.slice(-100);
      });
    }, 5000); // Record every 5 seconds

    return () => clearInterval(recordInterval);
  }, [heartRate, mwl, currentState]);

  const currentStateInfo = stateConfig[currentState];

  // Calculate statistics
  const stats = history.length > 0 ? {
    avgHeartRate: Math.round(history.reduce((sum, r) => sum + r.heartRate, 0) / history.length),
    avgMwl: Math.round(history.reduce((sum, r) => sum + r.mwl, 0) / history.length),
    maxHeartRate: Math.round(Math.max(...history.map(r => r.heartRate))),
    minHeartRate: Math.round(Math.min(...history.map(r => r.heartRate))),
    maxMwl: Math.round(Math.max(...history.map(r => r.mwl))),
    minMwl: Math.round(Math.min(...history.map(r => r.mwl))),
    stateDistribution: {
      calm: history.filter(r => r.state === 'calm').length,
      anxious: history.filter(r => r.state === 'anxious').length,
      focused: history.filter(r => r.state === 'focused').length,
      distracted: history.filter(r => r.state === 'distracted').length,
    }
  } : null;

  // Format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, letterSpacing: '0.5px' }}>MUSE</h1>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Multi-sensory Emotional Regulation System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Sidebar Navigation */}
          <aside style={{ width: '240px', flexShrink: 0 }}>
            <nav style={{
              background: 'rgba(30, 41, 59, 0.5)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              position: 'sticky',
              top: '100px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'home', icon: Home, label: 'Real-time Monitoring' },
                  { id: 'history', icon: History, label: 'History' },
                  { id: 'music', icon: Music, label: 'Music Library' },
                  { id: 'settings', icon: Settings, label: 'Settings' }
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setCurrentView(id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: currentView === id ? '#3b82f6' : 'transparent',
                      color: currentView === id ? 'white' : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit'
                    }}
                    onMouseEnter={(e) => {
                      if (currentView !== id) {
                        e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentView !== id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px' }} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </aside>

          {/* Main View */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {currentView === 'home' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Device Status */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.3)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Heart style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Heart Rate Sensor</div>
                      <div style={{ fontSize: '12px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          background: '#4ade80',
                          display: 'inline-block'
                        }} />
                        Connected • 85%
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(30, 41, 59, 0.3)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Brain style={{ width: '20px', height: '20px', color: '#8b5cf6' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>MWL Monitoring Device</div>
                      <div style={{ fontSize: '12px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          background: '#4ade80',
                          display: 'inline-block'
                        }} />
                        Connected • 90%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                  {/* Heart Rate Card */}
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderLeft: '4px solid #ef4444'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Heart style={{ width: '18px', height: '18px', color: '#ef4444' }} />
                      <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>Heart Rate (HR)</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ef4444', lineHeight: 1 }}>
                        {Math.round(heartRate)}
                      </div>
                      <div style={{ fontSize: '18px', color: '#94a3b8' }}>bpm</div>
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#fca5a5'
                    }}>
                      {heartRate < 70 ? 'Low' : heartRate > 85 ? 'High' : 'Normal Range'}
                    </div>
                  </div>

                  {/* MWL Card */}
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    borderLeft: '4px solid #8b5cf6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Brain style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
                      <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>Mental Workload (MWL)</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#8b5cf6', lineHeight: 1 }}>
                        {Math.round(mwl)}
                      </div>
                      <div style={{ fontSize: '18px', color: '#94a3b8' }}>%</div>
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#c4b5fd'
                    }}>
                      {mwl < 40 ? 'Low Load' : mwl > 70 ? 'High Load' : 'Moderate Load'}
                    </div>
                  </div>
                </div>

                {/* State Indicator */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  borderLeft: `4px solid ${currentStateInfo.color}`
                }}>
                  <div style={{ fontSize: '14px', color: '#94a3b8', fontWeight: '500', marginBottom: '20px' }}>
                    Current Work State
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                    <div style={{
                      width: '72px',
                      height: '72px',
                      background: `${currentStateInfo.color}20`,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      flexShrink: 0
                    }}>
                      {currentStateInfo.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: currentStateInfo.color, marginBottom: '8px' }}>
                        {currentStateInfo.label}
                      </div>
                      <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                        Confidence: {Math.round(75 + Math.random() * 20)}%
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: '14px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#cbd5e1',
                    lineHeight: 1.6
                  }}>
                    {currentStateInfo.description}
                  </div>
                </div>

                {/* Music Player with Auto-Recommendation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Auto-play toggle and recommendation info */}
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                        🎯 State-Based Music Recommendation
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {musicLibrary.length === 0 
                          ? 'No music uploaded. Go to Music Library to upload songs.'
                          : `${musicLibrary.length} songs available • Recommending based on "${currentStateInfo.label}" state`
                        }
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>Auto-play</span>
                      <button
                        onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '12px',
                          border: 'none',
                          background: autoPlayEnabled ? '#3b82f6' : '#475569',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: '3px',
                          left: autoPlayEnabled ? '23px' : '3px',
                          transition: 'left 0.2s'
                        }} />
                      </button>
                    </div>
                  </div>

                  {/* Music Player Component */}
                  <MusicErrorBoundary>
                    <MusicPlayer />
                  </MusicErrorBoundary>

                  {/* Recommendation Strategy Info */}
                  {currentMusic && (
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      fontSize: '13px',
                      color: '#93c5fd',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>💡</span>
                      <span>
                        Playing "{currentMusic.title}" ({currentMusic.bpm || '?'} BPM) — 
                        {currentState === 'calm' && ' maintaining your calm state'}
                        {currentState === 'anxious' && ' helping reduce stress with slower tempo'}
                        {currentState === 'focused' && ' supporting your productive flow'}
                        {currentState === 'distracted' && ' boosting alertness with energizing beats'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Music View */}
            {currentView === 'music' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <MusicErrorBoundary>
                  <MusicPlayer />
                  <MusicLibraryView />
                </MusicErrorBoundary>
              </div>
            )}

            {/* Settings View */}
            {currentView === 'settings' && (
              <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '48px',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '72px', marginBottom: '24px' }}>
                  {'⚙️'}
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>
                  {'System Settings'}
                </h2>
                <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '32px' }}>
                  {'Feature under development...'}
                </p>
              </div>
            )}

            {/* History View */}
            {currentView === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>History Data Analysis</h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                      Records: {history.length} entries • Data updates every 5 seconds
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
                    <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
                      {history.length > 0 ? formatDate(history[0].timestamp) : 'No data yet'}
                    </span>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '64px 48px',
                    border: '1px solid rgba(71, 85, 105, 0.5)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Waiting for data recording...</h3>
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>System records data every 5 seconds, please wait</p>
                  </div>
                ) : (
                  <>
                    {/* Statistics Cards */}
                    {stats && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        <div style={{
                          background: 'rgba(30, 41, 59, 0.5)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          padding: '20px',
                          border: '1px solid rgba(71, 85, 105, 0.5)',
                          borderLeft: '4px solid #ef4444'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Heart style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Avg Heart Rate</span>
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444', marginBottom: '4px' }}>
                            {stats.avgHeartRate}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Range: {stats.minHeartRate}-{stats.maxHeartRate} bpm
                          </div>
                        </div>

                        <div style={{
                          background: 'rgba(30, 41, 59, 0.5)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          padding: '20px',
                          border: '1px solid rgba(71, 85, 105, 0.5)',
                          borderLeft: '4px solid #8b5cf6'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Brain style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />
                            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Avg MWL</span>
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
                            {stats.avgMwl}%
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Range: {stats.minMwl}-{stats.maxMwl}%
                          </div>
                        </div>

                        <div style={{
                          background: 'rgba(30, 41, 59, 0.5)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          padding: '20px',
                          border: '1px solid rgba(71, 85, 105, 0.5)',
                          borderLeft: '4px solid #3b82f6'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <TrendingUp style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Max Heart Rate</span>
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                            {stats.maxHeartRate}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            bpm
                          </div>
                        </div>

                        <div style={{
                          background: 'rgba(30, 41, 59, 0.5)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          padding: '20px',
                          border: '1px solid rgba(71, 85, 105, 0.5)',
                          borderLeft: '4px solid #06b6d4'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Clock style={{ width: '16px', height: '16px', color: '#06b6d4' }} />
                            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Recording Duration</span>
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#06b6d4', marginBottom: '4px' }}>
                            {Math.floor((history.length * 5) / 60)}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            minutes
                          </div>
                        </div>
                      </div>
                    )}

                    {/* State Distribution */}
                    {stats && (
                      <div style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(71, 85, 105, 0.5)'
                      }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>State Distribution</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                          {Object.entries(stats.stateDistribution).map(([state, count]) => {
                            const stateInfo = stateConfig[state as WorkState];
                            const percentage = history.length > 0 ? Math.round((count / history.length) * 100) : 0;
                            return (
                              <div key={state} style={{
                                background: 'rgba(15, 23, 42, 0.5)',
                                borderRadius: '12px',
                                padding: '16px',
                                border: `1px solid ${stateInfo.color}30`
                              }}>
                                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stateInfo.emoji}</div>
                                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px', color: stateInfo.color }}>
                                  {stateInfo.label}
                                </div>
                                <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>
                                  {count} times
                                </div>
                                <div style={{
                                  width: '100%',
                                  height: '4px',
                                  background: 'rgba(71, 85, 105, 0.5)',
                                  borderRadius: '2px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    background: stateInfo.color,
                                    transition: 'width 0.3s'
                                  }} />
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                  {percentage}%
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Simple Chart */}
                    <div style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid rgba(71, 85, 105, 0.5)'
                    }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>Data Trend Chart</h3>
                      <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                        {history.slice(-30).map((record, index) => (
                          <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                            <div style={{
                              width: '100%',
                              height: `${(record.heartRate - 60) / 40 * 100}%`,
                              minHeight: '10px',
                              background: 'linear-gradient(to top, #ef4444, #fca5a5)',
                              borderRadius: '2px 2px 0 0',
                              opacity: 0.8
                            }} />
                            <div style={{
                              width: '100%',
                              height: `${record.mwl}%`,
                              minHeight: '10px',
                              background: 'linear-gradient(to top, #8b5cf6, #c4b5fd)',
                              borderRadius: '2px 2px 0 0',
                              opacity: 0.8
                            }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }} />
                          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Heart Rate (HR)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '2px' }} />
                          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Mental Workload (MWL)</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Records Table */}
                    <div style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid rgba(71, 85, 105, 0.5)'
                    }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>Recent Records</h3>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.5)' }}>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Time</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Heart Rate</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>MWL</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>State</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.slice(-10).reverse().map((record, index) => {
                              const stateInfo = stateConfig[record.state];
                              return (
                                <tr key={index} style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.3)' }}>
                                  <td style={{ padding: '12px', fontSize: '14px', color: '#cbd5e1' }}>
                                    {formatTime(record.timestamp)}
                                  </td>
                                  <td style={{ padding: '12px', fontSize: '14px', color: '#ef4444', fontWeight: '500' }}>
                                    {Math.round(record.heartRate)} bpm
                                  </td>
                                  <td style={{ padding: '12px', fontSize: '14px', color: '#8b5cf6', fontWeight: '500' }}>
                                    {Math.round(record.mwl)}%
                                  </td>
                                  <td style={{ padding: '12px' }}>
                                    <div style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '4px 12px',
                                      background: `${stateInfo.color}20`,
                                      borderRadius: '16px',
                                      fontSize: '13px',
                                      color: stateInfo.color,
                                      fontWeight: '500'
                                    }}>
                                      <span>{stateInfo.emoji}</span>
                                      <span>{stateInfo.label}</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;

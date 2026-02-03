import React, { useState, useEffect, useRef } from 'react';
import { Home, History, Music, Settings, Heart, Brain, TrendingUp, Calendar, Clock, Sun, Moon, Activity, AlertCircle, Target, Zap } from 'lucide-react';
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
  { children: React.ReactNode; isDark: boolean },
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
          background: 'var(--card)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--beige)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#E07A5F' }}>
            Music Library failed to load
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('muse-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const previousStateRef = useRef<WorkState>(currentState);
  const playHistoryRef = useRef<string[]>([]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('muse-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Zustand store for music player
  const { 
    setCurrentMusic, 
    setIsPlaying: setStoreIsPlaying,
    currentMusic 
  } = useAppStore();

  // State configuration with icons instead of emojis
  const stateConfig = {
    calm: { 
      icon: Activity, 
      label: 'Calm', 
      color: '#81B29A', 
      bgColor: '#81B29A',
      description: 'Stable heart rate, low MWL, good condition' 
    },
    anxious: { 
      icon: AlertCircle, 
      label: 'Stressed', 
      color: '#E07A5F', 
      bgColor: '#E07A5F',
      description: 'Elevated heart rate and MWL, need relaxation' 
    },
    focused: { 
      icon: Target, 
      label: 'Productive', 
      color: '#A8DADC', 
      bgColor: '#A8DADC',
      description: 'Moderate heart rate and MWL, high efficiency' 
    },
    distracted: { 
      icon: Zap, 
      label: 'Distracted', 
      color: '#F4A261', 
      bgColor: '#F4A261',
      description: 'High MWL but low output, need adjustment' 
    }
  };

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const change = (Math.random() - 0.5) * 5;
        return Math.max(60, Math.min(100, prev + change));
      });

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
    
    if (previousStateRef.current === currentState) return;
    previousStateRef.current = currentState;

    const userStateType = stateMapping[currentState];

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

    const recommendedMusic = musicRecommendationService.recommendMusic(
      userStateType,
      heartRate,
      musicLibrary,
      defaultPreferences,
      playHistoryRef.current
    );

    if (recommendedMusic) {
      playHistoryRef.current = [
        recommendedMusic.id,
        ...playHistoryRef.current.slice(0, 9)
      ];

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
        return newHistory.slice(-100);
      });
    }, 5000);

    return () => clearInterval(recordInterval);
  }, [heartRate, mwl, currentState]);

  const currentStateInfo = stateConfig[currentState];
  const StateIcon = currentStateInfo.icon;

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

  // Card style helper
  const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid var(--beige)',
    boxShadow: isDarkMode 
      ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      color: 'var(--text-dark)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--beige)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: isDarkMode 
          ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
          : '0 1px 3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #E07A5F 0%, #F4A261 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px rgba(224, 122, 95, 0.2)'
              }}>
                <Heart style={{ width: '24px', height: '24px', color: 'white', fill: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '700', margin: 0, letterSpacing: '0.5px', color: 'var(--text-dark)' }}>MUSE</h1>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Multi-sensory Emotional Regulation System</p>
              </div>
            </div>

            {/* Day/Night Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: isDarkMode ? 'var(--beige)' : 'var(--beige-light)',
                border: '1px solid var(--beige)',
                borderRadius: '12px',
                cursor: 'pointer',
                color: 'var(--text-dark)',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              {isDarkMode ? (
                <>
                  <Sun size={18} style={{ color: '#F4A261' }} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={18} style={{ color: '#6366f1' }} />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Sidebar Navigation */}
          <aside style={{ width: '240px', flexShrink: 0 }}>
            <nav style={{
              background: 'var(--card)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid var(--beige)',
              position: 'sticky',
              top: '100px',
              boxShadow: isDarkMode 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease'
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
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: currentView === id ? '#E07A5F' : 'transparent',
                      color: currentView === id ? 'white' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                      boxShadow: currentView === id ? '0 4px 6px rgba(224, 122, 95, 0.25)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (currentView !== id) {
                        e.currentTarget.style.background = 'var(--beige-light)';
                        e.currentTarget.style.color = 'var(--text-dark)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentView !== id) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
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
                    background: 'var(--card)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid var(--beige)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: isDarkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: isDarkMode ? 'rgba(224, 122, 95, 0.2)' : 'rgba(224, 122, 95, 0.15)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Heart style={{ width: '20px', height: '20px', color: '#E07A5F' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: 'var(--text-dark)' }}>Heart Rate Sensor</div>
                      <div style={{ fontSize: '12px', color: '#81B29A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: '#81B29A',
                          display: 'inline-block',
                          boxShadow: '0 0 6px #81B29A'
                        }} />
                        Connected - 85%
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--card)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid var(--beige)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: isDarkMode ? '0 2px 4px rgba(0, 0, 0, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: isDarkMode ? 'rgba(168, 218, 220, 0.2)' : 'rgba(168, 218, 220, 0.25)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Brain style={{ width: '20px', height: '20px', color: '#7FBFC1' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: 'var(--text-dark)' }}>MWL Monitoring Device</div>
                      <div style={{ fontSize: '12px', color: '#81B29A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: '#81B29A',
                          display: 'inline-block',
                          boxShadow: '0 0 6px #81B29A'
                        }} />
                        Connected - 90%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                  {/* Heart Rate Card */}
                  <div style={{
                    ...cardStyle,
                    borderLeft: '4px solid #E07A5F'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Heart style={{ width: '18px', height: '18px', color: '#E07A5F' }} />
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Heart Rate (HR)</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '48px', fontWeight: '300', color: '#E07A5F', lineHeight: 1 }}>
                        {Math.round(heartRate)}
                      </div>
                      <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>bpm</div>
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      background: isDarkMode ? 'rgba(224, 122, 95, 0.2)' : 'rgba(224, 122, 95, 0.12)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#E07A5F',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E07A5F' }} />
                      {heartRate < 70 ? 'Low' : heartRate > 85 ? 'High' : 'Normal Range'}
                    </div>
                  </div>

                  {/* MWL Card */}
                  <div style={{
                    ...cardStyle,
                    borderLeft: '4px solid #A8DADC'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Brain style={{ width: '18px', height: '18px', color: '#7FBFC1' }} />
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Mental Workload (MWL)</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '48px', fontWeight: '300', color: '#7FBFC1', lineHeight: 1 }}>
                        {Math.round(mwl)}
                      </div>
                      <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>%</div>
                    </div>
                    <div style={{
                      padding: '8px 12px',
                      background: isDarkMode ? 'rgba(168, 218, 220, 0.2)' : 'rgba(168, 218, 220, 0.25)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#7FBFC1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7FBFC1' }} />
                      {mwl < 40 ? 'Low Load' : mwl > 70 ? 'High Load' : 'Moderate Load'}
                    </div>
                  </div>
                </div>

                {/* State Indicator - with dynamic background color */}
                <div style={{
                  background: currentStateInfo.bgColor,
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: isDarkMode 
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                    : `0 4px 12px ${currentStateInfo.bgColor}40`,
                  transition: 'all 0.5s ease'
                }}>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginBottom: '20px' }}>
                    Current Work State
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                    <div style={{
                      width: '72px',
                      height: '72px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <StateIcon style={{ width: '36px', height: '36px', color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '32px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                        {currentStateInfo.label}
                      </div>
                      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Confidence: 
                        <div style={{ 
                          width: '60px', 
                          height: '4px', 
                          background: 'rgba(255,255,255,0.3)', 
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            width: `${75 + Math.random() * 20}%`, 
                            height: '100%', 
                            background: 'white',
                            borderRadius: '2px'
                          }} />
                        </div>
                        {Math.round(75 + Math.random() * 20)}%
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.6,
                    backdropFilter: 'blur(4px)'
                  }}>
                    {currentStateInfo.description}
                  </div>
                </div>

                {/* Music Player with Auto-Recommendation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Auto-play toggle and recommendation info */}
                  <div style={{
                    ...cardStyle,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={16} style={{ color: '#E07A5F' }} />
                        State-Based Music Recommendation
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {musicLibrary.length === 0 
                          ? 'No music uploaded. Go to Music Library to upload songs.'
                          : `${musicLibrary.length} songs available - Recommending based on "${currentStateInfo.label}" state`
                        }
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Auto-play</span>
                      <button
                        onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                        style={{
                          width: '48px',
                          height: '26px',
                          borderRadius: '13px',
                          border: 'none',
                          background: autoPlayEnabled ? '#E07A5F' : 'var(--beige)',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 0.2s',
                          boxShadow: autoPlayEnabled ? '0 2px 6px rgba(224, 122, 95, 0.3)' : 'none'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: '3px',
                          left: autoPlayEnabled ? '25px' : '3px',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }} />
                      </button>
                    </div>
                  </div>

                  {/* Music Player Component */}
                  <MusicErrorBoundary isDark={isDarkMode}>
                    <MusicPlayer />
                  </MusicErrorBoundary>

                  {/* Recommendation Strategy Info */}
                  {currentMusic && (
                    <div style={{
                      background: isDarkMode ? 'rgba(168, 218, 220, 0.15)' : 'rgba(168, 218, 220, 0.2)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      border: '1px solid rgba(168, 218, 220, 0.4)',
                      fontSize: '13px',
                      color: '#7FBFC1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        background: 'var(--card)',
                        borderRadius: '8px'
                      }}>
                        <Music size={14} style={{ color: '#7FBFC1' }} />
                      </div>
                      <span>
                        Playing "{currentMusic.title}" ({currentMusic.bpm || '?'} BPM) - 
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
                <MusicErrorBoundary isDark={isDarkMode}>
                  <MusicPlayer />
                  <MusicLibraryView />
                </MusicErrorBoundary>
              </div>
            )}

            {/* Settings View */}
            {currentView === 'settings' && (
              <div style={{
                ...cardStyle,
                padding: '48px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  width: '80px',
                  height: '80px',
                  background: 'var(--beige-light)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <Settings size={40} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-dark)' }}>
                  System Settings
                </h2>
                <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '32px' }}>
                  Feature under development...
                </p>
              </div>
            )}

            {/* History View */}
            {currentView === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div style={{
                  ...cardStyle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-dark)' }}>History Data Analysis</h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                      Records: {history.length} entries - Data updates every 5 seconds
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar style={{ width: '18px', height: '18px', color: '#E07A5F' }} />
                    <span style={{ fontSize: '14px', color: 'var(--text-dark)' }}>
                      {history.length > 0 ? formatDate(history[0].timestamp) : 'No data yet'}
                    </span>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div style={{
                    ...cardStyle,
                    padding: '64px 48px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      width: '80px',
                      height: '80px',
                      background: 'var(--beige-light)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px'
                    }}>
                      <TrendingUp size={40} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-dark)' }}>Waiting for data recording...</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>System records data every 5 seconds, please wait</p>
                  </div>
                ) : (
                  <>
                    {/* Statistics Cards */}
                    {stats && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        <div style={{
                          ...cardStyle,
                          padding: '20px',
                          borderLeft: '4px solid #E07A5F'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Heart style={{ width: '16px', height: '16px', color: '#E07A5F' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Avg Heart Rate</span>
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: '300', color: '#E07A5F', marginBottom: '4px' }}>
                            {stats.avgHeartRate}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Range: {stats.minHeartRate}-{stats.maxHeartRate} bpm
                          </div>
                        </div>

                        <div style={{
                          ...cardStyle,
                          padding: '20px',
                          borderLeft: '4px solid #A8DADC'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Brain style={{ width: '16px', height: '16px', color: '#7FBFC1' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Avg MWL</span>
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: '300', color: '#7FBFC1', marginBottom: '4px' }}>
                            {stats.avgMwl}%
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Range: {stats.minMwl}-{stats.maxMwl}%
                          </div>
                        </div>

                        <div style={{
                          ...cardStyle,
                          padding: '20px',
                          borderLeft: '4px solid #81B29A'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <TrendingUp style={{ width: '16px', height: '16px', color: '#81B29A' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Max Heart Rate</span>
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: '300', color: '#81B29A', marginBottom: '4px' }}>
                            {stats.maxHeartRate}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            bpm
                          </div>
                        </div>

                        <div style={{
                          ...cardStyle,
                          padding: '20px',
                          borderLeft: '4px solid #F4A261'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <Clock style={{ width: '16px', height: '16px', color: '#F4A261' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Recording Duration</span>
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: '300', color: '#F4A261', marginBottom: '4px' }}>
                            {Math.floor((history.length * 5) / 60)}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            minutes
                          </div>
                        </div>
                      </div>
                    )}

                    {/* State Distribution */}
                    {stats && (
                      <div style={cardStyle}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'var(--text-dark)' }}>State Distribution</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                          {Object.entries(stats.stateDistribution).map(([state, count]) => {
                            const stateInfo = stateConfig[state as WorkState];
                            const StateIconComponent = stateInfo.icon;
                            const percentage = history.length > 0 ? Math.round((count / history.length) * 100) : 0;
                            return (
                              <div key={state} style={{
                                background: 'var(--beige-light)',
                                borderRadius: '12px',
                                padding: '16px',
                                border: `1px solid ${stateInfo.color}30`,
                                transition: 'all 0.3s ease'
                              }}>
                                <div style={{ 
                                  width: '40px',
                                  height: '40px',
                                  background: `${stateInfo.color}20`,
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginBottom: '12px'
                                }}>
                                  <StateIconComponent size={20} style={{ color: stateInfo.color }} />
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: stateInfo.color }}>
                                  {stateInfo.label}
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                  {count} times
                                </div>
                                <div style={{
                                  width: '100%',
                                  height: '6px',
                                  background: 'var(--beige)',
                                  borderRadius: '3px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    background: stateInfo.color,
                                    borderRadius: '3px',
                                    transition: 'width 0.3s'
                                  }} />
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                                  {percentage}%
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Simple Chart */}
                    <div style={cardStyle}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: 'var(--text-dark)' }}>Data Trend Chart</h3>
                      <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                        {history.slice(-30).map((record, index) => (
                          <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                            <div style={{
                              width: '100%',
                              height: `${(record.heartRate - 60) / 40 * 100}%`,
                              minHeight: '10px',
                              background: 'linear-gradient(to top, #E07A5F, #F4A261)',
                              borderRadius: '3px 3px 0 0',
                              opacity: 0.9
                            }} />
                            <div style={{
                              width: '100%',
                              height: `${record.mwl}%`,
                              minHeight: '10px',
                              background: 'linear-gradient(to top, #7FBFC1, #A8DADC)',
                              borderRadius: '3px 3px 0 0',
                              opacity: 0.9
                            }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', gap: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', background: '#E07A5F', borderRadius: '3px' }} />
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Heart Rate (HR)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', background: '#A8DADC', borderRadius: '3px' }} />
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Mental Workload (MWL)</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Records Table */}
                    <div style={cardStyle}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-dark)' }}>Recent Records</h3>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--beige)' }}>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Time</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Heart Rate</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>MWL</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>State</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.slice(-10).reverse().map((record, index) => {
                              const stateInfo = stateConfig[record.state];
                              const StateIconComponent = stateInfo.icon;
                              return (
                                <tr key={index} style={{ borderBottom: '1px solid var(--beige-light)' }}>
                                  <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text-dark)' }}>
                                    {formatTime(record.timestamp)}
                                  </td>
                                  <td style={{ padding: '12px', fontSize: '14px', color: '#E07A5F', fontWeight: '500' }}>
                                    {Math.round(record.heartRate)} bpm
                                  </td>
                                  <td style={{ padding: '12px', fontSize: '14px', color: '#7FBFC1', fontWeight: '500' }}>
                                    {Math.round(record.mwl)}%
                                  </td>
                                  <td style={{ padding: '12px' }}>
                                    <div style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 12px',
                                      background: isDarkMode ? `${stateInfo.color}25` : `${stateInfo.color}15`,
                                      borderRadius: '20px',
                                      fontSize: '13px',
                                      color: stateInfo.color,
                                      fontWeight: '500'
                                    }}>
                                      <StateIconComponent size={14} />
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

import { useEffect } from 'react';
import { DeviceStatusCard } from './DeviceStatusCard';
import { MetricCard } from './MetricCard';
import { StateIndicator } from './StateIndicator';
import { MusicPlayer } from './MusicPlayer';
import { RealtimeChart } from './RealtimeChart';
import { useAppStore } from '../stores/useAppStore';
import { 
  useHeartRateSimulator, 
  useMWLSimulator, 
  useStateClassification,
  useMusicRecommendation 
} from '../hooks';
import { UserStateType, STATE_COLORS, STATE_LABELS } from '../types/state';

/**
 * State to emoji mapping
 */
const STATE_EMOJIS: Record<UserStateType, string> = {
  [UserStateType.STRESSED]: '😰',
  [UserStateType.CALM]: '😌',
  [UserStateType.PRODUCTIVE]: '🎯',
  [UserStateType.DISTRACTED]: '😵‍💫'
};

/**
 * State descriptions
 */
const STATE_DESCRIPTIONS: Record<UserStateType, string> = {
  [UserStateType.STRESSED]: 'High heart rate detected, elevated mental workload. Consider taking a break.',
  [UserStateType.CALM]: 'Stable heart rate, low MWL, good condition for relaxation.',
  [UserStateType.PRODUCTIVE]: 'Optimal mental workload, focused state detected. Keep up the good work!',
  [UserStateType.DISTRACTED]: 'Fluctuating attention detected. Music may help regain focus.'
};

/**
 * Get heart rate status text
 */
function getHRStatus(hr: number | null, baseline: number): string {
  if (hr === null) return 'Waiting for data...';
  const deviation = (hr - baseline) / baseline;
  if (deviation > 0.15) return 'Elevated';
  if (deviation < -0.1) return 'Below normal';
  return 'Normal Range';
}

/**
 * Get MWL status text
 */
function getMWLStatus(mwl: number | null): string {
  if (mwl === null) return 'Waiting for data...';
  if (mwl > 0.7) return 'High Load';
  if (mwl < 0.3) return 'Low Load';
  return 'Moderate Level';
}

export function HomeView() {
  // Store state
  const {
    currentHeartRate,
    currentMWL,
    currentState,
    stateConfidence,
    hrDeviceStatus,
    mwlDeviceStatus,
    heartRateBaseline,
    recentHeartRateData,
    recentMWLData,
  } = useAppStore();

  // Initialize Heart Rate Simulator with auto-start
  const { 
    isRunning: hrRunning, 
    setSimulatedState: setHRState 
  } = useHeartRateSimulator({
    autoStart: true,
    frequency: 1, // 1Hz as per PRD requirement
  });

  // Initialize MWL Simulator with auto-start
  const { 
    isRunning: mwlRunning, 
    setSimulatedState: setMWLState
  } = useMWLSimulator({
    autoStart: true,
    frequency: 1,
    autoTransition: false, // Manual control for now
  });

  // State Classification - auto-classifies based on HR and MWL data
  const { 
    reasoning,
    lastStateChange 
  } = useStateClassification({
    enabled: true,
    interval: 1000, // Classify every second
    minDataPoints: 5, // Wait for at least 5 data points
    onStateChange: (event) => {
      console.log('State changed:', event.previousState, '->', event.currentState);
    }
  });

  // Music Recommendation - auto-recommends on state change
  const { 
    targetBPM,
    isLoading: musicLoading,
    librarySize
  } = useMusicRecommendation({
    autoRecommend: true,
    autoPlay: true,
    stateStabilityThreshold: 3000, // Wait 3 seconds for state stability per PRD
  });

  // Sync simulated state across simulators when classification changes
  useEffect(() => {
    if (currentState) {
      const stateType = currentState as UserStateType;
      setHRState(stateType);
      setMWLState(stateType);
    }
  }, [currentState, setHRState, setMWLState]);

  // Log state changes for debugging
  useEffect(() => {
    if (lastStateChange) {
      console.log(`State transition: ${lastStateChange.previousState} -> ${lastStateChange.currentState} (duration: ${lastStateChange.duration}ms)`);
    }
  }, [lastStateChange]);

  // Prepare chart data
  const heartRateChartData = recentHeartRateData.map((data) => ({
    timestamp: data.timestamp,
    value: data.heartRate,
  }));

  const mwlChartData = recentMWLData.map((data) => ({
    timestamp: data.timestamp,
    value: data.mwlIndex * 100,
  }));

  // Get display values
  const displayHR = currentHeartRate !== null ? Math.round(currentHeartRate) : 0;
  const displayMWL = currentMWL !== null ? Math.round(currentMWL * 100) : 0;
  const displayState = currentState as UserStateType || UserStateType.CALM;
  const displayConfidence = Math.round(stateConfidence * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Device Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <DeviceStatusCard 
          icon="❤️" 
          name="Heart Rate Sensor" 
          isConnected={hrDeviceStatus.isConnected}
          status={hrRunning ? 'Simulating' : 'Stopped'}
        />
        <DeviceStatusCard 
          icon="🧠" 
          name="MWL Monitoring Device" 
          isConnected={mwlDeviceStatus.isConnected}
          status={mwlRunning ? 'Simulating' : 'Stopped'}
        />
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <MetricCard
          label="Heart Rate (HR)"
          value={displayHR}
          unit="bpm"
          borderColor="#ef4444"
          valueColor="#ef4444"
          status={getHRStatus(currentHeartRate, heartRateBaseline)}
        />
        <MetricCard
          label="Mental Workload (MWL)"
          value={displayMWL}
          unit="%"
          borderColor="#8b5cf6"
          valueColor="#8b5cf6"
          status={getMWLStatus(currentMWL)}
        />
      </div>

      {/* State Indicator */}
      <StateIndicator
        emoji={STATE_EMOJIS[displayState]}
        state={STATE_LABELS[displayState]}
        confidence={displayConfidence}
        description={reasoning || STATE_DESCRIPTIONS[displayState]}
        stateColor={STATE_COLORS[displayState]}
      />

      {/* Music Player */}
      <MusicPlayer />

      {/* Target BPM Info (if recommendation is active) */}
      {targetBPM && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          fontSize: '14px',
          color: '#94a3b8'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#e2e8f0' }}>
            🎵 Music Recommendation Active
          </div>
          <div>Target BPM: {targetBPM.target} ({targetBPM.min}-{targetBPM.max} range)</div>
          <div>Library: {librarySize} tracks available</div>
          {musicLoading && <div style={{ color: '#8b5cf6' }}>Finding the perfect track...</div>}
        </div>
      )}

      {/* Real-time Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <RealtimeChart
          data={heartRateChartData}
          title="Heart Rate Trend (Last 60s)"
          color="#ef4444"
          unit=" bpm"
          yDomain={[50, 120]}
        />
        <RealtimeChart
          data={mwlChartData}
          title="MWL Index Trend (Last 60s)"
          color="#8b5cf6"
          unit="%"
          yDomain={[0, 100]}
        />
      </div>

      {/* Debug Controls (for development) */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px dashed rgba(71, 85, 105, 0.5)',
      }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
          Debug Controls (Simulate State Changes)
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.values(UserStateType).map((state) => (
            <button
              key={state}
              onClick={() => {
                setHRState(state);
                setMWLState(state);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: displayState === state ? STATE_COLORS[state] : 'rgba(71, 85, 105, 0.5)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: displayState === state ? 'bold' : 'normal',
                transition: 'all 0.2s ease'
              }}
            >
              {STATE_EMOJIS[state]} {STATE_LABELS[state]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

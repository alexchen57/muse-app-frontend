import React from 'react';
import { Heart, Brain } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { MetricCard } from '../components/MetricCard';
import { StateIndicator } from '../components/StateIndicator';
import { MusicPlayer } from '../components/MusicPlayer';
import { RealtimeChart } from '../components/RealtimeChart';
import { DeviceStatus } from '../components/DeviceStatus';

// State descriptions for better UX
const STATE_DESCRIPTIONS: Record<string, string> = {
  calm: 'Your physiological indicators show a relaxed state. This is an ideal time for focused work or creative tasks.',
  stressed: 'Elevated stress indicators detected. Consider taking a short break or trying the suggested calming music.',
  productive: 'You are in an optimal productive state. Your focus and energy levels are well-balanced.',
  distracted: 'Your attention seems scattered. Try the recommended focus-enhancing audio to regain concentration.',
  recovering: 'Your body is naturally returning to a balanced state. Allow this recovery process to continue.',
  overloaded: 'High mental load detected. It is recommended to take a break and engage in relaxation activities.',
};

export function HomeView() {
  const {
    currentHeartRate,
    currentMWL,
    currentState,
    stateConfidence,
    hrDeviceStatus,
    mwlDeviceStatus,
    recentHeartRateData,
    recentMWLData,
  } = useAppStore();

  const heartRateChartData = recentHeartRateData.map((data) => ({
    timestamp: data.timestamp,
    value: data.heartRate,
  }));

  const mwlChartData = recentMWLData.map((data) => ({
    timestamp: data.timestamp,
    value: data.mwlIndex * 100,
  }));

  // Get status text based on heart rate
  const getHRStatus = (hr: number | null) => {
    if (hr === null) return 'Waiting...';
    if (hr < 60) return 'Below Normal';
    if (hr > 100) return 'Elevated';
    return 'Normal Range';
  };

  // Get status text based on MWL
  const getMWLStatus = (mwl: number | null) => {
    if (mwl === null) return 'Waiting...';
    const percent = mwl * 100;
    if (percent < 30) return 'Low Load';
    if (percent > 70) return 'High Load';
    return 'Moderate Load';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Device Status */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '16px' 
      }}>
        <DeviceStatus
          name="Heart Rate Sensor"
          status={hrDeviceStatus}
          icon={<Heart size={20} />}
        />
        <DeviceStatus
          name="MWL Monitoring Device"
          status={mwlDeviceStatus}
          icon={<Brain size={20} />}
        />
      </div>

      {/* Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px' 
      }}>
        <MetricCard
          label="Heart Rate (HR)"
          value={currentHeartRate !== null ? currentHeartRate : '--'}
          unit="bpm"
          status={getHRStatus(currentHeartRate)}
          borderColor="#E07A5F"
          valueColor="#E07A5F"
          icon={<Heart size={18} />}
        />
        <MetricCard
          label="Mental Workload (MWL)"
          value={currentMWL !== null ? (currentMWL * 100).toFixed(0) : '--'}
          unit="%"
          status={getMWLStatus(currentMWL)}
          borderColor="#A8DADC"
          valueColor="#7FBFC1"
          icon={<Brain size={18} />}
        />
      </div>

      {/* State Indicator */}
      <StateIndicator
        state={currentState}
        confidence={Math.round(stateConfidence * 100)}
        description={STATE_DESCRIPTIONS[currentState.toLowerCase()] || STATE_DESCRIPTIONS.calm}
      />

      {/* Music Player */}
      <MusicPlayer />

      {/* Real-time Charts */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        <RealtimeChart
          data={heartRateChartData}
          title="Heart Rate Trend (Last 60s)"
          color="#E07A5F"
          unit=" bpm"
          yDomain={[50, 120]}
        />
        <RealtimeChart
          data={mwlChartData}
          title="MWL Index Trend (Last 60s)"
          color="#A8DADC"
          unit="%"
          yDomain={[0, 100]}
        />
      </div>
    </div>
  );
}

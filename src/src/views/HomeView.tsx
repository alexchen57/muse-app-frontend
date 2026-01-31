import React from 'react';
import { Heart, Brain, Activity } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { MetricCard } from '../components/MetricCard';
import { StateIndicator } from '../components/StateIndicator';
import { MusicPlayer } from '../components/MusicPlayer';
import { RealtimeChart } from '../components/RealtimeChart';
import { DeviceStatus } from '../components/DeviceStatus';

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

  return (
    <div className="space-y-6">
      {/* Device Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DeviceStatus
          name="Heart Rate Sensor"
          status={hrDeviceStatus}
          icon={<Heart className="w-5 h-5" />}
        />
        <DeviceStatus
          name="MWL Monitoring Device"
          status={mwlDeviceStatus}
          icon={<Brain className="w-5 h-5" />}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Heart Rate (HR)"
          value={currentHeartRate !== null ? currentHeartRate : '--'}
          unit="bpm"
          subtitle="Normal Range"
          trend="stable"
          color="#ef4444"
          icon={<Heart className="w-5 h-5" />}
        />
        <MetricCard
          title="Mental Workload (MWL)"
          value={
            currentMWL !== null ? (currentMWL * 100).toFixed(0) : '--'
          }
          unit="%"
          subtitle="Moderate Level"
          trend="stable"
          color="#8b5cf6"
          icon={<Brain className="w-5 h-5" />}
        />
      </div>

      {/* State Indicator */}
      <StateIndicator
        state={currentState}
        confidence={stateConfidence}
        size="large"
        showDescription
      />

      {/* Music Player */}
      <MusicPlayer />

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
}

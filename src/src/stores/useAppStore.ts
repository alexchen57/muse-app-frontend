import { create } from 'zustand';
import { StateType } from '../types/state';
import { MusicMetadata } from '../types/music';
import { HeartRateData, MWLData, DeviceStatus } from '../types/device';

type ViewType = 'home' | 'history' | 'music' | 'settings';
type TabType = 'monitor' | 'explore' | 'more';

interface AppState {
  // UI State
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  
  // Tab Navigation (Mobile)
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Real-time Data
  currentHeartRate: number | null;
  currentMWL: number | null;
  currentState: StateType | null;
  stateConfidence: number;

  setCurrentHeartRate: (hr: number) => void;
  setCurrentMWL: (mwl: number) => void;
  setCurrentState: (state: StateType, confidence: number) => void;

  // Device Status
  hrDeviceStatus: DeviceStatus;
  mwlDeviceStatus: DeviceStatus;
  setHRDeviceStatus: (status: Partial<DeviceStatus>) => void;
  setMWLDeviceStatus: (status: Partial<DeviceStatus>) => void;

  // Music Player
  currentMusic: MusicMetadata | null;
  isPlaying: boolean;
  volume: number;

  setCurrentMusic: (music: MusicMetadata | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;

  // Baselines
  heartRateBaseline: number;
  mwlBaseline: number;
  setHeartRateBaseline: (baseline: number) => void;
  setMWLBaseline: (baseline: number) => void;

  // Recent Data for visualization
  recentHeartRateData: HeartRateData[];
  recentMWLData: MWLData[];
  addHeartRateData: (data: HeartRateData) => void;
  addMWLData: (data: MWLData) => void;
}

const MAX_RECENT_DATA = 60; // Keep last 60 data points (1 minute at 1Hz)

export const useAppStore = create<AppState>((set) => ({
  // UI State
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),
  
  // Tab Navigation (Mobile)
  activeTab: 'monitor',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Real-time Data
  currentHeartRate: null,
  currentMWL: null,
  currentState: null,
  stateConfidence: 0,

  setCurrentHeartRate: (hr) => set({ currentHeartRate: hr }),
  setCurrentMWL: (mwl) => set({ currentMWL: mwl }),
  setCurrentState: (state, confidence) => 
    set({ currentState: state, stateConfidence: confidence }),

  // Device Status
  hrDeviceStatus: { isConnected: false, lastUpdate: 0 },
  mwlDeviceStatus: { isConnected: false, lastUpdate: 0 },
  setHRDeviceStatus: (status) =>
    set((state) => ({
      hrDeviceStatus: { ...state.hrDeviceStatus, ...status },
    })),
  setMWLDeviceStatus: (status) =>
    set((state) => ({
      mwlDeviceStatus: { ...state.mwlDeviceStatus, ...status },
    })),

  // Music Player
  currentMusic: null,
  isPlaying: false,
  volume: 0.7,

  setCurrentMusic: (music) => set({ currentMusic: music }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume }),

  // Baselines
  heartRateBaseline: 75,
  mwlBaseline: 0.5,
  setHeartRateBaseline: (baseline) => set({ heartRateBaseline: baseline }),
  setMWLBaseline: (baseline) => set({ mwlBaseline: baseline }),

  // Recent Data
  recentHeartRateData: [],
  recentMWLData: [],
  addHeartRateData: (data) =>
    set((state) => ({
      recentHeartRateData: [
        ...state.recentHeartRateData.slice(-MAX_RECENT_DATA + 1),
        data,
      ],
    })),
  addMWLData: (data) =>
    set((state) => ({
      recentMWLData: [
        ...state.recentMWLData.slice(-MAX_RECENT_DATA + 1),
        data,
      ],
    })),
}));

import React from 'react';
import { Settings, User, Database, Info, Heart, Brain } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export function SettingsView() {
  const {
    heartRateBaseline,
    mwlBaseline,
    setHeartRateBaseline,
    setMWLBaseline,
  } = useAppStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-4">
          <Settings className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <p className="text-sm text-slate-400">Configure system parameters and preferences</p>
          </div>
        </div>
      </div>

      {/* Baseline Settings */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Baseline Settings
        </h3>

        <div className="space-y-6">
          {/* Heart Rate Baseline */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Heart className="w-4 h-4 text-red-500" />
              Heart Rate Baseline (bpm)
            </label>
            <input
              type="number"
              value={heartRateBaseline}
              onChange={(e) => setHeartRateBaseline(Number(e.target.value))}
              min="40"
              max="120"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Normal resting heart rate range: 60-80 bpm
            </p>
          </div>

          {/* MWL Baseline */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Brain className="w-4 h-4 text-purple-500" />
              MWL Baseline (0-1)
            </label>
            <input
              type="number"
              value={mwlBaseline}
              onChange={(e) => setMWLBaseline(Number(e.target.value))}
              min="0"
              max="1"
              step="0.1"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Recommended to set as your average daily work MWL level
            </p>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Management
        </h3>

        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-left transition-colors">
            Export History Data (JSON)
          </button>
          <button className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-left transition-colors">
            Clear All Data
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          About
        </h3>

        <div className="space-y-3 text-sm text-slate-400">
          <div>
            <div className="font-medium text-white mb-1">MUSE - Multi-sensory Emotional Regulation System</div>
            <div>Version: v1.0 (Prototype)</div>
          </div>
          <div>
            <div className="font-medium text-white mb-1">Tech Stack</div>
            <div>React 18 + TypeScript + Vite</div>
            <div>Zustand + IndexedDB + Tone.js</div>
          </div>
          <div>
            <div className="font-medium text-white mb-1">Description</div>
            <div>
              This system provides personalized music intervention by real-time monitoring of heart rate and mental workload (MWL), helping users regulate work stress in a non-intrusive, low-disturbance manner.
            </div>
          </div>
          <div className="pt-3 border-t border-slate-700">
            <div className="text-xs text-slate-500">
              ⚠️ Note: MWL data uses simulated data for proof of concept
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

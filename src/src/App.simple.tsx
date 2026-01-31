import React, { useState } from 'react';
import { Home, History, Music, Settings, Activity } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">MUSE</h1>
              <p className="text-xs text-slate-400">Multi-sensory Emotional Regulation System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 sticky top-6">
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentView('home')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === 'home'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </button>
                <button
                  onClick={() => setCurrentView('history')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === 'history'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <History className="w-5 h-5" />
                  <span className="font-medium">History</span>
                </button>
                <button
                  onClick={() => setCurrentView('music')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === 'music'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Music className="w-5 h-5" />
                  <span className="font-medium">Music Library</span>
                </button>
                <button
                  onClick={() => setCurrentView('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === 'settings'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main View */}
          <main className="flex-1 min-w-0">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to MUSE System
              </h2>
              <p className="text-slate-300 mb-6">
                Multi-sensory Emotional Regulation System initializing...
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-2">Heart Rate</div>
                  <div className="text-3xl font-bold text-red-500">75</div>
                  <div className="text-xs text-slate-500 mt-1">bpm</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-2">MWL Index</div>
                  <div className="text-3xl font-bold text-purple-500">50</div>
                  <div className="text-xs text-slate-500 mt-1">%</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { MusicLibraryView } from './components/MusicLibraryView';
import { HistoryView } from './components/HistoryView';
import { PlaceholderView } from './components/PlaceholderView';
import { useAppStore } from './stores/useAppStore';

/**
 * MUSE Application Root Component
 * 
 * This component has been updated to use Zustand store for state management.
 * The HomeView now integrates with the simulation services via custom hooks.
 * 
 * Data flow:
 * - HeartRateSimulator -> useHeartRateSimulator hook -> useAppStore
 * - MWLSimulator -> useMWLSimulator hook -> useAppStore
 * - useStateClassification -> classifies state based on HR/MWL -> useAppStore
 * - useMusicRecommendation -> recommends music based on state -> useAppStore
 */
function App() {
  // Use Zustand store for view management
  const { currentView, setCurrentView } = useAppStore();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <Header />

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />

          {/* Main View */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {currentView === 'home' && (
              <HomeView />
            )}

            {currentView === 'music' && (
              <MusicLibraryView />
            )}

            {currentView === 'history' && (
              <HistoryView />
            )}

            {currentView === 'settings' && (
              <PlaceholderView icon="⚙️" title="Settings" />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;

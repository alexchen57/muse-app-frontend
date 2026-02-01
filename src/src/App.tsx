import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { MusicLibraryView } from './views/MusicLibraryView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { useAppStore } from './stores/useAppStore';

/**
 * MUSE Application Root Component
 * 
 * This component has been updated to use Zustand store for state management.
 * The HomeView now integrates with the simulation services via custom hooks.
 * 
 * Design System: Warm, wellness-focused aesthetic
 * - Primary: Coral #E07A5F
 * - Accent: Soft Blue #A8DADC  
 * - Background: Cream #FAF7F5
 */
function App() {
  const { currentView, setCurrentView } = useAppStore();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      color: 'var(--text-dark)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <Header />

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Sidebar currentView={currentView} onViewChange={setCurrentView} />

          {/* Main View */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {currentView === 'home' && <HomeView />}
            {currentView === 'music' && <MusicLibraryView />}
            {currentView === 'history' && <HistoryView />}
            {currentView === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;

type ViewType = 'home' | 'history' | 'music' | 'settings';

interface SidebarProps {
  currentView: ViewType | string;
  onViewChange: (view: ViewType) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside style={{ width: '240px', flexShrink: 0 }}>
      <nav style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid rgba(71, 85, 105, 0.5)',
        position: 'sticky',
        top: '24px'
      }}>
        {(['home', 'history', 'music', 'settings'] as const).map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              marginBottom: '8px',
              borderRadius: '8px',
              border: 'none',
              background: currentView === view ? '#3b82f6' : 'transparent',
              color: currentView === view ? 'white' : '#cbd5e1',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '18px' }}>
              {view === 'home' && '🏠'}
              {view === 'history' && '📊'}
              {view === 'music' && '🎵'}
              {view === 'settings' && '⚙️'}
            </span>
            {view === 'home' ? 'Home' : view === 'history' ? 'History' : view === 'music' ? 'Music Library' : 'Settings'}
          </button>
        ))}
      </nav>
    </aside>
  );
}

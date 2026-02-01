import { Home, BarChart2, Music, Settings } from 'lucide-react';

type ViewType = 'home' | 'history' | 'music' | 'settings';

interface SidebarProps {
  currentView: ViewType | string;
  onViewChange: (view: ViewType) => void;
}

const navItems = [
  { view: 'home' as const, icon: Home, label: 'Home' },
  { view: 'history' as const, icon: BarChart2, label: 'History' },
  { view: 'music' as const, icon: Music, label: 'Music Library' },
  { view: 'settings' as const, icon: Settings, label: 'Settings' },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <aside style={{ width: '240px', flexShrink: 0 }}>
      <nav style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        border: '1px solid var(--beige)',
        position: 'sticky',
        top: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        {navItems.map(({ view, icon: Icon, label }) => {
          const isActive = currentView === view;
          return (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                marginBottom: '8px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? 'var(--coral)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 6px rgba(224, 122, 95, 0.25)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--beige-light)';
                  e.currentTarget.style.color = 'var(--text-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <Icon size={20} />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

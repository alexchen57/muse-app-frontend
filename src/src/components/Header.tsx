import { Heart } from 'lucide-react';

interface HeaderProps {}

export function Header({}: HeaderProps) {
  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid var(--beige)',
      padding: '16px 0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            background: 'linear-gradient(135deg, var(--coral) 0%, var(--coral-light) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(224, 122, 95, 0.2)'
          }}>
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              margin: 0,
              color: 'var(--text-dark)',
              fontFamily: "'Dancing Script', cursive",
              letterSpacing: '0.5px'
            }}>
              MUSE
            </h1>
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-muted)', 
              margin: 0,
              fontWeight: '400'
            }}>
              Multi-sensory Emotional Regulation System
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

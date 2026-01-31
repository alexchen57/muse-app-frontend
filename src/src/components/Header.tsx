interface HeaderProps {}

export function Header({}: HeaderProps) {
  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.9)',
      borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
      padding: '16px 0'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🎵
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>MUSE</h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Multi-sensory Emotional Regulation System</p>
          </div>
        </div>
      </div>
    </header>
  );
}

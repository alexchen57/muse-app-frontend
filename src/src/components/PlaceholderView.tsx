interface PlaceholderViewProps {
  icon: string;
  title: string;
}

export function PlaceholderView({ icon, title }: PlaceholderViewProps) {
  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '16px',
      padding: '32px',
      border: '1px solid rgba(71, 85, 105, 0.5)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>{icon}</div>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</h2>
      <p style={{ color: '#94a3b8' }}>Feature under development...</p>
    </div>
  );
}

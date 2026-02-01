interface PlaceholderViewProps {
  icon: string;
  title: string;
}

export function PlaceholderView({ icon, title }: PlaceholderViewProps) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '48px 32px',
      border: '1px solid var(--beige)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: '64px', 
        marginBottom: '20px',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
      }}>
        {icon}
      </div>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        marginBottom: '12px',
        color: 'var(--text-dark)'
      }}>
        {title}
      </h2>
      <p style={{ 
        color: 'var(--text-muted)',
        fontSize: '14px'
      }}>
        Feature under development...
      </p>
    </div>
  );
}

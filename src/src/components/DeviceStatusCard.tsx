interface DeviceStatusCardProps {
  icon: string;
  name: string;
  isConnected: boolean;
  status?: string;
}

export function DeviceStatusCard({ icon, name, isConnected, status }: DeviceStatusCardProps) {
  const statusText = status || (isConnected ? 'Connected' : 'Disconnected');
  
  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.3)',
      borderRadius: '8px',
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '2px' }}>{name}</div>
        <div style={{
          fontSize: '11px',
          color: isConnected ? '#4ade80' : '#f87171',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>●</span> {statusText}
        </div>
      </div>
    </div>
  );
}

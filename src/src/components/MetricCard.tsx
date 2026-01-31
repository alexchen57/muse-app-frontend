interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  borderColor: string;
  valueColor: string;
  status: string;
}

export function MetricCard({ label, value, unit, borderColor, valueColor, status }: MetricCardProps) {
  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(71, 85, 105, 0.5)',
      borderLeft: `4px solid ${borderColor}`
    }}>
      <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: valueColor }}>
          {Math.round(value)}
        </div>
        <div style={{ fontSize: '18px', color: '#94a3b8' }}>{unit}</div>
      </div>
      <div style={{ fontSize: '14px', color: '#64748b' }}>{status}</div>
    </div>
  );
}

import React from 'react';

interface MetricCardProps {
  label: string;
  value: number | string;
  unit: string;
  borderColor: string;
  valueColor: string;
  status: string;
  icon?: React.ReactNode;
}

export function MetricCard({ label, value, unit, borderColor, valueColor, status, icon }: MetricCardProps) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--beige)',
      borderLeft: `4px solid ${borderColor}`,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontSize: '14px', 
        color: 'var(--text-muted)', 
        marginBottom: '16px' 
      }}>
        {icon && <span style={{ color: borderColor }}>{icon}</span>}
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <div style={{ 
          fontSize: '48px', 
          fontWeight: '300', 
          color: valueColor,
          lineHeight: 1
        }}>
          {typeof value === 'number' ? Math.round(value) : value}
        </div>
        <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>{unit}</div>
      </div>
      <div style={{ 
        fontSize: '14px', 
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: borderColor,
          opacity: 0.6
        }} />
        {status}
      </div>
    </div>
  );
}

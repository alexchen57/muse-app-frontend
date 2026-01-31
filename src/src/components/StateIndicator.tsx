interface StateIndicatorProps {
  emoji: string;
  state: string;
  confidence: number;
  description: string;
  stateColor: string;
}

export function StateIndicator({ emoji, state, confidence, description, stateColor }: StateIndicatorProps) {
  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(71, 85, 105, 0.5)',
      borderLeft: `4px solid ${stateColor}`
    }}>
      <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px' }}>Current State</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: `rgba(76, 175, 80, 0.2)`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          {emoji}
        </div>
        <div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: stateColor }}>{state}</div>
          <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Confidence: {confidence}%</div>
        </div>
      </div>
      <div style={{
        fontSize: '14px',
        color: '#94a3b8',
        padding: '12px',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '8px'
      }}>
        {description}
      </div>
    </div>
  );
}

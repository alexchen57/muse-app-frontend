import React from 'react';

// State colors matching the design system
const STATE_STYLES: Record<string, { color: string; bgColor: string; emoji: string }> = {
  calm: { color: '#81B29A', bgColor: 'rgba(129, 178, 154, 0.15)', emoji: '😌' },
  stressed: { color: '#E07A5F', bgColor: 'rgba(224, 122, 95, 0.15)', emoji: '😰' },
  productive: { color: '#A8DADC', bgColor: 'rgba(168, 218, 220, 0.15)', emoji: '🎯' },
  distracted: { color: '#F4A261', bgColor: 'rgba(244, 162, 97, 0.15)', emoji: '😵' },
  recovering: { color: '#81B29A', bgColor: 'rgba(129, 178, 154, 0.15)', emoji: '🧘' },
  overloaded: { color: '#E07A5F', bgColor: 'rgba(224, 122, 95, 0.15)', emoji: '🔥' },
};

interface StateIndicatorProps {
  emoji?: string;
  state: string;
  confidence: number;
  description?: string;
  stateColor?: string;
}

export function StateIndicator({ emoji, state, confidence, description, stateColor }: StateIndicatorProps) {
  const stateKey = state.toLowerCase();
  const style = STATE_STYLES[stateKey] || STATE_STYLES.calm;
  const displayEmoji = emoji || style.emoji;
  const displayColor = stateColor || style.color;
  
  // Format state name
  const formatState = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--beige)',
      borderLeft: `4px solid ${displayColor}`,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Current State
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: style.bgColor,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          boxShadow: `0 4px 12px ${style.bgColor}`
        }}>
          {displayEmoji}
        </div>
        <div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '600', 
            color: displayColor,
            lineHeight: 1.2
          }}>
            {formatState(state)}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--text-muted)', 
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>Confidence:</span>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'var(--beige)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${confidence}%`,
                height: '100%',
                background: displayColor,
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ fontWeight: '500' }}>{confidence}%</span>
          </div>
        </div>
      </div>
      {description && (
        <div style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          padding: '12px 16px',
          background: 'var(--beige-light)',
          borderRadius: '12px',
          lineHeight: 1.5
        }}>
          {description}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Wifi, WifiOff, Battery } from 'lucide-react';
import { DeviceStatus as DeviceStatusType } from '../types/device';

interface DeviceStatusProps {
  name: string;
  status: DeviceStatusType;
  icon?: React.ReactNode;
}

export function DeviceStatus({ name, status, icon }: DeviceStatusProps) {
  const { isConnected, batteryLevel } = status;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'white',
      borderRadius: '12px',
      padding: '14px 16px',
      border: '1px solid var(--beige)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)'
    }}>
      {icon && (
        <div style={{ color: isConnected ? 'var(--coral)' : 'var(--text-muted)' }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: 'var(--text-dark)' 
        }}>
          {name}
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontSize: '12px', 
          color: 'var(--text-muted)',
          marginTop: '2px'
        }}>
          {isConnected ? (
            <>
              <Wifi size={12} style={{ color: 'var(--state-calm)' }} />
              <span style={{ color: 'var(--state-calm)' }}>Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={12} style={{ color: 'var(--text-muted)' }} />
              <span>Disconnected</span>
            </>
          )}
          {batteryLevel !== undefined && (
            <>
              <span style={{ color: 'var(--beige)' }}>•</span>
              <Battery size={12} />
              <span>{batteryLevel}%</span>
            </>
          )}
        </div>
      </div>
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: isConnected ? 'var(--state-calm)' : 'var(--beige)',
          boxShadow: isConnected ? '0 0 8px rgba(129, 178, 154, 0.5)' : 'none'
        }}
      />
    </div>
  );
}

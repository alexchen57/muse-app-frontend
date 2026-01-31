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
    <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3">
      {icon && <div className="text-slate-400">{icon}</div>}
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{name}</div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-green-500">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-slate-500" />
              <span className="text-slate-500">Disconnected</span>
            </>
          )}
          {batteryLevel !== undefined && (
            <>
              <span className="mx-1">•</span>
              <Battery className="w-3 h-3" />
              <span>{batteryLevel}%</span>
            </>
          )}
        </div>
      </div>
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-slate-600'
        }`}
      />
    </div>
  );
}

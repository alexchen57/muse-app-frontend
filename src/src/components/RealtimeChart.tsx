import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface DataPoint {
  timestamp: number;
  value: number;
}

interface RealtimeChartProps {
  data: DataPoint[];
  title: string;
  color: string;
  unit?: string;
  yDomain?: [number, number];
}

export function RealtimeChart({
  data,
  title,
  color,
  unit = '',
  yDomain,
}: RealtimeChartProps) {
  const chartData = data.map((point) => ({
    time: format(point.timestamp, 'HH:mm:ss'),
    value: point.value,
  }));

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="text-sm font-medium text-slate-400 mb-4">{title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="time"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#64748b' }}
          />
          <YAxis
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#64748b' }}
            domain={yDomain || ['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#cbd5e1' }}
            formatter={(value: number) => [`${value.toFixed(1)}${unit}`, title]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

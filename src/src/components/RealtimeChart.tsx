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
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--beige)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ 
        fontSize: '14px', 
        fontWeight: '500', 
        color: 'var(--text-muted)', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{
          width: '12px',
          height: '12px',
          borderRadius: '3px',
          background: color
        }} />
        {title}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--beige)" 
            vertical={false}
          />
          <XAxis
            dataKey="time"
            stroke="var(--text-muted)"
            style={{ fontSize: '11px' }}
            tick={{ fill: 'var(--text-muted)' }}
            axisLine={{ stroke: 'var(--beige)' }}
            tickLine={{ stroke: 'var(--beige)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            style={{ fontSize: '11px' }}
            tick={{ fill: 'var(--text-muted)' }}
            domain={yDomain || ['auto', 'auto']}
            axisLine={{ stroke: 'var(--beige)' }}
            tickLine={{ stroke: 'var(--beige)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid var(--beige)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '12px'
            }}
            labelStyle={{ color: 'var(--text-dark)', fontWeight: '500' }}
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

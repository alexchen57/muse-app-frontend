import React, { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../utils/db';
import { StateHistory } from '../types/state';
import { STATE_LABELS, STATE_COLORS } from '../types/state';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function HistoryView() {
  const [stateHistory, setStateHistory] = useState<StateHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadHistory();
  }, [selectedDate]);

  const loadHistory = async () => {
    try {
      const dayStart = startOfDay(selectedDate).getTime();
      const dayEnd = endOfDay(selectedDate).getTime();

      const history = await db.stateHistory
        .where('startTime')
        .between(dayStart, dayEnd)
        .toArray();

      setStateHistory(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const stats = stateHistory.reduce(
    (acc, record) => {
      const duration = (record.endTime || Date.now()) - record.startTime;
      acc[record.state] = (acc[record.state] || 0) + duration;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalDuration = Object.values(stats).reduce((a, b) => a + b, 0);

  const pieData = Object.entries(stats).map(([state, duration]) => ({
    name: STATE_LABELS[state as keyof typeof STATE_LABELS],
    value: duration / 1000 / 60,
    color: STATE_COLORS[state as keyof typeof STATE_COLORS],
  }));

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  // Custom state colors for the warm design
  const warmStateColors: Record<string, string> = {
    calm: '#81B29A',
    stressed: '#E07A5F',
    productive: '#A8DADC',
    distracted: '#F4A261',
    recovering: '#81B29A',
    overloaded: '#E07A5F',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Date Selector */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid var(--beige)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--beige-light)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={24} style={{ color: 'var(--coral)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-dark)' }}>
              State History
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {format(selectedDate, 'MMMM dd, yyyy EEEE')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: 'var(--beige-light)',
                border: 'none',
                borderRadius: '10px',
                color: 'var(--text-dark)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              style={{
                padding: '10px 20px',
                background: 'var(--coral)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(224, 122, 95, 0.3)'
              }}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '16px' 
      }}>
        {Object.entries(STATE_LABELS).map(([state, label]) => {
          const duration = stats[state] || 0;
          const percentage = totalDuration > 0 ? (duration / totalDuration) * 100 : 0;
          const stateColor = warmStateColors[state] || STATE_COLORS[state as keyof typeof STATE_COLORS];

          return (
            <div
              key={state}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid var(--beige)',
                borderLeft: `4px solid ${stateColor}`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {label}
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '300', 
                marginBottom: '4px',
                color: stateColor
              }}>
                {formatDuration(duration)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {percentage.toFixed(1)}% of session
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid var(--beige)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: 'var(--text-dark)', 
            marginBottom: '20px' 
          }}>
            State Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid var(--beige)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => `${value.toFixed(0)} minutes`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Timeline */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid var(--beige)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '18px', 
          fontWeight: '600', 
          color: 'var(--text-dark)', 
          marginBottom: '20px' 
        }}>
          <TrendingUp size={20} style={{ color: 'var(--coral)' }} />
          Timeline
        </h3>

        {stateHistory.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-muted)', 
            padding: '48px 24px' 
          }}>
            <p>No records for this date</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stateHistory.map((record) => {
              const stateColor = warmStateColors[record.state] || STATE_COLORS[record.state];
              return (
                <div
                  key={record.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: 'var(--beige-light)',
                    borderRadius: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      backgroundColor: stateColor,
                      boxShadow: `0 0 8px ${stateColor}40`
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: '500', color: stateColor }}>
                        {STATE_LABELS[record.state]}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {format(record.startTime, 'HH:mm:ss')}
                        {record.endTime && ` - ${format(record.endTime, 'HH:mm:ss')}`}
                      </span>
                      <span style={{ 
                        fontSize: '12px', 
                        color: 'var(--text-muted)',
                        background: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {formatDuration((record.endTime || Date.now()) - record.startTime)}
                      </span>
                    </div>
                    {record.metrics && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-muted)', 
                      marginTop: '6px' 
                    }}>
                      HR: {record.metrics.heartRate} bpm • MWL: {(record.metrics.mwlIndex * 100).toFixed(0)}%
                    </div>
                  )}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: 'var(--text-muted)',
                    background: 'white',
                    padding: '4px 10px',
                    borderRadius: '6px'
                  }}>
                    {(record.avgConfidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

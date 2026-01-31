import React, { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { Calendar, TrendingUp } from 'lucide-react';
import { db } from '../utils/db';
import { StateHistory } from '../types/state';
import { STATE_LABELS, STATE_COLORS } from '../types/state';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

  // Calculate statistics
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
    value: duration / 1000 / 60, // Convert to minutes
    color: STATE_COLORS[state as keyof typeof STATE_COLORS],
  }));

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-4">
          <Calendar className="w-6 h-6 text-slate-400" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">State History</h2>
            <p className="text-sm text-slate-400">
              {format(selectedDate, 'MMMM dd, yyyy EEEE')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
            >
              Previous Day
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATE_LABELS).map(([state, label]) => {
          const duration = stats[state] || 0;
          const percentage = totalDuration > 0 ? (duration / totalDuration) * 100 : 0;

          return (
            <div
              key={state}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
              style={{
                borderLeftColor: STATE_COLORS[state as keyof typeof STATE_COLORS],
                borderLeftWidth: '4px',
              }}
            >
              <div className="text-sm text-slate-400 mb-2">{label}</div>
              <div
                className="text-2xl font-bold mb-1"
                style={{
                  color: STATE_COLORS[state as keyof typeof STATE_COLORS],
                }}
              >
                {formatDuration(duration)}
              </div>
              <div className="text-xs text-slate-500">
                {percentage.toFixed(1)}% duration
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-4">State Distribution</h3>
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
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `${value.toFixed(0)} minutes`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Timeline
        </h3>

        {stateHistory.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <p>No records for this date</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stateHistory.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: STATE_COLORS[record.state],
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-medium"
                      style={{ color: STATE_COLORS[record.state] }}
                    >
                      {STATE_LABELS[record.state]}
                    </span>
                    <span className="text-sm text-slate-400">
                      {format(record.startTime, 'HH:mm:ss')}
                      {record.endTime &&
                        ` - ${format(record.endTime, 'HH:mm:ss')}`}
                    </span>
                    <span className="text-xs text-slate-500">
                      (
                      {formatDuration(
                        (record.endTime || Date.now()) - record.startTime
                      )}
                      )
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    HR: {record.metrics.heartRate} bpm • MWL:{' '}
                    {(record.metrics.mwlIndex * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {(record.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
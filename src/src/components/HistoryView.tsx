import { useState, useEffect, useMemo } from 'react';
import { db } from '../utils/db';
import { HeartRateData, MWLData } from '../types/device';
import { StateHistory, UserStateType, STATE_COLORS, STATE_LABELS } from '../types/state';
import { RealtimeChart } from './RealtimeChart';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

/**
 * 历史数据视图组件
 * 显示历史心率、MWL 和状态数据
 */
export function HistoryView() {
  // 时间范围状态
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days' | 'custom'>('today');
  const [startDate, setStartDate] = useState<Date>(startOfDay(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfDay(new Date()));
  
  // 数据状态
  const [heartRateData, setHeartRateData] = useState<HeartRateData[]>([]);
  const [mwlData, setMWLData] = useState<MWLData[]>([]);
  const [stateHistory, setStateHistory] = useState<StateHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 根据时间范围预设更新日期
  useEffect(() => {
    const now = new Date();
    switch (timeRange) {
      case 'today':
        setStartDate(startOfDay(now));
        setEndDate(endOfDay(now));
        break;
      case '7days':
        setStartDate(startOfDay(subDays(now, 7)));
        setEndDate(endOfDay(now));
        break;
      case '30days':
        setStartDate(startOfDay(subDays(now, 30)));
        setEndDate(endOfDay(now));
        break;
    }
  }, [timeRange]);

  // 加载历史数据
  useEffect(() => {
    async function loadHistoryData() {
      setIsLoading(true);
      try {
        const startTimestamp = startDate.getTime();
        const endTimestamp = endDate.getTime();

        // 加载心率数据
        const hrData = await db.heartRate
          .where('timestamp')
          .between(startTimestamp, endTimestamp)
          .toArray();

        // 加载 MWL 数据
        const mData = await db.mwl
          .where('timestamp')
          .between(startTimestamp, endTimestamp)
          .toArray();

        // 加载状态历史
        const stateData = await db.stateHistory
          .where('startTime')
          .between(startTimestamp, endTimestamp)
          .toArray();

        setHeartRateData(hrData);
        setMWLData(mData);
        setStateHistory(stateData);
      } catch (error) {
        console.error('加载历史数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadHistoryData();
  }, [startDate, endDate]);

  // 计算统计数据
  const statistics = useMemo(() => {
    if (heartRateData.length === 0 && mwlData.length === 0) {
      return null;
    }

    // 心率统计
    const hrValues = heartRateData.map(d => d.heartRate);
    const avgHR = hrValues.length > 0 
      ? hrValues.reduce((sum, val) => sum + val, 0) / hrValues.length 
      : 0;
    const maxHR = hrValues.length > 0 ? Math.max(...hrValues) : 0;
    const minHR = hrValues.length > 0 ? Math.min(...hrValues) : 0;

    // MWL 统计
    const mwlValues = mwlData.map(d => d.mwlIndex);
    const avgMWL = mwlValues.length > 0 
      ? mwlValues.reduce((sum, val) => sum + val, 0) / mwlValues.length 
      : 0;
    const maxMWL = mwlValues.length > 0 ? Math.max(...mwlValues) : 0;
    const minMWL = mwlValues.length > 0 ? Math.min(...mwlValues) : 0;

    // 状态统计
    const stateDurations: Record<UserStateType, number> = {
      [UserStateType.STRESSED]: 0,
      [UserStateType.CALM]: 0,
      [UserStateType.PRODUCTIVE]: 0,
      [UserStateType.DISTRACTED]: 0,
    };

    stateHistory.forEach(entry => {
      const duration = (entry.endTime - entry.startTime) / 1000; // 转换为秒
      stateDurations[entry.state] += duration;
    });

    const totalDuration = Object.values(stateDurations).reduce((sum, val) => sum + val, 0);
    const statePercentages: Record<UserStateType, number> = {
      [UserStateType.STRESSED]: totalDuration > 0 ? (stateDurations[UserStateType.STRESSED] / totalDuration) * 100 : 0,
      [UserStateType.CALM]: totalDuration > 0 ? (stateDurations[UserStateType.CALM] / totalDuration) * 100 : 0,
      [UserStateType.PRODUCTIVE]: totalDuration > 0 ? (stateDurations[UserStateType.PRODUCTIVE] / totalDuration) * 100 : 0,
      [UserStateType.DISTRACTED]: totalDuration > 0 ? (stateDurations[UserStateType.DISTRACTED] / totalDuration) * 100 : 0,
    };

    return {
      heartRate: { avg: avgHR, max: maxHR, min: minHR },
      mwl: { avg: avgMWL, max: maxMWL, min: minMWL },
      stateDurations,
      statePercentages,
      totalDuration,
    };
  }, [heartRateData, mwlData, stateHistory]);

  // 准备图表数据
  const heartRateChartData = useMemo(() => {
    return heartRateData.map(data => ({
      timestamp: data.timestamp,
      value: data.heartRate,
    }));
  }, [heartRateData]);

  const mwlChartData = useMemo(() => {
    return mwlData.map(data => ({
      timestamp: data.timestamp,
      value: data.mwlIndex * 100,
    }));
  }, [mwlData]);

  // 格式化持续时间
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}小时 ${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟 ${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 标题 */}
      <div style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        color: '#e2e8f0',
        marginBottom: '8px' 
      }}>
        📊 历史数据分析
      </div>

      {/* 时间范围选择器 */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(71, 85, 105, 0.5)',
      }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '16px' }}>
          选择时间范围
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {(['today', '7days', '30days', 'custom'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: timeRange === range ? '#8b5cf6' : 'rgba(71, 85, 105, 0.5)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: timeRange === range ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
              }}
            >
              {range === 'today' && '今天'}
              {range === '7days' && '最近7天'}
              {range === '30days' && '最近30天'}
              {range === 'custom' && '自定义'}
            </button>
          ))}
        </div>

        {timeRange === 'custom' && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: '#94a3b8' }}>开始日期</label>
              <input
                type="datetime-local"
                value={format(startDate, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#e2e8f0',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: '#94a3b8' }}>结束日期</label>
              <input
                type="datetime-local"
                value={format(endDate, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#e2e8f0',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '16px',
        }}>
          加载数据中...
        </div>
      )}

      {/* 统计摘要 */}
      {!isLoading && statistics && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(71, 85, 105, 0.5)',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '20px' }}>
            📈 数据摘要
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* 心率统计 */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>❤️ 心率</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', marginBottom: '4px' }}>
                {Math.round(statistics.heartRate.avg)} bpm
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                范围: {Math.round(statistics.heartRate.min)} - {Math.round(statistics.heartRate.max)} bpm
              </div>
            </div>

            {/* MWL 统计 */}
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>🧠 心智负荷</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '4px' }}>
                {Math.round(statistics.mwl.avg * 100)}%
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                范围: {Math.round(statistics.mwl.min * 100)}% - {Math.round(statistics.mwl.max * 100)}%
              </div>
            </div>

            {/* 数据点数量 */}
            <div style={{
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>📊 数据点</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', marginBottom: '4px' }}>
                {heartRateData.length}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                心率记录数
              </div>
            </div>

            {/* 总时长 */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}>
              <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>⏱️ 总时长</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                {formatDuration(statistics.totalDuration)}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                状态记录时长
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 状态分布 */}
      {!isLoading && statistics && statistics.totalDuration > 0 && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(71, 85, 105, 0.5)',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '16px' }}>
            🎭 状态分布
          </div>
          
          {/* 状态条形图 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.values(UserStateType).map((state) => (
              <div key={state}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '6px' 
                }}>
                  <span style={{ fontSize: '14px', color: '#e2e8f0' }}>
                    {STATE_LABELS[state]}
                  </span>
                  <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                    {statistics.statePercentages[state].toFixed(1)}% ({formatDuration(statistics.stateDurations[state])})
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(71, 85, 105, 0.3)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${statistics.statePercentages[state]}%`,
                    height: '100%',
                    background: STATE_COLORS[state],
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 历史图表 */}
      {!isLoading && heartRateChartData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          <RealtimeChart
            data={heartRateChartData}
            title="心率历史趋势"
            color="#ef4444"
            unit=" bpm"
            yDomain={[40, 140]}
          />
          <RealtimeChart
            data={mwlChartData}
            title="心智负荷历史趋势"
            color="#8b5cf6"
            unit="%"
            yDomain={[0, 100]}
          />
        </div>
      )}

      {/* 状态历史时间线 */}
      {!isLoading && stateHistory.length > 0 && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(71, 85, 105, 0.5)',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '16px' }}>
            🕒 状态历史时间线
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '8px',
          }}>
            {stateHistory.map((entry, index) => (
              <div
                key={entry.id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px',
                  background: 'rgba(71, 85, 105, 0.2)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${STATE_COLORS[entry.state]}`,
                }}
              >
                <div style={{
                  width: '80px',
                  fontSize: '12px',
                  color: '#94a3b8',
                }}>
                  {format(new Date(entry.startTime), 'HH:mm:ss')}
                </div>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    background: STATE_COLORS[entry.state],
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}>
                    {STATE_LABELS[entry.state]}
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                    持续: {formatDuration(entry.duration)}
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b',
                }}>
                  置信度: {Math.round(entry.avgConfidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 无数据提示 */}
      {!isLoading && heartRateData.length === 0 && mwlData.length === 0 && stateHistory.length === 0 && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          padding: '40px',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: '18px', color: '#e2e8f0', marginBottom: '8px' }}>
            暂无历史数据
          </div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>
            在所选时间范围内未找到任何记录数据
          </div>
        </div>
      )}
    </div>
  );
}

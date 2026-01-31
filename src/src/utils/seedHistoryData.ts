import { db } from './db';
import { HeartRateData, MWLData } from '../types/device';
import { StateHistory, UserStateType } from '../types/state';
import { BrainRegion } from '../types/biometric';

/**
 * 生成示例历史数据
 * 用于测试历史数据视图功能
 */

/**
 * 生成随机心率数据
 */
function generateRandomHeartRate(baseRate: number, variance: number): number {
  return Math.max(50, Math.min(140, baseRate + (Math.random() - 0.5) * variance));
}

/**
 * 生成随机 MWL 数据
 */
function generateRandomMWL(baseMWL: number, variance: number): number {
  return Math.max(0, Math.min(1, baseMWL + (Math.random() - 0.5) * variance));
}

/**
 * 根据状态生成相应的心率和 MWL
 */
function getMetricsForState(state: UserStateType): { heartRate: number; mwl: number } {
  switch (state) {
    case UserStateType.STRESSED:
      return {
        heartRate: generateRandomHeartRate(95, 20),
        mwl: generateRandomMWL(0.75, 0.2),
      };
    case UserStateType.CALM:
      return {
        heartRate: generateRandomHeartRate(65, 10),
        mwl: generateRandomMWL(0.25, 0.15),
      };
    case UserStateType.PRODUCTIVE:
      return {
        heartRate: generateRandomHeartRate(75, 15),
        mwl: generateRandomMWL(0.6, 0.2),
      };
    case UserStateType.DISTRACTED:
      return {
        heartRate: generateRandomHeartRate(80, 25),
        mwl: generateRandomMWL(0.4, 0.25),
      };
  }
}

/**
 * 生成指定时间范围内的历史数据
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @param intervalMs 数据点之间的间隔（毫秒）
 */
export async function seedHistoryData(
  startDate: Date,
  endDate: Date,
  intervalMs: number = 1000 // 默认每秒一个数据点
): Promise<void> {
  console.log('开始生成历史数据...');

  const heartRateDataPoints: HeartRateData[] = [];
  const mwlDataPoints: MWLData[] = [];
  const stateHistoryEntries: StateHistory[] = [];

  // 状态序列（模拟一天的工作状态变化）
  const stateSequence: Array<{ state: UserStateType; durationMinutes: number }> = [
    { state: UserStateType.CALM, durationMinutes: 30 },
    { state: UserStateType.PRODUCTIVE, durationMinutes: 90 },
    { state: UserStateType.DISTRACTED, durationMinutes: 15 },
    { state: UserStateType.PRODUCTIVE, durationMinutes: 60 },
    { state: UserStateType.STRESSED, durationMinutes: 30 },
    { state: UserStateType.CALM, durationMinutes: 60 },
    { state: UserStateType.PRODUCTIVE, durationMinutes: 120 },
    { state: UserStateType.DISTRACTED, durationMinutes: 20 },
    { state: UserStateType.CALM, durationMinutes: 45 },
  ];

  let currentTime = startDate.getTime();
  const endTime = endDate.getTime();
  let stateIndex = 0;
  let currentState = stateSequence[0].state;
  let stateStartTime = currentTime;
  let nextStateChangeTime = currentTime + stateSequence[0].durationMinutes * 60 * 1000;

  const brainRegions = [BrainRegion.LEFT_PFC, BrainRegion.RIGHT_PFC, BrainRegion.M_PFC, BrainRegion.VL_PFC];

  while (currentTime <= endTime) {
    // 检查是否需要切换状态
    if (currentTime >= nextStateChangeTime) {
      // 保存当前状态历史
      stateHistoryEntries.push({
        id: `state_${stateHistoryEntries.length}_${currentTime}`,
        state: currentState,
        startTime: stateStartTime,
        endTime: currentTime,
        duration: (currentTime - stateStartTime) / 1000,
        avgConfidence: 0.75 + Math.random() * 0.2, // 0.75-0.95
      });

      // 切换到下一个状态
      stateIndex = (stateIndex + 1) % stateSequence.length;
      currentState = stateSequence[stateIndex].state;
      stateStartTime = currentTime;
      nextStateChangeTime = currentTime + stateSequence[stateIndex].durationMinutes * 60 * 1000;
    }

    // 根据当前状态生成心率和 MWL 数据
    const metrics = getMetricsForState(currentState);

    // 添加心率数据点
    heartRateDataPoints.push({
      timestamp: currentTime,
      heartRate: metrics.heartRate,
      signalQuality: 0.85 + Math.random() * 0.15, // 0.85-1.0
      rrInterval: 60000 / metrics.heartRate, // 计算 RR 间隔
    });

    // 添加 MWL 数据点
    mwlDataPoints.push({
      timestamp: currentTime,
      mwlIndex: metrics.mwl,
      hbO2Level: metrics.mwl * 10 + Math.random() * 2, // 模拟 HbO2 浓度
      region: brainRegions[Math.floor(Math.random() * brainRegions.length)],
      signalQuality: 0.8 + Math.random() * 0.2, // 0.8-1.0
    });

    currentTime += intervalMs;
  }

  // 保存最后一个状态
  if (stateStartTime < endTime) {
    stateHistoryEntries.push({
      id: `state_${stateHistoryEntries.length}_${endTime}`,
      state: currentState,
      startTime: stateStartTime,
      endTime: endTime,
      duration: (endTime - stateStartTime) / 1000,
      avgConfidence: 0.75 + Math.random() * 0.2,
    });
  }

  // 批量保存到数据库
  try {
    await db.transaction('rw', [db.heartRate, db.mwl, db.stateHistory], async () => {
      await db.heartRate.bulkAdd(heartRateDataPoints);
      await db.mwl.bulkAdd(mwlDataPoints);
      await db.stateHistory.bulkAdd(stateHistoryEntries);
    });

    console.log('历史数据生成完成！');
    console.log(`- 心率数据点: ${heartRateDataPoints.length}`);
    console.log(`- MWL 数据点: ${mwlDataPoints.length}`);
    console.log(`- 状态历史记录: ${stateHistoryEntries.length}`);
  } catch (error) {
    console.error('保存历史数据失败:', error);
    throw error;
  }
}

/**
 * 清除所有历史数据
 */
export async function clearHistoryData(): Promise<void> {
  try {
    await db.transaction('rw', [db.heartRate, db.mwl, db.stateHistory], async () => {
      await db.heartRate.clear();
      await db.mwl.clear();
      await db.stateHistory.clear();
    });
    console.log('历史数据已清除');
  } catch (error) {
    console.error('清除历史数据失败:', error);
    throw error;
  }
}

/**
 * 生成今天的示例数据
 */
export async function seedTodayData(): Promise<void> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0); // 从早上9点开始
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0); // 到下午6点
  
  await seedHistoryData(startOfToday, endOfToday, 1000); // 每秒一个数据点
}

/**
 * 生成最近7天的示例数据
 */
export async function seedWeekData(): Promise<void> {
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0);
    const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0);
    
    console.log(`生成第 ${7 - i} 天的数据...`);
    await seedHistoryData(startTime, endTime, 5000); // 每5秒一个数据点（减少数据量）
  }
}

/**
 * 生成最近30天的示例数据
 */
export async function seedMonthData(): Promise<void> {
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0);
    const endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0);
    
    console.log(`生成第 ${30 - i} 天的数据...`);
    await seedHistoryData(startTime, endTime, 30000); // 每30秒一个数据点（大幅减少数据量）
  }
}

// 导出到 window 对象，方便在浏览器控制台中调用
if (typeof window !== 'undefined') {
  (window as any).seedHistoryData = {
    seedTodayData,
    seedWeekData,
    seedMonthData,
    clearHistoryData,
  };
  
  console.log('历史数据填充工具已加载。使用以下命令：');
  console.log('- window.seedHistoryData.seedTodayData() - 生成今天的数据');
  console.log('- window.seedHistoryData.seedWeekData() - 生成最近7天的数据');
  console.log('- window.seedHistoryData.seedMonthData() - 生成最近30天的数据');
  console.log('- window.seedHistoryData.clearHistoryData() - 清除所有数据');
}

/**
 * Phase 16.3: Daily Mission system — điểm danh + nhiệm vụ hàng ngày, tăng retention.
 *
 * Mỗi ngày 00:00 local time:
 *   - Reset todayMissions: roll 3 random từ pool
 *   - Tăng loginStreak nếu liên tiếp (yesterday < today < day after yesterday + 1)
 *
 * Mỗi turn / action / event game → progress increment theo check function.
 * Khi progress >= target → user click "Nhận" để claim reward.
 */

export interface DailyMissionTemplate {
  id: string;
  /** Tên hiển thị */
  title: string;
  /** Mô tả ngắn */
  description: string;
  /** Số đếm mục tiêu (vd "3 lượt hành động" → target=3) */
  target: number;
  /** Reward khi complete */
  reward: {
    tienNgoc?: number;
    actionTokens?: number;
  };
  /** Loại để icon UI */
  category: 'daily-login' | 'action' | 'combat' | 'progression' | 'social' | 'exploration';
  /** Priority để hiển thị (cao = lên top) */
  priority?: number;
}

export interface DailyMissionInstance {
  templateId: string;
  progress: number;
  claimed: boolean;
}

export interface DailyMissionsState {
  /** Day string yyyy-MM-dd cuối reset */
  lastResetDay: string;
  /** 3 mission của hôm nay (random từ pool) */
  todayMissions: DailyMissionInstance[];
  /** Số ngày liên tiếp login */
  loginStreak: number;
  /** Day string yyyy-MM-dd của lần login cuối */
  lastLoginDay: string;
  /** Tổng số mission đã hoàn thành lifetime (badge progression) */
  totalCompleted: number;
}

export const INITIAL_DAILY_MISSIONS: DailyMissionsState = {
  lastResetDay: '',
  todayMissions: [],
  loginStreak: 0,
  lastLoginDay: '',
  totalCompleted: 0,
};

export const formatDay = (d = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Streak bonus: ngày liên tiếp N → multiplier reward */
export const getStreakMultiplier = (streak: number): number => {
  if (streak >= 30) return 3.0;
  if (streak >= 14) return 2.0;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.2;
  return 1.0;
};

/** Reward bonus mỗi ngày điểm danh + streak */
export const getDailyLoginReward = (streak: number): { tienNgoc: number; actionTokens: number } => {
  const baseTn = 30;
  const baseToken = 10;
  const mul = getStreakMultiplier(streak);
  return {
    tienNgoc: Math.floor(baseTn * mul),
    actionTokens: Math.floor(baseToken * mul),
  };
};

import { AP_PER_LEVEL } from '@data/initial-stats';

/**
 * EXP curve — đường cong tu luyện.
 * Mỗi cấp cần exp = base × multiplier^(level-1), nhưng có "đại đột phá tax"
 * mỗi 10 cấp: ×3.0 để mô phỏng cảm giác đột phá khó hơn.
 *
 * Có thể tinh chỉnh trong Phase 6 dựa trên playtest data.
 */
const BASE_EXP = 100;
const PER_LEVEL_MULTIPLIER = 1.18;
const BREAKTHROUGH_MULTIPLIER = 3.0;

export const calculateMaxExpForLevel = (level: number): number => {
  let exp = BASE_EXP * Math.pow(PER_LEVEL_MULTIPLIER, level - 1);
  // Mỗi cấp 10, 20, 30... = đại đột phá → exp cần ×3
  if (level > 0 && level % 10 === 0) {
    exp *= BREAKTHROUGH_MULTIPLIER;
  }
  return Math.floor(exp);
};

export const calculateTotalAP = (level: number): number => {
  return (level - 1) * AP_PER_LEVEL + 5; // +5 starting AP
};

export interface LevelUpResult {
  newLevel: number;
  newExp: number;
  newMaxExp: number;
  levelsGained: number;
  apEarned: number;
  crossedRealmBoundary: boolean;
}

/**
 * Áp dụng exp gain → trả về state mới. Pure function.
 * Vòng lặp xử lý nếu exp đủ để lên nhiều cấp một lúc.
 */
export const applyExpGain = (
  currentLevel: number,
  currentExp: number,
  expGained: number,
): LevelUpResult => {
  let level = currentLevel;
  let exp = currentExp + expGained;
  let maxExp = calculateMaxExpForLevel(level);
  let levelsGained = 0;

  while (exp >= maxExp && maxExp > 0) {
    exp -= maxExp;
    level += 1;
    levelsGained += 1;
    maxExp = calculateMaxExpForLevel(level);
  }

  const crossedRealmBoundary =
    Math.floor((currentLevel - 1) / 10) !== Math.floor((level - 1) / 10);

  return {
    newLevel: level,
    newExp: exp,
    newMaxExp: maxExp,
    levelsGained,
    apEarned: levelsGained * AP_PER_LEVEL,
    crossedRealmBoundary,
  };
};

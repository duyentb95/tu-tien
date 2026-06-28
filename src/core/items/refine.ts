/**
 * Phase 23.1: Item Refine system — rèn luyện trang bị tăng bậc.
 *
 * Tu tiên truyền thống — mỗi pháp bảo có thể rèn từ +0 tới +12.
 * Mỗi bậc tăng damage/HP/def +5% so với base bonuses.
 * Càng cao càng khó: tỷ lệ thành công giảm, cost tăng exponential.
 *
 * Pure helpers — KHÔNG side-effect, KHÔNG import React.
 * Math.random() injectable cho test deterministic.
 */

import type { Item } from '@gametypes/item';

export const MAX_REFINE_LEVEL = 12;

/**
 * Cost rèn từ level N → N+1 (Linh Thạch).
 * Lv 0→1: 50 · 1→2: 100 · 2→3: 200 · ... · 11→12: 102400
 * Tăng exponential 2x mỗi 2 bậc.
 */
export const getRefineCost = (currentLevel: number): { linhThach: number; tienNgoc?: number } => {
  const base = 50;
  // 50 · 100 · 200 · 400 · 800 · 1600 · 3200 · 6400 · 12800 · 25600 · 51200 · 102400
  const linhThach = base * Math.pow(2, Math.max(0, currentLevel));
  // Từ lv 6+ cần thêm Tiền Ngọc làm "thiên hỏa" để rèn được
  const tienNgoc = currentLevel >= 6 ? Math.floor((currentLevel - 5) * 10) : undefined;
  return tienNgoc !== undefined ? { linhThach, tienNgoc } : { linhThach };
};

/**
 * Tỷ lệ thành công rèn (0-1). Càng cao càng khó.
 *   +0→+3: 95%
 *   +3→+6: 80%
 *   +6→+9: 60%
 *   +9→+12: 40%
 */
export const getRefineSuccessRate = (currentLevel: number): number => {
  if (currentLevel < 3) return 0.95;
  if (currentLevel < 6) return 0.80;
  if (currentLevel < 9) return 0.60;
  return 0.40;
};

/** Reward stat multiplier mỗi refine level (5% per level). */
export const getRefineMultiplier = (refineLevel: number): number => {
  return 1 + Math.max(0, refineLevel) * 0.05;
};

/** Apply multiplier vào bonuses (immutable — return clone). */
export const applyRefineToBonuses = (
  bonuses: NonNullable<Item['bonuses']>,
  refineLevel: number,
): NonNullable<Item['bonuses']> => {
  const mul = getRefineMultiplier(refineLevel);
  const out: NonNullable<Item['bonuses']> = {};
  for (const k of Object.keys(bonuses) as Array<keyof typeof bonuses>) {
    const v = bonuses[k];
    if (typeof v === 'number') out[k] = Math.round(v * mul);
  }
  return out;
};

export interface RefineRollResult {
  success: boolean;
  newLevel: number;
  cost: ReturnType<typeof getRefineCost>;
  /** Khi fail ở level cao (≥9), có 30% chance downgrade -1 */
  downgraded?: boolean;
}

/**
 * Thực hiện 1 lần roll refine.
 * Caller phải đảm bảo đã trừ cost trước khi gọi.
 *
 * @param rng inject cho test, default Math.random
 */
export const rollRefine = (
  currentLevel: number,
  rng: () => number = Math.random,
): RefineRollResult => {
  const cost = getRefineCost(currentLevel);
  if (currentLevel >= MAX_REFINE_LEVEL) {
    return { success: false, newLevel: currentLevel, cost };
  }
  const successRate = getRefineSuccessRate(currentLevel);
  const success = rng() < successRate;
  if (success) {
    return { success: true, newLevel: currentLevel + 1, cost };
  }
  // Fail — high tier có thể downgrade
  if (currentLevel >= 9 && rng() < 0.3) {
    return { success: false, newLevel: Math.max(0, currentLevel - 1), cost, downgraded: true };
  }
  return { success: false, newLevel: currentLevel, cost };
};

/** Display label: "+5", "+12" (max), "" (chưa rèn) */
export const formatRefineLabel = (refineLevel: number | undefined): string => {
  if (!refineLevel || refineLevel <= 0) return '';
  return ` +${refineLevel}`;
};

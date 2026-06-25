import type { Item, Rarity } from '@gametypes/item';
import { generateItemBonuses } from '@core/stats/equipment';

/**
 * Pháp bảo (Artifact) — vũ khí/phụ kiện đặc biệt có thể "dưỡng".
 * artifactLevel: 1 (Phàm khí) → 2 (Linh khí) → 3 (Pháp khí) → 4 (Bảo khí) → 5 (Tiên khí)
 * artifactSoul: pháp bảo tinh hồn, tích tụ qua nourish.
 * Đạt threshold → auto level up (recompute bonuses ×levelMult).
 */

export const ARTIFACT_GRADE_NAMES = ['Phàm Khí', 'Linh Khí', 'Pháp Khí', 'Bảo Khí', 'Tiên Khí'] as const;

/** Soul threshold cần để lên level kế tiếp (level → soul cần) */
export const ARTIFACT_SOUL_THRESHOLD: number[] = [0, 100, 500, 2000, 10000, Infinity];

/** Multiplier cho bonus stats theo artifactLevel */
export const ARTIFACT_LEVEL_MULT: number[] = [1.0, 1.3, 1.7, 2.4, 3.5];

/** Check item có phải artifact-eligible không */
export const isArtifactEligible = (item: Item): boolean => {
  return (
    (item.category === 'Vũ khí' || item.category === 'Phụ kiện' || item.category === 'Dị thường') &&
    ['Cực Phẩm', 'Siêu Phẩm', 'Huyền Thoại'].includes(item.rarity)
  );
};

/** Tính artifactLevel hiện tại dựa vào soul */
export const computeArtifactLevel = (soul: number): number => {
  let level = 1;
  for (let i = 1; i < ARTIFACT_SOUL_THRESHOLD.length; i++) {
    if (soul >= ARTIFACT_SOUL_THRESHOLD[i]!) level = i + 1;
    else break;
  }
  return Math.min(level, 5);
};

/** Nourish artifact với linh thạch → return updated item + leveledUp flag */
export interface NourishResult {
  item: Item;
  leveledUp: boolean;
  newLevel?: number;
}

/** 1 linh thạch = 0.5 soul. Round up. */
export const SOUL_PER_CURRENCY = 0.5;

export const nourishArtifact = (item: Item, currencyAmount: number): NourishResult => {
  if (!isArtifactEligible(item)) {
    return { item, leveledUp: false };
  }
  const oldLevel = item.artifactLevel ?? 1;
  const oldSoul = item.artifactSoul ?? 0;
  const addSoul = Math.ceil(currencyAmount * SOUL_PER_CURRENCY);
  const newSoul = oldSoul + addSoul;
  const newLevel = computeArtifactLevel(newSoul);

  // Recompute bonuses nếu level up
  let newBonuses = item.bonuses;
  if (newLevel > oldLevel) {
    const baseBonuses = generateItemBonuses(item.rarity as Rarity, item.category, 1);
    const mult = ARTIFACT_LEVEL_MULT[newLevel - 1] ?? 1;
    if (baseBonuses) {
      newBonuses = Object.fromEntries(
        Object.entries(baseBonuses).map(([k, v]) => [k, Math.round((v ?? 0) * mult)]),
      ) as Item['bonuses'];
    }
  }

  return {
    item: {
      ...item,
      artifactLevel: newLevel,
      artifactSoul: newSoul,
      ...(newBonuses ? { bonuses: newBonuses } : {}),
    },
    leveledUp: newLevel > oldLevel,
    ...(newLevel > oldLevel ? { newLevel } : {}),
  };
};

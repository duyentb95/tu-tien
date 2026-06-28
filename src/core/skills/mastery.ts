/**
 * Phase 23.2: Skill Mastery — level kỹ năng 1-9.
 *
 * Càng dùng nhiều, càng "thấu hiểu". Mỗi turn cast skill trong combat → +XP.
 * Mỗi level lên = +damage multiplier + giảm cost.
 *
 *   Lv 1: Sơ Khởi (base) — 0 → 100 XP
 *   Lv 2: Tinh Thông
 *   Lv 3: Lão Luyện
 *   Lv 4: Thuần Thục
 *   Lv 5: Tinh Diệu
 *   Lv 6: Viên Mãn
 *   Lv 7: Hoàn Hảo
 *   Lv 8: Thấu Đạo
 *   Lv 9: ★ Đại Thành (max)
 *
 * Pure helpers — no React, no side-effect.
 */

export const MAX_MASTERY_LEVEL = 9;

export const MASTERY_LEVEL_NAMES: Record<number, string> = {
  1: 'Sơ Khởi',
  2: 'Tinh Thông',
  3: 'Lão Luyện',
  4: 'Thuần Thục',
  5: 'Tinh Diệu',
  6: 'Viên Mãn',
  7: 'Hoàn Hảo',
  8: 'Thấu Đạo',
  9: 'Đại Thành',
};

export interface SkillMasteryEntry {
  /** Level hiện tại 1-9 */
  level: number;
  /** XP tích lũy ở level hiện tại (reset về 0 khi lên level) */
  xp: number;
  /** Tổng lần dùng skill — track lifetime */
  totalUses: number;
}

export type SkillMasteryState = Record<string, SkillMasteryEntry>;

/** XP cần để lên level kế: 100 · 250 · 500 · 1000 · 2000 · 4000 · 8000 · 16000 (lv 8→9) */
export const getXpToNextLevel = (currentLevel: number): number => {
  if (currentLevel >= MAX_MASTERY_LEVEL) return Infinity;
  const tiers = [100, 250, 500, 1000, 2000, 4000, 8000, 16000];
  return tiers[currentLevel - 1] ?? 100;
};

/** Damage multiplier theo mastery level: lv 1 = 1.0x, lv 9 = 1.4x */
export const getMasteryDamageMultiplier = (level: number): number => {
  return 1 + (Math.max(1, Math.min(MAX_MASTERY_LEVEL, level)) - 1) * 0.05;
};

/** Create entry mới cho skill chưa bao giờ dùng */
export const createMasteryEntry = (): SkillMasteryEntry => ({
  level: 1,
  xp: 0,
  totalUses: 0,
});

export interface AddXpResult {
  state: SkillMasteryState;
  /** Skill có level up trong lần này không */
  leveledUp: boolean;
  /** Level mới sau lần này */
  newLevel: number;
  /** Skill name → để notify hiển thị */
  skillId: string;
}

/**
 * Thêm XP vào skill — có thể level up nhiều lần nếu delta lớn.
 * Pure — trả về state mới.
 */
export const addMasteryXp = (
  state: SkillMasteryState,
  skillId: string,
  xpDelta: number,
): AddXpResult => {
  const cur = state[skillId] ?? createMasteryEntry();
  let level = cur.level;
  let xp = cur.xp + Math.max(0, xpDelta);
  let leveledUp = false;
  // Cascade level up nếu xp đủ
  while (level < MAX_MASTERY_LEVEL) {
    const needed = getXpToNextLevel(level);
    if (xp >= needed) {
      xp -= needed;
      level += 1;
      leveledUp = true;
    } else break;
  }
  if (level >= MAX_MASTERY_LEVEL) {
    // Cap xp tại MAX (không tích thêm)
    xp = 0;
  }
  return {
    state: {
      ...state,
      [skillId]: {
        level,
        xp,
        totalUses: cur.totalUses + 1,
      },
    },
    leveledUp,
    newLevel: level,
    skillId,
  };
};

/** Display label: "★ Đại Thành" hoặc "Tinh Thông Lv 2 · 45/250" */
export const formatMasteryLabel = (entry: SkillMasteryEntry | undefined): string => {
  if (!entry) return 'Chưa luyện';
  if (entry.level >= MAX_MASTERY_LEVEL) return `★ ${MASTERY_LEVEL_NAMES[MAX_MASTERY_LEVEL]}`;
  return `${MASTERY_LEVEL_NAMES[entry.level] ?? `Lv ${entry.level}`} · ${entry.xp}/${getXpToNextLevel(entry.level)}`;
};

/**
 * Phase 23.3: Ý Cảnh helpers — pure.
 */
import type { WeaponIntentEntry, WeaponIntentState, WeaponIntentName } from '@gametypes/cultivation';

export const MAX_INTENT_LEVEL = 9;

/** XP curve: 50 / 150 / 400 / 1000 / 2500 / 6000 / 14000 / 30000 (lv 1→9) */
export const getIntentXpToNext = (level: number): number => {
  if (level >= MAX_INTENT_LEVEL) return Infinity;
  const tiers = [50, 150, 400, 1000, 2500, 6000, 14000, 30000];
  return tiers[level - 1] ?? 50;
};

/** Damage multiplier theo intent level — lv 1 = 1.0, lv 9 = 1.4 (5% per level) */
export const getIntentDamageMul = (level: number): number => {
  return 1 + (Math.max(1, Math.min(MAX_INTENT_LEVEL, level)) - 1) * 0.05;
};

export const createIntentEntry = (): WeaponIntentEntry => ({ level: 1, xp: 0, totalUses: 0 });

/** Skill name → intent name suy luận. Vd "Lôi Thiểm" → 'pháp ý', "Kiếm Khí Trảm" → 'kiếm ý' */
export const inferIntentFromSkill = (skillName: string): WeaponIntentName => {
  const n = skillName.toLowerCase();
  if (/kiếm|sword|jian/i.test(n)) return 'kiếm ý';
  if (/đao|dao|tao|saber/i.test(n)) return 'đao ý';
  if (/quyền|fist|đấm|punch/i.test(n)) return 'quyền ý';
  if (/chỉ|finger|điểm|point/i.test(n)) return 'chỉ ý';
  return 'pháp ý';  // default
};

export interface AddIntentXpResult {
  state: WeaponIntentState;
  leveledUp: boolean;
  newLevel: number;
  intentName: string;
}

export const addIntentXp = (
  state: WeaponIntentState,
  intentName: string,
  xpDelta: number,
): AddIntentXpResult => {
  const cur = state[intentName] ?? createIntentEntry();
  let level = cur.level;
  let xp = cur.xp + Math.max(0, xpDelta);
  let leveledUp = false;
  while (level < MAX_INTENT_LEVEL) {
    const needed = getIntentXpToNext(level);
    if (xp >= needed) { xp -= needed; level += 1; leveledUp = true; }
    else break;
  }
  if (level >= MAX_INTENT_LEVEL) xp = 0;
  return {
    state: { ...state, [intentName]: { level, xp, totalUses: cur.totalUses + 1 } },
    leveledUp,
    newLevel: level,
    intentName,
  };
};

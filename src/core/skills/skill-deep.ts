/**
 * Phase 24.A: Core helpers cho Skill Deep — pure functions.
 *
 * Tính aggregated effect khi cast skill:
 *   talent (3 nodes × tier) + runes (3 slots) + combos (registry match)
 *   → final damage mul, cooldown reduce, lifesteal, penetration, ...
 */
import type {
  SkillTalentState,
  SkillRuneSlots,
  SkillComboDef,
  TalentBranch,
} from '@gametypes/skill-deep';
import { TALENT_NODES } from '@data/talent-nodes';
import { getRuneById } from '@data/runes';
import { SKILL_COMBOS } from '@data/skill-combos';

export interface AggregatedSkillEffect {
  damageBonus: number;       // % cộng dồn (vd 0.45 = +45%)
  cooldownReduce: number;    // % cộng dồn
  lifesteal: number;
  penetration: number;
  healOverTime: number;      // flat HP/turn
  costReduce: number;        // %
  defBuff: number;           // % temp DEF buff khi cast
  critGuarantee: number;     // count (1 = 1 lần đầu mỗi combat)
  passiveFlags: Set<string>; // 'pen_10' | 'crit_first' | 'free_cast_5pct' ...
}

export const EMPTY_EFFECT: AggregatedSkillEffect = {
  damageBonus: 0,
  cooldownReduce: 0,
  lifesteal: 0,
  penetration: 0,
  healOverTime: 0,
  costReduce: 0,
  defBuff: 0,
  critGuarantee: 0,
  passiveFlags: new Set<string>(),
};

/** Cộng 2 effect. Dùng để aggregate qua chuỗi talent + rune + combo. */
export const mergeEffects = (
  a: AggregatedSkillEffect,
  b: AggregatedSkillEffect,
): AggregatedSkillEffect => ({
  damageBonus: a.damageBonus + b.damageBonus,
  cooldownReduce: a.cooldownReduce + b.cooldownReduce,
  lifesteal: a.lifesteal + b.lifesteal,
  penetration: a.penetration + b.penetration,
  healOverTime: a.healOverTime + b.healOverTime,
  costReduce: a.costReduce + b.costReduce,
  defBuff: a.defBuff + b.defBuff,
  critGuarantee: a.critGuarantee + b.critGuarantee,
  passiveFlags: new Set([...a.passiveFlags, ...b.passiveFlags]),
});

/** Talent → effect. Cộng tất cả 3 tier choice (nếu unlocked). */
export const computeTalentEffect = (
  talent: SkillTalentState | undefined,
  masteryLevel: number,
): AggregatedSkillEffect => {
  if (!talent) return { ...EMPTY_EFFECT, passiveFlags: new Set() };
  let acc: AggregatedSkillEffect = { ...EMPTY_EFFECT, passiveFlags: new Set() };
  for (const tier of [3, 4, 5] as const) {
    if (masteryLevel < tier) continue;
    const choice = talent[`t${tier}` as 't3' | 't4' | 't5'];
    if (!choice) continue;
    const node = TALENT_NODES[tier][choice as TalentBranch];
    acc = mergeEffects(acc, {
      damageBonus: node.effect.damageBonus ?? 0,
      cooldownReduce: node.effect.cooldownReduce ?? 0,
      lifesteal: node.effect.lifesteal ?? 0,
      penetration: 0,
      healOverTime: node.effect.healOverTime ?? 0,
      costReduce: 0,
      defBuff: node.effect.defBuff ?? 0,
      critGuarantee: node.effect.critGuarantee ?? 0,
      passiveFlags: new Set(node.effect.passiveFlag ? [node.effect.passiveFlag] : []),
    });
  }
  return acc;
};

/** Rune slots → effect. */
export const computeRuneEffect = (
  slots: SkillRuneSlots | undefined,
): AggregatedSkillEffect => {
  if (!slots) return { ...EMPTY_EFFECT, passiveFlags: new Set() };
  let acc: AggregatedSkillEffect = { ...EMPTY_EFFECT, passiveFlags: new Set() };
  for (const id of slots) {
    if (!id) continue;
    const def = getRuneById(id);
    if (!def) continue;
    acc = mergeEffects(acc, {
      damageBonus: def.effect.damageBonus ?? 0,
      cooldownReduce: def.effect.cooldownReduce ?? 0,
      lifesteal: def.effect.lifesteal ?? 0,
      penetration: def.effect.penetration ?? 0,
      healOverTime: def.effect.healOverTime ?? 0,
      costReduce: def.effect.costReduce ?? 0,
      defBuff: 0,
      critGuarantee: 0,
      passiveFlags: new Set<string>(),
    });
  }
  return acc;
};

/**
 * Detect active combos từ list skill name đang equip trong combat slot.
 * Match: skill set phải chứa skill match từng pattern (1 skill chỉ count 1 pattern).
 */
export const detectActiveCombos = (
  equippedSkillNames: string[],
): SkillComboDef[] => {
  const active: SkillComboDef[] = [];
  for (const combo of SKILL_COMBOS) {
    const patterns = combo.requiresNamePatterns ?? [];
    if (patterns.length === 0) continue;
    const used = new Set<number>();
    let allMatched = true;
    for (const pattern of patterns) {
      const matchIdx = equippedSkillNames.findIndex((n, i) => !used.has(i) && pattern.test(n));
      if (matchIdx === -1) {
        allMatched = false;
        break;
      }
      used.add(matchIdx);
    }
    if (allMatched) active.push(combo);
  }
  return active;
};

/** Aggregate combo bonuses thành effect. */
export const computeComboEffect = (
  combos: SkillComboDef[],
  enemyHpPct?: number,
): AggregatedSkillEffect => {
  let acc: AggregatedSkillEffect = { ...EMPTY_EFFECT, passiveFlags: new Set() };
  for (const c of combos) {
    // Trigger HP threshold check (vd Âm Quang chỉ active khi HP < 30%)
    if (c.effect.triggerHpPct !== undefined && enemyHpPct !== undefined) {
      if (enemyHpPct > c.effect.triggerHpPct) continue;
    }
    acc = mergeEffects(acc, {
      damageBonus: c.effect.damageBonus ?? 0,
      cooldownReduce: c.effect.cooldownReduce ?? 0,
      lifesteal: 0,
      penetration: 0,
      healOverTime: 0,
      costReduce: 0,
      defBuff: 0,
      critGuarantee: 0,
      passiveFlags: new Set(c.effect.specialTag ? [c.effect.specialTag] : []),
    });
  }
  return acc;
};

/**
 * Tổng hợp ALL: talent + rune + combo → final mul để apply combat.
 * (mastery damage mul tính riêng ở mastery.ts).
 */
export const computeFinalSkillEffect = (
  skillId: string,
  skillName: string,
  masteryLevel: number,
  talent: SkillTalentState | undefined,
  runes: SkillRuneSlots | undefined,
  equippedSkillNames: string[],
  enemyHpPct?: number,
): AggregatedSkillEffect => {
  void skillId; // reserved for future per-skill custom effect
  void skillName;
  const talentE = computeTalentEffect(talent, masteryLevel);
  const runeE = computeRuneEffect(runes);
  const combos = detectActiveCombos(equippedSkillNames);
  const comboE = computeComboEffect(combos, enemyHpPct);
  return mergeEffects(mergeEffects(talentE, runeE), comboE);
};

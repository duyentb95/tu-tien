import type { FinalStats } from '@gametypes/character';
import { realmGap } from '@core/stats/realms';

export interface DamageInput {
  attacker: FinalStats;
  attackerLevel: number;
  defender: FinalStats;
  defenderLevel: number;
  /** Hệ số skill — đánh thường = 1.0, ulti = 2-4 */
  skillMultiplier: number;
  /** Sát thương chuẩn (bỏ qua DEF) */
  trueDamage?: boolean;
  /** Đã quyết định crit trước đó? */
  forcedCrit?: boolean;
  rng?: () => number;
}

export interface DamageResult {
  damage: number;
  crit: boolean;
  dodged: boolean;
}

/**
 * Damage formula với realm gap penalty:
 *
 *   raw = (atk × skillMult - def × .4) × atkAmp_mult × defRes_mult
 *   if crit: × (cdmg / 100)
 *   if realm gap ≥ 1: × 0.15 (đánh người cảnh giới cao hơn)
 *   if realm gap ≤ -1: × 1.6 (đè cảnh giới)
 */
export const calculateDamage = (input: DamageInput): DamageResult => {
  const rng = input.rng ?? Math.random;

  // 1. Dodge check
  const dodgeRoll = rng() * 100;
  if (dodgeRoll < input.defender.evasion) {
    return { damage: 0, crit: false, dodged: true };
  }

  // 2. Crit check
  const critRoll = rng() * 100;
  const isCrit = input.forcedCrit ?? critRoll < input.attacker.cr;

  // 3. Raw damage
  const atkPart = input.attacker.atk * input.skillMultiplier;
  const defPart = input.trueDamage ? 0 : input.defender.def * 0.4;
  let raw = Math.max(1, atkPart - defPart);

  // 4. Amp / Res
  raw *= 1 + input.attacker.dmgAmp / 100;
  raw *= 1 - input.defender.dmgRes / 100;
  raw = Math.max(1, raw);

  // 5. Crit
  if (isCrit) raw *= input.attacker.cdmg / 100;

  // 6. Realm gap penalty / bonus
  const gap = realmGap(input.attackerLevel, input.defenderLevel);
  if (gap >= 1) raw *= 1.6 ** Math.min(gap, 3);
  else if (gap <= -1) raw *= 0.15 ** Math.min(-gap, 3);

  return { damage: Math.round(raw), crit: isCrit, dodged: false };
};

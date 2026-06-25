import type { PlayerCharacter } from '@gametypes/character';
import { calculateMaxExpForLevel } from '@core/stats/leveling';

/**
 * Tu luyện (meditation) — pure function tính EXP gain.
 *
 * Công thức:
 *   exp = BASE_PER_HOUR × hours × linh_căn_multiplier × technique_multiplier × env_multiplier
 *
 * Mỗi cấp đột phá lớn (10, 20, 30...) cần exp ×3 → mô phỏng "đại đột phá khó".
 */

const BASE_EXP_PER_HOUR = 6;

export interface MeditationContext {
  /** Số giờ tu luyện liên tục (trong game time) */
  hours: number;
  /** Hệ số linh căn (đơn = 3, ngũ = 0.5, dị = 4+) */
  spiritualRootMultiplier: number;
  /** Hệ số công pháp (Hoàng=1, Huyền=1.3, Địa=1.7, Thiên=2.2, Tiên=3, Thần=4) */
  techniqueGrade?: number;
  /** Hệ số môi trường (động phủ tốt, đêm âm hệ, ngày dương hệ...) */
  envMultiplier?: number;
  /** Bonus từ tâm cảnh (0-100 → 1.0-1.5) */
  mentalStateBonus?: number;
}

export const calculateMeditationExp = (ctx: MeditationContext): number => {
  const tech = ctx.techniqueGrade ?? 1.0;
  const env = ctx.envMultiplier ?? 1.0;
  const mental = ctx.mentalStateBonus ?? 1.0;
  return Math.floor(
    BASE_EXP_PER_HOUR * ctx.hours * ctx.spiritualRootMultiplier * tech * env * mental,
  );
};

/**
 * Áp dụng exp gain → return state mới + breakthrough info.
 * Pure function — không mutate input.
 */
export interface MeditationResult {
  player: PlayerCharacter;
  expGained: number;
  levelsGained: number;
  /** Có cross qua boundary cảnh giới mới (cấp 10/20/30...) không */
  triggeredBreakthrough: boolean;
  /** Cấp mới — nếu = 10, 20, 30... thì cần độ kiếp */
  newLevel: number;
  /** Có cần độ kiếp không (đạt cấp 10, 20, 30...) */
  requiresTribulation: boolean;
}

export const applyMeditation = (
  player: PlayerCharacter,
  expGained: number,
): MeditationResult => {
  let level = player.level;
  let exp = player.exp + expGained;
  let maxExp = player.maxExp || calculateMaxExpForLevel(level);
  let levelsGained = 0;

  while (exp >= maxExp && maxExp > 0) {
    exp -= maxExp;
    level += 1;
    levelsGained += 1;
    maxExp = calculateMaxExpForLevel(level);
  }

  const oldRealmTier = Math.floor((player.level - 1) / 10);
  const newRealmTier = Math.floor((level - 1) / 10);
  const triggeredBreakthrough = newRealmTier > oldRealmTier;

  // Trigger tribulation khi đạt cấp 10, 20, 30, 40, 50...
  const requiresTribulation =
    levelsGained > 0 && level % 10 === 0 && level !== player.level;

  const updated: PlayerCharacter = {
    ...player,
    level,
    exp,
    maxExp,
    ap: player.ap + levelsGained * 5,
  };

  return {
    player: updated,
    expGained,
    levelsGained,
    triggeredBreakthrough,
    newLevel: level,
    requiresTribulation,
  };
};

/**
 * Heuristic chọn hệ số môi trường dựa trên location type + thời gian.
 * Dùng khi player tu luyện trong action choice.
 */
export const getEnvMultiplier = (locationType?: string, isNight?: boolean): number => {
  if (locationType === 'cave_abode') return 1.5; // động phủ
  if (locationType === 'sect') return 1.2;
  if (locationType === 'secret_realm') return 1.8;
  if (locationType === 'wilderness') return 0.8;
  if (isNight) return 1.1; // đêm âm khí mạnh
  return 1.0;
};

/** Quy đổi tâm cảnh 0-100 sang multiplier 1.0-1.5 */
export const getMentalStateMultiplier = (mentalState: number): number => {
  const clamped = Math.max(0, Math.min(100, mentalState));
  return 1.0 + (clamped / 100) * 0.5;
};

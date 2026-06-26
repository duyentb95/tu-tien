/**
 * Phase 11.2: EP Scoring 4-criteria + Anti-farming (Pattern #3 từ Google Canvas RPG).
 *
 * Pure math layer — không state mutation. Test được riêng.
 *
 * 4 tiêu chí chấm (AI score):
 *  - Quan trọng & Tu luyện: 0-55
 *  - Rủi ro: 0-15
 *  - Sáng tạo: 0-10
 *  - Phù hợp (RP fidelity): 0-15
 *
 * Total = sum ∈ [0, 100].
 *
 * EP → EXP conversion (port từ reference):
 *   expBasic       = ep * 2
 *   expGrowth      = (ep / 3) * playerLevel
 *   expBreakthrough = maxExpForLevel * (ep/100)² * 0.5
 *   totalExp = floor(expBasic + expGrowth + expBreakthrough)
 *
 * Anti-farm: cùng `reason` lặp lại trong 10 hành động gần nhất → multiplier
 *   0 lần lặp:  1.0
 *   1 lần lặp:  0.7
 *   2 lần lặp:  0.4
 *   3+ lần lặp: 0.1
 *
 * MIN_EP_FOR_EXP_GAIN = 20 (dưới threshold không đổi thành EXP, vẫn cộng vào pool EP).
 */

export const MIN_EP_FOR_EXP_GAIN = 20;
export const FARM_DECAY_TABLE: Record<number, number> = {
  0: 1.0,
  1: 0.7,
  2: 0.4,
  3: 0.1,
};

/** Trả multiplier theo số lần lặp reason (clamp ≥ 3 → 0.1) */
export const getFarmMultiplier = (repetitionCount: number): number => {
  if (repetitionCount <= 0) return 1.0;
  if (repetitionCount === 1) return 0.7;
  if (repetitionCount === 2) return 0.4;
  return 0.1;
};

/** Đếm số lần `reason` xuất hiện trong recentActions (10 entries gần nhất) */
export const countReasonRepetitions = (
  recentReasons: string[],
  reason: string,
): number => {
  const norm = reason.trim().toLowerCase();
  return recentReasons.filter((r) => r.trim().toLowerCase() === norm).length;
};

/** Convert EP → EXP (theo công thức reference) */
export const convertEpToExp = (
  ep: number,
  playerLevel: number,
  maxExpForLevel: number,
): number => {
  if (ep < MIN_EP_FOR_EXP_GAIN) return 0;
  const basic = ep * 2;
  const growth = (ep / 3) * playerLevel;
  const breakthroughRatio = Math.pow(ep / 100, 2) * 0.5;
  const breakthrough = maxExpForLevel * breakthroughRatio;
  return Math.floor(basic + growth + breakthrough);
};

/**
 * Final EP → EXP với anti-farm applied.
 * Returns: { rawEp, finalEp, multiplier, expGain }
 */
export interface EpResult {
  rawEp: number;
  finalEp: number;
  multiplier: number;
  expGain: number;
  reason: string;
  isFarmed: boolean;
}

export const calculateEpReward = (
  rawEp: number,
  reason: string,
  recentReasons: string[],
  playerLevel: number,
  maxExpForLevel: number,
): EpResult => {
  const reps = countReasonRepetitions(recentReasons, reason);
  const multiplier = getFarmMultiplier(reps);
  const finalEp = Math.floor(rawEp * multiplier);
  const expGain = convertEpToExp(finalEp, playerLevel, maxExpForLevel);
  return {
    rawEp,
    finalEp,
    multiplier,
    expGain,
    reason,
    isFarmed: multiplier < 1.0,
  };
};

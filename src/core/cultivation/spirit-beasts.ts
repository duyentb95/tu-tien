import type { BeastTemplate, SpiritBeast } from '@gametypes/spirit-beast';
import type { Rarity } from '@gametypes/item';

/**
 * Spirit Beast logic — pure functions.
 *
 * Lifecycle:
 *   1. Combat: enemy HP < 20% → có thể attempt capture
 *   2. rollCapture(template, playerLevel, rng) → SpiritBeast | null
 *   3. addBeast(beast) vào store
 *   4. setActive(beastId) — chọn 1 đi theo combat
 *   5. Trong combat, beast nhận turn riêng, dùng atk × beast stat
 *   6. Win/Loss combat → beast +EXP. EXP đủ → levelUp
 *   7. Reach minLevel của next stage + có evolution cost → evolveBeast
 */

/** Capture chance final = base × rarityMod × levelMod */
const RARITY_CAPTURE_MOD: Record<Rarity, number> = {
  'Thường': 1.0,
  'Tốt': 0.85,
  'Hiếm': 0.7,
  'Cực Phẩm': 0.5,
  'Siêu Phẩm': 0.3,
  'Huyền Thoại': 0.15,
};

export interface CaptureContext {
  template: BeastTemplate;
  playerLevel: number;
  enemyHpPercent: number;     // 0-100, càng thấp → càng dễ
  rng?: () => number;
}

export interface CaptureResult {
  success: boolean;
  finalChance: number;        // % để hiển thị UI
  /** Nếu success thì có beast mới */
  beast?: SpiritBeast;
}

export const rollCapture = (ctx: CaptureContext): CaptureResult => {
  const rng = ctx.rng ?? Math.random;
  const tmpl = ctx.template;
  const req = tmpl.captureRequirement;
  if (!req) {
    return { success: false, finalChance: 0 };
  }

  // Player level check
  if (req.playerLevelMin && ctx.playerLevel < req.playerLevelMin) {
    return { success: false, finalChance: 0 };
  }

  // HP càng thấp → bonus
  const hpMod = ctx.enemyHpPercent <= 5 ? 1.5 : ctx.enemyHpPercent <= 10 ? 1.2 : ctx.enemyHpPercent <= 20 ? 1.0 : 0;
  if (hpMod === 0) return { success: false, finalChance: 0 };

  const rarityMod = RARITY_CAPTURE_MOD[tmpl.rarity] ?? 1.0;
  const finalChance = Math.min(95, req.baseCaptureChance * rarityMod * hpMod);

  if (rng() * 100 < finalChance) {
    return {
      success: true,
      finalChance,
      beast: createBeastInstance(tmpl, 1),
    };
  }
  return { success: false, finalChance };
};

/** Tạo instance mới từ template */
export const createBeastInstance = (tmpl: BeastTemplate, level: number = 1): SpiritBeast => {
  const stage = tmpl.stages[0]!;
  const stats = scaleStats(tmpl.baseStats, level, stage.statMultiplier);
  return {
    id: crypto.randomUUID(),
    templateId: tmpl.id,
    name: stage.name,
    level,
    exp: 0,
    stageIdx: 0,
    hp: stats.hp,
    maxhp: stats.hp,
    loyalty: 50,
    capturedAtTurn: 0, // set khi add vào store
    isActive: false,
  };
};

export const scaleStats = (
  base: BeastTemplate['baseStats'],
  level: number,
  stageMult: number,
): BeastTemplate['baseStats'] => {
  const levelMult = 1 + (level - 1) * 0.1; // +10% mỗi level
  return {
    hp: Math.round(base.hp * stageMult * levelMult),
    atk: Math.round(base.atk * stageMult * levelMult),
    def: Math.round(base.def * stageMult * levelMult),
    spd: Math.round(base.spd * stageMult * levelMult),
  };
};

/** EXP cần để lên next level */
export const beastMaxExp = (level: number): number => Math.floor(50 * Math.pow(1.15, level - 1));

/** Apply EXP gain → return updated beast */
export const applyBeastExp = (beast: SpiritBeast, tmpl: BeastTemplate, expGain: number): SpiritBeast => {
  let lvl = beast.level;
  let exp = beast.exp + expGain;
  let maxExp = beastMaxExp(lvl);
  while (exp >= maxExp) {
    exp -= maxExp;
    lvl += 1;
    maxExp = beastMaxExp(lvl);
  }
  const stage = tmpl.stages[beast.stageIdx]!;
  const newStats = scaleStats(tmpl.baseStats, lvl, stage.statMultiplier);
  return {
    ...beast,
    level: lvl,
    exp,
    maxhp: newStats.hp,
    // Heal proportional khi level up
    hp: beast.maxhp > 0 ? Math.round((beast.hp / beast.maxhp) * newStats.hp) : newStats.hp,
  };
};

/** Check có thể evolve không */
export const canEvolve = (
  beast: SpiritBeast,
  tmpl: BeastTemplate,
  playerCurrency: number,
  inventoryItemNames: string[],
): { can: boolean; reason?: string; nextStage?: number } => {
  const nextIdx = beast.stageIdx + 1;
  if (nextIdx >= tmpl.stages.length) return { can: false, reason: 'Đã đạt stage tối đa' };
  const next = tmpl.stages[nextIdx]!;
  if (beast.level < next.minLevel) return { can: false, reason: `Cần cấp ${next.minLevel}`, nextStage: nextIdx };
  if (next.evolutionCost?.currency && playerCurrency < next.evolutionCost.currency) {
    return { can: false, reason: `Thiếu ${next.evolutionCost.currency} linh thạch`, nextStage: nextIdx };
  }
  if (next.evolutionCost?.itemName && !inventoryItemNames.includes(next.evolutionCost.itemName)) {
    return { can: false, reason: `Cần ${next.evolutionCost.itemName}`, nextStage: nextIdx };
  }
  return { can: true, nextStage: nextIdx };
};

/** Apply evolution → return updated beast + cost info */
export const evolveBeast = (beast: SpiritBeast, tmpl: BeastTemplate): SpiritBeast => {
  const nextIdx = beast.stageIdx + 1;
  const next = tmpl.stages[nextIdx]!;
  const newStats = scaleStats(tmpl.baseStats, beast.level, next.statMultiplier);
  return {
    ...beast,
    stageIdx: nextIdx,
    name: next.name,
    maxhp: newStats.hp,
    hp: newStats.hp, // full heal khi evolve
  };
};

/** Feed item để tăng loyalty hoặc heal */
export const feedBeast = (beast: SpiritBeast, kind: 'food' | 'pill'): SpiritBeast => {
  if (kind === 'pill') {
    return { ...beast, hp: beast.maxhp, dead: false };
  }
  return { ...beast, loyalty: Math.min(100, beast.loyalty + 5) };
};

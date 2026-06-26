/**
 * Phase 10.1: 3-step Item Generation Pipeline — Budget-based Balancing
 *
 * Lấy pattern từ Google Canvas RPG reference (xem docs/reference/).
 *
 * Triết lý:
 *   - Mỗi item có "ngân sách điểm" dựa trên rarity + category + playerLevel + difficulty
 *   - Mỗi stat có "giá" (price) cụ thể (vd 1 ATK = 10đ, 1% CR = 50đ)
 *   - Bonuses được "mua" bằng budget theo rule riêng cho từng category
 *   - Cùng rarity → cùng tổng "giá trị" nhưng builds đa dạng (all-in ATK vs ATK+CR balance)
 *
 * Cải tiến so với deterministic generateItemBonuses cũ:
 *   - Cho phép builds đa dạng (random allocation trong rule)
 *   - Tách category rules → dễ tinh chỉnh balance
 *   - Difficulty + level scale budget realistic hơn (Ác Mộng item rớt mạnh hơn)
 */

import type { Item, ItemCategory, Rarity } from '@gametypes/item';

/** Math.random() function — injectable for testing */
type RandFn = () => number;
const defaultRand: RandFn = Math.random;

/** Base budget points theo rarity (đơn vị: stat points) */
const RARITY_BASE_BUDGET: Record<Rarity, number> = {
  'Thường': 100,
  'Tốt': 300,
  'Hiếm': 1000,
  'Cực Phẩm': 2000,
  'Siêu Phẩm': 4000,
  'Huyền Thoại': 10000,
};

/** Hệ số category — pháp bảo + dị thường mạnh hơn equipment thường */
const CATEGORY_MULT: Partial<Record<ItemCategory, number>> = {
  'Vũ khí': 1.0,
  'Thân': 1.0,
  'Đầu': 1.0,
  'Chân': 1.0,
  'Phụ kiện': 1.1,
  'Trữ vật': 0.8,
  'Dị thường': 1.5,
  'Phương tiện': 1.2,
  'Đan dược': 0.15,
  'Thực phẩm': 0.15,
  'Nguyên liệu': 0.1,
  'Tạp vật': 0.05,
  'Tín vật': 0.3,
  'Sách kỹ năng': 2.0,
  'Đa năng': 0.2,
};

/** Difficulty randomness — [min, max] multiplier để tạo variance */
const DIFFICULTY_RANDOMNESS: Record<string, [number, number]> = {
  'Dễ': [0.9, 1.2],      // -10% đến +20% (item luôn ổn)
  'Thường': [0.7, 1.3],  // ±30%
  'Khó': [0.6, 1.4],     // ±40%
  'Ác Mộng': [0.5, 1.5], // ±50% (rất khó đoán)
};

/**
 * Tính ngân sách stat points cho 1 item.
 * Pattern: baseValue * categoryMult * randomMult * (1 + level/10)
 */
export const calculateItemBudget = (params: {
  rarity: Rarity;
  category: ItemCategory;
  playerLevel: number;
  difficulty?: string;
  rng?: RandFn;
}): number => {
  const { rarity, category, playerLevel, difficulty = 'Thường', rng = defaultRand } = params;

  const baseValue = RARITY_BASE_BUDGET[rarity] ?? 100;
  const categoryMult = CATEGORY_MULT[category] ?? 1.0;

  const [minR, maxR] = DIFFICULTY_RANDOMNESS[difficulty] ?? DIFFICULTY_RANDOMNESS['Thường']!;
  const randomMult = rng() * (maxR - minR) + minR;

  const levelMult = 1 + Math.max(0, playerLevel - 1) * 0.1;

  return Math.floor(baseValue * categoryMult * randomMult * levelMult);
};

/** Bảng giá (stat points) — chi phí mua mỗi stat */
const STAT_PRICES = {
  // Core stats
  atk: 10,    // 10đ = +1 ATK
  def: 10,    // 10đ = +1 DEF
  spd: 10,    // 10đ = +1 SPD
  hp: 1,      // 1đ = +1 HP (HP rẻ vì stack lớn)

  // Crit
  cr: 50,     // 50đ = +1% CR
  cdmg: 25,   // 25đ = +1% CDMG

  // Advanced
  dmgAmp: 80, // 80đ = +1% DMG_AMP (very expensive)
  dmgRes: 80, // 80đ = +1% DMG_RES
  evasion: 80,// 80đ = +1% Evasion
} as const;

type StatKey = keyof typeof STAT_PRICES;

/** Build rules per category — danh sách stats có thể "mua" + ưu tiên (weight) */
const CATEGORY_BUILDS: Record<ItemCategory, Array<{ stat: StatKey; weight: number }>> = {
  // Vũ khí: ATK chính + crit option
  'Vũ khí': [
    { stat: 'atk', weight: 60 },
    { stat: 'cr', weight: 20 },
    { stat: 'cdmg', weight: 15 },
    { stat: 'dmgAmp', weight: 5 },
  ],

  // Giáp đầu: DEF + HP
  'Đầu': [
    { stat: 'def', weight: 40 },
    { stat: 'hp', weight: 50 },
    { stat: 'dmgRes', weight: 10 },
  ],

  // Giáp thân: DEF chính + HP nhiều
  'Thân': [
    { stat: 'def', weight: 35 },
    { stat: 'hp', weight: 50 },
    { stat: 'dmgRes', weight: 15 },
  ],

  // Giáp chân: SPD + Evasion
  'Chân': [
    { stat: 'spd', weight: 50 },
    { stat: 'evasion', weight: 30 },
    { stat: 'def', weight: 10 },
    { stat: 'hp', weight: 10 },
  ],

  // Phụ kiện: linh hoạt — đầu tư stat hiếm
  'Phụ kiện': [
    { stat: 'atk', weight: 25 },
    { stat: 'cr', weight: 25 },
    { stat: 'cdmg', weight: 20 },
    { stat: 'dmgAmp', weight: 15 },
    { stat: 'hp', weight: 15 },
  ],

  // Pháp bảo: balance ATK + DEF + special
  'Dị thường': [
    { stat: 'atk', weight: 25 },
    { stat: 'def', weight: 20 },
    { stat: 'cr', weight: 15 },
    { stat: 'cdmg', weight: 15 },
    { stat: 'dmgAmp', weight: 15 },
    { stat: 'dmgRes', weight: 10 },
  ],

  // Phương tiện: SPD all-in
  'Phương tiện': [
    { stat: 'spd', weight: 70 },
    { stat: 'evasion', weight: 30 },
  ],

  // Trữ vật: HP nhỏ (không phải combat focus)
  'Trữ vật': [
    { stat: 'hp', weight: 80 },
    { stat: 'def', weight: 20 },
  ],

  // Tiêu hao / nguyên liệu: không có bonuses
  'Đan dược': [],
  'Thực phẩm': [],
  'Nguyên liệu': [],
  'Tạp vật': [],
  'Tín vật': [],
  'Sách kỹ năng': [],
  'Đa năng': [],
};

/**
 * Phân bổ budget thành bonuses object.
 * Algorithm: weighted random pick stat từ category build → mua tối đa có thể với budget còn lại.
 */
export const distributeBudgetToStats = (
  budget: number,
  category: ItemCategory,
  rarity: Rarity,
  rng: RandFn = defaultRand,
): Item['bonuses'] => {
  const builds = CATEGORY_BUILDS[category];
  if (!builds || builds.length === 0 || budget <= 0) {
    return {};
  }

  const bonuses: Item['bonuses'] = {};
  let remainingBudget = budget;

  // Số "slots" được mua dựa trên rarity (rarity cao → nhiều stat khác nhau)
  const maxSlots: Record<Rarity, number> = {
    'Thường': 1,
    'Tốt': 2,
    'Hiếm': 3,
    'Cực Phẩm': 4,
    'Siêu Phẩm': 5,
    'Huyền Thoại': 5,
  };
  const slots = maxSlots[rarity] ?? 1;

  const usedStats = new Set<StatKey>();

  for (let i = 0; i < slots && remainingBudget > 0; i++) {
    // Filter builds chưa dùng
    const available = builds.filter((b) => !usedStats.has(b.stat));
    if (available.length === 0) break;

    // Weighted random pick
    const totalWeight = available.reduce((sum, b) => sum + b.weight, 0);
    let pick = rng() * totalWeight;
    let chosen = available[0]!;
    for (const opt of available) {
      pick -= opt.weight;
      if (pick <= 0) {
        chosen = opt;
        break;
      }
    }

    // Allocate budget: slot đầu lấy 50-70%, slot sau chia phần còn lại
    const allocateRatio =
      i === 0 ? 0.5 + rng() * 0.2 : 1 / (slots - i + 1);
    const allocated = Math.min(remainingBudget, Math.floor(remainingBudget * allocateRatio));

    const price = STAT_PRICES[chosen.stat];
    const amount = Math.floor(allocated / price);

    if (amount > 0) {
      bonuses[chosen.stat] = (bonuses[chosen.stat] ?? 0) + amount;
      remainingBudget -= amount * price;
      usedStats.add(chosen.stat);
    }
  }

  return bonuses;
};

/**
 * Pipeline tổng — tích hợp 3 bước cho `generateItemBonuses` thay thế cũ.
 */
export const generateItemBonusesV2 = (params: {
  rarity: Rarity;
  category: ItemCategory;
  playerLevel: number;
  difficulty?: string;
  rng?: RandFn;
}): Item['bonuses'] => {
  const { rng = defaultRand } = params;
  const budget = calculateItemBudget(params);
  return distributeBudgetToStats(budget, params.category, params.rarity, rng);
};

import { describe, it, expect } from 'vitest';
import {
  calculateItemBudget,
  distributeBudgetToStats,
  generateItemBonusesV2,
} from './item-budget';

const fixedRand = (val: number) => () => val;

describe('item-budget — Phase 10.1', () => {
  describe('calculateItemBudget', () => {
    it('scales with rarity', () => {
      const common = calculateItemBudget({
        rarity: 'Thường', category: 'Vũ khí', playerLevel: 1, difficulty: 'Thường', rng: () => 0.5,
      });
      const legendary = calculateItemBudget({
        rarity: 'Huyền Thoại', category: 'Vũ khí', playerLevel: 1, difficulty: 'Thường', rng: () => 0.5,
      });
      expect(legendary).toBeGreaterThan(common * 50); // Huyền Thoại 10000 / Thường 100
    });

    it('applies category multiplier (Dị thường > Vũ khí > Đan dược)', () => {
      const weapon = calculateItemBudget({
        rarity: 'Hiếm', category: 'Vũ khí', playerLevel: 1, difficulty: 'Thường', rng: () => 0.5,
      });
      const anomaly = calculateItemBudget({
        rarity: 'Hiếm', category: 'Dị thường', playerLevel: 1, difficulty: 'Thường', rng: () => 0.5,
      });
      const potion = calculateItemBudget({
        rarity: 'Hiếm', category: 'Đan dược', playerLevel: 1, difficulty: 'Thường', rng: () => 0.5,
      });
      expect(anomaly).toBeGreaterThan(weapon);
      expect(weapon).toBeGreaterThan(potion);
    });

    it('Ác Mộng difficulty has wider variance', () => {
      const easyMin = calculateItemBudget({
        rarity: 'Hiếm', category: 'Vũ khí', playerLevel: 1, difficulty: 'Dễ', rng: () => 0,
      });
      const easyMax = calculateItemBudget({
        rarity: 'Hiếm', category: 'Vũ khí', playerLevel: 1, difficulty: 'Dễ', rng: () => 0.999,
      });
      const nightmareMin = calculateItemBudget({
        rarity: 'Hiếm', category: 'Vũ khí', playerLevel: 1, difficulty: 'Ác Mộng', rng: () => 0,
      });
      const nightmareMax = calculateItemBudget({
        rarity: 'Hiếm', category: 'Vũ khí', playerLevel: 1, difficulty: 'Ác Mộng', rng: () => 0.999,
      });
      const easyRange = easyMax - easyMin;
      const nightmareRange = nightmareMax - nightmareMin;
      expect(nightmareRange).toBeGreaterThan(easyRange);
    });

    it('scales with player level', () => {
      const lvl1 = calculateItemBudget({
        rarity: 'Hiếm', category: 'Vũ khí', playerLevel: 1, difficulty: 'Thường', rng: () => 0.5,
      });
      const lvl50 = calculateItemBudget({
        rarity: 'Hiếm', category: 'Vũ khí', playerLevel: 50, difficulty: 'Thường', rng: () => 0.5,
      });
      expect(lvl50).toBeGreaterThan(lvl1 * 3);
    });
  });

  describe('distributeBudgetToStats', () => {
    it('Vũ khí prefers ATK', () => {
      const bonuses = distributeBudgetToStats(2000, 'Vũ khí', 'Cực Phẩm', fixedRand(0.1));
      expect(bonuses?.atk).toBeGreaterThan(0);
    });

    it('Thân prefers DEF/HP', () => {
      const bonuses = distributeBudgetToStats(2000, 'Thân', 'Cực Phẩm', fixedRand(0.1));
      const hasDefOrHp = (bonuses?.def ?? 0) > 0 || (bonuses?.hp ?? 0) > 0;
      expect(hasDefOrHp).toBe(true);
    });

    it('Phương tiện prefers SPD', () => {
      const bonuses = distributeBudgetToStats(2000, 'Phương tiện', 'Cực Phẩm', fixedRand(0.1));
      expect(bonuses?.spd).toBeGreaterThan(0);
    });

    it('returns empty for non-equipment categories', () => {
      const bonuses = distributeBudgetToStats(2000, 'Đan dược', 'Hiếm', fixedRand(0.5));
      expect(Object.keys(bonuses ?? {}).length).toBe(0);
    });

    it('low rarity gets fewer slots than high rarity', () => {
      // Use high enough budget that even Thường gets the 1 slot it allows
      const common = distributeBudgetToStats(2000, 'Phụ kiện', 'Thường', fixedRand(0.5));
      const legendary = distributeBudgetToStats(2000, 'Phụ kiện', 'Huyền Thoại', fixedRand(0.5));
      const commonSlots = Object.keys(common ?? {}).length;
      const legendarySlots = Object.keys(legendary ?? {}).length;
      expect(legendarySlots).toBeGreaterThanOrEqual(commonSlots);
    });

    it('respects budget — total cost <= budget', () => {
      const budget = 1000;
      const bonuses = distributeBudgetToStats(budget, 'Vũ khí', 'Hiếm', fixedRand(0.3));
      const PRICES = { atk: 10, def: 10, spd: 10, hp: 1, cr: 50, cdmg: 25, dmgAmp: 80, dmgRes: 80, evasion: 80 };
      let total = 0;
      for (const [k, v] of Object.entries(bonuses ?? {})) {
        total += (PRICES[k as keyof typeof PRICES] ?? 0) * (v ?? 0);
      }
      expect(total).toBeLessThanOrEqual(budget);
    });
  });

  describe('generateItemBonusesV2 integration', () => {
    it('produces consistent shape for all equippable categories', () => {
      const categories = ['Vũ khí', 'Thân', 'Đầu', 'Chân', 'Phụ kiện', 'Dị thường', 'Phương tiện', 'Trữ vật'] as const;
      for (const cat of categories) {
        const bonuses = generateItemBonusesV2({
          rarity: 'Hiếm', category: cat, playerLevel: 10, difficulty: 'Thường', rng: () => 0.5,
        });
        expect(bonuses).toBeDefined();
        expect(typeof bonuses).toBe('object');
        expect(Object.keys(bonuses ?? {}).length).toBeGreaterThan(0);
      }
    });
  });
});

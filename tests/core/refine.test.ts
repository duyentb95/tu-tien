import { describe, it, expect } from 'vitest';
import {
  getRefineCost,
  getRefineSuccessRate,
  getRefineMultiplier,
  applyRefineToBonuses,
  rollRefine,
  formatRefineLabel,
  MAX_REFINE_LEVEL,
} from '../../src/core/items/refine';

describe('refine cost + rate', () => {
  it('cost tăng 2x mỗi level', () => {
    expect(getRefineCost(0).linhThach).toBe(50);
    expect(getRefineCost(1).linhThach).toBe(100);
    expect(getRefineCost(5).linhThach).toBe(1600);
    expect(getRefineCost(11).linhThach).toBe(102400);
  });

  it('lv 6+ thêm tiền ngọc', () => {
    expect(getRefineCost(5).tienNgoc).toBeUndefined();
    expect(getRefineCost(6).tienNgoc).toBe(10);
    expect(getRefineCost(11).tienNgoc).toBe(60);
  });

  it('success rate giảm theo level', () => {
    expect(getRefineSuccessRate(0)).toBe(0.95);
    expect(getRefineSuccessRate(3)).toBe(0.80);
    expect(getRefineSuccessRate(6)).toBe(0.60);
    expect(getRefineSuccessRate(11)).toBe(0.40);
  });
});

describe('refine multiplier + bonus apply', () => {
  it('lv 0 = 1x, lv 12 = 1.6x', () => {
    expect(getRefineMultiplier(0)).toBe(1);
    expect(getRefineMultiplier(5)).toBeCloseTo(1.25);
    expect(getRefineMultiplier(12)).toBeCloseTo(1.6);
  });

  it('apply lên bonuses round integer', () => {
    const out = applyRefineToBonuses({ atk: 100, hp: 50 }, 5);
    expect(out.atk).toBe(125);
    expect(out.hp).toBe(63);  // 50 * 1.25 = 62.5 → round 63
  });
});

describe('rollRefine', () => {
  it('rng < successRate → thành công +1 level', () => {
    const r = rollRefine(0, () => 0.5);  // 0.5 < 0.95
    expect(r.success).toBe(true);
    expect(r.newLevel).toBe(1);
  });

  it('rng > successRate → fail giữ nguyên (low tier không downgrade)', () => {
    const r = rollRefine(2, () => 0.99);  // 0.99 > 0.95
    expect(r.success).toBe(false);
    expect(r.newLevel).toBe(2);
    expect(r.downgraded).toBeUndefined();
  });

  it('lv 10 fail + rng2 < 0.3 → downgrade -1', () => {
    // First call: fail (0.99 > 0.4). Second call: < 0.3 → downgrade
    let i = 0;
    const rng = () => (i++ === 0 ? 0.99 : 0.1);
    const r = rollRefine(10, rng);
    expect(r.success).toBe(false);
    expect(r.newLevel).toBe(9);
    expect(r.downgraded).toBe(true);
  });

  it('lv max (12) → no roll, just return current', () => {
    const r = rollRefine(MAX_REFINE_LEVEL, () => 0.01);
    expect(r.newLevel).toBe(MAX_REFINE_LEVEL);
    expect(r.success).toBe(false);
  });
});

describe('formatRefineLabel', () => {
  it('chưa rèn → empty', () => {
    expect(formatRefineLabel(undefined)).toBe('');
    expect(formatRefineLabel(0)).toBe('');
  });
  it('+N format', () => {
    expect(formatRefineLabel(5)).toBe(' +5');
    expect(formatRefineLabel(12)).toBe(' +12');
  });
});

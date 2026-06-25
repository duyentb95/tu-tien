import { describe, it, expect } from 'vitest';
import { applyExpGain, calculateMaxExpForLevel, calculateTotalAP } from './leveling';

describe('calculateMaxExpForLevel', () => {
  it('Cấp 1 = 100 base', () => {
    expect(calculateMaxExpForLevel(1)).toBe(100);
  });

  it('Cấp 10 có breakthrough multiplier ×3', () => {
    const cap9 = calculateMaxExpForLevel(9);
    const cap10 = calculateMaxExpForLevel(10);
    // Cấp 10 ít nhất phải gấp 2× cấp 9 (do ×3 breakthrough tax)
    expect(cap10).toBeGreaterThan(cap9 * 2);
  });

  it('Cấp tăng → exp tăng monotonic (trừ tax 10)', () => {
    for (let i = 1; i < 9; i++) {
      expect(calculateMaxExpForLevel(i + 1)).toBeGreaterThan(calculateMaxExpForLevel(i));
    }
  });
});

describe('calculateTotalAP', () => {
  it('Cấp 1 = 5 AP khởi đầu', () => {
    expect(calculateTotalAP(1)).toBe(5);
  });

  it('Cấp 11 = 5 + 10*5 = 55', () => {
    expect(calculateTotalAP(11)).toBe(55);
  });
});

describe('applyExpGain', () => {
  it('Exp ít → không lên cấp', () => {
    const r = applyExpGain(1, 0, 50);
    expect(r.newLevel).toBe(1);
    expect(r.newExp).toBe(50);
    expect(r.levelsGained).toBe(0);
  });

  it('Exp đủ → lên 1 cấp', () => {
    const r = applyExpGain(1, 0, 100);
    expect(r.newLevel).toBe(2);
    expect(r.levelsGained).toBe(1);
    expect(r.apEarned).toBe(5);
  });

  it('Exp burst → lên nhiều cấp', () => {
    const r = applyExpGain(1, 0, 100_000);
    expect(r.newLevel).toBeGreaterThan(5);
    expect(r.levelsGained).toBe(r.newLevel - 1);
  });

  it('Cross realm boundary từ cấp 10 → 11', () => {
    const expFor10 = calculateMaxExpForLevel(10);
    const r = applyExpGain(10, 0, expFor10);
    expect(r.newLevel).toBe(11);
    expect(r.crossedRealmBoundary).toBe(true);
  });

  it('Không cross boundary trong cùng cảnh giới', () => {
    const r = applyExpGain(2, 0, calculateMaxExpForLevel(2));
    expect(r.newLevel).toBe(3);
    expect(r.crossedRealmBoundary).toBe(false);
  });
});

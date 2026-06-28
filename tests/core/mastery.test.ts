import { describe, it, expect } from 'vitest';
import {
  addMasteryXp,
  getXpToNextLevel,
  getMasteryDamageMultiplier,
  formatMasteryLabel,
  createMasteryEntry,
  MAX_MASTERY_LEVEL,
} from '../../src/core/skills/mastery';

describe('XP to next level table', () => {
  it('lv 1 → 100', () => expect(getXpToNextLevel(1)).toBe(100));
  it('lv 2 → 250', () => expect(getXpToNextLevel(2)).toBe(250));
  it('lv 8 → 16000', () => expect(getXpToNextLevel(8)).toBe(16000));
  it('lv 9 (max) → Infinity', () => expect(getXpToNextLevel(9)).toBe(Infinity));
});

describe('damage multiplier', () => {
  it('lv 1 = 1.0x baseline', () => expect(getMasteryDamageMultiplier(1)).toBe(1));
  it('lv 5 = 1.2x', () => expect(getMasteryDamageMultiplier(5)).toBeCloseTo(1.2));
  it('lv 9 = 1.4x max', () => expect(getMasteryDamageMultiplier(9)).toBeCloseTo(1.4));
});

describe('addMasteryXp', () => {
  it('lần đầu cast → tạo entry lv 1, xp 5, totalUses 1', () => {
    const r = addMasteryXp({}, 'sk1', 5);
    expect(r.state.sk1).toEqual({ level: 1, xp: 5, totalUses: 1 });
    expect(r.leveledUp).toBe(false);
    expect(r.newLevel).toBe(1);
  });

  it('xp đủ 100 → level up lên 2, xp reset', () => {
    const r = addMasteryXp({ sk1: { level: 1, xp: 95, totalUses: 9 } }, 'sk1', 10);
    expect(r.state.sk1!.level).toBe(2);
    expect(r.state.sk1!.xp).toBe(5);  // 95+10 - 100 = 5
    expect(r.leveledUp).toBe(true);
  });

  it('xp lớn → cascade nhiều level lên cùng lúc', () => {
    // lv 1, 0 xp, +500 xp → lv 2 (cần 100), còn 400 → lv 3 (cần 250), còn 150
    const r = addMasteryXp({}, 'sk1', 500);
    expect(r.state.sk1!.level).toBe(3);
    expect(r.state.sk1!.xp).toBe(150);
    expect(r.leveledUp).toBe(true);
  });

  it('cap tại MAX (lv 9), xp = 0', () => {
    const r = addMasteryXp({ sk1: { level: 8, xp: 15999, totalUses: 100 } }, 'sk1', 100);
    expect(r.state.sk1!.level).toBe(MAX_MASTERY_LEVEL);
    expect(r.state.sk1!.xp).toBe(0);
    expect(r.leveledUp).toBe(true);
  });
});

describe('formatMasteryLabel', () => {
  it('chưa luyện → text default', () => {
    expect(formatMasteryLabel(undefined)).toBe('Chưa luyện');
  });
  it('lv 1 → Sơ Khởi · 50/100', () => {
    expect(formatMasteryLabel({ level: 1, xp: 50, totalUses: 5 })).toBe('Sơ Khởi · 50/100');
  });
  it('lv max → ★ Đại Thành', () => {
    expect(formatMasteryLabel({ level: MAX_MASTERY_LEVEL, xp: 0, totalUses: 999 })).toBe('★ Đại Thành');
  });
});

describe('createMasteryEntry', () => {
  it('default lv 1 / 0 xp / 0 uses', () => {
    expect(createMasteryEntry()).toEqual({ level: 1, xp: 0, totalUses: 0 });
  });
});

import { describe, it, expect } from 'vitest';
import { calculateDamage } from './damage';

const baseStats = (overrides: Partial<{ atk: number; def: number; cr: number; cdmg: number; evasion: number; dmgAmp: number; dmgRes: number }> = {}) => ({
  hp: 200, maxhp: 200, atk: 100, def: 50, spd: 30,
  cr: 0, cdmg: 150, dmgAmp: 0, dmgRes: 0, evasion: 0,
  ...overrides,
});

describe('calculateDamage', () => {
  it('damage cơ bản: atk × skill - def × .4', () => {
    const r = calculateDamage({
      attacker: baseStats({ atk: 100 }),
      attackerLevel: 5,
      defender: baseStats({ def: 50 }),
      defenderLevel: 5,
      skillMultiplier: 1,
      rng: () => 0.5,
    });
    // 100 - 20 = 80
    expect(r.damage).toBe(80);
    expect(r.crit).toBe(false);
    expect(r.dodged).toBe(false);
  });

  it('true damage bỏ qua def', () => {
    const r = calculateDamage({
      attacker: baseStats({ atk: 100 }),
      attackerLevel: 5,
      defender: baseStats({ def: 500 }),
      defenderLevel: 5,
      skillMultiplier: 1,
      trueDamage: true,
      rng: () => 0.5,
    });
    expect(r.damage).toBe(100);
  });

  it('crit nhân theo cdmg', () => {
    const r = calculateDamage({
      attacker: baseStats({ atk: 100, cdmg: 200 }),
      attackerLevel: 5,
      defender: baseStats({ def: 0 }),
      defenderLevel: 5,
      skillMultiplier: 1,
      forcedCrit: true,
      rng: () => 0.5,
    });
    expect(r.damage).toBe(200);
    expect(r.crit).toBe(true);
  });

  it('dodge: damage 0', () => {
    const r = calculateDamage({
      attacker: baseStats(),
      attackerLevel: 5,
      defender: baseStats({ evasion: 50 }),
      defenderLevel: 5,
      skillMultiplier: 1,
      rng: () => 0.1, // < 50
    });
    expect(r.damage).toBe(0);
    expect(r.dodged).toBe(true);
  });

  it('realm gap penalty: đánh cảnh giới cao hơn → ×0.15', () => {
    const r = calculateDamage({
      attacker: baseStats({ atk: 100 }),
      attackerLevel: 5,   // Luyện Khí
      defender: baseStats({ def: 0 }),
      defenderLevel: 15,  // Trúc Cơ
      skillMultiplier: 1,
      rng: () => 0.5,
    });
    expect(r.damage).toBeLessThan(20);
  });

  it('đè cảnh giới: damage ×1.6', () => {
    const r = calculateDamage({
      attacker: baseStats({ atk: 100 }),
      attackerLevel: 15,
      defender: baseStats({ def: 0 }),
      defenderLevel: 5,
      skillMultiplier: 1,
      rng: () => 0.5,
    });
    expect(r.damage).toBeGreaterThan(150);
  });

  it('dmgAmp + dmgRes tương tác đúng', () => {
    const r = calculateDamage({
      attacker: baseStats({ atk: 100, dmgAmp: 50 }),
      attackerLevel: 5,
      defender: baseStats({ def: 0, dmgRes: 25 }),
      defenderLevel: 5,
      skillMultiplier: 1,
      rng: () => 0.5,
    });
    // 100 × 1.5 × 0.75 = 112.5
    expect(r.damage).toBe(113);
  });
});

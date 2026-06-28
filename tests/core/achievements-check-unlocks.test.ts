import { describe, it, expect } from 'vitest';
import {
  computeAchievementProgress,
  detectNewlyUnlocked,
  isAchievementUnlocked,
} from '../../src/core/achievements/check-unlocks';
import { ACHIEVEMENTS } from '../../src/data/achievements';

const baseInputs = {
  playerLevel: 1,
  playerCurrency: 0,
  turn: 1,
  realmBreaks: 0,
  tribulations: 0,
  beastCount: 0,
  questCompleted: 0,
  daoLuPartnered: 0,
  sectJoined: false,
  locationVisited: 0,
};

describe('computeAchievementProgress', () => {
  it('all-zero baseline returns all-zero progress', () => {
    const p = computeAchievementProgress(baseInputs);
    expect(p.realm_count).toBe(1);
    expect(p.first_realm_break).toBe(0);
    expect(p.sect_joined).toBe(0);
  });

  it('sect_joined=true → progress 1', () => {
    const p = computeAchievementProgress({ ...baseInputs, sectJoined: true });
    expect(p.sect_joined).toBe(1);
  });
});

describe('isAchievementUnlocked', () => {
  it('first_break unlocks when realmBreaks ≥ 1', () => {
    const first = ACHIEVEMENTS.find((a) => a.id === 'first_break')!;
    const p0 = computeAchievementProgress(baseInputs);
    const p1 = computeAchievementProgress({ ...baseInputs, realmBreaks: 1 });
    expect(isAchievementUnlocked(first, p0)).toBe(false);
    expect(isAchievementUnlocked(first, p1)).toBe(true);
  });

  it('realm_10 needs playerLevel ≥ 10', () => {
    const r10 = ACHIEVEMENTS.find((a) => a.id === 'realm_10')!;
    expect(isAchievementUnlocked(r10, computeAchievementProgress({ ...baseInputs, playerLevel: 9 }))).toBe(false);
    expect(isAchievementUnlocked(r10, computeAchievementProgress({ ...baseInputs, playerLevel: 10 }))).toBe(true);
  });
});

describe('detectNewlyUnlocked', () => {
  it('returns empty when nothing new', () => {
    const p = computeAchievementProgress(baseInputs);
    expect(detectNewlyUnlocked(p, [])).toEqual([]);
  });

  it('returns achievement vừa unlock, không trùng cái đã track', () => {
    const p = computeAchievementProgress({ ...baseInputs, realmBreaks: 1, sectJoined: true });
    // first time
    const first = detectNewlyUnlocked(p, []);
    expect(first.map((a) => a.id)).toEqual(expect.arrayContaining(['first_break', 'sect_in']));
    // second pass with first_break đã track → chỉ còn sect_in
    const second = detectNewlyUnlocked(p, ['first_break']);
    expect(second.find((a) => a.id === 'first_break')).toBeUndefined();
    expect(second.find((a) => a.id === 'sect_in')).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import {
  computeTalentEffect, computeRuneEffect, detectActiveCombos,
  computeComboEffect, computeFinalSkillEffect, mergeEffects, EMPTY_EFFECT,
} from '../../src/core/skills/skill-deep';
import type { SkillTalentState } from '../../src/types/skill-deep';

describe('mergeEffects', () => {
  it('cộng damageBonus + cooldownReduce', () => {
    const a = { ...EMPTY_EFFECT, damageBonus: 0.2, passiveFlags: new Set<string>() };
    const b = { ...EMPTY_EFFECT, damageBonus: 0.3, cooldownReduce: 0.1, passiveFlags: new Set<string>() };
    const r = mergeEffects(a, b);
    expect(r.damageBonus).toBeCloseTo(0.5);
    expect(r.cooldownReduce).toBeCloseTo(0.1);
  });
  it('merge passiveFlags union', () => {
    const a = { ...EMPTY_EFFECT, passiveFlags: new Set(['x']) };
    const b = { ...EMPTY_EFFECT, passiveFlags: new Set(['y']) };
    const r = mergeEffects(a, b);
    expect(r.passiveFlags.has('x')).toBe(true);
    expect(r.passiveFlags.has('y')).toBe(true);
  });
});

describe('computeTalentEffect', () => {
  it('mastery < 3 → no effect', () => {
    const t: SkillTalentState = { t3: 'atk', t4: null, t5: null, resetCount: 0 };
    const r = computeTalentEffect(t, 2);
    expect(r.damageBonus).toBe(0);
  });
  it('mastery 3 + atk → +15% damage', () => {
    const t: SkillTalentState = { t3: 'atk', t4: null, t5: null, resetCount: 0 };
    const r = computeTalentEffect(t, 3);
    expect(r.damageBonus).toBeCloseTo(0.15);
  });
  it('mastery 5 + atk all 3 tier → cộng dồn 0.15+0.25+0.40 = 0.80', () => {
    const t: SkillTalentState = { t3: 'atk', t4: 'atk', t5: 'atk', resetCount: 0 };
    const r = computeTalentEffect(t, 5);
    expect(r.damageBonus).toBeCloseTo(0.80);
    expect(r.passiveFlags.has('pen_10')).toBe(true);
    expect(r.passiveFlags.has('crit_first')).toBe(true);
  });
  it('mix branches: t3 def + t4 utility + t5 atk', () => {
    const t: SkillTalentState = { t3: 'def', t4: 'utility', t5: 'atk', resetCount: 0 };
    const r = computeTalentEffect(t, 5);
    expect(r.defBuff).toBeCloseTo(0.20);
    expect(r.cooldownReduce).toBeCloseTo(0.25);
    expect(r.damageBonus).toBeCloseTo(0.40);
  });
});

describe('computeRuneEffect', () => {
  it('3 slot sát tier 1 → +0.045 × 3 = ~0.135', () => {
    const r = computeRuneEffect(['rune_sat_1', 'rune_sat_1', 'rune_sat_1']);
    expect(r.damageBonus).toBeCloseTo(0.135);
  });
  it('mixed slot: sat_5 + toc_3 + hap_2', () => {
    const r = computeRuneEffect(['rune_sat_5', 'rune_toc_3', 'rune_hap_2']);
    expect(r.damageBonus).toBeCloseTo(0.225);
    expect(r.cooldownReduce).toBeCloseTo(0.1125);
    expect(r.lifesteal).toBeCloseTo(0.06);
  });
  it('empty slots → no effect', () => {
    const r = computeRuneEffect([null, null, null]);
    expect(r.damageBonus).toBe(0);
  });
  it('invalid id → skip', () => {
    const r = computeRuneEffect(['rune_sat_1', 'bogus_id', null]);
    expect(r.damageBonus).toBeCloseTo(0.045);
  });
});

describe('detectActiveCombos', () => {
  it('Hỏa + Phong → trigger Hỏa Phong Bão', () => {
    const combos = detectActiveCombos(['Hỏa Long Trảm', 'Bão Phong Thuật']);
    expect(combos.find((c) => c.id === 'hoa_phong_bao')).toBeDefined();
  });
  it('chỉ Hỏa thôi → không match', () => {
    const combos = detectActiveCombos(['Hỏa Long Trảm']);
    expect(combos.find((c) => c.id === 'hoa_phong_bao')).toBeUndefined();
  });
  it('2 skill kiếm → trigger Kiếm Ý Song Pháp', () => {
    const combos = detectActiveCombos(['Kiếm Khí Trảm', 'Vô Hình Kiếm']);
    expect(combos.find((c) => c.id === 'kiem_y_song_phap')).toBeDefined();
  });
  it('1 skill 2 patterns không match (mỗi skill chỉ count 1)', () => {
    // "Hỏa Phong Kiếm" có cả "hỏa" và "phong" và "kiếm" nhưng chỉ 1 skill → chỉ match 1 pattern
    const combos = detectActiveCombos(['Hỏa Phong Kiếm']);
    expect(combos.find((c) => c.id === 'hoa_phong_bao')).toBeUndefined();
  });
});

describe('computeComboEffect', () => {
  it('trigger HP threshold check: Âm Quang chỉ active khi HP < 30%', () => {
    const combos = detectActiveCombos(['Hắc Ám Trảm', 'Quang Minh Hộ Thân']);
    const amQuang = combos.find((c) => c.id === 'am_quang_hop_nhat');
    expect(amQuang).toBeDefined();
    // HP 50% → skip
    const r1 = computeComboEffect([amQuang!], 0.5);
    expect(r1.damageBonus).toBe(0);
    // HP 20% → trigger
    const r2 = computeComboEffect([amQuang!], 0.2);
    expect(r2.damageBonus).toBeCloseTo(0.40);
  });
});

describe('computeFinalSkillEffect — integration', () => {
  it('full stack: talent + rune + combo', () => {
    const talent: SkillTalentState = { t3: 'atk', t4: 'atk', t5: 'atk', resetCount: 0 };
    const r = computeFinalSkillEffect(
      'skill_hoa',
      'Hỏa Long Trảm',
      5,
      talent,
      ['rune_sat_3', 'rune_sat_3', null],
      ['Hỏa Long Trảm', 'Phong Vũ Cuồng Thuật'],
      undefined,
    );
    // Talent atk 5: 0.15 + 0.25 + 0.40 = 0.80
    // Rune sat_3 × 2: 0.135 × 2 = 0.27
    // Combo hoa_phong_bao: 0.30
    // Tổng: 1.37
    expect(r.damageBonus).toBeCloseTo(0.80 + 0.27 + 0.30);
  });
});

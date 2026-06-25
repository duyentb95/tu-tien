import { describe, it, expect } from 'vitest';
import {
  rollSpiritualRoot,
  getRootDisplayName,
  getRootSubtitle,
  getPrimaryElement,
  TOTAL_ROOT_WEIGHT,
} from './spiritual-roots';

describe('spiritual roots', () => {
  it('tổng weight roll = 100', () => {
    expect(TOTAL_ROOT_WEIGHT).toBe(100);
  });

  it('roll deterministic với seeded rng', () => {
    let seed = 0.95; // → di căn (3% cuối)
    const root = rollSpiritualRoot(() => seed);
    expect(['don', 'song', 'tam', 'tu', 'ngu', 'di']).toContain(root.type);
    expect(root.elements.length).toBeGreaterThanOrEqual(1);
    expect(root.cultivationMultiplier).toBeGreaterThan(0);
  });

  it('Đơn linh căn chỉ có 1 element', () => {
    // Force rng để chọn đơn (đầu tiên, weight 2)
    const root = rollSpiritualRoot(() => 0.01);
    expect(root.type).toBe('don');
    expect(root.elements).toHaveLength(1);
    expect(root.cultivationMultiplier).toBe(3.0);
  });

  it('Ngũ linh căn có đủ 5 element', () => {
    // weight tổng trước ngu: 2+8+25+35 = 70, ngu = 27 → r in [70, 97]
    const root = rollSpiritualRoot(() => 0.85);
    expect(root.type).toBe('ngu');
    expect(root.elements).toHaveLength(5);
    expect(new Set(root.elements).size).toBe(5);
  });

  it('Dị căn dùng pool Lôi/Phong/Băng/Quang/Ám', () => {
    const root = rollSpiritualRoot(() => 0.99);
    expect(root.type).toBe('di');
    expect(['loi', 'phong', 'bang', 'quang', 'am']).toContain(root.elements[0]);
    expect(root.cultivationMultiplier).toBeGreaterThanOrEqual(4);
  });

  it('display name có format hợp lý', () => {
    const single = rollSpiritualRoot(() => 0.01);
    const name = getRootDisplayName(single);
    expect(name).toContain('Linh Căn');
  });

  it('dị căn có display "Thiên ... Dị Căn"', () => {
    const di = rollSpiritualRoot(() => 0.99);
    expect(getRootDisplayName(di)).toMatch(/^Thiên .+ Dị Căn$/);
  });

  it('getPrimaryElement không crash', () => {
    const r = rollSpiritualRoot();
    expect(typeof getPrimaryElement(r)).toBe('string');
    expect(getRootSubtitle(r)).toBeTruthy();
  });
});

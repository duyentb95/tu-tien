import { describe, it, expect } from 'vitest';
import { pickScenarioByDice } from './scenario-roller';
import type { Scenario } from '@ai/prompts/logic-engine';

const mk = (probability: number, summary: string): Scenario => ({
  probability,
  summary,
  classification_tags: { length: 'ngắn', tone: 'trung lập', rating: 'sfw' },
  relevant_entities: [],
  commands: '',
});

describe('pickScenarioByDice', () => {
  it('throws on empty input', () => {
    expect(() => pickScenarioByDice([])).toThrow();
  });

  it('returns the only scenario when N=1', () => {
    const s = [mk(100, 'A')];
    const r = pickScenarioByDice(s);
    expect(r.scenario.summary).toBe('A');
    expect(r.index).toBe(0);
    expect(r.pickedProbability).toBe(1);
  });

  it('picks deterministic via injected rng', () => {
    const s = [mk(50, 'A'), mk(50, 'B')];
    // rng returns 0 → first
    expect(pickScenarioByDice(s, () => 0).scenario.summary).toBe('A');
    // rng returns 0.51 → cross threshold, picks B
    expect(pickScenarioByDice(s, () => 0.51).scenario.summary).toBe('B');
  });

  it('normalizes probabilities when sum != 100', () => {
    const s = [mk(20, 'A'), mk(80, 'B')]; // sum=100 OK
    expect(pickScenarioByDice(s, () => 0.19).scenario.summary).toBe('A');
    expect(pickScenarioByDice(s, () => 0.21).scenario.summary).toBe('B');

    // Sum = 200 — should still work proportionally
    const big = [mk(40, 'A'), mk(160, 'B')]; // 20% vs 80% after normalize
    expect(pickScenarioByDice(big, () => 0.19).scenario.summary).toBe('A');
    expect(pickScenarioByDice(big, () => 0.21).scenario.summary).toBe('B');
  });

  it('skips probability=0 scenarios', () => {
    const s = [mk(0, 'A'), mk(100, 'B')];
    // No matter what rng returns, should pick B
    expect(pickScenarioByDice(s, () => 0).scenario.summary).toBe('B');
    expect(pickScenarioByDice(s, () => 0.99).scenario.summary).toBe('B');
  });

  it('falls back to uniform when all probabilities = 0', () => {
    const s = [mk(0, 'A'), mk(0, 'B'), mk(0, 'C')];
    const r = pickScenarioByDice(s, () => 0.5);
    expect(['A', 'B', 'C']).toContain(r.scenario.summary);
  });

  it('handles 6 scenarios with realistic distribution', () => {
    const s = [
      mk(30, 'positive-1'),
      mk(25, 'positive-2'),
      mk(20, 'neutral'),
      mk(15, 'negative'),
      mk(8, 'surprise'),
      mk(2, 'rare-event'),
    ];
    // Rare event only fires for very high roll
    expect(pickScenarioByDice(s, () => 0.99).scenario.summary).toBe('rare-event');
    // First positive on low roll
    expect(pickScenarioByDice(s, () => 0.1).scenario.summary).toBe('positive-1');
  });

  it('returns metadata for debugging', () => {
    const s = [mk(40, 'A'), mk(60, 'B')];
    const r = pickScenarioByDice(s, () => 0.5);
    expect(r.roll).toBe(0.5);
    expect(r.index).toBe(1); // B
    expect(r.pickedProbability).toBeCloseTo(0.6, 5);
  });
});

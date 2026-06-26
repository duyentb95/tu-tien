/**
 * Scenario Dice Roller — Step 2 của "Hybrid Xúc Xắc" pattern.
 *
 * Pure function: nhận N scenarios với probability weight → pick 1 theo weighted random.
 * Inject rng để test deterministic.
 *
 * Algorithm:
 *   1. Normalize probabilities sao cho sum = 1.0 (handle case AI trả sum != 100)
 *   2. Cumulative distribution: scenarios[0].p, scenarios[0].p + scenarios[1].p, ...
 *   3. rng() ∈ [0, 1) → tìm scenario có cumulative >= rng
 */

import type { Scenario } from '@ai/prompts/logic-engine';

export interface PickResult {
  scenario: Scenario;
  /** Index trong original array — useful cho debug + analytics */
  index: number;
  /** Roll value (0-1) — useful để log "rolled X, got scenario Y" */
  roll: number;
  /** Normalized probability của scenario được pick (0-1) */
  pickedProbability: number;
}

/**
 * Pick 1 scenario theo weighted random.
 * Throw nếu input rỗng. Auto-normalize nếu probabilities không sum = 100.
 */
export const pickScenarioByDice = (
  scenarios: Scenario[],
  rng: () => number = Math.random,
): PickResult => {
  if (!scenarios || scenarios.length === 0) {
    throw new Error('[scenario-roller] No scenarios to pick from');
  }
  if (scenarios.length === 1) {
    return {
      scenario: scenarios[0]!,
      index: 0,
      roll: 0,
      pickedProbability: 1,
    };
  }

  // Filter scenario có probability <= 0 (AI có thể trả invalid)
  const valid = scenarios
    .map((s, idx) => ({ scenario: s, idx, weight: Math.max(0, s.probability ?? 0) }))
    .filter((x) => x.weight > 0);

  if (valid.length === 0) {
    // All invalid → uniform random pick
    const idx = Math.floor(rng() * scenarios.length);
    return {
      scenario: scenarios[idx]!,
      index: idx,
      roll: idx / scenarios.length,
      pickedProbability: 1 / scenarios.length,
    };
  }

  const totalWeight = valid.reduce((sum, x) => sum + x.weight, 0);
  const roll = rng();
  const target = roll * totalWeight;

  let cumulative = 0;
  for (const entry of valid) {
    cumulative += entry.weight;
    if (target < cumulative) {
      return {
        scenario: entry.scenario,
        index: entry.idx,
        roll,
        pickedProbability: entry.weight / totalWeight,
      };
    }
  }

  // Fallback (floating point edge case) — pick last
  const last = valid[valid.length - 1]!;
  return {
    scenario: last.scenario,
    index: last.idx,
    roll,
    pickedProbability: last.weight / totalWeight,
  };
};

/**
 * Debug helper — format scenarios as table cho console.log.
 */
export const formatScenariosTable = (scenarios: Scenario[]): string => {
  const totalP = scenarios.reduce((s, x) => s + (x.probability ?? 0), 0);
  return scenarios
    .map((s, i) => {
      const pct = totalP > 0 ? Math.round(((s.probability ?? 0) / totalP) * 100) : 0;
      const tone = s.classification_tags?.tone ?? '?';
      return `  #${i + 1} [${pct}% ${tone}] ${s.summary.slice(0, 80)}${s.summary.length > 80 ? '...' : ''}`;
    })
    .join('\n');
};

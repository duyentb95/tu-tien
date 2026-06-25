import type { Rarity } from './item';

export type SkillKind = 'combat_basic' | 'combat_ultimate' | 'adventure';

export interface PassiveEffect {
  type: string; // e.g. 'REDUCE_BUDGET_RANDOMNESS', 'EXTRA_DAMAGE_VS_BEAST'
  value: number;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  kind: SkillKind;

  /** Raw effects string format giống prototype: "DAMAGE:formula=...;APPLY_DYNAMIC_STATUS:..." */
  effects?: string;

  passive_effects?: PassiveEffect[];

  /** Mana / linh khí cost */
  cost?: number;

  /** Cooldown (turns) */
  cooldown?: number;

  /** Yêu cầu để học (level, linh căn element) */
  requirements?: {
    minLevel?: number;
    elements?: import('./character').Element[];
  };
}

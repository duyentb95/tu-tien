/**
 * DIFFICULTY config — port từ prototype `PREVIEW.md` (line 111, 119).
 */

export type Difficulty = 'Dễ' | 'Thường' | 'Khó' | 'Ác Mộng' | 'Tuỳ Chỉnh AI';

export interface DifficultyMultiplier {
  /** Khi bán: được bao % giá trị item */
  sell: number;
  /** Khi mua: phải trả bao % giá trị item */
  buy: number;
}

export const DIFFICULTY_MULTIPLIERS: Record<Difficulty, DifficultyMultiplier> = {
  'Dễ':         { sell: 0.5, buy: 1.0 },
  'Thường':      { sell: 0.3, buy: 1.3 },
  'Khó':         { sell: 0.2, buy: 1.8 },
  'Ác Mộng':     { sell: 0.1, buy: 2.5 },
  'Tuỳ Chỉnh AI': { sell: 0.3, buy: 1.3 },
};

/** [min, max] ngẫu nhiên cho budget item — biến động lên xuống theo độ khó */
export const DIFFICULTY_RANDOMNESS: Record<Difficulty, [number, number]> = {
  'Dễ':         [0.9, 1.2],
  'Thường':      [0.7, 1.3],
  'Khó':         [0.6, 1.4],
  'Ác Mộng':     [0.5, 1.5],
  'Tuỳ Chỉnh AI': [0.7, 1.3],
};

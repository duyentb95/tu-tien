import type { Rarity, RarityDistribution, RarityBracket } from '@gametypes/item';

/**
 * RARITY_DISTRIBUTION_BY_LEVEL — port nguyên từ prototype `PREVIEW.md` (line 16010).
 * Mỗi bracket level sẽ có % roll khác nhau cho từng phẩm chất khi sinh loot.
 */
export const RARITY_DISTRIBUTION_BY_LEVEL: RarityDistribution = {
  '1-10':  { 'Thường': 40, 'Tốt': 30, 'Hiếm': 20, 'Cực Phẩm': 6,  'Siêu Phẩm': 3,  'Huyền Thoại': 1 },
  '11-20': { 'Thường': 30, 'Tốt': 30, 'Hiếm': 23, 'Cực Phẩm': 10, 'Siêu Phẩm': 5,  'Huyền Thoại': 2 },
  '21-30': { 'Thường': 20, 'Tốt': 30, 'Hiếm': 28, 'Cực Phẩm': 14, 'Siêu Phẩm': 6,  'Huyền Thoại': 2 },
  '31-40': { 'Thường': 10, 'Tốt': 25, 'Hiếm': 32, 'Cực Phẩm': 22, 'Siêu Phẩm': 8,  'Huyền Thoại': 3 },
  '41-50': { 'Thường': 5,  'Tốt': 20, 'Hiếm': 35, 'Cực Phẩm': 25, 'Siêu Phẩm': 11, 'Huyền Thoại': 4 },
  '51+':   { 'Thường': 1,  'Tốt': 15, 'Hiếm': 35, 'Cực Phẩm': 25, 'Siêu Phẩm': 17, 'Huyền Thoại': 7 },
};

export const getBracketForLevel = (level: number): RarityBracket => {
  if (level <= 10) return '1-10';
  if (level <= 20) return '11-20';
  if (level <= 30) return '21-30';
  if (level <= 40) return '31-40';
  if (level <= 50) return '41-50';
  return '51+';
};

/** Roll phẩm chất ngẫu nhiên theo level (Math.random injectable cho test) */
export const rollRarity = (level: number, rng: () => number = Math.random): Rarity => {
  const dist = RARITY_DISTRIBUTION_BY_LEVEL[getBracketForLevel(level)];
  const r = rng() * 100;
  let cumulative = 0;
  for (const [rarity, weight] of Object.entries(dist) as [Rarity, number][]) {
    cumulative += weight;
    if (r < cumulative) return rarity;
  }
  return 'Thường';
};

/** Bảng base value cho budget tính giá item — port từ RARITY_BASE_VALUE (line 135) */
export const RARITY_BASE_VALUE: Record<Rarity, number> = {
  'Thường': 100,
  'Tốt': 300,
  'Hiếm': 1000,
  'Cực Phẩm': 2000,
  'Siêu Phẩm': 4000,
  'Huyền Thoại': 10000,
};

/** Multiplier theo category — port từ TYPE_MULTIPLIER (line 140) */
export const TYPE_MULTIPLIER: Record<string, number> = {
  'Vũ khí': 1.0,
  'Thân': 1.0,
  'Đầu': 1.0,
  'Chân': 1.0,
  'Phụ kiện': 1.1,
  'Trữ vật': 1.0,
  'Dị thường': 1.5,
  'Phương tiện': 1.2,
  'Đan dược': 0.15,
  'Thực phẩm': 0.15,
  'Đa năng': 0.2,
  'Nguyên liệu': 0.1,
  'Tạp vật': 0.05,
  'Tín vật': 0.3,
  'Sách kỹ năng': 2.0,
};

import type { BeastTemplate } from '@gametypes/spirit-beast';

/**
 * 8 default spirit beast templates — từ thường đến huyền thoại.
 * Mỗi template có 2-4 evolution stages.
 *
 * Capture chance được tính trong rollCapture() = baseCaptureChance × rarityMod × levelMod.
 */
export const BEAST_TEMPLATES: BeastTemplate[] = [
  // ─── COMMON ───
  {
    id: 'tieu_ho_tinh',
    baseName: 'Tiểu Hồ Tinh',
    rarity: 'Thường',
    kind: 'beast',
    element: 'phong',
    baseStats: { hp: 80, atk: 12, def: 5, spd: 35 },
    captureRequirement: { baseCaptureChance: 40 },
    stages: [
      { name: 'Tiểu Hồ Tinh', minLevel: 1, statMultiplier: 1, description: 'Hồ tinh con, nhanh nhẹn nhưng yếu.' },
      { name: 'Nguyệt Hồ', minLevel: 10, statMultiplier: 1.6, description: 'Đã ngộ chút linh khí, mọc thêm 1 đuôi.', evolutionCost: { currency: 200 } },
      { name: 'Cửu Vĩ Hồ', minLevel: 30, statMultiplier: 3.2, description: 'Hồ huyền thoại 9 đuôi, có thể biến hình.', evolutionCost: { currency: 5000, itemName: 'Hồ Tinh Đan' } },
    ],
  },
  {
    id: 'thach_quy',
    baseName: 'Thạch Quy Tử',
    rarity: 'Thường',
    kind: 'beast',
    element: 'tho',
    baseStats: { hp: 200, atk: 8, def: 30, spd: 8 },
    captureRequirement: { baseCaptureChance: 50 },
    stages: [
      { name: 'Thạch Quy Tử', minLevel: 1, statMultiplier: 1, description: 'Rùa đá nhỏ, phòng thủ là đầu.' },
      { name: 'Thiên Niên Quy', minLevel: 15, statMultiplier: 2.0, description: 'Sống ngàn năm, mai cứng như kim cương.', evolutionCost: { currency: 500 } },
    ],
  },

  // ─── GOOD ───
  {
    id: 'hac_vu_lang',
    baseName: 'Hắc Vụ Lang Vương',
    rarity: 'Tốt',
    kind: 'beast',
    element: 'am',
    baseStats: { hp: 120, atk: 25, def: 10, spd: 40 },
    captureRequirement: { baseCaptureChance: 30, playerLevelMin: 5 },
    stages: [
      { name: 'Hắc Vụ Lang Vương', minLevel: 1, statMultiplier: 1, description: 'Sói chúa của Hậu Sơn Mật Lâm.' },
      { name: 'Tử Vụ Lang Thần', minLevel: 20, statMultiplier: 2.5, description: 'Tiến hóa, thân thể phủ kim quang tử khí.', evolutionCost: { currency: 1500, itemName: 'Hắc Vụ Nội Đan' } },
    ],
  },
  {
    id: 'hoa_diem_to',
    baseName: 'Hỏa Diễm Tô',
    rarity: 'Tốt',
    kind: 'beast',
    element: 'hoa',
    baseStats: { hp: 100, atk: 30, def: 8, spd: 25 },
    captureRequirement: { baseCaptureChance: 25, playerLevelMin: 8 },
    stages: [
      { name: 'Hỏa Diễm Tô', minLevel: 1, statMultiplier: 1, description: 'Chồn lửa, đuôi cháy không ngừng.' },
      { name: 'Liên Hoàn Hỏa Hổ', minLevel: 18, statMultiplier: 2.2, description: 'Tiến hóa thành hổ lửa, nhả phun.', evolutionCost: { currency: 1200 } },
      { name: 'Chu Tước Đồng Tử', minLevel: 40, statMultiplier: 4.5, description: 'Hồn phượng giáng lâm vào thân hổ.', evolutionCost: { currency: 8000, itemName: 'Chu Tước Tinh Huyết' } },
    ],
  },

  // ─── RARE ───
  {
    id: 'tu_tieu_kiem_linh',
    baseName: 'Tử Tiêu Kiếm Linh',
    rarity: 'Hiếm',
    kind: 'sword_spirit',
    element: 'loi',
    baseStats: { hp: 60, atk: 50, def: 5, spd: 60 },
    captureRequirement: { baseCaptureChance: 15, playerLevelMin: 15 },
    stages: [
      { name: 'Tử Tiêu Kiếm Linh', minLevel: 1, statMultiplier: 1, description: 'Hồn kiếm của Tử Tiêu Phong, nhanh tựa lôi điện.' },
      { name: 'Cửu Tiêu Kiếm Chủ', minLevel: 25, statMultiplier: 3.0, description: 'Kiếm hồn đã hoàn nguyên, mỗi chiêu mang sấm sét.', evolutionCost: { currency: 5000, itemName: 'Lôi Văn Tinh Hồn' } },
    ],
  },
  {
    id: 'bich_giao',
    baseName: 'Bích Linh Giao',
    rarity: 'Hiếm',
    kind: 'dragon',
    element: 'thuy',
    baseStats: { hp: 250, atk: 40, def: 25, spd: 30 },
    captureRequirement: { baseCaptureChance: 12, playerLevelMin: 20 },
    stages: [
      { name: 'Bích Linh Giao', minLevel: 1, statMultiplier: 1, description: 'Giao long nhỏ, sống ở suối Đông Hải.' },
      { name: 'Thanh Long Tử', minLevel: 30, statMultiplier: 2.8, description: 'Lột vỏ thành rồng, mây gió hô ứng.', evolutionCost: { currency: 3500 } },
      { name: 'Đông Hải Long Quân', minLevel: 60, statMultiplier: 6.0, description: 'Chân long thực sự, gọi mưa hô gió.', evolutionCost: { currency: 25000, itemName: 'Long Châu' } },
    ],
  },

  // ─── EPIC ───
  {
    id: 'huyet_quy',
    baseName: 'Huyết Quy Chân Hồn',
    rarity: 'Cực Phẩm',
    kind: 'spirit',
    element: 'am',
    baseStats: { hp: 150, atk: 60, def: 15, spd: 45 },
    captureRequirement: { baseCaptureChance: 8, playerLevelMin: 30 },
    stages: [
      { name: 'Huyết Quy Chân Hồn', minLevel: 1, statMultiplier: 1, description: 'Quỷ hồn sinh từ Bích Huyết Uyên.' },
      { name: 'Tà Quân Huyết Sát', minLevel: 35, statMultiplier: 3.5, description: 'Đã ăn vạn linh hồn, trở thành tà thần.', evolutionCost: { currency: 8000, itemName: 'Vạn Quỷ Huyết Hỏa' } },
    ],
  },

  // ─── LEGENDARY ───
  {
    id: 'cuu_tu_long',
    baseName: 'Cửu Tử Tiềm Long',
    rarity: 'Huyền Thoại',
    kind: 'dragon',
    element: 'loi',
    baseStats: { hp: 500, atk: 80, def: 50, spd: 50 },
    captureRequirement: { baseCaptureChance: 3, playerLevelMin: 50 },
    stages: [
      { name: 'Cửu Tử Tiềm Long', minLevel: 1, statMultiplier: 1, description: 'Long con từ thiên ngoại lai khách.' },
      { name: 'Cửu Tử Hoàng Long', minLevel: 40, statMultiplier: 4.0, description: 'Mọc đủ vảy vàng, gầm vang chấn thiên.', evolutionCost: { currency: 30000, itemName: 'Long Tu' } },
      { name: 'Cửu Tử Thần Long', minLevel: 80, statMultiplier: 9.0, description: 'Thần long siêu việt phàm trần — không chết được.', evolutionCost: { currency: 200000, itemName: 'Thần Long Tinh Hồn' } },
    ],
  },
];

export const getBeastTemplate = (id: string): BeastTemplate | undefined =>
  BEAST_TEMPLATES.find((b) => b.id === id);

/** Map tên enemy (mock chunk hay AI gen) → templateId nếu khớp */
export const findTemplateByEnemyName = (enemyName: string): BeastTemplate | undefined => {
  const lower = enemyName.toLowerCase();
  return BEAST_TEMPLATES.find((t) => {
    if (t.baseName.toLowerCase() === lower) return true;
    return t.stages.some((s) => s.name.toLowerCase() === lower);
  });
};

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

  // ═══════════════════════════════════════════════════════════
  // Phase 7.5 expansion — 17 beasts mới (8→25 total)
  // ═══════════════════════════════════════════════════════════

  // ─── COMMON (4 mới) ───
  {
    id: 'tieu_lam_thu', baseName: 'Tiểu Lâm Thử', rarity: 'Thường', kind: 'beast', element: 'moc',
    baseStats: { hp: 60, atk: 10, def: 3, spd: 45 }, captureRequirement: { baseCaptureChance: 60 },
    stages: [
      { name: 'Tiểu Lâm Thử', minLevel: 1, statMultiplier: 1, description: 'Chuột rừng nhỏ, mau lẹ.' },
      { name: 'Thiên Lâm Thử', minLevel: 12, statMultiplier: 1.8, description: 'Lớn lên, có thể nhả tia gỗ.', evolutionCost: { currency: 300 } },
    ],
  },
  {
    id: 'phong_yen', baseName: 'Phong Yến', rarity: 'Thường', kind: 'beast', element: 'phong',
    baseStats: { hp: 70, atk: 14, def: 4, spd: 50 }, captureRequirement: { baseCaptureChance: 55 },
    stages: [
      { name: 'Phong Yến', minLevel: 1, statMultiplier: 1, description: 'Yến phong nhỏ, nhanh hơn gió.' },
      { name: 'Cuồng Phong Yến', minLevel: 15, statMultiplier: 2.0, description: 'Hô phong hoán vũ.', evolutionCost: { currency: 400 } },
    ],
  },
  {
    id: 'tieu_bach_xa', baseName: 'Tiểu Bạch Xà', rarity: 'Thường', kind: 'beast', element: 'thuy',
    baseStats: { hp: 90, atk: 12, def: 6, spd: 30 }, captureRequirement: { baseCaptureChance: 50 },
    stages: [
      { name: 'Tiểu Bạch Xà', minLevel: 1, statMultiplier: 1, description: 'Rắn trắng nhỏ ở suối lạnh.' },
      { name: 'Băng Tinh Xà', minLevel: 18, statMultiplier: 2.2, description: 'Vảy hóa băng, nhả hàn khí.', evolutionCost: { currency: 600 } },
    ],
  },
  {
    id: 'hoang_que', baseName: 'Hoàng Quế Sư', rarity: 'Thường', kind: 'beast', element: 'tho',
    baseStats: { hp: 150, atk: 18, def: 22, spd: 12 }, captureRequirement: { baseCaptureChance: 45 },
    stages: [
      { name: 'Hoàng Quế Sư', minLevel: 1, statMultiplier: 1, description: 'Sư tử cát vàng, lười nhưng khỏe.' },
      { name: 'Hoàng Sa Vương', minLevel: 20, statMultiplier: 2.5, description: 'Vương cát sa, có thể nuốt người.', evolutionCost: { currency: 800 } },
    ],
  },

  // ─── GOOD (4 mới) ───
  {
    id: 'ngan_quang_hac', baseName: 'Ngân Quang Hạc', rarity: 'Tốt', kind: 'beast', element: 'quang',
    baseStats: { hp: 110, atk: 22, def: 12, spd: 38 }, captureRequirement: { baseCaptureChance: 28, playerLevelMin: 7 },
    stages: [
      { name: 'Ngân Quang Hạc', minLevel: 1, statMultiplier: 1, description: 'Hạc bạc thanh tao, biểu tượng tu sĩ chính đạo.' },
      { name: 'Thánh Quang Hạc', minLevel: 22, statMultiplier: 2.5, description: 'Cánh phát quang, khắc chế ma đạo.', evolutionCost: { currency: 1500, itemName: 'Thánh Quang Vũ' } },
    ],
  },
  {
    id: 'tho_long_bao', baseName: 'Thổ Long Báo', rarity: 'Tốt', kind: 'beast', element: 'tho',
    baseStats: { hp: 140, atk: 26, def: 18, spd: 28 }, captureRequirement: { baseCaptureChance: 30, playerLevelMin: 10 },
    stages: [
      { name: 'Thổ Long Báo', minLevel: 1, statMultiplier: 1, description: 'Báo có vảy thổ, đào hang nhanh.' },
      { name: 'Thổ Long Vương', minLevel: 25, statMultiplier: 2.6, description: 'Tinh thông thổ độn, không thể truy đuổi.', evolutionCost: { currency: 1800 } },
    ],
  },
  {
    id: 'thanh_loi_dieu', baseName: 'Thanh Lôi Điểu', rarity: 'Tốt', kind: 'beast', element: 'loi',
    baseStats: { hp: 95, atk: 32, def: 8, spd: 42 }, captureRequirement: { baseCaptureChance: 22, playerLevelMin: 12 },
    stages: [
      { name: 'Thanh Lôi Điểu', minLevel: 1, statMultiplier: 1, description: 'Chim sấm xanh, kêu vang sấm sét.' },
      { name: 'Cự Lôi Đại Bằng', minLevel: 28, statMultiplier: 3.0, description: 'Đại bằng mang sấm, bay vạn dặm trong khoảnh khắc.', evolutionCost: { currency: 2500, itemName: 'Lôi Vũ' } },
    ],
  },
  {
    id: 'huyen_xa_vu', baseName: 'Huyền Sa Vũ Quy', rarity: 'Tốt', kind: 'beast', element: 'thuy',
    baseStats: { hp: 250, atk: 18, def: 40, spd: 10 }, captureRequirement: { baseCaptureChance: 32, playerLevelMin: 8 },
    stages: [
      { name: 'Huyền Sa Vũ Quy', minLevel: 1, statMultiplier: 1, description: 'Rùa nước mai đen, phòng thủ tuyệt đối.' },
      { name: 'Thủy Tinh Cổ Quy', minLevel: 25, statMultiplier: 2.4, description: 'Mai thủy tinh, phản đòn vật lý.', evolutionCost: { currency: 2000 } },
    ],
  },

  // ─── RARE (4 mới) ───
  {
    id: 'huyet_diem_ho', baseName: 'Huyết Diễm Hồ', rarity: 'Hiếm', kind: 'beast', element: 'hoa',
    baseStats: { hp: 180, atk: 55, def: 15, spd: 50 }, captureRequirement: { baseCaptureChance: 14, playerLevelMin: 18 },
    stages: [
      { name: 'Huyết Diễm Hồ', minLevel: 1, statMultiplier: 1, description: 'Hồ ly lửa máu, 3 đuôi đỏ rực.' },
      { name: 'Cửu Diễm Yêu Hồ', minLevel: 30, statMultiplier: 3.2, description: '9 đuôi lửa, hóa thân thành mỹ nhân.', evolutionCost: { currency: 6000, itemName: 'Diễm Hỏa Tinh Hồn' } },
    ],
  },
  {
    id: 'kinh_phong_lang', baseName: 'Kinh Phong Lang', rarity: 'Hiếm', kind: 'beast', element: 'phong',
    baseStats: { hp: 200, atk: 50, def: 18, spd: 65 }, captureRequirement: { baseCaptureChance: 13, playerLevelMin: 20 },
    stages: [
      { name: 'Kinh Phong Lang', minLevel: 1, statMultiplier: 1, description: 'Sói gió tốc độ ánh sáng.' },
      { name: 'Phong Thần Lang', minLevel: 32, statMultiplier: 3.2, description: 'Sói thần phong, đi qua không để lại dấu vết.', evolutionCost: { currency: 7000, itemName: 'Phong Linh Tinh Thạch' } },
    ],
  },
  {
    id: 'hac_thuy_giao', baseName: 'Hắc Thủy Giao Long', rarity: 'Hiếm', kind: 'dragon', element: 'thuy',
    baseStats: { hp: 300, atk: 45, def: 28, spd: 32 }, captureRequirement: { baseCaptureChance: 11, playerLevelMin: 22 },
    stages: [
      { name: 'Hắc Thủy Giao', minLevel: 1, statMultiplier: 1, description: 'Giao long đen của Hắc Hà.' },
      { name: 'Hắc Long Vương', minLevel: 35, statMultiplier: 3.5, description: 'Vương hắc long, gọi mưa máu.', evolutionCost: { currency: 8000, itemName: 'Long Châu Hắc' } },
    ],
  },
  {
    id: 'tinh_y_kiem_linh', baseName: 'Tinh Ý Kiếm Linh', rarity: 'Hiếm', kind: 'sword_spirit', element: 'kim',
    baseStats: { hp: 80, atk: 60, def: 8, spd: 70 }, captureRequirement: { baseCaptureChance: 12, playerLevelMin: 25 },
    stages: [
      { name: 'Tinh Ý Kiếm Linh', minLevel: 1, statMultiplier: 1, description: 'Hồn kiếm tinh ý, sắc bén vô song.' },
      { name: 'Thiên Ý Kiếm Chủ', minLevel: 35, statMultiplier: 3.5, description: 'Chủ kiếm, mỗi chiêu mang ý chí thiên đạo.', evolutionCost: { currency: 9000, itemName: 'Tinh Thiết' } },
    ],
  },

  // ─── EPIC (3 mới) ───
  {
    id: 'phuong_hoang_tieu', baseName: 'Phượng Hoàng Tiểu', rarity: 'Cực Phẩm', kind: 'phoenix', element: 'hoa',
    baseStats: { hp: 200, atk: 70, def: 20, spd: 55 }, captureRequirement: { baseCaptureChance: 6, playerLevelMin: 35 },
    stages: [
      { name: 'Phượng Hoàng Tiểu', minLevel: 1, statMultiplier: 1, description: 'Phượng hoàng nhỏ, hồi sinh sau khi chết.' },
      { name: 'Niết Bàn Phượng', minLevel: 40, statMultiplier: 4.0, description: 'Phượng niết bàn, lửa thiêu vạn vật.', evolutionCost: { currency: 12000, itemName: 'Niết Bàn Hỏa' } },
    ],
  },
  {
    id: 'ki_lan_tieu', baseName: 'Kỳ Lân Tiểu', rarity: 'Cực Phẩm', kind: 'mystical', element: 'tho',
    baseStats: { hp: 350, atk: 55, def: 50, spd: 40 }, captureRequirement: { baseCaptureChance: 7, playerLevelMin: 32 },
    stages: [
      { name: 'Kỳ Lân Tiểu', minLevel: 1, statMultiplier: 1, description: 'Kỳ lân con, biểu tượng cát tường.' },
      { name: 'Hoàng Kỳ Lân Vương', minLevel: 38, statMultiplier: 3.8, description: 'Vương kỳ lân vàng, một mình đối ngàn quân.', evolutionCost: { currency: 11000, itemName: 'Kỳ Lân Giáp' } },
    ],
  },
  {
    id: 'cuu_vi_tiet_ho', baseName: 'Cửu Vĩ Tiết Hồ', rarity: 'Cực Phẩm', kind: 'spirit', element: 'am',
    baseStats: { hp: 180, atk: 65, def: 20, spd: 60 }, captureRequirement: { baseCaptureChance: 5, playerLevelMin: 38 },
    stages: [
      { name: 'Cửu Vĩ Tiết Hồ', minLevel: 1, statMultiplier: 1, description: 'Hồ 9 đuôi tà, hấp hồn người.' },
      { name: 'Yêu Hồ Vương', minLevel: 40, statMultiplier: 4.0, description: 'Vương yêu hồ, ngàn năm tu hành.', evolutionCost: { currency: 14000, itemName: 'Hồ Tinh Cổ Hồn' } },
    ],
  },

  // ─── LEGENDARY (2 mới) ───
  {
    id: 'cuu_chuyen_phuong', baseName: 'Cửu Chuyển Phượng Hoàng', rarity: 'Huyền Thoại', kind: 'phoenix', element: 'hoa',
    baseStats: { hp: 550, atk: 90, def: 45, spd: 60 }, captureRequirement: { baseCaptureChance: 3, playerLevelMin: 55 },
    stages: [
      { name: 'Cửu Chuyển Phượng Hoàng', minLevel: 1, statMultiplier: 1, description: 'Phượng hoàng cổ xưa, sinh từ Hỏa Vực.' },
      { name: 'Thiên Phượng', minLevel: 45, statMultiplier: 4.5, description: 'Phượng thiên, một tiếng gáy đại địa rúng động.', evolutionCost: { currency: 40000, itemName: 'Phượng Lệ' } },
      { name: 'Chân Phượng Hoàng', minLevel: 85, statMultiplier: 10.0, description: 'Phượng hoàng chân chính, vô địch thiên hạ.', evolutionCost: { currency: 250000, itemName: 'Niết Bàn Tinh Hồn' } },
    ],
  },
  {
    id: 'thai_co_huyet_ma', baseName: 'Thái Cổ Huyết Ma', rarity: 'Huyền Thoại', kind: 'mystical', element: 'am',
    baseStats: { hp: 600, atk: 100, def: 40, spd: 55 }, captureRequirement: { baseCaptureChance: 2, playerLevelMin: 60 },
    stages: [
      { name: 'Thái Cổ Huyết Ma Hậu Duệ', minLevel: 1, statMultiplier: 1, description: 'Hậu duệ của Thái Cổ Huyết Ma, mang huyết mạch cổ thần.' },
      { name: 'Huyết Ma Tướng', minLevel: 45, statMultiplier: 4.5, description: 'Tướng huyết ma, ăn linh hồn để mạnh.', evolutionCost: { currency: 50000, itemName: 'Vạn Quỷ Huyết' } },
      { name: 'Cổ Thần Huyết Ma', minLevel: 90, statMultiplier: 12.0, description: 'Cổ thần phục sinh, đe dọa cả Tiên giới.', evolutionCost: { currency: 300000, itemName: 'Cổ Thần Tinh Hồn' } },
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

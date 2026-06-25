import type { Sect, SectMission, TangKinhItem } from '@gametypes/sect';

/**
 * 5 default sects. Player có thể join nếu thỏa joinRequirements.
 * Mỗi sect có philosophy + element bias + signature techniques riêng.
 */
export const DEFAULT_SECTS: Sect[] = [
  {
    id: 'thanh_van_mon',
    name: 'Thanh Vân Môn',
    alignment: 'chinh',
    description: 'Chính đạo tông môn lớn nhất Đông Hải Châu. Đệ tử mặc áo xanh, tu Hồn Nguyên Trường Sinh Quyết.',
    philosophy: '"Đại đạo vô tình, ngộ tính tự minh."',
    primaryElements: ['moc', 'thuy'],
    joinRequirements: { levelMin: 1 },
    signatureTechniques: ['Hồn Nguyên Trường Sinh Quyết', 'Thanh Mộc Kiếm Pháp', 'Bích Thủy Tẩy Tâm Đan Pháp'],
  },
  {
    id: 'lac_hong_cung',
    name: 'Lạc Hồng Cung',
    alignment: 'an',
    description: 'Cung điện thần bí của Lạc gia. Đệ tử áo trắng, ít người biết chính xác họ tu loại công pháp gì.',
    philosophy: '"Lạc hồng ngàn dặm, hữu duyên ắt gặp."',
    primaryElements: ['loi', 'quang'],
    joinRequirements: { levelMin: 15, elementsRequired: ['loi', 'phong', 'bang', 'quang', 'am'] },
    signatureTechniques: ['Cửu Tiêu Lôi Kiếp Quyết', 'Thiên Long Phá Vân', 'Lạc Hồng Bảo Lục'],
  },
  {
    id: 'huyet_sat_tong',
    name: 'Huyết Sát Tông',
    alignment: 'ma',
    description: 'Ma đạo tông môn vùng Bích Huyết Uyên. Đệ tử mặc đen đỏ, lấy giết người để tu luyện.',
    philosophy: '"Một niệm thành ma, vạn người tan xác."',
    primaryElements: ['am', 'hoa'],
    joinRequirements: { levelMin: 10 },
    signatureTechniques: ['Huyết Hà Ma Công', 'Sát Lục Lệnh', 'Thiên Ma Phân Thân Thuật'],
  },
  {
    id: 'kiem_tam_lau',
    name: 'Kiếm Tâm Lâu',
    alignment: 'trung',
    description: 'Lâu các kiếm sĩ trung lập, không can dự chính tà. Mỗi đệ tử ngộ kiếm theo cách riêng.',
    philosophy: '"Tâm như kiếm, kiếm như tâm."',
    primaryElements: ['kim', 'phong'],
    joinRequirements: { levelMin: 5, minSpiritualRootMultiplier: 1.2 },
    signatureTechniques: ['Vô Tâm Kiếm Quyết', 'Phong Ngữ Trảm', 'Tâm Kiếm Hợp Nhất'],
  },
  {
    id: 'van_duoc_coc',
    name: 'Vạn Dược Cốc',
    alignment: 'trung',
    description: 'Cốc luyện đan nổi tiếng. Đệ tử chuyên trồng linh thảo, luyện đan dược, ít giao chiến.',
    philosophy: '"Đan đạo dưỡng sinh, sinh đạo dưỡng tâm."',
    primaryElements: ['moc', 'tho', 'thuy'],
    joinRequirements: { levelMin: 1, bannedElements: ['am'] },
    signatureTechniques: ['Linh Đan Bí Lục', 'Bách Thảo Tâm Đắc', 'Vạn Dược Quy Nguyên Thuật'],
  },
];

/**
 * Pool nhiệm vụ tông môn — random pick khi player vào SectHall.
 * Mỗi sect có pool riêng (tag bằng prefix sectId).
 */
export const SECT_MISSION_POOL: SectMission[] = [
  // ─── Thanh Vân Môn ───
  {
    id: 'tvm_gather_thao',
    sectId: 'thanh_van_mon',
    title: 'Hái Linh Tâm Thảo',
    kind: 'gathering',
    description: 'Hái 10 cây Linh Tâm Thảo ở Hậu Sơn Mật Lâm về cho Trưởng Lão Bách Y.',
    contributionReward: 30,
    currencyReward: 50,
    itemRewardName: 'Hồi Khí Đan',
    itemRewardRarity: 'Tốt',
    itemRewardCategory: 'Đan dược',
    resetType: 'daily',
  },
  {
    id: 'tvm_subjugate_lang',
    sectId: 'thanh_van_mon',
    title: 'Trừ Hắc Vụ Lang',
    kind: 'subjugation',
    description: 'Tiêu diệt 5 Hắc Vụ Lang đang quấy nhiễu dân trong trấn Lạc Vân.',
    contributionReward: 60,
    currencyReward: 100,
    resetType: 'daily',
  },
  {
    id: 'tvm_patrol',
    sectId: 'thanh_van_mon',
    title: 'Tuần Tra Sơn Mạch',
    kind: 'patrol',
    description: 'Tuần tra biên giới Thanh Vân Phong 1 vòng — đảm bảo không có tà tu xâm nhập.',
    contributionReward: 40,
    currencyReward: 60,
    resetType: 'daily',
    minRank: 'noi_mon',
  },

  // ─── Lạc Hồng Cung ───
  {
    id: 'lhc_delivery',
    sectId: 'lac_hong_cung',
    title: 'Đưa Lạc Hồng Lệnh',
    kind: 'delivery',
    description: 'Chuyển một mảnh ngọc bài đến chân nhân Đông Hải Thành. Không được hỏi nội dung.',
    contributionReward: 120,
    currencyReward: 200,
    itemRewardName: 'Lôi Văn Phù',
    itemRewardRarity: 'Cực Phẩm',
    itemRewardCategory: 'Tín vật',
    resetType: 'weekly',
    minRank: 'noi_mon',
  },
  {
    id: 'lhc_cultivation',
    sectId: 'lac_hong_cung',
    title: 'Bế Quan 7 Ngày',
    kind: 'cultivation',
    description: 'Vào bí thất bế quan tu luyện 7 ngày, ngộ lôi ý.',
    contributionReward: 200,
    currencyReward: 0,
    itemRewardName: 'Lôi Văn Đan',
    itemRewardRarity: 'Siêu Phẩm',
    itemRewardCategory: 'Đan dược',
    resetType: 'weekly',
    minRank: 'chan_truyen',
  },

  // ─── Huyết Sát Tông ───
  {
    id: 'hst_sat',
    sectId: 'huyet_sat_tong',
    title: 'Tế Huyết Sát Lục',
    kind: 'subjugation',
    description: 'Giết bất kỳ tu sĩ chính đạo nào để tế đại lệnh — càng cao cấp càng tốt.',
    contributionReward: 200,
    currencyReward: 300,
    resetType: 'weekly',
  },
  {
    id: 'hst_blood',
    sectId: 'huyet_sat_tong',
    title: 'Thu Thập Huyết Tinh',
    kind: 'gathering',
    description: 'Thu 20 viên Huyết Tinh từ yêu thú để tế Huyết Hà.',
    contributionReward: 80,
    currencyReward: 120,
    resetType: 'daily',
  },

  // ─── Kiếm Tâm Lâu ───
  {
    id: 'ktl_duel',
    sectId: 'kiem_tam_lau',
    title: 'Đấu Kiếm Sư Huynh',
    kind: 'cultivation',
    description: 'Đấu kiếm với một sư huynh cùng cấp. Thắng thua không quan trọng, chỉ ngộ ý.',
    contributionReward: 50,
    currencyReward: 80,
    resetType: 'daily',
  },
  {
    id: 'ktl_meditate',
    sectId: 'kiem_tam_lau',
    title: 'Ngộ Vô Tâm Kiếm',
    kind: 'cultivation',
    description: 'Ngồi thiền trước Vô Tâm Bia 1 ngày 1 đêm.',
    contributionReward: 100,
    currencyReward: 50,
    itemRewardName: 'Tử Tiêu Kiếm Phổ',
    itemRewardRarity: 'Hiếm',
    itemRewardCategory: 'Sách kỹ năng',
    resetType: 'weekly',
    minRank: 'noi_mon',
  },

  // ─── Vạn Dược Cốc ───
  {
    id: 'vdc_grow',
    sectId: 'van_duoc_coc',
    title: 'Trồng Linh Thảo',
    kind: 'cultivation',
    description: 'Chăm sóc dược viên 3 ngày — thu hoạch khi đến hạn.',
    contributionReward: 40,
    currencyReward: 60,
    itemRewardName: 'Linh Tâm Thảo',
    itemRewardRarity: 'Hiếm',
    itemRewardCategory: 'Nguyên liệu',
    resetType: 'daily',
  },
  {
    id: 'vdc_refine',
    sectId: 'van_duoc_coc',
    title: 'Luyện Đan Cho Khách',
    kind: 'delivery',
    description: 'Luyện 5 viên Hồi Khí Đan đặt cho khách quý.',
    contributionReward: 80,
    currencyReward: 200,
    resetType: 'weekly',
    minRank: 'noi_mon',
  },
];

/**
 * Tàng kinh các shop — items có thể đổi bằng contribution.
 * Mỗi sect có catalog riêng.
 */
export const TANG_KINH_CATALOG: TangKinhItem[] = [
  // ─── Thanh Vân Môn ───
  { id: 'tvm_s1', sectId: 'thanh_van_mon', itemName: 'Hồi Khí Đan', itemRarity: 'Tốt', itemCategory: 'Đan dược', cost: 50, minRank: 'ngoai_mon' },
  { id: 'tvm_s2', sectId: 'thanh_van_mon', itemName: 'Thanh Mộc Kiếm', itemRarity: 'Hiếm', itemCategory: 'Vũ khí', cost: 300, minRank: 'noi_mon' },
  { id: 'tvm_s3', sectId: 'thanh_van_mon', itemName: 'Hồn Nguyên Trường Sinh Quyết', itemRarity: 'Cực Phẩm', itemCategory: 'Sách kỹ năng', cost: 1500, minRank: 'noi_mon' },
  { id: 'tvm_s4', sectId: 'thanh_van_mon', itemName: 'Bích Thủy Hộ Tâm Giáp', itemRarity: 'Siêu Phẩm', itemCategory: 'Thân', cost: 5000, minRank: 'chan_truyen' },

  // ─── Lạc Hồng Cung ───
  { id: 'lhc_s1', sectId: 'lac_hong_cung', itemName: 'Lôi Đan', itemRarity: 'Hiếm', itemCategory: 'Đan dược', cost: 100, minRank: 'ngoai_mon' },
  { id: 'lhc_s2', sectId: 'lac_hong_cung', itemName: 'Lôi Văn Phù', itemRarity: 'Cực Phẩm', itemCategory: 'Tín vật', cost: 800, minRank: 'noi_mon' },
  { id: 'lhc_s3', sectId: 'lac_hong_cung', itemName: 'Tử Tiêu Lôi Kiếm', itemRarity: 'Huyền Thoại', itemCategory: 'Vũ khí', cost: 10000, minRank: 'chan_truyen' },

  // ─── Huyết Sát Tông ───
  { id: 'hst_s1', sectId: 'huyet_sat_tong', itemName: 'Huyết Đan', itemRarity: 'Hiếm', itemCategory: 'Đan dược', cost: 80, minRank: 'ngoai_mon' },
  { id: 'hst_s2', sectId: 'huyet_sat_tong', itemName: 'Sát Khí Hộ Phù', itemRarity: 'Cực Phẩm', itemCategory: 'Tín vật', cost: 600, minRank: 'noi_mon' },
  { id: 'hst_s3', sectId: 'huyet_sat_tong', itemName: 'Huyết Hà Ma Công', itemRarity: 'Siêu Phẩm', itemCategory: 'Sách kỹ năng', cost: 3000, minRank: 'noi_mon' },

  // ─── Kiếm Tâm Lâu ───
  { id: 'ktl_s1', sectId: 'kiem_tam_lau', itemName: 'Tinh Thần Đan', itemRarity: 'Tốt', itemCategory: 'Đan dược', cost: 40, minRank: 'ngoai_mon' },
  { id: 'ktl_s2', sectId: 'kiem_tam_lau', itemName: 'Phong Ngữ Trảm', itemRarity: 'Cực Phẩm', itemCategory: 'Sách kỹ năng', cost: 1200, minRank: 'noi_mon' },
  { id: 'ktl_s3', sectId: 'kiem_tam_lau', itemName: 'Vô Tâm Kiếm', itemRarity: 'Huyền Thoại', itemCategory: 'Vũ khí', cost: 12000, minRank: 'chan_truyen' },

  // ─── Vạn Dược Cốc ───
  { id: 'vdc_s1', sectId: 'van_duoc_coc', itemName: 'Linh Tâm Thảo', itemRarity: 'Hiếm', itemCategory: 'Nguyên liệu', cost: 60, minRank: 'ngoai_mon' },
  { id: 'vdc_s2', sectId: 'van_duoc_coc', itemName: 'Bách Thảo Đan Lò', itemRarity: 'Siêu Phẩm', itemCategory: 'Dị thường', cost: 4000, minRank: 'chan_truyen' },
];

export const getSect = (id: string): Sect | undefined => DEFAULT_SECTS.find((s) => s.id === id);
export const getMissionsForSect = (sectId: string): SectMission[] => SECT_MISSION_POOL.filter((m) => m.sectId === sectId);
export const getTangKinhForSect = (sectId: string): TangKinhItem[] => TANG_KINH_CATALOG.filter((i) => i.sectId === sectId);

import type { Location, Faction } from '@gametypes/world';

/**
 * Default world cho game mới — 10 location, edges nối thành graph.
 * Player starts at 'thanh_van_phong' (Thanh Vân Môn — sect đệ tử ngoại môn).
 *
 * Coordinates (x, y) trong SVG viewBox 1000×700 — dùng cho WorldMapScreen.
 * Mỗi location có:
 *   - levelRange: gợi ý độ nguy hiểm
 *   - neighbors: id của location kết nối (graph edges, undirected)
 *   - travelCost: số giờ trong-game để đi đến từ neighbor
 */

export interface MapLocation extends Location {
  x: number;
  y: number;
}

export const DEFAULT_LOCATIONS: MapLocation[] = [
  {
    id: 'thanh_van_phong',
    name: 'Thanh Vân Phong',
    type: 'sect',
    description: 'Đỉnh tu luyện của Thanh Vân Môn — chính đạo tông môn lớn nhất Đông Hải Châu.',
    levelRange: [1, 15],
    factionId: 'thanh_van_mon',
    visitedByPlayer: true,
    discoveredByPlayer: true,
    neighbors: ['lac_van_tran', 'hau_son_mat_lam'],
    travelCost: 2,
    x: 200,
    y: 200,
  },
  {
    id: 'lac_van_tran',
    name: 'Trấn Lạc Vân',
    type: 'city',
    description: 'Trấn nhỏ dưới chân Thanh Vân Phong. Có Lưu Hương Cốc nổi danh về đan dược.',
    levelRange: [1, 8],
    discoveredByPlayer: true,
    neighbors: ['thanh_van_phong', 'than_lam_dao_co', 'dong_hai_thanh'],
    travelCost: 4,
    x: 380,
    y: 280,
  },
  {
    id: 'hau_son_mat_lam',
    name: 'Hậu Sơn Mật Lâm',
    type: 'wilderness',
    description: 'Khu rừng phía sau Thanh Vân Môn, có Hắc Vụ Lang và yêu thú cấp thấp.',
    levelRange: [2, 10],
    discoveredByPlayer: true,
    neighbors: ['thanh_van_phong', 'huyen_thien_dong'],
    travelCost: 3,
    x: 100,
    y: 360,
  },
  {
    id: 'than_lam_dao_co',
    name: 'Thần Lâm Đảo Cổ',
    type: 'ruins',
    description: 'Phế tích cổ trên một hòn đảo nhỏ. Truyền thuyết kể có cao thủ tiền nhân chôn vùi pháp bảo.',
    levelRange: [8, 20],
    neighbors: ['lac_van_tran', 'dong_hai_thanh', 'bich_huyet_uyen'],
    travelCost: 8,
    x: 540,
    y: 180,
  },
  {
    id: 'dong_hai_thanh',
    name: 'Đông Hải Thành',
    type: 'city',
    description: 'Đại thành ven biển — chợ đan dược lớn nhất vùng, hội tụ tu sĩ tứ phương.',
    levelRange: [5, 25],
    factionId: 'dong_hai_lien_minh',
    neighbors: ['lac_van_tran', 'than_lam_dao_co', 'lac_hong_cung', 'kim_long_son'],
    travelCost: 10,
    x: 600,
    y: 400,
  },
  {
    id: 'huyen_thien_dong',
    name: 'Huyền Thiên Động',
    type: 'cave_abode',
    description: 'Động phủ tu luyện vô chủ, linh khí phong phú. Có thể chiếm cứ.',
    levelRange: [3, 12],
    neighbors: ['hau_son_mat_lam', 'kim_long_son'],
    travelCost: 6,
    x: 200,
    y: 500,
  },
  {
    id: 'kim_long_son',
    name: 'Kim Long Sơn',
    type: 'mountain',
    description: 'Sơn mạch hùng vĩ, có Kim Long tinh thạch trong lòng đất.',
    levelRange: [10, 25],
    neighbors: ['huyen_thien_dong', 'dong_hai_thanh', 'thien_lam_bich_canh'],
    travelCost: 8,
    x: 380,
    y: 540,
  },
  {
    id: 'bich_huyet_uyen',
    name: 'Bích Huyết Uyên',
    type: 'wilderness',
    description: 'Đáy vực huyết âm khí, ma đạo tu sĩ thường lui tới luyện ma công.',
    levelRange: [15, 30],
    neighbors: ['than_lam_dao_co', 'lac_hong_cung'],
    travelCost: 12,
    x: 720,
    y: 200,
  },
  {
    id: 'lac_hong_cung',
    name: 'Lạc Hồng Cung',
    type: 'sect',
    description: 'Cung điện huyền bí của Lạc gia, ít người biết bên trong là chính hay tà.',
    levelRange: [15, 35],
    factionId: 'lac_hong_cung',
    neighbors: ['dong_hai_thanh', 'bich_huyet_uyen', 'thien_lam_bich_canh'],
    travelCost: 14,
    x: 820,
    y: 420,
  },
  {
    id: 'thien_lam_bich_canh',
    name: 'Thiên Lâm Bí Cảnh',
    type: 'secret_realm',
    description: 'Bí cảnh mở mỗi 60 năm — chỉ tu sĩ Trúc Cơ trở lên mới chịu nổi linh áp.',
    levelRange: [20, 40],
    neighbors: ['kim_long_son', 'lac_hong_cung'],
    travelCost: 18,
    x: 600,
    y: 600,
  },

  // ═══════════════════════════════════════════════════════════
  // Phase 7.5 expansion — 20 locations mới (10→30 total)
  // ═══════════════════════════════════════════════════════════
  // Bản đồ extend: vùng Bắc + Tây + Nam của Đông Hải Châu
  { id: 'phong_van_son', name: 'Phong Vân Sơn', type: 'sect', description: 'Sơn trang ẩn cư của Phong Vân Sơn Trang, chuyên khinh công + ám khí.', levelRange: [5, 25], factionId: 'phong_van_son_trang', neighbors: ['lac_van_tran', 'tay_lam_dao_co'], travelCost: 6, x: 500, y: 180 },
  { id: 'tay_lam_dao_co', name: 'Tây Lâm Đảo Cổ', type: 'wilderness', description: 'Rừng cổ phía tây, có nhiều yêu thú phong hệ.', levelRange: [8, 22], neighbors: ['phong_van_son', 'hoa_diem_son'], travelCost: 5, x: 480, y: 80 },
  { id: 'hoa_diem_son', name: 'Hỏa Diễm Sơn', type: 'mountain', description: 'Núi lửa cao 9 ngàn trượng. Hỏa Diễm Tông trú trên đỉnh.', levelRange: [15, 35], factionId: 'hoa_diem_tong', neighbors: ['tay_lam_dao_co', 'thuy_nguyet_dao'], travelCost: 10, x: 380, y: 20 },
  { id: 'thuy_nguyet_dao', name: 'Thủy Nguyệt Đảo', type: 'sect', description: 'Đảo trên Đông Hải, tông môn Thủy Nguyệt Đảo. Đệ tử nữ.', levelRange: [10, 28], factionId: 'thuy_nguyet_dao', neighbors: ['hoa_diem_son', 'dong_hai_thanh'], travelCost: 12, x: 280, y: 50 },
  { id: 'thien_co_cac_thap', name: 'Thiên Cơ Các Tháp', type: 'sect', description: 'Tháp trận pháp 9 tầng — Thiên Cơ Các.', levelRange: [12, 30], factionId: 'thien_co_cac', neighbors: ['than_lam_dao_co'], travelCost: 8, x: 620, y: 380 },
  { id: 'bich_huyet_uyen_dam', name: 'Bích Huyết Uyên', type: 'special', description: 'Uyên trại ma đạo Bích Huyết Uyên. Khí độc dày đặc.', levelRange: [18, 40], factionId: 'bich_huyet_uyen', neighbors: ['huyen_thien_dong', 'tu_than_co_phong'], travelCost: 14, x: 50, y: 600 },
  { id: 'thien_long_tu_chua', name: 'Thiên Long Tự', type: 'sect', description: 'Phật tự cổ xưa trên núi Thiên Long. Hòa thượng tu kim cương bất hoại.', levelRange: [5, 20], factionId: 'thien_long_tu', neighbors: ['hau_son_mat_lam', 'ngoc_son'], travelCost: 7, x: 80, y: 480 },
  { id: 'ngoc_son', name: 'Ngọc Sơn', type: 'mountain', description: 'Núi ngọc bích, nhiều khoáng linh thạch. Thợ rèn pháp khí tới đây kiếm vật liệu.', levelRange: [12, 28], neighbors: ['thien_long_tu_chua', 'kim_long_son'], travelCost: 9, x: 200, y: 540 },
  { id: 'tho_phong_son_trang_dia', name: 'Thổ Phong Sơn Trang', type: 'sect', description: 'Sơn trang thổ hệ phòng ngự bất diệt.', levelRange: [3, 18], factionId: 'tho_phong_son', neighbors: ['lac_van_tran', 'thien_kiem_phong_dinh'], travelCost: 5, x: 320, y: 380 },
  { id: 'thien_kiem_phong_dinh', name: 'Thiên Kiếm Phong', type: 'sect', description: 'Đỉnh Thiên Kiếm — nơi cao thủ kiếm đạo tu hành.', levelRange: [15, 40], factionId: 'thien_kiem_phong', neighbors: ['tho_phong_son_trang_dia', 'kim_long_son'], travelCost: 10, x: 420, y: 460 },
  { id: 'huyen_yin_mon_co', name: 'Huyền Âm Môn Cốc', type: 'sect', description: 'Hắc Sơn cốc của ma môn Huyền Âm — nuôi vạn quỷ làm vũ khí.', levelRange: [25, 50], factionId: 'huyen_yin_mon', neighbors: ['bich_huyet_uyen_dam', 'tu_than_co_phong'], travelCost: 15, x: 60, y: 700 },
  { id: 'tu_than_co_phong', name: 'Tử Thần Cổ Phong', type: 'ruins', description: 'Phế tích cổ — tử thần linh khí dày đặc.', levelRange: [30, 55], neighbors: ['bich_huyet_uyen_dam', 'huyen_yin_mon_co'], travelCost: 16, x: 150, y: 700 },
  { id: 'huyen_thien_co_phai_cu', name: 'Huyền Thiên Cổ Phái', type: 'sect', description: 'Cổ phái mất tích vạn năm — chỉ đệ tử huyết mạch cổ xưa mới tìm thấy.', levelRange: [50, 80], factionId: 'huyen_thien_co_phai', neighbors: ['cuu_long_dao'], travelCost: 30, x: 800, y: 100 },
  { id: 'cuu_long_dao', name: 'Cửu Long Đảo', type: 'secret_realm', description: 'Đảo linh long ở Bắc Hải — long tộc ngàn năm trầm tích.', levelRange: [45, 75], neighbors: ['huyen_thien_co_phai_cu', 'dong_hai_thanh'], travelCost: 25, x: 700, y: 100 },
  { id: 'mau_co_phong', name: 'Mẫu Cổ Phong', type: 'mountain', description: 'Đỉnh mẫu cổ — nơi hợp khí thiên địa, tu sĩ thường tới ngộ đạo.', levelRange: [20, 45], neighbors: ['kim_long_son', 'thien_kiem_phong_dinh'], travelCost: 12, x: 580, y: 520 },
  { id: 'hac_son_dia_vuc', name: 'Hắc Sơn Địa Vực', type: 'wilderness', description: 'Vùng sơn đen hoang vu, nhiều yêu thú âm hệ.', levelRange: [22, 45], neighbors: ['huyen_yin_mon_co', 'tu_than_co_phong'], travelCost: 11, x: 200, y: 660 },
  { id: 'thuy_giao_uyen', name: 'Thủy Giao Uyên', type: 'secret_realm', description: 'Uyên long ẩn cư — bí cảnh thủy hệ.', levelRange: [25, 50], neighbors: ['dong_hai_thanh', 'thuy_nguyet_dao'], travelCost: 18, x: 200, y: 130 },
  { id: 'phi_thang_dai', name: 'Phi Thăng Đài', type: 'special', description: 'Đài phi thăng cổ xưa — nơi đại tu sĩ phi thăng tiên giới. Khí cơ kinh người.', levelRange: [70, 99], neighbors: ['mau_co_phong', 'huyen_thien_co_phai_cu'], travelCost: 30, x: 750, y: 380 },
  { id: 'van_co_chien_truong', name: 'Vạn Cổ Chiến Trường', type: 'ruins', description: 'Chiến trường cổ ngàn vạn năm — vũ khí + linh hồn rớt khắp nơi.', levelRange: [40, 70], neighbors: ['phi_thang_dai', 'cuu_long_dao'], travelCost: 22, x: 850, y: 250 },
  { id: 'tinh_van_son_trang', name: 'Tinh Vân Sơn Trang', type: 'wilderness', description: 'Sơn trang ven biển có vạn dược hoa nở quanh năm.', levelRange: [5, 22], neighbors: ['dong_hai_thanh', 'lac_van_tran'], travelCost: 6, x: 480, y: 280 },
];

export const DEFAULT_FACTIONS: Faction[] = [
  {
    id: 'thanh_van_mon',
    name: 'Thanh Vân Môn',
    type: 'sect',
    description: 'Chính đạo tông môn lớn nhất Đông Hải Châu. Tu pháp Hồn Nguyên Trường Sinh Quyết.',
  },
  {
    id: 'dong_hai_lien_minh',
    name: 'Đông Hải Liên Minh',
    type: 'nation',
    description: 'Liên minh thương nhân kiểm soát đại đa số kinh tế ven biển.',
  },
  {
    id: 'lac_hong_cung',
    name: 'Lạc Hồng Cung',
    type: 'sect',
    description: 'Tông môn thần bí, không rõ chính tà.',
  },
];

/** Helper: lấy location by id */
export const getLocation = (id: string): MapLocation | undefined =>
  DEFAULT_LOCATIONS.find((l) => l.id === id);

/** Helper: kiểm tra 2 location có kề nhau không */
export const areNeighbors = (a: string, b: string): boolean => {
  const la = getLocation(a);
  return !!la && la.neighbors.includes(b);
};

/** BFS path shortest từ A đến B (nếu cần auto-route) */
export const findPath = (fromId: string, toId: string): string[] | null => {
  if (fromId === toId) return [fromId];
  const visited = new Set<string>([fromId]);
  const queue: Array<{ id: string; path: string[] }> = [{ id: fromId, path: [fromId] }];
  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    const loc = getLocation(id);
    if (!loc) continue;
    for (const n of loc.neighbors) {
      if (visited.has(n)) continue;
      const newPath = [...path, n];
      if (n === toId) return newPath;
      visited.add(n);
      queue.push({ id: n, path: newPath });
    }
  }
  return null;
};

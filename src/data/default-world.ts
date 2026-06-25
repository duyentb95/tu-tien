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

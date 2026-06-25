import type { SecretRealmInstance, SRRoom, RoomKind } from '@gametypes/secret-realm';

/**
 * Sinh bí cảnh dạng path linear với optional branch.
 * Layout: entry → 3-6 corridor rooms → boss. Mỗi corridor có 30% chance branch sang treasure/shrine.
 *
 * Pure function — `rng` injectable cho test.
 */

interface GenOptions {
  level: number;        // cấp player → scale enemy + loot
  name?: string;
  ttlTurns?: number;
  rng?: () => number;
}

const ROOM_NAMES: Record<RoomKind, string[]> = {
  entry: ['Cửa Vào', 'Thạch Môn', 'Lối Vào Bí Cảnh'],
  combat: ['Sảnh Yêu Thú', 'Đại Sảnh Tàn Tích', 'Hành Lang U Tối', 'Hỏa Linh Cốc', 'Băng Phong Đường'],
  treasure: ['Tàng Bảo Thất', 'Cửa Hàng Vô Chủ', 'Cốc Bảo Khí', 'Mật Thất Cổ Vật'],
  trap: ['Vạn Tiễn Trận', 'Lửa Diệt Trận', 'Hầm Băng Tuyết', 'Hành Lang Độc'],
  shrine: ['Bia Cổ Tu Linh', 'Đan Đài Ngộ Đạo', 'Suối Linh Khí', 'Thạch Tâm Đài'],
  puzzle: ['Trận Đồ Bát Quái', 'Mê Cung Phù Văn', 'Bàn Cờ Thiên Cơ'],
  boss: ['Bảo Khố Yêu Vương', 'Đại Sảnh Tổ Sư', 'Đỉnh Trận Pháp', 'Tâm Tạng Bí Cảnh'],
};

const ENEMY_NAMES = ['Cổ Tu Sĩ', 'Yêu Tu Hắc Phong', 'Tà Linh Tỷ Quái', 'Cổ Thi Tướng Quân', 'Huyết Yêu', 'Thanh Sa Quỷ'];
const BOSS_NAMES = ['Cổ Yêu Vương', 'Phế Tổ Đại Năng', 'Hắc Mộ Chân Quân', 'Vạn Sa Ma Tôn'];
const TREASURE_ITEMS: Array<{ name: string; rarity: string; category: string }> = [
  { name: 'Tinh Linh Đan', rarity: 'Hiếm', category: 'Đan dược' },
  { name: 'Cổ Văn Phù', rarity: 'Cực Phẩm', category: 'Tín vật' },
  { name: 'Thanh Quang Kiếm', rarity: 'Cực Phẩm', category: 'Vũ khí' },
  { name: 'Vô Tự Thiên Thư', rarity: 'Siêu Phẩm', category: 'Sách kỹ năng' },
  { name: 'Huyền Băng Tâm', rarity: 'Siêu Phẩm', category: 'Nguyên liệu' },
];
const BOSS_LOOT: Array<{ name: string; rarity: string; category: string }> = [
  { name: 'Cổ Yêu Nội Đan', rarity: 'Siêu Phẩm', category: 'Nguyên liệu' },
  { name: 'Tử Tiêu Lôi Kiếm', rarity: 'Huyền Thoại', category: 'Vũ khí' },
  { name: 'Cửu Chuyển Hồi Sinh Đan', rarity: 'Huyền Thoại', category: 'Đan dược' },
];

const pick = <T>(arr: T[], rng: () => number): T => arr[Math.floor(rng() * arr.length)]!;

const makeRoom = (
  id: string,
  kind: RoomKind,
  level: number,
  x: number,
  y: number,
  rng: () => number,
): SRRoom => {
  const name = pick(ROOM_NAMES[kind], rng);
  let payload: SRRoom['payload'];
  let description = '';

  switch (kind) {
    case 'entry':
      description = 'Cánh cửa cổ vừa mở. Linh khí âm u tỏa ra từ bên trong.';
      break;
    case 'combat': {
      const enemyLevel = Math.max(1, level + Math.floor(rng() * 5) - 2);
      payload = { enemyName: pick(ENEMY_NAMES, rng), enemyLevel };
      description = `Một ${payload.enemyName} đang đứng canh, ánh mắt sát khí ngút trời.`;
      break;
    }
    case 'treasure': {
      const lootCount = 1 + Math.floor(rng() * 2);
      payload = {
        lootItems: Array.from({ length: lootCount }, () => pick(TREASURE_ITEMS, rng)),
        currencyReward: Math.round(50 * level * (0.8 + rng() * 0.8)),
      };
      description = 'Một rương cổ phủ bụi. Bên trong tỏa ra hơi thở của bảo vật.';
      break;
    }
    case 'trap':
      payload = { trapHpLoss: Math.round(level * 25 * (0.7 + rng() * 0.6)) };
      description = 'Sàn nhà có hoa văn lạ. Cẩn thận, có vẻ là cơ quan!';
      break;
    case 'shrine': {
      const stats: Array<'atk' | 'def' | 'spd' | 'hp'> = ['atk', 'def', 'spd', 'hp'];
      const stat = pick(stats, rng);
      payload = {
        shrineBuff: { stat, amount: stat === 'hp' ? 20 : 3 },
        expReward: Math.round(30 * level),
      };
      description = 'Một bia đá khắc văn cổ. Chạm vào có cảm giác linh hồn được tẩy gội.';
      break;
    }
    case 'puzzle':
      description = 'Một trận đồ phức tạp. Phải tìm cách giải mới đi tiếp được.';
      payload = { expReward: Math.round(50 * level), currencyReward: Math.round(30 * level) };
      break;
    case 'boss': {
      const enemyLevel = level + 3;
      payload = { enemyName: pick(BOSS_NAMES, rng), enemyLevel };
      description = `${payload.enemyName} ngự trên cao, áp lực kinh người. Đây là trận quyết định.`;
      break;
    }
  }

  return {
    id,
    kind,
    name,
    description,
    visited: kind === 'entry',
    cleared: kind === 'entry',
    x,
    y,
    neighbors: [],
    ...(payload ? { payload } : {}),
  };
};

const link = (a: SRRoom, b: SRRoom) => {
  if (!a.neighbors.includes(b.id)) a.neighbors.push(b.id);
  if (!b.neighbors.includes(a.id)) b.neighbors.push(a.id);
};

export const generateSecretRealm = (opts: GenOptions): SecretRealmInstance => {
  const rng = opts.rng ?? Math.random;
  const level = opts.level;

  // Layout: 5-9 corridor rooms từ entry → boss; rng quyết định branch
  const corridorCount = 4 + Math.floor(rng() * 4); // 4-7 corridor + 1 entry + 1 boss = 6-9 rooms
  const rooms: Record<string, SRRoom> = {};

  const entryId = 'r_entry';
  const bossId = 'r_boss';

  // Entry tại x=80
  const entry = makeRoom(entryId, 'entry', level, 80, 200, rng);
  rooms[entryId] = entry;

  // Corridor rooms
  let prevId = entryId;
  for (let i = 0; i < corridorCount; i++) {
    const id = `r_${i}`;
    // Random kind weighted: combat 50%, treasure 20%, trap 15%, shrine 10%, puzzle 5%
    const r = rng();
    const kind: RoomKind =
      r < 0.5 ? 'combat' : r < 0.7 ? 'treasure' : r < 0.85 ? 'trap' : r < 0.95 ? 'shrine' : 'puzzle';
    const x = 80 + (i + 1) * 110;
    const y = 200 + (i % 2 === 0 ? -50 : 50) * Math.sin(i);
    const room = makeRoom(id, kind, level, x, y, rng);
    rooms[id] = room;
    link(rooms[prevId]!, room);

    // 25% chance branch sang treasure phòng kế bên
    if (rng() < 0.25 && i > 0) {
      const branchId = `r_${i}b`;
      const branch = makeRoom(branchId, rng() < 0.6 ? 'treasure' : 'shrine', level, x, y + 110, rng);
      rooms[branchId] = branch;
      link(room, branch);
    }

    prevId = id;
  }

  // Boss room cuối
  const boss = makeRoom(bossId, 'boss', level, 80 + (corridorCount + 1) * 110, 200, rng);
  rooms[bossId] = boss;
  link(rooms[prevId]!, boss);

  return {
    id: crypto.randomUUID(),
    name: opts.name ?? 'Bí Cảnh Vô Danh',
    level,
    rooms,
    entryRoomId: entryId,
    bossRoomId: bossId,
    currentRoomId: entryId,
    createdAtTurn: 0,
    ttlTurns: opts.ttlTurns ?? 720, // ~30 ngày game (24 turn/ngày)
    clearReward: {
      exp: Math.round(500 * level),
      currency: Math.round(200 * level),
      ...(rng() < 0.6 ? pick(BOSS_LOOT, rng) : {}),
    } as SecretRealmInstance['clearReward'],
  };
};

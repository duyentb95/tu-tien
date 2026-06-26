/**
 * Achievement & Daily Mission system — retention loop.
 *
 * Achievement: 1-lần, milestone trong tu tiên (đột phá lần đầu, thu phục linh thú đầu...).
 * Daily mission: reset 24h, khuyến khích chơi đều (tu luyện 3 lần, hoàn 1 quest...).
 *
 * Reward: linh thạch + EP + đôi khi item hiếm.
 */

export type AchievementCategory = 'cultivation' | 'combat' | 'society' | 'exploration' | 'collection';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  /** Reward khi unlock */
  reward: { currency?: number; ep?: number; itemName?: string };
  /** Tier — bronze/silver/gold ảnh hưởng UI + reward magnitude */
  tier: 'bronze' | 'silver' | 'gold' | 'legendary';
  /** Trigger condition — kind + threshold. Empty kind = manual unlock */
  trigger?: {
    kind: 'first_realm_break' | 'realm_count' | 'first_kill' | 'kill_count'
        | 'first_beast_capture' | 'beast_count' | 'first_dao_lu' | 'sect_joined'
        | 'first_quest' | 'quest_count' | 'first_tribulation' | 'tribulation_count'
        | 'currency_total' | 'ep_total' | 'location_count' | 'turn_count'
        | 'item_legendary';
    threshold?: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // ─── Cultivation ───
  {
    id: 'first_break', category: 'cultivation', tier: 'bronze',
    title: 'Tiểu Đột Phá', description: 'Đột phá lần đầu lên cấp 2',
    icon: '⚡', reward: { currency: 100, ep: 20 },
    trigger: { kind: 'first_realm_break' },
  },
  {
    id: 'realm_10', category: 'cultivation', tier: 'silver',
    title: 'Trúc Cơ Chi Tiền', description: 'Đạt cấp 10 (gần đột phá đại cảnh)',
    icon: '✦', reward: { currency: 500, ep: 50 },
    trigger: { kind: 'realm_count', threshold: 10 },
  },
  {
    id: 'realm_20', category: 'cultivation', tier: 'gold',
    title: 'Kim Đan Chi Cảnh', description: 'Đạt cấp 20 — bước vào Kim Đan',
    icon: '☉', reward: { currency: 2000, ep: 100 },
    trigger: { kind: 'realm_count', threshold: 20 },
  },
  {
    id: 'first_tribu', category: 'cultivation', tier: 'silver',
    title: 'Lần Đầu Độ Kiếp', description: 'Vượt qua thiên kiếp lần đầu',
    icon: '🌩', reward: { currency: 1000, ep: 80, itemName: 'Hộ Mệnh Phù' },
    trigger: { kind: 'first_tribulation' },
  },
  {
    id: 'tribu_3', category: 'cultivation', tier: 'gold',
    title: 'Tam Kiếp Bất Diệt', description: 'Vượt qua 3 lần thiên kiếp',
    icon: '🌩', reward: { currency: 5000, ep: 200 },
    trigger: { kind: 'tribulation_count', threshold: 3 },
  },

  // ─── Combat ───
  {
    id: 'first_kill', category: 'combat', tier: 'bronze',
    title: 'Sơ Khai Sát Giới', description: 'Tiêu diệt kẻ địch đầu tiên',
    icon: '⚔', reward: { currency: 50, ep: 10 },
    trigger: { kind: 'first_kill' },
  },
  {
    id: 'kill_50', category: 'combat', tier: 'silver',
    title: 'Tiểu Sát Tinh', description: 'Diệt 50 kẻ địch',
    icon: '⚔', reward: { currency: 500, ep: 40 },
    trigger: { kind: 'kill_count', threshold: 50 },
  },
  {
    id: 'kill_200', category: 'combat', tier: 'gold',
    title: 'Bá Đạo Vô Song', description: 'Diệt 200 kẻ địch',
    icon: '⚔', reward: { currency: 3000, ep: 150 },
    trigger: { kind: 'kill_count', threshold: 200 },
  },

  // ─── Society ───
  {
    id: 'sect_in', category: 'society', tier: 'bronze',
    title: 'Nhập Môn Đệ Tử', description: 'Gia nhập 1 tông môn',
    icon: '◈', reward: { currency: 200, ep: 30 },
    trigger: { kind: 'sect_joined' },
  },
  {
    id: 'first_dao_lu', category: 'society', tier: 'silver',
    title: 'Kết Tóc Đạo Lữ', description: 'Kết đạo lữ với 1 NPC',
    icon: '♥', reward: { currency: 1000, ep: 80 },
    trigger: { kind: 'first_dao_lu' },
  },

  // ─── Exploration ───
  {
    id: 'first_quest', category: 'exploration', tier: 'bronze',
    title: 'Hành Trình Khởi Đầu', description: 'Hoàn thành quest đầu tiên',
    icon: '◇', reward: { currency: 100, ep: 20 },
    trigger: { kind: 'first_quest' },
  },
  {
    id: 'quest_10', category: 'exploration', tier: 'silver',
    title: 'Đại Hiệp Sĩ', description: 'Hoàn thành 10 quest',
    icon: '◇', reward: { currency: 800, ep: 60 },
    trigger: { kind: 'quest_count', threshold: 10 },
  },
  {
    id: 'location_10', category: 'exploration', tier: 'silver',
    title: 'Vạn Lý Phi Hành', description: 'Khám phá 10 địa danh',
    icon: '◉', reward: { currency: 600, ep: 50 },
    trigger: { kind: 'location_count', threshold: 10 },
  },
  {
    id: 'turn_100', category: 'exploration', tier: 'bronze',
    title: 'Trăm Lượt Tu Hành', description: 'Chơi đủ 100 lượt',
    icon: '◑', reward: { currency: 300, ep: 30 },
    trigger: { kind: 'turn_count', threshold: 100 },
  },
  {
    id: 'turn_500', category: 'exploration', tier: 'gold',
    title: 'Trường Cửu Tu Sĩ', description: 'Chơi đủ 500 lượt',
    icon: '◑', reward: { currency: 3000, ep: 200 },
    trigger: { kind: 'turn_count', threshold: 500 },
  },

  // ─── Collection ───
  {
    id: 'first_beast', category: 'collection', tier: 'bronze',
    title: 'Khế Ước Đầu Tiên', description: 'Khế ước linh thú đầu tiên',
    icon: '☘', reward: { currency: 200, ep: 30 },
    trigger: { kind: 'first_beast_capture' },
  },
  {
    id: 'beast_5', category: 'collection', tier: 'silver',
    title: 'Vạn Thú Sư', description: 'Khế ước 5 linh thú',
    icon: '☘', reward: { currency: 1500, ep: 100 },
    trigger: { kind: 'beast_count', threshold: 5 },
  },
  {
    id: 'currency_10k', category: 'collection', tier: 'silver',
    title: 'Tiểu Phú', description: 'Tích lũy 10,000 linh thạch',
    icon: '◆', reward: { currency: 500, ep: 50 },
    trigger: { kind: 'currency_total', threshold: 10000 },
  },
  {
    id: 'currency_100k', category: 'collection', tier: 'gold',
    title: 'Triệu Phú Tu Sĩ', description: 'Tích lũy 100,000 linh thạch',
    icon: '◆', reward: { currency: 5000, ep: 200 },
    trigger: { kind: 'currency_total', threshold: 100000 },
  },
  {
    id: 'legendary_item', category: 'collection', tier: 'legendary',
    title: 'Truyền Thuyết Trong Tay', description: 'Nhận 1 vật phẩm Huyền Thoại',
    icon: '☆', reward: { currency: 5000, ep: 300, itemName: 'Tinh Hoa Tinh Thạch ×3' },
    trigger: { kind: 'item_legendary' },
  },
];

// ─────────────────────────────────────────────────────────────
// Daily missions — reset 24h
// ─────────────────────────────────────────────────────────────

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: { currency: number; ep: number };
  /** Progress goal */
  goal: number;
  /** Counter kind — track qua state */
  counterKind: 'turns_played' | 'enemies_killed' | 'quests_completed' | 'tu_luyen' | 'locations_visited';
}

export const DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'daily_turns_10',
    title: 'Tu Hành Cần Mẫn',
    description: 'Chơi 10 lượt hôm nay',
    icon: '◑',
    reward: { currency: 100, ep: 15 },
    goal: 10,
    counterKind: 'turns_played',
  },
  {
    id: 'daily_kill_3',
    title: 'Diệt Trừ Yêu Quái',
    description: 'Tiêu diệt 3 kẻ địch',
    icon: '⚔',
    reward: { currency: 150, ep: 20 },
    goal: 3,
    counterKind: 'enemies_killed',
  },
  {
    id: 'daily_quest_1',
    title: 'Hoàn Quest Hôm Nay',
    description: 'Hoàn thành 1 nhiệm vụ bất kỳ',
    icon: '◇',
    reward: { currency: 200, ep: 25 },
    goal: 1,
    counterKind: 'quests_completed',
  },
  {
    id: 'daily_tu_luyen_2',
    title: 'Bế Quan Tu Luyện',
    description: 'Tu luyện 2 lần (action có chữ "tu luyện")',
    icon: '◐',
    reward: { currency: 100, ep: 15 },
    goal: 2,
    counterKind: 'tu_luyen',
  },
  {
    id: 'daily_explore_2',
    title: 'Vạn Lý Hành Trình',
    description: 'Đến 2 địa danh mới',
    icon: '◉',
    reward: { currency: 120, ep: 18 },
    goal: 2,
    counterKind: 'locations_visited',
  },
];

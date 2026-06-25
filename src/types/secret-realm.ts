export type RoomKind = 'entry' | 'combat' | 'treasure' | 'trap' | 'shrine' | 'puzzle' | 'boss';

export interface SRRoom {
  id: string;
  kind: RoomKind;
  /** Tên hiển thị */
  name: string;
  /** Mô tả ngắn */
  description: string;
  /** Đã visit / cleared chưa */
  visited: boolean;
  cleared: boolean;
  /** Index trong layout — for SVG positioning */
  x: number;
  y: number;
  neighbors: string[];
  /** Combat: enemy name + level. Treasure: loot. Trap: hp loss. Shrine: buff. */
  payload?: {
    enemyName?: string;
    enemyLevel?: number;
    lootItems?: Array<{ name: string; rarity: string; category: string }>;
    trapHpLoss?: number;
    shrineBuff?: { stat: 'atk' | 'def' | 'spd' | 'hp'; amount: number };
    expReward?: number;
    currencyReward?: number;
  };
}

export interface SecretRealmInstance {
  id: string;
  name: string;
  level: number;             // Đề xuất cấp player
  rooms: Record<string, SRRoom>;
  entryRoomId: string;
  bossRoomId: string;
  currentRoomId: string;
  createdAtTurn: number;
  /** Sẽ tự đóng khi turn > createdAtTurn + ttlTurns */
  ttlTurns: number;
  /** Phần thưởng hoàn thành (giết boss) */
  clearReward: {
    exp: number;
    currency: number;
    itemName?: string;
    itemRarity?: string;
    itemCategory?: string;
  };
}

/**
 * Item types — port từ ITEM_TYPES và item shape của prototype.
 */

export type Rarity =
  | 'Thường'
  | 'Tốt'
  | 'Hiếm'
  | 'Cực Phẩm'
  | 'Siêu Phẩm'
  | 'Huyền Thoại';

export type ItemCategory =
  | 'Vũ khí'
  | 'Thân'
  | 'Đầu'
  | 'Chân'
  | 'Phụ kiện'
  | 'Thực phẩm'
  | 'Đan dược'
  | 'Tín vật'
  | 'Tạp vật'
  | 'Nguyên liệu'
  | 'Trữ vật'
  | 'Dị thường'
  | 'Phương tiện'
  | 'Sách kỹ năng'
  | 'Đa năng';

export interface Item {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  category: ItemCategory;

  /** Raw effects string từ prototype: "HEAL:formula=MAX_HP*0.3;APPLY_STATUS:..." */
  effects?: string;

  /** Giá trị cơ bản (linh thạch). Buy/sell price tính qua DIFFICULTY_MULTIPLIERS */
  value: number;

  /** Trọng lượng — ảnh hưởng calculateCurrentWeight */
  weight?: number;

  /** Số lượng trong cùng 1 stack */
  quantity?: number;

  /** Nếu là Sách kỹ năng → tham chiếu skill id sẽ học được */
  teachesSkillId?: string;

  /** Nếu là pháp bảo (★ MỚI) — pháp bảo có level riêng */
  artifactLevel?: number;
  artifactSoul?: number; // pháp bảo tinh hồn, dưỡng để lên cấp

  /** Cho phép trang bị vào slot nào (null = không trang bị được) */
  equipSlot?: import('./character').EquipmentSlot | null;

  /** Stat bonuses khi trang bị — flat bonuses cộng vào base */
  bonuses?: {
    hp?: number;
    atk?: number;
    def?: number;
    spd?: number;
    cr?: number;       // % crit rate
    cdmg?: number;     // % crit damage
    dmgAmp?: number;   // % damage amplification
    dmgRes?: number;   // % damage resistance
    evasion?: number;  // %
  };
}

/** Equipment-eligible categories — items ngoài list này không equip được */
export const EQUIPPABLE_CATEGORIES: ItemCategory[] = [
  'Vũ khí',
  'Thân',
  'Đầu',
  'Chân',
  'Phụ kiện',
  'Trữ vật',
  'Dị thường',
  'Phương tiện',
];

/** Map category → default slot */
export const CATEGORY_TO_DEFAULT_SLOT: Partial<Record<ItemCategory, import('./character').EquipmentSlot>> = {
  'Vũ khí': 'Vũ khí chính',
  'Đầu': 'Đầu',
  'Thân': 'Thân',
  'Chân': 'Chân',
  'Phụ kiện': 'Phụ kiện 1',
  'Trữ vật': 'Trữ vật',
  'Dị thường': 'Dị thường',
  'Phương tiện': 'Phương tiện',
};

/** Static phân phối phẩm chất theo level — port từ RARITY_DISTRIBUTION_BY_LEVEL */
export type RarityBracket = '1-10' | '11-20' | '21-30' | '31-40' | '41-50' | '51+';
export type RarityDistribution = Record<RarityBracket, Record<Rarity, number>>;

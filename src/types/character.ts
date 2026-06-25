/**
 * Character types — port từ INITIAL_STATS của prototype, refine với TypeScript.
 */

export type RealmName = string; // AI-generated, e.g. "Luyện Khí", "Trúc Cơ", "Kim Đan"...

export type SpiritualRootType =
  | 'don' // Đơn linh căn (1 element)
  | 'song' // Song linh căn (2)
  | 'tam' // Tam linh căn (3)
  | 'tu' // Tứ linh căn (4)
  | 'ngu' // Ngũ linh căn (5)
  | 'di'; // Dị linh căn (Lôi/Phong/Băng/Quang/Ám)

export type Element =
  | 'kim' // Metal
  | 'moc' // Wood
  | 'thuy' // Water
  | 'hoa' // Fire
  | 'tho' // Earth
  | 'loi' // Lightning (dị)
  | 'phong' // Wind (dị)
  | 'bang' // Ice (dị)
  | 'quang' // Light (dị)
  | 'am'; // Dark (dị)

export interface SpiritualRoot {
  type: SpiritualRootType;
  elements: Element[];
  cultivationMultiplier: number; // ×0.5 (ngũ) → ×3.0 (đơn) → ×4.0+ (dị)
}

export interface AllocatedPoints {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface BaseStats {
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  baseCr: number;
  baseCdmg: number;
  baseDmgAmp: number;
  baseDmgRes: number;
  baseEvasion: number;
}

export interface FinalStats {
  hp: number;
  maxhp: number;
  atk: number;
  def: number;
  spd: number;
  cr: number;
  cdmg: number;
  dmgAmp: number;
  dmgRes: number;
  evasion: number;
}

export type EquipmentSlot =
  | 'Đầu'
  | 'Thân'
  | 'Chân'
  | 'Vũ khí chính'
  | 'Vũ khí phụ'
  | 'Phụ kiện 1'
  | 'Phụ kiện 2'
  | 'Phương tiện'
  | 'Trữ vật'
  | 'Dị thường';

export type SkillSlot =
  | 'combat_basic_1'
  | 'combat_basic_2'
  | 'combat_ultimate'
  | 'adventure_1'
  | 'adventure_2'
  | 'adventure_3';

export type EquippedItems = Record<EquipmentSlot, string | null>; // itemId reference
export type EquippedSkills = Record<SkillSlot, string | null>; // skillId reference

export interface LongTermStatus {
  id: string;
  name: string;
  type: 'injury' | 'adventure_debuff' | 'blessing' | 'curse';
  description: string;
  duration_hours?: number; // undefined = permanent until cured
  stats?: string; // raw "atk_amp:-60,def_amp:-60" format from prototype
  effects_per_day?: { hp_percent_loss?: number };
  special_flags?: string[];
}

export interface CombatStatus {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  duration_logic?: 'TURN_BASED' | 'ROUND_BASED';
  remaining: number;
  stat_changes?: Record<string, number>;
  special_flags?: string[];
  source_id?: string; // ai gây hiệu ứng
}

export interface Character {
  id: string;
  isPlayer: boolean;
  isCompanion?: boolean;
  Name: string;
  gender?: string;
  personality?: string;
  description?: string;

  // Avatar storage — đa lớp như prototype
  avatarUrl?: string;
  avatarBase64?: string;
  avatarStoredLocally?: boolean;
  lastAvatarUpdate?: number;

  // Cultivation
  level: number;
  exp: number;
  maxExp: number;
  realm?: RealmName;
  spiritualRoot?: SpiritualRoot;
  mentalState?: number; // 0-100 tâm cảnh
  currentTechnique?: string; // công pháp chính ID

  // Points
  ap: number; // available attribute points
  allocatedPoints: AllocatedPoints;
  currency: number;

  // Stats
  baseStats: BaseStats;
  finalStats: FinalStats;

  // World
  current_location_id: string | null;

  // Skills & equipment
  learnedSkills: string[];
  equippedSkills: EquippedSkills;
  equippedItems: EquippedItems;
  inventory: string[]; // itemIds

  // Status
  longTermStatuses: LongTermStatus[];
  combatStatuses: CombatStatus[];
  potionCooldown: number;
  pendingSkillsToLearn: string[];

  // Reference
  loreId?: string | null;
}

export type PlayerCharacter = Character & { isPlayer: true };
export type NPC = Character & { isPlayer: false; affinity?: number };

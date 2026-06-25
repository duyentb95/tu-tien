import type { BaseStats, FinalStats, AllocatedPoints, EquippedItems, EquippedSkills } from '@gametypes/character';

/**
 * INITIAL_STATS — port từ prototype `PREVIEW.md` (line 1984).
 * Giá trị y nguyên để bảo toàn balance đã playtest.
 */
export const INITIAL_BASE_STATS: BaseStats = {
  baseHp: 200,
  baseAtk: 20,
  baseDef: 10,
  baseSpd: 30,
  baseCr: 5,
  baseCdmg: 150,
  baseDmgAmp: 0,
  baseDmgRes: 0,
  baseEvasion: 0,
};

export const INITIAL_FINAL_STATS: FinalStats = {
  hp: 200,
  maxhp: 200,
  atk: 20,
  def: 10,
  spd: 30,
  cr: 5,
  cdmg: 150,
  dmgAmp: 0,
  dmgRes: 0,
  evasion: 0,
};

export const INITIAL_ALLOCATED_POINTS: AllocatedPoints = {
  hp: 0,
  atk: 0,
  def: 0,
  spd: 0,
};

export const INITIAL_EQUIPPED_ITEMS: EquippedItems = {
  Đầu: null,
  Thân: null,
  Chân: null,
  'Vũ khí chính': null,
  'Vũ khí phụ': null,
  'Phụ kiện 1': null,
  'Phụ kiện 2': null,
  'Phương tiện': null,
  'Trữ vật': null,
  'Dị thường': null,
};

export const INITIAL_EQUIPPED_SKILLS: EquippedSkills = {
  combat_basic_1: null,
  combat_basic_2: null,
  combat_ultimate: null,
  adventure_1: null,
  adventure_2: null,
  adventure_3: null,
};

/** AP khởi đầu khi tạo nhân vật mới */
export const INITIAL_AP = 5;

/** Số AP nhận được mỗi lên cấp (trừ NPC tự allocate) */
export const AP_PER_LEVEL = 5;

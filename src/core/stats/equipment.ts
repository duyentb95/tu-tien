import type { PlayerCharacter, FinalStats } from '@gametypes/character';
import type { Item } from '@gametypes/item';
import { getRefineMultiplier } from '@core/items/refine';
import { computeActiveSetBonuses } from '@data/artifact-sets';

/**
 * Tính tổng bonus từ tất cả item đã trang bị.
 * Phase 23.1: nhân thêm refine multiplier (1.05x per refine level).
 *
 * @param equippedItems player.equippedItems (slot → itemId)
 * @param inventory store.inventory dictionary
 */
export const calculateEquipmentBonuses = (
  equippedItems: PlayerCharacter['equippedItems'],
  inventory: Record<string, Item>,
): Required<NonNullable<Item['bonuses']>> => {
  const total = { hp: 0, atk: 0, def: 0, spd: 0, cr: 0, cdmg: 0, dmgAmp: 0, dmgRes: 0, evasion: 0 };

  for (const itemId of Object.values(equippedItems)) {
    if (!itemId) continue;
    const item = inventory[itemId];
    if (!item?.bonuses) continue;
    const mul = getRefineMultiplier(item.refineLevel ?? 0);

    total.hp += Math.round((item.bonuses.hp ?? 0) * mul);
    total.atk += Math.round((item.bonuses.atk ?? 0) * mul);
    total.def += Math.round((item.bonuses.def ?? 0) * mul);
    total.spd += Math.round((item.bonuses.spd ?? 0) * mul);
    total.cr += Math.round((item.bonuses.cr ?? 0) * mul);
    total.cdmg += Math.round((item.bonuses.cdmg ?? 0) * mul);
    total.dmgAmp += Math.round((item.bonuses.dmgAmp ?? 0) * mul);
    total.dmgRes += Math.round((item.bonuses.dmgRes ?? 0) * mul);
    total.evasion += Math.round((item.bonuses.evasion ?? 0) * mul);
  }

  return total;
};

/**
 * Recompute finalStats từ baseStats + allocatedPoints + equipment bonuses + artifact set bonuses.
 * Pure function — return char mới.
 */
export const recomputeFinalStats = (
  player: PlayerCharacter,
  inventory: Record<string, Item>,
): PlayerCharacter => {
  const ap = player.allocatedPoints;
  const bonuses = calculateEquipmentBonuses(player.equippedItems, inventory);

  // Phase 24.B: Artifact set bonus stacking
  const equippedSetIds = Object.values(player.equippedItems)
    .map((id) => (id ? inventory[id]?.artifactSetId : undefined));
  const activeSets = computeActiveSetBonuses(equippedSetIds);
  let setHp = 0, setAtk = 0, setDef = 0, setSpd = 0;
  let setCr = 0, setCdmg = 0, setDmgAmp = 0, setDmgRes = 0, setEvasion = 0;
  for (const s of activeSets) {
    setHp += s.bonus.hp ?? 0;
    setAtk += s.bonus.atk ?? 0;
    setDef += s.bonus.def ?? 0;
    setSpd += s.bonus.spd ?? 0;
    setCr += s.bonus.cr ?? 0;
    setCdmg += s.bonus.cdmg ?? 0;
    setDmgAmp += s.bonus.dmgAmp ?? 0;
    setDmgRes += s.bonus.dmgRes ?? 0;
    setEvasion += s.bonus.evasion ?? 0;
  }

  const baseHp = player.baseStats.baseHp + ap.hp * 30 + bonuses.hp + setHp;
  const baseAtk = player.baseStats.baseAtk + ap.atk * 3 + bonuses.atk + setAtk;
  const baseDef = player.baseStats.baseDef + ap.def * 2 + bonuses.def + setDef;
  const baseSpd = player.baseStats.baseSpd + ap.spd * 2 + bonuses.spd + setSpd;

  const finalStats: FinalStats = {
    maxhp: baseHp,
    hp: Math.min(player.finalStats.hp || baseHp, baseHp),
    atk: baseAtk,
    def: baseDef,
    spd: baseSpd,
    cr: player.baseStats.baseCr + bonuses.cr + setCr,
    cdmg: player.baseStats.baseCdmg + bonuses.cdmg + setCdmg,
    dmgAmp: player.baseStats.baseDmgAmp + bonuses.dmgAmp + setDmgAmp,
    dmgRes: player.baseStats.baseDmgRes + bonuses.dmgRes + setDmgRes,
    evasion: player.baseStats.baseEvasion + bonuses.evasion + setEvasion,
  };

  return { ...player, finalStats };
};

/**
 * Sinh bonuses ngẫu nhiên cho 1 item dựa vào rarity + category.
 * Dùng khi AI tạo item mới qua [ITEM] tag — đảm bảo balance.
 */
export const generateItemBonuses = (
  rarity: import('@gametypes/item').Rarity,
  category: import('@gametypes/item').ItemCategory,
  playerLevel: number = 1,
): Item['bonuses'] => {
  const RARITY_MULT: Record<string, number> = {
    'Thường': 1, 'Tốt': 2, 'Hiếm': 4, 'Cực Phẩm': 8, 'Siêu Phẩm': 14, 'Huyền Thoại': 24,
  };
  const mult = (RARITY_MULT[rarity] ?? 1) * Math.max(1, playerLevel * 0.6);

  switch (category) {
    case 'Vũ khí':
      return { atk: Math.round(8 * mult), cr: Math.round(0.5 * (RARITY_MULT[rarity] ?? 1)) };
    case 'Đầu':
      return { def: Math.round(3 * mult), hp: Math.round(15 * mult) };
    case 'Thân':
      return { def: Math.round(5 * mult), hp: Math.round(30 * mult), dmgRes: Math.round(0.4 * (RARITY_MULT[rarity] ?? 1)) };
    case 'Chân':
      return { spd: Math.round(2 * mult), evasion: Math.round(0.6 * (RARITY_MULT[rarity] ?? 1)) };
    case 'Phụ kiện':
      return { atk: Math.round(3 * mult), cdmg: Math.round(2 * (RARITY_MULT[rarity] ?? 1)) };
    case 'Trữ vật':
      return { hp: Math.round(20 * mult) };
    case 'Dị thường':
      return { atk: Math.round(4 * mult), def: Math.round(2 * mult), dmgAmp: Math.round(0.8 * (RARITY_MULT[rarity] ?? 1)) };
    case 'Phương tiện':
      return { spd: Math.round(4 * mult) };
    default:
      return {};
  }
};

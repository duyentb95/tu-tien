/**
 * Phase 24.B: Artifact Set registry — 6 set canonical.
 *
 * Mỗi set có 2-piece + 4-piece bonus. Auto-detect qua `item.artifactSetId`.
 * AI có thể gen item với setId match nếu canon pack có set tương ứng.
 */

import type { ItemBonuses } from '@gametypes/item';

export interface ArtifactSetDef {
  id: string;
  name: string;
  description: string;
  /** Bonus khi đeo 2 món cùng set */
  bonus2pc: ItemBonuses;
  bonus2pcDescription: string;
  /** Bonus khi đeo 4 món cùng set (cộng dồn với 2pc) */
  bonus4pc: ItemBonuses;
  bonus4pcDescription: string;
  /** Lore flavor */
  flavor: string;
  /** Tier visual */
  tier: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ARTIFACT_SETS: ArtifactSetDef[] = [
  {
    id: 'huyet_long',
    name: 'Huyết Long Bộ',
    description: 'Bộ pháp bảo của Huyết Long Tông — sức mạnh hấp huyết.',
    bonus2pc: { atk: 30, hp: 200 },
    bonus2pcDescription: '+30 Công Kích, +200 Sinh Mệnh',
    bonus4pc: { dmgAmp: 25, cr: 10 },
    bonus4pcDescription: '+25% Tăng ST, +10% Bạo Kích',
    flavor: 'Hấp tinh đại pháp — uống máu kẻ địch, càng đánh càng mạnh.',
    tier: 'legendary',
  },
  {
    id: 'bang_tam',
    name: 'Băng Tâm Bộ',
    description: 'Bộ pháp bảo thuần băng — tâm tĩnh như tuyết.',
    bonus2pc: { def: 50, hp: 300 },
    bonus2pcDescription: '+50 Phòng Ngự, +300 Sinh Mệnh',
    bonus4pc: { dmgRes: 30, evasion: 15 },
    bonus4pcDescription: '+30% Kháng ST, +15% Né Tránh',
    flavor: 'Băng tuyết tâm pháp — vạn vật băng phong, sát khí tiêu tán.',
    tier: 'epic',
  },
  {
    id: 'thien_loi',
    name: 'Thiên Lôi Bộ',
    description: 'Bộ chế từ thiên lôi — nhanh như chớp.',
    bonus2pc: { spd: 40, atk: 25 },
    bonus2pcDescription: '+40 Thân Pháp, +25 Công Kích',
    bonus4pc: { cdmg: 50, dmgAmp: 15 },
    bonus4pcDescription: '+50% Sát Bạo, +15% Tăng ST',
    flavor: 'Sấm sét chi tốc — ra đòn nhanh hơn bóng tối.',
    tier: 'legendary',
  },
  {
    id: 'tien_phong',
    name: 'Tiên Phong Bộ',
    description: 'Tiên phong vũ động — pháp bảo của tiên gia.',
    bonus2pc: { spd: 30, evasion: 10 },
    bonus2pcDescription: '+30 Thân Pháp, +10% Né Tránh',
    bonus4pc: { dmgAmp: 20, dmgRes: 20 },
    bonus4pcDescription: '+20% Tăng ST + 20% Kháng ST',
    flavor: 'Tiên phong nhẹ tựa lông hồng, dấu vết bất định.',
    tier: 'epic',
  },
  {
    id: 'thai_co_huyen_quan',
    name: 'Thái Cổ Huyền Quan',
    description: 'Pháp bảo thượng cổ — quan ấn phong ấn.',
    bonus2pc: { hp: 500, def: 30 },
    bonus2pcDescription: '+500 Sinh Mệnh, +30 Phòng Ngự',
    bonus4pc: { atk: 50, dmgAmp: 30 },
    bonus4pcDescription: '+50 Công Kích, +30% Tăng ST',
    flavor: 'Huyền quan thượng cổ — sức mạnh thái cổ thiên tôn lưu lại.',
    tier: 'legendary',
  },
  {
    id: 'thanh_van_phong',
    name: 'Thanh Vân Phong',
    description: 'Bộ trang bị mới — cân bằng mọi chỉ số.',
    bonus2pc: { atk: 15, def: 15, spd: 15, hp: 100 },
    bonus2pcDescription: '+15 mỗi chỉ số cơ bản, +100 HP',
    bonus4pc: { dmgAmp: 15, dmgRes: 15, cr: 5 },
    bonus4pcDescription: '+15% Tăng/Kháng ST, +5% Bạo',
    flavor: 'Thanh Vân Phong — nơi tu sĩ khởi bộ luyện đan.',
    tier: 'common',
  },
];

export const getArtifactSetById = (id: string): ArtifactSetDef | undefined =>
  ARTIFACT_SETS.find((s) => s.id === id);

export const ARTIFACT_SET_TIER_COLOR: Record<ArtifactSetDef['tier'], string> = {
  common:    'var(--jade-400)',
  rare:      'var(--spirit-300)',
  epic:      'var(--gold-300)',
  legendary: 'var(--ember-300)',
};

/**
 * Compute total set bonus từ equipped items.
 * @param equippedSetIds — array setIds của 5-6 trang bị slot
 * @returns map setId → activeBonus aggregate
 */
export interface ActiveSetBonus {
  setId: string;
  setName: string;
  pieces: number;
  /** Bonus đang active (2pc only nếu pieces=2-3, 2pc+4pc nếu pieces>=4) */
  bonus: ItemBonuses;
  bonusDescription: string;
}

export const computeActiveSetBonuses = (equippedSetIds: Array<string | undefined>): ActiveSetBonus[] => {
  const counts: Record<string, number> = {};
  for (const id of equippedSetIds) {
    if (!id) continue;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  const out: ActiveSetBonus[] = [];
  for (const [setId, pieces] of Object.entries(counts)) {
    if (pieces < 2) continue;
    const def = getArtifactSetById(setId);
    if (!def) continue;
    let bonus: ItemBonuses = { ...def.bonus2pc };
    let bonusDescription = `2-piece: ${def.bonus2pcDescription}`;
    if (pieces >= 4) {
      // Merge 4pc bonus
      for (const [k, v] of Object.entries(def.bonus4pc)) {
        bonus[k as keyof ItemBonuses] = (bonus[k as keyof ItemBonuses] ?? 0) + (v ?? 0);
      }
      bonusDescription += ` · 4-piece: ${def.bonus4pcDescription}`;
    }
    out.push({
      setId, setName: def.name, pieces, bonus, bonusDescription,
    });
  }
  return out;
};

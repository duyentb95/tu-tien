import type { Element } from './character';

/**
 * Sect rank progression — 5 cấp từ ngoại môn → tông chủ.
 * Mỗi rank yêu cầu contribution + level tối thiểu.
 */
export type SectRank =
  | 'ngoai_mon'      // Đệ tử ngoại môn — vừa nhập môn
  | 'noi_mon'        // Đệ tử nội môn — được vào tàng kinh các
  | 'chan_truyen'    // Đệ tử chân truyền — học công pháp cao cấp
  | 'truong_lao'     // Trưởng lão — có động phủ riêng, ra nhiệm vụ
  | 'tong_chu';      // Tông chủ — chỉ 1 người, không reach được bình thường

export const SECT_RANK_ORDER: SectRank[] = ['ngoai_mon', 'noi_mon', 'chan_truyen', 'truong_lao', 'tong_chu'];

export const SECT_RANK_DISPLAY: Record<SectRank, string> = {
  ngoai_mon: 'Đệ Tử Ngoại Môn',
  noi_mon: 'Đệ Tử Nội Môn',
  chan_truyen: 'Đệ Tử Chân Truyền',
  truong_lao: 'Trưởng Lão',
  tong_chu: 'Tông Chủ',
};

/** Yêu cầu lên rank: { rank → { contribution, levelMin } } */
export const SECT_RANK_REQUIREMENT: Record<SectRank, { contribution: number; levelMin: number }> = {
  ngoai_mon: { contribution: 0, levelMin: 1 },
  noi_mon: { contribution: 500, levelMin: 10 },
  chan_truyen: { contribution: 3000, levelMin: 25 },
  truong_lao: { contribution: 15000, levelMin: 50 },
  tong_chu: { contribution: 100000, levelMin: 80 },
};

export type SectAlignment = 'chinh' | 'ma' | 'trung' | 'an';

export interface Sect {
  id: string;
  name: string;
  alignment: SectAlignment;       // chính / ma / trung lập / ẩn thế
  description: string;
  philosophy: string;             // câu châm ngôn của môn
  /** Element phái — gợi ý công pháp + linh căn ưu tiên */
  primaryElements: Element[];
  /** Yêu cầu gia nhập */
  joinRequirements: {
    levelMin?: number;
    elementsRequired?: Element[]; // bất kỳ element nào trong list
    bannedElements?: Element[];   // không có element nào trong list
    minSpiritualRootMultiplier?: number;
  };
  /** Signature công pháp dạy ở tàng kinh các */
  signatureTechniques: string[];
}

export interface SectMembership {
  sectId: string;
  rank: SectRank;
  contribution: number;
  joinedAtTurn: number;
  /** Nhiệm vụ tông môn đã hoàn thành (count) */
  missionsCompleted: number;
  /** True nếu là phản môn — bị truy sát */
  defected?: boolean;
}

export type SectMissionKind = 'gathering' | 'subjugation' | 'patrol' | 'delivery' | 'cultivation';

export interface SectMission {
  id: string;
  sectId: string;
  title: string;
  kind: SectMissionKind;
  description: string;
  contributionReward: number;
  currencyReward: number;
  /** Item ID reward (optional) — sẽ lookup template để generate */
  itemRewardName?: string;
  itemRewardRarity?: string;
  itemRewardCategory?: string;
  /** Yêu cầu rank để nhận */
  minRank?: SectRank;
  /** Daily / weekly / one-shot */
  resetType?: 'daily' | 'weekly' | 'one_shot';
  /** Đã claim ở turn nào */
  claimedAtTurn?: number;
}

export interface TangKinhItem {
  id: string;
  sectId: string;
  itemName: string;
  itemRarity: string;
  itemCategory: string;
  cost: number;            // contribution points
  minRank: SectRank;
  description?: string;
}

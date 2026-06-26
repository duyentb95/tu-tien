/**
 * Tribulation tiers — mỗi đại cảnh giới có lôi kiếp khác nhau.
 *
 * Theo prototype: mỗi 10 level = 1 lần độ kiếp lớn. Sát thương + số đạo lôi
 * tăng dần. Late-game có thêm yếu tố: băng kiếp, hỏa kiếp, tâm ma kiếp...
 */

export interface TribulationTier {
  /** Cảnh giới chuẩn bị đột phá vào */
  enteringRealm: string;
  /** Player level required (vd 10 = bắt đầu Trúc Cơ) */
  triggerLevel: number;
  /** Số đạo kiếp */
  bolts: number;
  /** Sát thương mỗi đạo (% maxHP) */
  damagePerBolt: number;
  /** Tên kiếp (cho narrative) */
  kalpaName: string;
  /** Loại đặc biệt — nếu có */
  specials?: Array<'lightning' | 'fire' | 'ice' | 'inner_demon' | 'heaven_demon' | 'void'>;
  /** Thưởng khi vượt thành công */
  rewardOnSuccess: {
    statBoost: { atk: number; def: number; hp: number; spd: number };
    apBonus: number;
  };
}

export const TRIBULATION_TIERS: TribulationTier[] = [
  {
    enteringRealm: 'Trúc Cơ',
    triggerLevel: 10,
    bolts: 3,
    damagePerBolt: 15,
    kalpaName: 'Trúc Cơ Tiểu Kiếp',
    specials: ['lightning'],
    rewardOnSuccess: { statBoost: { atk: 20, def: 15, hp: 100, spd: 10 }, apBonus: 10 },
  },
  {
    enteringRealm: 'Kim Đan',
    triggerLevel: 20,
    bolts: 6,
    damagePerBolt: 18,
    kalpaName: 'Kim Đan Trung Kiếp',
    specials: ['lightning', 'inner_demon'],
    rewardOnSuccess: { statBoost: { atk: 40, def: 30, hp: 250, spd: 20 }, apBonus: 15 },
  },
  {
    enteringRealm: 'Nguyên Anh',
    triggerLevel: 30,
    bolts: 9,
    damagePerBolt: 20,
    kalpaName: 'Nguyên Anh Đại Kiếp',
    specials: ['lightning', 'inner_demon', 'heaven_demon'],
    rewardOnSuccess: { statBoost: { atk: 80, def: 60, hp: 500, spd: 35 }, apBonus: 25 },
  },
  {
    enteringRealm: 'Hóa Thần',
    triggerLevel: 40,
    bolts: 9,
    damagePerBolt: 22,
    kalpaName: 'Hóa Thần Băng Hỏa Kiếp',
    specials: ['lightning', 'ice', 'fire'],
    rewardOnSuccess: { statBoost: { atk: 150, def: 120, hp: 1000, spd: 60 }, apBonus: 35 },
  },
  {
    enteringRealm: 'Luyện Hư',
    triggerLevel: 50,
    bolts: 9,
    damagePerBolt: 24,
    kalpaName: 'Luyện Hư Thiên Ma Kiếp',
    specials: ['lightning', 'heaven_demon', 'void'],
    rewardOnSuccess: { statBoost: { atk: 250, def: 200, hp: 2000, spd: 100 }, apBonus: 50 },
  },
  {
    enteringRealm: 'Hợp Thể',
    triggerLevel: 60,
    bolts: 12,
    damagePerBolt: 26,
    kalpaName: 'Hợp Thể Vây Khốn Kiếp',
    specials: ['lightning', 'heaven_demon', 'inner_demon', 'void'],
    rewardOnSuccess: { statBoost: { atk: 400, def: 350, hp: 4000, spd: 150 }, apBonus: 70 },
  },
  {
    enteringRealm: 'Đại Thừa',
    triggerLevel: 70,
    bolts: 18,
    damagePerBolt: 28,
    kalpaName: 'Đại Thừa Tuyệt Ngục Kiếp',
    specials: ['lightning', 'heaven_demon', 'inner_demon', 'void', 'fire', 'ice'],
    rewardOnSuccess: { statBoost: { atk: 700, def: 600, hp: 8000, spd: 250 }, apBonus: 100 },
  },
  {
    enteringRealm: 'Độ Kiếp',
    triggerLevel: 80,
    bolts: 27,
    damagePerBolt: 30,
    kalpaName: 'Độ Kiếp Diệt Thế Kiếp',
    specials: ['lightning', 'heaven_demon', 'inner_demon', 'void', 'fire', 'ice'],
    rewardOnSuccess: { statBoost: { atk: 1200, def: 1000, hp: 15000, spd: 400 }, apBonus: 150 },
  },
  {
    enteringRealm: 'Tiên Nhân',
    triggerLevel: 90,
    bolts: 36,
    damagePerBolt: 35,
    kalpaName: 'Phi Thăng Tiên Kiếp · Cửu Trùng Lôi Hải',
    specials: ['lightning', 'heaven_demon', 'inner_demon', 'void', 'fire', 'ice'],
    rewardOnSuccess: { statBoost: { atk: 2500, def: 2000, hp: 30000, spd: 700 }, apBonus: 300 },
  },
];

/** Get tier cho level cụ thể (level === triggerLevel) */
export const getTribulationTier = (level: number): TribulationTier | undefined => {
  return TRIBULATION_TIERS.find((t) => t.triggerLevel === level);
};

/** Get tier sắp tới cho player level hiện tại */
export const getNextTribulation = (currentLevel: number): TribulationTier | undefined => {
  return TRIBULATION_TIERS.find((t) => t.triggerLevel > currentLevel);
};

/** End-game enemy templates — cho boss late-game */
export interface EndGameEnemyTemplate {
  name: string;
  realm: string;
  minLevel: number;
  statBase: { hp: number; atk: number; def: number; spd: number };
  description: string;
  /** Lore — thường là cổ thi/bí cảnh */
  lore: string;
}

export const END_GAME_ENEMIES: EndGameEnemyTemplate[] = [
  {
    name: 'Cổ Hỏa Long',
    realm: 'Hợp Thể',
    minLevel: 60,
    statBase: { hp: 5000, atk: 400, def: 300, spd: 150 },
    description: 'Long tộc cổ xưa từ Hỏa Diễm Vực',
    lore: 'Sinh ra từ buổi khai thiên lập địa, ngủ vùi trong Hỏa Diễm Vực hàng vạn năm.',
  },
  {
    name: 'Thiên Ma Cổ Thần',
    realm: 'Đại Thừa',
    minLevel: 70,
    statBase: { hp: 12000, atk: 800, def: 600, spd: 250 },
    description: 'Thiên ma cổ thần phong ấn trong Diệt Thiên Phong',
    lore: 'Một trong Cửu Đại Cổ Thần đã đại chiến với Tiên giới ngàn vạn năm trước.',
  },
  {
    name: 'Tử Thần Chiến Hồn',
    realm: 'Độ Kiếp',
    minLevel: 80,
    statBase: { hp: 25000, atk: 1500, def: 1200, spd: 400 },
    description: 'Chiến hồn của một Đại Đế đã rơi vào Tử Vực',
    lore: 'Linh hồn của Đại Đế bị thiên đạo trừng phạt, mất xác thành tử thần.',
  },
  {
    name: 'Hỗn Độn Cổ Thú',
    realm: 'Tiên Nhân',
    minLevel: 90,
    statBase: { hp: 60000, atk: 3000, def: 2500, spd: 600 },
    description: 'Cổ thú từ Hỗn Độn — không có cảnh giới chính thức, sức mạnh vô biên',
    lore: 'Sinh ra trước cả Tiên giới. Sống ngoài trật tự đạo lý, dùng bản năng phá hủy.',
  },
];

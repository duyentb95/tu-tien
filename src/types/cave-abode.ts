export type AbodeRoomKind = 'dao_vien' | 'luyen_dan_that' | 'tu_luyen_that' | 'tang_vat_phong';

export interface AbodeRoom {
  kind: AbodeRoomKind;
  /** Đã xây chưa */
  built: boolean;
  /** Cấp phòng — affect bonus */
  level: number;
  /** Chi phí build/upgrade level kế tiếp */
  upgradeCost?: number;
}

/** 1 plot trồng linh thảo trong Dược Viên */
export interface PlantingPlot {
  id: string;
  /** Tên cây trồng */
  herbName: string;
  /** Tên item produce khi harvest */
  itemName: string;
  itemRarity: string;
  itemCategory: string;
  /** Turn trồng */
  plantedAtTurn: number;
  /** Số turn cần để chín */
  growTurns: number;
  /** Số item produce */
  yield: number;
}

export interface CaveAbode {
  /** Player có sở hữu động phủ chưa */
  owned: boolean;
  /** Tên động phủ — do player đặt */
  name: string;
  /** ID location nơi đặt động phủ — phải là type 'cave_abode' hoặc 'mountain' */
  locationId: string;
  /** Mua giá bao nhiêu */
  purchasedAt?: number;
  rooms: Record<AbodeRoomKind, AbodeRoom>;
  /** Plots ở dược viên — chỉ available khi dao_vien.built === true */
  plots: Record<string, PlantingPlot>;
}

export const DEFAULT_CAVE_ABODE: CaveAbode = {
  owned: false,
  name: '',
  locationId: '',
  rooms: {
    dao_vien: { kind: 'dao_vien', built: false, level: 0, upgradeCost: 500 },
    luyen_dan_that: { kind: 'luyen_dan_that', built: false, level: 0, upgradeCost: 800 },
    tu_luyen_that: { kind: 'tu_luyen_that', built: false, level: 0, upgradeCost: 1200 },
    tang_vat_phong: { kind: 'tang_vat_phong', built: false, level: 0, upgradeCost: 600 },
  },
  plots: {},
};

export const ROOM_DISPLAY: Record<AbodeRoomKind, { name: string; description: string; icon: string }> = {
  dao_vien: { name: 'Dược Viên', description: 'Trồng linh thảo. Mỗi level +1 plot.', icon: '☘' },
  luyen_dan_that: { name: 'Luyện Đan Thất', description: 'Luyện đan dược từ linh thảo. (Phase 5.5)', icon: '⚱' },
  tu_luyen_that: { name: 'Tu Luyện Thất', description: 'Tu luyện cộng hưởng +50% EXP. (Phase 5.5)', icon: '✦' },
  tang_vat_phong: { name: 'Tàng Vật Phòng', description: 'Tăng sức chứa túi đồ. (Phase 5.5)', icon: '☷' },
};

/** Số plot tối đa = dao_vien.level + 2 (1, 2, 3, 4...) */
export const maxPlotsForLevel = (daoVienLevel: number): number => daoVienLevel + 2;

/** Catalog linh thảo có thể trồng — random pick khi plant. Mỗi cấp có thể trồng cây tốt hơn */
export const HERB_CATALOG: Array<{
  name: string;
  itemName: string;
  itemRarity: string;
  itemCategory: string;
  growTurns: number;
  yield: number;
  minLevel: number;
}> = [
  { name: 'Linh Tâm Thảo', itemName: 'Linh Tâm Thảo', itemRarity: 'Hiếm', itemCategory: 'Nguyên liệu', growTurns: 48, yield: 3, minLevel: 1 },
  { name: 'Bạch Vân Hoa', itemName: 'Bạch Vân Hoa', itemRarity: 'Tốt', itemCategory: 'Nguyên liệu', growTurns: 24, yield: 5, minLevel: 1 },
  { name: 'Tử Đan Quả', itemName: 'Tử Đan Quả', itemRarity: 'Cực Phẩm', itemCategory: 'Nguyên liệu', growTurns: 120, yield: 2, minLevel: 2 },
  { name: 'Cửu Diệp Linh Chi', itemName: 'Cửu Diệp Linh Chi', itemRarity: 'Siêu Phẩm', itemCategory: 'Nguyên liệu', growTurns: 240, yield: 1, minLevel: 3 },
  { name: 'Thần Tiên Hoa', itemName: 'Thần Tiên Hoa', itemRarity: 'Huyền Thoại', itemCategory: 'Nguyên liệu', growTurns: 480, yield: 1, minLevel: 5 },
];

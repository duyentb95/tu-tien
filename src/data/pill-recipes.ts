/**
 * Pill recipes — Luyện đan công thức.
 * Combine N herbs → 1 pill. Mỗi recipe yêu cầu luyen_dan_that.level tối thiểu.
 */

export interface PillIngredient {
  itemName: string;
  count: number;
}

export interface PillRecipe {
  id: string;
  name: string;
  productName: string;
  productRarity: string;
  productCategory: string;
  description: string;
  ingredients: PillIngredient[];
  /** Tiêu linh thạch để đốt lò */
  currencyCost: number;
  /** Yêu cầu luyen_dan_that.level tối thiểu */
  minRoomLevel: number;
  /** Tỉ lệ thành công 0-100. Fail thì mất nguyên liệu */
  successRate: number;
}

export const PILL_RECIPES: PillRecipe[] = [
  {
    id: 'r_hoi_khi',
    name: 'Hồi Khí Đan',
    productName: 'Hồi Khí Đan',
    productRarity: 'Tốt',
    productCategory: 'Đan dược',
    description: 'Đan dược cơ bản — hồi 30% Sinh Lực, CD 3 lượt.',
    ingredients: [
      { itemName: 'Linh Tâm Thảo', count: 2 },
      { itemName: 'Bạch Vân Hoa', count: 1 },
    ],
    currencyCost: 50,
    minRoomLevel: 1,
    successRate: 90,
  },
  {
    id: 'r_tang_tri',
    name: 'Tăng Trí Đan',
    productName: 'Tăng Trí Đan',
    productRarity: 'Hiếm',
    productCategory: 'Đan dược',
    description: 'Tăng tâm cảnh tạm thời +20 trong 5 lượt — boost độ kiếp success.',
    ingredients: [
      { itemName: 'Linh Tâm Thảo', count: 3 },
      { itemName: 'Bạch Vân Hoa', count: 2 },
    ],
    currencyCost: 150,
    minRoomLevel: 2,
    successRate: 75,
  },
  {
    id: 'r_tinh_hon',
    name: 'Tinh Hồn Đan',
    productName: 'Tinh Hồn Đan',
    productRarity: 'Cực Phẩm',
    productCategory: 'Đan dược',
    description: 'Hồi 100% Sinh Lực + tăng EXP tu luyện ×2 trong 24h.',
    ingredients: [
      { itemName: 'Tử Đan Quả', count: 2 },
      { itemName: 'Linh Tâm Thảo', count: 5 },
    ],
    currencyCost: 500,
    minRoomLevel: 3,
    successRate: 60,
  },
  {
    id: 'r_cuu_chuyen',
    name: 'Cửu Chuyển Hồi Sinh Đan',
    productName: 'Cửu Chuyển Hồi Sinh Đan',
    productRarity: 'Siêu Phẩm',
    productCategory: 'Đan dược',
    description: 'Hồi sinh 1 lần khi tử vong, +500 HP max permanent.',
    ingredients: [
      { itemName: 'Cửu Diệp Linh Chi', count: 1 },
      { itemName: 'Tử Đan Quả', count: 3 },
    ],
    currencyCost: 2000,
    minRoomLevel: 4,
    successRate: 40,
  },
  {
    id: 'r_thien_tien',
    name: 'Thiên Tiên Đan',
    productName: 'Thiên Tiên Đan',
    productRarity: 'Huyền Thoại',
    productCategory: 'Đan dược',
    description: 'Bỏ qua 1 đại đột phá cảnh giới — không cần độ kiếp.',
    ingredients: [
      { itemName: 'Thần Tiên Hoa', count: 1 },
      { itemName: 'Cửu Diệp Linh Chi', count: 3 },
      { itemName: 'Tử Đan Quả', count: 5 },
    ],
    currencyCost: 20000,
    minRoomLevel: 5,
    successRate: 25,
  },
];

export const getPillRecipe = (id: string): PillRecipe | undefined =>
  PILL_RECIPES.find((r) => r.id === id);

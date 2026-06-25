/**
 * Default realm progression — fallback nếu AI chưa gen `realmProgressionList`.
 * Mỗi cảnh giới chia 10 tầng → vượt quá đẩy vào "Vô Định Cảnh".
 */
export const DEFAULT_REALMS = [
  'Luyện Khí',
  'Trúc Cơ',
  'Kim Đan',
  'Nguyên Anh',
  'Hóa Thần',
  'Luyện Hư',
  'Hợp Thể',
  'Đại Thừa',
  'Độ Kiếp',
  'Tiên Nhân',
] as const;

export type DefaultRealm = (typeof DEFAULT_REALMS)[number];

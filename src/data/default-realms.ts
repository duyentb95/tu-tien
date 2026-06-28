/**
 * Default realm progression — fallback khi không có canon pack override.
 * Tu tiên thường thức 10 cảnh giới phổ biến VN/TQ.
 * Mỗi cảnh giới chia 10 tầng → vượt quá đẩy vào "Vô Định Cảnh".
 *
 * Phase 22.1: chuẩn hoá theo spec — Nguyên Thần (thay Nguyên Anh) + Phi Thăng (thay Tiên Nhân).
 */
export const DEFAULT_REALMS = [
  'Luyện Khí',
  'Trúc Cơ',
  'Kim Đan',
  'Nguyên Thần',
  'Hóa Thần',
  'Luyện Hư',
  'Hợp Thể',
  'Đại Thừa',
  'Độ Kiếp',
  'Phi Thăng',
] as const;

export type DefaultRealm = (typeof DEFAULT_REALMS)[number];

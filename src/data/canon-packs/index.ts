/**
 * Phase 13.1A: Canon Pack registry.
 *
 * 10 truyện tu tiên phổ biến nhất với metadata canonical đã được biên soạn.
 * Khi user pick pack từ dropdown → skip AI analyze + hydrate trực tiếp.
 *
 * Community có thể PR mở rộng: tạo file mới trong cùng folder + import vào CANON_PACKS.
 */

import type { CanonPack } from '@gametypes/canon-pack';
import { mucThanKy } from './muc-than-ky';
import { phamNhanTuTien } from './pham-nhan-tu-tien';
import { tienNghich } from './tien-nghich';
import { dauPhaThuongKhung } from './dau-pha-thuong-khung';
import { deBa } from './de-ba';
import { giaThien } from './gia-thien';
import { voThuongSatThan } from './vo-thuong-sat-than';
import { thanMo } from './than-mo';
import { hoanMyTheGioi } from './hoan-my-the-gioi';
import { thonPheTinhKhong } from './thon-phe-tinh-khong';
import { truTien } from './tru-tien';

/** Registry — order theo độ phổ biến VN (top đầu = thường được hỏi nhất) */
export const CANON_PACKS: CanonPack[] = [
  mucThanKy,
  phamNhanTuTien,
  truTien,
  tienNghich,
  dauPhaThuongKhung,
  deBa,
  giaThien,
  hoanMyTheGioi,
  voThuongSatThan,
  thanMo,
  thonPheTinhKhong,
];

/** Lookup by ID (slug) */
export const getCanonPack = (id: string): CanonPack | undefined =>
  CANON_PACKS.find((p) => p.id === id);

/**
 * Lookup linh hoạt theo title (case-insensitive + check altTitles).
 * Dùng khi user gõ tên truyện vào input — match pack có sẵn nếu có.
 */
export const findCanonPackByTitle = (query: string): CanonPack | undefined => {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return CANON_PACKS.find((p) => {
    if (p.title.toLowerCase() === q) return true;
    if (p.altTitles?.some((alt) => alt.toLowerCase() === q)) return true;
    return false;
  });
};

/**
 * Search packs (partial match for autocomplete).
 * Returns up to `limit` packs.
 */
export const searchCanonPacks = (query: string, limit = 5): CanonPack[] => {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];
  return CANON_PACKS.filter((p) => {
    if (p.title.toLowerCase().includes(q)) return true;
    if (p.altTitles?.some((alt) => alt.toLowerCase().includes(q))) return true;
    return false;
  }).slice(0, limit);
};

export type { CanonPack } from '@gametypes/canon-pack';

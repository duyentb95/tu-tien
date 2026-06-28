/**
 * Phase 15.2: Coupon registry — admin-issued promo codes.
 *
 * Hardcoded list cho v1 (chống fake bằng cách obfuscate code). Future: move sang
 * Cloudflare Worker + Firebase Function để admin tạo code dynamic + rate limit.
 *
 * Mỗi code redeem 1-time per device (track trong economy.redeemedCoupons[]).
 */

export interface Coupon {
  /** Mã user nhập (case-insensitive, normalize uppercase) */
  code: string;
  /** Reward — số Tiền Ngọc + actionTokens + perks unlocked */
  reward: {
    tienNgoc?: number;
    actionTokens?: number;
    /** Phase 23.UX: cho phép coupon grant perk (vd recovery khi user nạp Whale bị mất) */
    perks?: Array<'speedBoost' | 'unlimitedCustomRules' | 'extraSaveSlots'>;
  };
  /** Mô tả hiển thị khi redeem thành công */
  description: string;
  /** Optional: expire date Unix ms */
  expiresAt?: number;
  /** Optional: chỉ user mới (chưa có turn nào) mới claim được */
  newUserOnly?: boolean;
  /** Phase 23.UX: lock theo deviceId — chỉ device này redeem được (cho recovery 1-1) */
  lockedToDeviceId?: string;
}

export const COUPONS: Coupon[] = [
  {
    code: 'TANTHU',
    reward: { tienNgoc: 500, actionTokens: 200 },
    description:
      'Quà Tân Thủ — 500 Tiền Ngọc + 200 Lượt Hành Động. Đủ để trải nghiệm đầy đủ Cửa Hàng, Speed Boost, Tinh Luyện Vật Phẩm.',
    newUserOnly: true,
  },
  {
    code: 'TUTIENVN',
    reward: { tienNgoc: 500, actionTokens: 200 },
    description: 'Quà cộng đồng tu tiên Việt Nam — 500 Tiền Ngọc!',
  },
  {
    code: 'LAUNCH',
    reward: { tienNgoc: 200 },
    description: 'Sự kiện ra mắt — 200 Tiền Ngọc.',
  },
  {
    code: 'TANMUC',
    reward: { tienNgoc: 150, actionTokens: 50 },
    description: 'Mã fan Mục Thần Ký — Tần Mục mời ngươi tu luyện!',
  },
  {
    code: 'MACHOI2026',
    reward: { tienNgoc: 300, actionTokens: 100 },
    description: 'Ra mắt Mặc Hội Tiên Đồ 2026 — 300 Tiền Ngọc + 100 Lượt.',
  },
  // ─── Phase 23.UX: Recovery coupons cho user bị mất tiền nạp do bug save ───
  // BUG: trước hotfix, saveToLocalStorage không lưu economy → refresh = mất tiền nạp.
  // Mỗi mã lock theo deviceId — chỉ user đúng máy mới redeem được.
  {
    code: 'BUNAP-DUYENTB',
    reward: { tienNgoc: 8530, perks: ['speedBoost'] },
    description:
      'Hoàn lại 8530 Tiền Ngọc + Speed Boost — bù 2 lần nạp pack Whale (500k) + Micro (5k) ngày 28/06/2026.',
    lockedToDeviceId: 'nkx4vd5vkwmqxbp8bp',
  },
];

/** Lookup coupon by code (case-insensitive). Returns null nếu không tồn tại / expired */
export const findCoupon = (code: string): Coupon | null => {
  const normalized = code.trim().toUpperCase();
  const c = COUPONS.find((c) => c.code === normalized);
  if (!c) return null;
  if (c.expiresAt && Date.now() > c.expiresAt) return null;
  return c;
};

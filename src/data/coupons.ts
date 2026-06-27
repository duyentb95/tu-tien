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
  /** Reward — số Tiền Ngọc + actionTokens */
  reward: {
    tienNgoc?: number;
    actionTokens?: number;
  };
  /** Mô tả hiển thị khi redeem thành công */
  description: string;
  /** Optional: expire date Unix ms */
  expiresAt?: number;
  /** Optional: chỉ user mới (chưa có turn nào) mới claim được */
  newUserOnly?: boolean;
}

export const COUPONS: Coupon[] = [
  {
    code: 'MACHOI2026',
    reward: { tienNgoc: 300, actionTokens: 100 },
    description: 'Ra mắt Mặc Hội Tiên Đồ — 300 Tiền Ngọc + 100 Lượt!',
  },
  {
    code: 'WELCOME',
    reward: { tienNgoc: 100, actionTokens: 50 },
    description: 'Chào mừng tân thủ! Khởi đầu tu luyện.',
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
];

/** Lookup coupon by code (case-insensitive). Returns null nếu không tồn tại / expired */
export const findCoupon = (code: string): Coupon | null => {
  const normalized = code.trim().toUpperCase();
  const c = COUPONS.find((c) => c.code === normalized);
  if (!c) return null;
  if (c.expiresAt && Date.now() > c.expiresAt) return null;
  return c;
};

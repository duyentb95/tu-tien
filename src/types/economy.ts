/**
 * Phase 15: Economy state — premium currency + action tokens + referral + coupons.
 *
 * Currency 2-tier:
 *   - Linh Thạch (soft): kiếm qua play, đã có sẵn trong player.currency
 *   - Tiền Ngọc (premium/hard): nạp qua cửa hàng OR earn từ referral/coupon
 *
 * Action tokens (soft gating):
 *   - 50 token miễn phí mỗi ngày, reset 0h
 *   - Regen +1 / 15 phút (max trở lại cap nếu < 50)
 *   - Soft cap: hết token vẫn cho play, hiện cảnh báo "đợi regen hoặc nạp"
 *   - Premium pack: 100 / 300 / 1000 token instant top-up
 *
 * Referral:
 *   - Mỗi user có referralCode duy nhất (8 char hash deviceId)
 *   - Khi user mới start game → optional field nhập "Mã giới thiệu"
 *   - Reward cả 2: inviter +200 TN +50 token, invitee +100 TN +30 token
 *   - Track 1-time per device (localStorage)
 *
 * Coupon:
 *   - Admin/marketing tạo code, user nhập → claim reward
 *   - 1-time redemption per device (track redeemedCoupons[])
 */

export interface EconomyState {
  /** Premium currency (nạp tiền + earn từ referral/coupon) */
  tienNgoc: number;

  /** Action tokens — 50/ngày + regen 1/15p */
  actionTokens: number;
  /** Unix ms timestamp lần regen cuối — dùng compute regen */
  lastTokenRegenAt: number;
  /** Unix ms timestamp daily reset cuối (00:00 local) */
  lastDailyResetAt: number;

  /** Mã referral của user này (generated 1 lần, immutable) */
  referralCode: string;
  /** Mã referral đã được nhập (1 lần / device) — empty = chưa nhập */
  referredBy: string;
  /** Số người bạn đã mời thành công (tracking để hiện badge) */
  referredCount: number;

  /** Coupons đã redeem (chống claim 2 lần) */
  redeemedCoupons: string[];

  /** Premium perks unlocked (bought once, vĩnh viễn) */
  unlockedPerks: {
    /** Unlimited custom rules (default cap 5) */
    unlimitedCustomRules?: boolean;
    /** Extra save slots (default 3 → unlock 10) */
    extraSaveSlots?: boolean;
    /** Speed boost — bỏ retry delay AI, render ngay */
    speedBoost?: boolean;
  };

  /** Phase 18: active payment intent (MoMo deeplink), null = không có */
  paymentIntent: null | {
    intentId: string;
    packId: string;
    memo: string;
    amount: number;
    momoDeeplink: string;
    qrPayload: string;
    expiresAt: number;
    status: 'pending' | 'approved' | 'expired' | 'rejected';
  };

  /** Phase 19.5: ID achievement đã unlocked — track diff để notify cái mới */
  unlockedAchievements: string[];

  /** Phase 23.UX: Lịch sử giao dịch — nạp Tiên Ngọc + redeem coupon + spend exchange.
   *  Newest first. Capped 100 entries. */
  purchaseHistory?: PurchaseHistoryEntry[];
}

export interface PurchaseHistoryEntry {
  /** Unique ID — timestamp + random suffix */
  id: string;
  /** Unix ms timestamp */
  at: number;
  /** Loại giao dịch */
  kind: 'topup' | 'exchange' | 'coupon' | 'referral' | 'mock';
  /** Mô tả ngắn (vd "Nạp 100k", "Đổi 5 Token", "Mã TANTHU") */
  title: string;
  /** Số Tiên Ngọc delta (+ nạp/earn, - tiêu) */
  delta: number;
  /** Optional VND amount (chỉ cho topup) */
  amountVnd?: number;
  /** Optional payment intent ID hoặc coupon code để trace */
  refId?: string;
  /** Status — pending/done/failed */
  status?: 'pending' | 'done' | 'failed';
}

export const INITIAL_ECONOMY: EconomyState = {
  tienNgoc: 0,
  actionTokens: 50,
  lastTokenRegenAt: Date.now(),
  lastDailyResetAt: Date.now(),
  referralCode: '',
  referredBy: '',
  referredCount: 0,
  redeemedCoupons: [],
  unlockedPerks: {},
  paymentIntent: null,
  unlockedAchievements: [],
};

export const TOKEN_DAILY_CAP = 50;
export const TOKEN_REGEN_INTERVAL_MS = 15 * 60 * 1000; // 15 phút
export const TOKEN_PER_TIEN_NGOC = 10; // 1 TN = 10 token (exchange rate)

/**
 * Compute actionTokens hiện tại với regen auto + daily reset.
 * Pure function — không mutate state, caller phải set kết quả vào store.
 */
export const computeRegenTokens = (state: EconomyState, now = Date.now()): EconomyState => {
  let { actionTokens, lastTokenRegenAt, lastDailyResetAt } = state;

  // Daily reset — nếu sang ngày mới (qua 00:00 local), reset về cap nếu thấp hơn
  const lastResetDate = new Date(lastDailyResetAt);
  const nowDate = new Date(now);
  if (
    nowDate.getFullYear() !== lastResetDate.getFullYear() ||
    nowDate.getMonth() !== lastResetDate.getMonth() ||
    nowDate.getDate() !== lastResetDate.getDate()
  ) {
    actionTokens = Math.max(actionTokens, TOKEN_DAILY_CAP);
    lastDailyResetAt = now;
  }

  // Regen +1 / interval, cap at TOKEN_DAILY_CAP (chỉ regen miễn phí lên đến cap)
  if (actionTokens < TOKEN_DAILY_CAP) {
    const elapsed = now - lastTokenRegenAt;
    const ticks = Math.floor(elapsed / TOKEN_REGEN_INTERVAL_MS);
    if (ticks > 0) {
      actionTokens = Math.min(TOKEN_DAILY_CAP, actionTokens + ticks);
      lastTokenRegenAt = lastTokenRegenAt + ticks * TOKEN_REGEN_INTERVAL_MS;
    }
  } else {
    // Trên cap (do mua pack) → không regen, set lastRegen = now để khi tiêu giảm thì regen từ mốc hiện tại
    lastTokenRegenAt = now;
  }

  return { ...state, actionTokens, lastTokenRegenAt, lastDailyResetAt };
};

/** Generate referral code 8-char hash từ string seed (deviceId/userId) */
export const generateReferralCode = (seed: string): string => {
  if (!seed) seed = Math.random().toString(36).slice(2) + Date.now();
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const abs = Math.abs(h);
  // Base36 + pad to 8 char
  return abs.toString(36).toUpperCase().padStart(8, 'X').slice(0, 8);
};

/** Get / create stable deviceId trong localStorage cho referral seed */
export const getOrCreateDeviceId = (): string => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return Math.random().toString(36).slice(2);
  }
  const KEY = 'tu-tien:device-id';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
};

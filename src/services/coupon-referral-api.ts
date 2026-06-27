/**
 * Phase 17.2: Client wrapper gọi Firebase Cloud Functions cho coupon + referral.
 *
 * Fallback graceful nếu Cloud Function chưa deploy:
 *   - validateCouponRemote() throws → caller fallback dùng client-side findCoupon
 *   - validateReferralRemote() throws → caller fallback dùng client-side
 *
 * Cách dùng:
 *   const res = await validateCouponRemote({ code, deviceId, turn });
 *   if (res.ok) { addCurrency(res.reward.tienNgoc) }
 */

export interface CouponResponse {
  ok: boolean;
  message: string;
  reward?: { tienNgoc?: number; actionTokens?: number };
}

export interface ReferralResponse {
  ok: boolean;
  message: string;
  inviteeReward?: { tienNgoc: number; actionTokens: number };
}

const isBackendEnabled = (): boolean => {
  const env = import.meta.env as Record<string, string | undefined>;
  return !!(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);
};

/**
 * Call Firebase Function `validateCoupon`.
 * Throw nếu Firebase chưa init / function chưa deploy / network fail.
 */
export const validateCouponRemote = async (input: {
  code: string;
  deviceId: string;
  turn: number;
}): Promise<CouponResponse> => {
  if (!isBackendEnabled()) {
    throw new Error('[coupon-api] Firebase chưa config — dùng client-side fallback');
  }
  const { getFirebaseApp } = await import('./firebase');
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const fns = getFunctions(getFirebaseApp(), 'asia-southeast1');
  const callable = httpsCallable<typeof input, CouponResponse>(fns, 'validateCoupon');
  const result = await callable(input);
  return result.data;
};

/** Call `validateReferral` Cloud Function */
export const validateReferralRemote = async (input: {
  inviterCode: string;
  deviceId: string;
  myReferralCode: string;
  turn: number;
}): Promise<ReferralResponse> => {
  if (!isBackendEnabled()) {
    throw new Error('[referral-api] Firebase chưa config — dùng client-side fallback');
  }
  const { getFirebaseApp } = await import('./firebase');
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const fns = getFunctions(getFirebaseApp(), 'asia-southeast1');
  const callable = httpsCallable<typeof input, ReferralResponse>(fns, 'validateReferral');
  const result = await callable(input);
  return result.data;
};

/** Đăng ký referral code của user mới (idempotent) */
export const registerReferralCodeRemote = async (input: {
  deviceId: string;
  referralCode: string;
}): Promise<{ ok: boolean; message: string; code?: string }> => {
  if (!isBackendEnabled()) {
    throw new Error('[referral-api] Firebase chưa config');
  }
  const { getFirebaseApp } = await import('./firebase');
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const fns = getFunctions(getFirebaseApp(), 'asia-southeast1');
  const callable = httpsCallable<typeof input, { ok: boolean; message: string; code?: string }>(fns, 'registerReferralCode');
  const result = await callable(input);
  return result.data;
};

/**
 * Phase 18.2: Client wrapper cho payment Cloud Functions.
 *
 * Cách dùng:
 *   const intent = await createPaymentIntent({ deviceId, packId });
 *   // hiện QR / mở deeplink intent.momoDeeplink
 *   // poll mỗi 3s
 *   const status = await getPaymentStatus({ intentId, deviceId });
 *   if (status.status === 'approved') applyReward(status.reward);
 */

export interface PaymentReward {
  tienNgoc?: number;
  actionTokens?: number;
  perks?: string[];
}

export interface CreateIntentResponse {
  ok: boolean;
  message?: string;
  intentId?: string;
  memo?: string;
  amount?: number;
  momoDeeplink?: string;
  qrPayload?: string;
  expiresAt?: number;
}

export interface PaymentStatusResponse {
  ok: boolean;
  status?: 'pending' | 'approved' | 'expired' | 'rejected';
  reward?: PaymentReward;
  message?: string;
}

const isBackendEnabled = (): boolean => {
  const env = import.meta.env as Record<string, string | undefined>;
  return !!(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID);
};

const REGION = 'asia-southeast1';

export const createPaymentIntent = async (input: {
  deviceId: string;
  packId: string;
}): Promise<CreateIntentResponse> => {
  if (!isBackendEnabled()) {
    return { ok: false, message: 'Backend chưa config — không thể thanh toán thật' };
  }
  const { getFirebaseApp } = await import('./firebase');
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const fns = getFunctions(getFirebaseApp(), REGION);
  const callable = httpsCallable<typeof input, CreateIntentResponse>(fns, 'createPaymentIntent');
  const result = await callable(input);
  return result.data;
};

export const getPaymentStatus = async (input: {
  intentId: string;
  deviceId: string;
}): Promise<PaymentStatusResponse> => {
  if (!isBackendEnabled()) {
    return { ok: false, message: 'Backend chưa config' };
  }
  const { getFirebaseApp } = await import('./firebase');
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const fns = getFunctions(getFirebaseApp(), REGION);
  const callable = httpsCallable<typeof input, PaymentStatusResponse>(fns, 'getPaymentStatus');
  const result = await callable(input);
  return result.data;
};

/** ADMIN — không gọi từ client game, dùng trong admin.html */
export const approvePaymentAdmin = async (input: {
  intentId: string;
  adminToken: string;
  note?: string;
}): Promise<{ ok: boolean; message: string }> => {
  const { getFirebaseApp } = await import('./firebase');
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const fns = getFunctions(getFirebaseApp(), REGION);
  const callable = httpsCallable<typeof input, { ok: boolean; message: string }>(fns, 'approvePayment');
  const result = await callable(input);
  return result.data;
};

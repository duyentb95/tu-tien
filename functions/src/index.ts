/**
 * Phase 17.2: Firebase Cloud Function v2 — coupon + referral backend.
 *
 * 3 callable functions:
 *   - validateCoupon(code)    atomic claim coupon từ Firestore
 *   - validateReferral(code)  verify inviter exists + 1-time mark
 *   - registerReferralCode    idempotent register user's own code
 *
 * Deploy:
 *   firebase deploy --only functions
 */

import {onCall, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const REGION = "asia-southeast1";

// Re-export payment functions (file riêng, dùng admin SDK đã init ở trên)
export {
  createPaymentIntent,
  getPaymentStatus,
  approvePayment,
  rejectPayment,
  listPendingPayments,
} from "./payments";

// ─────────────────────────────────────────────────────────
// validateCoupon
// ─────────────────────────────────────────────────────────

interface ValidateCouponReq {
  code: string;
  deviceId: string;
  turn: number;
}
interface CouponReward {
  tienNgoc?: number;
  actionTokens?: number;
}
interface ValidateCouponRes {
  ok: boolean;
  message: string;
  reward?: CouponReward;
}

export const validateCoupon = onCall(
  {region: REGION},
  async (
    req: CallableRequest<ValidateCouponReq>,
  ): Promise<ValidateCouponRes> => {
    const data = req.data ?? ({} as ValidateCouponReq);
    const code = String(data.code ?? "").trim().toUpperCase();
    const deviceId = String(data.deviceId ?? "").trim();
    const turn = Number(data.turn ?? 0);

    if (!code) return {ok: false, message: "Vui lòng nhập mã."};
    if (!deviceId) return {ok: false, message: "Thiếu deviceId."};

    const couponRef = db.collection("coupons").doc(code);
    const claimRef = db
      .collection("coupon_claims")
      .doc(`${deviceId}_${code}`);

    try {
      const result = await db.runTransaction(async (tx) => {
        const couponSnap = await tx.get(couponRef);
        if (!couponSnap.exists) {
          return {ok: false, message: `Mã "${code}" không tồn tại.`};
        }
        const coupon = couponSnap.data() ?? {};
        if (!coupon.enabled) {
          return {
            ok: false,
            message: `Mã "${code}" đã bị vô hiệu hoá.`,
          };
        }
        if (
          coupon.expiresAt &&
          coupon.expiresAt.toMillis() < Date.now()
        ) {
          return {ok: false, message: `Mã "${code}" đã hết hạn.`};
        }
        if (coupon.currentUses >= coupon.maxUses) {
          return {
            ok: false,
            message: `Mã "${code}" đã hết lượt sử dụng.`,
          };
        }
        if (coupon.newUserOnly && turn > 5) {
          return {
            ok: false,
            message: "Mã này chỉ dành cho tân thủ (< 5 lượt).",
          };
        }

        const claimSnap = await tx.get(claimRef);
        if (claimSnap.exists) {
          return {
            ok: false,
            message: "Mã này đã được sử dụng trên thiết bị này.",
          };
        }

        tx.update(couponRef, {
          currentUses: admin.firestore.FieldValue.increment(1),
        });
        tx.set(claimRef, {
          deviceId,
          code,
          claimedAt: admin.firestore.FieldValue.serverTimestamp(),
          reward: coupon.reward,
        });

        return {
          ok: true,
          message: coupon.description ?? "Đổi mã thành công.",
          reward: coupon.reward as CouponReward,
        };
      });
      return result;
    } catch (err) {
      console.error("[validateCoupon] transaction failed:", err);
      return {ok: false, message: "Lỗi server, thử lại sau."};
    }
  },
);

// ─────────────────────────────────────────────────────────
// validateReferral
// ─────────────────────────────────────────────────────────

interface ValidateReferralReq {
  inviterCode: string;
  deviceId: string;
  myReferralCode: string;
  turn: number;
}
interface ValidateReferralRes {
  ok: boolean;
  message: string;
  inviteeReward?: {tienNgoc: number; actionTokens: number};
}

export const validateReferral = onCall(
  {region: REGION},
  async (
    req: CallableRequest<ValidateReferralReq>,
  ): Promise<ValidateReferralRes> => {
    const data = req.data ?? ({} as ValidateReferralReq);
    const inviterCode = String(data.inviterCode ?? "")
      .trim()
      .toUpperCase();
    const deviceId = String(data.deviceId ?? "").trim();
    const myCode = String(data.myReferralCode ?? "")
      .trim()
      .toUpperCase();
    const turn = Number(data.turn ?? 0);

    if (!inviterCode || !deviceId || !myCode) {
      return {
        ok: false,
        message: "Thiếu thông tin (code / deviceId).",
      };
    }
    if (inviterCode === myCode) {
      return {
        ok: false,
        message: "Không thể tự giới thiệu chính mình.",
      };
    }
    if (turn > 5) {
      return {
        ok: false,
        message: "Chỉ tân thủ (< 5 lượt) mới áp dụng được.",
      };
    }

    try {
      const result = await db.runTransaction(async (tx) => {
        const myRef = db.collection("referrals").doc(deviceId);
        const mySnap = await tx.get(myRef);
        if (mySnap.exists && mySnap.data()?.referredBy) {
          return {
            ok: false,
            message: "Đã sử dụng mã giới thiệu trước đó.",
          };
        }

        const inviterQuery = await db
          .collection("referrals")
          .where("referralCode", "==", inviterCode)
          .limit(1)
          .get();
        if (inviterQuery.empty) {
          return {
            ok: false,
            message: `Mã "${inviterCode}" không tồn tại.`,
          };
        }
        const inviterDoc = inviterQuery.docs[0];
        if (!inviterDoc) {
          return {
            ok: false,
            message: `Mã "${inviterCode}" không tồn tại.`,
          };
        }

        tx.set(
          myRef,
          {
            deviceId,
            referralCode: myCode,
            referredBy: inviterCode,
            invitedCount: 0,
            totalRewardEarned: 100,
            createdAt:
              admin.firestore.FieldValue.serverTimestamp(),
          },
          {merge: true},
        );

        tx.update(inviterDoc.ref, {
          invitedCount: admin.firestore.FieldValue.increment(1),
          totalRewardEarned:
            admin.firestore.FieldValue.increment(200),
        });

        return {
          ok: true,
          message:
            `Áp dụng thành công. Cảm tạ tiền bối ${inviterCode}!`,
          inviteeReward: {tienNgoc: 100, actionTokens: 30},
        };
      });
      return result;
    } catch (err) {
      console.error("[validateReferral] transaction failed:", err);
      return {ok: false, message: "Lỗi server, thử lại sau."};
    }
  },
);

// ─────────────────────────────────────────────────────────
// registerReferralCode
// ─────────────────────────────────────────────────────────

interface RegisterCodeReq {
  deviceId: string;
  referralCode: string;
}
interface RegisterCodeRes {
  ok: boolean;
  message: string;
  code?: string;
}

export const registerReferralCode = onCall(
  {region: REGION},
  async (
    req: CallableRequest<RegisterCodeReq>,
  ): Promise<RegisterCodeRes> => {
    const data = req.data ?? ({} as RegisterCodeReq);
    const deviceId = String(data.deviceId ?? "").trim();
    const code = String(data.referralCode ?? "")
      .trim()
      .toUpperCase();
    if (!deviceId || !code) {
      return {ok: false, message: "Thiếu deviceId/code."};
    }

    const ref = db.collection("referrals").doc(deviceId);
    const snap = await ref.get();
    const existing = snap.data();
    if (snap.exists && existing?.referralCode) {
      return {
        ok: true,
        message: "Đã đăng ký trước đó.",
        code: existing.referralCode,
      };
    }
    await ref.set(
      {
        deviceId,
        referralCode: code,
        invitedCount: 0,
        totalRewardEarned: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {merge: true},
    );
    return {ok: true, message: "Đăng ký thành công.", code};
  },
);

/**
 * Firestore schema:
 *
 * coupons/{CODE}:
 *   reward: { tienNgoc?, actionTokens? }
 *   description: string
 *   maxUses: number
 *   currentUses: number
 *   expiresAt?: Timestamp
 *   newUserOnly?: boolean
 *   enabled: boolean
 *
 * coupon_claims/{deviceId_CODE}:
 *   deviceId: string
 *   code: string
 *   claimedAt: Timestamp
 *   reward: {...}
 *
 * referrals/{deviceId}:
 *   deviceId: string
 *   referralCode: string
 *   referredBy?: string
 *   invitedCount: number
 *   totalRewardEarned: number
 *   createdAt: Timestamp
 */

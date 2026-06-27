/**
 * Phase 17.2: Firebase Cloud Function — backend coupon + referral validation.
 *
 * Triển khai 2 callable functions để chống abuse (client tự cộng currency = lỗ hổng):
 *   - validateCoupon(code)       — atomic check + claim coupon từ Firestore
 *   - validateReferral(code)     — check referral code tồn tại, mark inviter
 *
 * Triển khai:
 *   1. cd functions/ && npm init -y && npm i firebase-admin firebase-functions
 *   2. Copy file này thành functions/src/index.ts
 *   3. firebase deploy --only functions
 *
 * Firestore collections cần tạo:
 *
 * `coupons/{code}` — code uppercase = doc ID:
 *   {
 *     reward: { tienNgoc?: number, actionTokens?: number },
 *     description: string,
 *     maxUses: number,           // số lần claim tối đa (vd 1000 cho launch event)
 *     currentUses: number,       // counter
 *     expiresAt?: Timestamp,
 *     newUserOnly?: boolean,
 *     enabled: boolean,
 *   }
 *
 * `coupon_claims/{deviceId_code}` — chống 1 device claim 2 lần:
 *   {
 *     deviceId: string,
 *     code: string,
 *     claimedAt: Timestamp,
 *     reward: {...},
 *   }
 *
 * `referrals/{deviceId}` — mỗi device 1 doc:
 *   {
 *     deviceId: string,
 *     referralCode: string,       // code của chính họ (generated)
 *     referredBy?: string,        // code của người mời họ (1 lần)
 *     invitedCount: number,       // số người họ đã mời thành công
 *     totalRewardEarned: number,
 *     createdAt: Timestamp,
 *   }
 *
 * Admin: tạo coupon manual qua Firebase Console / Firestore tab → Add document.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// ─────────────────────────────────────────────────────────────
// validateCoupon — atomic claim
// ─────────────────────────────────────────────────────────────

interface ValidateCouponReq {
  code: string;
  deviceId: string;
  turn: number; // current turn (cho newUserOnly check)
}
interface ValidateCouponRes {
  ok: boolean;
  message: string;
  reward?: { tienNgoc?: number; actionTokens?: number };
}

export const validateCoupon = functions
  .region('asia-southeast1')
  .https.onCall(async (data: ValidateCouponReq): Promise<ValidateCouponRes> => {
    const code = String(data?.code ?? '').trim().toUpperCase();
    const deviceId = String(data?.deviceId ?? '').trim();
    const turn = Number(data?.turn ?? 0);

    if (!code) return { ok: false, message: 'Vui lòng nhập mã.' };
    if (!deviceId) return { ok: false, message: 'Thiếu deviceId.' };

    const couponRef = db.collection('coupons').doc(code);
    const claimRef = db.collection('coupon_claims').doc(`${deviceId}_${code}`);

    try {
      const result = await db.runTransaction(async (tx) => {
        const couponSnap = await tx.get(couponRef);
        if (!couponSnap.exists) {
          return { ok: false, message: `Mã "${code}" không tồn tại.` };
        }
        const coupon = couponSnap.data()!;
        if (!coupon.enabled) {
          return { ok: false, message: `Mã "${code}" đã bị vô hiệu hoá.` };
        }
        if (coupon.expiresAt && coupon.expiresAt.toMillis() < Date.now()) {
          return { ok: false, message: `Mã "${code}" đã hết hạn.` };
        }
        if (coupon.currentUses >= coupon.maxUses) {
          return { ok: false, message: `Mã "${code}" đã hết lượt sử dụng.` };
        }
        if (coupon.newUserOnly && turn > 5) {
          return { ok: false, message: 'Mã này chỉ dành cho tân thủ (< 5 lượt).' };
        }

        const claimSnap = await tx.get(claimRef);
        if (claimSnap.exists) {
          return { ok: false, message: 'Mã này đã được sử dụng trên thiết bị này.' };
        }

        // Atomic claim
        tx.update(couponRef, { currentUses: admin.firestore.FieldValue.increment(1) });
        tx.set(claimRef, {
          deviceId,
          code,
          claimedAt: admin.firestore.FieldValue.serverTimestamp(),
          reward: coupon.reward,
        });

        return {
          ok: true,
          message: coupon.description ?? `Đổi mã thành công.`,
          reward: coupon.reward,
        };
      });
      return result;
    } catch (err) {
      console.error('[validateCoupon] transaction failed:', err);
      return { ok: false, message: 'Lỗi server, thử lại sau.' };
    }
  });

// ─────────────────────────────────────────────────────────────
// validateReferral — check inviter exists + mark 1-time
// ─────────────────────────────────────────────────────────────

interface ValidateReferralReq {
  inviterCode: string;     // code của người mời (8 char)
  deviceId: string;        // device của user mới (người được mời)
  myReferralCode: string;  // code của chính user mới (để register vào referrals collection)
  turn: number;
}
interface ValidateReferralRes {
  ok: boolean;
  message: string;
  inviteeReward?: { tienNgoc: number; actionTokens: number };
}

export const validateReferral = functions
  .region('asia-southeast1')
  .https.onCall(async (data: ValidateReferralReq): Promise<ValidateReferralRes> => {
    const inviterCode = String(data?.inviterCode ?? '').trim().toUpperCase();
    const deviceId = String(data?.deviceId ?? '').trim();
    const myCode = String(data?.myReferralCode ?? '').trim().toUpperCase();
    const turn = Number(data?.turn ?? 0);

    if (!inviterCode || !deviceId || !myCode) {
      return { ok: false, message: 'Thiếu thông tin (code / deviceId).' };
    }
    if (inviterCode === myCode) {
      return { ok: false, message: 'Không thể tự giới thiệu chính mình.' };
    }
    if (turn > 5) {
      return { ok: false, message: 'Chỉ tân thủ (< 5 lượt) mới áp dụng được.' };
    }

    try {
      const result = await db.runTransaction(async (tx) => {
        const myRef = db.collection('referrals').doc(deviceId);
        const mySnap = await tx.get(myRef);
        if (mySnap.exists && mySnap.data()?.referredBy) {
          return { ok: false, message: 'Đã sử dụng mã giới thiệu trước đó.' };
        }

        // Find inviter by code (referralCode field unique-by-convention)
        const inviterQuery = await db
          .collection('referrals')
          .where('referralCode', '==', inviterCode)
          .limit(1)
          .get();
        if (inviterQuery.empty) {
          return { ok: false, message: `Mã "${inviterCode}" không tồn tại.` };
        }
        const inviterDoc = inviterQuery.docs[0]!;

        // Mark referral on invitee
        tx.set(myRef, {
          deviceId,
          referralCode: myCode,
          referredBy: inviterCode,
          invitedCount: 0,
          totalRewardEarned: 100,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Bump inviter stats
        tx.update(inviterDoc.ref, {
          invitedCount: admin.firestore.FieldValue.increment(1),
          totalRewardEarned: admin.firestore.FieldValue.increment(200),
        });

        // Inviter reward will be pulled next time họ login (queue table có thể thêm sau)
        return {
          ok: true,
          message: `Áp dụng thành công. Cảm tạ tiền bối ${inviterCode}!`,
          inviteeReward: { tienNgoc: 100, actionTokens: 30 },
        };
      });
      return result;
    } catch (err) {
      console.error('[validateReferral] transaction failed:', err);
      return { ok: false, message: 'Lỗi server, thử lại sau.' };
    }
  });

// ─────────────────────────────────────────────────────────────
// registerReferralCode — đăng ký code mới khi user lần đầu vào game
// ─────────────────────────────────────────────────────────────

interface RegisterCodeReq {
  deviceId: string;
  referralCode: string;
}

export const registerReferralCode = functions
  .region('asia-southeast1')
  .https.onCall(async (data: RegisterCodeReq) => {
    const deviceId = String(data?.deviceId ?? '').trim();
    const code = String(data?.referralCode ?? '').trim().toUpperCase();
    if (!deviceId || !code) return { ok: false, message: 'Thiếu deviceId/code.' };

    const ref = db.collection('referrals').doc(deviceId);
    const snap = await ref.get();
    if (snap.exists && snap.data()?.referralCode) {
      return { ok: true, message: 'Đã đăng ký trước đó.', code: snap.data()!.referralCode };
    }
    await ref.set({
      deviceId,
      referralCode: code,
      invitedCount: 0,
      totalRewardEarned: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { ok: true, message: 'Đăng ký thành công.', code };
  });

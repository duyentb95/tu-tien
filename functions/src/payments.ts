/**
 * Phase 18: MoMo Personal QR + deeplink payment flow (no merchant API).
 *
 * Workflow:
 *   1. Client click pack → callable createPaymentIntent
 *      → Function tạo doc payments/{intentId} với memo unique + amount
 *      → return {intentId, momoDeeplink, qrPayload, memo, expiresAt}
 *   2. User pay qua MoMo (deeplink mở app hoặc scan QR), nhập memo
 *   3. Client poll getPaymentStatus(intentId) mỗi 3s
 *   4. Admin (Sếp) check sao kê MoMo → mở admin.html → 1-click Approve
 *      → Function approvePayment (require ADMIN_TOKEN) flip status + credit
 *   5. Client poll thấy status='approved' → apply reward + close modal
 *
 * Firestore collection:
 *   payments/{intentId}:
 *     deviceId, packId, amount, reward {tienNgoc?, actionTokens?, perks?},
 *     memo (vd "TT-A1B2C3D4"), status pending/approved/expired/rejected,
 *     createdAt, expiresAt (15min), approvedAt?, approvedBy?, note?
 */
/* eslint-disable require-jsdoc */

import {onCall, CallableRequest, HttpsError}
  from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import * as admin from "firebase-admin";

const db = admin.firestore();
const REGION = "asia-southeast1";
const INTENT_TTL_MS = 15 * 60 * 1000; // 15 phút

// Secret: set bằng `firebase functions:secrets:set ADMIN_TOKEN`
const ADMIN_TOKEN = defineSecret("ADMIN_TOKEN");

// ─────────────────────────────────────────────────────────
// Helper — memo unique, dễ đọc trên MoMo
// ─────────────────────────────────────────────────────────
function makeMemo(): string {
  // 8 char base36 uppercase, prefix TT (Tu Tiên)
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `TT-${rand}`;
}

interface PaymentReward {
  tienNgoc?: number;
  actionTokens?: number;
  perks?: string[];
}

// Pack registry — SYNC với src/data/store-packs.ts (CURRENCY_PACKS).
// Server-side authoritative, client KHÔNG quyết định reward (chống spoof).
// Phase 19: thêm 2 gói micro + buff TN 1.5-2x toàn bảng cho user dễ tiếp cận.
const PACK_REGISTRY: Record<
  string,
  {amount: number; reward: PaymentReward; description: string}
> = {
  pack_micro: {
    amount: 5000,
    reward: {tienNgoc: 30},
    description: "Micro — 30 Tiền Ngọc",
  },
  pack_mini: {
    amount: 10000,
    reward: {tienNgoc: 80},
    description: "Mini — 80 Tiền Ngọc (+14% bonus)",
  },
  pack_starter: {
    amount: 20000,
    reward: {tienNgoc: 200},
    description: "Khởi đầu — 200 Tiền Ngọc",
  },
  pack_standard_small: {
    amount: 50000,
    reward: {tienNgoc: 560},
    description: "Standard nhỏ — 560 Tiền Ngọc (+12%)",
  },
  pack_standard_large: {
    amount: 100000,
    reward: {tienNgoc: 1250},
    description: "Standard lớn — 1250 Tiền Ngọc (+14%)",
  },
  pack_premium: {
    amount: 200000,
    reward: {tienNgoc: 2900, perks: ["speed_boost"]},
    description: "Premium — 2900 TN + Speed Boost",
  },
  pack_whale: {
    amount: 500000,
    reward: {tienNgoc: 8500, perks: ["speed_boost"]},
    description: "Whale — 8500 TN + Speed Boost",
  },
};

// ─────────────────────────────────────────────────────────
// createPaymentIntent — client tạo intent + nhận deeplink
// ─────────────────────────────────────────────────────────

interface CreateIntentReq {
  deviceId: string;
  packId: string;
}
interface CreateIntentRes {
  ok: boolean;
  message?: string;
  intentId?: string;
  memo?: string;
  amount?: number;
  momoDeeplink?: string;
  qrPayload?: string;
  expiresAt?: number;
}

export const createPaymentIntent = onCall(
  {region: REGION},
  async (
    req: CallableRequest<CreateIntentReq>,
  ): Promise<CreateIntentRes> => {
    const data = req.data ?? ({} as CreateIntentReq);
    const deviceId = String(data.deviceId ?? "").trim();
    const packId = String(data.packId ?? "").trim().toLowerCase();

    if (!deviceId) return {ok: false, message: "Thiếu deviceId."};
    const pack = PACK_REGISTRY[packId];
    if (!pack) return {ok: false, message: `Pack "${packId}" không tồn tại.`};

    const memo = makeMemo();
    const now = Date.now();
    const expiresAt = now + INTENT_TTL_MS;
    const ref = db.collection("payments").doc();

    // MoMo personal payment URL — phone + amount + note prefilled
    // Format: https://nhantien.momo.vn/{phone}/{amount}/{note}
    // Hoặc deeplink: momo://?phone=...&amount=...&note=...
    // Phone đọc từ env runtime (set bằng functions:secrets)
    const momoPhone = process.env.MOMO_PHONE ?? "0000000000";
    const momoName = process.env.MOMO_NAME ?? "Tu Tiên";
    const note = encodeURIComponent(memo);
    const momoDeeplink =
      `https://nhantien.momo.vn/${momoPhone}/${pack.amount}/${note}`;
    // QR payload — text gọn, client tự render thành QR
    const qrPayload =
      `MoMo | ${momoName} | ${momoPhone} | ${pack.amount}đ | ${memo}`;

    await ref.set({
      deviceId,
      packId,
      amount: pack.amount,
      reward: pack.reward,
      memo,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromMillis(expiresAt),
      description: pack.description,
    });

    return {
      ok: true,
      intentId: ref.id,
      memo,
      amount: pack.amount,
      momoDeeplink,
      qrPayload,
      expiresAt,
    };
  },
);

// ─────────────────────────────────────────────────────────
// getPaymentStatus — client poll status
// ─────────────────────────────────────────────────────────

interface StatusReq {
  intentId: string;
  deviceId: string;
}
interface StatusRes {
  ok: boolean;
  status?: "pending" | "approved" | "expired" | "rejected";
  reward?: PaymentReward;
  message?: string;
}

export const getPaymentStatus = onCall(
  {region: REGION},
  async (req: CallableRequest<StatusReq>): Promise<StatusRes> => {
    const data = req.data ?? ({} as StatusReq);
    const intentId = String(data.intentId ?? "").trim();
    const deviceId = String(data.deviceId ?? "").trim();
    if (!intentId || !deviceId) {
      return {ok: false, message: "Thiếu intentId/deviceId."};
    }

    const ref = db.collection("payments").doc(intentId);
    const snap = await ref.get();
    if (!snap.exists) {
      return {ok: false, message: "Intent không tồn tại."};
    }
    const intent = snap.data() ?? {};
    if (intent.deviceId !== deviceId) {
      return {ok: false, message: "Sai deviceId."};
    }

    // Auto-expire khi quá hạn
    let status = intent.status as StatusRes["status"];
    if (
      status === "pending" &&
      intent.expiresAt &&
      intent.expiresAt.toMillis() < Date.now()
    ) {
      status = "expired";
      await ref.update({status: "expired"});
    }

    return {
      ok: true,
      status,
      reward: status === "approved" ? intent.reward : undefined,
    };
  },
);

// ─────────────────────────────────────────────────────────
// approvePayment — ADMIN ONLY (require token)
// ─────────────────────────────────────────────────────────

interface ApproveReq {
  intentId: string;
  adminToken: string;
  note?: string;
}
interface ApproveRes {
  ok: boolean;
  message: string;
  intent?: {
    intentId: string;
    deviceId: string;
    packId: string;
    amount: number;
    memo: string;
    reward: PaymentReward;
  };
}

export const approvePayment = onCall(
  {region: REGION, secrets: [ADMIN_TOKEN]},
  async (req: CallableRequest<ApproveReq>): Promise<ApproveRes> => {
    const data = req.data ?? ({} as ApproveReq);
    const intentId = String(data.intentId ?? "").trim();
    const token = String(data.adminToken ?? "").trim();
    const note = String(data.note ?? "").trim();

    if (token !== ADMIN_TOKEN.value()) {
      throw new HttpsError("permission-denied", "Sai admin token.");
    }
    if (!intentId) {
      return {ok: false, message: "Thiếu intentId."};
    }

    const ref = db.collection("payments").doc(intentId);
    try {
      const result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) {
          return {ok: false, message: "Intent không tồn tại."};
        }
        const intent = snap.data() ?? {};
        if (intent.status !== "pending") {
          return {
            ok: false,
            message: `Intent đã ${intent.status}, không thể approve.`,
          };
        }
        tx.update(ref, {
          status: "approved",
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          note,
        });
        return {
          ok: true,
          message: "Approve thành công.",
          intent: {
            intentId,
            deviceId: intent.deviceId,
            packId: intent.packId,
            amount: intent.amount,
            memo: intent.memo,
            reward: intent.reward,
          },
        };
      });
      return result;
    } catch (err) {
      console.error("[approvePayment] failed:", err);
      return {ok: false, message: "Lỗi server, thử lại sau."};
    }
  },
);

// ─────────────────────────────────────────────────────────
// rejectPayment — ADMIN ONLY (vd sai memo, refund)
// ─────────────────────────────────────────────────────────

interface RejectReq {
  intentId: string;
  adminToken: string;
  reason?: string;
}

export const rejectPayment = onCall(
  {region: REGION, secrets: [ADMIN_TOKEN]},
  async (req: CallableRequest<RejectReq>) => {
    const data = req.data ?? ({} as RejectReq);
    const intentId = String(data.intentId ?? "").trim();
    const token = String(data.adminToken ?? "").trim();
    const reason = String(data.reason ?? "").trim();

    if (token !== ADMIN_TOKEN.value()) {
      throw new HttpsError("permission-denied", "Sai admin token.");
    }
    if (!intentId) {
      return {ok: false, message: "Thiếu intentId."};
    }

    const ref = db.collection("payments").doc(intentId);
    await ref.update({
      status: "rejected",
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      note: reason,
    });
    return {ok: true, message: "Reject thành công."};
  },
);

// ─────────────────────────────────────────────────────────
// listPendingPayments — ADMIN ONLY (cho admin panel)
// ─────────────────────────────────────────────────────────

interface ListReq {
  adminToken: string;
  limit?: number;
}

export const listPendingPayments = onCall(
  {region: REGION, secrets: [ADMIN_TOKEN]},
  async (req: CallableRequest<ListReq>) => {
    const data = req.data ?? ({} as ListReq);
    const token = String(data.adminToken ?? "").trim();
    const limit = Math.min(Number(data.limit ?? 50), 200);

    if (token !== ADMIN_TOKEN.value()) {
      throw new HttpsError("permission-denied", "Sai admin token.");
    }

    const snap = await db
      .collection("payments")
      .where("status", "==", "pending")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const intents = snap.docs.map((d) => {
      const it = d.data();
      return {
        intentId: d.id,
        deviceId: it.deviceId,
        packId: it.packId,
        amount: it.amount,
        memo: it.memo,
        description: it.description,
        createdAt: it.createdAt?.toMillis?.() ?? 0,
        expiresAt: it.expiresAt?.toMillis?.() ?? 0,
      };
    });

    return {ok: true, intents};
  },
);

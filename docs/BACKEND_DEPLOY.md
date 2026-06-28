# Backend Deploy Guide — Phase 17 + 18

Hướng dẫn deploy Firebase Cloud Functions cho coupon + referral + analytics + MoMo payment.

## Tổng quan

Phase 17 + 18 thêm 5 backend pieces:
1. **Cloud Functions (Phase 17)**: validateCoupon, validateReferral, registerReferralCode
2. **Cloud Functions (Phase 18)**: createPaymentIntent, getPaymentStatus, approvePayment, rejectPayment, listPendingPayments
3. **Firestore collections**: `coupons`, `coupon_claims`, `referrals`, `analytics_events`, `payments`
4. **Client SDK**: `src/services/coupon-referral-api.ts`, `src/services/analytics.ts`, `src/services/payment-api.ts`
5. **Admin panel**: `public/admin.html` standalone (deploy cùng dist Netlify)

Coupon/referral optional — nếu không deploy backend, client tự fallback localStorage.
Payment cần backend deploy + secret `ADMIN_TOKEN` set + `MOMO_PHONE` env.

---

## 0. ⚠️ PREFLIGHT BẮT BUỘC trước khi deploy

Functions **v2** (SDK firebase-functions ^7) cần các điều kiện sau, **không có là deploy treo hoặc fail im lặng**:

1. **Firebase Blaze plan (pay-as-you-go)** — v2 functions chạy trên Cloud Run, KHÔNG support Spark free plan.
   - Upgrade tại https://console.firebase.google.com/project/tu-tien-cbff0/usage/details → chọn Blaze.
   - Set budget alert $5/tháng để khỏi sốc bill (functions free tier 2M invocations/tháng).

2. **Enable 4 Google Cloud APIs** (mở Console → APIs Library, search & Enable):
   - Cloud Functions API
   - Cloud Build API
   - Artifact Registry API
   - Cloud Run Admin API

3. **`firebase login` đã chạy** — kiểm tra: `firebase login:list` phải in email.

4. **Project đúng** — `firebase use` phải in `tu-tien-cbff0`.

Bỏ qua bất kỳ bước nào → deploy đứng (không in lỗi) hoặc 403.

---

## 1. Init một lần (nếu chưa có functions/)

```bash
npm install -g firebase-tools
firebase login
firebase use --add  # chọn tu-tien-cbff0
```

Repo này đã có sẵn `functions/` + `firebase.json` → **SKIP** init.

## 2. Update code khi sửa backend logic

Source of truth: `proxy/coupon-referral-function.ts` → copy vào `functions/src/index.ts`:

```bash
cp proxy/coupon-referral-function.ts functions/src/index.ts
cd functions && npm install   # idempotent
npm run lint && npm run build # verify trước khi deploy
cd ..
```

## 3. Deploy

⚠️ **CHẠY TỪ ROOT REPO**, không `cd functions` trước:

```bash
cd /Users/admin/Documents/Projects/game/tu-tien   # về root
firebase deploy --only functions --debug          # --debug để thấy step nào treo
```

Lần đầu deploy ~3-8 phút (CLI build container, push lên Artifact Registry, deploy Cloud Run). Lần sau ~1-2 phút.

### Troubleshooting — deploy đứng / fail

| Triệu chứng | Nguyên nhân | Fix |
|---|---|---|
| Treo ở "loading functions" > 2 phút | Spark plan, chưa enable APIs | Làm bước 0 preflight |
| `Error: HTTP Error: 403` | Service account thiếu permission | Console → IAM → cấp `Cloud Functions Admin` cho user |
| `cd: no such file: functions` | Đang chạy từ `functions/` rồi | `cd ..` về root trước |
| Lint fail 95 errors | Source dùng style cũ | `cp proxy/coupon-referral-function.ts functions/src/index.ts` (đã chuẩn Google style sau hotfix `f52ce41`) |
| `Property 'region' does not exist` | Code dùng v1 syntax | Đã fix ở `f52ce41` — pull lại main |
| Build OK nhưng functions không hiện trong Console | Region khác default | Check `https://console.firebase.google.com/project/tu-tien-cbff0/functions` → đổi dropdown region thành `asia-southeast1` |
| `Permission denied to enable service` | User thiếu quyền billing | Owner của project phải enable APIs lần đầu |

URL endpoints (region `asia-southeast1`):
```
https://asia-southeast1-<projectId>.cloudfunctions.net/validateCoupon
https://asia-southeast1-<projectId>.cloudfunctions.net/validateReferral
https://asia-southeast1-<projectId>.cloudfunctions.net/registerReferralCode
```

Client tự gọi qua Firebase SDK `httpsCallable` — không cần wire URL manually.

---

## 4. Tạo coupon thủ công

Vào Firebase Console → Firestore Database → Add document:

**Collection**: `coupons`
**Document ID**: code uppercase (vd `LAUNCH2026`)
**Fields**:
```json
{
  "reward": {
    "tienNgoc": 500,
    "actionTokens": 200
  },
  "description": "Sự kiện ra mắt — quà 500 TN!",
  "maxUses": 10000,
  "currentUses": 0,
  "expiresAt": "2026-12-31T23:59:59Z (Timestamp)",
  "newUserOnly": false,
  "enabled": true
}
```

Client gọi `validateCoupon(code, deviceId, turn)` → server atomic check + claim.

---

## 5. Firestore Security Rules

Update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ─── Save game (existing) ───
    match /users/{uid}/saves/{saveId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // ─── Coupons: read-only client (claim qua Cloud Function) ───
    match /coupons/{code} {
      allow read: if true;       // ai cũng đọc được info coupon
      allow write: if false;     // chỉ Cloud Function với admin SDK ghi được
    }

    // ─── Coupon claims: client không touch trực tiếp ───
    match /coupon_claims/{id} {
      allow read, write: if false;  // chỉ Cloud Function
    }

    // ─── Referrals: client chỉ đọc own doc ───
    match /referrals/{deviceId} {
      allow read: if true;
      allow write: if false;   // chỉ Cloud Function
    }

    // ─── Analytics: client write-only, không read ───
    match /analytics_events/{id} {
      allow create: if request.resource.data.keys().hasAll(['name', 'props', 'deviceId', 'serverTs']);
      allow read, update, delete: if false;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## 6. Analytics dashboard query

Mọi event lưu trong collection `analytics_events`. Query bằng Firebase Console → Firestore → Query, hoặc export sang BigQuery.

### Top events trong 7 ngày qua

```sql
-- BigQuery (sau khi enable export)
SELECT name, COUNT(*) as cnt
FROM `<project>.firestore_export.analytics_events_raw_latest`
WHERE document_id._timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY name
ORDER BY cnt DESC
LIMIT 20;
```

### Conversion rate per pack

```sql
WITH funnel AS (
  SELECT
    JSON_VALUE(props, '$.packId') as pack_id,
    SUM(CASE WHEN name = 'pack_view' THEN 1 ELSE 0 END) as views,
    SUM(CASE WHEN name = 'pack_purchase_intent' THEN 1 ELSE 0 END) as intents,
    SUM(CASE WHEN name = 'pack_purchase_complete' THEN 1 ELSE 0 END) as purchases
  FROM `<project>.firestore_export.analytics_events_raw_latest`
  WHERE name LIKE 'pack_%'
  GROUP BY pack_id
)
SELECT
  pack_id,
  views, intents, purchases,
  ROUND(intents / NULLIF(views, 0) * 100, 1) as view_to_intent_pct,
  ROUND(purchases / NULLIF(intents, 0) * 100, 1) as intent_to_buy_pct
FROM funnel
ORDER BY purchases DESC;
```

### Retention curve (D1 / D7 / D30)

```sql
WITH cohort AS (
  SELECT
    deviceId,
    DATE(MIN(clientTs)) as cohort_day
  FROM `<project>.firestore_export.analytics_events_raw_latest`
  GROUP BY deviceId
),
returns AS (
  SELECT
    c.cohort_day,
    DATE_DIFF(DATE(e.clientTs), c.cohort_day, DAY) as day_since,
    COUNT(DISTINCT e.deviceId) as returners
  FROM cohort c
  JOIN `<project>.firestore_export.analytics_events_raw_latest` e USING (deviceId)
  WHERE e.name = 'daily_login'
  GROUP BY c.cohort_day, day_since
)
SELECT
  cohort_day,
  MAX(CASE WHEN day_since = 0 THEN returners END) as d0,
  MAX(CASE WHEN day_since = 1 THEN returners END) as d1,
  MAX(CASE WHEN day_since = 7 THEN returners END) as d7,
  MAX(CASE WHEN day_since = 30 THEN returners END) as d30
FROM returns
GROUP BY cohort_day
ORDER BY cohort_day DESC;
```

### Mission completion rate

```sql
SELECT
  JSON_VALUE(props, '$.templateId') as mission,
  COUNT(*) as completed_count
FROM `<project>.firestore_export.analytics_events_raw_latest`
WHERE name = 'mission_claimed'
GROUP BY mission
ORDER BY completed_count DESC;
```

---

## 7. Cost estimate

Free tier Firestore:
- 50k read, 20k write, 20k delete / day
- 1 GB storage

Phase 17 traffic per active user / day (estimate):
- Daily login: 1 write
- 5 missions claimed: 5 writes
- 20 events (action, combat, location...): 20 writes (analytics)
- 1-2 coupon redeem: 2 writes

→ **~25-30 writes / user / day**. Free tier đỡ được ~700 active users / day. Sau scale up: Spark plan $0.18/100k write.

---

## 8. Privacy + GDPR

Analytics events KHÔNG track PII:
- ✗ Player name / nhân vật name
- ✗ Narrative content (story log)
- ✗ BYOK keys
- ✗ Save file content

CHỈ track metadata:
- Event name (`pack_view`, `mission_claimed`...)
- Event props (packId, missionId, value)
- Device ID (anonymous, không liên kết user identity)
- Session ID
- Timestamps + app version

User có thể opt-out qua `setAnalyticsEnabled(false)` (lưu localStorage).

---

## 9. Phase 18: MoMo Personal QR + Admin Approval (KHÔNG cần GPKD)

Flow: client tạo intent → mở QR/deeplink → user pay qua MoMo cá nhân → admin (Sếp) xác nhận sao kê → 1-click approve → reward auto credit.

### 9.1. Set Functions secrets (1 lần)

```bash
# Admin token — long random string, NEVER share
firebase functions:secrets:set ADMIN_TOKEN
# Khi prompt, paste: openssl rand -base64 32  (vd "xK3v9j...")

# MoMo phone nhận tiền + tên hiển thị (KHÔNG phải secret nhưng tiện set chung)
firebase functions:config:set momo.phone="0912345678" momo.name="Mac Hoi Tu Tien"
# Hoặc set env runtime (preferred v2):
echo "MOMO_PHONE=0912345678" >> functions/.env.tu-tien-cbff0
echo "MOMO_NAME=Mac Hoi Tu Tien" >> functions/.env.tu-tien-cbff0
```

### 9.2. Deploy

```bash
firebase deploy --only functions  # deploy 5 functions mới + secret rotate
firebase deploy --only firestore  # rules + composite index payments(status,createdAt)
```

Composite index `payments(status ASC, createdAt DESC)` cần ~2-3 phút build. Trong lúc đó `listPendingPayments` sẽ throw — chờ xong rồi mở admin.

### 9.3. Deploy admin panel

`public/admin.html` build sẵn vào dist khi `npm run build`. Truy cập:
```
https://tien-do.netlify.app/admin.html
```

Setup 1 lần trong browser admin:
- Paste 4 trường Firebase config (apiKey, projectId, appId, messagingSenderId)
- Paste `ADMIN_TOKEN` (đã set ở 9.1)
- Bookmark URL — config lưu trong localStorage, không cần nhập lại

### 9.4. Workflow xác nhận đơn

1. User nạp gói → admin.html hiện row pending với memo `TT-XXXXXX`
2. Mở MoMo app/web → sao kê → tìm giao dịch trùng memo + đúng amount
3. Click `✓ Approve` → user được credit ngay lập tức (poll 3s)
4. Sai memo / không tìm thấy → `✗ Reject` với reason → user nhận thông báo

Intent tự expire sau 15 phút nếu không approve.

### 9.5. Bảo mật

- `ADMIN_TOKEN` chỉ ở Firebase secret + admin browser localStorage. Không commit.
- Client KHÔNG biết reward (server PACK_REGISTRY authoritative). User edit packId → reject.
- Firestore rule: `payments/*` deny read/write client → chỉ Cloud Functions.
- Admin panel có `noindex` meta để không bị search engine index.

### 9.6. Khi nào upgrade lên MoMo Business gateway

Khi vượt ngưỡng manual: > 50 đơn/ngày, hoặc cần invoice xuất hoá đơn → đăng ký GPKD + MoMo Business (~2-4 tuần approval) → wire IPN webhook tự credit. File `functions/src/payments.ts` đã structure rõ để chỉ cần thêm 1 function `momoIpnCallback` thay cho `approvePayment` manual.

# Backend Deploy Guide — Phase 17

Hướng dẫn deploy Firebase Cloud Functions cho coupon + referral + analytics infrastructure.

## Tổng quan

Phase 17 thêm 3 backend pieces:
1. **Cloud Functions** (`proxy/coupon-referral-function.ts`): validateCoupon, validateReferral, registerReferralCode
2. **Firestore collections**: `coupons`, `coupon_claims`, `referrals`, `analytics_events`
3. **Client SDK** (đã wire): `src/services/coupon-referral-api.ts`, `src/services/analytics.ts`

Toàn bộ optional — nếu không deploy, client tự fallback localStorage (Phase 15 behavior).

---

## 1. Setup Firebase project

```bash
# Cài Firebase CLI nếu chưa có
npm install -g firebase-tools
firebase login

# Init project trong thư mục riêng (KHÔNG init vào root tu-tien để tránh đụng .gitignore)
mkdir tu-tien-backend && cd tu-tien-backend
firebase init functions
# Chọn: existing project (tu-tien), TypeScript, ESLint No
```

## 2. Copy function code

```bash
cp /Users/admin/Documents/Projects/game/tu-tien/proxy/coupon-referral-function.ts \
   functions/src/index.ts
cd functions
npm install firebase-admin firebase-functions
```

## 3. Deploy

```bash
firebase deploy --only functions
# Output: validateCoupon, validateReferral, registerReferralCode endpoints ready
```

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

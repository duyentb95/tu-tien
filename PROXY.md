# PROXY — Ẩn API Key Phía Server

Tài liệu setup AI proxy để API key (Gemini + DeepSeek) KHÔNG xuất hiện trong client bundle. Khi bật proxy, browser chỉ thấy URL proxy của bạn — key thực giấu ở server.

**Phase 8.1 update**: Proxy hiện hỗ trợ cả Gemini (`/chat`) và DeepSeek (`/chat-deepseek`).

## Tại sao cần?

Hiện tại key set qua `VITE_GEMINI_API_KEY_*` được Vite bake vào JS bundle. Bất kỳ ai mở DevTools đều thấy. Risk:
- Người khác copy key → spam quota miễn phí của bạn
- Quota free hết → game chết (cho đến reset 00:00 PT)

**Proxy fix**: key set ở server (Cloudflare/Firebase env vars), client chỉ gọi `https://your-proxy/chat`. Key không bao giờ leak.

---

## Lựa chọn 2 platform

| | **Cloudflare Worker** ⭐ | Firebase Functions |
|---|---|---|
| **Free quota** | 100K req/day | 2M invocations/tháng |
| **Cần thẻ tín dụng** | ❌ Không | ✅ Có (Blaze plan) |
| **Cold start** | ~0ms (V8 isolates) | 200ms-2s (container) |
| **Edge deploy** | ✅ 200+ POPs | ⚠ Multi-region nhưng không edge |
| **Setup time** | 5 phút | 15 phút |
| **Auth integration** | Tự xây | Firebase Auth có sẵn |
| **Recommend** | Đa số trường hợp | Khi đã có Firebase setup |

Em recommend **Cloudflare Worker** trừ khi bạn đã dùng Firebase Functions cho việc khác.

---

## Option A — Cloudflare Worker (5 phút)

### 1. Cài wrangler CLI

```bash
npm install -g wrangler
wrangler login   # mở browser auth
```

### 2. Set API keys secrets (deploy ngay được, KV setup sau)

```bash
cd proxy
wrangler secret put GEMINI_API_KEY_1
# Paste key khi prompt

# (Optional) thêm 2 keys để rotation
wrangler secret put GEMINI_API_KEY_2
wrangler secret put GEMINI_API_KEY_3
```

### 3. Deploy

```bash
wrangler deploy
# Output: Published mac-do-ai-proxy
#         https://mac-do-ai-proxy.YOUR-NAME.workers.dev
```

Copy URL trên.

### 4. (Optional, sau khi worker live) Setup KV để bật rate limit

```bash
wrangler kv namespace create RATELIMIT
# Output có dạng:
#   [[kv_namespaces]]
#   binding = "RATELIMIT"
#   id = "abc123..."
```

Mở `proxy/wrangler.toml`, uncomment block KV và paste `id`:
```toml
[[kv_namespaces]]
binding = "RATELIMIT"
id = "abc123..."
```

Deploy lại: `wrangler deploy`. Worker giờ enforce 50 req/giờ/IP.

### 5. Update Netlify env

Vào Netlify → Site → Environment → Add variable:

```
VITE_AI_PROXY_URL = https://mac-do-ai-proxy.YOUR-NAME.workers.dev/chat
```

Quan trọng: **XÓA** tất cả `VITE_GEMINI_API_KEY*` env (key sẽ không cần ở client nữa). Trigger Netlify redeploy.

### 6. Verify

Mở DevTools Network khi click "Hành ✦" → request đến `mac-do-ai-proxy.YOUR-NAME.workers.dev/chat` thay vì `generativelanguage.googleapis.com`. Key Gemini KHÔNG còn trong bundle JS.

Test bằng curl:
```bash
curl https://mac-do-ai-proxy.YOUR-NAME.workers.dev/health
# Expected: { "ok": true, "service": "mac-do-ai-proxy", "version": "1.0" }
```

---

## Add DeepSeek support (Phase 8.1 — văn phong tu tiên tốt hơn)

### Tại sao thêm DeepSeek?

| Aspect | Gemini Flash | **DeepSeek-V3** |
|---|---|---|
| Văn phong Trung-Việt cổ phong | Khá | **Xuất sắc** (train Chinese literature nhiều) |
| Giá | $0.075/$0.30 per 1M | $0.27/$1.10 per 1M (3-4x đắt hơn) |
| NSFW filter | Khá gay gắt | Lỏng hơn |
| JSON output | ✅ Native | ✅ `response_format` |

→ Strategy B Hybrid: Logic Engine (JSON) dùng Gemini Flash (rẻ), Narrative Engine (prose) dùng DeepSeek (đẹp hơn).

### Setup DeepSeek qua Worker

```bash
# 1. Tạo DeepSeek API key tại https://platform.deepseek.com/api_keys
#    ($5 trial credit, không cần thẻ tín dụng — chỉ verify SĐT)

# 2. Thêm secret vào Worker
cd proxy
wrangler secret put DEEPSEEK_API_KEY_1
# Paste key vừa tạo

# (Optional) Rotation thêm keys
wrangler secret put DEEPSEEK_API_KEY_2
wrangler secret put DEEPSEEK_API_KEY_3

# 3. Re-deploy
wrangler deploy
```

### Verify

```bash
curl -X POST https://YOUR-WORKER.workers.dev/chat-deepseek \
  -H "Origin: https://tien-do.netlify.app" \
  -H "content-type: application/json" \
  -d '{"prompt":"Viết 1 câu cổ phong về tu tiên"}'
# → { "text": "...", "model": "deepseek-chat", "provider": "deepseek" }
```

### Set Netlify env

```
VITE_AI_PROXY_URL          = https://YOUR-WORKER.workers.dev/chat
VITE_AI_PROXY_URL_DEEPSEEK = https://YOUR-WORKER.workers.dev/chat-deepseek
```

(Hai URL khác nhau cùng worker — chỉ khác endpoint path)

### Setup KHÔNG dùng proxy (dev local)

Trong `.env.local`:
```
VITE_DEEPSEEK_API_KEY_1=sk-xxx
```

Game sẽ tự fetch trực tiếp `api.deepseek.com`. **Không dùng cho production** vì key lộ trong bundle.

---

## Option B — Firebase Cloud Functions (15 phút)

### 1. Firebase project setup (skip nếu đã có)

```bash
npm install -g firebase-tools
firebase login
firebase init functions   # chọn TypeScript, install deps
```

⚠ Cần upgrade lên **Blaze plan** (pay-as-you-go) — Firebase Functions không có ở Spark free plan. Free tier vẫn rộng (2M invocations/tháng).

### 2. Copy function code

```bash
cp proxy/firebase-function.ts functions/src/geminiProxy.ts
```

Export ở `functions/src/index.ts`:
```typescript
export { geminiProxy } from './geminiProxy';
```

### 3. Set secrets

```bash
firebase functions:secrets:set GEMINI_API_KEY_1
firebase functions:secrets:set GEMINI_API_KEY_2  # optional
firebase functions:secrets:set GEMINI_API_KEY_3  # optional
```

### 4. Deploy

```bash
firebase deploy --only functions:geminiProxy
# Output: Function URL (geminiProxy): https://us-central1-PROJECT.cloudfunctions.net/geminiProxy
```

### 5. Update Netlify env

```
VITE_AI_PROXY_URL = https://us-central1-PROJECT.cloudfunctions.net/geminiProxy
```

Xóa `VITE_GEMINI_API_KEY*`. Trigger redeploy.

---

## Architecture sau khi đã setup proxy

```
Trước (direct):
  Browser → generativelanguage.googleapis.com (key trong bundle ❌)

Sau (proxy):
  Browser → your-proxy.workers.dev/chat → generativelanguage.googleapis.com
            (key server-side ✅)        (key trong env vars ✅)
```

`src/ai/client.ts` tự detect: nếu `VITE_AI_PROXY_URL` set → đi qua proxy, không thì fallback gọi direct.

---

## Rate limit (server-side)

Cả 2 option đều enforce:
- **50 req/giờ per IP** (vs client-side cũ 60 req/giờ per browser)
- Trả 429 khi vượt
- Cloudflare lưu count trong KV (persistent), Firebase dùng in-memory (per-instance)

Bạn có thể adjust trong worker/function code (`RATE_LIMIT_MAX`).

---

## Origin whitelist

Worker reject request không từ:
- `https://tien-do.netlify.app`
- `http://localhost:5173` (dev)
- `*.netlify.app` (preview deploys)

Sửa `ALLOWED_ORIGINS` trong code nếu deploy domain khác.

---

## Cost ước tính

| Scenario | Cloudflare | Firebase |
|---|---|---|
| 100 user × 30 turn/day = 3K req/day = 90K/tháng | $0 (under 100K/day) | $0 (under 2M/tháng) |
| 1000 user × 50 turn/day = 50K/day = 1.5M/tháng | $0 (under 100K/day) | $0.40/tháng |
| 10K user × 100 turn/day = 1M/day | $5/tháng | $200/tháng |

→ Cloudflare scale tốt hơn cho game free-to-play.

---

## Migration plan

1. **Hôm nay**: Setup proxy (Cloudflare hoặc Firebase), test với dev env
2. **Tuần sau**: Bật proxy trên Netlify production, monitor 7 ngày
3. **Sau khi ổn**: Xóa `VITE_GEMINI_API_KEY*` khỏi Netlify env → key chỉ tồn tại ở proxy server
4. **Optional**: Rotate keys cũ (đã lộ public) → tạo keys mới chỉ set server-side

---

## Troubleshooting

### CORS error
- Origin chưa whitelist → thêm domain vào `ALLOWED_ORIGINS` trong worker, redeploy
- Hoặc Netlify preview URL mỗi PR khác → đảm bảo có `*.netlify.app` trong list

### 429 Rate limit hit quá nhanh
- Tăng `RATE_LIMIT_MAX` trong worker (vd 100/giờ)
- Hoặc đổi window nhỏ hơn (vd 1000/ngày)

### Proxy chết
- Client tự fallback về mock (vì error throw trong `callViaProxy` được narrative-service catch)
- Verify bằng `curl https://your-proxy/health`

### Bundle vẫn lộ key sau khi bật proxy
- DevTools → Sources → tìm "AIza" trong bundle
- Nếu vẫn còn → chưa xóa `VITE_GEMINI_API_KEY*` khỏi Netlify env. Xóa rồi trigger redeploy.

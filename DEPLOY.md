# DEPLOY — Mặc Hội Tiên Đồ

Game là static SPA (React) gọi Gemini/Imagen trực tiếp từ browser — **không cần backend riêng**, nên có nhiều lựa chọn deploy.

---

## So sánh các option

| | **Netlify** ⭐ | Cloudflare Pages | Vercel | VPS (91.108.104.135) |
|---|---|---|---|---|
| **Setup time** | 2 phút | 2 phút | 2 phút | 5-10 phút (lần đầu) |
| **Free tier** | 100GB/mo bandwidth | Unlimited bandwidth | 100GB/mo | Tự trả VPS |
| **HTTPS auto** | ✅ | ✅ | ✅ | ❌ cần certbot |
| **CDN global** | ✅ | ✅ (200+ edges) | ✅ | ❌ chỉ 1 region |
| **Custom domain** | Free | Free | Free | Tự config DNS |
| **Atomic deploy** | ✅ instant | ✅ instant | ✅ instant | ✅ (atomic swap) |
| **Auto deploy on push** | ✅ | ✅ | ✅ | ❌ (manual hoặc CI) |
| **Preview per PR** | ✅ | ✅ | ✅ | ❌ |
| **Rollback** | 1 click | 1 click | 1 click | `make rollback` |
| **Backend logic sau** | Functions (limited) | Workers (limited) | Functions | ⭐ full control |
| **Privacy/control** | Netlify infra | CF infra | Vercel infra | ⭐ riêng của bạn |
| **Cost ước tính** | $0 cho 10K users/mo | $0 (unlimited) | $0 cho 10K users/mo | $5-20/mo VPS |

**Khuyến nghị:** Bắt đầu với **Netlify** (đơn giản nhất, free). Khi cần proxy AI backend → migrate sang VPS (đã có sẵn script).

---

## Cách 1: Netlify (KHUYẾN NGHỊ — 2 phút)

### Option A — Drag & drop (nhanh nhất, không cần git)

```bash
cd /Users/admin/Documents/Projects/game/tu-tien
npm run build
```

Mở [https://app.netlify.com/drop](https://app.netlify.com/drop) → kéo thả folder `dist/` vào → xong. URL random như `https://amazing-cat-123.netlify.app`.

### Option B — CLI deploy (chính thức)

```bash
make netlify-init    # 1 lần đầu — link project
make netlify-prod    # mỗi lần deploy
```

Hoặc thủ công:
```bash
npm install -g netlify-cli
netlify login        # mở browser auth
netlify init         # tạo site mới (chọn "Create & configure a new site")
npm run build
netlify deploy --prod
```

### Option C — Auto-deploy từ GitHub (best for team)

1. Push code lên GitHub repo
2. Vào [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import from Git"
3. Chọn repo, Netlify tự đọc `netlify.toml` (build command + publish dir)
4. Add environment variables nếu cần (Settings → Environment): `VITE_GEMINI_API_KEY`, `VITE_FIREBASE_*`
5. Mỗi git push → auto deploy. Mỗi PR có preview URL riêng.

**Custom domain:**
- Vào Site settings → Domain → Add custom domain
- Trỏ A/CNAME record về Netlify (họ hướng dẫn cụ thể)
- HTTPS auto qua Let's Encrypt sau ~1 phút

---

## Cách 2: Cloudflare Pages (alternative — unlimited bandwidth)

Giống Netlify nhưng bandwidth unlimited (Netlify giới hạn 100GB/tháng free).

```bash
npm install -g wrangler
wrangler login
npm run build
wrangler pages deploy dist --project-name=mac-do-tien-do
```

Hoặc auto deploy qua GitHub: dash.cloudflare.com → Workers & Pages → Create → Connect to Git.

File `public/_redirects` + `public/_headers` đã có sẵn, CF Pages tự đọc.

---

## Cách 3: VPS (cho khi cần backend/full control)

VPS đã setup `root@91.108.104.135`. Dùng khi:
- Cần proxy AI để ẩn API key (Phase 7)
- Cần custom rate limit / auth
- Cần host data riêng (privacy)
- Muốn full control infrastructure

```bash
make setup           # Lần đầu — provision VPS (nginx, firewall)
make deploy          # Mỗi lần update — build + sync + reload
make rollback        # Khi có lỗi
make logs            # Live tail nginx
```

Xem chi tiết kiến trúc atomic deploy ở mục "Cách 4: VPS chi tiết" bên dưới.

---

## Environment variables (cần cho AI)

Mặc dù game chạy được với Mock AI fallback (không key), production nên config:

| Variable | Bắt buộc | Mô tả |
|---|---|---|
| `VITE_GEMINI_API_KEY` | Optional | Gemini API key. Không có → dùng mock chunks |
| `VITE_FIREBASE_API_KEY` | Optional | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Optional | vd `my-app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Optional | vd `my-app-12345` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Optional | vd `my-app.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Optional | numeric |
| `VITE_FIREBASE_APP_ID` | Optional | `1:123:web:abc` |

**Netlify:** Site settings → Environment → Add variable → trigger redeploy.
**Cloudflare:** Project → Settings → Environment variables.
**VPS:** `.env.local` đã `.gitignore` → upload qua `scp` hoặc set ở build CI.

⚠️ **Lưu ý security:** Vite expose `VITE_*` vào client bundle. Bất kỳ ai mở DevTools đều thấy được. Key Gemini với tier free ≤ $0/tháng nên risk thấp. Cao cấp hơn: proxy qua Firebase Functions hoặc Netlify Functions (xem [ADR-002](./docs/adr/002-mock-ai-fallback.md)).

---

## Decision flowchart

```
Bạn có domain riêng?
├─ Có → Netlify/CF Pages (free SSL auto, custom domain)
└─ Không
   ├─ Test nhanh? → Netlify drag-drop (URL random ok)
   └─ Cần URL cố định? → Netlify subdomain free (.netlify.app)

Bạn có sẽ cần backend (proxy AI, custom logic)?
├─ Sẽ cần sớm → VPS từ đầu cho dễ migration
└─ Chưa → Netlify trước, migrate khi cần
```

---

## Cách 4: VPS chi tiết

### Kiến trúc

```
Local máy bạn                           VPS 91.108.104.135
─────────────                           ───────────────────
npm run build                           /var/www/mac-do/
       │                                ├── current/         ← release active
       │                                ├── releases/
       └─► rsync ──────────────────────►│   ├── 20260625-152030/
                                        │   ├── 20260625-160145/
                                        │   └── ...
                                        ├── backups/        ← 3 backup gần nhất
                                        └── (nginx serve current/)
```

### Lần đầu

```bash
# 1. Verify SSH
ssh root@91.108.104.135 echo "connected"
# Nếu fail: ssh-copy-id root@91.108.104.135

# 2. Provision (cài nginx, certbot, firewall, dirs)
make setup

# 3. Deploy lần đầu
make deploy
# → http://91.108.104.135/
```

### Recurring deploy

```bash
make deploy        # full: typecheck → test → build → sync → reload  (~25s)
make deploy-fast   # skip build, dùng dist/ hiện tại                  (~5s)
make deploy-dry    # dry-run, xem sẽ thay đổi gì
make rollback      # khôi phục release trước                          (~5s)
```

### Monitoring

```bash
make logs          # tail access + error log live
make logs-error    # chỉ error
make status        # nginx + releases + backups list
make ssh           # SSH thẳng vào VPS
```

### HTTPS (cần domain thật)

```bash
ssh root@91.108.104.135
# Update server_name trong /etc/nginx/sites-available/mac-do
sed -i 's/server_name 91.108.104.135;/server_name tu-tien.example.com;/' /etc/nginx/sites-available/mac-do
nginx -t && nginx -s reload
certbot --nginx -d tu-tien.example.com   # auto edit config
certbot renew --dry-run                   # test auto-renewal
```

---

## Troubleshooting chung

### Trang trắng sau deploy
- DevTools Console — thường lỗi JS chunk hash mismatch (cache cũ)
- Hard refresh `Cmd+Shift+R`
- Hoặc bump version trong `package.json`

### Service worker stuck cache cũ
DevTools → Application → Service Workers → Unregister → reload.

### Netlify build fail "tsc not found"
Set `NODE_VERSION=22` trong Site settings → Environment (đã có trong `netlify.toml`).

### VPS deploy fail "Permission denied"
- SSH key chưa add vào `~/.ssh/authorized_keys` trên VPS
- Hoặc đang dùng user khác (script default `root`)

### Bundle quá lớn (warning > 500KB)
Lazy import các screen ít dùng:
```typescript
const SecretRealmScreen = lazy(() => import('@features/secret-realm'));
```

---

## Files liên quan

**Netlify/Cloudflare:**
- `netlify.toml` — build config + headers + redirects
- `public/_redirects` — SPA fallback (backup)
- `public/_headers` — cache + security headers (backup)

**VPS:**
- `scripts/deploy.sh` — main deploy logic
- `scripts/setup-vps.sh` — first-time provisioning
- `scripts/nginx-mac-do.conf` — nginx site config

**Shortcuts:**
- `Makefile` — `make help` để xem tất cả commands

---

## CI/CD template (GitHub Actions)

Nếu dùng VPS + auto-deploy on push:

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS
on:
  push: { branches: [main] }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run typecheck && npm run test
      - run: npm run build
      - name: Deploy
        env:
          SSH_KEY: ${{ secrets.VPS_SSH_KEY }}
        run: |
          mkdir -p ~/.ssh && echo "$SSH_KEY" > ~/.ssh/id_rsa && chmod 600 ~/.ssh/id_rsa
          ssh-keyscan 91.108.104.135 >> ~/.ssh/known_hosts
          ./scripts/deploy.sh --no-build
```

Netlify thì không cần CI — push GitHub là tự deploy.

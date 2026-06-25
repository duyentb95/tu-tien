# Mặc Hội Tiên Đồ — Tu Tiên RPG

Game tu tiên nhập vai thế giới mở, dẫn dắt bởi AI (Google Gemini + Imagen).

> **Trạng thái:** Phase 0 ✅ scaffold xong. Phase 1 ✅ vertical slice demo (Initial → Setup → Gameplay loop) hoàn tất.
> Sẵn sàng Phase 2 (linh căn, độ kiếp), Phase 3 (world map), v.v.

---

## ✨ Hai cách chạy demo

### Cách 1 — Mở trực tiếp `demo.html` (không cần cài gì)

Mở [demo.html](./demo.html) bằng trình duyệt là chạy luôn.

- Dùng React + Tailwind từ CDN.
- 6 chunk kịch bản dựng sẵn (mock AI) — chọn action nào cũng loop qua 6 chunk demo.
- Mục đích: xem được toàn bộ flow `Initial → Setup → Gameplay` + design system trong ~10 giây, không cần Node hay API key.

### Cách 2 — Dev server Vite (full codebase)

```bash
cd /Users/admin/Documents/Projects/game/tu-tien

# 1. Cài deps (lần đầu ~2 phút)
npm install

# 2. (Tuỳ chọn) Cấu hình env nếu muốn dùng Gemini thật
cp .env.example .env.local
# → mở .env.local, điền VITE_GEMINI_API_KEY và 6 biến VITE_FIREBASE_*
# → nếu để trống → app tự fallback sang Mock AI (như demo.html)

# 3. Chạy
npm run dev          # http://localhost:5173

# 4. Test
npm run test         # 22 unit test (realms + leveling + parser)
```

**Khi nào dùng Vite version:**
- Khi muốn AI thật sinh story (cần Gemini key — free tại https://aistudio.google.com/apikey).
- Khi develop tính năng mới — codebase modular đầy đủ TypeScript, có HMR, có test.
- Khi muốn save/load qua localStorage giữa session.

---

## 🎮 Flow demo

```
┌──────────────────┐
│  Initial Screen  │ ── Logo "Mặc Đồ", 12 hạt vàng floating, glow pulse
│  · Tiếp Tục      │
│  · Hành Trình ▼  │
│  · Cài Đặt       │
└────────┬─────────┘
         │ click "Hành Trình Mới"
         ▼
┌──────────────────┐
│  Game Setup      │ ── Form tạo nhân vật
│  · Tên · Giới    │
│  · Tính cách     │
│  · Mô tả         │
│  · Tựa truyện    │
│  · Độ khó        │
└────────┬─────────┘
         │ click "Khởi Hành ✦"
         ▼
┌─────────────────────────────────────────────┐
│  Gameplay                                    │
│  ┌──────────────────────┐  ┌──────────┐    │
│  │ Story view (chat-     │  │ Sidebar  │   │
│  │   like) với dialogue  │  │ HP bar    │   │
│  │   bubble + narrative  │  │ EXP bar   │   │
│  │   chunks              │  │ Stats     │   │
│  │ ↓ Đang suy ngẫm…     │  │ Currency  │   │
│  └──────────────────────┘  │ AP        │   │
│  ┌──────────────────────┐  │ Inventory │   │
│  │ 4 Action button       │  │ Skill cnt │   │
│  │ + custom input        │  └──────────┘   │
│  └──────────────────────┘                  │
└─────────────────────────────────────────────┘
        │ chọn action → AI tiếp → loop ─┐
        └───────────────────────────────┘
```

---

## 📁 Cấu trúc dự án

```
tu-tien/
│
├── 📜 PREVIEW.md                 # Prototype gốc 1.3MB (tham chiếu, không build)
├── 📋 BUILD_PLAN.md              # Roadmap 6 phase / 22 tuần
├── 🏛️ ARCHITECTURE.md            # Chi tiết folder structure & data flow
├── 🗺️ roadmap.html               # Timeline interactive (mở browser)
├── 🖼️ architecture-diagram.svg   # Sơ đồ 4 tầng
├── ✨ demo.html                  # ⭐ Demo standalone — mở trực tiếp browser!
│
├── 📦 package.json · vite.config.ts · tsconfig.json · tailwind.config.ts
├── ⚙️ .env.example · .gitignore · .eslintrc.cjs · .prettierrc
├── 📄 README.md (file này)
│
└── src/
    ├── main.tsx                  # React entry
    ├── App.tsx                   # Stage router
    │
    ├── core/                     # ░ Logic thuần — không React, testable
    │   └── stats/                #   - realms.ts + test (10 case)
    │                             #   - leveling.ts + test (8 case)
    │
    ├── ai/                       # ░ Tầng LLM — 1 chỗ duy nhất gọi Gemini
    │   ├── client.ts             #   - retry 3× exponential backoff
    │   ├── parser.ts + test      #   - tách narrative/dialogue/action
    │   ├── mock.ts               #   - 6 chunk fixture cho demo offline
    │   ├── narrative-service.ts  #   - wrap client + mock + parser
    │   └── prompts/narrative.ts  #   - prompt template
    │
    ├── services/                 # ░ I/O ngoài
    │   └── firebase.ts           #   - lazy init, env-driven config
    │
    ├── state/                    # ░ Zustand store + Immer
    │   └── game-store.ts         #   - player, log, actions, settings, persist
    │
    ├── features/                 # ░ UI grouped by domain
    │   ├── initial-screen/       #   - logo, particles, CTA buttons
    │   ├── game-setup/           #   - character creation form
    │   └── gameplay/             #   - story view + actions + sidebar
    │       ├── DialogueBubble.tsx
    │       ├── StoryView.tsx
    │       ├── ActionPanel.tsx
    │       └── PlayerSidebar.tsx
    │
    ├── shared/                   # ░ UI tái sử dụng
    │   └── components/           #   - BrandLogo, Button, FormField
    │
    ├── data/                     # ░ Static data port từ prototype
    │   ├── initial-stats.ts      #   - INITIAL_STATS
    │   ├── rarity-distribution.ts#   - 6-bracket × 6-rarity table
    │   ├── difficulty.ts         #   - 4 levels + multipliers
    │   ├── status-library.ts     #   - STATUS_LIBRARY + LONG_TERM templates
    │   ├── personalities.ts      #   - 8 tính cách + 6 style + 6 pronouns
    │   └── default-realms.ts     #   - Luyện Khí → Tiên Nhân
    │
    ├── types/                    # ░ TypeScript single source of truth
    │   ├── character.ts          #   - Character, PlayerCharacter, NPC...
    │   ├── item.ts               #   - Item, Rarity, Category
    │   ├── skill.ts
    │   └── world.ts              #   - Location, Faction, SecretRealm
    │
    ├── styles/
    │   ├── tokens.css            #   - CSS variables từ design system
    │   └── global.css            #   - Tailwind layers + components
    │
    └── test/setup.ts             # Vitest setup
```

**Tổng: 37 source files, 2976 LOC.**

---

## 🎨 Design system (trích từ file upload)

Toàn bộ tokens được định nghĩa ở 2 nơi đồng bộ:

1. **`src/styles/tokens.css`** — CSS variables
2. **`tailwind.config.ts`** — Tailwind theme extend

| Nhóm | Token | Hex |
|---|---|---|
| Ink (dark base) | `ink-900` → `ink-400` | `#0a0f0a` → `#2a2418` |
| Gold (kim sắc) | `gold-50` → `gold-700` | `#f9efd6` → `#a8823f` |
| Jade (lục sắc) | `jade-200` → `jade-800` | `#a9bba4` → `#3e4f3c` |
| Ember (accent CTA) | `ember-200`, `ember-500` | `#f0a98e`, `#d97757` |
| Spirit (linh khí mystical) | `spirit-200` → `spirit-600` | `#cdbcff` → `#9b95c0` |
| Azure (thiên đạo) | `azure-400`, `azure-600` | `#9ec9e8`, `#6aa3c4` |

**Class component dùng sẵn:**
- `.panel-gold` · `.panel-jade` — khung viền có glow khi hover
- `.btn-primary` · `.btn-secondary` · `.btn-ghost` — CTA
- `.text-celestial` — gold gradient text cho heading
- `.divider-gold` — đường ngang gold có ánh sáng
- `.text-rarity-{common,good,rare,epic,mythic,legendary}` — màu theo phẩm chất

---

## 🧪 Test

```bash
npm run test          # 22 test: realms (10) + leveling (8) + parser (4)
npm run test:coverage # coverage HTML report cho src/core
```

**Đã có coverage:**
- `core/stats/realms.test.ts` — getRealmInfoFromLevel, calculateLevelFromRealmString, isSameRealm, realmGap
- `core/stats/leveling.test.ts` — calculateMaxExpForLevel, applyExpGain với boundary cases
- `ai/parser.test.ts` — parse narrative + dialogue + actions, fallback khi AI quên tag

---

## 🛠️ Lệnh thường dùng

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Vite dev server, HMR, mở browser tự động |
| `npm run build` | Type-check + production build vào `dist/` |
| `npm run preview` | Serve bundle build để verify trước deploy |
| `npm run test` | Vitest 1 lần |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Coverage report cho `src/core` |
| `npm run typecheck` | TypeScript check (không emit) |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format toàn bộ `src/` |

---

## 🐛 Troubleshooting

**Q: `demo.html` không hiện gì?**
A: Cần internet (CDN load React + Tailwind từ esm.sh/cdn.tailwindcss.com). Mở DevTools Console xem có lỗi network không.

**Q: `npm install` cực chậm?**
A: Đây là install lần đầu (~200 packages, ~150MB). Lần sau sẽ ≤ 30s. Nếu lâu hơn 5 phút, thử `npm install --prefer-offline` hoặc dùng pnpm/bun.

**Q: Vite chạy nhưng màn hình trắng?**
A: Mở DevTools Console. Thường do:
- Quên `cp .env.example .env.local` → fix bằng cách tạo file rỗng cũng được (mock AI sẽ tự kích hoạt).
- Sai version Node (cần ≥ 20) → `node -v` check.

**Q: AI không gọi được (lỗi 400/403)?**
A: Check `VITE_GEMINI_API_KEY` trong `.env.local`. Lấy free tại https://aistudio.google.com/apikey.
Tạm thời xóa key → app tự fallback sang Mock AI.

**Q: Mất bản lưu sau khi refresh?**
A: Demo dùng localStorage key `tu-tien:save:slot-0`. Mở DevTools → Application → Local Storage để kiểm tra.

---

## 🗺️ Phase tiếp theo

Xem **BUILD_PLAN.md** cho roadmap đầy đủ:

| Phase | Thời gian | Trạng thái |
|---|---|---|
| 0 — Scaffold | Tuần 1 | ✅ Done |
| 1 — Refactor + demo loop | Tuần 2–5 | 🟡 Vertical slice done, chưa extract full PREVIEW.md |
| 2 ★ — Linh căn · Độ kiếp · Tâm cảnh | Tuần 6–8 | ⏳ Pending |
| 3 ★ — World map · Bí cảnh | Tuần 9–11 | ⏳ Pending |
| 4 ★ — Pháp bảo · Trận pháp · Linh thú | Tuần 12–14 | ⏳ Pending |
| 5 ★ — Tông môn · Đạo lữ · Động phủ | Tuần 15–17 | ⏳ Pending |
| 6 — Polish · Balance · Launch | Tuần 18–22 | ⏳ Pending |

---

## ⚠️ Disclaimer

- AI sinh nội dung không phải lúc nào cũng phù hợp — có chế độ NSFW gate 18+.
- Fan-fic mode cho phép player tự nhập tên IP gốc — player tự chịu trách nhiệm copyright.
- Gemini API có chi phí — xem dashboard Google AI Studio để theo dõi quota.

## 📜 License

Chưa quyết định. Tạm thời: All rights reserved.

# CLAUDE.md — Master Config cho game Mặc Hội Tiên Đồ

> Đọc file này trước khi bắt đầu mọi session với project. Đây là "studio bible" — quy tắc, kiến trúc, gotchas mà mọi đóng góp phải tuân thủ.

---

## 🎯 Project context (đọc 30 giây)

**Game:** Mặc Hội Tiên Đồ — RPG tu tiên nhập vai thế giới mở, AI-driven (Gemini).

**Trạng thái:** **v1.0 production-ready** tại https://tien-do.netlify.app. Hoàn thành Phase 1-7 + 5 refactor prototype patterns. Sẵn sàng public release.

**Stack:** Vite + React 18 + TypeScript strict + Tailwind + Zustand+Immer + Zod + Firebase (optional cloud sync) + Gemini 2.5 Flash via Cloudflare Worker proxy + lottie-react.

**Brand:** "Mặc Đồ" — design system Noto Serif headings + Be Vietnam Pro body + JetBrains Mono numbers; palette ink/gold/jade/ember/spirit; motif 4-corner brackets ┏ ┓ ┗ ┛.

**Architecture key patterns** (đọc file liên quan trước khi sửa):
- **2-step Hybrid Logic** (`src/ai/narrative-service.ts`): Logic Engine sinh 6 scenarios → dice roll → Narrative Engine viết prose. Toggle `settings.useHybridLogic`.
- **2-tier lore** (`src/types/lore.ts` + `src/ai/tag-parser.ts`): `LORE_*` (rumor chưa gặp) → `WORLD_*` (materialized với `loreId`).
- **30+ tag taxonomy** (`src/ai/tag-parser.ts`): từ `[EXP+]` tới `[ENCOUNTER_REWARD]`, `[TIME_PASSED]`, `[APPLY_LONG_TERM_STATUS]`, `[CHARACTER_UPDATE]`.
- **Memory expand** (`src/types/memory.ts`): `eventHistory` rolling 30 + `customRules` user-defined + `recentMeaningfulActions`.
- **Fan-fic wizard** (`src/ai/prompts/fan-fic-analyze.ts`): 3 fields → AI analyze hydrate full settings + initialWorldElements. KHÔNG còn preset cứng.
- **Multi-key rotation** (`src/ai/client.ts`): N keys round-robin + per-key block 60s khi 429. Support `VITE_GEMINI_API_KEY_1..10`.
- **AI Proxy** (`proxy/cloudflare-worker.js`): ẩn key server-side, rate limit per IP. Env `VITE_AI_PROXY_URL`.

---

## 📁 Folder structure & domain boundaries

| Folder | Owner | Quy tắc bất biến |
|---|---|---|
| `src/core/**` | Pure logic | KHÔNG import React. KHÔNG fetch. Mọi function pure, testable. Test coverage ≥ 70%. |
| `src/ai/**` | LLM layer | `client.ts` là chỗ DUY NHẤT gọi Gemini URL. Mọi response phải parse + validate qua Zod schema hoặc parser. Có mock fallback bắt buộc. |
| `src/services/**` | I/O ngoài | Firebase, IndexedDB, Cloud Storage. Lazy init. Env-driven config. |
| `src/state/**` | Zustand store | 1 slice/feature. Actions phải pure-ish (gọi service → mutate immer state). Persist tự động qua `saveToLocalStorage`. |
| `src/features/**` | UI per domain | Mỗi feature = 1 folder. Có index.tsx + sub-components. KHÔNG import lẫn nhau (chỉ qua store). |
| `src/shared/**` | Cross-feature UI | Components/hooks/utils dùng ở nhiều feature. KHÔNG có business logic. |
| `src/data/**` | Static data | Constants port từ prototype, balance numbers. KHÔNG có function side-effect. |
| `src/types/**` | TS interfaces | Single source of truth. Mọi feature import từ đây. |
| `src/lottie/**` | JSON animations | Bodymovin spec — shape layers ty:4, group wrapper ty:'gr', color RGBA 0-1. |
| `src/styles/**` | Global CSS | tokens.css = CSS variables; global.css = Tailwind layers + component classes. |
| `design/**` | Game design docs | GDD, narrative bibles. Bất biến — code phải tuân design, không ngược lại. |
| `docs/adr/**` | Architecture decisions | Mỗi quyết định lớn = 1 ADR. KHÔNG sửa ADR cũ — viết "Superseded by ADR-XXX". |
| `tests/**` | Unit + e2e | Vitest cho core/, Playwright cho e2e flows (planned). |

---

## ⚡ Quy tắc bất biến (path-scoped)

### `src/core/**`
- ❌ `import React` / `import { useState }`
- ❌ `fetch()` hoặc gọi Firebase trực tiếp
- ✅ Pure functions, mọi I/O qua parameter
- ✅ Math.random injectable (cho test): `(rng: () => number = Math.random) => ...`
- ✅ Mỗi function có 1 test case boundary

### `src/ai/**`
- ❌ Đừng tạo URL Gemini mới — dùng `callGemini()` duy nhất trong `client.ts`
- ❌ Đừng trust AI response raw — luôn `parseGameTags` + `parseNarrativeResponse`
- ✅ Mọi prompt template ở `prompts/*.ts` (không inline trong feature)
- ✅ Tag mới phải document trong `tag-parser.ts` + dạy AI ở `prompts/narrative.ts`
- ✅ Mock chunks update đồng bộ với prompt — `mock.ts` là "AI ground truth offline"

### `src/state/game-store.ts`
- ❌ Đừng mutate state ngoài immer `set((s) => ...)`
- ❌ Đừng gọi React hooks trong actions (đó là logic, không phải UI)
- ✅ Mỗi action: validate → mutate → side-effect (notify/save)
- ✅ Async actions: set `isAiThinking: true` trước, false sau (cho UX loading)
- ✅ Sau mutation player.allocatedPoints hoặc equippedItems → BẮT BUỘC `recomputeStats(player, inventory)`

### `src/features/**`
- ❌ Đừng import Firebase/Gemini trực tiếp — gọi qua store action
- ❌ Đừng giữ business logic trong component (dùng store action thay)
- ✅ Component subscribe store qua selector cụ thể (tránh re-render lan rộng)
- ✅ Dùng `<Bracketed tone="gold|jade|spirit|ember">` cho panel quan trọng

### Design system
- ❌ Đừng hard-code màu hex trong component — dùng Tailwind class (`bg-ink-700`, `text-gold-200`) hoặc CSS var (`var(--gold-500)`)
- ❌ Đừng tạo font-family inline — dùng `font-serif` / `font-body` / `font-mono` Tailwind class
- ✅ Heading luôn `font-serif` (Noto Serif), body `font-body` (Be Vietnam Pro), số `font-mono` (JetBrains Mono)
- ✅ Panel quan trọng → `<Bracketed>` component (4-corner brackets)

---

## 🚫 Common pitfalls

| Bẫy | Triệu chứng | Fix |
|---|---|---|
| Trang bị item → stat không tăng | Quên `recomputeStats(player, inventory)` sau equip | Mọi action ảnh hưởng baseStats/AP/equipment phải gọi `recomputeStats` cuối cùng |
| Mock AI không kích hoạt | `VITE_GEMINI_API_KEY` set thành 'mock' literal nhưng dispatch vẫn fail | Để env rỗng, đừng set 'mock' string |
| StoryView không scroll xuống | Push entry mới nhưng ref scrollTop chưa update | useEffect deps phải có `entries.length` |
| AI response invalid JSON crash app | Quên try/catch quanh parser | `generateNarrative` đã wrap retry + fallback; đừng bypass |
| Lottie không render | Import JSON sai path hoặc lottie-react chưa install | Check `npm ls lottie-react` |
| TS path alias không resolve | Tsconfig paths không sync với vite alias | Sửa cả `tsconfig.json` + `vite.config.ts` |
| Player travel tới location xa | `areNeighbors` trả false | Chỉ travel kề; muốn xa hơn → multi-hop |

---

## 🛠️ Conventions

### Naming
- Component: `PascalCase.tsx`
- Hook: `useCamelCase.ts`
- Type/interface: `PascalCase`, file `kebab-case.ts`
- Constants: `SCREAMING_SNAKE_CASE`
- Vietnamese game terms: giữ nguyên dấu (Linh Căn, Đan Dược, Cảnh Giới)

### Imports
- Path alias > relative path: `@core/stats/realms` > `../../../core/stats/realms`
- Type-only import: `import type { Item } from '@types/item'`
- React: KHÔNG `import React` nữa (jsx-runtime tự handle)

### Git commit
- Format: `<type>(<scope>): <message>` — type: feat/fix/refactor/test/docs/style/chore
- Vd: `feat(combat): add realm gap penalty to damage formula`
- Vd: `refactor(store): extract equipment slice from game-store`

### PR description
- Phải có: motivation, what changed, screenshots (nếu UI), test coverage delta
- Link ADR nếu là quyết định lớn

---

## 📊 Quality gates (trước khi commit)

1. `npm run typecheck` — 0 error
2. `npm run test` — tất cả test pass
3. `npm run lint` — 0 error (warn OK)
4. Manual smoke: chạy `npm run dev`, click qua flow chính, không crash

---

## 🧭 Workflow phase (inspired by CCGS)

Khi build feature mới, đi qua 5 phase:

```
1. Design   → có gì đã có (đọc GDD), feature này phục vụ pillar nào?
2. Architect → folder nào, file nào, có cần ADR không?
3. Stories  → tách thành 3-7 task nhỏ, tạo qua TaskCreate
4. Implement → core logic trước, UI sau, mock data nếu thiếu
5. Test     → unit cho core, manual smoke cho UI
```

---

## 📚 Tài liệu liên quan

- `README.md` — setup hướng dẫn, 2 cách chạy demo (CDN + Vite)
- `BUILD_PLAN.md` — roadmap 6 phase / 22 tuần
- `ARCHITECTURE.md` — folder structure chi tiết, data flow diagrams
- `design/GDD.md` — Game Design Document (mechanics, progression, balance)
- `docs/adr/` — Architecture Decision Records (TypeScript stack, Mock AI, Lottie...)
- `PREVIEW.md` — prototype gốc 1.3MB (tham chiếu, không build)

---

## 🤝 Khi yêu cầu Claude làm việc

**Yêu cầu hiệu quả:**
- ✅ "Build sect system + UI theo design hiện tại" (rõ goal, có design)
- ✅ "Refactor combat AI để hỗ trợ healing skill" (rõ scope)
- ❌ "Làm game đẹp hơn" (mơ hồ — Claude sẽ phải hỏi rất nhiều)

**Trước khi bắt đầu Claude nên:**
1. Đọc CLAUDE.md (file này)
2. Đọc `design/GDD.md` nếu liên quan gameplay
3. Đọc ADR liên quan nếu là quyết định kiến trúc
4. Liệt kê files sẽ động vào trước khi viết code

**Khi Claude tạo deliverable:**
- Tạo TaskCreate cho mỗi major step
- Path alias đúng, type-safe, có test cho core logic
- Tuân thủ path-scoped rules (xem mục ⚡ trên)
- Verify qua `grep` import paths sau khi xong

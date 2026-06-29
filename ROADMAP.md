# Roadmap — Mặc Hội Tiên Đồ

> Trạng thái hiện tại: **v1.10.0** production tại https://tien-do.netlify.app
> Cập nhật lần cuối: 2026-06-29

Phân loại: **Done** (đã release) · **In Progress** (đang code) · **Next** (sprint kế) · **Backlog** (idea, chưa cam kết).

---

## ✅ Done — Phase 1 → 23 (v1.0 → v1.10)

### Foundation (Phase 1-7)
- Vite + React 18 + TS strict + Tailwind + Zustand+Immer + Zod
- Design system Mặc Đồ (Noto Serif + Be Vietnam Pro + JetBrains Mono, palette ink/gold/jade/ember/spirit, motif 4-corner brackets)
- 28 ItemCategory, 14 EquipmentSlot, 15 cảnh giới (Luyện Khí → Phi Thăng), 6 element + dị
- Combat turn-based + skill system + 35+ tag taxonomy
- Multi-key Gemini rotation + Cloudflare Worker proxy + Firebase backend
- Sect (15 default) · Linh thú (25) · Locations (30) · Cave Abode 4 rooms

### Pattern Library (Phase 9-13)
- 2-step Hybrid AI: Logic Engine (6 scenarios + dice roll) → Narrative Engine (prose)
- 2-tier lore: LORE_* (rumor) → WORLD_* (materialized)
- 3-step Item Pipeline: rarity × category × difficulty → weighted stats
- 2-tier Summary: 20 turn → block, 10 block → meta
- EP Scoring 4-criteria + anti-farm multiplier
- Trade Negotiation tags + Trader modal 2-pane
- Visual Combat VFX (floating damage + screen shake)
- Canon Pack registry (10 truyện: Mục Thần Ký / Phàm Nhân / Tru Tiên / Đấu Phá / Đại Phụng / Đế Bá / Vô Thượng Thần Đế / Nguyên Tôn / Tiên Nghịch / Vạn Cổ Tối Cường Tông) + Fidelity toggle (strict/liberal/original)
- World Genesis Wizard 4-step cho open-world mode

### AI Resilience (Phase 14)
- Retry exponential backoff 503/429
- BYOK (user paste API key)
- AI Status panel với health indicator + last error
- Provider-specific error banner

### Monetization (Phase 15-18, 22)
- Economy: Tiền Ngọc (premium) + actionTokens (50/day + regen 15p)
- 7 currency packs (5k → 500k VND, +0% → +21% bonus)
- 8 exchange options (tokens / unlock perks vĩnh viễn)
- Referral system (per-device 1-time)
- Coupon registry với perks + deviceId lock
- Daily missions 3/day + streak login 7-day calendar
- MoMo Personal QR payment + admin approval flow
- Admin panel filter status (Pending/Approved/Rejected/Expired/All) + deviceId search

### Quality of Life (Phase 19-22)
- Notification Center bell + dropdown 50 history + 14 actionTarget routing
- PlayerLifetimeStats ("Thiên Cơ Toán") — 9 metric accumulator
- Daily login 7-day visual calendar
- Combat detail tracker (defeats + killsByEnemy + win rate)
- Interactive tour spotlight (6-step)
- BGM ambient procedural (4 mood)
- Mobile bottom-nav 5-tab
- Notification persist cross-session

### Cultivation Deep (Phase 23) — v1.10.0
- **Ý Cảnh**: 5 weapon intents (kiếm/đao/quyền/chỉ/pháp ý) × 9 tầng
- **Pháp Tắc**: 10 default laws unlock từ Hợp Thể (lv 70+)
- **Đại Đạo**: AI-sinh linh hoạt (không hardcode 3000), 8 default pool, focus max 3
- **Ngộ Đạo**: tĩnh tâm action với roll 5% unlock đạo mới
- **Đạo Tâm Modal 5-tab**: Ý Cảnh · Pháp Tắc · Đại Đạo · Ngộ Đạo · Quy Tắc

### Critical Hotfix (Phase 23.UX)
- **Save persistence:** thêm 6 slice thiếu vào saveToLocalStorage + auto-save subscription (debounced 250ms, bao phủ 40+ actions)
- **Item category migration** ('Pháp bảo' → infer theo tên)
- **Status ID Vietnamese localization** (16 alias + humanizeStatusId fallback)
- **Recovery coupon system** với perks + deviceId lock

---

## 🚧 In Progress

(Sprint vừa kết thúc — đang đợi feedback realtime từ Sếp DuyenTB sau khi deploy v1.10.0)

---

## 🎯 Next (v1.11.0 candidates — sprint sắp tới)

### A. Skill System Expansion (high priority)
- Skill upgrade tree (lv 1-5 mỗi skill, tốn Linh Thạch + Sách Kỹ Năng)
- Skill combo system (vd Hỏa + Phong = Bão Lửa, cộng damage stack)
- Skill modifiers (rune, ấn ký, gem socket vào skill)
- Skill cooldown UI rõ hơn trong combat

### B. Pháp Bảo / Artifact Deep
- Artifact set bonus (2-piece / 4-piece)
- Artifact awakening (Phàm Khí → Linh Khí → Pháp Khí → Bảo Khí → Tiên Khí)
- Artifact soul-bind (mất khi unequip → cảnh báo)
- Pháp bảo signature passive (vd Túi Trữ Vật +50% weight)

### C. PvP / Multiplayer (research)
- Sect tournament cross-device (Firebase Realtime)
- Đạo lữ trade — gửi item / share quest giữa friend
- Leaderboard cảnh giới + lifetime EP

### D. World Events
- Random world event (yêu thú xâm lăng, bí cảnh mở, đại đạo hiện thân) — 5% trigger mỗi 20 turn
- Sect war (PvE) — sect quest theo chu kỳ
- Tribulation tier 9-15 (Tiên Cảnh / Đại La / Hỗn Nguyên)

### E. UI/UX iteration
- Combat log inline narrative (vd "Sử dụng Tịch Diệt Quyết → gây 234 dmg → enemy 670/1000 HP")
- Inventory grid view mode (256-cell)
- Sort/filter trong tất cả modal (skills, beasts, sects, locations)
- Drag & drop equip slot (mobile-friendly: tap-to-select then tap slot)

---

## 🔮 Backlog (idea pool — chưa cam kết)

### Content
- Voice acting narrative (TTS Vietnamese)
- Cutscene Lottie cho boss fight quan trọng
- Mini-game tu luyện: Nhị Hợp Đan (rhythm), Tâm Pháp Vận Khí (memory match)
- NPC voice persona (mỗi NPC có giọng riêng — pitch + tone modifier)

### Tech
- Migrate state sang Redux Toolkit nếu Zustand bottleneck
- IndexedDB cho save lớn (>5MB localStorage limit)
- WebRTC P2P cho PvP duel (giảm Firebase cost)
- Server-side rendering cho SEO landing page
- Native app (Tauri/Capacitor wrapper)

### Monetization
- VNPay / ZaloPay integration (ngoài MoMo)
- Subscription tier (Tiên Nhân Hội Viên: monthly 49k VND → unlimited tokens, exclusive cosmetic, priority AI queue)
- In-game ads (rewarded video) — chỉ optional cho free user

### Community
- Workshop user-created canon pack (cộng đồng đăng truyện diễn sinh)
- Discord bot tích hợp (notify achievement, share screenshot)
- Twitch/YouTube streaming companion (overlay với realm + HP)
- Translation crowd-sourced (EN / CN / TH)

---

## 📊 Versioning Strategy

- **MAJOR** (X.0.0): redesign core mechanic, breaking change save schema không migrate được
- **MINOR** (1.X.0): feature batch (1-3 Phase), backward-compat save
- **PATCH** (1.10.X): hotfix critical bug, không thêm feature

Lịch sử bump:
- 1.0 — MVP playable
- 1.5 — Sect + Cave Abode
- 1.7 — Canon Pack + Fidelity
- 1.9 — Notification Center + Stats + UX polish (Phase 19-22)
- 1.10 — Cultivation Deep + Save Hotfix (Phase 23)
- 2.0 (planned) — Multiplayer / PvP foundation

---

## 🔗 Tài liệu liên quan

- `CHANGELOG.md` — chi tiết từng version
- `BUILD_PLAN.md` — kế hoạch theo phase
- `CLAUDE.md` — quy tắc kiến trúc + path-scoped rules
- `design/GDD.md` — Game Design Document
- `docs/adr/` — Architecture Decision Records
- `DEPLOY.md` — hướng dẫn deploy Netlify + VPS
- `PROXY.md` — Cloudflare Worker + Firebase Function proxy

---

## 🤝 Contribute

Roadmap mở — Sếp có suggestion thì:
1. Tạo issue / note trong CLAUDE.md
2. Thảo luận em / Claude trong session
3. Move từ Backlog → Next → In Progress → Done

Em tuân thủ CLAUDE.md (path-scoped rules + quality gates: typecheck + test + lint + manual smoke trước khi commit).

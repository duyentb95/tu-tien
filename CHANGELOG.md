# Changelog — Mặc Hội Tiên Đồ

Định dạng theo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/).
Versioning theo [SemVer](https://semver.org/lang/vi/).

---

## [1.7.0] — 2026-06-27

### Added — Phase 17 (Extended Quests + Backend infrastructure + Analytics)

**17.1 — Hidden + Extended Quests:**
- `src/types/extended-quest.ts` + `src/data/extended-quests.ts`: 6 chuỗi quest multi-step (2 main-story visible, 2 hidden cần unlock condition, 2 secret). Mỗi quest 2-3 step, final reward pháp bảo Cực Phẩm/Siêu Phẩm/Huyền Thoại.
- `store.refreshExtendedQuests()`: auto-check unlock + step progress mỗi turn. Hidden quest reveal qua `unlockCondition(state)` (vd: level ≥ 5, có item Hiếm, EP ≥ 100, NPC death ≥ 2).
- `store.claimQuestStep` / `claimQuestFinal`: nhận step reward riêng + final đại thưởng.
- `ExtendedQuestsModal` 2-tab (Đang Tu Luyện / Đã Hoàn Thành) + hint "Còn N chuỗi quest ẩn".
- Nav button "✦ Chuỗi NV" trong gameplay header.

**17.2 — Firebase Cloud Functions backend:**
- `proxy/coupon-referral-function.ts`: 3 callable functions (validateCoupon, validateReferral, registerReferralCode) với Firestore transaction atomic, chống fake claim.
- Firestore schema: `coupons/{code}`, `coupon_claims/{deviceId_code}`, `referrals/{deviceId}`.
- `src/services/coupon-referral-api.ts`: client SDK wrapper httpsCallable.
- `store.redeemCoupon` + `applyReferral`: refactored thành async, try remote trước, fallback localStorage nếu Firebase chưa deploy.
- Admin tạo coupon qua Firebase Console manual (sau làm admin UI).

**17.3 — Analytics — Firestore event tracker:**
- `src/services/analytics.ts`: `trackEvent(name, props)` thin wrapper, buffer 5s flush batch (giảm Firestore write cost). Auto-flush khi tab hidden / beforeunload.
- 18 event names: pack_view / purchase_intent / purchase_complete / exchange_purchase / daily_login / mission_claimed / coupon_redeemed / referral_applied / quest_started / quest_completed / combat_won / realm_break / item_upgraded / world_genesis / canon_pack_picked / byok_set / ai_provider_failed / sw_chunk_recovery.
- Privacy: KHÔNG track PII (name, narrative, BYOK keys). Chỉ event metadata + deviceId anonymous.
- User opt-out qua `setAnalyticsEnabled(false)`.
- Wire vào store actions: mockBuyPack, purchaseExchange, coupon, referral, daily login, mission claim, quest start/complete.

**17.4 — Documentation:**
- `docs/BACKEND_DEPLOY.md`: hướng dẫn deploy Firebase Functions (4 steps), Firestore Security Rules, BigQuery analytics queries (top events, conversion rate, retention curve D1/D7/D30, mission completion rate), cost estimate (~700 DAU free tier).

### Changed

- `GameState` interface export (was `interface`, now `export interface`) để extended-quest check function dùng được.
- `redeemCoupon` + `applyReferral` signature: `() => result` → `async () => Promise<result>`.

---

## [1.6.0] — 2026-06-27

### Added — Phase 16 (Retention + Item upgrade + Coupon TANTHU)

- **Speed Boost effect** (`src/ai/perks.ts`): AI client retry delay giảm 3× khi user mua `speed_boost_unlock` (1.5s/3s/6s/12s → 500ms/1s/2s/4s). Module flag accessor không phụ thuộc React, bootstrap từ localStorage + sync khi `purchaseExchange` / `loadFromLocalStorage`.
- **Item Upgrade** (`store.rerollItemStats` + `store.upgradeItemRarity`): button "Tinh Luyện" trong InventoryScreen detail panel (chỉ hiện cho rarity Hiếm trở lên). Re-roll stats 50 TN (giữ rarity, random distribute lại), Thăng cấp 200 TN (rarity +1 tier). Dùng `generateItemBonusesV2()` pipeline.
- **Daily Missions** (`src/types/daily-mission.ts` + `src/data/daily-missions-pool.ts`): điểm danh + 3 nhiệm vụ random mỗi ngày từ pool 10 template. Auto-reset 00:00 local. Login streak tăng dần với multiplier `×1.0/×1.2/×1.5/×2.0/×3.0` theo cột mốc 3/7/14/30 ngày. Mission progress auto-track qua `incrementMissionProgress()` wire vào submitAction / combat win / level up / skill learned / NPC met / location discovered / ENCOUNTER_REWARD ≥ 50.
- **DailyMissionsModal**: UI hiển thị streak header + 3 mission cards với progress bar + claim button. Nav button "📅 Hàng Ngày" trong gameplay header. Auto-trigger `refreshDailyMissions()` khi mount để cộng login bonus.

### Changed

- **Coupon `MACHOI2026` → `TANTHU`** (newUserOnly): rich newbie reward 500 Tiền Ngọc + 200 Lượt Hành Động. Đủ để mua Speed Boost (300 TN) + còn 200 TN test Tinh Luyện. WelcomeOverlay thêm hint "Dùng mã TANTHU để nhận quà tân thủ".
- `MACHOI2026` giữ lại nhưng đẩy xuống cuối list, reward giảm (300 TN + 100 token, không newUserOnly).

---

## [1.5.0] — 2026-06-26

### Added — Phase 15 (Monetization + Marketing infrastructure)

- **Economy state** (`src/types/economy.ts` + `src/state/game-store.ts`): Tiền Ngọc (premium currency) + actionTokens (50/ngày + regen 1/15 phút, soft cap). Daily reset 0h local. Compute pure function `computeRegenTokens()` idempotent — safe gọi mỗi 30s.
- **Currency packs** (`src/data/store-packs.ts`): 5 pack từ 20k–500k VND với bonus tier (starter / standard / premium / whale).
- **Exchange options**: 8 options đổi Tiền Ngọc → action tokens (50/200/500), speed boost vĩnh viễn, unlimited custom rules, extra save slots (3→10), genesis re-roll credit, item upgrade credit.
- **Coupon registry** (`src/data/coupons.ts`): 5 mã hardcoded — `MACHOI2026`, `WELCOME` (newbie-only), `TUTIENVN`, `LAUNCH`, `TANMUC`. 1-time per device. Future: backend dynamic.
- **Referral system**: Auto-gen 8-char code unique từ deviceId, share qua Web Share API hoặc copy. Reward inviter +200 TN +50 token, invitee +100 TN +30 token (chỉ áp dụng <5 turn).
- **MonetizationModal** (`src/features/monetization/MonetizationModal.tsx`): 4-tab modal Cửa Hàng / Tiêu Tiền Ngọc / Giới Thiệu Bạn / Mã Khuyến Mãi.
- **CurrencyDisplay** trong header gameplay: 💎 Tiền Ngọc + ⚡ tokens, anim-pulse khi tokens < 10.
- **submitAction** wire `useActionToken()` — soft warn khi sắp hết, không block play.

### Note

- Payment thực (Stripe / MoMo / ZaloPay) chưa wire — button "Mua" hiện mock cộng currency cho dev test với banner "Sắp triển khai".
- Coupon + Referral hoàn toàn functional (không cần payment) — sẵn sàng làm marketing campaign ngay.

---

## [1.4.0] — 2026-06-26

### Added — Phase 14 (AI resilience + BYOK + Health monitoring)

- **Retry exponential backoff cho 503/429** (`src/ai/client.ts` + `providers/deepseek.ts`): proxy mode mở rộng từ 2 → 4 attempts với delay 1.5s/3s/6s/12s. Non-retryable (401/402/400/403) dừng ngay. Total wait ~22s trước khi fallback provider khác.
- **Provider Health Tracker** (`src/ai/provider-health.ts`): module pub-sub track per-provider `lastSuccess`/`lastError`/`status` (ok/degraded/down/unknown) + tự classify error → hint user-actionable (top up balance, đổi BYOK, đợi reset). Subscribers React qua `useSyncExternalStore`.
- **BYOK (Bring Your Own Key)** (`src/ai/byok.ts`): user paste Gemini/DeepSeek key của riêng họ vào `AIStatusModal`. Lưu localStorage, validate format, mask display. Khi BYOK set → force direct mode bypass proxy. `nextApiKey()` rotate BYOK + env keys.
- **AI Status Modal** (`src/features/ai-status/AIStatusModal.tsx`): 2 card per-provider hiển thị status dot + last success/fail timestamp + error message + hint + BYOK input + link tài liệu lấy key + top-up.
- **AI Status Dot** (`src/features/ai-status/AIStatusDot.tsx`): indicator nhỏ trong nav header (green/gold/red dot, anim-pulse khi không ok). Click → mở AIStatusModal.
- **AI Fallback Banner** (`src/features/ai-status/AIFallbackBanner.tsx`): sticky banner bên trên StoryView khi overall status != ok. Hiển thị provider lỗi + hint cụ thể. Click → mở AIStatusModal.

### Fixed

- Fix proxy mode chỉ retry 2 lần với network error — giờ retry 4 lần exponential backoff cho 5xx/429.
- `shouldUseMockAi()` mở rộng check BYOK key trong localStorage trước khi quyết định fallback mock.

---

## [1.3.0] — 2026-06-26

### Added — Phase 13 (Creative Engine — vượt mặt Google Canvas reference)

- **Canon Pack registry** (`src/data/canon-packs/` + `src/types/canon-pack.ts`): 10 truyện đa dạng genre đã được biên soạn metadata canonical (cosmology, sects, NPCs, items, skills, beasts, locations, terminology). Mỗi pack ~80-120 LOC. Khi user gõ tên truyện match pack → skip AI analyze, hydrate trực tiếp từ pack data → instant + chính xác hơn nhiều so với để AI tự nhớ. Pack list: Mục Thần Ký, Phàm Nhân Tu Tiên, Tru Tiên, Tiên Nghịch, Đấu Phá Thương Khung, Đế Bá, Già Thiên, Hoàn Mỹ Thế Giới, Vô Thượng Sát Thần, Thần Mộ, Thôn Phệ Tinh Không.
- **Canon Fidelity toggle** (`settings.canonFidelity`): 3 mức — **STRICT** (bám sát nguyên tác, cấm spoil/bịa), **LIBERAL** (cùng universe, story mới, default), **ORIGINAL** (chỉ mượn cosmology, tự do sáng tạo). Inject vào logic-engine prompt với rule chi tiết cho từng mode.
- **World Genesis Wizard** (`src/features/adventure-mode/WorldGenesisWizard.tsx` + `src/ai/world-genesis-service.ts`): 4-step wizard cho open-world mode — Tone chips → Cosmology shape (đơn/song/cửu/multiverse) → Magic density → Themes + inspiration keyword → Preview với Re-roll. AI sinh ra world hoàn chỉnh (realm list + 4-6 sects + locations + NPCs + items + skills + terminology + suggested backstories). Thay placeholder "Phiêu Lưu Mặc Định" cũ.

### Changed

- "Phiêu Lưu Mặc Định" → "✦ Sáng Thế Tự Do" (mở World Genesis Wizard).
- "Phiêu Lưu Đồng Nhân" → "◭ Đồng Nhân Nguyên Tác" với canon pack quick-pick (10 chip buttons) bên trên input gõ tự do.

---

## [1.2.0] — 2026-06-26

### Added — Phase 12 (Visual Combat + Trader UI)

- **Visual Combat VFX** (`src/features/combat/VisualCombatFX.tsx`): floating damage numbers (crit vàng to, dodge xanh, normal đỏ), screen shake khi heavy hit (≥15% maxHP) hoặc crit, full-screen impact flash overlay (vàng=crit / đỏ=heavy / xanh=heal).
- **Trader Modal** (`src/features/trader/TraderModal.tsx`): 2-pane UI Bán | Mua, auto-open khi `traderSession` non-null, hỗ trợ giá theo `sellMultiplier × itemSpecificBonus`, button Mặc cả/Hỏi giá/Mua/Rời quầy gửi natural-language action → AI follow-up.
- 3 CSS keyframes mới: `fx-float-up`, `fx-fade-out`, `fx-shake` (`src/styles/global.css`).

### Changed

- Đổi tiêu đề và loading hint từ "Đấng Sáng Thế" → "Thiên Đạo" (`WelcomeOverlay.tsx`, `StoryView.tsx`).

---

## [1.1.0] — 2026-06-26

### Added — Phase 11 (Long-play + Trade backbone, từ Pattern #3-#5 Google Canvas RPG)

- **2-tier Summary System** (`src/ai/summary-service.ts`): background summarization khi `storyLog > 40 turn` → tóm tắt 20 turn cũ thành 1 block ~5-8 câu (level 1). Khi tích đủ 10 block level-1 → 1 meta-summary (level 2). Triple-lock chống re-entrant.
- **EP Scoring 4-criteria + Anti-farm** (`src/core/scoring/ep-scoring.ts`): AI chấm hành động theo 4 tiêu chí (Quan Trọng & Tu Luyện 0-55, Rủi Ro 0-15, Sáng Tạo 0-10, Phù Hợp 0-15). Anti-farm: cùng `reason` lặp lại trong 10 hành động gần nhất → multiplier 1.0 → 0.7 → 0.4 → 0.1. EP ≥ 20 converted thành EXP qua công thức `basic + growth + breakthrough`.
- **Trade Negotiation Tags** (`src/types/trade.ts` + tag-parser): 5 tag mới — `[ENTER_TRADE_MODE]`, `[EXIT_TRADE_MODE]`, `[SELL_VALUATION]`, `[BUY_NEGOTIATION]`, `[OFFER_ITEM_IDEA]`. State `traderSession` lưu wares + multipliers per item.
- 10 unit tests mới cho `ep-scoring` (93/93 pass).

### Changed

- Logic Engine prompt mở rộng: 4-criteria scoring docs cho ENCOUNTER_REWARD, full trade tag taxonomy, biên niên sử block inject trước eventsBlock.

---

## [1.0.2] — 2026-06-26

### Added — Phase 10 (Pattern #1 + #2 từ Google Canvas RPG)

- **3-step Item Generation Pipeline** (`src/core/items/item-budget.ts`): rarity base budget × category multiplier × difficulty variance → weighted random stat distribution. Vũ khí ưu tiên ATK 60% / CR 20% / CDMG 15% / DMG_AMP 5%; Thân giáp DEF/HP; Phương tiện SPD; v.v. Stat pricing chuẩn: 10đ/ATK, 50đ/1% CR, 80đ/1% DMG_AMP.
- **Entity Injection (Smart Context Filter)** (`src/ai/entity-lookup.ts`): Logic Engine trả `relevant_entities[]` → lookup chi tiết từ knowledge/inventory/skills → inject block info cho Narrative Engine viết prose chính xác (giảm AI bịa).
- 11 unit tests mới cho `item-budget`.

---

## [1.0.1] — 2026-06-26

### Added — Phase 9 (UX polish + new modals)

- **Tra Cứu Nhanh** (`features/quick-lookup/QuickLookupModal.tsx`): 4 tab (NPCs · Kỹ Năng · Vật Phẩm · Địa Điểm) + search, "+ Chat" insert tên vào ô action qua CustomEvent.
- **Entity Click-to-Inspect** trong narrative: `EntityHighlighter` quét tên + wrap span clickable (gold = world, spirit = lore). Click → `EntityInspectModal` chi tiết.
- **Skill Management 3-column** (`features/skill-management/SkillManagementModal.tsx`): Kho Tiềm Thức | Đang Dùng (6 slot) | Thông Tin. Store actions `equipSkill`/`unequipSkill` với validate kind ↔ slot.
- **Welcome modal** rewrite: "Lời Chào Từ Thiên Đạo" lore-driven, thay 4-step tutorial.
- **Action preview** % thành công + reward, **Loading 2-phase** (🎲 Gieo Xúc Xắc → ✦ Thiên Đạo diễn hóa).
- **Universe-faithful naming**: kinh mạch, huyệt vị, thuật ngữ giữ đúng nguyên tác qua `fanFicTerms`.

---

## [1.0.0] — Trước 2026-06-26

Phase 1-8 base game (Vite + React 18 + TS + Tailwind + Zustand + Gemini/DeepSeek), 5 refactor prototype patterns, deploy https://tien-do.netlify.app.

Xem `BUILD_PLAN.md` cho roadmap chi tiết.

---

## Pattern porting từ Google Canvas RPG reference

| # | Pattern | Status | Phase |
|---|---------|--------|-------|
| 1 | 3-step Item Pipeline | ✓ | 10.1 |
| 2 | Relevant Entities Injection | ✓ | 10.2 |
| 3 | EP Scoring 4-criteria + Anti-farm | ✓ | 11.2 |
| 4 | 2-tier Summary System | ✓ | 11.1 |
| 5 | Trade Negotiation Tags + UI | ✓ | 11.3 + 12.2 |
| 6 | Visual Combat VFX (giản lược, không sprite) | ✓ | 12.1 |
| 7 | Quest 3-stage với deadline | (đã có từ trước) | — |
| 8 | Length Tags với word count cụ thể | (defer — chưa cần) | — |

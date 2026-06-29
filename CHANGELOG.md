# Changelog — Mặc Hội Tiên Đồ

Định dạng theo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/).
Versioning theo [SemVer](https://semver.org/lang/vi/).

---

## [1.10.0] — 2026-06-29

### Added — Phase 23.3-23.7 (Cultivation Deep) + Phase 23.UX (Hotfix + UX)

**Phase 23.3 — Ý Cảnh (Weapon Intent):**
- `src/types/cultivation.ts`: unified `WeaponIntentState/PhapTacDef/DaiDaoEntry/CultivationState` + `INTENT_TIER_NAMES` (9 tầng: Sơ Khởi → Vô Thượng).
- `src/core/cultivation/intent.ts`: 5 weapon intents × 9 cấp, XP curve [50, 150, 400, 1000, 2500, 6000, 14000, 30000], damage mul 1.0 → 1.4. `inferIntentFromSkill` regex match.
- Wire vào `combatPlayerAction`: intent XP +2/4/8 theo loại skill, damage stack với mastery.

**Phase 23.4 — Pháp Tắc (10 default laws):**
- `src/data/phap-tac.ts`: Sinh Tử (lv 70) · Thời-Không (75) · Luân Hồi (80) · Nhân Quả (80) · Hỗn Độn (85) · Bất Diệt (85) · Đạo Lý (90) · Yêu Đạo · Thần Đạo · Quỷ Đạo.
- Actions `refreshPhapTacUnlocks()` + `togglePhapTacActive(id)` — active max 3.

**Phase 23.5 — Đại Đạo (AI-Generated, không hardcode 3000):**
- AI sinh qua tag `[DAO_UNLOCK Name|Description|element?]` + `[DAO_XP Name|amount]`. Tag-parser + dispatcher wired.
- `src/core/cultivation/dai-dao.ts`: DEFAULT_DAO_POOL 8 fallback. `daoSlug()` NFD-safe với `đ/Đ` pre-replace. XP curve [100, 300, 700, 1500, 3000, 6000, 12000, 25000]. Focus max 3.
- Logic Engine prompt extend `daoBlock` instruct AI gen khi player có cơ duyên.

**Phase 23.6 — Ngộ Đạo Action:**
- Button "🧘 Tĩnh Tâm Ngộ Đạo" (50 linh thạch). Roll 60% boost focused đạo, 25% random đạo, 10% +EP, 5% unlock đạo mới.

**Phase 23.7 — Đạo Tâm Modal 5-tab:**
- `src/features/cultivation/DaoTamModal.tsx`: Ý Cảnh · Pháp Tắc · Đại Đạo · Ngộ Đạo · Quy Tắc. Notification target `'cultivation'` mở modal trực tiếp. 20 cultivation tests pass.

**Phase 23.UX — Hotfixes + UX:**

- **Inventory:** Vietnamese friendly labels 9 stat (Công Kích / Phòng Ngự / Sinh Mệnh / Thân Pháp / Bạo Kích...). Description fallback theo category. 3 button Tinh Luyện có khối giải thích riêng (Đổi Chỉ Số gamble · Thăng Phẩm Cấp · Rèn +N với cảnh báo lv 9+).

- **CharacterSheet:** Linh Căn panel show mô tả full + tip tu luyện + button **↻ Tẩy Linh Căn · 💎 500** (random lại). Công Pháp panel có hint công dụng + EXP/turn mul + cảnh giới. Kỹ Năng panel description luôn show (fallback theo kind) + passive_effects + cost/cooldown. Trang bị slot inline bonuses + refine level + rich multi-line tooltip.

- **MonetizationModal tab "Lịch Sử":** 3 summary card (Tổng VND nạp · Đã nhận TN · Đã tiêu TN) + bảng 100 giao dịch (timestamp · kind · TN delta · VND). `EconomyState.purchaseHistory[]` + `pushHistory()` wire vào 5 flow (topup MoMo, mock, exchange, coupon, referral).

- **Notification:** Long-term status `CUONG_PHAN_KICH` → "Cuồng Phẫn Kích" via `STATUS_ID_VN_ALIASES` (16 alias common) + `humanizeStatusId()` Title Case fallback. UI sidebar re-humanize legacy save.

- **Admin Panel:** 5 tab filter (Pending · Approved · Rejected · Expired · All) + ô search deviceId. Backend `listPendingPayments` nhận status + deviceId. Status pill màu + approvedAt + rejectReason. Auto-refresh chỉ tab Pending. Firestore indexes mới: `(deviceId, createdAt)` + `(deviceId, status, createdAt)`.

- **Extended Quests:** Tab filter rõ nghĩa — "Đã Hoàn Thành" chỉ khi `completed && claimedFinal`. Quest hoàn step nhưng chưa lĩnh đại thưởng → vẫn ở "Đang Tu Luyện" để user thấy nút Lĩnh Thưởng.

- **Recovery Coupon System:** `Coupon.reward.perks?` + `Coupon.lockedToDeviceId?`. Coupon đầu tiên `BUNAP-DUYENTB` recovery 8530 TN + Speed Boost cho deviceId nkx4vd5vkwmqxbp8bp. `redeemCoupon` fall through xuống local registry khi remote nói "không tồn tại".

### Fixed — Critical Bug Fixes

**🚨 Save Persistence (root cause của ~5 báo cáo trong session):**
- `saveToLocalStorage` thiếu 6 slice từ Phase 15+: `economy / dailyMissions / extendedQuests / playerStats / skillMastery / cultivation`. Refresh = mất Tiên Ngọc nạp + claim quest reset + login streak reset + ý cảnh reset.
- **Fix:** Bump save version 8 → 9, lưu đầy đủ 22 slice. Cùng cho `syncToCloud`.
- **Auto-save subscription:** module-level `useGameStore.subscribe()` với debounce 250ms + shallow snapshot compare → mọi mutation tự lưu. Bao phủ ~40 actions trước đây thiếu save manual (sect/secret-realm/beast/cave/cultivation/quest/mission/economy). Future-proof.

**Equip / Skill / Allocate không persist:**
- `equipItem`, `unequipItem`, `equipSkill`, `unequipSkill`, `allocatePoint`, `useItem`, `discardItem` đã wire `get().saveToLocalStorage()` manual (defense in depth).

**Item category 'Pháp bảo' không hợp lệ:**
- Quest reward hardcode `category: 'Pháp bảo'` không trong `ItemCategory` enum → item không trang bị / dưỡng được.
- **Fix:** Helper `inferItemCategoryFromName()` heuristic theo từ khóa. Migration on load: item cũ tự convert.

### Changed

- App version `1.9.0` → `1.10.0` (`legal-content.ts` + `package.json`).
- Save schema version `8` → `9` (backward-compat).

### Files

**Mới:** `src/types/cultivation.ts`, `src/core/cultivation/intent.ts`, `src/core/cultivation/dai-dao.ts`, `src/data/phap-tac.ts`, `src/features/cultivation/DaoTamModal.tsx`, `tests/core/cultivation.test.ts`, `ROADMAP.md`.

**Sửa:** game-store.ts (cultivation slice + 7 actions + auto-save subscribe + pushHistory + migration + 7 save calls), notifications.ts, tag-parser.ts, logic-engine.ts + narrative.ts, narrative-service.ts, long-term-statuses.ts, coupons.ts, economy.ts, inventory/index.tsx, character-sheet/index.tsx, MonetizationModal.tsx, ExtendedQuestsModal.tsx, NotificationCenter.tsx, PlayerSidebar.tsx, gameplay/index.tsx, spiritual-roots.ts, functions/src/payments.ts, public/admin.html, firestore.indexes.json.

### Stats

- 145/145 tests pass (+20 cultivation tests)
- typecheck clean
- 262 tasks tracked (Phase 1 → Phase 23.UX)

---

## [1.9.0] — 2026-06-28

### Added — Phase 19 + 20 + 21 (NotificationCenter + Stats + UX polish)

**Phase 19 — Notification Center:**
- `src/features/notifications/NotificationCenter.tsx`: bell icon nav button + dropdown 360px lưu rolling 50 notification gần nhất, badge unreadCount.
- `notify.*` API extend optional `action: { target, label }` — click button trong dropdown dispatch global event `tutien:open` → mở modal/screen tương ứng.
- 14 target enum: daily-missions, extended-quests, monetization, inventory, handbook, character-sheet, world-map, cave-abode, sect-hall, spirit-beasts, skills, tournament, achievements, tribulation.
- 13 notification quan trọng đã wire action button (điểm danh / mission claim / quest unlock / payment / item upgrade / cống hiến / đột phá / độ kiếp / tournament / achievement).
- Auto-mark read sau 500ms mở dropdown; relative timestamp (vừa xong / X phút / X giờ / X ngày).
- Backward-compat 100% — code cũ `notify.success('title', 'message')` vẫn chạy.

**Phase 20 — PlayerLifetimeStats tracker:**
- `src/types/player-stats.ts`: 9 field accumulator (totalKills, totalDefeats, totalEpEarned, totalCurrencyEarned, turnsPlayed, legendaryItemsOwned, tribulationsPassed, realmBreaksLifetime, killsByEnemy).
- Wire vào combat win/lose/fled, submitAction tick, REALM_BREAK + TRIBULATION tag, calculateEpReward.
- `src/core/achievements/check-unlocks.ts`: pure helper compute progress + detect newly unlocked + share giữa UI và store. Wire nốt 4 TODO achievement (first_kill / kill_count / ep_total / item_legendary).
- `LifetimeStatsPanel` trong CharacterSheet: "**✦ Thiên Cơ Toán**" 10-row grid (turn, kills, defeats, win rate %, breaks, tribulations, EP total, currency lifetime, legendary count, Tiền Ngọc) + top enemy "Sát nhiều nhất: X ×N".

**Phase 21 — UX/UI/audio polish (6 stream):**
- **21.0** Notification persist `localStorage['tu-tien:notif-history-v1']` — history + unreadCount cross-session.
- **21.1** Daily login calendar 7-day visual trong DailyMissionsModal — grid 7 ô, today highlight (gold pulse), claimed (✓ jade), bonus 3+7 (✦/🎁 spirit).
- **21.2** Combat detail tracker — totalDefeats + killsByEnemy map + win rate % + top enemy display.
- **21.3** Interactive Tour với spotlight highlight — 6-step wizard sau WelcomeOverlay, 4-panel dim + gold ring pulse + auto-skip step nếu element không exist. Persist `interactive-tour-v1` chạy 1 lần.
- **21.4** Ambient BGM procedural (`services/ambient-bgm.ts`) — 4 mood (village pentatonic / wilderness dorian / combat sawtooth / sect sine), Web Audio API synthesize không cần MP3, auto-switch theo stage, persist mute + volume.
- **21.5** MobileBottomNav 5-tab (Story / Map / Char / Inv / More) — `lg:hidden` <1024px, touch 56px, safe-area-inset iOS, "More" bottom-sheet 6 quick action.

### Changed
- `EconomyState.unlockedAchievements: string[]` — track diff để chỉ notify cái mới khi unlock.
- AchievementsModal refactor dùng pure helper `computeAchievementProgress` từ core/ (chống drift logic với store).

### Tests
- `tests/core/achievements-check-unlocks.test.ts` — 6 case (baseline / unlock threshold / detectNewlyUnlocked diff).
- **99/99 test pass** (thêm 6 mới).

---

## [1.8.0] — 2026-06-28

### Added — Phase 18 (MoMo Personal QR Payment + Admin Approval)

**Mục tiêu:** Bật thanh toán thật KHÔNG cần giấy phép kinh doanh (Personal QR + manual admin approve), thay vì mock cộng currency.

**18.1 — Payment Cloud Functions:**
- `proxy/payment-functions.ts` + `functions/src/payments.ts`: 5 callable v2:
  - `createPaymentIntent({deviceId, packId})` → tạo doc `payments/{intentId}` + memo unique `TT-XXXXXX` + MoMo deeplink `nhantien.momo.vn/{phone}/{amount}/{memo}` + qrPayload.
  - `getPaymentStatus({intentId, deviceId})` → client poll, auto-expire 15min.
  - `approvePayment({intentId, adminToken})` → ADMIN ONLY, Firestore transaction flip `pending → approved`, return reward.
  - `rejectPayment({intentId, adminToken, reason})` → manual reject với lý do.
  - `listPendingPayments({adminToken, limit})` → liệt kê pending sort theo createdAt desc.
- Server-side `PACK_REGISTRY` authoritative — client KHÔNG quyết định reward (chống spoof packId).
- Secret `ADMIN_TOKEN` set qua `firebase functions:secrets:set`, MoMo phone đọc từ env `MOMO_PHONE`/`MOMO_NAME`.
- Composite index `payments(status ASC, createdAt DESC)` cho `listPendingPayments`.
- Rules: `payments/*` deny read/write client — chỉ admin SDK touched.

**18.2 — Client payment-api + poll loop:**
- `src/services/payment-api.ts`: 3 wrapper (createPaymentIntent, getPaymentStatus, approvePaymentAdmin).
- `EconomyState.paymentIntent` field (intentId + memo + deeplink + qrPayload + expiresAt + status).
- Store actions: `startMomoPayment(packId)`, `pollMomoPayment()` (auto-credit khi approved + clear intent), `cancelMomoPayment()`.
- Analytics: track `pack_purchase_intent` + `pack_purchase_complete` với realAmount.

**18.3 — PaymentModal UI:**
- `src/features/monetization/MomoPaymentModal.tsx`: sub-modal hiện QR (qrserver.com render từ deeplink) + memo highlighted + countdown 15min + deeplink button mobile + status indicator + cancel.
- Auto-poll mỗi 3s, auto-tick countdown mỗi 1s.
- MonetizationModal pack button đổi "Mua (mock)" → "◭ Mua bằng MoMo" khi backend config có sẵn.

**18.4 — Admin Panel standalone:**
- `public/admin.html`: gate paste Firebase config + ADMIN_TOKEN, lưu localStorage. Auto-refresh 10s list pending. 1-click Approve/Reject với confirm + reason prompt. Memo select-all để copy nhanh khi check sao kê.
- Deploy cùng dist Netlify → `tien-do.netlify.app/admin.html`. Có `noindex` meta.

**18.5 — Docs:**
- `docs/BACKEND_DEPLOY.md` thêm Section 9 — MoMo flow + secrets setup + admin panel deploy + bảo mật + roadmap upgrade lên MoMo Business gateway (cần GPKD).

### Changed
- `CURRENCY_PACKS` registry sync giữa client + server (5 packs: starter 20k, standard_small 50k, standard_large 100k, premium 200k, whale 500k).
- `MonetizationModal` mount `MomoPaymentModal` sub-modal sau Bracketed root.

### Security
- `ADMIN_TOKEN` secret only — KHÔNG commit, set qua Firebase secret manager.
- Client gọi `getPaymentStatus` phải match deviceId mới được approve (chống user khác claim intent).
- Admin panel có meta `noindex` để search engine không index URL.

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

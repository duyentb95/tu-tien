# BUILD PLAN — Game Tu Tiên Nhập Vai Thế Giới Mở

> **🏆 Tình trạng v1.0 (2026-06-26):** Game đã hoàn thành Phase 1-7 + 5 refactor patterns từ prototype. Sẵn sàng public release tại https://tien-do.netlify.app.
>
> **Stack hiện tại:** Vite + React 18 + TypeScript strict + Tailwind + Zustand+Immer + Zod + Firebase (optional) + Gemini 2.5 Flash (via Cloudflare Worker proxy) + lottie-react.
>
> **Architecture highlights:** Hybrid 2-step Logic Engine pipeline · 2-tier lore foreshadowing · 30+ tag taxonomy · Multi-key API rotation · Multi-slot save manager · WCAG AA accessibility · Lazy 20+ chunks.

---

## 0. STATUS PANEL (cập nhật 2026-06-26)

### Phases ✅ hoàn thành
- **Phase 1:** Refactor extraction (single-file → 145 modular files)
- **Phase 2:** Cultivation depth (linh căn, độ kiếp, breakthrough)
- **Phase 3:** World map + secret realms
- **Phase 4:** Combat depth (artifacts, beasts, formations)
- **Phase 5:** Society (sects, dao lu, cave abode)
- **Phase 6:** Polish & launch (tutorial, save mgmt, performance, mobile, a11y, legal)
- **Phase 7.1:** AI proxy security (Cloudflare Worker)
- **Phase 7.2:** Sect tournament — nội môn đại hội bracket 8-người
- **Phase 7.3:** Achievement (20) + Daily missions (5)
- **Phase 7.4:** Audio expand (11 SFX events + BGM stub)
- **Phase 7.5:** Content expansion (sects 5→15, beasts 8→25, locations 10→30)
- **Phase 7.6:** Late game (9 tribulation tiers, 4 end-game enemies, realm Tiên Nhân)

### Refactors theo prototype patterns
- **Refactor 1:** Fan-fic wizard + AI analyzer (bỏ preset cứng)
- **Refactor 2:** Hybrid Xúc Xắc 2-step (Logic Engine + Dice + Narrative Engine)
- **Refactor 3:** 2-tier lore (LORE_* rumor → WORLD_* materialized với loreId)
- **Refactor 4:** Tag taxonomy expand (30+ tags)
- **Refactor 5:** Memory expand (eventHistory + customRules + recentActions)

### Phases ⏳ skipped / future
- **Phase 7.7:** Multiplayer (cross-realm raid via Firestore) — advanced architecture, để v1.5+

### Metrics
| | |
|---|---|
| Source files | ~145 |
| Bundle initial | 501 KB / 142 KB gzip |
| Lazy chunks | 20+ |
| Default content | 15 sects · 25 beasts · 30 locations · 9 tribulation tiers · 20 achievements |
| Stack | Vite + React 18 + TypeScript strict + Tailwind + Zustand+Immer + Zod |
| AI backend | Gemini 2.5 Flash via Cloudflare Worker proxy (free 100K req/day) |

---

## I. PHÂN TÍCH PROTOTYPE HIỆN TẠI

### 1.1 Điểm mạnh đã có
- Kiến trúc dữ liệu phong phú: `INITIAL_STATS` (baseHp/atk/def/spd/cr/cdmg/dmgAmp/dmgRes/evasion), 10 slot trang bị, 6 slot kỹ năng (3 combat + 3 adventure).
- Hệ phẩm chất 6 bậc (Thường → Tốt → Hiếm → Cực Phẩm → Siêu Phẩm → Huyền Thoại) + bảng phân phối theo level (`RARITY_DISTRIBUTION_BY_LEVEL`).
- Hệ thống độ khó 4 mức ảnh hưởng giá mua/bán + ngẫu nhiên budget vật phẩm (`DIFFICULTY_MULTIPLIERS`, `DIFFICULTY_RANDOMNESS`).
- Status library đã có nền: buff (CC_IMMUNITY, UNDYING, DAMAGE_IMMUNITY, STASIS), debuff CC (STUN, SLEEP, SILENCE), template thương tích dài hạn (NGẤT, BẤT TỈNH, TRỌNG THƯƠNG, XUẤT HUYẾT, TRÚNG ĐỘC).
- Realm tự sinh động: AI tạo danh sách `realmProgressionList`, mỗi cảnh giới chia 10 tầng, vượt cấp đẩy vào "Vô Định Cảnh".
- Combat trực quan turn-based với `VisualCombatArena`, log, status hiển thị thời gian thực.
- Lưu trữ phân tầng: Firestore (game state), IndexedDB (avatar base64) — đã giải quyết bài toán RAM/quota.
- Fan-fiction mode + NSFW toggle + writing-style + narrator-pronoun chọn được.

### 1.2 Vấn đề kiến trúc cần xử lý
| Vấn đề | Tác động | Mức độ |
|---|---|---|
| 1 file 33k+ tokens chứa toàn bộ logic | Không thể test, code review, hoặc nhiều người cùng làm | Nghiêm trọng |
| 10+ chỗ duplicate URL Gemini API | Đổi model phải sửa nhiều chỗ, dễ bug | Cao |
| 169+ `useState` trong component App | Re-render lan rộng, khó debug | Cao |
| Logic game + UI + AI prompt trộn lẫn | Không tái sử dụng được | Cao |
| Không có type safety (plain JS) | Dễ bug data shape, đặc biệt với AI response | Trung bình |
| Không có test (unit/integration) | Sửa 1 chỗ vỡ 10 chỗ | Trung bình |

### 1.3 Tính năng tu tiên còn thiếu
- **Linh căn / Thiên phú:** ngũ hành, dị linh căn, biến dị thể chất, ảnh hưởng tốc độ tu luyện và công pháp học được.
- **Độ kiếp (Heavenly Tribulation):** sự kiện đại đột phá có rủi ro — fail = trọng thương/tẩu hỏa nhập ma/tử vong.
- **Tông môn:** hệ thống gia nhập, cống hiến điểm, nhiệm vụ tông môn, đấu pháp nội môn, phản môn.
- **Luyện đan/luyện khí có depth:** lò đan, hỏa hậu, dược liệu phẩm cấp, trận pháp khắc lên pháp khí.
- **Trận pháp:** phòng ngự động phủ, công kích đại trận, mê trận thám hiểm bí cảnh.
- **Linh thú/pet:** thu phục, khế ước, tiến hóa, đồng combat.
- **Động phủ:** mua/xây, trồng linh thảo, đặt trận, tu luyện kín thất.
- **Bí cảnh:** instance dungeon timed, loot ngẫu nhiên cao.
- **World map UI:** bản đồ vùng đất có thể di chuyển, fast-travel, fog-of-war.
- **Đạo lữ / quan hệ NPC sâu:** khế ước song tu, cừu hận hệ thống, danh vọng theo tông môn/quốc gia.

---

## II. KIẾN TRÚC ĐỀ XUẤT SAU REFACTOR

### 2.1 Folder structure

```
tu-tien/
├── public/                          # static assets, favicon, manifest
├── src/
│   ├── main.tsx                     # entry
│   ├── App.tsx                      # router + global providers
│   │
│   ├── core/                        # logic thuần, không phụ thuộc React/Firebase
│   │   ├── stats/
│   │   │   ├── calculate.ts         # calculateFinalStats, AP allocation
│   │   │   ├── leveling.ts          # handleLevelUp, calculateMaxExpForLevel
│   │   │   └── realms.ts            # getRealmInfoFromLevel, breakthrough logic
│   │   ├── combat/
│   │   │   ├── damage.ts            # damage formulas, crit, dmgAmp/Res
│   │   │   ├── status.ts            # apply/tick/dispel statuses
│   │   │   ├── turn-order.ts        # SPD-based initiative
│   │   │   └── ai-action.ts         # NPC chọn skill trong combat
│   │   ├── items/
│   │   │   ├── rarity.ts            # RARITY_DISTRIBUTION, getItemRarityColor
│   │   │   ├── budget.ts            # calculateBalancingBudget
│   │   │   └── crafting.ts          # luyện đan/luyện khí/cường hóa
│   │   ├── cultivation/             # ★ MỚI
│   │   │   ├── spiritual-roots.ts   # linh căn, thiên phú
│   │   │   ├── tribulation.ts       # độ kiếp formulas
│   │   │   ├── techniques.ts        # công pháp tu luyện chính/phụ
│   │   │   └── breakthrough.ts      # đại đột phá, tâm cảnh
│   │   ├── world/                   # ★ MỚI
│   │   │   ├── map.ts               # graph các vùng đất, travel cost
│   │   │   ├── locations.ts         # location types, services
│   │   │   ├── secret-realms.ts     # bí cảnh instance generator
│   │   │   └── time.ts              # ngày/đêm, thời gian trôi
│   │   ├── society/                 # ★ MỚI
│   │   │   ├── sects.ts             # tông môn, cống hiến, ranks
│   │   │   ├── relationships.ts     # đạo lữ, cừu hận, NPC affinity
│   │   │   ├── reputation.ts        # danh vọng theo phe phái
│   │   │   └── factions.ts          # quốc gia, môn phái lớn
│   │   └── types/                   # TypeScript types/interfaces
│   │       ├── character.ts
│   │       ├── item.ts
│   │       ├── skill.ts
│   │       ├── status.ts
│   │       └── world.ts
│   │
│   ├── ai/                          # tách riêng tầng LLM
│   │   ├── client.ts                # 1 chỗ duy nhất gọi Gemini
│   │   ├── retry.ts                 # exponential backoff
│   │   ├── parser.ts                # parse [REALM_LIST], [QUEST], [DIALOGUE]...
│   │   ├── schemas.ts               # JSON schemas response từ LLM
│   │   └── prompts/
│   │       ├── narrative.ts         # kể chuyện, dialogue
│   │       ├── character-gen.ts     # tạo NPC mới
│   │       ├── item-gen.ts          # sinh item theo budget
│   │       ├── quest-gen.ts         # sinh quest
│   │       ├── world-gen.ts         # sinh vùng đất, location
│   │       └── tribulation.ts       # mô tả độ kiếp
│   │
│   ├── services/                    # I/O với hệ thống ngoài
│   │   ├── firebase.ts              # init + auth
│   │   ├── firestore.ts             # save/load game, sync
│   │   ├── indexed-db.ts            # avatar storage
│   │   └── image-gen.ts             # Imagen 4 wrapper
│   │
│   ├── state/                       # state management — Zustand hoặc Jotai
│   │   ├── game-store.ts            # toàn bộ game state (chia slice)
│   │   ├── slices/
│   │   │   ├── player.ts            # player character
│   │   │   ├── world.ts             # location, time, weather
│   │   │   ├── knowledge.ts         # NPC, locations, lore
│   │   │   ├── combat.ts            # combat session state
│   │   │   ├── inventory.ts
│   │   │   └── settings.ts          # gameSettings
│   │   └── persist.ts               # auto-save tới Firestore
│   │
│   ├── features/                    # UI grouped by feature
│   │   ├── initial-screen/
│   │   ├── game-setup/
│   │   ├── gameplay/                # main story view
│   │   ├── character-sheet/
│   │   ├── inventory/
│   │   ├── crafting/
│   │   ├── trade/
│   │   ├── combat-arena/
│   │   ├── world-map/               # ★ MỚI — full-screen interactive map
│   │   ├── sect-hall/               # ★ MỚI — tông môn UI
│   │   ├── cave-abode/              # ★ MỚI — động phủ
│   │   ├── tribulation/             # ★ MỚI — cutscene độ kiếp
│   │   └── secret-realm/            # ★ MỚI — bí cảnh instance
│   │
│   ├── shared/                      # UI tái sử dụng
│   │   ├── components/              # Button, Modal, Tabs, Tooltip
│   │   ├── icons/                   # toàn bộ SVG icons (đã có sẵn ~80 cái)
│   │   ├── hooks/                   # useTypewriter, useAvatar, useDebounce
│   │   └── utils/
│   │
│   └── data/                        # static data
│       ├── status-library.ts        # STATUS_LIBRARY
│       ├── long-term-templates.ts   # LONG_TERM_STATUS_TEMPLATES
│       ├── personalities.ts         # PLAYER_PERSONALITIES
│       ├── default-realms.ts        # cảnh giới mặc định
│       └── ap-conversion.ts         # AP_CONVERSION_RATES
│
├── tests/
│   ├── core/                        # unit tests cho logic thuần
│   └── e2e/                         # Playwright cho flow chính
│
├── tools/
│   └── extract-prototype.mjs        # script tự động tách PREVIEW.md
│
└── docs/
    ├── ARCHITECTURE.md
    ├── AI_PROMPTS.md                # tài liệu prompt engineering
    ├── COMBAT_FORMULAS.md
    └── CULTIVATION_DESIGN.md
```

### 2.2 Nguyên tắc kiến trúc
1. **Logic tách khỏi UI**: `core/` không import React. Mọi formula testable bằng unit test.
2. **AI là 1 tầng riêng**: `ai/client.ts` là chỗ duy nhất biết URL Gemini. Đổi model = đổi 1 dòng.
3. **State global gọn**: dùng Zustand chia slice thay vì 169 `useState` nằm rải rác.
4. **Type-first**: TypeScript bắt buộc cho `core/` và `ai/schemas.ts` để LLM response được validate runtime (zod).
5. **Mỗi feature 1 folder**: feature có thể có store nhỏ riêng nếu cần, nhưng đọc/ghi qua interface chuẩn.

---

## III. ROADMAP 6 PHASE

### PHASE 0 — Setup nền tảng (Tuần 1)
**Mục tiêu:** môi trường dev, chuẩn hóa stack.

- Khởi tạo Vite + React + TypeScript thay cho Google Canvas single-file.
- Cấu hình ESLint, Prettier, Vitest, Playwright.
- Cấu hình Tailwind (đã có sẵn class trong prototype).
- Kết nối Firebase project mới (hoặc dùng lại), tách env keys.
- Tạo CI cơ bản (GitHub Actions: lint + test + build).
- **Deliverable:** repo chạy được `npm run dev`, dummy Hello World có route.

### PHASE 1 — Refactor extraction (Tuần 2–5)
**Mục tiêu:** tách `PREVIEW.md` thành các module tương ứng, không thêm tính năng.

| Tuần | Việc | Deliverable |
|---|---|---|
| 2 | Trích `core/stats`, `core/items`, `data/*` | Functions có unit test ≥ 70% |
| 2 | Trích `ai/client.ts` + retry + 1 prompt mẫu (narrative) | Gọi được Gemini, log response |
| 3 | Trích `state/slices/player`, `state/slices/inventory`, persist | Save/load Firestore qua store |
| 3 | Trích `features/initial-screen`, `features/game-setup` | Chạy được flow tạo nhân vật |
| 4 | Trích `features/gameplay` (story view + dialogue) | Chơi được tới chỗ AI kể chuyện |
| 4 | Trích `features/inventory`, `features/character-sheet` | Trang bị/tháo item OK |
| 5 | Trích `features/combat-arena`, `core/combat/*` | Combat hoạt động ngang prototype |
| 5 | Trích `features/crafting`, `features/trade` | Đầy đủ feature parity với prototype |

**Deliverable cuối Phase 1:** Web app có **đúng feature** prototype hiện tại nhưng kiến trúc modular, có test, có CI.

### PHASE 2 — Hệ thống tu luyện chiều sâu (Tuần 6–8)
**Mục tiêu:** biến game text-adventure AI thành game tu tiên thực sự.

- **Linh căn (Spiritual Roots)** `core/cultivation/spiritual-roots.ts`
  - Roll khi tạo nhân vật: Đơn linh căn (Kim/Mộc/Thủy/Hỏa/Thổ) > Song > Tam > Tứ > Ngũ (giảm dần độ hiếm và tốc độ tu luyện).
  - Dị linh căn: Lôi/Phong/Băng/Quang/Ám — ảnh hưởng công pháp học được.
  - Hệ số tu luyện: Đơn linh = ×3.0, Ngũ linh = ×0.5, Dị linh = ×4.0+.

- **Công pháp chính (Main Cultivation Technique)**
  - Phẩm cấp: Hoàng → Huyền → Địa → Thiên → Tiên → Thần.
  - Thuộc tính linh căn yêu cầu (Hỏa công pháp cần Hỏa linh căn).
  - Tốc độ tu luyện × phẩm cấp công pháp × hệ số linh căn × thiên thời địa lợi.

- **Độ kiếp (Heavenly Tribulation)** `core/cultivation/tribulation.ts`
  - Trigger khi đại đột phá (mỗi 10 cấp lớn: Trúc Cơ → Kim Đan → Nguyên Anh...).
  - 9 đạo lôi (hoặc tùy AI generate), mỗi đạo có sát thương = f(level, tâm cảnh, pháp bảo phòng kiếp).
  - Fail nhẹ → Trọng Thương + tu vi rớt 1 tầng. Fail nặng → Tẩu hỏa nhập ma (debuff vĩnh viễn). Fail thảm → tử vong (xóa save hoặc respawn theo độ khó).
  - UI: cutscene full-screen, gọi Imagen tạo background lôi kiếp, animation HP bar drop.

- **Tâm cảnh (Mental State)**
  - Tăng qua: ngộ đạo, nhiệm vụ moral choice, đọc kinh sách.
  - Giảm sát thương độ kiếp + tăng cơ hội ngộ tính.

**Deliverable:** Người chơi có thể đột phá Trúc Cơ với cutscene độ kiếp.

### PHASE 3 — Bản đồ thế giới mở (Tuần 9–11)
**Mục tiêu:** chuyển từ "AI kể chuyện địa điểm" sang "thế giới có cấu trúc".

- **World map data model** `core/world/map.ts`
  - Graph node = location (thành thị/sơn mạch/hoang dã/bí cảnh/tông môn).
  - Edge = đường đi, có cost (thời gian + nguy hiểm).
  - Mỗi location có level range gợi ý → AI sinh encounter phù hợp.

- **Map UI** `features/world-map/`
  - Canvas map (D3 zoom/pan hoặc react-konva).
  - Fog of war: chỉ hiện location đã đến hoặc đã nghe nói tới.
  - Click location → chọn fast-travel (nếu đã đến) hoặc đi bộ (mất thời gian, có sự kiện ngẫu nhiên).
  - Layer overlay: phe phái kiểm soát, tài nguyên đặc trưng.

- **Bí cảnh (Secret Realms)** `core/world/secret-realms.ts`
  - Instance dungeon: AI sinh sơ đồ phòng (5–15 phòng), boss cuối, loot pool theo level.
  - Timed: mỗi bí cảnh có thời lượng (ví dụ 30 ngày trong game), hết thời gian bị đẩy ra.
  - Risk/reward: phẩm chất loot tăng theo độ sâu, nhưng resurrect không có trong bí cảnh.

- **Thời gian + thời tiết** `core/world/time.ts`
  - Ngày đêm ảnh hưởng tốc độ tu luyện (đêm thường tốt hơn cho âm hệ).
  - Mưa/tuyết/sương ảnh hưởng tầm nhìn combat, evasion.
  - Tu luyện kín thất: chọn 1–365 ngày, fast-forward, AI summarize sự kiện vắng mặt.

**Deliverable:** Click bản đồ để di chuyển, vào được ít nhất 1 bí cảnh sinh động.

### PHASE 4 — Combat & kỹ năng nâng cao (Tuần 12–14)
**Mục tiêu:** combat tu tiên có chiều sâu vượt prototype.

- **Pháp bảo (Magical Artifacts)**
  - Tách riêng khỏi vũ khí thường: pháp bảo có "pháp bảo level" riêng, cần "pháp bảo tinh hồn" để dưỡng.
  - Phẩm cấp: Phàm khí → Linh khí → Pháp khí → Bảo khí → Tiên khí.
  - Ngự kiếm phi hành: vũ khí phi kiếm cho phép ranged attack từ xa, bay trên map.

- **Trận pháp (Formations)** `core/combat/formations.ts`
  - Formation flag deploy trước combat: tăng buff đội + debuff địch.
  - Trận pháp phòng ngự cho động phủ: chống NPC tập kích.
  - Mê trận thám hiểm: trong bí cảnh, người chơi phải giải puzzle để qua.

- **Linh thú (Spirit Beasts)** `core/cultivation/spirit-beasts.ts`
  - Khế ước: khi đánh bại spirit beast HP < 20% có % thu phục.
  - Tham gia combat như ally, có level riêng, ăn linh thạch để thăng cấp.
  - Tiến hóa: đạt level X + dùng vật phẩm hiếm → biến hình form mạnh hơn.

- **Combat 4-way**
  - Hiện tại 1v1 (player vs enemy team). Mở rộng: phe thứ 3 NPC bị cuốn vào (tu sĩ tà phái cướp tài nguyên), phe thứ 4 thiên tai (lôi điện ngẫu nhiên).
  - Reactive: NPC đối thủ có thể buông tha hoặc đối thoại nếu player có danh vọng cao trong môn phái họ.

- **Cảnh giới gap penalty**
  - Đánh nhau với NPC chênh ≥ 1 đại cảnh giới: damage dealt × 0.1, damage taken × 5. Bắt buộc người chơi phải tu luyện đúng hướng.

**Deliverable:** Combat có pháp bảo, trận pháp, linh thú đồng hành.

### PHASE 5 — Hệ thống xã hội (Tuần 15–17)
**Mục tiêu:** thế giới có "linh hồn" — NPC nhớ player, phe phái có agenda riêng.

- **Tông môn (Sects)** `core/society/sects.ts`
  - Gia nhập: thi vào (test linh căn + đấu pháp), được tiến cử, hoặc cứu trưởng lão.
  - Cấp bậc: Đệ tử ngoại môn → nội môn → chân truyền → trưởng lão → tông chủ.
  - Cống hiến điểm (contribution): từ nhiệm vụ tông môn, đổi linh thạch/công pháp/đan dược tông môn.
  - Nội môn đại hội: tournament định kỳ, top 10 được vào tàng kinh các.
  - Phản môn: penalty nặng (bị truy sát, danh vọng -1000 phe đó).

- **Đạo lữ (Dao Companions)** `core/society/relationships.ts`
  - NPC có affinity 0–100 (đã có nền trong prototype).
  - Khi affinity ≥ 80 + đáp ứng prerequisites (giới tính, tâm cảnh, không là đệ tử cùng môn cấm yêu) → unlock đạo lữ option.
  - Song tu: cùng tu luyện cộng hưởng tốc độ + chia sẻ tâm cảnh.
  - Reaction: nếu đạo lữ chết, player vĩnh viễn debuff "Tâm Ma" cho đến khi báo thù xong.

- **Cừu hận (Vendetta) system**
  - Mọi NPC chết hoặc bị nhục mạ ghi nhận lý do (player giết, lừa, cướp đan).
  - Sư huynh đệ/sư phụ/con cái họ có % spawn truy sát player sau X ngày.
  - Có thể giải quyết bằng: hối lộ, đấu sinh tử, gia nhập cùng tông môn để được hòa giải.

- **Danh vọng (Reputation)** `core/society/reputation.ts`
  - Theo từng phe: tông môn, quốc gia, ma đạo, chính đạo.
  - Ảnh hưởng: giá mua/bán, NPC chào đón/thù địch, quest unlock.
  - Hệ phái xung đột: cao danh vọng chính đạo = thấp danh vọng ma đạo.

- **Động phủ (Cave Abode)** `features/cave-abode/`
  - Mua đất → xây phòng (luyện đan thất, luyện khí phòng, dược viên, tàng thư các).
  - Trồng linh thảo: timer dài (7–365 ngày), kết quả vào inventory.
  - Đặt trận pháp: phòng ngự khỏi NPC tập kích vắng mặt.
  - Mời trưởng lão / đạo lữ vào ở: bonus tu luyện.

**Deliverable:** Player có thể gia nhập tông môn, kết đạo lữ, sở hữu động phủ.

### PHASE 6 — Polish, balance, launch (Tuần 18–22)
**Mục tiêu:** sẵn sàng cho người chơi thật.

- **Balance pass:**
  - Playtest 50h gameplay, log mọi combat outcome, vẽ heatmap "chỗ nào players chết".
  - Tinh chỉnh `RARITY_DISTRIBUTION_BY_LEVEL`, damage formula, độ khó độ kiếp.
  - Economy: linh thạch inflow vs outflow phải dương lúc đầu (Luyện Khí), âm dần khi cao cấp (Nguyên Anh trở lên cần đan dược đắt).

- **Onboarding:**
  - Tutorial nhân vật chính: 3 quest đầu dạy combat, tu luyện, mua bán.
  - Tooltip xuất hiện theo bối cảnh (lần đầu mở inventory, lần đầu vào combat...).
  - HandbookModal đã có — bổ sung section cho tu luyện/độ kiếp/tông môn.

- **Performance:**
  - Code-split mỗi feature → lazy load.
  - Memoize selectors trong store.
  - Avatar: chuyển từ base64 trong IndexedDB sang Cloud Storage URL (giảm size save game).
  - AI batch: gộp nhiều prompt nhỏ thành 1 call lớn khi có thể.

- **Mobile:**
  - Prototype đã có `MobileFunctionsModal` — kế thừa.
  - Gesture: swipe để chuyển tab inventory/character/skills.
  - Combat: layout 1 cột cho mobile, action wheel.

- **Accessibility:**
  - Contrast AA cho text trên dark theme.
  - Keyboard navigation cho combat (1–9 chọn skill, Enter confirm).
  - Screen reader cho story view.

- **Launch checklist:**
  - Privacy policy (Firebase + Gemini lưu prompt user).
  - TOS (đặc biệt với NSFW mode).
  - Rate limit Gemini API (mỗi user max X call/giờ).
  - Save data export/import (cho phép migrate qua thiết bị).
  - Discord/Facebook community link (đã có icon trong prototype).

**Deliverable:** v1.0 public release.

---

## IV. RỦI RO & MITIGATIONS

| Rủi ro | Khả năng | Tác động | Mitigation |
|---|---|---|---|
| Refactor Phase 1 phá vỡ feature parity | Cao | Cao | Snapshot test mỗi feature trước khi tách. Có toggle revert về single-file. |
| Gemini API đổi schema/giá | Trung bình | Cao | Wrap trong `ai/client.ts` có adapter pattern. Có fallback prompt cho model khác (Claude, GPT). |
| Quota Firestore vỡ vì save game lớn | Trung bình | Trung bình | Tách avatar/lore lớn sang Cloud Storage. Save chính chỉ giữ reference. |
| Player exploit AI (prompt injection để có item huyền thoại) | Cao | Trung bình | Validate AI response qua `ai/schemas.ts` (zod), reject item vượt budget. |
| Cân bằng cảnh giới quá dốc / quá phẳng | Cao | Cao | Tham số hóa toàn bộ formula. Có dev panel để tune live trong playtest. |
| Độ kiếp fail = mất save làm player giận | Cao | Cao | Có "Bùa Hộ Mệnh" item rare cho phép respawn 1 lần. Hoặc difficulty Dễ = không tử vong vĩnh viễn. |
| NSFW mode gây vấn đề pháp lý | Trung bình | Cao | Default off, age gate 18+, rõ ràng trong TOS, không index lên search engine khi bật. |
| AI sinh nội dung vi phạm bản quyền (fan-fic IP) | Cao | Trung bình | Disclaimer rõ ràng. Không lưu IP gốc lên server. Người chơi tự chịu trách nhiệm. |

---

## V. TECH STACK ĐỀ XUẤT

| Lớp | Hiện tại | Đề xuất | Lý do |
|---|---|---|---|
| Build tool | Google Canvas | **Vite** | Fast HMR, tree-shaking, ESM native |
| Language | JavaScript | **TypeScript** | Type safety cho AI response, refactor an toàn |
| UI | React 18 | **React 18** + Tailwind | Giữ nguyên (đã đầu tư nhiều CSS) |
| State | 169 `useState` | **Zustand** + Immer | Gọn, ít boilerplate, devtools tốt |
| Validation | Không có | **Zod** | Validate LLM response runtime |
| Backend | Firebase | **Firebase** (giữ) | Đã có data, auth ổn |
| AI | Gemini 3 Flash | **Gemini 3 Flash** + adapter | Giữ chính, có thể fallback model khác |
| Image gen | Imagen 4 | **Imagen 4** + cache | Cache theo prompt hash, giảm chi phí |
| Storage avatar | IndexedDB base64 | **Cloud Storage URL** + IndexedDB cache | Giảm size save, scale tốt hơn |
| Map UI | (chưa có) | **react-konva** hoặc **D3 + Canvas** | Tu tiên cần map tay, không gridtile |
| Animation | CSS transitions | **Framer Motion** | Combat skill VFX, tribulation cutscene |
| Test | Không có | **Vitest** + **Playwright** | Logic unit + flow e2e |

---

## VI. METRICS THÀNH CÔNG

### Phase 1 (Refactor done)
- Build size giảm ≥ 30% nhờ code-split.
- Test coverage `core/` ≥ 70%.
- Time-to-first-byte gameplay screen ≤ 2s trên 3G.
- 0 regression so với prototype (đo bằng manual checklist 50 tính năng).

### Phase 2–5 (Feature expansion)
- Trung bình 1 player chơi đến đột phá Trúc Cơ trong 30 phút (định nghĩa "engaging onboarding").
- Mỗi cảnh giới mất 2–4× thời gian cảnh giới trước (đường cong tu luyện hợp lý).
- ≥ 70% player thử ít nhất 1 lần độ kiếp trong 5h chơi đầu.
- Discord active member ≥ 100 trong tháng đầu sau Phase 5.

### Phase 6 (Launch)
- Day-1 retention ≥ 35%, Day-7 ≥ 15%.
- AI cost / DAU ≤ $0.10 (giới hạn để mô hình kinh tế bền vững).
- Crash rate ≤ 0.5%.

---

## VII. NEXT ACTIONS (Tuần đầu tiên)

1. **Hôm nay:** review plan này, đánh dấu phần ưu tiên/cắt bớt.
2. **Ngày 1–2:** setup repo Vite + TS + Tailwind + Firebase env. Push CI baseline.
3. **Ngày 3–4:** viết script `tools/extract-prototype.mjs` để tự động cắt block code từ `PREVIEW.md` ra file riêng theo regex patterns (đã định danh được toàn bộ component bằng `^const [A-Z]\w+`).
4. **Ngày 5:** tách `data/` (PLAYER_PERSONALITIES, STATUS_LIBRARY, LONG_TERM_STATUS_TEMPLATES, RARITY_DISTRIBUTION_BY_LEVEL, AP_CONVERSION_RATES, INITIAL_STATS) — đây là chỗ ít rủi ro nhất, tạo momentum cho team.
5. **Cuối tuần:** demo "tách thành công 1 feature đơn giản (Initial Screen)" cho stakeholder.

---

## PHỤ LỤC

- `ARCHITECTURE.md` — chi tiết folder structure, mỗi module làm gì.
- `roadmap.html` — timeline visual có thể click từng phase xem deliverable.
- `architecture-diagram.svg` — sơ đồ data flow Player → UI → Store → AI/Firebase.
- `PREVIEW.md` — source code prototype (giữ nguyên làm tài liệu tham chiếu).

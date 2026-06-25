# ARCHITECTURE — Tu Tiên RPG

Tài liệu này mô tả kiến trúc đề xuất sau refactor + giải thích cách dữ liệu di chuyển trong hệ thống. Đọc kèm `BUILD_PLAN.md`.

---

## 1. Sơ đồ tầng (Layered Architecture)

```
┌──────────────────────────────────────────────────────────────────┐
│                         FEATURES (UI)                            │
│  initial │ setup │ gameplay │ char │ inv │ combat │ map │ sect   │
└──────────────────────┬───────────────────────────────────────────┘
                       │ đọc/dispatch
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                    STATE (Zustand store)                         │
│  player │ world │ knowledge │ combat │ inventory │ settings      │
└──────────┬─────────────────────────────────────────┬─────────────┘
           │                                         │
           ▼                                         ▼
┌────────────────────────┐                ┌─────────────────────────┐
│  CORE (logic thuần)    │                │  SERVICES (I/O)         │
│  stats │ combat │ items│                │  firebase │ firestore   │
│  cultivation │ world   │                │  indexed-db │ image-gen │
│  society               │                └────────┬────────────────┘
└─────────┬──────────────┘                         │
          │                                        │
          └─────────► AI ◄────────────────────────┘
                ┌────────────────────────────┐
                │  ai/client (Gemini)        │
                │  parser │ schemas │ prompts│
                └────────────────────────────┘
```

**Quy tắc đi từ trên xuống**: feature gọi state, state gọi core/service, không ngược lại. Core không biết React. AI không biết Firebase.

---

## 2. Cây thư mục đầy đủ + giải thích từng folder

### `src/core/` — Logic game thuần
Pure functions. Không React. Không fetch. Test 100% bằng Vitest.

```
core/
├── stats/
│   ├── calculate.ts           # calculateFinalStats(char, equipped, statuses)
│   ├── leveling.ts            # handleLevelUp, calculateMaxExpForLevel, calculateTotalAP
│   ├── allocation.ts          # AP allocation rules, AP_CONVERSION_RATES
│   └── realms.ts              # getRealmInfoFromLevel, calculateLevelFromRealmString
│
├── combat/
│   ├── damage.ts              # damage = (atk - def) × (1 + dmgAmp - dmgRes) × critMultiplier
│   ├── status.ts              # applyStatus, tickStatuses, dispel, isDispellable
│   ├── turn-order.ts          # buildInitiative(combatants) → array sorted by SPD
│   ├── ai-action.ts           # NPC chọn skill (heuristic: heal nếu HP<30%, ulti nếu sẵn sàng...)
│   ├── formations.ts          # ★ trận pháp: deploy formation → buff/debuff toàn đội
│   └── log.ts                 # combat log entry types & formatters
│
├── items/
│   ├── rarity.ts              # RARITY_DISTRIBUTION_BY_LEVEL, rollRarity, getRarityColor
│   ├── budget.ts              # calculateBalancingBudget (đã có sẵn)
│   ├── crafting.ts            # luyện đan (recipe → output), luyện khí, cường hóa
│   ├── pricing.ts             # getBuyPrice, getSellPrice (theo difficulty)
│   └── inventory.ts           # addItem, removeItem, calculateWeight
│
├── cultivation/  ★ MỚI
│   ├── spiritual-roots.ts     # rollSpiritualRoots(): { type, elements[], multiplier }
│   ├── techniques.ts          # áp dụng công pháp chính → tốc độ exp/giờ tu luyện
│   ├── breakthrough.ts        # canBreakthrough(char), executeBreakthrough()
│   ├── tribulation.ts         # generateTribulation(level) → 9 đạo lôi với damage
│   ├── mental-state.ts        # tâm cảnh: tăng qua ngộ đạo, ảnh hưởng độ kiếp success rate
│   └── meditation.ts          # tu luyện kín thất: rate × time × multipliers
│
├── world/  ★ MỚI
│   ├── map.ts                 # WorldMap class: addNode, addEdge, shortestPath, fastTravel
│   ├── locations.ts           # Location types: City, Sect, Wilderness, SecretRealm, CaveAbode
│   ├── secret-realms.ts       # generateSecretRealm(level): { rooms[], boss, lootPool }
│   ├── time.ts                # GameClock: advance(hours), getDayPhase, getWeather
│   └── encounters.ts          # rollEncounter(location, playerLevel)
│
├── society/  ★ MỚI
│   ├── sects.ts               # Sect class, contribution, ranks, missions
│   ├── relationships.ts       # NPC affinity, dao companion eligibility
│   ├── reputation.ts          # repByFaction Map, applyAction(action) → delta
│   ├── factions.ts            # FACTIONS const + lookup
│   └── vendetta.ts            # cừu hận: track grudges, spawn assassins
│
└── types/                     # TypeScript types — single source of truth
    ├── character.ts           # PlayerCharacter, NPC, Companion, SpiritBeast
    ├── item.ts                # Item, EquipmentSlot, ItemType
    ├── skill.ts               # CombatSkill, AdventureSkill, PassiveEffect
    ├── status.ts              # Status, StatusEffect, LongTermStatus
    ├── world.ts               # Location, Sect, Faction, SecretRealm
    └── game-state.ts          # GameState (root state shape)
```

### `src/ai/` — Tầng LLM tách riêng

```
ai/
├── client.ts                  # Singleton: callGemini(prompt, schema?, opts?)
│                              # Tất cả URL Gemini chỉ ở đây
├── retry.ts                   # exponentialBackoff, maxRetries=3
├── parser.ts                  # parseStoryWithDialogue, parseSquareBracketTags
├── schemas.ts                 # Zod schemas: ItemGenSchema, NpcGenSchema, QuestSchema
├── tokenizer.ts               # estimate token count để tránh vượt context
└── prompts/
    ├── narrative.ts           # buildNarrativePrompt(state, action) → string
    ├── character-gen.ts
    ├── item-gen.ts            # ép AI tuân thủ budget từ core/items/budget.ts
    ├── quest-gen.ts
    ├── world-gen.ts           # gen vùng đất, location khi player đến vùng mới
    ├── tribulation.ts         # mô tả từng đạo lôi
    └── _shared/               # building blocks: BALANCING_RULES, EFFECTS_SCHEMA, ...
        ├── balancing-rules.ts
        ├── effects-schema.ts
        └── valid-triggers.ts
```

**Pattern bắt buộc** cho mọi prompt:
1. Build prompt từ template + state hiện tại.
2. Gọi `client.callGemini(prompt, schema)`.
3. Parse + validate qua Zod schema.
4. Nếu invalid → retry (max 2 lần) → fallback gracefully.
5. Log prompt + response để debug.

### `src/services/` — I/O với hệ thống ngoài

```
services/
├── firebase.ts                # initializeApp + auth
├── firestore.ts               # saveGame, loadGame, listSaves, deleteSave
├── indexed-db.ts              # avatar cache layer
├── cloud-storage.ts           # ★ MỚI: upload avatar/lore lớn lên Firebase Storage
├── image-gen.ts               # callImagen(prompt) + cache theo hash
└── analytics.ts               # ★ MỚI: log event để tinh chỉnh balance
```

### `src/state/` — Zustand store

```
state/
├── game-store.ts              # createStore({ slices... })
├── slices/
│   ├── player.ts              # playerCharacter + setters
│   ├── world.ts               # currentLocation, time, weather, mapState
│   ├── knowledge.ts           # NPCs[], locations[], lore[], realmList
│   ├── combat.ts              # active combat session
│   ├── inventory.ts
│   ├── settings.ts
│   └── ui.ts                  # modals open, notifications
├── selectors.ts               # memoized selectors (computed values)
└── persist.ts                 # subscribe → debounce → saveGame
```

### `src/features/` — UI grouped by domain

Mỗi feature folder có cấu trúc:
```
features/[feature]/
├── index.tsx                  # entry component
├── components/                # sub-components nội bộ
├── hooks/                     # hooks riêng cho feature này
└── styles.module.css          # nếu cần CSS riêng (ngoài Tailwind)
```

Danh sách feature:
- `initial-screen/` — màn hình đầu tiên (Continue / New Game / Load)
- `game-setup/` — flow tạo nhân vật, chọn writing style, fan-fic
- `gameplay/` — main story view, dialogue bubbles, action choices
- `character-sheet/` — stats, equipment, skill management
- `inventory/`
- `crafting/`
- `trade/`
- `combat-arena/` — VisualCombatArena
- `world-map/` ★ — full-screen interactive map
- `sect-hall/` ★ — UI tông môn (cống hiến, nhiệm vụ, đấu pháp)
- `cave-abode/` ★ — UI động phủ (xây phòng, trồng linh thảo)
- `tribulation/` ★ — cutscene độ kiếp
- `secret-realm/` ★ — instance dungeon UI
- `handbook/` — tài liệu trong game (đã có HandbookModal)

### `src/shared/`

```
shared/
├── components/                # tái sử dụng cross-feature
│   ├── Modal.tsx
│   ├── Button.tsx
│   ├── Tooltip.tsx
│   ├── Tabs.tsx
│   ├── ConfirmDialog.tsx
│   └── LoadingEllipsis.tsx
├── icons/                     # ~80 SVG icons từ prototype
├── hooks/
│   ├── useTypewriter.ts       # đã có sẵn, port qua
│   ├── useAvatar.ts           # logic resolve avatar source
│   └── useDebounce.ts
└── utils/
    ├── format.ts              # formatEffectsString (đã có)
    ├── id.ts                  # crypto.randomUUID wrapper
    └── parse-key-value.ts
```

### `src/data/` — Static data

```
data/
├── status-library.ts          # STATUS_LIBRARY (port nguyên)
├── long-term-templates.ts     # LONG_TERM_STATUS_TEMPLATES
├── personalities.ts           # PLAYER_PERSONALITIES, WRITING_STYLES, NARRATOR_PRONOUNS
├── default-realms.ts          # fallback nếu AI không gen được realmList
├── ap-conversion.ts           # AP_CONVERSION_RATES
├── item-types.ts              # ITEM_TYPES, TYPE_MULTIPLIER, RARITY_BASE_VALUE
├── difficulty.ts              # DIFFICULTY_MULTIPLIERS, DIFFICULTY_RANDOMNESS
├── factions.ts                # ★ danh sách phe phái mặc định
└── spiritual-roots.ts         # ★ định nghĩa linh căn
```

---

## 3. Data flow ví dụ — "Player thực hiện hành động"

1. Player click choice trong `features/gameplay/`.
2. Component dispatch `gameStore.submitAction(actionText)`.
3. Store gọi `ai/prompts/narrative.ts → buildNarrativePrompt(currentState, action)`.
4. Prompt gửi qua `ai/client.ts → callGemini`.
5. Response parse qua `ai/parser.ts`, validate qua `ai/schemas.ts`.
6. Nếu response chứa `[STAT_CHANGE]`, `[ITEM_GAINED]`, `[NEW_NPC]` etc. → từng tag được áp dụng vào slice tương ứng.
7. UI re-render từ store updated.
8. `state/persist.ts` debounce 2s → save vào Firestore.

---

## 4. Combat flow — turn-based loop

```
┌─ buildInitiative() ──── core/combat/turn-order.ts
│
├─ for each combatant in initiative order:
│   ├─ tickStatuses() ─── core/combat/status.ts
│   ├─ checkSkipTurn (STUN/SLEEP/STASIS)
│   ├─ if isPlayer: wait for input
│   │  else: aiAction() ─ core/combat/ai-action.ts
│   ├─ executeSkill():
│   │   ├─ rollHit (evasion)
│   │   ├─ calculateDamage ── core/combat/damage.ts
│   │   ├─ applyEffects (heal, dmg, status)
│   │   └─ logEntry ──────── core/combat/log.ts
│   └─ checkDeath / endCombat
│
└─ end: distribute XP, drop loot (rollLoot từ rarity table)
```

---

## 5. Persistence layers

| Loại data | Lưu ở đâu | Lý do |
|---|---|---|
| Game state (player, world, knowledge) | Firestore document `games/{userId}/saves/{saveId}` | Sync đa thiết bị |
| Avatar PNG/JPG (≤ 100KB) | IndexedDB (cache) + Cloud Storage (source) | Tránh đầy quota Firestore |
| Lore/character description text dài | Firestore field nếu < 1MB; tách collection nếu lớn | Firestore document limit 1MB |
| AI prompt log | Cloud Logging hoặc Firestore separate collection (TTL 30 ngày) | Debug, không cần sync |
| User settings (UI prefs) | localStorage | Không quan trọng, không cần sync |
| API key (Gemini) | localStorage encrypted hoặc Firebase Functions proxy | Tránh leak key |

**Khuyến nghị mạnh:** chuyển AI call qua **Firebase Cloud Functions** thay vì gọi Gemini trực tiếp từ client. Lý do: ẩn API key, rate limit, log trung tâm.

---

## 6. Migration strategy từ PREVIEW.md sang kiến trúc mới

### Bước 1: Snapshot tests
Trước khi chạm code, viết e2e Playwright cho 5 flow chính:
1. Tạo nhân vật → vào game.
2. Combat 1 trận, thắng.
3. Mua bán item ở shop.
4. Save → reload trang → load lại.
5. Đột phá level (bao gồm change realm).

Test này chạy trên prototype hiện tại để baseline.

### Bước 2: Extract tự động
Script `tools/extract-prototype.mjs`:
- Parse `PREVIEW.md` bằng AST (acorn hoặc tree-sitter).
- Detect mọi `const X = (...) => {...}` và `function X(...)`.
- Phân loại theo regex tên (Component nếu start with capital và return JSX, Hook nếu start with `use`, util nếu khác).
- Output từng symbol thành 1 file `.ts` riêng vào folder phù hợp.
- Generate import statements tự động.

Lưu ý: script chỉ làm 70% việc, 30% còn lại cần manual cleanup (đặc biệt phần component lồng nhau, dùng closure).

### Bước 3: Tách dần theo phase
Theo `BUILD_PLAN.md` Phase 1, mỗi tuần 1 module. Sau mỗi module, chạy lại snapshot test.

### Bước 4: Đánh dấu deprecated
Khi 1 phần đã port qua TS, đánh dấu phần tương ứng trong `PREVIEW.md` bằng comment `// ✅ MIGRATED → src/core/stats/calculate.ts` để team biết không cần dùng nữa.

---

## 7. Kiến trúc AI prompt

### Pattern: Structured Output + Validation

```typescript
// ai/prompts/item-gen.ts
import { z } from 'zod';
import { ItemSchema } from '@/core/types/item';

export const buildItemGenPrompt = (budget: number, category: string, rarity: string) => `
Bạn là engine sinh vật phẩm cho game tu tiên. Trả về JSON đúng schema.

Budget: ${budget}
Category: ${category}
Rarity: ${rarity}

Quy tắc balancing: ${BALANCING_RULES}
Schema effects: ${EFFECTS_SCHEMA}

Output (JSON only, no prose):
{
  "name": "string",
  "description": "string (1-3 sentences)",
  "rarity": "${rarity}",
  "category": "${category}",
  "effects": "string (theo schema effects)",
  "value": number
}
`;

// Sử dụng:
const item = await callGemini(buildItemGenPrompt(...), ItemSchema);
// ItemSchema sẽ throw nếu AI trả về sai format
```

### Pattern: Streaming cho narrative
Story dài nên stream từng câu để UX mượt:
```typescript
const stream = callGeminiStream(narrativePrompt);
for await (const chunk of stream) {
  appendToStoryView(chunk);
}
```

### Token budget guard
Trước mỗi call, ước lượng tokens. Nếu state quá lớn (sau 100h chơi knowledge base có thể 50k tokens), summarize lịch sử cũ trước:
- Giữ nguyên 20 turn gần nhất.
- Summarize turn 21–N thành 1 đoạn 500 từ bằng 1 prompt riêng.
- Lưu summary vào `world.historySummaries[]`.

---

## 8. Testing strategy

| Loại | Tỉ lệ | Tool | Coverage mong muốn |
|---|---|---|---|
| Unit (core/) | 70% | Vitest | ≥ 80% |
| Component | 20% | Vitest + React Testing Library | ≥ 50% feature components |
| E2E flow | 10% | Playwright | 10 flow chính |

**Test trọng yếu phải có:**
- Damage formula với boundary cases (0 atk, atk = def, dmgRes > 100%).
- Level up qua nhiều realm 1 lúc (exp burst lớn).
- Status interaction (STUN + DAMAGE_IMMUNITY: vẫn miss vì stun không tấn công).
- Tribulation fail recovery (player không bị xóa data).
- AI response invalid (LLM trả về thiếu field) → fallback hoạt động.
- Save/load roundtrip (mọi field giữ nguyên).

---

## 9. Performance targets

| Metric | Target | Cách đo |
|---|---|---|
| Initial JS bundle | < 250KB gzip | `vite build --report` |
| Time to interactive | < 3s trên 4G mid-tier mobile | Lighthouse |
| Combat 1 turn | < 200ms (không AI call) | Performance.mark |
| AI narrative call | < 8s p95 | Server-side timing |
| Save game write | < 1s | Firestore latency |
| Memory (200 NPC + 500 item) | < 150MB | Chrome DevTools |

---

## 10. Câu hỏi mở cần quyết định sớm

Trước khi bắt đầu Phase 1, team cần align về:

1. **Backend AI**: gọi Gemini trực tiếp từ client (đơn giản nhưng leak key) hay qua Firebase Functions (an toàn nhưng phức tạp hơn)?
2. **Multi-language**: chỉ Tiếng Việt hay i18n từ đầu?
3. **Monetization**: free, ad-supported, subscription, hay one-time? Ảnh hưởng đến cấu trúc cost AI.
4. **Save sharing**: cho phép player share save game không? (privacy issue với fan-fic NSFW).
5. **Mod support**: có cho phép community thêm cảnh giới/công pháp custom không? Nếu có, cần data layer cleaner.
6. **Real-money trading prevention**: nếu có economy đa người chơi tương lai, cần giải quyết trước trong design.
7. **Save data ownership**: GDPR — cho phép export/delete toàn bộ data của user.

Các quyết định này nên ghi vào `docs/DECISIONS.md` (ADR pattern).

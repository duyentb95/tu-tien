# Game Design Document — Mặc Hội Tiên Đồ

> Đây là design bible. Mọi quyết định gameplay phải tham chiếu file này.
> Code phải tuân design; nếu design sai → sửa file này trước, rồi mới sửa code.

| | |
|---|---|
| **Version** | 1.0 |
| **Last updated** | 2026-06-26 |
| **Status** | **Production-ready v1.0** — đã deploy tại tien-do.netlify.app |
| **Stakeholder** | DuyenTB

## 0. Recent v1.0 features (Phase 6-7)

- **Hybrid AI Pipeline:** 2-step Logic Engine + Dice + Narrative Engine → văn phong tốt hơn 1-call ×3
- **Fan-fic wizard:** Player nhập tác phẩm gốc (vd "Mục Thần Ký") + tên nhân vật → AI tự phân tích nguyên tác, populate full settings + cảnh giới + NPCs
- **2-tier lore:** AI có thể foreshadow NPC/location qua `LORE_*` rumor, sau đó materialize qua `WORLD_*` với link `loreId` — mạch truyện liên kết tự nhiên
- **Memory + custom rules:** AI nhớ 30 sự kiện trọng đại + user define rule (vd "không bao giờ giết NPC chính")
- **Tournament:** Nội Môn Đại Hội 8-người bracket single-elim, reward theo rank
- **Achievements:** 20 thành tựu (4 tier bronze/silver/gold/legendary) + 5 daily missions
- **Tagged events:** ENCOUNTER_REWARD AI tự score 0-100 sáng tạo/nhập vai, TIME_PASSED + weather, APPLY_LONG_TERM_STATUS (8 status: TRỌNG_THƯƠNG, XUẤT_HUYẾT, TRÚNG_ĐỘC, ÂM_HÀN, TẨU_HỎA, NGẤT, BỆNH_DỊ_ẤN, KHAI_QUANG buff)
- **Late game:** 9 tribulation tier (Trúc Cơ 3 đạo → Tiên Nhân 36 đạo + cửu trùng lôi hải), 4 end-game boss
- **Content baseline:** 15 sects · 25 beasts · 30 locations
- **AI Proxy Security:** Cloudflare Worker ẩn API key + rate limit per IP
- **A11y:** WCAG AA, keyboard nav full (1-4 actions, ?/M/I/C shortcuts), focus-visible ring, skip link |

---

## 1. Vision

**One-line:** Game RPG tu tiên nhập vai thế giới mở, mỗi quyết định của ngươi dệt nên một câu chuyện riêng, dẫn dắt bởi AI sinh thiên cơ.

**Elevator pitch:** Hãy tưởng tượng AI Dungeon gặp Tiên Hiệp Đông Phương. Player chọn linh căn, tu luyện, vượt độ kiếp, gia nhập tông môn, chiến đấu yêu thú — tất cả trong một thế giới open-world mà AI Gemini dệt nên mỗi lần chơi đều khác. Không level scaling hardcode, không quest tree cố định. Mỗi đạo hữu một số mệnh.

**Inspiration:** Tiểu thuyết tu tiên Trung Quốc (Phàm Nhân Tu Tiên, Cầu Ma, Tru Tiên) · Disco Elysium (narrative depth) · AI Dungeon (LLM-driven) · Stardew Valley (life sim layer) · Slay the Spire (rouge-lite combat).

---

## 2. Design Pillars (3 cột chống)

Mọi feature phải phục vụ ít nhất 1 pillar. Nếu không → cắt.

### Pillar 1: "Đại đạo ba ngàn, ngươi chọn lối nào" (Player Agency)
- Mọi quyết định có hậu quả persist (NPC nhớ, vendetta system).
- Multiple endings — chính đạo / ma đạo / quỷ tu / tản tu.
- Custom action input — player gõ tự do, AI hiểu và phản hồi.

### Pillar 2: "Tu vô tận đầu" (Progression depth)
- 10 đại cảnh giới × 10 tầng = 100 cấp + Vô Định Cảnh.
- Linh căn (đơn → ngũ → dị) ảnh hưởng tốc độ tu luyện ×0.5 → ×4.2.
- Equipment, công pháp, pháp bảo, trận pháp, đan dược, linh thú — 6 trục build.

### Pillar 3: "Mặc Hội Tiên Đồ" (Cổ phong aesthetic)
- Mọi UI element mang motif Đông Phương: corner brackets, calligraphy fonts, gold/jade palette.
- Narrative đậm văn phong cổ điển (Noto Serif italic).
- NPC dùng "ngươi/tại hạ/đạo hữu", địa danh có nghĩa.

---

## 3. Core Mechanics

### 3.1 Cultivation (Tu Luyện)

| Concept | Implementation | File |
|---|---|---|
| Spiritual Root | 6 type (đơn/song/tam/tứ/ngũ/dị), 10 elements. Roll khi tạo nhân vật. | `core/cultivation/spiritual-roots.ts` |
| EXP formula | `BASE_EXP_PER_HOUR × hours × spiritualRootMultiplier × techniqueGrade × envMultiplier × mentalStateBonus` | `core/cultivation/meditation.ts` |
| Level → Realm | Mỗi 10 cấp = 1 đại cảnh giới (Luyện Khí → Trúc Cơ → Kim Đan → ... → Tiên Nhân). Vượt cấp 100 → Vô Định Cảnh. | `core/stats/realms.ts` |
| Breakthrough tax | Cấp 10/20/30... cần EXP ×3 — mô phỏng "đại đột phá khó" | `core/stats/leveling.ts` |
| Tribulation | Trigger ở đại đột phá: 9 đạo lôi, mỗi đạo roll Math.random < successRate. Win → stat boost. Lose → Trọng Thương. | `features/tribulation/` |

### 3.2 Combat

| Concept | Implementation |
|---|---|
| Turn order | Sort by SPD desc, build initiative array |
| Damage | `(atk × skillMult - def × 0.4) × (1 + dmgAmp%) × (1 - dmgRes%)`; crit ×cdmg% |
| Realm gap penalty | Đè 1 đại cảnh giới: ×1.6 ; bị đè: ×0.15 (giới hạn ±3) |
| Skill kinds | combat_basic (×1.5), combat_ultimate (×2.8), adventure (out-of-combat) |
| Status effects | STUN/SLEEP/SILENCE (hard CC), DAMAGE_IMMUNITY (buff), Trọng Thương/Trúng Độc (long-term injury) |
| Enemy AI v1 | Heuristic: cứ skill_basic. V2 sẽ thêm heal nếu HP<30%. |

### 3.3 Inventory & Equipment

- 15 categories: Vũ khí, Đan dược, Tín vật, Nguyên liệu, Sách kỹ năng, ...
- 6 rarity tiers: Thường → Tốt → Hiếm → Cực Phẩm → Siêu Phẩm → Huyền Thoại
- Equippable categories có `bonuses: { hp, atk, def, spd, cr, cdmg, dmgAmp, dmgRes, evasion }`
- AI sinh item tự động qua tag `[ITEM name|rarity|category]` — bonuses auto-generate theo rarity × level × category
- Stack: đan dược/nguyên liệu stack; equipment không stack

### 3.4 World & Travel

- 10 default locations (Thanh Vân Phong, Trấn Lạc Vân, Đông Hải Thành, ...) — `data/default-world.ts`
- Graph edges với travel cost (hours)
- Fog of war: chỉ hiện location đã đến hoặc neighbors của đó
- Travel chỉ tới location kề (areNeighbors)
- AI sinh narrative khi tới location mới + roll random encounter theo location type:
  - wilderness 60% · secret_realm 85% · ruins 40% · city/sect 15%

### 3.5 Quest System

- 5 kinds: main · side · sect · cultivation · hidden
- Status: active · completed · failed · abandoned
- AI tag: `[QUEST_GIVEN title|kind|description|giver]` · `[QUEST_COMPLETE title]` · `[QUEST_FAILED title]`
- Hiển thị quest active count ở Gameplay top nav

---

## 4. Progression Curves

### EXP curve
```
maxExp(level) = 100 × 1.18^(level-1) × (level%10===0 ? 3.0 : 1.0)
```
Cấp 1→2 cần ~100 EXP. Cấp 10→11 cần ~1700 EXP (do ×3 tax). Cấp 50→51 cần ~700K EXP.

### AP economy
- Khởi đầu: 5 AP
- Mỗi cấp: +5 AP
- Cấp 50: tổng 250 AP để phân phối

### Currency (Linh Thạch)
- Khởi đầu: 50 (do sư huynh cấp)
- Source: combat win (~20×level), quest reward, sell item
- Sink: mua đan dược, pháp bảo, quyên hiến tông môn, mua động phủ
- Mục tiêu balance: net positive cấp 1-10, neutral 11-30, negative 31+ (player phải kiếm tiền chủ động)

### Tribulation success rate
- Base: 68%
- Mỗi đạo lôi qua → tỉ lệ -4% (test sức bền)
- Tâm cảnh > 50: +15%
- Pháp bảo phòng kiếp: +5% mỗi cái
- Bùa hộ mệnh: +15% (1 lần)
- Cầu khẩn sư tổ: +30% nhưng -200 HP

---

## 5. AI / Narrative System

### Tag protocol
AI Gemini được dạy 16 game tags qua prompt template (`ai/prompts/narrative.ts`):
- State: `[EXP+] [HP±] [CURRENCY±] [AP+] [STAT atk+5]`
- Inventory: `[ITEM name|rarity|category]` `[SKILL name|kind|rarity]`
- World: `[LOCATION id|name]`
- Combat: `[COMBAT enemy|level]`
- Cultivation: `[REALM_BREAK]` `[TRIBULATION reason]`
- Status: `[STATUS_ADD id|hours]` `[STATUS_CURE id]`
- Quest: `[QUEST_GIVEN title|kind|description|giver]` `[QUEST_COMPLETE title]` `[QUEST_FAILED title]`
- System: `[NOTE message]`

### Mock AI mode
Khi không có Gemini key → fallback 6 chunks dựng sẵn ở `ai/mock.ts`. Demo được full loop offline. Chunks v3 inject đủ tags để showcase từng feature.

### Prompt budget
- Mỗi prompt: ~2-3K tokens (persona + settings + recent 8 entries history + task + tag reference + format)
- Sau 100 turns, dự kiến summarize cũ — chưa implement (Phase 6)

---

## 6. Economy & Balance

### Item budget formula
```
finalBudget = RARITY_BASE_VALUE[rarity] × TYPE_MULTIPLIER[category] × Math.random(0.7, 1.3)
```
- RARITY_BASE_VALUE: Thường=100 → Huyền Thoại=10000
- Equipment generateItemBonuses theo: `8 × rarityMult × max(1, level × 0.6)` cho ATK; tương tự cho DEF/HP/SPD

### Rarity drop distribution (theo level bracket)
| Bracket | Thường | Tốt | Hiếm | Cực Phẩm | Siêu Phẩm | Huyền Thoại |
|---|---|---|---|---|---|---|
| 1-10 | 40% | 30% | 20% | 6% | 3% | 1% |
| 21-30 | 20% | 30% | 28% | 14% | 6% | 2% |
| 51+ | 1% | 15% | 35% | 25% | 17% | 7% |

### Difficulty multipliers
| Độ khó | Sell % | Buy % | Random budget range |
|---|---|---|---|
| Dễ | 50% | 100% | [0.9, 1.2] |
| Thường | 30% | 130% | [0.7, 1.3] |
| Khó | 20% | 180% | [0.6, 1.4] |
| Ác Mộng | 10% | 250% | [0.5, 1.5] |

---

## 7. Tech Constraints

| Tech | Why | Limit |
|---|---|---|
| AI Gemini 3 Flash | Cost-effective vs Pro, 1M context | Rate limit, $0.10/DAU target |
| Imagen 4 | Avatar + scene gen | Cache theo prompt hash (Phase 3) |
| Firebase Firestore | Auth + save sync đa thiết bị | Doc limit 1MB → tách avatar lên Cloud Storage |
| IndexedDB | Avatar cache offline | ~50MB browser limit |
| Vite + React 18 | DX tốt, HMR fast | Bundle target < 250KB gzip |
| Zustand + Immer | Gọn hơn Redux nhiều, type-safe | Không persist tự động — phải gọi save thủ công |
| lottie-react | Animation chất lượng cao, lightweight | ~50KB; không support Skottie slots |

---

## 8. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| AI sinh item huyền thoại exploit | Cao | Auto-generate bonuses qua `generateItemBonuses` — AI chỉ chọn tên/rarity, không control bonus number |
| AI quên dùng tag | Trung | Prompt template có example concrete; parser strip tags khỏi narrative để không leak vào UI |
| Linh căn ngũ căn nuke gameplay | Cao | ×0.5 multiplier nhưng compensate bằng "học mọi công pháp" (Phase 2) |
| Combat boring (cứ click skill_basic) | Cao | Phase 4: thêm pháp bảo + trận pháp + linh thú; cooldown system |
| Player thua độ kiếp → quit | Cao | Bùa hộ mệnh item → respawn 1 lần; difficulty Dễ → không tử vong vĩnh viễn |
| Gemini API đổi schema/giá | Trung | Wrap trong ai/client.ts adapter, fallback Claude/GPT (Phase 6) |
| Save data lớn → Firestore quota | Trung | Tách avatar/lore lớn lên Cloud Storage (Phase 6) |
| NSFW mode pháp lý | Cao | Age gate 18+, rõ ràng TOS, default off |

---

## 9. Out of Scope (cố ý không làm)

- **Multiplayer/PvP** — single-player only. Tránh complexity server-authoritative.
- **3D rendering** — text + 2D UI + Lottie. Không Unity/Unreal.
- **Real-money trading** — tránh hoàn toàn.
- **Voice acting** — text-only narrative.
- **Mobile native app** — web responsive đủ (Phase 6 PWA).

---

## 10. Open Questions

| Question | Owner | Deadline |
|---|---|---|
| Tu vi reset khi đột phá fail có giảm 1 tầng không? | Design | Phase 2 |
| Linh thú khi chết có resurrect được không? | Design | Phase 4 |
| Sect rank advancement cần bao nhiêu cống hiến? | Design | Phase 5 |
| Có cho phép import save từ JSON file không? | Tech | Phase 6 |
| Multi-language i18n từ đầu hay sau? | Product | Trước Phase 6 |

---

*Document này sống cùng project. Mỗi feature major mở mục mới hoặc update mục liên quan.*

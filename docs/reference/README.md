# Reference Codebases

## google-canvas-rpg-reference.tsx (1.4MB, ~9000 LOC)

**Nguồn**: User upload từ project Google Canvas của họ (Vietnamese cultivation RPG).

**Stack**: React 18 + Firebase + IndexedDB + Tailwind + Gemini API (3-flash-preview + Imagen 4.0 + Gemini 2.5 Flash Image).

**Pattern đáng giá để học** (xếp theo impact giảm dần):

### 1. 3-step Item Generation Pipeline ⭐⭐⭐
```
ITEM_IDEA_GAINED tag → fetchInitialItemDetails() (xác định category)
                    → calculateBalancingBudget() (tính budget theo rarity + category + difficulty)
                    → fetchItemDetailsFromAI() (dispatch 12 prompt riêng theo category)
```
- 12 prompt builders: `buildWeaponPrompt`, `buildBodyArmorPrompt`, `buildPotionPrompt`, ...
- Mỗi prompt có budget rule cực chặt: vd Vũ khí 10đ/1 ATK, 30đ/1% ATK_PERCENT, 80đ/1% DMG_AMP
- Pattern đánh đổi: Dị thường có thể "bán" stat âm để mua effect mạnh

### 2. Relevant Entities Injection (Smart Context Filter) ⭐⭐⭐
- API 1 (Logic Engine) trả về `relevant_entities: string[]` (tên NPC/Item/Skill liên quan)
- Code dùng `findLoreEntity()` lookup từng tên trong knowledge → `formatEntityForPrompt()` tạo block info chi tiết
- API 2 (Narrative Engine) nhận block info → viết prose dùng tên/chỉ số chính xác (không bịa)

### 3. EP Scoring 4-criteria + Anti-farming ⭐⭐
- AI chấm 4 tiêu chí: Quan trọng & Tu luyện (0-55) + Rủi ro (0-15) + Sáng tạo (0-10) + Phù hợp (0-15)
- Tổng `ep_score` ≥ MIN_EP_FOR_EXP_GAIN (20) mới được convert thành EXP
- Anti-farming: track 10 `recentMeaningfulActions`, lặp reason giảm hệ số (1.0→0.7→0.4→0.1)

### 4. 2-tier Summary System ⭐⭐
- Lượt > 40 → tóm tắt 20 lượt cũ thành 1 summary block (level 1)
- 10 summary level 1 → tóm tắt thành 1 meta-summary (level 2)
- Giải quyết context window khi chơi dài

### 5. Trade Negotiation Tags ⭐
- `[SELL_VALUATION: itemName=..., multiplier=X]` (X 0.0-2.0)
- `[BUY_NEGOTIATION: itemName=..., multiplier=Y]`
- `[OFFER_ITEM_IDEA]` → trigger 3-step item pipeline → push vào `traderWares`

### 6. Visual Combat (VFX Arena) ⭐ (Tham vọng)
- Sprite multi-pose: base + idle + attack + N skills (gen bằng Imagen + Gemini Flash Image)
- 11 vfxType × 5 moveType combinations
- Canvas processing: flood-fill xóa nền trắng, normalize mass
- Cinematic camera: zoom 1.5x cho ultimate, focus 2 nhân vật cho basic
- Screen shake/flash, floating damage text

### 7. Quest 3-stage với deadline ⭐
- `LORE_QUEST` (tin đồn) → `QUEST_ASSIGNED` (kích hoạt) → `QUEST_OBJECTIVE_COMPLETED` (track) → `QUEST_UPDATED status=completed/failed`
- Có `completion_condition: return_to_npc | auto_complete`
- Có `deadline_hours` cho quest có thời hạn
- Auto-cleanup quest completed/failed > 5 ngày

### 8. Length Tags với Word Count Cụ Thể ⭐
- `dai` (3000 từ) | `vua` (2000) | `ngan` (1000) | `sieungan` (500)
- AI nhận tag → biết viết bao nhiêu từ, không quá ngắn không quá dài

## Điểm yếu code reference

- **Mega-component**: 9000 lines / 1 file, khó maintain
- **No type safety**: JSX thuần, có lỗi name/Name không nhất quán
- **Image cost cao**: Imagen 4.0 + Gemini Flash Image per character × N skills
- **Performance**: Deep clone state mỗi handler, sẽ chậm khi state lớn
- **No tests**: Combat formulas + budget calc cực phức tạp dễ regression

## Cách tham khảo

Khi cần research pattern cụ thể, grep file này. VD:
- Item pipeline: search `fetchInitialItemDetails`, `calculateBalancingBudget`, `buildWeaponPrompt`
- Smart filter: search `findLoreEntity`, `formatEntityForPrompt`
- VFX: search `VisualCombatArena`, `vfxType`, `processSprite`
- EP system: search `ENCOUNTER_REWARD`, `recentMeaningfulActions`
- Summary: search `runSummarizationInBackground`, `storySummaries`

/**
 * Logic Engine — Step 1 của "Hybrid Xúc Xắc" pattern (theo prototype).
 *
 * Mục đích: tách quyết định LOGIC (state mutation, item gen, quest trigger) khỏi
 * VĂN PHONG (prose). AI logic engine sinh 6 scenarios khả thi với:
 *   - probability (0-100, sum ~100) — weight cho dice roll
 *   - summary — mô tả 2-3 câu chuyện gì xảy ra
 *   - classification_tags — phân loại độ dài/sắc thái/nsfw
 *   - relevant_entities — NPC/item liên quan
 *   - commands — game tags ([EXP+], [ITEM], [QUEST_GIVEN]...) sẽ apply nếu chosen
 *
 * Client dice roll theo probability → pick 1 scenario → step 2 (Narrative Engine)
 * dùng scenario.summary + style hints để viết prose. Commands được append vào raw
 * để tag-parser apply state mutation.
 *
 * Lợi ích:
 *   1. AI không phải juggle game rules + prose cùng lúc → văn phong tốt hơn
 *   2. State mutations consistent (logic engine focus 100% vào tags)
 *   3. Dice roll random nhưng có weight → cảm giác "thiên cơ" không cố định
 *   4. Có thể inspect scenarios trước khi commit (debugging)
 */

import { z } from 'zod';
import type { PlayerCharacter } from '@gametypes/character';
import type { GameSettings } from '@state/game-store';

/** Persona expert đứng giữa narrative + game state mutations */
const SYSTEM_PERSONA = `Ngươi là **EXPERT LOGIC ENGINE** cho game tu tiên text-based.
Nhiệm vụ: Phân tích tình huống hiện tại + hành động vừa rồi của nhân vật, sinh ra **6 KỊCH BẢN KHẢ THI** mà câu chuyện có thể tiếp diễn.

KHÔNG viết văn phong. KHÔNG kể chuyện. Chỉ trả về JSON cấu trúc.

Mỗi scenario phải:
- Có xác suất (probability) hợp lý dựa trên: độ khó game, chỉ số nhân vật (atk/def/lvl), tâm cảnh, may rủi.
- Tổng probability của 6 scenarios = ~100 (không cần chính xác 100, miễn cộng lại > 80 và < 120).
- Phân bổ đa dạng: nên có ít nhất 1 scenario tích cực, 1 tiêu cực, 1 trung lập, 1 sự kiện bất ngờ.
- "commands" liệt kê các game tag sẽ apply nếu scenario này được chọn (1 chuỗi, mỗi tag 1 dòng).`;

export interface LogicEngineContext {
  settings: GameSettings;
  player: PlayerCharacter;
  realm?: string;
  recentHistory: string[];
  lastAction?: string;
  currentLocation?: string;
  isOpening?: boolean;
  /** Difficulty multiplier — Dễ: tăng probability tích cực, Khó: tăng tiêu cực */
  difficulty?: string;
  // ─── 2-tier lore (Refactor 3) ───
  loreNpcs?: Array<{ id: string; name: string; description: string; materialized?: boolean }>;
  loreLocations?: Array<{ id: string; name: string; description: string; region?: string; materialized?: boolean }>;
  worldNpcs?: Array<{ id: string; name: string; loreId?: string }>;
  worldLocations?: Array<{ id: string; name: string; loreId?: string }>;
  // ─── Memory expand (Refactor 5) ───
  meaningfulEvents?: Array<{ turn: number; kind: string; summary: string }>;
  customRules?: string[];
  /** Phase 11.1: 2-tier story summaries để giữ context khi chơi dài */
  storySummaries?: Array<{ content: string; level: number; turnStart?: number; turnEnd?: number }>;
  // ─── Phase 8.3: Fan-fic items + skills hints ───
  fanFicItems?: Array<{ name: string; category: string; rarity: string; description: string }>;
  fanFicSkills?: Array<{ name: string; kind: string; rarity: string; description: string }>;
  // ─── Phase 9.2: Cultivation terminology hints ───
  fanFicTerms?: Array<{ term: string; kind: string; explanation: string }>;
}

// ─────────────────────────────────────────────────────────────
// Zod schema — bắt buộc AI trả đúng shape
// ─────────────────────────────────────────────────────────────

const VALID_TONES = ['tích cực', 'tiêu cực', 'trung lập', 'bất ngờ'] as const;
type ToneEnum = typeof VALID_TONES[number];

export const ClassificationTagsSchema = z.object({
  /** Độ dài narrative AI sẽ viết: 'ngắn' < 100 từ, 'trung bình' 100-200, 'dài' 200+ */
  length: z.enum(['ngắn', 'trung bình', 'dài']),
  /** Sắc thái: tích cực = win, tiêu cực = thất bại, trung lập = info, bất ngờ = sự kiện kỳ lạ.
   * Preprocess: coerce enum lạ → 'trung lập' để AI flexibility không crash app. */
  tone: z.preprocess(
    (v) => (VALID_TONES.includes(v as ToneEnum) ? v : 'trung lập'),
    z.enum(VALID_TONES),
  ) as z.ZodType<ToneEnum>,
  /** NSFW: chỉ 'nsfw' khi settings.isNsfwMode bật + scenario có yếu tố 18+ */
  rating: z.enum(['sfw', 'nsfw']),
});

export const ScenarioSchema = z.object({
  probability: z.number().min(0).max(100),
  summary: z.string().min(10).max(500),
  classification_tags: ClassificationTagsSchema,
  /** Tên NPC/item/location liên quan đến scenario (giúp narrative engine reference đúng) */
  relevant_entities: z.array(z.string()).max(10),
  /** Game tags sẽ apply, mỗi tag 1 dòng. Vd "[EXP+ 50]\n[ITEM Trường Kiếm|Thường|Vũ khí]" */
  commands: z.string(),
});

export const LogicResponseSchema = z.object({
  scenarios: z.array(ScenarioSchema).min(3).max(8),
});

export type Scenario = z.infer<typeof ScenarioSchema>;
export type LogicResponse = z.infer<typeof LogicResponseSchema>;

// ─────────────────────────────────────────────────────────────
// Prompt builder
// ─────────────────────────────────────────────────────────────

/** Build lore context block — chỉ inject nếu có lore entries (tránh nhồi prompt rỗng) */
const buildLoreContextBlock = (ctx: LogicEngineContext): string => {
  const unmaterializedNpcs = (ctx.loreNpcs ?? []).filter((x) => !x.materialized);
  const unmaterializedLocs = (ctx.loreLocations ?? []).filter((x) => !x.materialized);
  const npcs = ctx.worldNpcs ?? [];
  const locs = ctx.worldLocations ?? [];
  if (unmaterializedNpcs.length === 0 && unmaterializedLocs.length === 0 && npcs.length === 0 && locs.length === 0) {
    return '';
  }
  const lines: string[] = ['[CONTEXT THẾ GIỚI ĐÃ CÓ — REFERENCE ĐÚNG TÊN]'];

  if (npcs.length > 0) {
    lines.push('\nNPCs đã gặp (dùng đúng id khi tương tác):');
    npcs.slice(0, 8).forEach((n) => lines.push(`  - ${n.name} (id: ${n.id})${n.loreId ? ` ← từ tin đồn ${n.loreId}` : ''}`));
  }
  if (locs.length > 0) {
    lines.push('\nĐịa danh đã đến:');
    locs.slice(0, 8).forEach((l) => lines.push(`  - ${l.name} (id: ${l.id})${l.loreId ? ` ← từ tin đồn ${l.loreId}` : ''}`));
  }
  if (unmaterializedNpcs.length > 0) {
    lines.push('\nNPC đã NGHE ĐỒN (nếu xuất hiện thật → tag WORLD_NPC với loreId tương ứng):');
    unmaterializedNpcs.slice(0, 6).forEach((n) => lines.push(`  - ${n.name} (loreId: ${n.id}) — ${n.description.slice(0, 80)}`));
  }
  if (unmaterializedLocs.length > 0) {
    lines.push('\nĐịa danh đã NGHE ĐỒN (nếu player đến → WORLD_LOCATION với loreId):');
    unmaterializedLocs.slice(0, 6).forEach((l) => lines.push(`  - ${l.name} (loreId: ${l.id})${l.region ? ` ở ${l.region}` : ''} — ${l.description.slice(0, 80)}`));
  }
  return lines.join('\n');
};

export const buildLogicEnginePrompt = (ctx: LogicEngineContext): string => {
  const { settings, player, realm, recentHistory, lastAction, isOpening, difficulty } = ctx;

  const personaBlock = `
[BỐI CẢNH NHÂN VẬT]
- Tên: ${player.Name}
- Cấp độ: ${player.level} (${realm ?? 'Phàm Nhân'})
- HP: ${player.finalStats.hp}/${player.finalStats.maxhp} · ATK ${player.finalStats.atk} · DEF ${player.finalStats.def} · SPD ${player.finalStats.spd}
- Linh thạch: ${player.currency}
- Linh căn: ${player.spiritualRoot ? `${player.spiritualRoot.type} (${player.spiritualRoot.elements.join(',')}) ×${player.spiritualRoot.cultivationMultiplier}` : '(chưa khai thông)'}
- Tính cách: ${player.personality ?? 'chưa rõ'}
${player.description ? `- Background: ${player.description}` : ''}
`.trim();

  // Phase 13.1B: Canon fidelity rules
  const fidelity = (settings as { canonFidelity?: 'strict' | 'liberal' | 'original' }).canonFidelity;
  const fidelityBlock = settings.isFanFictionMode && fidelity
    ? (() => {
        if (fidelity === 'strict') {
          return `
[ĐỘ TRUNG THÀNH CANON: STRICT — bám sát nguyên tác]
- TUYỆT ĐỐI không tạo NPC hoặc event không có trong nguyên tác.
- KHÔNG spoil các plot tương lai của truyện gốc (assume reader đang đọc dở).
- Tính cách + power level NPC PHẢI bám sát mô tả gốc — không buff/nerf tùy ý.
- Khi cần NPC mới (đệ tử ngoại môn, dân thường, lính canh) thì OK nhưng KHÔNG để họ trở thành nhân vật then chốt.
- Nếu player định hành động trái canon, scenario có thể đưa "consequence cảnh báo" (sư phụ ngăn cản, thiên cơ khó lay chuyển...).
`.trim();
        }
        if (fidelity === 'original') {
          return `
[ĐỘ TRUNG THÀNH CANON: ORIGINAL — chỉ mượn cosmology]
- Chỉ giữ realm system + đơn vị thời gian + thuật ngữ + cosmology của nguyên tác.
- TỰ DO tạo NPC mới, sect mới, location mới, arc mới — không bị ràng buộc plot gốc.
- KHÔNG cần đảm bảo NPC gốc xuất hiện đúng vị trí/thời gian.
- Vẫn giữ vibe + tone tổng thể của universe gốc để fan không bị tụt mood.
`.trim();
        }
        // liberal (default)
        return `
[ĐỘ TRUNG THÀNH CANON: LIBERAL — cùng universe, story mới]
- Set trong cùng universe gốc, NPC chính giữ tính cách + power level đại khái đúng.
- ĐƯỢC PHÉP tạo arc mới + side NPC mới + side quest mới.
- TRÁNH contradict major canon events (vd không cho main villain chết sớm hơn nguyên tác nếu chưa tới timeline đó).
- Nếu player phá vỡ canon, scenario có thể tạo "alternate timeline" hợp lý.
`.trim();
      })()
    : '';

  const worldBlock = `
[BỐI CẢNH THẾ GIỚI]
- Tiêu đề truyện: ${settings.storyTitle || 'Mặc Hội Tiên Đồ'}
- Độ khó: ${difficulty ?? settings.difficulty}
${settings.isFanFictionMode ? `- Fan-fiction của: ${settings.fanFicOriginalWork ?? '(không rõ)'}` : ''}
${settings.theme ? `- Thể loại: ${settings.theme}` : ''}
${settings.isNsfwMode ? '- Chế độ 18+: BẬT (cho phép tạo scenario nsfw)' : '- Chế độ 18+: TẮT (chỉ sfw)'}
${fidelityBlock ? '\n' + fidelityBlock : ''}
`.trim();

  const historyBlock = recentHistory.length
    ? `\n[LỊCH SỬ GẦN ĐÂY (${recentHistory.length} turn cuối)]\n${recentHistory.map((h, i) => `(T-${recentHistory.length - i}) ${h}`).join('\n\n')}\n`
    : '';

  const actionBlock = lastAction
    ? `\n[HÀNH ĐỘNG VỪA RỒI]\n"${lastAction}"\n`
    : '';

  const taskBlock = isOpening
    ? `
[NHIỆM VỤ]
Đây là CHƯƠNG MỞ ĐẦU. Sinh 6 scenarios cho cảnh nhân vật chính xuất hiện lần đầu.
- 2-3 scenarios setup bối cảnh nhẹ (gặp NPC, được giao quest, nhận item khởi đầu)
- 1-2 scenarios sự kiện bất ngờ (kỳ ngộ, gặp hiểm họa nhỏ)
- 1 scenario yên tĩnh (tu luyện đơn giản, suy ngẫm)
- Mỗi scenario PHẢI có commands inject 1-3 game tags để start nhân vật với item/currency/quest hợp lý.
`.trim()
    : `
[NHIỆM VỤ]
Sinh 6 scenarios cho hệ quả của hành động vừa rồi. Phân bổ:
- 1-2 scenarios "đúng như ngươi tính" (tích cực, làm theo mong đợi)
- 1-2 scenarios "có biến" (xuất hiện NPC bất ngờ, gặp item, twist nhẹ)
- 1 scenario "tệ" (gặp khó khăn, bị thương, mất tài nguyên)
- 1 scenario "bất ngờ lớn" (kỳ ngộ, đột phá, hoặc nguy hiểm cao)

Probability dựa trên độ khó:
- Dễ: scenarios tích cực ~60-70%, tiêu cực ~10-15%
- Thường: tích cực ~45%, tiêu cực ~25%, trung lập ~30%
- Khó: tích cực ~30%, tiêu cực ~40%, trung lập ~30%
- Ác Mộng: tích cực ~20%, tiêu cực ~50%, bất ngờ lớn 10% chết người
`.trim();

  const tagReferenceBlock = `
[GAME TAGS CHO PHÉP TRONG "commands"]
Mỗi tag 1 dòng. Chỉ dùng các tag dưới (không bịa tag mới):

━━ Stats / Items ━━
  [EXP+ N]                              — exp gained (tu luyện, giết quái, hoàn quest)
  [HP+ N] / [HP- N]                     — máu thay đổi
  [CURRENCY+ N] / [CURRENCY- N]         — linh thạch ±
  [AP+ N]                               — điểm tiềm năng (sau đột phá)
  [STAT atk+5] / [STAT def-3] ...       — buff/debuff vĩnh viễn 1 stat
  [ITEM Tên|Phẩm chất|Loại]             — nhận item mới
                                          Phẩm chất: Thường/Tốt/Hiếm/Cực Phẩm/Siêu Phẩm/Huyền Thoại
                                          Loại: Vũ khí/Đan dược/Nguyên liệu/Tín vật/Sách kỹ năng
  [SKILL Tên|kind|Phẩm chất]            — học skill mới (kind: combat_basic/combat_ultimate/adventure)

━━ Progression ━━
  [REALM_BREAK]                         — trigger đột phá cảnh giới
  [TRIBULATION lý do]                   — trigger độ kiếp cutscene (chỉ khi đạt level 10/20/30...)
  [COMBAT Tên kẻ địch|Cấp độ]           — bắt đầu combat
  [LOCATION id|Tên]                     — đổi địa điểm
  [STATUS_ADD status_id|hours]          — áp long-term status (TRONG_THUONG, TRUNG_DOC...)
  [NOTE Tin nhắn]                       — notification ngắn cho player

━━ Quests ━━
  [QUEST_GIVEN Tiêu đề|kind|Mô tả|Tên giao]  — nhận nhiệm vụ mới (kind: main/side/sect/cultivation/hidden)
  [QUEST_COMPLETE Tiêu đề chính xác]    — hoàn thành nhiệm vụ
  [QUEST_FAILED Tiêu đề chính xác]      — thất bại nhiệm vụ
  [QUEST_OBJECTIVE_COMPLETED quest="..." objective="..." quantity=N]  — hoàn thành 1 sub-task
  [QUEST_OBJECTIVE_UPDATED quest="..." objective="..." newText="..."]  — cập nhật mô tả objective

━━ World state ━━ (Refactor 4)
  [TIME_PASSED hours=N days=N weather="Trời quang|Mưa nhẹ|Sương mù|Tuyết rơi|Lôi vũ"]
                                          — thời gian trôi (advance gameTime)
                                          - Thường: 1-3 hours/turn
                                          - Tu luyện: 2-12 hours
                                          - Hành trình xa: 1-7 days
                                          - Bế quan: tháng/năm
  [CHARACTER_UPDATE target="player" currency=+50 hp=-10 stance="..." affinity=+5]
                                          — update player hoặc NPC. Multi-attr 1 tag.
                                          target = "player" hoặc tên NPC
  [APPLY_LONG_TERM_STATUS target="player" statusId="TRONG_THUONG" hours=168]
                                          — áp status dài hạn. statusId hợp lệ:
                                          TRONG_THUONG, XUAT_HUYET, NGAT, TRUNG_DOC,
                                          AM_HAN, TAU_HOA_NHAP_MA, BENH_DI_AN, KHAI_QUANG
  [CURE_LONG_TERM_STATUS target="player" statusId="..."]  — giải status
  [RELATIONSHIP_CHANGED npc="..." standing="thân thiết|tri kỷ|lạnh nhạt|thù địch|sinh tử thù" reason="..."]

━━ Reward system (Phase 11.2 — 4-criteria scoring) ━━
  [ENCOUNTER_REWARD score=N reason="..." target="player"]
                                          — AI chấm hành động player theo 4 tiêu chí (tổng tối đa 100):

      ┌─ 1. QUAN TRỌNG & TU LUYỆN (0-55) ─┐
      │  - 35-55: Đột phá, đánh trùm, lĩnh ngộ tuyệt kỹ, bế quan thành công
      │  - 10-30: Hoàn thành phụ, đánh quái yếu, luyện tập cơ bản
      │  - 0-5: Tương tác xã hội, đi lại, quan sát không quan trọng
      └────────────────────────────────────┘

      ┌─ 2. RỦI RO (0-15) ─┐
      │  - 12-15: Cực mạo hiểm, đặt cược lớn
      │  - 1-11: Có rủi ro vừa
      │  - 0: An toàn
      └────────────────────┘

      ┌─ 3. SÁNG TẠO (0-10) ─┐
      │  - 8-10: Giải pháp phá lối mòn, cực thông minh
      │  - 3-7: Tự nhập action hợp lý
      │  - 0-2: Chọn ABCD có sẵn
      └──────────────────────┘

      ┌─ 4. PHÙ HỢP NHẬP VAI (0-15) ─┐
      │  - 11-15: Hành động hiện thân hoàn hảo của tính cách
      │  - 5-10: Trung lập
      │  - 0-3: Trái ngược tính cách
      └──────────────────────────────┘

      → ep_score = Q&TL + Rủi Ro + Sáng Tạo + Phù Hợp
      → Engine sẽ auto-anti-farm nếu reason lặp lại (1.0→0.7→0.4→0.1)
      → Engine sẽ auto-convert EP ≥ 20 thành EXP lĩnh ngộ
      → Reason phải MÔ TẢ cụ thể hành động (vd "Bế quan tu luyện Hỏa Cầu", KHÔNG "Tu luyện")

  [ITEM_IDEA_GAINED name="..." description="..." rarity="..."]
                                          — player BIẾT về món hiếm/công thức (chưa có item thực).
                                          Sau này tìm thấy → [ITEM ...] với cùng tên.

━━ Trade negotiation (Phase 11.3 — Pattern #5) ━━
  Khi player tương tác với thương nhân/dược phòng/bảo các:

  [ENTER_TRADE_MODE traderName="Lý Quản Sự" attitude="friendly|neutral|hostile"]
                                          — mở giao dịch. attitude điều chỉnh base sell multiplier
                                          (friendly=1.1, neutral=1.0, hostile=0.7).

  [SELL_VALUATION itemName="Tên" multiplier=X]    — định giá item player muốn bán.
                                                    X ∈ [0.0, 2.0]. Bỏ itemName = áp toàn shop.
                                                    Vd hứng thú: 1.5. Thờ ơ: 0.5. Không cần: 0.0.

  [BUY_NEGOTIATION itemName="Tên" multiplier=Y]   — phản hồi player mặc cả giá MUA.
                                                    Y < 1 = giảm giá; Y > 1 = hét giá thêm.
                                                    Vd giảm 5%: 0.95. Khinh thường: 1.3.

  [OFFER_ITEM_IDEA name="..." description="..." rarity="..." category="..." price=N]
                                          — sáng tạo MỘT vật phẩm trader có và muốn bán.
                                          Engine sẽ pipeline gen full Item khi player mua.
                                          ĐỪNG OFFER nếu player chưa hỏi mua / NPC không có hứng.

  [EXIT_TRADE_MODE]                       — đóng giao dịch khi player rời, hoặc giao dịch kết thúc.

  QUY TẮC: Luôn dùng [ENTER_TRADE_MODE] đầu tiên khi player approach trader.
  Luôn dùng [EXIT_TRADE_MODE] khi player rời hoặc cảnh chuyển sang nội dung khác.

━━ 2-tier Lore (QUAN TRỌNG — pattern "foreshadowing") ━━

  TIER 1 — LORE_* (tin đồn, chưa gặp thật):
    [LORE_NPC id="lore_npc_<slug>" name="..." description="..." source="..."]
    [LORE_LOCATION id="lore_loc_<slug>" name="..." description="..." category="city|sect|wilderness|secret_realm|mountain|ruins" region="..."]
    [LORE_ITEM id="lore_item_<slug>" name="..." description="..." rarity="..."]
    [LORE_QUEST id="lore_quest_<slug>" title="..." description="..." source="..."]

  Khi nào dùng LORE_*:
  - NPC khác kể về một nhân vật/địa danh (vd "Tần Phụng kể về Vạn Pháp Tông ở phía bắc")
  - Player đọc sách/bia đá nhắc tới entity chưa gặp
  - Tin đồn trên giang hồ về cao thủ/báu vật

  TIER 2 — WORLD_* (entity hiện thực hóa khi player thực sự gặp):
    [WORLD_NPC id="<slug>" loreId="lore_npc_<slug>" name="..." description="..." level=10 stance="hostile|neutral|friendly"]
    [WORLD_LOCATION id="<slug>" loreId="lore_loc_<slug>" name="..." description="..." category="..."]

  Khi nào dùng WORLD_*:
  - Player ĐẾN địa danh (lần đầu hoặc lần thứ N) → nếu trước đó có LORE_LOCATION cùng concept, link loreId về
  - Player GẶP NPC mặt đối mặt
  - loreId là OPTIONAL — chỉ link khi có lore trước đó

  Quy ước slug: chỉ ascii lowercase + underscore, vd "van_phap_tong", "tan_phung"
  Lợi ích: AI có thể foreshadow → mạch truyện liên kết, player nhớ "đã nghe đồn về cái này"
`.trim();

  const formatBlock = `
[ĐỊNH DẠNG ĐẦU RA — BẮT BUỘC JSON]
{
  "scenarios": [
    {
      "probability": 35,
      "summary": "Mô tả 2-3 câu chuyện gì xảy ra trong scenario này. Không viết văn phong, chỉ tóm tắt logic.",
      "classification_tags": {
        "length": "trung bình",
        "tone": "tích cực",
        "rating": "sfw"
      },
      "relevant_entities": ["Sư huynh Mặc Uyên", "Linh Tâm Thảo"],
      "commands": "[EXP+ 30]\\n[NOTE Tìm thấy được dược liệu]"
    },
    ... (5 scenarios khác)
  ]
}

KHÔNG viết gì ngoài JSON. KHÔNG dùng markdown wrapper.
`.trim();

  const loreContextBlock = buildLoreContextBlock(ctx);

  const eventsBlock = ctx.meaningfulEvents && ctx.meaningfulEvents.length > 0
    ? `[SỰ KIỆN TRỌNG ĐẠI ĐÃ XẢY RA — bám context lâu]\n${ctx.meaningfulEvents
        .slice(-12)
        .map((e) => `  · T${e.turn} [${e.kind}] ${e.summary}`)
        .join('\n')}`
    : '';

  // Phase 11.1: 2-tier story summaries — context khi chơi dài (>40 turn)
  const summariesBlock = ctx.storySummaries && ctx.storySummaries.length > 0
    ? `[BIÊN NIÊN SỬ — TÓM TẮT CÁC GIAI ĐOẠN ĐÃ TRẢI QUA]\n${ctx.storySummaries
        .map((s, i) => {
          const lvl = s.level >= 2 ? `Siêu Tóm Tắt Lvl${s.level}` : 'Tóm Tắt';
          const range = s.turnStart !== undefined && s.turnEnd !== undefined
            ? ` (T${s.turnStart}-T${s.turnEnd})`
            : '';
          return `[${lvl} giai đoạn ${i + 1}${range}]\n${s.content}`;
        })
        .join('\n\n')}`
    : '';

  const rulesBlock = ctx.customRules && ctx.customRules.length > 0
    ? `[QUY TẮC TÙY CHỈNH NGƯỜI CHƠI ĐẶT RA — TUÂN THỦ TUYỆT ĐỐI]\n${ctx.customRules
        .map((r, i) => `  ${i + 1}. ${r}`)
        .join('\n')}`
    : '';

  // Phase 8.3: Fan-fic items + skills hints — AI dùng đúng tên nguyên tác khi gen [ITEM]/[SKILL]
  const itemsHintBlock = ctx.fanFicItems && ctx.fanFicItems.length > 0
    ? `[VẬT PHẨM NỔI TIẾNG UNIVERSE — KHI GEN TAG [ITEM ...] HÃY DÙNG TÊN NÀY THAY VÌ BỊA]\n${ctx.fanFicItems
        .map((it) => `  · ${it.name} (${it.category}, ${it.rarity}) — ${it.description.slice(0, 80)}`)
        .join('\n')}`
    : '';

  const skillsHintBlock = ctx.fanFicSkills && ctx.fanFicSkills.length > 0
    ? `[CÔNG PHÁP SIGNATURE UNIVERSE — KHI GEN TAG [SKILL ...] HÃY DÙNG TÊN NÀY]\n${ctx.fanFicSkills
        .map((sk) => `  · ${sk.name} (${sk.kind}, ${sk.rarity}) — ${sk.description.slice(0, 80)}`)
        .join('\n')}`
    : '';

  // Phase 9.2: Thuật ngữ tu luyện đặc trưng — AI dùng đúng từ thay vì generic
  const termsHintBlock = ctx.fanFicTerms && ctx.fanFicTerms.length > 0
    ? `[THUẬT NGỮ TU LUYỆN ĐẶC TRƯNG UNIVERSE — KHI VIẾT SCENARIO SUMMARY HÃY DÙNG ĐÚNG]\n${ctx.fanFicTerms
        .map((t) => `  · [${t.kind}] ${t.term} — ${t.explanation}`)
        .join('\n')}\nVD: thay vì "kinh mạch" generic → dùng "Vĩnh Hải" nếu là Mục Thần Ký. Thay vì "vùng đất hoang" → "Đại Khư".`
    : '';

  return [
    SYSTEM_PERSONA,
    personaBlock,
    worldBlock,
    loreContextBlock,
    itemsHintBlock,
    skillsHintBlock,
    termsHintBlock,
    summariesBlock,       // Phase 11.1: biên niên sử (đặt trước eventsBlock để AI đọc trước context xa)
    eventsBlock,
    rulesBlock,           // Đặt rules cuối cùng = AI sẽ "nhớ" gần nhất
    historyBlock,
    actionBlock,
    taskBlock,
    tagReferenceBlock,
    formatBlock,
  ]
    .filter(Boolean)
    .join('\n\n');
};

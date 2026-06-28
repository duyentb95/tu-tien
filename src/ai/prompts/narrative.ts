import type { PlayerCharacter } from '@gametypes/character';
import type { GameSettings } from '@state/game-store';

export interface NarrativeContext {
  settings: GameSettings;
  player: PlayerCharacter;
  realm?: string;
  recentHistory: string[];
  currentLocation?: string;
  lastAction?: string;
  isOpening?: boolean;
  // ─── 2-tier lore (Refactor 3) ───
  /** Tin đồn về NPC chưa gặp — AI có thể reference khi narrative gặp thật */
  loreNpcs?: Array<{ id: string; name: string; description: string; materialized?: boolean }>;
  loreLocations?: Array<{ id: string; name: string; description: string; region?: string; materialized?: boolean }>;
  /** Active world entities — đã materialize, AI cần reference đúng tên + state */
  worldNpcs?: Array<{ id: string; name: string; description?: string; loreId?: string }>;
  worldLocations?: Array<{ id: string; name: string; description?: string; loreId?: string }>;
  // ─── Memory expand (Refactor 5) ───
  /** Sự kiện trọng đại (rolling) — AI nhớ thay vì chỉ raw history */
  meaningfulEvents?: Array<{ turn: number; kind: string; summary: string }>;
  /** Custom rules user yêu cầu AI tuân thủ */
  customRules?: string[];
  /** Phase 11.1: tóm tắt 2-tier cho long-play context */
  storySummaries?: Array<{ content: string; level: number; turnStart?: number; turnEnd?: number }>;
  // ─── Phase 8.3: Fan-fic items + skills hints ───
  fanFicItems?: Array<{ name: string; category: string; rarity: string; description: string }>;
  fanFicSkills?: Array<{ name: string; kind: string; rarity: string; description: string }>;
  // ─── Phase 9.2: Cultivation terminology hints ───
  fanFicTerms?: Array<{ term: string; kind: string; explanation: string }>;
  // ─── Phase 22.3: Canon pack beasts + cosmology hints (Logic Engine inject pool) ───
  canonBeasts?: Array<{ name: string; kind: string; description: string; tier?: string }>;
  canonPackName?: string;
  canonCosmologyHint?: string;
  /** Phase 9.3: callback báo phase đang chạy (cho UI hiển thị state) */
  onPhase?: (phase: 'logic' | 'narrative') => void;
}

/**
 * Build "grounding block" cho fan-fic mode — chỉ inject info user đã chọn.
 * AI Gemini tự dùng knowledge public về universe để dệt narrative đúng nguyên tác.
 *
 * Không cần inject lore cứng — AI biết Mục Thần Ký = Tần Mục/Đại Hoang/Linh Hải khi
 * thấy storyTitle + realmList đúng.
 */
const buildFanFicGroundingBlock = (settings: GameSettings): string => {
  const lines: string[] = [
    '[BỐI CẢNH ĐỒNG NHÂN — BẮT BUỘC TUÂN THỦ NGUYÊN TÁC]',
  ];
  if (settings.fanFicOriginalWork) {
    lines.push(`Đây là fan-fiction của tác phẩm gốc: **"${settings.fanFicOriginalWork}"**`);
  }
  if (settings.fanFicCharacterType) {
    const typeLabel = settings.fanFicCharacterType === 'incarnate'
      ? 'Hóa Thân (nhân vật CÓ SẴN trong nguyên tác — giữ đúng vai trò, mối quan hệ)'
      : 'Khởi Sinh (nhân vật MỚI sống trong universe gốc — AI tự dệt vào lore hợp lý)';
    lines.push(`Kiểu nhân vật chính: ${typeLabel}`);
  }
  if (settings.theme) {
    lines.push(`Thể loại: ${settings.theme}`);
  }
  if (settings.setting) {
    lines.push(`\nBối cảnh thế giới gốc:\n${settings.setting}`);
  }
  if (settings.realmListOverride && settings.realmListOverride.length > 0) {
    lines.push(`\nHệ thống cảnh giới NGUYÊN TÁC (PHẢI DÙNG đúng tên, KHÔNG dùng "Luyện Khí/Trúc Cơ/Kim Đan" nếu không có trong list):`);
    lines.push(settings.realmListOverride.map((r, i) => `  ${i + 1}. ${r}`).join('\n'));
  }
  lines.push(`
LƯU Ý KHI VIẾT NARRATIVE:
- Dùng đúng tên NPC, địa danh, hệ thống cảnh giới của nguyên tác
- Văn phong theo tinh thần nguyên tác (nghiêm túc/hài hước/bi tráng tùy bộ)
- KHÔNG bịa thuật ngữ lạ ngoài nguyên tác
- KHÔNG spoiler twist late-game ở đoạn mở đầu
- Tôn trọng mối quan hệ nhân vật chính với các NPC khác (sư huynh/đệ tử/kẻ địch)`);

  return lines.join('\n');
};

const TAG_REFERENCE = `
[ĐỊNH DẠNG TAG GAME — BẮT BUỘC dùng khi có sự kiện]
Tag được đặt SAU phần <narrative>, mỗi tag 1 dòng. Đừng dùng tag trong narrative.

  [EXP+ N]                              — Nhân vật được N exp (tu luyện, giết quái, hoàn quest)
  [HP+ N] hoặc [HP- N]                  — Hồi máu / mất máu
  [CURRENCY+ N] hoặc [CURRENCY- N]      — Linh thạch ±
  [AP+ N]                               — Điểm tiềm năng (sau đột phá)
  [STAT atk+5] / [STAT def-3] ...       — Buff/debuff vĩnh viễn 1 stat (atk/def/spd/hp)
  [ITEM Tên|Phẩm chất|Loại]             — Nhân vật nhận item mới
                                          Phẩm chất: Thường/Tốt/Hiếm/Cực Phẩm/Siêu Phẩm/Huyền Thoại
                                          Loại: Vũ khí/Đan dược/Nguyên liệu/Tín vật/Sách kỹ năng/...
  [SKILL Tên|kind|Phẩm chất]            — Học skill mới (kind: combat_basic/combat_ultimate/adventure)
  [REALM_BREAK]                         — Trigger đột phá cảnh giới
  [TRIBULATION lý do]                   — Trigger độ kiếp cutscene (chỉ dùng khi đạt level 10/20/30...)
  [COMBAT Tên kẻ địch|Cấp độ]           — Bắt đầu combat (chuyển sang combat screen)
  [LOCATION id|Tên]                     — Đổi địa điểm
  [STATUS_ADD status_id|hours]          — Áp long-term status (TRONG_THUONG, TRUNG_DOC...)
  [NOTE Tin nhắn hệ thống]              — Hiển thị notification ngắn cho player
  [QUEST_GIVEN Tiêu đề|kind|Mô tả|Tên giao]  — Player nhận nhiệm vụ mới
                                                kind: main/side/sect/cultivation/hidden
  [QUEST_COMPLETE Tiêu đề chính xác]    — Đánh dấu nhiệm vụ đã hoàn thành
  [QUEST_FAILED Tiêu đề chính xác]      — Đánh dấu nhiệm vụ thất bại

KHÔNG dùng tag nào khác. KHÔNG bịa tag.
KHÔNG quá 6 tag/chunk (giữ tiết tấu).
`.trim();

export const buildNarrativePrompt = (ctx: NarrativeContext): string => {
  const { settings, player, realm, recentHistory, lastAction, isOpening } = ctx;

  // Fan-fic context — đã được hydrate qua wizard + AI analyzer (Phase 1 refactor).
  // KHÔNG cần preset cứng nữa: settings.theme/setting/realmListOverride đã chứa
  // toàn bộ lore mà AI analyzer trả về. AI Gemini có public knowledge về universe.
  const loreBlock = settings.isFanFictionMode
    ? buildFanFicGroundingBlock(settings)
    : '';

  const personaBlock = `
[BỐI CẢNH NHÂN VẬT]
- Tên: ${player.Name}
- Giới tính: ${player.gender ?? 'không xác định'}
- Tính cách: ${player.personality ?? 'chưa rõ'}
- Cấp độ: ${player.level} (${realm ?? 'Phàm Nhân'})
- HP: ${player.finalStats.hp}/${player.finalStats.maxhp}
- Linh thạch: ${player.currency}
- Linh căn: ${player.spiritualRoot ? `${player.spiritualRoot.type} (${player.spiritualRoot.elements.join(',')}) ×${player.spiritualRoot.cultivationMultiplier}` : '(chưa khai thông)'}
- Mô tả: ${player.description ?? '(chưa có)'}
`.trim();

  const settingsBlock = `
[BỐI CẢNH THẾ GIỚI]
- Tiêu đề truyện: ${settings.storyTitle || 'Mặc Hội Tiên Đồ'}
- Độ khó: ${settings.difficulty}
- Phong cách văn: ${settings.writingStyle || 'tự nhiên, cổ phong'}
- Ngôi kể: ${settings.narratorPronoun}
- Đơn vị tiền: ${settings.currencyName}
${settings.isNsfwMode ? '- Chế độ 18+: BẬT' : ''}
`.trim();

  const historyBlock = recentHistory.length
    ? `\n[LỊCH SỬ GẦN ĐÂY]\n${recentHistory.map((h, i) => `(${i + 1}) ${h}`).join('\n\n')}\n`
    : '';

  const actionBlock = lastAction
    ? `\n[HÀNH ĐỘNG VỪA RỒI CỦA NHÂN VẬT]\n${lastAction}\n`
    : '';

  const taskBlock = isOpening
    ? `
[NHIỆM VỤ]
Đây là CHƯƠNG MỞ ĐẦU. Hãy:
1. Mô tả bối cảnh nhân vật chính xuất hiện (1-2 đoạn, không quá 200 từ). Có thể có 1 NPC nói chuyện.
2. Tạo cảm giác cổ phong, huyền ảo, tu tiên.
3. Nếu phù hợp: dùng [ITEM] hoặc [CURRENCY+] để cấp đồ khởi đầu hợp lý cho cấp ${player.level}.
4. Đề xuất 4 lựa chọn hành động đầu tiên.
`.trim()
    : `
[NHIỆM VỤ]
Tiếp tục câu chuyện dựa trên hành động vừa rồi của nhân vật. Hãy:
1. Mô tả kết quả của hành động + diễn biến tiếp theo (1-3 đoạn, không quá 250 từ).
2. Có thể có NPC nói chuyện qua <dialogue speaker="Tên NPC">Nội dung</dialogue>.
3. Dùng game tag để cập nhật state:
   - Tu luyện → [EXP+ N] (N từ 30-200 tùy thời lượng)
   - Đánh thắng quái → [EXP+] [CURRENCY+] [ITEM ...] [HP- N nếu bị thương]
   - Đến địa điểm mới → [LOCATION id|Tên]
   - Đủ exp đột phá → [REALM_BREAK] (và [TRIBULATION] nếu cấp 10/20/30...)
4. Đề xuất 4 lựa chọn hành động tiếp theo.
`.trim();

  const formatBlock = `
[ĐỊNH DẠNG ĐẦU RA — BẮT BUỘC TUÂN THỦ]

<narrative>
{Đoạn văn kể chuyện. Có thể chứa <dialogue speaker="Tên NPC">Nội dung</dialogue> bên trong.}
</narrative>

{Các tag game ở đây, mỗi tag 1 dòng. Optional nếu chunk không có sự kiện.}

[ACTION:1] {Lựa chọn 1, ngắn gọn dưới 80 ký tự}
[ACTION:2] {Lựa chọn 2}
[ACTION:3] {Lựa chọn 3}
[ACTION:4] {Lựa chọn 4}

KHÔNG viết gì ngoài định dạng trên. KHÔNG dùng markdown # ** \`.
`.trim();

  return [
    loreBlock,    // Đặt LORE đầu tiên — AI đọc đầu, weight cao nhất
    personaBlock,
    settingsBlock,
    historyBlock,
    actionBlock,
    taskBlock,
    TAG_REFERENCE,
    formatBlock,
  ]
    .filter(Boolean)
    .join('\n\n');
};

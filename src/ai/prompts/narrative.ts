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
}

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

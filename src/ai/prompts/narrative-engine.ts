/**
 * Narrative Engine — Step 3 của "Hybrid Xúc Xắc" pattern.
 *
 * Input: scenario được dice-roll chọn từ Logic Engine + style hints + character context.
 * Output: VĂN PHONG TIỂU THUYẾT (narrative + dialogue) + 4 action choices.
 *
 * KHÔNG sinh game tags — đã được Logic Engine quyết định ở scenario.commands.
 * Narrative Engine chỉ FOCUS vào prose chất lượng + 4 lựa chọn tiếp theo.
 *
 * Style hints lấy từ classification_tags:
 *   - length: 'ngắn' (~80 từ) / 'trung bình' (~150) / 'dài' (~250)
 *   - tone: hướng cảm xúc văn (tích cực = hào hứng, tiêu cực = u tối, trung lập = bình thản)
 *   - rating: sfw / nsfw (chỉ nsfw nếu settings cho phép)
 */

import type { PlayerCharacter } from '@gametypes/character';
import type { GameSettings } from '@state/game-store';
import type { Scenario } from './logic-engine';

export interface NarrativeEngineContext {
  scenario: Scenario;
  settings: GameSettings;
  player: PlayerCharacter;
  realm?: string;
  recentHistory: string[];
  lastAction?: string;
  isOpening?: boolean;
}

const SYSTEM_PERSONA = `Ngươi là **TIỂU THUYẾT GIA TU TIÊN** chuyên viết text-RPG cổ phong Đông Phương.
Nhiệm vụ: viết đoạn văn tường thuật cho scenario đã được chọn sẵn, theo phong cách + độ dài + sắc thái yêu cầu.

KHÔNG được:
- Sinh thêm game tag [EXP+]/[ITEM]/[QUEST_GIVEN]... — đã được Logic Engine quyết định.
- Đi lệch summary scenario — phải bám sát logic của scenario.
- Spoil future events.
- Dùng markdown headings (#, ##, *...).

PHẢI:
- Viết tiếng Việt cổ phong, dùng từ Hán-Việt tự nhiên (tu sĩ, đạo hữu, linh khí, thiên kiếp...).
- Đoạn văn flow tự nhiên, KHÔNG liệt kê dạng bullet.
- Có thể inject <dialogue speaker="Tên NPC">Nội dung</dialogue> trong narrative cho lời thoại NPC.
- Đề xuất 4 lựa chọn hành động tiếp theo (mỗi lựa chọn < 80 ký tự).`;

const lengthGuide = (length: Scenario['classification_tags']['length']): string => {
  switch (length) {
    case 'ngắn': return 'NGẮN (60-100 từ, 1 đoạn) — phù hợp cảnh nhanh, transition';
    case 'trung bình': return 'TRUNG BÌNH (100-200 từ, 2-3 đoạn) — cảnh chính, đối thoại nhẹ';
    case 'dài': return 'DÀI (200-300 từ, 3-4 đoạn) — cảnh quan trọng, đột phá, gặp NPC lớn';
    default: return 'TRUNG BÌNH (100-200 từ)';
  }
};

const toneGuide = (tone: Scenario['classification_tags']['tone']): string => {
  switch (tone) {
    case 'tích cực': return 'TÍCH CỰC — hào hứng, hy vọng, thắng lợi nhỏ. Dùng từ ngữ ấm áp.';
    case 'tiêu cực': return 'TIÊU CỰC — u tối, bi thương, thất bại. Dùng từ ngữ trầm lắng.';
    case 'trung lập': return 'TRUNG LẬP — bình thản, mô tả khách quan. Tránh cảm xúc mạnh.';
    default: return 'TRUNG LẬP';
  }
};

export const buildNarrativeEnginePrompt = (ctx: NarrativeEngineContext): string => {
  const { scenario, settings, player, realm, recentHistory, lastAction, isOpening } = ctx;
  const tags = scenario.classification_tags;

  const personaBlock = `
[NHÂN VẬT]
Tên: ${player.Name} · Cấp ${player.level} (${realm ?? 'Phàm Nhân'})
Tính cách: ${player.personality ?? 'chưa rõ'}
${player.description ? `Background: ${player.description}` : ''}
`.trim();

  const worldBlock = `
[BỐI CẢNH]
Truyện: ${settings.storyTitle || 'Mặc Hội Tiên Đồ'}
Ngôi kể: ${settings.narratorPronoun || 'Để AI quyết định'}
${settings.writingStyle ? `Văn phong: ${settings.writingStyle}` : ''}
${settings.isFanFictionMode ? `Đồng nhân của: ${settings.fanFicOriginalWork}` : ''}
${settings.theme ? `Thể loại: ${settings.theme}` : ''}
${settings.setting ? `Setting gốc: ${settings.setting}` : ''}
${settings.isNsfwMode && tags.rating === 'nsfw' ? 'CHẾ ĐỘ 18+: BẬT — được phép viết tình tiết người lớn.' : ''}
`.trim();

  const historyBlock = recentHistory.length
    ? `\n[CONTEXT GẦN ĐÂY]\n${recentHistory.slice(-3).map((h, i) => `(${i + 1}) ${h}`).join('\n')}\n`
    : '';

  const scenarioBlock = `
[SCENARIO ĐÃ CHỌN — PHẢI BÁM SÁT]
Logic Engine đã quyết định scenario này sẽ xảy ra. Nhiệm vụ ngươi là **viết văn phong** kể lại sự kiện này, không đổi nội dung.

Summary: ${scenario.summary}
${scenario.relevant_entities.length > 0 ? `NPCs/Items liên quan (PHẢI reference đúng tên): ${scenario.relevant_entities.join(', ')}` : ''}
${lastAction ? `Hành động trước đó của nhân vật: "${lastAction}"` : ''}
${isOpening ? '(Đây là CHƯƠNG MỞ ĐẦU — giới thiệu nhân vật, bối cảnh)' : ''}
`.trim();

  const styleBlock = `
[CHỈ THỊ VĂN PHONG]
Độ dài: ${lengthGuide(tags.length)}
Sắc thái: ${toneGuide(tags.tone)}
`.trim();

  const formatBlock = `
[ĐỊNH DẠNG ĐẦU RA — BẮT BUỘC]

<narrative>
{Đoạn văn tường thuật, đúng độ dài + sắc thái yêu cầu. Có thể chứa <dialogue speaker="Tên NPC">Nội dung</dialogue>.}
</narrative>

[ACTION:1] {Lựa chọn 1, ngắn gọn dưới 80 ký tự — bám theo gì vừa xảy ra}
[ACTION:2] {Lựa chọn 2 — hướng khác/thận trọng}
[ACTION:3] {Lựa chọn 3 — táo bạo/khám phá}
[ACTION:4] {Lựa chọn 4 — meta (mở bản đồ/inventory/tu luyện)}

LƯU Ý:
- KHÔNG viết game tag [EXP+]/[ITEM]/[NOTE]... — đã có ở scenario.commands.
- KHÔNG dùng markdown # ** \`.
- KHÔNG mở ngoặc kép cho dialogue trong văn xuôi — dùng <dialogue> tag thay.
- 4 actions phải KHÁC NHAU, KHÔNG trùng ý.
`.trim();

  return [
    SYSTEM_PERSONA,
    personaBlock,
    worldBlock,
    historyBlock,
    scenarioBlock,
    styleBlock,
    formatBlock,
  ]
    .filter(Boolean)
    .join('\n\n');
};

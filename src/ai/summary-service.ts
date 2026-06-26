/**
 * Phase 11.1: 2-tier Summary Service (Pattern #4 từ Google Canvas RPG).
 *
 * Bài toán: storyLog dài tới hàng trăm entry, prompt tokens không đủ chứa hết.
 * Giải pháp: tóm tắt ngầm 20 turn cũ thành 1 block ~5-8 câu (level 1).
 * Khi tích đủ 10 block level 1 → tóm tắt thành 1 meta-summary (level 2).
 * Recursively up to level N.
 *
 * Background — không block player input. Triple-lock chống reentrant.
 */

import { callAI } from './providers/router';
import type { StoryEntry } from '@state/game-store';
import type { StorySummary } from '@gametypes/memory';
import { SUMMARY_META_BATCH } from '@gametypes/memory';

/** Format raw entries thành prompt input dễ đọc cho AI summarizer. */
const formatEntriesForPrompt = (entries: StoryEntry[]): string => {
  return entries
    .map((entry, idx) => {
      const n = idx + 1;
      if (entry.kind === 'player_action') {
        return `${n}. [Hành động ngươi]: ${entry.content}`;
      }
      if (entry.kind === 'system') {
        return `${n}. [Hệ thống]: ${entry.content}`;
      }
      // narrative
      if (entry.segments && entry.segments.length > 0) {
        const text = entry.segments
          .map((s) =>
            s.type === 'narrative' ? s.content : `${s.speaker}: "${s.content}"`,
          )
          .join(' ');
        return `${n}. ${text}`;
      }
      return `${n}. ${entry.content ?? ''}`;
    })
    .join('\n');
};

/**
 * Tạo summary level 1 từ 20 turn raw.
 *
 * Prompt port từ Google Canvas runSummarizationInBackground (level 1).
 */
export const summarizeTurns = async (
  entries: StoryEntry[],
  turnStart?: number,
  turnEnd?: number,
): Promise<StorySummary | null> => {
  const prompt = `
VAI TRÒ: Ngươi là một người ghi chép biên niên sử.
NHIỆM VỤ: Đọc kỹ ${entries.length} lượt chơi dưới đây và tóm tắt lại thành MỘT đoạn văn duy nhất (khoảng 5-8 câu).

YÊU CẦU:
1. Nội dung: Chỉ giữ lại những sự kiện QUAN TRỌNG nhất: khám phá địa điểm mới, gặp NPC quan trọng, hoàn thành mục tiêu, nhận vật phẩm/kỹ năng đặc biệt, đột phá cảnh giới, xung đột lớn. Bỏ qua các chi tiết vụn vặt.
2. Thời gian & không gian: Mở đầu bản tóm tắt bằng cách nêu rõ khoảng thời gian / địa điểm, ví dụ: "Trong những ngày qua tại Hắc Thủy Trấn, ngươi đã..."
3. Văn phong tu tiên cổ trang, ngắn gọn súc tích.
4. Định dạng: CHỈ trả về đoạn văn tóm tắt. KHÔNG có markdown, KHÔNG header, KHÔNG bullet point.

--- DỮ LIỆU CẦN TÓM TẮT ---
${formatEntriesForPrompt(entries)}
`.trim();

  try {
    const text = await callAI('auto', prompt, { purpose: 'analyze' });
    const trimmed = text.trim();
    if (!trimmed) return null;

    return {
      id: `summary_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      content: trimmed,
      level: 1,
      ...(turnStart !== undefined ? { turnStart } : {}),
      ...(turnEnd !== undefined ? { turnEnd } : {}),
      createdAt: Date.now(),
    };
  } catch (err) {
    console.warn('[summary-service] Tóm tắt level 1 thất bại:', err);
    return null;
  }
};

/**
 * Meta-summarize: gộp 10 block level N → 1 block level N+1.
 *
 * Prompt port từ Google Canvas runSummarizationInBackground (level 2).
 */
export const metaSummarize = async (
  summaries: StorySummary[],
): Promise<StorySummary | null> => {
  if (summaries.length === 0) return null;
  const baseLevel = summaries[0]?.level ?? 1;

  const prompt = `
VAI TRÒ: Ngươi là một nhà sử học bậc thầy.
NHIỆM VỤ: Đọc ${summaries.length} bản tóm tắt dưới đây (mỗi bản tóm tắt một giai đoạn). Hãy tổng hợp chúng thành MỘT bản "siêu tóm tắt" (khoảng 8-10 câu).

YÊU CẦU:
1. Nội dung: Tập trung vào CÁC SỰ KIỆN VĨ MÔ, bước ngoặt lớn của câu chuyện, sự thay đổi lớn trong mối quan hệ hoặc sức mạnh của nhân vật chính.
2. Thời gian: Nêu bật được dòng chảy thời gian qua các giai đoạn.
3. Văn phong tu tiên cổ trang, có thiền vị.
4. Định dạng: CHỈ trả về đoạn văn "siêu tóm tắt". KHÔNG header.

--- CÁC BẢN TÓM TẮT CẦN TỔNG HỢP ---
${summaries.map((s, i) => `Giai đoạn ${i + 1}:\n${s.content}`).join('\n\n')}
`.trim();

  try {
    const text = await callAI('auto', prompt, { purpose: 'analyze' });
    const trimmed = text.trim();
    if (!trimmed) return null;

    const first = summaries[0];
    const last = summaries[summaries.length - 1];
    return {
      id: `meta_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      content: trimmed,
      level: baseLevel + 1,
      ...(first?.turnStart !== undefined ? { turnStart: first.turnStart } : {}),
      ...(last?.turnEnd !== undefined ? { turnEnd: last.turnEnd } : {}),
      createdAt: Date.now(),
    };
  } catch (err) {
    console.warn('[summary-service] Meta-tóm tắt thất bại:', err);
    return null;
  }
};

/**
 * Build context block để inject vào prompt narrative.
 * Format: "Tóm tắt giai đoạn N (Lvl L): ..."
 */
export const formatSummariesForPrompt = (summaries: StorySummary[]): string => {
  if (summaries.length === 0) return '';
  return summaries
    .map((s, i) => {
      const lvlLabel = s.level >= 2 ? `Siêu Tóm Tắt Lvl ${s.level}` : `Tóm Tắt`;
      const turnRange =
        s.turnStart !== undefined && s.turnEnd !== undefined
          ? ` (lượt ${s.turnStart}-${s.turnEnd})`
          : '';
      return `[${lvlLabel} giai đoạn ${i + 1}${turnRange}]\n${s.content}`;
    })
    .join('\n\n');
};

/**
 * Check meta condition: nếu count of level-1 summaries ≥ SUMMARY_META_BATCH → cần meta.
 * Returns slice cần meta hoặc null.
 */
export const shouldMetaSummarize = (
  summaries: StorySummary[],
): { toMeta: StorySummary[]; rest: StorySummary[] } | null => {
  // Tìm batch các summary cùng level (level 1) đủ SUMMARY_META_BATCH ở đầu mảng
  const level1Count = summaries.filter((s) => s.level === 1).length;
  if (level1Count < SUMMARY_META_BATCH) return null;
  const toMeta = summaries.filter((s) => s.level === 1).slice(0, SUMMARY_META_BATCH);
  const toMetaIds = new Set(toMeta.map((s) => s.id));
  const rest = summaries.filter((s) => !toMetaIds.has(s.id));
  return { toMeta, rest };
};

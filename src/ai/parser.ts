import { stripGameTags } from './tag-parser';

/**
 * Parser cho response narrative — tách:
 *   - narrative chunks (text + dialogue bubbles), đã strip tag side-effect
 *   - 4 action choices
 *   - raw text gốc (để tag-parser bóc events)
 */

export type StorySegment =
  | { type: 'narrative'; content: string }
  | { type: 'dialogue'; speaker: string; content: string };

/**
 * Phase 9.1: Action có metadata preview (tham khảo game reference).
 * Format gốc: `[ACTION:1] Text` → string đơn
 * Format mới: `[ACTION:1|85|Nhận 50 EXP, đột phá Linh Thai] Text` → có rate + reward preview
 */
export interface ActionChoice {
  text: string;
  /** 0-100. undefined nếu AI không gen rate (mock cũ / parse fail) */
  successRate?: number;
  /** "Nhận 50 EXP, tăng tiến độ Linh Thai" — readable summary */
  rewardPreview?: string;
}

export interface ParsedNarrative {
  segments: StorySegment[];
  /** Backwards-compat: string[] (chỉ text). UI mới dùng `actionChoices` */
  actions: string[];
  /** Phase 9.1: structured actions với % + reward */
  actionChoices: ActionChoice[];
  raw: string;
  /** True nếu narrative này là mock fallback do AI fail. UI có thể show warning. */
  isFallback?: boolean;
}

const DIALOGUE_RE = /<dialogue\s+speaker="([^"]+)">([\s\S]*?)<\/dialogue>/g;
/** Fallback: dialogue mở mà chưa close (response truncate). Match đến hết text. */
const DIALOGUE_OPEN_RE = /<dialogue\s+speaker="([^"]+)">([\s\S]*?)$/;
/**
 * Phase 9.1: extended action format.
 * `[ACTION:1|85|Nhận 50 EXP, đột phá Linh Thai] Ngồi xuống thỉnh giáo Trưởng Thôn`
 *   group 1 = idx (1-4)
 *   group 2 = success rate 0-100 (optional)
 *   group 3 = reward preview (optional)
 *   group 4 = action text
 */
const ACTION_EXT_RE = /\[ACTION:\s*(\d+)\s*(?:\|\s*(\d+)\s*(?:\|\s*([^\]]*))?)?\s*\]\s*(.+?)(?=\n|$)/g;
const NARRATIVE_BLOCK_RE = /<narrative>([\s\S]*?)<\/narrative>/i;
/** Strip raw tag rác (truncate fragment, malformed) khỏi text plain */
const ORPHAN_TAG_RE = /<\/?dialogue[^>]*>?/g;
const ORPHAN_NARRATIVE_TAG_RE = /<\/?narrative>?/g;

/** Repair response truncated: auto-close <dialogue> nếu hở */
const repairTruncatedResponse = (text: string): string => {
  // Count dialogue open vs close
  const opens = (text.match(/<dialogue\s+speaker="/g) || []).length;
  const closes = (text.match(/<\/dialogue>/g) || []).length;
  if (opens > closes) {
    // Truncate giữa dialogue → close tự động
    // Cũng strip dấu `</dialogue` không có `>`
    const fixed = text.replace(/<\/dialogue$/, '</dialogue>');
    if ((fixed.match(/<\/dialogue>/g) || []).length === opens) return fixed;
    // Vẫn thiếu → append close
    return fixed + '</dialogue>';
  }
  return text;
};

export const parseNarrativeResponse = (raw: string): ParsedNarrative => {
  // Sửa response truncate trước khi parse
  const repaired = repairTruncatedResponse(raw);

  const nMatch = NARRATIVE_BLOCK_RE.exec(repaired);
  const narrativeText = nMatch
    ? nMatch[1]!.trim()
    : repaired.split(/\[ACTION:/i)[0]!.trim();

  const segments: StorySegment[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(DIALOGUE_RE.source, 'g');

  while ((m = re.exec(narrativeText)) !== null) {
    if (m.index > lastIndex) {
      const text = cleanText(narrativeText.substring(lastIndex, m.index));
      if (text) segments.push({ type: 'narrative', content: text });
    }
    segments.push({
      type: 'dialogue',
      speaker: m[1]!.trim(),
      content: cleanText(m[2]!.trim()),
    });
    lastIndex = re.lastIndex;
  }

  // Phần còn lại sau dialogue cuối — có thể chứa dialogue hở chưa close
  if (lastIndex < narrativeText.length) {
    const tail = narrativeText.substring(lastIndex);
    const openMatch = DIALOGUE_OPEN_RE.exec(tail);
    if (openMatch) {
      // Có dialogue hở → split: text trước + dialogue
      const before = tail.substring(0, openMatch.index);
      const beforeClean = cleanText(before);
      if (beforeClean) segments.push({ type: 'narrative', content: beforeClean });
      const dialogueContent = cleanText(openMatch[2]!.trim());
      if (dialogueContent) {
        segments.push({
          type: 'dialogue',
          speaker: openMatch[1]!.trim(),
          content: dialogueContent,
        });
      }
    } else {
      const tailClean = cleanText(tail);
      if (tailClean) segments.push({ type: 'narrative', content: tailClean });
    }
  }

  if (segments.length === 0 && narrativeText) {
    const clean = cleanText(narrativeText);
    if (clean) segments.push({ type: 'narrative', content: clean });
  }

  // Actions — Phase 9.1: parse extended format first, fallback original
  const actionChoices: ActionChoice[] = [];
  const extRe = new RegExp(ACTION_EXT_RE.source, 'g');
  let em: RegExpExecArray | null;
  while ((em = extRe.exec(raw)) !== null) {
    const rateRaw = em[2];
    const rewardRaw = em[3];
    const text = stripGameTags((em[4] ?? '').trim());
    if (!text) continue;
    const choice: ActionChoice = { text };
    if (rateRaw !== undefined && rateRaw !== '') {
      const n = parseInt(rateRaw, 10);
      if (!Number.isNaN(n)) choice.successRate = Math.max(0, Math.min(100, n));
    }
    if (rewardRaw !== undefined && rewardRaw.trim()) {
      choice.rewardPreview = rewardRaw.trim();
    }
    actionChoices.push(choice);
  }

  // Backwards-compat: actions string[]
  const actions: string[] = actionChoices.map((c) => c.text);

  return { segments, actions, actionChoices, raw };
};

/** Clean text: strip game tags + orphan dialogue/narrative tags (truncate fragments) */
const cleanText = (text: string): string => {
  return stripGameTags(text)
    .replace(ORPHAN_TAG_RE, '')
    .replace(ORPHAN_NARRATIVE_TAG_RE, '')
    .trim();
};

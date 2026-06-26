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

export interface ParsedNarrative {
  segments: StorySegment[];
  actions: string[];
  raw: string;
  /** True nếu narrative này là mock fallback do AI fail. UI có thể show warning. */
  isFallback?: boolean;
}

const DIALOGUE_RE = /<dialogue\s+speaker="([^"]+)">([\s\S]*?)<\/dialogue>/g;
/** Fallback: dialogue mở mà chưa close (response truncate). Match đến hết text. */
const DIALOGUE_OPEN_RE = /<dialogue\s+speaker="([^"]+)">([\s\S]*?)$/;
const ACTION_RE = /\[ACTION:\s*(\d+)\s*\]\s*(.+?)(?=\n|$)/g;
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

  // Actions — không strip tag (action có thể chứa hint dạng "Tu luyện [+EXP]")
  const actions: string[] = [];
  const actionRe = new RegExp(ACTION_RE.source, 'g');
  let am: RegExpExecArray | null;
  while ((am = actionRe.exec(raw)) !== null) {
    actions.push(stripGameTags(am[2]!.trim()));
  }

  return { segments, actions, raw };
};

/** Clean text: strip game tags + orphan dialogue/narrative tags (truncate fragments) */
const cleanText = (text: string): string => {
  return stripGameTags(text)
    .replace(ORPHAN_TAG_RE, '')
    .replace(ORPHAN_NARRATIVE_TAG_RE, '')
    .trim();
};

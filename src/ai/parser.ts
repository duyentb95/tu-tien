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
}

const DIALOGUE_RE = /<dialogue\s+speaker="([^"]+)">([\s\S]*?)<\/dialogue>/g;
const ACTION_RE = /\[ACTION:\s*(\d+)\s*\]\s*(.+?)(?=\n|$)/g;
const NARRATIVE_BLOCK_RE = /<narrative>([\s\S]*?)<\/narrative>/i;

export const parseNarrativeResponse = (raw: string): ParsedNarrative => {
  const nMatch = NARRATIVE_BLOCK_RE.exec(raw);
  const narrativeText = nMatch
    ? nMatch[1]!.trim()
    : raw.split(/\[ACTION:/i)[0]!.trim();

  const segments: StorySegment[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(DIALOGUE_RE.source, 'g');

  while ((m = re.exec(narrativeText)) !== null) {
    if (m.index > lastIndex) {
      const text = stripGameTags(narrativeText.substring(lastIndex, m.index));
      if (text) segments.push({ type: 'narrative', content: text });
    }
    segments.push({
      type: 'dialogue',
      speaker: m[1]!.trim(),
      content: stripGameTags(m[2]!.trim()),
    });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < narrativeText.length) {
    const tail = stripGameTags(narrativeText.substring(lastIndex));
    if (tail) segments.push({ type: 'narrative', content: tail });
  }
  if (segments.length === 0 && narrativeText) {
    const clean = stripGameTags(narrativeText);
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

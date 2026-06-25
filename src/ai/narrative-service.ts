import { callGemini } from './client';
import { buildNarrativePrompt, type NarrativeContext } from './prompts/narrative';
import { parseNarrativeResponse, type ParsedNarrative } from './parser';
import { getMockNarrative, shouldUseMockAi } from './mock';

/**
 * Cấp cao nhất — feature gọi hàm này, không cần biết Gemini vs mock.
 * Wrap retry + parse + fallback chain.
 */
export const generateNarrative = async (
  ctx: NarrativeContext,
): Promise<ParsedNarrative> => {
  // Fallback mock nếu chưa có Gemini key — vẫn demo được flow đầy đủ
  if (shouldUseMockAi()) {
    // Giả lập latency để UX cảm thấy "thật"
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 700));
    const raw = getMockNarrative(!!ctx.isOpening);
    return parseNarrativeResponse(raw);
  }

  const prompt = buildNarrativePrompt(ctx);
  const raw = await callGemini(prompt, { temperature: 0.95, maxOutputTokens: 1200 });
  return parseNarrativeResponse(raw);
};

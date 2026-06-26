import { callGemini } from './client';
import { buildNarrativePrompt, type NarrativeContext } from './prompts/narrative';
import { parseNarrativeResponse, type ParsedNarrative } from './parser';
import { getMockNarrative, shouldUseMockAi } from './mock';

/**
 * Cấp cao nhất — feature gọi hàm này, không cần biết Gemini vs mock.
 * Wrap retry + parse + fallback chain.
 *
 * Hierarchy fallback:
 *   1. Nếu env không có key → mock immediately (offline mode)
 *   2. Gọi AI → callGemini đã retry 5 lần + 3 fallback model trong client.ts
 *   3. Vẫn fail → catch error, log + fallback mock (UX không bị "Lỗi HTTP 503")
 *   4. Mock opening tự personalize theo background user nhập
 */
export const generateNarrative = async (
  ctx: NarrativeContext,
): Promise<ParsedNarrative> => {
  // Fallback mock nếu chưa có Gemini key — vẫn demo được flow đầy đủ
  if (shouldUseMockAi()) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 700));
    const raw = getMockNarrative(!!ctx.isOpening, ctx);
    return parseNarrativeResponse(raw);
  }

  const prompt = buildNarrativePrompt(ctx);
  try {
    // maxOutputTokens 2500: đủ cho narrative dài + 4 actions + game tags
    // (1200 cũ quá thấp → AI bị cắt giữa câu, dialogue tag hở)
    const raw = await callGemini(prompt, { temperature: 0.95, maxOutputTokens: 2500 });
    return parseNarrativeResponse(raw);
  } catch (err) {
    // AI thật fail (đã retry + fallback models trong client.ts).
    // Thay vì throw lên UI → fallback mock + cảnh báo qua note tag.
    console.warn('[narrative-service] AI fail, fallback mock:', err);
    const raw = getMockNarrative(!!ctx.isOpening, ctx);
    const parsed = parseNarrativeResponse(raw);
    // Đánh dấu là fallback để UI có thể hiển thị warning subtle
    return { ...parsed, isFallback: true };
  }
};

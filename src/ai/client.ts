import { z } from 'zod';

/**
 * AI CLIENT — chỗ DUY NHẤT trong codebase gọi Gemini API.
 * Mọi prompt template, parser, schema validation đều đi qua đây.
 * Đổi model = đổi 1 dòng (xem `GEMINI_MODELS` bên dưới).
 *
 * ⚠️  Trong production nên proxy qua Firebase Cloud Functions để ẩn API key.
 *     Hiện tại đọc trực tiếp từ env cho dev — KHÔNG commit `.env`.
 */

// Production-ready Gemini models (priority chain — thử primary trước, fallback nếu fail).
// User có thể override primary qua env VITE_GEMINI_MODEL.
//   gemini-2.5-flash     — recommended (fast + reliable, ít 503)
//   gemini-2.5-flash-lite — siêu rẻ nhưng dễ spike 503
//   gemini-2.0-flash     — stable backup
//   gemini-2.5-pro       — chậm hơn, quality cao nhất
const PRIMARY_MODEL = import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-2.5-flash';

/** Fallback chain — nếu primary fail 503 thì thử model khác */
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite']
  .filter((m) => m !== PRIMARY_MODEL);

const GEMINI_MODELS = [PRIMARY_MODEL, ...FALLBACK_MODELS];

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      '[ai/client] VITE_GEMINI_API_KEY chưa được cấu hình. Xem .env.example.',
    );
  }
  return key;
};

export interface CallOptions {
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: 'text/plain' | 'application/json';
  signal?: AbortSignal;
}

/** Status code có thể retry — 429 (rate limit), 5xx (server error) */
const isRetryable = (status: number) => status === 429 || status >= 500;

/**
 * Exponential backoff retry — base 1.5s, jitter, max 5 attempts cho 503.
 * Chỉ retry trên lỗi 429 + 5xx.
 */
const fetchWithRetry = async (
  url: string,
  init: RequestInit,
  maxAttempts = 5,
): Promise<Response> => {
  let lastError: unknown;
  let lastStatus = 0;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      lastStatus = res.status;
      if (!isRetryable(res.status)) return res; // non-retryable, return luôn
      // Đọc body để log
      const bodyText = await res.text().catch(() => '');
      lastError = new Error(`HTTP ${res.status}: ${bodyText.slice(0, 200)}`);
    } catch (e) {
      lastError = e;
    }
    if (attempt < maxAttempts - 1) {
      // Backoff: 1.5s → 3s → 6s → 12s + jitter ±25%
      const base = 1500 * 2 ** attempt;
      const jitter = (Math.random() - 0.5) * 0.5 * base;
      const delay = Math.min(15_000, base + jitter);
      console.warn(`[ai/client] HTTP ${lastStatus}, retry ${attempt + 1}/${maxAttempts} sau ${Math.round(delay)}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError ?? new Error('fetchWithRetry: unknown failure');
};

/**
 * Gọi Gemini với fallback model chain.
 * Nếu primary model fail (sau retry), thử lần lượt các fallback.
 */
const callGeminiOnce = async (
  modelName: string,
  prompt: string,
  opts: CallOptions = {},
): Promise<string> => {
  const url = `${GEMINI_BASE}/${modelName}:generateContent?key=${getApiKey()}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.9,
      maxOutputTokens: opts.maxOutputTokens ?? 4096,
      responseMimeType: opts.responseMimeType ?? 'text/plain',
    },
  };

  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok) {
    throw new Error(`[ai/client] Gemini ${modelName} error ${res.status}: ${await res.text().catch(() => '')}`);
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) {
    throw new Error('[ai/client] Empty response from Gemini');
  }
  return text;
};

/**
 * Public API — gọi Gemini với auto retry + fallback model chain.
 * Pass `schema` để validate response qua zod (cho structured output).
 */
export async function callGemini(prompt: string, opts?: CallOptions): Promise<string>;
export async function callGemini<T>(
  prompt: string,
  opts: CallOptions & { schema: z.ZodSchema<T> },
): Promise<T>;
export async function callGemini<T>(
  prompt: string,
  opts: CallOptions & { schema?: z.ZodSchema<T> } = {},
): Promise<string | T> {
  if (opts.schema) {
    opts = { ...opts, responseMimeType: 'application/json' };
  }

  let lastError: unknown;
  for (const model of GEMINI_MODELS) {
    try {
      const text = await callGeminiOnce(model, prompt, opts);
      if (model !== PRIMARY_MODEL) {
        console.info(`[ai/client] Fallback ${model} success (primary ${PRIMARY_MODEL} unavailable)`);
      }
      if (opts.schema) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error(`[ai/client] Gemini returned invalid JSON: ${text.slice(0, 200)}`);
        }
        return opts.schema.parse(parsed);
      }
      return text;
    } catch (e) {
      lastError = e;
      console.warn(`[ai/client] Model ${model} failed, trying next fallback...`, e);
      // Continue to next fallback
    }
  }
  // All models failed
  throw lastError ?? new Error('[ai/client] Tất cả Gemini models đều fail. Thử lại sau vài phút.');
}

/** Tiện ích: ước lượng token count (rough: 1 token ≈ 4 chars cho EN, ≈ 2 chars cho VI). */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 3); // trung gian VI/EN
};

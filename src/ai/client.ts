import { z } from 'zod';

/**
 * AI CLIENT — chỗ DUY NHẤT trong codebase gọi Gemini API.
 * Mọi prompt template, parser, schema validation đều đi qua đây.
 * Đổi model = đổi 1 dòng (xem `GEMINI_MODEL` bên dưới).
 *
 * ⚠️  Trong production nên proxy qua Firebase Cloud Functions để ẩn API key.
 *     Hiện tại đọc trực tiếp từ env cho dev — KHÔNG commit `.env`.
 */

// Production-ready Gemini models (as of 2026):
//   gemini-2.5-flash     — recommended (fast + cheap + reliable)
//   gemini-2.5-flash-lite — siêu rẻ, kém quality hơn chút
//   gemini-2.5-pro       — chậm hơn, quality cao nhất
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-2.5-flash';
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

/**
 * Exponential backoff retry — 3 lần, delay tăng 1s → 2s → 4s.
 * Chỉ retry trên lỗi 429 (rate limit) và 5xx (server error).
 */
const fetchWithRetry = async (
  url: string,
  init: RequestInit,
  maxAttempts = 3,
): Promise<Response> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status !== 429 && res.status < 500) return res; // non-retryable
      lastError = new Error(`HTTP ${res.status}: ${await res.text().catch(() => '')}`);
    } catch (e) {
      lastError = e;
    }
    if (attempt < maxAttempts - 1) {
      const delay = 1000 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError ?? new Error('fetchWithRetry: unknown failure');
};

/**
 * Gọi Gemini text generation. Trả về text raw.
 * Nếu pass `schema` thì sẽ validate response qua zod và trả object đã parse.
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
  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${getApiKey()}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.9,
      maxOutputTokens: opts.maxOutputTokens ?? 4096,
      responseMimeType: opts.schema ? 'application/json' : opts.responseMimeType ?? 'text/plain',
    },
  };

  const res = await fetchWithRetry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok) {
    throw new Error(`[ai/client] Gemini error ${res.status}: ${await res.text().catch(() => '')}`);
  }

  const data = await res.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!text) {
    throw new Error('[ai/client] Empty response from Gemini');
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
}

/** Tiện ích: ước lượng token count (rough: 1 token ≈ 4 chars cho EN, ≈ 2 chars cho VI). */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 3); // trung gian VI/EN
};

import { z } from 'zod';

/**
 * AI CLIENT — chỗ DUY NHẤT trong codebase gọi Gemini API.
 * Mọi prompt template, parser, schema validation đều đi qua đây.
 *
 * 3 layer resilience:
 *   1. Multi-key rotation — round-robin qua nhiều API keys (VITE_GEMINI_API_KEY_1..N)
 *      → spread quota qua nhiều Google AI Studio account, ít 429/quota exceeded
 *   2. Multi-model fallback — primary fail → thử các model khác
 *      → ít 503 vì spike model cụ thể
 *   3. Retry với exponential backoff — base 1.5s, jitter, max 5 attempts
 *      → tự heal khi spike tạm thời
 *
 * ⚠️  Trong production nên proxy qua Firebase Cloud Functions để ẩn API key.
 *     Hiện tại đọc trực tiếp từ env cho dev — KHÔNG commit `.env`.
 */

// ─────────────────────────────────────────────────────────────
// Multi-key rotation
// ─────────────────────────────────────────────────────────────

/**
 * Đọc tất cả API keys từ env. Support 2 format:
 *   - VITE_GEMINI_API_KEY (legacy, 1 key) — vẫn được dùng
 *   - VITE_GEMINI_API_KEY_1, _2, _3,... (rotation, recommend) — quota gấp N
 *
 * Có thể trộn cả 2 (vd: 1 main key + 2 backup keys).
 * Duplicate keys tự dedupe.
 */
const collectApiKeys = (): string[] => {
  const keys: string[] = [];
  const env = import.meta.env as Record<string, string | undefined>;

  // Legacy single-key
  const single = env.VITE_GEMINI_API_KEY;
  if (single && single !== 'mock') keys.push(single);

  // Numbered keys _1..._10
  for (let i = 1; i <= 10; i++) {
    const k = env[`VITE_GEMINI_API_KEY_${i}`];
    if (k && k !== 'mock') keys.push(k);
  }

  // Dedupe
  return Array.from(new Set(keys));
};

const API_KEYS = collectApiKeys();
let keyRoundRobinIdx = 0;
/** Set keys đang bị rate-limit/quota — skip trong vòng 60s rồi unblock */
const blockedKeys = new Map<string, number>(); // key → unblock timestamp ms

const isKeyBlocked = (key: string): boolean => {
  const until = blockedKeys.get(key);
  if (!until) return false;
  if (Date.now() > until) {
    blockedKeys.delete(key);
    return false;
  }
  return true;
};

const blockKey = (key: string, durationMs = 60_000) => {
  blockedKeys.set(key, Date.now() + durationMs);
  const masked = key.slice(0, 6) + '...' + key.slice(-4);
  console.warn(`[ai/client] Key ${masked} bị block ${durationMs / 1000}s (quota/rate limit)`);
};

/** Lấy key tiếp theo theo round-robin, skip blocked keys */
const nextApiKey = (): string => {
  if (API_KEYS.length === 0) {
    throw new Error(
      '[ai/client] Không có API key nào. Set VITE_GEMINI_API_KEY hoặc VITE_GEMINI_API_KEY_1..N trong env.',
    );
  }
  // Thử tối đa N lần (N = số key), skip blocked
  for (let i = 0; i < API_KEYS.length; i++) {
    const key = API_KEYS[keyRoundRobinIdx % API_KEYS.length]!;
    keyRoundRobinIdx++;
    if (!isKeyBlocked(key)) return key;
  }
  // Tất cả blocked → fallback đại 1 key (sẽ tự fail nếu vẫn block)
  console.warn('[ai/client] Tất cả keys đang blocked, dùng tạm key[0]');
  return API_KEYS[0]!;
};

// ─────────────────────────────────────────────────────────────
// Rate limit client-side — chống user spam quota / abuse free tier
// Sliding window: max N call trong M giây
// ─────────────────────────────────────────────────────────────

const RATE_LIMIT_KEY = 'mac-do:rate-limit';
const RATE_LIMIT_MAX = 60;          // max 60 calls
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // trong 60 phút

interface RateLimitEntry {
  timestamps: number[]; // ms timestamps của các call gần đây
}

const readRateLimit = (): RateLimitEntry => {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { timestamps: [] };
    return JSON.parse(raw) as RateLimitEntry;
  } catch {
    return { timestamps: [] };
  }
};

const writeRateLimit = (entry: RateLimitEntry) => {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(entry));
  } catch {
    // ignore quota
  }
};

/** Check + record 1 call. Throw nếu vượt limit. */
const enforceRateLimit = (): void => {
  const entry = readRateLimit();
  const now = Date.now();
  // Lọc timestamp cũ ngoài window
  const recent = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    const oldestInWindow = Math.min(...recent);
    const resetInMin = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldestInWindow)) / 60000);
    throw new Error(
      `[ai/client] Đạt giới hạn ${RATE_LIMIT_MAX} request/giờ. Vui lòng chờ ${resetInMin} phút.`,
    );
  }
  recent.push(now);
  writeRateLimit({ timestamps: recent });
};

/** Tiện ích cho UI hiển thị quota còn lại */
export const getRateLimitStatus = (): { used: number; max: number; resetInMs: number } => {
  const entry = readRateLimit();
  const now = Date.now();
  const recent = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  const oldestInWindow = recent.length > 0 ? Math.min(...recent) : now;
  return {
    used: recent.length,
    max: RATE_LIMIT_MAX,
    resetInMs: recent.length > 0 ? RATE_LIMIT_WINDOW_MS - (now - oldestInWindow) : 0,
  };
};

// ─────────────────────────────────────────────────────────────
// Models
// ─────────────────────────────────────────────────────────────

// Production-ready Gemini models (priority chain — primary trước, fallback nếu fail).
//   gemini-2.5-flash     — recommended (fast + reliable, ít 503)
//   gemini-2.5-flash-lite — siêu rẻ nhưng dễ spike 503
//   gemini-2.0-flash     — stable backup
//   gemini-2.5-pro       — chậm hơn, quality cao nhất
const PRIMARY_MODEL = import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite']
  .filter((m) => m !== PRIMARY_MODEL);
const GEMINI_MODELS = [PRIMARY_MODEL, ...FALLBACK_MODELS];

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface CallOptions {
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: 'text/plain' | 'application/json';
  signal?: AbortSignal;
  /**
   * Thinking budget (Gemini 2.5 series).
   * 0 = disable thinking (fast + cheap + ít 503 trên free tier).
   * undefined = default Google (auto-thinking ~350 tokens, tốn quota).
   * Số dương = budget cap thinking tokens.
   *
   * Cho game narrative thông thường: set 0 — không cần reasoning sâu, viết truyện thôi.
   * Cho combat AI decision / boss strategy: có thể bật (vd 256).
   */
  thinkingBudget?: number;
}

/** Status code có thể retry với cùng key — 5xx (server error) */
const isRetryableSameKey = (status: number) => status >= 500;
/** Status code nên switch key — 429 (rate limit per key) hoặc 403 (key invalid/blocked) */
const isKeyExhausted = (status: number) => status === 429 || status === 403;

/**
 * Exponential backoff retry — base 1.5s, jitter, max 5 attempts cho 5xx.
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
      if (!isRetryableSameKey(res.status)) return res; // non-retryable, return luôn
      const bodyText = await res.text().catch(() => '');
      lastError = new Error(`HTTP ${res.status}: ${bodyText.slice(0, 200)}`);
    } catch (e) {
      lastError = e;
    }
    if (attempt < maxAttempts - 1) {
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
 * Public API — gọi Gemini với matrix retry:
 *   for each model in [primary, ...fallbacks]:
 *     for each key in available_keys (round-robin):
 *       attempt with retry-on-5xx
 *       if key exhausted (429/403) → block key 60s, try next key
 *       if model unavailable (404) → break inner, try next model
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
  // Rate limit check — chống user spam (kể cả khi multi-key quota dư)
  enforceRateLimit();

  if (opts.schema) {
    opts = { ...opts, responseMimeType: 'application/json' };
  }

  let lastError: unknown;

  for (const model of GEMINI_MODELS) {
    // Mỗi model thử max N key (N = số key có)
    const keyAttempts = Math.max(1, API_KEYS.length);
    for (let i = 0; i < keyAttempts; i++) {
      const key = nextApiKey();
      try {
        const url = `${GEMINI_BASE}/${model}:generateContent?key=${key}`;
        const thinkingBudget = opts.thinkingBudget ?? 0;
        const generationConfig: Record<string, unknown> = {
          temperature: opts.temperature ?? 0.9,
          maxOutputTokens: opts.maxOutputTokens ?? 4096,
          responseMimeType: opts.responseMimeType ?? 'text/plain',
        };
        if (model.includes('2.5')) {
          generationConfig.thinkingConfig = { thinkingBudget };
        }
        const body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig,
        };
        const res = await fetchWithRetry(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: opts.signal,
        });

        if (res.ok) {
          const data = await res.json();
          const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          if (!text) throw new Error('[ai/client] Empty response from Gemini');

          if (model !== PRIMARY_MODEL) {
            console.info(`[ai/client] ✓ Fallback ${model} success (primary ${PRIMARY_MODEL} unavailable)`);
          }
          if (API_KEYS.length > 1) {
            console.debug(`[ai/client] ✓ Key #${(keyRoundRobinIdx - 1) % API_KEYS.length + 1}/${API_KEYS.length} success`);
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

        // Non-OK response — quyết định block key hay switch model
        const status = res.status;
        const errText = await res.text().catch(() => '');
        lastError = new Error(`[ai/client] ${model} HTTP ${status}: ${errText.slice(0, 150)}`);

        if (isKeyExhausted(status)) {
          // Quota/rate limit cho key này → block 60s, thử key khác
          blockKey(key);
          continue; // next key for SAME model
        }
        if (status === 404) {
          // Model deprecated/unavailable → skip model
          console.warn(`[ai/client] Model ${model} unavailable (404), skip`);
          break; // next model
        }
        // 400/401: client error, không retry được
        if (status >= 400 && status < 500) {
          console.warn(`[ai/client] ${model} client error ${status}, skip`);
          break;
        }
        // 5xx đã retry trong fetchWithRetry, đến đây = exhausted → next key/model
      } catch (e) {
        lastError = e;
        console.warn(`[ai/client] ${model} với key #${i + 1} failed:`, e);
        // Network error hoặc fetchWithRetry exhausted → thử key kế tiếp
      }
    }
  }

  // All models × all keys exhausted
  throw lastError ?? new Error('[ai/client] Tất cả model + key đều fail. Thử lại sau vài phút.');
}

/** Tiện ích cho UI/debug — biết đang dùng bao nhiêu keys */
export const getKeyCount = (): number => API_KEYS.length;

/** Tiện ích: ước lượng token count (rough: 1 token ≈ 4 chars cho EN, ≈ 2 chars cho VI). */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 3);
};

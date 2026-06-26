/**
 * DeepSeek provider — Phase 8.1.
 *
 * DeepSeek API là OpenAI-compatible: POST /v1/chat/completions với messages array.
 *
 * Lợi thế so với Gemini:
 *   - Văn phong Trung-Việt cổ phong tốt hơn (train Chinese literature nhiều)
 *   - NSFW filter lỏng hơn (cho user opt-in 18+)
 *   - Có DeepSeek-R1 reasoning model cho Logic Engine cần JSON phức tạp
 *
 * Trade-off:
 *   - Giá đắt hơn Gemini Flash 3-4x (vẫn rẻ — ~$0.002/turn)
 *   - Latency tương đương Flash, R1 chậm hơn (5-15s với thinking)
 *
 * Models:
 *   - deepseek-chat: V3.x, balanced cost/quality, recommend cho narrative
 *   - deepseek-reasoner: R1, mạnh JSON + reasoning, chậm
 */

import type { z } from 'zod';
import type { AIProvider, CallOptions } from './types';

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1/chat/completions';
const DEFAULT_MODEL = (import.meta.env.VITE_DEEPSEEK_MODEL as string | undefined) ?? 'deepseek-chat';
const PROXY_URL = import.meta.env.VITE_AI_PROXY_URL_DEEPSEEK as string | undefined;
const USE_PROXY = !!PROXY_URL;

// ─────────────────────────────────────────────────────────────
// Multi-key rotation (mirror Gemini pattern)
// ─────────────────────────────────────────────────────────────

const collectKeys = (): string[] => {
  const keys: string[] = [];
  const env = import.meta.env as Record<string, string | undefined>;
  const single = env.VITE_DEEPSEEK_API_KEY;
  if (single && single !== 'mock') keys.push(single);
  for (let i = 1; i <= 10; i++) {
    const k = env[`VITE_DEEPSEEK_API_KEY_${i}`];
    if (k && k !== 'mock') keys.push(k);
  }
  return Array.from(new Set(keys));
};

const API_KEYS = collectKeys();
let keyIdx = 0;
const blockedKeys = new Map<string, number>();

const isKeyBlocked = (key: string): boolean => {
  const until = blockedKeys.get(key);
  if (!until) return false;
  if (Date.now() > until) {
    blockedKeys.delete(key);
    return false;
  }
  return true;
};

const blockKey = (key: string, ms = 60_000): void => {
  blockedKeys.set(key, Date.now() + ms);
  const masked = key.slice(0, 6) + '...' + key.slice(-4);
  console.warn(`[deepseek] Key ${masked} bị block ${ms / 1000}s`);
};

const nextKey = (): string => {
  if (API_KEYS.length === 0) {
    throw new Error('[deepseek] Không có API key. Set VITE_DEEPSEEK_API_KEY_1..N hoặc VITE_AI_PROXY_URL_DEEPSEEK');
  }
  for (let i = 0; i < API_KEYS.length; i++) {
    const k = API_KEYS[keyIdx % API_KEYS.length]!;
    keyIdx++;
    if (!isKeyBlocked(k)) return k;
  }
  return API_KEYS[0]!;
};

// ─────────────────────────────────────────────────────────────
// Retry helper (giống Gemini)
// ─────────────────────────────────────────────────────────────

const fetchWithRetry = async (
  url: string,
  init: RequestInit,
  maxAttempts = 4,
): Promise<Response> => {
  let lastError: unknown;
  let lastStatus = 0;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      lastStatus = res.status;
      // Non-retryable: 400/401/403/404
      if (res.status < 500 && res.status !== 429) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastError = e;
    }
    if (i < maxAttempts - 1) {
      const delay = Math.min(10_000, 1500 * 2 ** i + Math.random() * 500);
      console.warn(`[deepseek] HTTP ${lastStatus}, retry ${i + 1}/${maxAttempts} sau ${Math.round(delay)}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError ?? new Error('[deepseek] fetchWithRetry exhausted');
};

// ─────────────────────────────────────────────────────────────
// Core call — OpenAI-compatible chat/completions
// ─────────────────────────────────────────────────────────────

async function callDirect(prompt: string, opts: CallOptions = {}): Promise<string> {
  const body = {
    model: DEFAULT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: opts.temperature ?? 0.9,
    max_tokens: opts.maxOutputTokens ?? 2500,
    ...(opts.responseMimeType === 'application/json' ? { response_format: { type: 'json_object' } } : {}),
    stream: false,
  };

  if (USE_PROXY) {
    return await callViaProxy(prompt, opts);
  }

  // Direct call với key rotation
  let lastError: unknown;
  const keyAttempts = Math.max(1, API_KEYS.length);
  for (let i = 0; i < keyAttempts; i++) {
    const key = nextKey();
    try {
      const res = await fetchWithRetry(DEEPSEEK_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: opts.signal,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        lastError = new Error(`[deepseek] HTTP ${res.status}: ${errText.slice(0, 150)}`);
        if (res.status === 429 || res.status === 401 || res.status === 403) {
          blockKey(key);
          continue;
        }
        throw lastError;
      }
      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text = data?.choices?.[0]?.message?.content ?? '';
      if (!text) throw new Error('[deepseek] Empty response');
      return text;
    } catch (e) {
      lastError = e;
      console.warn(`[deepseek] Key #${i + 1} failed:`, e);
    }
  }
  throw lastError ?? new Error('[deepseek] All keys exhausted');
}

/**
 * Call qua Cloudflare Worker proxy — key ẩn server-side.
 * Endpoint: /chat-deepseek (cấu hình trong worker)
 */
async function callViaProxy(prompt: string, opts: CallOptions): Promise<string> {
  const url = PROXY_URL!.endsWith('/chat-deepseek')
    ? PROXY_URL!
    : `${PROXY_URL}/chat-deepseek`;

  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          prompt,
          temperature: opts.temperature ?? 0.9,
          maxOutputTokens: opts.maxOutputTokens ?? 2500,
          responseMimeType: opts.responseMimeType ?? 'text/plain',
        }),
        signal: opts.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        if (res.status === 429 || res.status === 403) {
          throw new Error(`[deepseek/proxy] ${err.error}`);
        }
        if (i < 1) { await new Promise((r) => setTimeout(r, 1500)); continue; }
        throw new Error(`[deepseek/proxy] HTTP ${res.status}: ${err.error}`);
      }
      const data = await res.json() as { text?: string };
      if (!data.text) throw new Error('[deepseek/proxy] Empty response');
      return data.text;
    } catch (e) {
      if (i < 1) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      throw e;
    }
  }
  throw new Error('[deepseek/proxy] Failed');
}

// ─────────────────────────────────────────────────────────────
// AIProvider implementation
// ─────────────────────────────────────────────────────────────

export const deepseekProvider: AIProvider = {
  name: 'deepseek',
  isAvailable: () => USE_PROXY || API_KEYS.length > 0,
  async call(prompt: string, opts: CallOptions = {}) {
    return await callDirect(prompt, opts);
  },
  async callJson<T>(prompt: string, schema: z.ZodSchema<T>, opts: CallOptions = {}) {
    const text = await callDirect(prompt, { ...opts, responseMimeType: 'application/json' });
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`[deepseek] Invalid JSON response: ${text.slice(0, 200)}`);
    }
    return schema.parse(parsed);
  },
};

export const getDeepseekKeyCount = (): number => API_KEYS.length;
export const isDeepseekUsingProxy = (): boolean => USE_PROXY;

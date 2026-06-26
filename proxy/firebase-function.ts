/**
 * Firebase Cloud Function — Gemini AI proxy (alternative cho Cloudflare Worker).
 *
 * Dùng khi đã có Firebase project setup. Yêu cầu Blaze plan (pay-as-you-go,
 * nhưng có free tier 2M invocations/tháng → đủ cho hầu hết game).
 *
 * Setup:
 *   1. cd functions/
 *   2. npm install firebase-functions firebase-admin
 *   3. Copy file này thành functions/src/geminiProxy.ts
 *   4. firebase functions:secrets:set GEMINI_API_KEY_1
 *      firebase functions:secrets:set GEMINI_API_KEY_2  # optional
 *      firebase functions:secrets:set GEMINI_API_KEY_3  # optional
 *   5. firebase deploy --only functions:geminiProxy
 *
 * Client setup (Netlify env):
 *   VITE_AI_PROXY_URL=https://us-central1-YOUR-PROJECT.cloudfunctions.net/geminiProxy
 *
 * Bonus: tự động được Firebase Auth integration — có thể require đăng nhập.
 */

import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const KEY_1 = defineSecret('GEMINI_API_KEY_1');
const KEY_2 = defineSecret('GEMINI_API_KEY_2');
const KEY_3 = defineSecret('GEMINI_API_KEY_3');

const ALLOWED_ORIGINS = [
  'https://tien-do.netlify.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'];

// In-memory rate limit per IP (per cold-start instance — không bền giữa instances)
// Production: dùng Firestore counter cho persistent rate limit
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 50;
const RATE_LIMIT_WINDOW_MS = 3600_000;

export const geminiProxy = onRequest(
  {
    secrets: [KEY_1, KEY_2, KEY_3],
    cors: ALLOWED_ORIGINS,
    region: 'us-central1',
    maxInstances: 10,
    timeoutSeconds: 60,
  },
  async (req, res) => {
    // Method check
    if (req.method !== 'POST') {
      res.status(404).json({ error: 'Endpoint không tồn tại' });
      return;
    }

    // Origin check
    const origin = req.get('origin') ?? '';
    if (!ALLOWED_ORIGINS.includes(origin) && !origin.endsWith('.netlify.app')) {
      res.status(403).json({ error: `Origin ${origin} không được phép` });
      return;
    }

    // Rate limit per IP
    const ip = req.ip ?? 'unknown';
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: `Đạt giới hạn ${RATE_LIMIT_MAX} req/giờ` });
      return;
    }

    // Body validation
    const body = req.body as { prompt?: string; [k: string]: unknown };
    if (typeof body?.prompt !== 'string' || body.prompt.length === 0) {
      res.status(400).json({ error: 'Thiếu field "prompt"' });
      return;
    }
    if (body.prompt.length > 100_000) {
      res.status(400).json({ error: 'Prompt quá dài (max 100K chars)' });
      return;
    }

    // Collect keys
    const keys = [KEY_1.value(), KEY_2.value(), KEY_3.value()].filter((k) => k && k.length > 0);
    if (keys.length === 0) {
      res.status(500).json({ error: 'Server thiếu GEMINI_API_KEY_*' });
      return;
    }

    const primaryModel = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
    const models = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)];

    let lastError = '';
    for (const model of models) {
      for (const key of keys) {
        try {
          const result = await callGemini(model, key, body);
          if (result.ok) {
            res.status(200).json(result.data);
            return;
          }
          lastError = result.error;
          if (result.status === 429 || result.status === 403) continue;
          if (result.status >= 400 && result.status < 500) break;
        } catch (e) {
          lastError = e instanceof Error ? e.message : String(e);
        }
      }
    }
    res.status(503).json({ error: `Tất cả model + key đều fail: ${lastError}` });
  },
);

async function callGemini(
  model: string,
  key: string,
  body: { prompt?: string; temperature?: number; maxOutputTokens?: number; thinkingBudget?: number; responseMimeType?: string },
): Promise<{ ok: true; status: 200; data: { text: string; model: string } } | { ok: false; status: number; error: string }> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${key}`;
  const generationConfig: Record<string, unknown> = {
    temperature: body.temperature ?? 0.9,
    maxOutputTokens: body.maxOutputTokens ?? 4096,
    responseMimeType: body.responseMimeType ?? 'text/plain',
  };
  if (model.includes('2.5')) {
    generationConfig.thinkingConfig = { thinkingBudget: body.thinkingBudget ?? 0 };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: body.prompt }] }],
      generationConfig,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return { ok: false, status: res.status, error: `HTTP ${res.status}: ${errText.slice(0, 150)}` };
  }
  const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) {
    return { ok: false, status: 500, error: 'Empty response' };
  }
  return { ok: true, status: 200, data: { text, model } };
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

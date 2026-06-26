/**
 * Cloudflare Worker — Gemini AI proxy cho Mặc Hội Tiên Đồ.
 *
 * Mục đích:
 *   1. Ẩn API key — không bake vào client bundle
 *   2. Rate limit per IP (50 req/giờ) — chống abuse free quota
 *   3. Origin whitelist — chỉ accept request từ domain game
 *   4. Multi-key rotation server-side
 *   5. Multi-model fallback (giống logic client cũ)
 *
 * Deploy:
 *   npm install -g wrangler
 *   wrangler login
 *   wrangler kv:namespace create RATELIMIT
 *   # Copy id vào wrangler.toml kv_namespaces binding
 *   wrangler secret put GEMINI_API_KEY_1
 *   wrangler secret put GEMINI_API_KEY_2  # optional
 *   wrangler secret put GEMINI_API_KEY_3  # optional
 *   wrangler deploy
 *
 * Client setup:
 *   VITE_AI_PROXY_URL=https://your-worker.workers.dev/chat
 *
 * Free quota: 100K requests/day. Đủ cho ~3000 user chơi mỗi user 30 turn/ngày.
 */

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://tien-do.netlify.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

const RATE_LIMIT_MAX = 50;
const RATE_LIMIT_WINDOW_S = 3600; // 1 giờ

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'];

// ─────────────────────────────────────────────────────────────
// Worker entry
// ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(
        JSON.stringify({ ok: true, service: 'mac-do-ai-proxy', version: '1.0' }),
        { headers: { 'content-type': 'application/json' } },
      );
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCORS(request);
    }

    // Origin check
    const origin = request.headers.get('origin') || '';
    if (!isAllowedOrigin(origin)) {
      return jsonError(403, `Origin ${origin} không được phép`, origin);
    }

    // ─── Route ───
    // /chat          → Gemini
    // /chat-deepseek → DeepSeek (Phase 8.1)
    // /image         → Cloudflare Workers AI image gen (Phase 8.2)
    const isDeepseek = url.pathname === '/chat-deepseek';
    const isGemini = url.pathname === '/chat';
    const isImage = url.pathname === '/image';
    if ((!isGemini && !isDeepseek && !isImage) || request.method !== 'POST') {
      return jsonError(404, 'Endpoint không tồn tại', origin);
    }

    // Rate limit per IP
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const rateLimitResult = await checkRateLimit(env, ip);
    if (!rateLimitResult.ok) {
      return jsonError(
        429,
        `Đạt giới hạn ${RATE_LIMIT_MAX} req/giờ. Reset sau ${rateLimitResult.resetInMin} phút.`,
        origin,
      );
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, 'Body không phải JSON hợp lệ', origin);
    }
    const prompt = body?.prompt;
    if (typeof prompt !== 'string' || prompt.length === 0) {
      return jsonError(400, 'Thiếu field "prompt"', origin);
    }
    if (prompt.length > 100_000) {
      return jsonError(400, 'Prompt quá dài (max 100K chars)', origin);
    }

    // ─── Route theo provider ───
    if (isDeepseek) {
      return await handleDeepseek(body, env, origin);
    }
    if (isImage) {
      return await handleImage(body, env, origin);
    }

    // ─── Gemini path (default) ───
    // Collect keys + models
    const keys = collectKeys(env);
    if (keys.length === 0) {
      return jsonError(500, 'Server thiếu GEMINI_API_KEY_*', origin);
    }
    const primaryModel = env.GEMINI_MODEL || DEFAULT_MODEL;
    const models = [primaryModel, ...FALLBACK_MODELS.filter((m) => m !== primaryModel)];

    // Try matrix: model × key
    let lastError = null;
    for (const model of models) {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        try {
          const result = await callGemini(model, key, body);
          if (result.ok) {
            return jsonOk(result.data, origin);
          }
          lastError = result.error;
          // 429/403 → try next key
          if (result.status === 429 || result.status === 403) continue;
          // Other 4xx → skip model
          if (result.status >= 400 && result.status < 500) break;
        } catch (e) {
          lastError = e.message || String(e);
        }
      }
    }

    return jsonError(503, `Tất cả model + key đều fail: ${lastError ?? 'unknown'}`, origin);
  },
};

// ─────────────────────────────────────────────────────────────
// Gemini call
// ─────────────────────────────────────────────────────────────
async function callGemini(model, key, body) {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${key}`;
  const generationConfig = {
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
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) {
    return { ok: false, status: 500, error: 'Empty response' };
  }
  return { ok: true, status: 200, data: { text, model } };
}

// ─────────────────────────────────────────────────────────────
// DeepSeek handler (Phase 8.1)
// ─────────────────────────────────────────────────────────────

const DEEPSEEK_BASE = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_DEFAULT_MODEL = 'deepseek-chat';

async function handleDeepseek(body, env, origin) {
  const prompt = body?.prompt;
  if (typeof prompt !== 'string' || prompt.length === 0) {
    return jsonError(400, 'Thiếu field "prompt"', origin);
  }
  if (prompt.length > 100_000) {
    return jsonError(400, 'Prompt quá dài (max 100K chars)', origin);
  }

  const keys = collectDeepseekKeys(env);
  if (keys.length === 0) {
    return jsonError(500, 'Server thiếu DEEPSEEK_API_KEY_*', origin);
  }

  const model = env.DEEPSEEK_MODEL || DEEPSEEK_DEFAULT_MODEL;
  const reqBody = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: body.temperature ?? 0.9,
    max_tokens: body.maxOutputTokens ?? 2500,
    stream: false,
    ...(body.responseMimeType === 'application/json' ? { response_format: { type: 'json_object' } } : {}),
  };

  let lastError = null;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const res = await fetch(DEEPSEEK_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        lastError = `HTTP ${res.status}: ${errText.slice(0, 150)}`;
        // Auth/rate limit → thử key khác
        if (res.status === 429 || res.status === 401 || res.status === 403) continue;
        // Non-retryable
        if (res.status >= 400 && res.status < 500) break;
        continue;
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content ?? '';
      if (!text) {
        lastError = 'Empty response';
        continue;
      }
      return jsonOk({ text, model, provider: 'deepseek' }, origin);
    } catch (e) {
      lastError = e.message || String(e);
    }
  }
  return jsonError(503, `[deepseek] Tất cả keys fail: ${lastError ?? 'unknown'}`, origin);
}

function collectDeepseekKeys(env) {
  const keys = [];
  for (let i = 1; i <= 10; i++) {
    const k = env[`DEEPSEEK_API_KEY_${i}`];
    if (k) keys.push(k);
  }
  if (env.DEEPSEEK_API_KEY) keys.push(env.DEEPSEEK_API_KEY);
  return [...new Set(keys)];
}

// ─────────────────────────────────────────────────────────────
// Image gen handler (Phase 8.2 — Cloudflare Workers AI free 10K/day)
// ─────────────────────────────────────────────────────────────
//
// Models có thể dùng (đều free trên Workers AI):
//   @cf/stabilityai/stable-diffusion-xl-base-1.0   — full SDXL, ~10s
//   @cf/bytedance/stable-diffusion-xl-lightning    — Lightning 4-steps, ~3s ⭐
//   @cf/lykon/dreamshaper-8-lcm                    — DreamShaper LCM, ~2s, anime-leaning
//   @cf/black-forest-labs/flux-1-schnell           — FLUX Schnell, beta, top quality
async function handleImage(body, env, origin) {
  const prompt = body?.prompt;
  if (typeof prompt !== 'string' || prompt.length === 0) {
    return jsonError(400, 'Thiếu field "prompt"', origin);
  }
  if (prompt.length > 2000) {
    return jsonError(400, 'Prompt quá dài (max 2000 chars)', origin);
  }
  if (!env.AI) {
    return jsonError(500, 'Server thiếu [ai] binding trong wrangler.toml', origin);
  }

  const model = env.IMAGE_MODEL || '@cf/bytedance/stable-diffusion-xl-lightning';
  try {
    const response = await env.AI.run(model, {
      prompt,
      width: Math.min(1024, body.width ?? 512),
      height: Math.min(1024, body.height ?? 512),
      num_steps: 4,  // Lightning chỉ cần 4 steps
    });

    // response là ReadableStream hoặc Uint8Array của PNG
    const corsHdr = corsHeaders(origin);
    return new Response(response, {
      status: 200,
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, max-age=86400',  // browser cache 24h
        ...corsHdr,
      },
    });
  } catch (e) {
    console.error('[image] AI error:', e);
    return jsonError(503, `[image] AI gen failed: ${e.message || e}`, origin);
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function collectKeys(env) {
  const keys = [];
  for (let i = 1; i <= 10; i++) {
    const k = env[`GEMINI_API_KEY_${i}`];
    if (k) keys.push(k);
  }
  if (env.GEMINI_API_KEY) keys.push(env.GEMINI_API_KEY);
  return [...new Set(keys)];
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.netlify.app');
}

async function checkRateLimit(env, ip) {
  if (!env.RATELIMIT) return { ok: true, resetInMin: 0 }; // KV chưa setup → skip
  const key = `rl:${ip}`;
  const now = Math.floor(Date.now() / 1000);
  try {
    const raw = await env.RATELIMIT.get(key);
    const data = raw ? JSON.parse(raw) : { count: 0, windowStart: now };
    // Reset window nếu hết hạn
    if (now - data.windowStart >= RATE_LIMIT_WINDOW_S) {
      data.count = 1;
      data.windowStart = now;
    } else {
      data.count += 1;
    }
    if (data.count > RATE_LIMIT_MAX) {
      const resetInS = RATE_LIMIT_WINDOW_S - (now - data.windowStart);
      return { ok: false, resetInMin: Math.ceil(resetInS / 60) };
    }
    await env.RATELIMIT.put(key, JSON.stringify(data), { expirationTtl: RATE_LIMIT_WINDOW_S });
    return { ok: true, resetInMin: 0 };
  } catch (e) {
    // KV fail → allow (fail open)
    console.error('KV error:', e);
    return { ok: true, resetInMin: 0 };
  }
}

function corsHeaders(origin) {
  const allow = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'access-control-allow-origin': allow,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    'vary': 'origin',
  };
}

function handleCORS(request) {
  const origin = request.headers.get('origin') || '';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

function jsonOk(data, origin) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
  });
}

function jsonError(status, message, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
  });
}

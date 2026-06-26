/**
 * Image generation service — avatar nhân vật + scene background.
 *
 * ⚠️  IMAGEN 4 = PAID PLAN: Free tier Google AI Studio KHÔNG có Imagen.
 *      Default: dùng SVG procedural avatar (no API call) — đẹp + free.
 *      Bật Imagen chỉ khi VITE_ENABLE_IMAGEN=true (cho user có paid plan).
 *
 * Strategy:
 *   - Default: SVG procedural — initial + linh căn symbol + viền cổ phong
 *   - Optional: Imagen 4 (paid) — chân dung digital painting
 *
 * Cache: hash(prompt) → data URL trong localStorage (chỉ cho Imagen).
 */

const IMAGEN_MODEL = 'imagen-4.0-generate-001';
const IMAGEN_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const CACHE_PREFIX = 'tu-tien:imagen:';
const MAX_CACHE_ENTRIES = 50;

/** Imagen chỉ enable khi có flag explicit (user xác nhận có paid plan) */
const IMAGEN_ENABLED = import.meta.env.VITE_ENABLE_IMAGEN === 'true';

const getApiKey = (): string | null => {
  return (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? null;
};

const hash = async (text: string): Promise<string> => {
  const buf = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export interface ImageGenOptions {
  prompt: string;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  forceRefresh?: boolean;
}

/**
 * Generate hoặc cache image. Trả null nếu Imagen disabled hoặc fail.
 * Caller nên fallback sang SVG procedural khi nhận null.
 */
export const generateImage = async (opts: ImageGenOptions): Promise<string | null> => {
  if (!IMAGEN_ENABLED) {
    // Imagen disabled — caller sẽ dùng generateProceduralAvatar
    return null;
  }

  const cacheKey = CACHE_PREFIX + (await hash(opts.prompt));
  if (!opts.forceRefresh) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;
    } catch {
      // ignore
    }
  }

  const key = getApiKey();
  if (!key) return null;

  const url = `${IMAGEN_BASE}/${IMAGEN_MODEL}:predict?key=${key}`;
  const body = {
    instances: [{ prompt: opts.prompt }],
    parameters: { sampleCount: 1, aspectRatio: opts.aspectRatio ?? '1:1' },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      // 400 paid-plan error → disable Imagen cho session này
      if (res.status === 400 && errText.includes('paid plan')) {
        console.warn('[image-gen] Imagen requires paid plan, disabling for session');
      } else {
        console.warn('[image-gen] HTTP', res.status, errText.slice(0, 200));
      }
      return null;
    }
    const data = await res.json();
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return null;

    const dataUrl = `data:image/png;base64,${b64}`;
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
      if (keys.length >= MAX_CACHE_ENTRIES) {
        keys.slice(0, 10).forEach((k) => localStorage.removeItem(k));
      }
      localStorage.setItem(cacheKey, dataUrl);
    } catch (e) {
      console.warn('[image-gen] cache write failed', e);
    }
    return dataUrl;
  } catch (err) {
    console.warn('[image-gen] fetch failed', err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// SVG procedural avatar — free fallback, không cần API
// ─────────────────────────────────────────────────────────────

const ELEMENT_COLORS: Record<string, { bg: string; fg: string; symbol: string }> = {
  kim: { bg: '#cda45e', fg: '#3d2f0f', symbol: '⚜' },
  moc: { bg: '#7d9079', fg: '#1a2818', symbol: '☘' },
  thuy: { bg: '#5e8aae', fg: '#0d1a2a', symbol: '☵' },
  hoa: { bg: '#d97757', fg: '#2a0d05', symbol: '☲' },
  tho: { bg: '#8b7355', fg: '#1f1a10', symbol: '⛰' },
  loi: { bg: '#a78bfa', fg: '#1a0d2a', symbol: '⚡' },
  phong: { bg: '#9fb09b', fg: '#1a201a', symbol: '☴' },
  bang: { bg: '#b8d4e3', fg: '#0a1418', symbol: '❄' },
  am: { bg: '#3e3e5e', fg: '#cda45e', symbol: '☾' },
  quang: { bg: '#f0d77c', fg: '#3d2f0f', symbol: '☉' },
  default: { bg: '#3a4a3a', fg: '#cda45e', symbol: '✦' },
};

const hashStringToNumber = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

/**
 * Generate SVG procedural avatar — không cần API, đẹp cổ phong.
 *
 * Layout:
 *   - Tròn 256x256
 *   - Background gradient theo linh căn element
 *   - 4-corner bracket motif cổ phong (signature design)
 *   - Center: initial (1 ký tự) + element symbol
 *   - Border vàng
 *
 * @returns data URL `data:image/svg+xml;base64,...`
 */
export const generateProceduralAvatar = (params: {
  name: string;
  element?: string;       // 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho' | 'loi' | ...
  realm?: string;
}): string => {
  const elementKey = (params.element ?? 'default').toLowerCase();
  const colors = ELEMENT_COLORS[elementKey] ?? ELEMENT_COLORS.default!;
  const initial = (params.name.trim()[0] ?? '?').toUpperCase();
  const seed = hashStringToNumber(params.name);
  const rotation = (seed % 360);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
    <defs>
      <radialGradient id="bg" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${colors.bg}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#0a0f0a" stop-opacity="1"/>
      </radialGradient>
      <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e8d199"/>
        <stop offset="50%" stop-color="#cda45e"/>
        <stop offset="100%" stop-color="#7a5d2e"/>
      </linearGradient>
    </defs>

    <!-- Background circle -->
    <circle cx="128" cy="128" r="120" fill="url(#bg)"/>

    <!-- Decorative rotating element symbol (low opacity) -->
    <text x="128" y="128" font-family="serif" font-size="200" text-anchor="middle"
      dominant-baseline="central" fill="${colors.bg}" fill-opacity="0.12"
      transform="rotate(${rotation} 128 128)">
      ${colors.symbol}
    </text>

    <!-- 4-corner brackets (signature motif) -->
    <g stroke="url(#ring)" stroke-width="3" fill="none" stroke-linecap="round">
      <!-- top-left -->
      <path d="M 24 56 L 24 24 L 56 24"/>
      <!-- top-right -->
      <path d="M 200 24 L 232 24 L 232 56"/>
      <!-- bottom-left -->
      <path d="M 24 200 L 24 232 L 56 232"/>
      <!-- bottom-right -->
      <path d="M 200 232 L 232 232 L 232 200"/>
    </g>

    <!-- Outer ring -->
    <circle cx="128" cy="128" r="118" stroke="url(#ring)" stroke-width="2.5" fill="none" opacity="0.7"/>
    <circle cx="128" cy="128" r="110" stroke="url(#ring)" stroke-width="0.8" fill="none" opacity="0.4"/>

    <!-- Initial letter -->
    <text x="128" y="142" font-family="'Noto Serif', serif" font-size="120" font-weight="600"
      text-anchor="middle" dominant-baseline="central" fill="${colors.fg}"
      style="text-shadow: 0 0 12px rgba(205,164,94,0.6);">
      ${escapeXml(initial)}
    </text>

    <!-- Element symbol top-center -->
    <text x="128" y="48" font-family="serif" font-size="20" text-anchor="middle"
      dominant-baseline="central" fill="url(#ring)" opacity="0.85">
      ${colors.symbol}
    </text>

    <!-- Name initial subtle bottom -->
    ${params.realm ? `<text x="128" y="220" font-family="serif" font-size="11" text-anchor="middle"
      fill="#cda45e" opacity="0.7" letter-spacing="2">${escapeXml(params.realm.toUpperCase())}</text>` : ''}
  </svg>`;

  // SVG → data URL (no btoa for unicode — use encodeURIComponent path)
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const escapeXml = (s: string): string =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));

/** Tiện ích: build prompt cho avatar nhân vật tu tiên (chỉ dùng khi IMAGEN_ENABLED) */
export const buildAvatarPrompt = (params: {
  name: string;
  gender?: string;
  personality?: string;
  description?: string;
  realm?: string;
}): string => {
  const parts = [
    'Chân dung tu tiên cổ phong Đông Phương, phong cách tranh thủy mặc kết hợp digital painting,',
    `nhân vật ${params.gender === 'Nữ' ? 'nữ' : params.gender === 'Nam' ? 'nam' : 'phong cách trung tính'} tên ${params.name}`,
    params.realm ? `cảnh giới ${params.realm}` : '',
    params.personality ? `tính cách ${params.personality}` : '',
    params.description ?? '',
    'mặc áo bào tu sĩ, tóc dài cột cao, khí chất thanh tao,',
    'background sương khói núi non, ánh vàng kim,',
    'tỉ lệ 1:1, focus mặt và nửa thân trên, no text, no watermark.',
  ];
  return parts.filter(Boolean).join(' ');
};

export const buildScenePrompt = (locationName: string, description: string): string => {
  return `Phong cảnh cổ phong Đông Phương, ${locationName} - ${description}. Phong cách tranh thủy mặc, ánh sáng vàng kim huyền ảo, sương mù, không có người, không có text.`;
};

export const clearImageCache = (): number => {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
  return keys.length;
};

/** Public: kiểm tra Imagen có enable không (UI có thể show toggle/warning) */
export const isImagenEnabled = (): boolean => IMAGEN_ENABLED;

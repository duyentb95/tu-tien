/**
 * Image Generation Service — Phase 8.2 multi-provider FREE.
 *
 * Pipeline:
 *   1. Pollinations.ai (primary) — URL-based, free unlimited, no key
 *      → return URL trực tiếp cho <img src>, browser tự fetch + cache
 *   2. Cloudflare Workers AI (fallback) — 10K/day free, SDXL-Lightning
 *      → return data:image/png;base64 sau khi fetch
 *   3. SVG procedural (last resort) — instant, no network, cổ phong art
 *
 * Tại sao Pollinations primary?
 *   - Free 100% không giới hạn
 *   - URL-based: dùng trực tiếp <img src=URL>, không cần fetch trong JS
 *   - Browser caching free
 *   - FLUX model quality cao
 *   - Deterministic qua seed param → same name = same image
 *
 * Tại sao Cloudflare fallback?
 *   - Kiểm soát quality + style tốt hơn
 *   - Hoạt động khi Pollinations down
 *
 * Settings: aiImageEnabled (default true). Khi false → chỉ SVG procedural.
 */

// ─────────────────────────────────────────────────────────────
// Provider 1: Pollinations.ai (primary)
// ─────────────────────────────────────────────────────────────

const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';

export interface ImageGenParams {
  prompt: string;
  width?: number;
  height?: number;
  /** Deterministic seed — same value = same image. Default hash from prompt */
  seed?: number;
  /** Model selection */
  model?: 'flux' | 'flux-realism' | 'flux-anime' | 'flux-3d' | 'turbo';
  /** Enhancement: AI tự cải prompt cho đẹp hơn */
  enhance?: boolean;
}

/**
 * Build Pollinations URL — dùng trực tiếp cho <img src>.
 * No fetch — browser tự load + cache.
 */
export const buildPollinationsUrl = (params: ImageGenParams): string => {
  const search = new URLSearchParams({
    width: String(params.width ?? 512),
    height: String(params.height ?? 512),
    seed: String(params.seed ?? hashString(params.prompt)),
    model: params.model ?? 'flux',
    nologo: 'true',
    private: 'true',
    ...(params.enhance ? { enhance: 'true' } : {}),
  });
  return `${POLLINATIONS_BASE}/${encodeURIComponent(params.prompt)}?${search.toString()}`;
};

// ─────────────────────────────────────────────────────────────
// Provider 2: Cloudflare Workers AI (fallback)
// ─────────────────────────────────────────────────────────────

const CF_IMAGE_URL = import.meta.env.VITE_AI_PROXY_URL_IMAGE as string | undefined;
const CACHE_PREFIX = 'tu-tien:img:';
const MAX_CACHE_ENTRIES = 40;

/**
 * Generate image qua Cloudflare Worker AI. Return data:image/png;base64.
 * Slower hơn Pollinations URL trực tiếp, dùng khi Pollinations fail.
 */
export const generateViaCloudflare = async (params: ImageGenParams): Promise<string | null> => {
  if (!CF_IMAGE_URL) return null;
  const cacheKey = CACHE_PREFIX + (await hashAsync(params.prompt));
  // Check cache
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch {
    // ignore
  }

  try {
    const res = await fetch(CF_IMAGE_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        prompt: params.prompt,
        width: params.width ?? 512,
        height: params.height ?? 512,
      }),
    });
    if (!res.ok) {
      console.warn('[image-gen/cloudflare] HTTP', res.status);
      return null;
    }
    const blob = await res.blob();
    const dataUrl = await blobToDataUrl(blob);
    // Cache
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
      if (keys.length >= MAX_CACHE_ENTRIES) {
        keys.slice(0, 10).forEach((k) => localStorage.removeItem(k));
      }
      localStorage.setItem(cacheKey, dataUrl);
    } catch {
      // ignore quota
    }
    return dataUrl;
  } catch (err) {
    console.warn('[image-gen/cloudflare] fetch failed', err);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────
// Settings + Cache helpers
// ─────────────────────────────────────────────────────────────

const SETTINGS_KEY = 'tu-tien:ai-image-enabled';

export const isAiImageEnabled = (): boolean => {
  try {
    const v = localStorage.getItem(SETTINGS_KEY);
    return v === null ? true : v === '1'; // default true
  } catch {
    return true;
  }
};

export const setAiImageEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, enabled ? '1' : '0');
  } catch {
    // ignore
  }
};

export const clearImageCache = (): number => {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
  return keys.length;
};

// ─────────────────────────────────────────────────────────────
// Prompt builders — tối ưu cho game tu tiên
// ─────────────────────────────────────────────────────────────

/**
 * Avatar nhân vật — portrait cổ phong Đông Phương.
 * Translate Vietnamese personality → English cho FLUX hiểu tốt hơn.
 */
export const buildAvatarPrompt = (params: {
  name: string;
  gender?: string;
  personality?: string;
  description?: string;
  realm?: string;
  element?: string;
}): string => {
  const genderEn = params.gender === 'Nữ' ? 'female' : params.gender === 'Nam' ? 'male' : 'androgynous';
  const elementEn = translateElement(params.element);
  const realmEn = params.realm ? `at ${params.realm} cultivation stage` : '';

  const parts = [
    'Portrait of a Chinese xianxia cultivation novel character',
    'ancient chinese ink painting style mixed with digital painting',
    `${genderEn} cultivator`,
    realmEn,
    elementEn ? `${elementEn} elemental affinity` : '',
    'wearing traditional flowing daoist robe, long hair tied up in topknot',
    'ethereal aura, mystical atmosphere',
    'background: misty mountains and bamboo forest, golden hour lighting',
    'face and upper body focus, 1:1 ratio',
    'no text, no watermark, dramatic cinematic lighting',
  ].filter(Boolean);
  return parts.join(', ');
};

/**
 * Scene background — phong cảnh location.
 * Cho WorldMapScreen + StoryView background.
 */
export const buildScenePrompt = (locationName: string, description?: string): string => {
  return [
    'Eastern fantasy landscape painting',
    `${locationName}`,
    description ?? '',
    'chinese xianxia style, traditional ink wash mixed with digital art',
    'mystical fog, golden hour, ethereal lighting',
    'no people, no text, cinematic wide shot, atmospheric',
  ].filter(Boolean).join(', ');
};

/**
 * Item icon — vật phẩm hiếm.
 * Square small image, isolated trên background tối.
 */
export const buildItemPrompt = (params: {
  name: string;
  category: string;
  rarity?: string;
}): string => {
  // Phase 24.UX2: detect weapon subtype từ tên item Việt → fix bug "Gậy Mộc" hiện icon kiếm
  const subtypeEn = detectItemSubtype(params.name);
  const categoryEn = subtypeEn ?? translateCategory(params.category);
  const rarityEn = params.rarity ? translateRarity(params.rarity) : '';
  return [
    'Item icon for fantasy cultivation game',
    `${categoryEn}: ${params.name}`,
    rarityEn ? `${rarityEn} rarity, glowing aura` : '',
    'chinese xianxia art style',
    'isolated on dark background, centered composition',
    'highly detailed, ornate design, mystical glow',
    'no text, no watermark, square format',
  ].filter(Boolean).join(', ');
};

/**
 * Phase 24.UX2: Detect subtype chi tiết từ tên item.
 * "Gậy Mộc" → wooden staff (KHÔNG phải sword), "Đao" → saber, etc.
 */
const detectItemSubtype = (name: string): string | null => {
  const n = name.toLowerCase();
  // Vũ khí
  if (n.includes('gậy') || n.includes('trượng')) {
    return 'wooden magical staff with carved runes, long shaft';
  }
  if (n.includes('kiếm')) return 'straight chinese sword (jian) with tassel';
  if (n.includes('đao')) return 'curved chinese saber (dao)';
  if (n.includes('thương') || n.includes('mâu') || n.includes('giáo')) return 'long spear with red tassel';
  if (n.includes('cung')) return 'ornate longbow with arrows';
  if (n.includes('phủ') || n.includes('búa')) return 'battle axe';
  if (n.includes('phiến') || n.includes('quạt')) return 'folding fan weapon';
  if (n.includes('liêm')) return 'crescent moon sickle';
  if (n.includes('roi')) return 'segmented chain whip';
  if (n.includes('tiêu')) return 'throwing dart with feather';
  // Pháp bảo
  if (n.includes('kỳ') || n.includes('cờ')) return 'mystical war banner flag on staff';
  if (n.includes('ấn')) return 'imperial jade seal';
  if (n.includes('kính') || n.includes('gương')) return 'bronze mystical mirror';
  if (n.includes('chuông')) return 'ancient bronze bell with chains';
  if (n.includes('đỉnh') || n.includes('lư')) return 'sacred bronze cauldron with smoke';
  if (n.includes('nhẫn')) return 'magical jade ring';
  if (n.includes('linh') && (n.includes('bài') || n.includes('thẻ'))) return 'jade token tablet';
  // Thân / phòng cụ
  if (n.includes('giáp') || n.includes('khôi')) return 'mystical battle armor breastplate';
  if (n.includes('bào') || /\by\b/.test(n)) return 'flowing taoist robe';
  if (n.includes('mũ') || n.includes('quan')) return 'jade crown headpiece';
  if (n.includes('hài') || n.includes('giày')) return 'flying cloud boots';
  // Đan / dược
  if (n.includes('đan') || n.includes('hoàn') || n.includes('viên')) return 'glowing pill in jade vial';
  if (n.includes('thảo') || n.includes('dược') || n.includes('linh chi') || n.includes('hoa')) return 'mystical herb plant with glow';
  // Sách / kinh / quyển
  if (n.includes('kinh') || n.includes('quyển') || n.includes('sách') || n.includes('phổ')) return 'ancient bamboo scroll manual';
  // Phù — talisman
  if (n.includes('phù') || n.includes('bùa')) return 'glowing yellow paper talisman with red runes';
  // Linh thạch
  if (n.includes('thạch') || n.includes('ngọc') || n.includes('tinh thạch')) return 'glowing spirit crystal stone';
  return null;
};

// ─────────────────────────────────────────────────────────────
// Translate helpers (Vietnamese → English cho FLUX)
// ─────────────────────────────────────────────────────────────

const translateElement = (el?: string): string => {
  const map: Record<string, string> = {
    kim: 'metal/gold', moc: 'wood/nature', thuy: 'water', hoa: 'fire', tho: 'earth',
    loi: 'lightning', phong: 'wind', bang: 'ice', quang: 'light/holy', am: 'dark/shadow',
  };
  return map[el?.toLowerCase() ?? ''] ?? '';
};

const translateCategory = (cat: string): string => {
  const map: Record<string, string> = {
    'Vũ khí': 'weapon (sword/saber/staff)',
    'Đan dược': 'mystical pill in jade bottle',
    'Nguyên liệu': 'rare herb or material',
    'Tín vật': 'mystical talisman or token',
    'Sách kỹ năng': 'ancient cultivation manual scroll',
    'Phụ kiện': 'jade accessory or pendant',
    'Thân': 'mystical robe armor',
  };
  return map[cat] ?? 'fantasy item';
};

const translateRarity = (r: string): string => {
  const map: Record<string, string> = {
    'Thường': 'common', 'Tốt': 'uncommon', 'Hiếm': 'rare',
    'Cực Phẩm': 'epic', 'Siêu Phẩm': 'mythic', 'Huyền Thoại': 'legendary',
  };
  return map[r] ?? '';
};

// ─────────────────────────────────────────────────────────────
// Hash helpers (deterministic seed)
// ─────────────────────────────────────────────────────────────

const hashString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 999_999;
};

const hashAsync = async (text: string): Promise<string> => {
  const buf = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// ─────────────────────────────────────────────────────────────
// SVG procedural avatar (last resort fallback — instant, no network)
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

export const generateProceduralAvatar = (params: {
  name: string;
  element?: string;
  realm?: string;
}): string => {
  const elementKey = (params.element ?? 'default').toLowerCase();
  const colors = ELEMENT_COLORS[elementKey] ?? ELEMENT_COLORS.default!;
  const initial = (params.name.trim()[0] ?? '?').toUpperCase();
  const seed = hashString(params.name);
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
    <circle cx="128" cy="128" r="120" fill="url(#bg)"/>
    <text x="128" y="128" font-family="serif" font-size="200" text-anchor="middle"
      dominant-baseline="central" fill="${colors.bg}" fill-opacity="0.12"
      transform="rotate(${rotation} 128 128)">${colors.symbol}</text>
    <g stroke="url(#ring)" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M 24 56 L 24 24 L 56 24"/>
      <path d="M 200 24 L 232 24 L 232 56"/>
      <path d="M 24 200 L 24 232 L 56 232"/>
      <path d="M 200 232 L 232 232 L 232 200"/>
    </g>
    <circle cx="128" cy="128" r="118" stroke="url(#ring)" stroke-width="2.5" fill="none" opacity="0.7"/>
    <text x="128" y="142" font-family="'Noto Serif', serif" font-size="120" font-weight="600"
      text-anchor="middle" dominant-baseline="central" fill="${colors.fg}">${escapeXml(initial)}</text>
    <text x="128" y="48" font-family="serif" font-size="20" text-anchor="middle"
      dominant-baseline="central" fill="url(#ring)" opacity="0.85">${colors.symbol}</text>
    ${params.realm ? `<text x="128" y="220" font-family="serif" font-size="11" text-anchor="middle"
      fill="#cda45e" opacity="0.7" letter-spacing="2">${escapeXml(params.realm.toUpperCase())}</text>` : ''}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const escapeXml = (s: string): string =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));

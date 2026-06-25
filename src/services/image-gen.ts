/**
 * Imagen 4 service — sinh avatar nhân vật + scene background.
 *
 * Cache strategy: hash(prompt) → base64 data URL trong localStorage.
 * Production nên proxy qua Firebase Cloud Functions để ẩn API key.
 */

const IMAGEN_MODEL = 'imagen-4.0-generate-001';
const IMAGEN_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const CACHE_PREFIX = 'tu-tien:imagen:';
const MAX_CACHE_ENTRIES = 50; // tránh đầy localStorage

const getApiKey = (): string | null => {
  return import.meta.env.VITE_GEMINI_API_KEY ?? null;
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
  /** Override cache — re-generate ngay cả khi có cache */
  forceRefresh?: boolean;
}

/**
 * Generate hoặc trả về cached image.
 * Trả về data URL `data:image/png;base64,...` hoặc null nếu fail.
 */
export const generateImage = async (opts: ImageGenOptions): Promise<string | null> => {
  const cacheKey = CACHE_PREFIX + (await hash(opts.prompt));

  // 1. Check cache
  if (!opts.forceRefresh) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;
    } catch {
      // ignore
    }
  }

  const key = getApiKey();
  if (!key) {
    // Không có key → trả null, UI sẽ fallback sang placeholder
    return null;
  }

  const url = `${IMAGEN_BASE}/${IMAGEN_MODEL}:predict?key=${key}`;
  const body = {
    instances: [{ prompt: opts.prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: opts.aspectRatio ?? '1:1',
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn('[image-gen] HTTP', res.status, await res.text().catch(() => ''));
      return null;
    }
    const data = await res.json();
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) return null;

    const dataUrl = `data:image/png;base64,${b64}`;

    // Cache
    try {
      // Cap entry count
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
      if (keys.length >= MAX_CACHE_ENTRIES) {
        // Remove oldest 10 (LRU approximation: theo order)
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

/** Tiện ích: build prompt cho avatar nhân vật tu tiên */
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

/** Tiện ích: build prompt cho scene background location */
export const buildScenePrompt = (locationName: string, description: string): string => {
  return `Phong cảnh cổ phong Đông Phương, ${locationName} - ${description}. Phong cách tranh thủy mặc, ánh sáng vàng kim huyền ảo, sương mù, không có người, không có text.`;
};

/** Xóa toàn bộ cache (dev/debug) */
export const clearImageCache = (): number => {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
  return keys.length;
};

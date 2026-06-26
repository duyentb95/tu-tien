/**
 * Phase 14.2A: BYOK (Bring Your Own Key).
 *
 * Cho phép user paste API key của họ để bypass quota chung của server.
 * Lưu localStorage (KHÔNG cloud sync vì là secret per-device).
 *
 * Khi BYOK key set:
 *   - Gemini: client gọi trực tiếp Gemini API với BYOK key (bỏ qua proxy)
 *   - DeepSeek: client gọi trực tiếp DeepSeek API với BYOK key (bỏ qua proxy)
 *
 * Security note: localStorage không phải secure storage, nhưng acceptable cho personal
 * key. Khuyến cáo user dùng key restricted by referer + read-only quota.
 */

const STORAGE_KEY_GEMINI = 'tu-tien:byok-gemini';
const STORAGE_KEY_DEEPSEEK = 'tu-tien:byok-deepseek';

export type ByokProvider = 'gemini' | 'deepseek';

const isBrowser = typeof window !== 'undefined' && !!window.localStorage;

/** Đọc BYOK key cho provider. Trả empty string nếu chưa set. */
export const getByokKey = (provider: ByokProvider): string => {
  if (!isBrowser) return '';
  try {
    const key = provider === 'gemini' ? STORAGE_KEY_GEMINI : STORAGE_KEY_DEEPSEEK;
    return localStorage.getItem(key)?.trim() ?? '';
  } catch {
    return '';
  }
};

/** Set BYOK key. Pass empty string để clear. */
export const setByokKey = (provider: ByokProvider, key: string): void => {
  if (!isBrowser) return;
  try {
    const storageKey = provider === 'gemini' ? STORAGE_KEY_GEMINI : STORAGE_KEY_DEEPSEEK;
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(storageKey, trimmed);
    } else {
      localStorage.removeItem(storageKey);
    }
  } catch (e) {
    console.warn('[byok] Save failed:', e);
  }
};

/** Mask key cho display: "AIza...XYZ4" (giữ 4 char đầu + cuối) */
export const maskKey = (key: string): string => {
  if (!key) return '(chưa set)';
  if (key.length <= 12) return '****';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
};

/** Validation lite — chỉ check format cơ bản, không call API */
export const validateKeyFormat = (provider: ByokProvider, key: string): { ok: boolean; reason?: string } => {
  const trimmed = key.trim();
  if (!trimmed) return { ok: true }; // empty = clear, OK
  if (trimmed.length < 16) return { ok: false, reason: 'Key quá ngắn (cần ít nhất 16 ký tự)' };
  if (provider === 'gemini' && !trimmed.startsWith('AIza')) {
    return { ok: false, reason: 'Gemini key thường bắt đầu bằng "AIza..."' };
  }
  if (provider === 'deepseek' && !trimmed.startsWith('sk-')) {
    return { ok: false, reason: 'DeepSeek key thường bắt đầu bằng "sk-..."' };
  }
  return { ok: true };
};

/** Check có BYOK key nào set không */
export const hasAnyByokKey = (): boolean => !!getByokKey('gemini') || !!getByokKey('deepseek');

/**
 * Phase 16.1: Perks accessor cho AI client.
 *
 * AI client (client.ts, deepseek.ts) là pure module, không có React context.
 * Cần access flags `speedBoost` để adjust retry delay mà không import store.
 *
 * Cơ chế: store đăng ký flag values qua setPerkFlags(), client read qua getPerkFlags().
 * Mỗi khi economy state thay đổi (mua speed boost) → store gọi sync 1 lần.
 *
 * Initial values từ localStorage cache (sync mount lần đầu).
 */

export interface AiPerkFlags {
  /** Speed boost: giảm retry delay AI từ 1.5s/3s/6s/12s → 500ms/1s/2s/4s */
  speedBoost: boolean;
}

let currentFlags: AiPerkFlags = {
  speedBoost: false,
};

// Initial bootstrap từ localStorage (chạy trước store hydrate)
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const raw = localStorage.getItem('tu-tien:game-save');
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.economy?.unlockedPerks?.speedBoost) {
        currentFlags.speedBoost = true;
      }
    }
  } catch { /* ignore */ }
}

export const getPerkFlags = (): AiPerkFlags => currentFlags;

export const setPerkFlags = (flags: Partial<AiPerkFlags>): void => {
  currentFlags = { ...currentFlags, ...flags };
};

/**
 * Tính delay backoff theo perk. Speed boost giảm 3x.
 * @param attempt 0-based attempt index
 * @returns delay ms
 */
export const getRetryDelay = (attempt: number): number => {
  const base = 1500 * Math.pow(2, attempt); // 1.5s, 3s, 6s, 12s
  const jitter = Math.random() * 500;
  const total = base + jitter;
  return currentFlags.speedBoost ? Math.floor(total / 3) : total;
};

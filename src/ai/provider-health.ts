/**
 * Phase 14.2B: Provider Health Tracker — module quản lý trạng thái sức khỏe các AI provider.
 *
 * - Lưu lastSuccess + lastError timestamp + lastErrorMessage per provider.
 * - Tính healthStatus: 'ok' | 'degraded' | 'down' theo gần đây nhất.
 * - Pub-sub subscribers (cho AIStatusPanel React).
 *
 * Không phụ thuộc React — pure module, gọi reportProviderSuccess/Error từ client.ts + deepseek.ts.
 */

export type ProviderName = 'gemini' | 'deepseek';
export type HealthStatus = 'ok' | 'degraded' | 'down' | 'unknown';

export interface ProviderHealth {
  name: ProviderName;
  status: HealthStatus;
  /** Unix ms timestamp lần call thành công cuối */
  lastSuccessAt?: number;
  /** Unix ms timestamp lần fail cuối */
  lastErrorAt?: number;
  /** Error message ngắn gọn */
  lastErrorMessage?: string;
  /** HTTP status code của lỗi cuối */
  lastErrorStatus?: number;
  /** Hint hành động cụ thể cho user (top up balance, wait, BYOK...) */
  errorHint?: string;
  /** Số lần fail liên tiếp (reset về 0 khi có success) */
  consecutiveFailures: number;
}

const health: Record<ProviderName, ProviderHealth> = {
  gemini: { name: 'gemini', status: 'unknown', consecutiveFailures: 0 },
  deepseek: { name: 'deepseek', status: 'unknown', consecutiveFailures: 0 },
};

type Listener = () => void;
const listeners = new Set<Listener>();

/**
 * HOTFIX React error #185: getHealthSnapshot PHẢI return cùng reference khi data
 * chưa đổi, nếu không useSyncExternalStore loop vô tận → màn hình đen.
 *
 * Cache snapshot, chỉ refresh khi notify() được gọi (success/error report).
 */
const makeSnapshot = (): Record<ProviderName, ProviderHealth> => ({
  gemini: { ...health.gemini },
  deepseek: { ...health.deepseek },
});

let cachedSnapshot: Record<ProviderName, ProviderHealth> = makeSnapshot();

/** Subscribe để React component re-render khi state đổi.
 * Note: signature theo useSyncExternalStore — listener không nhận args. */
export const subscribeHealth = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

const notify = () => {
  // Refresh cache trước khi gọi listeners — đảm bảo getHealthSnapshot trả new ref
  cachedSnapshot = makeSnapshot();
  for (const l of listeners) {
    try { l(); } catch (e) { console.warn('[provider-health] Listener error:', e); }
  }
};

/** Đọc snapshot hiện tại — STABLE REFERENCE để useSyncExternalStore không loop */
export const getHealthSnapshot = (): Record<ProviderName, ProviderHealth> => cachedSnapshot;

/** Gọi khi 1 provider call thành công */
export const reportProviderSuccess = (provider: ProviderName): void => {
  health[provider].status = 'ok';
  health[provider].lastSuccessAt = Date.now();
  health[provider].consecutiveFailures = 0;
  delete health[provider].lastErrorMessage;
  delete health[provider].lastErrorStatus;
  delete health[provider].errorHint;
  notify();
};

/** Gọi khi 1 provider call fail */
export const reportProviderError = (
  provider: ProviderName,
  status: number,
  message: string,
): void => {
  health[provider].lastErrorAt = Date.now();
  health[provider].lastErrorStatus = status;
  health[provider].lastErrorMessage = message.slice(0, 200);
  health[provider].consecutiveFailures += 1;

  // Phase 14.1B: Phân loại error → hint cụ thể
  health[provider].errorHint = classifyError(provider, status, message);

  // Status: down nếu fail 3+ liên tiếp, degraded nếu 1-2 lần
  if (health[provider].consecutiveFailures >= 3) {
    health[provider].status = 'down';
  } else {
    health[provider].status = 'degraded';
  }
  notify();
};

/**
 * Phân loại lỗi → hint user-actionable.
 */
const classifyError = (provider: ProviderName, status: number, message: string): string => {
  const msg = message.toLowerCase();

  // Balance / quota
  if (status === 402 || msg.includes('insufficient balance') || msg.includes('insufficient_balance')) {
    if (provider === 'deepseek') {
      return 'Hết credit DeepSeek. Vào https://platform.deepseek.com để nạp.';
    }
    return 'Hết quota Gemini. Đợi reset tháng hoặc thêm key mới.';
  }

  // Rate limit
  if (status === 429 || msg.includes('rate limit') || msg.includes('quota')) {
    return 'Bị giới hạn tốc độ — đợi 1-2 phút rồi thử lại, hoặc dùng BYOK key riêng.';
  }

  // High demand (server overload)
  if (status === 503 || msg.includes('high demand') || msg.includes('overloaded') || msg.includes('unavailable')) {
    return provider === 'gemini'
      ? 'Gemini đang quá tải — đợi 30s rồi thử lại, hoặc chuyển sang DeepSeek/BYOK.'
      : 'DeepSeek đang quá tải — đợi 30s rồi thử lại.';
  }

  // Auth
  if (status === 401 || status === 403 || msg.includes('invalid') && msg.includes('key')) {
    return 'API key không hợp lệ — kiểm tra lại env hoặc BYOK key.';
  }

  // Bad request (often invalid prompt format)
  if (status === 400 || msg.includes('invalid_request')) {
    return 'Prompt invalid — báo cáo bug cho dev.';
  }

  return `Lỗi ${status} — thử lại sau, hoặc chuyển provider khác.`;
};

/** Tính tổng health: chọn worst case giữa các provider available */
export const getOverallStatus = (): HealthStatus => {
  const g = health.gemini.status;
  const d = health.deepseek.status;
  // Nếu có 1 provider ok → overall ok
  if (g === 'ok' || d === 'ok') return 'ok';
  // Nếu cả 2 unknown → unknown
  if (g === 'unknown' && d === 'unknown') return 'unknown';
  // Nếu có 1 down → down
  if (g === 'down' && d === 'down') return 'down';
  // Còn lại = degraded
  return 'degraded';
};

/** Reset (dùng cho testing) */
export const resetHealth = (): void => {
  health.gemini = { name: 'gemini', status: 'unknown', consecutiveFailures: 0 };
  health.deepseek = { name: 'deepseek', status: 'unknown', consecutiveFailures: 0 };
  notify();
};

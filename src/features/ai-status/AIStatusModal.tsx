import { useSyncExternalStore, useState, useMemo } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import {
  subscribeHealth,
  getHealthSnapshot,
  type ProviderHealth,
  type ProviderName,
} from '@ai/provider-health';
import {
  getByokKey,
  setByokKey,
  maskKey,
  validateKeyFormat,
} from '@ai/byok';
import { notify } from '@state/notifications';

interface Props {
  open: boolean;
  onClose: () => void;
}

const STATUS_COLOR: Record<ProviderHealth['status'], { dot: string; label: string; bg: string }> = {
  ok:        { dot: 'bg-jade-400',   label: 'Khỏe mạnh',    bg: 'bg-jade-900/20 border-jade-500/40' },
  degraded:  { dot: 'bg-gold-400',   label: 'Suy yếu',      bg: 'bg-gold-900/20 border-gold-500/40' },
  down:      { dot: 'bg-ember-500',  label: 'Mất kết nối',  bg: 'bg-ember-900/30 border-ember-500/50' },
  unknown:   { dot: 'bg-jade-700',   label: 'Chưa biết',    bg: 'bg-ink-800/40 border-gold-700/30' },
};

const formatAgo = (ts?: number): string => {
  if (!ts) return '—';
  const ms = Date.now() - ts;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s trước`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}p trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

/**
 * Phase 14.2B: AI Status Modal — health detail + BYOK management.
 *
 * Hiển thị:
 *  - Tình trạng từng provider (ok/degraded/down) với lastSuccess/lastError + hint
 *  - BYOK input cho Gemini + DeepSeek (mask + paste, validate format)
 *  - Link tài liệu lấy key + top-up account
 */
export const AIStatusModal = ({ open, onClose }: Props) => {
  const health = useSyncExternalStore(subscribeHealth, getHealthSnapshot, getHealthSnapshot);
  const [editingByok, setEditingByok] = useState<ProviderName | null>(null);
  const [byokInput, setByokInput] = useState('');

  // Cache mask cho display
  const byokMasked = useMemo(
    () => ({
      gemini: maskKey(getByokKey('gemini')),
      deepseek: maskKey(getByokKey('deepseek')),
    }),
    [editingByok, open],
  );

  const handleSaveByok = (provider: ProviderName) => {
    const v = validateKeyFormat(provider, byokInput);
    if (!v.ok) {
      notify.warn('Key không hợp lệ', v.reason ?? 'Format sai');
      return;
    }
    setByokKey(provider, byokInput.trim());
    if (byokInput.trim()) {
      notify.success(`Đã lưu BYOK ${provider}`, `Sẽ dùng key của bạn từ turn sau.`);
    } else {
      notify.info(`Đã xóa BYOK ${provider}`, 'Quay về dùng env key / proxy.');
    }
    setEditingByok(null);
    setByokInput('');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="AI Status"
    >
      <div className="w-full max-w-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <Bracketed className="rounded-md border bg-ink-700 p-5 sm:p-6" tone="gold">
          <div className="mb-4 flex items-start justify-between border-b border-gold-700/30 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold tracking-wide text-gold-200">
                <span aria-hidden>✦</span> AI Status &amp; BYOK
              </h2>
              <p className="mt-1 text-[12px] italic text-jade-400">
                Tình trạng provider AI + dùng key cá nhân để bypass quota chung.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest text-jade-500 hover:text-gold-300"
              aria-label="Đóng"
            >
              × Đóng
            </button>
          </div>

          {/* Provider cards */}
          <div className="space-y-3">
            {(['gemini', 'deepseek'] as ProviderName[]).map((p) => {
              const h = health[p];
              const c = STATUS_COLOR[h.status];
              const isEditing = editingByok === p;
              const docs = p === 'gemini'
                ? 'https://aistudio.google.com/apikey'
                : 'https://platform.deepseek.com/api_keys';
              const topup = p === 'gemini'
                ? 'https://aistudio.google.com/'
                : 'https://platform.deepseek.com/usage';

              return (
                <div key={p} className={`rounded border p-3 ${c.bg}`}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${c.dot} ${h.status === 'degraded' || h.status === 'down' ? 'anim-pulse' : ''}`} />
                      <h3 className="font-serif text-base font-bold text-gold-200 uppercase">
                        {p === 'gemini' ? 'Google Gemini' : 'DeepSeek'}
                      </h3>
                      <span className="text-[10px] uppercase tracking-widest text-jade-500">
                        {c.label}
                      </span>
                    </div>
                    <div className="text-right text-[10px] text-jade-500">
                      <div>Success: <span className="text-jade-300">{formatAgo(h.lastSuccessAt)}</span></div>
                      <div>Fail: <span className="text-ember-400">{formatAgo(h.lastErrorAt)}</span></div>
                    </div>
                  </div>

                  {/* Error message + hint */}
                  {h.lastErrorMessage && h.status !== 'ok' && (
                    <div className="mb-2 rounded border border-ember-500/30 bg-ember-900/10 p-2">
                      <div className="font-mono text-[11px] text-ember-300">
                        {h.lastErrorStatus ? `[${h.lastErrorStatus}] ` : ''}{h.lastErrorMessage}
                      </div>
                      {h.errorHint && (
                        <div className="mt-1 text-[12px] text-gold-300">
                          💡 {h.errorHint}
                        </div>
                      )}
                    </div>
                  )}

                  {/* BYOK section */}
                  <div className="border-t border-gold-700/20 pt-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-jade-500">BYOK Key</div>
                        {!isEditing ? (
                          <div className="font-mono text-[12px] text-gold-300">{byokMasked[p]}</div>
                        ) : (
                          <input
                            type="password"
                            value={byokInput}
                            onChange={(e) => setByokInput(e.target.value)}
                            placeholder={p === 'gemini' ? 'AIza...' : 'sk-...'}
                            autoFocus
                            className="w-full rounded-sm border border-gold-500/40 bg-ink-900 px-2 py-1 text-[12px] font-mono text-gold-100 focus:border-gold-400 focus:outline-none"
                          />
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {!isEditing ? (
                          <button
                            onClick={() => { setEditingByok(p); setByokInput(getByokKey(p)); }}
                            className="rounded-sm border border-gold-500/40 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-300 hover:bg-gold-700/20"
                          >
                            {getByokKey(p) ? 'Sửa' : 'Thêm'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSaveByok(p)}
                              className="rounded-sm border border-jade-500/40 bg-jade-900/30 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-jade-200 hover:bg-jade-900/50"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => { setEditingByok(null); setByokInput(''); }}
                              className="rounded-sm border border-ember-500/40 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-ember-300 hover:bg-ember-900/30"
                            >
                              Hủy
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-2 text-[10px]">
                      <a
                        href={docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-spirit-400 hover:text-spirit-300 underline decoration-dotted"
                      >
                        Lấy key →
                      </a>
                      {h.status !== 'ok' && (
                        <a
                          href={topup}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold-400 hover:text-gold-300 underline decoration-dotted"
                        >
                          Top-up account →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info footer */}
          <div className="mt-4 rounded border border-jade-700/30 bg-jade-900/10 p-2.5">
            <p className="text-[11px] leading-relaxed text-jade-300">
              <strong className="text-gold-300">BYOK</strong> = Bring Your Own Key.
              Khi set, request gọi trực tiếp API với key bạn paste, bypass proxy + quota chung.
              Key lưu trong <code className="font-mono text-spirit-300">localStorage</code> trên thiết bị này.
            </p>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

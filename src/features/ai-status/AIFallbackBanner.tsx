import { useSyncExternalStore } from 'react';
import {
  subscribeHealth,
  getHealthSnapshot,
  getOverallStatus,
} from '@ai/provider-health';

interface Props {
  onOpenStatus: () => void;
}

/**
 * Phase 14.1B: Banner cảnh báo khi AI down/degraded.
 *
 * Hiển thị bên trên StoryView khi overall status != 'ok' && != 'unknown'.
 * Show provider-specific lastError + hint, click để mở AIStatusModal.
 */
export const AIFallbackBanner = ({ onOpenStatus }: Props) => {
  const health = useSyncExternalStore(subscribeHealth, getHealthSnapshot, getHealthSnapshot);
  const overall = getOverallStatus();

  // Chỉ render khi có vấn đề
  if (overall === 'ok' || overall === 'unknown') return null;

  // Pick provider lỗi gần nhất
  const lastErrProvider =
    (health.gemini.lastErrorAt ?? 0) >= (health.deepseek.lastErrorAt ?? 0)
      ? health.gemini
      : health.deepseek;

  const isDown = overall === 'down';
  const color = isDown
    ? 'border-ember-500/50 bg-ember-900/20 text-ember-200'
    : 'border-gold-500/40 bg-gold-900/20 text-gold-200';
  const dotColor = isDown ? 'bg-ember-500' : 'bg-gold-400';

  return (
    <button
      onClick={onOpenStatus}
      className={`group flex w-full items-start gap-3 rounded-md border ${color} p-3 text-left transition-all hover:brightness-125`}
      aria-label="Mở AI Status"
    >
      <span className={`mt-1 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full ${dotColor} anim-pulse`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-serif text-[13px] font-bold uppercase tracking-widest">
            {isDown ? '⚠ AI mất kết nối — chế độ offline' : '⚡ AI suy yếu — đang thử lại'}
          </span>
          <span className="rounded-sm border border-current/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest opacity-70">
            {lastErrProvider.name}
          </span>
        </div>
        {lastErrProvider.errorHint && (
          <p className="mt-1 text-[12px] leading-relaxed opacity-90">
            💡 {lastErrProvider.errorHint}
          </p>
        )}
        <p className="mt-1 text-[11px] italic opacity-70 group-hover:opacity-100">
          Click để xem chi tiết + paste BYOK key →
        </p>
      </div>
    </button>
  );
};

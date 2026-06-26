import { useSyncExternalStore } from 'react';
import {
  subscribeHealth,
  getHealthSnapshot,
  getOverallStatus,
  type HealthStatus,
} from '@ai/provider-health';

interface Props {
  onClick: () => void;
}

const COLOR_BY_STATUS: Record<HealthStatus, { bg: string; label: string; ring: string }> = {
  ok:       { bg: 'bg-jade-400',  label: 'AI khỏe',     ring: 'shadow-[0_0_8px_rgba(74,150,98,.5)]' },
  degraded: { bg: 'bg-gold-400',  label: 'AI suy yếu',  ring: 'shadow-[0_0_8px_rgba(218,178,98,.6)]' },
  down:     { bg: 'bg-ember-500', label: 'AI mất kết nối', ring: 'shadow-[0_0_8px_rgba(217,119,87,.7)]' },
  unknown:  { bg: 'bg-jade-700',  label: 'AI chưa biết',  ring: '' },
};

/**
 * Phase 14.2B: Small dot indicator cho header — click → open AIStatusModal.
 * Auto re-render qua subscribeHealth.
 */
export const AIStatusDot = ({ onClick }: Props) => {
  useSyncExternalStore(subscribeHealth, getHealthSnapshot, getHealthSnapshot);
  const status = getOverallStatus();
  const c = COLOR_BY_STATUS[status];

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-gold-700/30 bg-ink-800/60 px-2 py-1 transition-colors hover:border-gold-500 hover:bg-ink-500/40"
      title={c.label + ' — click xem chi tiết + BYOK'}
      aria-label={c.label}
    >
      <span
        className={`h-2 w-2 rounded-full ${c.bg} ${c.ring} ${status === 'degraded' || status === 'down' ? 'anim-pulse' : ''}`}
      />
      <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-jade-400">
        AI
      </span>
    </button>
  );
};

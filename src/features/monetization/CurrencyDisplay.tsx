import { useEffect } from 'react';
import { useGameStore, selectEconomy } from '@state/game-store';
import { TOKEN_DAILY_CAP } from '@gametypes/economy';

interface Props {
  onClick: () => void;
}

/**
 * Phase 15.3: Header display cho Tiền Ngọc + Action Tokens.
 *
 * Auto-refresh tokens regen 1/15p mỗi khi mount.
 * Click → mở MonetizationModal.
 */
export const CurrencyDisplay = ({ onClick }: Props) => {
  const economy = useGameStore(selectEconomy);
  const refreshTokens = useGameStore((s) => s.refreshTokens);

  // Auto-refresh tokens mỗi 30s + mount để regen kịp
  useEffect(() => {
    refreshTokens();
    const interval = setInterval(refreshTokens, 30_000);
    return () => clearInterval(interval);
  }, [refreshTokens]);

  const tokenLow = economy.actionTokens < 10;
  const tokenColor = tokenLow ? 'text-ember-300' : economy.actionTokens >= TOKEN_DAILY_CAP ? 'text-jade-300' : 'text-spirit-300';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-md border border-gold-700/30 bg-ink-800/60 px-2 py-1 transition-colors hover:border-gold-500 hover:bg-ink-500/40"
      title="Cửa hàng · Tiền Ngọc + Lượt Hành Động"
      aria-label="Mở cửa hàng Tiền Ngọc"
    >
      <span className="flex items-center gap-1 font-mono text-[11.5px]">
        <span className="text-gold-400">💎</span>
        <span className="font-bold text-gold-200">{economy.tienNgoc.toLocaleString()}</span>
      </span>
      <span className="text-jade-700">·</span>
      <span className="flex items-center gap-1 font-mono text-[11.5px]">
        <span className="text-spirit-400">⚡</span>
        <span className={`font-bold ${tokenColor} ${tokenLow ? 'anim-pulse' : ''}`}>
          {economy.actionTokens}
        </span>
      </span>
    </button>
  );
};

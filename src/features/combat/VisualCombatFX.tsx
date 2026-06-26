import { useEffect, useRef, useState } from 'react';
import type { CombatLogEntry } from '@core/combat/session';

/**
 * Phase 12.1: Visual Combat FX — Pattern #6 từ Google Canvas RPG (giản lược không sprite).
 *
 * 3 thành phần:
 *  - FloatingDamageLayer: số damage nổi lên + fade, crit lớn + vàng, dodge "TRÁNH" xanh.
 *  - useCombatFX hook: bắt CombatLogEntry mới → push burst + trigger shake/flash.
 *  - ImpactFlash: full-overlay flash khi heavy hit / crit / heal.
 *
 * Container CombatScreen có thể wrap className `fx-shake-${shakeKey}` để screen rung.
 */

export interface FxBurst {
  id: number;
  side: 'player' | 'enemy';
  text: string;
  variant: 'normal' | 'crit' | 'heal' | 'dodge';
}

let _idSeq = 0;
const nextId = () => ++_idSeq;

/**
 * Floating damage layer (absolute inside parent panel). Render 1 side worth of bursts.
 */
export const FloatingDamageLayer = ({
  bursts,
  side,
}: {
  bursts: FxBurst[];
  side: 'player' | 'enemy';
}) => {
  const filtered = bursts.filter((b) => b.side === side);
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 overflow-visible"
      aria-hidden
    >
      {filtered.map((b) => {
        const color =
          b.variant === 'crit'
            ? 'text-gold-100'
            : b.variant === 'heal'
            ? 'text-spirit-200'
            : b.variant === 'dodge'
            ? 'text-jade-300'
            : 'text-ember-300';
        const size =
          b.variant === 'crit' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl';
        const shadow =
          b.variant === 'crit'
            ? '0 0 24px rgba(245, 200, 100, 0.85), 0 2px 4px rgba(0,0,0,0.9)'
            : '0 0 14px rgba(0,0,0,0.95)';
        // Random horizontal offset để bursts trùng lượt không che nhau
        const offsetX = ((b.id * 37) % 80) - 40;
        return (
          <span
            key={b.id}
            className={`fx-float-up absolute left-1/2 top-1/3 font-serif font-bold ${color} ${size}`}
            style={{
              textShadow: shadow,
              transform: `translateX(calc(-50% + ${offsetX}px))`,
            }}
          >
            {b.text}
          </span>
        );
      })}
    </div>
  );
};

/**
 * Hook: bắt entry log mới → trigger flash/shake. Burst phải push manual qua pushBurst
 * (vì cần side resolution dựa trên combatants — caller có context đó).
 */
export const useCombatFX = (
  lastLog: CombatLogEntry | null,
  targetMaxHp?: number,
) => {
  const [bursts, setBursts] = useState<FxBurst[]>([]);
  const [shakeKey, setShakeKey] = useState<number>(0);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const lastSeenRef = useRef<CombatLogEntry | null>(null);

  useEffect(() => {
    if (!lastLog || lastSeenRef.current === lastLog) return;
    lastSeenRef.current = lastLog;

    if (lastLog.kind === 'damage' && !lastLog.dodged) {
      const isHeavy = !!(
        lastLog.amount &&
        targetMaxHp &&
        lastLog.amount / targetMaxHp >= 0.15
      );
      if (lastLog.crit || isHeavy) {
        setShakeKey(Date.now());
        setFlashColor(lastLog.crit ? 'rgba(245,200,100,0.18)' : 'rgba(220,90,60,0.14)');
        window.setTimeout(() => setFlashColor(null), 220);
      }
    } else if (lastLog.kind === 'heal') {
      setFlashColor('rgba(120,180,220,0.16)');
      window.setTimeout(() => setFlashColor(null), 220);
    }
  }, [lastLog, targetMaxHp]);

  const pushBurst = (
    side: 'player' | 'enemy',
    text: string,
    variant: FxBurst['variant'],
  ) => {
    const id = nextId();
    setBursts((prev) => [...prev, { id, side, text, variant }]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 1200);
  };

  return { bursts, pushBurst, shakeKey, flashColor };
};

/**
 * Full-screen color overlay flash — auto fade out 220ms.
 */
export const ImpactFlash = ({ color }: { color: string | null }) => {
  if (!color) return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 fx-fade-out"
      style={{ background: color }}
    />
  );
};

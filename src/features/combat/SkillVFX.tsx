/**
 * Phase 22.2: Skill element VFX overlay.
 *
 * Khi player cast skill, hiển thị visual effect khớp element trong ~800ms:
 *   - kim (slash chéo)
 *   - moc (vine wrap)
 *   - thuy (wave)
 *   - hoa (burst)
 *   - tho (shake crack)
 *   - loi (lightning bolt)
 *   - phong (gust streak)
 *   - bang (freeze crystal)
 *   - quang (light beam)
 *   - am (dark void)
 *
 * Pure SVG + CSS keyframe — KHÔNG cần Lottie/asset bên ngoài.
 * Component không state — caller dùng key={id} để remount trigger animation lại.
 */
import type { Element } from '@gametypes/character';

const ELEMENT_THEME: Record<Element, { color: string; emoji: string; label: string }> = {
  kim: { color: '#e5e7eb', emoji: '⚔', label: 'Kim' },
  moc: { color: '#86efac', emoji: '🌿', label: 'Mộc' },
  thuy: { color: '#7dd3fc', emoji: '🌊', label: 'Thủy' },
  hoa: { color: '#fca5a5', emoji: '🔥', label: 'Hỏa' },
  tho: { color: '#d6b88d', emoji: '🪨', label: 'Thổ' },
  loi: { color: '#fde047', emoji: '⚡', label: 'Lôi' },
  phong: { color: '#bae6fd', emoji: '💨', label: 'Phong' },
  bang: { color: '#a5f3fc', emoji: '❄', label: 'Băng' },
  quang: { color: '#fef3c7', emoji: '✦', label: 'Quang' },
  am: { color: '#c4b5fd', emoji: '☾', label: 'Âm' } as never,  // 'am' chưa có trong Element union, dùng quang fallback
};

interface SkillVFXProps {
  element?: Element;
  /** unique key — remount = play again */
  fxKey: number;
}

const themeOf = (el?: Element) => {
  if (!el) return ELEMENT_THEME.quang;
  return ELEMENT_THEME[el] ?? ELEMENT_THEME.quang;
};

/** Element-specific SVG pattern overlay */
const ElementSvg = ({ element }: { element?: Element }) => {
  const t = themeOf(element);
  switch (element) {
    case 'kim':
      // Slash chéo
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <line x1="20" y1="180" x2="180" y2="20" stroke={t.color} strokeWidth="4" className="fx-slash" />
          <line x1="40" y1="180" x2="200" y2="20" stroke={t.color} strokeWidth="2" opacity="0.6" className="fx-slash" style={{ animationDelay: '80ms' }} />
        </svg>
      );
    case 'hoa':
      // Burst radial
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="100" y1="100" x2="100" y2="20"
              stroke={t.color} strokeWidth="3" opacity="0.8"
              transform={`rotate(${deg} 100 100)`}
              className="fx-burst"
            />
          ))}
          <circle cx="100" cy="100" r="20" fill={t.color} opacity="0.5" className="fx-burst-core" />
        </svg>
      );
    case 'loi':
      // Lightning bolt zigzag
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <polyline
            points="90,10 110,80 80,90 130,190"
            fill="none" stroke={t.color} strokeWidth="5"
            className="fx-bolt"
          />
          <polyline
            points="90,10 110,80 80,90 130,190"
            fill="none" stroke="#fff" strokeWidth="2" opacity="0.7"
            className="fx-bolt"
          />
        </svg>
      );
    case 'thuy':
      // Wave horizontal
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <path d="M 0 100 Q 50 70, 100 100 T 200 100" fill="none" stroke={t.color} strokeWidth="4" className="fx-wave" />
          <path d="M 0 120 Q 50 90, 100 120 T 200 120" fill="none" stroke={t.color} strokeWidth="3" opacity="0.7" className="fx-wave" style={{ animationDelay: '100ms' }} />
          <path d="M 0 140 Q 50 110, 100 140 T 200 140" fill="none" stroke={t.color} strokeWidth="2" opacity="0.5" className="fx-wave" style={{ animationDelay: '200ms' }} />
        </svg>
      );
    case 'bang':
      // Crystal star
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          {[0, 60, 120].map((deg) => (
            <line
              key={deg}
              x1="100" y1="40" x2="100" y2="160"
              stroke={t.color} strokeWidth="4"
              transform={`rotate(${deg} 100 100)`}
              className="fx-freeze"
            />
          ))}
        </svg>
      );
    case 'moc':
      // Vine wrap
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <path d="M 100 200 Q 60 150, 100 100 T 100 0" fill="none" stroke={t.color} strokeWidth="4" className="fx-vine" />
          <path d="M 100 200 Q 140 150, 100 100 T 100 0" fill="none" stroke={t.color} strokeWidth="3" opacity="0.7" className="fx-vine" style={{ animationDelay: '100ms' }} />
        </svg>
      );
    case 'tho':
      // Crack lines
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <polyline points="0,150 60,140 80,160 140,130 200,155" fill="none" stroke={t.color} strokeWidth="4" className="fx-crack" />
          <polyline points="0,170 60,165 80,180 140,160 200,175" fill="none" stroke={t.color} strokeWidth="2" opacity="0.7" className="fx-crack" />
        </svg>
      );
    case 'phong':
      // Streak lines
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          {[40, 80, 120, 160].map((y) => (
            <line key={y} x1="-20" y1={y} x2="220" y2={y + 10} stroke={t.color} strokeWidth="2" opacity="0.6" className="fx-gust" style={{ animationDelay: `${y * 2}ms` }} />
          ))}
        </svg>
      );
    case 'quang':
      // Light beam radial
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <radialGradient id="lg">
            <stop offset="0%" stopColor={t.color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={t.color} stopOpacity="0" />
          </radialGradient>
          <circle cx="100" cy="100" r="80" fill="url(#lg)" className="fx-glow" />
        </svg>
      );
    default:
      // Generic ripple
      return (
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <circle cx="100" cy="100" r="40" fill="none" stroke={t.color} strokeWidth="3" className="fx-ripple" />
          <circle cx="100" cy="100" r="40" fill="none" stroke={t.color} strokeWidth="2" opacity="0.5" className="fx-ripple" style={{ animationDelay: '120ms' }} />
        </svg>
      );
  }
};

export const SkillVFX = ({ element, fxKey }: SkillVFXProps) => {
  if (fxKey <= 0) return null;
  const t = themeOf(element);
  return (
    <div
      key={fxKey}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
      aria-hidden
    >
      <div className="relative h-full w-full">
        <ElementSvg element={element} />
        {/* Element label flash góc trên */}
        <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded border border-current bg-ink-900/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest fx-element-label"
          style={{ color: t.color }}
        >
          {t.emoji} {t.label}
        </div>
      </div>
    </div>
  );
};

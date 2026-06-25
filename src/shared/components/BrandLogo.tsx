/**
 * Brand logo "Mặc Đồ" — port từ thumbnail SVG trong design system upload.
 * Vòng tròn gold + ô vuông xoay 45° + tựa serif.
 */

interface BrandLogoProps {
  size?: number;
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo = ({ size = 280, showTagline = true, className = '' }: BrandLogoProps) => {
  const w = size;
  const h = showTagline ? size * 0.85 : size * 0.6;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Mặc Đồ — Tu Tiên"
    >
      <defs>
        <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#cda45e" stopOpacity="0" />
          <stop offset="80%" stopColor="#cda45e" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#cda45e" stopOpacity="0.3" />
        </radialGradient>
      </defs>

      {/* Ambient glow ring */}
      <circle cx={w / 2} cy={size * 0.27} r={size * 0.22} fill="url(#ringGlow)" />

      {/* Gold circle */}
      <circle
        cx={w / 2}
        cy={size * 0.27}
        r={size * 0.18}
        fill="none"
        stroke="#cda45e"
        strokeWidth={size * 0.012}
        opacity={0.9}
      />

      {/* Center square rotated 45° */}
      <rect
        x={w / 2 - size * 0.06}
        y={size * 0.27 - size * 0.06}
        width={size * 0.12}
        height={size * 0.12}
        fill="#cda45e"
        transform={`rotate(45 ${w / 2} ${size * 0.27})`}
      />

      {/* Title */}
      <text
        x={w / 2}
        y={size * 0.62}
        fontFamily="'Noto Serif Vietnamese', 'Noto Serif', serif"
        fontSize={size * 0.14}
        fill="#e8d3a1"
        textAnchor="middle"
        fontWeight={500}
      >
        Mặc Đồ
      </text>

      {/* Tagline */}
      {showTagline && (
        <text
          x={w / 2}
          y={size * 0.76}
          fontFamily="monospace"
          fontSize={size * 0.045}
          letterSpacing={size * 0.018}
          fill="#8ba888"
          textAnchor="middle"
        >
          TU TIÊN
        </text>
      )}
    </svg>
  );
};

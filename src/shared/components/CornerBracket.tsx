import type { ReactNode } from 'react';

/**
 * Panel với 4 góc dạng ngoặc vuông ┏ ┓ ┗ ┛ — motif chủ đạo trong design.
 * Dùng cho mọi panel quan trọng: portrait, card title, panel section.
 *
 * Ví dụ:
 *   <Bracketed className="p-6">
 *     <h2>Linh Thai Cảnh · Tầng 7</h2>
 *   </Bracketed>
 */
interface BracketedProps {
  children?: ReactNode;
  className?: string;
  /** Mặc định gold. 'jade' / 'spirit' / 'ember' cho variant */
  tone?: 'gold' | 'jade' | 'spirit' | 'ember';
  /** Kích thước corner — default 17px */
  cornerSize?: number;
  /** Padding bracket cách mép — default 7px */
  inset?: number;
}

const TONE_MAP = {
  gold: '#cda45e',
  jade: '#8ba888',
  spirit: '#a78bfa',
  ember: '#d97757',
} as const;

export const Bracketed = ({
  children,
  className = '',
  tone = 'gold',
  cornerSize = 17,
  inset = 7,
}: BracketedProps) => {
  const c = TONE_MAP[tone];
  const corner = (pos: 'tl' | 'tr' | 'bl' | 'br') => {
    const style: React.CSSProperties = {
      position: 'absolute',
      width: cornerSize,
      height: cornerSize,
      pointerEvents: 'none',
      zIndex: 3,
    };
    if (pos === 'tl') {
      style.top = inset;
      style.left = inset;
      style.borderTop = `2px solid ${c}`;
      style.borderLeft = `2px solid ${c}`;
    } else if (pos === 'tr') {
      style.top = inset;
      style.right = inset;
      style.borderTop = `2px solid ${c}`;
      style.borderRight = `2px solid ${c}`;
    } else if (pos === 'bl') {
      style.bottom = inset;
      style.left = inset;
      style.borderBottom = `2px solid ${c}`;
      style.borderLeft = `2px solid ${c}`;
    } else {
      style.bottom = inset;
      style.right = inset;
      style.borderBottom = `2px solid ${c}`;
      style.borderRight = `2px solid ${c}`;
    }
    return <span aria-hidden style={style} />;
  };

  return (
    <div className={`relative ${className}`}>
      {corner('tl')}
      {corner('tr')}
      {corner('bl')}
      {corner('br')}
      {children}
    </div>
  );
};

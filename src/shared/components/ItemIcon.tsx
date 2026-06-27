import { useMemo, useState, useEffect } from 'react';
import { buildPollinationsUrl, buildItemPrompt, isAiImageEnabled } from '@services/image-gen';

/**
 * ItemIcon — Phase 8.2.
 * AI-generated icon cho item. Chỉ enable cho rare+ items để giảm load + giữ feel "special".
 * Common/Tốt items vẫn dùng emoji/text — tiết kiệm.
 */

interface Props {
  name: string;
  category: string;
  rarity?: string;
  size?: number;
  className?: string;
}

// Default render AI image cho MỌI rarity (user toggle off qua AI Status modal).
// Placeholder SVG render ngay → AI image overlay khi load xong, không block UX.
export const ItemIcon = ({ name, category, rarity, size = 64, className = '' }: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const enabled = isAiImageEnabled();

  const url = useMemo(() => {
    if (!enabled) return null;
    const prompt = buildItemPrompt({
      name,
      category,
      ...(rarity ? { rarity } : {}),
    });
    return buildPollinationsUrl({
      prompt,
      width: 256,
      height: 256,
      model: 'flux',
      seed: hashName(name),
    });
  }, [name, category, rarity, enabled]);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [url]);

  const placeholder = useMemo(() => itemPlaceholderSvg(name, rarity), [name, rarity]);

  return (
    <div
      className={`relative overflow-hidden rounded-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={placeholder}
        alt={name}
        width={size}
        height={size}
        className="absolute inset-0"
        style={{ width: size, height: size }}
      />
      {url && !failed && (
        <img
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="absolute inset-0 object-cover transition-opacity duration-500"
          style={{ width: size, height: size, opacity: loaded ? 1 : 0 }}
        />
      )}
    </div>
  );
};

const RARITY_COLOR: Record<string, string> = {
  'Thường': '#9fb09b',
  'Tốt': '#7d9079',
  'Hiếm': '#5e8aae',
  'Cực Phẩm': '#a78bfa',
  'Siêu Phẩm': '#d97757',
  'Huyền Thoại': '#cda45e',
};

const itemPlaceholderSvg = (name: string, rarity?: string): string => {
  const color = RARITY_COLOR[rarity ?? 'Thường'] ?? '#7d9079';
  const initial = name.trim()[0]?.toUpperCase() ?? '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <defs>
      <radialGradient id="g" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#0a0f0a" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <rect width="64" height="64" fill="url(#g)"/>
    <rect width="64" height="64" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.8"/>
    <text x="32" y="40" font-family="'Noto Serif', serif" font-size="28" font-weight="600"
      text-anchor="middle" fill="${color}">${escapeXml(initial)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const hashName = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 999_999;
};

const escapeXml = (s: string): string =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));

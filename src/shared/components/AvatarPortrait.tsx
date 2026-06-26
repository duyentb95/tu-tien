import { useState, useMemo, useEffect } from 'react';
import {
  buildPollinationsUrl,
  buildAvatarPrompt,
  generateProceduralAvatar,
  isAiImageEnabled,
} from '@services/image-gen';

/**
 * AvatarPortrait — Phase 8.2.
 *
 * Strategy:
 *   1. SVG procedural render NGAY (initial paint, no network) — placeholder
 *   2. Background load Pollinations URL → khi load OK → fade-in image
 *   3. Nếu Pollinations fail → giữ SVG (no glitch)
 *   4. Nếu settings aiImageEnabled=false → chỉ dùng SVG procedural
 */

interface AvatarPortraitProps {
  name: string;
  gender?: string;
  personality?: string;
  description?: string;
  realm?: string;
  element?: string;
  /** Force regenerate */
  refreshKey?: number;
  /** Default 200px square */
  size?: number;
  className?: string;
}

export const AvatarPortrait = ({
  name,
  gender,
  personality,
  description,
  realm,
  element,
  refreshKey = 0,
  size = 200,
  className = '',
}: AvatarPortraitProps) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Procedural SVG luôn có ngay — placeholder
  const proceduralAvatar = useMemo(
    () => generateProceduralAvatar({
      name,
      ...(element !== undefined ? { element } : {}),
      ...(realm !== undefined ? { realm } : {}),
    }),
    [name, element, realm],
  );

  // AI image URL từ Pollinations
  const aiImageUrl = useMemo(() => {
    if (!isAiImageEnabled()) return null;
    const prompt = buildAvatarPrompt({
      name,
      ...(gender ? { gender } : {}),
      ...(personality ? { personality } : {}),
      ...(description ? { description } : {}),
      ...(realm ? { realm } : {}),
      ...(element ? { element } : {}),
    });
    return buildPollinationsUrl({
      prompt,
      width: 512,
      height: 512,
      seed: hashName(name + (refreshKey || 0)),
      model: 'flux-realism',
    });
  }, [name, gender, personality, description, realm, element, refreshKey]);

  // Reset loaded state khi refresh
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [aiImageUrl]);

  return (
    <div
      className={`relative overflow-hidden rounded-md ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Layer 1: SVG procedural — luôn render */}
      <img
        src={proceduralAvatar}
        alt={name}
        width={size}
        height={size}
        className="absolute inset-0"
        style={{ width: size, height: size }}
      />

      {/* Layer 2: AI image — fade-in khi load xong */}
      {aiImageUrl && !failed && (
        <img
          src={aiImageUrl}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="absolute inset-0 rounded-md object-cover transition-opacity duration-700"
          style={{
            width: size,
            height: size,
            opacity: loaded ? 1 : 0,
          }}
        />
      )}

      {/* Loading shimmer */}
      {aiImageUrl && !loaded && !failed && (
        <div
          aria-hidden
          className="absolute bottom-1 left-1 right-1 rounded-sm bg-ink-900/70 px-1.5 py-0.5 text-center text-[9px] uppercase tracking-wider text-gold-300 backdrop-blur-sm"
        >
          <span className="anim-pulse">Đang vẽ...</span>
        </div>
      )}

      {/* Frame shadow inner */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: '0 -40px 60px -20px rgba(10,15,10,.9) inset' }}
      />
    </div>
  );
};

const hashName = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 999_999;
};

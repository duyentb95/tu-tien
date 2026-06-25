import { useEffect, useState } from 'react';
import { generateImage, buildAvatarPrompt } from '@services/image-gen';

/**
 * Avatar cho nhân vật. Auto-generate qua Imagen nếu có key + chưa cache.
 * Fallback: SVG gradient placeholder.
 */

interface AvatarPortraitProps {
  name: string;
  gender?: string;
  personality?: string;
  description?: string;
  realm?: string;
  /** Force regenerate (cho button "Tạo lại" trong UI) */
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
  refreshKey = 0,
  size = 200,
  className = '',
}: AvatarPortraitProps) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const prompt = buildAvatarPrompt({
        name,
        ...(gender !== undefined ? { gender } : {}),
        ...(personality !== undefined ? { personality } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(realm !== undefined ? { realm } : {}),
      });
      const result = await generateImage({ prompt, aspectRatio: '1:1', forceRefresh: refreshKey > 0 });
      if (!cancelled) {
        setImgSrc(result);
        setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [name, gender, personality, description, realm, refreshKey]);

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={name}
        width={size}
        height={size}
        className={`rounded-md object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback: SVG placeholder với initial
  const initial = name.charAt(0).toUpperCase();
  const hue = Math.abs(name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 360;
  return (
    <div
      className={`relative overflow-hidden rounded-md ${className}`}
      style={{
        width: size,
        height: size,
        background: `repeating-linear-gradient(45deg, #0d140d, #0d140d 12px, #121b12 12px, #121b12 24px)`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ width: size, height: size }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`g-${name}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={`hsl(${hue}, 40%, 35%)`} stopOpacity="0.7" />
            <stop offset="100%" stopColor="#0a0f0a" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#g-${name})`} />
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontFamily="'Noto Serif', serif"
          fontSize="38"
          fill="#cda45e"
          opacity="0.9"
        >
          {initial}
        </text>
      </svg>
      {loading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm"
        >
          <span className="font-mono text-[10px] text-jade-400 anim-pulse">Đang vẽ...</span>
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: '0 -40px 60px -20px rgba(10,15,10,.9) inset' }}
      />
    </div>
  );
};

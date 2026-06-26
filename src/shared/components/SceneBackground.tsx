import { useMemo, useState, useEffect } from 'react';
import { buildPollinationsUrl, buildScenePrompt, isAiImageEnabled } from '@services/image-gen';

/**
 * SceneBackground — Phase 8.2.
 * Layered fixed-position image cho location/scene. Render absolute background-image
 * fade-in dưới gradient overlay để không che chữ.
 */

interface Props {
  locationName: string;
  description?: string;
  /** width/height override — default fill parent */
  className?: string;
  /** Overlay opacity 0-1 (default 0.7 cho đọc text dễ) */
  overlayOpacity?: number;
  /** Disable component nếu user tắt AI image */
  forceShow?: boolean;
}

export const SceneBackground = ({
  locationName,
  description,
  className = '',
  overlayOpacity = 0.7,
  forceShow,
}: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const enabled = forceShow ?? isAiImageEnabled();

  const url = useMemo(() => {
    if (!enabled) return null;
    const prompt = buildScenePrompt(locationName, description);
    return buildPollinationsUrl({
      prompt,
      width: 1024,
      height: 576,    // 16:9 cho landscape
      model: 'flux',
      seed: hashName(locationName),
    });
  }, [locationName, description, enabled]);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [url]);

  if (!url) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {!failed && (
        <img
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}
      {/* Dark overlay để text overlay dễ đọc */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(10,15,10,${overlayOpacity * 0.4}) 0%, rgba(10,15,10,${overlayOpacity}) 70%, rgba(10,15,10,${overlayOpacity}) 100%)`,
        }}
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

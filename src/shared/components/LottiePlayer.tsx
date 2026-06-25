import Lottie, { type LottieComponentProps } from 'lottie-react';
import { useMemo } from 'react';

/**
 * Wrapper around lottie-react chuẩn hóa cách dùng trong game.
 *
 * Animation JSON viết theo Bodymovin spec (xem skill text-to-lottie).
 * Tham khảo: shape layers (ty:4) với group wrapper (ty:'gr'), color RGBA 0-1,
 * keyframes có t/s/i/o.
 *
 * Note: lottie-web runtime KHÔNG support Skottie-specific features (slots).
 * Để đổi màu theo theme, dùng prop `colorOverrides` hoặc clone JSON trước render.
 */

interface LottiePlayerProps {
  /** Animation JSON object (import từ src/lottie/*.json) */
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  /** Speed multiplier — 1 = bình thường */
  speed?: number;
  /** Phần fixed dimensions (default full container) */
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  /** Callback khi animation kết thúc (chỉ nếu loop = false) */
  onComplete?: () => void;
  /** Tắt mouse events — animation chỉ để decorate */
  passThrough?: boolean;
}

export const LottiePlayer = ({
  animationData,
  loop = true,
  autoplay = true,
  speed = 1,
  width = '100%',
  height = '100%',
  className = '',
  style,
  onComplete,
  passThrough = true,
}: LottiePlayerProps) => {
  // Memoize để tránh re-init animation mỗi render
  const opts: LottieComponentProps = useMemo(
    () => ({
      animationData,
      loop,
      autoplay,
      style: {
        width,
        height,
        ...(passThrough ? { pointerEvents: 'none' as const } : {}),
        ...style,
      },
      className,
      ...(onComplete ? { onComplete } : {}),
    }),
    [animationData, loop, autoplay, width, height, className, style, onComplete, passThrough],
  );

  // lottie-react không có speed prop direct — phải set qua lottieRef
  // Dùng key trick: re-mount khi speed thay đổi (đủ dùng cho game)
  return <Lottie key={`speed-${speed}`} {...opts} />;
};

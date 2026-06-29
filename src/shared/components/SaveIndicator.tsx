import { useEffect, useState } from 'react';

/**
 * Phase 24.UX: Visual save indicator — toast nhỏ góc dưới trái.
 * Listen `tutien:save` event từ saveToLocalStorage → hiện badge 1.5s rồi fade.
 *
 * Throttle: chỉ render 1 lần / 500ms để tránh flicker khi auto-save burst.
 */
export const SaveIndicator = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let lastShown = 0;
    const handler = () => {
      const now = Date.now();
      // Throttle 500ms — tránh spam khi auto-save fire liên tục
      if (now - lastShown < 500) return;
      lastShown = now;
      setVisible(true);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setVisible(false), 1500);
    };
    window.addEventListener('tutien:save', handler);
    return () => {
      window.removeEventListener('tutien:save', handler);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className="fixed bottom-4 left-4 z-30 pointer-events-none transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
      }}
      aria-live="polite"
      aria-hidden={!visible}
    >
      <div
        className="rounded-full border border-jade-500/40 bg-ink-900/90 px-3 py-1 text-[11px] font-mono text-jade-300 shadow-lg backdrop-blur-sm"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
      >
        <span className="text-jade-400">💾</span> Đã lưu
      </div>
    </div>
  );
};

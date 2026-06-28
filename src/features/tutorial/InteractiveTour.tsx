/**
 * Phase 21.3: Interactive Tour với spotlight highlight.
 *
 * Khác WelcomeOverlay (lore-driven modal) — tour này dẫn dắt user click qua
 * UI thật, mỗi step:
 *   1. Tìm element qua data-tour="id"
 *   2. Vẽ overlay tối đè toàn màn hình + cut-out hole quanh element (4 div xám)
 *   3. Hiển thị tooltip card cạnh element (auto-position trên/dưới)
 *   4. Button "Tiếp" / "Bỏ qua tour"
 *
 * Steps được define trong TOUR_STEPS, có thể skip step nếu element không exist.
 * Persist tutorial-seen 'interactive-tour' → chỉ chạy 1 lần.
 *
 * Trigger: chỉ chạy SAU khi WelcomeOverlay đóng + player exists, turn ≤ 1.
 */
import { useEffect, useState, useLayoutEffect } from 'react';
import { hasSeenTutorial, markTutorialSeen } from './tutorial-state';
import { useGameStore } from '@state/game-store';

interface TourStep {
  selector: string;
  title: string;
  body: string;
  /** Vị trí tooltip — auto compute nếu không set */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="story-view"]',
    title: '📖 Câu chuyện chính',
    body: 'Đây là nơi AI viết nên cuộc đời tu tiên của ngươi. Mỗi đoạn văn là 1 cảnh sống.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="action-panel"]',
    title: '✦ Bảng hành động',
    body: 'Chọn 1 trong các gợi ý — hoặc gõ ý tưởng riêng. AI sẽ diễn hóa tiếp.',
    placement: 'top',
  },
  {
    selector: '[data-tour="player-sidebar"]',
    title: '👤 Đạo Cơ',
    body: 'HP, EXP, lượt còn lại + cảnh giới hiện tại — quan sát thường xuyên.',
    placement: 'right',
  },
  {
    selector: '[data-tour="nav-currency"]',
    title: '💎 Tiền Ngọc + Cửa hàng',
    body: 'Click để mở cửa hàng, đổi quà, nhập mã khuyến mãi.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="nav-daily"]',
    title: '📅 Điểm danh hằng ngày',
    body: 'Vào mỗi ngày để nhận TN + lượt miễn phí. Streak 7-ngày = ×1.5 bonus.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="notification-bell"]',
    title: '🔔 Trung tâm thông báo',
    body: 'Lịch sử 50 thông báo gần nhất + click vào action button để jump đến modal liên quan.',
    placement: 'bottom',
  },
];

const TOUR_KEY = 'interactive-tour-v1';

interface Rect { top: number; left: number; width: number; height: number }

const getRect = (selector: string): Rect | null => {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

export const InteractiveTour = () => {
  const player = useGameStore((s) => s.player);
  const turn = useGameStore((s) => s.turn);
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  // Decide whether to start tour
  useEffect(() => {
    if (!player) return;
    if (turn > 1) return;
    if (hasSeenTutorial(TOUR_KEY)) return;
    // Wait until WelcomeOverlay closed (welcome key seen)
    if (!hasSeenTutorial('welcome')) return;
    const t = setTimeout(() => setActive(true), 800);
    return () => clearTimeout(t);
  }, [player, turn]);

  // Recompute rect khi step thay đổi
  useLayoutEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[stepIdx];
    if (!step) return;
    const r = getRect(step.selector);
    if (!r) {
      // Element không tồn tại → skip step này
      handleNext();
      return;
    }
    setRect(r);
  }, [active, stepIdx]);

  // Recompute on window resize/scroll
  useEffect(() => {
    if (!active) return;
    const step = TOUR_STEPS[stepIdx];
    if (!step) return;
    const update = () => {
      const r = getRect(step.selector);
      if (r) setRect(r);
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [active, stepIdx]);

  const handleNext = () => {
    if (stepIdx >= TOUR_STEPS.length - 1) {
      finish();
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  const handleSkip = () => finish();

  const finish = () => {
    markTutorialSeen(TOUR_KEY);
    setActive(false);
  };

  if (!active || !rect) return null;
  const step = TOUR_STEPS[stepIdx];
  if (!step) return null;

  const PAD = 6;
  const cut = {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  };

  // Tooltip position
  const placement = step.placement ?? 'bottom';
  const tooltipStyle: React.CSSProperties = (() => {
    const offset = 12;
    switch (placement) {
      case 'top':
        return { top: cut.top - offset - 100, left: cut.left, maxWidth: 320 };
      case 'bottom':
        return { top: cut.top + cut.height + offset, left: cut.left, maxWidth: 320 };
      case 'left':
        return { top: cut.top, left: cut.left - 340, maxWidth: 320 };
      case 'right':
        return { top: cut.top, left: cut.left + cut.width + offset, maxWidth: 320 };
    }
  })();

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* 4 overlay panels around the cut-out (dim everything except spotlight) */}
      <div
        className="absolute bg-black/75 pointer-events-auto"
        style={{ top: 0, left: 0, width: '100vw', height: cut.top }}
      />
      <div
        className="absolute bg-black/75 pointer-events-auto"
        style={{ top: cut.top, left: 0, width: cut.left, height: cut.height }}
      />
      <div
        className="absolute bg-black/75 pointer-events-auto"
        style={{
          top: cut.top,
          left: cut.left + cut.width,
          width: `calc(100vw - ${cut.left + cut.width}px)`,
          height: cut.height,
        }}
      />
      <div
        className="absolute bg-black/75 pointer-events-auto"
        style={{
          top: cut.top + cut.height,
          left: 0,
          width: '100vw',
          height: `calc(100vh - ${cut.top + cut.height}px)`,
        }}
      />

      {/* Spotlight ring around target */}
      <div
        className="absolute rounded border-2 border-gold-400 animate-pulse pointer-events-none"
        style={{
          top: cut.top,
          left: cut.left,
          width: cut.width,
          height: cut.height,
          boxShadow: '0 0 24px rgba(212, 175, 55, 0.6)',
        }}
      />

      {/* Tooltip card */}
      <div
        className="absolute rounded border border-gold-500/60 bg-ink-900/98 p-3 shadow-2xl pointer-events-auto"
        style={tooltipStyle}
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-widest text-jade-500">
            Bước {stepIdx + 1} / {TOUR_STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-[9px] uppercase tracking-widest text-jade-500 hover:text-ember-300"
          >
            Bỏ qua tour
          </button>
        </div>
        <h4 className="font-serif text-base text-gold-300">{step.title}</h4>
        <p className="mt-1 text-[12px] leading-relaxed text-jade-200">{step.body}</p>
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleNext}
            className="rounded border border-gold-500/60 bg-gradient-to-b from-gold-700 to-gold-900 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-ink-900 hover:from-gold-600"
          >
            {stepIdx >= TOUR_STEPS.length - 1 ? '✓ Hoàn tất' : 'Tiếp →'}
          </button>
        </div>
      </div>
    </div>
  );
};

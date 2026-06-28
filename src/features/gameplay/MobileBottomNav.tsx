/**
 * Phase 21.5: Mobile bottom-nav 5-tab — chỉ hiện mobile < 1024px (lg breakpoint).
 *
 * 5 tab:
 *   📖 Story (back to gameplay)
 *   🗺 Map (world map)
 *   👤 Char (character sheet)
 *   🎒 Inv (inventory)
 *   ⋯ More (mở danh sách rộng — handbook, daily, monetization, etc.)
 *
 * "More" → toggle bottom-sheet với grid 6 button extra.
 * Active tab = stage hiện tại (style highlight).
 * Touch target ≥ 48×48 px.
 * Z-index thấp hơn modal (60 < 80).
 * Safe-area-inset bottom cho iOS notch.
 */
import { useState } from 'react';
import { useGameStore } from '@state/game-store';
import { openTarget } from '@state/notifications';

interface Tab {
  id: string;
  label: string;
  icon: string;
  /** Stage to jump to OR custom click handler */
  stage?: 'playing' | 'character' | 'inventory' | 'world_map';
  onClick?: () => void;
}

export const MobileBottomNav = () => {
  const stage = useGameStore((s) => s.stage);
  const setStage = useGameStore((s) => s.setStage);
  const [moreOpen, setMoreOpen] = useState(false);

  // Chỉ hiện trên mobile + khi đang gameplay flow
  const shouldShow = !['initial', 'setup', 'adventure_mode', 'combat', 'tribulation'].includes(stage);
  if (!shouldShow) return null;

  const tabs: Tab[] = [
    { id: 'story', label: 'Story', icon: '📖', stage: 'playing' },
    { id: 'map', label: 'Map', icon: '🗺', stage: 'world_map' },
    { id: 'char', label: 'Đạo Cơ', icon: '👤', stage: 'character' },
    { id: 'inv', label: 'Hành Trang', icon: '🎒', stage: 'inventory' },
    { id: 'more', label: 'Thêm', icon: '⋯', onClick: () => setMoreOpen((v) => !v) },
  ];

  const moreActions: Array<{ label: string; icon: string; target: Parameters<typeof openTarget>[0] }> = [
    { label: 'Hàng Ngày', icon: '📅', target: 'daily-missions' },
    { label: 'Chuỗi NV', icon: '✦', target: 'extended-quests' },
    { label: 'Cửa Hàng', icon: '💎', target: 'monetization' },
    { label: 'Thành Tựu', icon: '★', target: 'achievements' },
    { label: 'Tông Môn', icon: '⚔', target: 'sect-hall' },
    { label: 'Cẩm Nang', icon: '?', target: 'handbook' },
  ];

  const handleTab = (t: Tab) => {
    if (t.onClick) {
      t.onClick();
    } else if (t.stage) {
      setMoreOpen(false);
      setStage(t.stage);
    }
  };

  return (
    <>
      {/* "More" bottom-sheet — mở từ tab cuối */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/60 lg:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-[64px] left-0 right-0 rounded-t-lg border-t-2 border-gold-500/40 bg-ink-900/98 p-3"
            onClick={(e) => e.stopPropagation()}
            style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
          >
            <div className="mb-2 text-center text-[10px] uppercase tracking-widest text-jade-500">
              ⋯ Thêm chức năng
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreActions.map((a) => (
                <button
                  key={a.target}
                  onClick={() => {
                    openTarget(a.target);
                    setMoreOpen(false);
                  }}
                  className="flex min-h-[64px] flex-col items-center justify-center rounded border border-spirit-500/30 bg-spirit-900/15 px-2 py-2 text-jade-200 active:bg-spirit-700/30"
                >
                  <span className="text-[18px]">{a.icon}</span>
                  <span className="mt-0.5 text-[10px]">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom-nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[60] border-t border-gold-500/30 bg-ink-900/97 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5">
          {tabs.map((t) => {
            const active = t.stage === stage || (t.id === 'more' && moreOpen);
            return (
              <button
                key={t.id}
                onClick={() => handleTab(t)}
                className={`flex min-h-[56px] flex-col items-center justify-center px-1 py-1.5 text-[10px] transition-colors ${
                  active
                    ? 'bg-gold-900/30 text-gold-300'
                    : 'text-jade-400 active:bg-spirit-900/30'
                }`}
              >
                <span className="text-[18px]">{t.icon}</span>
                <span className="mt-0.5">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

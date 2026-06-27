import { Bracketed } from '@shared/components/CornerBracket';
import { SHORTCUT_CATALOG, type ShortcutEntry } from '@shared/hooks/useGlobalShortcuts';
import { useKeyboard } from '@shared/hooks/useKeyboard';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_LABEL: Record<ShortcutEntry['category'], { label: string; color: string }> = {
  navigation: { label: '☰ Điều Hướng', color: 'text-gold-300' },
  modals: { label: '◭ Modal & Bảng', color: 'text-spirit-300' },
  actions: { label: '⚔ Hành Động', color: 'text-ember-300' },
};

/**
 * Phase 14.x: Help modal liệt kê tất cả shortcuts. Mở bằng Shift+? hoặc F1.
 */
export const ShortcutHelpModal = ({ open, onClose }: Props) => {
  useKeyboard({ Escape: onClose }, [onClose], open);

  if (!open) return null;

  // Group theo category
  const grouped = SHORTCUT_CATALOG.reduce<Record<string, ShortcutEntry[]>>((acc, s) => {
    acc[s.category] ??= [];
    acc[s.category]!.push(s);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-[145] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Phím tắt"
    >
      <div className="w-full max-w-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <Bracketed className="rounded-md border bg-ink-700 p-5 sm:p-6" tone="gold">
          <div className="mb-4 flex items-start justify-between border-b border-gold-700/30 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold tracking-wide text-gold-200">
                <span aria-hidden>⌨</span> Phím Tắt
              </h2>
              <p className="mt-1 text-[12px] italic text-jade-400">
                Cẩm nang điều hành nhanh — không cần chạm chuột.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest text-jade-500 hover:text-gold-300"
              aria-label="Đóng"
            >
              × Đóng (Esc)
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {(Object.keys(CATEGORY_LABEL) as Array<keyof typeof CATEGORY_LABEL>).map((cat) => {
              const items = grouped[cat];
              if (!items || items.length === 0) return null;
              const meta = CATEGORY_LABEL[cat];
              return (
                <div key={cat}>
                  <h3 className={`mb-2 font-serif text-sm font-bold uppercase tracking-widest ${meta.color}`}>
                    {meta.label}
                  </h3>
                  <ul className="space-y-1">
                    {items.map((s, i) => (
                      <li
                        key={`${cat}-${i}`}
                        className="flex items-center justify-between gap-3 rounded border border-gold-700/20 bg-ink-900/40 px-3 py-1.5"
                      >
                        <span className="text-[12.5px] text-jade-300">{s.label}</span>
                        <div className="flex flex-shrink-0 items-center gap-1">
                          {s.keys.map((k, j) => (
                            <span key={j} className="flex items-center gap-1">
                              {j > 0 && <span className="text-[10px] text-jade-600">+</span>}
                              <kbd
                                className="rounded border border-gold-500/40 bg-ink-800 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-gold-200"
                                style={{ minWidth: 22, textAlign: 'center' }}
                              >
                                {k}
                              </kbd>
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-gold-700/20 pt-3">
            <p className="text-center text-[11px] italic text-jade-500">
              💡 Bấm <kbd className="rounded border border-gold-500/40 bg-ink-800 px-1 font-mono text-[10px]">Shift</kbd> + <kbd className="rounded border border-gold-500/40 bg-ink-800 px-1 font-mono text-[10px]">?</kbd> bất cứ lúc nào để mở lại bảng này.
            </p>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

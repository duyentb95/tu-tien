import { useState, useMemo } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { useKeyboard } from '@shared/hooks/useKeyboard';
import { HANDBOOK_ENTRIES, HANDBOOK_CATEGORIES, type HandbookEntry } from './handbook-content';

interface HandbookModalProps {
  open: boolean;
  onClose: () => void;
  /** Open trực tiếp tới entry cụ thể (vd: từ contextual tip) */
  initialEntryId?: string;
}

/**
 * Cẩm Nang Tu Tiên — wiki in-game, modal overlay.
 * Đặt 2-pane: left = list (category + entries), right = nội dung entry chọn.
 */
export const HandbookModal = ({ open, onClose, initialEntryId }: HandbookModalProps) => {
  const [activeCategory, setActiveCategory] = useState<HandbookEntry['category']>('basics');
  const [selectedId, setSelectedId] = useState<string>(initialEntryId ?? 'getting-started');

  const entriesInCategory = useMemo(
    () => HANDBOOK_ENTRIES.filter((e) => e.category === activeCategory),
    [activeCategory],
  );

  const selectedEntry = useMemo(
    () => HANDBOOK_ENTRIES.find((e) => e.id === selectedId) ?? HANDBOOK_ENTRIES[0]!,
    [selectedId],
  );

  // ESC để đóng modal — chỉ active khi open=true
  useKeyboard({ Escape: onClose }, [onClose], open);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="handbook-title"
    >
      <div
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        <Bracketed className="rounded-md border bg-ink-700" tone="gold">
          <div className="flex flex-col" style={{ maxHeight: '85vh' }}>
            {/* Header */}
            <header className="flex items-center justify-between border-b border-gold-700/15 px-6 py-4">
              <div>
                <div className="label-section mb-1">Wiki · Tu Tiên Toàn Thư</div>
                <h2 id="handbook-title" className="font-serif text-2xl font-bold uppercase tracking-wider text-gold-200">
                  Cẩm Nang Tu Tiên
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-sm p-2 text-2xl text-gold-300 transition-colors hover:text-gold-100"
                aria-label="Đóng cẩm nang (Esc)"
                title="Đóng (Esc)"
              >
                ⊗
              </button>
            </header>

            {/* Category tabs */}
            <nav className="flex gap-1 overflow-x-auto border-b border-gold-700/10 px-4 py-2">
              {HANDBOOK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const first = HANDBOOK_ENTRIES.find((e) => e.category === cat.id);
                    if (first) setSelectedId(first.id);
                  }}
                  className="flex-shrink-0 rounded-sm px-3 py-2 text-[12.5px] transition-colors whitespace-nowrap"
                  style={{
                    color: activeCategory === cat.id ? 'var(--gold-100)' : 'var(--gold-300)',
                    background: activeCategory === cat.id ? 'rgba(205,164,94,.1)' : 'transparent',
                    borderBottom: activeCategory === cat.id ? '2px solid var(--gold-500)' : '2px solid transparent',
                  }}
                >
                  <span className="mr-1.5 text-[11px]" style={{ color: 'var(--gold-500)' }}>
                    {cat.icon}
                  </span>
                  {cat.label}
                </button>
              ))}
            </nav>

            {/* Body — 2 pane */}
            <div className="grid flex-1 overflow-hidden md:grid-cols-[220px_1fr]">
              {/* Left: entry list */}
              <aside className="overflow-y-auto border-r border-gold-700/10 p-3" style={{ maxHeight: '60vh' }}>
                <div className="space-y-1">
                  {entriesInCategory.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedId(entry.id)}
                      className="flex w-full items-start gap-2 rounded-sm px-3 py-2 text-left text-[12.5px] transition-colors"
                      style={{
                        background: selectedId === entry.id ? 'rgba(205,164,94,.08)' : 'transparent',
                        color: selectedId === entry.id ? 'var(--gold-100)' : 'var(--gold-300)',
                        borderLeft: selectedId === entry.id ? '2px solid var(--gold-500)' : '2px solid transparent',
                      }}
                    >
                      <span style={{ color: 'var(--gold-500)', fontSize: 13 }}>{entry.icon}</span>
                      <span className="leading-tight">{entry.title}</span>
                    </button>
                  ))}
                </div>
              </aside>

              {/* Right: content */}
              <article className="overflow-y-auto p-6" style={{ maxHeight: '60vh' }}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl" style={{ color: 'var(--gold-500)' }}>
                    {selectedEntry.icon}
                  </span>
                  <div>
                    <div className="label-section">
                      {HANDBOOK_CATEGORIES.find((c) => c.id === selectedEntry.category)?.label}
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-gold-200">{selectedEntry.title}</h3>
                  </div>
                </div>
                <div className="prose-handbook text-[14px] leading-relaxed text-gold-300">
                  {renderMarkdownLite(selectedEntry.content)}
                </div>
              </article>
            </div>

            {/* Footer */}
            <footer className="border-t border-gold-700/15 px-6 py-3 text-center text-[11px] italic text-jade-500">
              Mở Cẩm Nang bất cứ lúc nào bằng nút <kbd className="rounded border border-gold-700/30 bg-ink-800 px-1.5 py-0.5 text-gold-300">?</kbd> trên thanh navigation
            </footer>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

/** Markdown-lite renderer: \n đoạn, ** bold, > blockquote, - list */
function renderMarkdownLite(text: string): React.ReactNode {
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('>')) {
      return (
        <blockquote
          key={i}
          className="my-3 rounded-r-sm border-l-2 border-gold-500/40 bg-gold-500/5 px-4 py-2 text-[13px] italic text-gold-200"
        >
          {renderInline(trimmed.replace(/^>\s*/, ''))}
        </blockquote>
      );
    }
    if (trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').map((l) => l.replace(/^-\s*/, ''));
      return (
        <ul key={i} className="my-3 space-y-1.5 pl-5">
          {items.map((it, j) => (
            <li key={j} className="list-disc text-[13.5px] text-gold-300 marker:text-gold-500/60">
              {renderInline(it)}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mb-3 text-[14px] leading-relaxed text-gold-300/95">
        {renderInline(trimmed)}
      </p>
    );
  });
}

/** Inline: **bold** */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gold-100">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

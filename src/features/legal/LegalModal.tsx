import { useState } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { useKeyboard } from '@shared/hooks/useKeyboard';
import { LEGAL_PAGES, APP_VERSION, type LegalPage } from './legal-content';

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  initialPage?: LegalPage['id'];
}

/**
 * Legal Modal — chứa Privacy Policy, TOS, About. Tabs ngang.
 * Render markdown-lite content. ESC để đóng.
 */
export const LegalModal = ({ open, onClose, initialPage }: LegalModalProps) => {
  const [activeId, setActiveId] = useState<LegalPage['id']>(initialPage ?? 'about');

  useKeyboard({ Escape: onClose }, [onClose], open);

  if (!open) return null;

  const page = LEGAL_PAGES.find((p) => p.id === activeId) ?? LEGAL_PAGES[0]!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-title"
    >
      <div
        className="relative w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        <Bracketed className="rounded-md border bg-ink-700" tone="gold">
          <div className="flex flex-col" style={{ maxHeight: '85vh' }}>
            {/* Header + tabs */}
            <header className="border-b border-gold-700/15 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="label-section mb-1">Pháp Lý · Thông Tin</div>
                  <h2 id="legal-title" className="font-serif text-2xl font-bold uppercase tracking-wider text-gold-200">
                    {page.title}
                  </h2>
                  <p className="mt-1 text-[11px] text-jade-500">
                    Phiên bản app: <span className="font-mono text-gold-300">{APP_VERSION}</span>
                    <span className="ml-3">Cập nhật lần cuối: <span className="font-mono">{page.lastUpdated}</span></span>
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-sm p-2 text-2xl text-gold-300 transition-colors hover:text-gold-100"
                  aria-label="Đóng (Esc)"
                  title="Đóng (Esc)"
                >
                  ⊗
                </button>
              </div>

              <nav className="mt-4 flex gap-1 overflow-x-auto" role="tablist">
                {LEGAL_PAGES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveId(p.id)}
                    role="tab"
                    aria-selected={activeId === p.id}
                    aria-controls="legal-content"
                    className="flex-shrink-0 rounded-sm px-3 py-2 text-[12.5px] transition-colors whitespace-nowrap"
                    style={{
                      color: activeId === p.id ? 'var(--gold-100)' : 'var(--gold-300)',
                      background: activeId === p.id ? 'rgba(205,164,94,.1)' : 'transparent',
                      borderBottom: activeId === p.id ? '2px solid var(--gold-500)' : '2px solid transparent',
                      minHeight: 40,
                    }}
                  >
                    <span aria-hidden className="mr-1.5 text-[11px]" style={{ color: 'var(--gold-500)' }}>
                      {p.icon}
                    </span>
                    {p.title}
                  </button>
                ))}
              </nav>
            </header>

            {/* Body */}
            <article
              id="legal-content"
              className="flex-1 overflow-y-auto p-6 text-[14px] leading-relaxed text-gold-300"
              style={{ maxHeight: '60vh' }}
            >
              {renderMarkdownLite(page.content)}
            </article>

            {/* Footer */}
            <footer className="border-t border-gold-700/15 px-6 py-3 text-center text-[11px] italic text-jade-500">
              Mở lại bất cứ lúc nào từ footer hoặc trang chính.
            </footer>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

/** Markdown-lite: \n đoạn, ** bold, > blockquote, - list, [text](url) link */
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

function renderInline(text: string): React.ReactNode {
  // Split bằng pattern bold + link
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gold-100">
          {p.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold-100 underline decoration-gold-500/40 underline-offset-2 transition-colors hover:text-gold-50 hover:decoration-gold-500"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

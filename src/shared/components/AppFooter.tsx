import { useState, lazy, Suspense } from 'react';
import { APP_VERSION } from '@features/legal';
import type { LegalPage } from '@features/legal';

// Lazy load LegalModal — chỉ tải khi user mở
const LegalModal = lazy(() =>
  import('@features/legal').then((m) => ({ default: m.LegalModal })),
);

/**
 * AppFooter — render ở cuối mọi screen.
 * - Version + build date
 * - Links: Privacy / TOS / About
 * - Discord/Facebook community (placeholder URLs)
 */
export const AppFooter = () => {
  const [legalOpen, setLegalOpen] = useState(false);
  const [initialPage, setInitialPage] = useState<LegalPage['id']>('about');

  const openLegal = (page: LegalPage['id']) => {
    setInitialPage(page);
    setLegalOpen(true);
  };

  return (
    <>
      <footer className="mt-12 border-t border-gold-700/15 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-[11.5px] text-jade-500 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="font-serif text-gold-300">Mặc Hội Tiên Đồ</span>
            <span aria-hidden>·</span>
            <span className="font-mono">v{APP_VERSION}</span>
          </div>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Liên kết pháp lý">
            <FooterLink onClick={() => openLegal('privacy')}>Bảo Mật</FooterLink>
            <span aria-hidden className="text-jade-700">·</span>
            <FooterLink onClick={() => openLegal('tos')}>Điều Khoản</FooterLink>
            <span aria-hidden className="text-jade-700">·</span>
            <FooterLink onClick={() => openLegal('about')}>Về Game</FooterLink>
          </nav>
        </div>
        <p className="mt-3 text-center text-[10.5px] italic text-jade-700 sm:text-right">
          Nội dung do AI Gemini sinh — vui lòng đọc Điều Khoản trước khi chơi.
        </p>
      </footer>

      <Suspense fallback={null}>
        {legalOpen && (
          <LegalModal
            open
            onClose={() => setLegalOpen(false)}
            initialPage={initialPage}
          />
        )}
      </Suspense>
    </>
  );
};

interface FooterLinkProps {
  onClick: () => void;
  children: React.ReactNode;
}
const FooterLink = ({ onClick, children }: FooterLinkProps) => (
  <button
    onClick={onClick}
    className="text-jade-400 transition-colors hover:text-gold-300 hover:underline underline-offset-2"
  >
    {children}
  </button>
);


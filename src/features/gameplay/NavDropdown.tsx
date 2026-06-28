/**
 * Phase 22.UX: Nav dropdown — group nav button thành menu collapsible
 * giảm 17+ button flat → 4 dropdown + 3 critical button.
 *
 * Click trigger → toggle panel; click outside → close.
 * Panel mở xuống dưới, anchor left của button.
 */
import { useEffect, useRef, useState } from 'react';

interface NavDropdownItem {
  label: string;
  icon: string;
  onClick: () => void;
  /** Optional badge count (cho notification trên item, vd "Hôm nay có mission mới") */
  badge?: number;
}

interface NavDropdownProps {
  label: string;
  icon: string;
  items: NavDropdownItem[];
}

export const NavDropdown = ({ label, icon, items }: NavDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-[12px] transition-colors ${
          open
            ? 'border-gold-500 bg-gold-900/40 text-gold-200'
            : 'border-spirit-500/30 bg-ink-800/60 text-jade-300 hover:bg-spirit-900/30'
        }`}
        aria-expanded={open}
      >
        <span className="text-[14px]">{icon}</span>
        <span className="font-serif">{label}</span>
        <span className={`text-[9px] transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-40 mt-1.5 min-w-[180px] rounded border border-gold-500/40 bg-ink-900/98 shadow-2xl backdrop-blur"
          role="menu"
        >
          <div className="py-1">
            {items.map((it) => (
              <button
                key={it.label}
                onClick={() => {
                  it.onClick();
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[12px] text-jade-200 transition-colors hover:bg-spirit-900/40 hover:text-gold-200"
                role="menuitem"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[13px] opacity-80">{it.icon}</span>
                  <span>{it.label}</span>
                </span>
                {it.badge !== undefined && it.badge > 0 && (
                  <span className="rounded-full bg-ember-500 px-1.5 text-[9px] font-bold text-ink-900">
                    {it.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

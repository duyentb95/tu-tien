import { useNotifStore, type Notification } from '@state/notifications';

const KIND_STYLE: Record<Notification['kind'], { border: string; bg: string; iconColor: string; titleColor: string }> = {
  success: {
    border: 'rgba(143,201,140,.5)',
    bg: 'linear-gradient(135deg, rgba(143,201,140,.12), rgba(143,201,140,.04))',
    iconColor: 'var(--leaf-500)',
    titleColor: 'var(--leaf-500)',
  },
  info: {
    border: 'rgba(205,164,94,.4)',
    bg: 'linear-gradient(135deg, rgba(205,164,94,.1), rgba(205,164,94,.03))',
    iconColor: 'var(--gold-500)',
    titleColor: 'var(--gold-200)',
  },
  warn: {
    border: 'rgba(217,119,87,.5)',
    bg: 'linear-gradient(135deg, rgba(217,119,87,.12), rgba(217,119,87,.04))',
    iconColor: 'var(--ember-500)',
    titleColor: 'var(--ember-200)',
  },
  epic: {
    border: 'rgba(167,139,250,.55)',
    bg: 'linear-gradient(135deg, rgba(167,139,250,.18), rgba(167,139,250,.05))',
    iconColor: 'var(--spirit-500)',
    titleColor: 'var(--spirit-200)',
  },
};

export const ToastStack = () => {
  const items = useNotifStore((s) => s.items);
  const dismiss = useNotifStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[320px] flex-col gap-2">
      {items.map((n) => {
        const s = KIND_STYLE[n.kind];
        return (
          <div
            key={n.id}
            className="pointer-events-auto anim-rise rounded-md border px-4 py-3 shadow-lg backdrop-blur-md"
            style={{ borderColor: s.border, background: s.bg }}
          >
            <div className="flex items-start gap-2">
              {n.icon && (
                <span
                  className="flex-shrink-0 font-bold"
                  style={{ color: s.iconColor, fontSize: n.kind === 'epic' ? 18 : 14 }}
                >
                  {n.icon}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div
                  className="text-[13.5px] font-medium"
                  style={{ color: s.titleColor, fontFamily: n.kind === 'epic' ? 'var(--font-serif)' : 'inherit' }}
                >
                  {n.title}
                </div>
                {n.message && (
                  <div className="mt-0.5 text-[11.5px] leading-relaxed text-gold-300/80">
                    {n.message}
                  </div>
                )}
              </div>
              <button
                onClick={() => dismiss(n.id)}
                className="flex-shrink-0 text-jade-500 hover:text-gold-200"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

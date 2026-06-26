import { useEffect, useState } from 'react';
import { useGameStore } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { shouldUseMockAi } from '@ai/mock';
import { isSfxMuted, setSfxMuted } from '@services/audio';

export const InitialScreen = () => {
  const setStage = useGameStore((s) => s.setStage);
  const loadFromLocalStorage = useGameStore((s) => s.loadFromLocalStorage);
  const [hasSave, setHasSave] = useState(false);
  const [muted, setMuted] = useState(isSfxMuted());
  const usingMock = shouldUseMockAi();

  useEffect(() => {
    setHasSave(!!localStorage.getItem('tu-tien:save:slot-0'));
  }, []);

  const onContinue = () => {
    if (loadFromLocalStorage()) {
      // store sẽ tự setStage('playing')
    } else {
      alert('Không tìm thấy bản lưu.');
    }
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-center gap-10">
        {/* ░░░ TITLE MENU CARD ░░░ */}
        <Bracketed
          tone="gold"
          className="flex w-full max-w-md flex-col gap-7 rounded-md border bg-gradient-to-b from-ink-750 to-ink-900 px-8 py-9 anim-rise"
          inset={9}
        >
          {/* Title */}
          <div className="text-center">
            <div className="label-section mb-3">Mặc Hội · Tiên Đồ</div>
            <h1
              className="font-serif text-[46px] font-bold leading-tight text-gold-200"
              style={{ letterSpacing: '0.04em', textShadow: '0 0 26px rgba(205,164,94,.32)' }}
            >
              Mặc Đồ
            </h1>
            <p
              className="mt-3 font-serif text-base italic text-gold-300/80"
              style={{ letterSpacing: '0.05em' }}
            >
              Một niệm thành tiên, một niệm thành ma.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-[11px]">
            {hasSave && (
              <button onClick={onContinue} className="btn-primary text-[17px]">
                Tiếp Tục Hành Trình
              </button>
            )}
            <button
              onClick={() => setStage('adventure_mode')}
              className="btn-secondary text-[15px]"
              style={{ color: hasSave ? '#9fb09b' : '#cda45e' }}
            >
              Khởi Đầu Cuộc Phiêu Lưu Mới
            </button>
            <button
              onClick={() => alert('Tải từ tệp: sẽ implement ở Phase 1.5')}
              className="btn-secondary text-[15px]"
            >
              Tải Game Từ Tệp
            </button>
            <button
              onClick={() => alert('Hướng dẫn: sẽ wire HandbookModal ở Phase 1.5')}
              className="btn-secondary text-[15px]"
            >
              Hướng Dẫn Tu Sĩ
            </button>
            <button
              onClick={() => alert('Cộng đồng: Discord / Facebook link')}
              className="btn-secondary text-[15px]"
            >
              Đạo Hữu Tụ Hội (Cộng Đồng)
            </button>
            <button
              onClick={() => { const next = !muted; setSfxMuted(next); setMuted(next); }}
              className="btn-secondary text-[13px]"
              style={{ opacity: 0.85 }}
            >
              {muted ? '♪ Bật Âm Thanh' : '♪ Tắt Âm Thanh'}
            </button>
          </div>

          {/* AI status panel */}
          <div
            className="rounded-sm border px-4 py-2.5 text-center"
            style={{
              borderColor: usingMock ? 'rgba(167,139,250,.4)' : 'rgba(127,174,110,.22)',
              background: usingMock ? 'rgba(167,139,250,.05)' : 'rgba(127,174,110,.05)',
            }}
          >
            <div
              className="text-xs"
              style={{ color: usingMock ? 'var(--spirit-300)' : 'var(--leaf-500)' }}
            >
              {usingMock
                ? 'Đang dùng Mock AI (kịch bản dựng sẵn) — Không cần API Key.'
                : 'Đang dùng Gemini AI Mặc Định — Đã cấu hình API Key.'}
            </div>
            <div className="mt-1 font-mono text-[10px] text-jade-700">
              UID: {Math.random().toString(36).slice(2, 18).toUpperCase()}
            </div>
          </div>
        </Bracketed>

        {/* ░░░ SIDE PANEL: TUTORIAL HINT ░░░ */}
        <div className="hidden w-72 flex-col gap-4 anim-rise lg:flex" style={{ animationDelay: '0.15s' }}>
          <Bracketed tone="jade" className="border bg-ink-700 p-5" inset={6}>
            <div className="label-section mb-3">Bắt đầu nhanh</div>
            <ol className="space-y-2 font-serif text-[13.5px] leading-relaxed text-gold-300">
              <li>
                <span className="text-gold-500">①</span> Click "Khởi Đầu Mới" để tạo đạo hữu của ngươi.
              </li>
              <li>
                <span className="text-gold-500">②</span> Chọn tính cách, linh căn, độ khó.
              </li>
              <li>
                <span className="text-gold-500">③</span> AI sẽ dệt nên một thế giới riêng cho ngươi.
              </li>
              <li>
                <span className="text-gold-500">④</span> Mỗi quyết định là một bước trên đại đạo.
              </li>
            </ol>
          </Bracketed>

          <div className="rounded-md border border-gold-700/20 bg-ink-700/60 p-4 text-xs text-jade-500">
            <div className="label-section mb-2">Tin biển nhỏ</div>
            <p className="leading-relaxed text-gold-300/80">
              Phiên bản <span className="font-mono text-gold-500">0.3.0</span> · Phase 1.5
              <br />
              Vừa cập nhật Design System v2 với 4-corner bracket motif.
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center text-xs text-jade-700">
        <p>Mặc Hội Tiên Đồ — Mỗi quyết định, là một bước trên đại đạo.</p>
      </footer>
    </main>
  );
};

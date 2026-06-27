import { useState, useEffect } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { useGameStore, selectPlayer } from '@state/game-store';
import { hasSeenTutorial, markTutorialSeen } from './tutorial-state';

/**
 * Phase 9.7: "Lời Chào Từ Thiên Đạo" — Welcome modal lore-driven thay 4-step intro cũ.
 *
 * Tham khảo style từ docs/reference/google-canvas-rpg-reference.tsx — modal đơn giản,
 * nhập vai từ đầu, không phá vỡ atmosphere.
 *
 * - Chào nhân vật bằng tên thật
 * - Giải thích thế giới là "trang giấy trắng do người cầm bút"
 * - Hint đến Cẩm Nang nếu bối rối
 */
export const WelcomeOverlay = () => {
  const player = useGameStore(selectPlayer);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasSeenTutorial('welcome')) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    markTutorialSeen('welcome');
    setVisible(false);
  };

  if (!visible) return null;

  const playerName = player?.Name || 'Đạo Hữu';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.92)', backdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-xl animate-fade-in">
        <Bracketed className="rounded-md border bg-ink-700 p-7 sm:p-9" tone="spirit">
          {/* Header với họa tiết */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-1 w-24 items-center justify-center bg-gradient-to-r from-transparent via-spirit-400 to-transparent"></div>
            <h2 className="font-serif text-2xl font-bold tracking-wide text-spirit-300 sm:text-3xl"
                style={{ textShadow: '0 0 20px rgba(155,89,182,0.4)' }}>
              Lời Chào Từ Thiên Đạo
            </h2>
            <div className="mx-auto mt-4 flex h-1 w-24 items-center justify-center bg-gradient-to-r from-transparent via-spirit-400 to-transparent"></div>
          </div>

          {/* Body text */}
          <div className="space-y-4 text-[15px] leading-relaxed text-gold-200/90">
            <p>
              Chào mừng ngươi,{' '}
              <strong className="font-serif text-lg text-gold-100">{playerName}</strong>
              , đến với thế giới này.
            </p>
            <p>
              Không có một kịch bản nào được viết sẵn. Mọi nhân vật ngươi gặp, mọi nhiệm vụ ngươi nhận,
              mọi hiểm nguy ngươi đối mặt đều là{' '}
              <strong className="text-spirit-300">độc nhất vô nhị</strong>, được tạo ra dựa trên chính
              những hành động và lựa chọn của ngươi.
            </p>
            <p className="italic text-jade-300">
              Thế giới này là một trang giấy trắng, và ngươi chính là người cầm bút.
              Sáng tạo của ngươi là giới hạn duy nhất.
            </p>
          </div>

          {/* Hint */}
          <div className="mt-6 border-t border-gold-700/30 pt-4 space-y-2">
            <p className="flex items-start gap-2 text-[12.5px] text-jade-400">
              <span className="mt-0.5 text-gold-500">✦</span>
              <span>
                Nếu có lúc nào cảm thấy bối rối, hãy mở{' '}
                <strong className="text-gold-300">Cẩm Nang</strong> ở thanh chức năng để được
                hướng dẫn chi tiết.
              </span>
            </p>
            <p className="flex items-start gap-2 text-[12.5px] text-spirit-300">
              <span className="mt-0.5 text-spirit-400">🎁</span>
              <span>
                Quà tân thủ: nhập mã{' '}
                <strong className="font-mono tracking-widest text-gold-200">TANTHU</strong> ở
                cửa hàng 💎 (góc trên bên phải) để nhận{' '}
                <strong className="text-gold-300">500 Tiền Ngọc + 200 Lượt Hành Động</strong>{' '}
                — đủ trải nghiệm full features.
              </span>
            </p>
          </div>

          {/* Action */}
          <div className="mt-7 flex justify-center">
            <button
              onClick={close}
              className="rounded-md border border-spirit-400 bg-spirit-900/30 px-10 py-3 font-serif text-[14px] font-semibold tracking-widest text-spirit-200 shadow-[inset_0_0_15px_rgba(155,89,182,0.2)] transition-all hover:bg-spirit-800/40 hover:text-spirit-100 hover:shadow-[0_0_20px_rgba(155,89,182,0.4)]"
            >
              ĐÃ RÕ
            </button>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

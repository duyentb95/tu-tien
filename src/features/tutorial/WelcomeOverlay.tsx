import { useState, useEffect } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { hasSeenTutorial, markTutorialSeen } from './tutorial-state';

interface Step {
  title: string;
  icon: string;
  body: string;
  highlight?: string; // CSS selector để highlight UI element (visual nudge)
}

const WELCOME_STEPS: Step[] = [
  {
    icon: '◆',
    title: 'Chào mừng đến với Mặc Hội Tiên Đồ',
    body: 'Đây là game tu tiên text-based mở. Mỗi lượt ngươi đọc đoạn truyện AI kể, rồi chọn 1 trong 4 hành động — hoặc gõ hành động tự do.',
  },
  {
    icon: '✦',
    title: 'Cốt truyện sẽ được AI sinh ra',
    body: 'AI dựa vào background ngươi đã nhập (tính cách, mô tả, tiêu đề truyện) để dệt nên thế giới. Ngươi muốn làm đệ tử Vạn Cổ Tối Cường Tông hay tán tu cô độc — tự ngươi định.',
  },
  {
    icon: '☷',
    title: 'Theo dõi chỉ số ở thanh bên phải',
    body: 'Sinh mệnh, tu vi, linh thạch hiển thị real-time. Tu vi đầy → tự đột phá. Mỗi 10 cấp → độ kiếp lôi (đừng quên tích đan dược trước!).',
  },
  {
    icon: '◉',
    title: 'Khám phá 11 màn hình ở thanh navigation',
    body: 'Bản Đồ để di chuyển, Tông Môn để gia nhập, Linh Thú để khế ước, Động Phủ để xây nhà... Nhấn nút "?" bất cứ lúc nào để mở Cẩm Nang tra cứu chi tiết.',
  },
];

/**
 * Welcome overlay — 4 step intro cho first-time user.
 * Auto-trigger khi user mới tạo nhân vật (chưa từng xem welcome trước đó).
 */
export const WelcomeOverlay = () => {
  const [stepIdx, setStepIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay 500ms để screen vẽ xong rồi mới popup
    if (hasSeenTutorial('welcome')) return;
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    markTutorialSeen('welcome');
    setVisible(false);
  };

  const next = () => {
    if (stepIdx < WELCOME_STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      close();
    }
  };

  const skip = () => close();

  if (!visible) return null;
  const step = WELCOME_STEPS[stepIdx]!;
  const isLast = stepIdx === WELCOME_STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.88)', backdropFilter: 'blur(6px)' }}
    >
      <div className="w-full max-w-lg">
        <Bracketed className="rounded-md border bg-ink-700 p-6 sm:p-8" tone="gold">
          {/* Progress dots */}
          <div className="mb-5 flex items-center justify-center gap-2">
            {WELCOME_STEPS.map((_, i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === stepIdx ? 24 : 8,
                  background: i <= stepIdx ? 'var(--gold-500)' : 'rgba(205,164,94,.2)',
                }}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="mb-4 text-center">
            <div
              className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/40 text-3xl"
              style={{ background: 'rgba(205,164,94,.08)', color: 'var(--gold-300)' }}
            >
              {step.icon}
            </div>
            <div className="label-section">Bước {stepIdx + 1} / {WELCOME_STEPS.length}</div>
            <h2 className="mt-1 font-serif text-xl font-semibold text-gold-200">{step.title}</h2>
          </div>

          {/* Body */}
          <p className="mb-6 text-center text-[14px] leading-relaxed text-gold-300/90">
            {step.body}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={skip}
              className="text-[12px] text-jade-500 underline-offset-2 transition-colors hover:text-gold-300 hover:underline"
            >
              Bỏ qua hướng dẫn
            </button>
            <button onClick={next} className="btn-primary text-[13px]">
              {isLast ? 'Bắt đầu tu tiên ✦' : 'Tiếp theo →'}
            </button>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

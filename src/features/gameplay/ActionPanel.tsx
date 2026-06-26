import { useEffect, useState } from 'react';
import { Button } from '@shared/components/Button';
import { TextInput } from '@shared/components/FormField';
import { useKeyboard } from '@shared/hooks/useKeyboard';
import type { ActionChoice } from '@ai/parser';

interface Props {
  /** Backwards-compat: nếu chỉ truyền strings (mock cũ). UI mới ưu tiên `choices`. */
  actions: string[];
  /** Phase 9.1: structured actions với % + reward preview */
  choices?: ActionChoice[];
  disabled: boolean;
  onSelect: (action: string) => void;
}

/** Modal preview chi tiết action (Recommended pattern từ game reference) */
const ActionPreviewModal = ({
  choice,
  idx,
  onClose,
  onConfirm,
}: {
  choice: ActionChoice;
  idx: number;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  // Color hint theo success rate
  const rateColor =
    choice.successRate === undefined
      ? 'text-gold-300'
      : choice.successRate >= 80
      ? 'text-jade-400'
      : choice.successRate >= 50
      ? 'text-gold-300'
      : 'text-ember-400';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết hành động ${idx + 1}`}
    >
      <div
        className="panel-gold relative max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-lg font-bold text-gold-200">
          {choice.text}
        </h3>
        <div className="mt-4 h-px bg-gold-700/40" />

        {choice.successRate !== undefined && (
          <p className={`mt-4 font-body text-sm ${rateColor}`}>
            <span className="uppercase tracking-wider text-jade-500">Tỷ lệ thành công:</span>{' '}
            <span className="font-mono font-bold">{choice.successRate}%</span>
          </p>
        )}

        {choice.rewardPreview && (
          <p className="mt-3 font-body text-sm text-gold-300">
            <span className="uppercase tracking-wider text-jade-500">Hậu quả / Phần thưởng:</span>{' '}
            <span className="text-gold-200">{choice.rewardPreview}</span>
          </p>
        )}

        {choice.successRate === undefined && !choice.rewardPreview && (
          <p className="mt-3 italic text-jade-600">
            Thiên cơ chưa rõ — kết cục tùy duyên.
          </p>
        )}

        <div className="mt-6 flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button variant="primary" onClick={onConfirm} className="flex-1">
            Thực Hiện
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ActionPanel = ({ actions, choices, disabled, onSelect }: Props) => {
  const [customInput, setCustomInput] = useState('');
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  // Phase 9.4: Listen event từ QuickLookupModal để insert entity name vào input
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ name: string }>).detail;
      if (detail?.name) {
        setCustomInput((prev) => (prev ? `${prev} ${detail.name}` : detail.name));
      }
    };
    window.addEventListener('quick-lookup:insert', handler);
    return () => window.removeEventListener('quick-lookup:insert', handler);
  }, []);

  // Dùng choices nếu có (parsed structured), fallback strings
  const items: ActionChoice[] =
    choices && choices.length > 0
      ? choices
      : actions.map((text) => ({ text }));

  const submitCustom = () => {
    const val = customInput.trim();
    if (!val) return;
    onSelect(val);
    setCustomInput('');
  };

  // Hotkey 1-4 chọn nhanh action (skip nếu đang gõ input)
  useKeyboard(
    {
      Digit1: () => !disabled && items[0] && onSelect(items[0].text),
      Digit2: () => !disabled && items[1] && onSelect(items[1].text),
      Digit3: () => !disabled && items[2] && onSelect(items[2].text),
      Digit4: () => !disabled && items[3] && onSelect(items[3].text),
    },
    [items, disabled, onSelect],
  );

  const hasPreviewData = (c: ActionChoice) =>
    c.successRate !== undefined || !!c.rewardPreview;

  return (
    <div className="panel-gold mt-4 p-4" role="region" aria-label="Bảng hành động">
      {/* Preview modal */}
      {previewIdx !== null && items[previewIdx] && (
        <ActionPreviewModal
          choice={items[previewIdx]!}
          idx={previewIdx}
          onClose={() => setPreviewIdx(null)}
          onConfirm={() => {
            const c = items[previewIdx];
            setPreviewIdx(null);
            if (c) onSelect(c.text);
          }}
        />
      )}

      {/* 4 action choices */}
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((choice, idx) => {
          const showInfoBtn = hasPreviewData(choice);
          return (
            <div
              key={idx}
              className="group flex items-stretch gap-1 rounded-md border border-gold-700/30 bg-ink-700/60 transition hover:border-gold-500 hover:bg-ink-500/50"
            >
              <button
                onClick={() => onSelect(choice.text)}
                disabled={disabled}
                aria-label={`Lựa chọn ${idx + 1}: ${choice.text}. Phím tắt ${idx + 1}.`}
                className="flex flex-1 items-start gap-2 px-4 py-3 text-left text-sm text-gold-200 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ minHeight: 44 }}
              >
                <kbd className="font-mono text-xs text-gold-500 group-hover:text-gold-300">
                  {idx + 1}
                </kbd>
                <span className="flex-1 leading-snug">{choice.text}</span>
                {choice.successRate !== undefined && (
                  <span
                    className={`font-mono text-xs ${
                      choice.successRate >= 80
                        ? 'text-jade-400'
                        : choice.successRate >= 50
                        ? 'text-gold-400'
                        : 'text-ember-400'
                    }`}
                    aria-label={`Tỷ lệ thành công ${choice.successRate}%`}
                  >
                    {choice.successRate}%
                  </span>
                )}
              </button>
              {showInfoBtn && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewIdx(idx);
                  }}
                  disabled={disabled}
                  aria-label={`Xem chi tiết lựa chọn ${idx + 1}`}
                  className="flex w-9 items-center justify-center border-l border-gold-700/30 text-gold-500 transition hover:bg-gold-700/20 hover:text-gold-200 disabled:opacity-40"
                  title="Xem chi tiết"
                >
                  <span className="font-serif text-base">ⓘ</span>
                </button>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="col-span-2 py-3 text-center text-sm italic text-jade-600">
            Chờ thiên cơ khai mở lựa chọn…
          </p>
        )}
      </div>

      {/* Custom input */}
      <div className="flex gap-2 border-t border-gold-700/20 pt-3">
        <TextInput
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !disabled) submitCustom();
          }}
          placeholder="Hoặc nhập hành động tự do…"
          disabled={disabled}
          className="flex-1"
        />
        <Button
          variant="secondary"
          onClick={submitCustom}
          disabled={disabled || !customInput.trim()}
        >
          Hành ✦
        </Button>
      </div>
    </div>
  );
};

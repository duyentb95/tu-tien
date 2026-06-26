import { useState } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { useKeyboard } from '@shared/hooks/useKeyboard';
import { useGameStore } from '@state/game-store';
import { notify } from '@state/notifications';

/**
 * Custom Rules Modal — UI quản lý quy tắc tùy chỉnh inject vào AI prompt.
 *
 * Vd rules user có thể đặt:
 *   - "Không bao giờ giết NPC chính trong nguyên tác"
 *   - "Luôn xưng 'ngươi' khi nói với player"
 *   - "Không bịa thuật ngữ ngoài Mục Thần Ký"
 *   - "Hạn chế NPC nữ ép tình tiết tình cảm với player"
 */
interface Props {
  open: boolean;
  onClose: () => void;
}

const SUGGESTED_RULES = [
  'Không bao giờ giết NPC chính của nguyên tác',
  'Luôn xưng "ngươi" thay vì "bạn" khi nói với player',
  'Không tạo plot twist NPC phản bội player',
  'Giữ phong cách văn cổ phong, không dùng từ hiện đại',
  'Mỗi 5-7 turn phải có 1 đoạn tu luyện hoặc cơ duyên',
  'Không ép player vào harem nếu không tự chọn',
  'Tôn trọng mối quan hệ sư đồ — sư phụ không phản bội đệ tử',
];

export const CustomRulesModal = ({ open, onClose }: Props) => {
  const settings = useGameStore((s) => s.settings);
  const addCustomRule = useGameStore((s) => s.addCustomRule);
  const removeCustomRule = useGameStore((s) => s.removeCustomRule);
  const toggleCustomRule = useGameStore((s) => s.toggleCustomRule);
  const [input, setInput] = useState('');

  useKeyboard({ Escape: onClose }, [onClose], open);

  const rules = settings.customRules ?? [];

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (trimmed.length > 200) {
      notify.warn('Rule quá dài', 'Tối đa 200 ký tự');
      return;
    }
    addCustomRule(trimmed);
    setInput('');
    notify.success('Đã thêm quy tắc', trimmed.slice(0, 80));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-rules-title"
    >
      <div
        className="relative w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh' }}
      >
        <Bracketed className="rounded-md border bg-ink-700" tone="gold">
          <div className="flex flex-col" style={{ maxHeight: '85vh' }}>
            {/* Header */}
            <header className="flex items-start justify-between border-b border-gold-700/15 px-6 py-4">
              <div>
                <div className="label-section mb-1">Đạo Tâm · Quy Tắc</div>
                <h2 id="custom-rules-title" className="font-serif text-2xl font-bold uppercase tracking-wider text-gold-200">
                  Quy Tắc Tùy Chỉnh
                </h2>
                <p className="mt-1 text-[12px] italic text-jade-500">
                  Quy tắc ngươi đặt — AI sẽ tuân thủ tuyệt đối trong mọi narrative.
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
            </header>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '65vh' }}>
              {/* Input */}
              <div className="mb-5">
                <label className="label-gold mb-2 flex items-center gap-2">
                  <span style={{ color: 'var(--gold-500)' }}>▌</span>
                  Thêm quy tắc mới
                </label>
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                    placeholder="vd: Không bao giờ giết NPC chính"
                    maxLength={200}
                    className="flex-1 rounded-sm border border-gold-700/30 bg-ink-800 px-3 py-2 text-[13.5px] text-gold-100 placeholder:text-jade-700 focus:border-gold-500 focus:outline-none"
                  />
                  <button onClick={handleAdd} disabled={!input.trim()} className="btn-primary text-[13px]">
                    Thêm
                  </button>
                </div>
                <p className="mt-1 text-[11px] italic text-jade-500">
                  Tối đa 200 ký tự. Quy tắc sẽ inject vào mọi prompt AI.
                </p>
              </div>

              {/* Active rules */}
              <div className="mb-5">
                <div className="label-gold mb-2">
                  Quy tắc đang áp dụng ({rules.filter((r) => r.enabled).length} / {rules.length})
                </div>
                {rules.length === 0 ? (
                  <p className="rounded-sm border border-jade-700/30 bg-jade-700/5 p-4 text-center text-[12.5px] italic text-jade-500">
                    Chưa có quy tắc nào. Thêm 1 rule hoặc dùng gợi ý dưới.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {rules.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-start gap-3 rounded-sm border bg-ink-800/40 p-3"
                        style={{
                          borderColor: r.enabled ? 'rgba(127,174,110,.3)' : 'rgba(205,164,94,.1)',
                          opacity: r.enabled ? 1 : 0.5,
                        }}
                      >
                        <button
                          type="button"
                          role="switch"
                          aria-checked={r.enabled}
                          onClick={() => toggleCustomRule(r.id)}
                          className="relative mt-0.5 inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors"
                          style={{
                            background: r.enabled ? 'var(--leaf-500)' : 'rgba(40,50,40,.6)',
                          }}
                        >
                          <span
                            className="inline-block h-4 w-4 transform rounded-full bg-gold-200 transition-transform"
                            style={{ transform: r.enabled ? 'translateX(18px)' : 'translateX(2px)' }}
                          />
                        </button>
                        <p className="flex-1 text-[13px] text-gold-300">{r.rule}</p>
                        <button
                          onClick={() => removeCustomRule(r.id)}
                          className="flex-shrink-0 text-[11px] text-ember-300 transition-colors hover:text-ember-200"
                          title="Xóa rule"
                        >
                          ⊗ Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div>
                <div className="label-gold mb-2">Gợi ý quy tắc phổ biến</div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_RULES.filter((s) => !rules.some((r) => r.rule === s)).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        addCustomRule(s);
                        notify.success('Đã thêm', s.slice(0, 60));
                      }}
                      className="rounded-sm border border-gold-700/30 bg-gold-500/5 px-2.5 py-1 text-[11.5px] text-gold-300 transition-colors hover:bg-gold-500/15 hover:text-gold-100"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <footer className="border-t border-gold-700/15 px-6 py-3 text-center text-[11px] italic text-jade-500">
              💡 Rules được inject vào prompt mỗi turn. Disable rule = AI bỏ qua tạm thời, không xóa.
            </footer>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

import { useState, useMemo } from 'react';
import { useGameStore } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { FAN_FIC_SEEDS, matchSeed, type FanFicSeedExample } from '@data/fan-fic-seeds';
import { notify } from '@state/notifications';

/**
 * AdventureModeScreen — chọn chế độ trước khi setup nhân vật.
 *
 * Pattern theo prototype: bỏ preset cứng, dùng wizard 3 fields + AI analyzer.
 *
 * Flow:
 *   Initial → AdventureMode (chọn mode)
 *     ├── Default → Setup ngay
 *     └── FanFic → Wizard (3 fields) → AI Phân Tích → Setup (đã hydrate)
 */

type View = 'mode-pick' | 'fanfic-wizard';

export const AdventureModeScreen = () => {
  const setStage = useGameStore((s) => s.setStage);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const analyzeFanFic = useGameStore((s) => s.analyzeFanFic);
  const isAiThinking = useGameStore((s) => s.isAiThinking);

  const [view, setView] = useState<View>('mode-pick');
  const [nsfwOn, setNsfwOn] = useState(settings.isNsfwMode ?? false);

  // Fan-fic wizard form state
  const [originalWork, setOriginalWork] = useState('');
  const [characterType, setCharacterType] = useState<'incarnate' | 'newborn'>('incarnate');
  const [characterName, setCharacterName] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');

  // Autocomplete suggestions
  const suggestions = useMemo(() => matchSeed(originalWork), [originalWork]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const matchedSeed = useMemo(
    () => FAN_FIC_SEEDS.find((s) => s.title.toLowerCase() === originalWork.trim().toLowerCase()),
    [originalWork],
  );

  const handleDefaultMode = () => {
    updateSettings({
      storyTitle: '',
      isFanFictionMode: false,
      isNsfwMode: nsfwOn,
      allowNsfw: nsfwOn,
    });
    setStage('setup');
  };

  const handleAnalyze = async () => {
    if (!originalWork.trim() || !characterName.trim()) {
      notify.warn('Thiếu thông tin', 'Cần điền tên tác phẩm + tên nhân vật');
      return;
    }
    try {
      updateSettings({ isNsfwMode: nsfwOn, allowNsfw: nsfwOn });
      await analyzeFanFic({
        originalWork: originalWork.trim(),
        characterType,
        characterName: characterName.trim(),
        characterDescription: characterDescription.trim() || undefined,
      });
      notify.epic('Phân tích thành công', `Đã hydrate setting cho "${originalWork}"`);
      setStage('setup');
    } catch {
      // Error đã được lưu vào lastError + notify từ store
    }
  };

  const pickSuggestion = (s: FanFicSeedExample) => {
    setOriginalWork(s.title);
    setShowSuggestions(false);
    // Auto-fill character name nếu chưa có
    if (!characterName && s.popularChars && s.popularChars.length > 0) {
      setCharacterName(s.popularChars[0]!);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Bracketed
          tone="gold"
          className="rounded-md border bg-gradient-to-b from-ink-750 to-ink-900 p-6 sm:p-10 anim-rise"
          inset={9}
        >
          {view === 'mode-pick' && (
            <>
              {/* Header */}
              <div className="mb-7 text-center">
                <h1
                  className="font-serif text-[28px] font-bold leading-tight text-gold-200 sm:text-[36px]"
                  style={{ letterSpacing: '0.04em', textShadow: '0 0 22px rgba(205,164,94,.32)' }}
                >
                  Chọn Chế Độ Phiêu Lưu
                </h1>
                <p className="mt-3 font-serif text-[13px] italic text-gold-300/80 sm:text-[14px]">
                  Mỗi lựa chọn sẽ dẫn đến một hành trình độc nhất.
                </p>
                <div className="mx-auto mt-4 h-px w-24 bg-gold-700/40" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ModeCard
                  title="Phiêu Lưu Mặc Định"
                  description="Tự do sáng tạo một thế giới và nhân vật hoàn toàn mới của riêng bạn."
                  onClick={handleDefaultMode}
                />
                <ModeCard
                  title="Phiêu Lưu Đồng Nhân"
                  description="Hóa thân thành một nhân vật trong thế giới truyện/phim bạn yêu thích. AI sẽ phân tích nguyên tác."
                  onClick={() => setView('fanfic-wizard')}
                />
              </div>

              {/* NSFW toggle */}
              <div className="mt-6 border-t border-gold-700/15 pt-5">
                <label
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-blood-500/30 bg-blood-500/5 p-3 transition-colors hover:bg-blood-500/10"
                  style={{ minHeight: 56 }}
                >
                  <Toggle checked={nsfwOn} onChange={setNsfwOn} />
                  <div className="flex-1">
                    <div className="font-serif text-[14.5px] font-semibold text-ember-200">
                      Phá bỏ rào cản
                    </div>
                    <div className="text-[12px] text-jade-400">
                      Cho phép tình tiết vượt quá thuần phong mỹ tục. Xác nhận đủ 18 tuổi.
                    </div>
                  </div>
                </label>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setStage('initial')}
                  className="btn-jade text-[13px]"
                  style={{ minWidth: 180 }}
                >
                  ← Quay về Trang Chủ
                </button>
              </div>
            </>
          )}

          {view === 'fanfic-wizard' && (
            <>
              {/* Header */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl" style={{ color: 'var(--gold-500)' }}>◭</span>
                  <div>
                    <h1 className="font-serif text-[22px] font-bold uppercase tracking-wider text-gold-200 sm:text-[26px]">
                      Thiết Lập Đồng Nhân
                    </h1>
                    <p className="mt-1 text-[12.5px] italic text-jade-400">
                      Hãy điền thông tin về thế giới gốc để AI truy xuất tàng thư.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setView('mode-pick')}
                  disabled={isAiThinking}
                  className="btn-jade text-[12px]"
                >
                  ← Trở lại
                </button>
              </div>
              <div className="mb-5 h-px bg-gold-700/20" />

              {/* Field 1: Tên tác phẩm gốc */}
              <div className="mb-5">
                <label className="label-gold mb-2 flex items-center gap-2">
                  <span style={{ color: 'var(--gold-500)' }}>▌</span>
                  Tên Tác Phẩm Gốc
                </label>
                <div className="relative">
                  <input
                    value={originalWork}
                    onChange={(e) => { setOriginalWork(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    disabled={isAiThinking}
                    placeholder="vd: Mục Thần Ký, Phàm Nhân Tu Tiên..."
                    className="w-full rounded-sm border border-gold-700/30 bg-ink-800 px-3 py-2.5 text-[14px] text-gold-100 placeholder:text-jade-700 focus:border-gold-500 focus:outline-none"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-sm border border-gold-700/30 bg-ink-800 shadow-lg">
                      {suggestions.map((s) => (
                        <button
                          key={s.title}
                          onMouseDown={() => pickSuggestion(s)}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-[12.5px] text-gold-300 transition-colors hover:bg-gold-500/10 hover:text-gold-100"
                        >
                          <span>{s.title}</span>
                          <span className="text-[10px] italic text-jade-500">{s.author}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1.5 text-[11.5px] italic text-jade-500">
                  AI sẽ sử dụng tên này để truy xuất kiến thức về thế giới gốc.
                </p>
              </div>

              {/* Field 2: Kiểu nhân vật */}
              <div className="mb-5">
                <label className="label-gold mb-2 flex items-center gap-2">
                  <span style={{ color: 'var(--gold-500)' }}>▌</span>
                  Kiểu Nhân Vật Chính
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <RadioCard
                    label="Hóa Thân"
                    sublabel="Nhân vật có sẵn trong nguyên tác"
                    checked={characterType === 'incarnate'}
                    onClick={() => setCharacterType('incarnate')}
                    disabled={isAiThinking}
                  />
                  <RadioCard
                    label="Khởi Sinh"
                    sublabel="Nhân vật mới do bạn tự tạo"
                    checked={characterType === 'newborn'}
                    onClick={() => setCharacterType('newborn')}
                    disabled={isAiThinking}
                  />
                </div>
              </div>

              {/* Field 3: Tên nhân vật */}
              <div className="mb-5">
                <label className="label-gold mb-2 flex items-center gap-2">
                  <span style={{ color: 'var(--gold-500)' }}>▌</span>
                  {characterType === 'incarnate' ? 'Tên Nhân Vật Hóa Thân' : 'Tên Nhân Vật Khởi Sinh'}
                </label>
                <input
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  disabled={isAiThinking}
                  placeholder={characterType === 'incarnate' ? 'vd: Tần Mục, Hàn Lập, Tiêu Viêm...' : 'Đặt tên nhân vật mới của ngươi'}
                  className="w-full rounded-sm border border-gold-700/30 bg-ink-800 px-3 py-2.5 text-[14px] text-gold-100 placeholder:text-jade-700 focus:border-gold-500 focus:outline-none"
                />
                {matchedSeed && matchedSeed.popularChars && characterType === 'incarnate' && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="text-[11px] italic text-jade-500">Gợi ý:</span>
                    {matchedSeed.popularChars.map((name) => (
                      <button
                        key={name}
                        onClick={() => setCharacterName(name)}
                        disabled={isAiThinking}
                        className="rounded-sm border border-gold-700/30 bg-gold-500/5 px-2 py-0.5 text-[11px] text-gold-300 transition-colors hover:bg-gold-500/15"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Field 4 (optional, only for newborn): description */}
              {characterType === 'newborn' && (
                <div className="mb-5">
                  <label className="label-gold mb-2 flex items-center gap-2">
                    <span style={{ color: 'var(--gold-500)' }}>▌</span>
                    Mô Tả Nhân Vật (Tùy chọn)
                  </label>
                  <textarea
                    value={characterDescription}
                    onChange={(e) => setCharacterDescription(e.target.value)}
                    disabled={isAiThinking}
                    rows={3}
                    placeholder="vd: Đệ tử tạp dịch một phái không tên, vô tình nhặt được tàn quyển công pháp..."
                    className="w-full resize-none rounded-sm border border-gold-700/30 bg-ink-800 px-3 py-2.5 text-[13.5px] text-gold-100 placeholder:text-jade-700 focus:border-gold-500 focus:outline-none"
                  />
                </div>
              )}

              {/* NSFW toggle (compact) */}
              <div className="mb-5">
                <label
                  className="flex cursor-pointer items-center gap-3 rounded-sm border border-blood-500/30 bg-blood-500/5 px-3 py-2 transition-colors hover:bg-blood-500/10"
                >
                  <Toggle checked={nsfwOn} onChange={setNsfwOn} />
                  <span className="text-[12.5px] text-ember-200">
                    Phá bỏ rào cản (18+) — tình tiết vượt quá thuần phong mỹ tục
                  </span>
                </label>
              </div>

              {/* Submit */}
              <div className="mt-6 border-t border-gold-700/15 pt-5">
                <button
                  onClick={handleAnalyze}
                  disabled={isAiThinking || !originalWork.trim() || !characterName.trim()}
                  className="btn-primary w-full text-[15px]"
                  style={{ minHeight: 52 }}
                >
                  {isAiThinking ? (
                    <>
                      <span className="anim-pulse mr-2">◯</span>
                      Đang Phân Tích...
                    </>
                  ) : (
                    <>✦ Phân Tích & Tiếp Tục</>
                  )}
                </button>
                {isAiThinking && (
                  <p className="mt-3 text-center text-[12px] italic text-jade-400">
                    AI đang đọc và chuyển hóa thông tin cốt truyện gốc... Vui lòng đợi.
                  </p>
                )}
              </div>
            </>
          )}
        </Bracketed>
      </div>
    </main>
  );
};

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

interface ModeCardProps {
  title: string;
  description: string;
  onClick: () => void;
}
const ModeCard = ({ title, description, onClick }: ModeCardProps) => (
  <button
    onClick={onClick}
    className="group flex flex-col gap-3 rounded-md border border-gold-700/30 bg-ink-700/60 p-5 text-left transition-all hover:border-gold-500 hover:bg-ink-500/50"
    style={{ minHeight: 160 }}
  >
    <h3 className="font-serif text-[18px] font-semibold text-gold-200 transition-colors group-hover:text-gold-100">
      {title}
    </h3>
    <p className="text-[13px] leading-relaxed text-jade-400">{description}</p>
    <div className="mt-auto text-[12px] text-gold-500 opacity-0 transition-opacity group-hover:opacity-100">
      Chọn →
    </div>
  </button>
);

interface RadioCardProps {
  label: string;
  sublabel: string;
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
}
const RadioCard = ({ label, sublabel, checked, onClick, disabled }: RadioCardProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-start gap-3 rounded-sm border bg-ink-800 p-3 text-left transition-colors disabled:opacity-50"
    style={{
      borderColor: checked ? 'var(--gold-500)' : 'rgba(205,164,94,.2)',
      background: checked ? 'rgba(205,164,94,.05)' : 'var(--ink-800)',
      minHeight: 56,
    }}
  >
    <span
      className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border"
      style={{
        borderColor: checked ? 'var(--gold-500)' : 'rgba(205,164,94,.4)',
      }}
    >
      {checked && (
        <span
          className="block h-2 w-2 rounded-full"
          style={{ background: 'var(--gold-500)' }}
        />
      )}
    </span>
    <div className="min-w-0 flex-1">
      <div className="font-serif text-[13.5px] font-medium text-gold-200">{label}</div>
      <div className="text-[11.5px] text-jade-400">{sublabel}</div>
    </div>
  </button>
);

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}
const Toggle = ({ checked, onChange }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors"
    style={{
      background: checked ? 'var(--leaf-500)' : 'rgba(40,50,40,.6)',
      border: '1px solid rgba(205,164,94,.2)',
    }}
  >
    <span
      className="inline-block h-5 w-5 transform rounded-full bg-gold-200 transition-transform"
      style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
    />
  </button>
);

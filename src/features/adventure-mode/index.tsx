import { useState } from 'react';
import { useGameStore } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { FAN_FIC_PRESETS, type FanFicPreset } from '@data/fan-fic-presets';

/**
 * AdventureModeScreen — chọn chế độ trước khi vào setup nhân vật.
 *
 * Flow:
 *   Initial → click "Khởi Đầu Mới" → AdventureMode → Setup → Playing
 *
 * 2 chế độ:
 *   - Mặc định: tự sáng tạo universe
 *   - Đồng nhân: chọn 1 trong 7 preset (Mục Thần Ký, Đấu Phá...) → inject lore vào prompt
 *
 * Toggle "Phá bỏ rào cản" = NSFW 18+ mode.
 */

export const AdventureModeScreen = () => {
  const setStage = useGameStore((s) => s.setStage);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const [mode, setMode] = useState<'default' | 'fanfic' | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<FanFicPreset | null>(null);
  const [nsfwOn, setNsfwOn] = useState(settings.isNsfwMode ?? false);

  // Loại bỏ preset "tự do" khỏi list đồng nhân (vì đã là option Mặc Định)
  const fanFicOptions = FAN_FIC_PRESETS.filter((p) => p.id !== 'tieu-dao');

  const handleStart = (presetId: string | null) => {
    const preset = presetId ? FAN_FIC_PRESETS.find((p) => p.id === presetId) : null;
    updateSettings({
      storyTitle: preset ? preset.title : '',
      isNsfwMode: nsfwOn,
      allowNsfw: nsfwOn,
      fanFicPresetId: preset?.id ?? null,
    });
    setStage('setup');
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Bracketed
          tone="gold"
          className="rounded-md border bg-gradient-to-b from-ink-750 to-ink-900 p-6 sm:p-10 anim-rise"
          inset={9}
        >
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

          {/* 2 cards mode select */}
          {mode === null && (
            <div className="grid gap-4 sm:grid-cols-2">
              <ModeCard
                title="Phiêu Lưu Mặc Định"
                description="Tự do sáng tạo một thế giới và nhân vật hoàn toàn mới của riêng bạn."
                onClick={() => handleStart(null)}
              />
              <ModeCard
                title="Phiêu Lưu Đồng Nhân"
                description="Hóa thân thành một nhân vật trong thế giới truyện/phim bạn yêu thích."
                onClick={() => setMode('fanfic')}
              />
            </div>
          )}

          {/* Fan-fic preset list */}
          {mode === 'fanfic' && (
            <div className="space-y-2">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-serif text-[16px] text-gold-200">Chọn Thế Giới Đồng Nhân</h2>
                <button
                  onClick={() => { setMode(null); setSelectedPreset(null); }}
                  className="text-[12px] text-jade-400 transition-colors hover:text-gold-300"
                >
                  ← Đổi chế độ
                </button>
              </div>

              {fanFicOptions.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  expanded={selectedPreset?.id === preset.id}
                  onToggle={() => setSelectedPreset(selectedPreset?.id === preset.id ? null : preset)}
                  onSelect={() => handleStart(preset.id)}
                />
              ))}
            </div>
          )}

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

          {/* Back button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setStage('initial')}
              className="btn-jade text-[13px]"
              style={{ minWidth: 180 }}
            >
              ← Quay về Trang Chủ
            </button>
          </div>
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

interface PresetCardProps {
  preset: FanFicPreset;
  expanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}
const PresetCard = ({ preset, expanded, onToggle, onSelect }: PresetCardProps) => (
  <div
    className="rounded-md border bg-ink-700/40 transition-colors hover:bg-ink-700/70"
    style={{ borderColor: expanded ? 'var(--gold-500)' : 'rgba(205,164,94,.2)' }}
  >
    <button
      onClick={onToggle}
      className="flex w-full items-start justify-between gap-3 p-4 text-left"
      style={{ minHeight: 56 }}
    >
      <div className="min-w-0 flex-1">
        <h4 className="font-serif text-[15px] font-medium text-gold-200">{preset.title}</h4>
        <p className="mt-0.5 text-[11.5px] italic text-jade-500">
          tác giả: {preset.author}
          {preset.protagonistName && (
            <> · main: <span className="text-gold-300">{preset.protagonistName}</span></>
          )}
        </p>
      </div>
      <span
        aria-hidden
        className="text-[14px] text-gold-500 transition-transform"
        style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
      >
        ›
      </span>
    </button>

    {expanded && (
      <div className="border-t border-gold-700/15 px-4 py-3">
        {/* Lore preview — first 3 paragraphs */}
        <div className="mb-3 max-h-48 overflow-y-auto text-[12.5px] leading-relaxed text-gold-300/90">
          {preset.lore.split('\n\n').slice(0, 2).map((para, i) => (
            <p key={i} className="mb-2">{renderInlineBold(para)}</p>
          ))}
          {preset.lore.split('\n\n').length > 2 && (
            <p className="italic text-jade-500">... (đầy đủ lore sẽ inject vào AI prompt khi chơi)</p>
          )}
        </div>

        {preset.keyTerms && preset.keyTerms.length > 0 && (
          <div className="mb-3">
            <div className="label-section mb-1">Key terms</div>
            <div className="flex flex-wrap gap-1.5">
              {preset.keyTerms.slice(0, 8).map((t) => (
                <span
                  key={t}
                  className="rounded-sm border border-gold-700/30 bg-gold-500/5 px-2 py-0.5 text-[11px] text-gold-300"
                >
                  {t}
                </span>
              ))}
              {preset.keyTerms.length > 8 && (
                <span className="text-[11px] italic text-jade-500">
                  +{preset.keyTerms.length - 8} thêm
                </span>
              )}
            </div>
          </div>
        )}

        <button onClick={onSelect} className="btn-primary w-full text-[13px]">
          ✦ Bắt đầu trong "{preset.title}"
        </button>
      </div>
    )}
  </div>
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

const renderInlineBold = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i} className="text-gold-100">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
};

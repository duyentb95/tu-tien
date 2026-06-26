import { useState } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { generateWorldGenesis } from '@ai/world-genesis-service';
import type {
  WorldTone,
  WorldCosmology,
  WorldMagicDensity,
  WorldThemeTag,
  WorldGenesisResult,
} from '@ai/prompts/world-genesis';
import { notify } from '@state/notifications';

interface Props {
  onCancel: () => void;
  /** Khi user xác nhận thế giới đã sinh → callback nhận result để parent hydrate setting */
  onConfirm: (result: WorldGenesisResult) => void;
}

const TONE_OPTIONS: WorldTone[] = ['tươi sáng', 'đen tối', 'khôi hài', 'bi tráng', 'ấm áp', 'lạnh lẽo', 'huyền bí'];
const COSMOLOGY_OPTIONS: Array<{ value: WorldCosmology; label: string; sub: string }> = [
  { value: 'don-canh', label: 'Đơn Cảnh', sub: '5-7 cảnh giới, 1 chiều không gian' },
  { value: 'song-canh', label: 'Song Cảnh', sub: '8-10 cảnh, Phàm + Tiên hoặc Dương + Âm' },
  { value: 'cuu-trung', label: 'Cửu Trùng', sub: '9-13 cảnh, 9 tầng trời / 9 vực' },
  { value: 'multiverse', label: 'Multiverse', sub: '12-15 cảnh, nhiều vũ trụ song song' },
];
const MAGIC_OPTIONS: Array<{ value: WorldMagicDensity; label: string; sub: string }> = [
  { value: 'low-magic', label: 'Low Magic', sub: 'Tu sĩ hiếm, mỗi cảnh giới là kỳ tích' },
  { value: 'high-magic', label: 'High Magic', sub: 'Tu sĩ phổ biến, sect linh tinh' },
  { value: 'xenobiology', label: 'Xenobiology', sub: 'Đa chủng tộc (yêu/ma/tiên), mỗi tộc hệ tu khác' },
];
const THEME_OPTIONS: Array<{ value: WorldThemeTag; label: string }> = [
  { value: 'than-thoai-dong-phuong', label: 'Thần thoại Đông phương' },
  { value: 'mat-the', label: 'Mạt thế' },
  { value: 'di-gioi-xuyen-khong', label: 'Dị giới xuyên không' },
  { value: 'van-minh-co-dai', label: 'Văn minh cổ đại' },
  { value: 'hien-dai-tu-chan', label: 'Hiện đại tu chân' },
  { value: 'vo-hiep-thuan', label: 'Võ hiệp thuần' },
  { value: 'sci-fi-cyberpunk', label: 'Sci-fi cyberpunk' },
  { value: 'kiem-tien-thuan', label: 'Kiếm tiên thuần' },
];

type Step = 'tone' | 'cosmology' | 'magic' | 'themes' | 'preview';

/**
 * Phase 13.1D: World Genesis Wizard — 4-step + preview.
 *
 * Khi user chọn "Tự Do Sáng Tạo" trong AdventureMode, mở wizard này.
 * Sau khi sinh xong, hiển thị preview để user "Chốt" hoặc "Re-roll".
 */
export const WorldGenesisWizard = ({ onCancel, onConfirm }: Props) => {
  const [step, setStep] = useState<Step>('tone');
  const [tone, setTone] = useState<WorldTone[]>(['tươi sáng']);
  const [cosmology, setCosmology] = useState<WorldCosmology>('cuu-trung');
  const [magicDensity, setMagicDensity] = useState<WorldMagicDensity>('high-magic');
  const [themes, setThemes] = useState<WorldThemeTag[]>([]);
  const [inspirationKeyword, setInspirationKeyword] = useState('');

  const [genesisResult, setGenesisResult] = useState<WorldGenesisResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleTone = (t: WorldTone) => {
    setTone((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };
  const toggleTheme = (t: WorldThemeTag) => {
    setThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const generate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateWorldGenesis({
        tone,
        cosmology,
        magicDensity,
        themes,
        ...(inspirationKeyword.trim() ? { inspirationKeyword: inspirationKeyword.trim() } : {}),
      });
      setGenesisResult(result);
      setStep('preview');
    } catch (err) {
      notify.warn('Sinh thế giới thất bại', err instanceof Error ? err.message : String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Bracketed tone="spirit" className="rounded-md border bg-ink-700 p-5 sm:p-7">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-spirit-200 sm:text-2xl">
            <span aria-hidden>✦</span> Sáng Thế Wizard
          </h2>
          <p className="mt-1 text-[12px] italic text-jade-400">
            Tự tạo thế giới tu tiên độc nhất — AI sẽ dệt theo lựa chọn của ngươi.
          </p>
        </div>
        <button
          onClick={onCancel}
          disabled={isGenerating}
          className="text-xs font-bold uppercase tracking-widest text-jade-500 hover:text-gold-300 disabled:opacity-50"
        >
          ← Trở lại
        </button>
      </div>

      {/* Step indicator */}
      <div className="mb-5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
        {(['tone', 'cosmology', 'magic', 'themes', 'preview'] as Step[]).map((s, i) => {
          const active = s === step;
          const passed = ['tone', 'cosmology', 'magic', 'themes', 'preview'].indexOf(step) > i;
          return (
            <div key={s} className="flex items-center gap-1">
              <span
                className={`rounded-full px-2 py-0.5 ${
                  active ? 'bg-spirit-500 text-ink-900' : passed ? 'bg-spirit-900/40 text-spirit-300' : 'text-jade-700'
                }`}
              >
                {i + 1}. {s === 'tone' ? 'Tone' : s === 'cosmology' ? 'Cosmology' : s === 'magic' ? 'Magic' : s === 'themes' ? 'Themes' : 'Preview'}
              </span>
              {i < 4 && <span className="text-jade-700">→</span>}
            </div>
          );
        })}
      </div>

      {/* Step 1: Tone */}
      {step === 'tone' && (
        <div>
          <h3 className="label-gold mb-3">Không Khí Thế Giới (chọn nhiều)</h3>
          <div className="mb-5 flex flex-wrap gap-2">
            {TONE_OPTIONS.map((t) => {
              const active = tone.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTone(t)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                    active
                      ? 'border-spirit-400 bg-spirit-900/40 text-spirit-200'
                      : 'border-gold-700/30 bg-ink-800 text-jade-400 hover:border-spirit-500/50 hover:text-spirit-300'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setStep('cosmology')}
            disabled={tone.length === 0}
            className="btn-primary w-full"
          >
            Tiếp → Cosmology
          </button>
        </div>
      )}

      {/* Step 2: Cosmology */}
      {step === 'cosmology' && (
        <div>
          <h3 className="label-gold mb-3">Hình Dạng Cosmology</h3>
          <div className="mb-5 grid gap-2 sm:grid-cols-2">
            {COSMOLOGY_OPTIONS.map((o) => {
              const active = cosmology === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => setCosmology(o.value)}
                  className={`rounded border px-3 py-3 text-left transition-colors ${
                    active
                      ? 'border-spirit-400 bg-spirit-900/30'
                      : 'border-gold-700/30 bg-ink-800 hover:border-spirit-500/50'
                  }`}
                >
                  <div className={`font-serif text-[14px] font-bold ${active ? 'text-spirit-200' : 'text-gold-200'}`}>
                    {o.label}
                  </div>
                  <div className="mt-1 text-[11px] text-jade-400">{o.sub}</div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('tone')} className="btn-jade flex-1">← Quay</button>
            <button onClick={() => setStep('magic')} className="btn-primary flex-1">Tiếp → Magic</button>
          </div>
        </div>
      )}

      {/* Step 3: Magic density */}
      {step === 'magic' && (
        <div>
          <h3 className="label-gold mb-3">Mật Độ Pháp Thuật</h3>
          <div className="mb-5 grid gap-2">
            {MAGIC_OPTIONS.map((o) => {
              const active = magicDensity === o.value;
              return (
                <button
                  key={o.value}
                  onClick={() => setMagicDensity(o.value)}
                  className={`rounded border px-3 py-3 text-left transition-colors ${
                    active
                      ? 'border-spirit-400 bg-spirit-900/30'
                      : 'border-gold-700/30 bg-ink-800 hover:border-spirit-500/50'
                  }`}
                >
                  <div className={`font-serif text-[14px] font-bold ${active ? 'text-spirit-200' : 'text-gold-200'}`}>
                    {o.label}
                  </div>
                  <div className="mt-1 text-[11px] text-jade-400">{o.sub}</div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('cosmology')} className="btn-jade flex-1">← Quay</button>
            <button onClick={() => setStep('themes')} className="btn-primary flex-1">Tiếp → Themes</button>
          </div>
        </div>
      )}

      {/* Step 4: Themes + Inspiration */}
      {step === 'themes' && (
        <div>
          <h3 className="label-gold mb-3">Theme Tags (chọn 1-3)</h3>
          <div className="mb-4 flex flex-wrap gap-2">
            {THEME_OPTIONS.map((t) => {
              const active = themes.includes(t.value);
              return (
                <button
                  key={t.value}
                  onClick={() => toggleTheme(t.value)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                    active
                      ? 'border-spirit-400 bg-spirit-900/40 text-spirit-200'
                      : 'border-gold-700/30 bg-ink-800 text-jade-400 hover:border-spirit-500/50 hover:text-spirit-300'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <label className="label-gold mb-2 block">Inspiration Keyword (tùy chọn)</label>
          <input
            value={inspirationKeyword}
            onChange={(e) => setInspirationKeyword(e.target.value)}
            placeholder="vd: 'thiên không hư vô', 'cửu long đoạt đế', 'long mạch hỗn nguyên'..."
            disabled={isGenerating}
            className="mb-5 w-full rounded-sm border border-gold-700/30 bg-ink-800 px-3 py-2 text-[13px] text-gold-100 placeholder:text-jade-700 focus:border-spirit-500 focus:outline-none"
          />

          <div className="flex gap-2">
            <button onClick={() => setStep('magic')} className="btn-jade flex-1" disabled={isGenerating}>← Quay</button>
            <button
              onClick={generate}
              disabled={isGenerating}
              className="btn-primary flex-1"
              style={{ background: 'linear-gradient(180deg, var(--spirit-400), var(--spirit-600))' }}
            >
              {isGenerating ? <><span className="anim-pulse mr-2">◯</span> Đang Sáng Thế...</> : '✦ Sinh Thế Giới'}
            </button>
          </div>
          {isGenerating && (
            <p className="mt-3 text-center text-[12px] italic text-spirit-400">
              Thiên Đạo đang dệt nên một thế giới mới chỉ cho ngươi...
            </p>
          )}
        </div>
      )}

      {/* Step 5: Preview */}
      {step === 'preview' && genesisResult && (
        <div>
          <div className="mb-4 rounded border border-spirit-500/40 bg-spirit-900/20 p-4">
            <h3 className="font-serif text-xl font-bold text-spirit-200">{genesisResult.worldName}</h3>
            <p className="mt-1 italic text-spirit-300">{genesisResult.tagline}</p>
            <p className="mt-3 text-[13px] leading-relaxed text-gold-200/90">{genesisResult.setting}</p>
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PreviewBox label="Cosmology" body={genesisResult.cosmologyDescription} />
            <PreviewBox label="Realms" body={genesisResult.realmList.join(' → ')} />
            <PreviewBox label={`${genesisResult.sects.length} Sects`} body={genesisResult.sects.map((s) => `• ${s.name} (${s.alignment})`).join('\n')} mono />
            <PreviewBox label={`${genesisResult.locations.length} Locations`} body={genesisResult.locations.map((l) => `• ${l.name}`).join('\n')} mono />
            <PreviewBox label={`${genesisResult.npcs.length} NPCs khởi đầu`} body={genesisResult.npcs.map((n) => `• ${n.name} — ${n.role}`).join('\n')} mono />
            <PreviewBox label={`${genesisResult.items.length} Items signature`} body={genesisResult.items.map((i) => `• ${i.name} [${i.rarity}]`).join('\n')} mono />
          </div>

          <div className="mb-4 rounded border border-gold-700/30 bg-ink-900/40 p-3">
            <div className="label-section mb-1">Tiền tệ + thuật ngữ</div>
            <div className="text-[12px] text-jade-300">
              <strong className="text-gold-200">{genesisResult.currencyName}</strong> · {genesisResult.terminology.map((t) => t.term).join(' · ')}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setGenesisResult(null); setStep('themes'); }}
              className="btn-jade flex-1"
            >
              ↻ Re-roll
            </button>
            <button
              onClick={() => onConfirm(genesisResult)}
              className="btn-primary flex-1"
              style={{ background: 'linear-gradient(180deg, var(--gold-400), var(--gold-600))' }}
            >
              ✦ Chốt Thế Giới
            </button>
          </div>
        </div>
      )}
    </Bracketed>
  );
};

const PreviewBox = ({ label, body, mono }: { label: string; body: string; mono?: boolean }) => (
  <div className="rounded border border-gold-700/30 bg-ink-900/40 p-3">
    <div className="label-section mb-1">{label}</div>
    <div className={`text-[12px] leading-relaxed text-jade-300 ${mono ? 'whitespace-pre-line font-mono' : ''}`}>{body}</div>
  </div>
);

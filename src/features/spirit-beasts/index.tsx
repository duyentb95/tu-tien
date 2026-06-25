import { useMemo, useState } from 'react';
import {
  useGameStore,
  selectSpiritBeasts,
  getBeastTemplate,
  canEvolve,
  beastMaxExp,
} from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { ELEMENT_DISPLAY } from '@core/cultivation/spiritual-roots';
import type { Rarity } from '@gametypes/item';
import type { BeastKind } from '@gametypes/spirit-beast';

const RARITY_COLOR: Record<Rarity, string> = {
  'Thường': 'text-rarity-common',
  'Tốt': 'text-rarity-good',
  'Hiếm': 'text-rarity-rare',
  'Cực Phẩm': 'text-rarity-epic',
  'Siêu Phẩm': 'text-rarity-mythic',
  'Huyền Thoại': 'text-rarity-legendary',
};

const KIND_ICON: Record<BeastKind, string> = {
  sword_spirit: '⚔',
  beast: '☘',
  dragon: '✦',
  phoenix: '✧',
  spirit: '☾',
  mystical: '◈',
};

export const SpiritBeastsScreen = () => {
  const setStage = useGameStore((s) => s.setStage);
  const beasts = useGameStore(selectSpiritBeasts);
  const player = useGameStore((s) => s.player);
  const setActive = useGameStore((s) => s.setActiveBeast);
  const feed = useGameStore((s) => s.feedBeastAction);
  const evolve = useGameStore((s) => s.evolveBeastAction);
  const release = useGameStore((s) => s.releaseBeast);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = useMemo(() => Object.values(beasts), [beasts]);
  const selected = selectedId ? beasts[selectedId] : list[0];
  const selectedTmpl = selected ? getBeastTemplate(selected.templateId) : null;

  const evoCheck = useMemo(() => {
    if (!selected || !selectedTmpl || !player) return null;
    const inventoryNames = Object.values(useGameStore.getState().inventory).map((i) => i.name);
    return canEvolve(selected, selectedTmpl, player.currency, inventoryNames);
  }, [selected, selectedTmpl, player]);

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-gold-700/15 pb-4">
        <div>
          <div className="label-section mb-2">Linh Thú · Đồng Hành</div>
          <h1 className="font-serif text-[30px] font-bold uppercase tracking-wider text-gold-200">
            Linh Thú Các
          </h1>
          <p className="mt-1 text-[12px] text-jade-500">
            Đã khế ước <span className="font-mono text-gold-300">{list.length} / 6</span> linh thú
          </p>
        </div>
        <button onClick={() => setStage('playing')} className="btn-jade text-[13px]">
          ← Quay lại
        </button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        {/* Grid 6 slot */}
        <Bracketed className="rounded-md border bg-ink-700 p-4">
          <div className="label-gold mb-4">Bộ Sưu Tập</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => {
              const beast = list[i];
              if (!beast) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="flex h-32 items-center justify-center rounded-md border border-dashed text-[11px] italic text-jade-700"
                    style={{ borderColor: 'rgba(205,164,94,.15)' }}
                  >
                    Slot trống
                  </div>
                );
              }
              const tmpl = getBeastTemplate(beast.templateId);
              if (!tmpl) return null;
              const c = RARITY_COLOR[tmpl.rarity];
              const isSelected = beast.id === (selected?.id ?? '');
              const isActive = beast.isActive;
              return (
                <button
                  key={beast.id}
                  onClick={() => setSelectedId(beast.id)}
                  className="relative flex h-32 flex-col rounded-md border p-3 text-left transition-transform hover:scale-[1.02]"
                  style={{
                    borderColor: isSelected ? `var(--gold-500)` : isActive ? `var(--leaf-500)` : `rgba(205,164,94,.25)`,
                    background: `linear-gradient(135deg, ${RARITY_COLOR_HEX[tmpl.rarity]}1a, transparent)`,
                    boxShadow: isSelected ? `0 0 14px rgba(205,164,94,.4)` : 'none',
                  }}
                >
                  {isActive && (
                    <span className="absolute -top-2 -right-2 rounded-full border border-leaf-500/50 bg-leaf-500/20 px-2 py-0.5 text-[9px] uppercase tracking-wider text-leaf-500">
                      Đồng hành
                    </span>
                  )}
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-2xl" style={{ color: RARITY_COLOR_HEX[tmpl.rarity] }}>
                      {KIND_ICON[tmpl.kind]}
                    </span>
                    <span className="font-mono text-[11px] text-jade-400">Lv {beast.level}</span>
                  </div>
                  <div className={`text-[12.5px] font-medium ${c}`}>{beast.name}</div>
                  <div className="mt-auto">
                    <div className="text-[10px] text-jade-500">{tmpl.rarity}</div>
                    <div className="h-1 rounded-full bg-ink-800 overflow-hidden mt-1">
                      <div
                        className="h-full"
                        style={{
                          width: `${(beast.hp / beast.maxhp) * 100}%`,
                          background: 'linear-gradient(90deg, #8a2f2f, #d97757)',
                        }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {list.length === 0 && (
            <div className="mt-4 rounded-sm border border-spirit-500/30 bg-spirit-500/5 p-4 text-center text-[12.5px] text-spirit-300">
              Chưa khế ước linh thú nào. Vào combat, đánh enemy HP &lt; 20% rồi nhấn "Khế Ước" để bắt.
            </div>
          )}
        </Bracketed>

        {/* Detail panel */}
        {selected && selectedTmpl ? (
          <Bracketed className="h-fit rounded-md border bg-ink-700 p-5" tone={selectedTmpl.rarity === 'Huyền Thoại' ? 'ember' : 'gold'}>
            <div className="label-section mb-2">
              {selectedTmpl.kind === 'dragon' ? 'Long Tộc' :
               selectedTmpl.kind === 'phoenix' ? 'Phượng Tộc' :
               selectedTmpl.kind === 'sword_spirit' ? 'Kiếm Linh' :
               selectedTmpl.kind === 'spirit' ? 'Hồn Linh' :
               selectedTmpl.kind === 'mystical' ? 'Dị Thú' : 'Yêu Thú'}
              {selectedTmpl.element && (
                <> · <span style={{ color: ELEMENT_DISPLAY[selectedTmpl.element].color }}>
                  {ELEMENT_DISPLAY[selectedTmpl.element].symbol} {ELEMENT_DISPLAY[selectedTmpl.element].name}
                </span></>
              )}
            </div>
            <h2 className={`mb-1 font-serif text-2xl ${RARITY_COLOR[selectedTmpl.rarity]}`}>
              {selected.name}
            </h2>
            <p className="mb-4 text-[12px] italic text-gold-300/80">
              {selectedTmpl.stages[selected.stageIdx]?.description}
            </p>

            {/* HP + EXP bars */}
            <div className="mb-4 space-y-2">
              <Bar label="Sinh Lực" value={selected.hp} max={selected.maxhp} color="linear-gradient(90deg, #8a2f2f, #d97757)" />
              <Bar label="Kinh Nghiệm" value={selected.exp} max={beastMaxExp(selected.level)} color="linear-gradient(90deg, #a78bfa, #cda45e)" />
              <Bar label="Độ Trung Thành" value={selected.loyalty} max={100} color="linear-gradient(90deg, #6f8a6d, #8fc98c)" />
            </div>

            {/* Stats */}
            {(() => {
              const stage = selectedTmpl.stages[selected.stageIdx]!;
              const levelMult = 1 + (selected.level - 1) * 0.1;
              return (
                <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-1.5 border-y border-gold-700/15 py-3 text-[12.5px]">
                  <div className="flex justify-between">
                    <span className="text-jade-400">Tấn Công</span>
                    <span className="font-mono text-gold-200">{Math.round(selectedTmpl.baseStats.atk * stage.statMultiplier * levelMult)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-jade-400">Phòng Thủ</span>
                    <span className="font-mono text-gold-200">{Math.round(selectedTmpl.baseStats.def * stage.statMultiplier * levelMult)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-jade-400">Tốc Độ</span>
                    <span className="font-mono text-gold-200">{Math.round(selectedTmpl.baseStats.spd * stage.statMultiplier * levelMult)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-jade-400">Stage</span>
                    <span className="font-mono text-spirit-300">
                      {selected.stageIdx + 1} / {selectedTmpl.stages.length}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="space-y-2">
              {!selected.isActive ? (
                <button onClick={() => setActive(selected.id)} className="btn-primary w-full text-[13px]">
                  ✦ Chọn Đồng Hành
                </button>
              ) : (
                <button onClick={() => setActive(null)} className="btn-jade w-full text-[13px]">
                  ⊗ Tạm Cất
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => feed(selected.id, 'pill')} className="btn-secondary text-[12px]">
                  ✚ Hồi HP
                </button>
                <button onClick={() => feed(selected.id, 'food')} className="btn-secondary text-[12px]">
                  ♥ +Loyalty
                </button>
              </div>

              {evoCheck && (
                <button
                  onClick={() => evolve(selected.id)}
                  disabled={!evoCheck.can}
                  className={evoCheck.can ? 'btn-primary w-full text-[13px]' : 'btn-jade w-full text-[12px]'}
                  style={evoCheck.can ? { background: 'linear-gradient(180deg, var(--spirit-200), var(--spirit-500))' } : {}}
                >
                  {evoCheck.can
                    ? `✦ Tiến Hóa → ${selectedTmpl.stages[evoCheck.nextStage!]!.name}`
                    : evoCheck.reason ?? 'Không thể tiến hóa'}
                </button>
              )}

              <button
                onClick={() => {
                  if (confirm(`Phóng thích ${selected.name}? Mất vĩnh viễn.`)) release(selected.id);
                }}
                className="btn-jade w-full text-[11px]"
                style={{ color: 'var(--blood-500)' }}
              >
                ⊗ Phóng Thích
              </button>
            </div>
          </Bracketed>
        ) : (
          <Bracketed className="rounded-md border bg-ink-700 p-8 text-center">
            <p className="italic text-jade-500">Chọn linh thú để xem chi tiết.</p>
          </Bracketed>
        )}
      </div>
    </main>
  );
};

const RARITY_COLOR_HEX: Record<Rarity, string> = {
  'Thường': '#d9d3c2',
  'Tốt': '#8fc98c',
  'Hiếm': '#7fbce8',
  'Cực Phẩm': '#c2a6ee',
  'Siêu Phẩm': '#f0a98e',
  'Huyền Thoại': '#e0654e',
};

const Bar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11.5px]">
        <span className="text-jade-400">{label}</span>
        <span className="font-mono text-gold-300">
          {value} / {max}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

import { useMemo, useState } from 'react';
import { useGameStore, selectInventory } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { ItemIcon } from '@shared/components/ItemIcon';
import { EQUIPPABLE_CATEGORIES, type Rarity, type ItemCategory } from '@gametypes/item';
import { isArtifactEligible, ARTIFACT_GRADE_NAMES, ARTIFACT_SOUL_THRESHOLD } from '@core/items/artifact';
import { getRefineCost, getRefineSuccessRate } from '@core/items/refine';

const RARITY_CONFIG: Record<Rarity, { border: string; bg: string; text: string; dot: string }> = {
  'Thường':      { border: 'rgba(217,211,194,.4)', bg: 'rgba(217,211,194,.05)', text: 'text-rarity-common', dot: '#d9d3c2' },
  'Tốt':         { border: 'rgba(143,201,140,.4)', bg: 'rgba(143,201,140,.06)', text: 'text-rarity-good', dot: '#8fc98c' },
  'Hiếm':        { border: 'rgba(127,188,232,.4)', bg: 'rgba(127,188,232,.07)', text: 'text-rarity-rare', dot: '#7fbce8' },
  'Cực Phẩm':    { border: 'rgba(194,166,238,.5)', bg: 'rgba(169,134,216,.1)', text: 'text-rarity-epic', dot: '#c2a6ee' },
  'Siêu Phẩm':   { border: 'rgba(240,169,142,.5)', bg: 'rgba(217,119,87,.1)', text: 'text-rarity-mythic', dot: '#f0a98e' },
  'Huyền Thoại': { border: 'rgba(224,101,78,.6)', bg: 'rgba(224,101,78,.13)', text: 'text-rarity-legendary', dot: '#e0654e' },
};

const FILTERS: { id: 'all' | ItemCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Tất Cả', icon: '◆' },
  { id: 'Vũ khí', label: 'Vũ khí', icon: '⚔' },
  { id: 'Đan dược', label: 'Đan Dược', icon: '⚱' },
  { id: 'Nguyên liệu', label: 'Nguyên Liệu', icon: '☘' },
  { id: 'Tín vật', label: 'Tín Vật', icon: '⚝' },
  { id: 'Sách kỹ năng', label: 'Sách Pháp', icon: '☷' },
  { id: 'Đa năng', label: 'Đa Năng', icon: '◯' },
];

export const InventoryScreen = () => {
  const setStage = useGameStore((s) => s.setStage);
  const settings = useGameStore((s) => s.settings);
  const player = useGameStore((s) => s.player);
  const inventory = useGameStore(selectInventory);
  const useItem = useGameStore((s) => s.useItem);
  const discardItem = useGameStore((s) => s.discardItem);
  const equipItem = useGameStore((s) => s.equipItem);
  const nourishArt = useGameStore((s) => s.nourishArtifactAction);
  // Phase 16.2: Item upgrade actions
  const rerollItemStats = useGameStore((s) => s.rerollItemStats);
  const upgradeItemRarity = useGameStore((s) => s.upgradeItemRarity);
  const refineItem = useGameStore((s) => s.refineItem);
  const tienNgoc = useGameStore((s) => s.economy.tienNgoc);
  const equippedItems = player?.equippedItems;
  const [activeFilter, setActiveFilter] = useState<'all' | ItemCategory>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = useMemo(() => Object.values(inventory), [inventory]);
  const filtered = useMemo(
    () => items.filter((it) => activeFilter === 'all' || it.category === activeFilter),
    [items, activeFilter],
  );
  const selected = selectedId ? inventory[selectedId] : filtered[0];

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-gold-700/15 pb-4">
        <div>
          <div className="label-section mb-2">Hành Trang · Túi Trữ Vật</div>
          <h1
            className="font-serif text-[30px] font-bold uppercase text-gold-200"
            style={{ letterSpacing: '0.06em' }}
          >
            Hành Trang
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-jade-500">
              {settings.currencyName}
            </div>
            <div className="font-mono text-2xl text-gold-500">
              {(player?.currency ?? 0).toLocaleString()}
            </div>
          </div>
          <button onClick={() => setStage('playing')} className="btn-jade text-[13px]">
            ← Quay lại
          </button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[180px_1fr_320px]">
        <Bracketed className="h-fit rounded-md border bg-ink-700 p-3" inset={5}>
          <div className="label-section mb-3 px-2">Phân Loại</div>
          <div className="flex flex-col gap-1">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.id;
              const count = f.id === 'all' ? items.length : items.filter((it) => it.category === f.id).length;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className="relative flex items-center justify-between rounded-sm px-3 py-2 text-left text-[13px] transition-colors"
                  style={{
                    color: isActive ? 'var(--gold-100)' : 'var(--gold-300)',
                    background: isActive ? 'rgba(205,164,94,.08)' : 'transparent',
                  }}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-2 bottom-2 w-[2px] rounded-sm"
                      style={{ background: 'var(--gold-500)', boxShadow: '0 0 9px rgba(205,164,94,.7)' }}
                    />
                  )}
                  <span className="flex items-center gap-2">
                    <span style={{ color: 'var(--gold-500)', fontSize: 10 }}>{f.icon}</span>
                    {f.label}
                  </span>
                  <span className="font-mono text-[10px] text-jade-600">{count}</span>
                </button>
              );
            })}
          </div>
        </Bracketed>

        <Bracketed className="rounded-md border bg-ink-700 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="label-gold">Thẻ Vật Phẩm ({filtered.length})</div>
            <div className="text-[11px] text-jade-500">
              Trọng lượng <span className="font-mono text-gold-300">{items.length} / 120</span>
            </div>
          </div>
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-[13px] italic text-jade-700">
              {items.length === 0
                ? 'Túi trống rỗng. Hãy phiêu lưu để nhặt được vật phẩm…'
                : 'Không có vật phẩm thuộc phân loại này.'}
            </p>
          ) : (
            <div
              className="grid gap-[10px] overflow-y-auto pr-1"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                maxHeight: 'calc(100vh - 280px)',
              }}
            >
              {filtered.map((it) => {
                const c = RARITY_CONFIG[it.rarity];
                const isSelected = it.id === (selected?.id ?? '');
                return (
                  <button
                    key={it.id}
                    onClick={() => setSelectedId(it.id)}
                    className="group flex flex-col rounded-md border p-3 text-left transition-all"
                    style={{
                      borderColor: isSelected ? c.dot : c.border,
                      background: `linear-gradient(135deg, ${c.bg}, transparent)`,
                      boxShadow: isSelected ? `0 0 14px ${c.dot}33` : 'none',
                    }}
                  >
                    <div
                      className="mb-2 rounded-sm border overflow-hidden"
                      style={{ borderColor: c.border, background: c.bg, width: 64, height: 64 }}
                    >
                      <ItemIcon name={it.name} category={it.category} rarity={it.rarity} size={64} />
                    </div>
                    <div className={`text-[12.5px] font-medium leading-tight ${c.text}`}>{it.name}</div>
                    <div className="mt-1 flex items-center justify-between text-[10.5px] text-jade-500">
                      <span>{it.rarity}</span>
                      {(it.quantity ?? 1) > 1 && (
                        <span className="font-mono text-gold-300">×{it.quantity}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Bracketed>

        <Bracketed className="h-fit rounded-md border bg-ink-700 p-5">
          {selected ? (
            <>
              <div className="label-section mb-2">
                {selected.category} · {selected.rarity}
              </div>
              <h2 className={`mb-3 font-serif text-xl ${RARITY_CONFIG[selected.rarity].text}`}>
                {selected.name}
              </h2>
              <div
                className="mb-4 flex h-48 items-center justify-center rounded-sm border overflow-hidden"
                style={{
                  borderColor: RARITY_CONFIG[selected.rarity].border,
                  background: RARITY_CONFIG[selected.rarity].bg,
                }}
              >
                <ItemIcon
                  name={selected.name}
                  category={selected.category}
                  rarity={selected.rarity}
                  size={192}
                />
              </div>
              <p className="mb-4 font-serif text-[13px] italic leading-relaxed text-gold-300">
                {selected.description || 'Vật phẩm tu tiên trân quý, được luyện chế từ thiên tài địa bảo.'}
              </p>
              {selected.bonuses && Object.keys(selected.bonuses).length > 0 && (
                <div className="mb-4 rounded-sm border border-gold-700/20 bg-ink-800/50 p-3">
                  <div className="label-section mb-2">Chỉ Số Bonus</div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                    {Object.entries(selected.bonuses).map(([k, v]) => {
                      if (!v) return null;
                      const isPct = ['cr', 'cdmg', 'dmgAmp', 'dmgRes', 'evasion'].includes(k);
                      return (
                        <div key={k} className="flex justify-between">
                          <span className="text-jade-400">{k.toUpperCase()}</span>
                          <span className="font-mono text-leaf-500">
                            +{v}
                            {isPct ? '%' : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {selected.effects && (
                <div className="mb-4 rounded-sm border border-gold-700/20 bg-ink-800/50 p-3">
                  <div className="label-section mb-1">Hiệu ứng</div>
                  <div className="text-[12.5px] text-gold-200">{selected.effects}</div>
                </div>
              )}

              {isArtifactEligible(selected) && (() => {
                const level = selected.artifactLevel ?? 1;
                const soul = selected.artifactSoul ?? 0;
                const nextThreshold = ARTIFACT_SOUL_THRESHOLD[level] ?? Infinity;
                const prevThreshold = ARTIFACT_SOUL_THRESHOLD[level - 1] ?? 0;
                const isMax = level >= 5;
                const pct = isMax ? 100 : ((soul - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
                return (
                  <div className="mb-4 rounded-sm border border-spirit-500/40 bg-void-900/40 p-3">
                    <div className="label-section mb-2" style={{ color: 'var(--spirit-300)' }}>
                      ✦ Pháp Bảo — {ARTIFACT_GRADE_NAMES[level - 1]}
                    </div>
                    <div className="mb-2 flex justify-between text-[11.5px]">
                      <span className="text-jade-400">Pháp Bảo Tinh Hồn</span>
                      <span className="font-mono text-spirit-200">
                        {soul.toLocaleString()} {!isMax && `/ ${nextThreshold.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
                      <div
                        className="h-full"
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, var(--spirit-500), var(--gold-150))',
                        }}
                      />
                    </div>
                    {!isMax && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[100, 500, 2000].map((amt) => (
                          <button
                            key={amt}
                            onClick={() => nourishArt(selected.id, amt)}
                            disabled={!player || player.currency < amt}
                            className="rounded-sm border border-spirit-500/30 bg-spirit-500/10 px-2 py-1.5 text-[11px] text-spirit-200 hover:border-spirit-500/60 disabled:opacity-30"
                          >
                            Dưỡng +{amt}
                          </button>
                        ))}
                      </div>
                    )}
                    {isMax && (
                      <div className="mt-2 text-center text-[12px] italic text-gold-150">
                        ✦ Đã đạt Tiên Khí — cảnh giới tối thượng
                      </div>
                    )}
                  </div>
                );
              })()}
              {(() => {
                const isEquipped = equippedItems
                  ? Object.values(equippedItems).includes(selected.id)
                  : false;
                return (
                  <div className="flex gap-2">
                    {selected.category === 'Đan dược' && (
                      <button
                        onClick={() => useItem(selected.id)}
                        className="btn-primary flex-1 text-[13px]"
                      >
                        Sử Dụng
                      </button>
                    )}
                    {EQUIPPABLE_CATEGORIES.includes(selected.category) && (
                      <button
                        onClick={() => equipItem(selected.id)}
                        className="btn-primary flex-1 text-[13px]"
                        disabled={isEquipped}
                      >
                        {isEquipped ? 'Đã Trang Bị' : 'Trang Bị'}
                      </button>
                    )}
                  </div>
                );
              })()}
              {/* Phase 16.2: Item upgrade — chỉ hiện cho Hiếm trở lên */}
              {['Hiếm', 'Cực Phẩm', 'Siêu Phẩm', 'Huyền Thoại'].includes(selected.rarity) && (
                <div className="mt-3 rounded border border-gold-700/30 bg-ink-900/40 p-3">
                  <div className="label-section mb-2">⚒ Tinh Luyện Pháp Bảo</div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    <button
                      onClick={() => {
                        if (confirm(`Tinh luyện ${selected.name}? Tốn 50 Tiền Ngọc, random lại stats (giữ rarity).`)) {
                          rerollItemStats(selected.id);
                        }
                      }}
                      disabled={tienNgoc < 50}
                      className="rounded border border-spirit-500/40 bg-spirit-900/20 px-2 py-1.5 text-[11px] font-bold uppercase tracking-widest text-spirit-300 hover:bg-spirit-900/40 disabled:cursor-not-allowed disabled:opacity-40"
                      title={tienNgoc < 50 ? `Cần 50 💎 (có ${tienNgoc})` : 'Random lại chỉ số'}
                    >
                      Re-roll Stats · 💎 50
                    </button>
                    <button
                      onClick={() => {
                        if (selected.rarity === 'Huyền Thoại') {
                          alert('Đã đạt Huyền Thoại — không thể nâng thêm.');
                          return;
                        }
                        if (confirm(`Thăng cấp ${selected.name}? Tốn 200 Tiền Ngọc, rarity tăng 1 tier.`)) {
                          upgradeItemRarity(selected.id);
                        }
                      }}
                      disabled={tienNgoc < 200 || selected.rarity === 'Huyền Thoại'}
                      className="rounded border border-gold-500/50 bg-gold-900/30 px-2 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gold-300 hover:bg-gold-900/50 disabled:cursor-not-allowed disabled:opacity-40"
                      title={
                        selected.rarity === 'Huyền Thoại'
                          ? 'Đã đỉnh cấp'
                          : tienNgoc < 200
                          ? `Cần 200 💎 (có ${tienNgoc})`
                          : 'Thăng cấp rarity'
                      }
                    >
                      Thăng Cấp · 💎 200
                    </button>
                  </div>
                </div>
              )}
              {/* Phase 23.1: Rèn luyện +N */}
              {selected.bonuses && Object.keys(selected.bonuses).length > 0 && (() => {
                const curLv = selected.refineLevel ?? 0;
                const cost = curLv < 12 ? getRefineCost(curLv) : null;
                const rate = curLv < 12 ? Math.round(getRefineSuccessRate(curLv) * 100) : 0;
                const canAfford = !cost ||
                  ((player?.currency ?? 0) >= cost.linhThach &&
                   (!cost.tienNgoc || tienNgoc >= cost.tienNgoc));
                return (
                  <div className="mt-3 rounded border border-ember-500/30 bg-ember-900/10 p-3">
                    <div className="label-section mb-2 flex items-center justify-between">
                      <span>✦ Rèn Luyện <span className="text-gold-400">+{curLv}/12</span></span>
                      {curLv < 12 && (
                        <span className="text-[10px] italic text-jade-500">
                          Tỷ lệ thành công {rate}%
                        </span>
                      )}
                    </div>
                    {curLv >= 12 ? (
                      <div className="text-center text-[11px] italic text-gold-300">
                        ✦ Đỉnh cấp — không thể rèn thêm
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (!cost) return;
                          const costMsg = cost.tienNgoc
                            ? `${cost.linhThach.toLocaleString()} linh thạch + ${cost.tienNgoc} 💎 (thiên hỏa)`
                            : `${cost.linhThach.toLocaleString()} linh thạch`;
                          if (!confirm(`Rèn ${selected.name} +${curLv} → +${curLv + 1}? Tốn ${costMsg}. Tỷ lệ ${rate}%${curLv >= 9 ? ' (fail có thể hạ bậc)' : ''}.`)) return;
                          const r = refineItem(selected.id);
                          if (!r.ok) alert(r.message);
                        }}
                        disabled={!canAfford}
                        className="w-full rounded border border-ember-500/50 bg-ember-900/30 px-2 py-1.5 text-[11px] font-bold uppercase tracking-widest text-ember-300 hover:bg-ember-900/50 disabled:cursor-not-allowed disabled:opacity-40"
                        title={!canAfford ? `Cần ${cost?.linhThach.toLocaleString()} linh thạch${cost?.tienNgoc ? ` + ${cost.tienNgoc} 💎` : ''}` : 'Rèn +1'}
                      >
                        Rèn → +{curLv + 1} · {cost?.linhThach.toLocaleString()} 💠
                        {cost?.tienNgoc ? ` + ${cost.tienNgoc} 💎` : ''}
                      </button>
                    )}
                  </div>
                );
              })()}
              <button
                onClick={() => {
                  if (confirm(`Vứt bỏ ${selected.name}?`)) discardItem(selected.id);
                }}
                className="btn-jade mt-2 w-full text-[12px]"
              >
                Vứt Bỏ
              </button>
            </>
          ) : (
            <p className="py-8 text-center text-jade-700">Chọn vật phẩm để xem chi tiết.</p>
          )}
        </Bracketed>
      </div>
    </main>
  );
};

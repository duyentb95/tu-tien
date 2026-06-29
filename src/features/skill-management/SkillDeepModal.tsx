import { useState, useMemo } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { useKeyboard } from '@shared/hooks/useKeyboard';
import { useGameStore, selectSkills } from '@state/game-store';
import { notify } from '@state/notifications';
import { TALENT_NODES, TALENT_BRANCH_LABEL, getTalentResetCost } from '@data/talent-nodes';
import { SKILL_COMBOS, COMBO_TIER_COLOR } from '@data/skill-combos';
import { RUNE_REGISTRY, getRuneById, RUNE_KIND_LABEL, RUNE_TIER_LABEL, RUNE_KIND_COLOR } from '@data/runes';
import { detectActiveCombos } from '@core/skills/skill-deep';
import type { TalentBranch } from '@gametypes/skill-deep';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'talent' | 'combo' | 'rune';

const TABS: Array<{ id: Tab; label: string; hint: string }> = [
  { id: 'talent', label: 'Tài Năng', hint: 'Chọn nhánh ATK/DEF/UTILITY tại mastery lv 3/4/5' },
  { id: 'combo', label: 'Combo', hint: '7 combo registry, equip 2 skill match pattern → trigger' },
  { id: 'rune', label: 'Rune', hint: '6 loại × 5 tier — luyện + gắn 3 slot mỗi skill' },
];

export const SkillDeepModal = ({ open, onClose }: Props) => {
  const skills = useGameStore(selectSkills);
  const player = useGameStore((s) => s.player);
  const skillMastery = useGameStore((s) => s.skillMastery);
  const skillDeep = useGameStore((s) => s.skillDeep);
  const tienNgoc = useGameStore((s) => s.economy.tienNgoc);

  const chooseTalent = useGameStore((s) => s.chooseTalent);
  const resetTalents = useGameStore((s) => s.resetTalents);
  const craftRune = useGameStore((s) => s.craftRune);
  const attachRune = useGameStore((s) => s.attachRune);
  const detachRune = useGameStore((s) => s.detachRune);

  const [tab, setTab] = useState<Tab>('talent');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  useKeyboard({ Escape: onClose }, [onClose], open);

  const learnedSkillObjects = useMemo(() => {
    if (!player) return [];
    return player.learnedSkills.map((id) => skills[id]).filter(Boolean);
  }, [player, skills]);

  const equippedSkillNames = useMemo(() => {
    if (!player) return [];
    return Object.values(player.equippedSkills)
      .filter((id): id is string => !!id)
      .map((id) => skills[id]?.name ?? '')
      .filter(Boolean);
  }, [player, skills]);

  if (!open) return null;

  const selectedSkill = selectedSkillId ? skills[selectedSkillId] : null;
  const selectedMasteryLv = selectedSkillId ? (skillMastery[selectedSkillId]?.level ?? 1) : 1;
  const selectedTalent = selectedSkillId ? skillDeep.talents[selectedSkillId] : null;
  const selectedRunes = selectedSkillId ? skillDeep.runeSlots[selectedSkillId] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '92vh' }}
      >
        <Bracketed className="rounded-md border bg-ink-700" tone="gold">
          <div className="flex flex-col" style={{ maxHeight: '88vh' }}>
            <header className="flex items-start justify-between border-b border-gold-700/15 px-6 py-4">
              <div>
                <div className="label-section mb-1">Pháp Thuật Thâm Cấp</div>
                <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-gold-200">
                  Tài Năng · Combo · Rune
                </h2>
                <p className="mt-1 text-[12px] italic text-jade-500">
                  Mỗi skill = mastery cơ bản + tài năng nhánh + 3 rune slot. Combo trigger tự động khi equip đúng pair.
                </p>
              </div>
              <button onClick={onClose} className="text-gold-500 text-xl px-2">✕</button>
            </header>

            {/* Tabs */}
            <nav className="flex border-b border-gold-700/15 px-2 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-2 text-[13px] font-semibold whitespace-nowrap transition ${
                    tab === t.id
                      ? 'text-gold-200 border-b-2 border-gold-500'
                      : 'text-jade-500 hover:text-gold-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="overflow-y-auto px-6 py-4 flex-1">
              {/* Skill picker — shared by talent + rune tabs */}
              {(tab === 'talent' || tab === 'rune') && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="text-[11px] uppercase text-jade-500 tracking-widest self-center mr-2">Chọn skill:</span>
                  {learnedSkillObjects.length === 0 ? (
                    <span className="text-jade-500/70 italic text-sm">Chưa học pháp thuật nào.</span>
                  ) : learnedSkillObjects.map((sk) => {
                    if (!sk) return null;
                    const lv = skillMastery[sk.id]?.level ?? 1;
                    return (
                      <button
                        key={sk.id}
                        onClick={() => setSelectedSkillId(sk.id)}
                        className={`text-[12px] px-2.5 py-1 rounded border transition ${
                          selectedSkillId === sk.id
                            ? 'border-gold-400 text-gold-200 bg-gold-900/40'
                            : 'border-jade-700/40 text-jade-300 hover:border-gold-700 hover:text-gold-300'
                        }`}
                      >
                        {sk.name} <span className="text-[10px] text-gold-400">Lv{lv}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TAB: Talent */}
              {tab === 'talent' && (
                <section>
                  {!selectedSkill ? (
                    <p className="text-jade-500/70 italic text-center py-8">Chọn 1 skill để xem cây tài năng.</p>
                  ) : (
                    <>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-serif text-lg text-gold-200">{selectedSkill.name}</h3>
                          <p className="text-[12px] text-jade-400">Mastery: Lv {selectedMasteryLv} · Reset {selectedTalent?.resetCount ?? 0} lần</p>
                        </div>
                        {selectedTalent && (selectedTalent.t3 || selectedTalent.t4 || selectedTalent.t5) && (
                          <button
                            onClick={() => {
                              const cost = getTalentResetCost(selectedTalent.resetCount);
                              if (!confirm(`Reset toàn bộ talent của ${selectedSkill.name}?\nTốn ${cost} Tiên Ngọc (lần kế: ${getTalentResetCost(selectedTalent.resetCount + 1)}).`)) return;
                              const r = resetTalents(selectedSkill.id);
                              if (!r.ok) notify.warn('Không thể reset', r.message);
                            }}
                            className="text-xs px-3 py-1.5 border border-ember-500/40 rounded text-ember-300 hover:bg-ember-900/20"
                          >
                            ↻ Reset · 💎 {getTalentResetCost(selectedTalent.resetCount)}
                          </button>
                        )}
                      </div>

                      {/* 3 tier × 3 branch grid */}
                      <div className="space-y-3">
                        {([3, 4, 5] as const).map((tier) => {
                          const locked = selectedMasteryLv < tier;
                          const chosen = selectedTalent?.[`t${tier}` as 't3' | 't4' | 't5'];
                          return (
                            <div
                              key={tier}
                              className={`rounded border p-2.5 ${
                                locked ? 'border-ink-700/30 bg-ink-900/30 opacity-50'
                                       : 'border-gold-700/30 bg-ink-900/40'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] uppercase tracking-widest font-bold text-gold-300">
                                  Tier {tier} {locked && `· cần mastery ${tier}`}
                                </span>
                                {chosen && (
                                  <span className="text-[10px] text-jade-400">
                                    ✓ Đã chọn: <strong style={{ color: TALENT_BRANCH_LABEL[chosen].color }}>{TALENT_BRANCH_LABEL[chosen].label}</strong>
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {(['atk', 'def', 'utility'] as TalentBranch[]).map((branch) => {
                                  const node = TALENT_NODES[tier][branch];
                                  const isChosen = chosen === branch;
                                  const isLocked = locked || (!!chosen && !isChosen);
                                  return (
                                    <button
                                      key={branch}
                                      onClick={() => {
                                        if (locked) return;
                                        if (chosen) return;
                                        const r = chooseTalent(selectedSkill.id, tier, branch);
                                        if (!r.ok) notify.warn('Không thể', r.message);
                                      }}
                                      disabled={isLocked && !isChosen}
                                      className={`rounded border p-2 text-left transition ${
                                        isChosen
                                          ? 'border-2 ring-1 ring-current'
                                          : isLocked
                                          ? 'border-ink-700/30 opacity-40 cursor-not-allowed'
                                          : 'border-gold-700/40 hover:border-gold-500 hover:bg-gold-900/20'
                                      }`}
                                      style={{
                                        borderColor: isChosen ? TALENT_BRANCH_LABEL[branch].color : undefined,
                                      }}
                                    >
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <span style={{ color: TALENT_BRANCH_LABEL[branch].color }}>{TALENT_BRANCH_LABEL[branch].icon}</span>
                                        <span className="text-[11.5px] font-bold" style={{ color: TALENT_BRANCH_LABEL[branch].color }}>
                                          {node.name}
                                        </span>
                                      </div>
                                      <p className="text-[10.5px] text-jade-400 leading-snug">{node.description}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </section>
              )}

              {/* TAB: Combo */}
              {tab === 'combo' && (
                <section>
                  <p className="text-[12px] italic text-jade-500 mb-3">
                    Equip đủ skill match pattern trong combat slot → combo tự active. Damage bonus + special effect.
                  </p>
                  {equippedSkillNames.length > 0 && (
                    <div className="mb-3 rounded border border-gold-700/30 bg-ink-900/40 p-2.5">
                      <div className="text-[10px] uppercase tracking-widest text-jade-500 mb-1.5">Combo đang active</div>
                      {(() => {
                        const active = detectActiveCombos(equippedSkillNames);
                        if (active.length === 0) {
                          return <p className="text-[11.5px] text-jade-500/70 italic">Chưa trigger combo nào với loadout hiện tại.</p>;
                        }
                        return (
                          <div className="flex flex-wrap gap-1.5">
                            {active.map((c) => (
                              <span
                                key={c.id}
                                className="text-[11px] px-2 py-0.5 rounded border"
                                style={{
                                  borderColor: COMBO_TIER_COLOR[c.tier],
                                  color: COMBO_TIER_COLOR[c.tier],
                                  background: 'rgba(0,0,0,0.3)',
                                }}
                                title={c.description}
                              >
                                ✦ {c.name}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-2">
                    {SKILL_COMBOS.map((c) => {
                      const isActive = equippedSkillNames.length > 0 &&
                        detectActiveCombos(equippedSkillNames).some((a) => a.id === c.id);
                      return (
                        <div
                          key={c.id}
                          className={`rounded border p-2.5 ${isActive ? 'bg-gold-900/15' : 'bg-ink-900/30'}`}
                          style={{ borderColor: COMBO_TIER_COLOR[c.tier] }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-serif font-bold text-[13px]" style={{ color: COMBO_TIER_COLOR[c.tier] }}>
                              {isActive && '✦ '}{c.name}
                            </span>
                            <span className="text-[9px] uppercase tracking-widest" style={{ color: COMBO_TIER_COLOR[c.tier] }}>
                              {c.tier}
                            </span>
                          </div>
                          <p className="text-[11px] text-jade-400 leading-snug">{c.description}</p>
                          {c.requiresNamePatterns && (
                            <p className="text-[10px] text-jade-500 mt-1.5 italic">
                              Cần: {c.requiresNamePatterns.map((p) => p.source.split('|')[0]?.replace(/[()\\/\[\]]/g, '')).join(' + ')}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* TAB: Rune */}
              {tab === 'rune' && (
                <section>
                  {/* Inventory rune */}
                  <div className="mb-4 rounded border border-spirit-700/30 bg-spirit-900/10 p-3">
                    <div className="label-section mb-2">Kho Rune</div>
                    {Object.keys(skillDeep.runeInventory).length === 0 ? (
                      <p className="text-[11.5px] text-jade-500/70 italic">Chưa có rune nào. Luyện từ danh sách bên dưới.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {Object.values(skillDeep.runeInventory)
                          .filter((inv) => inv.quantity > 0)
                          .map((inv) => {
                            const def = getRuneById(inv.defId);
                            if (!def) return null;
                            return (
                              <span
                                key={inv.defId}
                                className="text-[11px] px-2 py-0.5 rounded border font-mono"
                                style={{ borderColor: RUNE_KIND_COLOR[def.kind], color: RUNE_KIND_COLOR[def.kind] }}
                                title={def.description}
                              >
                                {def.name} ×{inv.quantity}
                              </span>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Skill rune slots */}
                  {selectedSkill && (
                    <div className="mb-4 rounded border border-gold-700/30 bg-ink-900/40 p-3">
                      <div className="label-section mb-2">{selectedSkill.name} · Slot Rune</div>
                      <div className="grid grid-cols-3 gap-2">
                        {([0, 1, 2] as const).map((slotIdx) => {
                          const runeId = selectedRunes?.[slotIdx];
                          const def = runeId ? getRuneById(runeId) : null;
                          return (
                            <div
                              key={slotIdx}
                              className="rounded border border-gold-700/40 bg-ink-800 p-2 min-h-[60px]"
                            >
                              <div className="text-[9px] uppercase text-jade-500 tracking-widest mb-1">Slot {slotIdx + 1}</div>
                              {def ? (
                                <div className="space-y-1">
                                  <div className="text-[11.5px] font-bold" style={{ color: RUNE_KIND_COLOR[def.kind] }}>
                                    {def.name}
                                  </div>
                                  <button
                                    onClick={() => detachRune(selectedSkill.id, slotIdx)}
                                    className="text-[10px] text-ember-400 hover:text-ember-300"
                                  >
                                    Gỡ
                                  </button>
                                </div>
                              ) : (
                                <select
                                  className="w-full bg-ink-900 border border-jade-700/30 text-jade-300 text-[11px] py-0.5 rounded"
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      const r = attachRune(selectedSkill.id, slotIdx, e.target.value);
                                      if (!r.ok) notify.warn('Không thể gắn', r.message);
                                    }
                                    e.target.value = '';
                                  }}
                                >
                                  <option value="">— Trống —</option>
                                  {Object.values(skillDeep.runeInventory)
                                    .filter((inv) => inv.quantity > 0)
                                    .map((inv) => {
                                      const d = getRuneById(inv.defId);
                                      return d && <option key={inv.defId} value={inv.defId}>{d.name} (×{inv.quantity})</option>;
                                    })}
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Rune craft list */}
                  <div className="label-section mb-2">Luyện Rune (30 loại)</div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {RUNE_REGISTRY.map((r) => {
                      const owned = skillDeep.runeInventory[r.id]?.quantity ?? 0;
                      const canAfford = (player?.currency ?? 0) >= r.craftCost.linhThach
                        && (!r.craftCost.tienNgoc || tienNgoc >= r.craftCost.tienNgoc);
                      return (
                        <div
                          key={r.id}
                          className="rounded border p-2 bg-ink-900/30"
                          style={{ borderColor: `${RUNE_KIND_COLOR[r.kind]}55` }}
                        >
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[11.5px] font-bold" style={{ color: RUNE_KIND_COLOR[r.kind] }}>
                              {RUNE_KIND_LABEL[r.kind]} {RUNE_TIER_LABEL[r.tier]}
                            </span>
                            {owned > 0 && (
                              <span className="text-[9px] text-jade-400 font-mono">×{owned}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-jade-400 leading-snug mb-1.5">{r.description}</p>
                          <div className="text-[9px] text-jade-500 mb-1.5 font-mono">
                            {r.craftCost.linhThach.toLocaleString()}💠
                            {r.craftCost.tienNgoc ? ` + ${r.craftCost.tienNgoc}💎` : ''}
                            {r.craftCost.materials?.length ? ` + ${r.craftCost.materials.map((m) => `${m.name}×${m.count}`).join(', ')}` : ''}
                          </div>
                          <button
                            onClick={() => {
                              const res = craftRune(r.id);
                              if (!res.ok) notify.warn('Không thể luyện', res.message);
                            }}
                            disabled={!canAfford}
                            className="w-full text-[10px] px-2 py-1 rounded border border-gold-700/40 text-gold-300 hover:bg-gold-900/20 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Luyện
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            <footer className="border-t border-gold-700/15 px-6 py-3 flex justify-between items-center text-[11px] text-jade-500">
              <span>{TABS.find((x) => x.id === tab)?.hint}</span>
              <button
                onClick={onClose}
                className="px-3 py-1 border border-gold-700/30 rounded text-gold-300 hover:bg-gold-900/20"
              >
                Đóng (Esc)
              </button>
            </footer>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

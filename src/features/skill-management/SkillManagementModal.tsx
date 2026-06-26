import { useMemo, useState } from 'react';
import { useGameStore } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import type { Skill, SkillKind } from '@gametypes/skill';
import type { SkillSlot } from '@gametypes/character';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SLOT_LABELS: Record<SkillSlot, string> = {
  combat_basic_1: 'Cơ Bản I',
  combat_basic_2: 'Cơ Bản II',
  combat_ultimate: 'Tuyệt Kỹ',
  adventure_1: 'Phiêu Lưu I',
  adventure_2: 'Phiêu Lưu II',
  adventure_3: 'Phiêu Lưu III',
};

const SLOT_GROUPS: Array<{ title: string; slots: SkillSlot[]; tone: 'ember' | 'jade' }> = [
  { title: 'Combat', slots: ['combat_basic_1', 'combat_basic_2', 'combat_ultimate'], tone: 'ember' },
  { title: 'Phiêu Lưu', slots: ['adventure_1', 'adventure_2', 'adventure_3'], tone: 'jade' },
];

const KIND_LABEL: Record<SkillKind, string> = {
  combat_basic: 'Chiêu Cơ Bản',
  combat_ultimate: 'Tuyệt Kỹ',
  adventure: 'Phụ Trợ',
};

const RARITY_COLOR: Record<string, { border: string; bg: string; text: string }> = {
  'Thường': { border: 'border-jade-700/40', bg: 'bg-jade-900/10', text: 'text-jade-300' },
  'Tốt': { border: 'border-jade-500/50', bg: 'bg-jade-900/20', text: 'text-jade-200' },
  'Hiếm': { border: 'border-spirit-500/50', bg: 'bg-spirit-900/20', text: 'text-spirit-300' },
  'Cực Phẩm': { border: 'border-gold-500/50', bg: 'bg-gold-900/20', text: 'text-gold-300' },
  'Siêu Phẩm': { border: 'border-gold-400/60', bg: 'bg-gold-900/30', text: 'text-gold-200' },
  'Huyền Thoại': { border: 'border-ember-500/60', bg: 'bg-ember-900/30', text: 'text-ember-300' },
};

const getRarityColor = (rarity?: string) =>
  RARITY_COLOR[rarity ?? 'Thường'] ?? RARITY_COLOR['Thường']!;

/**
 * Phase 9.6: 3-column skill management
 * Trái = Kho tiềm thức (all learned)
 * Giữa = Đang dùng (6 slot)
 * Phải = Thông tin chi tiết skill đang chọn
 */
export const SkillManagementModal = ({ open, onClose }: Props) => {
  const player = useGameStore((s) => s.player);
  const skills = useGameStore((s) => s.skills);
  const equipSkill = useGameStore((s) => s.equipSkill);
  const unequipSkill = useGameStore((s) => s.unequipSkill);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterKind, setFilterKind] = useState<'all' | SkillKind>('all');

  // Tất cả skill đã học
  const learnedSkills = useMemo<Skill[]>(() => {
    if (!player) return [];
    return player.learnedSkills
      .map((id) => skills[id])
      .filter((s): s is Skill => Boolean(s));
  }, [player, skills]);

  const filteredLearned = useMemo(() => {
    if (filterKind === 'all') return learnedSkills;
    return learnedSkills.filter((s) => s.kind === filterKind);
  }, [learnedSkills, filterKind]);

  const selectedSkill = selectedId ? skills[selectedId] ?? null : null;

  // Equipped map skillId → slot (1 skill chỉ 1 slot)
  const skillToSlot = useMemo(() => {
    const m = new Map<string, SkillSlot>();
    if (!player) return m;
    for (const slot of Object.keys(player.equippedSkills) as SkillSlot[]) {
      const id = player.equippedSkills[slot];
      if (id) m.set(id, slot);
    }
    return m;
  }, [player]);

  if (!open || !player) return null;

  // Helper: skill có thể equip vào slot không
  const canEquip = (skill: Skill, slot: SkillSlot): boolean => {
    if (slot === 'combat_ultimate') return skill.kind === 'combat_ultimate';
    if (slot === 'combat_basic_1' || slot === 'combat_basic_2') return skill.kind === 'combat_basic';
    return skill.kind === 'adventure'; // adventure_*
  };

  // Suggest 1st valid slot khi click equip
  const findFirstAvailableSlot = (skill: Skill): SkillSlot | null => {
    const slotOrder: SkillSlot[] =
      skill.kind === 'combat_ultimate'
        ? ['combat_ultimate']
        : skill.kind === 'combat_basic'
        ? ['combat_basic_1', 'combat_basic_2']
        : ['adventure_1', 'adventure_2', 'adventure_3'];
    for (const slot of slotOrder) {
      if (!player.equippedSkills[slot]) return slot;
    }
    // Tất cả đầy → trả slot đầu để override
    return slotOrder[0] ?? null;
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quản lý kỹ năng"
    >
      <div className="w-full max-w-6xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <Bracketed className="flex max-h-[88vh] flex-col rounded-md border bg-ink-700 p-5 sm:p-6" tone="gold">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-gold-700/30 pb-3">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold tracking-wide text-gold-200">
              <span aria-hidden>✦</span> Pháp Thuật Tự Do
            </h2>
            <button
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest text-jade-500 hover:text-gold-300"
              aria-label="Đóng"
            >
              × Đóng
            </button>
          </div>

          {/* 3 columns */}
          <div className="grid flex-grow grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[1fr_1fr_1.1fr]">
            {/* Cột 1: Kho tiềm thức */}
            <div className="flex flex-col overflow-hidden rounded-md border border-gold-700/30 bg-ink-900/40 p-3">
              <div className="mb-2 flex items-center justify-between border-b border-gold-700/20 pb-2">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-gold-300">
                  📚 Kho Tiềm Thức
                </h3>
                <span className="font-mono text-[10px] text-jade-500">
                  {filteredLearned.length}/{learnedSkills.length}
                </span>
              </div>

              {/* Filter chips */}
              <div className="mb-2 flex flex-wrap gap-1">
                {(['all', 'combat_basic', 'combat_ultimate', 'adventure'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilterKind(k)}
                    className={`rounded-sm border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                      filterKind === k
                        ? 'border-gold-500 bg-gold-700/20 text-gold-200'
                        : 'border-gold-700/30 text-jade-500 hover:border-gold-500/50 hover:text-gold-300'
                    }`}
                  >
                    {k === 'all' ? 'Tất cả' : KIND_LABEL[k]}
                  </button>
                ))}
              </div>

              <div className="custom-scroll flex-grow space-y-1.5 overflow-y-auto pr-1">
                {filteredLearned.length === 0 ? (
                  <p className="py-6 text-center text-xs italic text-jade-600">
                    {learnedSkills.length === 0
                      ? 'Chưa học được pháp thuật nào.'
                      : 'Không có pháp thuật khớp bộ lọc.'}
                  </p>
                ) : (
                  filteredLearned.map((sk) => {
                    const slot = skillToSlot.get(sk.id);
                    const c = getRarityColor(sk.rarity);
                    const isSelected = selectedId === sk.id;
                    return (
                      <button
                        key={sk.id}
                        onClick={() => setSelectedId(sk.id)}
                        className={`flex w-full items-start gap-2 rounded border px-2 py-1.5 text-left transition-colors ${
                          isSelected
                            ? 'border-gold-400 bg-gold-900/30'
                            : `${c.border} ${c.bg} hover:bg-ink-500/30`
                        }`}
                      >
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: 'currentColor' }} />
                        <div className="min-w-0 flex-1">
                          <div className={`truncate text-[13px] font-medium ${c.text}`}>{sk.name}</div>
                          <div className="text-[10px] uppercase tracking-wider text-jade-500">
                            {KIND_LABEL[sk.kind]}
                          </div>
                        </div>
                        {slot && (
                          <span className="rounded-sm border border-gold-500/40 px-1 py-0.5 text-[8px] font-bold uppercase tracking-widest text-gold-400">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cột 2: Đang dùng */}
            <div className="flex flex-col overflow-hidden rounded-md border border-gold-700/30 bg-ink-900/40 p-3">
              <div className="mb-2 border-b border-gold-700/20 pb-2">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-gold-300">
                  ⚔ Đang Dùng
                </h3>
              </div>

              <div className="custom-scroll flex-grow space-y-3 overflow-y-auto pr-1">
                {SLOT_GROUPS.map((group) => (
                  <div key={group.title}>
                    <div
                      className={`mb-1.5 text-[10px] font-bold uppercase tracking-widest ${
                        group.tone === 'ember' ? 'text-ember-400' : 'text-jade-400'
                      }`}
                    >
                      {group.title}
                    </div>
                    <div className="space-y-1.5">
                      {group.slots.map((slot) => {
                        const id = player.equippedSkills[slot];
                        const sk = id ? skills[id] : null;
                        const c = sk ? getRarityColor(sk.rarity) : null;
                        return (
                          <div
                            key={slot}
                            className={`flex items-center gap-2 rounded border px-2 py-2 ${
                              sk && c
                                ? `${c.border} ${c.bg}`
                                : 'border-dashed border-gold-700/30 bg-ink-700/30'
                            }`}
                          >
                            <span className="w-[68px] flex-shrink-0 text-[10px] uppercase tracking-wider text-jade-500">
                              {SLOT_LABELS[slot]}
                            </span>
                            {sk && c ? (
                              <>
                                <button
                                  onClick={() => setSelectedId(sk.id)}
                                  className={`flex-1 truncate text-left text-[13px] font-medium ${c.text} hover:underline`}
                                  title={sk.description}
                                >
                                  {sk.name}
                                </button>
                                <button
                                  onClick={() => unequipSkill(slot)}
                                  className="rounded-sm border border-ember-500/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-ember-400 hover:bg-ember-900/30"
                                  title="Tháo"
                                >
                                  Gỡ
                                </button>
                              </>
                            ) : (
                              <span className="flex-1 text-[12px] italic text-jade-600">— trống —</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột 3: Thông tin */}
            <div className="flex flex-col overflow-hidden rounded-md border border-gold-700/30 bg-ink-900/40 p-3">
              <div className="mb-2 border-b border-gold-700/20 pb-2">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-gold-300">
                  ☷ Thông Tin
                </h3>
              </div>

              <div className="custom-scroll flex-grow overflow-y-auto pr-1">
                {!selectedSkill ? (
                  <p className="py-12 text-center text-xs italic text-jade-600">
                    Chọn một pháp thuật để xem chi tiết.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {/* Title */}
                    <div>
                      <h4 className={`font-serif text-lg font-bold ${getRarityColor(selectedSkill.rarity).text}`}>
                        {selectedSkill.name}
                      </h4>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded-sm border border-gold-500/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold-400">
                          {selectedSkill.rarity}
                        </span>
                        <span className="rounded-sm border border-jade-500/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-jade-400">
                          {KIND_LABEL[selectedSkill.kind]}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="rounded border border-gold-700/20 bg-ink-700/40 p-2.5">
                      <p className="text-[13px] leading-relaxed text-jade-200">
                        {selectedSkill.description || '(Không có mô tả)'}
                      </p>
                    </div>

                    {/* Cost / Cooldown */}
                    {(selectedSkill.cost !== undefined || selectedSkill.cooldown !== undefined) && (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSkill.cost !== undefined && (
                          <div className="rounded border border-spirit-500/30 bg-spirit-900/20 px-2 py-1.5">
                            <div className="text-[9px] uppercase tracking-widest text-jade-500">Linh khí</div>
                            <div className="font-mono text-sm text-spirit-300">{selectedSkill.cost}</div>
                          </div>
                        )}
                        {selectedSkill.cooldown !== undefined && (
                          <div className="rounded border border-ember-500/30 bg-ember-900/20 px-2 py-1.5">
                            <div className="text-[9px] uppercase tracking-widest text-jade-500">Hồi chiêu</div>
                            <div className="font-mono text-sm text-ember-300">{selectedSkill.cooldown} lượt</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Passive effects */}
                    {selectedSkill.passive_effects && selectedSkill.passive_effects.length > 0 && (
                      <div>
                        <div className="mb-1 text-[10px] uppercase tracking-widest text-jade-500">
                          Hiệu ứng bị động
                        </div>
                        <ul className="space-y-1">
                          {selectedSkill.passive_effects.map((eff, i) => (
                            <li
                              key={i}
                              className="rounded border border-gold-700/20 bg-ink-700/40 px-2 py-1 text-[12px] text-gold-300"
                            >
                              <span className="font-mono text-jade-500">{eff.type}</span>{' '}
                              <span className="font-mono text-gold-200">{eff.value}</span>
                              {eff.description && <div className="text-[11px] italic text-jade-400">— {eff.description}</div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Equip actions */}
                    <div className="border-t border-gold-700/20 pt-3">
                      {skillToSlot.has(selectedSkill.id) ? (
                        <button
                          onClick={() => unequipSkill(skillToSlot.get(selectedSkill.id)!)}
                          className="w-full rounded border border-ember-500/40 bg-ember-900/20 px-3 py-2 text-sm font-bold uppercase tracking-widest text-ember-300 hover:bg-ember-900/40"
                        >
                          Gỡ Khỏi Slot {SLOT_LABELS[skillToSlot.get(selectedSkill.id)!]}
                        </button>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="text-[10px] uppercase tracking-widest text-jade-500">
                            Trang bị vào slot
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(Object.keys(SLOT_LABELS) as SkillSlot[]).map((slot) => {
                              const allowed = canEquip(selectedSkill, slot);
                              const occupied = player.equippedSkills[slot];
                              if (!allowed) return null;
                              return (
                                <button
                                  key={slot}
                                  onClick={() => equipSkill(selectedSkill.id, slot)}
                                  className={`rounded border px-2 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                                    occupied
                                      ? 'border-gold-700/40 bg-ink-700/40 text-jade-400 hover:bg-gold-900/20'
                                      : 'border-jade-500/50 bg-jade-900/20 text-jade-300 hover:bg-jade-900/40'
                                  }`}
                                  title={occupied ? `Ghi đè: ${skills[occupied]?.name ?? '?'}` : 'Trang bị'}
                                >
                                  {SLOT_LABELS[slot]}
                                  {occupied && <span className="ml-1 text-[8px] text-ember-400">⚠</span>}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => {
                              const slot = findFirstAvailableSlot(selectedSkill);
                              if (slot) equipSkill(selectedSkill.id, slot);
                            }}
                            className="w-full rounded border border-gold-500/40 bg-gold-900/20 px-3 py-2 text-sm font-bold uppercase tracking-widest text-gold-300 hover:bg-gold-900/40"
                          >
                            ⚡ Trang bị tự động (slot trống đầu tiên)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex-shrink-0 border-t border-gold-700/30 pt-3">
            <p className="text-center text-[11px] italic text-jade-600">
              💡 Slot Combat: 2 cơ bản + 1 tuyệt kỹ · Slot Phiêu Lưu: 3 phụ trợ. Mỗi pháp thuật chỉ vào 1 slot duy nhất.
            </p>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

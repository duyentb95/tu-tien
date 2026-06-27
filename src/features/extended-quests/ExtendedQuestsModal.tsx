import { useState } from 'react';
import { useGameStore } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { EXTENDED_QUESTS } from '@data/extended-quests';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_LABEL: Record<string, { label: string; color: string }> = {
  'main-story': { label: 'Cốt Truyện', color: 'text-gold-300' },
  'cultivation': { label: 'Tu Luyện', color: 'text-spirit-300' },
  'lore': { label: 'Tri Thức', color: 'text-jade-300' },
  'romance': { label: 'Tình Cảm', color: 'text-ember-300' },
  'combat': { label: 'Chiến Đấu', color: 'text-ember-400' },
  'craft': { label: 'Luyện Khí', color: 'text-gold-400' },
  'secret': { label: 'Bí Mật', color: 'text-spirit-400' },
};

type TabKey = 'visible' | 'completed';

/**
 * Phase 17.1: Extended Quests modal — hiển thị chuỗi quest với steps + claim button.
 *
 * 2 tab:
 *  - "Đang Tu Luyện" — quests đã unlock + chưa complete
 *  - "Đã Hoàn Thành" — completed quests (có thể claim final reward)
 *
 * Hidden quest chưa unlock → ẩn hoàn toàn (không hint trừ khi user đã tiến gần unlock).
 */
export const ExtendedQuestsModal = ({ open, onClose }: Props) => {
  const extendedQuests = useGameStore((s) => s.extendedQuests);
  const claimQuestStep = useGameStore((s) => s.claimQuestStep);
  const claimQuestFinal = useGameStore((s) => s.claimQuestFinal);

  const [tab, setTab] = useState<TabKey>('visible');

  if (!open) return null;

  // Filter quests: chỉ hiện những cái unlocked
  const unlockedQuests = EXTENDED_QUESTS.filter(
    (q) => extendedQuests.progress[q.id]?.unlocked,
  );
  const activeQuests = unlockedQuests.filter((q) => !extendedQuests.progress[q.id]?.completed);
  const completedQuests = unlockedQuests.filter((q) => extendedQuests.progress[q.id]?.completed);

  const visibleList = tab === 'visible' ? activeQuests : completedQuests;

  // Hint cho hidden quest chưa unlock (chỉ hiện count, không tên)
  const hiddenLocked = EXTENDED_QUESTS.filter(
    (q) => q.hidden && !extendedQuests.progress[q.id]?.unlocked,
  );

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Nhiệm vụ chuỗi"
    >
      <div className="w-full max-w-3xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <Bracketed className="flex max-h-[88vh] flex-col rounded-md border bg-ink-700 p-5 sm:p-6" tone="spirit">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between border-b border-gold-700/30 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold tracking-wide text-spirit-200">
                <span aria-hidden>✦</span> Nhiệm Vụ Chuỗi
              </h2>
              <p className="mt-1 text-[12px] italic text-jade-400">
                Chuỗi quest multi-step · Hoàn thành để nhận đại thưởng pháp bảo
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest text-jade-500 hover:text-gold-300"
            >
              × Đóng
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-3 flex flex-shrink-0 border-b border-gold-700/30">
            <TabButton active={tab === 'visible'} onClick={() => setTab('visible')}
              label={`Đang Tu Luyện (${activeQuests.length})`} />
            <TabButton active={tab === 'completed'} onClick={() => setTab('completed')}
              label={`Đã Hoàn Thành (${completedQuests.length})`} />
          </div>

          {/* Content */}
          <div className="custom-scroll flex-grow space-y-3 overflow-y-auto pr-1">
            {visibleList.length === 0 ? (
              <p className="py-10 text-center italic text-jade-500">
                {tab === 'visible'
                  ? 'Chưa có chuỗi quest đang mở. Tiếp tục chơi để unlock.'
                  : 'Chưa có quest nào hoàn thành.'}
              </p>
            ) : (
              visibleList.map((tpl) => {
                const p = extendedQuests.progress[tpl.id]!;
                const cat = CATEGORY_LABEL[tpl.category] ?? CATEGORY_LABEL['main-story']!;
                return (
                  <div
                    key={tpl.id}
                    className={`rounded border p-4 ${
                      p.completed
                        ? 'border-gold-500/50 bg-gold-900/15'
                        : 'border-gold-700/30 bg-ink-900/40'
                    }`}
                  >
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif text-base font-bold text-gold-200">
                            {tpl.title}
                          </h3>
                          <span className={`rounded-sm border border-current/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${cat.color}`}>
                            {cat.label}
                          </span>
                          {tpl.hidden && (
                            <span className="rounded-sm border border-spirit-500/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-spirit-400">
                              Ẩn
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[12px] italic text-jade-300">{tpl.description}</p>
                      </div>
                    </div>

                    {/* Steps progress */}
                    <div className="mb-3 space-y-1.5">
                      {tpl.steps.map((step, idx) => {
                        const stepDone = idx < p.currentStep;
                        const stepClaimed = p.claimedSteps.includes(idx);
                        const stepCurrent = idx === p.currentStep;
                        return (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 rounded border px-2 py-1.5 ${
                              stepDone
                                ? stepClaimed
                                  ? 'border-jade-700/30 bg-jade-900/10 opacity-60'
                                  : 'border-gold-500/50 bg-gold-900/20'
                                : stepCurrent
                                ? 'border-spirit-500/40 bg-spirit-900/15'
                                : 'border-gold-700/20 bg-ink-800/30 opacity-50'
                            }`}
                          >
                            <span className="flex-shrink-0 mt-0.5 text-base">
                              {stepDone ? (stepClaimed ? '✓' : '🎁') : stepCurrent ? '◷' : '○'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-[12.5px] font-medium ${stepDone ? 'text-gold-200' : 'text-jade-300'}`}>
                                  {idx + 1}. {step.title}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10.5px] text-jade-500">
                                    💎 +{step.reward.tienNgoc ?? 0}
                                    {step.reward.actionTokens ? ` · ⚡ +${step.reward.actionTokens}` : ''}
                                  </span>
                                  {stepDone && !stepClaimed && (
                                    <button
                                      onClick={() => claimQuestStep(tpl.id, idx)}
                                      className="rounded border border-gold-500/50 bg-gold-900/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold-200 hover:bg-gold-900/50"
                                    >
                                      Nhận
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] text-jade-400">{step.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Final reward */}
                    <div className={`rounded border p-2 ${
                      p.completed
                        ? 'border-gold-500/60 bg-gold-900/30'
                        : 'border-gold-700/20 bg-ink-900/40'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-jade-500">
                            ✦✦✦ Đại Thưởng
                          </div>
                          <div className="font-mono text-[12px] text-gold-300">
                            {tpl.finalReward.tienNgoc && <>💎 +{tpl.finalReward.tienNgoc.toLocaleString()} </>}
                            {tpl.finalReward.actionTokens ? <>· ⚡ +{tpl.finalReward.actionTokens} </> : null}
                            {tpl.finalReward.itemName && (
                              <span className="text-spirit-300">· {tpl.finalReward.itemName} [{tpl.finalReward.itemRarity}]</span>
                            )}
                          </div>
                        </div>
                        {p.completed && !p.claimedFinal && (
                          <button
                            onClick={() => claimQuestFinal(tpl.id)}
                            className="rounded border border-gold-400 bg-gold-700/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gold-100 hover:bg-gold-700/50 shadow-[0_0_12px_rgba(218,178,98,.4)]"
                          >
                            ✦ Lĩnh Thưởng
                          </button>
                        )}
                        {p.claimedFinal && (
                          <span className="rounded border border-jade-500/40 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-jade-400">
                            ✓ Đã lĩnh
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Hidden quests hint (chỉ hiện ở tab Đang Tu Luyện) */}
            {tab === 'visible' && hiddenLocked.length > 0 && (
              <div className="rounded border border-dashed border-jade-700/40 bg-jade-900/10 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-spirit-400">???</span>
                  <span className="text-[12px] font-bold uppercase tracking-widest text-jade-400">
                    Còn {hiddenLocked.length} chuỗi quest ẩn chưa khám phá
                  </span>
                </div>
                <p className="text-[11px] italic text-jade-500">
                  Tu luyện sâu hơn, khám phá nhiều hơn, kết duyên với thế giới — Thiên Đạo sẽ mở thiên cơ cho người có duyên.
                </p>
              </div>
            )}
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-3 py-2 text-[11.5px] font-bold uppercase tracking-widest transition-colors ${
      active
        ? 'border-b-2 border-spirit-500 bg-spirit-900/10 text-spirit-200'
        : 'border-b border-transparent text-jade-500 hover:text-spirit-300'
    }`}
  >
    {label}
  </button>
);

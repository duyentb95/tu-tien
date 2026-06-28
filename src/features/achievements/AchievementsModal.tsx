import { useState, useMemo } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { useKeyboard } from '@shared/hooks/useKeyboard';
import { useGameStore } from '@state/game-store';
import { ACHIEVEMENTS, DAILY_MISSIONS, type Achievement } from '@data/achievements';
import { computeAchievementProgress, isAchievementUnlocked } from '@core/achievements/check-unlocks';

interface Props { open: boolean; onClose: () => void }
type Tab = 'achievements' | 'daily';

const TIER_COLOR: Record<Achievement['tier'], string> = {
  bronze: 'var(--ember-500)',
  silver: 'var(--jade-300)',
  gold: 'var(--gold-500)',
  legendary: 'var(--spirit-400)',
};

const TIER_LABEL: Record<Achievement['tier'], string> = {
  bronze: 'Đồng', silver: 'Bạc', gold: 'Vàng', legendary: 'Truyền Thuyết',
};

export const AchievementsModal = ({ open, onClose }: Props) => {
  const player = useGameStore((s) => s.player);
  const turn = useGameStore((s) => s.turn);
  const knowledge = useGameStore((s) => s.knowledge);
  const sectMembership = useGameStore((s) => s.sectMembership);
  const spiritBeasts = useGameStore((s) => s.spiritBeasts);
  const quests = useGameStore((s) => s.quests);
  const daoLu = useGameStore((s) => s.daoLu);
  const [tab, setTab] = useState<Tab>('achievements');

  useKeyboard({ Escape: onClose }, [onClose], open);

  // Compute progress (pure helper trong core/ — share với store action notify hook)
  const progress = useMemo(() => computeAchievementProgress({
    playerLevel: player?.level ?? 0,
    playerCurrency: player?.currency ?? 0,
    turn,
    realmBreaks: knowledge.eventHistory.filter((e) => e.kind === 'realm_break').length,
    tribulations: knowledge.eventHistory.filter((e) => e.kind === 'tribulation').length,
    beastCount: Object.keys(spiritBeasts).length,
    questCompleted: Object.values(quests).filter((q) => q.status === 'completed').length,
    daoLuPartnered: Object.values(daoLu).filter((c) => c.isPartner).length,
    sectJoined: !!sectMembership,
    locationVisited: Object.values(knowledge.locations).filter((l) => l.visitedByPlayer).length,
  }), [player, turn, knowledge, sectMembership, spiritBeasts, quests, daoLu]);

  const isUnlocked = (a: Achievement): boolean => isAchievementUnlocked(a, progress);

  const groupedByCat = useMemo(() => {
    const map: Record<string, Achievement[]> = {};
    for (const a of ACHIEVEMENTS) {
      if (!map[a.category]) map[a.category] = [];
      map[a.category]!.push(a);
    }
    return map;
  }, []);

  const unlockedCount = ACHIEVEMENTS.filter(isUnlocked).length;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        <Bracketed className="rounded-md border bg-ink-700" tone="gold">
          <div className="flex flex-col" style={{ maxHeight: '85vh' }}>
            <header className="flex items-start justify-between border-b border-gold-700/15 px-6 py-4">
              <div>
                <div className="label-section mb-1">Công Đức · Thành Tựu</div>
                <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-gold-200">
                  Thành Tựu & Nhiệm Vụ Hàng Ngày
                </h2>
                <p className="mt-1 text-[12px] italic text-jade-500">
                  Đã đạt: <span className="font-mono text-gold-300">{unlockedCount} / {ACHIEVEMENTS.length}</span> thành tựu
                </p>
              </div>
              <button onClick={onClose} className="rounded-sm p-2 text-2xl text-gold-300 hover:text-gold-100" aria-label="Đóng">⊗</button>
            </header>

            <nav className="flex gap-1 border-b border-gold-700/10 px-4 py-2">
              <TabBtn active={tab === 'achievements'} label={`Thành Tựu (${unlockedCount}/${ACHIEVEMENTS.length})`} onClick={() => setTab('achievements')} />
              <TabBtn active={tab === 'daily'} label={`Nhiệm Vụ Hôm Nay (${DAILY_MISSIONS.length})`} onClick={() => setTab('daily')} />
            </nav>

            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '65vh' }}>
              {tab === 'achievements' && (
                <div className="space-y-5">
                  {Object.entries(groupedByCat).map(([cat, achievements]) => (
                    <div key={cat}>
                      <div className="label-gold mb-2">{categoryLabel(cat)}</div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {achievements.map((a) => (
                          <AchievementCard key={a.id} achievement={a} unlocked={isUnlocked(a)} progress={progress} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'daily' && (
                <div className="space-y-2">
                  <p className="mb-3 text-[12px] italic text-jade-500">
                    Reset mỗi 24 giờ thật. Hoàn thành để nhận thưởng. (Tracker daily đang được wiring trong release tiếp theo — UI preview only.)
                  </p>
                  {DAILY_MISSIONS.map((d) => (
                    <div key={d.id} className="rounded-sm border border-gold-700/20 bg-ink-800/40 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{d.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-serif text-[14px] text-gold-200">{d.title}</h4>
                          <p className="text-[12px] text-jade-400">{d.description}</p>
                        </div>
                        <div className="text-right text-[11px]">
                          <div className="text-gold-500">+{d.reward.currency} 🪙</div>
                          <div className="text-leaf-500">+{d.reward.ep} EP</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

const categoryLabel = (cat: string): string => {
  switch (cat) {
    case 'cultivation': return '✦ Tu Luyện';
    case 'combat': return '⚔ Chiến Đấu';
    case 'society': return '◈ Xã Hội';
    case 'exploration': return '◉ Khám Phá';
    case 'collection': return '◆ Sưu Tập';
    default: return cat;
  }
};

const TabBtn = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="rounded-sm px-3 py-2 text-[12.5px] transition-colors whitespace-nowrap"
    style={{
      color: active ? 'var(--gold-100)' : 'var(--gold-300)',
      background: active ? 'rgba(205,164,94,.1)' : 'transparent',
      borderBottom: active ? '2px solid var(--gold-500)' : '2px solid transparent',
      minHeight: 40,
    }}
  >
    {label}
  </button>
);

const AchievementCard = ({ achievement: a, unlocked, progress }: {
  achievement: Achievement;
  unlocked: boolean;
  progress: Record<string, number>;
}) => {
  const tierColor = TIER_COLOR[a.tier];
  const currentValue = a.trigger ? (progress[a.trigger.kind] ?? 0) : 0;
  const target = a.trigger?.threshold ?? 1;
  const pct = Math.min(100, (currentValue / target) * 100);

  return (
    <div
      className="rounded-sm border bg-ink-800/40 p-3 transition-colors"
      style={{
        borderColor: unlocked ? tierColor : 'rgba(205,164,94,.1)',
        opacity: unlocked ? 1 : 0.55,
      }}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-2xl" style={{ color: unlocked ? tierColor : 'var(--jade-600)' }}>
          {a.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate font-serif text-[13.5px] font-medium text-gold-200">{a.title}</h4>
            {unlocked && <span className="text-[10px] text-leaf-500">✓</span>}
          </div>
          <p className="text-[11.5px] leading-snug text-jade-400">{a.description}</p>

          {!unlocked && a.trigger && a.trigger.threshold && (
            <div className="mt-1.5">
              <div className="h-1 overflow-hidden rounded-full bg-ink-800">
                <div className="h-full" style={{ width: `${pct}%`, background: tierColor }} />
              </div>
              <div className="mt-0.5 text-right font-mono text-[10px] text-jade-500">
                {currentValue} / {target}
              </div>
            </div>
          )}

          <div className="mt-1.5 flex items-center gap-2 text-[10.5px]">
            <span style={{ color: tierColor }} className="uppercase tracking-wider">{TIER_LABEL[a.tier]}</span>
            {a.reward.currency && <span className="text-gold-500">+{a.reward.currency} 🪙</span>}
            {a.reward.ep && <span className="text-leaf-500">+{a.reward.ep} EP</span>}
            {a.reward.itemName && <span className="italic text-spirit-300">{a.reward.itemName}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

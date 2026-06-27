import { useEffect } from 'react';
import { useGameStore } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { DAILY_MISSIONS_POOL } from '@data/daily-missions-pool';
import { getStreakMultiplier, getDailyLoginReward } from '@gametypes/daily-mission';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_ICON: Record<string, string> = {
  'daily-login': '📅',
  'action': '⚡',
  'combat': '⚔',
  'progression': '✦',
  'social': '☘',
  'exploration': '◉',
};

/**
 * Phase 16.3: Daily Missions Modal — điểm danh + 3 nhiệm vụ + streak bonus.
 *
 * Auto-call refreshDailyMissions khi mount để check daily reset + cộng login reward.
 */
export const DailyMissionsModal = ({ open, onClose }: Props) => {
  const dailyMissions = useGameStore((s) => s.dailyMissions);
  const refreshDailyMissions = useGameStore((s) => s.refreshDailyMissions);
  const claimDailyMission = useGameStore((s) => s.claimDailyMission);

  // Refresh khi mount để trigger daily reset + login bonus
  useEffect(() => {
    if (open) refreshDailyMissions();
  }, [open, refreshDailyMissions]);

  if (!open) return null;

  const { loginStreak, todayMissions, totalCompleted } = dailyMissions;
  const streakMul = getStreakMultiplier(loginStreak);
  const todayLoginReward = getDailyLoginReward(loginStreak);

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Nhiệm vụ hàng ngày"
    >
      <div className="w-full max-w-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <Bracketed className="flex max-h-[88vh] flex-col rounded-md border bg-ink-700 p-5 sm:p-6" tone="gold">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between border-b border-gold-700/30 pb-3">
            <div>
              <h2 className="font-serif text-xl font-bold tracking-wide text-gold-200">
                <span aria-hidden>📅</span> Nhiệm Vụ Hàng Ngày
              </h2>
              <p className="mt-1 text-[12px] italic text-jade-400">
                Điểm danh + 3 nhiệm vụ mới mỗi ngày · Reset 00:00
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-widest text-jade-500 hover:text-gold-300"
            >
              × Đóng
            </button>
          </div>

          {/* Login streak header */}
          <div className="mb-3 rounded border border-spirit-500/40 bg-spirit-900/15 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-jade-500">Chuỗi điểm danh</div>
                <div className="font-serif text-xl font-bold text-spirit-200">
                  {loginStreak >= 7 && '🔥 '}
                  {loginStreak} ngày liên tiếp
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-jade-500">Hệ số thưởng</div>
                <div className={`font-mono text-lg font-bold ${streakMul >= 2 ? 'text-gold-200' : 'text-jade-300'}`}>
                  ×{streakMul.toFixed(1)}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-jade-400">
                Hôm nay nhận: <strong className="text-gold-300">+{todayLoginReward.tienNgoc} 💎</strong>
                {todayLoginReward.actionTokens > 0 && (
                  <> + <strong className="text-spirit-300">{todayLoginReward.actionTokens} ⚡</strong></>
                )}
              </span>
              <span className="text-jade-600">Tổng đã hoàn: {totalCompleted}</span>
            </div>
            <div className="mt-2">
              <StreakProgressBar streak={loginStreak} />
            </div>
          </div>

          {/* Missions list */}
          <div className="custom-scroll flex-grow space-y-2 overflow-y-auto pr-1">
            {todayMissions.length === 0 ? (
              <p className="py-6 text-center italic text-jade-500">
                Chưa có nhiệm vụ. Refresh trang để roll.
              </p>
            ) : (
              todayMissions.map((mission) => {
                const template = DAILY_MISSIONS_POOL.find((t) => t.id === mission.templateId);
                if (!template) return null;
                const complete = mission.progress >= template.target;
                const icon = CATEGORY_ICON[template.category] ?? '◆';
                const progressPct = Math.min(100, (mission.progress / template.target) * 100);
                return (
                  <div
                    key={mission.templateId}
                    className={`rounded border p-3 ${
                      mission.claimed
                        ? 'border-jade-700/30 bg-jade-900/10 opacity-60'
                        : complete
                        ? 'border-gold-500/50 bg-gold-900/20'
                        : 'border-gold-700/30 bg-ink-900/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-xl">{icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-serif text-[14px] font-bold text-gold-200">{template.title}</h4>
                          <span className="font-mono text-[10px] text-jade-500">
                            {mission.progress}/{template.target}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-jade-400">{template.description}</p>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              complete ? 'bg-gold-500' : 'bg-spirit-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex gap-2 text-[11px]">
                            {template.reward.tienNgoc && (
                              <span className="text-gold-300">💎 +{template.reward.tienNgoc}</span>
                            )}
                            {template.reward.actionTokens && (
                              <span className="text-spirit-300">⚡ +{template.reward.actionTokens}</span>
                            )}
                          </div>
                          {mission.claimed ? (
                            <span className="rounded-sm border border-jade-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-jade-400">
                              ✓ Đã nhận
                            </span>
                          ) : (
                            <button
                              onClick={() => claimDailyMission(mission.templateId)}
                              disabled={!complete}
                              className="rounded border border-gold-500/40 bg-gold-900/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-300 hover:bg-gold-900/40 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {complete ? 'Nhận thưởng' : 'Chưa xong'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div className="mt-3 rounded border border-jade-700/30 bg-jade-900/10 p-2 text-[11px] italic text-jade-400">
            💡 Streak ngày liên tiếp tăng hệ số thưởng: 3 ngày ×1.2 · 7 ngày ×1.5 · 14 ngày ×2.0 · 30 ngày ×3.0
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

const StreakProgressBar = ({ streak }: { streak: number }) => {
  const milestones = [3, 7, 14, 30];
  const nextMilestone = milestones.find((m) => m > streak) ?? 30;
  const prevMilestone = milestones.filter((m) => m <= streak).pop() ?? 0;
  const pct = Math.min(100, ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100);
  return (
    <div className="space-y-1">
      <div className="h-1 overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full bg-gradient-to-r from-spirit-500 to-gold-500 transition-all"
          style={{ width: `${streak >= 30 ? 100 : pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-jade-600">
        <span>0</span>
        <span className={streak >= 3 ? 'text-spirit-400' : ''}>3 (×1.2)</span>
        <span className={streak >= 7 ? 'text-gold-400' : ''}>7 (×1.5)</span>
        <span className={streak >= 14 ? 'text-gold-300' : ''}>14 (×2)</span>
        <span className={streak >= 30 ? 'text-ember-300' : ''}>30 (×3)</span>
      </div>
    </div>
  );
};

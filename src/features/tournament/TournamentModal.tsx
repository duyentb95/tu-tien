import { useState, useMemo } from 'react';
import { Bracketed } from '@shared/components/CornerBracket';
import { useKeyboard } from '@shared/hooks/useKeyboard';
import { useGameStore } from '@state/game-store';
import { createBracket, advanceBracket } from '@core/tournament/bracket-gen';
import { TOURNAMENT_REWARDS, type TournamentBracket, type TournamentParticipant } from '@gametypes/tournament';
import { notify } from '@state/notifications';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ROUND_LABEL: Record<number, string> = {
  1: 'Tứ Kết',
  2: 'Bán Kết',
  3: 'Chung Kết',
};

export const TournamentModal = ({ open, onClose }: Props) => {
  const player = useGameStore((s) => s.player);
  const sectMembership = useGameStore((s) => s.sectMembership);
  const turn = useGameStore((s) => s.turn);

  const [bracket, setBracket] = useState<TournamentBracket | null>(null);
  const [advancing, setAdvancing] = useState(false);

  useKeyboard({ Escape: onClose }, [onClose], open);

  const playerParticipant: TournamentParticipant | null = useMemo(() => {
    if (!player) return null;
    return {
      id: 'player',
      name: player.Name,
      level: player.level,
      power: player.level * 10 + player.finalStats.atk + player.finalStats.def,
      isPlayer: true,
      archetype: player.personality ?? '',
    };
  }, [player]);

  const handleStart = () => {
    if (!playerParticipant || !sectMembership) return;
    const b = createBracket(sectMembership.sectId, playerParticipant, turn);
    b.status = 'in_progress';
    setBracket(b);
    notify.info('Nội Môn Đại Hội', 'Tứ kết đã bắt đầu — nhấn "Diễn ra trận" để xem');
  };

  const handleAdvance = async () => {
    if (!bracket || bracket.status === 'completed') return;
    setAdvancing(true);
    // Small delay for drama
    await new Promise((r) => setTimeout(r, 800));
    const next = advanceBracket(bracket);
    setBracket(next);
    setAdvancing(false);

    if (next.status === 'completed') {
      const rank = next.playerRank ?? 8;
      const reward = TOURNAMENT_REWARDS.find((r) => r.rank === rank);
      if (reward) {
        const store = useGameStore.getState();
        store.updateSettings({}); // no-op trigger
        // Apply reward via dispatch-like
        notify.epic(`Đại Hội Kết Thúc — Hạng ${rank}`, `Thưởng: ${reward.contribution} cống hiến + ${reward.currency} linh thạch${reward.itemName ? ` + ${reward.itemName}` : ''}`);
        // Actually mutate state
        useGameStore.setState((s) => {
          if (s.player) s.player.currency += reward.currency;
          if (s.sectMembership) s.sectMembership.contribution += reward.contribution;
          s.knowledge.eventHistory.push({
            timestamp: Date.now(),
            turn: s.turn,
            kind: 'custom',
            summary: `Nội Môn Đại Hội — đạt hạng ${rank}`,
          });
        });
      }
    }
  };

  if (!open) return null;

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
        style={{ maxHeight: '90vh' }}
      >
        <Bracketed className="rounded-md border bg-ink-700" tone="gold">
          <div className="flex flex-col" style={{ maxHeight: '85vh' }}>
            <header className="flex items-start justify-between border-b border-gold-700/15 px-6 py-4">
              <div>
                <div className="label-section mb-1">Tông Môn · Tỉ Thí</div>
                <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-gold-200">
                  Nội Môn Đại Hội
                </h2>
                <p className="mt-1 text-[12px] italic text-jade-500">
                  Bracket 8 người · 7 NPC + ngươi · Single-elim · Top 4 nhận thưởng lớn
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-sm p-2 text-2xl text-gold-300 transition-colors hover:text-gold-100"
                aria-label="Đóng (Esc)"
              >
                ⊗
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '70vh' }}>
              {!sectMembership && (
                <p className="rounded-sm border border-ember-500/30 bg-ember-500/5 p-4 text-center text-[13px] text-ember-200">
                  Ngươi chưa gia nhập tông môn. Vào Tông Môn → gia nhập trước khi tham gia đại hội.
                </p>
              )}

              {sectMembership && !bracket && (
                <div className="text-center">
                  <p className="mb-4 text-[14px] text-gold-300">
                    Tỉ thí định kỳ giữa nội môn đệ tử. Thắng càng cao càng nhiều cống hiến.
                  </p>
                  <div className="mb-5 rounded-sm border border-gold-700/15 bg-ink-800/40 p-4">
                    <div className="label-section mb-2">Phần Thưởng</div>
                    <table className="w-full text-[12.5px]">
                      <thead>
                        <tr className="text-jade-500">
                          <th className="text-left">Hạng</th>
                          <th className="text-right">Cống hiến</th>
                          <th className="text-right">Linh thạch</th>
                          <th className="text-left pl-3">Pháp khí</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TOURNAMENT_REWARDS.map((r) => (
                          <tr key={r.rank} className="border-t border-gold-700/10">
                            <td className="py-1 text-gold-200">{r.rank}</td>
                            <td className="text-right font-mono text-gold-300">{r.contribution}</td>
                            <td className="text-right font-mono text-gold-500">{r.currency}</td>
                            <td className="pl-3 text-gold-300/80 italic">{r.itemName ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={handleStart} className="btn-primary text-[14px]" style={{ minWidth: 240 }}>
                    ✦ Tham Gia Đại Hội
                  </button>
                </div>
              )}

              {bracket && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="label-gold">
                        {bracket.status === 'completed'
                          ? `Đại Hội Kết Thúc — Hạng ${bracket.playerRank}`
                          : `Vòng ${bracket.currentRound}/3 · ${ROUND_LABEL[bracket.currentRound] ?? ''}`}
                      </div>
                    </div>
                    {bracket.status !== 'completed' && (
                      <button
                        onClick={handleAdvance}
                        disabled={advancing}
                        className="btn-primary text-[13px]"
                      >
                        {advancing ? 'Đang thi đấu...' : `▶ Diễn ra ${ROUND_LABEL[bracket.currentRound] ?? 'trận'}`}
                      </button>
                    )}
                  </div>

                  {/* Bracket rounds */}
                  <div className="grid gap-4 lg:grid-cols-3">
                    {[1, 2, 3].map((round) => {
                      const matches = bracket.matches.filter((m) => m.round === round);
                      if (matches.length === 0) return (
                        <div key={round} className="rounded-sm border border-gold-700/10 p-3 text-center text-[11px] italic text-jade-700">
                          {ROUND_LABEL[round]} chưa diễn ra
                        </div>
                      );
                      return (
                        <div key={round}>
                          <div className="label-section mb-2 text-center">{ROUND_LABEL[round]}</div>
                          <div className="space-y-2">
                            {matches.map((m) => (
                              <MatchCard key={m.matchId} match={m} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

const MatchCard = ({ match }: { match: import('@gametypes/tournament').TournamentMatch }) => {
  const isCompleted = !!match.winnerId;
  return (
    <div
      className="rounded-sm border bg-ink-800/40 p-2 text-[12px]"
      style={{ borderColor: isCompleted ? 'rgba(127,174,110,.3)' : 'rgba(205,164,94,.15)' }}
    >
      <Participant participant={match.participant1} isWinner={match.winnerId === match.participant1.id} isLoser={isCompleted && match.winnerId !== match.participant1.id} />
      <div className="my-1 text-center text-[10px] text-jade-500">vs</div>
      <Participant participant={match.participant2} isWinner={match.winnerId === match.participant2.id} isLoser={isCompleted && match.winnerId !== match.participant2.id} />
    </div>
  );
};

const Participant = ({ participant: p, isWinner, isLoser }: { participant: TournamentParticipant; isWinner?: boolean; isLoser?: boolean }) => (
  <div
    className="flex items-center justify-between rounded-sm px-2 py-1"
    style={{
      background: isWinner ? 'rgba(127,174,110,.1)' : isLoser ? 'rgba(80,80,80,.1)' : 'transparent',
      opacity: isLoser ? 0.5 : 1,
    }}
  >
    <span className={`truncate ${p.isPlayer ? 'font-semibold text-gold-100' : 'text-gold-300'}`}>
      {p.isPlayer ? '★ ' : ''}{p.name}
    </span>
    <span className="ml-2 font-mono text-[10px] text-jade-500">Lv{p.level}</span>
    {isWinner && <span className="ml-1 text-leaf-500">✓</span>}
  </div>
);

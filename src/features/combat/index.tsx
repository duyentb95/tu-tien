import { useEffect, useState } from 'react';
import { useGameStore, selectCombat } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { LottiePlayer } from '@shared/components/LottiePlayer';
import qiCircle from '@/lottie/qi-circle.json';
import type { SkillAction } from '@core/combat/session';
import { findTemplateByEnemyName } from '@data/default-beasts';

export const CombatScreen = () => {
  const combat = useGameStore(selectCombat);
  const action = useGameStore((s) => s.combatPlayerAction);
  const attemptCapture = useGameStore((s) => s.attemptCaptureBeast);
  const [castFlash, setCastFlash] = useState<{ key: number; side: 'player' | 'enemy' } | null>(null);

  // Trigger flash mỗi khi log có damage entry mới
  useEffect(() => {
    if (!combat || combat.log.length === 0) return;
    const last = combat.log[combat.log.length - 1]!;
    if (last.kind === 'damage' && !last.dodged) {
      const isPlayerHit = !!last.targetId && combat.combatants.find((c) => c.id === last.targetId)?.isPlayer;
      setCastFlash({ key: Date.now(), side: isPlayerHit ? 'player' : 'enemy' });
      const t = setTimeout(() => setCastFlash(null), 1400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [combat?.log.length, combat]);

  const handleAction = (a: SkillAction) => {
    setCastFlash({ key: Date.now(), side: 'enemy' });
    action(a);
  };

  if (!combat) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Bracketed className="p-8 text-center">
          <p className="text-jade-400">Không có trận chiến nào đang diễn ra.</p>
        </Bracketed>
      </div>
    );
  }

  const player = combat.combatants.find((c) => c.isPlayer)!;
  const enemies = combat.combatants.filter((c) => !c.isPlayer);
  const currentActor = combat.combatants[combat.initiative[combat.currentTurnIdx]!]!;
  const isPlayerTurn = currentActor.isPlayer && combat.status === 'ongoing';

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <header className="mb-6 flex items-end justify-between border-b border-gold-700/15 pb-4">
        <div>
          <div className="label-section mb-2">Chiến Đấu · Round {combat.round}</div>
          <h1 className="font-serif text-[28px] font-semibold text-gold-200">COMBAT</h1>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wider text-jade-500">Lượt</div>
          <div className="font-mono text-2xl text-gold-500">{combat.turn}</div>
        </div>
      </header>

      {/* Arena */}
      <div className="relative grid gap-5 lg:grid-cols-2">
        {/* Qi-circle flash overlay khi cast / chịu đòn */}
        {castFlash && (
          <div
            key={castFlash.key}
            aria-hidden
            className="pointer-events-none absolute top-1/2 z-20 -translate-y-1/2"
            style={{
              [castFlash.side === 'player' ? 'left' : 'right']: '15%',
              width: 256,
              height: 256,
            }}
          >
            <LottiePlayer animationData={qiCircle} loop={false} speed={1.6} />
          </div>
        )}
        {/* Player side */}
        <Bracketed
          tone="gold"
          className={`relative rounded-md border bg-ink-700 p-5 ${isPlayerTurn ? 'anim-glow' : ''}`}
        >
          <div className="label-section mb-2">Ngươi · Cấp {player.level}</div>
          <h2 className="font-serif text-2xl text-gold-200">{player.name}</h2>
          <div className="mt-4 space-y-3">
            <Bar label="Sinh Lực" value={player.finalStats.hp} max={player.finalStats.maxhp} color="linear-gradient(90deg, #8a2f2f, #d97757)" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
            <Stat label="ATK" value={player.finalStats.atk} />
            <Stat label="DEF" value={player.finalStats.def} />
            <Stat label="SPD" value={player.finalStats.spd} />
            <Stat label="Crit" value={`${player.finalStats.cr}%`} />
          </div>
        </Bracketed>

        {/* Enemies */}
        <div className="flex flex-col gap-3">
          {enemies.map((e) => {
            const isCurrentEnemy = combat.combatants[combat.initiative[combat.currentTurnIdx]!]!.id === e.id;
            const isAlive = e.finalStats.hp > 0;
            return (
              <Bracketed
                key={e.id}
                tone="ember"
                className={`relative rounded-md border bg-ink-700 p-5 ${isCurrentEnemy ? 'anim-glow' : ''} ${!isAlive ? 'opacity-40' : ''}`}
              >
                <div className="label-section mb-2">
                  Yêu Thú · Cấp {e.level}
                  {!isAlive && <span className="ml-2 text-blood-500">[Tử]</span>}
                </div>
                <h2 className="font-serif text-xl text-ember-200">{e.name}</h2>
                <div className="mt-3">
                  <Bar label="Sinh Lực" value={e.finalStats.hp} max={e.finalStats.maxhp} color="linear-gradient(90deg, #8a2f2f, #d97757)" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
                  <Stat label="ATK" value={e.finalStats.atk} />
                  <Stat label="DEF" value={e.finalStats.def} />
                </div>
              </Bracketed>
            );
          })}
        </div>
      </div>

      {/* Combat log */}
      <Bracketed className="mt-5 rounded-md border bg-ink-700 p-4">
        <div className="label-section mb-2">Nhật Ký Chiến Đấu</div>
        <div className="max-h-48 space-y-1 overflow-y-auto pr-2 font-mono text-[12.5px]">
          {combat.log.slice(-8).reverse().map((entry, i) => (
            <div
              key={i}
              className="border-l-2 pl-2"
              style={{
                borderColor:
                  entry.kind === 'damage'
                    ? entry.crit
                      ? 'var(--ember-500)'
                      : 'var(--gold-700)'
                    : entry.kind === 'end'
                      ? 'var(--spirit-500)'
                      : 'var(--jade-700)',
                color:
                  entry.kind === 'end'
                    ? 'var(--spirit-200)'
                    : entry.kind === 'damage' && entry.crit
                      ? 'var(--ember-200)'
                      : 'var(--gold-300)',
              }}
            >
              <span className="mr-2 text-jade-700">T{entry.turn}</span>
              {entry.text}
            </div>
          ))}
        </div>
      </Bracketed>

      {/* Action buttons */}
      {combat.status === 'ongoing' && (
        <Bracketed className="mt-4 rounded-md border bg-ink-700 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="label-gold">{isPlayerTurn ? 'Lượt của Ngươi' : `Đối thủ đang ra chiêu...`}</div>
            <div className="text-[12px] text-jade-500">Chọn hành động</div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              onClick={() => handleAction({ kind: 'attack', skillName: 'Đánh Thường' })}
              disabled={!isPlayerTurn}
              className="btn-secondary text-[13px]"
            >
              ⚔ Đánh Thường
            </button>
            <button
              onClick={() => handleAction({ kind: 'skill_basic', skillName: 'Lôi Thiểm', skillMultiplier: 1.6 })}
              disabled={!isPlayerTurn}
              className="btn-secondary text-[13px]"
            >
              ⚡ Lôi Thiểm
            </button>
            <button
              onClick={() => handleAction({ kind: 'skill_ultimate', skillName: 'Cửu Tiêu Lôi Trảm', skillMultiplier: 3.2 })}
              disabled={!isPlayerTurn}
              className="btn-primary text-[13px]"
            >
              ✦ Tuyệt Học
            </button>
            <button
              onClick={() => handleAction({ kind: 'flee' })}
              disabled={!isPlayerTurn}
              className="btn-jade text-[13px]"
            >
              ↩ Bỏ Chạy
            </button>
          </div>

          {/* Capture button — chỉ enable khi có 1 enemy còn sống và HP < 20% */}
          {(() => {
            const enemy = enemies.find((e) => e.finalStats.hp > 0);
            if (!enemy) return null;
            const tmpl = findTemplateByEnemyName(enemy.name);
            if (!tmpl) return null;
            const hpPct = (enemy.finalStats.hp / enemy.finalStats.maxhp) * 100;
            const canTry = hpPct < 20;
            return (
              <div className="mt-3 pt-3 border-t border-gold-700/15">
                <button
                  onClick={() => {
                    const r = attemptCapture(enemy.name, hpPct);
                    if (r.success) {
                      // Force enemy to 0 HP — capture replaces kill
                      handleAction({ kind: 'attack', skillName: 'Khế Ước Thành Công', skillMultiplier: 99 });
                    }
                  }}
                  disabled={!isPlayerTurn || !canTry}
                  className={canTry ? 'btn-primary w-full text-[13px]' : 'btn-jade w-full text-[12px]'}
                  style={canTry ? { background: 'linear-gradient(180deg, var(--spirit-300), var(--spirit-500))' } : {}}
                  title={canTry ? `Thử khế ước ${enemy.name}` : 'HP enemy phải < 20% mới khế ước được'}
                >
                  {canTry ? `✦ Khế Ước ${enemy.name}` : `Khế Ước (HP enemy ${hpPct.toFixed(0)}% / cần <20%)`}
                </button>
              </div>
            );
          })()}
        </Bracketed>
      )}

      {combat.status !== 'ongoing' && (
        <div className="mt-4 text-center">
          <div
            className="anim-rise font-serif text-3xl"
            style={{
              color:
                combat.status === 'player_win'
                  ? 'var(--gold-150)'
                  : combat.status === 'enemy_win'
                    ? 'var(--blood-500)'
                    : 'var(--jade-400)',
              textShadow: '0 0 16px rgba(205,164,94,.5)',
            }}
          >
            {combat.status === 'player_win'
              ? '✦ Chiến Thắng ✦'
              : combat.status === 'enemy_win'
                ? '☠ Bại Trận ☠'
                : '↩ Đã Trốn Thoát ↩'}
          </div>
        </div>
      )}
    </main>
  );
};

const Bar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-[12px]">
        <span className="text-gold-300">{label}</span>
        <span className="font-mono text-gold-200">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-800">
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between rounded-sm border border-gold-700/15 bg-ink-800/40 px-2 py-1">
    <span className="text-jade-400">{label}</span>
    <span className="font-mono text-gold-200">{value}</span>
  </div>
);

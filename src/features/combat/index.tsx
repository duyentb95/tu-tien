import { useEffect, useState } from 'react';
import { useGameStore, selectCombat } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { LottiePlayer } from '@shared/components/LottiePlayer';
import qiCircle from '@/lottie/qi-circle.json';
import type { SkillAction } from '@core/combat/session';
import { findTemplateByEnemyName } from '@data/default-beasts';
// Phase 12.1: Visual Combat FX overlay
import { FloatingDamageLayer, useCombatFX, ImpactFlash } from './VisualCombatFX';
import { SkillVFX } from './SkillVFX';

export const CombatScreen = () => {
  const combat = useGameStore(selectCombat);
  const action = useGameStore((s) => s.combatPlayerAction);
  const attemptCapture = useGameStore((s) => s.attemptCaptureBeast);
  const [castFlash, setCastFlash] = useState<{ key: number; side: 'player' | 'enemy' } | null>(null);
  // Phase 22.2: track lastest skill VFX (player + enemy sides riêng để render đè)
  const [playerVfx, setPlayerVfx] = useState<{ key: number; element?: import('@gametypes/character').Element }>({ key: 0 });
  const [enemyVfx, setEnemyVfx] = useState<{ key: number; element?: import('@gametypes/character').Element }>({ key: 0 });

  // Phase 12.1: Visual FX state — bursts, screen shake, flash
  const lastLog = combat && combat.log.length > 0 ? combat.log[combat.log.length - 1]! : null;
  const targetCombatant = lastLog?.targetId
    ? combat?.combatants.find((c) => c.id === lastLog.targetId)
    : undefined;
  const targetMaxHp = targetCombatant?.finalStats.maxhp;
  const { bursts, pushBurst, shakeKey, flashColor } = useCombatFX(lastLog, targetMaxHp);

  // Trigger flash + damage burst mỗi khi log có damage/heal entry mới
  useEffect(() => {
    if (!combat || combat.log.length === 0) return;
    const last = combat.log[combat.log.length - 1]!;
    const targetIsPlayer = !!last.targetId && combat.combatants.find((c) => c.id === last.targetId)?.isPlayer;
    const side: 'player' | 'enemy' = targetIsPlayer ? 'player' : 'enemy';

    if (last.kind === 'damage') {
      if (last.dodged) {
        pushBurst(side, 'TRÁNH', 'dodge');
      } else if (last.amount) {
        pushBurst(side, `-${last.amount}`, last.crit ? 'crit' : 'normal');
      }
      setCastFlash({ key: Date.now(), side });
      const t = setTimeout(() => setCastFlash(null), 1400);
      return () => clearTimeout(t);
    }
    if (last.kind === 'heal' && last.amount) {
      pushBurst(side, `+${last.amount}`, 'heal');
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat?.log.length]);

  const handleAction = (a: SkillAction) => {
    setCastFlash({ key: Date.now(), side: 'enemy' });
    // Phase 22.2: trigger VFX bên player → đè lên enemy panel (đánh sang)
    if (a.kind !== 'flee') {
      setEnemyVfx({ key: Date.now(), element: a.element });
    }
    action(a);
  };

  // Phase 22.2: detect enemy cast → render VFX bên player
  useEffect(() => {
    if (!combat || combat.log.length === 0) return;
    const last = combat.log[combat.log.length - 1]!;
    if (last.kind !== 'damage' || !last.actorId) return;
    const isPlayerCasting = combat.combatants.find((c) => c.id === last.actorId)?.isPlayer;
    if (isPlayerCasting === false) {
      // Enemy cast → VFX lên player side
      setPlayerVfx({ key: Date.now(), ...(last.element ? { element: last.element } : {}) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat?.log.length]);

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
    <main
      key={`shake-${shakeKey}`}
      className={`min-h-screen px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8 ${shakeKey ? 'fx-shake' : ''}`}
    >
      <ImpactFlash color={flashColor} />
      <header className="mb-4 flex items-end justify-between border-b border-gold-700/15 pb-3 sm:mb-6 sm:pb-4">
        <div>
          <div className="label-section mb-1 sm:mb-2">Chiến Đấu · Round {combat.round}</div>
          <h1 className="font-serif text-[22px] font-semibold text-gold-200 sm:text-[28px]">COMBAT</h1>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-jade-500 sm:text-[11px]">Lượt</div>
          <div className="font-mono text-xl text-gold-500 sm:text-2xl">{combat.turn}</div>
        </div>
      </header>

      {/* Arena — mobile: stack player-trên, enemy-dưới. Desktop: 2 cột */}
      <div className="relative grid gap-3 sm:gap-5 lg:grid-cols-2">
        {/* Qi-circle flash overlay — responsive size */}
        {castFlash && (
          <div
            key={castFlash.key}
            aria-hidden
            className="pointer-events-none absolute top-1/2 z-20 hidden -translate-y-1/2 sm:block"
            style={{
              [castFlash.side === 'player' ? 'left' : 'right']: '15%',
              width: 'clamp(160px, 30vw, 256px)',
              height: 'clamp(160px, 30vw, 256px)',
            }}
          >
            <LottiePlayer animationData={qiCircle} loop={false} speed={1.6} />
          </div>
        )}
        {/* Player side */}
        <Bracketed
          tone="gold"
          className={`relative rounded-md border bg-ink-700 p-4 sm:p-5 ${isPlayerTurn ? 'anim-glow' : ''}`}
        >
          <FloatingDamageLayer bursts={bursts} side="player" />
          <SkillVFX element={playerVfx.element} fxKey={playerVfx.key} />
          <div className="label-section mb-2">Ngươi · Cấp {player.level}</div>
          <h2 className="font-serif text-xl text-gold-200 sm:text-2xl">{player.name}</h2>
          <div className="mt-3 space-y-3 sm:mt-4">
            <Bar label="Sinh Lực" value={player.finalStats.hp} max={player.finalStats.maxhp} color="linear-gradient(90deg, #8a2f2f, #d97757)" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] sm:mt-4">
            <Stat label="ATK" value={player.finalStats.atk} />
            <Stat label="DEF" value={player.finalStats.def} />
            <Stat label="SPD" value={player.finalStats.spd} />
            <Stat label="Crit" value={`${player.finalStats.cr}%`} />
          </div>
        </Bracketed>

        {/* Enemies */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {enemies.map((e) => {
            const isCurrentEnemy = combat.combatants[combat.initiative[combat.currentTurnIdx]!]!.id === e.id;
            const isAlive = e.finalStats.hp > 0;
            return (
              <Bracketed
                key={e.id}
                tone="ember"
                className={`relative rounded-md border bg-ink-700 p-4 sm:p-5 ${isCurrentEnemy ? 'anim-glow' : ''} ${!isAlive ? 'opacity-40' : ''}`}
              >
                <FloatingDamageLayer bursts={bursts} side="enemy" />
                <SkillVFX element={enemyVfx.element} fxKey={enemyVfx.key} />
                <div className="label-section mb-2">
                  Yêu Thú · Cấp {e.level}
                  {!isAlive && <span className="ml-2 text-blood-500">[Tử]</span>}
                </div>
                <h2 className="font-serif text-lg text-ember-200 sm:text-xl">{e.name}</h2>
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

      {/* Phase 24.E: Combat log inline narrative — group skill + damage cùng turn thành 1 prose */}
      <Bracketed className="mt-5 rounded-md border bg-ink-700 p-4">
        <div className="label-section mb-2">Nhật Ký Chiến Đấu</div>
        <div className="max-h-48 space-y-2 overflow-y-auto pr-2 text-[12.5px]">
          {(() => {
            // Group log entries: skill + damage cùng actor + cùng turn → 1 prose line
            const recent = combat.log.slice(-12);
            const grouped: Array<{ turn: number; prose: string; isCrit?: boolean; kind: string }> = [];
            for (let i = 0; i < recent.length; i++) {
              const e = recent[i]!;
              // Skill cast → kèm damage entry sau đó
              if (e.kind === 'skill' && i + 1 < recent.length && recent[i + 1]!.kind === 'damage') {
                const dmg = recent[i + 1]!;
                const actorName = e.actorId === combat.combatants[0]?.id ? 'Ngươi' : (combat.combatants.find((c) => c.id === e.actorId)?.name ?? 'Đối thủ');
                const targetName = dmg.targetId === combat.combatants[0]?.id ? 'ngươi' : (combat.combatants.find((c) => c.id === dmg.targetId)?.name ?? 'đối thủ');
                const target = combat.combatants.find((c) => c.id === dmg.targetId);
                const remainHp = target ? `${target.finalStats.hp}/${target.finalStats.maxhp}` : '';
                const critStr = dmg.crit ? ' **BẠO KÍCH!**' : '';
                grouped.push({
                  turn: e.turn,
                  prose: `${actorName} dùng <strong>${e.skillName ?? 'kĩ năng'}</strong> → gây <strong>${dmg.amount}</strong> dmg lên ${targetName}.${critStr} (HP ${remainHp})`,
                  isCrit: dmg.crit,
                  kind: 'skill_damage',
                });
                i++; // skip next damage entry
                continue;
              }
              // Standalone entries
              if (e.kind === 'damage' && e.dodged) {
                grouped.push({ turn: e.turn, prose: `${e.text} <em>(né tránh)</em>`, kind: 'dodge' });
              } else {
                grouped.push({ turn: e.turn, prose: e.text, isCrit: e.crit, kind: e.kind });
              }
            }
            return grouped.slice(-8).reverse().map((g, i) => (
              <div
                key={i}
                className="border-l-2 pl-2 py-0.5 font-serif leading-snug"
                style={{
                  borderColor:
                    g.kind === 'skill_damage' && g.isCrit ? 'var(--ember-500)' :
                    g.kind === 'skill_damage' ? 'var(--gold-500)' :
                    g.kind === 'damage' ? 'var(--gold-700)' :
                    g.kind === 'end' ? 'var(--spirit-500)' :
                    g.kind === 'dodge' ? 'var(--jade-500)' :
                    'var(--jade-700)',
                  color:
                    g.kind === 'end' ? 'var(--spirit-200)' :
                    g.isCrit ? 'var(--ember-200)' :
                    g.kind === 'dodge' ? 'var(--jade-400)' :
                    'var(--gold-300)',
                }}
              >
                <span className="mr-2 text-jade-700 font-mono text-[10px]">T{g.turn}</span>
                <span dangerouslySetInnerHTML={{ __html: g.prose }} />
              </div>
            ));
          })()}
        </div>
      </Bracketed>

      {/* Action buttons — mobile: 2 cột, sm: 2 cột, md+: 4 cột */}
      {combat.status === 'ongoing' && (
        <Bracketed className="mt-4 rounded-md border bg-ink-700 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="label-gold text-[12px] sm:text-[13px]">{isPlayerTurn ? 'Lượt của Ngươi' : 'Đối thủ đang ra chiêu...'}</div>
            <div className="hidden text-[12px] text-jade-500 sm:block">Chọn hành động</div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <button
              onClick={() => handleAction({ kind: 'attack', skillName: 'Đánh Thường' })}
              disabled={!isPlayerTurn}
              className="btn-secondary text-[13px] sm:text-[14px]"
            >
              ⚔ <span className="ml-1">Đánh Thường</span>
            </button>
            <button
              onClick={() => handleAction({ kind: 'skill_basic', skillName: 'Lôi Thiểm', skillMultiplier: 1.6, element: 'loi' })}
              disabled={!isPlayerTurn}
              className="btn-secondary text-[13px] sm:text-[14px]"
            >
              ⚡ <span className="ml-1">Lôi Thiểm</span>
            </button>
            <button
              onClick={() => handleAction({ kind: 'skill_ultimate', skillName: 'Cửu Tiêu Lôi Trảm', skillMultiplier: 3.2, element: 'loi' })}
              disabled={!isPlayerTurn}
              className="btn-primary text-[13px] sm:text-[14px]"
            >
              ✦ <span className="ml-1">Tuyệt Học</span>
            </button>
            <button
              onClick={() => handleAction({ kind: 'flee' })}
              disabled={!isPlayerTurn}
              className="btn-jade text-[13px] sm:text-[14px]"
            >
              ↩ <span className="ml-1">Bỏ Chạy</span>
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

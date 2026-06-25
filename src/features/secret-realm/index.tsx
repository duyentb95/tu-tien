import { useMemo } from 'react';
import { useGameStore, selectSecretRealm } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import type { RoomKind } from '@gametypes/secret-realm';

const KIND_STYLE: Record<RoomKind, { color: string; bg: string; icon: string; label: string }> = {
  entry: { color: '#cda45e', bg: 'rgba(205,164,94,.15)', icon: '◉', label: 'Cửa Vào' },
  combat: { color: '#d97757', bg: 'rgba(217,119,87,.12)', icon: '⚔', label: 'Chiến' },
  treasure: { color: '#f0bd72', bg: 'rgba(240,189,114,.15)', icon: '◆', label: 'Bảo' },
  trap: { color: '#8a2f2f', bg: 'rgba(138,47,47,.18)', icon: '✖', label: 'Trận' },
  shrine: { color: '#a78bfa', bg: 'rgba(167,139,250,.15)', icon: '✦', label: 'Linh' },
  puzzle: { color: '#7fbce8', bg: 'rgba(127,188,232,.13)', icon: '☷', label: 'Đố' },
  boss: { color: '#e0654e', bg: 'rgba(224,101,78,.2)', icon: '✧', label: 'Boss' },
};

const VIEW_W = 1200;
const VIEW_H = 500;

export const SecretRealmScreen = () => {
  const sr = useGameStore(selectSecretRealm);
  const moveToRoom = useGameStore((s) => s.moveToRoom);
  const interact = useGameStore((s) => s.interactCurrentRoom);
  const exit = useGameStore((s) => s.exitSecretRealm);
  const player = useGameStore((s) => s.player);
  const turn = useGameStore((s) => s.turn);

  const rooms = useMemo(() => (sr ? Object.values(sr.rooms) : []), [sr]);
  const current = sr?.rooms[sr.currentRoomId];
  const clearedCount = rooms.filter((r) => r.cleared).length;
  const totalCount = rooms.length;

  const ttlRemaining = sr ? sr.ttlTurns - (turn - sr.createdAtTurn) : 0;

  if (!sr || !current) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Bracketed className="p-8 text-center">
          <p className="text-jade-400">Không trong bí cảnh nào.</p>
        </Bracketed>
      </div>
    );
  }

  const isBoss = current.kind === 'boss';
  const isCleared = current.cleared;
  const isBossCleared = sr.rooms[sr.bossRoomId]?.cleared ?? false;

  // Edges để vẽ
  const edges = useMemo(() => {
    const list: Array<{ a: typeof rooms[number]; b: typeof rooms[number] }> = [];
    const seen = new Set<string>();
    for (const r of rooms) {
      for (const nId of r.neighbors) {
        const n = sr.rooms[nId];
        if (!n) continue;
        const key = [r.id, n.id].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({ a: r, b: n });
      }
    }
    return list;
  }, [rooms, sr.rooms]);

  return (
    <main className="min-h-screen px-6 py-6 lg:px-10">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-gold-700/15 pb-4">
        <div>
          <div className="label-section mb-2">Bí Cảnh · Bảo Đồ</div>
          <h1 className="font-serif text-[28px] font-semibold text-spirit-200">{sr.name}</h1>
          <p className="mt-1 text-[12px] text-jade-500">
            Cấp gợi ý <span className="font-mono text-gold-300">{sr.level}</span> · Đã qua{' '}
            <span className="font-mono text-leaf-500">{clearedCount}/{totalCount}</span> phòng · Còn{' '}
            <span className={`font-mono ${ttlRemaining < 100 ? 'text-ember-200' : 'text-gold-300'}`}>
              {ttlRemaining}h
            </span>
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('Rời bí cảnh? Tiến độ sẽ mất.')) exit();
          }}
          className="btn-jade text-[13px]"
        >
          ← Rời bí cảnh
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* MAP */}
        <Bracketed className="overflow-hidden rounded-md border bg-ink-700" tone="spirit">
          <div
            className="relative"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(26,20,34,.6) 0%, rgba(10,15,10,.95) 80%)',
            }}
          >
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="block h-full w-full"
              style={{ maxHeight: 'calc(100vh - 240px)' }}
            >
              <defs>
                <pattern id="srGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(167,139,250,.05)" strokeWidth="1" />
                </pattern>
                <radialGradient id="srCurGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(167,139,250,.6)" />
                  <stop offset="100%" stopColor="rgba(167,139,250,0)" />
                </radialGradient>
              </defs>
              <rect width={VIEW_W} height={VIEW_H} fill="url(#srGrid)" />

              {/* Edges */}
              {edges.map((e, i) => {
                const aVisited = e.a.visited;
                const bVisited = e.b.visited;
                const isPath = aVisited && bVisited;
                return (
                  <line
                    key={i}
                    x1={e.a.x}
                    y1={e.a.y}
                    x2={e.b.x}
                    y2={e.b.y}
                    stroke={isPath ? 'rgba(205,164,94,.5)' : 'rgba(167,139,250,.25)'}
                    strokeWidth={isPath ? 2 : 1.5}
                    strokeDasharray={isPath ? '0' : '4,4'}
                  />
                );
              })}

              {/* Rooms */}
              {rooms.map((r) => {
                const isCurrentRoom = r.id === sr.currentRoomId;
                const style = KIND_STYLE[r.kind];
                const canMove = current.neighbors.includes(r.id);
                const radius = isCurrentRoom ? 26 : 20;
                return (
                  <g
                    key={r.id}
                    className={canMove ? 'cursor-pointer' : ''}
                    onClick={() => {
                      if (canMove) moveToRoom(r.id);
                    }}
                  >
                    {isCurrentRoom && (
                      <circle cx={r.x} cy={r.y} r={50} fill="url(#srCurGlow)" className="anim-pulse" />
                    )}
                    {canMove && !isCurrentRoom && (
                      <circle
                        cx={r.x}
                        cy={r.y}
                        r={radius + 4}
                        fill="none"
                        stroke={style.color}
                        strokeWidth={1}
                        strokeOpacity={0.5}
                        className="anim-pulse"
                      />
                    )}
                    <circle
                      cx={r.x}
                      cy={r.y}
                      r={radius}
                      fill={r.cleared ? 'rgba(10,15,10,.7)' : r.visited ? style.bg : 'rgba(10,15,10,.5)'}
                      stroke={style.color}
                      strokeWidth={isCurrentRoom ? 3 : 2}
                      opacity={r.visited ? 1 : 0.5}
                    />
                    <text
                      x={r.x}
                      y={r.y + 6}
                      textAnchor="middle"
                      fontSize={18}
                      fill={r.cleared ? 'var(--jade-700)' : style.color}
                    >
                      {r.cleared ? '✓' : style.icon}
                    </text>
                    <text
                      x={r.x}
                      y={r.y + radius + 14}
                      textAnchor="middle"
                      fontSize={10}
                      fill={isCurrentRoom ? 'var(--gold-200)' : 'var(--jade-500)'}
                      fontFamily="'Noto Serif', serif"
                      style={{ pointerEvents: 'none' }}
                    >
                      {style.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Bracketed>

        {/* DETAIL */}
        <Bracketed className="h-fit rounded-md border bg-ink-700 p-5" tone={isBoss ? 'ember' : 'gold'}>
          <div className="label-section mb-2" style={{ color: KIND_STYLE[current.kind].color }}>
            {KIND_STYLE[current.kind].icon} {KIND_STYLE[current.kind].label}
          </div>
          <h2 className="mb-2 font-serif text-xl text-gold-200">{current.name}</h2>
          <p className="mb-4 font-serif text-[13px] italic leading-relaxed text-gold-300">
            {current.description}
          </p>

          {current.payload && (
            <div className="mb-4 space-y-1.5 rounded-sm border border-gold-700/20 bg-ink-800/50 p-3 text-[12.5px]">
              {current.payload.enemyName && (
                <div className="flex justify-between">
                  <span className="text-jade-400">Đối thủ</span>
                  <span className="text-ember-200">
                    {current.payload.enemyName} <span className="font-mono text-jade-500">(Lv {current.payload.enemyLevel})</span>
                  </span>
                </div>
              )}
              {current.payload.trapHpLoss && (
                <div className="flex justify-between">
                  <span className="text-jade-400">Trap damage</span>
                  <span className="font-mono text-blood-500">-{current.payload.trapHpLoss} HP</span>
                </div>
              )}
              {current.payload.lootItems && (
                <div className="text-jade-400">
                  Bảo vật: <span className="text-gold-300">{current.payload.lootItems.map((i) => i.name).join(', ')}</span>
                </div>
              )}
              {current.payload.shrineBuff && (
                <div className="flex justify-between">
                  <span className="text-jade-400">Linh đài buff</span>
                  <span className="font-mono text-spirit-300">+{current.payload.shrineBuff.amount} {current.payload.shrineBuff.stat.toUpperCase()}</span>
                </div>
              )}
              {current.payload.expReward && (
                <div className="flex justify-between">
                  <span className="text-jade-400">EXP thưởng</span>
                  <span className="font-mono text-spirit-300">+{current.payload.expReward}</span>
                </div>
              )}
              {current.payload.currencyReward && (
                <div className="flex justify-between">
                  <span className="text-jade-400">Linh thạch</span>
                  <span className="font-mono text-gold-500">+{current.payload.currencyReward}</span>
                </div>
              )}
            </div>
          )}

          {!isCleared && current.kind !== 'entry' && (
            <button onClick={interact} className="btn-primary w-full text-[13px]">
              {current.kind === 'combat' || current.kind === 'boss' ? '⚔ Chiến đấu' :
               current.kind === 'treasure' ? '◆ Mở Bảo Khí' :
               current.kind === 'trap' ? '⚠ Vượt Qua' :
               current.kind === 'shrine' ? '✦ Tham Bái' :
               '☷ Giải Trận'}
            </button>
          )}

          {isCleared && (
            <div className="rounded-sm border border-leaf-500/30 bg-leaf-500/10 px-3 py-2 text-center text-[12px] text-leaf-500">
              ✓ Đã xử lý
            </div>
          )}

          <div className="mt-4 border-t border-gold-700/15 pt-3 text-[11px] text-jade-500">
            Click vòng tròn sáng để di chuyển phòng kề bên (cost 1 turn).
          </div>

          {isBossCleared && (
            <div className="mt-3 rounded-sm border border-gold-150/40 bg-gold-150/10 p-3 text-center">
              <div className="text-[13px] font-serif text-gold-150">✦ Bí cảnh hoàn thành ✦</div>
              <button onClick={exit} className="btn-primary mt-2 w-full text-[12px]">
                Thoát + Nhận Toàn Bộ
              </button>
            </div>
          )}
        </Bracketed>
      </div>

      {/* Player HP bar fixed */}
      {player && (
        <div className="fixed bottom-4 right-4 z-30">
          <Bracketed tone="ember" className="rounded-md border bg-ink-700 p-3" inset={4}>
            <div className="text-[11px] text-jade-400 mb-1">Sinh Lực</div>
            <div className="mb-1 flex justify-between gap-3 text-[12px]">
              <span className="font-mono text-ember-500">{player.finalStats.hp} / {player.finalStats.maxhp}</span>
            </div>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${(player.finalStats.hp / player.finalStats.maxhp) * 100}%`,
                  background: 'linear-gradient(90deg, #8a2f2f, #d97757)',
                }}
              />
            </div>
          </Bracketed>
        </div>
      )}
    </main>
  );
};

import { useMemo, useState } from 'react';
import { useGameStore } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { areNeighbors } from '@data/default-world';
import type { MapLocation } from '@data/default-world';

const TYPE_STYLE: Record<string, { color: string; icon: string; label: string }> = {
  sect: { color: '#cda45e', icon: '◈', label: 'Tông Môn' },
  city: { color: '#e8d3a1', icon: '⌂', label: 'Thành Thị' },
  wilderness: { color: '#8fc98c', icon: '☘', label: 'Hoang Dã' },
  mountain: { color: '#a8823f', icon: '⛰', label: 'Sơn Mạch' },
  ruins: { color: '#9b86b8', icon: '⚒', label: 'Phế Tích' },
  cave_abode: { color: '#7d9079', icon: '◐', label: 'Động Phủ' },
  secret_realm: { color: '#a78bfa', icon: '✦', label: 'Bí Cảnh' },
  special: { color: '#d97757', icon: '◆', label: 'Đặc Biệt' },
};

const VIEW_W = 1000;
const VIEW_H = 700;

export const WorldMapScreen = () => {
  const setStage = useGameStore((s) => s.setStage);
  const player = useGameStore((s) => s.player);
  const locations = useGameStore((s) => s.knowledge.locations);
  const travelTo = useGameStore((s) => s.travelTo);
  const isAiThinking = useGameStore((s) => s.isAiThinking);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const locArray = useMemo(() => Object.values(locations) as MapLocation[], [locations]);
  const currentId = player?.current_location_id ?? null;
  const currentLoc = currentId ? (locations[currentId] as MapLocation) : null;
  const selected = selectedId ? (locations[selectedId] as MapLocation) : null;

  // Edges: vẽ 1 lần cho mỗi cặp đã discovered
  const edges = useMemo(() => {
    const list: Array<{ a: MapLocation; b: MapLocation; canTravel: boolean }> = [];
    const seen = new Set<string>();
    for (const loc of locArray) {
      if (!loc.discoveredByPlayer) continue;
      for (const nId of loc.neighbors) {
        const n = locations[nId] as MapLocation | undefined;
        if (!n) continue;
        const key = [loc.id, n.id].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        const aDiscovered = loc.discoveredByPlayer;
        const bDiscovered = n.discoveredByPlayer;
        if (!aDiscovered && !bDiscovered) continue;
        list.push({
          a: loc,
          b: n,
          canTravel: !!currentId && (currentId === loc.id || currentId === n.id),
        });
      }
    }
    return list;
  }, [locArray, locations, currentId]);

  return (
    <main className="min-h-screen px-6 py-6 lg:px-10">
      <header className="mb-5 flex items-end justify-between border-b border-gold-700/15 pb-4">
        <div>
          <div className="label-section mb-2">Vạn Giới Đồ · Bản Đồ Thế Giới</div>
          <h1 className="font-serif text-[28px] font-semibold text-gold-200">
            {currentLoc ? `Đang ở: ${currentLoc.name}` : 'Chưa định vị'}
          </h1>
        </div>
        <button onClick={() => setStage('playing')} className="btn-jade text-[13px]">
          ← Quay lại
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* MAP SVG */}
        <Bracketed className="overflow-hidden rounded-md border bg-ink-700">
          <div
            className="relative"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(28,24,18,.4) 0%, rgba(10,15,10,.95) 80%)',
            }}
          >
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="block h-full w-full"
              style={{ maxHeight: 'calc(100vh - 280px)' }}
            >
              {/* Subtle grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(205,164,94,.04)" strokeWidth="1" />
                </pattern>
                <radialGradient id="curGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(205,164,94,.5)" />
                  <stop offset="100%" stopColor="rgba(205,164,94,0)" />
                </radialGradient>
              </defs>
              <rect width={VIEW_W} height={VIEW_H} fill="url(#grid)" />

              {/* Edges */}
              {edges.map((e, i) => (
                <line
                  key={i}
                  x1={e.a.x}
                  y1={e.a.y}
                  x2={e.b.x}
                  y2={e.b.y}
                  stroke={e.canTravel ? 'rgba(205,164,94,.45)' : 'rgba(139,168,136,.18)'}
                  strokeWidth={e.canTravel ? 2 : 1}
                  strokeDasharray={e.canTravel ? '0' : '5,5'}
                />
              ))}

              {/* Locations */}
              {locArray.map((loc) => {
                if (!loc.discoveredByPlayer) return null;
                const isCurrent = loc.id === currentId;
                const isHovered = loc.id === hoveredId;
                const isSelected = loc.id === selectedId;
                const isVisited = loc.visitedByPlayer;
                const canTravel = currentId ? areNeighbors(currentId, loc.id) : false;
                const style = TYPE_STYLE[loc.type] ?? TYPE_STYLE.special!;
                const r = isCurrent ? 22 : isHovered || isSelected ? 18 : 14;

                return (
                  <g
                    key={loc.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredId(loc.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedId(loc.id)}
                  >
                    {/* Glow nếu current */}
                    {isCurrent && (
                      <circle cx={loc.x} cy={loc.y} r={50} fill="url(#curGlow)" className="anim-pulse" />
                    )}
                    {/* Pulse ring nếu can travel */}
                    {canTravel && !isCurrent && (
                      <circle
                        cx={loc.x}
                        cy={loc.y}
                        r={r + 4}
                        fill="none"
                        stroke={style.color}
                        strokeWidth={1}
                        strokeOpacity={0.4}
                        className="anim-pulse"
                      />
                    )}
                    {/* Main node */}
                    <circle
                      cx={loc.x}
                      cy={loc.y}
                      r={r}
                      fill={isVisited ? style.color : 'rgba(10,15,10,.8)'}
                      stroke={style.color}
                      strokeWidth={isSelected ? 3 : 2}
                      opacity={isVisited ? 0.95 : 0.7}
                    />
                    {/* Icon */}
                    <text
                      x={loc.x}
                      y={loc.y + 5}
                      textAnchor="middle"
                      fontSize={r * 0.9}
                      fill={isVisited ? '#0a0f0a' : style.color}
                      fontWeight="bold"
                    >
                      {style.icon}
                    </text>
                    {/* Label */}
                    <text
                      x={loc.x}
                      y={loc.y + r + 18}
                      textAnchor="middle"
                      fontSize={13}
                      fill={isCurrent ? '#e8d3a1' : '#9fb09b'}
                      fontFamily="'Noto Serif', serif"
                      fontWeight={isCurrent ? 600 : 400}
                      style={{ pointerEvents: 'none' }}
                    >
                      {loc.name}
                    </text>
                    {loc.levelRange && (
                      <text
                        x={loc.x}
                        y={loc.y + r + 32}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#5e7a5d"
                        fontFamily="'JetBrains Mono', monospace"
                        style={{ pointerEvents: 'none' }}
                      >
                        Lv {loc.levelRange[0]}–{loc.levelRange[1]}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </Bracketed>

        {/* DETAIL PANEL */}
        <Bracketed className="h-fit rounded-md border bg-ink-700 p-5">
          {selected ? (
            <>
              <div className="label-section mb-2">
                {TYPE_STYLE[selected.type]?.label ?? selected.type}
              </div>
              <h2 className="mb-1 font-serif text-2xl text-gold-200">{selected.name}</h2>
              {selected.levelRange && (
                <div className="mb-3 font-mono text-[11px] text-jade-500">
                  Khuyến nghị Cấp {selected.levelRange[0]}–{selected.levelRange[1]}
                </div>
              )}
              <p className="mb-4 font-serif text-[13px] italic leading-relaxed text-gold-300">
                {selected.description}
              </p>

              <div className="mb-4 space-y-2 border-y border-gold-700/15 py-3 text-[12.5px]">
                <div className="flex justify-between">
                  <span className="text-jade-400">Loại</span>
                  <span style={{ color: TYPE_STYLE[selected.type]?.color }}>
                    {TYPE_STYLE[selected.type]?.icon} {TYPE_STYLE[selected.type]?.label}
                  </span>
                </div>
                {selected.travelCost && (
                  <div className="flex justify-between">
                    <span className="text-jade-400">Thời gian đi</span>
                    <span className="font-mono text-gold-300">{selected.travelCost}h</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-jade-400">Lân cận</span>
                  <span className="font-mono text-gold-300">{selected.neighbors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-jade-400">Trạng thái</span>
                  <span className={selected.visitedByPlayer ? 'text-leaf-500' : 'text-jade-500'}>
                    {selected.visitedByPlayer ? '✓ Đã đến' : '○ Chưa đến'}
                  </span>
                </div>
              </div>

              {currentId === selected.id ? (
                <div className="rounded-sm border border-gold-700/30 bg-gold-700/10 px-3 py-2 text-center text-[12px] text-gold-300">
                  Ngươi đang ở đây
                </div>
              ) : currentId && areNeighbors(currentId, selected.id) ? (
                <button
                  onClick={() => void travelTo(selected.id)}
                  disabled={isAiThinking}
                  className="btn-primary w-full text-[13px]"
                >
                  {isAiThinking ? 'Đang di chuyển…' : `Di Chuyển (${selected.travelCost ?? 4}h)`}
                </button>
              ) : (
                <div className="rounded-sm border border-blood-500/30 bg-blood-500/5 px-3 py-2 text-center text-[12px] text-jade-500">
                  Không kề nơi đang đứng — phải đi qua trung gian
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="label-section mb-3">Chỉ Dẫn</div>
              <ul className="space-y-2 text-[13px] text-gold-300">
                <li>
                  <span className="text-gold-500">◆</span> Click vào địa điểm để xem chi tiết
                </li>
                <li>
                  <span className="text-gold-500">◆</span> Chỉ di chuyển được tới nơi kề bên
                </li>
                <li>
                  <span className="text-gold-500">◆</span> Đường nét đứt = chưa đi qua
                </li>
                <li>
                  <span className="text-gold-500">◆</span> Vòng pulse vàng = nơi đang đứng
                </li>
              </ul>

              <div className="label-section mt-5 mb-2">Phân Loại</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px]">
                {Object.entries(TYPE_STYLE).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span style={{ color: v.color }}>{v.icon}</span>
                    <span className="text-jade-300">{v.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Bracketed>
      </div>
    </main>
  );
};

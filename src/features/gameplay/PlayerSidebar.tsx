import type { PlayerCharacter } from '@gametypes/character';
import type { GameTime } from '@gametypes/world';
import { getRealmInfoFromLevel } from '@core/stats/realms';
import { getLongTermStatus, SEVERITY_COLOR } from '@data/long-term-statuses';

interface Props {
  player: PlayerCharacter;
  realmList: string[];
  turn: number;
  currencyName: string;
  gameTime?: GameTime;
  weather?: string;
  ep?: number;
}

const StatRow = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
  <div className="flex items-center justify-between border-b border-gold-700/15 py-1.5 text-sm">
    <span className="text-jade-400">{label}</span>
    <span className={color ?? 'text-gold-100'}>{value}</span>
  </div>
);

const ProgressBar = ({
  value,
  max,
  color,
  label,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
}) => {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="mb-2">
      <div className="mb-1 flex justify-between text-xs text-jade-400">
        <span>{label}</span>
        <span className="font-mono">
          {value} / {max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

export const PlayerSidebar = ({ player, realmList, turn, currencyName, gameTime, weather, ep }: Props) => {
  const realmInfo = getRealmInfoFromLevel(player.level, realmList);

  // Mobile: dùng <details> collapsible (default closed) — tiết kiệm space cho StoryView
  // Desktop (lg+): full sidebar luôn mở
  return (
    <>
      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden h-fit flex-col gap-3 p-4 lg:flex panel-gold">
        <SidebarHeader player={player} realmInfo={realmInfo} />
        {gameTime && <TimeWeather gameTime={gameTime} weather={weather} />}
        <VitalBars player={player} />
        <StatusBadges player={player} />
        <StatsBlock player={player} />
        <CurrencyAp player={player} currencyName={currencyName} ep={ep} />
        <InventoryMini player={player} />
        <TurnFooter turn={turn} />
      </aside>

      {/* ─── Mobile: compact card với collapsible details ─── */}
      <aside className="panel-gold p-3 lg:hidden">
        {/* Always visible: name + 2 bars */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-celestial truncate text-base font-semibold">{player.Name}</h3>
            <p className="text-[11px] text-jade-400">
              {realmInfo.realmName} <span className="text-gold-500">T{realmInfo.realmTier}</span>
              <span className="ml-2 text-jade-600">Lượt {turn}</span>
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2 text-[11px]">
            <span className="rounded-sm border border-gold-700/20 px-2 py-1 text-gold-500">
              {currencyName}: <span className="font-mono">{player.currency.toLocaleString()}</span>
            </span>
          </div>
        </div>

        <ProgressBar
          label="Sinh Mệnh"
          value={player.finalStats.hp}
          max={player.finalStats.maxhp}
          color="linear-gradient(90deg, #8a2f2f 0%, #d97757 100%)"
        />
        <ProgressBar
          label="Tu Vi (EXP)"
          value={player.exp}
          max={player.maxExp}
          color="linear-gradient(90deg, #a78bfa 0%, #cda45e 100%)"
        />

        {/* Status badges (compact) */}
        <StatusBadges player={player} compact />

        {gameTime && <div className="mb-2 mt-1"><TimeWeather gameTime={gameTime} weather={weather} compact /></div>}

        {/* Collapsible details — full stats */}
        <details className="mt-2 border-t border-gold-700/15 pt-2">
          <summary
            className="flex cursor-pointer list-none items-center justify-between text-[12.5px] text-jade-400 transition-colors hover:text-gold-300"
            style={{ minHeight: 36 }}
          >
            <span className="flex items-center gap-1.5">
              <span style={{ color: 'var(--gold-500)' }}>▾</span>
              Xem chi tiết chỉ số
            </span>
            <span className="text-[10px] uppercase tracking-wider text-jade-500">
              {player.inventory.length} món · {player.learnedSkills.length} pháp
            </span>
          </summary>
          <div className="mt-3 space-y-3">
            <StatsBlock player={player} />
            <CurrencyAp player={player} currencyName={currencyName} ep={ep} />
            <InventoryMini player={player} />
          </div>
        </details>
      </aside>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────
// Sub-components — shared giữa mobile và desktop
// ─────────────────────────────────────────────────────────────────────

const SidebarHeader = ({
  player,
  realmInfo,
}: {
  player: PlayerCharacter;
  realmInfo: ReturnType<typeof getRealmInfoFromLevel>;
}) => (
  <div className="border-b border-gold-700/30 pb-3">
    <h3 className="text-celestial text-xl font-semibold">{player.Name}</h3>
    <p className="text-xs text-jade-400">
      {realmInfo.realmName} <span className="text-gold-500">Tầng {realmInfo.realmTier}</span>
    </p>
    <p className="mt-1 text-xs text-jade-600">{player.personality}</p>
  </div>
);

const VitalBars = ({ player }: { player: PlayerCharacter }) => (
  <div>
    <ProgressBar
      label="Sinh Mệnh"
      value={player.finalStats.hp}
      max={player.finalStats.maxhp}
      color="linear-gradient(90deg, #8a2f2f 0%, #d97757 100%)"
    />
    <ProgressBar
      label="Tu Vi (EXP)"
      value={player.exp}
      max={player.maxExp}
      color="linear-gradient(90deg, #a78bfa 0%, #cda45e 100%)"
    />
  </div>
);

const StatsBlock = ({ player }: { player: PlayerCharacter }) => (
  <div className="border-t border-gold-700/15 pt-2">
    <StatRow label="Cấp độ" value={player.level} />
    <StatRow label="Tấn công" value={player.finalStats.atk} />
    <StatRow label="Phòng thủ" value={player.finalStats.def} />
    <StatRow label="Tốc độ" value={player.finalStats.spd} />
    <StatRow label="Chí mạng" value={`${player.finalStats.cr}%`} />
  </div>
);

const CurrencyAp = ({ player, currencyName, ep }: { player: PlayerCharacter; currencyName: string; ep?: number }) => (
  <div className="border-t border-gold-700/15 pt-2">
    <StatRow label={currencyName} value={player.currency.toLocaleString()} color="text-gold-500" />
    <StatRow label="Điểm tiềm năng" value={player.ap} color="text-spirit-400" />
    {ep !== undefined && ep > 0 && (
      <StatRow label="Điểm Encounter (EP)" value={ep.toLocaleString()} color="text-leaf-500" />
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Refactor 4 components
// ─────────────────────────────────────────────────────────────

const PHASE_LABEL: Record<GameTime['phase'], string> = {
  midnight: 'Giữa đêm', dawn: 'Bình minh', morning: 'Buổi sáng',
  noon: 'Chính ngọ', afternoon: 'Buổi chiều', dusk: 'Hoàng hôn', night: 'Đêm',
};
const PHASE_ICON: Record<GameTime['phase'], string> = {
  midnight: '🌙', dawn: '🌅', morning: '☀', noon: '☉', afternoon: '🌤', dusk: '🌇', night: '🌙',
};

const TimeWeather = ({ gameTime, weather, compact }: { gameTime: GameTime; weather?: string; compact?: boolean }) => {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 text-[11px] text-jade-400">
        <span className="flex items-center gap-1">
          <span aria-hidden>{PHASE_ICON[gameTime.phase]}</span>
          <span className="font-mono">N{gameTime.year}.{String(gameTime.month).padStart(2, '0')}.{String(gameTime.day).padStart(2, '0')} · {String(gameTime.hour).padStart(2, '0')}h</span>
        </span>
        {weather && <span className="text-jade-500">{weather}</span>}
      </div>
    );
  }
  return (
    <div className="rounded-sm border border-gold-700/15 bg-ink-800/40 p-2">
      <div className="mb-1 flex items-center justify-between text-[11px] text-jade-400">
        <span className="label-section text-[10px]">Thiên Cơ</span>
        <span aria-hidden style={{ color: 'var(--gold-500)' }}>{PHASE_ICON[gameTime.phase]}</span>
      </div>
      <div className="font-mono text-[12px] text-gold-300">
        Năm {gameTime.year} · Tháng {gameTime.month} · Ngày {gameTime.day}
      </div>
      <div className="mt-0.5 flex items-center justify-between text-[11px] text-jade-400">
        <span>{PHASE_LABEL[gameTime.phase]} ({String(gameTime.hour).padStart(2, '0')}h)</span>
        {weather && <span className="text-jade-300">· {weather}</span>}
      </div>
    </div>
  );
};

const StatusBadges = ({ player, compact }: { player: PlayerCharacter; compact?: boolean }) => {
  if (!player.longTermStatuses || player.longTermStatuses.length === 0) return null;
  return (
    <div className={compact ? 'flex flex-wrap gap-1' : 'border-t border-gold-700/15 pt-2'}>
      {!compact && <div className="label-section mb-1.5">Trạng Thái Dài Hạn</div>}
      <div className="flex flex-wrap gap-1.5">
        {player.longTermStatuses.map((st) => {
          const tmpl = getLongTermStatus(st.id);
          const color = tmpl ? SEVERITY_COLOR[tmpl.severity] : 'var(--jade-500)';
          return (
            <span
              key={st.id}
              className="inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10.5px]"
              style={{ borderColor: color, color, background: 'rgba(0,0,0,0.2)' }}
              title={tmpl?.description ?? st.description}
            >
              <span aria-hidden>{tmpl?.icon ?? '⚠'}</span>
              <span>{st.name}</span>
              {st.duration_hours !== undefined && st.duration_hours > 0 && (
                <span className="text-jade-500 font-mono">{st.duration_hours}h</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const InventoryMini = ({ player }: { player: PlayerCharacter }) => (
  <div className="border-t border-gold-700/15 pt-2">
    <StatRow label="Vật phẩm" value={`${player.inventory.length} món`} />
    <StatRow label="Kỹ năng" value={`${player.learnedSkills.length} pháp`} />
  </div>
);

const TurnFooter = ({ turn }: { turn: number }) => (
  <div className="mt-auto border-t border-gold-700/15 pt-2 text-xs text-jade-600">
    Lượt: <span className="text-gold-300 font-mono">{turn}</span>
  </div>
);

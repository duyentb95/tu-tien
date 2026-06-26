import type { PlayerCharacter } from '@gametypes/character';
import { getRealmInfoFromLevel } from '@core/stats/realms';

interface Props {
  player: PlayerCharacter;
  realmList: string[];
  turn: number;
  currencyName: string;
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

export const PlayerSidebar = ({ player, realmList, turn, currencyName }: Props) => {
  const realmInfo = getRealmInfoFromLevel(player.level, realmList);

  // Mobile: dùng <details> collapsible (default closed) — tiết kiệm space cho StoryView
  // Desktop (lg+): full sidebar luôn mở
  return (
    <>
      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden h-fit flex-col gap-3 p-4 lg:flex panel-gold">
        <SidebarHeader player={player} realmInfo={realmInfo} />
        <VitalBars player={player} />
        <StatsBlock player={player} />
        <CurrencyAp player={player} currencyName={currencyName} />
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
            <CurrencyAp player={player} currencyName={currencyName} />
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

const CurrencyAp = ({ player, currencyName }: { player: PlayerCharacter; currencyName: string }) => (
  <div className="border-t border-gold-700/15 pt-2">
    <StatRow label={currencyName} value={player.currency.toLocaleString()} color="text-gold-500" />
    <StatRow label="Điểm tiềm năng" value={player.ap} color="text-spirit-400" />
  </div>
);

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

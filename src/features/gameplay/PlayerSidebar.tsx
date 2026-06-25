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
  return (
    <aside className="panel-gold flex h-fit flex-col gap-3 p-4">
      {/* Header */}
      <div className="border-b border-gold-700/30 pb-3">
        <h3 className="text-celestial text-xl font-semibold">{player.Name}</h3>
        <p className="text-xs text-jade-400">
          {realmInfo.realmName} <span className="text-gold-500">Tầng {realmInfo.realmTier}</span>
        </p>
        <p className="mt-1 text-xs text-jade-600">{player.personality}</p>
      </div>

      {/* Vital bars */}
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

      {/* Stats */}
      <div className="border-t border-gold-700/15 pt-2">
        <StatRow label="Cấp độ" value={player.level} />
        <StatRow label="Tấn công" value={player.finalStats.atk} />
        <StatRow label="Phòng thủ" value={player.finalStats.def} />
        <StatRow label="Tốc độ" value={player.finalStats.spd} />
        <StatRow label="Chí mạng" value={`${player.finalStats.cr}%`} />
      </div>

      {/* Currency + AP */}
      <div className="border-t border-gold-700/15 pt-2">
        <StatRow label={currencyName} value={player.currency.toLocaleString()} color="text-gold-500" />
        <StatRow label="Điểm tiềm năng" value={player.ap} color="text-spirit-400" />
      </div>

      {/* Inventory mini */}
      <div className="border-t border-gold-700/15 pt-2">
        <StatRow label="Vật phẩm" value={`${player.inventory.length} món`} />
        <StatRow label="Kỹ năng" value={`${player.learnedSkills.length} pháp`} />
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-gold-700/15 pt-2 text-xs text-jade-600">
        Lượt: <span className="text-gold-300 font-mono">{turn}</span>
      </div>
    </aside>
  );
};

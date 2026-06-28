import { useMemo, useState } from 'react';
import { useGameStore, selectSkills, selectInventory } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { AvatarPortrait } from '@shared/components/AvatarPortrait';
import { getRealmInfoFromLevel } from '@core/stats/realms';
import {
  getRootDisplayName,
  getRootSubtitle,
  getRootFullDescription,
  getRootCultivationTip,
  ELEMENT_DISPLAY,
} from '@core/cultivation/spiritual-roots';
import type { Rarity } from '@gametypes/item';

/** Phase 23.UX: gợi ý cách tu luyện theo công pháp hiện tại */
const getTechniqueHint = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('quyết') || n.includes('kinh') || n.includes('chân')) {
    return 'Công pháp chính — tăng tốc độ tu luyện EXP và quyết định realm progression. Tinh thông tăng khi tham thiền + đột phá cảnh giới.';
  }
  if (n.includes('thuật')) {
    return 'Thuật pháp — kỹ thuật chiến đấu hoặc bổ trợ.';
  }
  return 'Công pháp tu luyện. Tinh thông tăng dần qua tham thiền (Tu Luyện Thất) + dùng skill trong combat.';
};

const RARITY_COLORS: Record<Rarity, { border: string; bg: string; dot: string; text: string }> = {
  'Thường':      { border: 'rgba(217,211,194,.4)', bg: 'rgba(217,211,194,.05)', dot: '#d9d3c2', text: 'text-rarity-common' },
  'Tốt':         { border: 'rgba(143,201,140,.4)', bg: 'rgba(143,201,140,.06)', dot: '#8fc98c', text: 'text-rarity-good' },
  'Hiếm':        { border: 'rgba(127,188,232,.4)', bg: 'rgba(127,188,232,.07)', dot: '#7fbce8', text: 'text-rarity-rare' },
  'Cực Phẩm':    { border: 'rgba(194,166,238,.45)', bg: 'rgba(169,134,216,.1)', dot: '#c2a6ee', text: 'text-rarity-epic' },
  'Siêu Phẩm':   { border: 'rgba(240,169,142,.45)', bg: 'rgba(217,119,87,.08)', dot: '#f0a98e', text: 'text-rarity-mythic' },
  'Huyền Thoại': { border: 'rgba(224,101,78,.55)', bg: 'rgba(224,101,78,.12)', dot: '#e0654e', text: 'text-rarity-legendary' },
};

const SLOT_TYPES: { slot: 'Đầu' | 'Thân' | 'Chân' | 'Vũ khí chính' | 'Vũ khí phụ' | 'Phụ kiện 1'; label: string }[] = [
  { slot: 'Vũ khí chính', label: 'Vũ Khí Chính' },
  { slot: 'Vũ khí phụ', label: 'Phụ Kiện' },
  { slot: 'Đầu', label: 'Đầu' },
  { slot: 'Thân', label: 'Thân' },
  { slot: 'Chân', label: 'Chân' },
  { slot: 'Phụ kiện 1', label: 'Phụ Kiện 2' },
];

export const CharacterSheetScreen = () => {
  const player = useGameStore((s) => s.player);
  const realmList = useGameStore((s) => s.knowledge.realmProgressionList);
  const setStage = useGameStore((s) => s.setStage);
  const allocatePoint = useGameStore((s) => s.allocatePoint);
  const unequipItem = useGameStore((s) => s.unequipItem);
  const rerollSpiritualRoot = useGameStore((s) => s.rerollSpiritualRoot);
  const tienNgoc = useGameStore((s) => s.economy.tienNgoc);
  const inventory = useGameStore(selectInventory);
  const skills = useGameStore(selectSkills);
  const [avatarRefresh, setAvatarRefresh] = useState(0);

  const equipped = useMemo(() => {
    if (!player) return [];
    return SLOT_TYPES.map(({ slot, label }) => {
      const id = player.equippedItems[slot];
      const item = id ? inventory[id] : null;
      return { slot, label, item };
    });
  }, [player, inventory]);

  const learnedSkillObjects = useMemo(() => {
    if (!player) return [];
    return player.learnedSkills.map((id) => skills[id]).filter(Boolean);
  }, [player, skills]);

  if (!player) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Bracketed className="p-8 text-center">
          <p className="text-jade-400">Chưa có nhân vật.</p>
          <button onClick={() => setStage('initial')} className="btn-primary mt-4">
            Về trang chính
          </button>
        </Bracketed>
      </div>
    );
  }

  const realm = getRealmInfoFromLevel(player.level, realmList);
  const root = player.spiritualRoot;
  const primaryEl = root ? root.elements[0]! : null;
  const elColor = primaryEl ? ELEMENT_DISPLAY[primaryEl].color : '#cda45e';

  return (
    <main className="min-h-screen px-6 py-10 lg:px-12">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-gold-700/15 pb-5">
        <div>
          <div className="label-section mb-2">Đệ tử ngoại môn · Cấp {player.level}</div>
          <h1 className="font-serif text-[38px] font-semibold text-gold-200">{player.Name}</h1>
        </div>
        <div className="text-right">
          <div className="font-serif text-xl text-gold-500">
            {realm.realmName} Cảnh · Tầng {realm.realmTier}
          </div>
          <div className="mt-1 text-[12.5px] text-jade-300">
            Tâm cảnh: <span className="text-gold-100">{player.mentalState ?? 50}/100</span>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[288px_1fr_312px]">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <Bracketed className="overflow-hidden rounded-md border bg-ink-700">
            <div className="relative">
              <AvatarPortrait
                name={player.Name}
                {...(player.gender !== undefined ? { gender: player.gender } : {})}
                {...(player.personality !== undefined ? { personality: player.personality } : {})}
                {...(player.description !== undefined ? { description: player.description } : {})}
                {...(realm.realmName !== undefined ? { realm: realm.realmName } : {})}
                refreshKey={avatarRefresh}
                size={288}
                className="block w-full"
              />
              <button
                onClick={() => setAvatarRefresh((k) => k + 1)}
                className="absolute bottom-2 right-2 rounded-sm border border-gold-500/40 bg-ink-900/80 px-2 py-1 text-[10px] text-gold-300 backdrop-blur-sm hover:bg-ink-800/90"
                title="Sinh lại avatar qua AI"
              >
                ↻ Vẽ lại
              </button>
            </div>
          </Bracketed>

          {root && (
            <div className="panel-spirit rounded-md p-[18px]">
              <div className="label-section mb-3">Linh Căn · Thiên Phú</div>
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="h-[30px] w-[30px] flex-shrink-0 rounded-full shadow-glow-spirit"
                  style={{ background: elColor }}
                />
                <div>
                  <div className="font-serif text-base text-spirit-200">{getRootDisplayName(root)}</div>
                  <div className="text-[11.5px] text-spirit-600">{getRootSubtitle(root)}</div>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {root.elements.map((el) => (
                  <span
                    key={el}
                    className="rounded-sm border px-2 py-0.5 text-[11px]"
                    style={{
                      borderColor: `${ELEMENT_DISPLAY[el].color}66`,
                      color: ELEMENT_DISPLAY[el].color,
                      background: `${ELEMENT_DISPLAY[el].color}10`,
                    }}
                  >
                    {ELEMENT_DISPLAY[el].symbol} {ELEMENT_DISPLAY[el].name}
                  </span>
                ))}
              </div>
              <div className="flex justify-between border-t border-spirit-500/20 pt-3 text-[12.5px]">
                <span className="text-jade-300">Hệ số tu luyện</span>
                <span className="font-mono text-spirit-200">×{root.cultivationMultiplier.toFixed(1)}</span>
              </div>
              {/* Phase 23.UX: mô tả + tip + reroll button */}
              <p className="mt-3 text-[11.5px] italic text-jade-400 leading-snug">
                {getRootFullDescription(root)}
              </p>
              <p className="mt-2 text-[11px] text-spirit-400 leading-snug">
                <strong className="text-spirit-300">Cách tu luyện:</strong> {getRootCultivationTip(root)}
              </p>
              <button
                onClick={() => {
                  if (tienNgoc < 500) {
                    alert(`Cần 500 Tiên Ngọc (có ${tienNgoc}).`);
                    return;
                  }
                  if (!confirm(
                    `Tẩy linh căn? Tốn 500 Tiên Ngọc.\n\n` +
                    `Linh căn mới sẽ random hoàn toàn — có thể tốt hơn (Đơn/Dị) hoặc tệ hơn (Tứ/Ngũ). Hệ số tu luyện thay đổi vĩnh viễn cho đến khi tẩy lại.\n\n` +
                    `Hệ số hiện tại: ×${root.cultivationMultiplier.toFixed(1)}`
                  )) return;
                  rerollSpiritualRoot();
                }}
                disabled={tienNgoc < 500}
                className="mt-3 w-full rounded border border-spirit-500/50 bg-spirit-900/30 px-2 py-2 text-[11.5px] font-bold uppercase tracking-wider text-spirit-200 hover:bg-spirit-900/50 disabled:cursor-not-allowed disabled:opacity-40"
                title={tienNgoc < 500 ? `Cần 500 💎 (có ${tienNgoc})` : 'Random lại linh căn'}
              >
                ↻ Tẩy Linh Căn · 💎 500
              </button>
            </div>
          )}

          <Bracketed className="rounded-md border bg-ink-700 p-[18px]">
            <div className="label-section mb-2">Công Pháp Chính</div>
            <div className="font-serif text-base text-gold-200">
              {player.currentTechnique ?? 'Hồn Nguyên Trường Sinh Quyết'}
              {!player.currentTechnique && (
                <span className="ml-2 text-[10px] uppercase tracking-widest text-jade-500">(mặc định)</span>
              )}
            </div>
            <div className="mt-1 text-[11.5px] text-gold-500">
              Hoàng phẩm · Sơ giai · Tinh thông{' '}
              <span className="font-mono">
                {Math.min(99, Math.round((player.exp / player.maxExp) * 100))}%
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-800">
              <div
                className="h-full"
                style={{
                  width: `${(player.exp / player.maxExp) * 100}%`,
                  background: 'linear-gradient(90deg, #a78bfa, #cda45e)',
                }}
              />
            </div>
            {/* Phase 23.UX: mô tả công pháp + effect */}
            <p className="mt-3 text-[11px] italic text-jade-400 leading-snug">
              {getTechniqueHint(player.currentTechnique ?? 'Hồn Nguyên')}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[10.5px]">
              <div className="flex justify-between">
                <span className="text-jade-500">EXP / turn</span>
                <span className="font-mono text-spirit-300">
                  ×{root?.cultivationMultiplier.toFixed(1) ?? '1.0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-jade-500">Cảnh giới</span>
                <span className="font-mono text-gold-300">{realm.realmName}</span>
              </div>
            </div>
            <p className="mt-2 text-[10.5px] text-jade-500/80 italic">
              Tham thiền tại Tu Luyện Thất hoặc tham gia combat để tăng tinh thông.
            </p>
          </Bracketed>
        </div>

        {/* CENTER — Stats */}
        <Bracketed className="rounded-md border bg-ink-700 p-6 lg:p-7">
          <div className="label-gold mb-5">Chỉ Số Cốt Lõi</div>
          <div className="grid grid-cols-1 gap-y-4 gap-x-8 sm:grid-cols-2">
            <StatBar label="Sinh Lực" value={player.finalStats.hp} max={player.finalStats.maxhp} color="var(--ember-500)" />
            <StatBar label="Tu Vi" value={player.exp} max={player.maxExp} color="var(--spirit-500)" />
            <StatRow label="Tấn Công" value={player.finalStats.atk} />
            <StatRow label="Phòng Thủ" value={player.finalStats.def} />
            <StatRow label="Tốc Độ" value={player.finalStats.spd} />
            <StatRow label="Tỉ Lệ Chí Mạng" value={`${player.finalStats.cr}%`} />
            <StatRow label="ST Chí Mạng" value={`${player.finalStats.cdmg}%`} />
            <StatRow label="Khuếch Đại ST" value={`${player.finalStats.dmgAmp}%`} />
            <StatRow label="Chống Chịu" value={`${player.finalStats.dmgRes}%`} />
            <StatRow label="Né Tránh" value={`${player.finalStats.evasion}%`} />
          </div>

          <div className="mt-6 border-t border-gold-700/15 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="label-section">Phân Phối Điểm Tiềm Năng</div>
              <div className="text-sm text-jade-300">
                Còn{' '}
                <span className="font-mono text-gold-500">{player.ap} AP</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['hp', 'atk', 'def', 'spd'] as const).map((stat) => (
                <button
                  key={stat}
                  onClick={() => allocatePoint(stat, 1)}
                  disabled={player.ap === 0}
                  className="btn-secondary text-[12.5px]"
                  style={{ padding: '8px 12px' }}
                >
                  +1 {stat.toUpperCase()}{' '}
                  <span className="ml-1 font-mono text-[10px] text-jade-500">
                    ({player.allocatedPoints[stat]})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Phase 20: Lifetime stats — Thiên Cơ Toán */}
          <LifetimeStatsPanel />
        </Bracketed>

        {/* RIGHT — Equipment + Skills */}
        <Bracketed className="rounded-md border bg-ink-700 p-5">
          <div className="label-gold mb-4">Trang Bị</div>
          <div className="grid grid-cols-2 gap-[9px]">
            {equipped.map(({ slot, label, item }) => {
              if (!item) {
                return (
                  <div key={slot} className="slot-empty">
                    <span className="h-[30px] w-[30px] flex-shrink-0 rounded bg-ink-800/50" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-jade-500">{label}</div>
                      <div className="text-[11px] text-jade-700">Trống</div>
                    </div>
                  </div>
                );
              }
              const c = RARITY_COLORS[item.rarity];
              return (
                <button
                  key={slot}
                  onClick={() => {
                    if (confirm(`Tháo ${item.name}?`)) unequipItem(slot);
                  }}
                  className="slot text-left transition-transform hover:scale-[1.02]"
                  style={{
                    borderColor: c.border,
                    background: `linear-gradient(135deg, ${c.bg}, transparent)`,
                  }}
                  title="Click để tháo"
                >
                  <span
                    className="h-[30px] w-[30px] flex-shrink-0 rounded"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-jade-500">{label}</div>
                    <div className={`truncate text-[12px] font-medium ${c.text}`}>{item.name}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="label-gold mb-3.5 mt-6 flex items-center justify-between">
            <span>Kỹ Năng ({learnedSkillObjects.length})</span>
            <span className="text-[10px] normal-case tracking-normal italic text-jade-500/80">
              Hover xem mô tả
            </span>
          </div>
          {learnedSkillObjects.length === 0 ? (
            <p className="py-4 text-center text-[12px] italic text-jade-700">
              Chưa học được pháp thuật nào.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {learnedSkillObjects.map((sk) => {
                if (!sk) return null;
                const c = RARITY_COLORS[sk.rarity];
                const kindLabel =
                  sk.kind === 'combat_ultimate' ? 'Tuyệt học · Damage cao + Cooldown dài' :
                  sk.kind === 'combat_basic' ? 'Chiêu thường · Damage vừa + Cooldown ngắn' :
                  'Phụ trợ · Buff/Debuff/Healing/Khám phá';
                return (
                  <div
                    key={sk.id}
                    className="skill-row flex flex-col items-stretch !gap-0 !p-0 overflow-hidden"
                    style={{ borderColor: c.border, background: c.bg }}
                  >
                    <div className="flex items-center gap-2 px-2.5 py-1.5">
                      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: c.dot }} />
                      <div className="min-w-0 flex-1">
                        <div className={`text-[13px] font-medium ${c.text}`}>{sk.name}</div>
                        <div className="text-[10.5px] text-jade-500">{kindLabel}</div>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-mono" style={{ color: c.dot }}>
                        {sk.rarity}
                      </span>
                    </div>
                    {sk.description && (
                      <p className="px-2.5 pb-2 pt-0 text-[11px] italic text-jade-400 leading-snug border-t border-current/10">
                        {sk.description}
                      </p>
                    )}
                    {/* Phase 23.UX: quick stats — cost/cooldown từ Skill type chuẩn */}
                    {(sk.cost !== undefined || sk.cooldown !== undefined) && (
                      <div className="flex gap-3 px-2.5 pb-1.5 text-[10px] text-jade-500/90 font-mono">
                        {sk.cost !== undefined && sk.cost > 0 && <span>Linh khí: {sk.cost}</span>}
                        {sk.cooldown !== undefined && sk.cooldown > 0 && <span>CD: {sk.cooldown}t</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-[10.5px] text-jade-500/70 italic">
            Quản lý kĩ năng + trang bị slot ở mục <strong>Pháp Thuật</strong> trên menu.
          </p>
        </Bracketed>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => setStage('playing')} className="btn-jade">
          ← Quay về câu chuyện <kbd className="ml-2 rounded border border-current/40 px-1 font-mono text-[10px] opacity-70">Esc</kbd>
        </button>
      </div>
    </main>
  );
};

const StatRow = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <div className="mb-1.5 flex justify-between text-[13px]">
      <span className="text-gold-300">{label}</span>
      <span className="font-mono text-gold-200">{value}</span>
    </div>
    <div className="h-[3px] overflow-hidden rounded-full bg-ink-800">
      <div className="h-full w-full bg-gradient-to-r from-gold-700 to-gold-500" />
    </div>
  </div>
);

const StatBar = ({
  label, value, max, color,
}: { label: string; value: number; max: number; color: string }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[13px]">
        <span className="text-gold-300">{label}</span>
        <span className="font-mono" style={{ color }}>
          {value} / {max}
        </span>
      </div>
      <div className="h-[3px] overflow-hidden rounded-full bg-ink-800">
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

/**
 * Phase 20: Lifetime stats panel — "Thiên Cơ Toán"
 * Hiển thị 8 stat tích luỹ từ khi tu sĩ khai mở linh căn.
 */
const LifetimeStatsPanel = () => {
  const playerStats = useGameStore((s) => s.playerStats);
  const economy = useGameStore((s) => s.economy);
  const inventory = useGameStore((s) => s.inventory);
  const legendaryNow = Object.values(inventory).filter(
    (it) => (it as { rarity?: string }).rarity === 'Huyền Thoại',
  ).length;
  const winRate = playerStats.totalKills + playerStats.totalDefeats > 0
    ? Math.round((playerStats.totalKills / (playerStats.totalKills + playerStats.totalDefeats)) * 100)
    : 0;
  const topEnemy = Object.entries(playerStats.killsByEnemy ?? {})
    .sort(([, a], [, b]) => b - a)[0];
  const rows: Array<{ icon: string; label: string; value: string | number; tone?: string }> = [
    { icon: '◷', label: 'Tổng lượt câu chuyện', value: playerStats.turnsPlayed },
    { icon: '⚔', label: 'Tổng chiến thắng', value: playerStats.totalKills, tone: 'var(--ember-400)' },
    { icon: '✕', label: 'Tổng bại trận', value: playerStats.totalDefeats, tone: 'var(--ember-300)' },
    { icon: '%', label: 'Tỷ lệ chiến thắng', value: `${winRate}%`, tone: winRate >= 70 ? 'var(--jade-300)' : 'var(--gold-300)' },
    { icon: '⚡', label: 'Đột phá tích luỹ', value: playerStats.realmBreaksLifetime, tone: 'var(--gold-400)' },
    { icon: '⚙', label: 'Vượt thiên kiếp', value: playerStats.tribulationsPassed, tone: 'var(--spirit-400)' },
    { icon: '✦', label: 'Tổng EP đạt được', value: playerStats.totalEpEarned.toLocaleString() },
    { icon: '◇', label: 'Linh thạch lifetime', value: playerStats.totalCurrencyEarned.toLocaleString() },
    { icon: '☆', label: 'Pháp bảo Huyền Thoại', value: legendaryNow, tone: 'var(--spirit-400)' },
    { icon: '💎', label: 'Tiền Ngọc hiện có', value: economy.tienNgoc.toLocaleString(), tone: 'var(--gold-400)' },
  ];
  return (
    <div className="mt-6 border-t border-gold-700/15 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="label-section">✦ Thiên Cơ Toán — Lifetime Stats</div>
      </div>
      <div className="grid grid-cols-1 gap-[6px] sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded border border-spirit-500/15 bg-ink-800/40 px-2.5 py-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-[14px] opacity-80">{r.icon}</span>
              <span className="text-[11px] text-jade-300">{r.label}</span>
            </div>
            <span
              className="font-mono text-[13px] font-bold"
              style={{ color: r.tone ?? 'var(--gold-300)' }}
            >
              {r.value}
            </span>
          </div>
        ))}
      </div>
      {topEnemy && (
        <div className="mt-2 rounded border border-ember-500/30 bg-ember-900/15 px-2.5 py-1.5 text-[11px]">
          <span className="text-jade-400">★ Sát nhiều nhất: </span>
          <strong className="text-ember-200">{topEnemy[0]}</strong>
          <span className="ml-1 font-mono text-ember-300">×{topEnemy[1]}</span>
        </div>
      )}
    </div>
  );
};

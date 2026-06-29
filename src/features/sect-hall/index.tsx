import { useMemo, useState } from 'react';
import {
  useGameStore,
  selectSectMembership,
  selectClaimedMissions,
  selectAvailableSects,
  SECT_MISSION_POOL,
  TANG_KINH_CATALOG,
  getSect,
  SECT_RANK_DISPLAY,
  SECT_RANK_ORDER,
  SECT_RANK_REQUIREMENT,
} from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { ELEMENT_DISPLAY } from '@core/cultivation/spiritual-roots';

type Tab = 'overview' | 'browse' | 'missions' | 'tangkinh';

const ALIGN_STYLE = {
  chinh: { color: 'var(--azure-400)', label: 'Chính Đạo' },
  ma: { color: 'var(--ember-700)', label: 'Ma Đạo' },
  trung: { color: 'var(--gold-300)', label: 'Trung Lập' },
  an: { color: 'var(--spirit-400)', label: 'Ẩn Thế' },
} as const;

const RARITY_COLOR: Record<string, string> = {
  'Thường': 'text-rarity-common',
  'Tốt': 'text-rarity-good',
  'Hiếm': 'text-rarity-rare',
  'Cực Phẩm': 'text-rarity-epic',
  'Siêu Phẩm': 'text-rarity-mythic',
  'Huyền Thoại': 'text-rarity-legendary',
};

export const SectHallScreen = () => {
  const setStage = useGameStore((s) => s.setStage);
  const player = useGameStore((s) => s.player);
  const membership = useGameStore(selectSectMembership);
  const claimed = useGameStore(selectClaimedMissions);
  const turn = useGameStore((s) => s.turn);
  const joinSect = useGameStore((s) => s.joinSect);
  const leaveSect = useGameStore((s) => s.leaveSect);
  const claimMission = useGameStore((s) => s.claimSectMission);
  const redeem = useGameStore((s) => s.redeemFromTangKinh);
  // Phase 8.3: Fan-fic aware sect list
  const availableSects = useGameStore(selectAvailableSects);

  const [tab, setTab] = useState<Tab>(membership ? 'overview' : 'browse');

  const mySect = membership ? getSect(membership.sectId) : null;
  const missions = useMemo(
    () => (mySect ? SECT_MISSION_POOL.filter((m) => m.sectId === mySect.id) : []),
    [mySect],
  );
  const tangKinh = useMemo(
    () => (mySect ? TANG_KINH_CATALOG.filter((c) => c.sectId === mySect.id) : []),
    [mySect],
  );

  const nextRank = membership
    ? SECT_RANK_ORDER[SECT_RANK_ORDER.indexOf(membership.rank) + 1]
    : null;
  const nextRankReq = nextRank ? SECT_RANK_REQUIREMENT[nextRank] : null;

  if (!player) return null;

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-gold-700/15 pb-4">
        <div>
          <div className="label-section mb-2">Tông Môn · Đạo Lữ</div>
          <h1 className="font-serif text-[30px] font-bold uppercase tracking-wider text-gold-200">
            {mySect ? mySect.name : 'Vạn Tông Phong Vân'}
          </h1>
          {mySect && (
            <p className="mt-1 font-serif text-[13px] italic text-gold-300">{mySect.philosophy}</p>
          )}
        </div>
        <button onClick={() => setStage('playing')} className="btn-jade text-[13px]">
          ← Quay lại
        </button>
      </header>

      {/* Tabs — chỉ hiện overview/missions/tangkinh khi đã join */}
      <div className="mb-5 flex flex-wrap gap-2">
        {membership && (
          <>
            <TabBtn active={tab === 'overview'} onClick={() => setTab('overview')} label="Tổng Quan" icon="◆" />
            <TabBtn active={tab === 'missions'} onClick={() => setTab('missions')} label="Nhiệm Vụ Môn" icon="◇" />
            <TabBtn active={tab === 'tangkinh'} onClick={() => setTab('tangkinh')} label="Tàng Kinh Các" icon="☷" />
          </>
        )}
        <TabBtn active={tab === 'browse'} onClick={() => setTab('browse')} label="Tông Môn Khác" icon="◈" />
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {tab === 'overview' && membership && mySect && (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Bracketed className="rounded-md border bg-ink-700 p-6">
            <div className="label-gold mb-4">Thông Tin Thân Phận</div>
            <div className="space-y-4">
              <Row label="Tông môn" value={mySect.name} />
              <Row
                label="Cấp bậc"
                value={SECT_RANK_DISPLAY[membership.rank]}
                valueColor="var(--gold-100)"
              />
              <Row
                label="Tính chất"
                value={ALIGN_STYLE[mySect.alignment].label}
                valueColor={ALIGN_STYLE[mySect.alignment].color}
              />
              <Row label="Gia nhập" value={`Lượt ${membership.joinedAtTurn}`} mono />
              <Row label="Nhiệm vụ hoàn thành" value={membership.missionsCompleted} mono />
            </div>

            {nextRank && nextRankReq && (
              <div className="mt-6 border-t border-gold-700/15 pt-4">
                <div className="label-section mb-2">Mục Tiêu Thăng Cấp</div>
                <div className="text-[13px] text-gold-300">
                  Lên <span className="text-gold-100">{SECT_RANK_DISPLAY[nextRank]}</span>:
                </div>
                <div className="mt-2 space-y-1.5 text-[12.5px]">
                  <div className="flex justify-between">
                    <span className="text-jade-400">Cống hiến</span>
                    <span className="font-mono">
                      <span className={membership.contribution >= nextRankReq.contribution ? 'text-leaf-500' : 'text-ember-200'}>
                        {membership.contribution.toLocaleString()}
                      </span>{' '}
                      / {nextRankReq.contribution.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-jade-400">Cấp độ</span>
                    <span className="font-mono">
                      <span className={player.level >= nextRankReq.levelMin ? 'text-leaf-500' : 'text-ember-200'}>
                        {player.level}
                      </span>{' '}
                      / {nextRankReq.levelMin}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Bracketed>

          <div className="flex flex-col gap-4">
            <Bracketed tone="ember" className="rounded-md border bg-ink-700 p-5">
              <div className="label-section mb-2">Cống Hiến Hiện Có</div>
              <div className="font-mono text-3xl text-gold-150">
                {membership.contribution.toLocaleString()}
              </div>
            </Bracketed>

            <Bracketed className="rounded-md border bg-ink-700 p-5">
              <div className="label-section mb-3">Công Pháp Tông Môn</div>
              <ul className="space-y-1.5 text-[12.5px] text-gold-300">
                {mySect.signatureTechniques.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-gold-500">◆</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Bracketed>

            <button
              onClick={() => {
                if (confirm(`Phản môn ${mySect.name}? Penalty nặng: bị truy sát, danh vọng -1000`)) {
                  leaveSect();
                  setTab('browse');
                }
              }}
              className="btn-jade text-[12px]"
              style={{ color: 'var(--blood-500)' }}
            >
              ⊗ Phản Môn (Nguy hiểm)
            </button>
          </div>
        </div>
      )}

      {/* ─── MISSIONS TAB ─── */}
      {tab === 'missions' && membership && (
        <div className="grid gap-3">
          {missions.length === 0 ? (
            <Bracketed className="rounded-md border bg-ink-700 p-8 text-center">
              <p className="italic text-jade-500">Không có nhiệm vụ.</p>
            </Bracketed>
          ) : (
            missions.map((m) => {
              const claimedAt = claimed[m.id];
              const cooldown =
                m.resetType === 'daily' ? 24 : m.resetType === 'weekly' ? 168 : Infinity;
              const turnsAgo = claimedAt !== undefined ? turn - claimedAt : Infinity;
              const available = turnsAgo >= cooldown;
              const rankIdx = SECT_RANK_ORDER.indexOf(membership.rank);
              const reqIdx = m.minRank ? SECT_RANK_ORDER.indexOf(m.minRank) : 0;
              const rankOk = rankIdx >= reqIdx;
              return (
                <Bracketed
                  key={m.id}
                  className="rounded-md border bg-ink-700 p-4"
                  tone={available && rankOk ? 'gold' : 'jade'}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wider"
                          style={{
                            background: 'rgba(205,164,94,.1)',
                            color: 'var(--gold-300)',
                            border: '1px solid rgba(205,164,94,.3)',
                          }}>
                          {m.kind === 'gathering' ? '☘ Hái' :
                           m.kind === 'subjugation' ? '⚔ Tiêu Diệt' :
                           m.kind === 'patrol' ? '◉ Tuần Tra' :
                           m.kind === 'delivery' ? '✉ Giao' : '✦ Tu Luyện'}
                        </span>
                        <span className="text-[11px] text-jade-500">
                          {m.resetType === 'daily' ? 'Hàng ngày' : m.resetType === 'weekly' ? 'Hàng tuần' : 'Một lần'}
                        </span>
                        {m.minRank && (
                          <span className="text-[11px] text-spirit-300">
                            Cần: {SECT_RANK_DISPLAY[m.minRank]}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-lg text-gold-200">{m.title}</h3>
                      <p className="mt-1 text-[12.5px] italic text-gold-300/80">{m.description}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-[12px]">
                        <span className="text-jade-400">
                          Cống hiến: <span className="font-mono text-gold-150">+{m.contributionReward}</span>
                        </span>
                        {m.currencyReward > 0 && (
                          <span className="text-jade-400">
                            Linh thạch: <span className="font-mono text-gold-500">+{m.currencyReward}</span>
                          </span>
                        )}
                        {m.itemRewardName && (
                          <span className="text-jade-400">
                            Item: <span className={RARITY_COLOR[m.itemRewardRarity ?? 'Thường']}>{m.itemRewardName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => claimMission(m.id)}
                      disabled={!available || !rankOk}
                      className={available && rankOk ? 'btn-primary text-[13px]' : 'btn-jade text-[13px]'}
                    >
                      {!rankOk ? 'Thiếu rank' :
                       !available ? `Chờ ${cooldown - turnsAgo} lượt` :
                       'Nhận thưởng'}
                    </button>
                  </div>
                </Bracketed>
              );
            })
          )}
        </div>
      )}

      {/* ─── TANG KINH TAB ─── */}
      {tab === 'tangkinh' && membership && (
        <div className="grid gap-3 sm:grid-cols-2">
          {tangKinh.map((item) => {
            const rankIdx = SECT_RANK_ORDER.indexOf(membership.rank);
            const reqIdx = SECT_RANK_ORDER.indexOf(item.minRank);
            const rankOk = rankIdx >= reqIdx;
            const affordable = membership.contribution >= item.cost;
            return (
              <Bracketed
                key={item.id}
                className="rounded-md border bg-ink-700 p-4"
                tone={affordable && rankOk ? 'gold' : 'jade'}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-serif text-base ${RARITY_COLOR[item.itemRarity]}`}>
                      {item.itemName}
                    </h3>
                    <div className="text-[11px] text-jade-500 mt-1">
                      {item.itemCategory} · {item.itemRarity} · Cần: {SECT_RANK_DISPLAY[item.minRank]}
                    </div>
                    <div className="mt-2 text-[13px]">
                      <span className="text-jade-400">Cống hiến: </span>
                      <span className={`font-mono ${affordable ? 'text-gold-150' : 'text-ember-200'}`}>
                        {item.cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => redeem(item.id)}
                    disabled={!affordable || !rankOk}
                    className={affordable && rankOk ? 'btn-primary text-[12px]' : 'btn-jade text-[12px]'}
                  >
                    Đổi
                  </button>
                </div>
              </Bracketed>
            );
          })}
        </div>
      )}

      {/* ─── BROWSE TAB ─── */}
      {tab === 'browse' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {availableSects.map((sect) => {
            const isMine = membership?.sectId === sect.id;
            return (
              <Bracketed
                key={sect.id}
                tone={sect.alignment === 'ma' ? 'ember' : sect.alignment === 'an' ? 'spirit' : 'gold'}
                className="rounded-md border bg-ink-700 p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-serif text-xl text-gold-200">{sect.name}</h3>
                    <div
                      className="text-[11px] uppercase tracking-widest mt-1"
                      style={{ color: ALIGN_STYLE[sect.alignment].color }}
                    >
                      {ALIGN_STYLE[sect.alignment].label}
                    </div>
                  </div>
                  {isMine && (
                    <span className="rounded-sm border border-leaf-500/50 bg-leaf-500/10 px-2 py-0.5 text-[10.5px] text-leaf-500">
                      ✓ Tông môn của ngươi
                    </span>
                  )}
                </div>
                <p className="font-serif text-[12.5px] italic text-gold-300/80 mb-3">
                  {sect.description}
                </p>
                <p className="font-serif text-[12.5px] italic text-gold-150 mb-3">
                  {sect.philosophy}
                </p>

                <div className="space-y-2 border-t border-gold-700/15 pt-3 text-[12px]">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-jade-400">Element:</span>
                    {sect.primaryElements.map((el) => (
                      <span
                        key={el}
                        className="rounded-sm border px-2 py-0.5 text-[10.5px]"
                        style={{
                          borderColor: `${ELEMENT_DISPLAY[el].color}66`,
                          color: ELEMENT_DISPLAY[el].color,
                        }}
                      >
                        {ELEMENT_DISPLAY[el].symbol} {ELEMENT_DISPLAY[el].name}
                      </span>
                    ))}
                  </div>
                  {sect.joinRequirements.levelMin && (
                    <div className="text-jade-400">
                      Yêu cầu cấp: <span className="font-mono text-gold-300">{sect.joinRequirements.levelMin}+</span>
                    </div>
                  )}
                  {sect.joinRequirements.elementsRequired && (
                    <div className="text-jade-400">
                      Cần linh căn: <span className="text-spirit-300">{sect.joinRequirements.elementsRequired.map(e => ELEMENT_DISPLAY[e].name).join(', ')}</span>
                    </div>
                  )}
                </div>

                {!isMine && !membership && (() => {
                  // Phase 24.UX: Pre-check requirements để show disabled + lý do
                  const req = sect.joinRequirements;
                  const reasons: string[] = [];
                  if (req.levelMin && player && player.level < req.levelMin) {
                    reasons.push(`Cần cấp ${req.levelMin} (hiện ${player.level})`);
                  }
                  if (req.elementsRequired && player?.spiritualRoot) {
                    const has = player.spiritualRoot.elements.some((e) => req.elementsRequired!.includes(e));
                    if (!has) reasons.push(`Linh căn cần: ${req.elementsRequired.map((e) => ELEMENT_DISPLAY[e].name).join('/')}`);
                  }
                  if (req.bannedElements && player?.spiritualRoot) {
                    const banned = player.spiritualRoot.elements.some((e) => req.bannedElements!.includes(e));
                    if (banned) reasons.push(`Cấm linh căn: ${req.bannedElements.map((e) => ELEMENT_DISPLAY[e].name).join('/')}`);
                  }
                  if (req.minSpiritualRootMultiplier && player?.spiritualRoot) {
                    if (player.spiritualRoot.cultivationMultiplier < req.minSpiritualRootMultiplier) {
                      reasons.push(`Hệ số tu luyện ≥ ×${req.minSpiritualRootMultiplier} (hiện ×${player.spiritualRoot.cultivationMultiplier.toFixed(1)})`);
                    }
                  }
                  const canJoin = reasons.length === 0;
                  return (
                    <>
                      <button
                        onClick={() => {
                          const ok = joinSect(sect.id);
                          if (ok) setTab('overview');
                          // notify đã warn từ store nếu fail
                        }}
                        disabled={!canJoin}
                        className="btn-primary mt-4 w-full text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canJoin ? 'Gia nhập tông môn' : `Không đủ điều kiện:\n${reasons.join('\n')}`}
                      >
                        {canJoin ? 'Gia Nhập' : '✕ Chưa đủ điều kiện'}
                      </button>
                      {!canJoin && (
                        <ul className="mt-2 text-[11px] text-ember-400 space-y-0.5">
                          {reasons.map((r, i) => (
                            <li key={i}>· {r}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  );
                })()}
                {!isMine && membership && (
                  <p className="mt-4 text-center text-[11px] text-jade-600">
                    Phản môn {getSect(membership.sectId)?.name} trước để gia nhập tông môn này
                  </p>
                )}
              </Bracketed>
            );
          })}
        </div>
      )}
    </main>
  );
};

const TabBtn = ({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 rounded-sm border px-3 py-1.5 text-[12.5px] transition-colors"
    style={{
      borderColor: active ? 'var(--gold-500)' : 'rgba(205,164,94,.2)',
      color: active ? 'var(--gold-100)' : 'var(--gold-300)',
      background: active ? 'rgba(205,164,94,.08)' : 'transparent',
    }}
  >
    <span style={{ color: 'var(--gold-500)' }}>{icon}</span>
    {label}
  </button>
);

const Row = ({ label, value, valueColor, mono }: { label: string; value: string | number; valueColor?: string; mono?: boolean }) => (
  <div className="flex justify-between border-b border-gold-700/15 pb-2 text-[13px]">
    <span className="text-jade-400">{label}</span>
    <span style={{ color: valueColor }} className={mono ? 'font-mono' : ''}>
      {value}
    </span>
  </div>
);

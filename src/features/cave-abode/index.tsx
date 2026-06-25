import { useState } from 'react';
import {
  useGameStore,
  selectCaveAbode,
  selectInventory,
  HERB_CATALOG,
  maxPlotsForLevel,
  ROOM_DISPLAY,
  PILL_RECIPES,
} from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import type { AbodeRoomKind } from '@gametypes/cave-abode';

const RARITY_COLOR: Record<string, string> = {
  'Thường': 'text-rarity-common',
  'Tốt': 'text-rarity-good',
  'Hiếm': 'text-rarity-rare',
  'Cực Phẩm': 'text-rarity-epic',
  'Siêu Phẩm': 'text-rarity-mythic',
  'Huyền Thoại': 'text-rarity-legendary',
};

export const CaveAbodeScreen = () => {
  const setStage = useGameStore((s) => s.setStage);
  const player = useGameStore((s) => s.player);
  const abode = useGameStore(selectCaveAbode);
  const turn = useGameStore((s) => s.turn);
  const locations = useGameStore((s) => s.knowledge.locations);
  const purchase = useGameStore((s) => s.purchaseCaveAbode);
  const build = useGameStore((s) => s.buildRoom);
  const upgrade = useGameStore((s) => s.upgradeRoom);
  const plant = useGameStore((s) => s.plantHerb);
  const harvest = useGameStore((s) => s.harvestPlot);
  const meditate = useGameStore((s) => s.meditateInAbode);
  const refinePill = useGameStore((s) => s.refinePill);
  const inventory = useGameStore(selectInventory);

  const [purchaseName, setPurchaseName] = useState('Hoàng Long Động');
  const [selectedHerb, setSelectedHerb] = useState(HERB_CATALOG[0]!.name);
  const [meditateHours, setMeditateHours] = useState(8);

  if (!player) return null;

  // Chưa có động phủ → màn hình mua
  if (!abode.owned) {
    const eligibleLocs = Object.values(locations).filter((l) => l.type === 'cave_abode' || l.type === 'mountain');
    const currentLoc = locations[player.current_location_id ?? ''];
    const canPurchaseHere = currentLoc && (currentLoc.type === 'cave_abode' || currentLoc.type === 'mountain');
    const cost = 2000;
    return (
      <main className="min-h-screen px-6 py-10 lg:px-10">
        <header className="mb-6 flex items-end justify-between border-b border-gold-700/15 pb-4">
          <div>
            <div className="label-section mb-2">Động Phủ · Chưa Sở Hữu</div>
            <h1 className="font-serif text-[28px] font-semibold text-gold-200">Mua Động Phủ</h1>
          </div>
          <button onClick={() => setStage('playing')} className="btn-jade text-[13px]">← Quay lại</button>
        </header>

        <div className="mx-auto max-w-2xl">
          <Bracketed className="rounded-md border bg-ink-700 p-6">
            <div className="label-gold mb-4">Yêu Cầu</div>
            <ul className="mb-6 space-y-2 text-[13.5px] text-gold-300">
              <li className="flex gap-2">
                <span className="text-gold-500">◆</span>
                <span>Đang đứng ở location type <span className="text-spirit-300">cave_abode</span> hoặc <span className="text-spirit-300">mountain</span>.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-500">◆</span>
                <span>Có ít nhất <span className="font-mono text-gold-150">{cost.toLocaleString()}</span> linh thạch (hiện có: <span className="font-mono">{player.currency.toLocaleString()}</span>).</span>
              </li>
            </ul>

            {canPurchaseHere ? (
              <>
                <div className="mb-4">
                  <label className="label-section mb-1.5 block">Đặt tên động phủ</label>
                  <input
                    type="text"
                    value={purchaseName}
                    onChange={(e) => setPurchaseName(e.target.value)}
                    className="w-full rounded-sm border border-gold-700/30 bg-ink-800 px-3 py-2 text-[13px] text-gold-100 focus:border-gold-500 focus:outline-none"
                    maxLength={40}
                  />
                </div>
                <div className="mb-4 rounded-sm border border-leaf-500/30 bg-leaf-500/5 p-3 text-[12px] text-leaf-500">
                  ✓ Đang ở <span className="text-gold-200">{currentLoc.name}</span> — có thể mua động phủ tại đây
                </div>
                <button
                  onClick={() => {
                    if (purchaseName.trim() && currentLoc) {
                      purchase(currentLoc.id, purchaseName.trim(), cost);
                    }
                  }}
                  disabled={player.currency < cost || !purchaseName.trim()}
                  className="btn-primary w-full text-[14px]"
                >
                  Mua ({cost.toLocaleString()} linh thạch)
                </button>
              </>
            ) : (
              <div className="rounded-sm border border-ember-500/30 bg-ember-500/5 p-4">
                <p className="mb-2 text-[13px] text-ember-200">
                  Hiện tại đang ở <span className="text-gold-200">{currentLoc?.name ?? 'không xác định'}</span> — không phải sơn mạch / cave_abode.
                </p>
                <div className="text-[12px] text-jade-400">
                  Các location có thể mua: <span className="text-gold-300">{eligibleLocs.map((l) => l.name).join(', ')}</span>
                </div>
              </div>
            )}
          </Bracketed>
        </div>
      </main>
    );
  }

  // Đã có → quản lý
  const plots = Object.values(abode.plots);
  const daoVien = abode.rooms.dao_vien;
  const maxPlots = daoVien.built ? maxPlotsForLevel(daoVien.level) : 0;

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-gold-700/15 pb-4">
        <div>
          <div className="label-section mb-2">Động Phủ · {locations[abode.locationId]?.name}</div>
          <h1 className="font-serif text-[30px] font-bold uppercase tracking-wider text-gold-200">
            {abode.name}
          </h1>
        </div>
        <button onClick={() => setStage('playing')} className="btn-jade text-[13px]">← Quay lại</button>
      </header>

      {/* 4 phòng overview */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(abode.rooms) as AbodeRoomKind[]).map((kind) => {
          const room = abode.rooms[kind];
          const info = ROOM_DISPLAY[kind];
          return (
            <Bracketed
              key={kind}
              className="rounded-md border bg-ink-700 p-4"
              tone={room.built ? 'gold' : 'jade'}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl" style={{ color: room.built ? 'var(--gold-500)' : 'var(--jade-600)' }}>
                  {info.icon}
                </span>
                <div>
                  <div className="font-serif text-base text-gold-200">{info.name}</div>
                  <div className="text-[10px] text-jade-500">
                    {room.built ? `Lv ${room.level}` : 'Chưa xây'}
                  </div>
                </div>
              </div>
              <p className="mb-3 text-[11.5px] italic text-gold-300/80">{info.description}</p>
              {!room.built ? (
                <button
                  onClick={() => build(kind)}
                  disabled={!player || player.currency < (room.upgradeCost ?? 500)}
                  className="btn-primary w-full text-[12px]"
                >
                  Xây ({(room.upgradeCost ?? 500).toLocaleString()})
                </button>
              ) : room.level < 5 ? (
                <button
                  onClick={() => upgrade(kind)}
                  disabled={!player || player.currency < (room.upgradeCost ?? 0)}
                  className="btn-secondary w-full text-[11px]"
                >
                  Nâng cấp ({(room.upgradeCost ?? 0).toLocaleString()})
                </button>
              ) : (
                <div className="rounded-sm border border-gold-150/30 bg-gold-150/10 px-2 py-1 text-center text-[11px] text-gold-150">
                  ✦ Max Level
                </div>
              )}
            </Bracketed>
          );
        })}
      </div>

      {/* Dược viên — planting (nếu đã build) */}
      {daoVien.built && (
        <Bracketed className="rounded-md border bg-ink-700 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="label-gold">Dược Viên · Trồng Linh Thảo</div>
              <div className="text-[11px] text-jade-500 mt-1">
                Plot: <span className="font-mono text-gold-300">{plots.length}/{maxPlots}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedHerb}
                onChange={(e) => setSelectedHerb(e.target.value)}
                className="rounded-sm border border-gold-700/30 bg-ink-800 px-3 py-1.5 text-[12px] text-gold-200"
              >
                {HERB_CATALOG.filter((h) => h.minLevel <= daoVien.level).map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name} ({h.itemRarity}, {h.growTurns}h)
                  </option>
                ))}
              </select>
              <button
                onClick={() => plant(selectedHerb)}
                disabled={plots.length >= maxPlots}
                className="btn-primary text-[12px]"
              >
                + Trồng
              </button>
            </div>
          </div>

          {plots.length === 0 ? (
            <div className="py-8 text-center text-[12.5px] italic text-jade-700">
              Dược viên trống. Chọn linh thảo và nhấn "+ Trồng".
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {plots.map((plot) => {
                const elapsed = turn - plot.plantedAtTurn;
                const ready = elapsed >= plot.growTurns;
                const pct = Math.min(100, (elapsed / plot.growTurns) * 100);
                return (
                  <div
                    key={plot.id}
                    className="rounded-md border p-3"
                    style={{
                      borderColor: ready ? 'var(--leaf-500)' : 'rgba(143,201,140,.3)',
                      background: ready ? 'rgba(143,201,140,.1)' : 'rgba(143,201,140,.04)',
                    }}
                  >
                    <div className="mb-1 flex justify-between">
                      <span className={`font-serif text-[13px] ${RARITY_COLOR[plot.itemRarity] ?? ''}`}>
                        {plot.herbName}
                      </span>
                      <span className="font-mono text-[11px] text-jade-400">×{plot.yield}</span>
                    </div>
                    <div className="text-[11px] text-jade-500 mb-2">
                      {ready ? 'Đã chín' : `Còn ${plot.growTurns - elapsed} lượt`}
                    </div>
                    <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-ink-800">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: ready
                            ? 'var(--leaf-500)'
                            : 'linear-gradient(90deg, #6f8a6d, #8fc98c)',
                        }}
                      />
                    </div>
                    <button
                      onClick={() => harvest(plot.id)}
                      disabled={!ready}
                      className={ready ? 'btn-primary w-full text-[11.5px]' : 'btn-jade w-full text-[11px]'}
                    >
                      {ready ? '✓ Thu Hoạch' : 'Đang lớn...'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Bracketed>
      )}

      {!daoVien.built && (
        <Bracketed tone="jade" className="rounded-md border bg-ink-700 p-8 text-center">
          <p className="italic text-jade-500">Xây Dược Viên để bắt đầu trồng linh thảo.</p>
        </Bracketed>
      )}

      {/* Tu Luyện Thất */}
      {abode.rooms.tu_luyen_that.built && (
        <Bracketed className="mt-5 rounded-md border bg-ink-700 p-5" tone="spirit">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="label-gold">Tu Luyện Thất · Bế Quan</div>
              <div className="text-[11px] text-jade-500 mt-1">
                Bonus ×{(1.5 * (1.0 + (abode.rooms.tu_luyen_that.level - 1) * 0.125)).toFixed(2)} EXP · Phòng Lv {abode.rooms.tu_luyen_that.level}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] items-end">
            <div>
              <label className="label-section block mb-1.5">Số giờ bế quan (1-72)</label>
              <input
                type="range"
                min={1}
                max={72}
                value={meditateHours}
                onChange={(e) => setMeditateHours(Math.max(1, Math.min(72, parseInt(e.target.value, 10) || 1)))}
                className="w-full"
              />
              <div className="mt-1 flex justify-between text-[11px] text-jade-500">
                <span>1h</span>
                <span className="font-mono text-gold-300">{meditateHours} giờ</span>
                <span>72h</span>
              </div>
            </div>
            <button
              onClick={() => meditate(meditateHours)}
              className="btn-primary text-[13px]"
              style={{ background: 'linear-gradient(180deg, var(--spirit-200), var(--spirit-500))' }}
            >
              ✦ Bế Quan {meditateHours}h
            </button>
          </div>
        </Bracketed>
      )}

      {/* Luyện Đan Thất */}
      {abode.rooms.luyen_dan_that.built && (
        <Bracketed className="mt-5 rounded-md border bg-ink-700 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="label-gold">Luyện Đan Thất · Đan Phương</div>
              <div className="text-[11px] text-jade-500 mt-1">
                Lò đan Lv <span className="font-mono text-gold-300">{abode.rooms.luyen_dan_that.level}</span> · Mở {PILL_RECIPES.filter(r => r.minRoomLevel <= abode.rooms.luyen_dan_that.level).length}/{PILL_RECIPES.length} đan phương
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PILL_RECIPES.map((recipe) => {
              const unlocked = recipe.minRoomLevel <= abode.rooms.luyen_dan_that.level;
              // Check ingredients
              const hasIngredients = recipe.ingredients.every((ing) => {
                const matches = Object.values(inventory).filter((it) => it.name === ing.itemName);
                const total = matches.reduce((sum, it) => sum + (it.quantity ?? 1), 0);
                return total >= ing.count;
              });
              const canRefine = unlocked && hasIngredients && player.currency >= recipe.currencyCost;
              return (
                <div
                  key={recipe.id}
                  className="rounded-md border p-3"
                  style={{
                    borderColor: unlocked ? 'rgba(205,164,94,.3)' : 'rgba(168,130,63,.12)',
                    background: unlocked ? 'rgba(28,24,18,.4)' : 'rgba(28,24,18,.2)',
                    opacity: unlocked ? 1 : 0.5,
                  }}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-serif text-[13px] text-gold-200">{recipe.name}</div>
                      <div className="text-[10.5px] text-jade-500">
                        Cần Lv {recipe.minRoomLevel} · {recipe.successRate}% thành công
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-gold-500">{recipe.currencyCost}</span>
                  </div>
                  <p className="mb-2 text-[11.5px] italic text-gold-300/70">{recipe.description}</p>
                  <div className="mb-2 space-y-0.5 text-[11px]">
                    {recipe.ingredients.map((ing) => {
                      const matches = Object.values(inventory).filter((it) => it.name === ing.itemName);
                      const total = matches.reduce((sum, it) => sum + (it.quantity ?? 1), 0);
                      const ok = total >= ing.count;
                      return (
                        <div key={ing.itemName} className="flex justify-between">
                          <span className="text-jade-400">{ing.itemName}</span>
                          <span className={`font-mono ${ok ? 'text-leaf-500' : 'text-ember-200'}`}>
                            {total}/{ing.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => refinePill(recipe.id)}
                    disabled={!canRefine}
                    className={canRefine ? 'btn-primary w-full text-[11.5px]' : 'btn-jade w-full text-[11px]'}
                  >
                    {!unlocked ? 'Chưa đủ cấp lò' : !hasIngredients ? 'Thiếu liệu' : player.currency < recipe.currencyCost ? 'Thiếu linh thạch' : '⚱ Luyện'}
                  </button>
                </div>
              );
            })}
          </div>
        </Bracketed>
      )}
    </main>
  );
};

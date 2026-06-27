import { useMemo, useState } from 'react';
import { useGameStore } from '@state/game-store';
import { Bracketed } from '@shared/components/CornerBracket';
import { ItemIcon } from '@shared/components/ItemIcon';
import type { Item } from '@gametypes/item';

interface Props {
  open: boolean;
  onClose: () => void;
}

const RARITY_COLOR: Record<string, { border: string; bg: string; text: string }> = {
  'Thường': { border: 'border-jade-700/40', bg: 'bg-jade-900/10', text: 'text-jade-300' },
  'Tốt': { border: 'border-jade-500/50', bg: 'bg-jade-900/20', text: 'text-jade-200' },
  'Hiếm': { border: 'border-spirit-500/50', bg: 'bg-spirit-900/20', text: 'text-spirit-300' },
  'Cực Phẩm': { border: 'border-gold-500/50', bg: 'bg-gold-900/20', text: 'text-gold-300' },
  'Siêu Phẩm': { border: 'border-gold-400/60', bg: 'bg-gold-900/30', text: 'text-gold-200' },
  'Huyền Thoại': { border: 'border-ember-500/60', bg: 'bg-ember-900/30', text: 'text-ember-300' },
};
const getRarityColor = (rarity?: string) =>
  RARITY_COLOR[rarity ?? 'Thường'] ?? RARITY_COLOR['Thường']!;

/** Heuristic giá bán cơ bản theo rarity. AI có thể override qua SELL_VALUATION. */
const BASE_PRICE_BY_RARITY: Record<string, number> = {
  'Thường': 50,
  'Tốt': 200,
  'Hiếm': 800,
  'Cực Phẩm': 2500,
  'Siêu Phẩm': 6000,
  'Huyền Thoại': 15000,
};

const ATTITUDE_LABEL: Record<string, { label: string; color: string }> = {
  friendly: { label: 'Hữu hảo', color: 'text-jade-300' },
  neutral: { label: 'Trung lập', color: 'text-gold-300' },
  hostile: { label: 'Thù địch', color: 'text-ember-300' },
};

/**
 * Phase 12.2: Trader Modal — 2-pane "Bán" (inventory player) | "Mua" (trader.wares).
 *
 * Auto-open khi traderSession non-null. User actions:
 *  - Bán item → currency += basePrice × sellMultiplier × itemSpecificBonus, remove khỏi inventory
 *  - Hỏi giá (gửi msg "Cho ta xem có gì bán" → AI dispatch OFFER_ITEM_IDEA)
 *  - Mặc cả (gửi msg "Mặc cả giá [item]" → AI dispatch BUY_NEGOTIATION)
 *  - Mua (deduct currency, push item — chỉ cho ware đã có price)
 *  - Thoát → submitAction "Rời khỏi quầy" → AI sẽ dispatch EXIT_TRADE_MODE
 */
export const TraderModal = ({ open, onClose }: Props) => {
  const session = useGameStore((s) => s.traderSession);
  const inventory = useGameStore((s) => s.inventory);
  const player = useGameStore((s) => s.player);
  const submitAction = useGameStore((s) => s.submitAction);

  const [selectedSellId, setSelectedSellId] = useState<string | null>(null);

  // Inventory list filter (chỉ items chưa equipped)
  const sellable = useMemo<Item[]>(() => {
    if (!player) return [];
    const equipped = new Set(Object.values(player.equippedItems).filter(Boolean) as string[]);
    return Object.values(inventory).filter((i) => !equipped.has(i.id));
  }, [inventory, player]);

  if (!open || !session || !player) return null;

  const attitude = ATTITUDE_LABEL[session.attitude ?? 'neutral']!;

  // Helper: compute giá BÁN của 1 item (player → trader)
  const computeSellPrice = (item: Item): number => {
    const base = BASE_PRICE_BY_RARITY[item.rarity] ?? 50;
    const itemBonus = session.itemSpecificSellBonuses[item.name] ?? 1.0;
    const final = base * session.sellMultiplier * itemBonus;
    return Math.max(1, Math.floor(final));
  };

  // Helper: compute giá MUA của 1 ware (trader → player)
  const computeBuyPrice = (ware: typeof session.wares[number]): number => {
    if (ware.price !== undefined) {
      return Math.max(1, Math.floor(ware.price * (ware.negotiatedMultiplier ?? 1.0)));
    }
    // Fallback theo rarity
    const base = BASE_PRICE_BY_RARITY[ware.rarity ?? 'Thường'] ?? 50;
    return Math.max(1, Math.floor(base * 1.4 * (ware.negotiatedMultiplier ?? 1.0)));
  };

  const handleSell = (item: Item) => {
    const price = computeSellPrice(item);
    // Send dưới dạng player action để AI biết transaction xảy ra + có thể follow up
    submitAction(`Bán "${item.name}" với giá ${price} linh thạch cho ${session.traderName}`);
    setSelectedSellId(null);
  };

  const handleAskWares = () => {
    submitAction(`Hỏi ${session.traderName}: "Quản sự, ngài có gì hay bán không?"`);
  };

  const handleNegotiate = (wareName: string) => {
    submitAction(`Mặc cả với ${session.traderName} về "${wareName}", xin giảm giá`);
  };

  const handleBuy = (wareName: string, price: number) => {
    submitAction(`Mua "${wareName}" với giá ${price} linh thạch từ ${session.traderName}`);
  };

  const handleLeave = () => {
    submitAction(`Cảm ơn ${session.traderName} và rời khỏi quầy`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[125] flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,15,.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Giao dịch thương nhân"
    >
      <div className="w-full max-w-5xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <Bracketed
          className="flex max-h-[88vh] flex-col rounded-md border bg-ink-700 p-5 sm:p-6"
          tone="gold"
        >
          {/* Header */}
          <div className="mb-4 border-b border-gold-700/30 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="label-section mb-1">Giao Dịch</div>
                <h2 className="font-serif text-xl font-bold tracking-wide text-gold-200 sm:text-2xl">
                  <span aria-hidden>⚖</span> {session.traderName}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className={`uppercase tracking-widest ${attitude.color}`}>
                    {attitude.label}
                  </span>
                  <span className="text-jade-500">·</span>
                  <span className="font-mono text-jade-300">
                    Hệ số mua: ×{session.sellMultiplier.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-xs font-bold uppercase tracking-widest text-jade-500 hover:text-gold-300"
                aria-label="Đóng"
              >
                × Đóng
              </button>
            </div>
          </div>

          {/* Player currency */}
          <div className="mb-3 flex flex-shrink-0 items-center justify-between rounded border border-gold-700/30 bg-ink-900/50 px-3 py-2">
            <span className="text-[11px] uppercase tracking-widest text-jade-500">
              Linh thạch trong tay
            </span>
            <span className="font-mono text-base font-bold text-gold-200">
              {player.currency.toLocaleString()} ✦
            </span>
          </div>

          {/* 2 panes */}
          <div className="grid flex-grow grid-cols-1 gap-3 overflow-hidden lg:grid-cols-2">
            {/* PANE TRÁI: Bán (inventory player) */}
            <div className="flex flex-col overflow-hidden rounded-md border border-gold-700/30 bg-ink-900/40 p-3">
              <div className="mb-2 flex items-center justify-between border-b border-gold-700/20 pb-2">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-gold-300">
                  💰 Túi Hành Trang (Bán)
                </h3>
                <span className="font-mono text-[10px] text-jade-500">{sellable.length}</span>
              </div>

              <div className="custom-scroll flex-grow space-y-1.5 overflow-y-auto pr-1">
                {sellable.length === 0 ? (
                  <p className="py-6 text-center text-xs italic text-jade-600">
                    Không có vật phẩm nào để bán.
                  </p>
                ) : (
                  sellable.map((item) => {
                    const c = getRarityColor(item.rarity);
                    const price = computeSellPrice(item);
                    const itemBonus = session.itemSpecificSellBonuses[item.name];
                    const isSelected = selectedSellId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`rounded border px-2 py-1.5 transition-colors ${
                          isSelected
                            ? 'border-gold-400 bg-gold-900/30'
                            : `${c.border} ${c.bg} hover:bg-ink-500/30`
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ItemIcon name={item.name} category={item.category} rarity={item.rarity} size={36} className="flex-shrink-0 rounded-sm" />
                          <button
                            onClick={() => setSelectedSellId(isSelected ? null : item.id)}
                            className="flex-1 text-left min-w-0"
                          >
                            <div className={`text-[13px] font-medium ${c.text} truncate`}>{item.name}</div>
                            <div className="text-[10px] uppercase tracking-wider text-jade-500">
                              {item.rarity} · {item.category}
                            </div>
                          </button>
                          <div className="text-right">
                            <div className="font-mono text-sm text-gold-200">
                              {price.toLocaleString()}
                            </div>
                            {itemBonus !== undefined && (
                              <div
                                className={`text-[9px] font-bold uppercase tracking-widest ${
                                  itemBonus > 1.0 ? 'text-jade-400' : itemBonus < 1.0 ? 'text-ember-400' : 'text-jade-500'
                                }`}
                              >
                                ×{itemBonus.toFixed(2)}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleSell(item)}
                            className="rounded-sm border border-gold-500/40 bg-gold-900/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-300 hover:bg-gold-900/40"
                          >
                            Bán
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* PANE PHẢI: Mua (trader.wares) */}
            <div className="flex flex-col overflow-hidden rounded-md border border-gold-700/30 bg-ink-900/40 p-3">
              <div className="mb-2 flex items-center justify-between border-b border-gold-700/20 pb-2">
                <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-gold-300">
                  📦 Quầy Hàng {session.traderName} (Mua)
                </h3>
                <button
                  onClick={handleAskWares}
                  className="rounded-sm border border-spirit-500/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-spirit-300 hover:bg-spirit-900/30"
                  title="Hỏi trader có gì bán"
                >
                  ? Hỏi giá
                </button>
              </div>

              <div className="custom-scroll flex-grow space-y-1.5 overflow-y-auto pr-1">
                {session.wares.length === 0 ? (
                  <p className="py-6 text-center text-xs italic text-jade-600">
                    Quầy đang trống. Bấm "? Hỏi giá" để trader đề xuất hàng.
                  </p>
                ) : (
                  session.wares.map((ware) => {
                    const c = getRarityColor(ware.rarity);
                    const price = computeBuyPrice(ware);
                    const canAfford = player.currency >= price;
                    const negotiated = ware.negotiatedMultiplier !== undefined;
                    return (
                      <div
                        key={ware.id}
                        className={`rounded border px-2 py-1.5 ${c.border} ${c.bg}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className={`text-[13px] font-medium ${c.text}`}>{ware.name}</div>
                            <div className="text-[10px] uppercase tracking-wider text-jade-500">
                              {ware.rarity ?? 'Thường'}
                              {ware.category && ` · ${ware.category}`}
                            </div>
                            <p className="mt-0.5 text-[11px] italic text-jade-400 line-clamp-2">
                              {ware.description}
                            </p>
                            {negotiated && (
                              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-jade-400">
                                Đã mặc cả ×{ware.negotiatedMultiplier!.toFixed(2)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div
                              className={`font-mono text-sm ${
                                canAfford ? 'text-gold-200' : 'text-ember-400'
                              }`}
                            >
                              {price.toLocaleString()}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleNegotiate(ware.name)}
                                className="rounded-sm border border-jade-500/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-jade-300 hover:bg-jade-900/30"
                                title="Mặc cả giảm giá"
                              >
                                Mặc cả
                              </button>
                              <button
                                onClick={() => handleBuy(ware.name, price)}
                                disabled={!canAfford}
                                className="rounded-sm border border-gold-500/40 bg-gold-900/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold-300 hover:bg-gold-900/40 disabled:cursor-not-allowed disabled:opacity-40"
                                title={canAfford ? 'Mua ngay' : 'Không đủ linh thạch'}
                              >
                                Mua
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-4 flex flex-shrink-0 items-center justify-between border-t border-gold-700/30 pt-3">
            <p className="text-[11px] italic text-jade-600">
              💡 Mọi hành động sẽ gửi cho Thiên Đạo để diễn hóa — giá thực và outcome tùy AI quyết định.
            </p>
            <button
              onClick={handleLeave}
              className="rounded border border-ember-500/40 bg-ember-900/20 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-ember-300 hover:bg-ember-900/40"
            >
              ↩ Rời Quầy
            </button>
          </div>
        </Bracketed>
      </div>
    </div>
  );
};

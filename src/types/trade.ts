/**
 * Phase 11.3: Trade negotiation system (Pattern #5 từ Google Canvas RPG).
 *
 * Khi player vào trade mode với NPC (qua tag [ENTER_TRADE_MODE]):
 *   - traderSession active được set với trader info + wares.
 *   - AI dùng SELL_VALUATION để định giá item player muốn bán (multiplier 0.0-2.0).
 *   - AI dùng BUY_NEGOTIATION để đáp lời mặc cả của player (multiplier).
 *   - AI dùng OFFER_ITEM_IDEA để đề xuất 1 item mới → trigger pipeline gen item → push vào wares.
 *
 * Tag [EXIT_TRADE_MODE] hoặc player rời conversation → close session.
 */

/** 1 món hàng AI đang offer / sale */
export interface TraderWare {
  /** Có thể là item id thật (nếu đã pipeline gen) hoặc temp id placeholder */
  id: string;
  name: string;
  description: string;
  rarity?: string;
  category?: string;
  /** Giá AI propose. Nếu không có thì engine tính theo rarity bậc thang */
  price?: number;
  /** Multiplier giảm giá nếu negotiate thành công (apply lên price) */
  negotiatedMultiplier?: number;
  /** True nếu wares đã pipeline gen full Item, false nếu chỉ là idea */
  materialized?: boolean;
}

export interface TraderSession {
  /** NPC name đang giao dịch */
  traderName: string;
  /** Thái độ / mood — ảnh hưởng base multiplier */
  attitude?: 'friendly' | 'neutral' | 'hostile';
  /** Multiplier MẶC ĐỊNH áp lên toàn bộ giá BÁN của player (1.0 = full giá) */
  sellMultiplier: number;
  /** Bonus per-item nếu AI ưu tiên/khinh thường */
  itemSpecificSellBonuses: Record<string, number>;
  /** Wares trader đang offer */
  wares: TraderWare[];
  /** Lịch sử negotiate cho biết AI vừa giảm giá ware nào */
  lastNegotiation?: {
    itemName: string;
    multiplier: number;
    turn: number;
  };
}

export const EMPTY_TRADER_SESSION = (traderName: string): TraderSession => ({
  traderName,
  attitude: 'neutral',
  sellMultiplier: 1.0,
  itemSpecificSellBonuses: {},
  wares: [],
});

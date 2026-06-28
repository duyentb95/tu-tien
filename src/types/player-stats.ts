/**
 * Phase 20: Player lifetime stats — accumulator track-once-update-many.
 *
 * Khác Player.currency / level (current state) — đây là TỔNG đã từng đạt được:
 *   - totalKills: combat win count (≠ enemies định danh — every combat = 1)
 *   - totalEpEarned: sum of all EP awarded từ submitAction
 *   - totalCurrencyEarned: lifetime linh thạch nhặt được (chứ KHÔNG phải tiêu thụ)
 *   - turnsPlayed: total submitAction call (different from current `turn` nếu Sếp reset)
 *   - legendaryItemsOwned: count rarity 'Huyền Thoại' trong inventory (computed mỗi tick)
 *
 * Dùng cho:
 *   - Achievement check (kill_50, ep_1000, item_legendary, etc.)
 *   - StatsPanel UI "Thiên Cơ Toán" hiển thị flex
 *   - Future leaderboard (anonymous deviceId vs global)
 */

export interface PlayerLifetimeStats {
  /** Combat wins (count) */
  totalKills: number;
  /** Combat losses / fled (count) */
  totalDefeats: number;
  /** Sum of all EP earned từ submitAction */
  totalEpEarned: number;
  /** Lifetime currency (Linh Thạch) earned — KHÔNG trừ khi tiêu */
  totalCurrencyEarned: number;
  /** Total submitAction calls — bền hơn `turn` (turn reset khi new game) */
  turnsPlayed: number;
  /** Số vật phẩm rarity Huyền Thoại hiện đang sở hữu (recomputed mỗi inventory change) */
  legendaryItemsOwned: number;
  /** Tributations passed */
  tribulationsPassed: number;
  /** Realm breaks lifetime (≠ current level — tính cả khi reset) */
  realmBreaksLifetime: number;
}

export const INITIAL_LIFETIME_STATS: PlayerLifetimeStats = {
  totalKills: 0,
  totalDefeats: 0,
  totalEpEarned: 0,
  totalCurrencyEarned: 0,
  turnsPlayed: 0,
  legendaryItemsOwned: 0,
  tribulationsPassed: 0,
  realmBreaksLifetime: 0,
};

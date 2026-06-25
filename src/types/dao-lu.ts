/**
 * Đạo Lữ (Dao Companion) — NPC affinity system.
 *
 * Affinity 0-100 — đo độ thân thiết với 1 NPC cụ thể.
 * - 0-20: lạnh nhạt
 * - 21-50: bình thường / quen biết
 * - 51-80: thân hữu / tri kỷ
 * - 81-100: đạo lữ — unlock song tu, có bonus EXP cộng hưởng
 *
 * AI tag mới:
 *   [AFFINITY+ NPC_NAME|amount]   — Tăng affinity với NPC
 *   [AFFINITY- NPC_NAME|amount]   — Giảm (cãi nhau, làm tổn thương)
 *   [DAO_LU NPC_NAME]             — Kết đạo lữ chính thức (yêu cầu affinity ≥ 80)
 *
 * Song tu bonus: EXP gain ×1.3 nếu có active dao-lu ở cùng location.
 */

export interface DaoCompanion {
  /** Tên NPC */
  name: string;
  affinity: number;
  /** Lần đầu gặp turn nào */
  metAtTurn: number;
  /** Có phải đạo lữ chính thức không */
  isPartner: boolean;
  /** Nếu đạo lữ — turn kết duyên */
  partneredAtTurn?: number;
  /** Notes — sự kiện đáng nhớ */
  notes?: string[];
  /** Element / giới tính nếu biết */
  gender?: string;
  /** Nếu đang đồng hành (có thể bonus EXP) */
  isAccompanying?: boolean;
}

export const getAffinityLabel = (a: number): string => {
  if (a >= 81) return 'Đạo Lữ';
  if (a >= 51) return 'Tri Kỷ';
  if (a >= 21) return 'Quen Biết';
  return 'Lạnh Nhạt';
};

export const getAffinityColor = (a: number): string => {
  if (a >= 81) return '#a78bfa';
  if (a >= 51) return '#cda45e';
  if (a >= 21) return '#8ba888';
  return '#5e7a5d';
};

/** Bonus EXP multiplier khi có đạo lữ accompany */
export const SONG_TU_BONUS = 1.3;

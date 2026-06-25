import type { Element } from './character';
import type { Rarity } from './item';

export type BeastKind =
  | 'sword_spirit'  // Kiếm linh (vũ khí có linh tính)
  | 'beast'         // Yêu thú thường (cọp, sói, hổ)
  | 'dragon'        // Long tộc (rồng, giao long)
  | 'phoenix'       // Phượng tộc (chim huyền thoại)
  | 'spirit'        // Hồn linh (ma quỷ thiện)
  | 'mystical';     // Dị thú (kỳ quái, vô loại)

/**
 * Một stage evolution. Beast level tăng → reach threshold → evolve thành stage cao hơn.
 */
export interface BeastStage {
  /** Tên hiển thị ở stage này (vd: "Tiểu Hồ Tinh" → "Cửu Vĩ Hồ") */
  name: string;
  /** Cấp tối thiểu để đạt stage này */
  minLevel: number;
  /** Stats multiplier so với base (Phượng cấp 30 = 3× base) */
  statMultiplier: number;
  /** Yêu cầu food/item để evolve lên stage này */
  evolutionCost?: { currency?: number; itemName?: string };
  /** Mô tả ngắn */
  description: string;
}

export interface BeastTemplate {
  id: string;
  baseName: string;          // tên ban đầu khi chưa evolve
  rarity: Rarity;
  kind: BeastKind;
  element?: Element;
  /** Stats khởi đầu khi capture (level 1) */
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spd: number;
  };
  /** Yêu cầu để có thể capture */
  captureRequirement?: {
    /** Phải đạt cấp này mới capture được */
    playerLevelMin?: number;
    /** % chance capture khi HP đối thủ < 20% */
    baseCaptureChance: number;
  };
  /** Stages evolution — phải sort theo minLevel asc */
  stages: BeastStage[];
}

export interface SpiritBeast {
  /** Unique instance ID */
  id: string;
  templateId: string;
  /** Tên hiện tại (cập nhật theo stage) */
  name: string;
  level: number;
  exp: number;
  /** Stage index hiện tại trong template.stages */
  stageIdx: number;
  /** HP hiện tại (max = base × stage mult × level) */
  hp: number;
  maxhp: number;
  /** Loyalty 0-100 — affinity với player, dùng cho special command */
  loyalty: number;
  capturedAtTurn: number;
  /** Có đang đồng hành combat không */
  isActive: boolean;
  /** Đã chết trong combat — không respawn được trừ khi feed Hồi Sinh Đan */
  dead?: boolean;
}

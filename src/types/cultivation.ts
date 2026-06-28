/**
 * Phase 23.3-23.7: Cultivation deep system — Ý Cảnh + Pháp Tắc + Đại Đạo.
 *
 * Triết lý tu tiên truyền thống VN/TQ:
 *   - Ý Cảnh = "ý chí gắn với vũ khí" — kiếm ý, đao ý, quyền ý, chỉ ý, pháp ý.
 *     Mỗi loại 9 cấp. Tăng theo combat cast skill cùng weapon type.
 *
 *   - Pháp Tắc = "luật trời", chỉ ngộ được sau Hợp Thể (cấp 70+).
 *     Mỗi pháp tắc cho 1 passive buff đặc biệt (vd Thời-Không Tắc → giảm cooldown skill).
 *
 *   - Đại Đạo = "con đường tu" — Hỏa Đạo, Lôi Đạo, Thời Gian, Không Gian, Tử Vong...
 *     KHÔNG hardcode 3000 — AI sinh linh hoạt theo canon pack + meditation roll.
 *     Mỗi đạo 9 cấp. Tăng damage element + unlock special abilities.
 */

// ─────────────────────────────────────────────────────────
// Ý Cảnh — Weapon Intent
// ─────────────────────────────────────────────────────────

/** 5 loại ý cảnh cơ bản — tương ứng weapon kind */
export type WeaponIntentName =
  | 'kiếm ý'   // kiếm
  | 'đao ý'    // đao
  | 'quyền ý'  // quyền (vô vũ khí)
  | 'chỉ ý'    // chỉ pháp
  | 'pháp ý';  // pháp bảo phổ thông

export interface WeaponIntentEntry {
  level: number; // 1-9
  xp: number;
  /** Total turn dùng skill kích hoạt intent này */
  totalUses: number;
}

export type WeaponIntentState = Record<string, WeaponIntentEntry>;

export const INTENT_TIER_NAMES: Record<number, string> = {
  1: 'Sơ Khởi',
  2: 'Tiểu Thành',
  3: 'Đại Thành',
  4: 'Viên Mãn',
  5: 'Tinh Diệu',
  6: 'Cảnh Giới',
  7: 'Thiên Ý',
  8: 'Đạo Cảnh',
  9: 'Vô Thượng',
};

// ─────────────────────────────────────────────────────────
// Pháp Tắc — Laws of Heaven
// ─────────────────────────────────────────────────────────

export interface PhapTacDef {
  id: string;
  name: string;
  category: 'sinh-tử' | 'thời-không' | 'luân-hồi' | 'nhân-quả' | 'hỗn-độn' | 'đạo-lý' | 'tà' | 'thần';
  description: string;
  /** Realm tối thiểu để ngộ (level player). Default 70 = ~Hợp Thể */
  minLevel: number;
  /** Passive buff khi unlocked — text mô tả + numeric fields */
  passive: {
    description: string;
    hpMul?: number;       // multiplier max HP
    atkMul?: number;
    defMul?: number;
    cooldownReduce?: number; // -N% cooldown skill
    epMul?: number;       // +% EP gain
  };
  /** Pack canon đặc thù — chỉ hiện khi player chọn canon này (optional) */
  canonExclusive?: string;
}

export interface PhapTacState {
  /** ID pháp tắc đã unlock — order theo unlocked time */
  unlocked: string[];
  /** ID pháp tắc đang active (tối đa 3 cùng lúc) */
  active: string[];
}

// ─────────────────────────────────────────────────────────
// Đại Đạo — AI-generated paths
// ─────────────────────────────────────────────────────────

export interface DaiDaoEntry {
  /** Name AI sinh, vd "Hỏa Đạo", "Lôi Đạo", "Thời Gian Đạo" */
  name: string;
  /** Mô tả ngắn AI sinh */
  description: string;
  /** 1-9 */
  level: number;
  /** XP để lên level kế */
  xp: number;
  /** Element associated nếu có (kim/moc/thuy/hoa/tho/loi/phong/bang) */
  element?: import('./character').Element;
  /** Unlocked at turn N */
  unlockedAtTurn?: number;
}

export interface DaiDaoState {
  /** Records AI sinh — key = name slug */
  paths: Record<string, DaiDaoEntry>;
  /** Tối đa 3 main path player chọn focus (mỗi tu sĩ chỉ tu được vài đạo) */
  focused: string[];
}

// ─────────────────────────────────────────────────────────
// Combined cultivation slice
// ─────────────────────────────────────────────────────────

export interface CultivationState {
  intents: WeaponIntentState;
  laws: PhapTacState;
  dao: DaiDaoState;
  /** Insights nhặt được khi ngộ đạo — log lưu storyLog reference */
  recentInsights: Array<{
    turn: number;
    text: string;
    /** Loại reward */
    reward?: { kind: 'intent_xp' | 'dao_xp' | 'law_unlock' | 'pure_insight'; target?: string; amount?: number };
  }>;
}

export const INITIAL_CULTIVATION: CultivationState = {
  intents: {},
  laws: { unlocked: [], active: [] },
  dao: { paths: {}, focused: [] },
  recentInsights: [],
};

/**
 * Phase 24.A: Skill Deep System — Talent Tree + Combo + Rune.
 *
 * Triết lý:
 *   - Mastery (Phase 23.2) là level cơ bản, tự lên qua dùng skill.
 *   - Talent Tree mở khi mastery đạt lv 3/4/5 → chọn 1 trong 3 nhánh (ATK/DEF/UTILITY).
 *   - Combo: 2 skill cùng equip trong combat slot → unlock passive bonus theo registry.
 *   - Rune: 3 slot mỗi skill, attach rune crafted từ Nguyên liệu + Linh Thạch.
 *
 * Mọi field optional → backward-compat save cũ.
 */

// ─────────────────────────────────────────────────────────
// Talent Tree — 3 tier × 3 nhánh
// ─────────────────────────────────────────────────────────

export type TalentBranch = 'atk' | 'def' | 'utility';

export interface TalentNode {
  /** Tier tương ứng mastery level requirement: 3, 4, 5 */
  tier: 3 | 4 | 5;
  branch: TalentBranch;
  /** Tên hiển thị (vd "Sát Khí Bùng Phát") */
  name: string;
  /** Mô tả ngắn cho UI */
  description: string;
  /** Effect numeric — apply trong combat */
  effect: {
    /** % bonus damage cộng vào skill multiplier */
    damageBonus?: number;
    /** % giảm cooldown */
    cooldownReduce?: number;
    /** % lifesteal */
    lifesteal?: number;
    /** % bonus DEF khi cast skill (1 turn) */
    defBuff?: number;
    /** Chance trigger crit guaranteed */
    critGuarantee?: number;
    /** % heal/turn khi skill equipped */
    healOverTime?: number;
    /** Custom passive flag — for special effects */
    passiveFlag?: string;
  };
}

/** State: per-skill, lưu choice ở từng tier */
export interface SkillTalentState {
  /** Choice tại tier 3 — null = chưa chọn (vẫn mastery lv < 3) */
  t3: TalentBranch | null;
  /** Choice tại tier 4 */
  t4: TalentBranch | null;
  /** Choice tại tier 5 */
  t5: TalentBranch | null;
  /** Số lần đã reset (tốn tăng theo lần) */
  resetCount: number;
}

export type SkillTalentsState = Record<string, SkillTalentState>;

export const INITIAL_TALENT_STATE: SkillTalentState = {
  t3: null,
  t4: null,
  t5: null,
  resetCount: 0,
};

// ─────────────────────────────────────────────────────────
// Combo System
// ─────────────────────────────────────────────────────────

export interface SkillComboDef {
  id: string;
  name: string;
  description: string;
  /** 2-3 skill cần equip cùng lúc trong combat slot. Match bằng skill ID hoặc keyword tên. */
  requiresSkills: string[];
  /** Match kiểu name regex (vd /kiếm/i) để flexible với AI-generated skills */
  requiresNamePatterns?: RegExp[];
  /** Passive effect khi combo active */
  effect: {
    /** % damage bonus cho cả 2 skill */
    damageBonus?: number;
    /** % cooldown reduction */
    cooldownReduce?: number;
    /** Custom effect tag (vd "burn_dot", "freeze_chance") */
    specialTag?: string;
    /** Damage threshold cho special trigger */
    triggerHpPct?: number;
  };
  /** Tier hiển thị: bronze / silver / gold / mystic */
  tier: 'bronze' | 'silver' | 'gold' | 'mystic';
}

// ─────────────────────────────────────────────────────────
// Rune System
// ─────────────────────────────────────────────────────────

export type RuneKind = 'sat' | 'toc' | 'hap' | 'pha' | 'sinh' | 'nguyen';
//   sat = sát (ATK), toc = tốc (CD), hap = hấp (lifesteal),
//   pha = phá (penetration), sinh = sinh (HoT), nguyen = nguyên (mana cost reduce)

export interface RuneDef {
  id: string;
  /** Tên hiển thị: "Sát Văn Lv 3" */
  name: string;
  kind: RuneKind;
  /** Cấp 1-5: Sơ / Tinh / Cao / Tuyệt / Thiên */
  tier: 1 | 2 | 3 | 4 | 5;
  /** Effect cộng dồn khi attach */
  effect: {
    damageBonus?: number;    // %
    cooldownReduce?: number; // %
    lifesteal?: number;      // %
    penetration?: number;    // % bỏ qua DEF
    healOverTime?: number;   // flat HP/turn
    costReduce?: number;     // %
  };
  /** Linh thạch + nguyên liệu để craft */
  craftCost: {
    linhThach: number;
    tienNgoc?: number;
    materials?: Array<{ name: string; count: number }>;
  };
  description: string;
}

/** Rune trong inventory — quantity stack */
export interface RuneInstance {
  /** ref đến RuneDef.id */
  defId: string;
  /** Số lượng có sẵn (chưa attach) */
  quantity: number;
}

/** Attach state: skillId → 3-slot tuple of runeDefId (null = empty) */
export type SkillRuneSlots = [string | null, string | null, string | null];
export type SkillRunesState = Record<string, SkillRuneSlots>;

// ─────────────────────────────────────────────────────────
// Combined deep slice — wrap tất cả lại
// ─────────────────────────────────────────────────────────

export interface SkillDeepState {
  /** Talent tree choices per skill */
  talents: SkillTalentsState;
  /** Rune attach per skill (skillId → 3-slot tuple) */
  runeSlots: SkillRunesState;
  /** Rune inventory (defId → instance with quantity) */
  runeInventory: Record<string, RuneInstance>;
  /** Last combat combo active — ephemeral for UI display, không cần save */
  lastActiveCombos?: string[];
}

export const INITIAL_SKILL_DEEP: SkillDeepState = {
  talents: {},
  runeSlots: {},
  runeInventory: {},
};

export const MAX_RUNE_SLOTS_PER_SKILL = 3;

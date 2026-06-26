/**
 * 2-tier lore system (theo prototype pattern).
 *
 * Tier 1 — LORE_*: tin đồn / câu chuyện về entity người chơi CHƯA gặp thật sự.
 *   - Vd: NPC trong làng kể về "Vạn Pháp Tông ở phía bắc"
 *   - Hay tin đồn về "Thanh Vân Kiếm Tiên — đại tu sĩ ẩn cư"
 *   - id format: 'lore_npc_xxx', 'lore_loc_xxx', 'lore_item_xxx', 'lore_quest_xxx'
 *
 * Tier 2 — WORLD_*: entity ĐÃ xuất hiện cụ thể trong game, có state thực.
 *   - Vd: player thực sự đi đến Vạn Pháp Tông → tag WORLD_LOCATION + loreId link về tin đồn gốc
 *   - Player gặp Thanh Vân Kiếm Tiên → WORLD_NPC + loreId
 *
 * Lợi ích:
 *   - AI có thể "foreshadow" — nhắc đến NPC/location trước, gặp sau
 *   - Mạch truyện liên kết tự nhiên (player nhớ tin đồn → đến gặp thật)
 *   - Knowledge tab hiển thị 2 cột "Đã nghe" vs "Đã chứng kiến" (immersion cao)
 */

import type { LocationType } from './world';

// ─────────────────────────────────────────────────────────────
// Tier 1: LORE entries (rumor, chưa materialized)
// ─────────────────────────────────────────────────────────────

export interface LoreNPC {
  /** Format: 'lore_npc_<slug>' */
  id: string;
  name: string;
  description: string;
  /** Nguồn tin đồn — vd "Tần Phụng kể", "Đọc trên bia đá Bích Vân" */
  source?: string;
  /** Turn mà tin đồn xuất hiện đầu tiên — dùng cho expire/relevance */
  introducedAtTurn?: number;
  /** Đã được materialize chưa? (nếu có WORLD_NPC link về thì set true) */
  materialized?: boolean;
}

export interface LoreLocation {
  id: string;            // 'lore_loc_<slug>'
  name: string;
  description: string;
  /** wilderness | city | sect | secret_realm | cave_abode | mountain | ruins | special */
  category?: LocationType;
  /** Hướng/khu vực gợi ý (vd "phía bắc Đại Hoang") */
  region?: string;
  source?: string;
  introducedAtTurn?: number;
  materialized?: boolean;
}

export interface LoreItem {
  id: string;            // 'lore_item_<slug>'
  name: string;
  description: string;
  rarity?: string;       // tin đồn về phẩm chất
  source?: string;
  introducedAtTurn?: number;
  materialized?: boolean;
}

export interface LoreQuest {
  /** Format: 'lore_quest_<slug>' */
  id: string;
  title: string;
  description: string;
  /** Ai/cái gì tạo ra tin đồn về quest này */
  source?: string;
  introducedAtTurn?: number;
  /** Đã được player ASSIGNED chính thức chưa */
  assigned?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Tier 2: WORLD entries (materialized — có state thực)
// ─────────────────────────────────────────────────────────────
//
// Note: WorldNPC/WorldLocation đã có sẵn (knowledge.characters/locations).
// Em chỉ thêm field optional `loreId` để link về Tier 1 (nếu có).
//
// Trong code:
//   - knowledge.characters[id].loreId?  → string trỏ về loreNpcs[loreId]
//   - knowledge.locations[id].loreId?   → string trỏ về loreLocations[loreId]
//
// Type chính đã ở @gametypes/world (Location), @state/game-store (characters Record<string, unknown>).
// Để type-safe, em define LoreLink helper:

export interface LoreLink {
  loreId?: string;
}

// ─────────────────────────────────────────────────────────────
// Knowledge slice extension
// ─────────────────────────────────────────────────────────────

export interface LoreKnowledgeSlice {
  loreNpcs: Record<string, LoreNPC>;
  loreLocations: Record<string, LoreLocation>;
  loreItems: Record<string, LoreItem>;
  loreQuests: Record<string, LoreQuest>;
}

export const EMPTY_LORE_KNOWLEDGE: LoreKnowledgeSlice = {
  loreNpcs: {},
  loreLocations: {},
  loreItems: {},
  loreQuests: {},
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Slugify name → id format. Vd: "Vạn Pháp Tông" → "van_phap_tong"
 * Strip diacritic + lowercase + replace non-word chars.
 */
export const slugifyLoreName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip Vietnamese diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
};

/**
 * Generate lore id từ kind + name.
 * Vd: makeLoreId('npc', 'Tần Phụng') → 'lore_npc_tan_phung'
 */
export const makeLoreId = (kind: 'npc' | 'loc' | 'item' | 'quest', name: string): string => {
  return `lore_${kind}_${slugifyLoreName(name)}`;
};

/**
 * Mark lore as materialized — gọi khi WORLD_* tag fire với loreId link.
 * Pure: return new object thay vì mutate.
 */
export const markLoreMaterialized = <T extends { materialized?: boolean }>(lore: T): T => {
  return { ...lore, materialized: true };
};

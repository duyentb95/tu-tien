/**
 * Phase 10.2: Entity Lookup & Format Helpers
 *
 * Mục đích: Cho phép Logic Engine trả về danh sách `relevant_entities` (tên),
 * sau đó hệ thống tự tra cứu chi tiết từng entity trong knowledge state và
 * inject vào prompt Narrative Engine → AI viết prose dùng đúng tên + chỉ số,
 * không bịa.
 *
 * Pattern này lấy từ Google Canvas RPG reference (xem docs/reference/).
 */

/** Context tra cứu — tất cả entity sources đã có trong narrative pipeline */
export interface EntityLookupContext {
  /** NPC đã materialize trong thế giới */
  worldNpcs?: Array<{ id: string; name: string; description?: string; loreId?: string }>;
  /** Tin đồn về NPC chưa gặp */
  loreNpcs?: Array<{ id: string; name: string; description: string; materialized?: boolean }>;
  /** Địa điểm vật lý */
  worldLocations?: Array<{ id: string; name: string; description?: string; loreId?: string }>;
  /** Tin đồn về địa điểm chưa khám phá */
  loreLocations?: Array<{ id: string; name: string; description: string; region?: string; materialized?: boolean }>;
  /** Items + Skills universe fan-fic (đã được analyzer hydrate) */
  fanFicItems?: Array<{ name: string; category: string; rarity: string; description: string }>;
  fanFicSkills?: Array<{ name: string; kind: string; rarity: string; description: string }>;
  /** Knowledge state items (lore items chỉ tin đồn) */
  loreItems?: Record<string, { name: string; description: string; rarity: string }>;
  /** Skills nhân vật đã biết — pass tên + mô tả ngắn */
  knownSkills?: Array<{ name: string; description?: string; kind?: string; rarity?: string }>;
  /** Items đang có trong inventory player — pass tên + mô tả */
  inventoryItems?: Array<{ name: string; description?: string; rarity?: string; category?: string }>;
}

export interface EntityLookupResult {
  type: 'npc' | 'lore_npc' | 'location' | 'lore_location' | 'item' | 'lore_item' | 'skill';
  /** Thông tin format-ready */
  formatted: string;
}

/**
 * Tìm entity bằng tên (case-insensitive). Ưu tiên: thực thể vật lý → lore → fan-fic universe.
 * Trả về string format-ready hoặc null nếu không tìm thấy.
 */
export const lookupEntity = (
  name: string,
  ctx: EntityLookupContext,
): EntityLookupResult | null => {
  if (!name || !name.trim()) return null;
  const target = name.trim().toLowerCase();

  // 1. Inventory item (player đang sở hữu)
  const invItem = ctx.inventoryItems?.find((i) => i.name.toLowerCase() === target);
  if (invItem) {
    const cat = invItem.category ? `, ${invItem.category}` : '';
    const desc = invItem.description ? `: ${invItem.description.slice(0, 80)}` : '';
    return {
      type: 'item',
      formatted: `  · **[Vật phẩm sở hữu]** ${invItem.name} [${invItem.rarity ?? '?'}${cat}]${desc}`,
    };
  }

  // 2. Skill đã biết
  const skill = ctx.knownSkills?.find((s) => s.name.toLowerCase() === target);
  if (skill) {
    const meta = [skill.rarity, skill.kind].filter(Boolean).join(', ');
    const desc = skill.description ? `: ${skill.description.slice(0, 80)}` : '';
    return {
      type: 'skill',
      formatted: `  · **[Kỹ năng]** ${skill.name}${meta ? ` [${meta}]` : ''}${desc}`,
    };
  }

  // 3. World NPC (đã materialize)
  const worldNpc = ctx.worldNpcs?.find((n) => n.name.toLowerCase() === target);
  if (worldNpc) {
    const desc = worldNpc.description ? `: ${worldNpc.description.slice(0, 100)}` : '';
    return {
      type: 'npc',
      formatted: `  · **[NPC]** ${worldNpc.name}${desc}`,
    };
  }

  // 4. World Location
  const worldLoc = ctx.worldLocations?.find((l) => l.name.toLowerCase() === target);
  if (worldLoc) {
    const desc = worldLoc.description ? `: ${worldLoc.description.slice(0, 100)}` : '';
    return {
      type: 'location',
      formatted: `  · **[Địa điểm]** ${worldLoc.name}${desc}`,
    };
  }

  // 5. Lore NPC (tin đồn)
  const loreNpc = ctx.loreNpcs?.find((n) => n.name.toLowerCase() === target);
  if (loreNpc) {
    return {
      type: 'lore_npc',
      formatted: `  · **[NPC tin đồn]** ${loreNpc.name}: ${loreNpc.description.slice(0, 100)}`,
    };
  }

  // 6. Lore Location
  const loreLoc = ctx.loreLocations?.find((l) => l.name.toLowerCase() === target);
  if (loreLoc) {
    const region = loreLoc.region ? ` [${loreLoc.region}]` : '';
    return {
      type: 'lore_location',
      formatted: `  · **[Địa điểm tin đồn]**${region} ${loreLoc.name}: ${loreLoc.description.slice(0, 100)}`,
    };
  }

  // 7. Lore Item (tin đồn vật phẩm)
  if (ctx.loreItems) {
    for (const lid of Object.values(ctx.loreItems)) {
      if (lid.name.toLowerCase() === target) {
        return {
          type: 'lore_item',
          formatted: `  · **[Vật phẩm tin đồn]** ${lid.name} [${lid.rarity}]: ${lid.description.slice(0, 80)}`,
        };
      }
    }
  }

  // 8. Fan-fic universe items
  const ffItem = ctx.fanFicItems?.find((i) => i.name.toLowerCase() === target);
  if (ffItem) {
    return {
      type: 'lore_item',
      formatted: `  · **[Vật phẩm universe]** ${ffItem.name} [${ffItem.rarity}, ${ffItem.category}]: ${ffItem.description.slice(0, 80)}`,
    };
  }

  // 9. Fan-fic universe skills
  const ffSkill = ctx.fanFicSkills?.find((s) => s.name.toLowerCase() === target);
  if (ffSkill) {
    return {
      type: 'skill',
      formatted: `  · **[Kỹ năng universe]** ${ffSkill.name} [${ffSkill.rarity}, ${ffSkill.kind}]: ${ffSkill.description.slice(0, 80)}`,
    };
  }

  return null;
};

/**
 * Lookup list entity names → format thành block ready-to-inject vào prompt.
 * Entity không tìm thấy được note rõ để AI biết "đó là entity bịa, lờ đi".
 */
export const buildEntityContextBlock = (
  names: string[] | undefined,
  ctx: EntityLookupContext,
): string => {
  if (!names || names.length === 0) return '';

  const found: string[] = [];
  const notFound: string[] = [];

  for (const name of names) {
    const result = lookupEntity(name, ctx);
    if (result) {
      found.push(result.formatted);
    } else {
      notFound.push(name);
    }
  }

  if (found.length === 0 && notFound.length === 0) return '';

  const blocks: string[] = [
    '[THỰC THỂ TRỌNG TÂM TRONG SCENARIO — DÙNG ĐÚNG TÊN + CHỈ SỐ KHI VIẾT PROSE]',
  ];

  if (found.length > 0) {
    blocks.push(...found);
  }

  if (notFound.length > 0) {
    blocks.push(
      `(⚠️ AI Logic Engine đã đề cập các tên sau nhưng không có trong knowledge: ${notFound.join(', ')}. ĐỪNG dùng các tên này, thay bằng từ ngữ chung hoặc bỏ qua.)`,
    );
  }

  return blocks.join('\n');
};

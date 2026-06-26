/**
 * AI TAG PARSER — đây là phần khiến AI "có power" thay đổi state game.
 *
 * AI có thể inject các tag sau vào response (ngoài <narrative>):
 *
 *   [EXP+ amount]                         → +EXP cho player
 *   [HP+ amount]  /  [HP- amount]         → heal hoặc dame
 *   [CURRENCY+ amount] / [CURRENCY- ...]  → linh thạch
 *   [AP+ amount]                          → điểm tiềm năng
 *   [STAT atk|def|spd|hp + amount]        → buff vĩnh viễn 1 stat
 *   [ITEM name|rarity|category]           → thêm item vào inventory
 *   [SKILL name|kind|rarity]              → học skill mới
 *   [REALM_BREAK]                         → trigger đột phá cảnh giới
 *   [TRIBULATION]                         → trigger độ kiếp screen
 *   [COMBAT enemy_name|enemy_level]       → trigger combat screen
 *   [LOCATION new_location_id|name]       → đổi location
 *   [STATUS_ADD status_id|duration_hours] → áp long-term status
 *   [STATUS_CURE status_id]               → giải status
 *   [NOTE message]                        → hiển thị system message trong story
 *
 * Mỗi tag occupies 1 line riêng hoặc inline. Parse tất cả, return events.
 */

export type GameEvent =
  | { type: 'EXP_GAIN'; amount: number }
  | { type: 'HP_DELTA'; amount: number } // âm = damage
  | { type: 'CURRENCY_DELTA'; amount: number }
  | { type: 'AP_GAIN'; amount: number }
  | { type: 'STAT_BUFF'; stat: 'atk' | 'def' | 'spd' | 'hp'; amount: number }
  | { type: 'ITEM_GAINED'; name: string; rarity: string; category: string }
  | { type: 'SKILL_LEARNED'; name: string; kind: string; rarity: string }
  | { type: 'REALM_BREAK' }
  | { type: 'TRIBULATION'; reason?: string }
  | { type: 'COMBAT_START'; enemyName: string; enemyLevel: number }
  | { type: 'LOCATION_CHANGE'; locationId: string; name: string }
  | { type: 'STATUS_ADD'; statusId: string; durationHours?: number }
  | { type: 'STATUS_CURE'; statusId: string }
  | { type: 'NOTE'; message: string }
  | { type: 'QUEST_GIVEN'; title: string; kind: string; description: string; giver?: string }
  | { type: 'QUEST_COMPLETE'; title: string }
  | { type: 'QUEST_FAILED'; title: string }
  | { type: 'AFFINITY_DELTA'; npcName: string; amount: number }
  | { type: 'DAO_LU'; npcName: string }
  // ─── 2-tier lore (Refactor 3) ───
  | { type: 'LORE_NPC'; id: string; name: string; description: string; source?: string }
  | { type: 'LORE_LOCATION'; id: string; name: string; description: string; category?: string; region?: string; source?: string }
  | { type: 'LORE_ITEM'; id: string; name: string; description: string; rarity?: string; source?: string }
  | { type: 'LORE_QUEST'; id: string; title: string; description: string; source?: string }
  | { type: 'WORLD_NPC'; id: string; loreId?: string; name: string; description?: string; level?: number; stance?: string }
  | { type: 'WORLD_LOCATION'; id: string; loreId?: string; name: string; description?: string; category?: string }
  // ─── Tag taxonomy expand (Refactor 4) ───
  | {
      type: 'CHARACTER_UPDATE';
      target: string;        // 'player' | NPC name
      currency?: number;     // delta
      hp?: number;           // delta
      stance?: string;
      affinity?: number;     // delta
    }
  | { type: 'APPLY_LONG_TERM_STATUS'; target: string; statusId: string; hours?: number }
  | { type: 'CURE_LONG_TERM_STATUS'; target: string; statusId: string }
  | { type: 'RELATIONSHIP_CHANGED'; npcName: string; standing: string; reason?: string }
  | { type: 'QUEST_OBJECTIVE_COMPLETED'; questTitle: string; objective: string; quantity?: number }
  | { type: 'QUEST_OBJECTIVE_UPDATED'; questTitle: string; objective: string; newText?: string }
  | {
      type: 'ENCOUNTER_REWARD';
      epScore: number;       // 0-100
      reason: string;
      target?: string;       // 'player' | 'all'
    }
  | {
      type: 'TIME_PASSED';
      years?: number;
      months?: number;
      days?: number;
      hours?: number;
      weather?: string;
    }
  | { type: 'ITEM_IDEA_GAINED'; name: string; description: string; rarity?: string }
  // ─── Phase 11.3: Trade negotiation tags (Pattern #5) ───
  | { type: 'ENTER_TRADE_MODE'; traderName: string; attitude?: 'friendly' | 'neutral' | 'hostile' }
  | { type: 'EXIT_TRADE_MODE' }
  | { type: 'SELL_VALUATION'; itemName?: string; multiplier: number }
  | { type: 'BUY_NEGOTIATION'; itemName: string; multiplier: number }
  | { type: 'OFFER_ITEM_IDEA'; name: string; description: string; rarity?: string; category?: string; price?: number };

const TAG_REGEX = /\[([A-Z_]+)([+\-]?)\s*([^\]]*)\]/g;

/**
 * Parse key="value" attribute syntax từ body.
 * Vd input: 'id="lore_npc_x" name="Tần Phụng" description="Trưởng làng"'
 * Output: { id: 'lore_npc_x', name: 'Tần Phụng', description: 'Trưởng làng' }
 *
 * Hỗ trợ:
 *   - Double quote: name="value"
 *   - Single quote: name='value'
 *   - Number không quote: level=10
 */
const parseKVAttrs = (body: string): Record<string, string> => {
  const result: Record<string, string> = {};
  const re = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const key = m[1]!;
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    result[key] = value;
  }
  return result;
};

export const parseGameTags = (raw: string): GameEvent[] => {
  const events: GameEvent[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(TAG_REGEX.source, 'g');

  while ((m = re.exec(raw)) !== null) {
    const tagName = m[1]!;
    const sign = m[2] ?? '';
    const body = (m[3] ?? '').trim();

    switch (tagName) {
      case 'EXP': {
        const n = parseInt(body, 10);
        if (!Number.isNaN(n)) events.push({ type: 'EXP_GAIN', amount: n });
        break;
      }
      case 'HP': {
        const n = parseInt(body, 10);
        if (!Number.isNaN(n)) events.push({ type: 'HP_DELTA', amount: sign === '-' ? -n : n });
        break;
      }
      case 'CURRENCY': {
        const n = parseInt(body, 10);
        if (!Number.isNaN(n))
          events.push({ type: 'CURRENCY_DELTA', amount: sign === '-' ? -n : n });
        break;
      }
      case 'AP': {
        const n = parseInt(body, 10);
        if (!Number.isNaN(n)) events.push({ type: 'AP_GAIN', amount: n });
        break;
      }
      case 'STAT': {
        // Format: [STAT atk+10] hoặc [STAT def+5]
        const sm = body.match(/^(atk|def|spd|hp)\s*([+\-]?)\s*(\d+)$/i);
        if (sm) {
          const [, stat, ssign, amt] = sm;
          events.push({
            type: 'STAT_BUFF',
            stat: stat!.toLowerCase() as 'atk' | 'def' | 'spd' | 'hp',
            amount: ssign === '-' ? -parseInt(amt!, 10) : parseInt(amt!, 10),
          });
        }
        break;
      }
      case 'ITEM': {
        // Format: [ITEM name|rarity|category]
        const parts = body.split('|').map((s) => s.trim());
        if (parts.length >= 3) {
          events.push({
            type: 'ITEM_GAINED',
            name: parts[0]!,
            rarity: parts[1]!,
            category: parts[2]!,
          });
        }
        break;
      }
      case 'SKILL': {
        // Format: [SKILL name|kind|rarity]
        const parts = body.split('|').map((s) => s.trim());
        if (parts.length >= 3) {
          events.push({
            type: 'SKILL_LEARNED',
            name: parts[0]!,
            kind: parts[1]!,
            rarity: parts[2]!,
          });
        }
        break;
      }
      case 'REALM_BREAK':
        events.push({ type: 'REALM_BREAK' });
        break;
      case 'TRIBULATION':
        events.push({ type: 'TRIBULATION', reason: body || undefined });
        break;
      case 'COMBAT': {
        // [COMBAT enemy_name|level]
        const parts = body.split('|').map((s) => s.trim());
        const lvl = parseInt(parts[1] ?? '1', 10);
        events.push({
          type: 'COMBAT_START',
          enemyName: parts[0]!,
          enemyLevel: Number.isNaN(lvl) ? 1 : lvl,
        });
        break;
      }
      case 'LOCATION': {
        const parts = body.split('|').map((s) => s.trim());
        events.push({
          type: 'LOCATION_CHANGE',
          locationId: parts[0]!,
          name: parts[1] ?? parts[0]!,
        });
        break;
      }
      case 'STATUS_ADD': {
        const parts = body.split('|').map((s) => s.trim());
        const dur = parts[1] ? parseInt(parts[1], 10) : undefined;
        events.push({
          type: 'STATUS_ADD',
          statusId: parts[0]!,
          ...(dur !== undefined && !Number.isNaN(dur) ? { durationHours: dur } : {}),
        });
        break;
      }
      case 'STATUS_CURE':
        events.push({ type: 'STATUS_CURE', statusId: body });
        break;
      case 'NOTE':
        if (body) events.push({ type: 'NOTE', message: body });
        break;
      case 'QUEST_GIVEN': {
        // [QUEST_GIVEN title|kind|description|giver?]
        const parts = body.split('|').map((s) => s.trim());
        if (parts.length >= 3) {
          events.push({
            type: 'QUEST_GIVEN',
            title: parts[0]!,
            kind: parts[1] ?? 'side',
            description: parts[2]!,
            ...(parts[3] ? { giver: parts[3] } : {}),
          });
        }
        break;
      }
      case 'QUEST_COMPLETE':
        if (body) events.push({ type: 'QUEST_COMPLETE', title: body });
        break;
      case 'QUEST_FAILED':
        if (body) events.push({ type: 'QUEST_FAILED', title: body });
        break;
      case 'AFFINITY': {
        // [AFFINITY+ NPC|amount] or [AFFINITY- NPC|amount]
        const parts = body.split('|').map((s) => s.trim());
        if (parts.length >= 2) {
          const amt = parseInt(parts[1]!, 10);
          if (!Number.isNaN(amt)) {
            events.push({
              type: 'AFFINITY_DELTA',
              npcName: parts[0]!,
              amount: sign === '-' ? -amt : amt,
            });
          }
        }
        break;
      }
      case 'DAO_LU':
        if (body) events.push({ type: 'DAO_LU', npcName: body });
        break;

      // ─── 2-tier lore (Refactor 3) ───
      case 'LORE_NPC': {
        const attrs = parseKVAttrs(body);
        if (attrs.id && attrs.name && attrs.description) {
          events.push({
            type: 'LORE_NPC',
            id: attrs.id,
            name: attrs.name,
            description: attrs.description,
            ...(attrs.source ? { source: attrs.source } : {}),
          });
        }
        break;
      }
      case 'LORE_LOCATION': {
        const attrs = parseKVAttrs(body);
        if (attrs.id && attrs.name && attrs.description) {
          events.push({
            type: 'LORE_LOCATION',
            id: attrs.id,
            name: attrs.name,
            description: attrs.description,
            ...(attrs.category ? { category: attrs.category } : {}),
            ...(attrs.region ? { region: attrs.region } : {}),
            ...(attrs.source ? { source: attrs.source } : {}),
          });
        }
        break;
      }
      case 'LORE_ITEM': {
        const attrs = parseKVAttrs(body);
        if (attrs.id && attrs.name && attrs.description) {
          events.push({
            type: 'LORE_ITEM',
            id: attrs.id,
            name: attrs.name,
            description: attrs.description,
            ...(attrs.rarity ? { rarity: attrs.rarity } : {}),
            ...(attrs.source ? { source: attrs.source } : {}),
          });
        }
        break;
      }
      case 'LORE_QUEST': {
        const attrs = parseKVAttrs(body);
        if (attrs.id && attrs.title && attrs.description) {
          events.push({
            type: 'LORE_QUEST',
            id: attrs.id,
            title: attrs.title,
            description: attrs.description,
            ...(attrs.source ? { source: attrs.source } : {}),
          });
        }
        break;
      }
      case 'WORLD_NPC': {
        const attrs = parseKVAttrs(body);
        if (attrs.id && attrs.name) {
          const lvl = attrs.level ? parseInt(attrs.level, 10) : undefined;
          events.push({
            type: 'WORLD_NPC',
            id: attrs.id,
            name: attrs.name,
            ...(attrs.loreId ? { loreId: attrs.loreId } : {}),
            ...(attrs.description ? { description: attrs.description } : {}),
            ...(lvl !== undefined && !Number.isNaN(lvl) ? { level: lvl } : {}),
            ...(attrs.stance ? { stance: attrs.stance } : {}),
          });
        }
        break;
      }
      case 'WORLD_LOCATION': {
        const attrs = parseKVAttrs(body);
        if (attrs.id && attrs.name) {
          events.push({
            type: 'WORLD_LOCATION',
            id: attrs.id,
            name: attrs.name,
            ...(attrs.loreId ? { loreId: attrs.loreId } : {}),
            ...(attrs.description ? { description: attrs.description } : {}),
            ...(attrs.category ? { category: attrs.category } : {}),
          });
        }
        break;
      }

      // ─── Tag taxonomy expand (Refactor 4) ───
      case 'CHARACTER_UPDATE': {
        const attrs = parseKVAttrs(body);
        if (!attrs.target) break;
        const parseDelta = (s: string | undefined) => {
          if (!s) return undefined;
          const n = parseInt(s.replace(/^[+]/, ''), 10);
          return Number.isNaN(n) ? undefined : n;
        };
        events.push({
          type: 'CHARACTER_UPDATE',
          target: attrs.target,
          ...(parseDelta(attrs.currency) !== undefined ? { currency: parseDelta(attrs.currency)! } : {}),
          ...(parseDelta(attrs.hp) !== undefined ? { hp: parseDelta(attrs.hp)! } : {}),
          ...(attrs.stance ? { stance: attrs.stance } : {}),
          ...(parseDelta(attrs.affinity) !== undefined ? { affinity: parseDelta(attrs.affinity)! } : {}),
        });
        break;
      }
      case 'APPLY_LONG_TERM_STATUS': {
        const attrs = parseKVAttrs(body);
        if (!attrs.target || !attrs.statusId) break;
        const hr = attrs.hours ? parseInt(attrs.hours, 10) : undefined;
        events.push({
          type: 'APPLY_LONG_TERM_STATUS',
          target: attrs.target,
          statusId: attrs.statusId,
          ...(hr !== undefined && !Number.isNaN(hr) ? { hours: hr } : {}),
        });
        break;
      }
      case 'CURE_LONG_TERM_STATUS': {
        const attrs = parseKVAttrs(body);
        if (!attrs.target || !attrs.statusId) break;
        events.push({
          type: 'CURE_LONG_TERM_STATUS',
          target: attrs.target,
          statusId: attrs.statusId,
        });
        break;
      }
      case 'RELATIONSHIP_CHANGED': {
        const attrs = parseKVAttrs(body);
        if (!attrs.npc || !attrs.standing) break;
        events.push({
          type: 'RELATIONSHIP_CHANGED',
          npcName: attrs.npc,
          standing: attrs.standing,
          ...(attrs.reason ? { reason: attrs.reason } : {}),
        });
        break;
      }
      case 'QUEST_OBJECTIVE_COMPLETED': {
        const attrs = parseKVAttrs(body);
        if (!attrs.quest || !attrs.objective) break;
        const qty = attrs.quantity ? parseInt(attrs.quantity, 10) : undefined;
        events.push({
          type: 'QUEST_OBJECTIVE_COMPLETED',
          questTitle: attrs.quest,
          objective: attrs.objective,
          ...(qty !== undefined && !Number.isNaN(qty) ? { quantity: qty } : {}),
        });
        break;
      }
      case 'QUEST_OBJECTIVE_UPDATED': {
        const attrs = parseKVAttrs(body);
        if (!attrs.quest || !attrs.objective) break;
        events.push({
          type: 'QUEST_OBJECTIVE_UPDATED',
          questTitle: attrs.quest,
          objective: attrs.objective,
          ...(attrs.newText ? { newText: attrs.newText } : {}),
        });
        break;
      }
      case 'ENCOUNTER_REWARD': {
        const attrs = parseKVAttrs(body);
        const score = attrs.score ? parseInt(attrs.score, 10) : NaN;
        if (Number.isNaN(score) || !attrs.reason) break;
        events.push({
          type: 'ENCOUNTER_REWARD',
          epScore: Math.max(0, Math.min(100, score)),
          reason: attrs.reason,
          ...(attrs.target ? { target: attrs.target } : {}),
        });
        break;
      }
      case 'TIME_PASSED': {
        const attrs = parseKVAttrs(body);
        const num = (s: string | undefined) => {
          if (!s) return undefined;
          const n = parseInt(s, 10);
          return Number.isNaN(n) ? undefined : n;
        };
        const y = num(attrs.years);
        const mo = num(attrs.months);
        const d = num(attrs.days);
        const h = num(attrs.hours);
        // Skip nếu KHÔNG có time unit nào
        if (y === undefined && mo === undefined && d === undefined && h === undefined && !attrs.weather) break;
        events.push({
          type: 'TIME_PASSED',
          ...(y !== undefined ? { years: y } : {}),
          ...(mo !== undefined ? { months: mo } : {}),
          ...(d !== undefined ? { days: d } : {}),
          ...(h !== undefined ? { hours: h } : {}),
          ...(attrs.weather ? { weather: attrs.weather } : {}),
        });
        break;
      }
      case 'ITEM_IDEA_GAINED': {
        const attrs = parseKVAttrs(body);
        if (!attrs.name || !attrs.description) break;
        events.push({
          type: 'ITEM_IDEA_GAINED',
          name: attrs.name,
          description: attrs.description,
          ...(attrs.rarity ? { rarity: attrs.rarity } : {}),
        });
        break;
      }
      // ─── Phase 11.3: Trade tags ───
      case 'ENTER_TRADE_MODE': {
        const attrs = parseKVAttrs(body);
        if (!attrs.traderName && !attrs.npc && !attrs.trader) break;
        const traderName = attrs.traderName ?? attrs.npc ?? attrs.trader!;
        const att = attrs.attitude as 'friendly' | 'neutral' | 'hostile' | undefined;
        events.push({
          type: 'ENTER_TRADE_MODE',
          traderName,
          ...(att === 'friendly' || att === 'neutral' || att === 'hostile' ? { attitude: att } : {}),
        });
        break;
      }
      case 'EXIT_TRADE_MODE': {
        events.push({ type: 'EXIT_TRADE_MODE' });
        break;
      }
      case 'SELL_VALUATION': {
        const attrs = parseKVAttrs(body);
        const m = parseFloat(attrs.multiplier ?? '');
        if (Number.isNaN(m)) break;
        events.push({
          type: 'SELL_VALUATION',
          multiplier: Math.max(0, Math.min(2, m)),
          ...(attrs.itemName ? { itemName: attrs.itemName } : {}),
        });
        break;
      }
      case 'BUY_NEGOTIATION': {
        const attrs = parseKVAttrs(body);
        const m = parseFloat(attrs.multiplier ?? '');
        if (Number.isNaN(m) || !attrs.itemName) break;
        events.push({
          type: 'BUY_NEGOTIATION',
          itemName: attrs.itemName,
          multiplier: Math.max(0, Math.min(2, m)),
        });
        break;
      }
      case 'OFFER_ITEM_IDEA': {
        const attrs = parseKVAttrs(body);
        if (!attrs.name || !attrs.description) break;
        const price = attrs.price ? parseInt(attrs.price, 10) : undefined;
        events.push({
          type: 'OFFER_ITEM_IDEA',
          name: attrs.name,
          description: attrs.description,
          ...(attrs.rarity ? { rarity: attrs.rarity } : {}),
          ...(attrs.category ? { category: attrs.category } : {}),
          ...(price !== undefined && !Number.isNaN(price) ? { price } : {}),
        });
        break;
      }
    }
  }

  return events;
};

/** Loại bỏ tag khỏi text — để hiển thị clean cho player */
export const stripGameTags = (raw: string): string => {
  return raw.replace(/\[([A-Z_]+)[+\-]?\s*[^\]]*\]/g, '').replace(/[ \t]+\n/g, '\n').trim();
};

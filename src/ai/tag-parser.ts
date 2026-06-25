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
  | { type: 'DAO_LU'; npcName: string };

const TAG_REGEX = /\[([A-Z_]+)([+\-]?)\s*([^\]]*)\]/g;

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
    }
  }

  return events;
};

/** Loại bỏ tag khỏi text — để hiển thị clean cho player */
export const stripGameTags = (raw: string): string => {
  return raw.replace(/\[([A-Z_]+)[+\-]?\s*[^\]]*\]/g, '').replace(/[ \t]+\n/g, '\n').trim();
};

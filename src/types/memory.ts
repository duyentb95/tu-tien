/**
 * Memory system (theo prototype eventHistory + recentMeaningfulActions + customRules).
 *
 * Bài toán: storyLog chứa raw narrative text — AI khó "nhớ" các sự kiện trọng đại
 * sau hàng chục turn. Solution: tách 2 layer:
 *
 *   1. eventHistory: structured array các sự kiện quan trọng (đột phá, hoàn quest,
 *      gặp đại nhân vật, chết NPC, tăng ép cao, kết đạo lữ). Cap rolling N entries.
 *
 *   2. recentMeaningfulActions: hành động player đã làm gần đây + outcome.
 *      Khác recentHistory (narrative chunks) — đây là semantic summary.
 *
 *   3. customRules: array string user nhập — quy tắc AI phải tuân thủ
 *      vd "Không bao giờ giết NPC chính", "Luôn xưng 'ngươi' với player"
 */

export interface MeaningfulEvent {
  /** Unix ms timestamp khi event happen */
  timestamp: number;
  /** Turn number */
  turn: number;
  /** Loại sự kiện (cho UI filter + AI weight) */
  kind:
    | 'realm_break'        // Đột phá cảnh giới
    | 'tribulation'        // Vượt độ kiếp (thành/bại)
    | 'quest_complete'     // Hoàn thành quest
    | 'quest_failed'       // Quest thất bại
    | 'dao_lu_partnered'   // Kết đạo lữ
    | 'npc_death'          // NPC quan trọng chết
    | 'npc_first_meet'     // Gặp NPC quan trọng lần đầu
    | 'location_discovered' // Đến địa danh lớn lần đầu
    | 'encounter_high'     // ENCOUNTER_REWARD ≥ 70
    | 'item_legendary'     // Nhận item Huyền Thoại/Siêu Phẩm
    | 'skill_ultimate'     // Học skill tuyệt học
    | 'sect_joined'        // Gia nhập tông môn
    | 'sect_rank_up'       // Lên cấp tông môn
    | 'beast_captured'     // Khế ước linh thú hiếm
    | 'custom';            // AI tự xác định event lớn
  /** Tóm tắt 1-2 câu, ai/cái gì/ở đâu */
  summary: string;
  /** Optional — entities liên quan (NPC names, location ids) */
  entities?: string[];
}

export interface RecentAction {
  turn: number;
  /** Action text mà player nhập/chọn */
  action: string;
  /** Outcome ngắn — tích cực/tiêu cực/trung lập + summary */
  outcome: 'positive' | 'negative' | 'neutral';
  outcomeSummary: string;
}

export interface CustomRule {
  id: string;
  /** Rule text — sẽ inject vào prompt */
  rule: string;
  /** Khi rule này tạo ra (UI hiển thị) */
  createdAt: number;
  /** Bật/tắt mà không xóa */
  enabled: boolean;
}

/**
 * Phase 11.1: Story summary block (2-tier).
 * Level 1: tóm tắt 20 turn raw → 1 đoạn ~5-8 câu.
 * Level 2: tóm tắt 10 block level 1 → 1 meta-summary 8-10 câu.
 * Level 3+: continue meta-summarize khi level 2 ≥ 10.
 */
export interface StorySummary {
  id: string;
  content: string;
  /** 1 = standard, 2 = meta, 3+ = super-meta */
  level: number;
  /** Turn range được tóm tắt (cho UI hiển thị) */
  turnStart?: number;
  turnEnd?: number;
  /** Unix ms khi block tạo ra */
  createdAt: number;
}

export const SUMMARY_TRIGGER_TURNS = 40;
export const SUMMARY_BATCH_SIZE = 20;
export const SUMMARY_RETAIN_TURNS = 20; // giữ lại 20 turn cuối sau khi tóm tắt
export const SUMMARY_META_BATCH = 10;

export interface MemorySlice {
  /** Cap rolling N entries — N = 30. Vượt → drop oldest */
  eventHistory: MeaningfulEvent[];
  /** Cap rolling N=10 */
  recentMeaningfulActions: RecentAction[];
}

export const EMPTY_MEMORY: MemorySlice = {
  eventHistory: [],
  recentMeaningfulActions: [],
};

export const MAX_EVENT_HISTORY = 30;
export const MAX_RECENT_ACTIONS = 10;

/** Push event với rolling FIFO cap */
export const pushEvent = (
  history: MeaningfulEvent[],
  event: MeaningfulEvent,
): MeaningfulEvent[] => {
  const next = [...history, event];
  if (next.length > MAX_EVENT_HISTORY) {
    return next.slice(next.length - MAX_EVENT_HISTORY);
  }
  return next;
};

export const pushAction = (
  actions: RecentAction[],
  action: RecentAction,
): RecentAction[] => {
  const next = [...actions, action];
  if (next.length > MAX_RECENT_ACTIONS) {
    return next.slice(next.length - MAX_RECENT_ACTIONS);
  }
  return next;
};

/** Map event kind → emoji icon for UI */
export const EVENT_KIND_ICON: Record<MeaningfulEvent['kind'], string> = {
  realm_break: '⚡',
  tribulation: '🌩',
  quest_complete: '✓',
  quest_failed: '✗',
  dao_lu_partnered: '♥',
  npc_death: '☠',
  npc_first_meet: '◆',
  location_discovered: '◉',
  encounter_high: '🌟',
  item_legendary: '☆',
  skill_ultimate: '✦',
  sect_joined: '⚔',
  sect_rank_up: '↑',
  beast_captured: '☘',
  custom: '·',
};

export const EVENT_KIND_LABEL: Record<MeaningfulEvent['kind'], string> = {
  realm_break: 'Đột phá',
  tribulation: 'Độ kiếp',
  quest_complete: 'Hoàn quest',
  quest_failed: 'Quest thất bại',
  dao_lu_partnered: 'Kết đạo lữ',
  npc_death: 'NPC tử vong',
  npc_first_meet: 'Gặp gỡ',
  location_discovered: 'Khám phá',
  encounter_high: 'Sự kiện lớn',
  item_legendary: 'Bảo vật',
  skill_ultimate: 'Tuyệt học',
  sect_joined: 'Gia nhập tông',
  sect_rank_up: 'Thăng cấp',
  beast_captured: 'Khế ước linh thú',
  custom: 'Khác',
};

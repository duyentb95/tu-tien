import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { PlayerCharacter } from '@gametypes/character';
import type { Item, ItemCategory, Rarity } from '@gametypes/item';
import type { Skill, SkillKind } from '@gametypes/skill';
import type { Location, LocationType, GameTime, Faction } from '@gametypes/world';
import type { LoreNPC, LoreLocation, LoreItem, LoreQuest } from '@gametypes/lore';
import type { MeaningfulEvent, RecentAction, CustomRule, StorySummary } from '@gametypes/memory';
import { SUMMARY_TRIGGER_TURNS, SUMMARY_BATCH_SIZE } from '@gametypes/memory';
import { summarizeTurns, metaSummarize, shouldMetaSummarize } from '@ai/summary-service';
import { pushEvent, pushAction } from '@gametypes/memory';
import { getLongTermStatus, humanizeStatusId } from '@data/long-term-statuses';
import type { Difficulty } from '@data/difficulty';
import {
  INITIAL_AP,
  INITIAL_ALLOCATED_POINTS,
  INITIAL_BASE_STATS,
  INITIAL_EQUIPPED_ITEMS,
  INITIAL_EQUIPPED_SKILLS,
  INITIAL_FINAL_STATS,
} from '@data/initial-stats';
import { generateNarrative } from '@ai/narrative-service';
import { parseGameTags, type GameEvent } from '@ai/tag-parser';
import type { StorySegment } from '@ai/parser';
import { calculateMaxExpForLevel, applyExpGain } from '@core/stats/leveling';
import { getRealmInfoFromLevel } from '@core/stats/realms';
import { recomputeFinalStats, generateItemBonuses } from '@core/stats/equipment';
import { generateItemBonusesV2 } from '@core/items/item-budget';
import { calculateEpReward } from '@core/scoring/ep-scoring';
import { computeAchievementProgress, detectNewlyUnlocked } from '@core/achievements/check-unlocks';
import { getRefineCost, rollRefine } from '@core/items/refine';
import { addMasteryXp, MASTERY_LEVEL_NAMES } from '@core/skills/mastery';
import { addIntentXp, inferIntentFromSkill, getIntentDamageMul } from '@core/cultivation/intent';
import { addDaoXp, unlockDao, getDaoMul, MAX_FOCUSED_DAO } from '@core/cultivation/dai-dao';
import { getAvailablePhapTac, getPhapTacById } from '@data/phap-tac';
import { INITIAL_CULTIVATION, INTENT_TIER_NAMES } from '@gametypes/cultivation';
import { INITIAL_SKILL_DEEP, INITIAL_TALENT_STATE, MAX_RUNE_SLOTS_PER_SKILL } from '@gametypes/skill-deep';
import type { TalentBranch, SkillRuneSlots } from '@gametypes/skill-deep';
import { computeFinalSkillEffect, detectActiveCombos } from '@core/skills/skill-deep';
import { TALENT_NODES, getTalentResetCost } from '@data/talent-nodes';
import { getRuneById } from '@data/runes';
import { EMPTY_TRADER_SESSION } from '@gametypes/trade';
// Phase 15: Economy
import {
  INITIAL_ECONOMY,
  computeRegenTokens,
  generateReferralCode,
  getOrCreateDeviceId,
} from '@gametypes/economy';
import { findCoupon } from '@data/coupons';
import { CURRENCY_PACKS, EXCHANGE_OPTIONS } from '@data/store-packs';
import { setPerkFlags } from '@ai/perks';
import { trackEvent } from '@services/analytics';
import {
  INITIAL_DAILY_MISSIONS,
  formatDay,
  getDailyLoginReward,
} from '@gametypes/daily-mission';
import { DAILY_MISSIONS_POOL, rollDailyMissions } from '@data/daily-missions-pool';
import { INITIAL_EXTENDED_QUESTS, makeProgress } from '@gametypes/extended-quest';
import { INITIAL_LIFETIME_STATS } from '@gametypes/player-stats';
import { EXTENDED_QUESTS, getExtendedQuestById } from '@data/extended-quests';
import { nourishArtifact, isArtifactEligible, ARTIFACT_GRADE_NAMES } from '@core/items/artifact';
import { CATEGORY_TO_DEFAULT_SLOT, EQUIPPABLE_CATEGORIES } from '@gametypes/item';
import type { EquipmentSlot } from '@gametypes/character';
import { DEFAULT_LOCATIONS, DEFAULT_FACTIONS, getLocation, areNeighbors } from '@data/default-world';
import type { MapLocation } from '@data/default-world';
import type { Quest, QuestKind } from '@gametypes/quest';
import type { SectMembership } from '@gametypes/sect';
import type { SecretRealmInstance } from '@gametypes/secret-realm';
import { generateSecretRealm } from '@core/world/secret-realm-gen';
import type { SpiritBeast } from '@gametypes/spirit-beast';
import {
  rollCapture,
  canEvolve,
  evolveBeast,
  feedBeast,
} from '@core/cultivation/spirit-beasts';
import { getBeastTemplate, findTemplateByEnemyName } from '@data/default-beasts';
import {
  DEFAULT_CAVE_ABODE,
  HERB_CATALOG,
  maxPlotsForLevel,
  type CaveAbode,
  type AbodeRoomKind,
} from '@gametypes/cave-abode';
import { getPillRecipe } from '@data/pill-recipes';
import type { DaoCompanion } from '@gametypes/dao-lu';
import { calculateMeditationExp } from '@core/cultivation/meditation';
import { saveToCloud, loadFromCloud } from '@services/cloud-save';
import {
  SECT_MISSION_POOL,
  TANG_KINH_CATALOG,
  getSect,
} from '@data/default-sects';
import { SECT_RANK_ORDER, SECT_RANK_REQUIREMENT, SECT_RANK_DISPLAY } from '@gametypes/sect';
import { rollSpiritualRoot, getRootDisplayName } from '@core/cultivation/spiritual-roots';
import {
  createCombatSession,
  executeAction,
  enemyAutoAction,
  makeEnemyCombatant,
  type CombatState,
  type SkillAction,
} from '@core/combat/session';
import { notify } from './notifications';
import type { PurchaseHistoryEntry } from '@gametypes/economy';

/**
 * Phase 23.UX: Suy luận category hợp lệ từ tên item.
 * Quest reward / AI thường gen tên kiểu "Vạn Linh Túi Trữ Vật" mà không gắn category đúng.
 * "Pháp bảo" KHÔNG có trong ItemCategory enum → fallback hợp lý theo tên.
 */
function inferItemCategoryFromName(name: string): import('@gametypes/item').ItemCategory {
  const n = name.toLowerCase();
  if (/(kiếm|đao|thương|cung|trượng|phủ|sword|blade|bow|spear|staff)/i.test(n)) return 'Vũ khí';
  if (/(túi|trữ vật|bag|càn khôn|tu tiên đại|nang)/i.test(n)) return 'Trữ vật';
  if (/(lệnh bài|lệnh|tín vật|huy hiệu)/i.test(n)) return 'Tín vật';
  if (/(đan|hoàn|cao)/i.test(n)) return 'Đan dược';
  if (/(quyết|kinh|thư|cổ thư|bí kíp)/i.test(n)) return 'Sách kỹ năng';
  if (/(giáp|y phục|áo|bào)/i.test(n)) return 'Thân';
  if (/(mũ|mão|khăn|nón)/i.test(n)) return 'Đầu';
  if (/(giày|hài|ủng)/i.test(n)) return 'Chân';
  if (/(linh chi|thảo|hoa|quả|cỏ|cây)/i.test(n)) return 'Nguyên liệu';
  // Default: pháp bảo / phụ kiện — equippable + có thể dưỡng nếu Cực Phẩm+
  return 'Phụ kiện';
}

/**
 * Phase 23.UX: Append entry vào purchaseHistory. Mutate trực tiếp (immer-safe).
 * Cap 100 entries — drop oldest. Newest first.
 */
function pushHistory(
  economy: { purchaseHistory?: PurchaseHistoryEntry[] },
  entry: Omit<PurchaseHistoryEntry, 'id' | 'at'> & Partial<Pick<PurchaseHistoryEntry, 'at'>>,
): void {
  if (!economy.purchaseHistory) economy.purchaseHistory = [];
  const full: PurchaseHistoryEntry = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    at: entry.at ?? Date.now(),
    kind: entry.kind,
    title: entry.title,
    delta: entry.delta,
    ...(entry.amountVnd !== undefined ? { amountVnd: entry.amountVnd } : {}),
    ...(entry.refId !== undefined ? { refId: entry.refId } : {}),
    ...(entry.status !== undefined ? { status: entry.status } : {}),
  };
  economy.purchaseHistory.unshift(full);
  if (economy.purchaseHistory.length > 100) {
    economy.purchaseHistory = economy.purchaseHistory.slice(0, 100);
  }
}

export type GameStage =
  | 'initial'
  | 'adventure_mode'
  | 'setup'
  | 'playing'
  | 'character'
  | 'inventory'
  | 'world_map'
  | 'quests'
  | 'sect_hall'
  | 'secret_realm'
  | 'spirit_beasts'
  | 'cave_abode'
  | 'combat'
  | 'tribulation'
  | 'paused';

export interface GameSettings {
  storyTitle: string;
  difficulty: Difficulty;
  allowNsfw: boolean;
  isNsfwMode: boolean;
  writingStyle: string;
  narratorPronoun: string;
  currencyName: string;
  playerAvatarUrl: string | null;
  // ─── Fan-fiction mode (theo pattern prototype) ───
  /** Có phải fan-fic mode không */
  isFanFictionMode?: boolean;
  /** Tên tác phẩm gốc, vd "Mục Thần Ký" */
  fanFicOriginalWork?: string;
  /** Kiểu: hóa thân (nhân vật có sẵn) hoặc khởi sinh (nhân vật mới) */
  fanFicCharacterType?: 'incarnate' | 'newborn';
  /**
   * Phase 13.1B: Mức độ trung thành với canon gốc.
   * - strict: bám sát nguyên tác, KHÔNG bịa NPC/event không có trong sách, không spoil
   * - liberal: cùng universe nhưng story mới, NPC chính giữ tính cách (default)
   * - original: chỉ mượn power system + cosmology, AI tự do tạo nội dung
   */
  canonFidelity?: 'strict' | 'liberal' | 'original';
  /** Phase 13.1A: Canon pack ID nếu user dùng pack có sẵn (vd 'muc-than-ky') */
  canonPackId?: string;
  /** Mô tả thêm theme/setting đã AI analyze populate */
  theme?: string;
  setting?: string;
  /** Hệ thống cảnh giới (override realmList default) */
  realmListOverride?: string[];
  /**
   * Hybrid Logic Engine mode (default true).
   * true = 2-step (Logic Engine sinh 6 scenarios + dice + Narrative Engine viết prose)
   * false = single-call legacy (1 prompt làm hết — fallback nếu user cần tiết kiệm quota)
   * Hybrid tốn 2x API call nhưng văn phong + state consistency tốt hơn nhiều.
   */
  useHybridLogic?: boolean;
  /**
   * Custom rules user nhập — AI phải tuân thủ. Inject vào mọi prompt.
   * Vd: "Không bao giờ giết NPC chính trong nguyên tác", "Luôn xưng 'ngươi'".
   */
  customRules?: CustomRule[];
  // ─── Phase 8.1: Multi-provider AI ───
  /** Provider cho Logic Engine (sinh 6 scenarios). Default 'gemini' — rẻ + JSON structured tốt */
  aiProviderLogic?: 'gemini' | 'deepseek' | 'auto';
  /** Provider cho Narrative Engine (viết prose). Default 'auto' — DeepSeek nếu có, else Gemini */
  aiProviderNarrative?: 'gemini' | 'deepseek' | 'auto';
}

export interface KnowledgeSlice {
  characters: Record<string, unknown>;
  locations: Record<string, Location>;
  factions: Record<string, Faction>;
  realmProgressionList: string[];
  lore: Record<string, unknown>;
  // ─── 2-tier lore (Refactor 3) ───
  /** Tin đồn về NPC chưa gặp. Khi WORLD_NPC fire với loreId → mark materialized */
  loreNpcs: Record<string, LoreNPC>;
  loreLocations: Record<string, LoreLocation>;
  loreItems: Record<string, LoreItem>;
  loreQuests: Record<string, LoreQuest>;
  // ─── Memory expand (Refactor 5) ───
  /** Sự kiện trọng đại (rolling 30 entries). AI nhớ context lâu hơn storyLog */
  eventHistory: MeaningfulEvent[];
  /** Hành động + outcome gần đây (rolling 10 entries) */
  recentMeaningfulActions: RecentAction[];
  /** Phase 11.1: 2-tier story summaries (Pattern #4 Google Canvas RPG) */
  storySummaries: StorySummary[];
}

export interface StoryEntry {
  id: string;
  turn: number;
  timestamp: number;
  kind: 'narrative' | 'player_action' | 'system';
  segments?: StorySegment[];
  content?: string;
}

export interface GameState {
  stage: GameStage;
  prevStage: GameStage | null;
  player: PlayerCharacter | null;
  /** itemId → Item — single source of truth; player.inventory chỉ chứa id */
  inventory: Record<string, Item>;
  /** skillId → Skill */
  skills: Record<string, Skill>;
  knowledge: KnowledgeSlice;
  time: GameTime | null;
  settings: GameSettings;

  storyLog: StoryEntry[];
  currentActions: string[];
  /** Phase 9.1: structured actions với % + reward preview (parallel với currentActions) */
  currentActionChoices: import('@ai/parser').ActionChoice[];
  turn: number;

  combat: CombatState | null;
  tribulationContext: { reason?: string } | null;
  quests: Record<string, Quest>;
  /** Sect membership: chỉ 1 sect 1 lúc (game logic). Null = chưa join sect nào */
  sectMembership: SectMembership | null;
  /** Claimed missions: missionId → turnClaimed (cho daily reset check) */
  claimedMissions: Record<string, number>;
  /** Active secret realm instance — null nếu không trong bí cảnh */
  secretRealm: SecretRealmInstance | null;
  /** Spirit beasts đã capture — beastId → SpiritBeast */
  spiritBeasts: Record<string, SpiritBeast>;
  /** Active beast id (đồng hành combat). Null = không có */
  activeBeastId: string | null;
  /** Cave abode của player */
  caveAbode: CaveAbode;
  /** Đạo lữ — NPC name → DaoCompanion */
  daoLu: Record<string, DaoCompanion>;

  // ─── Tag taxonomy expand (Refactor 4) ───
  /** Thời gian game (advance qua [TIME_PASSED] tag) */
  gameTime: GameTime;
  /** Weather hiện tại — set qua [TIME_PASSED weather=...] */
  weather: string;
  /** Encounter Points — AI score độ sáng tạo/khó/nhập vai. Đổi pháp khí/đan dược ở Tàng Kinh */
  ep: number;

  /** Phase 11.3: Active trader session (Pattern #5 từ Google Canvas RPG).
   * null = không trong giao dịch. Set qua [ENTER_TRADE_MODE], clear qua [EXIT_TRADE_MODE]. */
  traderSession: import('@gametypes/trade').TraderSession | null;

  /** Phase 15: Economy state — Tiền Ngọc (premium currency), action tokens, referral, coupons */
  economy: import('@gametypes/economy').EconomyState;

  /** Phase 16.3: Daily missions + login streak */
  dailyMissions: import('@gametypes/daily-mission').DailyMissionsState;

  /** Phase 17.1: Extended/Hidden quests progress */
  extendedQuests: import('@gametypes/extended-quest').ExtendedQuestsState;

  /** Phase 20: Player lifetime stats — tổng kills/EP/items qua mọi turn */
  playerStats: import('@gametypes/player-stats').PlayerLifetimeStats;

  /** Phase 23.2: Skill mastery — level + xp per skill */
  skillMastery: import('@core/skills/mastery').SkillMasteryState;

  /** Phase 23.3-23.7: Cultivation deep system — ý cảnh + pháp tắc + đại đạo */
  cultivation: import('@gametypes/cultivation').CultivationState;

  /** Phase 24.A: Skill Deep — talent tree + rune slots + rune inventory */
  skillDeep: import('@gametypes/skill-deep').SkillDeepState;

  isAiThinking: boolean;
  /** Phase 9.3: phase chi tiết khi đang call AI (cho UI hiển thị state phù hợp) */
  aiPhase: 'idle' | 'logic' | 'narrative';
  lastError: string | null;

  // ───── Stage navigation
  setStage: (stage: GameStage) => void;

  // ───── Setup actions
  updateSettings: (patch: Partial<GameSettings>) => void;
  /** Custom rules CRUD (Refactor 5) */
  addCustomRule: (rule: string) => void;
  removeCustomRule: (id: string) => void;
  toggleCustomRule: (id: string) => void;
  /**
   * Fan-fic wizard: gọi AI phân tích tác phẩm gốc, hydrate settings +
   * knowledge.locations/characters từ initialWorldElements.
   * Throw nếu AI fail — caller cần try/catch.
   */
  analyzeFanFic: (form: {
    originalWork: string;
    characterType: 'incarnate' | 'newborn';
    characterName: string;
    characterDescription?: string;
  }) => Promise<void>;
  /**
   * Phase 13.1D: Apply world genesis result từ wizard — hydrate settings + knowledge
   * tương tự analyzeFanFic nhưng cho open-world (không phải fan-fic).
   */
  applyWorldGenesis: (result: import('@ai/prompts/world-genesis').WorldGenesisResult) => void;
  startNewGame: (init: {
    characterName: string;
    gender: string;
    personality: string;
    description: string;
    settings: Partial<GameSettings>;
  }) => Promise<void>;

  // ───── Gameplay actions
  submitAction: (actionText: string) => Promise<void>;

  // ───── Combat actions
  startCombat: (enemyName: string, enemyLevel: number) => void;
  combatPlayerAction: (action: SkillAction) => void;
  endCombat: () => void;

  // ───── Inventory actions
  useItem: (itemId: string) => void;
  discardItem: (itemId: string) => void;
  equipItem: (itemId: string, slot?: EquipmentSlot) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  /** Phase 9.6: Trang bị skill vào slot cụ thể. combat_basic_1/2/ultimate cho combat skill,
   * adventure_1/2/3 cho adventure skill. Tự validate kind/slot. */
  equipSkill: (skillId: string, slot: import('@gametypes/character').SkillSlot) => void;

  // ─── Phase 15: Economy actions ───
  /** Tự regen action tokens dựa trên thời gian (idempotent). Gọi mỗi khi mở app/turn. */
  refreshTokens: () => void;
  /** Tiêu 1 action token. Returns true nếu OK (vẫn cho nếu hết — soft gating). */
  useActionToken: () => boolean;
  /** Tiêu Tiền Ngọc. Returns false nếu không đủ. */
  spendTienNgoc: (amount: number, reason?: string) => boolean;
  /** Cộng Tiền Ngọc (mock payment OR coupon OR referral). */
  addTienNgoc: (amount: number, reason?: string) => void;
  /** Cộng action tokens (vượt cap được). */
  addActionTokens: (amount: number) => void;
  /** Mua exchange option qua effect ID. Returns true nếu OK. */
  purchaseExchange: (effectId: import('@data/store-packs').ExchangeOption['effect']) => boolean;
  /** Redeem coupon code. Returns { ok, message }. Try remote (Firebase) first, fallback local. */
  redeemCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  /** Apply referral code (1 lần per device). Returns { ok, message }. Try remote first. */
  applyReferral: (code: string) => Promise<{ ok: boolean; message: string }>;
  /** Mock buy currency pack (Phase 15 — wire Stripe sau). */
  mockBuyPack: (packId: string) => { ok: boolean; message: string };
  /** Phase 18: Tạo payment intent MoMo (gọi backend, mở deeplink). Trả về null nếu lỗi. */
  startMomoPayment: (packId: string) => Promise<{ ok: boolean; message: string }>;
  /** Phase 18: Poll status payment intent hiện tại. Auto credit khi approved + clear intent. */
  pollMomoPayment: () => Promise<'pending' | 'approved' | 'expired' | 'rejected' | 'none'>;
  /** Phase 18: Cancel/clear intent (user đóng modal). */
  cancelMomoPayment: () => void;
  /** Phase 16.2: Re-roll stats item (50 TN). Giữ rarity + slot count, random distribute lại. */
  rerollItemStats: (itemId: string) => boolean;
  /** Phase 23.UX: Tẩy linh căn — random lại linh căn nếu quá phế. Tốn 500 Tiên Ngọc. */
  rerollSpiritualRoot: () => { ok: boolean; message: string };
  /** Phase 23.1: Rèn luyện item +N. Trừ linh thạch + (lv 6+) Tiền Ngọc, roll success/fail. */
  refineItem: (itemId: string) => { ok: boolean; message: string };
  /** Phase 16.2: Upgrade item rarity 1 tier (200 TN). Stats tự re-roll theo budget mới. */
  upgradeItemRarity: (itemId: string) => boolean;

  // ─── Phase 16.3: Daily missions ───
  /** Check daily reset + roll new missions nếu sang ngày mới. Gọi mỗi khi mount. */
  refreshDailyMissions: () => void;
  /** Increment progress của missions match templateId. Gọi từ event handlers. */
  incrementMissionProgress: (templateId: string, delta?: number) => void;
  /** User click "Nhận" → cộng reward + mark claimed. */
  claimDailyMission: (templateId: string) => boolean;

  // ─── Phase 17.1: Extended/Hidden quests ───
  /** Check unlock + step progress cho tất cả quest templates. Gọi sau mỗi event. */
  refreshExtendedQuests: () => void;
  /** Phase 19.5: detect achievement vừa unlock → notify với action 'achievements' */
  checkAchievementUnlocks: () => void;
  /** Claim reward của step đã hoàn thành */
  claimQuestStep: (templateId: string, stepIdx: number) => boolean;
  /** Claim final reward khi đã hoàn thành toàn bộ chuỗi */
  claimQuestFinal: (templateId: string) => boolean;
  unequipSkill: (slot: import('@gametypes/character').SkillSlot) => void;
  /** Dưỡng pháp bảo: tiêu linh thạch → tăng artifactSoul → có thể level up */
  nourishArtifactAction: (itemId: string, currencyAmount: number) => void;

  // ─── Phase 23.3-23.7: Cultivation ───
  /** Phase 23.4: Refresh check pháp tắc unlock (theo player level + canon).
   *  Push vào cultivation.laws.unlocked nếu chưa có. Trả về số mới unlock. */
  refreshPhapTacUnlocks: () => number;
  /** Phase 23.4: Toggle active 1 pháp tắc (max 3). */
  togglePhapTacActive: (id: string) => { ok: boolean; message?: string };
  /** Phase 23.5: Unlock đại đạo mới (AI sinh hoặc default). */
  unlockDaiDao: (name: string, description: string, element?: import('@gametypes/character').Element) => boolean;
  /** Phase 23.5: Toggle focus 1 đạo (max 3). */
  toggleDaiDaoFocus: (daoKey: string) => { ok: boolean; message?: string };
  /** Phase 23.6: Ngộ Đạo action — meditation insight, roll AI hoặc default pool. */
  ngoDaoAction: () => Promise<{ ok: boolean; insight?: string; reward?: string }>;

  // ─── Phase 24.A: Skill Deep — Talent + Combo + Rune ───
  /** Chọn talent branch tại tier (3/4/5). Skill phải có mastery >= tier. */
  chooseTalent: (skillId: string, tier: 3 | 4 | 5, branch: TalentBranch) => { ok: boolean; message: string };
  /** Reset toàn bộ talent của 1 skill — tốn Tiên Ngọc geometric theo resetCount. */
  resetTalents: (skillId: string) => { ok: boolean; message: string };
  /** Craft rune mới — tốn linh thạch + nguyên liệu inventory. Tăng quantity nếu đã có. */
  craftRune: (runeDefId: string) => { ok: boolean; message: string };
  /** Attach rune từ inventory vào skill slot (0-2). Trả rune cũ về inventory. */
  attachRune: (skillId: string, slotIdx: 0 | 1 | 2, runeDefId: string) => { ok: boolean; message: string };
  /** Detach rune ở slot → trả về inventory. */
  detachRune: (skillId: string, slotIdx: 0 | 1 | 2) => { ok: boolean; message: string };

  // ───── Player stat actions
  allocatePoint: (stat: 'hp' | 'atk' | 'def' | 'spd', amount: number) => void;

  // ───── Travel
  travelTo: (locationId: string) => Promise<void>;

  // ───── Sect
  joinSect: (sectId: string) => boolean;
  leaveSect: () => void;
  addContribution: (amount: number) => void;
  claimSectMission: (missionId: string) => void;
  redeemFromTangKinh: (catalogId: string) => void;

  // ───── Secret Realm
  enterSecretRealm: (level?: number, name?: string) => void;
  moveToRoom: (roomId: string) => void;
  interactCurrentRoom: () => void;
  exitSecretRealm: () => void;

  // ───── Spirit Beast
  /** Thử capture beast — gọi sau khi combat tới HP < 20% của enemy */
  attemptCaptureBeast: (enemyName: string, enemyHpPercent: number) => { success: boolean; finalChance: number; beastName?: string };
  setActiveBeast: (beastId: string | null) => void;
  feedBeastAction: (beastId: string, kind: 'food' | 'pill') => void;
  evolveBeastAction: (beastId: string) => boolean;
  releaseBeast: (beastId: string) => void;

  // ───── Cave Abode
  purchaseCaveAbode: (locationId: string, name: string, cost: number) => void;
  buildRoom: (roomKind: AbodeRoomKind) => void;
  upgradeRoom: (roomKind: AbodeRoomKind) => void;
  plantHerb: (herbName: string) => void;
  harvestPlot: (plotId: string) => void;
  /** Tu luyện trong động phủ (chỉ khi tu_luyen_that.built). Hours = 1-24 */
  meditateInAbode: (hours: number) => void;
  /** Luyện đan: consume ingredients, grant 1 pill (chỉ khi luyen_dan_that.built) */
  refinePill: (recipeId: string) => void;

  // ───── Utility
  setError: (msg: string | null) => void;
  reset: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  /** Sync save lên Firestore (nếu có config). Return success */
  syncToCloud: () => Promise<boolean>;
  /** Load save từ Firestore. Override local. Return success */
  loadFromCloud: () => Promise<boolean>;
  /** Save vào slot cụ thể (multi-slot manager) */
  saveToSlot: (slotId: string) => boolean;
  /** Load từ slot cụ thể */
  loadFromSlot: (slotId: string) => boolean;
  /** Get payload hiện tại để export/backup */
  getCurrentPayload: () => Record<string, unknown>;
}

const DEFAULT_SETTINGS: GameSettings = {
  storyTitle: '',
  difficulty: 'Thường',
  allowNsfw: false,
  isNsfwMode: false,
  writingStyle: '',
  narratorPronoun: 'Để AI quyết định',
  currencyName: 'Linh Thạch',
  playerAvatarUrl: null,
  useHybridLogic: true,         // default ON — văn phong tốt hơn nhiều
  aiProviderLogic: 'gemini',    // default Gemini cho Logic (rẻ + JSON tốt)
  aiProviderNarrative: 'auto',  // default auto = DeepSeek if available, else Gemini
};

const DEFAULT_KNOWLEDGE: KnowledgeSlice = {
  characters: {},
  locations: {},
  factions: {},
  realmProgressionList: [],
  lore: {},
  loreNpcs: {},
  loreLocations: {},
  loreItems: {},
  loreQuests: {},
  eventHistory: [],
  recentMeaningfulActions: [],
  storySummaries: [],
};

const SAVE_KEY = 'tu-tien:save:slot-0';

const makePlayer = (init: {
  characterName: string;
  gender: string;
  personality: string;
  description: string;
}): PlayerCharacter => {
  const spiritualRoot = rollSpiritualRoot();
  return {
    id: crypto.randomUUID(),
    isPlayer: true,
    Name: init.characterName,
    gender: init.gender,
    personality: init.personality,
    description: init.description,
    level: 1,
    exp: 0,
    maxExp: calculateMaxExpForLevel(1),
    realm: getRealmInfoFromLevel(1).realmName,
    spiritualRoot,
    mentalState: 50,
    ap: INITIAL_AP,
    allocatedPoints: { ...INITIAL_ALLOCATED_POINTS },
    currency: 0,
    baseStats: { ...INITIAL_BASE_STATS },
    finalStats: { ...INITIAL_FINAL_STATS },
    current_location_id: null,
    learnedSkills: [],
    equippedSkills: { ...INITIAL_EQUIPPED_SKILLS },
    equippedItems: { ...INITIAL_EQUIPPED_ITEMS },
    inventory: [],
    longTermStatuses: [],
    combatStatuses: [],
    potionCooldown: 0,
    pendingSkillsToLearn: [],
  };
};

/** Tính lại finalStats từ baseStats + AP + equipment. Wrapper cho recomputeFinalStats. */
const recomputeStats = (
  player: PlayerCharacter,
  inventory: Record<string, Item>,
): PlayerCharacter => recomputeFinalStats(player, inventory);

export const useGameStore = create<GameState>()(
  immer((set, get) => ({
    stage: 'initial',
    prevStage: null,
    player: null,
    inventory: {},
    skills: {},
    knowledge: DEFAULT_KNOWLEDGE,
    time: null,
    settings: DEFAULT_SETTINGS,
    storyLog: [],
    currentActions: [],
    currentActionChoices: [],
    turn: 0,
    combat: null,
    tribulationContext: null,
    quests: {},
    sectMembership: null,
    claimedMissions: {},
    secretRealm: null,
    spiritBeasts: {},
    activeBeastId: null,
    caveAbode: { ...DEFAULT_CAVE_ABODE, rooms: { ...DEFAULT_CAVE_ABODE.rooms }, plots: {} },
    daoLu: {},
    gameTime: { year: 1, month: 1, day: 1, hour: 6, phase: 'dawn', weather: 'clear' },
    weather: 'Trời quang',
    ep: 0,
    traderSession: null,

    // Phase 15: Economy — generate referral code 1 lần lúc init store
    economy: { ...INITIAL_ECONOMY, referralCode: generateReferralCode(getOrCreateDeviceId()) },
    // Phase 16.3: Daily missions — empty, sẽ roll qua refreshDailyMissions()
    dailyMissions: INITIAL_DAILY_MISSIONS,
    // Phase 17.1: Extended quests
    extendedQuests: INITIAL_EXTENDED_QUESTS,
    playerStats: INITIAL_LIFETIME_STATS,
    skillMastery: {},
    cultivation: INITIAL_CULTIVATION,
    skillDeep: INITIAL_SKILL_DEEP,
    isAiThinking: false,
    aiPhase: 'idle' as const,
    lastError: null,

    setStage: (stage) =>
      set((s) => {
        s.prevStage = s.stage;
        s.stage = stage;
      }),

    updateSettings: (patch) =>
      set((s) => {
        Object.assign(s.settings, patch);
      }),

    addCustomRule: (rule) =>
      set((s) => {
        if (!s.settings.customRules) s.settings.customRules = [];
        s.settings.customRules.push({
          id: crypto.randomUUID(),
          rule: rule.trim(),
          createdAt: Date.now(),
          enabled: true,
        });
      }),

    removeCustomRule: (id) =>
      set((s) => {
        if (s.settings.customRules) {
          s.settings.customRules = s.settings.customRules.filter((r) => r.id !== id);
        }
      }),

    toggleCustomRule: (id) =>
      set((s) => {
        const r = s.settings.customRules?.find((r) => r.id === id);
        if (r) r.enabled = !r.enabled;
      }),

    analyzeFanFic: async (form) => {
      // Phase 13.1A: Check canon pack registry trước — nếu user gõ tên truyện có pack
      // sẵn, skip AI call và dùng pack data trực tiếp (nhanh + chính xác hơn nhiều).
      const { findCanonPackByTitle } = await import('@data/canon-packs');
      const pack = findCanonPackByTitle(form.originalWork);

      // Lazy import — chỉ load khi user thực sự click "Phân Tích"
      const [{ buildFanFicAnalyzePrompt, FanFicAnalyzeSchema }, { callGemini }] = await Promise.all([
        import('@ai/prompts/fan-fic-analyze'),
        import('@ai/client'),
      ]);

      set((s) => {
        s.isAiThinking = true;
        s.lastError = null;
      });

      try {
        let result;
        if (pack) {
          // Convert CanonPack → FanFicAnalyzeResult shape (drop-in)
          // + Stash canon defaultStartingTechnique vào settings để startNewGame dùng
          set((s) => {
            s.settings.canonPackId = pack.id;
            if (pack.defaultStartingTechnique) {
              (s.settings as Record<string, unknown>)._canonStartingTechnique = pack.defaultStartingTechnique;
            }
          });
          result = {
            storyTitle: `${pack.title}: ${form.characterName}`,
            theme: pack.themes.join(', '),
            setting: pack.description + '\n\n' + pack.cosmology.description,
            currencyName: pack.currencyName,
            characterName: form.characterName,
            characterGender: 'Nam',
            characterPersonality: form.characterDescription ?? 'Tính cách tùy chọn phù hợp universe.',
            characterBackstory:
              form.characterType === 'incarnate'
                ? `Hóa thân ${form.characterName} trong ${pack.title}.`
                : (form.characterDescription ?? pack.newbornBackstoryHints?.[0] ?? 'Nhân vật mới khởi sinh trong universe.'),
            realmList: pack.cosmology.realmList,
            startingLocation: pack.defaultStartingLocation,
            initialWorldElements: [
              { name: pack.defaultStartingLocation, type: 'LOCATION' as const, description: 'Vị trí khởi đầu.' },
              ...pack.signatureLocations.slice(0, 4).map((l) => ({
                name: l.name, type: 'LOCATION' as const, description: l.description,
              })),
              ...pack.signatureNpcs.slice(0, 5).map((n) => ({
                name: n.name, type: 'NPC' as const, description: `${n.role}. ${n.description}`,
              })),
            ],
            initialSects: pack.signatureSects.map((s) => ({
              name: s.name,
              alignment: s.alignment,
              description: s.description,
              ...(s.philosophy ? { philosophy: s.philosophy } : {}),
              joinLevelMin: s.joinLevelMin ?? 1,
            })),
            initialBeasts: pack.signatureBeasts.map((b) => ({
              name: b.name, rarity: b.rarity, kind: b.kind, description: b.description, basePower: b.basePower,
            })),
            initialItems: pack.signatureItems.map((i) => ({
              name: i.name, category: i.category, rarity: i.rarity, description: i.description,
            })),
            initialSkills: pack.signatureSkills.map((s) => ({
              name: s.name, kind: s.kind, rarity: s.rarity, description: s.description,
            })),
            cultivationTerms: pack.terminology.map((t) => ({
              term: t.term, kind: t.kind, explanation: t.explanation,
            })),
          };
        } else {
          const prompt = buildFanFicAnalyzePrompt(form);
          result = await callGemini(prompt, {
            temperature: 0.7,           // thấp hơn narrative để bám nguyên tác
            maxOutputTokens: 2000,
            responseMimeType: 'application/json',
            schema: FanFicAnalyzeSchema,
          });
        }

        // Hydrate settings
        set((s) => {
          s.settings.isFanFictionMode = true;
          s.settings.fanFicOriginalWork = form.originalWork;
          s.settings.fanFicCharacterType = form.characterType;
          s.settings.storyTitle = result.storyTitle;
          s.settings.theme = result.theme;
          s.settings.setting = result.setting;
          s.settings.currencyName = result.currencyName;
          s.settings.realmListOverride = result.realmList;

          // Knowledge realmList
          s.knowledge.realmProgressionList = result.realmList;

          // Seed initialWorldElements vào knowledge với x/y radial layout cho map
          const locations = result.initialWorldElements.filter((e) => e.type === 'LOCATION');
          const npcs = result.initialWorldElements.filter((e) => e.type === 'NPC');
          const VIEW_W = 1000;
          const VIEW_H = 700;
          const center = { x: VIEW_W / 2, y: VIEW_H / 2 };
          const locIds: string[] = [];

          locations.forEach((elem, i) => {
            const id = elem.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
              .replace(/đ/g, 'd').replace(/\s+/g, '_').replace(/[^\w]/g, '');
            locIds.push(id);

            // Radial layout — location 0 ở center (starting), others spread quanh radius
            let x: number, y: number;
            if (i === 0) {
              x = center.x;
              y = center.y;
            } else {
              const angle = ((i - 1) / Math.max(1, locations.length - 1)) * Math.PI * 2;
              const radius = 240;
              x = center.x + Math.cos(angle) * radius;
              y = center.y + Math.sin(angle) * radius;
            }

            s.knowledge.locations[id] = {
              id,
              name: elem.name,
              type: 'wilderness',
              description: elem.description,
              neighbors: [],   // sẽ fill bên dưới
              discoveredByPlayer: true,
              visitedByPlayer: i === 0, // first = starting location
              x,
              y,
              levelRange: [1, 10],
              travelCost: 4,
            } as Location;
          });

          // Connect neighbors: location 0 (center) connect tới tất cả khác (hub-spoke)
          // + mỗi outer location connect tới 2 outer kề (ring)
          if (locIds.length >= 2) {
            const firstLoc = s.knowledge.locations[locIds[0]!] as Location;
            firstLoc.neighbors = locIds.slice(1);
            for (let i = 1; i < locIds.length; i++) {
              const cur = s.knowledge.locations[locIds[i]!] as Location;
              const prev = i - 1;
              const next = i + 1 >= locIds.length ? 1 : i + 1;
              const neighbors = [locIds[0]!];
              if (locIds.length > 2 && prev >= 1) neighbors.push(locIds[prev]!);
              if (locIds.length > 2 && next !== i) neighbors.push(locIds[next]!);
              cur.neighbors = Array.from(new Set(neighbors));
            }
          }

          npcs.forEach((elem) => {
            const id = elem.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
              .replace(/đ/g, 'd').replace(/\s+/g, '_').replace(/[^\w]/g, '');
            s.knowledge.characters[id] = {
              id,
              name: elem.name,
              description: elem.description,
              role: 'npc',
            };
          });

          // Lưu starting location id để startNewGame dùng
          (s.settings as Record<string, unknown>)._fanFicStartingLocId = locIds[0] ?? null;

          // Lưu fan-fic sects + beasts để startNewGame apply
          if (result.initialSects && result.initialSects.length > 0) {
            (s.settings as Record<string, unknown>)._fanFicSects = result.initialSects.map((sct) => {
              const id = sct.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
                .replace(/đ/g, 'd').replace(/\s+/g, '_').replace(/[^\w]/g, '');
              return {
                id,
                name: sct.name,
                alignment: sct.alignment,
                description: sct.description,
                philosophy: sct.philosophy ?? '"Đại đạo vô cùng."',
                primaryElements: ['kim', 'moc'], // generic fallback
                joinRequirements: { levelMin: sct.joinLevelMin },
                signatureTechniques: [`${sct.name} Tâm Pháp`, `${sct.name} Bí Thuật`],
              };
            });
          }
          // Stash items + skills cho AI runtime reference
          if (result.initialItems && result.initialItems.length > 0) {
            (s.settings as Record<string, unknown>)._fanFicItems = result.initialItems;
            // Seed vào loreItems (Tier 1) — player biết về items này, AI có thể gen [ITEM]
            // với tên + rarity đúng khi cơ hội tới
            for (const it of result.initialItems) {
              const id = `lore_item_${it.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/\s+/g, '_').replace(/[^\w]/g, '').slice(0, 40)}`;
              if (!s.knowledge.loreItems[id]) {
                s.knowledge.loreItems[id] = {
                  id,
                  name: it.name,
                  description: it.description,
                  rarity: it.rarity,
                  introducedAtTurn: 0,
                  materialized: false,
                  source: form.originalWork,
                };
              }
            }
          }
          if (result.initialSkills && result.initialSkills.length > 0) {
            (s.settings as Record<string, unknown>)._fanFicSkills = result.initialSkills;
          }
          // Phase 9.2: Cultivation terms (kinh mạch, huyệt vị, lãnh thổ...)
          if (result.cultivationTerms && result.cultivationTerms.length > 0) {
            (s.settings as Record<string, unknown>)._fanFicTerms = result.cultivationTerms;
          }

          if (result.initialBeasts && result.initialBeasts.length > 0) {
            (s.settings as Record<string, unknown>)._fanFicBeasts = result.initialBeasts.map((bst) => {
              const id = bst.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
                .replace(/đ/g, 'd').replace(/\s+/g, '_').replace(/[^\w]/g, '');
              const power = bst.basePower ?? 100;
              const baseHp = Math.round(power * 1.5);
              const baseAtk = Math.round(power * 0.4);
              const baseDef = Math.round(power * 0.2);
              const captureChance = bst.rarity === 'Huyền Thoại' ? 3 :
                                    bst.rarity === 'Siêu Phẩm' ? 8 :
                                    bst.rarity === 'Cực Phẩm' ? 15 :
                                    bst.rarity === 'Hiếm' ? 25 :
                                    bst.rarity === 'Tốt' ? 40 : 60;
              return {
                id,
                baseName: bst.name,
                rarity: bst.rarity,
                kind: bst.kind,
                baseStats: { hp: baseHp, atk: baseAtk, def: baseDef, spd: 30 },
                captureRequirement: { baseCaptureChance: captureChance },
                stages: [
                  { name: bst.name, minLevel: 1, statMultiplier: 1, description: bst.description },
                  { name: `${bst.name} Tiến Hóa`, minLevel: 20, statMultiplier: 2.5,
                    description: `${bst.name} đã trưởng thành, sức mạnh tăng vọt.`,
                    evolutionCost: { currency: 2000 } },
                ],
              };
            });
          }

          // Lưu lại tên + giới tính + personality + backstory để Setup screen tự fill
          // (Setup form sẽ đọc từ settings, KHÔNG override player nếu chưa tạo)
          // Stash vào pendingFanFicChar — Setup sẽ pick up
          (s.settings as Record<string, unknown>)._pendingChar = {
            name: result.characterName,
            gender: result.characterGender,
            personality: result.characterPersonality,
            description: result.characterBackstory,
          };

          s.isAiThinking = false;
          s.aiPhase = 'idle';
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        set((s) => {
          s.isAiThinking = false;
          s.aiPhase = 'idle';
          s.lastError = `[fan-fic] Phân tích thất bại: ${msg}`;
        });
        throw err;
      }
    },

    /**
     * Phase 13.1D: Apply world genesis result từ wizard.
     * KHÔNG set isFanFictionMode (đây là open-world tự sinh, không phải fan-fic).
     * Hydrate setting + knowledge.locations + characters + sects + items + skills + terms.
     */
    applyWorldGenesis: (result) => {
      set((s) => {
        s.settings.isFanFictionMode = false; // open-world, không phải fan-fic
        s.settings.storyTitle = result.worldName;
        s.settings.theme = result.theme;
        s.settings.setting = `${result.tagline}\n\n${result.setting}`;
        s.settings.currencyName = result.currencyName;
        s.settings.realmListOverride = result.realmList;
        s.knowledge.realmProgressionList = result.realmList;

        // Seed locations (giống analyzeFanFic radial layout)
        const VIEW_W = 1000;
        const VIEW_H = 700;
        const center = { x: VIEW_W / 2, y: VIEW_H / 2 };
        const locIds: string[] = [];
        const slug = (name: string): string =>
          name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/đ/g, 'd').replace(/\s+/g, '_').replace(/[^\w]/g, '');

        result.locations.forEach((loc, i) => {
          const id = slug(loc.name);
          locIds.push(id);
          let x: number, y: number;
          if (i === 0) { x = center.x; y = center.y; }
          else {
            const angle = ((i - 1) / Math.max(1, result.locations.length - 1)) * Math.PI * 2;
            const radius = 240;
            x = center.x + Math.cos(angle) * radius;
            y = center.y + Math.sin(angle) * radius;
          }
          s.knowledge.locations[id] = {
            id, name: loc.name, type: 'wilderness',
            description: loc.description, neighbors: [],
            discoveredByPlayer: true, visitedByPlayer: i === 0,
            x, y, levelRange: [1, 10], travelCost: 4,
          } as Location;
        });
        if (locIds.length >= 2) {
          const firstLoc = s.knowledge.locations[locIds[0]!] as Location;
          firstLoc.neighbors = locIds.slice(1);
          for (let i = 1; i < locIds.length; i++) {
            const cur = s.knowledge.locations[locIds[i]!] as Location;
            const neighbors = [locIds[0]!];
            if (locIds.length > 2 && i - 1 >= 1) neighbors.push(locIds[i - 1]!);
            const nextIdx = i + 1 >= locIds.length ? 1 : i + 1;
            if (locIds.length > 2 && nextIdx !== i) neighbors.push(locIds[nextIdx]!);
            cur.neighbors = Array.from(new Set(neighbors));
          }
        }

        // NPCs
        result.npcs.forEach((n) => {
          const id = slug(n.name);
          s.knowledge.characters[id] = {
            id, name: n.name, description: `${n.role}. ${n.description}`, role: 'npc',
          };
        });

        // Sects via fan-fic stash mechanism (apply on startNewGame)
        (s.settings as Record<string, unknown>)._fanFicStartingLocId = locIds[0] ?? null;
        (s.settings as Record<string, unknown>)._fanFicSects = result.sects.map((sct) => ({
          id: slug(sct.name),
          name: sct.name,
          alignment: sct.alignment,
          description: sct.description,
          philosophy: sct.philosophy ?? '"Đạo pháp tự nhiên."',
          primaryElements: ['kim', 'moc'],
          joinRequirements: { levelMin: 1 },
          signatureTechniques: [`${sct.name} Tâm Pháp`, `${sct.name} Bí Thuật`],
        }));

        // Items + skills + terms stash
        (s.settings as Record<string, unknown>)._fanFicItems = result.items;
        (s.settings as Record<string, unknown>)._fanFicSkills = result.skills;
        (s.settings as Record<string, unknown>)._fanFicTerms = result.terminology;

        // Seed lore items
        for (const it of result.items) {
          const id = `lore_item_${slug(it.name).slice(0, 40)}`;
          if (!s.knowledge.loreItems[id]) {
            s.knowledge.loreItems[id] = {
              id, name: it.name, description: it.description,
              rarity: it.rarity, introducedAtTurn: 0, materialized: false,
              source: result.worldName,
            };
          }
        }
      });
    },

    startNewGame: async (init) => {
      const player = makePlayer(init);
      // Phase 8.3: Fan-fic mode dùng custom starting location từ analyze
      const fanFicStartId = (get().settings as { _fanFicStartingLocId?: string | null })._fanFicStartingLocId;
      const isFanFicWithCustomWorld = get().settings.isFanFictionMode && fanFicStartId && get().knowledge.locations[fanFicStartId];
      player.current_location_id = isFanFicWithCustomWorld ? fanFicStartId : 'thanh_van_phong';
      // Phase 14.x hotfix: Canon pack có defaultStartingTechnique → override default
      // (vd "Bá Thể Tam Đan Công" cho Tần Mục thay vì generic "Hồn Nguyên Trường Sinh Quyết")
      const canonTech = (get().settings as { _canonStartingTechnique?: string })._canonStartingTechnique;
      if (canonTech) {
        player.currentTechnique = canonTech;
      }
      set((s) => {
        s.player = player;
        Object.assign(s.settings, init.settings);
        s.storyLog = [];
        s.currentActions = [];
        s.turn = 0;
        s.inventory = {};
        s.skills = {};
        // Initialize world: nếu fan-fic có custom locations → GIỮ, KHÔNG overwrite
        // Default mode → load DEFAULT_LOCATIONS
        if (!isFanFicWithCustomWorld) {
          const locDict: Record<string, MapLocation> = {};
          DEFAULT_LOCATIONS.forEach((l) => {
            locDict[l.id] = { ...l };
          });
          s.knowledge.locations = locDict;
        }
        // Mark starting location visited
        if (player.current_location_id && s.knowledge.locations[player.current_location_id]) {
          s.knowledge.locations[player.current_location_id]!.visitedByPlayer = true;
          s.knowledge.locations[player.current_location_id]!.discoveredByPlayer = true;
        }
        const facDict: Record<string, typeof DEFAULT_FACTIONS[number]> = {};
        DEFAULT_FACTIONS.forEach((f) => {
          facDict[f.id] = f;
        });
        s.knowledge.factions = facDict;
        s.lastError = null;
        s.prevStage = s.stage;
        s.stage = 'playing';
        s.isAiThinking = true;
      });

      // Thông báo linh căn vừa roll
      notify.epic('Linh căn khai thông', getRootDisplayName(player.spiritualRoot!));

      try {
        const parsed = await generateNarrative({
          settings: get().settings,
          player,
          ...(player.realm ? { realm: player.realm } : {}),
          recentHistory: [],
          isOpening: true,
        });

        set((s) => {
          s.storyLog.push({
            id: crypto.randomUUID(),
            turn: 1,
            timestamp: Date.now(),
            kind: 'narrative',
            segments: parsed.segments,
          });
          s.currentActions = parsed.actions;
          s.currentActionChoices = parsed.actionChoices;
          s.turn = 1;
          s.isAiThinking = false;
          s.aiPhase = 'idle';
        });

        // Apply tag events từ chunk đầu tiên
        applyGameEvents(parseGameTags(parsed.raw), get, set);

        get().saveToLocalStorage();
      } catch (err) {
        set((s) => {
          s.isAiThinking = false;
          s.aiPhase = 'idle';
          s.lastError = err instanceof Error ? err.message : String(err);
        });
      }
    },

    submitAction: async (actionText) => {
      const state = get();
      if (!state.player || state.isAiThinking) return;
      // Phase 15: Soft token gating — useActionToken vẫn return true cho play khi hết,
      // chỉ hiện toast warn. Hard gating có thể bật sau bằng cách return early.
      get().useActionToken();
      // Phase 16.3: Increment daily mission progress
      get().incrementMissionProgress('submit_5_actions');
      get().incrementMissionProgress('submit_15_actions');
      // Phase 17.1: Check extended quest progress
      get().refreshExtendedQuests();
      get().checkAchievementUnlocks();
      // Detect meditation/cultivation keyword in actionText
      if (/tu luy|bế quan|thiền|tĩnh tâm|hít thở|đả tọa/i.test(actionText)) {
        get().incrementMissionProgress('meditate_3_times');
      }

      set((s) => {
        s.storyLog.push({
          id: crypto.randomUUID(),
          turn: s.turn + 1,
          timestamp: Date.now(),
          kind: 'player_action',
          content: actionText,
        });
        s.turn += 1;
        s.playerStats.turnsPlayed += 1;
        s.currentActions = [];
        s.currentActionChoices = [];
        s.isAiThinking = true;
        s.lastError = null;
        // Refactor 5: record action — outcome sẽ infer sau khi AI response (default neutral)
        s.knowledge.recentMeaningfulActions = pushAction(s.knowledge.recentMeaningfulActions, {
          turn: s.turn,
          action: actionText,
          outcome: 'neutral',
          outcomeSummary: '(đang xử lý)',
        });
      });

      const log = get().storyLog;
      const recentHistory = log
        .slice(-8)
        .map((e) => {
          if (e.kind === 'player_action') return `→ Hành động: ${e.content}`;
          if (e.kind === 'narrative') {
            return e.segments
              ?.map((seg) =>
                seg.type === 'narrative'
                  ? seg.content
                  : `[${seg.speaker}]: ${seg.content}`,
              )
              .join(' ');
          }
          return e.content ?? '';
        })
        .filter(Boolean) as string[];

      try {
        const player = get().player!;
        const settings = get().settings;
        const realm = player.realm;
        const knowledge = get().knowledge;

        // Build lore context cho AI (limit để prompt không phình to)
        const loreNpcsArr = Object.values(knowledge.loreNpcs).slice(0, 10);
        const loreLocsArr = Object.values(knowledge.loreLocations).slice(0, 10);
        const worldNpcsArr = Object.values(knowledge.characters)
          .slice(0, 10)
          .map((c) => {
            const ch = c as { id?: string; name?: string; description?: string; loreId?: string };
            return {
              id: ch.id ?? '',
              name: ch.name ?? '',
              ...(ch.description ? { description: ch.description } : {}),
              ...(ch.loreId ? { loreId: ch.loreId } : {}),
            };
          });
        const worldLocsArr = Object.values(knowledge.locations)
          .slice(0, 10)
          .map((l) => ({
            id: l.id,
            name: l.name,
            ...(l.description ? { description: l.description } : {}),
            ...((l as Location & { loreId?: string }).loreId
              ? { loreId: (l as Location & { loreId?: string }).loreId! }
              : {}),
          }));

        const enabledRules = (settings.customRules ?? [])
          .filter((r) => r.enabled)
          .map((r) => r.rule);
        const meaningfulEvents = knowledge.eventHistory.slice(-12).map((e) => ({
          turn: e.turn,
          kind: e.kind,
          summary: e.summary,
        }));
        // Phase 11.1: 2-tier story summaries (long-play context)
        const storySummariesCtx = knowledge.storySummaries.map((s) => ({
          content: s.content,
          level: s.level,
          ...(s.turnStart !== undefined ? { turnStart: s.turnStart } : {}),
          ...(s.turnEnd !== undefined ? { turnEnd: s.turnEnd } : {}),
        }));

        // Phase 8.3: Fan-fic items + skills hint context
        const ffItems = (settings as { _fanFicItems?: Array<{ name: string; category: string; rarity: string; description: string }> })._fanFicItems;
        const ffSkills = (settings as { _fanFicSkills?: Array<{ name: string; kind: string; rarity: string; description: string }> })._fanFicSkills;
        // Phase 9.2: Cultivation terminology
        const ffTerms = (settings as { _fanFicTerms?: Array<{ term: string; kind: string; explanation: string }> })._fanFicTerms;

        // Phase 22.3: Canon pack beasts + cosmology lookup
        let canonBeasts: Array<{ name: string; kind: string; description: string; tier?: string }> | undefined;
        let canonPackName: string | undefined;
        let canonCosmologyHint: string | undefined;
        const cpId = settings.canonPackId;
        if (cpId) {
          try {
            const { getCanonPack } = await import('@data/canon-packs');
            const pack = getCanonPack(cpId);
            if (pack) {
              canonPackName = pack.title;
              canonCosmologyHint = pack.cosmology.description;
              canonBeasts = pack.signatureBeasts.map((b) => ({
                name: b.name,
                kind: b.kind,
                description: b.description,
                tier: b.basePower >= 500 ? 'boss' : b.basePower >= 100 ? 'strong' : 'common',
              }));
            }
          } catch { /* canon-packs module not available — skip */ }
        }

        const parsed = await generateNarrative({
          settings,
          player,
          ...(realm ? { realm } : {}),
          recentHistory,
          lastAction: actionText,
          loreNpcs: loreNpcsArr,
          loreLocations: loreLocsArr,
          worldNpcs: worldNpcsArr,
          worldLocations: worldLocsArr,
          meaningfulEvents,
          customRules: enabledRules,
          storySummaries: storySummariesCtx,
          ...(ffItems ? { fanFicItems: ffItems } : {}),
          ...(ffSkills ? { fanFicSkills: ffSkills } : {}),
          ...(ffTerms ? { fanFicTerms: ffTerms } : {}),
          ...(canonBeasts ? { canonBeasts } : {}),
          ...(canonPackName ? { canonPackName } : {}),
          ...(canonCosmologyHint ? { canonCosmologyHint } : {}),
          // Phase 23.5: player đạo state cho AI
          playerDao: Object.entries(get().cultivation.dao.paths).slice(0, 8).map(([key, d]) => ({
            name: d.name,
            level: d.level,
            description: d.description,
            focused: get().cultivation.dao.focused.includes(key),
          })),
          // Phase 9.3: cập nhật aiPhase để UI hiển thị state phù hợp
          onPhase: (phase) => set((st) => { st.aiPhase = phase; }),
        });

        set((s) => {
          s.storyLog.push({
            id: crypto.randomUUID(),
            turn: s.turn,
            timestamp: Date.now(),
            kind: 'narrative',
            segments: parsed.segments,
          });
          s.currentActions = parsed.actions;
          s.currentActionChoices = parsed.actionChoices;
          s.isAiThinking = false;
          s.aiPhase = 'idle';
        });

        // Apply tag events
        applyGameEvents(parseGameTags(parsed.raw), get, set);

        get().saveToLocalStorage();

        // Phase 11.1: Background summarization — không await, không block UI.
        // Triple-lock: chỉ chạy nếu storyLog > trigger và không có summarization khác đang chạy.
        triggerSummarizationIfNeeded(get, set);
      } catch (err) {
        set((s) => {
          s.isAiThinking = false;
          s.aiPhase = 'idle';
          s.lastError = err instanceof Error ? err.message : String(err);
        });
      }
    },

    startCombat: (enemyName, enemyLevel) => {
      const player = get().player;
      if (!player) return;
      const playerCombatant = {
        id: player.id,
        name: player.Name,
        level: player.level,
        isPlayer: true,
        finalStats: player.finalStats,
        ref: player,
      };
      const enemy = makeEnemyCombatant(enemyName, enemyLevel);
      const session = createCombatSession(playerCombatant, [enemy]);
      set((s) => {
        s.combat = session;
        s.prevStage = s.stage;
        s.stage = 'combat';
      });
      notify.warn('Chiến đấu!', `${enemyName} cấp ${enemyLevel} xuất hiện`);
    },

    combatPlayerAction: (action) => {
      const { combat } = get();
      if (!combat || combat.status !== 'ongoing') return;

      // Phase 23.2: Skill mastery — apply damage multiplier vào skillMultiplier
      // Phase 23.3: Ý cảnh — apply intent multiplier theo skill name
      // Phase 24.A: Skill Deep — talent + rune + combo stack
      let finalAction = action;
      if (action.kind !== 'flee' && action.skillName) {
        let combinedMul = 1;
        const mastery = get().skillMastery[action.skillName];
        if (mastery && mastery.level > 1) combinedMul *= 1 + (mastery.level - 1) * 0.05;

        // Intent mul
        const intentName = inferIntentFromSkill(action.skillName);
        const intentEntry = get().cultivation.intents[intentName];
        if (intentEntry && intentEntry.level > 1) {
          combinedMul *= getIntentDamageMul(intentEntry.level);
        }

        // Phase 24.A: stack talent + rune + combo
        const masteryLv = mastery?.level ?? 1;
        const playerSt = get().player;
        const equippedSkillNames = playerSt
          ? Object.values(playerSt.equippedSkills)
              .filter((id): id is string => !!id)
              .map((id) => get().skills[id]?.name ?? '')
              .filter(Boolean)
          : [];
        const enemyCombatant = combat.combatants.find((c) => !c.isPlayer);
        const enemyHpPct = enemyCombatant
          ? enemyCombatant.finalStats.hp / Math.max(1, enemyCombatant.finalStats.maxhp)
          : undefined;
        const skillDeepEffect = computeFinalSkillEffect(
          action.skillName,
          action.skillName,
          masteryLv,
          get().skillDeep.talents[action.skillName],
          get().skillDeep.runeSlots[action.skillName],
          equippedSkillNames,
          enemyHpPct,
        );
        if (skillDeepEffect.damageBonus > 0) {
          combinedMul *= 1 + skillDeepEffect.damageBonus;
        }
        // Cache active combo names cho UI (ephemeral)
        const activeCombos = detectActiveCombos(equippedSkillNames);
        set((s) => {
          s.skillDeep.lastActiveCombos = activeCombos.map((c) => c.id);
        });

        if (combinedMul !== 1 && action.skillMultiplier) {
          finalAction = { ...action, skillMultiplier: action.skillMultiplier * combinedMul };
        }

        // Add XP after cast
        const xpDelta = action.kind === 'skill_ultimate' ? 15 : action.kind === 'skill_basic' ? 8 : 3;
        const r = addMasteryXp(get().skillMastery, action.skillName, xpDelta);
        set((s) => { s.skillMastery = r.state; });
        if (r.leveledUp) {
          const tierName = MASTERY_LEVEL_NAMES[r.newLevel] ?? `Lv ${r.newLevel}`;
          notify.epic(`✦ ${action.skillName} → ${tierName}`, {
            message: `Kỹ năng đã thấu hiểu sâu hơn. Sát thương tăng theo bậc mastery.`,
            action: { target: 'skills', label: 'Xem pháp thuật' },
          });
        }

        // Phase 23.3: Intent XP — chia theo loại skill action
        const intentXp = action.kind === 'skill_ultimate' ? 8 : action.kind === 'skill_basic' ? 4 : 2;
        const ir = addIntentXp(get().cultivation.intents, intentName, intentXp);
        set((s) => { s.cultivation.intents = ir.state; });
        if (ir.leveledUp) {
          const tierName = INTENT_TIER_NAMES[ir.newLevel] ?? `Tầng ${ir.newLevel}`;
          notify.epic(`✦ ${intentName} → ${tierName}`, {
            message: `Ý cảnh nâng cấp. Damage skill cùng loại +${((getIntentDamageMul(ir.newLevel) - 1) * 100).toFixed(0)}%.`,
            action: { target: 'cultivation', label: 'Xem Đạo Tâm' },
          });
        }
      }

      let state = executeAction(combat, finalAction);

      // Auto-run enemy turns đến khi tới lượt player hoặc end
      while (
        state.status === 'ongoing' &&
        !state.combatants[state.initiative[state.currentTurnIdx]!]!.isPlayer
      ) {
        state = executeAction(state, enemyAutoAction(state));
      }

      set((s) => {
        s.combat = state;
        // Cập nhật HP player vào player state
        const playerCombatant = state.combatants.find((c) => c.isPlayer);
        if (playerCombatant && s.player) {
          s.player.finalStats.hp = playerCombatant.finalStats.hp;
        }
      });

      // End combat handlers
      if (state.status === 'player_win') {
        const enemy = combat.combatants.find((c) => !c.isPlayer)!;
        const expGain = Math.round(50 * enemy.level * 1.2);
        const currencyGain = Math.round(20 * enemy.level);
        notify.success('Chiến thắng!', `+${expGain} EXP · +${currencyGain} Linh Thạch`);
        // Phase 20 + 21.2: lifetime kill + currency + per-enemy tracker
        set((s) => {
          s.playerStats.totalKills += 1;
          s.playerStats.totalCurrencyEarned += currencyGain;
          const name = (enemy as { name?: string }).name || 'Vô danh';
          s.playerStats.killsByEnemy[name] = (s.playerStats.killsByEnemy[name] ?? 0) + 1;
        });
        // Phase 16.3: Mission progress combat
        get().incrementMissionProgress('win_combat');
        get().incrementMissionProgress('win_2_combats');
        applyGameEvents(
          [
            { type: 'EXP_GAIN', amount: expGain },
            { type: 'CURRENCY_DELTA', amount: currencyGain },
          ],
          get,
          set,
        );
        setTimeout(() => {
          set((s) => {
            s.combat = null;
            s.stage = 'playing';
          });
        }, 1500);
      } else if (state.status === 'enemy_win') {
        notify.warn('Bại trận', 'Ngươi bị đánh ngã, tỉnh dậy ở nơi an toàn');
        // Phase 21.2: lifetime defeat tracker
        set((s) => { s.playerStats.totalDefeats += 1; });
        setTimeout(() => {
          set((s) => {
            s.combat = null;
            if (s.player) {
              s.player.finalStats.hp = Math.max(1, Math.floor(s.player.finalStats.maxhp * 0.2));
            }
            s.stage = 'playing';
          });
        }, 1500);
      } else if (state.status === 'fled') {
        notify.info('Bỏ chạy', 'Ngươi trốn thoát khỏi trận chiến');
        // Phase 21.2: fled cũng tính defeat (không phải win)
        set((s) => { s.playerStats.totalDefeats += 1; });
        setTimeout(() => {
          set((s) => {
            s.combat = null;
            s.stage = 'playing';
          });
        }, 800);
      }
    },

    endCombat: () =>
      set((s) => {
        s.combat = null;
        s.stage = 'playing';
      }),

    useItem: (itemId) => {
      const item = get().inventory[itemId];
      if (!item) return;
      // Đơn giản: nếu Đan dược → +50% HP, remove 1 quantity
      if (item.category === 'Đan dược') {
        set((s) => {
          if (!s.player) return;
          const heal = Math.floor(s.player.finalStats.maxhp * 0.3);
          s.player.finalStats.hp = Math.min(
            s.player.finalStats.maxhp,
            s.player.finalStats.hp + heal,
          );
          const inv = s.inventory[itemId];
          if (inv) {
            const q = inv.quantity ?? 1;
            if (q > 1) inv.quantity = q - 1;
            else {
              delete s.inventory[itemId];
              if (s.player) s.player.inventory = s.player.inventory.filter((id) => id !== itemId);
            }
          }
        });
        notify.success('Dùng đan dược', `+${Math.floor(get().player!.finalStats.maxhp * 0.3)} HP`);
      } else {
        notify.info('Không thể sử dụng', `${item.name} không phải đan dược.`);
      }
      get().saveToLocalStorage();
    },

    discardItem: (itemId) => {
      set((s) => {
        const item = s.inventory[itemId];
        if (!item) return;
        // Nếu đang trang bị → unequip trước
        if (s.player) {
          for (const k of Object.keys(s.player.equippedItems) as EquipmentSlot[]) {
            if (s.player.equippedItems[k] === itemId) s.player.equippedItems[k] = null;
          }
        }
        delete s.inventory[itemId];
        if (s.player) {
          s.player.inventory = s.player.inventory.filter((id) => id !== itemId);
          s.player = recomputeStats(s.player, s.inventory);
        }
      });
      get().saveToLocalStorage();
    },

    equipItem: (itemId, explicitSlot) => {
      set((s) => {
        if (!s.player) return;
        const item = s.inventory[itemId];
        if (!item) return;
        if (!EQUIPPABLE_CATEGORIES.includes(item.category)) return;

        const slot = explicitSlot ?? item.equipSlot ?? CATEGORY_TO_DEFAULT_SLOT[item.category];
        if (!slot) return;

        // Unequip current item ở slot đó (nếu có) — không xóa khỏi inventory
        const prev = s.player.equippedItems[slot];
        s.player.equippedItems[slot] = itemId;
        s.player = recomputeStats(s.player, s.inventory);

        notify.success(`Trang bị: ${item.name}`, `→ ${slot}${prev ? ' (đổi)' : ''}`);
      });
      // Phase 23.UX HOTFIX: persist sau equip — trước đây bị quên → refresh = mất
      get().saveToLocalStorage();
    },

    unequipItem: (slot) => {
      set((s) => {
        if (!s.player) return;
        const id = s.player.equippedItems[slot];
        if (!id) return;
        const item = s.inventory[id];
        s.player.equippedItems[slot] = null;
        s.player = recomputeStats(s.player, s.inventory);
        if (item) notify.info(`Tháo: ${item.name}`, '');
      });
      // Phase 23.UX HOTFIX: persist sau unequip
      get().saveToLocalStorage();
    },

    equipSkill: (skillId, slot) => {
      set((s) => {
        if (!s.player) return;
        const skill = s.skills[skillId];
        if (!skill) return;
        // Player phải đã học kỹ năng
        if (!s.player.learnedSkills.includes(skillId)) {
          notify.warn('Chưa học kỹ năng', skill.name);
          return;
        }
        // Validate slot vs kind
        const isCombatSlot = slot.startsWith('combat_');
        const isAdventureSlot = slot.startsWith('adventure_');
        const isCombatSkill = skill.kind === 'combat_basic' || skill.kind === 'combat_ultimate';
        if (isCombatSlot && !isCombatSkill) {
          notify.warn('Sai loại kỹ năng', 'Slot combat chỉ chứa kỹ năng chiến đấu.');
          return;
        }
        if (slot === 'combat_ultimate' && skill.kind !== 'combat_ultimate') {
          notify.warn('Sai loại kỹ năng', 'Slot tuyệt kỹ chỉ chứa kỹ năng tuyệt kỹ.');
          return;
        }
        if ((slot === 'combat_basic_1' || slot === 'combat_basic_2') && skill.kind !== 'combat_basic') {
          notify.warn('Sai loại kỹ năng', 'Slot cơ bản chỉ chứa kỹ năng cơ bản.');
          return;
        }
        if (isAdventureSlot && skill.kind !== 'adventure') {
          notify.warn('Sai loại kỹ năng', 'Slot phiêu lưu chỉ chứa kỹ năng phiêu lưu.');
          return;
        }
        // Nếu skill đã được trang bị ở slot khác → bỏ slot cũ
        for (const k of Object.keys(s.player.equippedSkills) as Array<keyof typeof s.player.equippedSkills>) {
          if (s.player.equippedSkills[k] === skillId) {
            s.player.equippedSkills[k] = null;
          }
        }
        s.player.equippedSkills[slot] = skillId;
        notify.success(`Trang bị: ${skill.name}`, `→ ${slot}`);
      });
      get().saveToLocalStorage();
    },

    unequipSkill: (slot) => {
      set((s) => {
        if (!s.player) return;
        const id = s.player.equippedSkills[slot];
        if (!id) return;
        const skill = s.skills[id];
        s.player.equippedSkills[slot] = null;
        if (skill) notify.info(`Gỡ kỹ năng: ${skill.name}`, '');
      });
      get().saveToLocalStorage();
    },

    // ─── Phase 15: Economy actions ───

    refreshTokens: () => {
      set((s) => {
        s.economy = computeRegenTokens(s.economy);
      });
    },

    useActionToken: () => {
      const e = get().economy;
      const regenerated = computeRegenTokens(e);
      const hasTokens = regenerated.actionTokens > 0;
      set((s) => {
        s.economy = regenerated;
        if (hasTokens) {
          s.economy.actionTokens -= 1;
        }
      });
      if (!hasTokens) {
        notify.warn('Hết Lượt Hành Động', 'Đợi regen 1/15p hoặc nạp Tiền Ngọc đổi thêm (Cửa Hàng).');
      } else if (regenerated.actionTokens <= 10) {
        // Soft warning khi sắp hết
        notify.info(`Còn ${regenerated.actionTokens - 1} lượt`, 'Sắp cạn — đợi regen hoặc đổi từ Tiền Ngọc.');
      }
      return true; // Soft gating: luôn cho play
    },

    spendTienNgoc: (amount, reason) => {
      const have = get().economy.tienNgoc;
      if (have < amount) {
        notify.warn('Không đủ Tiền Ngọc', `Cần ${amount} TN (có ${have}). Nạp thêm ở Cửa Hàng.`);
        return false;
      }
      set((s) => {
        s.economy.tienNgoc -= amount;
      });
      if (reason) notify.info(`-${amount} Tiền Ngọc`, reason);
      return true;
    },

    addTienNgoc: (amount, reason) => {
      set((s) => {
        s.economy.tienNgoc += amount;
      });
      notify.success(`+${amount} Tiền Ngọc`, reason ?? '');
    },

    addActionTokens: (amount) => {
      set((s) => {
        s.economy.actionTokens += amount; // Cho phép vượt cap (premium top-up)
      });
      notify.success(`+${amount} Lượt Hành Động`, '');
    },

    purchaseExchange: (effectId) => {
      const option = EXCHANGE_OPTIONS.find((o) => o.effect === effectId);
      if (!option) return false;
      const cost = option.cost;
      const { spendTienNgoc, addActionTokens } = get();
      const e = get().economy;
      // Block oneTime perks đã unlock
      if (option.kind === 'oneTime') {
        const key = effectId === 'speed_boost_unlock' ? 'speedBoost'
          : effectId === 'unlimited_custom_rules' ? 'unlimitedCustomRules'
          : effectId === 'extra_save_slots' ? 'extraSaveSlots' : null;
        if (key && e.unlockedPerks[key]) {
          notify.info('Đã mở khoá', option.label);
          return false;
        }
      }
      if (!spendTienNgoc(cost, `Mua: ${option.label}`)) return false;

      // Apply effect
      set((s) => {
        switch (effectId) {
          case 'topup_50_tokens': s.economy.actionTokens += 50; break;
          case 'topup_200_tokens': s.economy.actionTokens += 220; break;
          case 'topup_500_tokens': s.economy.actionTokens += 600; break;
          case 'speed_boost_unlock':
            s.economy.unlockedPerks.speedBoost = true;
            setPerkFlags({ speedBoost: true });
            break;
          case 'unlimited_custom_rules': s.economy.unlockedPerks.unlimitedCustomRules = true; break;
          case 'extra_save_slots': s.economy.unlockedPerks.extraSaveSlots = true; break;
          case 'genesis_reroll_credit': /* future: track credit */ break;
          case 'item_upgrade_credit': /* future: track credit */ break;
        }
        pushHistory(s.economy, {
          kind: 'exchange',
          title: `Đổi: ${option.label}`,
          delta: -cost,
          refId: effectId,
          status: 'done',
        });
      });
      if (effectId.startsWith('topup_')) {
        notify.success(`+ Lượt Hành Động`, option.label);
      } else if (option.kind === 'oneTime') {
        notify.epic('✦ Mở Khoá Vĩnh Viễn', option.label);
      } else {
        notify.success('Mua thành công', option.label);
      }
      trackEvent('exchange_purchase', { effectId, cost, kind: option.kind });
      // Avoid unused warning
      void addActionTokens;
      return true;
    },

    redeemCoupon: async (code) => {
      const normalizedCode = code.trim().toUpperCase();
      // Phase 17.2: Try Firebase function trước (atomic claim, chống fake)
      try {
        const { validateCouponRemote } = await import('@services/coupon-referral-api');
        const { getOrCreateDeviceId: getDeviceId } = await import('@gametypes/economy');
        const res = await validateCouponRemote({
          code: normalizedCode,
          deviceId: getDeviceId(),
          turn: get().turn,
        });
        if (res.ok && res.reward) {
          set((s) => {
            s.economy.redeemedCoupons.push(normalizedCode);
            if (res.reward!.tienNgoc) s.economy.tienNgoc += res.reward!.tienNgoc;
            if (res.reward!.actionTokens) s.economy.actionTokens += res.reward!.actionTokens;
            pushHistory(s.economy, {
              kind: 'coupon',
              title: `Mã ${normalizedCode}`,
              delta: res.reward!.tienNgoc ?? 0,
              refId: normalizedCode,
              status: 'done',
            });
          });
          notify.epic('✦ Đổi mã thành công', res.message);
          trackEvent('coupon_redeemed', { code: normalizedCode, source: 'remote',
            tienNgoc: res.reward.tienNgoc ?? 0, actionTokens: res.reward.actionTokens ?? 0 });
          return { ok: true, message: res.message };
        }
        if (!res.ok) {
          // Phase 23.UX: nếu remote nói "không tồn tại" → fall through tìm trong local
          // registry (vd recovery coupons như BUNAP-DUYENTB chỉ ở client-side).
          // Nếu remote nói lý do khác (expired/used/invalid_user) → tôn trọng.
          const isNotFound = /không tồn tại|not found|invalid code|unknown/i.test(res.message);
          if (!isNotFound) return { ok: false, message: res.message };
          // else: fall through xuống local check
        }
      } catch (err) {
        // Firebase chưa config / network fail → fallback client-side
        console.info('[redeemCoupon] remote unavailable, fallback local:', err);
      }

      // ─── Fallback client-side (Phase 15 behavior) ───
      const coupon = findCoupon(code);
      if (!coupon) {
        return { ok: false, message: `Mã "${code}" không hợp lệ hoặc đã hết hạn.` };
      }
      if (get().economy.redeemedCoupons.includes(coupon.code)) {
        return { ok: false, message: 'Mã này đã được sử dụng trên thiết bị.' };
      }
      if (coupon.newUserOnly && get().turn > 0) {
        return { ok: false, message: 'Mã này chỉ dành cho tân thủ (chưa bắt đầu chơi).' };
      }
      // Phase 23.UX: deviceId lock (cho recovery coupons 1-1)
      if (coupon.lockedToDeviceId) {
        const myDeviceId = getOrCreateDeviceId();
        if (coupon.lockedToDeviceId !== myDeviceId) {
          return {
            ok: false,
            message: 'Mã này chỉ dành cho 1 thiết bị cụ thể, không áp dụng cho bạn.',
          };
        }
      }
      set((s) => {
        s.economy.redeemedCoupons.push(coupon.code);
        if (coupon.reward.tienNgoc) s.economy.tienNgoc += coupon.reward.tienNgoc;
        if (coupon.reward.actionTokens) s.economy.actionTokens += coupon.reward.actionTokens;
        // Phase 23.UX: apply perks (cho recovery coupon hoàn lại Speed Boost...)
        if (coupon.reward.perks) {
          for (const perk of coupon.reward.perks) {
            s.economy.unlockedPerks[perk] = true;
          }
        }
        pushHistory(s.economy, {
          kind: 'coupon',
          title: `Mã ${coupon.code}`,
          delta: coupon.reward.tienNgoc ?? 0,
          refId: coupon.code,
          status: 'done',
        });
      });
      // Sync perk flags vào AI client nếu unlock speedBoost
      if (coupon.reward.perks?.includes('speedBoost')) {
        setPerkFlags({ speedBoost: true });
      }
      const rewardParts: string[] = [];
      if (coupon.reward.tienNgoc) rewardParts.push(`+${coupon.reward.tienNgoc} Tiền Ngọc`);
      if (coupon.reward.actionTokens) rewardParts.push(`+${coupon.reward.actionTokens} Lượt`);
      if (coupon.reward.perks?.length) rewardParts.push(`+${coupon.reward.perks.join(', ')}`);
      notify.epic('✦ Đổi mã thành công', `${coupon.description} (${rewardParts.join(', ')})`);
      trackEvent('coupon_redeemed', { code: coupon.code, source: 'local',
        tienNgoc: coupon.reward.tienNgoc ?? 0, actionTokens: coupon.reward.actionTokens ?? 0 });
      return { ok: true, message: `${coupon.description} (${rewardParts.join(', ')})` };
    },

    applyReferral: async (code) => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return { ok: false, message: 'Vui lòng nhập mã.' };
      if (trimmed === get().economy.referralCode) {
        return { ok: false, message: 'Không thể tự giới thiệu chính mình.' };
      }
      if (get().economy.referredBy) {
        return { ok: false, message: 'Đã sử dụng mã giới thiệu trước đó.' };
      }
      if (get().turn > 5) {
        return { ok: false, message: 'Mã giới thiệu chỉ dùng được khi mới bắt đầu (< 5 lượt).' };
      }

      // Phase 17.2: Try Firebase function trước (verify inviter exists, bump inviter stats)
      try {
        const { validateReferralRemote } = await import('@services/coupon-referral-api');
        const { getOrCreateDeviceId: getDeviceId } = await import('@gametypes/economy');
        const res = await validateReferralRemote({
          inviterCode: trimmed,
          deviceId: getDeviceId(),
          myReferralCode: get().economy.referralCode,
          turn: get().turn,
        });
        if (res.ok && res.inviteeReward) {
          set((s) => {
            s.economy.referredBy = trimmed;
            s.economy.tienNgoc += res.inviteeReward!.tienNgoc;
            s.economy.actionTokens += res.inviteeReward!.actionTokens;
            pushHistory(s.economy, {
              kind: 'referral',
              title: `Giới thiệu ${trimmed}`,
              delta: res.inviteeReward!.tienNgoc,
              refId: trimmed,
              status: 'done',
            });
          });
          notify.epic('✦ Cảm tạ tiền bối', res.message);
          trackEvent('referral_applied', { code: trimmed, source: 'remote' });
          return { ok: true, message: res.message };
        }
        if (!res.ok) return { ok: false, message: res.message };
      } catch (err) {
        console.info('[applyReferral] remote unavailable, fallback local:', err);
      }

      // Fallback client-side (trust)
      set((s) => {
        s.economy.referredBy = trimmed;
        s.economy.tienNgoc += 100;
        s.economy.actionTokens += 30;
        pushHistory(s.economy, {
          kind: 'referral',
          title: `Giới thiệu ${trimmed}`,
          delta: 100,
          refId: trimmed,
          status: 'done',
        });
      });
      notify.epic('✦ Cảm tạ tiền bối', `Mã "${trimmed}" — nhận 100 Tiền Ngọc + 30 Lượt!`);
      trackEvent('referral_applied', { code: trimmed, source: 'local' });
      return { ok: true, message: 'Áp dụng thành công. +100 TN, +30 Lượt.' };
    },

    mockBuyPack: (packId) => {
      const pack = CURRENCY_PACKS.find((p) => p.id === packId);
      if (!pack) return { ok: false, message: 'Pack không tồn tại.' };
      // Phase 17.3: Analytics — track intent + complete
      trackEvent('pack_purchase_intent', { packId, priceVnd: pack.priceVnd, amount: pack.amount });
      // V1: mock — tự cộng currency. V2: wire Stripe/MoMo + verify webhook.
      const total = pack.amount + pack.bonus;
      set((s) => {
        s.economy.tienNgoc += total;
        pushHistory(s.economy, {
          kind: 'mock',
          title: `[Mock] Pack ${pack.amount}+${pack.bonus} TN`,
          delta: total,
          amountVnd: pack.priceVnd,
          refId: packId,
          status: 'done',
        });
      });
      trackEvent('pack_purchase_complete', { packId, priceVnd: pack.priceVnd, total, mock: true });
      notify.epic(
        '✦ Mock Payment (Sắp triển khai)',
        `+${total} Tiền Ngọc (${pack.amount} + ${pack.bonus} bonus). Wire payment thực sau.`,
      );
      return {
        ok: true,
        message: `Mock thành công +${total} TN. Payment thực sẽ triển khai sau.`,
      };
    },

    // ─── Phase 18: MoMo Personal QR + deeplink + admin approve ───
    startMomoPayment: async (packId) => {
      try {
        const { createPaymentIntent } = await import('@services/payment-api');
        const deviceId = getOrCreateDeviceId();
        const res = await createPaymentIntent({ deviceId, packId });
        if (!res.ok || !res.intentId) {
          notify.warn('Thanh toán không khả dụng', res.message ?? 'Backend chưa sẵn sàng.');
          return { ok: false, message: res.message ?? 'Lỗi tạo intent.' };
        }
        trackEvent('pack_purchase_intent', { packId, amount: res.amount, intentId: res.intentId });
        set((s) => {
          s.economy.paymentIntent = {
            intentId: res.intentId!,
            packId,
            memo: res.memo ?? '',
            amount: res.amount ?? 0,
            momoDeeplink: res.momoDeeplink ?? '',
            qrPayload: res.qrPayload ?? '',
            expiresAt: res.expiresAt ?? Date.now() + 15 * 60 * 1000,
            status: 'pending',
          };
        });
        return { ok: true, message: 'Intent đã tạo, quét QR hoặc mở MoMo.' };
      } catch (err) {
        console.error('[startMomoPayment]', err);
        notify.warn('Lỗi mạng', 'Không kết nối được server thanh toán.');
        return { ok: false, message: 'Network error' };
      }
    },

    pollMomoPayment: async () => {
      const intent = get().economy.paymentIntent;
      if (!intent) return 'none';
      try {
        const { getPaymentStatus } = await import('@services/payment-api');
        const deviceId = getOrCreateDeviceId();
        const res = await getPaymentStatus({ intentId: intent.intentId, deviceId });
        if (!res.ok || !res.status) return 'pending';
        // Update status trong state
        set((s) => {
          if (s.economy.paymentIntent) s.economy.paymentIntent.status = res.status!;
        });
        // Credit reward khi approved
        if (res.status === 'approved' && res.reward) {
          set((s) => {
            s.economy.tienNgoc += res.reward!.tienNgoc ?? 0;
            s.economy.actionTokens += res.reward!.actionTokens ?? 0;
            // Apply perks (vd speed_boost)
            for (const perk of res.reward!.perks ?? []) {
              if (perk === 'speed_boost') s.economy.unlockedPerks.speedBoost = true;
            }
            // Phase 23.UX: log topup vào history
            pushHistory(s.economy, {
              kind: 'topup',
              title: `Nạp MoMo · pack ${intent.packId}`,
              delta: res.reward!.tienNgoc ?? 0,
              amountVnd: intent.amount,
              refId: intent.intentId,
              status: 'done',
            });
            s.economy.paymentIntent = null;  // Clear sau khi credit
          });
          trackEvent('pack_purchase_complete', {
            packId: intent.packId, amount: intent.amount,
            tienNgoc: res.reward.tienNgoc ?? 0, actionTokens: res.reward.actionTokens ?? 0,
          });
          notify.epic('✦ Nạp thành công', {
            message: `+${res.reward.tienNgoc ?? 0} Tiền Ngọc, +${res.reward.actionTokens ?? 0} lượt. Cảm tạ tiền bối!`,
            action: { target: 'monetization', label: 'Mở cửa hàng' },
          });
        } else if (res.status === 'expired' || res.status === 'rejected') {
          set((s) => { s.economy.paymentIntent = null; });
          notify.warn(
            res.status === 'expired' ? 'Hết hạn' : 'Bị từ chối',
            res.status === 'expired'
              ? 'Intent đã quá 15 phút. Vui lòng tạo lại.'
              : 'Admin đã từ chối giao dịch này. Liên hệ hỗ trợ nếu nhầm lẫn.',
          );
        }
        return res.status;
      } catch (err) {
        console.error('[pollMomoPayment]', err);
        return 'pending';
      }
    },

    cancelMomoPayment: () => {
      set((s) => { s.economy.paymentIntent = null; });
    },

    // ─── Phase 16.2: Item Upgrade (re-roll stats / bump rarity) ───
    rerollItemStats: (itemId) => {
      const item = get().inventory[itemId];
      const player = get().player;
      if (!item || !player) {
        notify.warn('Lỗi', 'Vật phẩm không tồn tại.');
        return false;
      }
      const RARITY_ORDER: Rarity[] = ['Thường', 'Tốt', 'Hiếm', 'Cực Phẩm', 'Siêu Phẩm', 'Huyền Thoại'];
      if (RARITY_ORDER.indexOf(item.rarity) < 2) {
        notify.warn('Không thể tinh luyện', 'Chỉ vật phẩm từ Hiếm trở lên.');
        return false;
      }
      if (!get().spendTienNgoc(50, `Tinh luyện: ${item.name}`)) return false;
      const difficulty = (get().settings as { difficulty?: string }).difficulty;
      const newBonuses =
        generateItemBonusesV2({
          rarity: item.rarity,
          category: item.category,
          playerLevel: player.level,
          difficulty,
        }) ?? generateItemBonuses(item.rarity, item.category, player.level);
      set((s) => {
        const it = s.inventory[itemId];
        if (it) it.bonuses = newBonuses;
        if (s.player) s.player = recomputeStats(s.player, s.inventory);
      });
      notify.epic('✦ Tinh luyện thành công', {
        message: `${item.name}: chỉ số mới đã được rèn lại.`,
        action: { target: 'inventory', label: 'Xem hành trang' },
      });
      return true;
    },

    // Phase 23.UX: Tẩy linh căn
    rerollSpiritualRoot: () => {
      const player = get().player;
      if (!player) return { ok: false, message: 'Chưa có nhân vật.' };
      const COST_TN = 500;
      if (!get().spendTienNgoc(COST_TN, 'Tẩy linh căn')) {
        return { ok: false, message: `Cần ${COST_TN} Tiên Ngọc.` };
      }
      const oldRoot = player.spiritualRoot;
      // Sync import — đã có import trong file
      const newRoot = rollSpiritualRoot();
      set((s) => {
        if (!s.player) return;
        s.player.spiritualRoot = newRoot;
        // Recompute multiplier vào maxExp / regen rate
        s.player = recomputeStats(s.player, s.inventory);
      });
      const oldMul = oldRoot?.cultivationMultiplier ?? 1;
      const newMul = newRoot.cultivationMultiplier;
      const delta = newMul - oldMul;
      const deltaStr = delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2);
      notify.epic('✦ Tẩy linh căn thành công', {
        message: `Hệ số tu luyện: ×${oldMul.toFixed(1)} → ×${newMul.toFixed(1)} (${deltaStr})`,
        action: { target: 'character-sheet', label: 'Xem Đạo Cơ' },
      });
      return {
        ok: true,
        message: `Linh căn mới! Hệ số tu luyện: ×${oldMul.toFixed(1)} → ×${newMul.toFixed(1)} (${deltaStr})`,
      };
    },

    // Phase 23.1: Rèn luyện item +N
    refineItem: (itemId) => {
      const item = get().inventory[itemId];
      const player = get().player;
      if (!item || !player) return { ok: false, message: 'Vật phẩm không tồn tại.' };
      if (!item.bonuses || Object.keys(item.bonuses).length === 0) {
        return { ok: false, message: 'Chỉ vật phẩm có chỉ số mới rèn được.' };
      }
      const curLv = item.refineLevel ?? 0;
      if (curLv >= 12) {
        return { ok: false, message: '✦ Đã đạt đỉnh +12 — không thể rèn thêm.' };
      }
      const cost = getRefineCost(curLv);
      if (player.currency < cost.linhThach) {
        return { ok: false, message: `Cần ${cost.linhThach.toLocaleString()} linh thạch, ngươi chỉ có ${player.currency.toLocaleString()}.` };
      }
      if (cost.tienNgoc && get().economy.tienNgoc < cost.tienNgoc) {
        return { ok: false, message: `Cần ${cost.tienNgoc} Tiền Ngọc (thiên hỏa), ngươi không đủ.` };
      }
      // Trừ cost
      set((s) => {
        if (s.player) s.player.currency -= cost.linhThach;
        if (cost.tienNgoc) s.economy.tienNgoc -= cost.tienNgoc;
      });
      const result = rollRefine(curLv);
      set((s) => {
        const it = s.inventory[itemId];
        if (it) it.refineLevel = result.newLevel;
        if (s.player) s.player = recomputeStats(s.player, s.inventory);
      });
      if (result.success) {
        notify.epic(`✦ Rèn thành công +${result.newLevel}`, {
          message: `${item.name} đột phá ${result.newLevel}/12. Chỉ số +${result.newLevel * 5}%.`,
          action: { target: 'inventory', label: 'Xem hành trang' },
        });
        return { ok: true, message: `Rèn thành công! ${item.name} → +${result.newLevel}` };
      }
      if (result.downgraded) {
        notify.warn(`⚠ Rèn thất bại — Hạ bậc`, {
          message: `${item.name} bị hạ xuống +${result.newLevel}.`,
        });
        return { ok: true, message: `Thất bại, bị hạ xuống +${result.newLevel}.` };
      }
      notify.warn('Rèn thất bại', `${item.name} giữ nguyên +${curLv}.`);
      return { ok: true, message: `Thất bại, giữ nguyên +${curLv}.` };
    },

    upgradeItemRarity: (itemId) => {
      const item = get().inventory[itemId];
      const player = get().player;
      if (!item || !player) {
        notify.warn('Lỗi', 'Vật phẩm không tồn tại.');
        return false;
      }
      const RARITY_ORDER: Rarity[] = ['Thường', 'Tốt', 'Hiếm', 'Cực Phẩm', 'Siêu Phẩm', 'Huyền Thoại'];
      const curIdx = RARITY_ORDER.indexOf(item.rarity);
      if (curIdx < 0 || curIdx >= RARITY_ORDER.length - 1) {
        notify.warn('Đã đỉnh cấp', 'Vật phẩm đã đạt Huyền Thoại — không thể nâng thêm.');
        return false;
      }
      if (!get().spendTienNgoc(200, `Thăng cấp: ${item.name}`)) return false;
      const newRarity = RARITY_ORDER[curIdx + 1]!;
      const difficulty = (get().settings as { difficulty?: string }).difficulty;
      const newBonuses =
        generateItemBonusesV2({
          rarity: newRarity,
          category: item.category,
          playerLevel: player.level,
          difficulty,
        }) ?? generateItemBonuses(newRarity, item.category, player.level);
      set((s) => {
        const it = s.inventory[itemId];
        if (it) {
          it.rarity = newRarity;
          it.bonuses = newBonuses;
        }
        if (s.player) s.player = recomputeStats(s.player, s.inventory);
      });
      notify.epic('✦ Thăng cấp thành công', {
        message: `${item.name}: ${item.rarity} → ${newRarity}!`,
        action: { target: 'inventory', label: 'Xem hành trang' },
      });
      return true;
    },

    // ─── Phase 16.3: Daily missions ───
    refreshDailyMissions: () => {
      const today = formatDay();
      const cur = get().dailyMissions;
      if (cur.lastResetDay === today) return; // đã reset hôm nay

      // Tính streak: nếu lastLoginDay là yesterday → streak++, else reset về 1
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yesterdayStr = formatDay(yesterday);
      const newStreak = cur.lastLoginDay === yesterdayStr ? cur.loginStreak + 1 : 1;

      // Roll 3 random missions
      const rolled = rollDailyMissions().map((t) => ({
        templateId: t.id,
        progress: 0,
        claimed: false,
      }));

      // Login reward (điểm danh)
      const loginReward = getDailyLoginReward(newStreak);

      set((s) => {
        s.dailyMissions.lastResetDay = today;
        s.dailyMissions.lastLoginDay = today;
        s.dailyMissions.loginStreak = newStreak;
        s.dailyMissions.todayMissions = rolled;
        s.economy.tienNgoc += loginReward.tienNgoc;
        s.economy.actionTokens += loginReward.actionTokens;
      });

      const streakBadge = newStreak >= 7 ? `🔥${newStreak} ngày liên tiếp` : `${newStreak} ngày`;
      notify.epic(`📅 Điểm Danh — ${streakBadge}`, {
        message: `+${loginReward.tienNgoc} Tiền Ngọc + ${loginReward.actionTokens} Lượt. Mở Nhiệm Vụ Hàng Ngày để xem 3 mission mới.`,
        action: { target: 'daily-missions', label: 'Xem nhiệm vụ' },
      });
      trackEvent('daily_login', { streak: newStreak, tienNgocReward: loginReward.tienNgoc });
    },

    incrementMissionProgress: (templateId, delta = 1) => {
      set((s) => {
        const mission = s.dailyMissions.todayMissions.find((m) => m.templateId === templateId);
        if (!mission || mission.claimed) return;
        const template = DAILY_MISSIONS_POOL.find((t) => t.id === templateId);
        if (!template) return;
        mission.progress = Math.min(template.target, mission.progress + delta);
        // Toast khi vừa complete
        if (mission.progress >= template.target && delta > 0) {
          // Gọi notify ngoài set (sau khi state đã update)
          setTimeout(() => {
            notify.success(`✓ Hoàn thành: ${template.title}`, {
              message: 'Mở Nhiệm Vụ Hàng Ngày để nhận thưởng.',
              action: { target: 'daily-missions', label: 'Nhận thưởng' },
            });
          }, 50);
        }
      });
    },

    // ─── Phase 19.5 + 20: Detect achievement vừa unlock → notify ───
    checkAchievementUnlocks: () => {
      const s = get();
      if (!s.player) return;
      // Phase 20: recount legendaryItemsOwned ngay (inventory mutate liên tục)
      const legendaryNow = Object.values(s.inventory).filter(
        (it) => (it as { rarity?: string }).rarity === 'Huyền Thoại',
      ).length;
      if (legendaryNow !== s.playerStats.legendaryItemsOwned) {
        set((d) => { d.playerStats.legendaryItemsOwned = legendaryNow; });
      }
      const progress = computeAchievementProgress({
        playerLevel: s.player.level,
        playerCurrency: s.player.currency,
        turn: s.turn,
        realmBreaks: s.knowledge.eventHistory.filter((e) => e.kind === 'realm_break').length,
        tribulations: s.knowledge.eventHistory.filter((e) => e.kind === 'tribulation').length,
        beastCount: Object.keys(s.spiritBeasts).length,
        questCompleted: Object.values(s.quests).filter((q) => q.status === 'completed').length,
        daoLuPartnered: Object.values(s.daoLu).filter((c) => c.isPartner).length,
        sectJoined: !!s.sectMembership,
        locationVisited: Object.values(s.knowledge.locations).filter((l) => l.visitedByPlayer).length,
        totalKills: s.playerStats.totalKills,
        totalEpEarned: s.playerStats.totalEpEarned,
        legendaryItemsOwned: legendaryNow,
      });
      const newly = detectNewlyUnlocked(progress, s.economy.unlockedAchievements);
      if (newly.length === 0) return;

      set((draft) => {
        for (const a of newly) {
          draft.economy.unlockedAchievements.push(a.id);
          // Auto-grant reward (currency + ep) như achievements thiết kế
          if (a.reward.currency && draft.player) draft.player.currency += a.reward.currency;
          if (a.reward.ep) draft.ep = (draft.ep ?? 0) + a.reward.ep;
        }
      });
      // Notify ngoài set
      for (const a of newly) {
        const tierIcon = a.tier === 'legendary' ? '☆' : a.tier === 'gold' ? '★' : a.tier === 'silver' ? '✦' : '◆';
        notify.epic(`${tierIcon} Thành Tựu: ${a.title}`, {
          message: `${a.description}${a.reward.currency ? ` · +${a.reward.currency} Linh Thạch` : ''}${a.reward.ep ? ` · +${a.reward.ep} EP` : ''}`,
          action: { target: 'achievements', label: 'Xem thành tựu' },
        });
      }
    },

    // ─── Phase 17.1: Extended/Hidden quests ───
    refreshExtendedQuests: () => {
      const state = get();
      set((s) => {
        for (const tpl of EXTENDED_QUESTS) {
          if (!s.extendedQuests.progress[tpl.id]) {
            s.extendedQuests.progress[tpl.id] = makeProgress();
          }
          const p = s.extendedQuests.progress[tpl.id]!;
          if (p.completed) continue;

          // Check unlock — visible quest (not hidden) auto-unlock luôn
          if (!p.unlocked) {
            const visible = !tpl.hidden || (tpl.unlockCondition && tpl.unlockCondition(state));
            if (visible) {
              p.unlocked = true;
              p.unlockedAtTurn = state.turn;
              setTimeout(() => {
                notify.epic(`✦ Mở khóa chuỗi: ${tpl.title}`, {
                  message: tpl.description.slice(0, 100),
                  action: { target: 'extended-quests', label: 'Xem chuỗi' },
                });
                trackEvent('quest_started', { questId: tpl.id, hidden: tpl.hidden });
              }, 100);
            }
          }
          if (!p.unlocked) continue;

          // Check current step completion
          while (p.currentStep < tpl.steps.length) {
            const step = tpl.steps[p.currentStep]!;
            if (step.check(state)) {
              // Auto-advance to next step (reward sẽ claim manual)
              p.currentStep += 1;
            } else {
              break;
            }
          }

          // Final completion check
          if (p.currentStep >= tpl.steps.length && !p.completed) {
            p.completed = true;
            p.completedAtTurn = state.turn;
            setTimeout(() => {
              notify.epic(`✦ Hoàn thành chuỗi: ${tpl.title}`, {
                message: 'Vào Chuỗi Nhiệm Vụ để nhận đại thưởng!',
                action: { target: 'extended-quests', label: 'Nhận đại thưởng' },
              });
              trackEvent('quest_completed', { questId: tpl.id });
            }, 100);
          }
        }
      });
    },

    claimQuestStep: (templateId, stepIdx) => {
      const tpl = getExtendedQuestById(templateId);
      const p = get().extendedQuests.progress[templateId];
      if (!tpl || !p) return false;
      if (p.claimedSteps.includes(stepIdx)) {
        notify.info('Đã nhận', 'Phần thưởng bước này đã được nhận.');
        return false;
      }
      if (stepIdx >= p.currentStep) {
        notify.warn('Chưa hoàn thành', 'Bước này chưa hoàn thành.');
        return false;
      }
      const step = tpl.steps[stepIdx];
      if (!step) return false;
      const r = step.reward;
      set((s) => {
        s.extendedQuests.progress[templateId]!.claimedSteps.push(stepIdx);
        if (r.tienNgoc) s.economy.tienNgoc += r.tienNgoc;
        if (r.actionTokens) s.economy.actionTokens += r.actionTokens;
        if (r.currency && s.player) s.player.currency += r.currency;
      });
      // EXP qua applyGameEvents để trigger level up
      if (r.exp) {
        applyGameEvents([{ type: 'EXP_GAIN', amount: r.exp }], get, set);
      }
      const parts: string[] = [];
      if (r.tienNgoc) parts.push(`+${r.tienNgoc} 💎`);
      if (r.actionTokens) parts.push(`+${r.actionTokens} ⚡`);
      if (r.exp) parts.push(`+${r.exp} EXP`);
      if (r.currency) parts.push(`+${r.currency} 🪙`);
      notify.epic(`✦ Bước ${stepIdx + 1}: ${step.title}`, parts.join(', '));
      return true;
    },

    claimQuestFinal: (templateId) => {
      const tpl = getExtendedQuestById(templateId);
      const p = get().extendedQuests.progress[templateId];
      if (!tpl || !p) return false;
      if (!p.completed) {
        notify.warn('Chưa hoàn thành', 'Cần hoàn thành toàn bộ các bước.');
        return false;
      }
      if (p.claimedFinal) {
        notify.info('Đã nhận', 'Đại thưởng đã được nhận.');
        return false;
      }
      const r = tpl.finalReward;
      set((s) => {
        s.extendedQuests.progress[templateId]!.claimedFinal = true;
        if (r.tienNgoc) s.economy.tienNgoc += r.tienNgoc;
        if (r.actionTokens) s.economy.actionTokens += r.actionTokens;
        if (r.currency && s.player) s.player.currency += r.currency;
      });
      if (r.exp) {
        applyGameEvents([{ type: 'EXP_GAIN', amount: r.exp }], get, set);
      }
      // Item reward: spawn pháp bảo qua ITEM event
      // Phase 23.UX: heuristic chọn category theo tên — "Pháp bảo" không hợp lệ trong
      // ItemCategory enum nên item không trang bị / dưỡng được. Map sang category hợp lệ.
      if (r.itemName && r.itemRarity) {
        const category = inferItemCategoryFromName(r.itemName);
        applyGameEvents(
          [{
            type: 'ITEM_GAINED',
            name: r.itemName,
            rarity: r.itemRarity,
            category,
          } as GameEvent],
          get, set,
        );
      }
      const parts: string[] = [];
      if (r.tienNgoc) parts.push(`+${r.tienNgoc} 💎`);
      if (r.itemName) parts.push(`+ ${r.itemName} [${r.itemRarity}]`);
      notify.epic(`✦✦✦ Đại Thưởng: ${tpl.title}`, parts.join(', '));
      return true;
    },

    claimDailyMission: (templateId) => {
      const mission = get().dailyMissions.todayMissions.find((m) => m.templateId === templateId);
      const template = DAILY_MISSIONS_POOL.find((t) => t.id === templateId);
      if (!mission || !template) return false;
      if (mission.claimed) {
        notify.info('Đã nhận', 'Nhiệm vụ này đã được nhận thưởng.');
        return false;
      }
      if (mission.progress < template.target) {
        notify.warn('Chưa hoàn thành', `${mission.progress}/${template.target}`);
        return false;
      }
      set((s) => {
        const m = s.dailyMissions.todayMissions.find((mm) => mm.templateId === templateId);
        if (m) m.claimed = true;
        s.dailyMissions.totalCompleted += 1;
        if (template.reward.tienNgoc) s.economy.tienNgoc += template.reward.tienNgoc;
        if (template.reward.actionTokens) s.economy.actionTokens += template.reward.actionTokens;
      });
      const parts: string[] = [];
      if (template.reward.tienNgoc) parts.push(`+${template.reward.tienNgoc} 💎`);
      if (template.reward.actionTokens) parts.push(`+${template.reward.actionTokens} ⚡`);
      notify.epic('✦ Nhận thưởng', `${template.title}: ${parts.join(', ')}`);
      trackEvent('mission_claimed', { templateId, category: template.category });
      return true;
    },

    nourishArtifactAction: (itemId, currencyAmount) => {
      const item = get().inventory[itemId];
      const player = get().player;
      if (!item || !player) return;
      if (!isArtifactEligible(item)) {
        notify.warn('Không phải pháp bảo', 'Chỉ vũ khí/phụ kiện/dị vật Cực Phẩm trở lên mới dưỡng được');
        return;
      }
      if (player.currency < currencyAmount) {
        notify.warn('Không đủ linh thạch', `Cần ${currencyAmount.toLocaleString()} linh thạch`);
        return;
      }
      const result = nourishArtifact(item, currencyAmount);
      set((s) => {
        if (!s.player) return;
        s.player.currency -= currencyAmount;
        s.inventory[itemId] = result.item;
        // Nếu đang equip → recompute
        if (Object.values(s.player.equippedItems).includes(itemId)) {
          s.player = recomputeStats(s.player, s.inventory);
        }
      });
      if (result.leveledUp && result.newLevel) {
        const gradeName = ARTIFACT_GRADE_NAMES[result.newLevel - 1] ?? 'Phàm Khí';
        notify.epic(`${item.name} thăng cấp!`, `→ ${gradeName} · Bonus stats tăng mạnh`);
      } else {
        notify.success(`Dưỡng ${item.name}`, `+${Math.ceil(currencyAmount * 0.5)} pháp bảo tinh hồn`);
      }
    },

    // ─── Phase 23.4: Pháp Tắc refresh ───
    refreshPhapTacUnlocks: () => {
      const player = get().player;
      if (!player) return 0;
      const canonId = get().settings.canonPackId;
      const eligible = getAvailablePhapTac(player.level ?? 1, canonId);
      const already = new Set(get().cultivation.laws.unlocked);
      const newOnes = eligible.filter((p) => !already.has(p.id));
      if (newOnes.length === 0) return 0;
      set((s) => {
        for (const p of newOnes) s.cultivation.laws.unlocked.push(p.id);
      });
      for (const p of newOnes) {
        notify.epic(`✦ Ngộ pháp tắc: ${p.name}`, {
          message: p.description,
          action: { target: 'cultivation', label: 'Đạo Tâm' },
        });
      }
      return newOnes.length;
    },

    togglePhapTacActive: (id) => {
      const def = getPhapTacById(id);
      if (!def) return { ok: false, message: 'Pháp tắc không tồn tại' };
      const cur = get().cultivation.laws;
      if (!cur.unlocked.includes(id)) {
        return { ok: false, message: 'Chưa ngộ pháp tắc này' };
      }
      const isActive = cur.active.includes(id);
      if (!isActive && cur.active.length >= 3) {
        return { ok: false, message: 'Tối đa 3 pháp tắc cùng lúc' };
      }
      set((s) => {
        if (isActive) {
          s.cultivation.laws.active = s.cultivation.laws.active.filter((x) => x !== id);
        } else {
          s.cultivation.laws.active.push(id);
        }
      });
      notify.success(`${isActive ? 'Tắt' : 'Kích hoạt'} ${def.name}`, def.passive.description);
      return { ok: true };
    },

    // ─── Phase 23.5: Đại Đạo ───
    unlockDaiDao: (name, description, element) => {
      const turn = get().turn ?? 0;
      const r = unlockDao(get().cultivation.dao, name, description, turn, element);
      if (!r.created) return false;
      set((s) => { s.cultivation.dao = r.state; });
      notify.epic(`✦ Ngộ Đạo: ${name}`, {
        message: description,
        action: { target: 'cultivation', label: 'Đạo Tâm' },
      });
      return true;
    },

    toggleDaiDaoFocus: (daoKey) => {
      const cur = get().cultivation.dao;
      if (!cur.paths[daoKey]) return { ok: false, message: 'Đạo chưa unlock' };
      const isFocused = cur.focused.includes(daoKey);
      if (!isFocused && cur.focused.length >= MAX_FOCUSED_DAO) {
        return { ok: false, message: `Tối đa ${MAX_FOCUSED_DAO} đạo focus` };
      }
      set((s) => {
        if (isFocused) {
          s.cultivation.dao.focused = s.cultivation.dao.focused.filter((x) => x !== daoKey);
        } else {
          s.cultivation.dao.focused.push(daoKey);
        }
      });
      return { ok: true };
    },

    // ─── Phase 23.6: Ngộ Đạo action ───
    ngoDaoAction: async () => {
      const player = get().player;
      if (!player) return { ok: false };

      // Cost: 50 linh thạch
      if (player.currency < 50) {
        notify.warn('Không đủ linh thạch', 'Cần 50 linh thạch để tĩnh tâm ngộ đạo');
        return { ok: false };
      }

      const turn = get().turn ?? 0;
      const curDao = get().cultivation.dao;
      const focused = curDao.focused;

      // Roll: 60% xp boost cho đạo focused, 25% xp boost cho random unlocked đạo,
      // 10% pure insight (EP only), 5% unlock đạo mới từ default pool
      const roll = Math.random();
      set((s) => { if (s.player) s.player.currency -= 50; });

      let insightText = '';
      let rewardLabel = '';

      if (roll < 0.6 && focused.length > 0) {
        // Boost focused dao
        const target = focused[Math.floor(Math.random() * focused.length)]!;
        const entry = curDao.paths[target];
        const xpGain = 30 + Math.floor(Math.random() * 50);
        const r = addDaoXp(curDao, entry!.name, xpGain);
        set((s) => { s.cultivation.dao = r.state; });
        insightText = `Tĩnh tâm thiền định, cảm ngộ sâu hơn về ${entry!.name}.`;
        rewardLabel = `+${xpGain} XP ${entry!.name}`;
        if (r.leveledUp) {
          notify.epic(`✦ ${entry!.name} → Cấp ${r.newLevel}`, {
            message: `Damage element +${((getDaoMul(r.newLevel) - 1) * 100).toFixed(0)}%`,
            action: { target: 'cultivation', label: 'Đạo Tâm' },
          });
        }
      } else if (roll < 0.85 && Object.keys(curDao.paths).length > 0) {
        // Boost random unlocked dao
        const keys = Object.keys(curDao.paths);
        const target = keys[Math.floor(Math.random() * keys.length)]!;
        const entry = curDao.paths[target]!;
        const xpGain = 15 + Math.floor(Math.random() * 25);
        const r = addDaoXp(curDao, entry.name, xpGain);
        set((s) => { s.cultivation.dao = r.state; });
        insightText = `Cảm ngộ thoáng qua về ${entry.name}.`;
        rewardLabel = `+${xpGain} XP ${entry.name}`;
      } else if (roll < 0.95) {
        // Pure insight: +EP
        const epGain = 5 + Math.floor(Math.random() * 10);
        set((s) => { s.ep = (s.ep ?? 0) + epGain; });
        insightText = 'Đạo tâm thông suốt, EP tăng nhẹ.';
        rewardLabel = `+${epGain} EP`;
      } else {
        // 5%: unlock đạo mới từ default pool (nếu chưa có)
        const { DEFAULT_DAO_POOL } = await import('@core/cultivation/dai-dao');
        const unowned = DEFAULT_DAO_POOL.filter((d) => !curDao.paths[d.name.toLowerCase().replace(/\s+/g, '_').replace(/đ/g, 'd')]);
        if (unowned.length > 0) {
          const pick = unowned[Math.floor(Math.random() * unowned.length)]!;
          get().unlockDaiDao(pick.name, pick.description, pick.element);
          insightText = `Đại ngộ! Cảm ngộ được ${pick.name}!`;
          rewardLabel = `Unlock ${pick.name}`;
        } else {
          insightText = 'Tĩnh tâm thiền định, không có ngộ tính.';
          rewardLabel = '+0';
        }
      }

      set((s) => {
        s.cultivation.recentInsights.unshift({ turn, text: insightText });
        if (s.cultivation.recentInsights.length > 20) {
          s.cultivation.recentInsights = s.cultivation.recentInsights.slice(0, 20);
        }
      });
      notify.success('Ngộ Đạo', `${insightText} (${rewardLabel})`);
      return { ok: true, insight: insightText, reward: rewardLabel };
    },

    // ─── Phase 24.A: Skill Deep — Talent ───
    chooseTalent: (skillId, tier, branch) => {
      const mastery = get().skillMastery[skillId];
      const masteryLv = mastery?.level ?? 1;
      if (masteryLv < tier) {
        return { ok: false, message: `Cần mastery cấp ${tier} (hiện ${masteryLv}).` };
      }
      const node = TALENT_NODES[tier][branch];
      const cur = get().skillDeep.talents[skillId] ?? INITIAL_TALENT_STATE;
      if (cur[`t${tier}` as 't3' | 't4' | 't5']) {
        return { ok: false, message: 'Tier này đã chọn rồi. Cần Reset để chọn lại.' };
      }
      set((s) => {
        if (!s.skillDeep.talents[skillId]) {
          s.skillDeep.talents[skillId] = { ...INITIAL_TALENT_STATE };
        }
        s.skillDeep.talents[skillId]![`t${tier}` as 't3' | 't4' | 't5'] = branch;
      });
      notify.epic(`✦ Talent: ${node.name}`, {
        message: node.description,
        action: { target: 'skills', label: 'Xem pháp thuật' },
      });
      return { ok: true, message: `Đã chọn ${node.name}` };
    },

    resetTalents: (skillId) => {
      const cur = get().skillDeep.talents[skillId];
      if (!cur || (!cur.t3 && !cur.t4 && !cur.t5)) {
        return { ok: false, message: 'Skill này chưa có talent nào để reset.' };
      }
      const cost = getTalentResetCost(cur.resetCount);
      if (!get().spendTienNgoc(cost, `Reset talent skill ${skillId}`)) {
        return { ok: false, message: `Cần ${cost} Tiên Ngọc.` };
      }
      set((s) => {
        s.skillDeep.talents[skillId] = {
          t3: null, t4: null, t5: null,
          resetCount: cur.resetCount + 1,
        };
      });
      notify.success('Reset talent', `Đã reset, có thể chọn lại 3 tier. Lần reset kế: ${getTalentResetCost(cur.resetCount + 1)} TN.`);
      return { ok: true, message: 'Reset thành công' };
    },

    // ─── Phase 24.A: Rune ───
    craftRune: (runeDefId) => {
      const def = getRuneById(runeDefId);
      if (!def) return { ok: false, message: 'Rune không tồn tại.' };
      const player = get().player;
      if (!player) return { ok: false, message: 'Chưa có nhân vật.' };
      // Check linh thạch
      if (player.currency < def.craftCost.linhThach) {
        return { ok: false, message: `Cần ${def.craftCost.linhThach.toLocaleString()} linh thạch (có ${player.currency.toLocaleString()}).` };
      }
      // Check Tiên Ngọc nếu tier >= 4
      if (def.craftCost.tienNgoc && get().economy.tienNgoc < def.craftCost.tienNgoc) {
        return { ok: false, message: `Cần ${def.craftCost.tienNgoc} Tiên Ngọc.` };
      }
      // Check materials trong inventory
      if (def.craftCost.materials) {
        for (const m of def.craftCost.materials) {
          const owned = Object.values(get().inventory)
            .filter((it) => it.name === m.name)
            .reduce((sum, it) => sum + (it.quantity ?? 1), 0);
          if (owned < m.count) {
            return { ok: false, message: `Thiếu nguyên liệu: ${m.name} ×${m.count} (có ${owned}).` };
          }
        }
      }
      // Spend
      set((s) => {
        if (!s.player) return;
        s.player.currency -= def.craftCost.linhThach;
        if (def.craftCost.tienNgoc) s.economy.tienNgoc -= def.craftCost.tienNgoc;
        // Consume materials
        if (def.craftCost.materials) {
          for (const m of def.craftCost.materials) {
            let remaining = m.count;
            for (const id of Object.keys(s.inventory)) {
              if (remaining <= 0) break;
              const it = s.inventory[id];
              if (it && it.name === m.name) {
                const q = it.quantity ?? 1;
                if (q <= remaining) {
                  remaining -= q;
                  delete s.inventory[id];
                  if (s.player) s.player.inventory = s.player.inventory.filter((x) => x !== id);
                } else {
                  it.quantity = q - remaining;
                  remaining = 0;
                }
              }
            }
          }
        }
        // Add rune to inventory
        const cur = s.skillDeep.runeInventory[runeDefId];
        if (cur) cur.quantity += 1;
        else s.skillDeep.runeInventory[runeDefId] = { defId: runeDefId, quantity: 1 };
      });
      notify.epic(`✦ Luyện rune: ${def.name}`, {
        message: def.description,
        action: { target: 'skills', label: 'Xem pháp thuật' },
      });
      return { ok: true, message: `Đã luyện ${def.name}` };
    },

    attachRune: (skillId, slotIdx, runeDefId) => {
      const inv = get().skillDeep.runeInventory[runeDefId];
      if (!inv || inv.quantity < 1) {
        return { ok: false, message: 'Không có rune này trong kho.' };
      }
      if (slotIdx < 0 || slotIdx >= MAX_RUNE_SLOTS_PER_SKILL) {
        return { ok: false, message: 'Slot không hợp lệ.' };
      }
      set((s) => {
        const cur = s.skillDeep.runeSlots[skillId] ?? [null, null, null] as SkillRuneSlots;
        const old = cur[slotIdx];
        // Trả rune cũ về inventory
        if (old) {
          const oldInv = s.skillDeep.runeInventory[old];
          if (oldInv) oldInv.quantity += 1;
          else s.skillDeep.runeInventory[old] = { defId: old, quantity: 1 };
        }
        // Lấy rune mới khỏi inventory
        const newInv = s.skillDeep.runeInventory[runeDefId];
        if (newInv) newInv.quantity -= 1;
        // Gắn
        const updated: SkillRuneSlots = [...cur] as SkillRuneSlots;
        updated[slotIdx] = runeDefId;
        s.skillDeep.runeSlots[skillId] = updated;
      });
      const def = getRuneById(runeDefId);
      notify.success(`Gắn rune ${def?.name ?? runeDefId}`, `Slot ${slotIdx + 1}`);
      return { ok: true, message: 'Đã gắn' };
    },

    detachRune: (skillId, slotIdx) => {
      const slots = get().skillDeep.runeSlots[skillId];
      if (!slots) return { ok: false, message: 'Skill này chưa có rune.' };
      const id = slots[slotIdx];
      if (!id) return { ok: false, message: 'Slot này trống.' };
      set((s) => {
        const cur = s.skillDeep.runeSlots[skillId];
        if (!cur) return;
        const updated: SkillRuneSlots = [...cur] as SkillRuneSlots;
        updated[slotIdx] = null;
        s.skillDeep.runeSlots[skillId] = updated;
        const inv = s.skillDeep.runeInventory[id];
        if (inv) inv.quantity += 1;
        else s.skillDeep.runeInventory[id] = { defId: id, quantity: 1 };
      });
      const def = getRuneById(id);
      notify.info(`Gỡ rune ${def?.name ?? id}`, '');
      return { ok: true, message: 'Đã gỡ' };
    },

    allocatePoint: (stat, amount) => {
      set((s) => {
        if (!s.player) return;
        if (s.player.ap < amount) return;
        s.player.allocatedPoints[stat] += amount;
        s.player.ap -= amount;
        s.player = recomputeStats(s.player, s.inventory);
      });
      notify.success('Phân phối điểm', `+${amount} ${stat.toUpperCase()}`);
      get().saveToLocalStorage();
    },

    travelTo: async (locationId) => {
      const state = get();
      if (!state.player) return;
      const from = state.player.current_location_id;
      if (from === locationId) {
        notify.info('Đang ở địa điểm đó rồi', '');
        return;
      }
      if (from && !areNeighbors(from, locationId)) {
        notify.warn('Không thể tới thẳng', 'Hai địa điểm không kề nhau');
        return;
      }
      const target = getLocation(locationId);
      if (!target) return;

      const cost = target.travelCost ?? 4;

      set((s) => {
        if (!s.player) return;
        s.player.current_location_id = locationId;
        // Mark visited + discovered
        const loc = s.knowledge.locations[locationId];
        if (loc) {
          loc.visitedByPlayer = true;
          loc.discoveredByPlayer = true;
          // Discover neighbors
          for (const nid of loc.neighbors) {
            const n = s.knowledge.locations[nid];
            if (n) n.discoveredByPlayer = true;
          }
        }
        // System message vào story log
        s.storyLog.push({
          id: crypto.randomUUID(),
          turn: s.turn,
          timestamp: Date.now(),
          kind: 'system',
          content: `Sau ${cost} giờ hành trình, ngươi đến: ${target.name}.`,
        });
        s.isAiThinking = true;
      });

      notify.info(`Tới ${target.name}`, `${cost} giờ trôi qua`);

      // Random encounter dựa vào level range
      const playerLevel = state.player.level;
      const inRange = target.levelRange ? playerLevel >= target.levelRange[0] - 2 : true;
      const dangerChance = target.type === 'wilderness' ? 0.6 : target.type === 'secret_realm' ? 0.85 : target.type === 'ruins' ? 0.4 : 0.15;
      const willEncounter = inRange && Math.random() < dangerChance;

      try {
        // Gọi AI sinh narrative cho location mới
        const parsed = await generateNarrative({
          settings: get().settings,
          player: get().player!,
          ...(get().player!.realm ? { realm: get().player!.realm! } : {}),
          recentHistory: [
            `Vừa di chuyển từ ${from ? getLocation(from)?.name ?? from : 'nơi cũ'} đến ${target.name}.`,
            `${target.name} là ${target.type}. ${target.description}`,
            willEncounter ? `Có dấu hiệu nguy hiểm trong khu vực.` : `Khu vực bình yên.`,
          ],
          lastAction: `Di chuyển đến ${target.name}`,
        });

        set((s) => {
          s.storyLog.push({
            id: crypto.randomUUID(),
            turn: s.turn,
            timestamp: Date.now(),
            kind: 'narrative',
            segments: parsed.segments,
          });
          s.currentActions = parsed.actions;
          s.currentActionChoices = parsed.actionChoices;
          s.isAiThinking = false;
          s.aiPhase = 'idle';
          s.prevStage = s.stage;
          s.stage = 'playing';
        });

        applyGameEvents(parseGameTags(parsed.raw), get, set);
        get().saveToLocalStorage();
      } catch (err) {
        set((s) => {
          s.isAiThinking = false;
          s.aiPhase = 'idle';
          s.lastError = err instanceof Error ? err.message : String(err);
        });
      }
    },

    joinSect: (sectId) => {
      const sect = getSect(sectId);
      const player = get().player;
      if (!sect || !player) return false;

      // Đang ở sect khác → phải leave trước
      if (get().sectMembership && get().sectMembership!.sectId !== sectId) {
        notify.warn('Đã thuộc tông môn khác', 'Phải phản môn trước khi gia nhập tông môn mới');
        return false;
      }

      // Check requirements
      const req = sect.joinRequirements;
      if (req.levelMin && player.level < req.levelMin) {
        notify.warn('Cấp độ chưa đủ', `Cần đạt cấp ${req.levelMin} để gia nhập`);
        return false;
      }
      if (req.elementsRequired && player.spiritualRoot) {
        const has = player.spiritualRoot.elements.some((e) => req.elementsRequired!.includes(e));
        if (!has) {
          notify.warn('Linh căn không phù hợp', `${sect.name} chỉ nhận tu sĩ có linh căn: ${req.elementsRequired.join(', ')}`);
          return false;
        }
      }
      if (req.bannedElements && player.spiritualRoot) {
        const banned = player.spiritualRoot.elements.some((e) => req.bannedElements!.includes(e));
        if (banned) {
          notify.warn('Linh căn bị cấm', `${sect.name} không nhận tu sĩ có linh căn: ${req.bannedElements.join(', ')}`);
          return false;
        }
      }
      if (req.minSpiritualRootMultiplier && player.spiritualRoot) {
        if (player.spiritualRoot.cultivationMultiplier < req.minSpiritualRootMultiplier) {
          notify.warn('Ngộ tính không đủ', `Cần linh căn ×${req.minSpiritualRootMultiplier} trở lên`);
          return false;
        }
      }

      set((s) => {
        s.sectMembership = {
          sectId,
          rank: 'ngoai_mon',
          contribution: 0,
          joinedAtTurn: s.turn,
          missionsCompleted: 0,
        };
      });
      notify.epic(`Gia nhập ${sect.name}`, 'Đệ tử ngoại môn — bắt đầu con đường tu luyện chính quy');
      return true;
    },

    leaveSect: () => {
      const m = get().sectMembership;
      if (!m) return;
      const sect = getSect(m.sectId);
      set((s) => {
        if (s.sectMembership) s.sectMembership.defected = true;
        s.sectMembership = null;
      });
      notify.warn(`Phản môn ${sect?.name ?? ''}`, 'Bị truy sát! Danh vọng -1000');
    },

    addContribution: (amount) => {
      const m = get().sectMembership;
      if (!m) return;
      set((s) => {
        if (!s.sectMembership) return;
        s.sectMembership.contribution += amount;

        // Check auto rank up
        const currentRankIdx = SECT_RANK_ORDER.indexOf(s.sectMembership.rank);
        const nextRank = SECT_RANK_ORDER[currentRankIdx + 1];
        if (nextRank && s.player) {
          const req = SECT_RANK_REQUIREMENT[nextRank];
          if (s.sectMembership.contribution >= req.contribution && s.player.level >= req.levelMin) {
            s.sectMembership.rank = nextRank;
          }
        }
      });
      notify.success(`+${amount} Cống Hiến`, {
        action: { target: 'sect-hall', label: 'Xem Tông Môn' },
      });

      // Notify rank up tách riêng sau set vì cần check thay đổi
      const after = get().sectMembership;
      if (after && after.rank !== m.rank) {
        notify.epic(`Thăng cấp: ${SECT_RANK_DISPLAY[after.rank]}`, 'Tông môn công nhận tài năng của ngươi');
      }
    },

    claimSectMission: (missionId) => {
      const mission = SECT_MISSION_POOL.find((m) => m.id === missionId);
      const m = get().sectMembership;
      const player = get().player;
      if (!mission || !m || !player) return;
      if (mission.sectId !== m.sectId) {
        notify.warn('Sai tông môn', 'Nhiệm vụ này không thuộc tông môn của ngươi');
        return;
      }
      if (mission.minRank) {
        const required = SECT_RANK_ORDER.indexOf(mission.minRank);
        const current = SECT_RANK_ORDER.indexOf(m.rank);
        if (current < required) {
          notify.warn('Chưa đủ rank', `Cần ${SECT_RANK_DISPLAY[mission.minRank]} trở lên`);
          return;
        }
      }
      // Daily reset check (mỗi 24 turn ~ 1 ngày game)
      const claimedAt = get().claimedMissions[missionId];
      if (claimedAt !== undefined) {
        const turnsAgo = get().turn - claimedAt;
        const cooldown = mission.resetType === 'daily' ? 24 : mission.resetType === 'weekly' ? 168 : Infinity;
        if (turnsAgo < cooldown) {
          notify.info('Đã làm hôm nay', `Còn ${cooldown - turnsAgo} lượt để reset`);
          return;
        }
      }

      // Apply rewards
      const events: import('@ai/tag-parser').GameEvent[] = [];
      if (mission.currencyReward > 0) events.push({ type: 'CURRENCY_DELTA', amount: mission.currencyReward });
      if (mission.itemRewardName && mission.itemRewardRarity && mission.itemRewardCategory) {
        events.push({
          type: 'ITEM_GAINED',
          name: mission.itemRewardName,
          rarity: mission.itemRewardRarity,
          category: mission.itemRewardCategory,
        });
      }
      applyGameEvents(events, get, set);

      set((s) => {
        if (s.sectMembership) {
          s.sectMembership.missionsCompleted += 1;
        }
        s.claimedMissions[missionId] = s.turn;
      });

      // Add contribution (separate to trigger rank check)
      get().addContribution(mission.contributionReward);

      notify.success(`Hoàn thành: ${mission.title}`, `+${mission.contributionReward} cống hiến`);
    },

    enterSecretRealm: (level, name) => {
      const player = get().player;
      if (!player) return;
      const sr = generateSecretRealm({
        level: level ?? Math.max(1, player.level),
        ...(name !== undefined ? { name } : {}),
      });
      sr.createdAtTurn = get().turn;
      set((s) => {
        s.secretRealm = sr;
        s.prevStage = s.stage;
        s.stage = 'secret_realm';
      });
      notify.epic(`Bước vào: ${sr.name}`, `Cấp gợi ý ${sr.level} · ${Object.keys(sr.rooms).length} phòng`);
    },

    moveToRoom: (roomId) => {
      const sr = get().secretRealm;
      if (!sr) return;
      const current = sr.rooms[sr.currentRoomId];
      if (!current?.neighbors.includes(roomId)) {
        notify.warn('Không kề bên', 'Phải đi qua phòng trung gian');
        return;
      }
      set((s) => {
        if (!s.secretRealm) return;
        s.secretRealm.currentRoomId = roomId;
        const r = s.secretRealm.rooms[roomId];
        if (r) r.visited = true;
        s.turn += 1; // mỗi move = 1 turn
      });
    },

    interactCurrentRoom: () => {
      const sr = get().secretRealm;
      const player = get().player;
      if (!sr || !player) return;
      const room = sr.rooms[sr.currentRoomId];
      if (!room || room.cleared) return;

      switch (room.kind) {
        case 'combat':
        case 'boss': {
          if (room.payload?.enemyName && room.payload.enemyLevel) {
            // Mark room as combat-pending; combat win sẽ mark cleared
            get().startCombat(room.payload.enemyName, room.payload.enemyLevel);
            // Mark cleared lạc quan — nếu fail combat thì cũng OK (player respawn ngoài)
            set((s) => {
              if (s.secretRealm) {
                const r = s.secretRealm.rooms[sr.currentRoomId];
                if (r) r.cleared = true;
              }
            });
          }
          break;
        }
        case 'treasure': {
          const events: import('@ai/tag-parser').GameEvent[] = [];
          if (room.payload?.lootItems) {
            for (const item of room.payload.lootItems) {
              events.push({ type: 'ITEM_GAINED', name: item.name, rarity: item.rarity, category: item.category });
            }
          }
          if (room.payload?.currencyReward) {
            events.push({ type: 'CURRENCY_DELTA', amount: room.payload.currencyReward });
          }
          applyGameEvents(events, get, set);
          set((s) => {
            if (s.secretRealm) {
              const r = s.secretRealm.rooms[sr.currentRoomId];
              if (r) r.cleared = true;
            }
          });
          break;
        }
        case 'trap': {
          if (room.payload?.trapHpLoss) {
            applyGameEvents([{ type: 'HP_DELTA', amount: -room.payload.trapHpLoss }], get, set);
          }
          set((s) => {
            if (s.secretRealm) {
              const r = s.secretRealm.rooms[sr.currentRoomId];
              if (r) r.cleared = true;
            }
          });
          break;
        }
        case 'shrine': {
          const events: import('@ai/tag-parser').GameEvent[] = [];
          if (room.payload?.shrineBuff) {
            events.push({ type: 'STAT_BUFF', stat: room.payload.shrineBuff.stat, amount: room.payload.shrineBuff.amount });
          }
          if (room.payload?.expReward) {
            events.push({ type: 'EXP_GAIN', amount: room.payload.expReward });
          }
          applyGameEvents(events, get, set);
          set((s) => {
            if (s.secretRealm) {
              const r = s.secretRealm.rooms[sr.currentRoomId];
              if (r) r.cleared = true;
            }
          });
          break;
        }
        case 'puzzle': {
          // V1: auto solve, sau này có thể mini-game
          const events: import('@ai/tag-parser').GameEvent[] = [];
          if (room.payload?.expReward) events.push({ type: 'EXP_GAIN', amount: room.payload.expReward });
          if (room.payload?.currencyReward) events.push({ type: 'CURRENCY_DELTA', amount: room.payload.currencyReward });
          applyGameEvents(events, get, set);
          notify.success('Giải trận thành công!', '');
          set((s) => {
            if (s.secretRealm) {
              const r = s.secretRealm.rooms[sr.currentRoomId];
              if (r) r.cleared = true;
            }
          });
          break;
        }
      }

      // Check if boss cleared → end realm + reward
      if (room.kind === 'boss' && room.cleared) {
        const cr = sr.clearReward;
        const events: import('@ai/tag-parser').GameEvent[] = [
          { type: 'EXP_GAIN', amount: cr.exp },
          { type: 'CURRENCY_DELTA', amount: cr.currency },
        ];
        if (cr.itemName && cr.itemRarity && cr.itemCategory) {
          events.push({ type: 'ITEM_GAINED', name: cr.itemName, rarity: cr.itemRarity, category: cr.itemCategory });
        }
        applyGameEvents(events, get, set);
        notify.epic('Bí cảnh hoàn thành!', 'Đại thắng — nhận toàn bộ phần thưởng');
      }
    },

    exitSecretRealm: () => {
      set((s) => {
        s.secretRealm = null;
        s.stage = 'playing';
      });
      notify.info('Rời bí cảnh', 'Quay về câu chuyện chính');
    },

    attemptCaptureBeast: (enemyName, enemyHpPercent) => {
      const tmpl = findTemplateByEnemyName(enemyName);
      if (!tmpl) {
        notify.warn('Không thể bắt', `${enemyName} không phải linh thú có thể khế ước`);
        return { success: false, finalChance: 0 };
      }
      const player = get().player;
      if (!player) return { success: false, finalChance: 0 };

      // Check max 6 beast
      if (Object.keys(get().spiritBeasts).length >= 6) {
        notify.warn('Đã đủ 6 linh thú', 'Phóng thích bớt 1 con trước khi bắt thêm');
        return { success: false, finalChance: 0 };
      }

      const result = rollCapture({
        template: tmpl,
        playerLevel: player.level,
        enemyHpPercent,
      });

      if (result.success && result.beast) {
        const beast = { ...result.beast, capturedAtTurn: get().turn };
        set((s) => {
          s.spiritBeasts[beast.id] = beast;
          if (!s.activeBeastId) s.activeBeastId = beast.id;
          if (s.activeBeastId === beast.id) s.spiritBeasts[beast.id]!.isActive = true;
        });
        notify.epic(`Bắt được: ${beast.name}!`, `${result.finalChance.toFixed(0)}% cơ hội — Khế ước thành công`);
        return { success: true, finalChance: result.finalChance, beastName: beast.name };
      }

      notify.warn(`Bắt thất bại`, `${result.finalChance.toFixed(0)}% cơ hội — Linh thú tẩu thoát`);
      return { success: false, finalChance: result.finalChance };
    },

    setActiveBeast: (beastId) => {
      set((s) => {
        // Deactivate all
        Object.values(s.spiritBeasts).forEach((b) => { b.isActive = false; });
        s.activeBeastId = beastId;
        if (beastId && s.spiritBeasts[beastId]) {
          s.spiritBeasts[beastId]!.isActive = true;
        }
      });
      if (beastId && get().spiritBeasts[beastId]) {
        notify.info('Chọn đồng hành', get().spiritBeasts[beastId]!.name);
      }
    },

    feedBeastAction: (beastId, kind) => {
      set((s) => {
        const b = s.spiritBeasts[beastId];
        if (!b) return;
        s.spiritBeasts[beastId] = feedBeast(b, kind);
      });
      const b = get().spiritBeasts[beastId];
      if (b) notify.success(`Cho ${b.name} ăn`, kind === 'pill' ? 'Hồi đầy HP' : '+5 độ trung thành');
    },

    evolveBeastAction: (beastId) => {
      const beast = get().spiritBeasts[beastId];
      const tmpl = beast ? getBeastTemplate(beast.templateId) : null;
      const player = get().player;
      if (!beast || !tmpl || !player) return false;

      const inventoryNames = Object.values(get().inventory).map((i) => i.name);
      const check = canEvolve(beast, tmpl, player.currency, inventoryNames);
      if (!check.can) {
        notify.warn('Không thể tiến hóa', check.reason ?? '');
        return false;
      }

      const next = tmpl.stages[check.nextStage!]!;
      // Deduct cost
      if (next.evolutionCost?.currency) {
        applyGameEvents([{ type: 'CURRENCY_DELTA', amount: -next.evolutionCost.currency }], get, set);
      }
      if (next.evolutionCost?.itemName) {
        // Find first matching item and remove 1
        const matchItem = Object.values(get().inventory).find((i) => i.name === next.evolutionCost!.itemName);
        if (matchItem) {
          set((s) => {
            const item = s.inventory[matchItem.id];
            if (item) {
              const q = item.quantity ?? 1;
              if (q > 1) item.quantity = q - 1;
              else {
                delete s.inventory[matchItem.id];
                if (s.player) s.player.inventory = s.player.inventory.filter((id) => id !== matchItem.id);
              }
            }
          });
        }
      }

      // Apply evolution
      set((s) => {
        const b = s.spiritBeasts[beastId];
        if (b && tmpl) s.spiritBeasts[beastId] = evolveBeast(b, tmpl);
      });
      notify.epic(`Tiến hóa: ${beast.name} → ${next.name}!`, 'Stats tăng vọt');
      return true;
    },

    releaseBeast: (beastId) => {
      const b = get().spiritBeasts[beastId];
      if (!b) return;
      set((s) => {
        delete s.spiritBeasts[beastId];
        if (s.activeBeastId === beastId) s.activeBeastId = null;
      });
      notify.info(`Phóng thích: ${b.name}`, 'Linh thú trở về tự nhiên');
    },

    purchaseCaveAbode: (locationId, name, cost) => {
      const player = get().player;
      if (!player) return;
      if (get().caveAbode.owned) {
        notify.warn('Đã có động phủ', 'Mỗi đạo hữu chỉ sở hữu 1 động phủ');
        return;
      }
      if (player.currency < cost) {
        notify.warn('Không đủ linh thạch', `Cần ${cost.toLocaleString()}`);
        return;
      }
      set((s) => {
        if (!s.player) return;
        s.player.currency -= cost;
        s.caveAbode.owned = true;
        s.caveAbode.name = name;
        s.caveAbode.locationId = locationId;
        s.caveAbode.purchasedAt = s.turn;
      });
      notify.epic(`Mua động phủ: ${name}`, `-${cost.toLocaleString()} linh thạch`);
    },

    buildRoom: (roomKind) => {
      const ab = get().caveAbode;
      const player = get().player;
      if (!ab.owned || !player) {
        notify.warn('Chưa có động phủ', 'Phải mua động phủ trước');
        return;
      }
      const room = ab.rooms[roomKind];
      if (room.built) return;
      const cost = room.upgradeCost ?? 500;
      if (player.currency < cost) {
        notify.warn('Không đủ linh thạch', `Cần ${cost.toLocaleString()}`);
        return;
      }
      set((s) => {
        if (!s.player) return;
        s.player.currency -= cost;
        s.caveAbode.rooms[roomKind].built = true;
        s.caveAbode.rooms[roomKind].level = 1;
        s.caveAbode.rooms[roomKind].upgradeCost = cost * 2;
      });
      notify.success(`Xây xong phòng`, roomKind);
    },

    upgradeRoom: (roomKind) => {
      const ab = get().caveAbode;
      const player = get().player;
      if (!ab.owned || !player) return;
      const room = ab.rooms[roomKind];
      if (!room.built) return;
      if (room.level >= 5) {
        notify.warn('Đã max level', '');
        return;
      }
      const cost = room.upgradeCost ?? 500;
      if (player.currency < cost) {
        notify.warn('Không đủ linh thạch', `Cần ${cost.toLocaleString()}`);
        return;
      }
      set((s) => {
        if (!s.player) return;
        s.player.currency -= cost;
        s.caveAbode.rooms[roomKind].level += 1;
        s.caveAbode.rooms[roomKind].upgradeCost = Math.round(cost * 1.8);
      });
      notify.success(`Nâng cấp phòng → Lv ${room.level + 1}`, '');
    },

    plantHerb: (herbName) => {
      const ab = get().caveAbode;
      if (!ab.owned || !ab.rooms.dao_vien.built) {
        notify.warn('Chưa xây Dược Viên', '');
        return;
      }
      const max = maxPlotsForLevel(ab.rooms.dao_vien.level);
      const used = Object.keys(ab.plots).length;
      if (used >= max) {
        notify.warn('Hết plot', `Đã dùng ${used}/${max}. Nâng cấp Dược Viên để thêm.`);
        return;
      }
      const herb = HERB_CATALOG.find((h) => h.name === herbName);
      if (!herb) return;
      if (herb.minLevel > ab.rooms.dao_vien.level) {
        notify.warn('Dược Viên chưa đủ cấp', `Cần Lv ${herb.minLevel}`);
        return;
      }
      const id = crypto.randomUUID();
      set((s) => {
        s.caveAbode.plots[id] = {
          id,
          herbName: herb.name,
          itemName: herb.itemName,
          itemRarity: herb.itemRarity,
          itemCategory: herb.itemCategory,
          plantedAtTurn: s.turn,
          growTurns: herb.growTurns,
          yield: herb.yield,
        };
      });
      notify.success(`Trồng: ${herb.name}`, `Chín sau ${herb.growTurns} lượt`);
    },

    harvestPlot: (plotId) => {
      const plot = get().caveAbode.plots[plotId];
      if (!plot) return;
      const elapsed = get().turn - plot.plantedAtTurn;
      if (elapsed < plot.growTurns) {
        notify.warn('Chưa chín', `Còn ${plot.growTurns - elapsed} lượt`);
        return;
      }
      // Grant items
      const events: import('@ai/tag-parser').GameEvent[] = [];
      for (let i = 0; i < plot.yield; i++) {
        events.push({
          type: 'ITEM_GAINED',
          name: plot.itemName,
          rarity: plot.itemRarity,
          category: plot.itemCategory,
        });
      }
      applyGameEvents(events, get, set);
      set((s) => {
        delete s.caveAbode.plots[plotId];
      });
      notify.success(`Thu hoạch: ${plot.itemName}`, `×${plot.yield}`);
    },

    meditateInAbode: (hours) => {
      const player = get().player;
      const abode = get().caveAbode;
      if (!player || !abode.owned) return;
      if (!abode.rooms.tu_luyen_that.built) {
        notify.warn('Chưa xây Tu Luyện Thất', '');
        return;
      }
      // Bonus per room level (level 1 = 1.0, level 5 = 1.5)
      const roomBonus = 1.0 + (abode.rooms.tu_luyen_that.level - 1) * 0.125;
      const rootMult = player.spiritualRoot?.cultivationMultiplier ?? 1.0;
      // Song tu bonus nếu có đạo lữ đồng hành
      const hasDaoLu = Object.values(get().daoLu).some((d) => d.isPartner && d.isAccompanying);
      const songTuMult = hasDaoLu ? 1.3 : 1.0;
      const exp = calculateMeditationExp({
        hours,
        spiritualRootMultiplier: rootMult,
        envMultiplier: 1.5 * roomBonus * songTuMult,
        mentalStateBonus: 1.0 + (player.mentalState ?? 50) / 200,
      });
      applyGameEvents([{ type: 'EXP_GAIN', amount: exp }], get, set);
      set((s) => {
        s.turn += hours;
      });
      notify.epic(
        `Bế quan ${hours} giờ`,
        `+${exp} tu vi · Phòng Lv ${abode.rooms.tu_luyen_that.level}${hasDaoLu ? ' · Song tu ×1.3' : ''}`
      );
    },

    refinePill: (recipeId) => {
      const recipe = getPillRecipe(recipeId);
      const player = get().player;
      const abode = get().caveAbode;
      if (!recipe || !player) return;
      if (!abode.rooms.luyen_dan_that.built) {
        notify.warn('Chưa xây Luyện Đan Thất', '');
        return;
      }
      if (abode.rooms.luyen_dan_that.level < recipe.minRoomLevel) {
        notify.warn('Lò đan chưa đủ cấp', `Cần Lv ${recipe.minRoomLevel}`);
        return;
      }
      if (player.currency < recipe.currencyCost) {
        notify.warn('Không đủ linh thạch', `Cần ${recipe.currencyCost.toLocaleString()}`);
        return;
      }

      // Check ingredients
      const inv = get().inventory;
      for (const ing of recipe.ingredients) {
        const matched = Object.values(inv).filter((it) => it.name === ing.itemName);
        const total = matched.reduce((sum, it) => sum + (it.quantity ?? 1), 0);
        if (total < ing.count) {
          notify.warn('Thiếu nguyên liệu', `Cần ${ing.count}× ${ing.itemName} (có ${total})`);
          return;
        }
      }

      // Consume ingredients
      set((s) => {
        if (!s.player) return;
        s.player.currency -= recipe.currencyCost;
        for (const ing of recipe.ingredients) {
          let needed = ing.count;
          const matches = Object.values(s.inventory).filter((it) => it.name === ing.itemName);
          for (const it of matches) {
            if (needed <= 0) break;
            const q = it.quantity ?? 1;
            const consume = Math.min(needed, q);
            if (q - consume <= 0) {
              delete s.inventory[it.id];
              if (s.player) s.player.inventory = s.player.inventory.filter((id) => id !== it.id);
            } else {
              s.inventory[it.id]!.quantity = q - consume;
            }
            needed -= consume;
          }
        }
      });

      // Roll success
      const success = Math.random() * 100 < recipe.successRate;
      if (success) {
        applyGameEvents(
          [{ type: 'ITEM_GAINED', name: recipe.productName, rarity: recipe.productRarity, category: recipe.productCategory }],
          get, set,
        );
        notify.epic(`Luyện thành: ${recipe.productName}`, `${recipe.successRate}% cơ hội — thành công!`);
      } else {
        notify.warn('Luyện đan thất bại', `${recipe.successRate}% cơ hội — mất nguyên liệu nhưng giữ kinh nghiệm`);
      }
    },

    redeemFromTangKinh: (catalogId) => {
      const item = TANG_KINH_CATALOG.find((c) => c.id === catalogId);
      const m = get().sectMembership;
      if (!item || !m) return;
      if (item.sectId !== m.sectId) {
        notify.warn('Sai tàng kinh', 'Catalog này không thuộc tông môn của ngươi');
        return;
      }
      const required = SECT_RANK_ORDER.indexOf(item.minRank);
      const current = SECT_RANK_ORDER.indexOf(m.rank);
      if (current < required) {
        notify.warn('Chưa đủ rank', `Cần ${SECT_RANK_DISPLAY[item.minRank]} trở lên`);
        return;
      }
      if (m.contribution < item.cost) {
        notify.warn('Không đủ cống hiến', `Cần ${item.cost.toLocaleString()} điểm`);
        return;
      }
      set((s) => {
        if (s.sectMembership) s.sectMembership.contribution -= item.cost;
      });
      applyGameEvents(
        [{ type: 'ITEM_GAINED', name: item.itemName, rarity: item.itemRarity, category: item.itemCategory }],
        get,
        set,
      );
      notify.success(`Đổi: ${item.itemName}`, `-${item.cost} cống hiến`);
    },

    setError: (msg) =>
      set((s) => {
        s.lastError = msg;
      }),

    reset: () =>
      set((s) => {
        s.stage = 'initial';
        s.prevStage = null;
        s.player = null;
        s.inventory = {};
        s.skills = {};
        s.knowledge = DEFAULT_KNOWLEDGE;
        s.time = null;
        s.settings = DEFAULT_SETTINGS;
        s.storyLog = [];
        s.currentActions = [];
        s.currentActionChoices = [];
        s.turn = 0;
        s.combat = null;
        s.tribulationContext = null;
        s.quests = {};
        s.sectMembership = null;
        s.claimedMissions = {};
        s.secretRealm = null;
        s.spiritBeasts = {};
        s.activeBeastId = null;
        s.caveAbode = { ...DEFAULT_CAVE_ABODE, rooms: { ...DEFAULT_CAVE_ABODE.rooms }, plots: {} };
        s.daoLu = {};
        s.isAiThinking = false;
        s.lastError = null;
      }),

    saveToLocalStorage: () => {
      try {
        // Phase 23.UX HOTFIX: trước đây thiếu economy/dailyMissions/extendedQuests/
        // playerStats/skillMastery/cultivation → refresh = mất tiền nạp + lịch sử.
        // Bây giờ lưu đầy đủ.
        const {
          player, settings, storyLog, currentActions, turn, knowledge, inventory, skills,
          quests, sectMembership, claimedMissions, secretRealm, spiritBeasts, activeBeastId,
          caveAbode, daoLu, economy, dailyMissions, extendedQuests, playerStats,
          skillMastery, cultivation, skillDeep,
        } = get();
        const payload = JSON.stringify({
          version: 9, // bump version sau hotfix
          savedAt: Date.now(),
          player, settings, storyLog, currentActions, turn, knowledge, inventory, skills, quests,
          sectMembership, claimedMissions, secretRealm, spiritBeasts, activeBeastId, caveAbode, daoLu,
          // ─── Phase 15-23: các slice trước đây bị bỏ sót ───
          economy, dailyMissions, extendedQuests, playerStats, skillMastery, cultivation, skillDeep,
        });
        localStorage.setItem(SAVE_KEY, payload);
        // Phase 24.UX: emit event cho SaveIndicator component
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tutien:save', { detail: { ts: Date.now() } }));
        }
      } catch (e) {
        console.warn('[saveToLocalStorage]', e);
      }
    },

    syncToCloud: async () => {
      // Phase 23.UX HOTFIX: cùng lý do — bổ sung các slice còn thiếu để cloud sync đầy đủ.
      const {
        player, settings, storyLog, currentActions, turn, knowledge, inventory, skills,
        quests, sectMembership, claimedMissions, secretRealm, spiritBeasts, activeBeastId,
        caveAbode, daoLu, economy, dailyMissions, extendedQuests, playerStats,
        skillMastery, cultivation, skillDeep,
      } = get();
      if (!player) {
        notify.warn('Không có save để sync', 'Tạo nhân vật trước');
        return false;
      }
      const result = await saveToCloud({
        version: 9,
        savedAt: Date.now(),
        data: {
          player, settings, storyLog, currentActions, turn, knowledge, inventory, skills, quests,
          sectMembership, claimedMissions, secretRealm, spiritBeasts, activeBeastId, caveAbode, daoLu,
          economy, dailyMissions, extendedQuests, playerStats, skillMastery, cultivation, skillDeep,
        } as Record<string, unknown>,
      });
      if (result.ok) {
        notify.epic('Sync thành công', 'Save đã upload lên cloud');
        return true;
      }
      if (!result.cloudAvailable) {
        notify.warn('Cloud chưa cấu hình', 'Set VITE_FIREBASE_* trong .env.local');
      } else {
        notify.warn('Sync thất bại', result.error ?? '');
      }
      return false;
    },

    loadFromCloud: async () => {
      const cloud = await loadFromCloud();
      if (!cloud) {
        notify.warn('Không có save cloud', 'Hoặc chưa cấu hình Firebase');
        return false;
      }
      const data = cloud.data as Record<string, unknown>;
      if (!data.player) return false;
      set((s) => {
        s.player = data.player as typeof s.player;
        s.settings = { ...DEFAULT_SETTINGS, ...(data.settings as Partial<GameSettings>) };
        s.storyLog = (data.storyLog as StoryEntry[]) ?? [];
        s.currentActions = (data.currentActions as string[]) ?? [];
        s.turn = (data.turn as number) ?? 0;
        s.knowledge = { ...DEFAULT_KNOWLEDGE, ...(data.knowledge as Partial<KnowledgeSlice>) };
        s.inventory = (data.inventory as Record<string, Item>) ?? {};
        s.skills = (data.skills as Record<string, Skill>) ?? {};
        s.quests = (data.quests as Record<string, Quest>) ?? {};
        s.sectMembership = (data.sectMembership as SectMembership | null) ?? null;
        s.claimedMissions = (data.claimedMissions as Record<string, number>) ?? {};
        s.secretRealm = (data.secretRealm as SecretRealmInstance | null) ?? null;
        s.spiritBeasts = (data.spiritBeasts as Record<string, SpiritBeast>) ?? {};
        s.activeBeastId = (data.activeBeastId as string | null) ?? null;
        s.caveAbode = (data.caveAbode as CaveAbode) ?? { ...DEFAULT_CAVE_ABODE, rooms: { ...DEFAULT_CAVE_ABODE.rooms }, plots: {} };
        s.prevStage = s.stage;
        s.stage = 'playing';
      });
      notify.epic('Load cloud thành công', 'Save đã sync từ thiết bị khác');
      return true;
    },

    loadFromLocalStorage: () => {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data?.player) return false;
        set((s) => {
          s.player = data.player;
          s.settings = { ...DEFAULT_SETTINGS, ...data.settings };
          s.storyLog = data.storyLog ?? [];
          s.currentActions = data.currentActions ?? [];
          s.turn = data.turn ?? 0;
          s.knowledge = { ...DEFAULT_KNOWLEDGE, ...data.knowledge };
          s.inventory = data.inventory ?? {};
          // Phase 23.UX migration: item cũ có category='Pháp bảo' (không hợp lệ)
          // → infer lại theo tên cho equippable + dưỡng được.
          for (const id of Object.keys(s.inventory)) {
            const it = s.inventory[id];
            if (it && (it.category as string) === 'Pháp bảo') {
              it.category = inferItemCategoryFromName(it.name);
            }
          }
          s.skills = data.skills ?? {};
          s.quests = data.quests ?? {};
          s.sectMembership = data.sectMembership ?? null;
          s.claimedMissions = data.claimedMissions ?? {};
          s.secretRealm = data.secretRealm ?? null;
          s.spiritBeasts = data.spiritBeasts ?? {};
          s.activeBeastId = data.activeBeastId ?? null;
          s.caveAbode = data.caveAbode ?? { ...DEFAULT_CAVE_ABODE, rooms: { ...DEFAULT_CAVE_ABODE.rooms }, plots: {} };
          s.daoLu = data.daoLu ?? {};
          // Phase 15: Economy — restore từ save, generate code mới nếu chưa có
          if (data.economy) {
            s.economy = { ...INITIAL_ECONOMY, ...data.economy };
            if (!s.economy.referralCode) {
              s.economy.referralCode = generateReferralCode(getOrCreateDeviceId());
            }
          }
          // Phase 16.3: Daily missions
          if (data.dailyMissions) {
            s.dailyMissions = { ...INITIAL_DAILY_MISSIONS, ...data.dailyMissions };
          }
          // Phase 17.1: Extended quests
          if (data.extendedQuests) {
            s.extendedQuests = { ...INITIAL_EXTENDED_QUESTS, ...data.extendedQuests };
          }
          if (data.playerStats) {
            s.playerStats = { ...INITIAL_LIFETIME_STATS, ...data.playerStats };
          }
          if (data.skillMastery && typeof data.skillMastery === 'object') {
            s.skillMastery = data.skillMastery as typeof s.skillMastery;
          }
          // Phase 23.3-23.7: Cultivation — merge với INITIAL nếu schema mới
          if (data.cultivation && typeof data.cultivation === 'object') {
            s.cultivation = { ...INITIAL_CULTIVATION, ...data.cultivation };
          }
          // Phase 24.A: Skill Deep — merge với INITIAL
          if (data.skillDeep && typeof data.skillDeep === 'object') {
            s.skillDeep = { ...INITIAL_SKILL_DEEP, ...data.skillDeep };
          }
          s.prevStage = s.stage;
          s.stage = 'playing';
        });
        // Phase 16.1: Sync perk flags vào AI client sau khi load
        const loaded = get().economy;
        setPerkFlags({ speedBoost: !!loaded.unlockedPerks.speedBoost });
        return true;
      } catch (e) {
        console.warn('[loadFromLocalStorage]', e);
        return false;
      }
    },

    // ─── Multi-slot save manager ───
    getCurrentPayload: () => {
      const { player, settings, storyLog, currentActions, turn, knowledge, inventory, skills, quests, sectMembership, claimedMissions, secretRealm, spiritBeasts, activeBeastId, caveAbode, daoLu, gameTime, weather, ep } = get();
      return {
        version: 9,
        savedAt: Date.now(),
        player, settings, storyLog, currentActions, turn, knowledge, inventory, skills, quests,
        sectMembership, claimedMissions, secretRealm, spiritBeasts, activeBeastId, caveAbode, daoLu,
        gameTime, weather, ep,
      };
    },

    saveToSlot: (slotId: string) => {
      try {
        const payload = get().getCurrentPayload();
        // Key format: tu-tien:save:slot-N hoặc tu-tien:save:autobackup-N
        const key = slotId.startsWith('autobackup-')
          ? `tu-tien:save:autobackup-${slotId.slice('autobackup-'.length)}`
          : `tu-tien:save:slot-${slotId.replace(/^slot-/, '')}`;
        localStorage.setItem(key, JSON.stringify(payload));
        return true;
      } catch (e) {
        console.warn('[saveToSlot]', e);
        return false;
      }
    },

    loadFromSlot: (slotId: string) => {
      try {
        const key = slotId.startsWith('autobackup-')
          ? `tu-tien:save:autobackup-${slotId.slice('autobackup-'.length)}`
          : `tu-tien:save:slot-${slotId.replace(/^slot-/, '')}`;
        const raw = localStorage.getItem(key);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data?.player) return false;
        set((s) => {
          s.player = data.player;
          s.settings = { ...DEFAULT_SETTINGS, ...data.settings };
          s.storyLog = data.storyLog ?? [];
          s.currentActions = data.currentActions ?? [];
          s.turn = data.turn ?? 0;
          s.knowledge = { ...DEFAULT_KNOWLEDGE, ...data.knowledge };
          s.inventory = data.inventory ?? {};
          // Phase 23.UX migration: item cũ có category='Pháp bảo' (không hợp lệ)
          // → infer lại theo tên cho equippable + dưỡng được.
          for (const id of Object.keys(s.inventory)) {
            const it = s.inventory[id];
            if (it && (it.category as string) === 'Pháp bảo') {
              it.category = inferItemCategoryFromName(it.name);
            }
          }
          s.skills = data.skills ?? {};
          s.quests = data.quests ?? {};
          s.sectMembership = data.sectMembership ?? null;
          s.claimedMissions = data.claimedMissions ?? {};
          s.secretRealm = data.secretRealm ?? null;
          s.spiritBeasts = data.spiritBeasts ?? {};
          s.activeBeastId = data.activeBeastId ?? null;
          s.caveAbode = data.caveAbode ?? { ...DEFAULT_CAVE_ABODE, rooms: { ...DEFAULT_CAVE_ABODE.rooms }, plots: {} };
          s.daoLu = data.daoLu ?? {};
          s.prevStage = s.stage;
          s.stage = 'playing';
        });
        return true;
      } catch (e) {
        console.warn('[loadFromSlot]', e);
        return false;
      }
    },
  })),
);

// ─────────────────────────────────────────────────────────────────────
// PHASE 23.UX — AUTO-SAVE SUBSCRIPTION (debounced 250ms)
// ─────────────────────────────────────────────────────────────────────
// Trước đây phải rải get().saveToLocalStorage() ở ~40 actions.
// Pattern mới: subscribe vào store, debounce 250ms, save khi persistent
// slice đổi. Bao phủ tất cả mutation kể cả những action chưa từng wire
// save thủ công (sect/secret-realm/beast/cave/cultivation/quest/mission...).
//
// Skip khi: stage === 'initial' (chưa có player), hoặc isAiThinking
// (đang fetch — submitAction sẽ save manual sau khi response hoàn tất).
{
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  // Lưu reference các slice cần watch — nếu chỉ 1 trong đó đổi thì save.
  // Selector trả tuple — so sánh shallow để tránh save khi chỉ stage/ephemeral đổi.
  type PersistSnapshot = readonly [
    GameState['player'],
    GameState['inventory'],
    GameState['skills'],
    GameState['knowledge'],
    GameState['quests'],
    GameState['sectMembership'],
    GameState['claimedMissions'],
    GameState['secretRealm'],
    GameState['spiritBeasts'],
    GameState['activeBeastId'],
    GameState['caveAbode'],
    GameState['daoLu'],
    GameState['economy'],
    GameState['dailyMissions'],
    GameState['extendedQuests'],
    GameState['playerStats'],
    GameState['skillMastery'],
    GameState['cultivation'],
    GameState['skillDeep'],
    GameState['settings'],
    GameState['storyLog'],
    GameState['currentActions'],
    GameState['turn'],
  ];
  let lastSnap: PersistSnapshot | null = null;
  const getSnap = (s: GameState): PersistSnapshot => [
    s.player, s.inventory, s.skills, s.knowledge, s.quests,
    s.sectMembership, s.claimedMissions, s.secretRealm, s.spiritBeasts,
    s.activeBeastId, s.caveAbode, s.daoLu, s.economy, s.dailyMissions,
    s.extendedQuests, s.playerStats, s.skillMastery, s.cultivation, s.skillDeep,
    s.settings, s.storyLog, s.currentActions, s.turn,
  ];
  useGameStore.subscribe((state) => {
    if (state.stage === 'initial' || !state.player) return;
    const snap = getSnap(state);
    // Shallow compare — nếu mọi reference y nguyên (chỉ stage/ephemeral đổi) → skip
    if (lastSnap && lastSnap.every((v, i) => v === snap[i])) return;
    lastSnap = snap;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { useGameStore.getState().saveToLocalStorage(); }
      catch (e) { console.warn('[auto-save]', e); }
    }, 250);
  });
}

// ─────────────────────────────────────────────────────────────────────
// PHASE 11.1 — 2-TIER SUMMARY BACKGROUND TRIGGER
// ─────────────────────────────────────────────────────────────────────

/** Module-level lock — đảm bảo summarization không re-entrant */
let _isSummarizing = false;

/**
 * Check storyLog > trigger threshold → fire-and-forget summarization.
 * Sau khi thành công: thay 20 turn cũ bằng 1 summary block, retain SUMMARY_RETAIN_TURNS turn cuối.
 * Nếu storySummaries.level1 ≥ SUMMARY_META_BATCH → tiếp tục meta-summarize.
 */
function triggerSummarizationIfNeeded(
  get: () => GameState,
  set: (fn: (s: GameState) => void) => void,
): void {
  if (_isSummarizing) return;
  const log = get().storyLog;
  if (log.length <= SUMMARY_TRIGGER_TURNS) return;

  _isSummarizing = true;
  // Lấy SUMMARY_BATCH_SIZE entry đầu tiên để tóm tắt
  const turnsToSummarize = log.slice(0, SUMMARY_BATCH_SIZE);
  const turnStart = turnsToSummarize[0]?.turn;
  const turnEnd = turnsToSummarize[turnsToSummarize.length - 1]?.turn;

  // Fire async — không await
  void (async () => {
    try {
      const summary = await summarizeTurns(turnsToSummarize, turnStart, turnEnd);
      if (!summary) return;

      set((s) => {
        // Push summary mới vào knowledge.storySummaries
        s.knowledge.storySummaries = [...s.knowledge.storySummaries, summary];
        // Cắt bớt log: giữ lại N entry cuối (= log.length - BATCH_SIZE)
        s.storyLog = s.storyLog.slice(SUMMARY_BATCH_SIZE);
      });

      // Kiểm tra meta-summarize: nếu level-1 ≥ SUMMARY_META_BATCH
      const result = shouldMetaSummarize(get().knowledge.storySummaries);
      if (result) {
        const meta = await metaSummarize(result.toMeta);
        if (meta) {
          set((s) => {
            // Thay batch level-1 bằng 1 meta block, giữ rest
            s.knowledge.storySummaries = [meta, ...result.rest];
          });
        }
      }
      get().saveToLocalStorage();
    } catch (err) {
      console.warn('[summary] Background summarization fail:', err);
    } finally {
      _isSummarizing = false;
    }
  })();
}

// ─────────────────────────────────────────────────────────────────────
// TAG EVENT DISPATCHER — mutate state dựa trên events từ AI response
// ─────────────────────────────────────────────────────────────────────
function applyGameEvents(
  events: GameEvent[],
  get: () => GameState,
  set: (fn: (s: GameState) => void) => void,
) {
  for (const e of events) {
    switch (e.type) {
      case 'EXP_GAIN': {
        let levelsGained = 0;
        set((s) => {
          if (!s.player) return;
          const r = applyExpGain(s.player.level, s.player.exp, e.amount);
          s.player.level = r.newLevel;
          s.player.exp = r.newExp;
          s.player.maxExp = r.newMaxExp;
          s.player.ap += r.apEarned;
          levelsGained = r.levelsGained;
          if (r.levelsGained > 0) {
            s.player.realm = getRealmInfoFromLevel(
              r.newLevel,
              s.knowledge.realmProgressionList,
            ).realmName;
          }
        });
        notify.success(`+${e.amount} Tu Vi`, '');
        // Phase 16.3: Mission progress khi đột phá cảnh giới
        if (levelsGained > 0) {
          for (let i = 0; i < levelsGained; i++) {
            get().incrementMissionProgress('level_up');
          }
        }
        break;
      }
      case 'HP_DELTA': {
        set((s) => {
          if (!s.player) return;
          const next = Math.max(0, Math.min(s.player.finalStats.maxhp, s.player.finalStats.hp + e.amount));
          s.player.finalStats.hp = next;
        });
        if (e.amount < 0) notify.warn(`${e.amount} Sinh Mệnh`, '');
        else notify.info(`+${e.amount} Sinh Mệnh`, '');
        break;
      }
      case 'CURRENCY_DELTA': {
        set((s) => {
          if (!s.player) return;
          s.player.currency = Math.max(0, s.player.currency + e.amount);
        });
        notify.info(`${e.amount > 0 ? '+' : ''}${e.amount} ${get().settings.currencyName}`, '');
        break;
      }
      case 'AP_GAIN': {
        set((s) => {
          if (s.player) s.player.ap += e.amount;
        });
        notify.success(`+${e.amount} Điểm Tiềm Năng`, '');
        break;
      }
      case 'STAT_BUFF': {
        set((s) => {
          if (!s.player) return;
          const k = e.stat === 'hp' ? 'baseHp' : e.stat === 'atk' ? 'baseAtk' : e.stat === 'def' ? 'baseDef' : 'baseSpd';
          s.player.baseStats[k] += e.amount;
          s.player = recomputeStats(s.player, s.inventory);
        });
        notify.info(`${e.amount > 0 ? '+' : ''}${e.amount} ${e.stat.toUpperCase()}`, 'Buff vĩnh viễn');
        break;
      }
      case 'ITEM_GAINED': {
        const id = crypto.randomUUID();
        const rarityNorm = ['Thường','Tốt','Hiếm','Cực Phẩm','Siêu Phẩm','Huyền Thoại'].includes(e.rarity)
          ? (e.rarity as Rarity) : 'Thường';
        const category = e.category as ItemCategory;
        const playerLevel = get().player?.level ?? 1;
        // Phase 10.1: Budget-based 3-step pipeline (category-aware, difficulty-scaled)
        // Fallback xuống deterministic V1 nếu category không có build rule
        const difficulty = (get().settings as { difficulty?: string }).difficulty;
        const bonuses =
          generateItemBonusesV2({ rarity: rarityNorm, category, playerLevel, difficulty }) ??
          generateItemBonuses(rarityNorm, category, playerLevel);
        const item: Item = {
          id, name: e.name, rarity: rarityNorm,
          category, description: '', value: 100, quantity: 1,
          ...(bonuses && Object.keys(bonuses).length > 0 ? { bonuses } : {}),
        };
        set((s) => {
          // Stack nếu cùng tên + category + rarity (non-equipment)
          const existing = Object.values(s.inventory).find(
            (i) => i.name === item.name && i.category === item.category && i.rarity === item.rarity,
          );
          if (existing && !EQUIPPABLE_CATEGORIES.includes(item.category)) {
            existing.quantity = (existing.quantity ?? 1) + 1;
          } else {
            s.inventory[id] = item;
            if (s.player) s.player.inventory.push(id);
          }
        });
        notify.epic(`Nhận: ${e.name}`, `${e.rarity} · ${e.category}`);
        break;
      }
      case 'SKILL_LEARNED': {
        const id = crypto.randomUUID();
        const skill: Skill = {
          id, name: e.name, description: '',
          rarity: (['Thường','Tốt','Hiếm','Cực Phẩm','Siêu Phẩm','Huyền Thoại'].includes(e.rarity)
            ? e.rarity : 'Thường') as Rarity,
          kind: e.kind as SkillKind,
        };
        set((s) => {
          s.skills[id] = skill;
          if (s.player) s.player.learnedSkills.push(id);
        });
        notify.epic(`Học được: ${e.name}`, `${e.rarity} · ${e.kind}`);
        // Phase 16.3: Mission progress
        get().incrementMissionProgress('learn_skill');
        break;
      }
      case 'REALM_BREAK': {
        set((s) => {
          s.knowledge.eventHistory = pushEvent(s.knowledge.eventHistory, {
            timestamp: Date.now(),
            turn: s.turn,
            kind: 'realm_break',
            summary: `Đột phá đến cấp ${s.player?.level ?? '?'} (${s.player?.realm ?? 'cảnh giới mới'})`,
          });
          s.playerStats.realmBreaksLifetime += 1;
        });
        notify.epic('ĐỘT PHÁ!', {
          message: 'Cảnh giới mới khai mở. Xem chi tiết cảnh giới + chỉ số mới.',
          action: { target: 'character-sheet', label: 'Xem Đạo Cơ' },
        });
        break;
      }
      case 'TRIBULATION': {
        set((s) => {
          s.knowledge.eventHistory = pushEvent(s.knowledge.eventHistory, {
            timestamp: Date.now(),
            turn: s.turn,
            kind: 'tribulation',
            summary: e.reason ?? 'Thiên kiếp giáng lâm',
          });
          s.playerStats.tribulationsPassed += 1;
          s.tribulationContext = { ...(e.reason !== undefined ? { reason: e.reason } : {}) };
          s.prevStage = s.stage;
          s.stage = 'tribulation';
        });
        notify.warn('Độ kiếp đến!', {
          message: e.reason ?? 'Thiên kiếp giáng lâm — vào Độ Kiếp ngay!',
          action: { target: 'tribulation', label: 'Độ kiếp ngay' },
        });
        break;
      }
      case 'COMBAT_START': {
        get().startCombat(e.enemyName, e.enemyLevel);
        break;
      }
      case 'NOTE': {
        notify.info(e.message, '');
        // Cũng push vào storyLog dạng system
        set((s) => {
          s.storyLog.push({
            id: crypto.randomUUID(),
            turn: s.turn,
            timestamp: Date.now(),
            kind: 'system',
            content: e.message,
          });
        });
        break;
      }
      case 'LOCATION_CHANGE': {
        set((s) => {
          if (s.player) s.player.current_location_id = e.locationId;
          const loc = s.knowledge.locations[e.locationId];
          if (loc) {
            loc.visitedByPlayer = true;
            loc.discoveredByPlayer = true;
            for (const nid of loc.neighbors) {
              const n = s.knowledge.locations[nid];
              if (n) n.discoveredByPlayer = true;
            }
          }
        });
        notify.info('Đến địa điểm mới', e.name);
        break;
      }
      case 'STATUS_ADD': {
        // Phase 23.UX: Ưu tiên template registered → fallback humanize (Vietnamese alias / Title Case)
        const tmpl = getLongTermStatus(e.statusId);
        const displayName = tmpl?.name ?? humanizeStatusId(e.statusId);
        const icon = tmpl?.icon ?? '⚠';
        set((s) => {
          if (!s.player) return;
          // Avoid duplicate
          if (s.player.longTermStatuses.some((st) => st.id === e.statusId)) return;
          s.player.longTermStatuses.push({
            id: e.statusId,
            name: displayName,
            type: tmpl?.severity === 'critical' || tmpl?.severity === 'severe' ? 'injury' : 'adventure_debuff',
            description: tmpl?.description ?? '',
            ...(e.durationHours !== undefined ? { duration_hours: e.durationHours } : {}),
          });
        });
        notify.warn(`${icon} ${displayName}`, tmpl?.description?.slice(0, 80) ?? '');
        break;
      }
      case 'STATUS_CURE': {
        const tmpl = getLongTermStatus(e.statusId);
        const displayName = tmpl?.name ?? humanizeStatusId(e.statusId);
        set((s) => {
          if (!s.player) return;
          s.player.longTermStatuses = s.player.longTermStatuses.filter((st) => st.id !== e.statusId);
        });
        notify.success(`Hết: ${displayName}`, '');
        break;
      }
      case 'QUEST_GIVEN': {
        const id = crypto.randomUUID();
        const quest: Quest = {
          id,
          title: e.title,
          kind: (['main', 'side', 'sect', 'cultivation', 'hidden'].includes(e.kind) ? e.kind : 'side') as QuestKind,
          description: e.description,
          objectives: [e.description.length > 100 ? e.description.slice(0, 100) + '…' : e.description],
          status: 'active',
          acceptedAtTurn: get().turn,
          ...(e.giver !== undefined ? { giver: e.giver } : {}),
        };
        set((s) => {
          s.quests[id] = quest;
        });
        notify.epic(`Nhiệm vụ mới: ${e.title}`, e.giver ? `Giao bởi: ${e.giver}` : '');
        break;
      }
      case 'QUEST_COMPLETE': {
        set((s) => {
          const q = Object.values(s.quests).find((x) => x.title === e.title && x.status === 'active');
          if (q) {
            q.status = 'completed';
            q.completedAtTurn = get().turn;
          }
          s.knowledge.eventHistory = pushEvent(s.knowledge.eventHistory, {
            timestamp: Date.now(),
            turn: s.turn,
            kind: 'quest_complete',
            summary: `Hoàn thành quest "${e.title}"`,
          });
        });
        notify.epic(`Hoàn thành: ${e.title}`, 'Nhận phần thưởng từ thiên cơ');
        break;
      }
      case 'QUEST_FAILED': {
        set((s) => {
          const q = Object.values(s.quests).find((x) => x.title === e.title && x.status === 'active');
          if (q) q.status = 'failed';
        });
        notify.warn(`Thất bại nhiệm vụ: ${e.title}`, '');
        break;
      }
      case 'AFFINITY_DELTA': {
        set((s) => {
          const existing = s.daoLu[e.npcName];
          if (existing) {
            existing.affinity = Math.max(0, Math.min(100, existing.affinity + e.amount));
          } else {
            s.daoLu[e.npcName] = {
              name: e.npcName,
              affinity: Math.max(0, Math.min(100, 50 + e.amount)),
              metAtTurn: s.turn,
              isPartner: false,
            };
          }
        });
        const sign = e.amount > 0 ? '+' : '';
        notify.info(`${e.npcName}: ${sign}${e.amount} thiện cảm`, '');
        break;
      }
      case 'DAO_LU': {
        const companion = get().daoLu[e.npcName];
        if (!companion || companion.affinity < 80) {
          notify.warn('Chưa đủ tri kỷ', `${e.npcName} cần affinity ≥ 80 để kết đạo lữ`);
          break;
        }
        set((s) => {
          const c = s.daoLu[e.npcName];
          if (c) {
            c.isPartner = true;
            c.partneredAtTurn = s.turn;
            c.isAccompanying = true;
          }
        });
        notify.epic(`Kết đạo lữ: ${e.npcName}`, 'Song tu cộng hưởng +30% EXP khi đồng hành');
        break;
      }

      // ─── 2-tier lore (Refactor 3) ───
      case 'LORE_NPC': {
        set((s) => {
          // Skip nếu đã có (tránh ghi đè materialized state)
          if (s.knowledge.loreNpcs[e.id]) return;
          s.knowledge.loreNpcs[e.id] = {
            id: e.id,
            name: e.name,
            description: e.description,
            introducedAtTurn: s.turn,
            materialized: false,
            ...(e.source ? { source: e.source } : {}),
          };
        });
        notify.info(`Tin đồn mới · ${e.name}`, e.description.slice(0, 80));
        break;
      }
      case 'LORE_LOCATION': {
        set((s) => {
          if (s.knowledge.loreLocations[e.id]) return;
          s.knowledge.loreLocations[e.id] = {
            id: e.id,
            name: e.name,
            description: e.description,
            introducedAtTurn: s.turn,
            materialized: false,
            ...(e.category ? { category: e.category as LocationType } : {}),
            ...(e.region ? { region: e.region } : {}),
            ...(e.source ? { source: e.source } : {}),
          };
        });
        notify.info(`Địa danh nghe đồn · ${e.name}`, e.description.slice(0, 80));
        break;
      }
      case 'LORE_ITEM': {
        set((s) => {
          if (s.knowledge.loreItems[e.id]) return;
          s.knowledge.loreItems[e.id] = {
            id: e.id,
            name: e.name,
            description: e.description,
            introducedAtTurn: s.turn,
            materialized: false,
            ...(e.rarity ? { rarity: e.rarity } : {}),
            ...(e.source ? { source: e.source } : {}),
          };
        });
        break;
      }
      case 'LORE_QUEST': {
        set((s) => {
          if (s.knowledge.loreQuests[e.id]) return;
          s.knowledge.loreQuests[e.id] = {
            id: e.id,
            title: e.title,
            description: e.description,
            introducedAtTurn: s.turn,
            assigned: false,
            ...(e.source ? { source: e.source } : {}),
          };
        });
        notify.info(`Tin đồn nhiệm vụ · ${e.title}`, e.description.slice(0, 80));
        break;
      }
      case 'WORLD_NPC': {
        set((s) => {
          // Materialize entity vào knowledge.characters
          s.knowledge.characters[e.id] = {
            id: e.id,
            name: e.name,
            description: e.description ?? '',
            role: 'npc',
            level: e.level,
            stance: e.stance,
            loreId: e.loreId,
          };
          // Mark lore tương ứng đã materialized
          if (e.loreId && s.knowledge.loreNpcs[e.loreId]) {
            s.knowledge.loreNpcs[e.loreId]!.materialized = true;
          }
        });
        // Nếu có loreId → notify "tin đồn hóa thật"
        if (e.loreId && get().knowledge.loreNpcs[e.loreId]) {
          notify.epic(`Hội ngộ · ${e.name}`, `Người ngươi từng nghe đồn nay xuất hiện`);
        }
        // Phase 16.3: Mission progress (gặp NPC mới)
        get().incrementMissionProgress('meet_npc');
        break;
      }
      case 'WORLD_LOCATION': {
        set((s) => {
          const existing = s.knowledge.locations[e.id];
          s.knowledge.locations[e.id] = {
            ...existing,
            id: e.id,
            name: e.name,
            type: (e.category as LocationType) ?? existing?.type ?? 'wilderness',
            description: e.description ?? existing?.description ?? '',
            neighbors: existing?.neighbors ?? [],
            discoveredByPlayer: true,
          } as Location;
          if (e.loreId && s.knowledge.loreLocations[e.loreId]) {
            s.knowledge.loreLocations[e.loreId]!.materialized = true;
          }
        });
        if (e.loreId && get().knowledge.loreLocations[e.loreId]) {
          notify.epic(`Đến nơi · ${e.name}`, `Địa danh từng nghe đồn nay hiện ra trước mắt`);
        }
        // Phase 16.3: Mission progress (khám phá location mới)
        get().incrementMissionProgress('discover_location');
        break;
      }

      // ─── Tag taxonomy expand (Refactor 4) ───
      case 'CHARACTER_UPDATE': {
        const isPlayer = e.target.toLowerCase() === 'player' || e.target === get().player?.Name;
        if (isPlayer) {
          set((s) => {
            if (!s.player) return;
            if (e.currency !== undefined) s.player.currency = Math.max(0, s.player.currency + e.currency);
            if (e.hp !== undefined) {
              s.player.finalStats.hp = Math.max(0, Math.min(s.player.finalStats.maxhp, s.player.finalStats.hp + e.hp));
            }
          });
        } else {
          // NPC update — affinity
          if (e.affinity !== undefined) {
            set((s) => {
              const c = s.daoLu[e.target];
              if (c) c.affinity = Math.max(0, Math.min(100, c.affinity + e.affinity!));
            });
          }
        }
        break;
      }
      case 'APPLY_LONG_TERM_STATUS': {
        const tmpl = getLongTermStatus(e.statusId);
        if (!tmpl) {
          console.warn('[tag] Unknown status:', e.statusId);
          break;
        }
        const isPlayer = e.target.toLowerCase() === 'player' || e.target === get().player?.Name;
        if (!isPlayer) break;
        const duration = e.hours ?? tmpl.defaultDurationHours;
        set((s) => {
          if (!s.player) return;
          // Avoid duplicate
          if (s.player.longTermStatuses.some((st) => st.id === tmpl.id)) return;
          s.player.longTermStatuses.push({
            id: tmpl.id,
            name: tmpl.name,
            type: tmpl.severity === 'critical' || tmpl.severity === 'severe' ? 'injury' : 'adventure_debuff',
            description: tmpl.description,
            ...(duration > 0 ? { duration_hours: duration } : {}),
          });
        });
        if (tmpl.appliedNotice) {
          notify.warn(`${tmpl.icon} ${tmpl.name}`, tmpl.appliedNotice);
        } else {
          notify.info(`${tmpl.icon} ${tmpl.name}`, tmpl.description.slice(0, 80));
        }
        break;
      }
      case 'CURE_LONG_TERM_STATUS': {
        const isPlayer = e.target.toLowerCase() === 'player' || e.target === get().player?.Name;
        if (!isPlayer) break;
        const tmpl = getLongTermStatus(e.statusId);
        set((s) => {
          if (!s.player) return;
          s.player.longTermStatuses = s.player.longTermStatuses.filter((st) => st.id.toUpperCase() !== e.statusId.toUpperCase());
        });
        if (tmpl) notify.epic(`Giải trừ · ${tmpl.name}`, 'Đã hồi phục');
        break;
      }
      case 'RELATIONSHIP_CHANGED': {
        // Map standing → affinity delta gợi ý (UI hiển thị notify)
        const standingDelta: Record<string, number> = {
          'thân thiết': +20, 'tri kỷ': +30, 'đạo lữ': +50,
          'trung lập': 0, 'lạnh nhạt': -10,
          'thù địch': -30, 'sinh tử thù': -50,
        };
        const delta = standingDelta[e.standing.toLowerCase()] ?? 0;
        if (delta !== 0) {
          set((s) => {
            const c = s.daoLu[e.npcName];
            if (c) c.affinity = Math.max(0, Math.min(100, c.affinity + delta));
          });
        }
        notify.info(`${e.npcName} · ${e.standing}`, e.reason ?? '');
        break;
      }
      case 'QUEST_OBJECTIVE_COMPLETED': {
        const quest = Object.values(get().quests).find((q) => q.title === e.questTitle);
        if (!quest) break;
        notify.success(`Mục tiêu hoàn thành`, `${e.questTitle}: ${e.objective}${e.quantity ? ` (×${e.quantity})` : ''}`);
        break;
      }
      case 'QUEST_OBJECTIVE_UPDATED': {
        notify.info(`Mục tiêu cập nhật`, `${e.questTitle}: ${e.newText ?? e.objective}`);
        break;
      }
      case 'ENCOUNTER_REWARD': {
        // Phase 11.2: Anti-farm + 4-criteria EP scoring
        const player = get().player;
        if (!player) break;
        const recentReasons = get().knowledge.recentMeaningfulActions.map((a) => a.action);
        const maxExp = calculateMaxExpForLevel(player.level);
        const result = calculateEpReward(
          e.epScore,
          e.reason,
          recentReasons,
          player.level,
          maxExp,
        );

        set((s) => {
          s.ep += result.finalEp;
          s.playerStats.totalEpEarned += Math.max(0, result.finalEp);
          // Auto-record meaningful event nếu raw score cao (≥70 trước khi penalty)
          if (e.epScore >= 70) {
            s.knowledge.eventHistory = pushEvent(s.knowledge.eventHistory, {
              timestamp: Date.now(),
              turn: s.turn,
              kind: 'encounter_high',
              summary: `+${result.finalEp} EP: ${e.reason}`,
            });
          }
        });

        // Convert sang EXP nếu finalEp ≥ threshold
        if (result.expGain > 0) {
          applyGameEvents([{ type: 'EXP_GAIN', amount: result.expGain }], get, set);
        }
        // Phase 16.3: Mission progress khi đạt EP cao
        if (result.finalEp >= 50) {
          get().incrementMissionProgress('high_ep_reward');
        }

        const emoji = result.finalEp >= 80 ? '🌟🌟🌟' : result.finalEp >= 50 ? '🌟🌟' : '🌟';
        const farmHint = result.isFarmed
          ? ` (lặp lại — ×${result.multiplier})`
          : '';
        notify.epic(
          `${emoji} +${result.finalEp} EP${farmHint}`,
          result.expGain > 0
            ? `${e.reason} · +${result.expGain} EXP lĩnh ngộ`
            : e.reason,
        );
        if (result.isFarmed) {
          notify.info(
            'Hành động lặp lại',
            `Hiệu quả "${e.reason.slice(0, 30)}..." giảm còn ${Math.round(result.multiplier * 100)}%.`,
          );
        }
        break;
      }
      case 'TIME_PASSED': {
        set((s) => {
          const t = s.gameTime;
          let hour = t.hour + (e.hours ?? 0);
          let day = t.day + (e.days ?? 0);
          let month = t.month + (e.months ?? 0);
          let year = t.year + (e.years ?? 0);
          // Normalize: 24h/ngày, 30 ngày/tháng, 12 tháng/năm (đơn giản hóa cho game)
          day += Math.floor(hour / 24);
          hour = ((hour % 24) + 24) % 24;
          month += Math.floor((day - 1) / 30);
          day = ((day - 1) % 30 + 30) % 30 + 1;
          year += Math.floor((month - 1) / 12);
          month = ((month - 1) % 12 + 12) % 12 + 1;
          const phase: GameTime['phase'] =
            hour < 5 ? 'midnight' :
            hour < 7 ? 'dawn' :
            hour < 11 ? 'morning' :
            hour < 13 ? 'noon' :
            hour < 17 ? 'afternoon' :
            hour < 19 ? 'dusk' :
            'night';
          s.gameTime = { year, month, day, hour, phase, weather: s.gameTime.weather };
          if (e.weather) s.weather = e.weather;
        });
        break;
      }
      case 'ITEM_IDEA_GAINED': {
        // Lưu thành "lore item" (player biết về món này, chưa có instance thực)
        const id = `lore_item_${e.name.toLowerCase().replace(/\s+/g, '_').slice(0, 40)}`;
        set((s) => {
          if (s.knowledge.loreItems[id]) return;
          s.knowledge.loreItems[id] = {
            id,
            name: e.name,
            description: e.description,
            introducedAtTurn: s.turn,
            materialized: false,
            ...(e.rarity ? { rarity: e.rarity } : {}),
          };
        });
        notify.info(`Phát hiện công thức · ${e.name}`, e.description.slice(0, 80));
        break;
      }
      // ─── Phase 11.3: Trade negotiation dispatchers ───
      case 'ENTER_TRADE_MODE': {
        set((s) => {
          s.traderSession = EMPTY_TRADER_SESSION(e.traderName);
          if (e.attitude) s.traderSession.attitude = e.attitude;
          // Base sell multiplier theo attitude
          if (e.attitude === 'friendly') s.traderSession.sellMultiplier = 1.1;
          else if (e.attitude === 'hostile') s.traderSession.sellMultiplier = 0.7;
        });
        notify.info(`Mở giao dịch · ${e.traderName}`, e.attitude ? `Thái độ: ${e.attitude}` : '');
        break;
      }
      case 'EXIT_TRADE_MODE': {
        const session = get().traderSession;
        if (session) {
          notify.info(`Đóng giao dịch · ${session.traderName}`, '');
        }
        set((s) => { s.traderSession = null; });
        break;
      }
      case 'SELL_VALUATION': {
        set((s) => {
          if (!s.traderSession) return;
          if (e.itemName) {
            s.traderSession.itemSpecificSellBonuses[e.itemName] = e.multiplier;
          } else {
            s.traderSession.sellMultiplier = e.multiplier;
          }
        });
        const target = e.itemName ?? '(toàn bộ)';
        notify.info(`Định giá: ×${e.multiplier.toFixed(2)}`, target);
        break;
      }
      case 'BUY_NEGOTIATION': {
        set((s) => {
          if (!s.traderSession) return;
          // Tìm ware match và update negotiatedMultiplier
          const ware = s.traderSession.wares.find(
            (w) => w.name.toLowerCase() === e.itemName.toLowerCase(),
          );
          if (ware) {
            ware.negotiatedMultiplier = e.multiplier;
          }
          s.traderSession.lastNegotiation = {
            itemName: e.itemName,
            multiplier: e.multiplier,
            turn: s.turn,
          };
        });
        const delta = e.multiplier < 1 ? 'giảm' : e.multiplier > 1 ? 'hét' : 'giữ';
        notify.info(`Mặc cả ${delta} giá · ${e.itemName}`, `×${e.multiplier.toFixed(2)}`);
        break;
      }
      case 'OFFER_ITEM_IDEA': {
        // Push idea vào traderSession.wares — chưa pipeline gen full Item,
        // chỉ tạo placeholder để UI hiển thị. Khi player confirm buy → engine
        // sẽ trigger pipeline gen v2 (sau).
        set((s) => {
          if (!s.traderSession) return;
          const id = `ware_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          s.traderSession.wares.push({
            id,
            name: e.name,
            description: e.description,
            ...(e.rarity ? { rarity: e.rarity } : {}),
            ...(e.category ? { category: e.category } : {}),
            ...(e.price !== undefined ? { price: e.price } : {}),
            materialized: false,
          });
        });
        notify.info(`Trader chào hàng · ${e.name}`, e.description.slice(0, 80));
        break;
      }
      // ─── Phase 23.5: Đại Đạo unlock + XP từ AI ───
      case 'DAO_UNLOCK': {
        useGameStore.getState().unlockDaiDao(e.name, e.description, e.element as import('@gametypes/character').Element | undefined);
        break;
      }
      case 'DAO_XP': {
        const cur = useGameStore.getState().cultivation.dao;
        const r = addDaoXp(cur, e.name, e.amount);
        if (r.daoKey && cur.paths[r.daoKey]) {
          set((s) => { s.cultivation.dao = r.state; });
          if (r.leveledUp) {
            notify.epic(`✦ ${e.name} → Cấp ${r.newLevel}`, {
              message: `Damage element ×${getDaoMul(r.newLevel).toFixed(2)}`,
              action: { target: 'cultivation', label: 'Đạo Tâm' },
            });
          }
        }
        break;
      }
    }
  }
}

export const selectStage = (s: GameState) => s.stage;
export const selectPlayer = (s: GameState) => s.player;
export const selectSettings = (s: GameState) => s.settings;
export const selectStoryLog = (s: GameState) => s.storyLog;
export const selectActions = (s: GameState) => s.currentActions;
export const selectActionChoices = (s: GameState) => s.currentActionChoices;
export const selectIsAiThinking = (s: GameState) => s.isAiThinking;
export const selectAiPhase = (s: GameState) => s.aiPhase;
export const selectLastError = (s: GameState) => s.lastError;
export const selectInventory = (s: GameState) => s.inventory;
// Phase 15: Economy selectors
export const selectEconomy = (s: GameState) => s.economy;
export const selectTienNgoc = (s: GameState) => s.economy.tienNgoc;
export const selectActionTokens = (s: GameState) => s.economy.actionTokens;
export const selectSkills = (s: GameState) => s.skills;
export const selectCombat = (s: GameState) => s.combat;
export const selectQuests = (s: GameState) => s.quests;
export const selectLocations = (s: GameState) => s.knowledge.locations;
export const selectSectMembership = (s: GameState) => s.sectMembership;
export const selectClaimedMissions = (s: GameState) => s.claimedMissions;
export const selectSecretRealm = (s: GameState) => s.secretRealm;
export const selectSpiritBeasts = (s: GameState) => s.spiritBeasts;
export const selectActiveBeast = (s: GameState) => s.activeBeastId ? s.spiritBeasts[s.activeBeastId] : null;
export const selectCaveAbode = (s: GameState) => s.caveAbode;
export const selectDaoLu = (s: GameState) => s.daoLu;
export { HERB_CATALOG, maxPlotsForLevel, ROOM_DISPLAY } from '@gametypes/cave-abode';
export { PILL_RECIPES, getPillRecipe } from '@data/pill-recipes';
export { BEAST_TEMPLATES, getBeastTemplate, findTemplateByEnemyName } from '@data/default-beasts';
export { applyBeastExp, canEvolve, beastMaxExp } from '@core/cultivation/spirit-beasts';

// Re-export sect data for convenience
export { DEFAULT_SECTS, SECT_MISSION_POOL, TANG_KINH_CATALOG, getSect } from '@data/default-sects';
export { SECT_RANK_DISPLAY, SECT_RANK_ORDER, SECT_RANK_REQUIREMENT } from '@gametypes/sect';

// ─── Phase 8.3: Fan-fic aware selectors ───
import { DEFAULT_SECTS as _DEFAULT_SECTS } from '@data/default-sects';
import { BEAST_TEMPLATES as _BEAST_TEMPLATES } from '@data/default-beasts';
import type { Sect } from '@gametypes/sect';
import type { BeastTemplate } from '@gametypes/spirit-beast';

/**
 * Get sects available cho universe hiện tại.
 * Fan-fic mode → return AI-generated sects (replace defaults).
 * Default mode → return 15 default sects.
 */
export const selectAvailableSects = (s: GameState): Sect[] => {
  const fanFicSects = (s.settings as { _fanFicSects?: Sect[] })._fanFicSects;
  if (s.settings.isFanFictionMode && fanFicSects && fanFicSects.length > 0) {
    return fanFicSects;
  }
  return _DEFAULT_SECTS;
};

/**
 * Get beasts available cho universe hiện tại.
 * Fan-fic mode → return AI-generated beasts + giữ lại defaults làm fallback chung.
 * Default mode → return 25 default beasts.
 */
export const selectAvailableBeasts = (s: GameState): BeastTemplate[] => {
  const fanFicBeasts = (s.settings as { _fanFicBeasts?: BeastTemplate[] })._fanFicBeasts;
  if (s.settings.isFanFictionMode && fanFicBeasts && fanFicBeasts.length > 0) {
    // Fan-fic beasts ưu tiên, nhưng vẫn giữ defaults cho random encounter
    return [...fanFicBeasts, ..._BEAST_TEMPLATES];
  }
  return _BEAST_TEMPLATES;
};

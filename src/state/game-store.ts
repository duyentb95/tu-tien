import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { PlayerCharacter } from '@gametypes/character';
import type { Item, ItemCategory, Rarity } from '@gametypes/item';
import type { Skill, SkillKind } from '@gametypes/skill';
import type { Location, LocationType, GameTime, Faction } from '@gametypes/world';
import type { LoreNPC, LoreLocation, LoreItem, LoreQuest } from '@gametypes/lore';
import type { MeaningfulEvent, RecentAction, CustomRule } from '@gametypes/memory';
import { pushEvent, pushAction } from '@gametypes/memory';
import { getLongTermStatus } from '@data/long-term-statuses';
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
}

export interface StoryEntry {
  id: string;
  turn: number;
  timestamp: number;
  kind: 'narrative' | 'player_action' | 'system';
  segments?: StorySegment[];
  content?: string;
}

interface GameState {
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

  isAiThinking: boolean;
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
  /** Dưỡng pháp bảo: tiêu linh thạch → tăng artifactSoul → có thể level up */
  nourishArtifactAction: (itemId: string, currencyAmount: number) => void;

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
    isAiThinking: false,
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
        const prompt = buildFanFicAnalyzePrompt(form);
        const result = await callGemini(prompt, {
          temperature: 0.7,           // thấp hơn narrative để bám nguyên tác
          maxOutputTokens: 2000,
          responseMimeType: 'application/json',
          schema: FanFicAnalyzeSchema,
        });

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

          // Seed initialWorldElements vào knowledge
          for (const elem of result.initialWorldElements) {
            const id = elem.name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
            if (elem.type === 'LOCATION') {
              s.knowledge.locations[id] = {
                id,
                name: elem.name,
                type: 'wilderness',
                description: elem.description,
                neighbors: [],
                discoveredByPlayer: true,
                visitedByPlayer: false,
              } as Location;
            } else if (elem.type === 'NPC') {
              s.knowledge.characters[id] = {
                id,
                name: elem.name,
                description: elem.description,
                role: 'npc',
              };
            }
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
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        set((s) => {
          s.isAiThinking = false;
          s.lastError = `[fan-fic] Phân tích thất bại: ${msg}`;
        });
        throw err;
      }
    },

    startNewGame: async (init) => {
      const player = makePlayer(init);
      player.current_location_id = 'thanh_van_phong';
      set((s) => {
        s.player = player;
        Object.assign(s.settings, init.settings);
        s.storyLog = [];
        s.currentActions = [];
        s.turn = 0;
        s.inventory = {};
        s.skills = {};
        // Initialize world: load default locations + factions
        const locDict: Record<string, MapLocation> = {};
        DEFAULT_LOCATIONS.forEach((l) => {
          locDict[l.id] = { ...l };
        });
        const facDict: Record<string, typeof DEFAULT_FACTIONS[number]> = {};
        DEFAULT_FACTIONS.forEach((f) => {
          facDict[f.id] = f;
        });
        s.knowledge.locations = locDict;
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
          s.turn = 1;
          s.isAiThinking = false;
        });

        // Apply tag events từ chunk đầu tiên
        applyGameEvents(parseGameTags(parsed.raw), get, set);

        get().saveToLocalStorage();
      } catch (err) {
        set((s) => {
          s.isAiThinking = false;
          s.lastError = err instanceof Error ? err.message : String(err);
        });
      }
    },

    submitAction: async (actionText) => {
      const state = get();
      if (!state.player || state.isAiThinking) return;

      set((s) => {
        s.storyLog.push({
          id: crypto.randomUUID(),
          turn: s.turn + 1,
          timestamp: Date.now(),
          kind: 'player_action',
          content: actionText,
        });
        s.turn += 1;
        s.currentActions = [];
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
          s.isAiThinking = false;
        });

        // Apply tag events
        applyGameEvents(parseGameTags(parsed.raw), get, set);

        get().saveToLocalStorage();
      } catch (err) {
        set((s) => {
          s.isAiThinking = false;
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

      let state = executeAction(combat, action);

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

    allocatePoint: (stat, amount) => {
      set((s) => {
        if (!s.player) return;
        if (s.player.ap < amount) return;
        s.player.allocatedPoints[stat] += amount;
        s.player.ap -= amount;
        s.player = recomputeStats(s.player, s.inventory);
      });
      notify.success('Phân phối điểm', `+${amount} ${stat.toUpperCase()}`);
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
          s.isAiThinking = false;
          s.prevStage = s.stage;
          s.stage = 'playing';
        });

        applyGameEvents(parseGameTags(parsed.raw), get, set);
        get().saveToLocalStorage();
      } catch (err) {
        set((s) => {
          s.isAiThinking = false;
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
      notify.success(`+${amount} Cống Hiến`, '');

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
        const { player, settings, storyLog, currentActions, turn, knowledge, inventory, skills, quests, sectMembership, claimedMissions, secretRealm, spiritBeasts, activeBeastId, caveAbode, daoLu } = get();
        const payload = JSON.stringify({
          version: 8,
          savedAt: Date.now(),
          player, settings, storyLog, currentActions, turn, knowledge, inventory, skills, quests,
          sectMembership, claimedMissions, secretRealm, spiritBeasts, activeBeastId, caveAbode, daoLu,
        });
        localStorage.setItem(SAVE_KEY, payload);
      } catch (e) {
        console.warn('[saveToLocalStorage]', e);
      }
    },

    syncToCloud: async () => {
      const { player, settings, storyLog, currentActions, turn, knowledge, inventory, skills, quests, sectMembership, claimedMissions, secretRealm, spiritBeasts, activeBeastId, caveAbode } = get();
      if (!player) {
        notify.warn('Không có save để sync', 'Tạo nhân vật trước');
        return false;
      }
      const result = await saveToCloud({
        version: 7,
        savedAt: Date.now(),
        data: { player, settings, storyLog, currentActions, turn, knowledge, inventory, skills, quests, sectMembership, claimedMissions, secretRealm, spiritBeasts, activeBeastId, caveAbode } as Record<string, unknown>,
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
        set((s) => {
          if (!s.player) return;
          const r = applyExpGain(s.player.level, s.player.exp, e.amount);
          s.player.level = r.newLevel;
          s.player.exp = r.newExp;
          s.player.maxExp = r.newMaxExp;
          s.player.ap += r.apEarned;
          if (r.levelsGained > 0) {
            s.player.realm = getRealmInfoFromLevel(
              r.newLevel,
              s.knowledge.realmProgressionList,
            ).realmName;
          }
        });
        notify.success(`+${e.amount} Tu Vi`, '');
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
        const bonuses = generateItemBonuses(rarityNorm, category, playerLevel);
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
        });
        notify.epic('ĐỘT PHÁ!', 'Cảnh giới mới khai mở');
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
          s.tribulationContext = { ...(e.reason !== undefined ? { reason: e.reason } : {}) };
          s.prevStage = s.stage;
          s.stage = 'tribulation';
        });
        notify.warn('Độ kiếp đến!', e.reason ?? 'Thiên kiếp giáng lâm');
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
        set((s) => {
          if (!s.player) return;
          s.player.longTermStatuses.push({
            id: e.statusId,
            name: e.statusId,
            type: 'adventure_debuff',
            description: '',
            ...(e.durationHours !== undefined ? { duration_hours: e.durationHours } : {}),
          });
        });
        notify.warn(`Trạng thái: ${e.statusId}`, '');
        break;
      }
      case 'STATUS_CURE': {
        set((s) => {
          if (!s.player) return;
          s.player.longTermStatuses = s.player.longTermStatuses.filter((st) => st.id !== e.statusId);
        });
        notify.success(`Hết trạng thái: ${e.statusId}`, '');
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
        const target = e.target?.toLowerCase();
        set((s) => {
          s.ep += e.epScore;
          // Auto-record meaningful event nếu score cao
          if (e.epScore >= 70) {
            s.knowledge.eventHistory = pushEvent(s.knowledge.eventHistory, {
              timestamp: Date.now(),
              turn: s.turn,
              kind: 'encounter_high',
              summary: `+${e.epScore} EP: ${e.reason}`,
            });
          }
        });
        const emoji = e.epScore >= 80 ? '🌟🌟🌟' : e.epScore >= 50 ? '🌟🌟' : '🌟';
        notify.epic(`${emoji} +${e.epScore} EP`, e.reason);
        void target;
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
    }
  }
}

export const selectStage = (s: GameState) => s.stage;
export const selectPlayer = (s: GameState) => s.player;
export const selectSettings = (s: GameState) => s.settings;
export const selectStoryLog = (s: GameState) => s.storyLog;
export const selectActions = (s: GameState) => s.currentActions;
export const selectIsAiThinking = (s: GameState) => s.isAiThinking;
export const selectLastError = (s: GameState) => s.lastError;
export const selectInventory = (s: GameState) => s.inventory;
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

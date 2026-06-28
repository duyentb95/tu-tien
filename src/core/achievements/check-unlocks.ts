/**
 * Phase 19.5: Pure helpers compute achievement progress + detect new unlocks.
 *
 * Shared giữa AchievementsModal (UI display) và store action
 * (notify khi user mới unlock — track diff so với prev unlockedIds).
 *
 * KHÔNG import React, KHÔNG side-effect — testable thuần.
 */

import { ACHIEVEMENTS, type Achievement } from '@data/achievements';

export type AchievementTriggerKind = NonNullable<Achievement['trigger']>['kind'];

export interface AchievementProgressInputs {
  playerLevel: number;
  playerCurrency: number;
  turn: number;
  realmBreaks: number;
  tribulations: number;
  beastCount: number;
  questCompleted: number;
  daoLuPartnered: number;
  sectJoined: boolean;
  locationVisited: number;
  /** Phase 20: lifetime stats wire 4 TODO achievement */
  totalKills?: number;
  totalEpEarned?: number;
  legendaryItemsOwned?: number;
}

export type AchievementProgress = Record<AchievementTriggerKind, number>;

/** Build progress map từ snapshot game state (pure). */
export const computeAchievementProgress = (
  i: AchievementProgressInputs,
): AchievementProgress => ({
  first_realm_break: i.realmBreaks,
  realm_count: i.playerLevel,
  first_kill: i.totalKills ?? 0,
  kill_count: i.totalKills ?? 0,
  first_beast_capture: i.beastCount,
  beast_count: i.beastCount,
  first_dao_lu: i.daoLuPartnered,
  sect_joined: i.sectJoined ? 1 : 0,
  first_quest: i.questCompleted,
  quest_count: i.questCompleted,
  first_tribulation: i.tribulations,
  tribulation_count: i.tribulations,
  currency_total: i.playerCurrency,
  ep_total: i.totalEpEarned ?? 0,
  location_count: i.locationVisited,
  turn_count: i.turn,
  item_legendary: i.legendaryItemsOwned ?? 0,
});

/** Check 1 achievement đã unlock chưa */
export const isAchievementUnlocked = (
  a: Achievement,
  progress: AchievementProgress,
): boolean => {
  if (!a.trigger) return false;
  const value = progress[a.trigger.kind];
  const threshold = a.trigger.threshold ?? 1;
  return value >= threshold;
};

/** Diff prev vs current — return list ID achievement vừa unlock */
export const detectNewlyUnlocked = (
  progress: AchievementProgress,
  prevUnlockedIds: string[],
): Achievement[] => {
  const set = new Set(prevUnlockedIds);
  return ACHIEVEMENTS.filter(
    (a) => !set.has(a.id) && isAchievementUnlocked(a, progress),
  );
};

/**
 * Phase 17.1: Hidden + Extended Quests — chuỗi quest multi-step với unlock condition.
 *
 * Khác với Quest (single-objective) trong types/quest.ts:
 *   - ExtendedQuest có nhiều `steps[]`, mỗi step có objective + reward riêng + step lớn cuối.
 *   - Hidden quest: hiển thị "???" trong UI cho đến khi unlock condition pass.
 *   - Unlock condition: function check game state (vd "level ≥ 10", "có item X").
 *
 * Lưu state riêng `state.extendedQuests` (không trộn với quests/ event AI):
 *   - Mỗi quest template ID → { currentStep, completed, claimed, unlockedAt }.
 *   - Auto-check progress sau mỗi turn / event.
 */

import type { GameState } from '@state/game-store';

export interface QuestStepReward {
  tienNgoc?: number;
  actionTokens?: number;
  exp?: number;
  currency?: number; // Linh Thạch
  itemName?: string;
  itemRarity?: string;
}

export interface ExtendedQuestStep {
  /** Tên step ngắn */
  title: string;
  /** Mô tả 1-2 câu */
  description: string;
  /** Check completion — pure function của game state.
   *  Trả về true khi đã đạt mục tiêu step này. */
  check: (state: GameState) => boolean;
  /** Reward khi complete step này */
  reward: QuestStepReward;
}

export interface ExtendedQuestTemplate {
  id: string;
  /** Title hiển thị (nếu hidden + chưa unlock → show "???") */
  title: string;
  /** Mô tả ngắn quest line */
  description: string;
  /** Hidden = không hiển thị trong list trước khi unlock */
  hidden: boolean;
  /** Unlock condition (true → reveal). Default = always true (visible from start). */
  unlockCondition?: (state: GameState) => boolean;
  /** Hint cho hidden quest (vd "Tìm hiểu sâu hơn về Đại Hoang...") */
  hint?: string;
  /** Steps tuần tự — phải complete theo thứ tự */
  steps: ExtendedQuestStep[];
  /** Reward tổng kết khi hoàn thành toàn bộ chuỗi */
  finalReward: QuestStepReward;
  /** Category — đường dẫn ý nghĩa */
  category: 'main-story' | 'cultivation' | 'lore' | 'romance' | 'combat' | 'craft' | 'secret';
}

export interface ExtendedQuestProgress {
  /** Index step hiện tại (0-based). Khi == steps.length → done */
  currentStep: number;
  /** Đã unlock chưa (revealed cho user thấy) */
  unlocked: boolean;
  /** Đã hoàn thành toàn bộ chuỗi (currentStep === steps.length) */
  completed: boolean;
  /** Đã claim final reward */
  claimedFinal: boolean;
  /** Turn lúc unlock (cho UI history) */
  unlockedAtTurn?: number;
  /** Turn lúc hoàn thành */
  completedAtTurn?: number;
  /** Step rewards đã claim (array của step idx) */
  claimedSteps: number[];
}

export interface ExtendedQuestsState {
  /** templateId → progress */
  progress: Record<string, ExtendedQuestProgress>;
}

export const INITIAL_EXTENDED_QUESTS: ExtendedQuestsState = { progress: {} };

export const makeProgress = (): ExtendedQuestProgress => ({
  currentStep: 0,
  unlocked: false,
  completed: false,
  claimedFinal: false,
  claimedSteps: [],
});

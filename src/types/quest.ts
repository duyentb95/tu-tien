export type QuestStatus = 'active' | 'completed' | 'failed' | 'abandoned';
export type QuestKind = 'main' | 'side' | 'sect' | 'cultivation' | 'hidden';

export interface QuestReward {
  exp?: number;
  currency?: number;
  itemName?: string;
  itemRarity?: string;
  skillName?: string;
  reputation?: { factionId: string; delta: number };
}

export interface Quest {
  id: string;
  title: string;
  kind: QuestKind;
  description: string;
  objectives: string[];           // bullet points hiển thị
  rewardDescription?: string;
  giver?: string;                 // tên NPC giao quest
  locationId?: string;            // nơi liên quan
  status: QuestStatus;
  acceptedAtTurn: number;
  completedAtTurn?: number;
  /** Có thể null nếu là quest mở / không có reward cụ thể */
  reward?: QuestReward;
}

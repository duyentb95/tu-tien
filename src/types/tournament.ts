/**
 * Sect Tournament — Nội Môn Đại Hội pattern.
 *
 * Single-elimination bracket 8 đệ tử (7 NPC + 1 player).
 * Mỗi match: tự động roll win/lose dựa trên power (atk + def + level).
 * Player match — vẫn tự động (không vào combat screen) để giữ tournament flow nhanh.
 *
 * Reward: top 4 nhận cống hiến điểm + linh thạch. Top 1 nhận pháp khí Hiếm.
 */

export interface TournamentParticipant {
  id: string;
  name: string;
  level: number;
  /** Power score = level × 10 + atk + def + random factor */
  power: number;
  isPlayer?: boolean;
  /** NPC archetype description (cho narrative flavor) */
  archetype?: string;
}

export interface TournamentMatch {
  matchId: string;
  round: number;             // 1 = quarter-final, 2 = semi, 3 = final
  participant1: TournamentParticipant;
  participant2: TournamentParticipant;
  winnerId?: string;
  /** Narrative ngắn 1-2 câu mô tả match */
  summary?: string;
}

export interface TournamentBracket {
  id: string;
  sectId: string;
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
  currentRound: number;
  status: 'pending' | 'in_progress' | 'completed';
  playerRank?: number;       // 1, 2, 3-4, 5-8
  createdAtTurn: number;
}

export interface TournamentReward {
  rank: number;
  contribution: number;
  currency: number;
  itemName?: string;
}

export const TOURNAMENT_REWARDS: TournamentReward[] = [
  { rank: 1, contribution: 500, currency: 5000, itemName: 'Tử Tinh Kiếm Quyết · Bí Kíp' },
  { rank: 2, contribution: 300, currency: 2500, itemName: 'Hộ Thân Phù · Hiếm' },
  { rank: 3, contribution: 200, currency: 1500 },
  { rank: 4, contribution: 200, currency: 1500 },
  { rank: 5, contribution: 100, currency: 500 },
  { rank: 6, contribution: 100, currency: 500 },
  { rank: 7, contribution: 50, currency: 200 },
  { rank: 8, contribution: 50, currency: 200 },
];

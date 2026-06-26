/**
 * Tournament bracket generator + simulator — pure functions, testable.
 */

import type {
  TournamentBracket,
  TournamentMatch,
  TournamentParticipant,
} from '@gametypes/tournament';

const NPC_NAMES = [
  'Tống Nhược Huyền', 'Lý Tử Tằm', 'Nguyên Đỉnh', 'Hoa Lệ',
  'Bạch Vô Sự', 'Hắc Diện Lang', 'Phương Bạt', 'Mặc Vũ Thành',
  'Vân Quy Khứ', 'Trầm Mặc', 'Tô Linh', 'Hạ Tâm Phong',
];

const NPC_ARCHETYPES = [
  'Kiếm tu nội liễm, chuyên kiếm pháp', 'Đan sư trẻ tuổi, công thủ vẹn toàn',
  'Phù sư, mạnh về tầm xa', 'Thể tu cường tráng, cận chiến áp đảo',
  'Phong hệ linh căn, tốc độ vô song', 'Hỏa hệ bộc phát',
  'Băng tu lạnh lùng',
];

/** Generate 7 NPCs đối thủ với power range gần player */
export const generateNPCs = (playerLevel: number, rng: () => number = Math.random): TournamentParticipant[] => {
  const npcs: TournamentParticipant[] = [];
  const shuffledNames = [...NPC_NAMES].sort(() => rng() - 0.5).slice(0, 7);
  for (let i = 0; i < 7; i++) {
    // Spread level around player: -3 → +3
    const lvl = Math.max(1, playerLevel + Math.floor(rng() * 7) - 3);
    const baseAtk = 15 + lvl * 3;
    const baseDef = 8 + lvl * 2;
    npcs.push({
      id: `npc_t_${i}`,
      name: shuffledNames[i] ?? `Đệ tử ${i + 1}`,
      level: lvl,
      power: lvl * 10 + baseAtk + baseDef + Math.floor(rng() * 30),
      archetype: NPC_ARCHETYPES[Math.floor(rng() * NPC_ARCHETYPES.length)] ?? '',
    });
  }
  return npcs;
};

/** Tạo bracket 8 người: 7 NPC + 1 player. Round 1 = QF (4 matches), R2 = SF (2), R3 = F (1) */
export const createBracket = (
  sectId: string,
  player: TournamentParticipant,
  turn: number,
  rng: () => number = Math.random,
): TournamentBracket => {
  const npcs = generateNPCs(player.level, rng);
  // Shuffle 8 participants để tạo random matchup
  const all = [player, ...npcs].sort(() => rng() - 0.5);

  const matches: TournamentMatch[] = [];
  // Round 1: 4 matches
  for (let i = 0; i < 4; i++) {
    matches.push({
      matchId: `r1_m${i + 1}`,
      round: 1,
      participant1: all[i * 2]!,
      participant2: all[i * 2 + 1]!,
    });
  }
  return {
    id: `tourney_${Date.now()}`,
    sectId,
    participants: all,
    matches,
    currentRound: 1,
    status: 'pending',
    createdAtTurn: turn,
  };
};

/** Roll winner — weighted by power + small luck factor */
export const rollMatchWinner = (
  m: TournamentMatch,
  rng: () => number = Math.random,
): TournamentParticipant => {
  const p1 = m.participant1;
  const p2 = m.participant2;
  const totalPower = p1.power + p2.power;
  const p1Chance = totalPower > 0 ? p1.power / totalPower : 0.5;
  // Luck swing ±15%
  const adjusted = p1Chance + (rng() - 0.5) * 0.3;
  return rng() < adjusted ? p1 : p2;
};

/** Advance bracket — simulate current round matches + generate next round */
export const advanceBracket = (
  bracket: TournamentBracket,
  rng: () => number = Math.random,
): TournamentBracket => {
  const currentMatches = bracket.matches.filter((m) => m.round === bracket.currentRound);
  const newMatches: TournamentMatch[] = bracket.matches.map((m) => {
    if (m.round === bracket.currentRound && !m.winnerId) {
      const winner = rollMatchWinner(m, rng);
      return {
        ...m,
        winnerId: winner.id,
        summary: `${winner.name} chiến thắng ${winner.id === m.participant1.id ? m.participant2.name : m.participant1.name}`,
      };
    }
    return m;
  });

  const winners = currentMatches.map((m) => {
    const updated = newMatches.find((x) => x.matchId === m.matchId)!;
    return updated.participant1.id === updated.winnerId
      ? updated.participant1
      : updated.participant2;
  });

  // Spawn next round matches
  if (winners.length >= 2) {
    const nextRound = bracket.currentRound + 1;
    for (let i = 0; i < winners.length / 2; i++) {
      newMatches.push({
        matchId: `r${nextRound}_m${i + 1}`,
        round: nextRound,
        participant1: winners[i * 2]!,
        participant2: winners[i * 2 + 1]!,
      });
    }
  }

  const isComplete = winners.length === 1;
  return {
    ...bracket,
    matches: newMatches,
    currentRound: isComplete ? bracket.currentRound : bracket.currentRound + 1,
    status: isComplete ? 'completed' : 'in_progress',
    playerRank: isComplete ? computePlayerRank(newMatches, bracket.participants) : undefined,
  };
};

/** Tính rank player dựa trên match losses */
const computePlayerRank = (
  matches: TournamentMatch[],
  participants: TournamentParticipant[],
): number => {
  const player = participants.find((p) => p.isPlayer);
  if (!player) return 8;
  // Round player thua = rank: R1 thua = 5-8, R2 = 3-4, R3 = 2, R3 thắng = 1
  const playerMatches = matches.filter(
    (m) => m.participant1.id === player.id || m.participant2.id === player.id,
  );
  const lastMatch = playerMatches[playerMatches.length - 1];
  if (!lastMatch || !lastMatch.winnerId) return 8;
  if (lastMatch.winnerId === player.id && lastMatch.round === 3) return 1;
  if (lastMatch.winnerId !== player.id) {
    if (lastMatch.round === 3) return 2;
    if (lastMatch.round === 2) return 3;
    return 5;
  }
  return 5;
};

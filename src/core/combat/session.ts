import type { Character, FinalStats } from '@gametypes/character';
import { calculateDamage } from './damage';

/**
 * Combat session — turn-based, pure state machine.
 * Khởi tạo với 2 phe (player + enemies), produce events qua từng action.
 */

export interface Combatant {
  id: string;
  name: string;
  level: number;
  isPlayer: boolean;
  finalStats: FinalStats;
  /** Pointer về Character gốc (read-only — không mutate) */
  ref?: Character;
}

export interface CombatLogEntry {
  turn: number;
  text: string;
  kind: 'damage' | 'heal' | 'status' | 'skill' | 'narrative' | 'end';
  /** Nếu là damage thì có amount + target */
  amount?: number;
  targetId?: string;
  crit?: boolean;
  dodged?: boolean;
}

export interface CombatState {
  combatants: Combatant[];
  /** Index trong combatants[] theo SPD desc */
  initiative: number[];
  /** Vị trí hiện tại trong initiative */
  currentTurnIdx: number;
  turn: number; // mỗi lượt 1 combatant
  round: number; // mỗi round = 1 vòng tất cả
  log: CombatLogEntry[];
  status: 'ongoing' | 'player_win' | 'enemy_win' | 'fled';
}

export const createCombatSession = (
  player: Combatant,
  enemies: Combatant[],
): CombatState => {
  const combatants = [player, ...enemies];
  const initiative = [...combatants.keys()].sort(
    (a, b) => combatants[b]!.finalStats.spd - combatants[a]!.finalStats.spd,
  );
  return {
    combatants,
    initiative,
    currentTurnIdx: 0,
    turn: 1,
    round: 1,
    log: [
      {
        turn: 0,
        text: `Trận chiến bắt đầu! ${combatants.map((c) => c.name).join(' vs ')}`,
        kind: 'narrative',
      },
    ],
    status: 'ongoing',
  };
};

export interface SkillAction {
  kind: 'attack' | 'skill_basic' | 'skill_ultimate' | 'flee';
  skillName?: string;
  skillMultiplier?: number;
  /** Index của target trong combatants[]. Mặc định = enemy đầu còn sống. */
  targetIdx?: number;
}

/**
 * Thực thi 1 action của combatant hiện tại → return state mới.
 */
export const executeAction = (state: CombatState, action: SkillAction): CombatState => {
  if (state.status !== 'ongoing') return state;

  const actorIdx = state.initiative[state.currentTurnIdx]!;
  const actor = state.combatants[actorIdx]!;
  const log: CombatLogEntry[] = [...state.log];

  // Flee
  if (action.kind === 'flee') {
    if (actor.isPlayer) {
      log.push({ turn: state.turn, text: `${actor.name} bỏ chạy khỏi trận chiến!`, kind: 'end' });
      return { ...state, log, status: 'fled' };
    }
  }

  // Find target — default enemy đầu còn sống
  const aliveTargets = state.combatants
    .map((c, i) => ({ c, i }))
    .filter(({ c, i }) => i !== actorIdx && c.isPlayer !== actor.isPlayer && c.finalStats.hp > 0);

  if (aliveTargets.length === 0) {
    // Hết enemy → win
    return { ...state, status: actor.isPlayer ? 'player_win' : 'enemy_win' };
  }

  const targetIdx = action.targetIdx ?? aliveTargets[0]!.i;
  const target = state.combatants[targetIdx]!;
  const skillMult = action.skillMultiplier ?? (action.kind === 'skill_ultimate' ? 2.8 : action.kind === 'skill_basic' ? 1.5 : 1.0);

  const result = calculateDamage({
    attacker: actor.finalStats,
    attackerLevel: actor.level,
    defender: target.finalStats,
    defenderLevel: target.level,
    skillMultiplier: skillMult,
  });

  const newCombatants = state.combatants.map((c, i) =>
    i === targetIdx
      ? { ...c, finalStats: { ...c.finalStats, hp: Math.max(0, c.finalStats.hp - result.damage) } }
      : c,
  );

  if (result.dodged) {
    log.push({
      turn: state.turn,
      text: `${actor.name} ${action.skillName ?? 'đánh thường'} nhắm ${target.name} — Né tránh!`,
      kind: 'damage',
      targetId: target.id,
      amount: 0,
      dodged: true,
    });
  } else {
    const critTag = result.crit ? ' (Chí mạng!)' : '';
    log.push({
      turn: state.turn,
      text: `${actor.name} dùng ${action.skillName ?? 'Đánh Thường'} → ${target.name} mất ${result.damage} HP${critTag}`,
      kind: 'damage',
      targetId: target.id,
      amount: result.damage,
      crit: result.crit,
    });
  }

  // Check win/loss
  const playerAlive = newCombatants.some((c) => c.isPlayer && c.finalStats.hp > 0);
  const enemiesAlive = newCombatants.some((c) => !c.isPlayer && c.finalStats.hp > 0);

  let status: CombatState['status'] = 'ongoing';
  if (!playerAlive) status = 'enemy_win';
  else if (!enemiesAlive) status = 'player_win';

  if (status !== 'ongoing') {
    log.push({
      turn: state.turn,
      text: status === 'player_win' ? `${actor.isPlayer ? 'Ngươi' : 'Người chơi'} chiến thắng!` : 'Ngươi đã bại trận…',
      kind: 'end',
    });
    return { ...state, combatants: newCombatants, log, status };
  }

  // Next turn
  let nextIdx = (state.currentTurnIdx + 1) % state.initiative.length;
  // Skip dead combatants
  while (newCombatants[state.initiative[nextIdx]!]!.finalStats.hp <= 0) {
    nextIdx = (nextIdx + 1) % state.initiative.length;
  }
  const newRound = nextIdx === 0 ? state.round + 1 : state.round;

  return {
    ...state,
    combatants: newCombatants,
    log,
    currentTurnIdx: nextIdx,
    turn: state.turn + 1,
    round: newRound,
  };
};

/**
 * AI heuristic: enemy chọn action.
 * - HP < 30% & có heal → heal (chưa support, sẽ thêm sau)
 * - Otherwise: đánh thường nhằm vào player
 */
export const enemyAutoAction = (_state: CombatState): SkillAction => {
  // V1 đơn giản: cứ skill_basic
  return { kind: 'skill_basic', skillName: 'Nha Kích' };
};

/**
 * Helper: tạo enemy combatant scale theo level.
 * Stats tăng cấp số nhân nhẹ.
 */
export const makeEnemyCombatant = (
  name: string,
  level: number,
  variant: 'beast' | 'cultivator' | 'demon' = 'beast',
): Combatant => {
  const base = level * 1.1 ** level;
  const variantMult = variant === 'cultivator' ? 1.2 : variant === 'demon' ? 1.4 : 1.0;
  return {
    id: crypto.randomUUID(),
    name,
    level,
    isPlayer: false,
    finalStats: {
      hp: Math.round(180 * base * variantMult),
      maxhp: Math.round(180 * base * variantMult),
      atk: Math.round(15 * base * variantMult),
      def: Math.round(8 * base * variantMult),
      spd: Math.round(25 + level * 2),
      cr: 5,
      cdmg: 150,
      dmgAmp: 0,
      dmgRes: 0,
      evasion: variant === 'beast' ? 8 : 5,
    },
  };
};

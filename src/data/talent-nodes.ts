/**
 * Phase 24.A: Talent node registry.
 * Mỗi tier (3/4/5) cho 3 nhánh (ATK/DEF/UTILITY). Tổng 9 talent per skill.
 *
 * Effect scaling theo tier: t3 < t4 < t5.
 * Apply universally cho mọi skill (không cần data riêng cho từng skill).
 */
import type { TalentNode, TalentBranch } from '@gametypes/skill-deep';

export const TALENT_NODES: Record<3 | 4 | 5, Record<TalentBranch, TalentNode>> = {
  3: {
    atk: {
      tier: 3, branch: 'atk',
      name: 'Sát Khí Bùng Phát',
      description: 'Tăng +15% damage skill khi cast.',
      effect: { damageBonus: 0.15 },
    },
    def: {
      tier: 3, branch: 'def',
      name: 'Hộ Thân Quyết',
      description: '+20% DEF trong 1 turn sau khi cast skill.',
      effect: { defBuff: 0.20 },
    },
    utility: {
      tier: 3, branch: 'utility',
      name: 'Tốc Pháp',
      description: '-15% cooldown cho skill này.',
      effect: { cooldownReduce: 0.15 },
    },
  },
  4: {
    atk: {
      tier: 4, branch: 'atk',
      name: 'Phá Vạn Pháp',
      description: '+25% damage + 10% bỏ qua DEF địch.',
      effect: { damageBonus: 0.25, passiveFlag: 'pen_10' },
    },
    def: {
      tier: 4, branch: 'def',
      name: 'Phản Đả Khí',
      description: 'Mỗi đòn skill hấp thu 10% damage gây ra thành HP.',
      effect: { lifesteal: 0.10 },
    },
    utility: {
      tier: 4, branch: 'utility',
      name: 'Tâm Pháp Vô Vi',
      description: '-25% cooldown + 5% chance không tốn linh khí.',
      effect: { cooldownReduce: 0.25, passiveFlag: 'free_cast_5pct' },
    },
  },
  5: {
    atk: {
      tier: 5, branch: 'atk',
      name: 'Thiên Sát',
      description: '+40% damage + bạo kích chắc chắn lần đầu mỗi combat.',
      effect: { damageBonus: 0.40, critGuarantee: 1, passiveFlag: 'crit_first' },
    },
    def: {
      tier: 5, branch: 'def',
      name: 'Bất Diệt Quyết',
      description: '+5 HP regen/turn khi skill này trong slot equip.',
      effect: { healOverTime: 5 },
    },
    utility: {
      tier: 5, branch: 'utility',
      name: 'Tiên Pháp Vô Cùng',
      description: '-40% cooldown + mỗi 3 cast bonus 1 cast miễn phí.',
      effect: { cooldownReduce: 0.40, passiveFlag: 'free_every_3' },
    },
  },
};

export const TALENT_BRANCH_LABEL: Record<TalentBranch, { label: string; color: string; icon: string }> = {
  atk: { label: 'Sát Đạo', color: 'var(--ember-400)', icon: '⚔' },
  def: { label: 'Hộ Đạo', color: 'var(--jade-400)', icon: '🛡' },
  utility: { label: 'Linh Đạo', color: 'var(--spirit-300)', icon: '✦' },
};

/** Reset cost theo số lần đã reset trước đó (geometric). */
export const getTalentResetCost = (resetCount: number): number => {
  const tiers = [50, 100, 200, 500, 1000];
  return tiers[Math.min(resetCount, tiers.length - 1)] ?? 1000;
};

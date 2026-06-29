/**
 * Phase 24.A: Skill Combo Registry — 7 combos preset.
 * Match qua name pattern (regex) để flexible với AI-generated skill name.
 */
import type { SkillComboDef } from '@gametypes/skill-deep';

export const SKILL_COMBOS: SkillComboDef[] = [
  {
    id: 'hoa_phong_bao',
    name: 'Hỏa Phong Bão',
    description: 'Hỏa + Phong cộng hưởng → Bão Lửa Vạn Trượng. Damage cả 2 +30%.',
    requiresSkills: [],
    requiresNamePatterns: [/h(oả|ỏa|oa)|fire|flame/i, /phong|wind|gale|cuồng/i],
    effect: { damageBonus: 0.30, specialTag: 'burn_3turn' },
    tier: 'gold',
  },
  {
    id: 'thuy_lui_hop',
    name: 'Thủy Lôi Hợp',
    description: 'Thủy + Lôi tương sinh → Điện Triều Sấm. CD giảm 20%, damage +25%.',
    requiresSkills: [],
    requiresNamePatterns: [/th(ủ|u)y|water|băng/i, /lôi|loi|lightning|thunder|sấm/i],
    effect: { damageBonus: 0.25, cooldownReduce: 0.20, specialTag: 'stun_chance_30' },
    tier: 'gold',
  },
  {
    id: 'kiem_y_song_phap',
    name: 'Kiếm Ý Song Pháp',
    description: '2 skill kiếm cùng equip → kiếm khí dày đặc. +35% damage kiếm.',
    requiresSkills: [],
    requiresNamePatterns: [/kiếm|sword|jian/i, /kiếm|sword|jian/i],
    effect: { damageBonus: 0.35, specialTag: 'sword_aura' },
    tier: 'silver',
  },
  {
    id: 'sinh_tu_luan_hoi',
    name: 'Sinh Tử Luân Hồi',
    description: 'Heal skill + Damage skill → tự cân bằng sinh tử. +15% damage + 10% lifesteal.',
    requiresSkills: [],
    requiresNamePatterns: [/heal|hồi|trị|sinh|tái sinh|băng huyết/i, /damage|sát|trảm|công|hủy/i],
    effect: { damageBonus: 0.15, specialTag: 'lifesteal_10' },
    tier: 'silver',
  },
  {
    id: 'quyen_phap_nhat_the',
    name: 'Quyền Pháp Nhất Thể',
    description: 'Quyền + Chỉ → cận chiến vô địch. +20% damage + crit +10%.',
    requiresSkills: [],
    requiresNamePatterns: [/quyền|fist|đấm|punch/i, /chỉ|finger|điểm/i],
    effect: { damageBonus: 0.20, specialTag: 'crit_plus_10' },
    tier: 'bronze',
  },
  {
    id: 'am_quang_hop_nhat',
    name: 'Âm Quang Hợp Nhất',
    description: 'Ám + Quang → cân bằng âm dương. +40% damage cuối combat (HP enemy < 30%).',
    requiresSkills: [],
    requiresNamePatterns: [/ám|dark|hắc/i, /quang|light|sáng|bạch/i],
    effect: { damageBonus: 0.40, triggerHpPct: 0.30, specialTag: 'execute_lowhp' },
    tier: 'mystic',
  },
  {
    id: 'tam_phap_dao_tam',
    name: 'Tam Pháp Đạo Tâm',
    description: '3 skill cùng hệ phụ trợ → tâm pháp viên dung. CD giảm 30%, +10% all stats.',
    requiresSkills: [],
    requiresNamePatterns: [/phụ trợ|buff|aura/i, /phụ trợ|buff|aura/i, /phụ trợ|buff|aura/i],
    effect: { damageBonus: 0.10, cooldownReduce: 0.30, specialTag: 'all_stat_10' },
    tier: 'mystic',
  },
];

export const COMBO_TIER_COLOR: Record<SkillComboDef['tier'], string> = {
  bronze: 'var(--gold-700)',
  silver: 'var(--jade-300)',
  gold: 'var(--gold-300)',
  mystic: 'var(--spirit-300)',
};

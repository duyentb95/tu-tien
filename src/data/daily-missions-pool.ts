import type { DailyMissionTemplate } from '@gametypes/daily-mission';

/**
 * Phase 16.3: Pool 10 nhiệm vụ hàng ngày — random pick 3 mỗi ngày.
 *
 * Mục tiêu:
 *   - Easy (~5 phút): submit 5 action, đột phá 1 cảnh giới...
 *   - Medium (~15 phút): combat win, học skill, gặp NPC mới
 *   - Hard (~30+ phút): hoàn quest chính, đột phá đại cảnh
 *
 * Progress increment qua action wrappers trong store (xem incrementMissionProgress).
 */

export const DAILY_MISSIONS_POOL: DailyMissionTemplate[] = [
  // ─── Easy ───
  {
    id: 'submit_5_actions',
    title: 'Khai Mở Câu Chuyện',
    description: 'Gửi 5 hành động trong câu chuyện chính.',
    target: 5,
    reward: { tienNgoc: 30, actionTokens: 20 },
    category: 'action',
    priority: 10,
  },
  {
    id: 'submit_15_actions',
    title: 'Tu Luyện Kiên Trì',
    description: 'Gửi 15 hành động — chứng tỏ định lực.',
    target: 15,
    reward: { tienNgoc: 60, actionTokens: 30 },
    category: 'action',
  },
  {
    id: 'meditate_3_times',
    title: 'Tĩnh Tâm Bế Quan',
    description: 'Thực hiện hành động "tu luyện / bế quan / thiền định" 3 lần.',
    target: 3,
    reward: { tienNgoc: 40, actionTokens: 15 },
    category: 'progression',
  },

  // ─── Medium ───
  {
    id: 'win_combat',
    title: 'Chiến Thắng Yêu Thú',
    description: 'Thắng 1 trận chiến.',
    target: 1,
    reward: { tienNgoc: 50, actionTokens: 20 },
    category: 'combat',
  },
  {
    id: 'win_2_combats',
    title: 'Liên Thắng Nhị Trận',
    description: 'Thắng 2 trận chiến hôm nay.',
    target: 2,
    reward: { tienNgoc: 100, actionTokens: 40 },
    category: 'combat',
  },
  {
    id: 'discover_location',
    title: 'Khám Phá Vùng Đất',
    description: 'Khám phá 1 địa điểm mới trên bản đồ.',
    target: 1,
    reward: { tienNgoc: 50 },
    category: 'exploration',
  },
  {
    id: 'learn_skill',
    title: 'Lĩnh Ngộ Pháp Thuật',
    description: 'Học được 1 kỹ năng mới.',
    target: 1,
    reward: { tienNgoc: 60, actionTokens: 20 },
    category: 'progression',
  },
  {
    id: 'meet_npc',
    title: 'Kết Giao Hữu Hảo',
    description: 'Gặp 2 NPC mới (lần đầu).',
    target: 2,
    reward: { tienNgoc: 40, actionTokens: 10 },
    category: 'social',
  },

  // ─── Hard ───
  {
    id: 'level_up',
    title: 'Đột Phá Cảnh Giới',
    description: 'Đột phá 1 cảnh giới (level up).',
    target: 1,
    reward: { tienNgoc: 150, actionTokens: 50 },
    category: 'progression',
  },
  {
    id: 'high_ep_reward',
    title: 'Lĩnh Ngộ Xuất Sắc',
    description: 'Nhận 1 lần ENCOUNTER_REWARD ≥ 50 EP (hành động sáng tạo + nhập vai cao).',
    target: 1,
    reward: { tienNgoc: 120, actionTokens: 40 },
    category: 'progression',
  },
];

/** Roll 3 random missions từ pool, đảm bảo mix category. */
export const rollDailyMissions = (rng: () => number = Math.random): DailyMissionTemplate[] => {
  // Shuffle pool
  const shuffled = [...DAILY_MISSIONS_POOL].sort(() => rng() - 0.5);
  // Pick 3 distinct
  return shuffled.slice(0, 3);
};

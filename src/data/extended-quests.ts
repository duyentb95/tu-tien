import type { ExtendedQuestTemplate } from '@gametypes/extended-quest';

/**
 * Phase 17.1: Extended Quests registry — 6 chuỗi quest multi-step.
 *
 * Mix:
 *   - 2 main-story (always visible từ đầu)
 *   - 2 hidden cần unlock condition (sau khi player đạt milestone)
 *   - 2 secret cần điều kiện ẩn (player phải khám phá để biết)
 *
 * Reward scale theo step: nhỏ → lớn. Final reward: pháp bảo Cực Phẩm + Tiền Ngọc.
 */

export const EXTENDED_QUESTS: ExtendedQuestTemplate[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. MAIN STORY — Đường Khởi Đầu (always visible)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'main-cultivation-start',
    title: 'Khởi Đầu Tu Luyện',
    description: 'Đặt nền móng cho con đường tu tiên. Mỗi bước là một dấu mốc đầu đời.',
    hidden: false,
    category: 'main-story',
    steps: [
      {
        title: 'Vượt qua 10 lượt câu chuyện',
        description: 'Bắt đầu làm quen với thế giới, gửi đủ 10 hành động.',
        check: (s) => s.turn >= 10,
        reward: { tienNgoc: 50, actionTokens: 30 },
      },
      {
        title: 'Đạt cảnh giới Cấp 3',
        description: 'Tu luyện đến level 3 (cảnh giới thứ 3).',
        check: (s) => !!s.player && s.player.level >= 3,
        reward: { tienNgoc: 100, actionTokens: 50, exp: 200 },
      },
      {
        title: 'Học 1 kỹ năng',
        description: 'Lĩnh ngộ ít nhất 1 pháp thuật.',
        check: (s) => !!s.player && s.player.learnedSkills.length >= 1,
        reward: { tienNgoc: 100, itemName: 'Đan Linh Khởi Đầu', itemRarity: 'Hiếm' },
      },
    ],
    finalReward: { tienNgoc: 300, actionTokens: 100, itemName: 'Khởi Nguyên Bảo Châu', itemRarity: 'Cực Phẩm' },
  },

  // ─────────────────────────────────────────────────────────────
  // 2. MAIN STORY — Đường Hành Tẩu (visible)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'main-explorer',
    title: 'Hành Tẩu Giang Hồ',
    description: 'Khám phá bản đồ rộng lớn, kết giao, tu luyện đa dạng.',
    hidden: false,
    category: 'main-story',
    steps: [
      {
        title: 'Khám phá 5 địa điểm',
        description: 'Đến 5 location khác nhau trên bản đồ.',
        check: (s) =>
          Object.values(s.knowledge.locations ?? {}).filter((l) => (l as { visitedByPlayer?: boolean }).visitedByPlayer).length >= 5,
        reward: { tienNgoc: 80, actionTokens: 30 },
      },
      {
        title: 'Gặp 5 NPC',
        description: 'Tiếp xúc với 5 nhân vật khác nhau.',
        check: (s) => Object.keys(s.knowledge.characters ?? {}).length >= 5,
        reward: { tienNgoc: 100 },
      },
      {
        title: 'Thắng 3 trận combat',
        description: 'Chiến thắng 3 yêu thú / địch thủ.',
        check: (s) => (s.knowledge.eventHistory ?? []).filter((e: { kind: string }) => e.kind === 'encounter_high').length >= 3,
        reward: { tienNgoc: 150, exp: 300 },
      },
    ],
    finalReward: { tienNgoc: 400, actionTokens: 150, itemName: 'Hành Lộ Lệnh Bài', itemRarity: 'Cực Phẩm' },
  },

  // ─────────────────────────────────────────────────────────────
  // 3. HIDDEN — Tu Tâm Cao Thủ (unlock khi đột phá lần đầu)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'hidden-meditation-master',
    title: 'Bậc Thầy Định Lực',
    description: 'Một con đường ít người chọn — tu luyện qua thiền định bế quan.',
    hidden: true,
    hint: 'Khám phá khi tâm cảnh ngươi đạt đến tầng đột phá đầu tiên.',
    unlockCondition: (s) => !!s.player && s.player.level >= 5,
    category: 'cultivation',
    steps: [
      {
        title: 'Bế quan 10 lần',
        description: 'Thực hiện hành động "tu luyện / bế quan" trong câu chuyện 10 lần.',
        check: (s) => (s.knowledge.recentMeaningfulActions ?? []).filter((a: { action?: string }) =>
          /tu luy|bế quan|thiền|đả tọa/i.test(a.action ?? '')
        ).length >= 10,
        reward: { tienNgoc: 200, actionTokens: 80, exp: 500 },
      },
      {
        title: 'Đột phá cảnh giới Cấp 10',
        description: 'Vượt qua thử thách lớn — đạt level 10.',
        check: (s) => !!s.player && s.player.level >= 10,
        reward: { tienNgoc: 300, exp: 1000 },
      },
    ],
    finalReward: { tienNgoc: 800, itemName: 'Tâm Hồn Bảo Tâm', itemRarity: 'Siêu Phẩm', actionTokens: 200 },
  },

  // ─────────────────────────────────────────────────────────────
  // 4. HIDDEN — Đường Pháp Bảo (unlock khi có item Hiếm)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'hidden-artifact-collector',
    title: 'Người Sưu Tầm Pháp Bảo',
    description: 'Theo đuổi việc thu thập + tinh luyện vật phẩm tu tiên trân quý.',
    hidden: true,
    hint: 'Mở khoá khi ngươi sở hữu pháp bảo Hiếm trở lên.',
    unlockCondition: (s) =>
      Object.values(s.inventory ?? {}).some((it) =>
        ['Hiếm', 'Cực Phẩm', 'Siêu Phẩm', 'Huyền Thoại'].includes((it as { rarity?: string }).rarity ?? ''),
      ),
    category: 'craft',
    steps: [
      {
        title: 'Sở hữu 3 vật phẩm Hiếm+',
        description: 'Có 3 vật phẩm rarity Hiếm trở lên trong hành trang.',
        check: (s) =>
          Object.values(s.inventory ?? {}).filter((it) =>
            ['Hiếm', 'Cực Phẩm', 'Siêu Phẩm', 'Huyền Thoại'].includes((it as { rarity?: string }).rarity ?? ''),
          ).length >= 3,
        reward: { tienNgoc: 200 },
      },
      {
        title: 'Sở hữu 1 vật phẩm Cực Phẩm+',
        description: 'Tìm hoặc tinh luyện được pháp bảo Cực Phẩm trở lên.',
        check: (s) =>
          Object.values(s.inventory ?? {}).some((it) =>
            ['Cực Phẩm', 'Siêu Phẩm', 'Huyền Thoại'].includes((it as { rarity?: string }).rarity ?? ''),
          ),
        reward: { tienNgoc: 400, actionTokens: 50 },
      },
    ],
    finalReward: { tienNgoc: 1000, itemName: 'Vạn Linh Túi Trữ Vật', itemRarity: 'Huyền Thoại' },
  },

  // ─────────────────────────────────────────────────────────────
  // 5. SECRET — Ẩn Sĩ Vô Danh (unlock khi đạt EP cao)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'secret-hermit',
    title: 'Truyền Thừa Ẩn Sĩ',
    description: 'Một vị tiền bối vô danh để lại truyền thừa cho người có duyên ngộ.',
    hidden: true,
    hint: 'Chỉ những ai có ngộ tính cao + tâm thuần khiết mới được ẩn sĩ ưng ý.',
    unlockCondition: (s) => s.ep >= 100,
    category: 'secret',
    steps: [
      {
        title: 'Tích đủ 200 EP',
        description: 'Chứng minh ngộ tính qua sáng tạo + nhập vai.',
        check: (s) => s.ep >= 200,
        reward: { tienNgoc: 300, actionTokens: 100 },
      },
      {
        title: 'Đạt cảnh giới Cấp 15',
        description: 'Tu vi đủ cao để tiếp nhận truyền thừa.',
        check: (s) => !!s.player && s.player.level >= 15,
        reward: { tienNgoc: 500, exp: 2000 },
      },
    ],
    finalReward: { tienNgoc: 1500, itemName: 'Vô Danh Cổ Quyết', itemRarity: 'Huyền Thoại', actionTokens: 300 },
  },

  // ─────────────────────────────────────────────────────────────
  // 6. SECRET — Khúc Bi Tráng (unlock khi mất NPC quan trọng)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'secret-tragedy',
    title: 'Khúc Bi Tráng',
    description: 'Mất mát rèn nên kẻ mạnh — một con đường nghiệt ngã nhưng đỉnh cao.',
    hidden: true,
    hint: 'Mở ra khi ngươi trải qua đủ mất mát đáng nhớ.',
    unlockCondition: (s) =>
      (s.knowledge.eventHistory ?? []).filter((e: { kind: string }) => e.kind === 'npc_death' || e.kind === 'quest_failed').length >= 2,
    category: 'secret',
    steps: [
      {
        title: 'Chứng kiến 3 sự kiện mất mát',
        description: 'NPC tử vong hoặc quest thất bại — tích lũy 3 lần.',
        check: (s) =>
          (s.knowledge.eventHistory ?? []).filter((e: { kind: string }) => e.kind === 'npc_death' || e.kind === 'quest_failed').length >= 3,
        reward: { tienNgoc: 250, actionTokens: 50 },
      },
      {
        title: 'Đạt cảnh giới Cấp 20 (vượt qua đau khổ)',
        description: 'Mượn bi thương luyện tâm — đột phá lớn.',
        check: (s) => !!s.player && s.player.level >= 20,
        reward: { tienNgoc: 600, exp: 3000 },
      },
    ],
    finalReward: { tienNgoc: 2000, itemName: 'Bi Thương Kiếm', itemRarity: 'Huyền Thoại' },
  },
];

export const getExtendedQuestById = (id: string): ExtendedQuestTemplate | undefined =>
  EXTENDED_QUESTS.find((q) => q.id === id);

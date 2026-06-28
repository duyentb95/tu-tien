/**
 * Phase 15.2: Store packs — Tiền Ngọc currency packs với pricing VND.
 *
 * Pricing tier theo mô hình free-to-play VN:
 *   - Newbie pack: rẻ nhất, conversion test
 *   - Standard: best value cho user thường
 *   - Premium: bulk discount cho whale
 *
 * Mock payment hiện tại — wire Stripe/MoMo session sau.
 */

export interface CurrencyPack {
  id: string;
  /** Số Tiền Ngọc nhận */
  amount: number;
  /** Bonus thêm (free) — marketing hook */
  bonus: number;
  /** Giá VND */
  priceVnd: number;
  /** Label gợi ý ("Tiết kiệm 20%", "Hot", "Newbie only"...) */
  badge?: string;
  /** Tier visual */
  tier: 'starter' | 'standard' | 'premium' | 'whale';
  /** Mô tả ngắn cho UI */
  description: string;
}

export const CURRENCY_PACKS: CurrencyPack[] = [
  // Phase 19: thêm 2 gói micro 5k/10k cho user dễ tiếp cận + buff TN 1.5-2x
  {
    id: 'pack_micro',
    amount: 30,
    bonus: 0,
    priceVnd: 5_000,
    tier: 'starter',
    badge: 'Thử nghiệm',
    description: 'Pack micro — ly trà sữa nhỏ, đủ 3 lần item upgrade.',
  },
  {
    id: 'pack_mini',
    amount: 70,
    bonus: 10,
    priceVnd: 10_000,
    tier: 'starter',
    badge: 'Mini · +14% bonus',
    description: 'Đủ 1 tuần điểm danh + 2 lần re-roll stats.',
  },
  {
    id: 'pack_starter',
    amount: 180,
    bonus: 20,
    priceVnd: 20_000,
    tier: 'starter',
    badge: 'Khởi đầu · +11% bonus',
    description: 'Đủ đổi 20 lượt + 3 lần item upgrade.',
  },
  {
    id: 'pack_standard_small',
    amount: 500,
    bonus: 60,
    priceVnd: 50_000,
    tier: 'standard',
    badge: '+12% bonus',
    description: 'Pack phổ biến — đủ cho 2 tuần chơi vừa.',
  },
  {
    id: 'pack_standard_large',
    amount: 1100,
    bonus: 150,
    priceVnd: 100_000,
    tier: 'standard',
    badge: '+14% bonus · Best Value',
    description: 'Best value cho user tu luyện nghiêm túc.',
  },
  {
    id: 'pack_premium',
    amount: 2500,
    bonus: 400,
    priceVnd: 200_000,
    tier: 'premium',
    badge: '+16% bonus · Hot',
    description: 'Premium — đủ unlock toàn bộ perks vĩnh viễn + Speed Boost.',
  },
  {
    id: 'pack_whale',
    amount: 7000,
    bonus: 1500,
    priceVnd: 500_000,
    tier: 'whale',
    badge: '+21% bonus · Top',
    description: 'Dành cho đại tu sĩ — dùng cả năm không hết + Speed Boost.',
  },
];

/** Exchange options: Tiền Ngọc → ingame perks */
export interface ExchangeOption {
  id: string;
  /** Tên hiển thị */
  label: string;
  /** Mô tả 1-2 câu */
  description: string;
  /** Giá Tiền Ngọc */
  cost: number;
  /** Loại — repeat = mua nhiều lần, oneTime = vĩnh viễn 1 lần */
  kind: 'repeat' | 'oneTime';
  /** Icon emoji */
  icon: string;
  /** Effect identifier để store xử lý */
  effect:
    | 'topup_50_tokens'
    | 'topup_200_tokens'
    | 'topup_500_tokens'
    | 'speed_boost_unlock'
    | 'unlimited_custom_rules'
    | 'extra_save_slots'
    | 'genesis_reroll_credit'
    | 'item_upgrade_credit';
}

export const EXCHANGE_OPTIONS: ExchangeOption[] = [
  {
    id: 'ex_tokens_50',
    label: '+50 Lượt Hành Động',
    description: 'Nạp thêm 50 token tức thì, vượt cap miễn phí.',
    cost: 50,
    kind: 'repeat',
    icon: '⚡',
    effect: 'topup_50_tokens',
  },
  {
    id: 'ex_tokens_200',
    label: '+200 Lượt + 20 thưởng',
    description: 'Pack lớn cho session dài, tiết kiệm 10% so với pack nhỏ.',
    cost: 180,
    kind: 'repeat',
    icon: '⚡⚡',
    effect: 'topup_200_tokens',
  },
  {
    id: 'ex_tokens_500',
    label: '+500 Lượt + 100 thưởng',
    description: 'Pack đại — đủ cho tuần chơi cao thủ.',
    cost: 400,
    kind: 'repeat',
    icon: '⚡⚡⚡',
    effect: 'topup_500_tokens',
  },
  {
    id: 'ex_speed_boost',
    label: 'Bỏ Trễ Tốc Độ AI (vĩnh viễn)',
    description: 'Bỏ qua retry delay khi AI suy nghĩ, response gần như instant.',
    cost: 300,
    kind: 'oneTime',
    icon: '⚡',
    effect: 'speed_boost_unlock',
  },
  {
    id: 'ex_unlimited_rules',
    label: 'Custom Rules Không Giới Hạn',
    description: 'Mở khoá tạo > 5 custom rules cho AI.',
    cost: 200,
    kind: 'oneTime',
    icon: '◍',
    effect: 'unlimited_custom_rules',
  },
  {
    id: 'ex_extra_slots',
    label: 'Mở 7 Save Slot Bổ Sung',
    description: 'Mở rộng từ 3 → 10 slot lưu game.',
    cost: 150,
    kind: 'oneTime',
    icon: '◭',
    effect: 'extra_save_slots',
  },
  {
    id: 'ex_genesis_reroll',
    label: '5 Lần Re-roll Thế Giới',
    description: 'World Genesis re-roll thoải mái khi tạo open-world mới.',
    cost: 100,
    kind: 'repeat',
    icon: '✦',
    effect: 'genesis_reroll_credit',
  },
  {
    id: 'ex_item_upgrade',
    label: '3 Lần Tinh Luyện Vật Phẩm',
    description: 'Re-roll stat hoặc upgrade rarity 1 tier.',
    cost: 250,
    kind: 'repeat',
    icon: '⚒',
    effect: 'item_upgrade_credit',
  },
];

/** Format VND đẹp: 100000 → "100.000 ₫" */
export const formatVnd = (n: number): string =>
  new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

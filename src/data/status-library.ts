/**
 * STATUS_LIBRARY + LONG_TERM_STATUS_TEMPLATES — port từ prototype `PREVIEW.md` (line 3609, 3652).
 * Là thư viện hiệu ứng "có cấu trúc cố định". Status động (DoT, stat changes) do AI tự lắp ráp.
 */

export interface StatusDef {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'injury' | 'adventure_debuff';
  description?: string;
  is_dispellable?: boolean;
  duration_logic?: 'TURN_BASED' | 'ROUND_BASED';
  special_flags?: string[];
  stats?: string; // raw "atk_amp:-60,..." format
  effects_per_day?: { hp_percent_loss?: number };
  triggered_effects?: TriggeredEffect[];
}

export interface TriggeredEffect {
  trigger: 'ON_TAKE_DAMAGE' | 'ON_DEAL_DAMAGE' | 'ON_TURN_END' | 'ON_TURN_START';
  action: { type: string; status_to_dispel_id?: string; [key: string]: unknown };
}

export const STATUS_LIBRARY: Record<string, StatusDef> = {
  // ───── BUFFS ─────
  CC_IMMUNITY: {
    id: 'CC_IMMUNITY',
    name: 'Miễn Khống Chế',
    type: 'buff',
    is_dispellable: true,
    special_flags: ['CROWD_CONTROL_IMMUNITY'],
  },
  UNDYING: {
    id: 'UNDYING',
    name: 'Bất Tử',
    type: 'buff',
    is_dispellable: false,
    special_flags: ['CANNOT_DIE'],
  },
  DAMAGE_IMMUNITY: {
    id: 'DAMAGE_IMMUNITY',
    name: 'Miễn Thương',
    type: 'buff',
    is_dispellable: true,
    special_flags: ['DAMAGE_IMMUNITY_ALL'],
  },
  STASIS: {
    id: 'STASIS',
    name: 'Ngưng Đọng',
    type: 'buff',
    is_dispellable: false,
    special_flags: ['SKIP_TURN', 'DAMAGE_IMMUNITY_ALL', 'UNTARGETABLE'],
  },

  // ───── DEBUFFS / CC ─────
  STUN: {
    id: 'STUN',
    name: 'Choáng',
    type: 'debuff',
    duration_logic: 'TURN_BASED',
    is_dispellable: true,
    special_flags: ['SKIP_TURN'],
  },
  SLEEP: {
    id: 'SLEEP',
    name: 'Ngủ',
    type: 'debuff',
    duration_logic: 'ROUND_BASED',
    is_dispellable: true,
    special_flags: ['SKIP_TURN'],
    triggered_effects: [
      {
        trigger: 'ON_TAKE_DAMAGE',
        action: { type: 'dispel_self', status_to_dispel_id: 'SLEEP' },
      },
    ],
  },
  SILENCE: {
    id: 'SILENCE',
    name: 'Câm Lặng',
    type: 'debuff',
    duration_logic: 'TURN_BASED',
    is_dispellable: true,
    special_flags: ['CANNOT_USE_ACTIVE_SKILLS'],
  },
};

export const LONG_TERM_STATUS_TEMPLATES: Record<string, StatusDef> = {
  NGAT: {
    id: 'NGAT',
    name: 'Ngất',
    type: 'adventure_debuff',
    description: 'Bất tỉnh tạm thời do kiệt sức hoặc bị choáng.',
    special_flags: ['PREVENTS_ACTION'],
  },
  BAT_TINH: {
    id: 'BAT_TINH',
    name: 'Bất Tỉnh',
    type: 'injury',
    description: 'Hôn mê sâu, không thể hành động cho đến khi được cứu chữa bằng phương pháp đặc biệt.',
    special_flags: ['PREVENTS_ACTION'],
  },
  TRONG_THUONG: {
    id: 'TRONG_THUONG',
    name: 'Trọng Thương',
    type: 'injury',
    description: 'Kinh mạch và nội tạng bị tổn thương nghiêm trọng, sức mạnh suy giảm nặng nề.',
    stats: 'atk_amp:-60,def_amp:-60,spd_amp:-60',
  },
  XUAT_HUYET: {
    id: 'XUAT_HUYET',
    name: 'Xuất Huyết',
    type: 'injury',
    description: 'Vết thương không ngừng rỉ máu, khiến cơ thể suy yếu dần theo thời gian.',
    effects_per_day: { hp_percent_loss: 5 },
  },
  TRUNG_DOC: {
    id: 'TRUNG_DOC',
    name: 'Trúng Độc',
    type: 'injury',
    description: 'Độc tố ngấm vào cơ thể, bào mòn sinh mệnh lực mỗi ngày.',
    effects_per_day: { hp_percent_loss: 5 },
  },
};

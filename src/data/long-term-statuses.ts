/**
 * Long-term status library — debuff/buff kéo dài qua nhiều turn.
 *
 * Khác với combat status (buff/debuff trong 1 trận):
 *   - Long-term tồn tại qua narrative + combat + meditation
 *   - Tick mỗi turn (tiêu hao HP, giảm stats, có thể tự khỏi sau N hours)
 *   - Áp bởi tag [APPLY_LONG_TERM_STATUS target=... status_id=... hours=...]
 *   - Giải bởi đan dược (Khôi Nguyên Đan, Giải Độc Tán...) hoặc thời gian
 *
 * Theo prototype: BAT_TINH, NGAT, TRONG_THUONG, XUAT_HUYET, TRUNG_DOC + extend.
 */

export interface LongTermStatusTemplate {
  /** Format: SCREAMING_SNAKE — vd 'TRONG_THUONG' */
  id: string;
  name: string;
  /** Icon unicode (1 char) — hiển thị trên sidebar badge */
  icon: string;
  /** Severity: 'mild' | 'moderate' | 'severe' | 'critical' */
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  description: string;
  /** Hiệu ứng tick mỗi turn — null = không tick */
  tick?: {
    hpDelta?: number;           // âm = mất máu
    expMultiplier?: number;     // < 1 = chậm tu luyện (vd 0.5)
    statDebuff?: Partial<Record<'atk' | 'def' | 'spd', number>>;
  };
  /** Default hours kéo dài. -1 = vĩnh viễn cho đến khi cure */
  defaultDurationHours: number;
  /** Item names có thể cure status này */
  curableBy?: string[];
  /** Cảnh báo player khi áp (notify text) */
  appliedNotice?: string;
}

export const LONG_TERM_STATUSES: Record<string, LongTermStatusTemplate> = {
  // ─── Thương tích ───
  TRONG_THUONG: {
    id: 'TRONG_THUONG',
    name: 'Trọng Thương',
    icon: '🩸',
    severity: 'severe',
    description: 'Nội thương nặng, kinh mạch tổn hại. ATK -30%, tốc độ tu luyện -50%.',
    tick: { expMultiplier: 0.5, statDebuff: { atk: -30 } },
    defaultDurationHours: 168, // 7 ngày
    curableBy: ['Khôi Nguyên Đan', 'Đại Hoàn Đan', 'Bồi Nguyên Tán'],
    appliedNotice: 'Nội thương nặng. Tu luyện chậm + ATK giảm cho đến khi hồi phục.',
  },
  XUAT_HUYET: {
    id: 'XUAT_HUYET',
    name: 'Xuất Huyết',
    icon: '💧',
    severity: 'moderate',
    description: 'Vết thương chảy máu, mất HP dần qua mỗi turn (-5 HP/turn).',
    tick: { hpDelta: -5 },
    defaultDurationHours: 24,
    curableBy: ['Băng Huyết Đan', 'Cầm Huyết Tán', 'Khôi Nguyên Đan'],
    appliedNotice: 'Đang chảy máu — mỗi turn -5 HP cho đến khi cầm máu.',
  },
  NGAT: {
    id: 'NGAT',
    name: 'Ngất Xỉu',
    icon: '💤',
    severity: 'severe',
    description: 'Mất ý thức tạm thời, không thể hành động. Tỉnh lại sau 4-12 giờ.',
    tick: { statDebuff: { atk: -100, def: -100, spd: -100 } },
    defaultDurationHours: 8,
    curableBy: ['Tỉnh Thần Đan', 'Hồi Hồn Tán'],
  },

  // ─── Độc / Hàn ───
  TRUNG_DOC: {
    id: 'TRUNG_DOC',
    name: 'Trúng Độc',
    icon: '☠',
    severity: 'severe',
    description: 'Trúng độc dược/độc tố. Mất -8 HP/turn, ATK -20%.',
    tick: { hpDelta: -8, statDebuff: { atk: -20 } },
    defaultDurationHours: 48,
    curableBy: ['Giải Độc Đan', 'Bách Thảo Dịch', 'Thanh Tâm Đan'],
    appliedNotice: 'Trúng độc — cần đan dược giải hoặc tự khỏi sau 2 ngày.',
  },
  AM_HAN: {
    id: 'AM_HAN',
    name: 'Âm Hàn Xâm Thể',
    icon: '❄',
    severity: 'moderate',
    description: 'Hàn khí xâm nhập kinh mạch. SPD -20%, EXP -30%.',
    tick: { expMultiplier: 0.7, statDebuff: { spd: -20 } },
    defaultDurationHours: 72,
    curableBy: ['Hỏa Linh Đan', 'Ấm Dương Đan'],
  },

  // ─── Tu luyện ───
  TAU_HOA_NHAP_MA: {
    id: 'TAU_HOA_NHAP_MA',
    name: 'Tẩu Hỏa Nhập Ma',
    icon: '🔥',
    severity: 'critical',
    description: 'Tu luyện sai → kinh mạch nghịch hành. ATK -20% vĩnh viễn cho đến khi giải.',
    tick: { statDebuff: { atk: -20 } },
    defaultDurationHours: -1, // vĩnh viễn
    curableBy: ['Cửu Chuyển Hồi Tinh Đan', 'Tâm Cảnh Đan', 'Thiên Đạo Truyền Pháp'],
    appliedNotice: '⚠ TẨU HỎA NHẬP MA — vĩnh viễn -20% ATK cho đến khi tìm được phương pháp giải!',
  },

  // ─── Buff ───
  BENH_DI_AN: {
    id: 'BENH_DI_AN',
    name: 'Bệnh Lý Ấn',
    icon: '⚕',
    severity: 'mild',
    description: 'Cơ thể yếu, dễ bệnh. DEF -10%, HP regen -50%.',
    tick: { statDebuff: { def: -10 } },
    defaultDurationHours: 120,
    curableBy: ['Khôi Nguyên Đan', 'Bồi Bản Đan'],
  },
  KHAI_QUANG: {
    id: 'KHAI_QUANG',
    name: 'Khai Quang Hộ Thể',
    icon: '✨',
    severity: 'mild', // đây là BUFF, severity dùng để styling
    description: 'Linh khí hộ thể. +20% DEF, EXP +30% trong thời gian hiệu lực.',
    tick: { expMultiplier: 1.3, statDebuff: { def: 20 } },
    defaultDurationHours: 24,
    appliedNotice: 'Khai Quang Hộ Thể — buff bảo vệ trong 24 giờ.',
  },
};

/** Lookup status template by id */
export const getLongTermStatus = (id: string): LongTermStatusTemplate | undefined => {
  return LONG_TERM_STATUSES[id.toUpperCase()];
};

/**
 * Bảng dịch các status_id AI hay sinh ngoài registry → tên Việt có dấu.
 * Mở rộng khi thấy AI tag mới chưa có translation.
 * Key MUST UPPER_SNAKE để match `e.statusId.toUpperCase()`.
 */
export const STATUS_ID_VN_ALIASES: Record<string, string> = {
  // Tu luyện
  CUONG_PHAN_KICH: 'Cuồng Phẫn Kích',
  TAM_MA: 'Tâm Ma',
  TAM_MA_PHAT_TAC: 'Tâm Ma Phát Tác',
  CO_HOC_TINH: 'Cô Học Tính',
  TINH_THAN_BAT_AN: 'Tinh Thần Bất An',
  // Trạng thái thể chất
  KIET_SUC: 'Kiệt Sức',
  MET_MOI: 'Mệt Mỏi',
  SUNG_HUYET: 'Sung Huyết',
  CO_DOC: 'Cô Độc',
  // Hiệu ứng tích cực
  HUNG_PHAN: 'Hưng Phấn',
  THAN_LUC_DANG_TRAO: 'Thần Lực Dâng Trào',
  LINH_KHI_BAO_HOA: 'Linh Khí Bão Hòa',
  // Tình trạng tinh thần
  PHAN_NO: 'Phẫn Nộ',
  SAU_KHO: 'Sầu Khổ',
  YEU_DOI: 'Yêu Đời',
  KHIEP_SO: 'Khiếp Sợ',
};

/**
 * Convert SCREAMING_SNAKE_CASE → Vietnamese-friendly display.
 * Ưu tiên alias dictionary, fallback Title Case từ underscores.
 *   CUONG_PHAN_KICH → "Cuồng Phẫn Kích" (alias)
 *   RANDOM_THING → "Random Thing" (title case fallback)
 */
export const humanizeStatusId = (id: string): string => {
  const upper = id.toUpperCase();
  if (STATUS_ID_VN_ALIASES[upper]) return STATUS_ID_VN_ALIASES[upper];
  // Fallback: title case các từ
  return upper
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
};

/** All statuses array — UI list */
export const ALL_LONG_TERM_STATUSES = Object.values(LONG_TERM_STATUSES);

/** Severity → color (CSS variable) */
export const SEVERITY_COLOR: Record<LongTermStatusTemplate['severity'], string> = {
  mild: 'var(--jade-400)',
  moderate: 'var(--gold-500)',
  severe: 'var(--ember-500)',
  critical: 'var(--blood-500)',
};

/**
 * i18n minimal skeleton — VI default, EN optional.
 * Cách dùng:
 *   import { t } from '@/i18n';
 *   t('initial.continue') // → "Tiếp Tục Hành Trình" (VI) hoặc "Continue Journey" (EN)
 *
 * Phase 6.5: mở rộng dictionary đầy đủ + dynamic load JSON per locale.
 */

export type Locale = 'vi' | 'en';

const LOCALE_KEY = 'tu-tien:locale';

let _locale: Locale = (typeof localStorage !== 'undefined' && (localStorage.getItem(LOCALE_KEY) as Locale)) || 'vi';

export const getLocale = (): Locale => _locale;

export const setLocale = (locale: Locale): void => {
  _locale = locale;
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // ignore
  }
};

/**
 * Dictionary. Key dùng dot-notation (vd 'initial.continue').
 * VI là source of truth — nếu EN missing key, fallback VI.
 */
const DICT: Record<Locale, Record<string, string>> = {
  vi: {
    // Initial
    'initial.subtitle': 'MẶC HỘI · TIÊN ĐỒ',
    'initial.tagline': 'Một niệm thành tiên, một niệm thành ma.',
    'initial.continue': 'Tiếp Tục Hành Trình',
    'initial.newgame': 'Khởi Đầu Cuộc Phiêu Lưu Mới',
    'initial.load': 'Tải Game Từ Tệp',
    'initial.guide': 'Hướng Dẫn Tu Sĩ',
    'initial.community': 'Đạo Hữu Tụ Hội (Cộng Đồng)',
    // Stats
    'stat.hp': 'Sinh Lực',
    'stat.atk': 'Tấn Công',
    'stat.def': 'Phòng Thủ',
    'stat.spd': 'Tốc Độ',
    'stat.exp': 'Tu Vi',
    'stat.currency': 'Linh Thạch',
    // Common
    'common.back': '← Quay lại',
    'common.confirm': 'Xác Nhận',
    'common.cancel': 'Hủy',
    'common.loading': 'Đang tải...',
  },
  en: {
    'initial.subtitle': 'INK SOCIETY · IMMORTAL PATH',
    'initial.tagline': 'One thought to immortal, one thought to demon.',
    'initial.continue': 'Continue Journey',
    'initial.newgame': 'Begin New Adventure',
    'initial.load': 'Load Game From File',
    'initial.guide': 'Cultivator Handbook',
    'initial.community': 'Community Gathering',
    'stat.hp': 'Health',
    'stat.atk': 'Attack',
    'stat.def': 'Defense',
    'stat.spd': 'Speed',
    'stat.exp': 'Cultivation',
    'stat.currency': 'Spirit Stones',
    'common.back': '← Back',
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
  },
};

/** Translate function. Fallback chain: current locale → vi → key */
export const t = (key: string, params?: Record<string, string | number>): string => {
  let raw = DICT[_locale]?.[key] ?? DICT.vi[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      raw = raw.replace(`{${k}}`, String(v));
    }
  }
  return raw;
};

export const AVAILABLE_LOCALES: Array<{ code: Locale; name: string }> = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
];

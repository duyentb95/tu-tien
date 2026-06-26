/**
 * Audio SFX service — Web Audio API procedural sound (không cần asset file).
 * Mỗi event sinh ra waveform riêng — cảm giác cổ phong, không cần MP3.
 *
 * User có thể tắt qua localStorage key `tu-tien:sfx-muted`.
 */

const MUTE_KEY = 'tu-tien:sfx-muted';

let _ctx: AudioContext | null = null;
const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (!_ctx) {
      const AC = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ??
                 (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) _ctx = new AC();
    }
    return _ctx;
  } catch {
    return null;
  }
};

export const isSfxMuted = (): boolean => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
};

export const setSfxMuted = (muted: boolean): void => {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // ignore
  }
};

/** Play tone với freq + duration + waveform */
const playTone = (
  freq: number,
  durMs: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
  startDelay = 0,
) => {
  if (isSfxMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') void ctx.resume();

  const now = ctx.currentTime + startDelay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  // ADSR
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durMs / 1000);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durMs / 1000);
};

const playChord = (freqs: number[], durMs: number, type: OscillatorType = 'sine', volume = 0.1) => {
  freqs.forEach((f) => playTone(f, durMs, type, volume / Math.sqrt(freqs.length)));
};

// ─────────────────────────────────────────────────────────────────
// SFX events — cổ phong inspired
// ─────────────────────────────────────────────────────────────────

/** Chuông pha lê — khi nhận item / quest / level up */
export const sfxBell = (): void => {
  playTone(880, 250, 'sine', 0.18);
  playTone(1320, 350, 'sine', 0.1, 0.05);
};

/** Trống trận — combat hit */
export const sfxHit = (): void => {
  playTone(110, 80, 'square', 0.18);
  playTone(220, 60, 'triangle', 0.1, 0.02);
};

/** Sét nổ — tribulation lightning */
export const sfxThunder = (): void => {
  // Noise-like — slide freq nhanh
  const ctx = getCtx();
  if (!ctx || isSfxMuted()) return;
  if (ctx.state === 'suspended') void ctx.resume();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);
  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.6);
};

/** Hợp âm tỉnh đạo — level up / breakthrough */
export const sfxLevelUp = (): void => {
  playChord([523.25, 659.25, 783.99], 600, 'sine', 0.18); // C major
  playTone(1046.5, 800, 'sine', 0.1, 0.2); // C5 overlay
};

/** Click button */
export const sfxClick = (): void => {
  playTone(600, 40, 'triangle', 0.08);
};

/** Notification — toast appears */
export const sfxNotify = (): void => {
  playTone(440, 100, 'sine', 0.1);
};

// ─────────────────────────────────────────────────────────────────
// Phase 7.4 — SFX expand
// ─────────────────────────────────────────────────────────────────

/** Item Huyền Thoại — long shimmer */
export const sfxLegendary = (): void => {
  playChord([783.99, 987.77, 1318.51], 800, 'sine', 0.2); // G B E5
  playTone(1567.98, 400, 'sine', 0.08, 0.3); // G5 sparkle
  playTone(2093, 300, 'sine', 0.06, 0.5); // C6 high
};

/** Quest hoàn thành — hợp âm hào sảng */
export const sfxQuestComplete = (): void => {
  playChord([392, 493.88, 587.33], 400, 'triangle', 0.16); // G B D
  playTone(783.99, 500, 'sine', 0.12, 0.15); // G5
};

/** Đến địa danh mới — gió thoảng */
export const sfxLocationEnter = (): void => {
  const ctx = getCtx();
  if (!ctx || isSfxMuted()) return;
  if (ctx.state === 'suspended') void ctx.resume();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.4);
};

/** Khế ước linh thú — chime đặc trưng */
export const sfxBeastCapture = (): void => {
  playChord([659.25, 880, 1108.73], 500, 'sine', 0.15); // E A C#
  playTone(1760, 600, 'sine', 0.08, 0.2);
};

/** Đạo lữ — romantic chord */
export const sfxDaoLu = (): void => {
  playChord([523.25, 659.25, 784], 600, 'sine', 0.14); // C E G
  playTone(1046.5, 1000, 'sine', 0.1, 0.3); // sustained C5
};

/** Map all events */
export const sfx = {
  bell: sfxBell,
  hit: sfxHit,
  thunder: sfxThunder,
  levelUp: sfxLevelUp,
  click: sfxClick,
  notify: sfxNotify,
  // Phase 7.4 additions
  legendary: sfxLegendary,
  questComplete: sfxQuestComplete,
  locationEnter: sfxLocationEnter,
  beastCapture: sfxBeastCapture,
  daoLu: sfxDaoLu,
};

// ─────────────────────────────────────────────────────────────────
// BGM stub system — placeholder for future asset URLs
// ─────────────────────────────────────────────────────────────────

const BGM_MUTE_KEY = 'tu-tien:bgm-muted';
const BGM_URL_KEY = 'tu-tien:bgm-url';
let _bgm: HTMLAudioElement | null = null;

export const isBgmMuted = (): boolean => {
  try { return localStorage.getItem(BGM_MUTE_KEY) === '1'; } catch { return false; }
};

export const setBgmMuted = (muted: boolean): void => {
  try {
    localStorage.setItem(BGM_MUTE_KEY, muted ? '1' : '0');
    if (muted && _bgm) _bgm.pause();
    else if (!muted && _bgm) void _bgm.play().catch(() => {});
  } catch {
    // ignore
  }
};

/** Set BGM URL (user config) + play. Empty string = stop. */
export const setBgmUrl = (url: string): void => {
  try { localStorage.setItem(BGM_URL_KEY, url); } catch {}
  if (_bgm) { _bgm.pause(); _bgm = null; }
  if (!url) return;
  try {
    _bgm = new Audio(url);
    _bgm.loop = true;
    _bgm.volume = 0.3;
    if (!isBgmMuted()) {
      void _bgm.play().catch((err) => console.warn('[bgm] play failed:', err));
    }
  } catch (e) {
    console.warn('[bgm] init failed:', e);
  }
};

export const getBgmUrl = (): string => {
  try { return localStorage.getItem(BGM_URL_KEY) ?? ''; } catch { return ''; }
};

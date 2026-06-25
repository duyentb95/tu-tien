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

/** Map all events */
export const sfx = {
  bell: sfxBell,
  hit: sfxHit,
  thunder: sfxThunder,
  levelUp: sfxLevelUp,
  click: sfxClick,
  notify: sfxNotify,
};

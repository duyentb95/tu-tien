/**
 * Phase 21.4: Ambient BGM — procedural Web Audio loop.
 *
 * KHÔNG cần asset MP3 — synthesize pad + pluck đơn giản theo mood.
 * 4 mood:
 *   - village: ấm áp, pentatonic F major nhẹ
 *   - wilderness: trầm, dorian E minor
 *   - combat: dồn dập, kick + bass low
 *   - sect: thanh tịnh, sine pad cao
 *
 * Public API:
 *   - setBgmMood(mood | null) → start/switch loop hoặc dừng
 *   - setBgmVolume(0..1)
 *   - isBgmMuted() / setBgmMuted(bool)
 *
 * Persist mute + volume vào localStorage.
 */

type BgmMood = 'village' | 'wilderness' | 'combat' | 'sect' | null;

const MUTE_KEY = 'tu-tien:bgm-muted';
const VOL_KEY = 'tu-tien:bgm-volume';

let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;
let _interval: number | null = null;
let _currentMood: BgmMood = null;

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (!_ctx) {
      const AC = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ??
                 (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      _ctx = new AC();
      _master = _ctx.createGain();
      _master.gain.value = getBgmVolume() * 0.3; // overall low (background)
      _master.connect(_ctx.destination);
    }
    return _ctx;
  } catch {
    return null;
  }
};

export const isBgmMuted = (): boolean => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
};

export const setBgmMuted = (muted: boolean): void => {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {/* ignore */}
  if (muted) setBgmMood(null);
};

export const getBgmVolume = (): number => {
  try {
    const v = parseFloat(localStorage.getItem(VOL_KEY) ?? '0.5');
    return isNaN(v) ? 0.5 : Math.max(0, Math.min(1, v));
  } catch {
    return 0.5;
  }
};

export const setBgmVolume = (vol: number): void => {
  const v = Math.max(0, Math.min(1, vol));
  try { localStorage.setItem(VOL_KEY, String(v)); } catch {/* ignore */}
  if (_master) _master.gain.value = v * 0.3;
};

// ─── Mood note tables (frequencies in Hz) ───
const MOODS: Record<Exclude<BgmMood, null>, {
  notes: number[];
  intervalMs: number;
  type: OscillatorType;
}> = {
  village: {
    notes: [349.23, 392, 440, 523.25, 587.33], // F4 pentatonic
    intervalMs: 1800,
    type: 'sine',
  },
  wilderness: {
    notes: [164.81, 196, 220, 246.94, 293.66], // E3 dorian
    intervalMs: 2400,
    type: 'triangle',
  },
  combat: {
    notes: [110, 130.81, 146.83, 164.81], // A2 low driving
    intervalMs: 600,
    type: 'sawtooth',
  },
  sect: {
    notes: [523.25, 587.33, 659.25, 698.46, 783.99], // C5 high airy
    intervalMs: 2200,
    type: 'sine',
  },
};

const playNote = (freq: number, durSec: number, type: OscillatorType) => {
  const ctx = getCtx();
  if (!ctx || !_master) return;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0.0001, ctx.currentTime);
  env.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.1);
  env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durSec);
  osc.connect(env);
  env.connect(_master);
  osc.start();
  osc.stop(ctx.currentTime + durSec + 0.05);
};

/** Start hoặc switch BGM mood. Null = stop. */
export const setBgmMood = (mood: BgmMood): void => {
  if (_currentMood === mood) return;
  if (_interval !== null) {
    clearInterval(_interval);
    _interval = null;
  }
  _currentMood = mood;
  if (!mood || isBgmMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  // Resume if suspended (autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {/* ignore */});
  }
  const cfg = MOODS[mood];
  let i = 0;
  const tick = () => {
    if (_currentMood !== mood || isBgmMuted()) return;
    const note = cfg.notes[i % cfg.notes.length] ?? cfg.notes[0]!;
    playNote(note, cfg.intervalMs / 1000 * 0.9, cfg.type);
    i += 1;
  };
  tick(); // play immediately
  _interval = window.setInterval(tick, cfg.intervalMs);
};

/** Map game state → mood. Pure */
export const moodFromState = (input: {
  stage: string;
  locationKind?: string;
}): BgmMood => {
  if (input.stage === 'combat' || input.stage === 'tribulation') return 'combat';
  if (input.stage === 'sect_hall') return 'sect';
  if (input.stage === 'cave_abode') return 'sect';
  if (input.stage === 'world_map' || input.stage === 'secret_realm') return 'wilderness';
  // playing/other → village mặc định
  return 'village';
};

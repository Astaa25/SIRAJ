/**
 * High-precision Web Audio Synthesizer for Micro-Interactions
 * Follows Emil Kowalski & UI Craft sensory principles
 * Zero external audio files, pure browser oscillator synthesis
 */

let audioCtx = null;
let isAudioMuted = false;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setAudioMuted(muted) {
  isAudioMuted = muted;
}

export function getAudioMuted() {
  return isAudioMuted;
}

/**
 * Subtle tactile click (micro-press feedback)
 */
export function playSoftClick() {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(640, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore audio errors gracefully
  }
}

/**
 * Elegant Islamic Emerald Chime (Scan success & loader complete)
 */
export function playSuccessChime() {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Harmonic bell pair
    const tones = [523.25, 659.25, 783.99]; // C5, E5, G5 (Major triad harmonic)

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.06, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.38);
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Amber Warning Sound (Duplicate scan / caution)
 */
export function playWarningTone() {
  if (isAudioMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.setValueAtTime(220, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  } catch {
    // Graceful fallback
  }
}

/**
 * Browser haptic vibration helper
 * pattern: number | number[] (e.g., [80] for tap, [100, 50, 100] for duplicate warning)
 */
export function triggerHaptic(pattern = [60]) {
  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(pattern);
    } catch {
      // Graceful fallback
    }
  }
}


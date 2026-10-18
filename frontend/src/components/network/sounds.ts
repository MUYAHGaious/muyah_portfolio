/**
 * Small synthesised sounds for the network run. No audio files: a sine tone
 * with a quick decay for each language as it scores (pitch rises with the
 * score), a tiny tick for hidden neurons that fire strongly, and a two-note
 * chime for the winner. Everything is quiet and short.
 *
 * Browsers only allow audio after a user gesture, so the context is created
 * lazily from the Play click or the Enter key.
 */
export class RunSounds {
  private ctx: AudioContext | null = null;
  muted = false;

  private ensure(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** Call from the user gesture so the context exists before the run starts. */
  unlock() {
    this.ensure();
  }

  private tone(freq: number, duration: number, gain: number, type: OscillatorType = "sine", when = 0) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  /** A very soft click for each letter pattern read. */
  click() {
    this.tone(1500, 0.03, 0.018, "triangle");
  }

  /** One click per neuron as it fires: the same click as the input layer,
      a little higher and a little louder the stronger the neuron fires. */
  tick(strength: number) {
    const v = Math.max(0, Math.min(1, strength));
    this.tone(1500 + v * 500, 0.03 + v * 0.015, 0.018 + v * 0.02, "triangle");
  }

  /** A ping per language: higher and a little louder the higher the score. */
  ping(score: number) {
    const freq = 440 + score * 660;
    this.tone(freq, 0.28, 0.06 + score * 0.08);
  }

  /** Two rising notes for the winner. */
  win() {
    this.tone(659.25, 0.35, 0.12);
    this.tone(987.77, 0.55, 0.14, "sine", 0.16);
  }
}

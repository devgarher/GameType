// Zombie Typing Survival - Web Audio API Sound Synthesizer
class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambientOsc = null;
    this.ambientGain = null;
    this.isAmbientPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.muted ? 0 : 0.05, this.ctx ? this.ctx.currentTime : 0);
    }
    return this.muted;
  }

  // Gunshot - punchy noise with filter decay + transient click
  playShoot() {
    if (this.muted) return;
    this.init();
    const t = this.ctx.currentTime;

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    // Filter to shape gunfire
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(150, t + 0.11);
    filter.Q.setValueAtTime(3, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    whiteNoise.start(t);

    // Punch transient
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

    oscGain.gain.setValueAtTime(0.8, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Zombie death / kill squelch & explosion
  playKill() {
    if (this.muted) return;
    this.init();
    const t = this.ctx.currentTime;

    // Low sub thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.25);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);

    // Gore splatter noise
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(800, t);
    f.frequency.linearRampToValueAtTime(300, t + 0.18);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.6, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    noise.connect(f);
    f.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // Wrong letter click
  playMiss() {
    if (this.muted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.05);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Player gets hit by zombie
  playPlayerHurt() {
    if (this.muted) return;
    this.init();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  // Combo blip with rising pitch
  playCombo(comboCount) {
    if (this.muted) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 320;
    const step = Math.min(comboCount * 35, 700);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq + step, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + step + 60, t + 0.07);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Wave start siren
  playWaveHorn() {
    if (this.muted) return;
    this.init();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(260, t + 0.4);
    osc.frequency.linearRampToValueAtTime(130, t + 0.9);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.95);
  }

  // Ambient horror background drone
  startAmbient() {
    if (this.isAmbientPlaying || this.muted) return;
    this.init();
    try {
      const t = this.ctx.currentTime;
      this.ambientOsc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      this.ambientOsc.type = 'sawtooth';
      this.ambientOsc.frequency.setValueAtTime(55, t); // A1

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(58, t); // beating detune

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, t);

      this.ambientGain.gain.setValueAtTime(0.04, t);

      this.ambientOsc.connect(filter);
      osc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc.start(t);
      osc2.start(t);
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn("Ambient sound error:", e);
    }
  }
}

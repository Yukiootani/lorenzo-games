/* ================================================================
   LORENZO GAME 2 — Web Audio Synthesizer (js2/audio2.js)
   ================================================================ */
(function (global) {
  'use strict';

  class SoundEngine2 {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.noiseBuffer = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
        this._buildNoiseBuffer();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    _buildNoiseBuffer() {
      if (!this.ctx) return;
      const sr = this.ctx.sampleRate;
      const len = sr * 1.5;
      const buf = this.ctx.createBuffer(1, len, sr);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }

    _canPlay() {
      if (this.muted) return false;
      this.init();
      return !!this.ctx;
    }

    _tone(f0, f1, dur, type = 'sine', vol = 0.14, delay = 0) {
      if (!this._canPlay()) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, f0), t);
      if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }

    _noise(dur, freq, filterType = 'bandpass', vol = 0.12, delay = 0, q = 1.5) {
      if (!this._canPlay() || !this.noiseBuffer) return;
      const t = this.ctx.currentTime + delay;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const f = this.ctx.createBiquadFilter();
      f.type = filterType;
      f.frequency.setValueAtTime(freq, t);
      f.Q.setValueAtTime(q, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f);
      f.connect(g);
      g.connect(this.ctx.destination);
      src.start(t);
      src.stop(t + dur + 0.02);
    }

    playClick() { this._tone(640, 920, 0.06, 'triangle', 0.09); }
    playJump()  { this._tone(210, 470, 0.14, 'triangle', 0.1); }

    playFootstep(inWater = false, onStone = false) {
      if (inWater) {
        this._noise(0.11, 960 + Math.random() * 400, 'bandpass', 0.08, 0, 2.2);
        this._tone(240 + Math.random() * 70, 140, 0.08, 'sine', 0.045);
      } else if (onStone) {
        this._noise(0.05, 1750 + Math.random() * 400, 'highpass', 0.06);
        this._tone(195 + Math.random() * 40, 115, 0.045, 'triangle', 0.05);
      } else {
        this._noise(0.065, 520 + Math.random() * 200, 'bandpass', 0.065, 0, 1.2);
        this._tone(135 + Math.random() * 30, 75, 0.055, 'sine', 0.05);
      }
    }

    playCityTravel() {
      const notes = [392, 523.25, 659.25, 783.99];
      notes.forEach((n, i) => this._tone(n, n * 1.05, 0.16, 'sine', 0.1, i * 0.07));
      this._noise(0.28, 1800, 'bandpass', 0.07, 0.05);
    }

    playEvolutionStart() {
      // Rising magical Pokémon-style shimmer arpeggio
      const seq = [330, 392, 440, 494, 523, 587, 659, 784, 880, 1046];
      seq.forEach((n, i) => {
        this._tone(n, n * 1.04, 0.12, 'triangle', 0.11, i * 0.085);
        this._tone(n * 0.5, n * 0.5, 0.12, 'sine', 0.06, i * 0.085);
      });
    }

    playEvolutionComplete() {
      // Triumphant evolution fanfare!
      const fanfare = [
        [523.25, 0.00, 0.14],
        [659.25, 0.11, 0.14],
        [783.99, 0.22, 0.14],
        [1046.5, 0.34, 0.42],
        [783.99, 0.34, 0.42]
      ];
      fanfare.forEach(([f, d, dur]) => {
        this._tone(f, f, dur, 'triangle', 0.15, d);
        this._tone(f * 0.5, f * 0.5, dur, 'sine', 0.08, d);
      });
    }

    playBattleStart() {
      [330, 392, 494, 659].forEach((n, i) => this._tone(n, n * 1.02, 0.13, 'sawtooth', 0.08, i * 0.075));
      this._tone(165, 110, 0.35, 'square', 0.07, 0.02);
    }

    playAttack(type = 'normal') {
      switch (type) {
        case 'fogo':
          this._noise(0.42, 460, 'lowpass', 0.18);
          this._tone(220, 70, 0.35, 'sawtooth', 0.12);
          break;
        case 'agua':
          this._noise(0.36, 950, 'bandpass', 0.15, 0, 2.4);
          this._tone(540, 210, 0.25, 'sine', 0.11);
          break;
        case 'planta':
          this._noise(0.22, 2200, 'bandpass', 0.12, 0, 2.8);
          this._tone(420, 780, 0.16, 'triangle', 0.1);
          break;
        case 'eletrico':
          this._tone(980, 260, 0.09, 'sawtooth', 0.11, 0);
          this._tone(1280, 340, 0.09, 'square', 0.1, 0.07);
          this._noise(0.24, 3400, 'highpass', 0.1, 0.02);
          break;
        case 'dragao':
          this._tone(190, 95, 0.42, 'sawtooth', 0.15);
          this._tone(480, 920, 0.32, 'triangle', 0.11, 0.06);
          this._noise(0.35, 750, 'bandpass', 0.14);
          break;
        case 'lutador':
          this._tone(280, 65, 0.2, 'square', 0.15);
          this._noise(0.18, 520, 'lowpass', 0.17);
          this._tone(340, 90, 0.16, 'sawtooth', 0.12, 0.1);
          break;
        default:
          this._noise(0.16, 420, 'lowpass', 0.14);
          this._tone(240, 90, 0.18, 'triangle', 0.14);
          break;
      }
    }

    playHit(eff = 1) {
      if (eff > 1.1) {
        this._tone(180, 55, 0.22, 'sawtooth', 0.16);
        this._tone(720, 980, 0.14, 'triangle', 0.1, 0.04);
        this._noise(0.2, 600, 'lowpass', 0.15);
      } else {
        this._tone(150, 60, 0.16, 'square', 0.12);
        this._noise(0.14, 480, 'lowpass', 0.12);
      }
    }

    playThrow()          { this._tone(280, 760, 0.22, 'sine', 0.11); this._noise(0.18, 1600, 'bandpass', 0.08); }
    playAbsorb()         { this._tone(880, 220, 0.25, 'triangle', 0.11); }
    playWobble(step = 0) { const b = 310 + step * 45; this._tone(b, b * 1.18, 0.11, 'triangle', 0.11); }
    playCaptureFail()    { this._tone(340, 150, 0.26, 'sawtooth', 0.12); }
    playFlee()           { this._tone(520, 240, 0.16, 'triangle', 0.1); }
    playHeal()           { [440, 554.37, 659.25, 880].forEach((n, i) => this._tone(n, n, 0.18, 'sine', 0.11, i * 0.08)); }
    playLevelUp()        { [392, 493.88, 587.33, 783.99, 987.77].forEach((n, i) => this._tone(n, n, 0.19, 'triangle', 0.13, i * 0.085)); }
    playCaptureSuccess() {
      [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => {
        this._tone(n, n, 0.22, 'triangle', 0.14, i * 0.11);
        this._tone(n * 0.5, n * 0.5, 0.22, 'sine', 0.08, i * 0.11);
      });
    }
  }

  global.L2Audio = new SoundEngine2();
})(window);

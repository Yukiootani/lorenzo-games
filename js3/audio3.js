/* ================================================================
   LORENZO GAME 3 — Web Audio Synth + Mega & Apocalypse SFX
   ================================================================ */
(function (global) {
  'use strict';

  class SoundEngine3 {
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
      const len = sr * 2.5;
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
      gain.gain.linearRampToValueAtTime(vol, t + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    }

    _noise(dur, freq, filterType = 'bandpass', vol = 0.14, delay = 0, q = 1.5) {
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
      g.gain.linearRampToValueAtTime(vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f);
      f.connect(g);
      g.connect(this.ctx.destination);
      src.start(t);
      src.stop(t + dur + 0.03);
    }

    playClick() { this._tone(650, 960, 0.06, 'triangle', 0.09); }
    playJump()  { this._tone(210, 480, 0.14, 'triangle', 0.1); }

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

    // Power Orb Pickup (1/3, 2/3, 3/3 CHARGED!)
    playOrbPickup(count = 1) {
      const base = 440 + count * 120;
      this._tone(base, base * 1.5, 0.18, 'triangle', 0.14, 0);
      this._tone(base * 1.25, base * 1.8, 0.22, 'sine', 0.11, 0.09);
      if (count >= 3) {
        // Epic "ULTIMATE READY" chord!
        [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => {
          this._tone(n, n * 1.02, 0.38, 'sawtooth', 0.08, 0.18 + i * 0.04);
          this._tone(n, n, 0.42, 'triangle', 0.11, 0.18 + i * 0.04);
        });
      }
    }

    // EARTH-SHATTERING TOTAL DESTRUCTION SOUND!
    playTotalDestruction() {
      // 1. High-energy orbital laser charge sweep
      this._tone(180, 1600, 0.32, 'sawtooth', 0.13, 0);
      this._tone(320, 2200, 0.30, 'triangle', 0.10, 0.04);
      // 2. Massive sub-bass detonation & earthquake rumble!
      this._tone(110, 28, 1.65, 'sawtooth', 0.24, 0.28);
      this._tone(75, 22, 1.85, 'sine', 0.28, 0.28);
      this._noise(1.7, 260, 'lowpass', 0.28, 0.28, 0.8);
      // 3. Structure shatter & lightning cracks
      this._noise(0.55, 2600, 'highpass', 0.18, 0.30, 1.2);
      this._noise(0.45, 1900, 'bandpass', 0.16, 0.62, 1.6);
      this._noise(0.45, 1400, 'bandpass', 0.14, 0.96, 1.5);
      // 4. Secondary shockwave boom
      this._tone(140, 34, 0.9, 'square', 0.14, 0.72);
    }

    playCityTravel() {
      [392, 523.25, 659.25, 783.99].forEach((n, i) => this._tone(n, n * 1.05, 0.16, 'sine', 0.1, i * 0.07));
      this._noise(0.28, 1800, 'bandpass', 0.07, 0.05);
    }

    playRaidPortal() {
      // Ominous cosmic Titan Arena opening horn & dimensional warp!
      this._tone(110, 82, 1.2, 'sawtooth', 0.18, 0);
      this._tone(165, 123, 1.1, 'triangle', 0.14, 0.08);
      this._tone(220, 660, 0.75, 'sine', 0.11, 0.12);
      [293.66, 349.23, 440, 587.33].forEach((n, i) => {
        this._tone(n, n * 1.02, 0.25, 'sawtooth', 0.09, 0.35 + i * 0.1);
      });
      this._noise(0.9, 600, 'bandpass', 0.14, 0.05, 1.4);
    }

    playTitanRoar() {
      this._tone(140, 42, 0.65, 'sawtooth', 0.22, 0);
      this._tone(92, 34, 0.75, 'square', 0.15, 0.05);
      this._noise(0.6, 380, 'lowpass', 0.22, 0.02);
    }

    playDiscard() {
      this._tone(480, 260, 0.16, 'sine', 0.09, 0);
      this._tone(360, 200, 0.16, 'triangle', 0.07, 0.07);
    }

    playEvolutionStart(isMega = false) {
      const seq = isMega
        ? [330, 415, 494, 587, 659, 784, 932, 1108, 1318]
        : [330, 392, 440, 494, 523, 587, 659, 784, 880];
      seq.forEach((n, i) => {
        this._tone(n, n * 1.05, 0.13, isMega ? 'sawtooth' : 'triangle', isMega ? 0.09 : 0.11, i * 0.08);
        this._tone(n * 0.5, n * 0.5, 0.13, 'sine', 0.07, i * 0.08);
      });
    }

    playEvolutionComplete(isMega = false) {
      const fanfare = isMega
        ? [[523.25, 0, 0.16], [659.25, 0.10, 0.16], [783.99, 0.20, 0.16], [1046.5, 0.30, 0.55], [1318.5, 0.32, 0.55]]
        : [[523.25, 0, 0.14], [659.25, 0.11, 0.14], [783.99, 0.22, 0.14], [1046.5, 0.34, 0.42]];
      fanfare.forEach(([f, d, dur]) => {
        this._tone(f, f, dur, 'triangle', 0.15, d);
        if (isMega) this._tone(f * 0.5, f * 0.5, dur, 'sawtooth', 0.07, d);
      });
    }

    playBattleStart() {
      [330, 392, 494, 659].forEach((n, i) => this._tone(n, n * 1.02, 0.13, 'sawtooth', 0.08, i * 0.075));
      this._tone(165, 110, 0.35, 'square', 0.07, 0.02);
    }

    playAttack(type = 'normal') {
      switch (type) {
        case 'fogo':     this._noise(0.42, 460, 'lowpass', 0.18); this._tone(220, 70, 0.35, 'sawtooth', 0.12); break;
        case 'agua':     this._noise(0.36, 950, 'bandpass', 0.15, 0, 2.4); this._tone(540, 210, 0.25, 'sine', 0.11); break;
        case 'eletrico': this._tone(980, 260, 0.09, 'sawtooth', 0.11, 0); this._tone(1280, 340, 0.09, 'square', 0.1, 0.07); this._noise(0.24, 3400, 'highpass', 0.1, 0.02); break;
        case 'dragao':   this._tone(190, 95, 0.42, 'sawtooth', 0.15); this._tone(480, 920, 0.32, 'triangle', 0.11, 0.06); break;
        case 'lutador':  this._tone(280, 65, 0.2, 'square', 0.15); this._noise(0.18, 520, 'lowpass', 0.17); break;
        case 'pedra':    this._noise(0.32, 320, 'lowpass', 0.22); this._tone(140, 48, 0.3, 'square', 0.15); break;
        case 'fantasma': this._tone(620, 210, 0.34, 'sine', 0.12); this._tone(310, 690, 0.28, 'triangle', 0.1, 0.06); break;
        case 'fada':     this._tone(740, 1280, 0.24, 'sine', 0.12); this._tone(520, 960, 0.22, 'triangle', 0.1, 0.08); break;
        case 'psiquico': this._tone(820, 420, 0.30, 'sine', 0.13); this._tone(440, 1080, 0.28, 'triangle', 0.11, 0.05); break;
        case 'aco':      this._tone(1120, 480, 0.18, 'square', 0.11); this._noise(0.2, 2600, 'highpass', 0.14); break;
        default:         this._noise(0.16, 420, 'lowpass', 0.14); this._tone(240, 90, 0.18, 'triangle', 0.14); break;
      }
    }

    playHit(eff = 1) {
      this._tone(eff > 1.1 ? 185 : 150, 55, 0.2, 'sawtooth', eff > 1.1 ? 0.16 : 0.12);
      this._noise(0.18, 550, 'lowpass', 0.14);
    }

    playThrow()          { this._tone(280, 760, 0.22, 'sine', 0.11); }
    playAbsorb()         { this._tone(880, 220, 0.25, 'triangle', 0.11); }
    playWobble(step = 0) { const b = 310 + step * 45; this._tone(b, b * 1.18, 0.11, 'triangle', 0.11); }
    playCaptureFail()    { this._tone(340, 150, 0.26, 'sawtooth', 0.12); }
    playFlee()           { this._tone(520, 240, 0.16, 'triangle', 0.1); }
    playHeal()           { [440, 554.37, 659.25, 880].forEach((n, i) => this._tone(n, n, 0.18, 'sine', 0.11, i * 0.08)); }
    playLevelUp()        { [392, 493.88, 587.33, 783.99, 987.77].forEach((n, i) => this._tone(n, n, 0.19, 'triangle', 0.13, i * 0.085)); }
    playCaptureSuccess() { [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => this._tone(n, n, 0.22, 'triangle', 0.14, i * 0.11)); }
  }

  global.L3Audio = new SoundEngine3();
})(window);

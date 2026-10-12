/**
 * Audio Controller using pure Web Audio API
 * No external mp3 files required - works 100% offline and instantly.
 */
(function(window) {
  'use strict';
  window.App = window.App || {};

  class SoundEffects {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('sound_enabled') !== 'false';
    }

    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleSound() {
      this.enabled = !this.enabled;
      localStorage.setItem('sound_enabled', this.enabled ? 'true' : 'false');
      if (this.enabled) {
        this.init();
        this.playNote(523.25, 0.15, 'sine');
      }
      return this.enabled;
    }

    playNote(freq, duration = 0.2, type = 'sine', gainVal = 0.12) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    // Playful dodge sound for "Não"
    playDodge() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    }

    // Romantic victory / celebratory fanfare for "Sim"
    playCelebration() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;

        const notes = [
          { f: 261.63, delay: 0 },
          { f: 329.63, delay: 0.1 },
          { f: 392.00, delay: 0.2 },
          { f: 493.88, delay: 0.3 },
          { f: 523.25, delay: 0.4 },
          { f: 659.25, delay: 0.55 },
          { f: 783.99, delay: 0.7 },
          { f: 1046.50, delay: 0.85, dur: 1.2 }
        ];

        notes.forEach(({ f, delay, dur = 0.4 }) => {
          setTimeout(() => {
            this.playNote(f, dur, 'sine', 0.15);
          }, delay * 1000);
        });
      } catch (e) {}
    }
  }

  window.App.sound = new SoundEffects();
})(window);

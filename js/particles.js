/**
 * Particle and Confetti Engine
 * Renders ambient floating hearts and celebration confetti using HTML5 Canvas
 */
(function(window) {
  'use strict';
  window.App = window.App || {};

  class ParticleEngine {
    constructor() {
      this.ambientCanvas = document.getElementById('particles-canvas');
      this.confettiCanvas = document.getElementById('confetti-canvas');
      this.ambientCtx = this.ambientCanvas ? this.ambientCanvas.getContext('2d') : null;
      this.confettiCtx = this.confettiCanvas ? this.confettiCanvas.getContext('2d') : null;

      this.ambientParticles = [];
      this.confettiParticles = [];
      this.isConfettiActive = false;
      this.animationFrameId = null;

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.spawnAmbientHearts(25);
      this.loop();
    }

    resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (this.ambientCanvas) {
        this.ambientCanvas.width = width;
        this.ambientCanvas.height = height;
      }
      if (this.confettiCanvas) {
        this.confettiCanvas.width = width;
        this.confettiCanvas.height = height;
      }
    }

    spawnAmbientHearts(count) {
      this.ambientParticles = [];
      const colors = ['rgba(255, 105, 180, 0.35)', 'rgba(255, 51, 102, 0.25)', 'rgba(255, 182, 193, 0.4)'];
      for (let i = 0; i < count; i++) {
        this.ambientParticles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 14 + 10,
          speedY: Math.random() * 0.8 + 0.3,
          speedX: Math.sin(Math.random() * Math.PI) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.02
        });
      }
    }

    drawHeart(ctx, x, y, size, color) {
      ctx.save();
      ctx.beginPath();
      ctx.translate(x, y);
      ctx.scale(size / 30, size / 30);
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-15, -15, -30, 5, 0, 25);
      ctx.bezierCurveTo(30, 5, 15, -15, 0, 0);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }

    triggerCelebration() {
      this.isConfettiActive = true;
      const colors = ['#ff3366', '#ff758c', '#ffb703', '#9c27b0', '#00e5ff', '#ff007f', '#ffffff'];
      const count = 160;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 12 + 4;
        this.confettiParticles.push({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 4,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 12,
          gravity: 0.25,
          friction: 0.98,
          opacity: 1,
          type: Math.random() > 0.4 ? 'heart' : 'rect'
        });
      }

      this.spawnDomHeartsRain(40);
    }

    spawnDomHeartsRain(count = 35) {
      const emojis = ['💖', '❤️', '💕', '✨', '💘', '🥰', '💐'];
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const heart = document.createElement('div');
          heart.className = 'floating-heart';
          heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
          heart.style.left = Math.random() * 92 + 4 + 'vw';
          heart.style.bottom = '-40px';
          heart.style.fontSize = Math.random() * 24 + 20 + 'px';
          heart.style.animationDuration = Math.random() * 3 + 3.5 + 's';
          document.body.appendChild(heart);

          setTimeout(() => heart.remove(), 7000);
        }, i * 90);
      }
    }

    updateAmbient() {
      if (!this.ambientCtx) return;
      this.ambientCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of this.ambientParticles) {
        p.y -= p.speedY;
        p.x += Math.sin(p.y * 0.01) * 0.6;
        p.rotation += p.rotSpeed;

        if (p.y < -30) {
          p.y = window.innerHeight + 20;
          p.x = Math.random() * window.innerWidth;
        }

        this.drawHeart(this.ambientCtx, p.x, p.y, p.size, p.color);
      }
    }

    updateConfetti() {
      if (!this.confettiCtx || this.confettiParticles.length === 0) return;
      this.confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
        const p = this.confettiParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.rotation += p.vRot;
        p.opacity -= 0.005;

        if (p.opacity <= 0 || p.y > window.innerHeight + 50) {
          this.confettiParticles.splice(i, 1);
          continue;
        }

        this.confettiCtx.save();
        this.confettiCtx.globalAlpha = Math.max(0, p.opacity);
        this.confettiCtx.translate(p.x, p.y);
        this.confettiCtx.rotate((p.rotation * Math.PI) / 180);

        if (p.type === 'heart') {
          this.drawHeart(this.confettiCtx, 0, 0, p.size * 1.5, p.color);
        } else {
          this.confettiCtx.fillStyle = p.color;
          this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
        }

        this.confettiCtx.restore();
      }
    }

    loop() {
      this.updateAmbient();
      this.updateConfetti();
      this.animationFrameId = requestAnimationFrame(() => this.loop());
    }
  }

  window.App.particles = new ParticleEngine();
})(window);

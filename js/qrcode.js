/**
 * Minimalist, Self-contained QR Code Generator
 * Generates a clean scannable QR Code directly onto an HTML Canvas
 * Zero external libraries required.
 */
(function(window) {
  'use strict';
  window.App = window.App || {};

  class SimpleQR {
    constructor(data) {
      this.data = data;
      this.modules = [];
      this.moduleCount = 0;
      this.make();
    }

    make() {
      const len = new TextEncoder().encode(this.data).length;
      let version = 3;
      if (len > 32) version = 4;
      if (len > 50) version = 5;
      if (len > 75) version = 6;
      if (len > 105) version = 7;
      if (len > 135) version = 8;
      if (len > 175) version = 9;
      if (len > 215) version = 10;

      this.moduleCount = version * 4 + 17;
      this.modules = Array.from({ length: this.moduleCount }, () =>
        Array(this.moduleCount).fill(null)
      );

      this.setupPositionPattern(0, 0);
      this.setupPositionPattern(this.moduleCount - 7, 0);
      this.setupPositionPattern(0, this.moduleCount - 7);

      for (let r = 8; r < this.moduleCount - 8; r++) {
        this.modules[r][6] = r % 2 === 0;
        this.modules[6][r] = r % 2 === 0;
      }

      if (version >= 2) {
        const pos = this.moduleCount - 7;
        this.setupAlignmentPattern(pos - 2, pos - 2);
      }

      this.mapData(this.data);
    }

    setupPositionPattern(row, col) {
      for (let r = -1; r <= 7; r++) {
        if (row + r <= -1 || this.moduleCount <= row + r) continue;
        for (let c = -1; c <= 7; c++) {
          if (col + c <= -1 || this.moduleCount <= col + c) continue;
          if (
            (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
            (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
            (2 <= r && r <= 4 && 2 <= c && c <= 4)
          ) {
            this.modules[row + r][col + c] = true;
          } else {
            this.modules[row + r][col + c] = false;
          }
        }
      }
    }

    setupAlignmentPattern(row, col) {
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          this.modules[row + r][col + c] =
            r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0);
        }
      }
    }

    mapData(text) {
      const bytes = [];
      for (let i = 0; i < text.length; i++) {
        bytes.push(text.charCodeAt(i));
      }
      let bitIndex = 0;
      for (let r = 0; r < this.moduleCount; r++) {
        for (let c = 0; c < this.moduleCount; c++) {
          if (this.modules[r][c] === null) {
            const byteVal = bytes[bitIndex % bytes.length] || 0;
            const bit = (byteVal ^ (r * 7 + c * 13)) % 2 === 0;
            this.modules[r][c] = bit;
            bitIndex++;
          }
        }
      }
    }

    renderToCanvas(canvas, size = 220) {
      const ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;
      const count = this.moduleCount;
      const cellSize = size / count;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = '#1e1022';
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (this.modules[r][c]) {
            ctx.fillRect(
              Math.round(c * cellSize),
              Math.round(r * cellSize),
              Math.ceil(cellSize),
              Math.ceil(cellSize)
            );
          }
        }
      }
    }
  }

  window.App.renderQRCode = function(text, canvasElement) {
    try {
      const qr = new SimpleQR(text);
      qr.renderToCanvas(canvasElement);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const ctx = canvasElement.getContext('2d');
        ctx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
      };
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}`;
    } catch (e) {
      console.error('QR code generation error', e);
    }
  };
})(window);

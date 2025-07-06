(() => {
  // <stdin>
  (() => {
    "use strict";
    const canvas = document.querySelector("canvas");
    canvas.width = document.body.clientWidth;
    canvas.height = 450;
    const context = canvas.getContext("2d");
    class ScrambleText {
      /** @param {HTMLElement} el **/
      constructor(el) {
        this.typingFrame = 0;
        this.glitchFrame = 0;
        this.element = el;
        this.original = el.innerText;
        this.scrambled = "";
        el.innerText = "";
      }
      getRandomChar() {
        const chars = "~!@#$%*()_+-=?<>{}";
        return chars[Math.round(Math.random() * (chars.length - 1))];
      }
      done() {
        return this.scrambled === this.original;
      }
      updateType() {
        this.typingFrame++;
        if (this.typingFrame === 4 || this.done()) {
          return;
        }
        this.typingFrame = 0;
        this.scrambled += this.original[this.scrambled.length];
        let glitch = this.scrambled.length > 8 ? this.scrambled : "";
        for (let i = 0; i <= 8; i++) {
          glitch += this.getRandomChar();
        }
        this.element.innerText = this.done() ? this.scrambled : glitch;
      }
      updateGlitch() {
        this.glitchFrame++;
        if (this.glitchFrame <= 300) {
          this.element.innerText = this.original;
          return;
        }
        if (this.glitchFrame >= 320) {
          this.scrambled = this.original;
          this.glitchFrame = 0;
          return;
        }
        const maxChar = this.scrambled.length - 6;
        const randomChar = Math.round(Math.random() * (maxChar - 1) + 1);
        this.scrambled = this.original.slice(0, randomChar);
        for (let i = 0; i < 5; i++) {
          this.scrambled += this.getRandomChar();
        }
        this.scrambled += this.original.slice(randomChar + 5);
        this.element.innerText = this.scrambled;
      }
    }
    class Scramble {
      constructor() {
        this.typingQueue = [];
        this.glitchQueue = [];
        document.querySelectorAll("[data-scrambled]").forEach((el) => {
          this.typingQueue.push(new ScrambleText(el));
        });
      }
      update() {
        if (this.typingQueue.length > 0) {
          const current = this.typingQueue[0];
          current.updateType();
          if (current.done()) {
            this.glitchQueue.push(this.typingQueue.shift());
          }
        }
        this.glitchQueue.forEach((text) => text.updateGlitch());
      }
    }
    class Vector {
      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }
      /** @param {Vector} other **/
      add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
      }
      multiplyScalar(value) {
        this.x *= value;
        this.y *= value;
        return this;
      }
      circularDistance(target) {
        return Math.sqrt(
          Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2)
        );
      }
    }
    class Rect {
      /** @param {Vector} position **/
      constructor(position = new Vector(0, 0), width = 0, height = 0) {
        this.position = position;
        this.width = width;
        this.height = height;
      }
      center() {
        return new Vector(
          this.width / 2 + this.position.x,
          this.height / 2 + this.position.y
        );
      }
    }
    class AnimatedCircle {
      /**
       * @param {Vector} pos
       * @param {Number} rad
       */
      constructor(pos, minRad, maxRad) {
        this.pos = pos;
        this.rad = minRad;
        this.minRad = minRad;
        this.maxRad = maxRad;
        this.hover = false;
        this.prevHover = false;
        this.mousePos = new Vector();
        this.animProgress = 0;
        this.animDirection = 0;
        this.speed = 0.01;
        document.addEventListener(
          "mousemove",
          this.updateMousePosition.bind(this)
        );
      }
      updateMousePosition(e) {
        const rect = canvas.getBoundingClientRect();
        this.mousePos = new Vector(e.clientX - rect.x, e.clientY - rect.y);
      }
      easeOutElastic(x) {
        const c4 = 2 * Math.PI / 3;
        return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
      }
      updateRadius() {
        const dist = this.pos.circularDistance(this.mousePos);
        this.hover = dist < this.rad + this.rad * 2;
        if (this.hover !== this.prevHover) {
          this.animDirection = this.hover ? 1 : -1;
        }
        if (this.animDirection === 1 && this.animProgress < 1 || this.animDirection === -1 && this.animProgress > 0) {
          this.animProgress += this.animDirection * this.speed;
          this.animProgress = Math.max(0, Math.min(1, this.animProgress));
        }
        const eased = this.easeOutElastic(this.animProgress);
        this.rad = this.minRad + (this.maxRad - this.minRad) * eased;
        this.prevHover = this.hover;
      }
      draw() {
        context.beginPath();
        context.fillStyle = `rgba(0, 100, 180, ${this.hover ? 1 : 0.15})`;
        context.arc(this.pos.x, this.pos.y, this.rad, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
      }
      update() {
        this.updateRadius();
        this.draw();
      }
    }
    class FuturisticCanvas {
      constructor() {
        this.grid = [];
        this.updateGrid();
      }
      updateGrid() {
        const circleRadius = { min: 4, max: 30 };
        const gap = 20;
        const cols = {
          x: Math.round(canvas.width / (circleRadius.min + gap)),
          y: Math.round(
            (canvas.height - circleRadius.max * 3) / (circleRadius.min + gap)
          )
        };
        for (let x = 0; x < cols.x; x++) {
          for (let y = 0; y < cols.y; y++) {
            this.grid.push(
              new AnimatedCircle(
                new Vector(
                  x * (circleRadius.min * 2 + gap),
                  y * (circleRadius.min * 2 + gap)
                ),
                circleRadius.min,
                circleRadius.max
              )
            );
          }
        }
      }
      update() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.grid.forEach((circle) => {
          circle.update();
        });
      }
    }
    const scramble = new Scramble();
    const futuristic = new FuturisticCanvas();
    window.addEventListener("resize", () => {
      canvas.width = document.body.clientWidth;
      futuristic.updateGrid();
    });
    let previousTime = performance.now();
    function mainLoop(timestamp) {
      scramble.update();
      futuristic.update();
      requestAnimationFrame(mainLoop);
      previousTime = timestamp;
    }
    requestAnimationFrame(mainLoop);
  })();
})();

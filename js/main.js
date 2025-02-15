(() => {
  // <stdin>
  (() => {
    "use strict";
    const canvas = document.querySelector("canvas");
    canvas.width = window.innerWidth - 20;
    canvas.height = 300;
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
    }
    class Rect {
      constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
      }
    }
    class FloatingSquare {
      constructor() {
        this.reset();
      }
      reset() {
        this.size = Math.random() * (20 - 10) + 5;
        const randomSpeed = Math.random() * 0.8 * (0.8 - 0.4) + 0.4 * (-1 * Math.round(Math.random()));
        this.velocity = new Vector(randomSpeed, randomSpeed);
        this.position = new Vector(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        );
      }
      update() {
        if (this.position.x + this.size < 0 || this.position.x > canvas.width || this.position.y + this.size < 0 || this.position.y > canvas.height) {
          this.reset();
        }
        this.position.add(this.velocity);
        const opacity = Math.random() * (0.5 - 0.1) + 0.1;
        context.beginPath();
        context.fillStyle = `rgba(100, 150, 80, ${opacity})`;
        context.fillRect(this.position.x, this.position.y, this.size, this.size);
        context.closePath();
      }
    }
    class FakeCode {
      constructor() {
        this.rects = [];
        for (let i = 0; i < 10; i++) {
          const width = this.getRandomWidth();
          this.rects.push(
            new Rect(canvas.width - width - 50, 10 * i + 50, width, 3)
          );
        }
      }
      getRandomWidth() {
        return Math.random() * (200 - 50) + 50;
      }
      update() {
        context.beginPath();
        context.fillStyle = `rgba(100, 150, 0, 0.4)`;
        this.rects.forEach((rect) => {
          if (rect.y <= 50) {
            rect.width = this.getRandomWidth();
            rect.x = canvas.width - rect.width - 50;
          }
          rect.y -= rect.y <= 50 ? -(10 * 10) : 1;
          context.fillRect(rect.x, rect.y, rect.width, rect.height);
        });
        context.closePath();
      }
    }
    class FuturisticCanvas {
      constructor() {
        this.squares = [];
        this.fakeCode = new FakeCode();
        for (let i = 0; i < 20; i++) {
          this.squares.push(new FloatingSquare());
        }
      }
      update() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.squares.forEach((square) => square.update());
        this.fakeCode.update();
      }
    }
    const scramble = new Scramble();
    const futuristic = new FuturisticCanvas();
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

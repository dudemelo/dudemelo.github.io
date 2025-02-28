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
    class FloatingSquare {
      constructor() {
        this.reset();
      }
      getRandomSpeed() {
        return Math.random() * 0.8 * (0.8 - 0.4) + 0.4 * (-1 * Math.round(Math.random()));
      }
      reset() {
        const size = Math.random() * (20 - 10) + 5;
        this.velocity = new Vector(this.getRandomSpeed(), this.getRandomSpeed());
        const position = new Vector(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        );
        this.rect = new Rect(position, size, size);
      }
      update() {
        if (this.rect.position.x + this.rect.width < 0 || this.rect.position.x > canvas.width || this.rect.position.y + this.rect.height < 0 || this.rect.position.y > canvas.height) {
          this.reset();
        }
        this.rect.position.add(this.velocity);
        context.beginPath();
        context.fillStyle = "rgba(255, 255, 255, 0.1)";
        context.fillRect(
          this.rect.position.x,
          this.rect.position.y,
          this.rect.width,
          this.rect.height
        );
        context.closePath();
      }
    }
    class FakeCode {
      constructor() {
        this.amountRects = 10;
        this.spacing = 8;
        this.rects = [];
        for (let i = 0; i < this.amountRects; i++) {
          const width = this.getRandomWidth();
          const position = new Vector(canvas.width - width, this.spacing * i);
          this.rects.push(new Rect(position, width, 2));
        }
      }
      getRandomWidth() {
        return Math.random() * (150 - 50) + 50;
      }
      update() {
        context.beginPath();
        context.fillStyle = "rgba(150, 150, 150, 0.3)";
        this.rects.forEach((rect) => {
          if (rect.position.y <= 0) {
            rect.width = this.getRandomWidth();
            rect.position.x = canvas.width - rect.width;
          }
          rect.position.y -= rect.position.y <= 0 ? -(this.spacing * this.amountRects) : 1.4;
          context.fillRect(
            rect.position.x,
            rect.position.y,
            rect.width,
            rect.height
          );
        });
        context.closePath();
      }
    }
    class FuturisticCanvas {
      constructor() {
        this.squares = [];
        this.fakeCode = new FakeCode();
        for (let i = 0; i < 30; i++) {
          this.squares.push(new FloatingSquare());
        }
      }
      update() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        let previousPos;
        this.squares.forEach((square) => {
          const currentPos = square.rect.center();
          square.update();
          if (previousPos instanceof Vector) {
            context.beginPath();
            context.strokeStyle = "rgba(255, 255, 255, 0.05)";
            context.moveTo(previousPos.x, previousPos.y);
            context.lineTo(currentPos.x, currentPos.y);
            context.stroke();
            context.closePath();
          }
          previousPos = square.rect.center();
        });
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

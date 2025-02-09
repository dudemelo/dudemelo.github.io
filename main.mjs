"use strict";

const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = 400;
const context = canvas.getContext("2d");

class ScrambleText {
  /** @param {HTMLElement} el **/
  constructor(el) {
    this.element = el;
    this.original = el.innerText;
    this.scrambled = "";
    el.innerText = "";
  }
  done() {
    return this.scrambled === this.original;
  }
  update() {
    if (this.done()) {
      return;
    }
    this.scrambled += this.original[this.scrambled.length];
    this.element.innerText = this.scrambled;
  }
}

class Scramble {
  constructor() {
    /** @type {ScrambleText[]} **/
    this.queue = [];
    document.querySelectorAll("[data-scrambled]").forEach((el) => {
      this.queue.push(new ScrambleText(el));
    });
  }
  update() {
    if (this.queue.length < 1) {
      return;
    }
    const current = this.queue[0];
    current.update();
    if (current.done()) {
      this.queue.shift();
    }
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
  }
}

class FakeText {
  constructor() {
    this.reset();
  }
  reset() {
    this.size = Math.random() * (20 - 5) + 5;
    this.color = `rgba(0, 255, 100, ${Math.random() * (0.5 - 0.1) + 0.1})`;
    this.velocity = new Vector(
      Math.random() * 0.5 * (-1 * Math.random()),
      Math.random() * 0.5 * (-1 * Math.random()),
    );
    this.position = new Vector(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
    );
  }
  update() {
    if (
      this.position.x + this.size < 0 ||
      this.position.x > canvas.width ||
      this.position.y + this.size < 0 ||
      this.position.y > canvas.height
    ) {
      this.reset();
    }
    this.position.add(this.velocity);
    context.beginPath();
    context.fillStyle = this.color;
    context.fillRect(this.position.x, this.position.y, this.size, this.size);
    context.closePath();
  }
}

class FuturisticCanvas {
  constructor() {
    /** @type {FakeText[]} **/
    this.texts = [];
    for (let i = 0; i < 20; i++) {
      this.texts.push(new FakeText());
    }
  }
  update() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    this.texts.forEach((text) => text.update());
  }
}

const scramble = new Scramble();
const futuristic = new FuturisticCanvas();

function mainLoop() {
  scramble.update();
  futuristic.update();
  requestAnimationFrame(mainLoop);
}

mainLoop();

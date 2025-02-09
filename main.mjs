"use strict";

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

class TShape {
  constructor() {
    /** @type {HTMLCanvasElement} **/
    const canvas = document.getElementById("tshape");
    canvas.width = window.innerWidth;
    canvas.height = 400;
    const context = canvas.getContext("2d");
    context.beginPath();
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.closePath();
  }
  update() {}
}

const scramble = new Scramble();
const tshape = new TShape();

function mainLoop() {
  scramble.update();
  tshape.update();
  requestAnimationFrame(mainLoop);
}

mainLoop();

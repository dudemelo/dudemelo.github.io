"use strict";

class ScrambleText {
  /** @param {HTMLElement} el **/
  constructor(el) {
    this.element = el;
    this.original = el.innerText;
    this.scrambled = "";
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

const scramble = new Scramble();

function mainLoop() {
  scramble.update();
  requestAnimationFrame(mainLoop);
}

mainLoop();

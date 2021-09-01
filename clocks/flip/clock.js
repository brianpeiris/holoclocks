import * as THREE from "three";

import { Digit } from "./digit";

export class Clock extends THREE.Object3D {
  constructor(noiseImageData, brushedImageData) {
    super();
    this.digits = [];
    let i = 6;
    while (i--) {
      const digit = new Digit(noiseImageData, brushedImageData);
      digit.position.x = -1.4 * i + Math.floor(i / 2) * -0.15 + 1.4 * 2.5 + 0.15;
      this.digits.push(digit);
      this.add(digit);
    }
  }
  setDigitBackColor(color) {
    for (const digit of this.digits) {
      digit.setBackColor(color);
    }
  }
  setDigitForeColor(color) {
    for (const digit of this.digits) {
      digit.setForeColor(color);
    }
  }
  setBarColor(color) {
    for (const digit of this.digits) {
      digit.setBarColor(color);
    }
  }
  update() {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const nums = hours + minutes + seconds;
    let i = 6;
    while (i--) {
      this.digits[i].set(nums[i]);
    }
  }
}

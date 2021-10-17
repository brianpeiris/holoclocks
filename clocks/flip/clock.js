import * as THREE from "three";

import { getTimeParts } from "../../common";
import { Digit } from "./digit";

export class Clock extends THREE.Object3D {
  constructor(noiseImageData, brushedImageData) {
    super();
    // this.add(new THREE.AxesHelper());
    this.digits = [];
    let i = 6;
    while (i--) {
      const digit = new Digit(noiseImageData, brushedImageData);
      digit.position.x = -(i % 2) * 1.5 + 0.75;
      digit.position.y = Math.floor(i / 2) * 1.75 - 1.7;
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
  update(timeZone, format) {
    const [hours, minutes, seconds] = getTimeParts(timeZone, format, true);
    const nums = hours + minutes + seconds;
    let i = 6;
    while (i--) {
      this.digits[i].set(nums[i]);
    }
  }
}

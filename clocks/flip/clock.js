import * as THREE from "three";

import { getTimeParts } from "../../common";
import { Digit } from "./digit";

export class Clock extends THREE.Object3D {
  constructor(noiseImageData, brushedImageData, showSeconds) {
    super();
    // this.add(new THREE.AxesHelper());
    this.digits = [];
    for (let i = 0; i < 6; i++) {
      const digit = new Digit(noiseImageData, brushedImageData);
      this.digits.push(digit);
      this.add(digit);
    }
    this.updateLayout(showSeconds);
  }
  updateLayout(showSeconds) {
    this.digits[4].visible = showSeconds;
    this.digits[5].visible = showSeconds;
    const scale = showSeconds ? 1 : 1.2;
    const xOffset = showSeconds ? 0.75 : 0.9;
    const yOffset = showSeconds ? 1.8 : 1.0;
    for (let i = 0; i < 6; i++) {
      const digit = this.digits[i];
      digit.scale.setScalar(scale);
      digit.position.x = (i % 2) * (1.5 * scale) - xOffset;
      digit.position.y = -Math.floor(i / 2) * (1.75 * scale) + yOffset;
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
    for (let i = 0; i < 6; i++) {
      this.digits[i].set(nums[i]);
    }
  }
}

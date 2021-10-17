import * as THREE from "three";
import gsap from "gsap";

import { addDigitTextures, clearCache } from "./digit-texture";

const shape = new THREE.Shape();
const offset = -0.6;
const height = 0.6;
shape.moveTo(0 + offset, 0);
shape.lineTo(0 + offset, height);
shape.quadraticCurveTo(0 + offset, height + 0.2, 0.2 + offset, height + 0.2);
shape.lineTo(1 + offset, height + 0.2);
shape.quadraticCurveTo(1.2 + offset, height + 0.2, 1.2 + offset, height);
shape.lineTo(1.2 + offset, 0);
shape.lineTo(0 + offset, 0);

const digitGeometry = new THREE.ExtrudeGeometry(shape, {
  steps: 2,
  depth: 0.02,
  bevelEnabled: true,
  bevelThickness: 0.02,
  bevelSize: 0.02,
  bevelSegments: 4,
});

export class Digit extends THREE.Object3D {
  constructor(noiseImageData, brushedImageData) {
    super();
    this.noiseImageData = noiseImageData;
    this.brushedImageData = brushedImageData;
    this.backColor = "black";
    this.foreColor = "white";

    function digitMaterial(color) {
      return new THREE.MeshStandardMaterial({ color: "white", side: THREE.DoubleSide, roughness: 1, metalness: 1 });
    }

    this.staticTop = new THREE.Mesh(digitGeometry, digitMaterial("red"));
    this.staticTop.position.z = 0;
    this.staticTop.castShadow = true;
    this.add(this.staticTop);

    this.rotatingNext = new THREE.Mesh(digitGeometry, digitMaterial("blue"));
    this.rotatingNext.castShadow = true;
    this.rotatingNext.position.z = 0.02;
    this.add(this.rotatingNext);

    this.staticBottom = new THREE.Mesh(digitGeometry, digitMaterial("green"));
    this.staticBottom.castShadow = true;
    this.staticBottom.scale.z = -1;
    this.staticBottom.position.z = -0.01;
    this.staticBottom.rotation.x = Math.PI;
    this.add(this.staticBottom);

    this.rotatingPrev = new THREE.Mesh(digitGeometry, digitMaterial("magenta"));
    this.rotatingPrev.position.z = 0.01;
    this.rotatingPrev.castShadow = true;
    this.add(this.rotatingPrev);

    this.bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.5),
      new THREE.MeshStandardMaterial({
        roughness: 0.2,
        metalness: 0.8,
      })
    );
    this.bar.position.z = 0.03;
    this.bar.rotation.z = Math.PI / 2;
    this.add(this.bar);

    this.current = 0;
    this.setCurrent();
  }

  setBackColor(color) {
    this.backColor = color;
    clearCache();
    this.set(this.current, true);
  }

  setBarColor(color) {
    this.bar.material.color.setStyle(color);
  }

  setForeColor(color) {
    this.foreColor = color;
    clearCache();
    this.set(this.current, true);
  }

  setCurrent() {
    addDigitTextures(this.noiseImageData, this.brushedImageData,  this.backColor, this.foreColor, this.staticBottom, this.current, true);
    addDigitTextures(this.noiseImageData, this.brushedImageData, this.backColor, this.foreColor, this.rotatingPrev, this.current, false);
  }

  set(n, force) {
    if (this.current === n && !force) return;
    addDigitTextures(this.noiseImageData, this.brushedImageData, this.backColor, this.foreColor, this.staticTop, n, false);
    addDigitTextures(this.noiseImageData, this.brushedImageData, this.backColor, this.foreColor, this.rotatingNext, n, true);
    this.setCurrent();
    this.current = n;
    gsap.fromTo(this.rotatingNext.rotation, { x: 0 }, { x: Math.PI, duration: 0.85, ease: "quart.in" });
    gsap.fromTo(this.rotatingNext.position, { z: -0.02 }, { z: 0.02, duration: 0.85, ease: "quart.in" });
    gsap.fromTo(this.rotatingPrev.rotation, { x: 0 }, { x: Math.PI, duration: 0.85, ease: "quart.in" });
  }
}

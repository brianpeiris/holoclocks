import * as THREE from "three";
import gsap from "gsap";

const positions = [
  [0, 0.4, 0], // 0
  [0.2, 0.3, 0], // 1
  [0.2, 0.1, 0], // 1
  [0.2, -0.1, 0], // 2
  [0.2, -0.3, 0], // 2
  [0, -0.4, 0], // 3
  [-0.2, -0.1, 0], // 4
  [-0.2, -0.3, 0], // 4
  [-0.2, 0.1, 0], // 5
  [-0.2, 0.3, 0], // 5
  [0, 0, 0], // 6
];
const numbers = {
  "0": [1,  1, 1,  1, 1,  1,  1, 1,  1, 1,  0],
  "1": [0,  1, 1,  1, 1,  0,  0, 0,  0, 0,  0],
  "2": [1,  1, 1,  0, 0,  1,  1, 1,  0, 0,  1],
  "3": [1,  1, 1,  1, 1,  1,  0, 0,  0, 0,  1],
  "4": [0,  1, 1,  1, 1,  0,  0, 0,  1, 1,  1],
  "5": [1,  0, 0,  1, 1,  1,  0, 0,  1, 1,  1],
  "6": [1,  0, 0,  1, 1,  1,  1, 1,  1, 1,  1],
  "7": [1,  1, 1,  1, 1,  0,  0, 0,  0, 0,  0],
  "8": [1,  1, 1,  1, 1,  1,  1, 1,  1, 1,  1],
  "9": [1,  1, 1,  1, 1,  1,  0, 0,  1, 1,  1],
}
export class Digit extends THREE.Mesh {
  constructor(front, back) {
    super();
    this.front = front;
    this.back = back;
    this.number = null;
    this.dots = [
      new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6)),
      new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6)),
      new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6)),
      new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6)),
      new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6)),
      new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6)),
      new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6)),
      new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6)),
      new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6)),
      new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6)),
      new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6)),
    ];
    const pivot = new THREE.Group();
    this.add(pivot);
    for (let i = 0; i < this.dots.length; i++) {
      this.dots[i].material.wireframe = true;
      this.dots[i].material.visible = true;
      this.dots[i].position.set(...positions[i]);
      pivot.add(this.dots[i]);
    }
  }
  set(n) {
    if (this.number === n) return;
    this.number = n;
    for (let i = 0; i < this.dots.length; i++) {
      gsap.to(this.dots[i].position, {z: numbers[n][i] === 1 ? this.front : this.back, duration: 0.6});
    }
  }
}

import * as THREE from "three";

function rand(a, b) {
  return Math.random() * (b - a) + a;
}

function clamp(v, a, b) {
  return Math.min(Math.max(v, a), b);
}

function randomUnitVector(vec) {
  const u = (Math.random() - 0.5) * 2;
  const t = Math.random() * Math.PI * 2;
  const f = Math.sqrt(1 - u ** 2);
  vec.x = f * Math.cos(t);
  vec.y = f * Math.sin(t);
  vec.z = u;
}

const forward = new THREE.Vector3(0, 0, 1);

export class Spline3 extends THREE.Object3D {
  constructor(svgs, colorOne, colorTwo) {
    super();

    this.val = 0;
    this.curvePoints = [];
    this.tangents = [];
    this.scale.setScalar(1.5);

    const n = 128;

    for (const svg of svgs) {
      const points = svg.paths[0].toShapes()[0].getPoints();

      const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p.x, -p.y, 0).multiplyScalar(0.02)));
      this.curvePoints.push(curve.getPoints(n));

      this.tangents.push(curve.computeFrenetFrames(n).tangents);
    }

    const pointMult = 3;
    const particleGeo = new THREE.SphereGeometry(0.03, 6, 6);
    this.particlesMesh = new THREE.InstancedMesh(
      particleGeo,
      new THREE.MeshStandardMaterial({ depthTest: false, roughness: 0.3, metalness: 0.4, color: "white" }),
      n * pointMult
    );
    this.particlesMesh.castShadow = true;
    this.add(this.particlesMesh);

    this.particles = [];
    const color = new THREE.Color("white");
    for (let i = 0; i < n * pointMult; i++) {
      const particle = new THREE.Object3D(0.1);
      particle.matrixAutoUpdate = false;
      particle.userData.velocity = 0.4;
      const currentIndex = Math.floor(i / pointMult);
      particle.position.copy(this.curvePoints[this.val][currentIndex]);
      particle.quaternion.setFromUnitVectors(forward, this.tangents[this.val][currentIndex]);
      particle.userData.currentIndex = currentIndex;
      particle.updateMatrix();
      this.particlesMesh.setMatrixAt(i, particle.matrix);
      color.setStyle(i % 2 === 0 ? colorTwo : colorOne);
      this.particlesMesh.setColorAt(i, color);
      this.particles.push(particle);
    }
    this.particlesMesh.instanceMatrix.needsUpdate = true;
  }
  setColor(num, hexColorStr) {
    const color = new THREE.Color(hexColorStr);
    for (let i = 0; i < this.particlesMesh.count; i++) {
      if (i % 2 === num) {
        this.particlesMesh.setColorAt(i, color);
      }
    }
    this.particlesMesh.instanceColor.needsUpdate = true;
  }
  set(val) {
    this.val = Number(val);
  }
  update = (() => {
    const quaternion = new THREE.Quaternion();
    const vector = new THREE.Vector3();
    return (delta) => {
      for (let i = 0; i < this.particles.length; i++) {
        const particle = this.particles[i];
        particle.userData.velocity += rand(-1, 1) * 0.02;
        particle.userData.velocity = clamp(particle.userData.velocity, 0.1, 0.4);
        particle.translateZ(particle.userData.velocity * 0.06);

        const currDist = this.curvePoints[this.val][particle.userData.currentIndex].distanceToSquared(particle.position);
        const nextIndex = (particle.userData.currentIndex + 1) % this.curvePoints[this.val].length;
        const nextDist = this.curvePoints[this.val][nextIndex].distanceToSquared(particle.position);
        const nextTangent = this.tangents[this.val][nextIndex];
        const nextPoint = this.curvePoints[this.val][nextIndex];

        vector.subVectors(nextPoint, particle.position);
        vector.normalize();
        quaternion.setFromUnitVectors(forward, vector);
        particle.quaternion.slerp(quaternion, 0.5);

        quaternion.setFromUnitVectors(forward, nextTangent);
        particle.quaternion.slerp(quaternion, 0.15);

        randomUnitVector(vector);
        quaternion.setFromUnitVectors(forward, vector);
        particle.quaternion.slerp(quaternion, 0.05);

        particle.updateMatrix();

        this.particlesMesh.setMatrixAt(i, particle.matrix);

        if (nextDist < currDist) {
          particle.userData.currentIndex = (particle.userData.currentIndex + 1) % this.curvePoints[this.val].length;
        }
      }
      this.particlesMesh.instanceMatrix.needsUpdate = true;
    };
  })();
}

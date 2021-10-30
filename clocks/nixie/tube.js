import * as THREE from "three";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper";

const unlit = new THREE.MeshStandardMaterial({
  color: "lightgrey",
  roughness: 1,
  metalness: 0,
  emissiveIntensity: 10,
  envMapIntensity: 0,
  transparent: true,
  opacity: 0.2,
});

const lit = new THREE.MeshStandardMaterial({
  color: "black",
  emissive: "red",
  roughness: 1,
  metalness: 0,
  emissiveIntensity: 1,
  envMapIntensity: 0,
});

export class Tube extends THREE.Object3D {
  constructor(model) {
    super();

    this.val = null;
    this.digits = [];
    this.digitsLit = [];

    const _model = model.clone();
    window.model = _model;
    const glass = _model.getObjectByName("tube");
    glass.material.roughness = 0.02;
    glass.material.metalness = 0.5;
    glass.material.thickness = 0.08;
    glass.material.ior = 3;

    _model.scale.setScalar(0.35);

    _model.traverse((obj) => {
      if (obj.material) {
        obj.castShadow = true;
        if (obj.name.startsWith("digit_")) {
          obj.material.envMapIntensity  = 0;
          const val = parseInt(obj.name.split("_")[1]);
          if (obj.name.endsWith("lit")) {
            obj.visible = false;
            obj.material = lit;
            this.digitsLit[val] = obj;
          } else {
            obj.material = unlit;
            this.digits[val] = obj;
          }
        }
      }
    });

    this.add(_model);

    this.light = new THREE.RectAreaLight('white', 0.5, 0.4, 0.5);
    this.light.decay = 2;
    this.light.power = 2;
    this.light.position.y = 0.1;
    this.add(this.light);
  }

  setColor(color) {
    this.color = color;
    this.light.color.setStyle(color);
    lit.emissive.setStyle(this.color);
  }

  set = (() => {
    const vec = new THREE.Vector3();
    return (val) => {
      val = parseInt(val);
      if (this.val === val) return
      this.val = val;
      for (let i = 0; i < 10; i++) {
        const digitLit = this.digitsLit[i];
        if (i === this.val) {
          digitLit.visible = true;
          digitLit.getWorldPosition(vec);
          this.light.position.z = vec.z;
        } else {
          digitLit.visible = false;
        }
      }
    };
  })();
}

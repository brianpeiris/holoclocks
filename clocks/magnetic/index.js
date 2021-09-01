import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MarchingCubes } from "three/examples/jsm/objects/MarchingCubes";
import { Renderer, Camera } from "holoplay";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module.js";

import { Digit } from "./digit.js";

const queryParams = new URLSearchParams(location.search);

(async () => {
  const stats = new Stats();
  document.body.append(stats.domElement);

  const gui = new dat.GUI({ hideable: false });
  gui.useLocalStorage = true;
  document.body.append(gui.domElement);
  gui.domElement.addEventListener('click', e => e.stopPropagation());
  const config = {
    render2d: false,
    backColor: "#000000",
    shadows: true,
    strength: 0.37,
    subtract: 215
  };
  function setBackColor(val) {
    back.material.color.setStyle(val)
  }
  gui.remember(config);
  gui.add(config, "render2d").name("render 2d").setValue(false).onChange((val) => renderer.render2d = val);
  gui.addColor(config, "backColor").name("background color").onChange(setBackColor);
  gui.add(config, "shadows").onChange((val) => directionalLight.castShadow = val);
  gui.add(config, "strength");
  gui.add(config, "subtract");

  const textureLoader = new THREE.TextureLoader();

  const scene = new THREE.Scene();

  scene.environment = textureLoader.load("hotel_room.jpg");
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;

  const directionalLight = new THREE.DirectionalLight("white", 0.5);
  directionalLight.castShadow = config.shadows;
  directionalLight.shadow.mapSize.setScalar(2048);
  directionalLight.position.set(1, 0.5, 5);
  scene.add(directionalLight);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 2), new THREE.MeshStandardMaterial({ wireframe: true }));
  scene.add(frame);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(3, 4, 0.1),
    new THREE.MeshStandardMaterial({ color: config.backColor, roughness: 0.1, metalness: 0, vertexColors: true, envMapIntensity: 0.1 })
  );
  back.receiveShadow = true;
  back.position.z = -0.56;
  // scene.add(back);

  const backPos = -1.0;
  const frontPos = -0.1;

  const digits = [
    new Digit(frontPos, backPos),
    new Digit(frontPos, backPos),
    new Digit(frontPos, backPos),
    new Digit(frontPos, backPos),
    new Digit(frontPos, backPos),
    new Digit(frontPos, backPos),
  ];
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    digit.scale.setScalar(0.8);
    digit.position.x = i % 2 === 0 ? -0.4 : 0.4;
    digit.position.y = Math.ceil(-i / 2) * 1.1 + 1.1;
    scene.add(digit);
  }

  const renderer = new Renderer({ disableFullscreenUi: queryParams.has("2d") });
  renderer.render2d = queryParams.has("2d") || config.render2d;
  renderer.renderQuilt = queryParams.has("quilt");
  renderer.webglRenderer.physicallyCorrectLights = true;
  renderer.webglRenderer.shadowMap.enabled = true;
  document.body.append(renderer.domElement);

  const camera = new Camera();
  camera.position.z = 20;
  if (queryParams.has("2d")) {
    new OrbitControls(camera, renderer.domElement);
  }

  const marchingCubes = new MarchingCubes(60, new THREE.MeshStandardMaterial({roughness: 0.1, metalness: 0, vertexColors: true, envMapIntensity: 0.1}), false, true);
  marchingCubes.scale.setScalar(2.2);
  marchingCubes.position.z = 1.2;
  //window.marchingCubes = marchingCubes;
  scene.add(marchingCubes);
  const backColor = new THREE.Color("black");
  const foreColor = new THREE.Color("white");
  const color = new THREE.Color();
  const worldPos = new THREE.Vector3();

  renderer.webglRenderer.setAnimationLoop(() => {
    stats.update();
    const date = new Date();

    const hours = String(date.getHours()).padStart(2, "0");
    digits[0].set(hours[0]);
    digits[1].set(hours[1]);

    const minutes = String(date.getMinutes()).padStart(2, "0");
    digits[2].set(minutes[0]);
    digits[3].set(minutes[1]);

    const seconds = String(date.getSeconds()).padStart(2, "0");
    digits[4].set(seconds[0]);
    digits[5].set(seconds[1]);

    marchingCubes.reset();
    for (const digit of digits) {
      const dots = digit.dots;
      for (let i = 0; i < dots.length; i++) {
        dots[i].updateWorldMatrix(true, true);
        dots[i].getWorldPosition(worldPos);
        worldPos.multiplyScalar(0.28);
        worldPos.addScalar(+0.5);
        color.lerpColors(backColor, foreColor, THREE.MathUtils.mapLinear(worldPos.z, backPos, frontPos, -0.3, 1));
        marchingCubes.addBall(
          worldPos.x,
          worldPos.y,
          worldPos.z - 0.25,
          config.strength, config.subtract, color);
      }
    }
    marchingCubes.addPlaneX(config.strength, config.subtract);
    marchingCubes.addPlaneY(config.strength, config.subtract);
    marchingCubes.addPlaneZ(config.strength, config.subtract);


    renderer.render(scene, camera);
  });
})();

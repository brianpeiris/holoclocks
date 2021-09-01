import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { Renderer, Camera } from "holoplay";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module.js";

import { Spline3 } from "./spline3.js";

const queryParams = new URLSearchParams(location.search);

(async () => {
  const stats = new Stats();
  stats.domElement.style.left = null;
  stats.domElement.style.right = 0;
  document.body.append(stats.domElement);

  const gui = new dat.GUI({ hideable: false });
  gui.useLocalStorage = true;
  document.body.append(gui.domElement);
  gui.domElement.addEventListener('click', e => e.stopPropagation());
  const config = {
    render2d: false,
    backColor: "#ffffff",
    colorOne: "#000000",
    colorTwo: "#666666",
    shadows: true,
  };
  gui.remember(config);
  function setDigitColors(num, color) {
    for (const digit of digits) {
      digit.setColor(num, color);
    }
  }
  gui.add(config, "render2d").name("render 2d").setValue(false).onChange((val) => renderer.render2d = val);
  gui.addColor(config, "backColor").name("background color").onChange((val) => back.material.color.setStyle(val));
  gui.addColor(config, "colorOne").name("color one").onChange((val) => setDigitColors(1, val));
  gui.addColor(config, "colorTwo").name("color two").onChange((val) => setDigitColors(0, val));
  gui.add(config, "shadows").onChange((val) => directionalLight.castShadow = val);

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
  //scene.add(frame);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(3, 4, 0.1),
    new THREE.MeshStandardMaterial({ color: config.backColor })
  );
  back.receiveShadow = true;
  back.position.z = -0.56;
  scene.add(back);

  const backPos = -1.0;
  const frontPos = -0.1;

  const svgs = [
    await new Promise(resolve => new SVGLoader().load("zero.svg", resolve)),
    await new Promise(resolve => new SVGLoader().load("one.svg", resolve)),
    await new Promise(resolve => new SVGLoader().load("two.svg", resolve)),
    await new Promise(resolve => new SVGLoader().load("three.svg", resolve)),
    await new Promise(resolve => new SVGLoader().load("four.svg", resolve)),
    await new Promise(resolve => new SVGLoader().load("five.svg", resolve)),
    await new Promise(resolve => new SVGLoader().load("six.svg", resolve)),
    await new Promise(resolve => new SVGLoader().load("seven.svg", resolve)),
    await new Promise(resolve => new SVGLoader().load("eight.svg", resolve)),
    await new Promise(resolve => new SVGLoader().load("nine.svg", resolve)),
  ];

  const digits = [
    new Spline3(svgs, config.colorOne, config.colorTwo),
    new Spline3(svgs, config.colorOne, config.colorTwo),
    new Spline3(svgs, config.colorOne, config.colorTwo),
    new Spline3(svgs, config.colorOne, config.colorTwo),
    new Spline3(svgs, config.colorOne, config.colorTwo),
    new Spline3(svgs, config.colorOne, config.colorTwo),
  ];
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    digit.position.x = (i % 2 === 0 ? -0.5 : 0.5) - 0.25;
    digit.position.y = (Math.ceil(-i / 2) * 1.1 + 1.1) + 0.5;
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

  const clock = new THREE.Clock();
  renderer.webglRenderer.setAnimationLoop((time) => {
    const delta = clock.getDelta();
    stats.update();

    if (time > 3000) {
      for (let i = 0; i < digits.length; i++) {
        digits[i].update();
      }
    }

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

    renderer.render(scene, camera);
  });
})();

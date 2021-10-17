import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { Renderer, Camera } from "holoplay";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module";

import { timeZoneOptions, getTimeParts, randomColor } from "../../common";
import { Spline3 } from "./spline3";

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
    timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    format: "h23",
    backColor: "#ffffff",
    colorOne: "#000000",
    colorTwo: "#666666",
    randomize: () => {
      config.backColor = randomColor();
      config.colorOne = randomColor();
      config.colorTwo = randomColor();
      updateColors();
      gui.updateDisplay();
    },
    shadows: true,
  };
  gui.remember(config);
  function setDigitColors(num, color) {
    for (const digit of digits) {
      digit.setColor(num, color);
    }
  }
  gui.add(config, "timeZone", timeZoneOptions).name("time zone");
  gui.add(config, "format", {"24 hour": "h23", "12 hour": "h12"});
  gui.addColor(config, "backColor").name("background color").onChange(updateColors);
  gui.addColor(config, "colorOne").name("color one").onChange(updateColors);
  gui.addColor(config, "colorTwo").name("color two").onChange(updateColors);
  gui.add(config, "randomize");
  gui.add(config, "shadows").onChange((val) => directionalLight.castShadow = val);

  function updateColors() {
    back.material.color.setStyle(config.backColor);
    setDigitColors(1, config.colorOne);
    setDigitColors(0, config.colorTwo);
  }

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
  back.scale.setScalar(2);
  back.receiveShadow = true;
  back.position.z = -0.8;
  scene.add(back);

  // scene.add(new THREE.AxesHelper());

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
  const ySpacing = 1.4;
  const yOffset = 0.65;
  const xSpacing = 0.6;
  const xOffset = 0.45;
  for (let i = 0; i < digits.length; i++) {
    const digit = digits[i];
    digit.position.x = (i % 2 === 0 ? -xSpacing : xSpacing) - xOffset;
    digit.position.y = (Math.ceil(-i / 2) * ySpacing + ySpacing) + yOffset;
    digit.position.z = 0.1;
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

    const [hours, minutes, seconds] = getTimeParts(config.timeZone, config.format, true);

    digits[0].set(hours[0]);
    digits[1].set(hours[1]);

    digits[2].set(minutes[0]);
    digits[3].set(minutes[1]);

    digits[4].set(seconds[0]);
    digits[5].set(seconds[1]);

    renderer.render(scene, camera);
  });
})();

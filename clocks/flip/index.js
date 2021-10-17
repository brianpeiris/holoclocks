import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Renderer, Camera } from "holoplay";
import * as dat from "dat.gui";

import { timeZoneOptions, randomColor } from "../../common";
import { Clock } from "./clock";

const queryParams = new URLSearchParams(location.search);

(async () => {
  const gui = new dat.GUI({ hideable: false });
  gui.useLocalStorage = true;
  document.body.append(gui.domElement);
  gui.domElement.addEventListener('click', e => e.stopPropagation());
  const config = {
    timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    format: "h23",
    backColor: "#ffffff",
    digitBackColor: "#000000",
    digitForeColor: "#ffffff",
    barColor: "#ffffff",
    randomize: () => {
      config.backColor = randomColor();
      config.digitBackColor = randomColor();
      config.digitForeColor = randomColor();
      config.barColor = randomColor();
      updateColors();
      gui.updateDisplay();
    },
    shadows: true,
  };
  gui.remember(config);
  gui.add(config, "timeZone", timeZoneOptions).name("time zone");
  gui.add(config, "format", { "24 hour": "h23", "12 hour": "h12" });
  gui.addColor(config, "backColor").name("background color").onChange(updateColors);
  gui.addColor(config, "digitBackColor").name("digit back color").onChange(updateColors);
  gui.addColor(config, "digitForeColor").name("digit color").onChange(updateColors);
  gui.addColor(config, "barColor").name("bar color").onChange(updateColors);
  gui.add(config, "randomize");
  gui.add(config, "shadows").onChange((val) => directionalLight.castShadow = val);

  function updateColors() {
    back.material.color.setStyle(config.backColor);
    clock.setDigitBackColor(config.digitBackColor);
    clock.setDigitForeColor(config.digitForeColor);
    clock.setBarColor(config.barColor);
  }

  const textureLoader = new THREE.TextureLoader();

  const noiseImageData = await createImageBitmap(await fetch("noise-normal.png").then((r) => r.blob()));
  const brushedImageData = await createImageBitmap(await fetch("brushed-normal.png").then((r) => r.blob()));

  await document.fonts.load("16px 'AzeretMono'");

  const scene = new THREE.Scene();

  scene.environment = textureLoader.load("hotel_room.jpg");
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;

  const directionalLight = new THREE.DirectionalLight("white", 0.5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.setScalar(2048);
  directionalLight.position.set(1, 0.5, 5);
  scene.add(directionalLight);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 2), new THREE.MeshStandardMaterial({ wireframe: true }));
  //scene.add(frame);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(3, 4, 0.1),
    new THREE.MeshStandardMaterial({ color: config.backColor, roughness: 1, metalness: 0 })
  );
  back.scale.setScalar(2);
  back.receiveShadow = true;
  back.position.z = -1;
  scene.add(back);

  const clock = new Clock(noiseImageData, brushedImageData);
  clock.scale.setScalar(0.8);
  clock.setDigitBackColor(config.digitBackColor);
  clock.setDigitForeColor(config.digitForeColor);
  clock.setBarColor(config.barColor);
  scene.add(clock);

  const renderer = new Renderer({disableFullscreenUi: queryParams.has("2d") });
  renderer.render2d = queryParams.has("2d");
  renderer.renderQuilt = queryParams.has("quilt");
  renderer.domElement.className = "gl";
  renderer.webglRenderer.physicallyCorrectLights = true;
  renderer.webglRenderer.shadowMap.enabled = true;
  document.body.append(renderer.domElement);

  const camera = new Camera();
  camera.position.z = 20;
  if (queryParams.has("2d")) {
    new OrbitControls(camera, renderer.domElement);
  }

  renderer.webglRenderer.setAnimationLoop(() => {
    clock.update(config.timeZone, config.format);
    renderer.render(scene, camera);
  });
})();

import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Renderer, Camera } from "holoplay";
import * as dat from "dat.gui";

import { Clock } from "./clock";

const queryParams = new URLSearchParams(location.search);

(async () => {
  const gui = new dat.GUI({ hideable: false });
  gui.useLocalStorage = true;
  document.body.append(gui.domElement);
  gui.domElement.addEventListener('click', e => e.stopPropagation());
  const config = {
    render2d: false,
    backColor: "#ffffff",
    digitBackColor: "#000000",
    digitForeColor: "#ffffff",
    barColor: "#ffffff",
    shadows: true,
  };
  gui.remember(config);
  gui.add(config, "render2d").name("render 2d").setValue(false).onChange((val) => renderer.render2d = val);
  gui.addColor(config, "backColor").name("background color").onChange((val) => back.material.color.setStyle(val));
  gui.addColor(config, "digitBackColor").name("digit back color").onChange((val) => clock.setDigitBackColor(val));
  gui.addColor(config, "digitForeColor").name("digit color").onChange((val) => clock.setDigitForeColor(val));
  gui.addColor(config, "barColor").name("bar color").onChange((val) => clock.setBarColor(val));
  gui.add(config, "shadows").onChange((val) => directionalLight.castShadow = val);

  const textureLoader = new THREE.TextureLoader();

  const noiseImageData = await createImageBitmap(await fetch("noise-normal.png").then((r) => r.blob()));
  const brushedImageData = await createImageBitmap(await fetch("brushed-normal.png").then((r) => r.blob()));

  const scene = new THREE.Scene();

  // scene.background = new THREE.Color("white");

  // scene.background = textureLoader.load("hotel_room.jpg");
  // scene.background.mapping = THREE.EquirectangularReflectionMapping;
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
    new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1, metalness: 0 })
  );
  back.receiveShadow = true;
  if (!queryParams.has("forward")) {
    back.position.z = -1;
  }
  scene.add(back);

  const clock = new Clock(noiseImageData, brushedImageData);
  clock.scale.setScalar(0.3);
  if (queryParams.has("forward")) {
    clock.position.z = 0.7;
  } 
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
    clock.update();
    renderer.render(scene, camera);
  });
})();

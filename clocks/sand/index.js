import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Renderer, Camera } from "holoplay";
import * as dat from "dat.gui";
import rStats from "rstatsjs/src/rStats.js";

import { Sand } from "./sand";

const queryParams = new URLSearchParams(location.search);

(async () => {
  const stats = new rStats();

  const gui = new dat.GUI({ hideable: false });
  gui.useLocalStorage = true;
  document.body.append(gui.domElement);
  gui.domElement.addEventListener('click', e => e.stopPropagation());
  const config = {
    render2d: false,
    backColor: "#ffffff",
    textColor: "#000000",
    shadows: true,
  };
  gui.remember(config);
  gui.add(config, "render2d").name("render 2d").setValue(false).onChange((val) => renderer.render2d = val);
  gui.addColor(config, "backColor").name("background color").onChange((val) => back.material.color.setStyle(val));
  gui.addColor(config, "textColor").name("text color").onChange((val) => timeMesh.material.color.setStyle(val));
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
  scene.add(frame);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(3, 4, 0.1),
    new THREE.MeshStandardMaterial({ color: config.backColor, roughness: 1, metalness: 0 })
  );
  back.receiveShadow = true;
  back.position.z = -0.5;
  scene.add(back);

  const sand = new Sand();
  scene.add(sand);

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

  let lastTimeString = '';
  function format(n) {
    return String(n).padStart(2, '0');
  }

  const calls = [];
  const origRender = renderer.webglRenderer.render;
  renderer.webglRenderer.render = function (scene, camera) {
    origRender.call(renderer.webglRenderer, scene, camera);
    calls.push(renderer.webglRenderer.info.render.calls);
  }

  renderer.webglRenderer.setAnimationLoop((time) => {
    stats('fps').frame();
    const date = new Date();
    const timeString = `${format(date.getHours())}:${format(date.getMinutes())}:${format(date.getSeconds())}`;
    if (timeString !== lastTimeString) {
      lastTimeString = timeString;
    }
    sand.update(time);

    calls.length = 0;
    renderer.render(scene, camera);

    for (let i = 0; i < calls.length; i++) {
      if (calls[i] > 1) {
        stats('calls ' + i).set(calls[i]);
      }
    }
    stats().update();
  });
})();

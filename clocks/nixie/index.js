import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Renderer, Camera } from "holoplay";
import * as dat from "dat.gui";
import rStats from "rstatsjs/src/rStats.js";

import { Tube } from "./tube";

const queryParams = new URLSearchParams(location.search);

(async () => {
  const stats = new rStats();

  const gui = new dat.GUI({ hideable: false });
  gui.useLocalStorage = true;
  document.body.append(gui.domElement);
  gui.domElement.addEventListener('click', e => e.stopPropagation());
  const config = {
    render2d: false,
    backColor: "#222222",
    nixieColor: "#ff0000",
    shadows: true,
  };
  gui.remember(config);
  function changeTubeColors(val) {
    for (const tube of tubes) {
      tube.setColor(val);
    }
  }
  gui.add(config, "render2d").name("render 2d").setValue(false).onChange((val) => renderer.render2d = val);
  gui.addColor(config, "backColor").name("background color").onChange((val) => back.material.color.setStyle(val));
  gui.addColor(config, "nixieColor").name("nixie color").onChange(changeTubeColors);
  gui.add(config, "shadows").onChange((val) => directionalLight.castShadow = val);

  const textureLoader = new THREE.TextureLoader();

  const scene = new THREE.Scene();

  scene.environment = textureLoader.load("hotel_room.jpg");
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;

  const directionalLight = new THREE.DirectionalLight("white", 0.5);
  directionalLight.castShadow = config.shadows;
  directionalLight.shadow.mapSize.setScalar(1024);
  directionalLight.position.set(1, 1.5, 5);
  scene.add(directionalLight);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 2), new THREE.MeshStandardMaterial({ wireframe: true }));
  // scene.add(frame);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(3, 4, 0.1),
    new THREE.MeshStandardMaterial({ color: config.backColor, roughness: 1, metalness: 0 })
  );
  back.receiveShadow = true;
  back.position.z = -0.5;
  scene.add(back);

  const model = await new Promise((resolve) => new GLTFLoader().load("nixie.glb", (gltf) => resolve(gltf.scene)));

  const tubes = [];
  window.tubes = tubes;
  for (let i = 0; i < 6; i++) {
    const tube = new Tube(model);
    tube.position.x = (i % 2) * 0.8 - 0.4;
    tube.position.y = Math.floor(i / 2) *  1.2 - 1.1;
    if (i % 2 === 0) {
      const holder = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.2, 1),
        new THREE.MeshStandardMaterial({
          color: 'black',
          roughness: 0.8,
          metalness: 0.8,
        }),
      );
      holder.receiveShadow = true;
      holder.castShadow = true;
      holder.position.y = Math.floor(i / 2) * 1.2 - 1.6;
      scene.add(holder);
    }
    tubes.push(tube);
    scene.add(tube);
  }
  changeTubeColors(config.nixieColor);

  const renderer = new Renderer({ disableFullscreenUi: queryParams.has("2d") });
  window.renderer = renderer;
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

  const calls = [];

  const origRender = renderer.webglRenderer.render;
  renderer.webglRenderer.render = function (scene, camera) {
    origRender.call(renderer.webglRenderer, scene, camera);
    calls.push(renderer.webglRenderer.info.render.calls);
  }

  renderer.webglRenderer.setAnimationLoop(() => {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, "0");
    tubes[4].set(hours[0]);
    tubes[5].set(hours[1]);
    const minutes = String(date.getMinutes()).padStart(2, "0");
    tubes[2].set(minutes[0]);
    tubes[3].set(minutes[1]);
    const seconds = String(date.getSeconds()).padStart(2, "0");
    tubes[0].set(seconds[0]);
    tubes[1].set(seconds[1]);

    if (queryParams.has('stats')) {
      stats('fps').frame();
      calls.length = 0;
    }

    renderer.render(scene, camera);

    if (queryParams.has('stats')) {
      for (let i = 0; i < calls.length; i++) {
        if (calls[i] > 1) {
          stats('calls ' + i).set(calls[i]);
        }
      }
      stats().update();
    }
  });
})();

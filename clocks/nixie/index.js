import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Renderer, Camera } from "holoplay";
import * as dat from "dat.gui";
import rStats from "rstatsjs/src/rStats.js";

import { timeZoneOptions, getTimeParts, randomColor, setupPermalink, loadFromURLParams } from "../../common";
import { Tube } from "./tube";

const queryParams = new URLSearchParams(location.search);

(async () => {
  const stats = new rStats();

  const gui = new dat.GUI({ hideable: false });
  gui.useLocalStorage = true;
  document.body.append(gui.domElement);
  gui.domElement.addEventListener('click', e => e.stopPropagation());
  const config = {
    timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    format: "h23",
    showSeconds: true,
    backColor: "#222222",
    nixieColor: "#ff0000",
    baseColor: "#000000",
    randomize: () => {
      config.backColor = randomColor();
      config.nixieColor = randomColor(1, 0.5);
      config.baseColor = randomColor();
      updateColors();
      gui.updateDisplay();
    },
    shadows: true,
    permalink: () => {}
  };
  gui.remember(config);
  gui.add(config, "timeZone", timeZoneOptions).name("time zone");
  gui.add(config, "format", { "24 hour": "h23", "12 hour": "h12" });
  gui.add(config, "showSeconds").name("show seconds").onChange(updateLayout);
  gui.addColor(config, "backColor").name("background color").onChange(updateColors);
  gui.addColor(config, "nixieColor").name("nixie color").onChange(updateColors);
  gui.addColor(config, "baseColor").name("base color").onChange(updateColors);
  gui.add(config, "randomize");
  gui.add(config, "shadows").onChange((val) => directionalLight.castShadow = val);
  setupPermalink(config, gui.add(config, "permalink"));
  loadFromURLParams(gui, config);

  function updateColors() {
    back.material.color.setStyle(config.backColor);
    holderMat.color.setStyle(config.baseColor);
    for (const tube of tubes) {
      tube.setColor(config.nixieColor);
    }
  }

  function updateLayout() {
    tubes[0].visible = config.showSeconds;
    tubes[1].visible = config.showSeconds;
    holders[0].visible = config.showSeconds;
    const scale = config.showSeconds ? 1 : 1.3;
    const yOffset =  config.showSeconds ? 1.93 : 3.7;
    const ySpacing =  config.showSeconds ? 1.35 : 2;
    const xOffset =  config.showSeconds ? 0.55 : 0.5;
    const xSpacing =  config.showSeconds ? 1.1 : 1.0;
    for (let i = 0; i < 6; i++) {
      const tube = tubes[i];
      tube.scale.setScalar(1.7);
      tube.position.x = (i % 2) * xSpacing - xOffset;
      tube.position.y = 0.55;
      tube.position.z = 0.2;
      if (i % 2 === 0) {
        const holder = holders[Math.floor(i / 2)];
        holder.scale.setScalar(scale);
        holder.position.y = Math.floor(i / 2) * ySpacing - yOffset;
      }
    }
  }

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
  back.scale.setScalar(2);
  back.receiveShadow = true;
  back.position.z = -0.5;
  scene.add(back);

  // scene.add(new THREE.AxesHelper());

  const model = await new Promise((resolve) => new GLTFLoader().load("nixie.glb", (gltf) => resolve(gltf.scene)));
  
  const holderMat = new THREE.MeshStandardMaterial({
    color: 'black',
    roughness: 0.8,
    metalness: 0.3,
  });

  const tubes = [];
  const holders = [];
  for (let i = 0; i < 6; i++) {
    const tube = new Tube(model);
    if (i % 2 === 0) {
      const holder = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.1, 1),
        holderMat
      );
      holder.receiveShadow = true;
      holder.castShadow = true;
      holders.push(holder);
      scene.add(holder);
    }
    const holder = holders[Math.floor(i / 2)];
    tubes.push(tube);
    holder.add(tube);
  }
  updateColors();
  updateLayout();

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
    const [hours, minutes, seconds] = getTimeParts(config.timeZone, config.format, true);
    tubes[4].set(hours[0]);
    tubes[5].set(hours[1]);
    tubes[2].set(minutes[0]);
    tubes[3].set(minutes[1]);
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

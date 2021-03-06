import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Renderer, Camera } from "holoplay";
import * as dat from "dat.gui";

import { timeZoneOptions, getTimeParts, randomColor, setupPermalink, loadFromURLParams } from "../../common";

const queryParams = new URLSearchParams(location.search);

(async () => {
  const gui = new dat.GUI({ hideable: false });
  window.gui = gui;
  gui.useLocalStorage = true;
  document.body.append(gui.domElement);
  gui.domElement.addEventListener("click", (e) => e.stopPropagation());
  const config = {
    timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    format: "h23",
    showSeconds: true,
    horizontal: true,
    backColor: "#ffffff",
    textColor: "#000000",
    randomize: () => {
      config.backColor = randomColor();
      config.textColor = randomColor();
      updateColors();
      gui.updateDisplay();
    },
    shadows: true,
    permalink: () => {}
  };
  if (location.search === '') {
    gui.remember(config);
  }
  gui.add(config, "timeZone", timeZoneOptions).name("time zone");
  gui.add(config, "format", { "24 hour": "h23", "12 hour": "h12" });
  gui.add(config, "showSeconds").name("show seconds").onChange(layoutMeshes);
  gui.add(config, "horizontal").onChange(layoutMeshes);
  gui.addColor(config, "backColor").name("background color").onChange(updateColors);
  gui.addColor(config, "textColor").name("text color").onChange(updateColors);
  gui.add(config, "randomize");
  gui.add(config, "shadows").onChange((val) => (directionalLight.castShadow = val));
  setupPermalink(config, gui.add(config, "permalink"));
  loadFromURLParams(gui, config);

  function updateColors() {
    back.material.color.setStyle(config.backColor);
    timeMat.color.setStyle(config.textColor);
  }

  const textureLoader = new THREE.TextureLoader();

  const scene = new THREE.Scene();

  scene.environment = textureLoader.load("hotel_room.jpg");
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;

  scene.add(new THREE.AmbientLight(0xaaaaaa));
  const directionalLight = new THREE.DirectionalLight("white", 0.5);
  directionalLight.castShadow = config.shadows;
  directionalLight.shadow.mapSize.setScalar(2048);
  directionalLight.position.set(1, 0.5, 5);
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

  const font = await new Promise((resolve) => {
    new THREE.FontLoader().load("font.json", resolve);
  });

  const geoCache = new Map();

  const timeMat = new THREE.MeshStandardMaterial({ color: config.textColor, wireframe: false });
  function makeComponentMesh() {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), timeMat);
    mesh.castShadow = true;
    mesh.scale.setScalar(0.42);
    return mesh;
  }
  function makeSeparatorMesh() {
    const mesh = new THREE.Mesh(getGeo(":"), timeMat);
    mesh.castShadow = true;
    mesh.scale.setScalar(0.42);
    return mesh;
  }
  const hourMesh = makeComponentMesh();
  const sepOne = makeSeparatorMesh();
  const minuteMesh = makeComponentMesh();
  const sepTwo = makeSeparatorMesh();
  const secondMesh = makeComponentMesh();
  const timeGroup = new THREE.Group();
  timeGroup.add(hourMesh);
  timeGroup.add(sepOne);
  timeGroup.add(minuteMesh);
  timeGroup.add(sepTwo);
  timeGroup.add(secondMesh);
  scene.add(timeGroup);

  function layoutMeshes() {
    hourMesh.position.setScalar(0);
    minuteMesh.position.setScalar(0);
    secondMesh.position.setScalar(0);
    secondMesh.visible = true;
    sepTwo.visible = true;
    if (config.horizontal) {
      sepOne.visible = sepTwo.visible = true;
      sepOne.position.set(-0.29, 0.07, 0);
      if (!config.showSeconds) {
        secondMesh.visible = false;
        sepTwo.visible = false;
        timeGroup.position.set(0.06, -0.4, 0.1);
        timeGroup.scale.setScalar(1.4);
      } else {
        sepTwo.position.set(0.76, 0.07, 0);
        timeGroup.position.set(-0.48, -0.25, 0.1);
        timeGroup.scale.setScalar(1);
      }
      const offset = 1.08;
      hourMesh.position.x = -offset;
      secondMesh.position.x = offset;
    } else {
      sepOne.visible = sepTwo.visible = false;
      if (!config.showSeconds) {
        secondMesh.visible = false;
        timeGroup.position.set(-1.3, -1.65, 0.1);
        timeGroup.scale.setScalar(2.7);
      } else {
        timeGroup.position.set(-0.85, -0.4, 0.1);
        timeGroup.scale.setScalar(1.8);
      }
      hourMesh.position.y = 0.7;
      secondMesh.position.y = -0.7;
    }
  }
  console.log(config.horizontal);
  layoutMeshes();

  // scene.add(new THREE.AxesHelper());

  const renderer = new Renderer({ disableFullscreenUi: queryParams.has("2d") });
  renderer.render2d = queryParams.has("2d");
  renderer.renderQuilt = queryParams.has("quilt");
  renderer.webglRenderer.physicallyCorrectLights = true;
  renderer.webglRenderer.shadowMap.enabled = true;
  document.body.append(renderer.domElement);

  const camera = new Camera();
  camera.position.z = 20;
  if (queryParams.has("2d")) {
    new OrbitControls(camera, renderer.domElement);
  }

  function getGeo(timeString) {
    if (!geoCache.has(timeString)) {
      geoCache.set(
        timeString,
        new THREE.TextGeometry(timeString, {
          font,
          bevelEnabled: true,
          bevelSize: 0,
          bevelThickness: 0,
          bevelOffset: 0.07,
          size: 1.25,
          height: 0.8,
          curveSegments: 6,
        })
      );
    }
    return geoCache.get(timeString);
  }
  function updateMesh(mesh, str) {
    if (mesh.userData.lastStr !== str) {
      mesh.geometry = getGeo(str);
      mesh.geometry.needsUpdate = true;
      mesh.userData.lastStr = str;
    }
  }
  renderer.webglRenderer.setAnimationLoop(() => {
    const [hours, minutes, seconds] = getTimeParts(config.timeZone, config.format, true);
    updateMesh(hourMesh, hours);
    updateMesh(minuteMesh, minutes);
    updateMesh(secondMesh, seconds);
    renderer.render(scene, camera);
  });
})();

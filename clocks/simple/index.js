import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Renderer, Camera } from "holoplay";
import * as dat from "dat.gui";

const queryParams = new URLSearchParams(location.search);

(async () => {
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
  // scene.add(frame);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(3, 4, 0.1),
    new THREE.MeshStandardMaterial({ color: config.backColor, roughness: 1, metalness: 0 })
  );
  back.receiveShadow = true;
  back.position.z = -0.5;
  scene.add(back);

  const font = await new Promise(resolve => {
    new THREE.FontLoader().load('droid_sans_mono_regular.typeface.json', resolve);
  });

  const timeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(),
    new THREE.MeshStandardMaterial({ color: config.textColor, wireframe: false})
  );
  timeMesh.castShadow = true;
  timeMesh.position.x = -1.41;
  timeMesh.scale.setScalar(0.42);
  window.timeMesh = timeMesh;
  scene.add(timeMesh);

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
  const geoCache = new Map();
  function getGeo(timeString) {
    if (!geoCache.has(timeString)) {
      geoCache.set(timeString, new THREE.TextGeometry(timeString, { font, size: 1, height: 0.2, curveSegments: 6 }));
    }
    return geoCache.get(timeString);
  }
  renderer.webglRenderer.setAnimationLoop(() => {
    const date = new Date();
    const timeString = `${format(date.getHours())}:${format(date.getMinutes())}:${format(date.getSeconds())}`;
    if (timeString !== lastTimeString) {
      timeMesh.geometry = getGeo(timeString);
      timeMesh.geometry.needsUpdate = true;
      lastTimeString = timeString;
    }
    renderer.render(scene, camera);
  });
})();

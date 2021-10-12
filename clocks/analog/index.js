import "./global";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Renderer, Camera } from "holoplay";
import * as dat from "dat.gui";

import { timeZoneOptions, getTimeParts } from "../../common";

const queryParams = new URLSearchParams(location.search);

function rand(min=0, max=1) {
  return Math.random() * (max - min) + min;
}

const color = new THREE.Color();
function randomizeColor() {
  color.setHSL(
    rand(),
    rand(0.25, 1),
    rand(0.25, 1),
  );
  return `#${color.getHexString()}`;
}

(async () => {
  const gui = new dat.GUI({ hideable: false });
  gui.useLocalStorage = true;
  document.body.append(gui.domElement);
  gui.domElement.addEventListener('click', e => e.stopPropagation());
  const config = {
    timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
    backgroundColor: "#000000",
    backColor: "#ffffff",
    secondColor: "#ffffff",
    minuteColor: "#000000",
    hourColor: "#000000",
    markerColor: "#000000",
    randomize: () => {
      config.backgroundColor = randomizeColor();
      config.backColor = randomizeColor();
      config.secondColor = randomizeColor();
      config.minuteColor = randomizeColor();
      config.hourColor = randomizeColor();
      config.markerColor = randomizeColor();
      updateColors();
      gui.updateDisplay();
    },
    shadows: true,
  };
  gui.remember(config);
  gui.add(config, "timeZone", timeZoneOptions).name("time zone");
  gui.addColor(config, "backgroundColor").name("background color").onChange(updateColors);
  gui.addColor(config, "backColor").name("backing color").onChange(updateColors);
  gui.addColor(config, "hourColor").name("hour hand color").onChange(updateColors);
  gui.addColor(config, "minuteColor").name("minute hand color").onChange(updateColors);
  gui.addColor(config, "secondColor").name("second hand color").onChange(updateColors);
  gui.addColor(config, "markerColor").name("marker color").onChange(updateColors);
  gui.add(config, "randomize").name("randomize");
  gui.add(config, "shadows").onChange((val) => directionalLight.castShadow = val);

  function updateColors() {
    background.material.color.setStyle(config.backgroundColor);
    back.material.color.setStyle(config.backColor);
    hourHandMesh.material.color.setStyle(config.hourColor);
    minuteHandMesh.material.color.setStyle(config.minuteColor);
    secondHandMesh.material.color.setStyle(config.secondColor);
    dots.material.color.setStyle(config.markerColor);
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

  const group = new THREE.Group();
  group.position.z = 0.2;
  scene.add(group);

  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: config.background, roughness: 1, metalness: 0 })
  );
  background.receiveShadow = true;
  background.position.z = -1.5;
  group.add(background);

  const back = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 0.3, 64),
    new THREE.MeshStandardMaterial({ color: config.backColor, roughness: 1, metalness: 0 })
  );
  back.receiveShadow = back.castShadow = true;
  back.position.z = -0.4;
  back.rotation.x = Math.PI / 2;
  group.add(back);

  const secondHand = new THREE.Object3D();
  const secondHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.4, 0.1), new THREE.MeshStandardMaterial({roughness: 0.4, metalness: 0.2, color: config.secondColor}));
  secondHandMesh.castShadow = true;
  secondHandMesh.position.y = 0.5;
  secondHandMesh.position.z = 0.2;
  secondHand.add(secondHandMesh);
  group.add(secondHand);

  const minuteHand = new THREE.Object3D();
  const minuteHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), new THREE.MeshStandardMaterial({roughness: 0.5, metalness: 0.2, color: config.minuteColor}));
  minuteHandMesh.castShadow = true;
  minuteHandMesh.position.y = 0.5;
  minuteHandMesh.position.z = 0.1;
  minuteHand.add(minuteHandMesh);
  group.add(minuteHand);

  const hourHand = new THREE.Object3D();
  const hourHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.1), new THREE.MeshStandardMaterial({roughness: 0.5, metalness: 0.2, color: config.hourColor}));
  hourHandMesh.castShadow = true;
  hourHandMesh.position.y = 0.5;
  hourHand.add(hourHandMesh);
  group.add(hourHand);

  const dots = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 16), new THREE.MeshStandardMaterial({color: config.markerColor}), 12)
  dots.castShadow = true;
  group.add(dots);
  const dotDummy = new THREE.Object3D();
  dotDummy.position.y = 1.3
  dotDummy.rotation.x = Math.PI / 2
  const dotPivot = new THREE.Object3D();
  dotPivot.add(dotDummy);
  for (let i = 0; i < 12; i++) {
    dotPivot.rotation.z = i / 12 * (Math.PI * 2);
    dotPivot.updateWorldMatrix(false, true);
    dots.setMatrixAt(i, dotDummy.matrixWorld);
  }
  dots.instanceMatrix.needsUpdate = true;

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

  renderer.webglRenderer.setAnimationLoop(() => {
    const [hours, minutes, seconds] = getTimeParts(config.timeZone);
    secondHand.rotation.z = -seconds / 60 * (Math.PI * 2);
    minuteHand.rotation.z = -(minutes + seconds / 60) / 60 * (Math.PI * 2);
    hourHand.rotation.z = -(hours % 12 + minutes / 60 ) / 12 * (Math.PI * 2);
    renderer.render(scene, camera);
  });
})();

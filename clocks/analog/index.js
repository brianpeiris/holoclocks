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
    secondColor: "#ffffff",
    minuteColor: "#000000",
    hourColor: "#000000",
    markerColor: "#000000",
    shadows: true,
  };
  gui.remember(config);
  gui.add(config, "render2d").name("render 2d").setValue(false).onChange((val) => renderer.render2d = val);
  gui.addColor(config, "backColor").name("background color").onChange((val) => back.material.color.setStyle(val));
  gui.addColor(config, "hourColor").name("hour hand color").onChange((val) => hourHandMesh.material.color.setStyle(val));
  gui.addColor(config, "minuteColor").name("minute hand color").onChange((val) => minuteHandMesh.material.color.setStyle(val));
  gui.addColor(config, "secondColor").name("second hand color").onChange((val) => secondHandMesh.material.color.setStyle(val));
  gui.addColor(config, "markerColor").name("marker color").onChange((val) => dots.material.color.setStyle(val));
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
    new THREE.CylinderGeometry(1.5, 1.5, 0.1, 64),
    new THREE.MeshStandardMaterial({ color: config.backColor, roughness: 1, metalness: 0 })
  );
  back.receiveShadow = true;
  back.position.z = -0.2;
  back.rotation.x = Math.PI / 2;
  scene.add(back);

  const secondHand = new THREE.Object3D();
  const secondHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.4, 0.01), new THREE.MeshStandardMaterial({roughness: 0.05, metalness: 0.5, color: config.secondColor}));
  secondHandMesh.castShadow = true;
  secondHandMesh.position.y = 0.5;
  secondHandMesh.position.z = 0.02;
  secondHand.add(secondHandMesh);
  scene.add(secondHand);

  const minuteHand = new THREE.Object3D();
  const minuteHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.4, 0.01), new THREE.MeshStandardMaterial({roughness: 0.4, metalness: 0.2, color: config.minuteColor}));
  minuteHandMesh.castShadow = true;
  minuteHandMesh.position.y = 0.5;
  minuteHand.add(minuteHandMesh);
  scene.add(minuteHand);

  const hourHand = new THREE.Object3D();
  const hourHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.01), new THREE.MeshStandardMaterial({roughness: 0.4, metalness: 0.2, color: config.hourColor}));
  hourHandMesh.castShadow = true;
  hourHandMesh.position.y = 0.5;
  hourHandMesh.position.z = -0.02;
  hourHand.add(hourHandMesh);
  scene.add(hourHand);

  const dots = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16), new THREE.MeshStandardMaterial({color: config.markerColor}), 12)
  dots.castShadow = true;
  scene.add(dots);
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

  renderer.webglRenderer.setAnimationLoop(() => {
    const date = new Date();
    secondHand.rotation.z = -date.getSeconds() / 60 * (Math.PI * 2);
    minuteHand.rotation.z = -(date.getMinutes() + date.getSeconds() / 60) / 60 * (Math.PI * 2);
    hourHand.rotation.z = -(date.getHours() % 12 + date.getMinutes() / 60 ) / 12 * (Math.PI * 2);
    renderer.render(scene, camera);
  });
})();

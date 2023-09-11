import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
const Dinklage = new URL(
  "./assets/DinklageLikenessSculpt.glb",
  import.meta.url
);

const visibleHeightAtZDepth = (depth, camera) => {
  // compensate for cameras not positioned at z=0
  const cameraOffset = camera.position.z;
  if (depth < cameraOffset) depth -= cameraOffset;
  else depth += cameraOffset;
  // vertical fov in radians
  const vFOV = (camera.fov * Math.PI) / 180;

  // Math.abs to ensure the result is always positive
  return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
};

const visibleWidthAtZDepth = (depth, camera) => {
  const height = visibleHeightAtZDepth(depth, camera);
  return height * camera.aspect;
};

// function findScreenDepth(camera, renderer) {
//   const { near, far } = camera;
//   const { height: physicalViewHeight } = renderer.getDrawingBufferSize();
//   console.log(window.innerHeight, physicalViewHeight);
//   const threshold = 0.00000000000001;

//   return _findScreenDepth(near, far);

//   function _findScreenDepth(near, far) {
//     const midpoint = (far - near) / 2 + near;
//     const midpointHeight = visibleHeightAtZDepth(-midpoint, camera);

//     if (Math.abs(physicalViewHeight / midpointHeight - 1) <= threshold)
//       return midpoint;

//     if (physicalViewHeight < midpointHeight)
//       return _findScreenDepth(near, midpoint);
//     else if (physicalViewHeight > midpointHeight)
//       return _findScreenDepth(midpoint, far);
//     else if (midpointHeight == physicalViewHeight)
//       // almost never happens
//       return midpoint;
//   }
// }

const ThreeCanvas = () => {
  const canvas = document.querySelector("canvas.webgl");
  const scene = new THREE.Scene();
  const clock = new THREE.Clock();
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(
    0.03595466500720194,
    -0.010604015221595866,
    0.22894379123364889
  );
  camera.rotation.set(
    0.046284033593991296,
    0.15560936074122073,
    -0.00717820119833246,
    "XYZ"
  );

  const controls = new OrbitControls(camera, renderer.domElement)

  const resizeWindowsHandler = () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };
  const registerEvents = () => {
    window.addEventListener("resize", resizeWindowsHandler);
  };
  const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    //controls.update()
    // Render
    renderer.render(scene, camera);
    // Call animate again on the next frame
    window.requestAnimationFrame(animate);
  };
  const LoadModel = async () => {
    const assetsLoader = new GLTFLoader();
    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.0000005,
    });

    const gltf = await assetsLoader.loadAsync(Dinklage.href);
    const model = gltf.scene;
    const NewChildrens = model.children
      .filter(
        (child) =>
          child.name !== "DinklageHair" &&
          child.name !== "DinklageEyes" &&
          child.name !== "DinklageHairBase"
      )
      .map((child) => {
        const newMesh = new THREE.Points(
          child.geometry.clone(),
          pointsMaterial
        );
        newMesh.parent = child.parent;
        newMesh.position.set(
          child.position.x,
          child.position.y,
          child.position.z
        );
        newMesh.rotation.set(
          child.rotation.x,
          child.rotation.y,
          child.rotation.z
        );
        return newMesh;
      });
    model.children = NewChildrens;
    model.position.set(0, 0, 0);
    //scene.add(model);
    return model;
  };

  // Initalization

  // Lights
  const pointLight = new THREE.PointLight(0xffffff, 0.1);
  pointLight.position.x = 2;
  pointLight.position.y = 3;
  pointLight.position.z = 4;
  scene.add(pointLight);

  //camera
  // const fov = 180 * ( 2 * Math.atan( innerHeight / 2 / perspective ) ) / Math.PI

  resizeWindowsHandler();
  registerEvents();

  animate();

  return {
    LoadModel,
    scene,
    renderer,
    camera,
  };
};

(async () => {
  const { LoadModel, scene, camera, renderer, screenDepth } = ThreeCanvas();
  const DinklageModel = await LoadModel();
  console.log(visibleWidthAtZDepth(0, camera))
  window.model = DinklageModel;
  window.camera = camera;
  DinklageModel.position.z = -0.2
  scene.add(DinklageModel)
  scene.add(camera)
})();

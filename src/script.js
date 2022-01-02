import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { Noise } from "noisejs";

// Util Functions

const getPointInSphereUniform = (diameter) => {
  var d, x, y, z;
  do {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    z = Math.random() * 2 - 1;
    d = x * x + y * y + z * z;
  } while (d > 1.0);

  return new THREE.Vector3(x, y, z);
};

const getPointInSphereWeighted = (diameter) => {
  var d, x, y, z;
  do {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    z = Math.random() * 2 - 1;
    d = x * x + y * y + z * z;
  } while (d > Math.random());

  return new THREE.Vector3(x, y, z);
};

// Init Noise
let noise = new Noise(Math.random());

// Config
const numParticles = 250000; // 50000
const vMin = 0.0001; // 0.0001;
const maxSpeed = 0.002; // 0.001;
const minSpeed = 0.0001; // 0.0001;
const particleSize = 0.5; // 1
const particleOpacity = 0.0025; // 0.01 - Streamers // 0.001 - Fog // 0.00
//const blendingMode = THREE.NormalBlending; //THREE.AdditiveBlending;
const useAdditiveBlending = true;
const spawnSphereDiameter = 0.5;
const useDepthTest = false; //true;

const useWeightedSphereSampling = true;
const getPointInSphere = useWeightedSphereSampling
  ? getPointInSphereWeighted
  : getPointInSphereUniform;

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Objects
const positions = [];
const colors = [];
const velocities = [];
const speeds = [];
const colorArray = [
  new THREE.Color(0xff0080),
  new THREE.Color(0x0080ff),
  new THREE.Color(0x80ff00),
  new THREE.Color(0xffff00),
  new THREE.Color(0xff0000),
];

for (let i = 0; i < numParticles; i++) {
  const newP = getPointInSphere(spawnSphereDiameter);
  positions.push(newP.x, newP.y, newP.z);
  const clr = colorArray[Math.floor(Math.random() * colorArray.length)];
  colors.push(clr.r, clr.g, clr.b);
  let speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

  let pVelocities = velocities.push(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  );
  speeds.push(speed);
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);
geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
geometry.setAttribute(
  "velocity",
  new THREE.Float32BufferAttribute(velocities, 3)
);

// Materials
const material = new THREE.PointsMaterial({
  size: particleSize,
  vertexColors: true,
  sizeAttenuation: false,
  opacity: particleOpacity,
  blending: useAdditiveBlending ? THREE.AdditiveBlending : THREE.NormalBlending,
  transparent: true,
  depthTest: useDepthTest,
});

// Mesh
const mesh = new THREE.Points(geometry, material);
scene.add(mesh);

// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  preserveDrawingBuffer: true,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.autoClearColor = false;

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects

  const p = mesh.geometry.attributes.position.array;
  const v = mesh.geometry.attributes.velocity.array;
  let index = 0;

  for (let i = 0; i < numParticles; i++) {
    let x = index++;
    let y = index++;
    let z = index++;

    let pt = curl3d(p[x], p[y], p[x]);

    v[x] = pt.x * speeds[i];
    v[y] = pt.y * speeds[i];
    v[z] = pt.z * speeds[i];

    if (v[x] < vMin && v[y] < vMin && v[z] < vMin) {
      let newP = getPointInSphere(spawnSphereDiameter);
      p[x] = newP.x;
      p[y] = newP.y;
      p[z] = newP.z;
    } else {
      p[x] = p[x] + v[x];
      p[y] = p[y] + v[y];
      p[z] = p[z] + v[z];
    }
  }
  //   mesh.geometry.attributes.position.array.forEach(function (v) {
  //     v.y += 0.01;
  //   });
  mesh.geometry.attributes.position.needsUpdate = true;
  mesh.geometry.attributes.velocity.needsUpdate = true;

  // Update Orbital Controls
  // controls.update()

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

function curl3d(x, y, z) {
  var eps = 0.0001;
  var curl = new THREE.Vector3();

  var n1 = noise.simplex3(x, y + eps, z);
  var n2 = noise.simplex3(x, y - eps, z);
  // Average to find approximate derivative
  var a = (n1 - n2) / (2 * eps);
  var n1 = noise.simplex3(x, y, z + eps);
  var n2 = noise.simplex3(x, y, z - eps);
  // Average to find approximate derivative
  var b = (n1 - n2) / (2 * eps);
  curl.x = a - b;

  //Find rate of change in XZ plane
  n1 = noise.simplex3(x, y, z + eps);
  n2 = noise.simplex3(x, y, z - eps);
  a = (n1 - n2) / (2 * eps);
  n1 = noise.simplex3(x + eps, y, z);
  n2 = noise.simplex3(x - eps, y, z);
  b = (n1 - n2) / (2 * eps);
  curl.y = a - b;

  //Find rate of change in XY plane
  n1 = noise.simplex3(x + eps, y, z);
  n2 = noise.simplex3(x - eps, y, z);
  a = (n1 - n2) / (2 * eps);
  n1 = noise.simplex3(x, y + eps, z);
  n2 = noise.simplex3(x, y - eps, z);
  b = (n1 - n2) / (2 * eps);
  curl.z = a - b;

  return curl;
}

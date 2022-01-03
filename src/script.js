import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { Noise } from "noisejs";

import { getBlackbodyColor } from "./colors";

// Config
// When using additive blending, the opacity can drop to 0.0025 and still work
// For normal blending, it must be set higher, closer to 0.01
var config = {
  numParticles: 2500,
  vMin: 0.0001,
  maxSpeed: 0.002,
  minSpeed: 0.0001,
  sizeBase: 0.5,
  useAdditiveBlending: false,
  blackbodySaturation: 1.0,
  blackbodyOffset: 0.5,
  blackbodyScale: 2.0,
  particleOpacity: 0.025,
  useMonochromeParticles: false,
  useBlackbodyColors: true,
  spawnSphereDiameter: 0.5,
  useDepthTest: true,
  useAntialiasing: true,
  useWeightedSphereSampling: true,
  noiseSeed: Math.random(),
  noiseScale: 1.0,
  noiseType: "SIMPLEX",
  usePerspectiveSizing: false,
  useSineWaveOpacity: true,
  minSineOpacity: 0.0,
  maxSineOpacity: 1.0,
  sineFrequency: 1.0,
};

var configHasChanged = false;
const perspectiveScalingFactor = 1.125;
// Util Functions

const getBlackbodyColorByDistanceFromCenter = (position) => {
  const distanceFromCenter = position.length();
  const distanceScaled =
    distanceFromCenter / (config.spawnSphereDiameter * 0.5);
  const color = getBlackbodyColor(
    distanceScaled,
    config.blackbodySaturation,
    config.blackbodyOffset,
    config.blackbodyScale
  );
  return color;
};

const getPointInSphereUniform = (diameter) => {
  var d, x, y, z;
  do {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    z = Math.random() * 2 - 1;
    d = x * x + y * y + z * z;
  } while (d > diameter);

  return new THREE.Vector3(x, y, z);
};

const getPointInSphereWeighted = (diameter) => {
  var d, x, y, z;
  do {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    z = Math.random() * 2 - 1;
    d = x * x + y * y + z * z;
  } while (d > 1.0);

  diameter *= Math.random();
  return new THREE.Vector3(x * diameter, y * diameter, z * diameter);
};

// Init Noise
let noise;
let noiseFunc;
let currNoiseScale;
function initNoise() {
  noise = new Noise(config.noiseSeed);
  noiseFunc =
    config.noiseType === "SIMPLEX"
      ? (x, y, z) => noise.simplex3(x, y, z)
      : (x, y, z) => noise.perlin3(x, y, z);
  currNoiseScale = config.noiseScale;
}

initNoise();

const getPointInSphere = config.useWeightedSphereSampling
  ? getPointInSphereWeighted
  : getPointInSphereUniform;

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

const monoChromeColor = new THREE.Color(0xffffff);

let lockedNumParticles;
function initParticles() {
  lockedNumParticles = config.numParticles;
  positions.splice(0, positions.length);
  colors.splice(0, colors.lengths);
  velocities.splice(0, velocities.length);
  speeds.splice(0, speeds.length);

  for (let i = 0; i < lockedNumParticles; i++) {
    let x = i * 3;
    let y = i * 3 + 1;
    let z = i * 3 + 2;

    const newP = getPointInSphere(config.spawnSphereDiameter);
    positions[x] = newP.x;
    positions[y] = newP.y;
    positions[z] = newP.z;

    const clr = config.useMonochromeParticles
      ? monoChromeColor
      : config.useBlackbodyColors
      ? getBlackbodyColorByDistanceFromCenter(newP)
      : colorArray[Math.floor(Math.random() * colorArray.length)];

    colors[x] = clr.r;
    colors[y] = clr.g;
    colors[z] = clr.b;

    let speed = Math.random();

    velocities[x] = Math.random() - 0.5;
    velocities[y] = Math.random() - 0.5;
    velocities[z] = Math.random() - 0.5;
    speeds[i] = speed;
  }
}

initParticles();

let geometry;
// Set up Buffer Geometry Attributes
function initGeometry() {
  geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute(
    "velocity",
    new THREE.Float32BufferAttribute(velocities, 3)
  );
}

initGeometry();

// Materials
const material = new THREE.PointsMaterial({
  size: config.usePerspectiveSizing
    ? config.sizeBase * perspectiveScalingFactor
    : config.sizeBase,
  vertexColors: true,
  sizeAttenuation: config.usePerspectiveSizing,
  opacity: config.particleOpacity * (config.useAdditiveBlending ? 1 : 2),
  blending: config.useAdditiveBlending
    ? THREE.AdditiveBlending
    : THREE.NormalBlending,
  transparent: true,
  depthTest: config.useDepthTest,
});

// Mesh
let mesh;
function initMesh() {
  if (mesh !== undefined) {
    scene.remove(mesh);
  }
  mesh = new THREE.Points(geometry, material);
  scene.add(mesh);
}

initMesh();
// let sphereGeometry = new THREE.SphereBufferGeometry(1);
// let sphereMaterial = new THREE.MeshStandardMaterial({
//   color: 0xffffff,
//   roughness: 0.5,
//   metalness: 0.5,
// });
// let sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
// scene.add(sphereMesh);
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
  antialias: config.useAntialiasing,
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
  if (config.useSineWaveOpacity) {
    material.opacity =
      (Math.sin(elapsedTime * config.sineFrequency) * 0.5 + 0.5) *
        (config.maxSineOpacity - config.minSineOpacity) +
      config.minSineOpacity;
  }

  const p = mesh.geometry.attributes.position.array;
  const v = mesh.geometry.attributes.velocity.array;
  const c = mesh.geometry.attributes.color.array;
  let index = 0;

  for (let i = 0; i < lockedNumParticles; i++) {
    let x = index++;
    let y = index++;
    let z = index++;

    let pt = curl3d(p[x], p[y], p[x]);
    let speed =
      speeds[i] * (config.maxSpeed - config.minSpeed) + config.minSpeed;

    v[x] = pt.x * speed;
    v[y] = pt.y * speed;
    v[z] = pt.z * speed;

    if (
      v[x] < config.vMin * 0.75 &&
      v[y] < config.vMin * 0.75 &&
      v[z] < config.vMin * 0.75
    ) {
      let newP = getPointInSphere(config.spawnSphereDiameter);
      let newClr = getBlackbodyColorByDistanceFromCenter(newP);
      c[x] = newClr.r;
      c[y] = newClr.g;
      c[z] = newClr.b;
      p[x] = newP.x;
      p[y] = newP.y;
      p[z] = newP.z;

      mesh.geometry.attributes.color.needsUpdate = true;
    } else {
      p[x] = p[x] + v[x];
      p[y] = p[y] + v[y];
      p[z] = p[z] + v[z];
    }
  }

  mesh.geometry.attributes.position.needsUpdate = true;
  mesh.geometry.attributes.velocity.needsUpdate = true;

  // Update Orbital Controls
  // controls.update()

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

function resetScene() {
  configHasChanged = false;
  initNoise();
  initParticles();
  initGeometry();
  initMesh();
}

// Debug
const gui = new dat.GUI();
const noiseFolder = gui.addFolder("Stats");
noiseFolder
  .add(config, "noiseSeed", 0, 1, 0.00001)
  .listen()
  .onChange(function (value) {
    configHasChanged = true;
  });
noiseFolder
  .add(config, "noiseScale", 0.001, 2.0, 0.001)
  .onChange(function (value) {
    configHasChanged = true;
  });
noiseFolder
  .add(config, "noiseType", ["PERLIN", "SIMPLEX"])
  .onChange(function (value) {
    configHasChanged = true;
  });
noiseFolder.open();

const systemFolder = gui.addFolder("System");
systemFolder
  .add(config, "numParticles", 1, 100000, 1)
  .onChange(function (value) {
    configHasChanged = true;
  }); //.listen();
systemFolder.add(config, "spawnSphereDiameter", 0, 2, 0.1); //.listen();

const colorFolder = gui.addFolder("Color");
colorFolder.add(config, "blackbodySaturation", 0, 5, 0.1);
colorFolder.add(config, "blackbodyOffset", 0, 5, 0.1);
colorFolder.add(config, "blackbodyScale", 0, 5, 0.1);

const pointRenderingFolder = gui.addFolder("Point Rendering");

pointRenderingFolder
  .add(config, "sizeBase", 0.001, 1, 0.001)
  .onChange(setNewSize)
  .listen();
pointRenderingFolder.add(material, "opacity", 0.0025, 1, 0.0005);
const perspectiveSizingControl = pointRenderingFolder
  .add(config, "usePerspectiveSizing")
  .onChange(function (value) {
    material.size = value
      ? material.size * perspectiveScalingFactor
      : material.size / perspectiveScalingFactor;
  });

const particleBehaviorFolder = gui.addFolder("Particle Behavior");
particleBehaviorFolder.add(config, "minSpeed", 0.0001, 1, 0.00001);
particleBehaviorFolder.add(config, "maxSpeed", 0.0001, 1, 0.00001);

const sineOpacityFolder = gui.addFolder("Sine Opacity");
sineOpacityFolder.add(config, "useSineWaveOpacity");
sineOpacityFolder.add(config, "sineFrequency", 0.001, 10, 0.001);
sineOpacityFolder.add(config, "minSineOpacity", -1, 1, 0.001);
sineOpacityFolder.add(config, "maxSineOpacity", 0, 1, 0.001);

function setNewSize(value) {
  material.size = perspectiveSizingControl.getValue()
    ? value * perspectiveScalingFactor
    : value;
}

const buttons = {
  reset: function () {
    resetScene();
  },
  clearAndReset: function () {
    renderer.clear();
    resetScene();
  },
  reseed: function () {
    config.noiseSeed = Math.random();
  },
};
gui.add(buttons, "reset");
gui.add(buttons, "clearAndReset");
gui.add(buttons, "reseed");

tick();

function curl3d(rawX, rawY, rawZ) {
  var eps = 0.0001;
  var curl = new THREE.Vector3();

  const x = rawX * currNoiseScale;
  const y = rawY * currNoiseScale;
  const z = rawZ * currNoiseScale;

  var n1 = noiseFunc(x, y + eps, z);
  var n2 = noiseFunc(x, y - eps, z);
  // Average to find approximate derivative
  var a = (n1 - n2) / (2 * eps);
  var n1 = noiseFunc(x, y, z + eps);
  var n2 = noiseFunc(x, y, z - eps);
  // Average to find approximate derivative
  var b = (n1 - n2) / (2 * eps);
  curl.x = a - b;

  //Find rate of change in XZ plane
  n1 = noiseFunc(x, y, z + eps);
  n2 = noiseFunc(x, y, z - eps);
  a = (n1 - n2) / (2 * eps);
  n1 = noiseFunc(x + eps, y, z);
  n2 = noiseFunc(x - eps, y, z);
  b = (n1 - n2) / (2 * eps);
  curl.y = a - b;

  //Find rate of change in XY plane
  n1 = noiseFunc(x + eps, y, z);
  n2 = noiseFunc(x - eps, y, z);
  a = (n1 - n2) / (2 * eps);
  n1 = noiseFunc(x, y + eps, z);
  n2 = noiseFunc(x, y - eps, z);
  b = (n1 - n2) / (2 * eps);
  curl.z = a - b;

  return curl;
}

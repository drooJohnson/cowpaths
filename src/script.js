import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { Noise } from "noisejs";
import { ParticleSystem } from "./particles";
import { Config } from "./config";
import { BlackbodyColorGenerator } from "./colors";
import {
  getPointInSphereUniform,
  getPointInSphereWeighted,
} from "./sphereSampler";

// Config
// When using additive blending, the opacity can drop to 0.0025 and still work
// For normal blending, it must be set higher, closer to 0.01
var config = new Config({
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
  useSineWaveOpacity: false,
  minSineOpacity: 0.0,
  maxSineOpacity: 1.0,
  sineFrequency: 1.0,
  useFlatCurlNoise: false,
  noiseZOffset: 100.0,
  noiseXOffset: 0.0,
  noiseYOffset: 10.0,
});

var phi = 0;
var easingPhi = 0;
var theta = 0;
var easingTheta = 0;

var configHasChanged = false;
const perspectiveScalingFactor = 1.125;

// Init Noise
let noise;
let noiseFunc;
let currNoiseScale;
function initNoise() {
  let { noiseType, noiseScale, noiseSeed } = config.get();
  noise = new Noise(noiseSeed);
  noiseFunc =
    noiseType === "SIMPLEX"
      ? (x, y, z) => noise.simplex3(x, y, z)
      : (x, y, z) => noise.perlin3(x, y, z);
  currNoiseScale = noiseScale;
}

initNoise();

const getPointInSphere = config.getParam("useWeightedSphereSampling")
  ? getPointInSphereWeighted
  : getPointInSphereUniform;

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const particles = new ParticleSystem(config.getParam("numParticles"));

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

let colorizer = new BlackbodyColorGenerator(
  config.blackbodySaturation,
  config.blackbodyOffset,
  config.blackbodyScale
);

particles.init(config, getPointInSphere, colorizer, material, scene);

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

function updateCamera() {
  easingTheta += (theta - easingTheta) * 0.02;
  easingPhi += (phi - easingPhi) * 0.02;

  //console.log(theta);
  //console.log(phi);

  camera.position.y = 2 * Math.sin(easingTheta);
  camera.position.x = 2 * Math.cos(easingTheta) * Math.cos(easingPhi);
  camera.position.z = 2 * Math.cos(easingTheta) * Math.sin(easingPhi);

  camera.lookAt(scene.position);
}

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

var pressed = {};

function handleDown(e) {
  pressed[e.keyCode] = true;
}
function handleUp(e) {
  pressed[e.keyCode] = false;
  if (e.keyCode === 82) {
    buttons.clearAndReset();
  }
  if (e.keyCode === 32) {
    buttons.reset();
  }
  if (e.keyCode === 83) {
    buttons.reseed();
  }
}

function handleKeys() {
  // Left
  if (pressed[37]) phi += 0.05;
  // Right
  if (pressed[39]) phi -= 0.05;
  // Up
  if (pressed[38]) theta += 0.05;
  // Down
  if (pressed[40]) theta -= 0.05;
}

document.onkeydown = handleDown;
document.onkeyup = handleUp;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  if (config.useSineWaveOpacity) {
    material.opacity =
      (Math.sin(elapsedTime * config.sineFrequency) * 0.5 + 0.5) *
        (config.maxSineOpacity - config.minSineOpacity) +
      config.minSineOpacity;
  }

  particles.update(config.maxSpeed, config.minSpeed, (x, y, z) =>
    curl3d(x, y, z, noiseFunc)
  );

  colorizer.saturation = config.getParam("blackbodySaturation");
  colorizer.offset = config.getParam("blackbodyOffset");
  colorizer.scale = config.getParam("blackbodyScale");
  handleKeys();
  updateCamera();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

function resetScene() {
  configHasChanged = false;
  initNoise();
  particles.init(config, getPointInSphere, colorizer, material, scene);
}

// Debug
const gui = new dat.GUI();
const noiseFolder = gui.addFolder("Noise");
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
noiseFolder.add(config, "useFlatCurlNoise");
noiseFolder.add(config, "noiseZOffset", -100, 100, 0.01);
noiseFolder.add(config, "noiseXOffset", -100, 100, 0.01);
noiseFolder.add(config, "noiseYOffset", -100, 100, 0.01);
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

function curl3d(rawX, rawY, rawZ, noiseFunction) {
  var eps = 0.0001;
  var curl = new THREE.Vector3();

  const x = rawX * currNoiseScale;
  const y = rawY * currNoiseScale;
  const z = config.useFlatCurlNoise
    ? rawX * currNoiseScale
    : rawZ * currNoiseScale;

  var n1 = noiseFunction(x, y + eps, z + config.noiseZOffset);
  var n2 = noiseFunction(x, y - eps, z + config.noiseZOffset);
  // Average to find approximate derivative
  var a = (n1 - n2) / (2 * eps);
  var n1 = noiseFunction(x, y, z + eps);
  var n2 = noiseFunction(x, y, z - eps);
  // Average to find approximate derivative
  var b = (n1 - n2) / (2 * eps);
  curl.x = a - b;

  //Find rate of change in XZ plane
  n1 = noiseFunction(x, y, z + eps);
  n2 = noiseFunction(x, y, z - eps);
  a = (n1 - n2) / (2 * eps);
  n1 = noiseFunction(x + eps, y + config.noiseYOffset, z);
  n2 = noiseFunction(x - eps, y + config.noiseYOffset, z);
  b = (n1 - n2) / (2 * eps);
  curl.y = a - b;

  //Find rate of change in XY plane
  n1 = noiseFunction(x + eps, y, z);
  n2 = noiseFunction(x - eps, y, z);
  a = (n1 - n2) / (2 * eps);
  n1 = noiseFunction(x + config.noiseXOffset, y + eps, z);
  n2 = noiseFunction(x + config.noiseXOffset, y - eps, z);
  b = (n1 - n2) / (2 * eps);
  curl.z = a - b;

  return curl;
}

import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import HaltingNoiseGenerator from "./haltingNoise";
import CurlNoiseGenerator from "./curlNoise";
import { ParticleSystem } from "./particles";
import { Config } from "./config";
import { presets } from "./presets";
import { ColorGenerator, palettes } from "./colors";
import {
  getPointInSphereUniform,
  getPointInSphereWeighted,
} from "./sphereSampler";

// Config
// When using additive blending, the opacity can drop to 0.0025 and still work
// For normal blending, it must be set higher, closer to 0.01
var config = new Config(presets.default);
var configProxy = {
  preset: "default",
};

const presetOptions = Object.keys(presets);

var phi = 0;
var easingPhi = 0;
var theta = 0;
var easingTheta = 0;

export type NoiseTypes = "TRUE_CURL" | "APPROXIMATE_CURL" 

interface INoiseType {
  [key: string]: NoiseTypes;
}
export const value = "VALUE"

export const NoiseType:INoiseType = {
  TRUE_CURL: "TRUE_CURL", // true divergence-free curl noise. Does not work well with MIN_VELOCITY since true curl noise doesn't really slow down.
  APPROXIMATE_CURL: "APPROXIMATE_CURL", // approximate curl noise, can give more artistically interesting results.
}

export type ExtinctionMethods = "AGE" | "MIN_VELOCITY_PER_AXIS" | "MIN_SOFT_VELOCITY_PER_AXIS" | "MIN_VELOCITY" | "DISTANCE_FROM_CENTER"

interface IExtinctionMethod {
  [key: string]: ExtinctionMethods;
}

export const ExtinctionMethod:IExtinctionMethod = {
  AGE: "AGE", // lifespan is set for particles on init, and decremented each frame. Once it reaches 0, the particle is removed
  MIN_VELOCITY_PER_AXIS: "MIN_VELOCITY_PER_AXIS", // approximates by testing absolute value of each axis of velocity, if ALL are below a threshold, then particle is dead
  MIN_SOFT_VELOCITY_PER_AXIS: "MIN_SOFT_VELOCITY_PER_AXIS", // approximates by testing each axis of velocity, if ALL are below a threshold, then particle is dead
  MIN_VELOCITY: "MIN_VELOCITY", // gets actual length of velocity vector (expensive) and compares to threshold
  DISTANCE_FROM_CENTER: "DISTANCE_FROM_CENTER", // gets distance from center of particle system, and compares to threshold
}

// Init Noise

let noise;
let noiseFunc;
let currNoiseScale;
function initNoise() {
  let {
    noiseType,
    noiseScale,
    noiseSeed,
    noiseXOffset,
    noiseYOffset,
    noiseZOffset,
  } = config.get();

  switch(noiseType){
    case NoiseType.TRUE_CURL:
      noise = new CurlNoiseGenerator(
        noiseSeed,
        noiseXOffset,
        noiseYOffset,
        noiseZOffset
      );
      noiseFunc = noise.curl3d;
      break;
    case NoiseType.APPROXIMATE_CURL:
      // allow fallthrough to default
    default:
      noise = new HaltingNoiseGenerator(
        noiseSeed,
        noiseXOffset,
        noiseYOffset,
        noiseZOffset
      );
      noiseFunc = noise.curl3d;
  }
  currNoiseScale = noiseScale;
}

initNoise();

const getPointInSphere = getPointInSphereWeighted;

// Canvas
const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

const particles = new ParticleSystem(config.getParam("numParticles"));

const material = new THREE.PointsMaterial({
  size: config.sizeBase,
  vertexColors: true,
  sizeAttenuation: false,
  opacity: config.particleOpacity * (config.useAdditiveBlending ? 1 : 2),
  blending: config.useAdditiveBlending
    ? THREE.AdditiveBlending
    : THREE.NormalBlending,
  transparent: true,
  depthTest: true,
});

let colorizer = new ColorGenerator(
  config.paletteSaturation,
  config.paletteOffset,
  config.paletteScale
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

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
window.addEventListener("resize", () => {
  if (
    config.customResolution &&
    config.customResolutionX &&
    config.customResolutionY
  ) {
    return;
  }

  if (
    window.innerWidth === windowWidth &&
    window.innerHeight === windowHeight
  ) {
    console.log("Aborted resize");
  }

  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  updateCameraAspect(sizes.width, sizes.height);

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera

let aspectRatio;
if (
  config.customResolution &&
  config.customResolutionX &&
  config.customResolutionY
) {
  aspectRatio = config.customResolutionX / config.customResolutionY;
} else {
  aspectRatio = sizes.width / sizes.height;
}

const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = config.cameraDistance;
scene.add(camera);

function updateCamera() {
  easingTheta += (theta - easingTheta) * 0.02;
  easingPhi += (phi - easingPhi) * 0.02;

  camera.position.y = config.cameraDistance * Math.sin(easingTheta);
  camera.position.x =
    config.cameraDistance * Math.cos(easingTheta) * Math.cos(easingPhi);
  camera.position.z =
    config.cameraDistance * Math.cos(easingTheta) * Math.sin(easingPhi);

  camera.lookAt(scene.position);
}

function updateCameraAspect(width, height) {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
let renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  preserveDrawingBuffer: true,
  antialias: true,
});

function initRenderer() {
  if (rendererNeedsReinit()) {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      preserveDrawingBuffer: true,
      antialias: true,
    });
    if (config.customResolution) {
      if (config.customResolutionX && config.customResolutionY) {
        updateCameraAspect(
          config.getParam("customResolutionX"),
          config.getParam("customResolutionY")
        );
        canvas.width = config.customResolutionX;
        canvas.height = config.customResolutionY;
        let body = document.querySelector("div.sizer") as HTMLElement;
        body.style.width = config.customResolutionX + "px";
        body.style.height = config.customResolutionY + "px";
        renderer.setSize(config.customResolutionX, config.customResolutionY);
      } else {
        console.log("Please specify custom resolution X and Y");
      }
    } else {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      let body = document.querySelector("div.sizer") as HTMLElement;
      body.style.width = sizes.width + "px";
      body.style.height = sizes.height + "px";
      renderer.setSize(sizes.width, sizes.height);
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.autoClearColor = false;
  } else {
    return;
  }
}

function rendererNeedsReinit() {
  var currentRendererSize = new THREE.Vector2();
  renderer.getSize(currentRendererSize);

  if (
    config.customResolution &&
    config.customResolutionX &&
    config.customResolutionY
  ) {
    if (
      currentRendererSize.width !== config.customResolutionX ||
      currentRendererSize.height !== config.customResolutionY
    ) {
      return true;
    } else {
      return false;
    }
  } else if (
    currentRendererSize.width !== window.innerWidth ||
    currentRendererSize.height !== window.innerHeight
  ) {
    return true;
  } else {
    return false;
  }
}

initRenderer();

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

  //Listen to 'P' key
  if (e.keyCode === 80) {
    screenshot();
  }
}

function screenshot() {
  var imgData;

  try {
    imgData = renderer.domElement.toDataURL();
    var filename = new Date().toISOString() + ".png";
    download(imgData, filename);
  } catch (e) {
    console.log("Browser does not support taking screenshot of 3d context");
    return;
  }
}

function download(dataurl, filename) {
  const link = document.createElement("a");
  link.href = dataurl;
  link.download = filename;
  link.click();
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
  if (config.useSineWaveOpacity === true) {
    material.opacity =
      (Math.sin(elapsedTime * config.sineFrequency) * 0.5 + 0.5) *
        (config.maxSineOpacity - config.minSineOpacity) +
      config.minSineOpacity;
  } else {
    material.opacity = config.particleOpacity;
  }

  particles.update(config.maxSpeed, config.minSpeed, config.vMin, noiseFunc);

  colorizer.saturation = config.getParam("paletteSaturation");
  colorizer.offset = config.getParam("paletteOffset");
  colorizer.scale = config.getParam("paletteScale");
  handleKeys();
  updateCamera();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

function resetScene() {
  initNoise();
  initRenderer();
  particles.init(config, getPointInSphere, colorizer, material, scene);
}

// Debug
let gui;

if (gui !== undefined) {
  gui.destroy();
}
gui = new dat.GUI();
const noiseFolder = gui.addFolder("Noise");
noiseFolder
  .add(config, "noiseSeed", 0, 1, 0.00001)
  .listen()
noiseFolder
  .add(config, "noiseScale", 0.001, 2.0, 0.001)
console.log(config);
noiseFolder
  .add(config, "noiseType", [NoiseType.APPROXIMATE_CURL, NoiseType.TRUE_CURL])
  .onChange(function (value) {
    particles.noiseType = value;
  });
noiseFolder.add(config, "noiseZOffset", -100, 100, 0.01);
noiseFolder.add(config, "noiseXOffset", -100, 100, 0.01);
noiseFolder.add(config, "noiseYOffset", -100, 100, 0.01);
noiseFolder.open();

const systemFolder = gui.addFolder("System");
systemFolder
  .add(config, "numParticles", 1, 100000, 1);
systemFolder.add(config, "spawnSphereDiameter", 0, 2, 0.1);

var colorFolder = gui.addFolder("Color");

let saturationController = colorFolder.add(
  config,
  "paletteSaturation",
  -5,
  5,
  0.1
);
let offsetController = colorFolder.add(config, "paletteOffset", -5, 5, 0.1);
let scaleController = colorFolder.add(config, "paletteScale", -5, 5, 0.1);

colorFolder
  .add(config, "palette", Object.keys(palettes))
  .onChange(function (value) {
    colorizer.switchPalette(value);
    const newPalette = palettes[value];

    saturationController.setValue(newPalette.saturation);
    offsetController.setValue(newPalette.offset);
    scaleController.setValue(newPalette.scale);
  });
colorFolder.add(config, "useAdditiveBlending").onChange(function(value) {
  material.blending = value ? THREE.AdditiveBlending : THREE.NormalBlending;
})

const pointRenderingFolder = gui.addFolder("Point Rendering");

pointRenderingFolder
  .add(config, "sizeBase", 0.001, 2, 0.001)
  .onChange(setNewSize);
pointRenderingFolder
  .add(config, "particleOpacity", 0.0025, 2, 0.0005)
  .onChange(function (value) {
    material.opacity = value;
  });

const particleBehaviorFolder = gui.addFolder("Particle Behavior");
particleBehaviorFolder.add(config, "minSpeed", 0.0001, 1, 0.00001);
particleBehaviorFolder.add(config, "maxSpeed", 0.0001, 1, 0.00001);

const extinctionFolder = gui.addFolder("Extinction");
extinctionFolder.add(config, "extinctionMethod", Object.values(ExtinctionMethod)).onChange((value) => {particles.extinctionMethod = value});
extinctionFolder.add(config, "lifeSpanMin", 0.0, 10000, 1).onChange((value) => {particles.lifeSpanMin = value});
extinctionFolder.add(config, "lifeSpanMax", 0.0, 10000, 1).onChange((value) => {particles.lifeSpanMax = value});
extinctionFolder.add(config, "extinctionDistance", 0.0, 10000, 1).onChange((value) => {particles.extinctionDistance = value});
extinctionFolder.add(config, "vMin", 0.000001, 1.0, 0.000001).onChange((value) => {particles.vMin = value});

const sineOpacityFolder = gui.addFolder("Sine Opacity");
sineOpacityFolder.add(config, "useSineWaveOpacity");
sineOpacityFolder.add(config, "sineFrequency", 0.001, 10, 0.001);
sineOpacityFolder.add(config, "minSineOpacity", -1, 1, 0.001);
sineOpacityFolder.add(config, "maxSineOpacity", 0, 1, 0.001);

const canvasFolder = gui.addFolder("Canvas");
canvasFolder.add(config, "customResolution").onChange(function (value) {
  initRenderer();
});
canvasFolder
  .add(config, "customResolutionX", 0, 4096, 1)
  .onChange(function (value) {
    initRenderer();
  });
canvasFolder
  .add(config, "customResolutionY", 0, 4096, 1)
  .onChange(function (value) {
    initRenderer();
  });

const cameraFolder = gui.addFolder("Camera");
cameraFolder
  .add(config, "cameraDistance", 0, 10, 0.05)
  .onChange(function (value) {
    updateCamera();
  });

const presetFolder = gui.addFolder("Presets");
presetFolder
  .add(configProxy, "preset", presetOptions)
  .onChange(function (value) {
    let {
      palette,
      paletteOffset,
      paletteSaturation,
      paletteScale,
      ...settingsToApply
    } = presets[value];
    config.set(settingsToApply);
    updateGuiDisplay();
    renderer.clear();
    resetScene();
  });

const buttons = {
  reset: function () {
    resetScene();
  },
  clearAndReset: function () {
    renderer.clear();
    resetScene();
  },
  reseed: function () {
    let newSeed = Math.random();
    config.noiseSeed = newSeed;
    //noise.setSeed(newSeed);
  },
  screenshot: function () {
    screenshot();
  },
};
gui.add(buttons, "reset");
gui.add(buttons, "clearAndReset");
gui.add(buttons, "reseed");
gui.add(buttons, "screenshot");

function setNewSize(value) {
  material.size = value; /*perspectiveSizingControl.getValue()
    ? value * perspectiveScalingFactor
    : value;*/
}

function updateGuiDisplay() {
  for (var i = 0; i < Object.keys(gui.__folders).length; i++) {
    var key = Object.keys(gui.__folders)[i];
    for (var j = 0; j < gui.__folders[key].__controllers.length; j++) {
      gui.__folders[key].__controllers[j].updateDisplay();
    }
  }
  setNewSize(config.sizeBase);
  material.opacity = config.particleOpacity;
}

tick();

function curl3d(rawX, rawY, rawZ) {
  let eps = 0.0001;
  let curl = new THREE.Vector3();

  const x = rawX * currNoiseScale;
  const y = rawY * currNoiseScale;
  const z = rawZ * currNoiseScale;

  let n1 = noise.simplex3(x + config.noiseXOffset, y + eps, z);
  let n2 = noise.simplex3(x + config.noiseXOffset, y - eps, z);
  // Average to find approximate derivative
  let a = (n1 - n2) / (2 * eps);
  n1 = noise.simplex3(x + config.noiseXOffset, y, z + eps);
  n2 = noise.simplex3(x + config.noiseXOffset, y, z - eps);
  // Average to find approximate derivative
  let b = (n1 - n2) / (2 * eps);
  curl.x = a - b;

  //Find rate of change in XZ plane
  n1 = noise.simplex3(x, y + config.noiseYOffset, z + eps);
  n2 = noise.simplex3(x, y + config.noiseYOffset, z - eps);
  a = (n1 - n2) / (2 * eps);
  n1 = noise.simplex3(x + eps, y + config.noiseYOffset, z);
  n2 = noise.simplex3(x - eps, y + config.noiseYOffset, z);
  b = (n1 - n2) / (2 * eps);
  curl.y = a - b;

  //Find rate of change in XY plane
  n1 = noise.simplex3(x + eps, y, z + config.noiseZOffset);
  n2 = noise.simplex3(x - eps, y, z + config.noiseZOffset);
  a = (n1 - n2) / (2 * eps);
  n1 = noise.simplex3(x, y + eps, z + config.noiseZOffset);
  n2 = noise.simplex3(x, y - eps, z + config.noiseZOffset);
  b = (n1 - n2) / (2 * eps);
  curl.z = a - b;

  return curl;
}

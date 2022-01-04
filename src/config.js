export class Config {
  constructor(configObj) {
    this.numParticles = configObj.numParticles;
    this.vMin = configObj.vMin;
    this.maxSpeed = configObj.maxSpeed;
    this.minSpeed = configObj.minSpeed;
    this.sizeBase = configObj.sizeBase;
    this.useAdditiveBlending = configObj.useAdditiveBlending;
    this.blackbodySaturation = configObj.blackbodySaturation;
    this.blackbodyOffset = configObj.blackbodyOffset;
    this.blackbodyScale = configObj.blackbodyScale;
    this.particleOpacity = configObj.particleOpacity;
    this.useMonochromeParticles = configObj.useMonochromeParticles;
    this.useBlackbodyColors = configObj.useBlackbodyColors;
    this.spawnSphereDiameter = configObj.spawnSphereDiameter;
    this.useDepthTest = configObj.useDepthTest;
    this.useAntialiasing = configObj.useAntialiasing;
    this.useWeightedSphereSampling = configObj.useWeightedSphereSampling;
    this.noiseSeed = configObj.noiseSeed;
    this.noiseScale = configObj.noiseScale;
    this.noiseType = configObj.noiseType;
    this.usePerspectiveSizing = configObj.usePerspectiveSizing;
    this.useSineWaveOpacity = configObj.useSineWaveOpacity;
    this.minSineOpacity = configObj.minSineOpacity;
    this.maxSineOpacity = configObj.maxSineOpacity;
    this.sineFrequency = configObj.sineFrequency;
    this.useFlatCurlNoise = configObj.useFlatCurlNoise;
    this.noiseZOffset = configObj.noiseZOffset;
    this.noiseXOffset = configObj.noiseXOffset;
    this.noiseYOffset = configObj.noiseYOffset;
  }

  get() {
    return {
      numParticles: this.numParticles,
      vMin: this.vMin,
      maxSpeed: this.maxSpeed,
      minSpeed: this.minSpeed,
      sizeBase: this.sizeBase,
      useAdditiveBlending: this.useAdditiveBlending,
      blackbodySaturation: this.blackbodySaturation,
      blackbodyOffset: this.blackbodyOffset,
      blackbodyScale: this.blackbodyScale,
      particleOpacity: this.particleOpacity,
      useMonochromeParticles: this.useMonochromeParticles,
      useBlackbodyColors: this.useBlackbodyColors,
      spawnSphereDiameter: this.spawnSphereDiameter,
      useDepthTest: this.useDepthTest,
      useAntialiasing: this.useAntialiasing,
      useWeightedSphereSampling: this.useWeightedSphereSampling,
      noiseSeed: this.noiseSeed,
      noiseScale: this.noiseScale,
      noiseType: this.noiseType,
      usePerspectiveSizing: this.usePerspectiveSizing,
      useSineWaveOpacity: this.useSineWaveOpacity,
      minSineOpacity: this.minSineOpacity,
      maxSineOpacity: this.maxSineOpacity,
      sineFrequency: this.sineFrequency,
      useFlatCurlNoise: this.useFlatCurlNoise,
      noiseZOffset: this.noiseZOffset,
      noiseXOffset: this.noiseXOffset,
      noiseYOffset: this.noiseYOffset,
    };
  }
  getParam(key) {
    return this[key];
  }
}

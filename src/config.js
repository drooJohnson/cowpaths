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
    this.customResolution = configObj.customResolution;
    this.customResolutionX = configObj.customResolutionX;
    this.customResolutionY = configObj.customResolutionY;
    this.cameraDistance = configObj.cameraDistance;
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
      customResolution: this.customResolution,
      customResolutionX: this.customResolutionX,
      customResolutionY: this.customResolutionY,
      cameraDistance: this.cameraDistance,
    };
  }

  set(configObj) {
    this.numParticles = configObj.numParticles ?? this.numParticles;
    this.vMin = configObj.vMin ?? this.vMin;
    this.maxSpeed = configObj.maxSpeed ?? this.maxSpeed;
    this.minSpeed = configObj.minSpeed ?? this.minSpeed;
    this.sizeBase = configObj.sizeBase ?? this.sizeBase;
    this.useAdditiveBlending =
      configObj.useAdditiveBlending ?? this.useAdditiveBlending;
    this.blackbodySaturation =
      configObj.blackbodySaturation ?? this.blackbodySaturation;
    this.blackbodyOffset = configObj.blackbodyOffset ?? this.blackbodyOffset;
    this.blackbodyScale = configObj.blackbodyScale ?? this.blackbodyScale;
    this.particleOpacity = configObj.particleOpacity ?? this.particleOpacity;
    this.useMonochromeParticles =
      configObj.useMonochromeParticles ?? this.useMonochromeParticles;
    this.useBlackbodyColors =
      configObj.useBlackbodyColors ?? this.useBlackbodyColors;
    this.spawnSphereDiameter =
      configObj.spawnSphereDiameter ?? this.spawnSphereDiameter;
    this.useDepthTest = configObj.useDepthTest ?? this.useDepthTest;
    this.useAntialiasing = configObj.useAntialiasing ?? this.useAntialiasing;
    this.useWeightedSphereSampling =
      configObj.useWeightedSphereSampling ?? this.useWeightedSphereSampling;
    this.noiseSeed = configObj.noiseSeed ?? this.noiseSeed;
    this.noiseScale = configObj.noiseScale ?? this.noiseScale;
    this.noiseType = configObj.noiseType ?? this.noiseType;
    this.usePerspectiveSizing =
      configObj.usePerspectiveSizing ?? this.usePerspectiveSizing;
    this.useSineWaveOpacity =
      configObj.useSineWaveOpacity ?? this.useSineWaveOpacity;
    this.minSineOpacity = configObj.minSineOpacity ?? this.minSineOpacity;
    this.maxSineOpacity = configObj.maxSineOpacity ?? this.maxSineOpacity;
    this.sineFrequency = configObj.sineFrequency ?? this.sineFrequency;
    this.useFlatCurlNoise = configObj.useFlatCurlNoise ?? this.useFlatCurlNoise;
    this.noiseZOffset = configObj.noiseZOffset ?? this.noiseZOffset;
    this.noiseXOffset = configObj.noiseXOffset ?? this.noiseXOffset;
    this.noiseYOffset = configObj.noiseYOffset ?? this.noiseYOffset;
    this.customResolution = configObj.customResolution ?? this.customResolution;
    this.customResolutionX =
      configObj.customResolutionX ?? this.customResolutionX;
    this.customResolutionY =
      configObj.customResolutionY ?? this.customResolutionY;
    this.cameraDistance = configObj.cameraDistance ?? this.cameraDistance;
  }

  getParam(key) {
    return this[key];
  }

  setParam(key) {
    this[key] = value;
  }
}

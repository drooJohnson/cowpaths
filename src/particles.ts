import * as THREE from "three";
import { ColorGenerator } from "./colors";
import { Config } from './config';
import { NoiseTypes, NoiseType, ExtinctionMethods, ExtinctionMethod } from './script';

export class ParticleSystem {
  positions: Float32Array;
  colors: Float32Array;
  velocities: Float32Array;
  speeds: Float32Array;

  colorizer: ColorGenerator;
  numParticles: number;
  geometry: THREE.BufferGeometry;
  mesh: THREE.Points;
  scene: THREE.Scene;
  config: Config;

  spawnDiameter: number;
  spawnSampler: (diameter: number) => THREE.Vector3;
  life: number[];
  lifeSpanMax: number;
  lifeSpanMin: number;

  set extinctionMethod(method:ExtinctionMethods){
    switch(method) {
      case ExtinctionMethod.MIN_VELOCITY:
        this.extinctionTestFunction = this.killParticleByVelocity
        break;
      case ExtinctionMethod.MIN_VELOCITY_PER_AXIS:
        this.extinctionTestFunction = this.killParticleByVelocityPerAxis
        break;
      case ExtinctionMethod.MIN_SOFT_VELOCITY_PER_AXIS:
        this.extinctionTestFunction = this.killParticleBySoftVelocityPerAxis
        break;
      case ExtinctionMethod.AGE:
        this.extinctionTestFunction = this.killParticleByAge
        break;
      case ExtinctionMethod.DISTANCE_FROM_CENTER:
        this.extinctionTestFunction = this.killParticleByDistance
        break;
    }
  }

  extinctionDistance: number;
  extinctionTestFunction: (i:number) => boolean;
  vMin: number;
  noiseType: NoiseTypes;

  constructor(numParticles) {
    this.positions = new Float32Array(numParticles * 3);
    this.colors = new Float32Array(numParticles * 4);
    this.velocities = new Float32Array(numParticles * 3);
    this.speeds = new Float32Array(numParticles);

    this.colorizer;
    this.numParticles = numParticles;
    this.geometry;
    this.mesh;
    this.scene;
    this.config;
    this.noiseType = NoiseType.APPROXIMATE_CURL;
  }

  init(config, spawnSampler, colorizer, material, scene) {
    if (this.scene && this.mesh) {
      this.scene.remove(this.mesh);
    }

    this.config = config;
    this.numParticles = config.getParam("numParticles");
    this.spawnDiameter = config.getParam("spawnSphereDiameter");
    this.spawnSampler = spawnSampler;
    this.colorizer = colorizer;
    this.scene = scene;

    this.positions = new Float32Array(this.numParticles * 3);
    this.colors = new Float32Array(this.numParticles * 4);
    this.velocities = new Float32Array(this.numParticles * 3);
    this.speeds = new Float32Array(this.numParticles);
    this.life = [];
    this.lifeSpanMin = config.lifeSpanMin || 100;
    this.lifeSpanMax = config.lifeSpanMax || 500;
    this.extinctionMethod = config.extinctionMethod || ExtinctionMethod.MIN_SOFT_VELOCITY_PER_AXIS;
    this.extinctionDistance = config.extinctionDistance || 100;
    this.extinctionTestFunction;
    this.vMin = config.vMin || 0.1;
    this.noiseType = config.noiseType;

    for (let i = 0; i < this.numParticles; i++) {
      let x = i * 3;
      let y = i * 3 + 1;
      let z = i * 3 + 2;

      let r = i * 4;
      let g = i * 4 + 1;
      let b = i * 4 + 2;
      let a = i * 4 + 3;

      let position = this.spawnSampler(this.spawnDiameter);

      this.positions[x] = position.x;
      this.positions[y] = position.y;
      this.positions[z] = position.z;

      let color = this.colorizer.getColor(
        position.length() / this.spawnDiameter
      );

      this.colors[r] = color.r;
      this.colors[g] = color.g;
      this.colors[b] = color.b;
      this.colors[a] = 1.0;

      this.velocities[x] = Math.random() * 0.5 + 0.5;
      this.velocities[y] = Math.random() * 0.5 + 0.5;
      this.velocities[z] = Math.random() * 0.5 + 0.5;

      // This -1 to 1 is later rescaled to the range of minSpeed to maxSpeed;
      this.speeds[i] = Math.random(); 

      // Life is decremented each tick, and when it reaches 0, the particle will be deleted if
      // the extinction method is set to AGE.
      this.life[i] =
        Math.random() * (this.lifeSpanMax - this.lifeSpanMin) +
        this.lifeSpanMin;
      
      switch(this.extinctionMethod) {
        case ExtinctionMethod.MIN_VELOCITY:
          this.extinctionTestFunction = this.killParticleByVelocity
          break;
        case ExtinctionMethod.MIN_VELOCITY_PER_AXIS:
          this.extinctionTestFunction = this.killParticleByVelocityPerAxis
          break;
        case ExtinctionMethod.MIN_SOFT_VELOCITY_PER_AXIS:
          this.extinctionTestFunction = this.killParticleBySoftVelocityPerAxis
          break;
        case ExtinctionMethod.AGE:
          this.extinctionTestFunction = this.killParticleByAge
          break;
        case ExtinctionMethod.DISTANCE_FROM_CENTER:
          this.extinctionTestFunction = this.killParticleByDistance
          break;
      }
    }


    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.positions, 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.colors, 4)
    );
    this.geometry.setAttribute(
      "velocity",
      new THREE.Float32BufferAttribute(this.velocities, 3)
    );

    this.mesh = new THREE.Points(this.geometry, material);
    this.scene.add(this.mesh);

  }

  killParticleByAge = (i:number):boolean => {
    if (this.life[i] <= 0) {
      return true;
    }
    return false;
  }

  killParticleByDistance = (i:number):boolean => {
    let p = this.mesh.geometry.attributes.position;

    let x = p.getX(i)
    let y = p.getY(i)
    let z = p.getZ(i)

    let position = new THREE.Vector3(
      x,y,z
    );

    if (position.length() > this.extinctionDistance) {
      return true;
    }
    return false;
  }

  killParticleByVelocity = (i:number):boolean => {
    let v = this.mesh.geometry.attributes.velocity;

    let x = v.getX(i)
    let y = v.getY(i)
    let z = v.getZ(i)

    let velocity = new THREE.Vector3(
      x,y,z
    );

    if (velocity.length() < this.vMin) {
      return true;
    }
    return false;
  }

  killParticleBySoftVelocityPerAxis = (i:number):boolean => {

    let v = this.mesh.geometry.attributes.velocity;

    let x = v.getX(i)
    let y = v.getY(i)
    let z = v.getZ(i)

    let velocity = new THREE.Vector3(
      x,y,z
    );

    if (velocity.x < this.vMin && velocity.y < this.vMin && velocity.z < this.vMin) {
      return true;
    }
    return false;
  }

  killParticleByVelocityPerAxis = (i:number):boolean => {

    let v = this.mesh.geometry.attributes.velocity;


    // PREVIOUSLY THIS FUNCTION DIDN'T GET ABSOLUTE VALUES AND
    // WHILE THE RESULTS LOOKED COOL IT WAS COMPLETELY WRONG.
    let x = Math.abs(v.getX(i))
    let y = Math.abs(v.getY(i))
    let z = Math.abs(v.getZ(i))

    let velocity = new THREE.Vector3(
      x,y,z
    );

    if (velocity.x < this.vMin && velocity.y < this.vMin && velocity.z < this.vMin) {
      return true;
    }
    return false;
  }

  update(maxSpeed, minSpeed, vMin, noiseSampler: (x,y,z) => THREE.Vector3) {
    let p = this.mesh.geometry.attributes.position//.array;
    let v = this.mesh.geometry.attributes.velocity//.array;
    let c = this.mesh.geometry.attributes.color//.array;
    let index = 0;

    //var extinctionCount = 0;

    for (let i = 0; i < this.numParticles; i++) {

      // Each update, we decrement the life of each particle,
      // then find its velocity, and its distance from the center.

      // Once we have this data, we test to see if the particle should be deleted
      // by passing it to the extinctionTestFunc which returns true/false.
      // if it is true, we delete the particle and respawn it.
      
        this.life[i] -= 1;
        let px = p.getX(i);
        let py = p.getY(i);
        let pz = p.getZ(i);

        let pt = noiseSampler(px, py, pz);
        let speed = this.speeds[i] * (maxSpeed - minSpeed) + minSpeed;

        let vx =  pt.x * speed;
        let vy =  pt.y * speed;
        let vz =  pt.z * speed;

        v.setXYZ(i, vx, vy, vz);
        if (this.extinctionTestFunction(i)) {
          //extinctionCount++;
          this.respawnParticle(i, c, p, v);
        } else {
          p.setXYZ(i, px + vx, py + vy, pz + vz);
        }
      }
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.attributes.velocity.needsUpdate = true;
    this.mesh.geometry.attributes.color.needsUpdate = true;
    //console.log("Extinction count: " + extinctionCount);
  }

  respawnParticle (
    index,
    colorBuffer,
    positionBuffer,
    velocityBuffer,
    spawnDiameter = this.config.getParam("spawnSphereDiameter"),
    spawnSampler = this.spawnSampler
    // colorMode = this.colorMode
  ) {

    let position = spawnSampler(spawnDiameter);
    let color = this.colorizer.getColor(position.length() / spawnDiameter);

    colorBuffer.setXYZW(index, color.r, color.g, color.b, 2.0);
    positionBuffer.setXYZ(index, position.x, position.y, position.z);

    this.speeds[index] = Math.random();
    this.life[index] =
     Math.random() * (this.lifeSpanMax - this.lifeSpanMin) +
     this.lifeSpanMin;

    this.mesh.geometry.attributes.color.needsUpdate = true;
  }
}

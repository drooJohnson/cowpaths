import * as THREE from "three";
import { ColorGenerator } from "./colors";
import { Config } from './config';

export enum DeletionMethod {
  MINIMUM_VELOCITY,
  AGE,
  DISTANCE_FROM_CENTER,
}

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
  lifeSpan: number;
  deletionMethod: DeletionMethod;
  lifeRange: number[];

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
    this.lifeSpan = 1; // How many ticks a particle can survive beneath the vMin
    this.deletionMethod = DeletionMethod.MINIMUM_VELOCITY;
    this.lifeRange = [500, 100];

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

      this.speeds[i] = Math.random();
      // this.life[i] =
      //   Math.random() * (this.lifeRange[1] - this.lifeRange[0]) +
      //   this.lifeRange[0];
      this.life[i] = this.lifeSpan;
    }

    console.log(this.positions);

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

    console.log(this.mesh.geometry.attributes.position.array);
  }

  update(maxSpeed, minSpeed, vMin, noiseSampler) {
    let p = this.mesh.geometry.attributes.position//.array;
    let v = this.mesh.geometry.attributes.velocity//.array;
    let c = this.mesh.geometry.attributes.color//.array;
    let index = 0;

    for (let i = 0; i < this.numParticles; i++) {
      if (this.life[i] <= 0) {
        this.respawnParticle(i, c, p, v);
      } else {
        //this.life[i] -= 1;

        // if (this.life[i] <= 0) {
        //   // if (v[x] < vMin && v[y] < vMin && v[z] < vMin) {
        //   this.respawnParticle(i, c, p, v);
        // } else {

        let px = p.getX(i);
        let py = p.getY(i);
        let pz = p.getZ(i);


        let pt = noiseSampler(px, py, pz);
        let speed = this.speeds[i] * (maxSpeed - minSpeed) + minSpeed;

        let vx =  pt.x * speed;
        let vy =  pt.y * speed;
        let vz =  pt.z * speed;

        v.setXYZ(i, vx, vy, vz);

        let vLen = Math.sqrt(vx * vx + vy * vy + vz * vz);

        if (vLen < vMin) {
          this.life[i] -= 1;
          c.setZ(i, this.life[i] / this.lifeSpan);
          c.setW(i, this.life[i] / this.lifeSpan);
        }

        p.setXYZ(i, px + vx, py + vy, pz + vz);
        // p[x] = p[x] + v[x];
        // p[y] = p[y] + v[y];
        // p[z] = p[z] + v[z];
        // }
      }
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.attributes.velocity.needsUpdate = true;
    this.mesh.geometry.attributes.color.needsUpdate = true;
  }

  respawnParticle(
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
    this.life[index] = this.lifeSpan;
    //this.life[index] =
    //  Math.random() * (this.lifeRange[1] - this.lifeRange[0]) +
    //  this.lifeRange[0];

    this.mesh.geometry.attributes.color.needsUpdate = true;
  }
}

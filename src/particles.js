import * as THREE from "three";

export class ParticleSystem {
  constructor(numParticles) {
    this.positions = [];
    this.colors = [];
    this.velocities = [];
    this.speeds = [];

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

    this.positions = [];
    this.colors = [];
    this.velocities = [];
    this.speeds = [];

    for (let i = 0; i < this.numParticles; i++) {
      let x = i * 3;
      let y = i * 3 + 1;
      let z = i * 3 + 2;

      let position = this.spawnSampler(this.spawnDiameter);

      this.positions[x] = position.x;
      this.positions[y] = position.y;
      this.positions[z] = position.z;

      let color = this.colorizer.getColor(
        position.length() / this.spawnDiameter
      );

      this.colors[x] = color.r;
      this.colors[y] = color.g;
      this.colors[z] = color.b;

      this.velocities[x] = Math.random() * 0.5 + 0.5;
      this.velocities[y] = Math.random() * 0.5 + 0.5;
      this.velocities[z] = Math.random() * 0.5 + 0.5;

      this.speeds[i] = Math.random();
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.positions, 3)
    );
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(this.colors, 3)
    );
    this.geometry.setAttribute(
      "velocity",
      new THREE.Float32BufferAttribute(this.velocities, 3)
    );

    this.mesh = new THREE.Points(this.geometry, material);
    this.scene.add(this.mesh);
  }

  update(maxSpeed, minSpeed, vMin, noiseSampler) {
    let p = this.mesh.geometry.attributes.position.array;
    let v = this.mesh.geometry.attributes.velocity.array;
    let c = this.mesh.geometry.attributes.color.array;
    let index = 0;

    for (let i = 0; i < this.numParticles; i++) {
      let x = i * 3;
      let y = i * 3 + 1;
      let z = i * 3 + 2;

      let pt = noiseSampler(p[x], p[y], p[z]);
      let speed = this.speeds[i] * (maxSpeed - minSpeed) + minSpeed;

      v[x] = pt.x * speed;
      v[y] = pt.y * speed;
      v[z] = pt.z * speed;

      if (v[x] < vMin * 0.75 && v[y] < vMin * 0.75 && v[z] < vMin * 0.75) {
        this.respawnParticle(i, c, p, v);
      } else {
        p[x] = p[x] + v[x];
        p[y] = p[y] + v[y];
        p[z] = p[z] + v[z];
      }
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.attributes.velocity.needsUpdate = true;
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
    let x = index * 3;
    let y = index * 3 + 1;
    let z = index * 3 + 2;

    let position = spawnSampler(spawnDiameter);
    let color = this.colorizer.getColor(position.length() / spawnDiameter);

    colorBuffer[x] = color.r;
    colorBuffer[y] = color.g;
    colorBuffer[z] = color.b;
    positionBuffer[x] = position.x;
    positionBuffer[y] = position.y;
    positionBuffer[z] = position.z;

    this.speeds[index] = Math.random();

    this.mesh.geometry.attributes.color.needsUpdate = true;
  }
}

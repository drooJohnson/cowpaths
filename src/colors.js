import * as THREE from "three";

export class BlackbodyColorGenerator {
  constructor(saturation, offset, scale) {
    this.saturation = saturation;
    this.offset = offset;
    this.scale = scale;
  }

  getColor(
    t,
    saturation = this.saturation,
    offset = this.offset,
    scale = this.scale
  ) {
    let rangeOffset = saturation * 0.1;
    t /= 2;
    t *= scale;
    t += offset;
    const a = [0.5, 0.5, 0.5];
    const b = [0.5, 0.5, 0.5];
    const c = [1.0, 1.0, 1.0];
    const d = [-rangeOffset, 0.0, rangeOffset];

    const clr = [];

    for (let i = 0; i < 3; i++) {
      clr.push(a[i] + b[i] * Math.cos(6.28318 * (c[i] * t + d[i])));
    }

    return new THREE.Color(clr[0], clr[1], clr[2]);
  }
}

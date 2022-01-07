import * as THREE from "three";

export const palettes = {
  default: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 1.0, 1.0],
    d: [0.0, 0.0, 0.0],
    saturation: 1,
    offset: 0.5,
    scale: 1,
    configurables: ["offset", "scale", "saturation"],
  },
  rainbow: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 1.0, 1.0],
    d: [0.0, 0.333, 0.666],
    saturation: 0,
    offset: 0,
    scale: 1,
    configurables: ["offset", "scale", "saturation"],
  },
  cyanMauve: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 1.0, 1.0],
    d: [0.3, 0.2, 0.2],
    saturation: 0,
    offset: 0,
    scale: 1,
    configurables: ["offset", "scale", "saturation"],
  },
  sludge: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 1.0, 0.5],
    d: [0.8, 0.9, 0.3],
    saturation: 0,
    offset: 0,
    scale: 1,
    configurables: ["offset", "scale", "saturation"],
  },
  desert: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 0.7, 0.4],
    d: [0.0, 0.15, 0.2],
    saturation: 0,
    offset: 0,
    scale: 1,
    configurables: ["offset", "scale", "saturation"],
  },
  nineties: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [2.0, 1.0, 0.0],
    d: [0.5, 0.2, 0.25],
    saturation: 0,
    offset: 0,
    scale: 1,
    configurables: ["offset", "scale", "saturation"],
  },
  greenOrange: {
    a: [0.8, 0.5, 0.4],
    b: [0.2, 0.4, 0.2],
    c: [2.0, 1.0, 0.0],
    d: [0.0, 0.25, 0.25],
    saturation: 0,
    offset: 0,
    scale: 1,
    configurables: ["offset", "scale", "saturation"],
  },
};
export class ColorGenerator {
  constructor(saturation, offset, scale, palette = "default") {
    this.saturation = saturation;
    this.offset = offset;
    this.scale = scale;
    this.palette = palette;
    this.a = palettes[palette].a;
    this.b = palettes[palette].b;
    this.c = palettes[palette].c;
    this.d = palettes[palette].d;
  }

  switchPalette(palette) {
    this.palette = palette;
    this.a = palettes[palette].a;
    this.b = palettes[palette].b;
    this.c = palettes[palette].c;
    this.d = palettes[palette].d;
  }

  getColor(
    t,
    saturation = this.saturation,
    offset = this.offset,
    scale = this.scale,
    palette
  ) {
    let rangeOffset = saturation * 0.1;
    t /= 2;
    t *= scale;
    t += offset;

    if (palette && palettes[palette]) {
      this.a = palettes[palette].a;
      this.b = palettes[palette].b;
      this.c = palettes[palette].c;
      this.d = palettes[palette].d;
    }

    const d = [
      -rangeOffset + this.d[0],
      0.0 + this.d[1],
      rangeOffset + this.d[2],
    ];

    const clr = [];

    for (let i = 0; i < 3; i++) {
      clr.push(
        this.a[i] + this.b[i] * Math.cos(6.28318 * (this.c[i] * t + d[i]))
      );
    }

    return new THREE.Color(clr[0], clr[1], clr[2]);
  }
}

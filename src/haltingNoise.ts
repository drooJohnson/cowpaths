import * as THREE from "three";

  var grad3 = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1],
  ]; 
  
  var p = [151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

  var grad4 = [
    [0, 1, 1, 1],
    [0, 1, 1, -1],
    [0, 1, -1, 1],
    [0, 1, -1, -1],
    [0, -1, 1, 1],
    [0, -1, 1, -1],
    [0, -1, -1, 1],
    [0, -1, -1, -1],
    [1, 0, 1, 1],
    [1, 0, 1, -1],
    [1, 0, -1, 1],
    [1, 0, -1, -1],
    [-1, 0, 1, 1],
    [-1, 0, 1, -1],
    [-1, 0, -1, 1],
    [-1, 0, -1, -1],
    [1, 1, 0, 1],
    [1, 1, 0, -1],
    [1, -1, 0, 1],
    [1, -1, 0, -1],
    [-1, 1, 0, 1],
    [-1, 1, 0, -1],
    [-1, -1, 0, 1],
    [-1, -1, 0, -1],
    [1, 1, 1, 0],
    [1, 1, -1, 0],
    [1, -1, 1, 0],
    [1, -1, -1, 0],
    [-1, 1, 1, 0],
    [-1, 1, -1, 0],
    [-1, -1, 1, 0],
    [-1, -1, -1, 0],
  ];

  // A lookup table to traverse the simplex around a given point in 4D.
  // Details can be found where this table is used, in the 4D noise method.
  var simplex = [
    [0, 1, 2, 3],
    [0, 1, 3, 2],
    [0, 0, 0, 0],
    [0, 2, 3, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 2, 3, 0],
    [0, 2, 1, 3],
    [0, 0, 0, 0],
    [0, 3, 1, 2],
    [0, 3, 2, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 3, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [1, 2, 0, 3],
    [0, 0, 0, 0],
    [1, 3, 0, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 3, 0, 1],
    [2, 3, 1, 0],
    [1, 0, 2, 3],
    [1, 0, 3, 2],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 0, 3, 1],
    [0, 0, 0, 0],
    [2, 1, 3, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [2, 0, 1, 3],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [3, 0, 1, 2],
    [3, 0, 2, 1],
    [0, 0, 0, 0],
    [3, 1, 2, 0],
    [2, 1, 0, 3],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [3, 1, 0, 2],
    [0, 0, 0, 0],
    [3, 2, 0, 1],
    [3, 2, 1, 0],
  ];

  function fastFloor(x) {
    return x > 0 ? ~~x : ~~x - 1;
  }

  function dot2(g, x, y) {
    return g[0] * x + g[1] * y;
  }

  function dot3(g, x, y, z) {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  function dot4(g, x, y, z, w) {
    return g[0] * x + g[1] * y + g[2] * z + g[3] * w;
  }

  class NoiseGenerator {
    private p: Uint8Array;
    private perm: Array<number>;
    private gradP: Array<Array<number>>;
    offset: THREE.Vector3;

    constructor(seed, offset) {
      console.log(seed);
      //const random = alea(seed);
      //this.p = buildPermutationTable(random);
      this.perm = new Array(512);
      this.gradP = new Array(512);

      // for ( let i = 0; i < 512; i++ ) {
      //   this.perm[i] = this.p[i & 255];
      //   this.gradP[i] = this.perm[i] % 12;
      // }

      if(seed > 0 && seed < 1) {
        // Scale the seed out
        seed *= 65536;
      }

      seed = Math.floor(seed);
      if(seed < 256) {
        seed |= seed << 8;
      }

      for(var i = 0; i < 256; i++) {
        var v;
        if (i & 1) {
          v = p[i] ^ (seed & 255);
        } else {
          v = p[i] ^ ((seed>>8) & 255);
        }

        this.perm[i] = this.perm[i + 256] = v;
        this.gradP[i] = this.gradP[i + 256] = grad3[v % 12];
      }

      this.offset = offset || new THREE.Vector3(0, 0, 0);
    }

    simplex3Sample = (xin, yin, zin) => {
      const gradP = this.gradP;
      const perm = this.perm;
      //let gradP = this.gradP;
      var n0, n1, n2, n3;

      var F3 = 1.0 / 3.0;
      var s = (xin + yin + zin) * F3;
      const i = fastFloor(xin + s);
      const j = fastFloor(yin + s);
      const k = fastFloor(zin + s);

      const G3 = 1.0 / 6.0;
      const t = (i + j + k) * G3;
      const X0 = i - t;
      const Y0 = j - t;
      const Z0 = k - t;
      const x0 = xin - X0;
      const y0 = yin - Y0;
      const z0 = zin - Z0;

      let i1, j1, k1;
      let i2, j2, k2;

      if (x0 >= y0) {
        if (y0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } else if (x0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } else {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        }
      } else {
        if (y0 < z0) {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } else if (x0 < z0) {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } else {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        }
      }

      const x1 = x0 - i1 + G3;
      const y1 = y0 - j1 + G3;
      const z1 = z0 - k1 + G3;
      const x2 = x0 - i2 + 2.0 * G3;
      const y2 = y0 - j2 + 2.0 * G3;
      const z2 = z0 - k2 + 2.0 * G3;
      const x3 = x0 - 1.0 + 3.0 * G3;
      const y3 = y0 - 1.0 + 3.0 * G3;
      const z3 = z0 - 1.0 + 3.0 * G3;

      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;

      var gx0, gy0, gz0, gx1, gy1, gz1; /* Gradients at simplex corners */
      var gx2, gy2, gz2, gx3, gy3, gz3;
      var /*t0, t1, t2, t3,*/ t20, t40, t21, t41, t22, t42, t23, t43;

      var gi0 = gradP[ii + perm[jj + perm[kk]]];
      var gi1 = gradP[ii + i1 + perm[jj + j1 + perm[kk + k1]]];
      var gi2 = gradP[ii + i2 + perm[jj + j2 + perm[kk + k2]]];
      var gi3 = gradP[ii + 1 + perm[jj + 1 + perm[kk + 1]]];

      var t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) {
        n0 = 0.0;
        gx0 = 0.0;
        gy0 = 0.0;
        gz0 = 0.0;
        t20 = 0.0;
        t40 = 0.0;
      } else {
        t20 = t0 * t0;
        t40 = t20 * t20;
        gx0 = gi0[0];
        gy0 = gi0[1];
        gz0 = gi0[2];
        n0 = t40 * dot3(gi0, x0, y0, z0);
      }

      var t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) {
        n1 = 0.0;
        gx1 = 0.0;
        gy1 = 0.0;
        gz1 = 0.0;
        t21 = 0.0;
        t41 = 0.0;
      } else {
        t21 = t1 * t1;
        t41 = t21 * t21;
        gx1 = gi1[0];
        gy1 = gi1[1];
        gz1 = gi1[2];
        n1 = t41 * dot3(gi1, x1, y1, z1);
      }

      var t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) {
        n2 = 0.0;
        gx2 = 0.0;
        gy2 = 0.0;
        gz2 = 0.0;
        t22 = 0.0;
        t42 = 0.0;
      } else {
        t22 = t2 * t2;
        t42 = t22 * t22;
        gx2 = gi2[0];
        gy2 = gi2[1];
        gz2 = gi2[2];
        n2 = t42 * dot3(gi2, x2, y2, z2);
      }

      var t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) {
        n3 = 0.0;
        gx3 = 0.0;
        gy3 = 0.0;
        gz3 = 0.0;
        t23 = 0.0;
        t43 = 0.0;
      } else {
        t23 = t3 * t3;
        t43 = t23 * t23;
        gx3 = gi3[0];
        gy3 = gi3[1];
        gz3 = gi3[2];
        n3 = t43 * dot3(gi3, x3, y3, z3);
      }

      //console.log(t0, t1, t2, t3);

      // GET DERIVATIVE

      
      return 32.0 * (n0 + n1 + n2 + n3)

      // return {
      //   value,
      //   derivative,
      // };
    }
    // curl3d = (x, y, z) => {
    //   var eps = 0.00001;
    //   var curl = new THREE.Vector3();
    //   // let sampleX = this.simplex3Sample(x, y, z);
    //   // let sampleY = this.simplex3Sample(x + 100, y, z);
    //   // let sampleZ = this.simplex3Sample(x, y + 100, z);

    //   // var curl = new THREE.Vector3();
    //   // curl.x = sampleZ.derivative.y - sampleY.derivative.z;
    //   // curl.y = sampleX.derivative.z - sampleZ.derivative.x;
    //   // curl.z = sampleY.derivative.x - sampleX.derivative.y;
    //   const sampleXa = this.simplex3Sample(x + eps, y, z);
    //   const sampleXb = this.simplex3Sample(x - eps, y, z);
    //   const dx = (sampleXa - sampleXb) / (2 * eps);
    //   const sampleYa = this.simplex3Sample(x, y + eps, z);
    //   const sampleYb = this.simplex3Sample(x, y - eps, z);
    //   const dy = (sampleYa - sampleYb) / (2 * eps);
    //   const sampleZa = this.simplex3Sample(x, y, z + eps);
    //   const sampleZb = this.simplex3Sample(x, y, z - eps);
    //   const dz = (sampleZa - sampleZb) / (2 * eps);
    //   return curl;
    // }
    curl3d = (x,y,z) => {
      var eps = 0.0001;
      var curl = new THREE.Vector3();
    
      // const x = rawX * currNoiseScale;
      // const y = rawY * currNoiseScale;
      // const z = config.useFlatCurlNoise
      //   ? rawX * currNoiseScale
      //   : rawZ * currNoiseScale;
    
      var n1 = this.simplex3Sample(x + this.offset.x, y + eps, z);
      var n2 = this.simplex3Sample(x + this.offset.x, y - eps, z);
      // Average to find approximate derivative
      var a = (n1 - n2) / (2 * eps);
      var n1 = this.simplex3Sample(x + this.offset.x, y, z + eps);
      var n2 = this.simplex3Sample(x + this.offset.x, y, z - eps);
      // Average to find approximate derivative
      var b = (n1 - n2) / (2 * eps);
      curl.x = a - b;
    
      //Find rate of change in XZ plane
      n1 = this.simplex3Sample(x, y + this.offset.y, z + eps);
      n2 = this.simplex3Sample(x, y + this.offset.y, z - eps);
      a = (n1 - n2) / (2 * eps);
      n1 = this.simplex3Sample(x + eps, y + this.offset.y, z);
      n2 = this.simplex3Sample(x - eps, y + this.offset.y, z);
      b = (n1 - n2) / (2 * eps);
      curl.y = a - b;
    
      //Find rate of change in XY plane
      n1 = this.simplex3Sample(x + eps, y, z + this.offset.z);
      n2 = this.simplex3Sample(x - eps, y, z + this.offset.z);
      a = (n1 - n2) / (2 * eps);
      n1 = this.simplex3Sample(x, y + eps, z + this.offset.z);
      n2 = this.simplex3Sample(x, y - eps, z + this.offset.z);
      b = (n1 - n2) / (2 * eps);
      curl.z = a - b;
    
      return curl;
    }
  }


export default NoiseGenerator;
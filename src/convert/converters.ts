import type { RGBColor, HSLColor, HSVColor, HWBColor, XYZColor, LABColor, LCHColor } from '../shared/types.js';
import { composeConverters, clamp } from '../shared/utility.js';
export const defaultIlluminant = [95.047, 100, 108.883];

function clampRgb({ r, g, b }: RGBColor): RGBColor {
  [r, g, b] = [r, g, b].map((value) => clamp(value, 0, 255));
  return { r, g, b };
}

export function rgbToHsv({ r, g, b }: RGBColor): HSVColor {
  (r /= 255), (g /= 255), (b /= 255);

  let h = 0, s = 0, v = 0;

  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;

  v = max;

  if (delta === 0) {
    // grayscale
    h = 0;
    s = 0;
  } else {
    s = delta / max;
    const deltaR = ((max - r) / 6 + delta / 2) / delta;
    const deltaG = ((max - g) / 6 + delta / 2) / delta;
    const deltaB = ((max - b) / 6 + delta / 2) / delta;
    switch (max) {
      case r:
        h = deltaB - deltaG;
        break;
      case g:
        h = 1 / 3 + deltaR - deltaB;
        break;
      case b:
        h = 2 / 3 + deltaG - deltaR;
        break;
    }
  }

  if (h < 0) h += 1;
  if (h > 1) h -= 1;

  return {
    h: h * 360,
    s: s * 100,
    v: v * 100
  }
}

export function hsvToRgb({ h, s, v }: HSVColor): RGBColor {

  (h /= 360), (s /= 100), (v /= 100);

  let r = 0, g = 0, b = 0;

  if (s == 0) {
    r = v;
    g = v;
    b = v;
  } else {
    let hp = h * 6;
    if (hp == 6) hp = 0; //h must be < 1
    let i = Math.floor(hp); //Or ... i = floor( hp )
    let c1 = v * (1 - s);
    let c2 = v * (1 - s * (hp - i));
    let c3 = v * (1 - s * (1 - (hp - i)));

    if (i == 0) {
      r = v;
      g = c3;
      b = c1;
    } else if (i == 1) {
      r = c2;
      g = v;
      b = c1;
    } else if (i == 2) {
      r = c1;
      g = v;
      b = c3;
    } else if (i == 3) {
      r = c1;
      g = c2;
      b = v;
    } else if (i == 4) {
      r = c3;
      g = c1;
      b = v;
    } else {
      r = v;
      g = c1;
      b = c2;
    }
  }
  return {
    r: r * 255,
    g: g * 255,
    b: b * 255
  };
}

export function hsvToHsl({ h, s, v }: HSVColor): HSLColor {
  (s /= 100), (v /= 100);

  const l = v - (v * s) / 2;
  let s2;
  if (l === 0 || l === 1) {
    s2 = 0;
  } else {
    s2 = (v - l) / Math.min(l, 1 - l);
  }
  return {
    h,
    s: s2 * 100,
    l: l * 100
  };
}

export function hslToHsv({ h, s, l }: HSLColor): HSVColor {
  (s /= 100), (l /= 100);

  const v = l + s * Math.min(l, 1 - l);
  let s2;
  if (v === 0) {
    s2 = 0;
  } else {
    s2 = 2 - (2 * l) / v;
  }
  return {
    h,
    s: s2 * 100,
    v: v * 100
  };
}

export function hslToRgb({ h, s, l }: HSLColor): RGBColor {
  (h /= 360), (s /= 100), (l /= 100);

  let r = 0, g = 0, b = 0;

  if (s == 0) {
    // grayscale
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: r * 255,
    g: g * 255,
    b: b * 255
  };
}

export function rgbToHsl({ r, g, b }: RGBColor): HSLColor {
  (r /= 255), (g /= 255), (b /= 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0, s = 0, l = 0;

  l = (max + min) / 2;

  if (max == min) {
    // grayscale
    h = s = 0;
  } else {
    const d = max - min;
    s = l < 0.5 ? d / (max + min) : d / (2 - max - min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  };
}

export function hsvToHwb({ h, s, v }: HSVColor): HWBColor {
  (s /= 100), (v /= 100);
  const w = (1 - s) * v;
  const b = 1 - v;
  return {
    h,
    w: w * 100,
    b: b * 100
  };
}

export function hwbToHsv({ h, w, b }: HWBColor): HSVColor {
  (w /= 100), (b /= 100);
  const wbSum = w + b;
  if (wbSum > 1) {
    w /= wbSum;
    b /= wbSum;
  }
  const v = 1 - b;
  const s = v === 0 ? 0 : 1 - w / v;
  if ([h, s, v].some(v => isNaN(v))) {
    console.log([h, w, b]);
  }
  return {
    h,
    s: s * 100,
    v: v * 100
  };
}

export function rgbToXyz({ r, g, b }: RGBColor): XYZColor {
  //X, Y and Z output refers to a D65/2° standard illuminant.

  (r /= 255), (g /= 255), (b /= 255);

  if (r > 0.04045) {
    r = ((r + 0.055) / 1.055) ** 2.4;
  } else {
    r = r / 12.92;
  }
  if (g > 0.04045) {
    g = ((g + 0.055) / 1.055) ** 2.4;
  } else {
    g = g / 12.92;
  }
  if (b > 0.04045) {
    b = ((b + 0.055) / 1.055) ** 2.4;
  } else {
    b = b / 12.92;
  }

  r = r * 100;
  g = g * 100;
  b = b * 100;

  return {
    x: r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
    y: r * 0.2126729 + g * 0.7151522 + b * 0.072175,
    z: r * 0.0193339 + g * 0.119192 + b * 0.9503041,
  };
}

export function xyzToRgb({ x, y, z }: XYZColor): RGBColor {
  //X, Y and Z input refer to a D65/2° standard illuminant.
  //sR, sG and sB (standard RGB) output range = 0 ÷ 255

  (x /= 100), (y /= 100), (z /= 100);

  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let b = x * 0.0557 + y * -0.204 + z * 1.057;

  if (r > 0.0031308) {
    r = 1.055 * r ** (1 / 2.4) - 0.055;
  } else {
    r = 12.92 * r;
  }
  if (g > 0.0031308) {
    g = 1.055 * g ** (1 / 2.4) - 0.055;
  } else {
    g = 12.92 * g;
  }
  if (b > 0.0031308) {
    b = 1.055 * b ** (1 / 2.4) - 0.055;
  } else {
    b = 12.92 * b;
  }

  return {
    r: r * 255,
    g: g * 255,
    b: b * 255
  };
}

export function labToXyz({ l, a, b }: LABColor): XYZColor {
  let y = (l + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;

  if (y ** 3 > 0.008856) {
    y = y ** 3;
  } else {
    y = (y - 16 / 116) / 7.787;
  }
  if (x ** 3 > 0.008856) {
    x = x ** 3;
  } else {
    x = (x - 16 / 116) / 7.787;
  }
  if (z ** 3 > 0.008856) {
    z = z ** 3;
  } else {
    z = (z - 16 / 116) / 7.787;
  }

  const [refX, refY, refZ] = defaultIlluminant;
  return {
    x: x * refX,
    y: y * refY,
    z: z * refZ
  };
}

export function xyzToLab({ x, y, z }: XYZColor): LABColor {
  const [refX, refY, refZ] = defaultIlluminant;

  x /= refX;
  y /= refY;
  z /= refZ;

  if (x > 0.008856) {
    x = x ** (1 / 3);
  } else {
    x = 7.787 * x + 16 / 116;
  }
  if (y > 0.008856) {
    y = y ** (1 / 3);
  } else {
    y = 7.787 * y + 16 / 116;
  }
  if (z > 0.008856) {
    z = z ** (1 / 3);
  } else {
    z = 7.787 * z + 16 / 116;
  }

  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z)
  };
}

export function labToLch({ l, a, b }: LABColor): LCHColor {
  const c = Math.sqrt(a ** 2 + b ** 2);
  let h = Math.atan2(b, a);

  if (h > 0) h = (h / Math.PI) * 180;
  else h = 360 - (Math.abs(h) / Math.PI) * 180;

  return { l, c, h };
}

export function lchToLab({ l, c, h }: LCHColor): LABColor {
  const hr = (h * Math.PI) / 180;
  const a = Math.cos(hr) * c;
  const b = Math.sin(hr) * c;
  return { l, a, b };
}

export const rgbToLab = composeConverters(xyzToLab, rgbToXyz);
export const rgbToLch = composeConverters(labToLch, rgbToLab);
export const rgbToHwb = composeConverters(hsvToHwb, rgbToHsv);

export const hslToXyz = composeConverters(rgbToXyz, hslToRgb);
export const hslToLab = composeConverters(xyzToLab, hslToXyz);
export const hslToLch = composeConverters(labToLch, hslToLab);
export const hslToHwb = composeConverters(hsvToHwb, hslToHsv);

export const hsvToXyz = composeConverters(rgbToXyz, hsvToRgb);
export const hsvToLab = composeConverters(xyzToLab, hsvToXyz);
export const hsvToLch = composeConverters(labToLch, hsvToLab);

export const hwbToRgb = composeConverters(hsvToRgb, hwbToHsv);
export const hwbToHsl = composeConverters(hsvToHsl, hwbToHsv);
export const hwbToXyz = composeConverters(rgbToXyz, hwbToRgb);
export const hwbToLab = composeConverters(xyzToLab, hwbToXyz);
export const hwbToLch = composeConverters(labToLch, hwbToLab);

export const xyzToHsl = composeConverters(rgbToHsl, clampRgb, xyzToRgb);
export const xyzToHsv = composeConverters(rgbToHsv, clampRgb, xyzToRgb);
export const xyzToHwb = composeConverters(hsvToHwb, xyzToHsv);
export const xyzToLch = composeConverters(labToLch, xyzToLab);

export const labToRgb = composeConverters(xyzToRgb, labToXyz);
export const labToHsl = composeConverters(rgbToHsl, clampRgb, labToRgb);
export const labToHsv = composeConverters(rgbToHsv, clampRgb, labToRgb);
export const labToHwb = composeConverters(hsvToHwb, labToHsv);

export const lchToRgb = composeConverters(labToRgb, lchToLab);
export const lchToXyz = composeConverters(labToXyz, lchToLab);
export const lchToHsl = composeConverters(rgbToHsl, clampRgb, lchToRgb);
export const lchToHsv = composeConverters(rgbToHsv, clampRgb, lchToRgb);
export const lchToHwb = composeConverters(hsvToHwb, lchToHsv);

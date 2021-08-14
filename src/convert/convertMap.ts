import * as converters from './converters.js';
import type { ColorSpace, ColorSpaceType, ColorObject } from '../shared/types.js';


type ConvertMap = {
  [SourceSpace in ColorSpace]: {
    [TargetSpace in ColorSpace]: (color: ColorSpaceType<SourceSpace>) => ColorSpaceType<TargetSpace>;
  }
}

function identityConverter<C extends ColorObject>(color: C): C {
  return color;
}

export const convertMap: ConvertMap = {
  rgb: {
    rgb: identityConverter,
    hsl: converters.rgbToHsl,
    hsv: converters.rgbToHsv,
    hwb: converters.rgbToHwb,
    xyz: converters.rgbToXyz,
    lab: converters.rgbToLab,
    lch: converters.rgbToLch,
  },
  hsl: {
    rgb: converters.hslToRgb,
    hsl: identityConverter,
    hsv: converters.hslToHsv,
    hwb: converters.hslToHwb,
    xyz: converters.hslToXyz,
    lab: converters.hslToLab,
    lch: converters.hslToLch,
  },
  hsv: {
    rgb: converters.hsvToRgb,
    hsl: converters.hsvToHsl,
    hsv: identityConverter,
    hwb: converters.hsvToHwb,
    xyz: converters.hsvToXyz,
    lab: converters.hsvToLab,
    lch: converters.hsvToLch,
  },
  hwb: {
    rgb: converters.hwbToRgb,
    hsl: converters.hwbToHsl,
    hsv: converters.hwbToHsv,
    hwb: identityConverter,
    xyz: converters.hwbToXyz,
    lab: converters.hwbToLab,
    lch: converters.hwbToLch,
  },
  xyz: {
    rgb: converters.xyzToRgb,
    hsl: converters.xyzToHsl,
    hsv: converters.xyzToHsv,
    hwb: converters.xyzToHwb,
    xyz: identityConverter,
    lab: converters.xyzToLab,
    lch: converters.xyzToLch,
  },
  lab: {
    rgb: converters.labToRgb,
    hsl: converters.labToHsl,
    hsv: converters.labToHsv,
    hwb: converters.labToHwb,
    xyz: converters.labToXyz,
    lab: identityConverter,
    lch: converters.labToLch,
  },
  lch: {
    rgb: converters.lchToRgb,
    hsl: converters.lchToHsl,
    hsv: converters.lchToHsv,
    hwb: converters.lchToHwb,
    xyz: converters.lchToXyz,
    lab: converters.lchToLab,
    lch: identityConverter,
  },
} as const;
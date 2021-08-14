export interface ColorObjects {
  rgb: RGBColor,
  hsl: HSLColor,
  hsv: HSVColor,
  hwb: HWBColor,
  xyz: XYZColor,
  lab: LABColor,
  lch: LCHColor
}

export const AngleNotations = ['deg', 'grad', 'rad', 'turn'] as const;
export type AngleNotation = typeof AngleNotations[number];



export type ColorSpace = keyof ColorObjects;
export type ColorObject = ColorObjects[ColorSpace];
export type ColorObjectWithOptionalAlpha = ColorObject & Partial<AlphaMixin>;
export type ColorObjectWithAlpha = ColorObject & AlphaMixin;
export type ColorComponents = [number, number, number];
export type ColorComponentsWithAlpha = [number, number, number, number];

export type ColorAlpha = number;

export type ColorDefinition = [ColorSpace, ColorComponents, ColorAlpha];

export type ColorComponentsWithOrWithoutAlpha<With extends boolean> = With extends true ? ColorComponentsWithAlpha : ColorComponents;

interface AlphaMixin {
  alpha: ColorAlpha
}


export type ColorSpaceType<S extends ColorSpace> = ColorObjects[S];
export type ColorSpaceTypeWithAlpha<S extends ColorSpace> = ColorObjects[S] & AlphaMixin;

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface HSVColor {
  h: number;
  s: number;
  v: number;
}

export interface HWBColor {
  h: number;
  w: number;
  b: number;
}

export interface XYZColor {
  x: number;
  y: number;
  z: number;
}

export interface LABColor {
  l: number;
  a: number;
  b: number;
}

export interface LCHColor {
  l: number;
  c: number;
  h: number;
}

export type ComponentOfType<ColorType extends ColorObject> = keyof ColorType;
export type ComponentOfSpace<TargetSpace extends ColorSpace> = keyof ColorObjects[TargetSpace];

export type DeltaE2000Weights = [LuminanceWeight: number, ChromaWeight: number, HueWeight: number];

export type ColorDeltas = [number, number, number]
export type ColorMutation = [ColorSpace, ...ColorDeltas];
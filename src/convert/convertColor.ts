
import type { ColorSpace, ColorSpaceType, ColorObject } from '../shared/types.js';
import { getColorObjectSpace, isColorSpace } from '../shared/helpers.js';
import { ColorError } from '../shared/ColorError.js';
import { convertMap } from './convertMap.js';

export function convertColor<TargetSpace extends ColorSpace>(sourceColorObject: ColorObject, targetSpace: TargetSpace): ColorSpaceType<TargetSpace> {
  if (!isColorSpace(targetSpace)) {
    throw ColorError.InvalidColorSpace(targetSpace);
  }
  // this call will throw if the color object is not valid
  const sourceSpace = getColorObjectSpace(sourceColorObject);
  const converter = convertMap[sourceSpace][targetSpace] as any;
  return converter(sourceColorObject) as ColorSpaceType<TargetSpace>;
}



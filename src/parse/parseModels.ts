import { buildCssColorPatterns, isPercentage, parseHue, parseAlpha } from './helpers.js';
import type { ColorSpace, ColorComponents, ColorAlpha } from '../shared/types.js';

interface ColorModel {
  space: ColorSpace;
  patterns: RegExp[];
  transform: (...params: string[]) => [ColorComponents, ColorAlpha]
}

export const parseModels: ColorModel[] = [
  {
    space: 'rgb',
    patterns: [
      new RegExp(`^#?(${[3, 6, 4, 8].map((length) => `[0-9a-f]{${length}}`).join('|')})$`)
    ],
    transform: (hex: string) => {
      const values = [3, 4].includes(hex.length)
        ? hex.split('').map((value) => value.repeat(2))
        : hex.match(/.{2}/g) as string[];
      const [r, g, b, a] = (values.length === 4 ? values : [...values, 'ff'])
        .map((value) => parseInt(value, 16));
      return [[r, g, b], a / 255];
    }
  },
  {
    space: 'rgb',
    patterns: [
      ...buildCssColorPatterns('rgb', ['number', 'number', 'number']),
      ...buildCssColorPatterns('rgb', ['percentage', 'percentage', 'percentage'])
    ],
    transform: (rawR: string, rawG: string, rawB: string, rawAlpha = '1') => {
      const [r, g, b] = [rawR, rawG, rawB].map(param => {
        const value = parseFloat(param);
        if (isPercentage(param)) {
          return (value/100) * 255;
        } else {
          return value;
        }
      })
      const alpha = parseAlpha(rawAlpha);
      return [[r, g, b], alpha];
    }
  },
  ...['hsl', 'hsv', 'hwb'].map(name => {
    const space = name as ColorSpace;
    return {
      space,
      patterns: buildCssColorPatterns(space, ['hue', 'percentage', 'percentage']),
      transform: (rawH: string, rawP2: string, rawP3: string, rawAlpha = '1') => {
        const h = parseHue(rawH);
        const [p2, p3] = [rawP2, rawP3].map(parseFloat);
        const alpha = parseAlpha(rawAlpha);
        return [[h, p2, p3], alpha] as [ColorComponents, ColorAlpha]
      }
    }
  }),
  {
    space: 'lab',
    patterns: buildCssColorPatterns('lab', ['percentage', 'number', 'number'], false),
    transform: (rawL: string, rawA: string, rawB: string, rawAlpha = '1') => {
      const [l, a, b] = [rawL, rawA, rawB].map(parseFloat);
      const alpha = parseAlpha(rawAlpha);
      return [[l, a, b], alpha];
    }
  },
  {
    space: 'lch',
    patterns: buildCssColorPatterns('lch', ['percentage', 'number', 'hue'], false),
    transform: (rawL: string, rawC: string, rawH: string, rawAlpha = '1') => {
      const [l, c] = [rawL, rawC].map(parseFloat);
      const h = parseHue(rawH);
      const alpha = parseAlpha(rawAlpha);
      return [[l, c, h], alpha];
    }
  },
  {
    space: 'xyz',
    patterns: buildCssColorPatterns('xyz', ['number', 'number', 'number'], false),
    transform: (rawX: string, rawY: string, rawZ: string, rawAlpha = '1') => {
      const [x, y, z] = [rawX, rawY, rawZ].map(parseFloat);
      const alpha = parseAlpha(rawAlpha);
      return [[x, y, z], alpha];
    }
  }
];
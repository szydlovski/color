import { AngleNotations } from '../shared/types.js';
import type { ColorSpace, AngleNotation } from '../shared/types.js';

const anglePattern = AngleNotations.map(n => `(?:${n})`).join('|')

const patternSegments = {
  number: '(\\d+(?:\\.\\d+)?)',
  percentage: '(\\d+(?:\\.\\d+)?%)',
  hue: `(\\d+(?:\\.\\d+)?(?:${anglePattern})?)`,
  alpha: '(\\d+(?:\\.\\d+)?%?)'
} as const;

type ColorParam = keyof typeof patternSegments;
type ColorParamTuple = [ColorParam, ColorParam, ColorParam];

export function getAngleNotation(angleString: string): AngleNotation | undefined {
  const match = angleString.match(new RegExp(`(${anglePattern})`));
  if (match === null) {
    return undefined;
  } else {
    return match[0] as AngleNotation;
  }
}

export function isPercentage(param: string): boolean {
  return /%$/.test(param);
}

export function parseHue(rawHue: string): number {
  const value = parseFloat(rawHue);
  const angleNotation = getAngleNotation(rawHue);
  if (angleNotation !== undefined) {
    switch(angleNotation) {
      case 'deg': return value;
      case 'grad': return value * 0.9;
      case 'rad': return value * (180/Math.PI);
      case 'turn': return value * 360;
    }
  } else {
    return value;
  }
}

export function parseAlpha(rawAlpha: string): number {
  const value = parseFloat(rawAlpha);
  return isPercentage(rawAlpha) ? value / 100 : value;
}

export function buildCssColorPatterns(space: ColorSpace, params: ColorParamTuple, alphaAlias = true) {
  const p1 = patternSegments[params[0]];
  const p2 = patternSegments[params[1]];
  const p3 = patternSegments[params[2]];
  const alpha = patternSegments.alpha;
  const spacePattern = alphaAlias ? `${space}a?` : space;
  return [
    `${p1} +${p2} +${p3}(?: *\\/ *${alpha})?`,
    `${p1} *, *${p2} *, *${p3}(?: *, *${alpha})?`,
  ].map(parenthesesContent => new RegExp(`^${spacePattern}\\( *${parenthesesContent} *\\)$`));
}



import type {ColorDefinition} from '../shared/types.js';
import { parseModels } from './parseModels.js';
import ColorNames from '../shared/colorNames.js';


export function parseColor(colorString: string): ColorDefinition {
  if (typeof colorString !== 'string') {
		throw new TypeError(
			`${Object.prototype.toString.call(colorString)} is not a string`
		);
	}

  const normalizedColorString = colorString.toLowerCase().trim();

  const namedColorHex = ColorNames[normalizedColorString];
  if (namedColorHex !== undefined) {
    return parseColor(namedColorHex);
  }

  for (const model of parseModels) {
    for (const pattern of model.patterns) {
      const match = normalizedColorString.match(pattern);
      if (match !== null) {
        const { space: colorSpace } = model;
        const [colorComponents, colorAlpha] = model.transform(...match.slice(1, match.length));
        return [colorSpace, colorComponents, colorAlpha];
      }
    }
  }
  throw new Error(`Could not parse color string "${colorString}"`)
}

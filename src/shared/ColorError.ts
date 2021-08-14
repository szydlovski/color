import { ColorSpaceDefinitions, ColorSpaces } from './colorSpaceDefinitions.js';
import { prettyJoin, multiple } from './utility.js';

const validSetsOfKeys = Object.values(ColorSpaceDefinitions).map(({params}) => params.map(({name}) => name)).map(keys => keys.join(', ')).join('\n')

export class ColorError extends Error {
  public readonly name = 'ColorError';
  private constructor(message: string) {
    super(message);
  }
  public static InvalidColorSpace(colorSpace: string) {
    return new ColorError(`Invalid color space "${colorSpace}". Supported color spaces include ${prettyJoin(ColorSpaces, ', ', ' and ')}.`)
  }
  public static InvalidColorObject(colorObject: any) {
    const colorObjectProps = Object.entries(colorObject);
    const totalProps = colorObjectProps.length;
    let displayedProps, trimmedProps = 0;
    if (totalProps > 5) {
      displayedProps = colorObjectProps.slice(0, 5);
      trimmedProps = totalProps - 5;
    } else {
      displayedProps = colorObjectProps;
    }
    const propNouns: [string, string] = ['property', 'properties'];
    const propsList = displayedProps.map(([key, prop]) => `${key}<${typeof prop}>`).join(', ');
    const propsString = propsList + (trimmedProps !== 0 ? ` (${trimmedProps} ${multiple(propNouns, trimmedProps)} omitted)` : '');
    return new ColorError(`Invalid color object. Provided object contains the following ${totalProps} ${multiple(propNouns, totalProps)}: ${propsString}. A valid color object must contain one of the following sets of numeric properties: \n${validSetsOfKeys}`);
  }
  public static InvalidComponentSignature(signature: string) {
    return new ColorError(`Invalid color component signature: ${signature}`);
  }
  public static InvalidColorSpaceComponent(colorSpace: string, component: string) {
    return new ColorError(`Invalid color component, "${component}" is not a component of "${colorSpace}"`);
  }
  public static UnableToParse(colorString: string) {
    return new ColorError(`Invalid color string "${colorString}"`);
  }
  public static NoOverloadMatch(args: any[]) {
    return new ColorError(`Color could not be constructed from the provided arguments (${args.map(arg => typeof arg).join(', ')})`)
  }
  public static InvalidColorComponents(colorComponents: any[]) {
    return new ColorError(`Invalid color components: ${colorComponents.map(c => typeof c).join(', ')} (${colorComponents.length}). Color components may only contain either 3 or 4 numbers.`)
  }
}
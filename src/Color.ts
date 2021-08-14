import { ColorSpaceDefinitions } from './shared/colorSpaceDefinitions.js';
import { ColorError } from './shared/ColorError.js';
import { parseColor } from './parse/parseColor.js';
import { convertColor } from './convert/convertColor.js';

import {
	isColorSpace,
	isColorComponents,
	isColorComponentsWithAlpha,
	buildColorObject,
	colorObjectToColorDefinition,
	numberToColorDefinition,
	rgbToHex,
} from './shared/helpers.js';
import type {
	ColorObjectWithOptionalAlpha,
	ColorSpace,
	ColorSpaceType,
	ColorComponents,
	ColorComponentsWithAlpha,
	ColorAlpha,
	ColorDefinition,
	ComponentOfSpace,
	ColorComponentsWithOrWithoutAlpha,
	ColorMutation,
} from './shared/types.js';
import { deltaE2000 } from './Internal/deltae2000.js';
import { roundTo } from './shared/utility.js';

type ColorStringFormat = 'hex' | ColorSpace;

type ColorStringOptions = {
	format: ColorStringFormat;
	alpha: boolean;
	serialized: boolean;
	precision: number;
};

export class Color {
	readonly #components: ColorComponents;
	readonly #alpha: ColorAlpha;
	readonly #space: ColorSpace;
	get alpha(): ColorAlpha {
		return this.#alpha;
	}
	private get components(): ColorComponents {
		return [...this.#components];
	}
	private get space() {
		return this.#space;
	}
	private constructor([space, components, alpha]: ColorDefinition) {
		this.#components = [...components];
		this.#alpha = alpha;
		this.#space = space;
	}

	public clone(): Color {
		return new Color([this.space, this.components, this.alpha]);
	}

	public toObject<S extends ColorSpace>(
		targetSpace: S = 'rgb' as S
	): ColorSpaceType<S> {
		const colorObject = buildColorObject<ColorSpaceType<S>>(
			this.space,
			this.components
		);
		return convertColor(colorObject, targetSpace);
	}

	public toString(opts: Partial<ColorStringOptions> | ColorStringFormat = {}) {
		const appendOptions = typeof opts === 'string' ? { format: opts } : opts;
		const options: Partial<ColorStringOptions> = Object.assign(
			{
				format: 'hex',
				alpha: this.alpha !== 1,
				serialized: true,
			},
			appendOptions
		);

		if (options.format === 'hex') {
			const [r, g, b, a] = this.getComponents('rgb', options.alpha);
			return rgbToHex(r, g, b, a);
		} else {
			const colorSpace = options.format!;
			const components = this.getComponents(colorSpace);
			const componentStrings: string[] = [];
			for (const [index, param] of ColorSpaceDefinitions[
				colorSpace
			].params.entries()) {
				let componentValue = components[index];
				if (options.precision !== undefined) {
					componentValue = roundTo(componentValue, options.precision);
				}
				let componentString = componentValue.toString();
				if (param.suffix !== undefined) {
					componentString += param.suffix;
				}
				componentStrings.push(componentString);
			}
			const separator = options.serialized ? ',' : ' ';
			const alphaString = options.alpha
				? (options.serialized ? ',' : ' / ') + this.alpha
				: '';
			return `${colorSpace}(${componentStrings.join(separator)}${alphaString})`;
		}
	}

	public getComponents<S extends ColorSpace, A extends boolean = false>(
		targetSpace: S = 'rgb' as S,
		includeAlpha: A = false as A
	): ColorComponentsWithOrWithoutAlpha<A> {
		const spaceDefinition = ColorSpaceDefinitions[targetSpace];
		const colorObject = this.toObject<S>(targetSpace);
		const components: number[] = spaceDefinition.params.map(
			(param) => (colorObject as any)[param.name] as number
		);
		if (includeAlpha) {
			components.push(this.alpha);
		}
		return components as ColorComponentsWithOrWithoutAlpha<A>;
	}

	public getComponent<S extends ColorSpace>(
		targetSpace: S,
		component: ComponentOfSpace<S>
	) {
		return this.toObject(targetSpace)[component] as unknown as number;
	}

	public setComponent<S extends ColorSpace>(
		targetSpace: S,
		component: ComponentOfSpace<S>,
		value: number
	) {
		const colorObject = this.toObject(targetSpace) as any;
		colorObject[component] = value;
		return Color.from(colorObject);
	}

	public addToComponent<S extends ColorSpace>(
		targetSpace: S,
		component: ComponentOfSpace<S>,
		value: number
	) {
		return this.setComponent(
			targetSpace,
			component,
			this.getComponent(targetSpace, component) + value
		);
	}

	public setComponents<S extends ColorSpace>(
		targetSpace: S,
		components: ColorComponents
	) {
		return Color.from(components, targetSpace);
	}

	public addToComponents<S extends ColorSpace>(
		targetSpace: S,
		components: ColorComponents
	) {
		const newComponents = this.getComponents(targetSpace).map(
			(c, i) => c + components[i]
		) as ColorComponents;
		return Color.from(newComponents, targetSpace);
	}

	public getMutationTo(
		target: Color,
		colorSpace: ColorSpace = 'hsv'
	): ColorMutation {
		const thisComponents = this.getComponents(colorSpace);
		const targetComponents = target.getComponents(colorSpace);
		const [d1, d2, d3] = targetComponents.map((c, i) => c - thisComponents[i]);
		return [colorSpace, d1, d2, d3];
	}

	public getMutationFrom(
		source: Color,
		colorSpace: ColorSpace = 'hsv'
	): ColorMutation {
		return source.getMutationTo(this, colorSpace);
	}

	public applyMutation(mutation: ColorMutation) {
		const [space, ...deltas] = mutation;
		const components = this.getComponents(space).map(
			(c, i) => c + deltas[i]
		) as ColorComponents;
		return Color.from(components, space);
	}

	public difference(comparedColor: Color) {
		return Color.difference(this, comparedColor);
	}

	public distance(comparedColor: Color) {
		return Color.distance(this, comparedColor);
	}

	public pickClosest(
		palette: Color[],
		method: 'difference' | 'distance' = 'difference'
	) {
		const comparisonMethod = (
			method === 'difference' ? this.difference : this.distance
		).bind(this);
		let closestColor = palette[0];
		let smallestDifference = Infinity;
		for (const color of palette) {
			const difference = comparisonMethod(color);
			if (difference < smallestDifference) {
				closestColor = color;
				smallestDifference = difference;
			}
		}
		return closestColor;
	}

	public getContrastingTextColor(threshold = 180) {
		const [r, g, b] = this.getComponents('rgb');
		const value = r * 0.299 + g * 0.587 + b * 0.114;
		return Color.from(value > threshold ? 0 : 0xffffff);
	}

	// predefined mutations

	// public brighten()

	// static utilities

	public static difference(
		referenceColor: Color,
		comparedColor: Color
	): number {
		return deltaE2000(referenceColor, comparedColor);
	}

	public static distance(
		referenceColor: Color,
		comparedColor: Color,
		comparisonSpace: ColorSpace = 'rgb'
	): number {
		const [a1, b1, c1] = referenceColor.getComponents(comparisonSpace);
		const [a2, b2, c2] = comparedColor.getComponents(comparisonSpace);
		return Math.sqrt(
			Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2) + Math.pow(c2 - c1, 2)
		);
	}

	public static average(colors: Color[], space: ColorSpace = 'rgb'): Color {
		const components = colors.map((color) => [
			...color.getComponents(space),
			color.alpha,
		]);
		const averages = components
			.reduce(([a1, b1, c1, alpha1], [a2, b2, c2, alpha2]) => [
				a1 + a2,
				b1 + b2,
				c1 + c2,
				alpha1 + alpha2,
			])
			.map((value) => value / colors.length) as ColorComponents;
		return Color.from(averages, space);
	}

	// constructors and related utilities

	public static parse(colorString: string): Color {
		return Color.from(colorString);
	}
	public static from(
		component1: number,
		component2: number,
		component3: number,
		alpha: number,
		space: ColorSpace
	): Color;
	public static from(
		component1: number,
		component2: number,
		component3: number,
		space: ColorSpace
	): Color;
	public static from(
		component1: number,
		component2: number,
		component3: number,
		alpha: number
	): Color;
	public static from(
		component1: number,
		component2: number,
		component3: number
	): Color;
	public static from(
		colorComponents: ColorComponentsWithAlpha,
		space: ColorSpace
	): Color;
	public static from(
		colorComponents: ColorComponents,
		space: ColorSpace
	): Color;
	public static from(colorComponents: ColorComponentsWithAlpha): Color;
	public static from(colorComponents: ColorComponents): Color;
	public static from(colorInstance: Color): Color;
	public static from(colorString: string): Color;
	public static from(colorNumber: number): Color;
	public static from(colorObject: ColorObjectWithOptionalAlpha): Color;
	public static from(...args: unknown[]): Color {
		// 1 argument overloads
		if (args.length === 1) {
			const arg = args[0];

			// string - parse as css color string
			if (typeof arg === 'string') {
				return new Color(parseColor(arg));

				// number - parse as hex number
			} else if (typeof arg === 'number') {
				return new Color(numberToColorDefinition(arg));

				// tuple - color space defaults to rgb
			} else if (Array.isArray(arg)) {
				return Color.from(arg as ColorComponents, 'rgb');

				// color instance
			} else if (arg instanceof Color) {
				return arg.clone();

				// color object
			} else if (typeof arg === 'object' && arg !== null) {
				return new Color(colorObjectToColorDefinition(arg));
			}

			// 2 argument overloads
		} else if (args.length === 2) {
			const arg1 = args[0],
				arg2 = args[1];

			// tuple + color space
			if (Array.isArray(arg1) && typeof arg2 === 'string') {
				if (isColorSpace(arg2)) {
					const colorSpace = arg2;
					if (isColorComponents(arg1)) {
						const components = arg1;
						return new Color([colorSpace, components, 1]);
					} else if (isColorComponentsWithAlpha(arg1)) {
						const components = arg1.slice(0, 3) as ColorComponents;
						const alpha = arg1[3];
						return new Color([colorSpace, components, alpha]);
					} else {
						throw ColorError.InvalidColorComponents(arg1);
					}
				} else {
					throw ColorError.InvalidColorSpace(arg2);
				}
			}

			// 3 argument overloads
		} else if (args.length === 3) {
			// color components as rgb
			if (isColorComponents(args)) {
				return new Color(['rgb', args, 1]);
			}

			// 4 argument overloads
		} else if (args.length === 4) {
			// color components with alpha, as rgb
			if (isColorComponentsWithAlpha(args)) {
				const components = args.slice(0, 3) as ColorComponents;
				const alpha = args[3];
				return new Color(['rgb', components, alpha]);

				// color components as color space
			} else if (
				isColorComponents(args.slice(0, 3)) &&
				typeof args[3] === 'string'
			) {
				const colorComponents = args.slice(0, 3) as ColorComponents;
				const colorSpace = args[3];
				if (isColorSpace(colorSpace)) {
					return new Color([colorSpace, colorComponents, 1]);
				} else {
					throw ColorError.InvalidColorSpace(colorSpace);
				}
			}

			// 5 argument overload
		} else if (args.length === 5) {
			if (
				isColorComponentsWithAlpha(args.slice(0, 4)) &&
				typeof args[4] === 'string'
			) {
				const colorComponents = args.slice(0, 3) as ColorComponents;
				const colorAlpha = args[3] as ColorAlpha;
				const colorSpace = args[4];
				if (isColorSpace(colorSpace)) {
					return new Color([colorSpace, colorComponents, colorAlpha]);
				}
			}
		}

		// if no overloads matched, throw an error
		throw ColorError.NoOverloadMatch(args);
	}
}

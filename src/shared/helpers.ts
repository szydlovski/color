import { clamp, isNumber, loopValue } from './utility.js';
import { ColorSpaceDefinitions, ColorSpaces } from './colorSpaceDefinitions.js';
import type {
	ColorSpace,
	ColorComponents,
	ColorComponentsWithAlpha,
	ColorObjectWithOptionalAlpha,
	ColorDefinition,
	ComponentOfSpace,
	ColorObject,
} from './types.js';
import { ColorError } from './ColorError.js';

export function isColorComponents(
	components: any[]
): components is ColorComponents {
	return components.length === 3 && isNumber(...components);
}

export function isColorSpace(colorSpace: string): colorSpace is ColorSpace {
	return ColorSpaces.indexOf(colorSpace) !== -1;
}

export function isColorComponentsWithAlpha(
	components: any[]
): components is ColorComponentsWithAlpha {
	return components.length === 4 && isNumber(...components);
}

export function getColorObjectSpace(colorObject: any): ColorSpace {
	for (const { space, params } of Object.values(ColorSpaceDefinitions)) {
		let allComponentsPresent = true;
		for (const { name: componentName } of params) {
			if (typeof colorObject[componentName] !== 'number') {
				allComponentsPresent = false;
				break;
			}
		}
		if (allComponentsPresent) {
			return space;
		}
	}
	throw ColorError.InvalidColorObject(colorObject);
}

export function isComponentOfSpace<S extends ColorSpace>(
	space: S,
	component: any
): component is ComponentOfSpace<S> {
	return (
		ColorSpaceDefinitions[space].params.find(
			(param) => param.name === component
		) !== undefined
	);
}

export function buildColorObject<ColorType extends ColorObject>(
	colorSpace: ColorSpace,
	colorComponents: ColorComponents
): ColorType {
	const params = ColorSpaceDefinitions[colorSpace].params;
	const colorObject: any = {};
	for (const [index, { name, min, max, loop }] of params.entries()) {
		const rawValue = colorComponents[index];
		const value = loop
			? loopValue(rawValue, min, max)
			: clamp(rawValue, min, max);
		colorObject[name] = value;
	}
	return colorObject;
}

export function colorObjectToColorDefinition(
	colorObject: any
): ColorDefinition {
	const spaceDefinition =
		ColorSpaceDefinitions[getColorObjectSpace(colorObject)];
	const validColorObject = colorObject as ColorObjectWithOptionalAlpha;
	const colorSpace = spaceDefinition.space;
	const colorComponents = spaceDefinition.params.map(
		({ name }) => validColorObject[name as keyof typeof validColorObject]
	) as ColorComponents;
	const colorAlpha = colorObject.alpha !== undefined ? colorObject.alpha : 1;
	return [colorSpace, colorComponents, colorAlpha];
}

export function numberToRgbComponents(n: number): ColorComponents {
	const hexComponents = clamp(n, 0, 0xffffff)
		.toString(16)
		.padStart(6, '0')
		.match(/.{2}/g) as [string, string, string];
	return hexComponents.map((component) =>
		parseInt(component, 16)
	) as ColorComponents;
}

export function numberToColorDefinition(n: number): ColorDefinition {
	return ['rgb', numberToRgbComponents(n), 1];
}

export function rgbToHex(r: number, g: number, b: number, a?: number) {
	const params = a === undefined ? [r, g, b] : [r, g, b, a * 255];
	return (
		'#' +
		params
			.map((param) => clamp(Math.round(param), 0, 255))
			.map((param) => param.toString(16).padStart(2, '0'))
			.join('')
	);
}

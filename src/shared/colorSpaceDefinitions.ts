import type { ColorSpace } from './types.js';

type ColorParam = {
	name: string;
	min: number;
	max: number;
	loop?: boolean;
	suffix?: string;
};

type ColorSpaceDefinition = {
	space: ColorSpace;
	params: Readonly<
		| [ColorParam, ColorParam, ColorParam]
		| [ColorParam, ColorParam, ColorParam, ColorParam]
	>;
};

type ColorSpaceDefinitions = {
	[key in ColorSpace]: Readonly<ColorSpaceDefinition>;
};

export const ColorSpaceDefinitions: Readonly<ColorSpaceDefinitions> = {
	rgb: {
		space: 'rgb',
		params: [
			{
				name: 'r',
				min: 0,
				max: 255,
			},
			{
				name: 'g',
				min: 0,
				max: 255,
			},
			{
				name: 'b',
				min: 0,
				max: 255,
			},
		],
	},
	hsl: {
		space: 'hsl',
		params: [
			{
				name: 'h',
				min: 0,
				max: 360,
				loop: true,
				suffix: 'deg',
			},
			{
				name: 's',
				min: 0,
				max: 100,
				suffix: '%',
			},
			{
				name: 'l',
				min: 0,
				max: 100,
				suffix: '%',
			},
		],
	},
	hsv: {
		space: 'hsv',
		params: [
			{
				name: 'h',
				min: 0,
				max: 360,
				loop: true,
				suffix: 'deg',
			},
			{
				name: 's',
				min: 0,
				max: 100,
				suffix: '%',
			},
			{
				name: 'v',
				min: 0,
				max: 100,
				suffix: '%',
			},
		],
	},
	hwb: {
		space: 'hwb',
		params: [
			{
				name: 'h',
				min: 0,
				max: 360,
				loop: true,
				suffix: 'deg',
			},
			{
				name: 'w',
				min: 0,
				max: 100,
				suffix: '%',
			},
			{
				name: 'b',
				min: 0,
				max: 100,
				suffix: '%',
			},
		],
	},
	xyz: {
		space: 'xyz',
		params: [
			{
				name: 'x',
				min: -Infinity,
				max: Infinity,
			},
			{
				name: 'y',
				min: -Infinity,
				max: Infinity,
			},
			{
				name: 'z',
				min: -Infinity,
				max: Infinity,
			},
		],
	},
	lab: {
		space: 'lab',
		params: [
			{
				name: 'l',
				min: 0,
				max: Infinity,
				suffix: '%',
			},
			{
				name: 'a',
				min: -Infinity,
				max: Infinity,
			},
			{
				name: 'b',
				min: -Infinity,
				max: Infinity,
			},
		],
	},
	lch: {
		space: 'lch',
		params: [
			{
				name: 'l',
				min: 0,
				max: Infinity,
				suffix: '%',
			},
			{
				name: 'c',
				min: 0,
				max: Infinity,
			},
			{
				name: 'h',
				min: 0,
				max: 360,
				loop: true,
				suffix: 'deg',
			},
		],
	},
} as const;

export const ColorSpaces = Object.keys(ColorSpaceDefinitions);

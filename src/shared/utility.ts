type ArityOneFn = (arg: any) => any;
type PickLastInTuple<T extends any[]> = T extends [
	...rest: infer U,
	argn: infer L
]
	? L
	: never;
type FirstFnParameterType<T extends any[], F = PickLastInTuple<T>> = F extends (
	...args: any[]
) => any
	? Parameters<F>[any]
	: never;
type LastFnReturnType<T extends any[]> = ReturnType<T[0]>;

export const compose =
	<T extends ArityOneFn[]>(...fns: T) =>
	(p: FirstFnParameterType<T>): LastFnReturnType<T> =>
		fns.reduceRight((acc: any, cur: any) => cur(acc), p);

export const composeConverters =
	<T extends ArityOneFn[]>(...fns: T) =>
	(color: FirstFnParameterType<T>): LastFnReturnType<T> =>
		fns.reduceRight((acc: any, cur: any) => cur(acc), color);

export function clamp(value: number, min: number, max: number) {
	return value < min ? min : value > max ? max : value;
}

export function loopValue(value: number, min: number, max: number) {
	if (min >= max) {
		throw new RangeError('Minimum value must be smaller than maximum value');
	}
	const unit = max - min;
	while (value > max) value -= unit;
	while (value < min) value += unit;
	return value;
}

export function isNumber(...args: any[]): boolean {
	return args.every((el) => typeof el === 'number');
}

export function prettyJoin(
	values: any[],
	glue = ',',
	lastGlue = 'and'
): string {
	if (values.length < 3) {
		return values.join(lastGlue);
	} else {
		const last = values[values.length - 1];
		const rest = values.slice(0, values.length - 1);
		return [rest.join(glue), last].join(lastGlue);
	}
}

export function multiple(
	[single, multiple]: [string, string],
	count: number
): string {
	return count === 1 ? single : multiple;
}

export function roundTo(value: number, decimalPlaces: number): number {
	const factor = 10 ** decimalPlaces;
	return Math.round(value * factor) / factor;
}

export function uuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

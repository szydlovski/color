Simple but exhaustive, well typed, immutable color library. Handles parsing, converting, comparing and modifying colors.

# Usage

```
npm install @szydlovski/color
```

```js
import { Color } from `@szydlovski/color`;

// use Color.from to construct a new instance
const myColor = Color.from('#e74812');

// colors can be parsed from CSS color strings
Color.from('#e74812');
Color.from('rgb(231,72,18)');
Color.from('rgb(231 72 18)');
Color.from('rgb(231 72 18 / 100%)');

// or constructed from numbers, arrays, objects or individual color components
Color.from(0xe74812)
Color.from(15157266) // equivalent to 0xe74812 in hex notation
Color.from([231, 72, 18])
Color.from(231, 72, 18)
Color.from({ r: 231, g: 72, b: 18 })

// supports a number of color spaces, defaults to rgb
Color.from([320, 56, 91], 'hsv');
Color.from(14, 29, 281, 'lch');
Color.from({ h: 270, s: 80, l: 59 });

// generate CSS color strings
myColor.toString(); // #e74812
myColor.toString('rgb'); // rgb(231,72,18)
myColor.toString({
  format: 'hsl',
  serialized: false, 
  precision: 2,
  alpha: true
}); // hsl(15.21deg 85.54% 48.82% / 1)

// extract an object with the color's components as properties
myColor.toObject(); // { r: 231, g: 72, b: 18 };
myColor.toObject('hsv'); // { h: 15.2, s: 92.2, v: 90.5 };

// extract an array of the color's components
myColor.getComponents(); // [231, 72, 18]
myColor.getComponents('hsv'); // [15.2, 92.2, 90.5]

// extract single components
myColor.getComponent('rgb', 'r'); // 231
myColor.getComponent('hsv', 'h'); // 15.2

// multiple ways to modify colors
const newColor = myColor.setComponent('rgb', 'r', 52);
assert(newColor !== myColor, 'Color instances are immutable');
myColor.toString('rgb'); // rgb(231,72,18)
newColor.toString('rgb'); // rgb(52,72,18)
```

# API

## Color.from

Constructs a new `Color` instance from the provided arguments. Contains with multiple overloads:

```js
Color.from('#c3c3c3') // any valid CSS color string
Color.from(0xc3c3c3) // any number (will be clamped to 0 ÷ 0xffffff)
Color.from({r: 195, g: 195, b: 195}) // color object
Color.from(Color.from(0xc3c3c3)) // another Color instance (creates a copy)
Color.from([195, 195, 195]) // components array, as rgb by default
Color.from([195, 195, 195, 0.1]) // components array with alpha, as rgb by default

Color.from([195, 195, 195], 'rgb') // components array, with explicit color space
Color.from([195, 195, 195, 0.1], 'rgb') // components array, with alpha, with explicit color space

Color.from(195, 195, 195) // individual components, as rgb by default
Color.from(195, 195, 195, 0.1) // individual components with alpha, as rgb by default

Color.from(195, 195, 195, 'rgb') // individual components, with explicit color space
Color.from(195, 195, 195, 0.1, 'rgb') // individual components with alpha, with explicit color space
```

## Color.parse

Has the same effect as calling `Color.from` with a string, but will not accept other arguments.

## Color.average(colors: Color[][, space: ColorSpace = 'rgb']): `Color`

## Color.difference

# Instance API

## Color#clone()

Returns a copy of the instance.

## Color#toObject([colorSpace = 'rgb'])

## Color#toString([options])

Returns a CSS string representation of the color. Accepts the following options:
- format - `string` - `'hex'` or the name of a color space, e.g. `'hsv'` or `'rgb'`
- alpha - `boolean` - whether or not to include alpha in the string, defaults to true if the color has an alpha value other than `1`
- serialized - `boolean` - whether the returned string should be in the legacy serialized format (i.e. `hsl(90deg,50%,50%,0.1)`) or the new standard CSS format (i.e. `hsl(90deg 50% 50% / 0.1)`), defaults to `true`
- precision - `number` - number of decimal places to preserve in the color's components. If left undefined, no rounding will be performed.

A single string containing the format (e.g. `'hex'`, `'hsv'`, `'rgb'`) can also be passed in place of an options object, in which case the method will use default alpha setting, serialized string format and perform no rounding.

## Color#getComponents(colorSpace[, includeAlpha = false])

## Color#getComponent(colorSpace, component)

## Color#modifyComponent(colorSpace, component, value)

## Color#getMutationTo(target[, colorSpace = 'hsv'])
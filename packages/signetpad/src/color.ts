const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGB_COLOR = /^rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(?:,\s*[\d.]+\s*)?\)$/i;
const HSL_COLOR =
  /^hsla?\(\s*[\d.]+(?:deg|grad|rad|turn)?\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*(?:,\s*[\d.]+\s*)?\)$/i;

/**
 * Small closed set of common CSS named colors.
 * Prefer hex/rgb/hsl for full coverage without shipping the entire keyword list.
 */
const NAMED_COLORS = new Set([
  'black',
  'blue',
  'gray',
  'green',
  'grey',
  'orange',
  'purple',
  'red',
  'transparent',
  'white',
  'yellow',
]);

/**
 * Accepts plain CSS color values safe to place in SVG presentation attributes.
 * Rejects `url(...)`, quotes, markup, and other paint servers.
 * Returns the trimmed color string.
 */
export function assertCssColor(value: string, name: string): string {
  if (typeof value !== 'string') {
    throw new TypeError(`${name} must be a string`);
  }

  const color = value.trim();
  if (!color) {
    throw new TypeError(`${name} cannot be empty`);
  }

  if (HEX_COLOR.test(color) || RGB_COLOR.test(color) || HSL_COLOR.test(color)) {
    return color;
  }

  if (NAMED_COLORS.has(color.toLowerCase())) {
    return color.toLowerCase();
  }

  throw new TypeError(`${name} must be a plain CSS color`);
}

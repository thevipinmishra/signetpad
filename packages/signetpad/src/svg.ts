import type { SignatureData, SignatureStroke, SignatureSvgOptions } from './types.js';

function assertDimension(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative finite number`);
  }
}

function escapeAttribute(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    if (character === '&') return '&amp;';
    if (character === '<') return '&lt;';
    if (character === '>') return '&gt;';
    if (character === '"') return '&quot;';
    return '&apos;';
  });
}

function pointValue(value: number): string {
  if (!Number.isFinite(value)) throw new TypeError('Signature points must be finite numbers');
  return String(value);
}

function validateStrokeStyle(stroke: SignatureStroke): void {
  const { style } = stroke;

  if (typeof style.color !== 'string' || !style.color) {
    throw new TypeError('stroke.color cannot be empty');
  }
  assertDimension(style.width, 'stroke.width');
  if (!Number.isFinite(style.opacity)) {
    throw new TypeError('stroke.opacity must be a finite number');
  }
  if (style.opacity < 0 || style.opacity > 1) {
    throw new RangeError('stroke.opacity must be 0..1');
  }
  if (!['butt', 'round', 'square'].includes(style.cap)) {
    throw new RangeError(`Unsupported stroke cap: ${style.cap}`);
  }
  if (!['bevel', 'miter', 'round'].includes(style.join)) {
    throw new RangeError(`Unsupported stroke join: ${style.join}`);
  }
}

function strokeToSvg(stroke: SignatureStroke): string {
  const [firstPoint] = stroke.points;
  if (!firstPoint) return '';

  validateStrokeStyle(stroke);

  const color = escapeAttribute(stroke.style.color);
  const opacity = pointValue(stroke.style.opacity);
  const width = pointValue(stroke.style.width);

  if (stroke.points.length === 1) {
    return `<circle cx="${pointValue(firstPoint.x)}" cy="${pointValue(firstPoint.y)}" r="${pointValue(stroke.style.width / 2)}" fill="${color}" fill-opacity="${opacity}"/>`;
  }

  const path = stroke.points
    .map(
      (point, index) => `${index === 0 ? 'M' : 'L'} ${pointValue(point.x)} ${pointValue(point.y)}`,
    )
    .join(' ');

  return `<path d="${path}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="${stroke.style.cap}" stroke-linejoin="${stroke.style.join}" stroke-opacity="${opacity}"/>`;
}

/**
 * Serializes vector signature data to a standalone SVG image without depending on a DOM or canvas.
 */
export function toSvg(data: SignatureData, options: SignatureSvgOptions = {}): string {
  assertDimension(data.viewport.width, 'viewport.width');
  assertDimension(data.viewport.height, 'viewport.height');

  const width = options.width ?? data.viewport.width;
  const height = options.height ?? data.viewport.height;
  assertDimension(width, 'options.width');
  assertDimension(height, 'options.height');

  if (options.background !== undefined && typeof options.background !== 'string') {
    throw new TypeError('options.background must be a string');
  }

  const background = options.background
    ? `<rect width="100%" height="100%" fill="${escapeAttribute(options.background)}"/>`
    : '';
  const strokes = data.strokes.map(strokeToSvg).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${data.viewport.width} ${data.viewport.height}">${background}${strokes}</svg>`;
}

import { assertCssColor } from './color.js';
import { trimSignatureData } from './geometry.js';
import { averagePressure, needsSegmentedStroke, pointsToPathD, strokeWidthAt } from './paths.js';
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

  assertCssColor(style.color, 'stroke.color');
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

function strokeToSvg(
  stroke: SignatureStroke,
  pressureWidth: boolean,
  curveFitting: boolean,
): string {
  const [firstPoint] = stroke.points;
  if (!firstPoint) return '';

  validateStrokeStyle(stroke);

  const color = escapeAttribute(assertCssColor(stroke.style.color, 'stroke.color'));
  const opacity = pointValue(stroke.style.opacity);

  if (stroke.points.length === 1) {
    const radius = strokeWidthAt(stroke.style.width, firstPoint.pressure, pressureWidth) / 2;
    return `<circle cx="${pointValue(firstPoint.x)}" cy="${pointValue(firstPoint.y)}" r="${pointValue(radius)}" fill="${color}" fill-opacity="${opacity}"/>`;
  }

  if (needsSegmentedStroke(stroke, pressureWidth)) {
    const segments: string[] = [];
    for (let index = 1; index < stroke.points.length; index += 1) {
      const from = stroke.points[index - 1]!;
      const to = stroke.points[index]!;
      const width = strokeWidthAt(stroke.style.width, averagePressure(from, to), pressureWidth);
      segments.push(
        `<path d="M ${pointValue(from.x)} ${pointValue(from.y)} L ${pointValue(to.x)} ${pointValue(to.y)}" fill="none" stroke="${color}" stroke-width="${pointValue(width)}" stroke-linecap="${stroke.style.cap}" stroke-linejoin="${stroke.style.join}" stroke-opacity="${opacity}"/>`,
      );
    }
    return segments.join('');
  }

  const path = pointsToPathD(stroke.points, curveFitting);
  const width = pointValue(stroke.style.width);
  return `<path d="${path}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="${stroke.style.cap}" stroke-linejoin="${stroke.style.join}" stroke-opacity="${opacity}"/>`;
}

/**
 * Serializes vector signature data to a standalone SVG image without depending on a DOM or canvas.
 */
export function toSvg(data: SignatureData, options: SignatureSvgOptions = {}): string {
  assertDimension(data.viewport.width, 'viewport.width');
  assertDimension(data.viewport.height, 'viewport.height');

  const padding = options.padding ?? 0;
  if (!Number.isFinite(padding)) {
    throw new TypeError('options.padding must be a finite number');
  }
  if (padding < 0) {
    throw new RangeError('options.padding cannot be negative');
  }

  const pressureWidth = options.pressureWidth === true;
  const curveFitting = options.curveFitting === true;
  const source = options.trim ? trimSignatureData(data, { padding }) : data;

  const width = options.width ?? source.viewport.width;
  const height = options.height ?? source.viewport.height;
  assertDimension(width, 'options.width');
  assertDimension(height, 'options.height');

  if (options.background !== undefined) {
    assertCssColor(options.background, 'options.background');
  }

  const background = options.background
    ? `<rect width="100%" height="100%" fill="${escapeAttribute(options.background)}"/>`
    : '';
  const strokes = source.strokes
    .map((stroke) => strokeToSvg(stroke, pressureWidth, curveFitting))
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${source.viewport.width} ${source.viewport.height}">${background}${strokes}</svg>`;
}

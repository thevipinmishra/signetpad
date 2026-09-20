import type { SignatureStroke } from '../types.js';

/** Converts a stroke's centerline points into an SVG path. */
export function strokeToSvgPath(stroke: SignatureStroke): string {
  const [firstPoint] = stroke.points;
  if (!firstPoint) return '';

  return [
    `M ${firstPoint.x} ${firstPoint.y}`,
    ...stroke.points.slice(1).map((point) => `L ${point.x} ${point.y}`),
  ].join(' ');
}

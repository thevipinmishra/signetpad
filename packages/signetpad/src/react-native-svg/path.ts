import { pointsToPathD } from '../paths.js';
import type { SignatureStroke } from '../types.js';

/** Converts a stroke's centerline points into an SVG path. */
export function strokeToSvgPath(stroke: SignatureStroke, curveFitting = false): string {
  return pointsToPathD(stroke.points, curveFitting);
}

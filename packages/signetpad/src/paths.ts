import type { SignaturePoint, SignatureStroke } from './types.js';

function pointValue(value: number): string {
  if (!Number.isFinite(value)) throw new TypeError('Signature points must be finite numbers');
  return String(value);
}

/**
 * Converts a polyline to a cubic Bezier path using Catmull-Rom style control points.
 * Falls back to line segments when fewer than three points are present.
 */
export function pointsToPathD(
  points: ReadonlyArray<SignaturePoint>,
  curveFitting: boolean,
): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const [point] = points;
    return `M ${pointValue(point!.x)} ${pointValue(point!.y)}`;
  }
  if (!curveFitting || points.length === 2) {
    return points
      .map(
        (point, index) =>
          `${index === 0 ? 'M' : 'L'} ${pointValue(point.x)} ${pointValue(point.y)}`,
      )
      .join(' ');
  }

  let path = `M ${pointValue(points[0]!.x)} ${pointValue(points[0]!.y)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)]!;
    const p1 = points[index]!;
    const p2 = points[index + 1]!;
    const p3 = points[Math.min(points.length - 1, index + 2)]!;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${pointValue(c1x)} ${pointValue(c1y)}, ${pointValue(c2x)} ${pointValue(c2y)}, ${pointValue(p2.x)} ${pointValue(p2.y)}`;
  }
  return path;
}

export function strokeWidthAt(
  styleWidth: number,
  pressure: number | undefined,
  pressureWidth: boolean,
): number {
  if (!pressureWidth || pressure === undefined) return styleWidth;
  return Math.max(0.25, styleWidth * (0.35 + pressure * 0.65));
}

export function averagePressure(a: SignaturePoint, b: SignaturePoint): number | undefined {
  if (a.pressure === undefined && b.pressure === undefined) return undefined;
  return ((a.pressure ?? 0.5) + (b.pressure ?? 0.5)) / 2;
}

/** True when a stroke needs per-segment widths instead of one path. */
export function needsSegmentedStroke(stroke: SignatureStroke, pressureWidth: boolean): boolean {
  if (!pressureWidth || stroke.points.length < 2) return false;
  return stroke.points.some((point) => point.pressure !== undefined);
}

import type { Bounds, SignaturePoint, SignatureStroke } from './types.js';

export function distanceSquared(a: SignaturePoint, b: SignaturePoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function getBounds(strokes: ReadonlyArray<SignatureStroke>): Bounds | null {
  let bounds: Bounds | null = null;

  for (const stroke of strokes) {
    for (const point of stroke.points) {
      if (!bounds) {
        bounds = { minX: point.x, minY: point.y, maxX: point.x, maxY: point.y };
        continue;
      }

      bounds.minX = Math.min(bounds.minX, point.x);
      bounds.minY = Math.min(bounds.minY, point.y);
      bounds.maxX = Math.max(bounds.maxX, point.x);
      bounds.maxY = Math.max(bounds.maxY, point.y);
    }
  }

  return bounds;
}

export function cloneStroke(stroke: SignatureStroke): SignatureStroke {
  return {
    id: stroke.id,
    points: stroke.points.map((point) => ({ ...point })),
    style: { ...stroke.style },
  };
}

export function cloneStrokes(strokes: ReadonlyArray<SignatureStroke>): SignatureStroke[] {
  return strokes.map(cloneStroke);
}

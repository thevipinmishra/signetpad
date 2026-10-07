import type { Bounds, SignatureData, SignaturePoint, SignatureStroke } from './types.js';

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

/** Ink bounds expanded by half the thickest stroke width and optional padding. */
export function getInkBounds(strokes: ReadonlyArray<SignatureStroke>, padding = 0): Bounds | null {
  const bounds = getBounds(strokes);
  if (!bounds) return null;

  let halfWidth = 0;
  for (const stroke of strokes) {
    halfWidth = Math.max(halfWidth, stroke.style.width / 2);
  }

  const expand = halfWidth + padding;
  return {
    minX: bounds.minX - expand,
    minY: bounds.minY - expand,
    maxX: bounds.maxX + expand,
    maxY: bounds.maxY + expand,
  };
}

/**
 * Returns a cloned signature whose viewport matches ink bounds.
 * Empty signatures keep the original viewport.
 */
export function trimSignatureData(
  data: SignatureData,
  options: { padding?: number } = {},
): SignatureData {
  const padding = options.padding ?? 0;
  if (!Number.isFinite(padding)) {
    throw new TypeError('padding must be a finite number');
  }
  if (padding < 0) {
    throw new RangeError('padding cannot be negative');
  }

  const ink = getInkBounds(data.strokes, padding);
  if (!ink) {
    return {
      version: 1,
      viewport: { width: data.viewport.width, height: data.viewport.height },
      strokes: cloneStrokes(data.strokes),
    };
  }

  return {
    version: 1,
    viewport: {
      width: Math.max(ink.maxX - ink.minX, 0),
      height: Math.max(ink.maxY - ink.minY, 0),
    },
    strokes: data.strokes.map((stroke) => ({
      id: stroke.id,
      style: { ...stroke.style },
      points: stroke.points.map((point) => ({
        ...point,
        x: point.x - ink.minX,
        y: point.y - ink.minY,
      })),
    })),
  };
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

import { describe, expect, it } from 'vitest';
import { getInkBounds, trimSignatureData } from '../../src/geometry.js';
import type { SignatureData, SignatureStroke } from '../../src/types.js';

const style = {
  color: '#111827',
  width: 4,
  opacity: 1,
  cap: 'round' as const,
  join: 'round' as const,
};

function stroke(points: SignatureStroke['points']): SignatureStroke {
  return { id: 'stroke-1', points, style };
}

describe('geometry', () => {
  it('expands ink bounds by half stroke width and padding', () => {
    const bounds = getInkBounds(
      [
        stroke([
          { x: 10, y: 20, time: 0 },
          { x: 30, y: 20, time: 1 },
        ]),
      ],
      3,
    );

    expect(bounds).toEqual({ minX: 5, minY: 15, maxX: 35, maxY: 25 });
  });

  it('trims signature data to translated ink bounds', () => {
    const data: SignatureData = {
      version: 1,
      viewport: { width: 100, height: 80 },
      strokes: [
        stroke([
          { x: 20, y: 30, time: 0 },
          { x: 40, y: 30, time: 1 },
        ]),
      ],
    };

    const trimmed = trimSignatureData(data, { padding: 0 });
    expect(trimmed.viewport).toEqual({ width: 24, height: 4 });
    expect(trimmed.strokes[0]?.points).toEqual([
      { x: 2, y: 2, time: 0 },
      { x: 22, y: 2, time: 1 },
    ]);
  });

  it('keeps the original viewport when there is no ink', () => {
    const data: SignatureData = {
      version: 1,
      viewport: { width: 100, height: 80 },
      strokes: [],
    };

    expect(trimSignatureData(data).viewport).toEqual({ width: 100, height: 80 });
  });
});

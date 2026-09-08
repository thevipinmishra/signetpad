import { describe, expect, it } from 'vitest';
import { strokeToSvgPath } from '../src/path.js';
import type { SignatureStroke } from '@signetpad/core';

const style = {
  color: 'black',
  width: 2,
  opacity: 1,
  cap: 'round' as const,
  join: 'round' as const,
};

describe('strokeToSvgPath', () => {
  it('creates a move-and-line path from stroke points', () => {
    const stroke: SignatureStroke = {
      id: 'stroke-1',
      style,
      points: [
        { x: 1, y: 2, time: 0 },
        { x: 3, y: 4, time: 1 },
      ],
    };

    expect(strokeToSvgPath(stroke)).toBe('M 1 2 L 3 4');
  });

  it('returns an empty path for an empty stroke', () => {
    expect(strokeToSvgPath({ id: 'empty', style, points: [] })).toBe('');
  });
});

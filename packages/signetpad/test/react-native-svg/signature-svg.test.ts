import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { SignatureStroke } from '../../src/types.js';

vi.mock('react-native-svg', () => ({
  Circle: 'circle',
  Path: 'path',
  default: 'svg',
}));

const { SignatureSvg } = await import('../../src/react-native-svg/index.js');

const style = {
  color: '#102935',
  width: 4,
  opacity: 0.8,
  cap: 'round' as const,
  join: 'round' as const,
};

describe('SignatureSvg', () => {
  it('renders paths and dots from controlled core strokes', () => {
    const strokes: SignatureStroke[] = [
      {
        id: 'line',
        style,
        points: [
          { x: 1, y: 2, time: 0 },
          { x: 3, y: 4, time: 1 },
        ],
      },
      { id: 'dot', style, points: [{ x: 5, y: 6, time: 2 }] },
    ];

    const markup = renderToStaticMarkup(
      createElement(SignatureSvg, { strokes, viewport: { width: 120, height: 60 } }),
    );

    expect(markup).toContain('viewBox="0 0 120 60"');
    expect(markup).toContain('d="M 1 2 L 3 4"');
    expect(markup).toContain('cx="5"');
    expect(markup).toContain('r="2"');
  });
});

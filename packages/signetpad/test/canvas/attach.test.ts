import { describe, expect, it, vi } from 'vitest';
import { attachCanvasRenderer, createCanvasRenderer } from '../../src/canvas/index.js';
import { createSignaturePad } from '../../src/index.js';

function createCanvas() {
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(),
  };
  const calls: string[] = [];
  const context = {
    canvas,
    save: () => calls.push('save'),
    restore: () => calls.push('restore'),
    beginPath: () => calls.push('beginPath'),
    moveTo: () => calls.push('moveTo'),
    lineTo: () => calls.push('lineTo'),
    stroke: () => calls.push('stroke'),
    arc: () => calls.push('arc'),
    fill: () => calls.push('fill'),
    clearRect: () => calls.push('clearRect'),
    setTransform: () => calls.push('setTransform'),
  } as unknown as CanvasRenderingContext2D;
  canvas.getContext.mockReturnValue(context);
  return { canvas: canvas as unknown as HTMLCanvasElement, context, calls };
}

describe('attachCanvasRenderer', () => {
  it('keeps the canvas in sync as strokes are added', () => {
    const { canvas, calls } = createCanvas();
    const pad = createSignaturePad({
      viewport: { width: 100, height: 50 },
      behavior: { smoothing: 0, minDistance: 0 },
    });
    const attached = attachCanvasRenderer(canvas, pad, { dpr: 1 });

    expect(attached).toBeTruthy();
    pad.begin({ x: 10, y: 10, time: 1 });
    pad.move({ x: 40, y: 20, time: 2 });
    pad.end();

    expect(calls).toContain('lineTo');
    expect(calls).toContain('stroke');

    attached?.detach();
    calls.length = 0;
    pad.clear();
    expect(calls).toEqual([]);
  });

  it('returns null when a 2D context is unavailable', () => {
    const canvas = {
      getContext: vi.fn(() => null),
    } as unknown as HTMLCanvasElement;
    const pad = createSignaturePad();

    expect(attachCanvasRenderer(canvas, pad)).toBeNull();
  });
});

describe('createCanvasRenderer helpers', () => {
  it('is still exported beside attachCanvasRenderer', () => {
    expect(typeof createCanvasRenderer).toBe('function');
  });
});

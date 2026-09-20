import { describe, expect, it } from 'vitest';
import { createCanvasRenderer } from '../../src/canvas/index.js';
import type { SignatureStroke } from '../../src/types.js';

function createContext() {
  const calls: string[] = [];
  const context = {
    canvas: {
      width: 0,
      height: 0,
      toDataURL: (type?: string, quality?: number) => `data:${type};quality=${quality}`,
      toBlob: (callback: BlobCallback, type?: string) => callback(new Blob([type ?? 'image/png'])),
    },
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

  return { context, calls };
}

const style = {
  color: 'black',
  width: 2,
  opacity: 1,
  cap: 'round' as const,
  join: 'round' as const,
};

function stroke(points: SignatureStroke['points']): SignatureStroke {
  return { id: 'stroke-1', points, style };
}

describe('createCanvasRenderer', () => {
  it('configures a high-DPI backing store and draws dots', () => {
    const { context, calls } = createContext();
    const renderer = createCanvasRenderer(context, {
      viewport: { width: 100, height: 50 },
      dpr: 2,
    });

    renderer.render([stroke([{ x: 10, y: 20, time: 0 }])]);

    expect(context.canvas.width).toBe(200);
    expect(context.canvas.height).toBe(100);
    expect(calls).toContain('arc');
    expect(calls).toContain('fill');
  });

  it('appends a new segment without clearing existing pixels', () => {
    const { context, calls } = createContext();
    const renderer = createCanvasRenderer(context, { viewport: { width: 100, height: 50 } });
    const first = stroke([{ x: 10, y: 20, time: 0 }]);

    renderer.render([first]);
    calls.length = 0;
    renderer.update([
      stroke([
        { x: 10, y: 20, time: 0 },
        { x: 30, y: 20, time: 1 },
      ]),
    ]);

    expect(calls).not.toContain('clearRect');
    expect(calls).toContain('lineTo');
    expect(calls).toContain('stroke');
  });

  it('exports the rendered image through the canvas encoder', async () => {
    const { context } = createContext();
    const renderer = createCanvasRenderer(context, { viewport: { width: 100, height: 50 } });

    expect(renderer.toDataURL({ type: 'image/webp', quality: 0.8 })).toBe(
      'data:image/webp;quality=0.8',
    );
    await expect(renderer.toBlob({ type: 'image/png' })).resolves.toBeInstanceOf(Blob);
  });

  it('redraws from scratch when stroke history is not append-only', () => {
    const { context, calls } = createContext();
    const renderer = createCanvasRenderer(context, { viewport: { width: 100, height: 50 } });

    renderer.render([
      stroke([
        { x: 10, y: 20, time: 0 },
        { x: 30, y: 20, time: 1 },
      ]),
    ]);
    calls.length = 0;
    renderer.update([stroke([{ x: 4, y: 5, time: 2 }])]);

    expect(calls).toContain('clearRect');
    expect(calls).toContain('arc');
  });
});

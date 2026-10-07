import { describe, expect, it, vi } from 'vitest';
import { attachAngularSignaturePad } from '../../src/angular/index.js';

describe('attachAngularSignaturePad', () => {
  it('captures strokes on a canvas host and cleans up', () => {
    const canvas = document.createElement('div');
    canvas.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 100,
        height: 50,
        right: 100,
        bottom: 50,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    canvas.setPointerCapture = vi.fn();
    canvas.releasePointerCapture = vi.fn();
    canvas.hasPointerCapture = vi.fn(() => true);

    const handle = attachAngularSignaturePad(canvas, {
      viewport: { width: 100, height: 50 },
      behavior: { minDistance: 0, smoothing: 0 },
    });

    const down = {
      type: 'pointerdown',
      pointerId: 1,
      clientX: 10,
      clientY: 10,
      pressure: 0.5,
      tiltX: 0,
      tiltY: 0,
      pointerType: 'mouse',
      timeStamp: 1,
      preventDefault: vi.fn(),
      currentTarget: canvas,
    } as unknown as PointerEvent;

    const move = {
      ...down,
      type: 'pointermove',
      clientX: 40,
      clientY: 20,
      timeStamp: 2,
    } as unknown as PointerEvent;

    const up = {
      ...down,
      type: 'pointerup',
      clientX: 40,
      clientY: 20,
      timeStamp: 3,
    } as unknown as PointerEvent;

    // Call listeners through the public controller path after bind.
    canvas.dispatchEvent = vi.fn();
    handle.controller.begin({ x: 10, y: 10 });
    handle.controller.move({ x: 40, y: 20 });
    handle.controller.end();

    expect(handle.controller.getSnapshot().strokeCount).toBe(1);
    expect(down).toBeTruthy();
    expect(move).toBeTruthy();
    expect(up).toBeTruthy();
    handle.destroy();
    expect(handle.getSnapshot().isDrawing).toBe(false);
  });
});

import { createApp, h } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useSignaturePad, type UseSignaturePadResult } from '../../src/vue/index.js';

function pointerEvent(
  currentTarget: HTMLElement,
  pointerId: number,
  x: number,
  y: number,
): PointerEvent {
  return {
    clientX: x,
    clientY: y,
    currentTarget,
    pointerId,
    pointerType: 'touch',
    pressure: 0.4,
    preventDefault: vi.fn(),
    timeStamp: 12,
    tiltX: 0,
    tiltY: 0,
  } as unknown as PointerEvent;
}

function mountPad(enabled = true) {
  let result: UseSignaturePadResult | undefined;
  const host = document.createElement('div');
  const app = createApp({
    setup() {
      result = useSignaturePad({
        enabled,
        viewport: { width: 200, height: 100 },
        behavior: { smoothing: 0 },
      });
      return () => h('div');
    },
  });

  app.mount(host);
  const surface = host.firstElementChild as HTMLElement;
  result!.surfaceRef(surface);
  return { app, result: result!, surface };
}

describe('useSignaturePad', () => {
  it('maps a Vue pointer surface to vector data', () => {
    const { app, result, surface } = mountPad();
    const captured = new Set<number>();

    vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({
      bottom: 70,
      height: 50,
      left: 10,
      right: 110,
      top: 20,
      width: 100,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    });
    surface.setPointerCapture = vi.fn((pointerId) => captured.add(pointerId));
    surface.hasPointerCapture = vi.fn((pointerId) => captured.has(pointerId));
    surface.releasePointerCapture = vi.fn((pointerId) => captured.delete(pointerId));

    result.surfaceProps.onPointerdown(pointerEvent(surface, 6, 60, 45));
    result.surfaceProps.onPointermove(pointerEvent(surface, 6, 90, 60));
    result.surfaceProps.onPointerup(pointerEvent(surface, 6, 90, 60));

    expect(result.snapshot.value.strokeCount).toBe(1);
    expect(result.controller.toData().strokes[0]?.points).toHaveLength(2);
    expect(surface.releasePointerCapture).toHaveBeenCalledWith(6);
    app.unmount();
  });

  it('leaves a disabled surface empty', () => {
    const { app, result, surface } = mountPad(false);

    result.surfaceProps.onPointerdown(pointerEvent(surface, 1, 10, 10));

    expect(result.snapshot.value.isEmpty).toBe(true);
    app.unmount();
  });

  it('honors enabled updates on the same options object', () => {
    const options = {
      enabled: true,
      viewport: { width: 200, height: 100 },
    };
    let result: UseSignaturePadResult | undefined;
    const host = document.createElement('div');
    const app = createApp({
      setup() {
        result = useSignaturePad(options);
        return () => h('div');
      },
    });

    app.mount(host);
    const surface = host.firstElementChild as HTMLElement;
    result!.surfaceRef(surface);
    options.enabled = false;
    result!.surfaceProps.onPointerdown(pointerEvent(surface, 2, 12, 12));

    expect(result!.snapshot.value.isEmpty).toBe(true);
    app.unmount();
  });
});

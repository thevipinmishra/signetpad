import { describe, expect, it, vi } from 'vitest';
import { createSignaturePadAction } from '../../src/svelte/index.js';

function pointerEvent(type: string, pointerId: number, x: number, y: number): PointerEvent {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    clientX: { value: x },
    clientY: { value: y },
    pointerId: { value: pointerId },
    pointerType: { value: 'pen' },
    pressure: { value: 0.5 },
    tiltX: { value: 1 },
    tiltY: { value: 2 },
  });
  return event as PointerEvent;
}

describe('createSignaturePadAction', () => {
  it('captures DOM pointer events and stops after destroy', () => {
    const { action, controller } = createSignaturePadAction({
      viewport: { width: 200, height: 100 },
      behavior: { smoothing: 0 },
    });
    const surface = document.createElement('div');
    const captures = new Set<number>();

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
    surface.setPointerCapture = vi.fn((pointerId) => captures.add(pointerId));
    surface.hasPointerCapture = vi.fn((pointerId) => captures.has(pointerId));
    surface.releasePointerCapture = vi.fn((pointerId) => captures.delete(pointerId));

    const binding = action(surface);
    surface.dispatchEvent(pointerEvent('pointerdown', 9, 60, 45));
    surface.dispatchEvent(pointerEvent('pointermove', 9, 90, 60));
    surface.dispatchEvent(pointerEvent('pointerup', 9, 90, 60));

    expect(controller.toData().strokes[0]?.points).toHaveLength(2);
    expect(surface.releasePointerCapture).toHaveBeenCalledWith(9);

    binding.destroy();
    surface.dispatchEvent(pointerEvent('pointerdown', 10, 20, 20));
    expect(controller.getSnapshot().strokeCount).toBe(1);
  });

  it('applies enabled updates without rebuilding the controller', () => {
    const { action, controller } = createSignaturePadAction();
    const surface = document.createElement('div');
    surface.setPointerCapture = vi.fn();
    surface.hasPointerCapture = vi.fn(() => false);
    const binding = action(surface);

    binding.update?.({ enabled: false });
    binding.update?.({ stroke: { width: 4 } });
    surface.dispatchEvent(pointerEvent('pointerdown', 1, 10, 10));

    expect(controller.getSnapshot().isEmpty).toBe(true);
    binding.destroy();
  });

  it('updates the controller viewport from the action', () => {
    const { action, controller } = createSignaturePadAction({
      viewport: { width: 200, height: 100 },
    });
    const surface = document.createElement('div');
    const binding = action(surface);

    binding.update?.({ viewport: { width: 360, height: 140 } });

    expect(controller.getViewport()).toEqual({ width: 360, height: 140 });
    binding.destroy();
  });

  it('exposes a snapshot store that tracks undo state', () => {
    const { controller, snapshot } = createSignaturePadAction({
      viewport: { width: 200, height: 100 },
      behavior: { smoothing: 0, minDistance: 0, allowDots: true },
    });
    const values: boolean[] = [];
    const stop = snapshot.subscribe((next) => values.push(next.isEmpty));

    controller.begin({ x: 10, y: 10, time: 1 });
    controller.end();

    expect(values.at(0)).toBe(true);
    expect(values.at(-1)).toBe(false);
    stop();
  });
});

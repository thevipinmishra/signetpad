import { act, cleanup, render } from '@testing-library/react';
import { useEffect, type PointerEvent as ReactPointerEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSignaturePad, type UseSignaturePadResult } from '../../src/react/index.js';

interface HarnessProps {
  enabled?: boolean;
  onReady: (result: UseSignaturePadResult) => void;
}

function Harness({ enabled = true, onReady }: HarnessProps) {
  const result = useSignaturePad({
    enabled,
    viewport: { width: 200, height: 100 },
    behavior: { smoothing: 0 },
  });

  useEffect(() => onReady(result), [onReady, result]);
  return <div data-testid="surface" ref={result.surfaceRef} {...result.surfaceProps} />;
}

function pointerEvent(
  currentTarget: HTMLElement,
  pointerId: number,
  x: number,
  y: number,
): ReactPointerEvent<HTMLElement> {
  return {
    clientX: x,
    clientY: y,
    currentTarget,
    pointerId,
    pointerType: 'pen',
    pressure: 0.6,
    preventDefault: vi.fn(),
    timeStamp: 10,
    tiltX: 2,
    tiltY: 3,
  } as unknown as ReactPointerEvent<HTMLElement>;
}

describe('useSignaturePad', () => {
  afterEach(cleanup);

  it('maps pointer coordinates, captures the pointer, and completes a stroke', () => {
    let result: UseSignaturePadResult | undefined;
    const { getByTestId } = render(
      <Harness
        onReady={(next) => {
          result = next;
        }}
      />,
    );
    const surface = getByTestId('surface');
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

    act(() => {
      result!.surfaceProps.onPointerDown(pointerEvent(surface, 4, 60, 45));
      result!.surfaceProps.onPointerMove(pointerEvent(surface, 4, 90, 60));
      result!.surfaceProps.onPointerUp(pointerEvent(surface, 4, 90, 60));
    });

    expect(surface.setPointerCapture).toHaveBeenCalledWith(4);
    expect(surface.releasePointerCapture).toHaveBeenCalledWith(4);
    expect(result!.controller.toData().strokes[0]?.points).toEqual([
      { x: 100, y: 50, time: 10, pressure: 0.6, tiltX: 2, tiltY: 3, pointerType: 'pen' },
      { x: 160, y: 80, time: 10, pressure: 0.6, tiltX: 2, tiltY: 3, pointerType: 'pen' },
    ]);
  });

  it('does not begin a stroke while disabled', () => {
    let result: UseSignaturePadResult | undefined;
    const { getByTestId } = render(
      <Harness
        enabled={false}
        onReady={(next) => {
          result = next;
        }}
      />,
    );
    const surface = getByTestId('surface');

    act(() => result!.surfaceProps.onPointerDown(pointerEvent(surface, 1, 10, 10)));

    expect(result!.snapshot.isEmpty).toBe(true);
  });
});

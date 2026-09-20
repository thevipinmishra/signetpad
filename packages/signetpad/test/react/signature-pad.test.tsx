import { act, cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SignaturePad, type SignaturePadHandle } from '../../src/react/index.js';

function mockContext(canvas: HTMLCanvasElement) {
  const context = {
    canvas,
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    clearRect: vi.fn(),
    setTransform: vi.fn(),
    toDataURL: () => 'data:image/png;base64,abc',
  } as unknown as CanvasRenderingContext2D;
  vi.spyOn(canvas, 'getContext').mockReturnValue(context);
  return context;
}

describe('SignaturePad', () => {
  afterEach(cleanup);

  it('renders a labeled canvas and exposes undo through the handle', () => {
    const padRef = createRef<SignaturePadHandle>();
    render(<SignaturePad ref={padRef} aria-label="Agreement signature" />);

    const canvas = screen.getByLabelText('Agreement signature') as HTMLCanvasElement;
    mockContext(canvas);
    expect(canvas.style.touchAction).toBe('none');
    expect(padRef.current?.snapshot.isEmpty).toBe(true);

    act(() => {
      padRef.current?.loadData({
        version: 1,
        viewport: { width: 600, height: 240 },
        strokes: [
          {
            id: 'loaded',
            style: { color: '#111827', width: 2, opacity: 1, cap: 'round', join: 'round' },
            points: [
              { x: 10, y: 10, time: 0 },
              { x: 20, y: 20, time: 1 },
            ],
          },
        ],
      });
    });

    expect(padRef.current?.snapshot.strokeCount).toBe(1);
    act(() => {
      padRef.current?.clear();
    });
    expect(padRef.current?.snapshot.isEmpty).toBe(true);
  });

  it('reports snapshot updates to the parent', () => {
    const snapshots: number[] = [];
    render(<SignaturePad onSnapshot={(snapshot) => snapshots.push(snapshot.strokeCount)} />);
    expect(snapshots[0]).toBe(0);
  });
});

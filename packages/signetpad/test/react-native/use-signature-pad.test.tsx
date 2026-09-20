import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { UseSignaturePadResult } from '../../src/react-native/index.js';

const responder = vi.hoisted(() => ({
  config: undefined as Record<string, (...args: unknown[]) => unknown> | undefined,
}));

vi.mock('react-native', () => ({
  PanResponder: {
    create(config: Record<string, (...args: unknown[]) => unknown>) {
      responder.config = config;
      return { panHandlers: config };
    },
  },
}));

const { useSignaturePad } = await import('../../src/react-native/index.js');

function Harness({
  enabled = true,
  onReady,
}: {
  enabled?: boolean;
  onReady: (result: UseSignaturePadResult) => void;
}) {
  const result = useSignaturePad({
    enabled,
    viewport: { width: 200, height: 100 },
    behavior: { smoothing: 0 },
  });
  useEffect(() => onReady(result), [onReady, result]);
  return null;
}

function gesture(x: number, y: number) {
  return {
    nativeEvent: {
      force: 0.7,
      locationX: x,
      locationY: y,
      timestamp: 20,
    },
  } as never;
}

describe('useSignaturePad', () => {
  it('maps responder callbacks to a completed signature', () => {
    let result: UseSignaturePadResult | undefined;
    render(
      <Harness
        onReady={(next) => {
          result = next;
        }}
      />,
    );
    const handlers = responder.config!;

    expect(handlers.onStartShouldSetPanResponder?.()).toBe(true);
    act(() => {
      handlers.onPanResponderGrant?.(gesture(20, 30));
      handlers.onPanResponderMove?.(gesture(60, 50));
      handlers.onPanResponderRelease?.();
    });

    expect(result!.controller.toData().strokes[0]?.points).toEqual([
      { x: 20, y: 30, time: 20, pressure: 0.7, pointerType: 'touch' },
      { x: 60, y: 50, time: 20, pressure: 0.7, pointerType: 'touch' },
    ]);
  });

  it('does not claim a responder while disabled', () => {
    let result: UseSignaturePadResult | undefined;
    render(
      <Harness
        enabled={false}
        onReady={(next) => {
          result = next;
        }}
      />,
    );

    expect(responder.config!.onStartShouldSetPanResponder?.()).toBe(false);
    expect(result!.snapshot.isEmpty).toBe(true);
  });
});

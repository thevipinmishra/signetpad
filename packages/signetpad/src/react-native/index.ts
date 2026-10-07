import {
  PanResponder,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type PanResponderInstance,
} from 'react-native';
import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { createSignaturePad } from '../signature-pad.js';
import type { InputPoint, SignaturePad, SignaturePadOptions, SignatureSnapshot } from '../types.js';

export interface UseSignaturePadOptions extends SignaturePadOptions {
  /** Temporarily disable touch input without destroying the controller. */
  enabled?: boolean;
}

export interface UseSignaturePadResult {
  /** Preferred name for the shared signature controller. */
  controller: SignaturePad;
  /** Alias of `controller`, kept for shorter call sites. */
  pad: SignaturePad;
  snapshot: SignatureSnapshot;
  panHandlers: PanResponderInstance['panHandlers'];
  /** Attach to the responder View so layout size can remap touches to the viewport. */
  onLayout: (event: LayoutChangeEvent) => void;
}

function toInputPoint(
  event: GestureResponderEvent,
  pad: SignaturePad,
  layout: { width: number; height: number } | null,
): InputPoint {
  const nativeEvent = event.nativeEvent;
  const viewport = pad.getViewport();
  const width = layout?.width || viewport.width || 1;
  const height = layout?.height || viewport.height || 1;
  const point: InputPoint = {
    x: nativeEvent.locationX * (viewport.width / width),
    y: nativeEvent.locationY * (viewport.height / height),
    time: nativeEvent.timestamp,
    pointerType: 'touch',
  };

  if ('force' in nativeEvent && typeof nativeEvent.force === 'number') {
    point.pressure = nativeEvent.force;
  }

  return point;
}

/**
 * Connects a React Native responder surface to the headless signature controller.
 * Rendering and accessibility props remain the consuming screen's responsibility.
 */
export function useSignaturePad(options: UseSignaturePadOptions = {}): UseSignaturePadResult {
  const [pad] = useState(() => {
    const { enabled: _enabled, ...padOptions } = options;
    return createSignaturePad(padOptions);
  });
  const enabled = useRef(options.enabled ?? true);
  const active = useRef(false);
  const layoutSize = useRef<{ width: number; height: number } | null>(null);
  enabled.current = options.enabled ?? true;

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    layoutSize.current = { width, height };
  }, []);

  const panResponder = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled.current,
      onMoveShouldSetPanResponder: () => enabled.current,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        if (!enabled.current || active.current) return;
        active.current = pad.begin(toInputPoint(event, pad, layoutSize.current));
      },
      onPanResponderMove: (event) => {
        if (!active.current) return;
        pad.move(toInputPoint(event, pad, layoutSize.current));
      },
      onPanResponderRelease: () => {
        if (!active.current) return;
        pad.end();
        active.current = false;
      },
      onPanResponderTerminate: () => {
        if (!active.current) return;
        pad.cancel();
        active.current = false;
      },
    }),
  )[0];

  const subscribe = useCallback(
    (listener: () => void) => pad.subscribe(listener, { events: 'state' }),
    [pad],
  );
  const getSnapshot = useCallback(() => pad.getSnapshot(), [pad]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    controller: pad,
    pad,
    snapshot,
    panHandlers: panResponder.panHandlers,
    onLayout,
  };
}

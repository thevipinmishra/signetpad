import { PanResponder, type GestureResponderEvent, type PanResponderInstance } from 'react-native';
import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import {
  createSignaturePad,
  type InputPoint,
  type SignaturePad,
  type SignaturePadOptions,
  type SignatureSnapshot,
} from '@signetpad/core';

export interface UseSignaturePadOptions extends SignaturePadOptions {
  /** Temporarily disable touch input without destroying the controller. */
  enabled?: boolean;
}

export interface UseSignaturePadResult {
  controller: SignaturePad;
  pad: SignaturePad;
  snapshot: SignatureSnapshot;
  panHandlers: PanResponderInstance['panHandlers'];
}

function toInputPoint(event: GestureResponderEvent): InputPoint {
  const nativeEvent = event.nativeEvent;
  const point: InputPoint = {
    x: nativeEvent.locationX,
    y: nativeEvent.locationY,
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
  enabled.current = options.enabled ?? true;

  const panResponder = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled.current,
      onMoveShouldSetPanResponder: () => enabled.current,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        if (!enabled.current || active.current) return;
        active.current = pad.begin(toInputPoint(event));
      },
      onPanResponderMove: (event) => {
        if (!active.current) return;
        pad.move(toInputPoint(event));
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

  return { controller: pad, pad, snapshot, panHandlers: panResponder.panHandlers };
}

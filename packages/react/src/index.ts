import {
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type RefCallback,
} from 'react';
import {
  createSignaturePad,
  type InputPoint,
  type PointerType,
  type SignaturePad,
  type SignaturePadOptions,
  type SignatureSnapshot,
} from '@signetpad/core';

export interface UseSignaturePadOptions extends SignaturePadOptions {
  /** Prevent scrolling and browser gestures while drawing. Defaults to true. */
  preventDefault?: boolean;
  /** Temporarily disable pointer input without destroying the controller. */
  enabled?: boolean;
}

export interface SignatureSurfaceProps {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onLostPointerCapture: (event: ReactPointerEvent<HTMLElement>) => void;
}

export interface UseSignaturePadResult {
  controller: SignaturePad;
  pad: SignaturePad;
  snapshot: SignatureSnapshot;
  surfaceRef: RefCallback<HTMLElement>;
  surfaceProps: SignatureSurfaceProps;
}

function toPointerType(pointerType: string): PointerType {
  if (pointerType === 'mouse' || pointerType === 'pen' || pointerType === 'touch') {
    return pointerType;
  }
  return 'unknown';
}

function toInputPoint(
  event: ReactPointerEvent<HTMLElement>,
  element: HTMLElement,
  pad: SignaturePad,
): InputPoint {
  const rect = element.getBoundingClientRect();
  const viewport = pad.getViewport();
  const width = rect.width || viewport.width || 1;
  const height = rect.height || viewport.height || 1;
  const point: InputPoint = {
    x: (event.clientX - rect.left) * (viewport.width / width),
    y: (event.clientY - rect.top) * (viewport.height / height),
    time: event.timeStamp,
    pressure: event.pressure,
    tiltX: event.tiltX,
    tiltY: event.tiltY,
    pointerType: toPointerType(event.pointerType),
  };
  return point;
}

/**
 * Connects a DOM pointer surface to the headless signature controller.
 * Rendering and accessibility props remain the consumer's responsibility.
 */
export function useSignaturePad(options: UseSignaturePadOptions = {}): UseSignaturePadResult {
  const [pad] = useState(() => {
    const { preventDefault: _preventDefault, enabled: _enabled, ...padOptions } = options;
    return createSignaturePad(padOptions);
  });
  const elementRef = useRef<HTMLElement | null>(null);
  const activePointerId = useRef<number | null>(null);
  const enabled = useRef(options.enabled ?? true);
  const preventDefault = useRef(options.preventDefault ?? true);

  enabled.current = options.enabled ?? true;
  preventDefault.current = options.preventDefault ?? true;

  const surfaceRef = useCallback<RefCallback<HTMLElement>>((element) => {
    elementRef.current = element;
  }, []);

  const finishPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>, cancelled: boolean) => {
      if (activePointerId.current !== event.pointerId) return;
      if (preventDefault.current) event.preventDefault();

      if (cancelled) pad.cancel();
      else pad.end();

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      activePointerId.current = null;
    },
    [pad],
  );

  const surfaceProps: SignatureSurfaceProps = {
    onPointerDown: (event) => {
      if (!enabled.current || activePointerId.current !== null) return;
      if (preventDefault.current) event.preventDefault();

      const element = event.currentTarget;
      if (!pad.begin(toInputPoint(event, element, pad))) return;

      activePointerId.current = event.pointerId;
      element.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      if (activePointerId.current !== event.pointerId) return;
      if (preventDefault.current) event.preventDefault();
      pad.move(toInputPoint(event, event.currentTarget, pad));
    },
    onPointerUp: (event) => finishPointer(event, false),
    onPointerCancel: (event) => finishPointer(event, true),
    onLostPointerCapture: (event) => finishPointer(event, true),
  };

  const subscribe = useCallback(
    (listener: () => void) => pad.subscribe(listener, { events: 'state' }),
    [pad],
  );
  const getSnapshot = useCallback(() => pad.getSnapshot(), [pad]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return { controller: pad, pad, snapshot, surfaceRef, surfaceProps };
}

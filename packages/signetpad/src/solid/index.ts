import { createSignal, onCleanup, type Accessor } from 'solid-js';
import { createSignaturePad } from '../signature-pad.js';
import type {
  InputPoint,
  PointerType,
  SignaturePad,
  SignaturePadOptions,
  SignatureSnapshot,
} from '../types.js';

export interface UseSignaturePadOptions extends SignaturePadOptions {
  /** Prevent browser gestures while drawing. Defaults to true. */
  preventDefault?: boolean;
  /** Temporarily disable pointer input. Defaults to true. */
  enabled?: boolean;
}

export interface SignatureSurfaceProps {
  onPointerDown: (event: PointerEvent) => void;
  onPointerMove: (event: PointerEvent) => void;
  onPointerUp: (event: PointerEvent) => void;
  onPointerCancel: (event: PointerEvent) => void;
  onLostPointerCapture: (event: PointerEvent) => void;
}

export interface UseSignaturePadResult {
  controller: SignaturePad;
  pad: SignaturePad;
  snapshot: Accessor<SignatureSnapshot>;
  surfaceProps: SignatureSurfaceProps;
  setSurface: (element: HTMLElement | null) => void;
  setEnabled: (enabled: boolean) => void;
  setPreventDefault: (preventDefault: boolean) => void;
}

function toPointerType(pointerType: string): PointerType {
  return pointerType === 'mouse' || pointerType === 'pen' || pointerType === 'touch'
    ? pointerType
    : 'unknown';
}

function toInputPoint(event: PointerEvent, element: HTMLElement, pad: SignaturePad): InputPoint {
  const rect = element.getBoundingClientRect();
  const viewport = pad.getViewport();
  const width = rect.width || viewport.width || 1;
  const height = rect.height || viewport.height || 1;
  return {
    x: (event.clientX - rect.left) * (viewport.width / width),
    y: (event.clientY - rect.top) * (viewport.height / height),
    time: event.timeStamp,
    pressure: event.pressure,
    tiltX: event.tiltX,
    tiltY: event.tiltY,
    pointerType: toPointerType(event.pointerType),
  };
}

/**
 * Solid hook that connects pointer events to the headless signature controller.
 * Pair `surfaceProps` with a canvas or other element, then paint with `signetpad/canvas`.
 */
export function useSignaturePad(options: UseSignaturePadOptions = {}): UseSignaturePadResult {
  const {
    preventDefault: initialPreventDefault = true,
    enabled: initialEnabled = true,
    ...padOptions
  } = options;
  const controller = createSignaturePad(padOptions);
  const [snapshot, setSnapshot] = createSignal(controller.getSnapshot());
  let activePointerId: number | null = null;
  let enabled = initialEnabled;
  let preventDefault = initialPreventDefault;

  const unsubscribe = controller.subscribe(() => setSnapshot(controller.getSnapshot()), {
    events: 'state',
  });
  onCleanup(() => {
    unsubscribe();
    controller.cancel();
  });

  const finish = (event: PointerEvent, cancelled: boolean): void => {
    if (activePointerId !== event.pointerId) return;
    if (preventDefault) event.preventDefault();
    if (cancelled) controller.cancel();
    else controller.end();
    if (
      event.currentTarget instanceof HTMLElement &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerId = null;
  };

  const surfaceProps: SignatureSurfaceProps = {
    onPointerDown: (event) => {
      if (!enabled || activePointerId !== null) return;
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) return;
      if (preventDefault) event.preventDefault();
      if (!controller.begin(toInputPoint(event, target, controller))) return;
      activePointerId = event.pointerId;
      target.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      if (activePointerId !== event.pointerId) return;
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) return;
      if (preventDefault) event.preventDefault();
      controller.move(toInputPoint(event, target, controller));
    },
    onPointerUp: (event) => finish(event, false),
    onPointerCancel: (event) => finish(event, true),
    onLostPointerCapture: (event) => finish(event, true),
  };

  return {
    controller,
    pad: controller,
    snapshot,
    surfaceProps,
    setSurface: (element) => {
      if (element && !element.style.touchAction) element.style.touchAction = 'none';
    },
    setEnabled: (next) => {
      enabled = next;
    },
    setPreventDefault: (next) => {
      preventDefault = next;
    },
  };
}

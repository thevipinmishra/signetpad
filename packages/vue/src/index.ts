import { onBeforeUnmount, shallowRef, type Ref } from 'vue';
import {
  createSignaturePad,
  type InputPoint,
  type PointerType,
  type SignaturePad,
  type SignaturePadOptions,
  type SignatureSnapshot,
} from '@signetpad/core';

export interface UseSignaturePadOptions extends SignaturePadOptions {
  /** Prevent browser gestures while drawing. Defaults to true. */
  preventDefault?: boolean;
  /** Temporarily disable pointer input without destroying the controller. */
  enabled?: boolean;
}

export interface SignatureSurfaceProps {
  ref: (element: HTMLElement | null) => void;
  onPointerdown: (event: PointerEvent) => void;
  onPointermove: (event: PointerEvent) => void;
  onPointerup: (event: PointerEvent) => void;
  onPointercancel: (event: PointerEvent) => void;
  onLostpointercapture: (event: PointerEvent) => void;
}

export interface UseSignaturePadResult {
  controller: SignaturePad;
  pad: SignaturePad;
  snapshot: Readonly<Ref<SignatureSnapshot>>;
  surfaceRef: (element: HTMLElement | null) => void;
  surfaceProps: SignatureSurfaceProps;
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

/** Connect a Vue template element to the framework-agnostic signature controller. */
export function useSignaturePad(options: UseSignaturePadOptions = {}): UseSignaturePadResult {
  const {
    preventDefault: preventDefaultOption = true,
    enabled: enabledOption = true,
    ...padOptions
  } = options;
  const pad = createSignaturePad(padOptions);
  const snapshot = shallowRef(pad.getSnapshot());
  let element: HTMLElement | null = null;
  let activePointerId: number | null = null;
  let enabled = enabledOption;
  let preventDefault = preventDefaultOption;

  const unsubscribe = pad.subscribe(
    () => {
      snapshot.value = pad.getSnapshot();
    },
    { events: 'state' },
  );

  const surfaceRef = (nextElement: HTMLElement | null): void => {
    element = nextElement;
  };

  const finish = (event: PointerEvent, cancelled: boolean): void => {
    if (activePointerId !== event.pointerId) return;
    if (preventDefault) event.preventDefault();
    if (cancelled) pad.cancel();
    else pad.end();
    if (
      event.currentTarget instanceof HTMLElement &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerId = null;
  };

  const surfaceProps: SignatureSurfaceProps = {
    ref: surfaceRef,
    onPointerdown: (event) => {
      if (!enabled || activePointerId !== null || !element) return;
      if (preventDefault) event.preventDefault();
      if (!pad.begin(toInputPoint(event, element, pad))) return;
      activePointerId = event.pointerId;
      const target = event.currentTarget;
      if (target instanceof HTMLElement) target.setPointerCapture(event.pointerId);
    },
    onPointermove: (event) => {
      if (activePointerId !== event.pointerId || !element) return;
      if (preventDefault) event.preventDefault();
      pad.move(toInputPoint(event, element, pad));
    },
    onPointerup: (event) => finish(event, false),
    onPointercancel: (event) => finish(event, true),
    onLostpointercapture: (event) => finish(event, true),
  };

  onBeforeUnmount(unsubscribe);

  return {
    controller: pad,
    pad,
    snapshot,
    surfaceRef,
    surfaceProps,
  };
}

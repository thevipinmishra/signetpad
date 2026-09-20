import {
  createSignaturePad,
  type InputPoint,
  type PointerType,
  type SignaturePad,
  type SignaturePadOptions,
} from '@signetpad/core';

export interface SignaturePadActionOptions extends SignaturePadOptions {
  /** Prevent browser gestures while drawing. Defaults to true. */
  preventDefault?: boolean;
  /** Temporarily disable pointer input. Defaults to true. */
  enabled?: boolean;
}

export interface SignaturePadActionResult {
  update?: (options: SignaturePadActionOptions) => void;
  destroy: () => void;
}

export type SignaturePadAction = (
  node: HTMLElement,
  options?: SignaturePadActionOptions,
) => SignaturePadActionResult;

function toPointerType(pointerType: string): PointerType {
  return pointerType === 'mouse' || pointerType === 'pen' || pointerType === 'touch'
    ? pointerType
    : 'unknown';
}

function toInputPoint(event: PointerEvent, node: HTMLElement, pad: SignaturePad): InputPoint {
  const rect = node.getBoundingClientRect();
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
 * Creates a Svelte action and exposes the same controller used by React and Vue.
 * Use it as `use:signaturePadAction` and subscribe to `controller` for rendering.
 */
export function createSignaturePadAction(options: SignaturePadActionOptions = {}): {
  controller: SignaturePad;
  action: SignaturePadAction;
} {
  const {
    preventDefault: initialPreventDefault = true,
    enabled: initialEnabled = true,
    ...padOptions
  } = options;
  const controller = createSignaturePad(padOptions);

  const action: SignaturePadAction = (node, nextOptions = options) => {
    let activePointerId: number | null = null;
    let enabled = nextOptions.enabled ?? initialEnabled;
    let preventDefault = nextOptions.preventDefault ?? initialPreventDefault;

    const finish = (event: PointerEvent, cancelled: boolean): void => {
      if (activePointerId !== event.pointerId) return;
      if (preventDefault) event.preventDefault();
      if (cancelled) controller.cancel();
      else controller.end();
      if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
      activePointerId = null;
    };

    const onPointerDown = (event: PointerEvent): void => {
      if (!enabled || activePointerId !== null) return;
      if (preventDefault) event.preventDefault();
      if (!controller.begin(toInputPoint(event, node, controller))) return;
      activePointerId = event.pointerId;
      node.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent): void => {
      if (activePointerId !== event.pointerId) return;
      if (preventDefault) event.preventDefault();
      controller.move(toInputPoint(event, node, controller));
    };
    const onPointerUp = (event: PointerEvent): void => finish(event, false);
    const onPointerCancel = (event: PointerEvent): void => finish(event, true);

    node.addEventListener('pointerdown', onPointerDown);
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerup', onPointerUp);
    node.addEventListener('pointercancel', onPointerCancel);
    node.addEventListener('lostpointercapture', onPointerCancel);

    return {
      update(next) {
        enabled = next.enabled ?? enabled;
        preventDefault = next.preventDefault ?? preventDefault;
        if (next.stroke) controller.setStrokeStyle(next.stroke);
        if (next.behavior) controller.setBehavior(next.behavior);
        if (next.viewport) controller.setViewport(next.viewport);
      },
      destroy() {
        node.removeEventListener('pointerdown', onPointerDown);
        node.removeEventListener('pointermove', onPointerMove);
        node.removeEventListener('pointerup', onPointerUp);
        node.removeEventListener('pointercancel', onPointerCancel);
        node.removeEventListener('lostpointercapture', onPointerCancel);
        controller.cancel();
      },
    };
  };

  return { controller, action };
}

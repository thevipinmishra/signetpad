import { attachCanvasRenderer, type AttachedCanvasRenderer } from '../canvas/index.js';
import { createSignaturePad } from '../signature-pad.js';
import type {
  InputPoint,
  PointerType,
  SignaturePad,
  SignaturePadOptions,
  SignatureSnapshot,
} from '../types.js';

export interface AttachAngularSignaturePadOptions extends SignaturePadOptions {
  /** Prevent browser gestures while drawing. Defaults to true. */
  preventDefault?: boolean;
  /** Temporarily disable pointer input. Defaults to true. */
  enabled?: boolean;
}

export interface AngularSignaturePadHandle {
  controller: SignaturePad;
  getSnapshot: () => SignatureSnapshot;
  setEnabled: (enabled: boolean) => void;
  setPreventDefault: (preventDefault: boolean) => void;
  destroy: () => void;
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
 * Attaches pointer capture and optional canvas painting to a host element.
 * Angular apps wrap this in a standalone component or directive (Ivy cannot
 * consume decorator metadata from plain `tsc` output, so the host owns the Angular layer).
 */
export function attachAngularSignaturePad(
  element: HTMLElement,
  options: AttachAngularSignaturePadOptions = {},
): AngularSignaturePadHandle {
  const {
    preventDefault: initialPreventDefault = true,
    enabled: initialEnabled = true,
    ...padOptions
  } = options;
  const controller = createSignaturePad(padOptions);
  let enabled = initialEnabled;
  let preventDefault = initialPreventDefault;
  let activePointerId: number | null = null;
  let attached: AttachedCanvasRenderer | null = null;

  if (!element.style.touchAction) element.style.touchAction = 'none';

  if (element instanceof HTMLCanvasElement) {
    const viewport = controller.getViewport();
    if (!element.getAttribute('width')) element.width = viewport.width;
    if (!element.getAttribute('height')) element.height = viewport.height;
    attached = attachCanvasRenderer(element, controller);
  }

  const finish = (event: PointerEvent, cancelled: boolean): void => {
    if (activePointerId !== event.pointerId) return;
    if (preventDefault) event.preventDefault();
    if (cancelled) controller.cancel();
    else controller.end();
    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
    activePointerId = null;
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (!enabled || activePointerId !== null) return;
    if (preventDefault) event.preventDefault();
    if (!controller.begin(toInputPoint(event, element, controller))) return;
    activePointerId = event.pointerId;
    element.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent): void => {
    if (activePointerId !== event.pointerId) return;
    if (preventDefault) event.preventDefault();
    controller.move(toInputPoint(event, element, controller));
  };
  const onPointerUp = (event: PointerEvent): void => finish(event, false);
  const onPointerCancel = (event: PointerEvent): void => finish(event, true);

  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerup', onPointerUp);
  element.addEventListener('pointercancel', onPointerCancel);
  element.addEventListener('lostpointercapture', onPointerCancel);

  return {
    controller,
    getSnapshot: () => controller.getSnapshot(),
    setEnabled: (next) => {
      enabled = next;
    },
    setPreventDefault: (next) => {
      preventDefault = next;
    },
    destroy: () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerCancel);
      element.removeEventListener('lostpointercapture', onPointerCancel);
      attached?.detach();
      controller.cancel();
    },
  };
}

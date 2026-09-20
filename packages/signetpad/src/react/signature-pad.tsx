import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type CanvasHTMLAttributes,
  type CSSProperties,
} from 'react';
import {
  attachCanvasRenderer,
  type CanvasImageOptions,
  type CanvasRenderer,
} from '../canvas/index.js';
import type {
  SignatureBehavior,
  SignatureData,
  SignaturePad as SignaturePadController,
  SignatureSnapshot,
  SignatureSvgOptions,
  StrokeStyle,
  Viewport,
} from '../types.js';
import { useSignaturePad } from './use-signature-pad.js';

const CANVAS_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  touchAction: 'none',
};

export interface SignaturePadHandle {
  controller: SignaturePadController;
  snapshot: SignatureSnapshot;
  undo: () => boolean;
  redo: () => boolean;
  clear: () => boolean;
  reset: () => void;
  toData: () => SignatureData;
  loadData: (data: SignatureData, options?: { resetHistory?: boolean }) => void;
  toSvg: (options?: SignatureSvgOptions) => string;
  toDataURL: (options?: CanvasImageOptions) => string;
  toBlob: (options?: CanvasImageOptions) => Promise<Blob>;
}

export interface SignaturePadProps extends Omit<
  CanvasHTMLAttributes<HTMLCanvasElement>,
  'width' | 'height'
> {
  viewport?: Viewport;
  stroke?: Partial<StrokeStyle>;
  behavior?: Partial<SignatureBehavior>;
  enabled?: boolean;
  preventDefault?: boolean;
  onSnapshot?: (snapshot: SignatureSnapshot) => void;
}

function missingRenderer(): never {
  throw new Error('SignaturePad is not mounted.');
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad(
  {
    viewport,
    stroke,
    behavior,
    enabled = true,
    preventDefault = true,
    onSnapshot,
    className,
    style,
    'aria-label': ariaLabel = 'Signature',
    ...canvasProps
  },
  ref,
) {
  const { controller, snapshot, surfaceRef, surfaceProps } = useSignaturePad({
    enabled,
    preventDefault,
    ...(viewport ? { viewport } : {}),
    ...(stroke ? { stroke } : {}),
    ...(behavior ? { behavior } : {}),
  });
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const detachRef = useRef<(() => void) | null>(null);
  const onSnapshotRef = useRef(onSnapshot);
  const resolvedViewport = controller.getViewport();
  onSnapshotRef.current = onSnapshot;

  useEffect(() => {
    if (stroke) controller.setStrokeStyle(stroke);
  }, [controller, stroke?.color, stroke?.width, stroke?.opacity, stroke?.cap, stroke?.join]);

  useEffect(() => {
    if (viewport) controller.setViewport(viewport);
  }, [controller, viewport?.width, viewport?.height]);

  useEffect(() => {
    onSnapshotRef.current?.(snapshot);
  }, [snapshot]);

  useImperativeHandle(
    ref,
    () => ({
      controller,
      get snapshot() {
        return controller.getSnapshot();
      },
      undo: () => controller.undo(),
      redo: () => controller.redo(),
      clear: () => controller.clear(),
      reset: () => controller.reset(),
      toData: () => controller.toData(),
      loadData: (data, options) => controller.loadData(data, options),
      toSvg: (options) => controller.toSvg(options),
      toDataURL: (options) => rendererRef.current?.toDataURL(options) ?? missingRenderer(),
      toBlob: (options) => rendererRef.current?.toBlob(options) ?? missingRenderer(),
    }),
    [controller],
  );

  const attachCanvas = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      detachRef.current?.();
      detachRef.current = null;
      rendererRef.current = null;
      surfaceRef(canvas);
      if (!canvas) return;

      const attached = attachCanvasRenderer(canvas, controller);
      rendererRef.current = attached?.renderer ?? null;
      detachRef.current = attached?.detach ?? null;
    },
    [controller, surfaceRef],
  );

  useEffect(
    () => () => {
      detachRef.current?.();
      detachRef.current = null;
      rendererRef.current = null;
    },
    [],
  );

  return (
    <canvas
      {...canvasProps}
      {...surfaceProps}
      ref={attachCanvas}
      className={className}
      width={resolvedViewport.width}
      height={resolvedViewport.height}
      aria-label={ariaLabel}
      style={{ ...CANVAS_STYLE, ...style }}
    />
  );
});

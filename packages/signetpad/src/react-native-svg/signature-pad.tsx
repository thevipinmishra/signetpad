import { forwardRef, useEffect, useImperativeHandle, useRef, type ComponentProps } from 'react';
import { View, type ViewProps } from 'react-native';
import { useSignaturePad } from '../react-native/index.js';
import type {
  SignatureBehavior,
  SignatureData,
  SignaturePad as SignaturePadController,
  SignatureSnapshot,
  SignatureSvgOptions,
  StrokeStyle,
  Viewport,
} from '../types.js';
import { SignatureSvg } from './signature-svg.js';

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
}

export interface SignaturePadProps extends Omit<ViewProps, 'children'> {
  viewport?: Viewport;
  stroke?: Partial<StrokeStyle>;
  behavior?: Partial<SignatureBehavior>;
  enabled?: boolean;
  onSnapshot?: (snapshot: SignatureSnapshot) => void;
  svgProps?: Omit<ComponentProps<typeof SignatureSvg>, 'pad' | 'strokes' | 'viewport'>;
}

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(function SignaturePad(
  {
    viewport,
    stroke,
    behavior,
    enabled = true,
    onSnapshot,
    accessibilityLabel = 'Signature',
    style,
    svgProps,
    ...viewProps
  },
  ref,
) {
  const { controller, snapshot, panHandlers } = useSignaturePad({
    enabled,
    ...(viewport ? { viewport } : {}),
    ...(stroke ? { stroke } : {}),
    ...(behavior ? { behavior } : {}),
  });
  const onSnapshotRef = useRef(onSnapshot);
  const resolvedViewport = viewport ?? controller.getViewport();
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
    }),
    [controller],
  );

  return (
    <View
      {...viewProps}
      {...panHandlers}
      accessible
      accessibilityLabel={accessibilityLabel}
      style={[{ width: resolvedViewport.width, height: resolvedViewport.height }, style]}
    >
      <SignatureSvg pad={controller} viewport={resolvedViewport} {...svgProps} />
    </View>
  );
});

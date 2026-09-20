import {
  defineComponent,
  h,
  onBeforeUnmount,
  watch,
  type PropType,
  type StyleValue,
  type VNodeRef,
} from 'vue';
import {
  attachCanvasRenderer,
  type CanvasImageOptions,
  type CanvasRenderer,
} from '../canvas/index.js';
import type {
  SignatureBehavior,
  SignatureData,
  SignatureSnapshot,
  SignatureSvgOptions,
  StrokeStyle,
  Viewport,
} from '../types.js';
import { useSignaturePad, type UseSignaturePadOptions } from './use-signature-pad.js';

export interface SignaturePadHandle {
  controller: ReturnType<typeof useSignaturePad>['controller'];
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

function missingRenderer(): never {
  throw new Error('SignaturePad is not mounted.');
}

export const SignaturePad = defineComponent({
  name: 'SignaturePad',
  inheritAttrs: false,
  props: {
    viewport: { type: Object as PropType<Viewport>, required: false },
    stroke: { type: Object as PropType<Partial<StrokeStyle>>, required: false },
    behavior: { type: Object as PropType<Partial<SignatureBehavior>>, required: false },
    enabled: { type: Boolean, default: true },
    preventDefault: { type: Boolean, default: true },
  },
  emits: {
    snapshot: (_snapshot: SignatureSnapshot) => true,
  },
  setup(props, { attrs, emit, expose }) {
    const liveOptions: UseSignaturePadOptions = {
      enabled: props.enabled,
      preventDefault: props.preventDefault,
      ...(props.viewport ? { viewport: props.viewport } : {}),
      ...(props.stroke ? { stroke: props.stroke } : {}),
      ...(props.behavior ? { behavior: props.behavior } : {}),
    };
    const { controller, snapshot, surfaceRef, surfaceProps } = useSignaturePad(liveOptions);
    let renderer: CanvasRenderer | null = null;
    let detach: (() => void) | null = null;

    watch(
      () => props.enabled,
      (value) => {
        liveOptions.enabled = value;
      },
    );
    watch(
      () => props.preventDefault,
      (value) => {
        liveOptions.preventDefault = value;
      },
    );
    watch(
      () => props.stroke,
      (value) => {
        if (value) controller.setStrokeStyle(value);
      },
    );
    watch(
      () => props.viewport,
      (value) => {
        if (value) controller.setViewport(value);
      },
    );
    watch(snapshot, (value) => emit('snapshot', value), { immediate: true });

    const bindCanvas: VNodeRef = (element) => {
      detach?.();
      detach = null;
      renderer = null;
      const node = element instanceof HTMLElement ? element : null;
      surfaceRef(node);
      if (!(node instanceof HTMLCanvasElement)) return;
      const attached = attachCanvasRenderer(node, controller);
      renderer = attached?.renderer ?? null;
      detach = attached?.detach ?? null;
    };

    onBeforeUnmount(() => {
      detach?.();
    });

    const handle: SignaturePadHandle = {
      get controller() {
        return controller;
      },
      get snapshot() {
        return snapshot.value;
      },
      undo: () => controller.undo(),
      redo: () => controller.redo(),
      clear: () => controller.clear(),
      reset: () => controller.reset(),
      toData: () => controller.toData(),
      loadData: (data, options) => controller.loadData(data, options),
      toSvg: (options) => controller.toSvg(options),
      toDataURL: (options) => renderer?.toDataURL(options) ?? missingRenderer(),
      toBlob: (options) => renderer?.toBlob(options) ?? missingRenderer(),
    };

    expose(handle);

    return () => {
      const viewport = controller.getViewport();
      const { ref: _surfaceCallback, ...pointerProps } = surfaceProps;
      const style: StyleValue = [
        { display: 'block', width: '100%', height: 'auto', touchAction: 'none' },
        attrs.style as StyleValue,
      ];

      return h('canvas', {
        ...attrs,
        ...pointerProps,
        ref: bindCanvas,
        width: viewport.width,
        height: viewport.height,
        'aria-label': (attrs['aria-label'] as string | undefined) ?? 'Signature',
        style,
      });
    };
  },
});

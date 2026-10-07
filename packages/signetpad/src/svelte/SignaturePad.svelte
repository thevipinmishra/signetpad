<script lang="ts">
  import { createSignaturePadAction } from './index.js';
  import type { SignatureBehavior, SignatureSnapshot, StrokeStyle, Viewport } from '../types.js';

  export let viewport: Viewport | undefined = undefined;
  export let stroke: Partial<StrokeStyle> | undefined = undefined;
  export let behavior: Partial<SignatureBehavior> | undefined = undefined;
  export let enabled = true;
  export let preventDefault = true;
  export let className = '';
  let ariaLabel = 'Signature';
  export { ariaLabel as 'aria-label' };
  export let onSnapshot: ((snapshot: SignatureSnapshot) => void) | undefined = undefined;

  const { action, controller, snapshot } = createSignaturePadAction({
    ...(viewport ? { viewport } : {}),
    ...(stroke ? { stroke } : {}),
    ...(behavior ? { behavior } : {}),
    enabled,
    preventDefault,
  });

  $: if (stroke) controller.setStrokeStyle(stroke);
  $: if (viewport) controller.setViewport(viewport);
  $: if (behavior) controller.setBehavior(behavior);
  $: {
    const current = $snapshot;
    onSnapshot?.(current);
  }

  export function undo() {
    return controller.undo();
  }
  export function redo() {
    return controller.redo();
  }
  export function clear() {
    return controller.clear();
  }
  export function reset() {
    controller.reset();
  }
  export function toData() {
    return controller.toData();
  }
  export function toSvg(options?: Parameters<typeof controller.toSvg>[0]) {
    return controller.toSvg(options);
  }
  export function getController() {
    return controller;
  }
</script>

<canvas
  use:action={{ enabled, preventDefault, viewport, stroke, behavior }}
  class={className}
  aria-label={ariaLabel}
  style="display:block;width:100%;height:auto;touch-action:none;"
></canvas>

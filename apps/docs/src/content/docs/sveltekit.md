---
title: Svelte
description: Canvas action for Svelte and SvelteKit.
section: integrations
order: 35
---

```svelte
<script lang="ts">
  import { createSignaturePadAction } from 'signetpad/svelte';

  const { action, controller, snapshot } = createSignaturePadAction({
    viewport: { width: 600, height: 240 },
  });
</script>

<canvas use:action width="600" height="240" aria-label="Signature"></canvas>
<button type="button" disabled={!$snapshot.canUndo} on:click={() => controller.undo()}>
  Undo
</button>
<button type="button" disabled={!$snapshot.canRedo} on:click={() => controller.redo()}>
  Redo
</button>
<button type="button" disabled={$snapshot.isEmpty} on:click={() => controller.clear()}>
  Clear
</button>
```

`$snapshot` is a Svelte store. The action only binds pointer events after the canvas mounts, so it is safe to import from a SvelteKit route.

If you attach the action to a non-canvas element, you still capture input. Paint strokes yourself from `controller`.

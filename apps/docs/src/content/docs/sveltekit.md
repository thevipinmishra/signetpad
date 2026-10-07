---
title: Svelte
description: Canvas action and SignaturePad component for Svelte and SvelteKit.
section: integrations
order: 35
---

## Action (custom surface)

```svelte
<script lang="ts">
  import { createSignaturePadAction } from 'signetpad/svelte';

  const { action, controller, snapshot } = createSignaturePadAction({
    viewport: { width: 600, height: 240 },
  });
</script>

<canvas use:action width="600" height="240" aria-label="Signature"></canvas>
<button type="button" disabled={!$snapshot.canUndo} onclick={() => controller.undo()}>
  Undo
</button>
```

`$snapshot` is a store-shaped object with `subscribe`. The action binds pointer events after the canvas mounts. You can import it from a SvelteKit route.

Svelte 4 apps can keep `on:click` instead of `onclick`.

## Component

```svelte
<script lang="ts">
  import SignaturePad from 'signetpad/svelte/SignaturePad.svelte';
</script>

<SignaturePad aria-label="Signature" />
```

If you attach the action to a non-canvas element, you still capture input. Paint strokes yourself from `controller`.

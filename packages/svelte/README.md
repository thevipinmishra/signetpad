# @signetpad/svelte

A browser action for Svelte and SvelteKit. The action mounts only when its element exists, so it
fits naturally inside server-rendered routes.

## Attach the action

```svelte
<script lang="ts">
  import { createSignaturePadAction } from '@signetpad/svelte';

  const { action: signaturePadAction, controller } = createSignaturePadAction({
    viewport: { width: 600, height: 240 },
  });
</script>

<canvas use:signaturePadAction aria-label="Signature input" />
<button type="button" on:click={() => controller.undo()}>Undo</button>
```

Subscribe with `{ events: 'all' }` when a Canvas or SVG renderer needs point-level updates. Use
the default state subscription for button labels and validation.

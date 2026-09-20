# @signetpad/svelte

A browser action for Svelte and SvelteKit. The action mounts only when its element exists, so it
fits naturally inside server-rendered routes.

[Docs](https://signetpad.dev/docs/sveltekit) · [GitHub](https://github.com/thevipinmishra/signetpad)

## Install

```sh
pnpm add @signetpad/svelte
```

This package is ESM-only. It speaks Svelte's action contract and does not import the Svelte
runtime.

## Attach the action

```svelte
<script lang="ts">
  import { createSignaturePadAction } from '@signetpad/svelte';

  const { action: signaturePadAction, controller } = createSignaturePadAction({
    viewport: { width: 600, height: 240 },
  });
</script>

<canvas use:signaturePadAction style="touch-action: none" aria-label="Signature input" />
<button type="button" on:click={() => controller.undo()}>Undo</button>
```

`update()` can change `enabled`, `preventDefault`, stroke style, behavior, and viewport without
recreating the controller. Subscribe with `{ events: 'all' }` when a Canvas or SVG renderer needs
point-level updates. Use the default state subscription for button labels and validation.

## License

MIT

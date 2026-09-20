---
title: SvelteKit
description: Mount one small browser action while keeping the rest of the page SSR-friendly.
section: integrations
order: 35
---

## Install

```bash
pnpm add @signetpad/svelte
```

## Use the action

```svelte
<script lang="ts">
  import { createSignaturePadAction } from '@signetpad/svelte';
  const { action: signaturePadAction, controller } = createSignaturePadAction({ viewport: { width: 600, height: 240 } });
</script>

<canvas use:signaturePadAction style="touch-action: none" aria-label="Signature input" />
<button type="button" on:click={() => controller.clear()}>Clear</button>
```

SvelteKit only runs the action after the element mounts in the browser, so the adapter is safe to import from a route component. Add your Canvas or SVG renderer in a subscription to `controller`.

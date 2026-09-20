---
title: Vue
description: Use the Vue 3 composable in Vue, Nuxt, and other Vue-based applications.
section: integrations
order: 34
---

## Install

```bash
pnpm add @signetpad/vue @signetpad/renderer-canvas
```

## Bind the surface

```vue
<script setup lang="ts">
import { useSignaturePad } from '@signetpad/vue';
const { controller, snapshot, surfaceProps } = useSignaturePad({
  viewport: { width: 600, height: 240 },
});
</script>

<template>
  <canvas
    v-bind="surfaceProps"
    width="600"
    height="240"
    style="touch-action: none"
    aria-label="Signature input"
  />
  <button type="button" :disabled="!snapshot.canUndo" @click="controller.undo()">Undo</button>
</template>
```

`surfaceProps` includes a callback ref and Vue’s `onPointer*` event bindings. If you pass a
reactive options object, `enabled` and `preventDefault` are read on each event. In Nuxt, place
this component behind `<ClientOnly>` when the page is server rendered.

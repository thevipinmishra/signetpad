# @signetpad/vue

A Vue 3 composable for `@signetpad/core`. It works in Vue and Nuxt, and leaves rendering and
form UI in your component.

[Docs](https://signetpad.dev/docs/vue) · [GitHub](https://github.com/thevipinmishra/signetpad)

## Install

```sh
pnpm add @signetpad/vue @signetpad/renderer-canvas
```

Peer dependency: `vue` >= 3.3. This package is ESM-only.

If you pass a reactive options object, `enabled` and `preventDefault` are read on each pointer
event. Viewport, stroke, and behavior remain initial values.

## Bind a signature surface

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

The composable returns a reactive snapshot and the shared controller. In Nuxt, use a client-only
component boundary for the interactive surface.

## License

MIT

# @signetpad/vue

A Vue 3 composable for `@signetpad/core`. It works in Vue and Nuxt, and leaves rendering and
form UI in your component.

## Bind a signature surface

```vue
<script setup lang="ts">
import { useSignaturePad } from '@signetpad/vue';

const { controller, snapshot, surfaceProps } = useSignaturePad({
  viewport: { width: 600, height: 240 },
});
</script>

<template>
  <canvas v-bind="surfaceProps" width="600" height="240" aria-label="Signature input" />
  <button type="button" :disabled="!snapshot.canUndo" @click="controller.undo()">Undo</button>
</template>
```

The composable returns a reactive snapshot and the shared controller. In Nuxt, use a client-only
component boundary for the interactive surface.

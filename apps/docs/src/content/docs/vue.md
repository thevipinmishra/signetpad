---
title: Vue
description: SignaturePad for Vue 3 and Nuxt.
section: integrations
order: 34
---

```vue
<script setup lang="ts">
import { SignaturePad } from 'signetpad/vue';
</script>

<template>
  <SignaturePad aria-label="Signature" />
</template>
```

In Nuxt, wrap the field in `<ClientOnly>`.

## Undo, redo, and clear

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/vue';

const pad = ref<SignaturePadHandle | null>(null);
</script>

<template>
  <SignaturePad ref="pad" aria-label="Signature" />
  <button type="button" :disabled="!pad?.snapshot.canUndo" @click="pad?.undo()">Undo</button>
  <button type="button" :disabled="!pad?.snapshot.canRedo" @click="pad?.redo()">Redo</button>
  <button type="button" :disabled="pad?.snapshot.isEmpty" @click="pad?.clear()">Clear</button>
</template>
```

## Custom surface

Use the composable when the drawing surface is not a canvas.

```vue
<script setup lang="ts">
import { useSignaturePad } from 'signetpad/vue';

const { controller, snapshot, surfaceProps } = useSignaturePad({
  viewport: { width: 600, height: 240 },
});
</script>

<template>
  <div v-bind="surfaceProps" style="touch-action: none; height: 240px" aria-label="Signature" />
  <button type="button" :disabled="!snapshot.canUndo" @click="controller.undo()">Undo</button>
</template>
```

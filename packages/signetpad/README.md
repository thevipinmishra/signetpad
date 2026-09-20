# SignetPad

[![CI](https://github.com/thevipinmishra/signetpad/actions/workflows/ci.yml/badge.svg)](https://github.com/thevipinmishra/signetpad/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/signetpad.svg)](https://www.npmjs.com/package/signetpad)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](./LICENSE)

**SignetPad** is a headless TypeScript signature pad for React, Next.js, Vue, Nuxt, Svelte, SvelteKit, and React Native. It captures handwritten signatures as versioned vector data, supports undo and redo, and exports SVG or browser images (PNG, JPEG, WebP).

Install one package. Import only the entry you need so unused framework code is tree-shaken away.

```sh
pnpm add signetpad
```

```sh
npm install signetpad
```

## Why SignetPad

Most signature pad libraries bind capture, drawing, and export to one canvas. SignetPad keeps those jobs separate:

- Capture once with a tiny framework adapter
- Persist editable `SignatureData` instead of a screenshot
- Render with Canvas, React Native SVG, or your own surface
- Use the same payload on web, native, and the server

## Import paths

| Import                       | Use it for                                                      |
| ---------------------------- | --------------------------------------------------------------- |
| `signetpad`                  | Headless controller, history, validation, `toData()`, `toSvg()` |
| `signetpad/react`            | React, Next.js, Remix, Vite, and Astro pointer adapter          |
| `signetpad/vue`              | Vue 3 and Nuxt composable                                       |
| `signetpad/svelte`           | Svelte and SvelteKit action                                     |
| `signetpad/react-native`     | React Native PanResponder adapter                               |
| `signetpad/canvas`           | Canvas 2D renderer and PNG, JPEG, or WebP export                |
| `signetpad/react-native-svg` | React Native SVG renderer                                       |

`sideEffects` is `false`. Importing `signetpad/react` does not load Vue, Svelte, or React Native.

## React signature pad

```tsx
import { useLayoutEffect, useRef } from 'react';
import { useSignaturePad } from 'signetpad/react';
import { createCanvasRenderer } from 'signetpad/canvas';

const viewport = { width: 600, height: 240 };

export function SignatureField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { controller, snapshot, surfaceRef, surfaceProps } = useSignaturePad({ viewport });

  useLayoutEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const renderer = createCanvasRenderer(context, { viewport, dpr: devicePixelRatio });
    renderer.render(controller.getStrokes());
    return controller.subscribe(() => renderer.update(controller.getStrokes()), { events: 'all' });
  }, [controller]);

  return (
    <>
      <canvas
        ref={(node) => {
          canvasRef.current = node;
          surfaceRef(node);
        }}
        style={{ touchAction: 'none' }}
        aria-label="Signature input"
        {...surfaceProps}
      />
      <button type="button" disabled={!snapshot.canUndo} onClick={() => controller.undo()}>
        Undo
      </button>
    </>
  );
}
```

Works in React 18+, Next.js client components, Remix, Vite, and Astro islands.

## Vue signature pad

```vue
<script setup lang="ts">
import { useSignaturePad } from 'signetpad/vue';

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

## Svelte signature pad

```svelte
<script lang="ts">
  import { createSignaturePadAction } from 'signetpad/svelte';

  const { action: signaturePadAction, controller } = createSignaturePadAction({
    viewport: { width: 600, height: 240 },
  });
</script>

<canvas use:signaturePadAction style="touch-action: none" aria-label="Signature input" />
<button type="button" on:click={() => controller.undo()}>Undo</button>
```

## React Native signature pad

```tsx
import { View } from 'react-native';
import { useSignaturePad } from 'signetpad/react-native';
import { SignatureSvg } from 'signetpad/react-native-svg';

export function SignatureField() {
  const { controller, panHandlers } = useSignaturePad({
    viewport: { width: 360, height: 180 },
  });

  return (
    <View {...panHandlers} accessible accessibilityLabel="Signature drawing area">
      <SignatureSvg pad={controller} />
    </View>
  );
}
```

`react`, `vue`, `react-native`, and `react-native-svg` are optional peer dependencies. Install only the ones your app already uses.

## Save, restore, and export

```ts
import { createSignaturePad } from 'signetpad';

const pad = createSignaturePad({ viewport: { width: 600, height: 240 } });
const data = pad.toData();
const svg = pad.toSvg({ background: '#ffffff' });
```

Keep `toData()` as the source of truth. Use `signetpad/canvas` when a browser must download PNG, JPEG, or WebP.

## Tree shaking

Each import path is a separate ESM entry. The core does not import React, Vue, or React Native. Renderers import types only, so a Canvas-only bundle does not include the controller unless you import `signetpad` yourself.

```ts
import { createSignaturePad } from 'signetpad';
import { useSignaturePad } from 'signetpad/react';
import { createCanvasRenderer } from 'signetpad/canvas';
```

Do not import from a barrel of every adapter. There is no `signetpad/all` on purpose.

## Docs and examples

- [Getting started](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/getting-started.md)
- [React](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/react.md)
- [Vue](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/vue.md)
- [SvelteKit](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/sveltekit.md)
- [React Native](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/react-native.md)
- [API](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/api.md)

## License

[MIT](./LICENSE)

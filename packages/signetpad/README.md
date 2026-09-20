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
| `signetpad/react`            | React `SignaturePad` plus the headless `useSignaturePad` hook   |
| `signetpad/vue`              | Vue `SignaturePad` plus the composable                          |
| `signetpad/svelte`           | Svelte action that paints a canvas for you                      |
| `signetpad/react-native`     | React Native PanResponder hook                                  |
| `signetpad/react-native-svg` | Native `SignaturePad` plus `SignatureSvg`                       |
| `signetpad/canvas`           | Canvas 2D renderer (used internally by the web `SignaturePad`)  |

`sideEffects` is `false`. Importing `signetpad/react` does not load Vue, Svelte, or React Native.

## React signature pad

```tsx
import { SignaturePad } from 'signetpad/react';

export function SignatureField() {
  return <SignaturePad aria-label="Agreement signature" />;
}
```

Add undo without assembling a renderer:

```tsx
import { useRef } from 'react';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react';

export function SignatureField() {
  const padRef = useRef<SignaturePadHandle>(null);

  return (
    <>
      <SignaturePad ref={padRef} aria-label="Agreement signature" />
      <button type="button" onClick={() => padRef.current?.undo()}>
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
import { SignaturePad } from 'signetpad/vue';
</script>

<template>
  <SignaturePad aria-label="Agreement signature" />
</template>
```

## Svelte signature pad

```svelte
<script lang="ts">
  import { createSignaturePadAction } from 'signetpad/svelte';

  const { action, controller, snapshot } = createSignaturePadAction();
</script>

<canvas use:action aria-label="Agreement signature"></canvas>
<button type="button" disabled={!$snapshot.canUndo} on:click={() => controller.undo()}>
  Undo
</button>
```

## React Native signature pad

```tsx
import { SignaturePad } from 'signetpad/react-native-svg';

export function SignatureField() {
  return <SignaturePad accessibilityLabel="Agreement signature" />;
}
```

`react`, `vue`, `react-native`, and `react-native-svg` are optional peer dependencies. Install only the ones your app already uses.

## Save, restore, and export

```tsx
import { useRef } from 'react';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react';

export function SignatureField() {
  const padRef = useRef<SignaturePadHandle>(null);

  function persist() {
    const data = padRef.current?.toData();
    const svg = padRef.current?.toSvg({ background: '#ffffff' });
    const png = padRef.current?.toDataURL({ type: 'image/png' });
    return { data, svg, png };
  }

  return <SignaturePad ref={padRef} aria-label="Agreement signature" />;
}
```

Keep `toData()` as the source of truth. Use `toSvg()` when you need a portable image without a browser encoder.

## Tree shaking

Each import path is a separate ESM entry. The core does not import React, Vue, or React Native. Renderers import types only, so a Canvas-only bundle does not include the controller unless you import `signetpad` yourself.

```ts
import { createSignaturePad } from 'signetpad';
import { useSignaturePad } from 'signetpad/react';
import { createCanvasRenderer } from 'signetpad/canvas';
```

Do not import from a barrel of every adapter. There is no `signetpad/all` on purpose.

## Docs and examples

- [Getting started](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/getting-started.mdx)
- [React](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/react.mdx)
- [Vue](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/vue.mdx)
- [SvelteKit](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/sveltekit.mdx)
- [React Native](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/react-native.mdx)
- [API](https://github.com/thevipinmishra/signetpad/blob/main/apps/docs/src/content/docs/api.mdx)

## License

[MIT](./LICENSE)

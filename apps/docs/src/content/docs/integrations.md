---
title: Integrations
description: Choose the smallest adapter for your framework and keep the controller portable.
section: integrations
order: 30
---

## Adapter matrix

| App                | Input adapter             | Rendering options     | Guide                              |
| ------------------ | ------------------------- | --------------------- | ---------------------------------- |
| React, Vite, Remix | `@signetpad/react`        | Canvas, SVG, your own | [React](/docs/react)               |
| Next.js            | `@signetpad/react`        | Canvas, SVG, your own | [Next.js](/docs/nextjs)            |
| React Native       | `@signetpad/react-native` | SVG, Skia, your own   | [React Native](/docs/react-native) |
| Vue 3, Nuxt        | `@signetpad/vue`          | Canvas, SVG, your own | [Vue](/docs/vue)                   |
| Svelte, SvelteKit  | `@signetpad/svelte`       | Canvas, SVG, your own | [SvelteKit](/docs/sveltekit)       |

There is no meta-framework package for every wrapper. Next.js uses React’s client boundary, Nuxt
uses Vue’s client-only boundary, and SvelteKit mounts the action only in the browser.

## The stable contract

Every adapter exposes the same `SignaturePad` controller from `@signetpad/core`:

```ts
const snapshot = controller.getSnapshot();
const data = controller.toData();
controller.undo();
controller.clear();
```

Renderers subscribe to `events: 'all'` for smooth updates. UI labels and buttons usually only need the default state events.

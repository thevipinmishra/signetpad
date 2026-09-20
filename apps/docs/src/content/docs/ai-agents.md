---
title: Using SignetPad with AI agents
description: Compact rules for code assistants integrating the SignetPad signature pad without mixing adapters or flattening vector data.
section: reference
order: 41
---

## Integration rules

1. Install the `signetpad` package and start from `signetpad` types. Keep the controller framework-agnostic.
2. Use exactly one input adapter for a surface: `signetpad/react`, `signetpad/react-native`, `signetpad/vue`, or `signetpad/svelte`.
3. Choose a renderer separately. `signetpad/canvas` and `signetpad/react-native-svg` are optional entries in the same package.
4. Subscribe with `{ events: 'all' }` for drawing updates; use the default state subscription for UI state.
5. Keep `SignatureData` as the source of truth for persistence and validate it through `loadData`.
6. Add a label, focus treatment, keyboard or alternate input path, and undo/redo/clear controls.
7. In SSR frameworks, create the interactive surface in a client boundary.

## Import map

```text
signetpad                  pure controller + types
signetpad/react            React and React-based frameworks
signetpad/react-native     React Native PanResponder adapter
signetpad/vue              Vue 3 and Nuxt adapter
signetpad/svelte           Svelte and SvelteKit action
signetpad/canvas           Canvas 2D renderer
signetpad/react-native-svg React Native SVG renderer
```

Prefer the smallest import that preserves these boundaries. Do not invent a Next.js or Nuxt entry unless the base adapter cannot express the integration.

---
title: For AI agents
description: A compact set of rules for code assistants integrating SignetPad correctly.
section: reference
order: 41
---

## Integration rules

1. Start with `@signetpad/core` types and keep the controller framework-agnostic.
2. Use exactly one input adapter for a surface: React hook, React Native hook, Vue composable, or Svelte action.
3. Choose a renderer separately. Canvas and React Native SVG are optional packages.
4. Subscribe with `{ events: 'all' }` for drawing updates; use the default state subscription for UI state.
5. Keep `SignatureData` as the source of truth for persistence and validate it through `loadData`.
6. Add a label, focus treatment, keyboard or alternate input path, and undo/redo/clear controls.
7. In SSR frameworks, create the interactive surface in a client boundary.

## Package map

```text
@signetpad/core                         pure controller + types
@signetpad/react                        React and React-based frameworks
@signetpad/react-native                 React Native PanResponder adapter
@signetpad/vue                          Vue 3 and Nuxt adapter
@signetpad/svelte                       Svelte and SvelteKit action
@signetpad/renderer-canvas              Canvas 2D renderer
@signetpad/renderer-react-native-svg    React Native SVG renderer
```

Prefer the smallest diff that preserves these boundaries. Do not add a meta-framework-specific package unless the underlying framework cannot use its base adapter.

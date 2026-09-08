# SignetPad

Open-source, type-safe signature input for web and native apps.

SignetPad keeps the input engine separate from framework bindings and renderers:

- `@signetpad/core` — pure TypeScript controller, history, validation, and versioned vector data
- `@signetpad/react` — React, Next.js, Remix, Vite, and Astro-compatible pointer adapter
- `@signetpad/react-native` — React Native PanResponder adapter
- `@signetpad/vue` — Vue 3 and Nuxt composable
- `@signetpad/svelte` — Svelte and SvelteKit action
- `@signetpad/renderer-canvas` — Canvas 2D renderer
- `@signetpad/renderer-react-native-svg` — React Native SVG renderer

The controller is renderer-agnostic, so you can use Skia, SVG, PDF, or a native drawing surface
without changing how signatures are captured or saved.

## Development

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Repository layout

- `packages/core` — input processing, stroke state, history, and serialization
- `packages/react` — React pointer-event adapter
- `packages/react-native` — React Native responder adapter
- `packages/vue` — Vue 3 composable
- `packages/svelte` — Svelte/SvelteKit action
- `packages/renderer-canvas` — Canvas 2D renderer
- `packages/renderer-react-native-svg` — React Native SVG renderer
- `apps/docs` — Astro documentation site with content collections, syntax highlighting, and a live explorer
- `apps/examples` — standalone integration example

## Design principles

- Keep the core dependency-free and framework-agnostic.
- Use the smallest adapter that fits the host framework.
- Persist `SignatureData`, not screenshots.
- Make accessibility the host app's responsibility, with clear guidance and examples.

The docs site is the source of truth for integration patterns:
[signetpad.dev](https://signetpad.dev)

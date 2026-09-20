# SignetPad

[![CI](https://github.com/thevipinmishra/signetpad/actions/workflows/ci.yml/badge.svg)](https://github.com/thevipinmishra/signetpad/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@signetpad/core.svg)](https://www.npmjs.com/package/@signetpad/core)

Open-source, type-safe signature input for web and native apps.

SignetPad captures strokes as versioned vector data. The input engine is separate from
framework bindings and renderers, so the same signature can drive Canvas, SVG, Skia, or PDF.

- Headless, zero-dependency core
- Adapters for React, Next.js, Vue, Nuxt, Svelte, SvelteKit, and React Native
- Optional Canvas and React Native SVG renderers
- Undo, redo, validation, and portable `toData()` / `toSvg()` exports

Docs: [signetpad.dev](https://signetpad.dev)

## Install

```sh
pnpm add @signetpad/core @signetpad/react @signetpad/renderer-canvas
```

```sh
npm install @signetpad/core @signetpad/react @signetpad/renderer-canvas
```

Pick a different adapter from the [package list](#packages) when you are not on React.

## Quick start

```tsx
import { useLayoutEffect, useRef } from 'react';
import { useSignaturePad } from '@signetpad/react';
import { createCanvasRenderer } from '@signetpad/renderer-canvas';

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

Save the editable payload with `controller.toData()`. Export a standalone SVG with
`controller.toSvg()`, or a browser image with the Canvas renderer.

## Packages

| Package                                                                        | Role                                                                       |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| [`@signetpad/core`](./packages/core)                                           | Pure TypeScript controller, history, validation, and versioned vector data |
| [`@signetpad/react`](./packages/react)                                         | Pointer-event adapter for React, Next.js, Remix, Vite, and Astro           |
| [`@signetpad/react-native`](./packages/react-native)                           | PanResponder adapter for React Native                                      |
| [`@signetpad/vue`](./packages/vue)                                             | Vue 3 / Nuxt composable                                                    |
| [`@signetpad/svelte`](./packages/svelte)                                       | Svelte / SvelteKit action                                                  |
| [`@signetpad/renderer-canvas`](./packages/renderer-canvas)                     | Canvas 2D renderer and browser image export                                |
| [`@signetpad/renderer-react-native-svg`](./packages/renderer-react-native-svg) | React Native SVG renderer                                                  |

The controller is renderer-agnostic. You can keep these packages or draw `getStrokes()` yourself.

All published packages are **ESM-only** and require Node.js 18.17 or newer for tooling. Browser
and React Native consumers import them through the usual bundler or Metro pipeline.

## Design principles

- Keep the core dependency-free and framework-agnostic.
- Use the smallest adapter that fits the host framework.
- Persist `SignatureData`, not screenshots.
- Make accessibility the host app's responsibility, with clear guidance and examples.

## Why this name

SignetPad is a deliberate name, not a generic `signature-pad` fork. A signet is a personal seal;
the pad is the capture surface. The scoped `@signetpad/*` packages stay distinct from the popular
canvas-coupled [`signature_pad`](https://www.npmjs.com/package/signature_pad) library while still
reading as a signature primitive.

If a shorter product wordmark is useful, **signet.pad** matches the package scope. The npm and
GitHub name should stay `signetpad` so the brand does not collide with existing Signet
authentication or age-verification projects.

## Development

```sh
pnpm install
pnpm check
```

Useful individual commands:

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm format
```

### Repository layout

- `packages/core` — input processing, stroke state, history, and serialization
- `packages/react` — React pointer-event adapter
- `packages/react-native` — React Native responder adapter
- `packages/vue` — Vue 3 composable
- `packages/svelte` — Svelte/SvelteKit action
- `packages/renderer-canvas` — Canvas 2D renderer
- `packages/renderer-react-native-svg` — React Native SVG renderer
- `apps/docs` — Astro documentation site
- `apps/examples` — standalone React + Canvas example

## Documentation

The docs site is the source of truth for integration patterns:

- [Getting started](https://signetpad.dev/docs/getting-started)
- [Examples](https://signetpad.dev/docs/examples)
- [API](https://signetpad.dev/docs/api)
- [AI agent guide](https://signetpad.dev/docs/ai-agents)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup, pull request expectations, and the
release flow. Security reports belong in [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE)

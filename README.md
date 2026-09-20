# SignetPad

[![CI](https://github.com/thevipinmishra/signetpad/actions/workflows/ci.yml/badge.svg)](https://github.com/thevipinmishra/signetpad/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/signetpad.svg)](https://www.npmjs.com/package/signetpad)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](./LICENSE)

**SignetPad** is a headless TypeScript signature pad for React, Next.js, Vue, Nuxt, Svelte, SvelteKit, and React Native. Capture handwritten signatures as versioned vector strokes, undo and redo, then export SVG or a browser image.

One npm package. Dedicated import paths. Tree-shaking friendly.

```sh
pnpm add signetpad
```

```sh
npm install signetpad
```

```tsx
import { useSignaturePad } from 'signetpad/react';
import { createCanvasRenderer } from 'signetpad/canvas';
```

## Features

- Headless, zero-dependency signature controller
- React, Vue, Svelte, and React Native adapters
- Canvas renderer with PNG, JPEG, and WebP export
- React Native SVG renderer
- Undo, redo, validation, and portable `toData()` / `toSvg()`
- ESM-only entries so unused adapters are dropped from the bundle

## Import paths

| Import                       | Role                                                     |
| ---------------------------- | -------------------------------------------------------- |
| `signetpad`                  | Controller, history, validation, vector data, SVG export |
| `signetpad/react`            | React and Next.js pointer adapter                        |
| `signetpad/vue`              | Vue 3 and Nuxt composable                                |
| `signetpad/svelte`           | Svelte and SvelteKit action                              |
| `signetpad/react-native`     | React Native PanResponder adapter                        |
| `signetpad/canvas`           | Canvas 2D renderer                                       |
| `signetpad/react-native-svg` | React Native SVG renderer                                |

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

See [`packages/signetpad/README.md`](./packages/signetpad/README.md) for Vue, Svelte, and React Native examples.

## Documentation

- [Getting started](./apps/docs/src/content/docs/getting-started.md)
- [Examples](./apps/docs/src/content/docs/examples.md)
- [API](./apps/docs/src/content/docs/api.md)
- [Integrations](./apps/docs/src/content/docs/integrations.md)

Run the docs site locally with `pnpm --filter @signetpad/docs dev`.

## Development

```sh
pnpm install
pnpm check
```

This repository is a small workspace: `packages/signetpad` is the published library, `apps/docs` is the documentation site, and `apps/examples` is a React + Canvas demo.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Security reports belong in [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE)

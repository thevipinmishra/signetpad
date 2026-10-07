# SignetPad

[![npm](https://img.shields.io/npm/v/signetpad.svg)](https://www.npmjs.com/package/signetpad)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](./LICENSE)

**SignetPad** is a headless TypeScript signature pad for React, Vue, Svelte, Solid, Angular, and
React Native. Capture handwritten signatures as versioned vector strokes. Undo and redo strokes.
Export SVG or PNG, JPEG, and WebP in the browser.

Use the React adapter in Next.js. Use the Vue adapter in Nuxt. Use the Svelte action in SvelteKit.

One npm package. Dedicated import paths. Unused adapters stay out of the app bundle.

```sh
pnpm add signetpad
```

```sh
npm install signetpad
```

```tsx
import { SignaturePad } from 'signetpad/react';

export function SignatureField() {
  return <SignaturePad aria-label="Agreement signature" />;
}
```

## Features

- `SignaturePad` components for React, Vue, Svelte, and React Native
- Headless signature controller with no runtime dependencies
- Solid hook and Angular canvas attach helper
- Canvas renderer with PNG, JPEG, and WebP export
- React Native SVG renderer
- Undo, redo, `loadData()` checks, and portable `toData()` / `toSvg()`
- Optional pressure-aware width and curve fitting
- ESM-only entries. Bundlers omit unused adapters from the app bundle.

## Import paths

| Import                                 | Role                                                              |
| -------------------------------------- | ----------------------------------------------------------------- |
| `signetpad`                            | Controller, history, `loadData()` checks, vector data, SVG export |
| `signetpad/react`                      | React `SignaturePad` + `useSignaturePad`                          |
| `signetpad/vue`                        | Vue `SignaturePad` + composable                                   |
| `signetpad/svelte`                     | Svelte action with automatic canvas painting                      |
| `signetpad/svelte/SignaturePad.svelte` | Ready-made Svelte field                                           |
| `signetpad/solid`                      | Solid `useSignaturePad` hook                                      |
| `signetpad/angular`                    | Angular canvas attach helper                                      |
| `signetpad/react-native`               | React Native PanResponder hook                                    |
| `signetpad/canvas`                     | Canvas 2D renderer                                                |
| `signetpad/react-native-svg`           | Native `SignaturePad` + `SignatureSvg`                            |

## React signature pad

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

See [`packages/signetpad/README.md`](./packages/signetpad/README.md) for Vue, Svelte, Solid, Angular,
and React Native examples.

## Limits

- Ink is a polyline by default. Set `behavior.curveFitting` for cubic curves.
- Points keep pressure metadata. Set `behavior.pressureWidth` to use it for stroke width.
- React Native exposes `toSvg()`. It does not expose `toDataURL` or `toBlob`.
- The package is ESM-only. Tooling needs Node.js 18.17+.

## Documentation

- [Getting started](./apps/docs/src/content/docs/getting-started.md)
- [Examples](./apps/docs/src/content/docs/examples.md)
- [API](./apps/docs/src/content/docs/api.md)
- [Integrations](./apps/docs/src/content/docs/integrations.md)
- [llm.txt](./apps/docs/public/llm.txt)

Run the docs site locally with `pnpm docs`.

## Development

```sh
pnpm install
pnpm build
pnpm check
```

This repository is a small workspace: `packages/signetpad` is the published library, `apps/docs` is
the documentation site, and the demo apps live under `apps/examples*` (React, Vue, Svelte, Expo).

```sh
pnpm docs
pnpm examples
pnpm examples:vue
pnpm examples:svelte
pnpm examples:expo
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Security reports belong in [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE)

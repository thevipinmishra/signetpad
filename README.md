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
import { SignaturePad } from 'signetpad/react';

export function SignatureField() {
  return <SignaturePad aria-label="Agreement signature" />;
}
```

## Features

- Ready-made `SignaturePad` components for React, Vue, and React Native
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
| `signetpad/react`            | React `SignaturePad` + `useSignaturePad`                 |
| `signetpad/vue`              | Vue `SignaturePad` + composable                          |
| `signetpad/svelte`           | Svelte action with automatic canvas painting             |
| `signetpad/react-native`     | React Native PanResponder hook                           |
| `signetpad/canvas`           | Canvas 2D renderer                                       |
| `signetpad/react-native-svg` | Native `SignaturePad` + `SignatureSvg`                   |

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

See [`packages/signetpad/README.md`](./packages/signetpad/README.md) for Vue, Svelte, and React Native examples.

## Documentation

- [Getting started](./apps/docs/src/content/docs/getting-started.mdx)
- [Examples](./apps/docs/src/content/docs/examples.mdx)
- [API](./apps/docs/src/content/docs/api.mdx)
- [Integrations](./apps/docs/src/content/docs/integrations.mdx)

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

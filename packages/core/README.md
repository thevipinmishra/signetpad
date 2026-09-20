# @signetpad/core

The framework-agnostic controller behind SignetPad. It records normalized points, keeps
per-stroke history, validates loaded data, and returns portable vector payloads.

[Docs](https://signetpad.dev/docs/api) · [GitHub](https://github.com/thevipinmishra/signetpad)

## Install

```sh
pnpm add @signetpad/core
```

This package is ESM-only.

## Capture points

```ts
import { createSignaturePad } from '@signetpad/core';

const pad = createSignaturePad({
  viewport: { width: 600, height: 240 },
  stroke: { color: '#102935', width: 2.5 },
});

pad.begin({ x: 80, y: 120, pointerType: 'pen' });
pad.move({ x: 120, y: 118, pressure: 0.7 });
pad.end();

const signature = pad.toData();
```

## Restore a saved signature

```ts
pad.loadData(signature, { resetHistory: true });
const bounds = pad.getSnapshot().bounds;
```

## Export SVG

`toSvg()` produces a standalone vector image without requiring a browser or canvas:

```ts
const svg = pad.toSvg({ background: '#ffffff' });
```

Keep `toData()` for editable state. Use `@signetpad/renderer-canvas` when you need a browser
PNG, JPEG, WebP, or `Blob` export.

The core does not create a surface or draw pixels. Connect an input adapter, then render
`pad.getStrokes()` with Canvas, SVG, Skia, PDF, or your own renderer.

## License

MIT

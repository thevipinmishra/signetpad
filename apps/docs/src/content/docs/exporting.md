---
title: Export SignetPad signatures
description: Export SignetPad vector signatures to SVG, or use the Canvas renderer for PNG, JPEG, and WebP downloads.
section: start
order: 25
---

SignetPad stores vectors. Keep `toData()` when a signature might need to be restored, reviewed, or rendered at a new size. Export an image only when another system needs one.

## Create a portable SVG

`toSvg()` ships on the `signetpad` controller, so it works in browsers, servers, and native JavaScript runtimes. The result is a standalone image string with no canvas dependency.

```ts
const svg = controller.toSvg({
  background: '#ffffff',
});

await storage.put('signature.svg', svg, {
  contentType: 'image/svg+xml',
});
```

Single-point signatures become SVG circles; longer strokes become paths. Styles, line caps, joins, opacity, and the original viewport are retained.

## Download a browser image

The Canvas renderer exposes the browser's encoder. PNG is the default and keeps transparent pixels. JPEG and WebP are also available when the active browser supports them.

```ts
const context = canvas.getContext('2d');
if (!context) throw new Error('Canvas 2D is unavailable');

const renderer = createCanvasRenderer(context, {
  viewport: controller.getViewport(),
  dpr: window.devicePixelRatio,
});

renderer.render(controller.getStrokes());

const href = renderer.toDataURL({
  type: 'image/webp',
  quality: 0.9,
});

const link = document.createElement('a');
link.href = href;
link.download = 'signature.webp';
link.click();
```

For upload APIs, use a `Blob` instead of a data URL:

```ts
const file = await renderer.toBlob({ type: 'image/png' });
await fetch('/api/signatures', {
  method: 'POST',
  body: file,
  headers: { 'content-type': file.type },
});
```

The canvas encoder only knows formats supported by the browser. For a predictable exchange format across web, server, and native surfaces, use `toSvg()` or the original `SignatureData`.

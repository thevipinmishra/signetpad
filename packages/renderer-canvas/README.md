# @signetpad/renderer-canvas

A Canvas 2D renderer for `@signetpad/core`. It supports full redraws and efficient updates
while a stroke is being captured.

## Render live strokes

```ts
const context = canvas.getContext('2d');
if (!context) throw new Error('Canvas 2D is unavailable');

const renderer = createCanvasRenderer(context, {
  viewport: { width: 600, height: 240 },
  dpr: window.devicePixelRatio,
});

renderer.render(pad.getStrokes());

const unsubscribe = pad.subscribe(
  () => {
    renderer.update(pad.getStrokes());
  },
  { events: 'all' },
);
```

The renderer changes the canvas backing dimensions and drawing context. Style the canvas, attach
input, and provide accessible controls in the host component.

## Export a browser image

```ts
const href = renderer.toDataURL({ type: 'image/webp', quality: 0.9 });
const image = await renderer.toBlob({ type: 'image/png' });
```

`toDataURL()` is available on HTML canvas. `toBlob()` supports both HTML canvas and OffscreenCanvas
when the current runtime provides an encoder.

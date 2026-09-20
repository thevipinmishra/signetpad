---
title: Getting started with SignetPad
description: Install the SignetPad signature pad and connect a React, Vue, Svelte, or React Native surface in a few minutes.
section: start
order: 10
---

SignetPad is a headless signature pad. One npm package, `signetpad`, exposes dedicated import paths for the controller, each framework adapter, and each renderer.

## The mental model

1. **`signetpad`** records validated vector points, history, and versioned data.
2. **Adapters** (`signetpad/react`, `signetpad/vue`, `signetpad/svelte`, `signetpad/react-native`) translate host input into core points.
3. **Renderers** (`signetpad/canvas`, `signetpad/react-native-svg`) draw the current strokes.

That split means you can swap Canvas for SVG, use the same saved data on a server, or bring your own renderer without rewriting input handling.

## Install SignetPad

Pick a package manager in the command above. One command installs the whole library. Import only the paths you use so unused adapters are tree-shaken out. For other stacks, see the [integration matrix](/docs/integrations).

## Create a React signature pad

```tsx
import { useLayoutEffect, useRef } from 'react';
import { useSignaturePad } from 'signetpad/react';
import { createCanvasRenderer } from 'signetpad/canvas';

const viewport = { width: 600, height: 240 };

export function SignatureField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { controller, surfaceRef, surfaceProps } = useSignaturePad({ viewport });

  useLayoutEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const renderer = createCanvasRenderer(context, { viewport, dpr: devicePixelRatio });
    renderer.render(controller.getStrokes());
    return controller.subscribe(() => renderer.update(controller.getStrokes()), { events: 'all' });
  }, [controller]);

  return (
    <canvas
      ref={(node) => {
        canvasRef.current = node;
        surfaceRef(node);
      }}
      style={{ touchAction: 'none' }}
      {...surfaceProps}
      aria-label="Signature input"
    />
  );
}
```

`surfaceProps` handles pointer input only. Add the label, instructions, focus treatment,
undo/redo controls, and typed fallback that belong in your product. Set `touch-action: none`
on the drawing surface so mobile browsers do not scroll while someone is signing.

## Save and restore

```ts
const data = controller.toData();
localStorage.setItem('signature', JSON.stringify(data));
controller.loadData(JSON.parse(localStorage.getItem('signature')!), { resetHistory: true });
```

The data is versioned and portable. Keep it as JSON when you need to edit or replay the signature; export pixels only at the boundary where a downstream system requires them.

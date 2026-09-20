---
title: Getting started
description: Install the core and connect a signature surface in a few minutes.
section: start
order: 10
---

## The mental model

SignetPad is three small layers:

1. **Core** records validated vector points, history, and versioned data.
2. **Adapters** translate browser or native input into core points.
3. **Renderers** draw the current strokes wherever your app needs them.

That separation means you can swap Canvas for SVG, use the same saved data on a server, or bring your own renderer without rewriting input handling.

## Install the pieces

Pick a package manager in the install panel above. That command sets up the core, the React input
adapter, and the Canvas renderer. For other stacks, use the [integration matrix](/docs/integrations).

## Create your first pad

```tsx
import { useLayoutEffect, useRef } from 'react';
import { useSignaturePad } from '@signetpad/react';
import { createCanvasRenderer } from '@signetpad/renderer-canvas';

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

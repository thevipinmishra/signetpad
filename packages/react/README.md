# @signetpad/react

A typed hook that maps DOM Pointer Events to `@signetpad/core`. It works in React, Next.js,
Remix, Vite, and React islands.

[Docs](https://signetpad.dev/docs/react) · [GitHub](https://github.com/thevipinmishra/signetpad)

## Install

```sh
pnpm add @signetpad/react @signetpad/renderer-canvas
```

Peer dependency: `react` >= 18. This package is ESM-only.

`enabled` and `preventDefault` stay live across renders. Viewport, stroke style, and behavior
are initial values; call `controller.setViewport`, `setStrokeStyle`, or `setBehavior` to change
them later. `controller` is the preferred name; `pad` is an alias.

## Connect a canvas surface

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

`surfaceProps` handles input. Your component supplies the label, instructions, focus treatment,
action buttons, and typed fallback.

## License

MIT

---
title: Solid
description: Headless Solid hook for SignetPad.
section: integrations
order: 36
---

```tsx
import { onMount } from 'solid-js';
import { attachCanvasRenderer } from 'signetpad/canvas';
import { useSignaturePad } from 'signetpad/solid';

export function SignatureField() {
  const { controller, snapshot, surfaceProps, setSurface } = useSignaturePad({
    viewport: { width: 600, height: 240 },
  });
  let canvas!: HTMLCanvasElement;

  onMount(() => {
    setSurface(canvas);
    const attached = attachCanvasRenderer(canvas, controller);
    return () => attached?.detach();
  });

  return (
    <div>
      <canvas ref={canvas!} width={600} height={240} aria-label="Signature" {...surfaceProps} />
      <button type="button" disabled={!snapshot().canUndo} onClick={() => controller.undo()}>
        Undo
      </button>
    </div>
  );
}
```

`solid-js` is an optional peer dependency. Install it only when you import `signetpad/solid`.

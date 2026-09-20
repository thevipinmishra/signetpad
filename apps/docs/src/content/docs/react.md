---
title: React
description: SignaturePad for React, plus the hook for a custom surface.
section: integrations
order: 31
---

```tsx
import { SignaturePad } from 'signetpad/react';

export function SignatureField() {
  return <SignaturePad aria-label="Signature" />;
}
```

`SignaturePad` captures pointer input and paints the canvas. Give it an `aria-label`. Props include `viewport`, `stroke`, `behavior`, `enabled`, `preventDefault`, and `onSnapshot`.

## Undo, redo, and clear

```tsx
import { useRef, useState } from 'react';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react';
import type { SignatureSnapshot } from 'signetpad';

export function SignatureField() {
  const padRef = useRef<SignaturePadHandle>(null);
  const [snapshot, setSnapshot] = useState<SignatureSnapshot | null>(null);

  return (
    <div>
      <SignaturePad ref={padRef} aria-label="Signature" onSnapshot={setSnapshot} />
      <button type="button" onClick={() => padRef.current?.undo()} disabled={!snapshot?.canUndo}>
        Undo
      </button>
      <button type="button" onClick={() => padRef.current?.redo()} disabled={!snapshot?.canRedo}>
        Redo
      </button>
      <button type="button" onClick={() => padRef.current?.clear()} disabled={snapshot?.isEmpty}>
        Clear
      </button>
    </div>
  );
}
```

The handle also has `toData()`, `loadData()`, `toSvg()`, `toDataURL()`, and `toBlob()`. See [Export](/docs/exporting).

## Custom surface

Use the hook when you are not drawing to a canvas.

```tsx
import { useSignaturePad } from 'signetpad/react';

export function SignatureField() {
  const { controller, snapshot, surfaceRef, surfaceProps } = useSignaturePad({
    viewport: { width: 600, height: 240 },
  });

  return (
    <div>
      <svg
        ref={surfaceRef}
        width={600}
        height={240}
        style={{ touchAction: 'none' }}
        aria-label="Signature"
        {...surfaceProps}
      />
      <button type="button" onClick={() => controller.undo()} disabled={!snapshot.canUndo}>
        Undo
      </button>
    </div>
  );
}
```

You paint the strokes yourself. Subscribe with `{ events: 'all' }` if the renderer needs every point.

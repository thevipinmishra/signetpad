---
title: Export
description: Download SVG, PNG, JPEG, or WebP from a signature field.
section: start
order: 25
---

Keep `toData()` when you may restore the signature later. Export an image when another system needs a file.

## SVG or PNG

`toSvg()` works without a canvas. `toDataURL()` uses the mounted canvas.

```tsx
import { useRef, useState } from 'react';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react';
import type { SignatureSnapshot } from 'signetpad';

export function ExportField() {
  const padRef = useRef<SignaturePadHandle>(null);
  const [snapshot, setSnapshot] = useState<SignatureSnapshot | null>(null);

  function downloadSvg() {
    const svg = padRef.current?.toSvg({ background: '#ffffff' });
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'signature.svg';
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadPng() {
    const href = padRef.current?.toDataURL({ type: 'image/png' });
    if (!href) return;
    const link = document.createElement('a');
    link.href = href;
    link.download = 'signature.png';
    link.click();
  }

  return (
    <div>
      <SignaturePad ref={padRef} aria-label="Signature" onSnapshot={setSnapshot} />
      <button type="button" onClick={downloadSvg} disabled={snapshot?.isEmpty}>
        Download SVG
      </button>
      <button type="button" onClick={downloadPng} disabled={snapshot?.isEmpty}>
        Download PNG
      </button>
    </div>
  );
}
```

JPEG and WebP use the same helper:

```ts
padRef.current?.toDataURL({ type: 'image/webp', quality: 0.9 });
```

For uploads, use a blob:

```ts
const file = await padRef.current?.toBlob({ type: 'image/png' });
if (file) {
  await fetch('/api/signatures', {
    method: 'POST',
    body: file,
    headers: { 'content-type': file.type },
  });
}
```

## SVG on a server

`toSvg()` also lives on the core controller, so it works in Node without a DOM.

```ts
import { createSignaturePad } from 'signetpad';
import type { SignatureData } from 'signetpad';

export function signatureToSvg(data: SignatureData): string {
  const pad = createSignaturePad();
  pad.loadData(data);
  return pad.toSvg({ background: '#ffffff' });
}
```

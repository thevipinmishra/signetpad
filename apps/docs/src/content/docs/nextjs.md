---
title: Next.js
description: Use the React adapter inside a small client component boundary.
section: integrations
order: 32
---

Next.js does not need a second signature-specific adapter. Keep the server-rendered page clean and move only the interactive field behind a client boundary.

```tsx
'use client';
import { useSignaturePad } from '@signetpad/react';

export function SignatureField() {
  const { surfaceRef, surfaceProps } = useSignaturePad({ viewport: { width: 600, height: 240 } });
  return (
    <canvas
      ref={surfaceRef}
      style={{ touchAction: 'none' }}
      {...surfaceProps}
      aria-label="Signature input"
    />
  );
}
```

Import that component from a Server Component as usual. Do not create the pad during server rendering; the hook creates it in the client component’s lifecycle. For a dynamic client-only import, use `next/dynamic` with `ssr: false` when the surrounding component tree makes that boundary more convenient.

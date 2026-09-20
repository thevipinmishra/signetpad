---
title: Next.js
description: Use the React SignaturePad in a Client Component.
section: integrations
order: 32
---

Next.js uses the React adapter. Keep the pad in a Client Component.

```tsx
'use client';

import { SignaturePad } from 'signetpad/react';

export function SignatureField() {
  return <SignaturePad aria-label="Signature" />;
}
```

Import that component from a Server Component:

```tsx
import { SignatureField } from './signature-field';

export default function ContractPage() {
  return <SignatureField />;
}
```

If a client boundary is awkward, load the field with `next/dynamic` and `ssr: false`. Undo, save, and export are the same as [React](/docs/react).

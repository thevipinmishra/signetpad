---
title: Getting started
description: Install SignetPad and add a signature field.
section: start
order: 10
---

SignetPad captures signatures as vector strokes. Install one package, then import the field for your framework.

## React

```tsx
import { SignaturePad } from 'signetpad/react';

export function SignatureField() {
  return <SignaturePad aria-label="Signature" />;
}
```

In Next.js, put `'use client'` at the top of that file. See [Next.js](/docs/nextjs).

Other frameworks: [Vue](/docs/vue), [Svelte](/docs/sveltekit), [React Native](/docs/react-native).

## More

- [Examples](/docs/examples) — forms, drafts, and stroke style
- [Export](/docs/exporting) — SVG, PNG, JPEG, and WebP
- [API](/docs/api) — handle methods, data format, and options

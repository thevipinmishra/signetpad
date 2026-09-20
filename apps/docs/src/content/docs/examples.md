---
title: Examples
description: Forms, drafts, stroke style, and more than one signer.
section: start
order: 20
---

## Form field

Accept a drawn signature or a typed name.

```tsx
import { useRef, useState, type FormEvent } from 'react';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react';

export function AgreementForm() {
  const padRef = useRef<SignaturePadHandle>(null);
  const [typedName, setTypedName] = useState('');
  const [status, setStatus] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const empty = padRef.current?.snapshot.isEmpty ?? true;
    if (empty && !typedName.trim()) {
      setStatus('Draw a signature or enter a name.');
      return;
    }

    const signature = empty ? null : padRef.current?.toData();
    setStatus(signature ? 'Signature ready.' : 'Typed name ready.');
  }

  return (
    <form onSubmit={onSubmit}>
      <SignaturePad ref={padRef} aria-label="Signature" />
      <label>
        Type a name instead
        <input
          type="text"
          autoComplete="name"
          value={typedName}
          onChange={(event) => setTypedName(event.target.value)}
        />
      </label>
      <button type="submit">Submit</button>
      <p role="status">{status}</p>
    </form>
  );
}
```

## Save and restore

Store `toData()` as JSON. That payload can be loaded later at any size.

```tsx
import { useRef } from 'react';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react';
import type { SignatureData } from 'signetpad';

const storageKey = 'signature';

export function DraftField() {
  const padRef = useRef<SignaturePadHandle>(null);

  function save() {
    const data = padRef.current?.toData();
    if (!data || data.strokes.length === 0) return;
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function restore() {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    padRef.current?.loadData(JSON.parse(raw) as SignatureData);
  }

  return (
    <div>
      <SignaturePad ref={padRef} aria-label="Signature draft" />
      <button type="button" onClick={save}>
        Save
      </button>
      <button type="button" onClick={restore}>
        Restore
      </button>
    </div>
  );
}
```

## Stroke color and width

Style props apply to the next stroke. Existing strokes stay as they were drawn.

```tsx
import { useState } from 'react';
import { SignaturePad } from 'signetpad/react';

export function StyledField() {
  const [color, setColor] = useState('#102935');
  const [width, setWidth] = useState(2.5);

  return (
    <div>
      <SignaturePad aria-label="Signature" stroke={{ color, width }} />
      <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
      <input
        type="range"
        min={1}
        max={8}
        step={0.5}
        value={width}
        onChange={(event) => setWidth(Number(event.target.value))}
      />
    </div>
  );
}
```

## Read-only copy

Load saved data and turn drawing off.

```tsx
import { useEffect, useRef } from 'react';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react';
import type { SignatureData } from 'signetpad';

export function ReviewSignature({ saved }: { saved: SignatureData }) {
  const padRef = useRef<SignaturePadHandle>(null);

  useEffect(() => {
    padRef.current?.loadData(saved);
  }, [saved]);

  return <SignaturePad ref={padRef} aria-label="Saved signature" enabled={false} />;
}
```

## Two signers

Use one pad per person. Do not share a ref — each field needs its own history.

```tsx
import { useRef } from 'react';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react';

export function DualSignature() {
  const customerRef = useRef<SignaturePadHandle>(null);
  const witnessRef = useRef<SignaturePadHandle>(null);

  function collect() {
    return {
      customer: customerRef.current?.toData() ?? null,
      witness: witnessRef.current?.toData() ?? null,
    };
  }

  return (
    <div>
      <SignaturePad ref={customerRef} aria-label="Customer signature" />
      <SignaturePad ref={witnessRef} aria-label="Witness signature" />
      <button type="button" onClick={() => console.log(collect())}>
        Collect
      </button>
    </div>
  );
}
```

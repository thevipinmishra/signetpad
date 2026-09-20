---
title: React Native
description: SignaturePad for React Native, with SVG rendering.
section: integrations
order: 33
---

Install `react-native-svg` next to `signetpad`.

```sh
npm install signetpad react-native-svg
```

```tsx
import { SignaturePad } from 'signetpad/react-native-svg';

export function SignatureField() {
  return <SignaturePad accessibilityLabel="Signature" />;
}
```

## Undo and clear

```tsx
import { useRef, useState } from 'react';
import { Button, View } from 'react-native';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react-native-svg';
import type { SignatureSnapshot } from 'signetpad';

export function SignatureField() {
  const padRef = useRef<SignaturePadHandle>(null);
  const [snapshot, setSnapshot] = useState<SignatureSnapshot | null>(null);

  return (
    <View>
      <SignaturePad
        ref={padRef}
        accessibilityLabel="Signature"
        viewport={{ width: 360, height: 180 }}
        onSnapshot={setSnapshot}
      />
      <Button title="Undo" disabled={!snapshot?.canUndo} onPress={() => padRef.current?.undo()} />
      <Button title="Clear" disabled={snapshot?.isEmpty} onPress={() => padRef.current?.clear()} />
    </View>
  );
}
```

## Custom renderer

Use the hook when you draw with Skia or another native surface.

```tsx
import { View } from 'react-native';
import { useSignaturePad } from 'signetpad/react-native';
import { SignatureSvg } from 'signetpad/react-native-svg';

export function SignatureField() {
  const { controller, panHandlers } = useSignaturePad({
    viewport: { width: 360, height: 180 },
  });

  return (
    <View {...panHandlers} accessible accessibilityLabel="Signature">
      <SignatureSvg pad={controller} />
    </View>
  );
}
```

Pass `pad={controller}` so the SVG updates while a stroke is in progress. Passing `strokes={controller.getStrokes()}` only updates on React re-render.

---
title: SignetPad examples
description: Production patterns for a SignetPad checkout signature field, drafts, typed fallbacks, and image export.
section: start
order: 20
---

## A checkout signature field

Use the controller for capture and keep form rules in the component. This example accepts either a drawn signature or a typed name.

```tsx
const { controller, snapshot, surfaceRef, surfaceProps } = useSignaturePad({
  viewport: { width: 720, height: 280 },
  stroke: { color: '#102935', width: 2.5 },
});

function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (snapshot.isEmpty && !typedName.trim()) {
    setMessage('Draw a signature or enter the signatory name.');
    return;
  }

  const signature = snapshot.isEmpty ? null : controller.toData();
  saveAgreement({ signature, typedName });
}
```

The visual surface needs a label, instructions, focus styling, clear and undo actions, and a typed fallback. The controller does not impose any of that UI.

## Save a draft, then restore it

Persist versioned vector data, not a canvas export. You can render the same value at a different size later.

```ts
const storageKey = 'checkout-signature';

function saveDraft() {
  localStorage.setItem(storageKey, JSON.stringify(controller.toData()));
}

function restoreDraft() {
  const value = localStorage.getItem(storageKey);
  if (!value) return false;

  controller.loadData(JSON.parse(value), { resetHistory: true });
  return true;
}
```

## Customize future strokes

Style changes do not mutate the signature someone already made. They affect the next stroke, which keeps audit trails predictable.

```tsx
const [color, setColor] = useState('#102935');
const [width, setWidth] = useState(2.5);

useEffect(() => {
  controller.setStrokeStyle({ color, width });
}, [color, controller, width]);
```

## Render a review-only copy

A pad can be input-only, display-only, or both. Use the same data for a receipt, a review screen, or a PDF export path.

```tsx
const readonlyPad = createSignaturePad();
readonlyPad.loadData(savedSignature);

const context = canvas.getContext('2d');
const renderer = context
  ? createCanvasRenderer(context, { viewport: savedSignature.viewport, dpr: devicePixelRatio })
  : null;

renderer?.render(readonlyPad.getStrokes());
```

For React Native, pass the same data to `SignatureSvg`. For a custom SVG, Skia, or PDF renderer, iterate over `SignatureStroke[]` and draw each point sequence in your own surface.

## Download an image

Keep the vector data as the source of truth, then export a file where a downstream system expects one. `toSvg()` works in the headless core; the Canvas renderer handles browser image encoders.

```tsx
const exportImage = () => {
  const href = renderer.toDataURL({ type: 'image/png' });
  const link = document.createElement('a');
  link.href = href;
  link.download = 'signature.png';
  link.click();
};

const exportSvg = () => {
  const blob = new Blob([controller.toSvg()], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'signature.svg';
  link.click();
};
```

The interactive example includes PNG, JPEG, WebP, and SVG download controls.

## Multi-signer forms

Create one controller per signer. Persist each payload with the identity it belongs to, and keep a separate completion state for the overall form.

```ts
type Signer = 'customer' | 'witness';

const signatures: Record<Signer, SignatureData | null> = {
  customer: null,
  witness: null,
};

signatures.customer = customerPad.toData();
signatures.witness = witnessPad.toData();
```

Avoid sharing a controller between two fields. Each signature needs its own undo history, viewport, and lifecycle.

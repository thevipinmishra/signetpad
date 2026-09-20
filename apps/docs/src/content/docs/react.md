---
title: React
description: A typed hook for React, Vite, Remix, and React-based app shells.
section: integrations
order: 31
---

## Install

```bash
pnpm add @signetpad/react @signetpad/renderer-canvas
```

## Connect the hook

```tsx
const { controller, snapshot, surfaceRef, surfaceProps } = useSignaturePad({
  viewport: { width: 600, height: 240 },
});
return (
  <canvas
    ref={surfaceRef}
    {...surfaceProps}
    width={600}
    height={240}
    tabIndex={0}
    style={{ touchAction: 'none' }}
    aria-label="Signature input"
  />
);
```

The hook owns the controller for the lifetime of the component and keeps `snapshot` reactive. Use the controller for commands and subscribe separately when your renderer needs point-level updates. `enabled` and `preventDefault` stay live; call `setViewport`, `setStrokeStyle`, or `setBehavior` to change capture settings after mount.

## Render with Canvas

```tsx
useEffect(() => {
  const context = canvasRef.current?.getContext('2d');
  if (!context) return;
  const renderer = createCanvasRenderer(context, { viewport, dpr: devicePixelRatio });
  renderer.render(controller.getStrokes());
  return controller.subscribe(() => renderer.update(controller.getStrokes()), { events: 'all' });
}, [controller]);
```

## Accessibility checklist

- Give the surface a visible or programmatic label.
- Add a focus ring and an instruction describing the input methods.
- Provide undo, redo, and clear buttons with disabled states.
- Offer a typed-name alternative when a drawn signature is not practical.
- Announce meaningful saves and errors with a polite live region.

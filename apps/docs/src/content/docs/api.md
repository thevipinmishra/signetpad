---
title: API reference
description: The small, stable controller contract shared by every adapter.
section: reference
order: 40
---

## Controller methods

| Method                                   | Purpose                                                |
| ---------------------------------------- | ------------------------------------------------------ |
| `begin(point)` / `move(point)` / `end()` | Capture one stroke.                                    |
| `cancel()`                               | Discard the active stroke.                             |
| `undo()` / `redo()`                      | Move through stroke history.                           |
| `clear()` / `reset()`                    | Remove strokes, with or without history.               |
| `toData()` / `loadData(data)`            | Serialize or restore versioned vector data.            |
| `toSvg(options?)`                        | Export a standalone SVG without a DOM or canvas.       |
| `getStrokes()`                           | Read a cloned list of current strokes.                 |
| `getSnapshot()`                          | Read empty, drawing, history, count, and bounds state. |
| `setViewport(viewport)`                  | Update the logical drawing dimensions.                 |
| `setStrokeStyle(style)`                  | Set color, width, opacity, cap, and join.              |
| `setBehavior(behavior)`                  | Set smoothing, point spacing, and tap-dot behavior.    |
| `subscribe(listener, options)`           | Listen to all input events or semantic state changes.  |

## Data is versioned

```ts
type SignatureData = {
  version: 1;
  viewport: { width: number; height: number };
  strokes: SignatureStroke[];
};
```

Every returned object is cloned. You can safely modify the result of `toData()` or `getStrokes()` without mutating the controller.

## Snapshot

```ts
type SignatureSnapshot = {
  revision: number;
  isEmpty: boolean;
  isDrawing: boolean;
  strokeCount: number;
  canUndo: boolean;
  canRedo: boolean;
  bounds: { minX: number; minY: number; maxX: number; maxY: number } | null;
};
```

`subscribe(listener)` notifies on semantic changes. Pass `{ events: 'all' }` when a renderer
needs every captured point.

## Options

```ts
createSignaturePad({
  viewport: { width: 600, height: 240 },
  stroke: { color: '#111827', width: 2, opacity: 1, cap: 'round', join: 'round' },
  behavior: { minDistance: 0.5, smoothing: 0.35, allowDots: true },
});
```

Framework adapters accept the same options plus `enabled` and, on web, `preventDefault`.
`controller` is the documented name for the returned pad; `pad` is kept as an alias.

## Defaults

The default viewport is `600 × 240`, the stroke is a `2px` round dark line, smoothing is `0.35`, and tap dots are kept. Pass only the values you want to change; the types stay narrowed all the way through.

Published packages are ESM-only. Node-based tooling needs Node.js 18.17 or newer.

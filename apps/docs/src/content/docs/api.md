---
title: API
description: Handle methods, controller, SignatureData, snapshots, and options.
section: reference
order: 40
---

AI agents can read the same API from [/llm.txt](/llm.txt).

## SignaturePad handle

React, Vue, and React Native components expose this handle from a ref.

```ts
type SignaturePadHandle = {
  controller: SignaturePad;
  snapshot: SignatureSnapshot;
  undo(): boolean;
  redo(): boolean;
  clear(): boolean;
  reset(): void;
  toData(): SignatureData;
  loadData(data: SignatureData, options?: { resetHistory?: boolean }): void;
  toSvg(options?: SignatureSvgOptions): string;
  toDataURL?(options?: { type?: string; quality?: number }): string;
  toBlob?(options?: { type?: string; quality?: number }): Promise<Blob>;
};
```

`toDataURL` and `toBlob` are on the web canvas components. React Native uses `toSvg()`.

## Controller

Use these methods with `createSignaturePad`, `useSignaturePad`, or `handle.controller`.

| Method                                   | Purpose                                           |
| ---------------------------------------- | ------------------------------------------------- |
| `begin(point)` / `move(point)` / `end()` | Capture one stroke.                               |
| `cancel()`                               | Discard the active stroke.                        |
| `undo()` / `redo()`                      | Move through stroke history.                      |
| `clear()` / `reset()`                    | Remove strokes, with or without history.          |
| `toData()` / `loadData(data)`            | Save or restore vector data.                      |
| `toSvg(options?)`                        | Export a standalone SVG.                          |
| `getStrokes()`                           | Read a cloned list of current strokes.            |
| `getSnapshot()`                          | Empty, drawing, history, count, and bounds.       |
| `setViewport(viewport)`                  | Update logical drawing size.                      |
| `setStrokeStyle(style)`                  | Color, width, opacity, cap, and join.             |
| `setBehavior(behavior)`                  | Smoothing, point spacing, and tap dots.           |
| `subscribe(listener, options)`           | State changes, or `{ events: 'all' }` for points. |

Returned objects are clones. You can edit `toData()` or `getStrokes()` without mutating the pad.

## SignatureData

```ts
type SignatureData = {
  version: 1;
  viewport: { width: number; height: number };
  strokes: SignatureStroke[];
};
```

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

`onSnapshot` on `SignaturePad` fires on those state changes. Custom renderers should `subscribe` with `{ events: 'all' }`.

## Options

```ts
createSignaturePad({
  viewport: { width: 600, height: 240 },
  stroke: { color: '#111827', width: 2, opacity: 1, cap: 'round', join: 'round' },
  behavior: { minDistance: 0.5, smoothing: 0.35, allowDots: true },
});
```

`SignaturePad` and the hooks accept the same options, plus `enabled` and, on web, `preventDefault`. Defaults are shown above. The package is ESM-only and needs Node.js 18.17 or newer for tooling.

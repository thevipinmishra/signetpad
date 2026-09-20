---
title: React Native
description: Capture touch and stylus input with PanResponder and render the same strokes anywhere.
section: integrations
order: 33
---

## Install

```bash
npm install @signetpad/core @signetpad/react-native
npm install react-native-svg @signetpad/renderer-react-native-svg
```

## Connect the responder

```tsx
const { controller, snapshot, panHandlers } = useSignaturePad({
  viewport: { width: 360, height: 180 },
});
return (
  <View {...panHandlers} accessible accessibilityLabel="Signature drawing area">
    <SignatureSvg pad={controller} />
  </View>
);
```

Pass `pad={controller}` so the SVG redraws while a stroke is in progress. Passing
`strokes={controller.getStrokes()}` only updates when React re-renders, which misses point-level
moves.

The adapter uses React Native’s built-in `PanResponder`, so it does not force a gesture library on your app. The SVG renderer is optional; Skia or a native drawing surface can consume `controller.getStrokes()` just as easily.

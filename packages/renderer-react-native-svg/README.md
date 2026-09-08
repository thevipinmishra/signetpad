# @signetpad/renderer-react-native-svg

A React Native SVG renderer for the vector data produced by `@signetpad/core`.

## Render a live pad

```tsx
const { panHandlers, controller } = useSignaturePad({
  viewport: { width: 360, height: 180 },
});

return (
  <View {...panHandlers}>
    <SignatureSvg pad={controller} />
  </View>
);
```

Pass `strokes` for controlled rendering or `pad` to subscribe to live updates. The SVG layer sets
`pointerEvents="none"`, so it belongs inside the responder surface.

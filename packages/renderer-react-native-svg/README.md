# @signetpad/renderer-react-native-svg

A React Native SVG renderer for the vector data produced by `@signetpad/core`.

[Docs](https://signetpad.dev/docs/react-native) · [GitHub](https://github.com/thevipinmishra/signetpad)

## Install

```sh
npm install react-native-svg @signetpad/renderer-react-native-svg
```

Peer dependencies: `react`, `react-native`, and `react-native-svg` >= 14. This package is ESM-only.

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

Pass `strokes` for controlled rendering or `pad` to subscribe to live updates. Prefer `pad` for
an interactive surface so point-level moves redraw immediately. The SVG layer sets
`pointerEvents="none"`, so it belongs inside the responder surface.

## License

MIT

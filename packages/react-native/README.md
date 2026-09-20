# @signetpad/react-native

A React Native hook that connects the shared controller to `PanResponder`. It does not require a
gesture library or choose a rendering technology for you.

[Docs](https://signetpad.dev/docs/react-native) · [GitHub](https://github.com/thevipinmishra/signetpad)

## Install

```sh
npm install @signetpad/core @signetpad/react-native
npm install react-native-svg @signetpad/renderer-react-native-svg
```

Peer dependencies: `react` >= 18 and `react-native` >= 0.72. This package is ESM-only. Metro 0.76+
package exports should resolve it; older Metro setups may need
`unstable_enablePackageExports` or a custom resolver.

## Render with React Native SVG

```tsx
import { View } from 'react-native';
import { useSignaturePad } from '@signetpad/react-native';
import { SignatureSvg } from '@signetpad/renderer-react-native-svg';

export function SignatureField() {
  const { controller, panHandlers } = useSignaturePad({
    viewport: { width: 360, height: 180 },
  });

  return (
    <View {...panHandlers} accessible accessibilityLabel="Signature drawing area">
      <SignatureSvg pad={controller} />
    </View>
  );
}
```

Pass `pad={controller}` so the SVG subscribes to live point updates. Put `SignatureSvg` inside
the responder surface. It ignores touch events so the adapter remains the only input owner. Add
visible controls and an alternate input path in the containing screen.

## License

MIT

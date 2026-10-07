import { createRoot } from 'solid-js';
import { describe, expect, it } from 'vitest';
import { useSignaturePad } from '../../src/solid/index.js';

describe('solid useSignaturePad', () => {
  it('creates a controller and updates the snapshot accessor', () => {
    let dispose!: () => void;
    createRoot((disposeRoot) => {
      dispose = disposeRoot;
      const { controller, snapshot, setEnabled } = useSignaturePad({
        behavior: { minDistance: 0, smoothing: 0 },
      });

      expect(snapshot().isEmpty).toBe(true);
      controller.begin({ x: 5, y: 5 });
      controller.end();
      expect(controller.getSnapshot().strokeCount).toBe(1);
      expect(snapshot().strokeCount).toBe(1);
      setEnabled(false);
    });
    dispose();
  });
});

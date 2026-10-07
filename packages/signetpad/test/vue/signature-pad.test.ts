import { createApp, h, nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { SignaturePad, type SignaturePadHandle } from '../../src/vue/index.js';

describe('Vue SignaturePad', () => {
  it('exposes controller methods on the component instance', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const pad = ref<SignaturePadHandle | null>(null);

    const app = createApp({
      setup() {
        return () =>
          h(SignaturePad, {
            ref: pad,
            'aria-label': 'Contract signature',
          });
      },
    });

    app.mount(host);
    await Promise.resolve();

    const canvas = host.querySelector('canvas');
    expect(canvas?.getAttribute('aria-label')).toBe('Contract signature');
    expect(pad.value?.snapshot.isEmpty).toBe(true);

    pad.value?.loadData({
      version: 1,
      viewport: { width: 600, height: 240 },
      strokes: [
        {
          id: 'loaded',
          style: { color: '#111827', width: 2, opacity: 1, cap: 'round', join: 'round' },
          points: [
            { x: 4, y: 4, time: 0 },
            { x: 8, y: 8, time: 1 },
          ],
        },
      ],
    });

    expect(pad.value?.snapshot.strokeCount).toBe(1);
    pad.value?.clear();
    expect(pad.value?.snapshot.isEmpty).toBe(true);

    app.unmount();
    host.remove();
    vi.clearAllMocks();
  });

  it('applies live behavior updates to the next stroke', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const pad = ref<SignaturePadHandle | null>(null);
    const allowDots = ref(true);

    const app = createApp({
      setup() {
        return () =>
          h(SignaturePad, {
            ref: pad,
            behavior: { smoothing: 0, minDistance: 0, allowDots: allowDots.value },
          });
      },
    });

    app.mount(host);
    await Promise.resolve();

    pad.value?.controller.begin({ x: 0, y: 0 });
    pad.value?.controller.end();
    expect(pad.value?.snapshot.strokeCount).toBe(1);

    allowDots.value = false;
    await nextTick();

    pad.value?.controller.begin({ x: 5, y: 5 });
    pad.value?.controller.end();
    expect(pad.value?.snapshot.strokeCount).toBe(1);

    app.unmount();
    host.remove();
  });
});

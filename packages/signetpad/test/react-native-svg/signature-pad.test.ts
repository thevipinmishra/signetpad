import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: 'View',
  PanResponder: {
    create: () => ({ panHandlers: {} }),
  },
}));

vi.mock('react-native-svg', () => ({
  Circle: 'circle',
  Path: 'path',
  default: 'svg',
}));

const { SignaturePad } = await import('../../src/react-native-svg/signature-pad.js');

describe('react-native-svg SignaturePad module', () => {
  it('exports a component constructor', () => {
    expect(typeof SignaturePad).toBe('object');
    expect(SignaturePad).toBeTruthy();
  });
});

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { InteractivePad } from './InteractivePad.js';

describe('InteractivePad', () => {
  afterEach(() => {
    cleanup();
  });

  it('keeps undo and redo as icon-only controls with tooltips', () => {
    render(<InteractivePad />);

    const undo = screen.getByRole('button', { name: 'Undo' });
    const redo = screen.getByRole('button', { name: 'Redo' });
    const clear = screen.getByRole('button', { name: 'Clear' });

    expect(undo.textContent?.replace(/\s+/g, '')).toBe('');
    expect(undo.closest('[data-tooltip="Undo"]')).toBeTruthy();
    expect(redo.closest('[data-tooltip="Redo"]')).toBeTruthy();
    expect(clear.closest('[data-tooltip="Clear"]')).toBeTruthy();
    expect(screen.getByLabelText(/stroke width/i)).toBeTruthy();
    expect(screen.getByLabelText(/custom stroke color/i)).toBeTruthy();
  });
});

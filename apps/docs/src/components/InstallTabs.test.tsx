import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InstallTabs } from './InstallTabs.js';

describe('InstallTabs', () => {
  const writeText = vi.fn();

  afterEach(cleanup);

  beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  it('uses the tab keyboard pattern to choose a package manager', () => {
    render(<InstallTabs />);

    const pnpm = screen.getByRole('tab', { name: 'pnpm' });
    fireEvent.keyDown(pnpm, { key: 'End' });

    const bun = screen.getByRole('tab', { name: 'bun' });
    expect(bun.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(bun);
    expect(screen.getByRole('tabpanel').textContent).toContain(
      'bun add @signetpad/core @signetpad/react @signetpad/renderer-canvas',
    );
  });

  it('copies the selected command and announces the result', async () => {
    render(<InstallTabs />);
    fireEvent.click(screen.getByRole('tab', { name: 'npm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        'npm install @signetpad/core @signetpad/react @signetpad/renderer-canvas',
      );
    });
    expect(screen.getByRole('status').textContent).toContain('npm command copied.');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
  });
});

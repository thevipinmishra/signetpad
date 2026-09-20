import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InstallTabs } from './InstallTabs.js';
import { PACKAGE_MANAGER_STORAGE_KEY, writePackageManager } from '../lib/package-manager.js';

describe('InstallTabs', () => {
  const writeText = vi.fn();

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined);
    window.localStorage.clear();
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
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        'npm install @signetpad/core @signetpad/react @signetpad/renderer-canvas',
      );
    });
    expect(screen.getByRole('status').textContent).toContain('npm command copied.');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
  });

  it('keeps package manager tabs in sync across the UI', async () => {
    render(
      <>
        <InstallTabs />
        <InstallTabs packages="@signetpad/vue" />
      </>,
    );

    fireEvent.click(screen.getAllByRole('tab', { name: 'yarn' })[0]!);

    await waitFor(() => {
      const panels = screen.getAllByRole('tabpanel');
      expect(panels[0]?.textContent).toContain(
        'yarn add @signetpad/core @signetpad/react @signetpad/renderer-canvas',
      );
      expect(panels[1]?.textContent).toContain('yarn add @signetpad/vue');
    });
    expect(window.localStorage.getItem(PACKAGE_MANAGER_STORAGE_KEY)).toBe('yarn');
  });

  it('restores the persisted package manager', async () => {
    writePackageManager('bun');
    render(<InstallTabs />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'bun' }).getAttribute('aria-selected')).toBe('true');
      expect(screen.getByRole('tabpanel').textContent).toContain('bun add @signetpad/core');
    });
  });
});

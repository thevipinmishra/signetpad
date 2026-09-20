import { afterEach, describe, expect, it } from 'vitest';
import {
  isInstallCommand,
  PACKAGE_MANAGER_STORAGE_KEY,
  readPackageManager,
  toInstallCommand,
  writePackageManager,
} from './package-manager.js';

describe('package-manager', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('converts install commands between package managers', () => {
    expect(toInstallCommand('pnpm add @signetpad/react', 'npm')).toBe(
      'npm install @signetpad/react',
    );
    expect(
      toInstallCommand(
        'npm install @signetpad/core @signetpad/react-native\nnpm install react-native-svg',
        'pnpm',
      ),
    ).toBe('pnpm add @signetpad/core @signetpad/react-native\npnpm add react-native-svg');
  });

  it('detects install commands only', () => {
    expect(isInstallCommand('pnpm add @signetpad/react')).toBe(true);
    expect(isInstallCommand('echo hello')).toBe(false);
  });

  it('persists the selected package manager', () => {
    writePackageManager('yarn');
    expect(window.localStorage.getItem(PACKAGE_MANAGER_STORAGE_KEY)).toBe('yarn');
    expect(readPackageManager()).toBe('yarn');
  });
});

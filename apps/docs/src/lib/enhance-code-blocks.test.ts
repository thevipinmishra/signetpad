import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enhanceCodeBlocks } from './enhance-code-blocks.js';
import { PACKAGE_MANAGER_STORAGE_KEY } from './package-manager.js';

function mountPre(language: string, source: string) {
  const prose = document.createElement('div');
  prose.className = 'docs-prose';
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.className = 'language-' + language;
  code.textContent = source;
  pre.append(code);
  prose.append(pre);
  document.body.append(prose);
  return { prose, pre, code };
}

describe('enhanceCodeBlocks', () => {
  const writeText = vi.fn();

  afterEach(() => {
    document.body.innerHTML = '';
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

  it('shows a language icon instead of a language name', () => {
    mountPre('ts', 'const value = 1;');
    enhanceCodeBlocks();

    expect(document.querySelector('.code-language')).toBeNull();
    expect(document.querySelector('.code-language-icon svg')).toBeTruthy();
    expect(document.querySelector('.code-copy')?.textContent?.trim()).toBe('');
    expect(document.querySelector('.code-copy')?.getAttribute('aria-label')).toBe('Copy code');
    expect(document.querySelector('.code-language-icon .visually-hidden')?.textContent).toBe(
      'TypeScript',
    );
  });

  it('turns install commands into synced package manager tabs', () => {
    mountPre('bash', 'pnpm add @signetpad/react');
    mountPre('bash', 'pnpm add @signetpad/vue');
    enhanceCodeBlocks();

    const yarnTabs = document.querySelectorAll('[role="tab"]');
    const firstYarn = [...yarnTabs].find((tab) => tab.textContent === 'yarn');
    firstYarn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    const panels = document.querySelectorAll('[role="tabpanel"]');
    expect(panels[0]?.textContent).toBe('yarn add @signetpad/react');
    expect(panels[1]?.textContent).toBe('yarn add @signetpad/vue');
    expect(window.localStorage.getItem(PACKAGE_MANAGER_STORAGE_KEY)).toBe('yarn');
  });
});

import type { SimpleIcon } from 'simple-icons';
import {
  siBun,
  siGnubash,
  siJavascript,
  siJson,
  siNpm,
  siPnpm,
  siReact,
  siSvelte,
  siTypescript,
  siVuedotjs,
  siYarn,
} from 'simple-icons';
import type { PackageManager } from './package-manager.js';

export type BrandIcon = Pick<SimpleIcon, 'title' | 'path' | 'hex'>;

const LANGUAGE_ICONS: Record<string, BrandIcon> = {
  bash: siGnubash,
  javascript: siJavascript,
  js: siJavascript,
  json: siJson,
  jsx: siReact,
  sh: siGnubash,
  shell: siGnubash,
  svelte: siSvelte,
  ts: siTypescript,
  tsx: siReact,
  typescript: siTypescript,
  vue: siVuedotjs,
  zsh: siGnubash,
};

const PACKAGE_MANAGER_ICONS: Record<PackageManager, BrandIcon> = {
  pnpm: siPnpm,
  npm: siNpm,
  yarn: siYarn,
  bun: siBun,
};

const LANGUAGE_LABELS: Record<string, string> = {
  bash: 'Bash',
  javascript: 'JavaScript',
  js: 'JavaScript',
  json: 'JSON',
  jsx: 'React',
  sh: 'Shell',
  shell: 'Shell',
  svelte: 'Svelte',
  text: 'Plain text',
  ts: 'TypeScript',
  tsx: 'React',
  typescript: 'TypeScript',
  vue: 'Vue',
  zsh: 'Zsh',
};

const GENERIC_FILE_ICON: BrandIcon = {
  title: 'Code',
  hex: '95A8B6',
  path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 2.5L19.5 10H14zM8.2 12.4l2.1-2.1 1.1 1.1-2.1 2.1 2.1 2.1-1.1 1.1-2.1-2.1-2.1 2.1-1.1-1.1 2.1-2.1-2.1-2.1 1.1-1.1zm7.6 4.2-2.1 2.1-1.1-1.1 2.1-2.1-2.1-2.1 1.1-1.1 2.1 2.1 2.1-2.1 1.1 1.1-2.1 2.1 2.1 2.1-1.1 1.1z',
};

export const COPY_ICON_SVG =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

export const CHECK_ICON_SVG =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 6 9 17l-5-5"/></svg>';

export function iconFill(hex: string): string {
  const value = hex.replace('#', '');
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance < 0.28 ? '#e8eef2' : '#' + value;
}

export function languageLabel(language: string): string {
  return LANGUAGE_LABELS[language] ?? language.toUpperCase();
}

export function languageIcon(language: string): BrandIcon {
  return LANGUAGE_ICONS[language] ?? GENERIC_FILE_ICON;
}

export function packageManagerIcon(manager: PackageManager): BrandIcon {
  return PACKAGE_MANAGER_ICONS[manager];
}

export function renderBrandIcon(icon: BrandIcon, size = 16): string {
  return (
    '<svg viewBox="0 0 24 24" width="' +
    size +
    '" height="' +
    size +
    '" aria-hidden="true" focusable="false"><path fill="' +
    iconFill(icon.hex) +
    '" d="' +
    icon.path +
    '"/></svg>'
  );
}

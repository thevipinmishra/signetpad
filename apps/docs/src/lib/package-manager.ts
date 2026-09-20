export const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export const DEFAULT_PACKAGE_MANAGER: PackageManager = 'pnpm';
export const PACKAGE_MANAGER_STORAGE_KEY = 'signetpad.package-manager';

const INSTALL_PREFIX = /^(pnpm\s+add|npm\s+install|yarn\s+add|bun\s+add)\s+/i;

const COMMAND_PREFIX: Record<PackageManager, string> = {
  pnpm: 'pnpm add',
  npm: 'npm install',
  yarn: 'yarn add',
  bun: 'bun add',
};

type Listener = (manager: PackageManager) => void;

const listeners = new Set<Listener>();
let storageBound = false;

export function isPackageManager(value: string | null | undefined): value is PackageManager {
  return PACKAGE_MANAGERS.some((manager) => manager === value);
}

export function readPackageManager(): PackageManager {
  if (typeof window === 'undefined') return DEFAULT_PACKAGE_MANAGER;

  try {
    const stored = window.localStorage.getItem(PACKAGE_MANAGER_STORAGE_KEY);
    return isPackageManager(stored) ? stored : DEFAULT_PACKAGE_MANAGER;
  } catch {
    return DEFAULT_PACKAGE_MANAGER;
  }
}

export function writePackageManager(manager: PackageManager) {
  try {
    window.localStorage.setItem(PACKAGE_MANAGER_STORAGE_KEY, manager);
  } catch {
    // Persistence is optional; the in-memory listeners still keep the page in sync.
  }

  for (const listener of listeners) listener(manager);
}

export function subscribePackageManager(listener: Listener): () => void {
  listeners.add(listener);
  bindStorageListener();
  return () => {
    listeners.delete(listener);
  };
}

export function isInstallCommand(source: string): boolean {
  const lines = source
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length > 0 && lines.every((line) => INSTALL_PREFIX.test(line));
}

export function toInstallCommand(source: string, manager: PackageManager): string {
  return source
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => COMMAND_PREFIX[manager] + ' ' + line.replace(INSTALL_PREFIX, ''))
    .join('\n');
}

export function packageManagerFromKey(key: string, index: number): PackageManager | undefined {
  let nextIndex = index;
  if (key === 'ArrowRight') nextIndex = (index + 1) % PACKAGE_MANAGERS.length;
  else if (key === 'ArrowLeft')
    nextIndex = (index - 1 + PACKAGE_MANAGERS.length) % PACKAGE_MANAGERS.length;
  else if (key === 'Home') nextIndex = 0;
  else if (key === 'End') nextIndex = PACKAGE_MANAGERS.length - 1;
  else return undefined;

  return PACKAGE_MANAGERS[nextIndex];
}

function bindStorageListener() {
  if (storageBound || typeof window === 'undefined') return;
  storageBound = true;
  window.addEventListener('storage', (event) => {
    if (event.key !== PACKAGE_MANAGER_STORAGE_KEY || !isPackageManager(event.newValue)) return;
    for (const listener of listeners) listener(event.newValue);
  });
}

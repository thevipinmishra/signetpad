import {
  CHECK_ICON_SVG,
  COPY_ICON_SVG,
  languageIcon,
  languageLabel,
  packageManagerIcon,
  renderBrandIcon,
} from './brand-icons.js';
import {
  PACKAGE_MANAGERS,
  packageManagerFromKey,
  readPackageManager,
  subscribePackageManager,
  toInstallCommand,
  writePackageManager,
  isInstallCommand,
  type PackageManager,
} from './package-manager.js';

let installBlockId = 0;

export function enhanceCodeBlocks(root: ParentNode = document) {
  root.querySelectorAll<HTMLPreElement>('.docs-prose pre').forEach((pre) => {
    if (pre.dataset.enhanced === 'true' || pre.closest('.code-block')) return;

    const code = pre.querySelector('code');
    const source = code?.textContent ?? '';
    if (isInstallCommand(source)) {
      enhanceInstallBlock(pre, code, source);
      return;
    }

    enhanceSourceBlock(pre, code);
  });
}

function enhanceSourceBlock(pre: HTMLPreElement, code: HTMLElement | null) {
  const language = detectLanguage(pre, code);
  const label = languageLabel(language);
  const shell = createCodeBlock('source');
  const { toolbar, copyButton, status } = createToolbar({
    icon: renderBrandIcon(languageIcon(language)),
    label,
  });

  bindCopyButton(copyButton, status, () => code?.textContent ?? '', 'Code copied.');
  wrapBlock(pre, shell, toolbar);
}

function enhanceInstallBlock(pre: HTMLPreElement, code: HTMLElement | null, source: string) {
  const shell = createCodeBlock('install');
  const tabId = 'install-' + String(++installBlockId);
  const iconHost = document.createElement('span');
  const tablist = document.createElement('div');
  const tabButtons = new Map<PackageManager, HTMLButtonElement>();

  iconHost.className = 'code-language-icon';
  tablist.className = 'code-tabs';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Package manager');

  const { toolbar, copyButton, status } = createToolbar({ iconHost, extra: tablist });

  PACKAGE_MANAGERS.forEach((manager, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.role = 'tab';
    button.id = tabId + '-' + manager;
    button.textContent = manager;
    button.addEventListener('click', () => writePackageManager(manager));
    button.addEventListener('keydown', (event) => {
      const nextManager = packageManagerFromKey(event.key, index);
      if (!nextManager) return;
      event.preventDefault();
      writePackageManager(nextManager);
      tabButtons.get(nextManager)?.focus();
    });
    tabButtons.set(manager, button);
    tablist.append(button);
  });

  const applyManager = (manager: PackageManager) => {
    const icon = packageManagerIcon(manager);
    iconHost.title = manager;
    iconHost.innerHTML =
      renderBrandIcon(icon) + '<span class="visually-hidden">' + manager + '</span>';
    tabButtons.forEach((button, tabManager) => {
      const selected = tabManager === manager;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
      button.setAttribute('aria-controls', tabId + '-panel');
    });
    if (code) code.textContent = toInstallCommand(source, manager);
    pre.id = tabId + '-panel';
    pre.setAttribute('role', 'tabpanel');
    pre.setAttribute('aria-labelledby', tabId + '-' + manager);
  };

  applyManager(readPackageManager());
  subscribePackageManager(applyManager);
  bindCopyButton(copyButton, status, () => code?.textContent ?? '', 'Install command copied.');
  wrapBlock(pre, shell, toolbar);
}

function createCodeBlock(kind: 'source' | 'install') {
  const shell = document.createElement('div');
  shell.className = 'code-block';
  shell.dataset.codeKind = kind;
  return shell;
}

function createToolbar({
  icon,
  iconHost,
  label,
  extra,
}: {
  icon?: string;
  iconHost?: HTMLElement;
  label?: string;
  extra?: HTMLElement;
}) {
  const toolbar = document.createElement('div');
  const meta = document.createElement('div');
  const copyButton = document.createElement('button');
  const status = document.createElement('span');

  toolbar.className = 'code-toolbar';
  meta.className = 'code-meta';
  copyButton.type = 'button';
  copyButton.className = 'code-copy';
  copyButton.setAttribute('aria-label', 'Copy code');
  copyButton.innerHTML = COPY_ICON_SVG;
  status.className = 'code-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  if (iconHost) {
    meta.append(iconHost);
  } else if (icon && label) {
    const language = document.createElement('span');
    language.className = 'code-language-icon';
    language.title = label;
    language.innerHTML = icon + '<span class="visually-hidden">' + label + '</span>';
    meta.append(language);
  }

  if (extra) meta.append(extra);
  toolbar.append(meta, copyButton, status);
  return { toolbar, copyButton, status };
}

function bindCopyButton(
  button: HTMLButtonElement,
  status: HTMLElement,
  getText: () => string,
  copiedMessage: string,
) {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getText());
      button.innerHTML = CHECK_ICON_SVG;
      button.setAttribute('aria-label', 'Copied');
      status.textContent = copiedMessage;
      window.setTimeout(() => {
        button.innerHTML = COPY_ICON_SVG;
        button.setAttribute('aria-label', 'Copy code');
        status.textContent = '';
      }, 1800);
    } catch {
      button.setAttribute('aria-label', 'Select code');
      status.textContent = 'Copying failed. Select the code manually.';
    }
  });
}

function wrapBlock(pre: HTMLPreElement, shell: HTMLElement, toolbar: HTMLElement) {
  pre.dataset.enhanced = 'true';
  pre.parentNode?.insertBefore(shell, pre);
  shell.append(toolbar, pre);
}

function detectLanguage(pre: HTMLPreElement, code: HTMLElement | null): string {
  const fromDataset = pre.dataset.language ?? code?.dataset.language;
  if (fromDataset) return fromDataset;

  const languageClass = [...(code?.classList ?? [])].find((value) => value.startsWith('language-'));
  return languageClass?.replace('language-', '') ?? 'text';
}

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { BrandIcon } from './BrandIcon.js';
import { CHECK_ICON_SVG, COPY_ICON_SVG, packageManagerIcon } from '../lib/brand-icons.js';
import {
  PACKAGE_MANAGERS,
  packageManagerFromKey,
  readPackageManager,
  subscribePackageManager,
  toInstallCommand,
  writePackageManager,
  type PackageManager,
} from '../lib/package-manager.js';

const DEFAULT_PACKAGES = '@signetpad/core @signetpad/react @signetpad/renderer-canvas';

export function InstallTabs({ packages = DEFAULT_PACKAGES }: { packages?: string }) {
  const [activeManager, setActiveManager] = useState<PackageManager>('pnpm');
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const tabId = useId();
  const tabRefs = useRef<Partial<Record<PackageManager, HTMLButtonElement | null>>>({});
  const command = toInstallCommand('pnpm add ' + packages, activeManager);

  useEffect(() => {
    setActiveManager(readPackageManager());
    return subscribePackageManager(setActiveManager);
  }, []);

  const selectManager = (manager: PackageManager) => {
    writePackageManager(manager);
    setStatus('');
    setCopied(false);
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setStatus(activeManager + ' command copied.');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setStatus('Copy is unavailable. Select the command and copy it manually.');
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextManager = packageManagerFromKey(event.key, index);
    if (!nextManager) return;
    event.preventDefault();
    selectManager(nextManager);
    tabRefs.current[nextManager]?.focus();
  };

  return (
    <div className="code-block" data-code-kind="install">
      <div className="code-toolbar">
        <div className="code-meta">
          <BrandIcon icon={packageManagerIcon(activeManager)} label={activeManager} />
          <div className="code-tabs" role="tablist" aria-label="Package manager">
            {PACKAGE_MANAGERS.map((manager, index) => {
              const isActive = manager === activeManager;

              return (
                <button
                  key={manager}
                  type="button"
                  role="tab"
                  id={tabId + '-' + manager}
                  aria-selected={isActive}
                  aria-controls={tabId + '-panel'}
                  tabIndex={isActive ? 0 : -1}
                  className={isActive ? 'is-active' : undefined}
                  onClick={() => selectManager(manager)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  ref={(element) => {
                    tabRefs.current[manager] = element;
                  }}
                >
                  {manager}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          className="code-copy"
          aria-label={copied ? 'Copied' : 'Copy code'}
          onClick={copyCommand}
        >
          <span
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: copied ? CHECK_ICON_SVG : COPY_ICON_SVG }}
          />
        </button>
        <span className="code-status" role="status" aria-live="polite">
          {status}
        </span>
      </div>
      <pre id={tabId + '-panel'} role="tabpanel" aria-labelledby={tabId + '-' + activeManager}>
        <code>{command}</code>
      </pre>
    </div>
  );
}

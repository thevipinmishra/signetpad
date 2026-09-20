import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, Code, Copy, Package } from 'reicon-react';

const INSTALL_COMMANDS = {
  pnpm: 'pnpm add signetpad',
  npm: 'npm install signetpad',
  yarn: 'yarn add signetpad',
  bun: 'bun add signetpad',
} as const;

type PackageManager = keyof typeof INSTALL_COMMANDS;

const packageManagers = Object.keys(INSTALL_COMMANDS) as PackageManager[];

export function InstallTabs() {
  const [activeManager, setActiveManager] = useState<PackageManager>('pnpm');
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const tabId = useId();
  const tabRefs = useRef<Partial<Record<PackageManager, HTMLButtonElement | null>>>({});
  const command = INSTALL_COMMANDS[activeManager];

  const selectManager = (manager: PackageManager) => {
    setActiveManager(manager);
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
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % packageManagers.length;
    else if (event.key === 'ArrowLeft')
      nextIndex = (index - 1 + packageManagers.length) % packageManagers.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = packageManagers.length - 1;
    else return;

    event.preventDefault();
    const nextManager = packageManagers[nextIndex];
    if (!nextManager) return;
    selectManager(nextManager);
    tabRefs.current[nextManager]?.focus();
  };

  return (
    <section className="install-tabs" aria-label="Install SignetPad">
      <div className="install-tabs-heading">
        <div>
          <h2>
            <Package aria-hidden="true" size={17} weight="Outline" />
            Install SignetPad
          </h2>
          <p>Choose your package manager, then copy one command.</p>
        </div>
        <a href="/docs/integrations">Other integrations</a>
      </div>
      <div className="install-tab-list" role="tablist" aria-label="Package manager">
        {packageManagers.map((manager, index) => {
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
      <div
        id={tabId + '-panel'}
        className="install-command"
        role="tabpanel"
        aria-labelledby={tabId + '-' + activeManager}
      >
        <span className="install-command-type">
          <Code aria-hidden="true" size={16} weight="Outline" />
          Command
        </span>
        <code>{command}</code>
        <button type="button" className="copy-button" onClick={copyCommand}>
          {copied ? (
            <Check aria-hidden="true" size={15} weight="Outline" />
          ) : (
            <Copy aria-hidden="true" size={15} weight="Outline" />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <p className="install-status" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}

import { Book, ChevronDown } from 'reicon-react';

export interface DocsMenuEntry {
  id: string;
  title: string;
  section: 'start' | 'integrations' | 'reference';
}

interface DocsMenuProps {
  activeSlug: string;
  entries: DocsMenuEntry[];
}

const sections = [
  { key: 'start', label: 'Guides' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'reference', label: 'Reference' },
] as const;

export function DocsMenu({ activeSlug, entries }: DocsMenuProps) {
  return (
    <details className="docs-menu">
      <summary className="docs-menu-summary">
        <span>
          <Book aria-hidden="true" size={16} weight="Outline" />
          Browse docs
        </span>
        <ChevronDown aria-hidden="true" className="docs-menu-chevron" size={15} weight="Outline" />
      </summary>
      <nav className="docs-menu-popover" aria-label="Documentation index">
        {sections.map((section) => {
          const sectionEntries = entries.filter((entry) => entry.section === section.key);

          if (!sectionEntries.length) return null;

          return (
            <section className="docs-menu-section" key={section.key}>
              <h2>{section.label}</h2>
              <div>
                {sectionEntries.map((entry) => {
                  const active = entry.id === activeSlug;

                  return (
                    <a
                      aria-current={active ? 'page' : undefined}
                      className={active ? 'is-active' : undefined}
                      href={'/docs/' + entry.id}
                      key={entry.id}
                    >
                      {entry.title}
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>
    </details>
  );
}

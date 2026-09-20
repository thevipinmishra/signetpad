import type { ReactNode } from 'react';

export function PreviewFrame({
  label = 'Live preview',
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <figure className="live-preview">
      <figcaption>{label}</figcaption>
      <div className="live-preview-body">{children}</div>
    </figure>
  );
}

import { useLayoutEffect, useRef, useState } from 'react';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react';
import type { SignatureData, SignatureSnapshot } from 'signetpad';
import { InteractivePad } from './InteractivePad.js';
import { PreviewFrame } from './PreviewFrame.js';

const EMPTY_SNAPSHOT: SignatureSnapshot = {
  revision: 0,
  isEmpty: true,
  isDrawing: false,
  strokeCount: 0,
  canUndo: false,
  canRedo: false,
  bounds: null,
};

const SAMPLE: SignatureData = {
  version: 1,
  viewport: { width: 600, height: 180 },
  strokes: [
    {
      id: 'sample',
      style: { color: '#102935', width: 3, opacity: 1, cap: 'round', join: 'round' },
      points: [
        { x: 70, y: 110, time: 0 },
        { x: 140, y: 60, time: 12 },
        { x: 200, y: 130, time: 24 },
        { x: 280, y: 70, time: 36 },
        { x: 360, y: 120, time: 48 },
        { x: 470, y: 80, time: 60 },
      ],
    },
  ],
};

export type LiveExample =
  'draw' | 'history' | 'stroke' | 'persist' | 'export' | 'form' | 'readonly' | 'disabled';

export function LivePreview({ example }: { example: LiveExample }) {
  switch (example) {
    case 'draw':
      return (
        <PreviewFrame>
          <SignaturePad className="pad-canvas" aria-label="Try a signature" />
        </PreviewFrame>
      );
    case 'history':
      return <HistoryPreview />;
    case 'stroke':
      return (
        <PreviewFrame label="Live preview — color and width apply to the next stroke">
          <InteractivePad />
        </PreviewFrame>
      );
    case 'persist':
      return <PersistPreview />;
    case 'export':
      return <ExportPreview />;
    case 'form':
      return <FormPreview />;
    case 'readonly':
      return <ReadonlyPreview />;
    case 'disabled':
      return <DisabledPreview />;
  }
}

function HistoryPreview() {
  const padRef = useRef<SignaturePadHandle>(null);
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);

  return (
    <PreviewFrame>
      <SignaturePad
        ref={padRef}
        className="pad-canvas"
        aria-label="Signature with history controls"
        onSnapshot={setSnapshot}
      />
      <div className="live-preview-actions">
        <button type="button" onClick={() => padRef.current?.undo()} disabled={!snapshot.canUndo}>
          Undo
        </button>
        <button type="button" onClick={() => padRef.current?.redo()} disabled={!snapshot.canRedo}>
          Redo
        </button>
        <button type="button" onClick={() => padRef.current?.clear()} disabled={snapshot.isEmpty}>
          Clear
        </button>
      </div>
    </PreviewFrame>
  );
}

function PersistPreview() {
  const padRef = useRef<SignaturePadHandle>(null);
  const [draft, setDraft] = useState<SignatureData | null>(null);
  const [status, setStatus] = useState('Draw something, then save a draft.');

  return (
    <PreviewFrame>
      <SignaturePad ref={padRef} className="pad-canvas" aria-label="Signature draft" />
      <div className="live-preview-actions">
        <button
          type="button"
          onClick={() => {
            const next = padRef.current?.toData() ?? null;
            setDraft(next);
            setStatus(
              next && next.strokes.length > 0 ? 'Draft saved in memory.' : 'Nothing to save yet.',
            );
          }}
        >
          Save draft
        </button>
        <button
          type="button"
          onClick={() => {
            if (!draft) {
              setStatus('No draft to restore.');
              return;
            }
            padRef.current?.loadData(draft);
            setStatus('Draft restored.');
          }}
          disabled={!draft}
        >
          Restore draft
        </button>
      </div>
      <p className="live-preview-status" role="status">
        {status}
      </p>
    </PreviewFrame>
  );
}

function ExportPreview() {
  const padRef = useRef<SignaturePadHandle>(null);
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const [status, setStatus] = useState('Draw, then export SVG or PNG.');

  return (
    <PreviewFrame>
      <SignaturePad
        ref={padRef}
        className="pad-canvas"
        aria-label="Signature to export"
        onSnapshot={setSnapshot}
      />
      <div className="live-preview-actions">
        <button
          type="button"
          disabled={snapshot.isEmpty}
          onClick={() => {
            const svg = padRef.current?.toSvg({ background: '#ffffff' });
            if (!svg) return;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'signature.svg';
            link.click();
            URL.revokeObjectURL(url);
            setStatus('SVG downloaded.');
          }}
        >
          Download SVG
        </button>
        <button
          type="button"
          disabled={snapshot.isEmpty}
          onClick={() => {
            try {
              const href = padRef.current?.toDataURL({ type: 'image/png' });
              if (!href) return;
              const link = document.createElement('a');
              link.href = href;
              link.download = 'signature.png';
              link.click();
              setStatus('PNG downloaded.');
            } catch {
              setStatus('PNG export needs a mounted canvas.');
            }
          }}
        >
          Download PNG
        </button>
      </div>
      <p className="live-preview-status" role="status">
        {status}
      </p>
    </PreviewFrame>
  );
}

function FormPreview() {
  const padRef = useRef<SignaturePadHandle>(null);
  const [typedName, setTypedName] = useState('');
  const [status, setStatus] = useState('Draw a signature or type a name.');

  return (
    <PreviewFrame>
      <form
        className="live-preview-form"
        onSubmit={(event) => {
          event.preventDefault();
          const empty = padRef.current?.snapshot.isEmpty ?? true;
          if (empty && !typedName.trim()) {
            setStatus('Draw a signature or enter the signatory name.');
            return;
          }
          setStatus(empty ? 'Typed name is ready to submit.' : 'Signature is ready to submit.');
        }}
      >
        <SignaturePad ref={padRef} className="pad-canvas" aria-label="Agreement signature" />
        <label>
          <span>Type the signatory name instead</span>
          <input
            type="text"
            autoComplete="name"
            value={typedName}
            onChange={(event) => setTypedName(event.target.value)}
          />
        </label>
        <div className="live-preview-actions">
          <button type="submit">Prepare signature</button>
          <button type="button" onClick={() => padRef.current?.clear()}>
            Clear pad
          </button>
        </div>
        <p className="live-preview-status" role="status">
          {status}
        </p>
      </form>
    </PreviewFrame>
  );
}

function ReadonlyPreview() {
  const padRef = useRef<SignaturePadHandle>(null);

  useLayoutEffect(() => {
    padRef.current?.loadData(SAMPLE);
  }, []);

  return (
    <PreviewFrame label="Live preview — review-only copy">
      <SignaturePad
        ref={padRef}
        className="pad-canvas"
        aria-label="Saved signature"
        enabled={false}
      />
    </PreviewFrame>
  );
}

function DisabledPreview() {
  const [enabled, setEnabled] = useState(true);

  return (
    <PreviewFrame>
      <SignaturePad className="pad-canvas" aria-label="Signature input" enabled={enabled} />
      <div className="live-preview-actions">
        <button type="button" onClick={() => setEnabled((value) => !value)}>
          {enabled ? 'Disable drawing' : 'Enable drawing'}
        </button>
      </div>
    </PreviewFrame>
  );
}

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRotate,
  Code,
  Copy,
  Download,
  Eye,
  EyeClosed,
  Image,
  InfoCircle,
  Pen,
  Redo,
  Trash,
  Undo,
} from 'reicon-react';
import { useSignaturePad } from 'signetpad/react';
import { createCanvasRenderer, type CanvasRenderer } from 'signetpad/canvas';
import type { SignatureData } from 'signetpad';

const VIEWPORT = { width: 720, height: 300 };
const IMAGE_FORMATS = [
  { type: 'image/png', label: 'PNG', extension: 'png' },
  { type: 'image/jpeg', label: 'JPEG', extension: 'jpg' },
  { type: 'image/webp', label: 'WebP', extension: 'webp' },
] as const;

const SAMPLE_SIGNATURE: SignatureData = {
  version: 1,
  viewport: VIEWPORT,
  strokes: [
    {
      id: 'sample-signature',
      style: { color: '#102935', width: 3, opacity: 1, cap: 'round', join: 'round' },
      points: [
        { x: 80, y: 170, time: 0 },
        { x: 128, y: 98, time: 12 },
        { x: 170, y: 193, time: 24 },
        { x: 220, y: 115, time: 36 },
        { x: 272, y: 177, time: 48 },
        { x: 330, y: 128, time: 60 },
        { x: 405, y: 157, time: 72 },
        { x: 502, y: 110, time: 84 },
        { x: 610, y: 154, time: 96 },
      ],
    },
  ],
};

export function App() {
  const [typedName, setTypedName] = useState('');
  const [strokeColor, setStrokeColor] = useState('#102935');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [showData, setShowData] = useState(false);
  const [imageFormat, setImageFormat] =
    useState<(typeof IMAGE_FORMATS)[number]['type']>('image/png');
  const [status, setStatus] = useState('Ready for a signature.');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const { controller, snapshot, surfaceProps, surfaceRef } = useSignaturePad({
    viewport: VIEWPORT,
    stroke: { color: strokeColor, width: strokeWidth },
  });

  const attachCanvas = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      surfaceRef(canvas);
      canvasRef.current = canvas;
    },
    [surfaceRef],
  );

  useLayoutEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    const renderer = createCanvasRenderer(context, {
      viewport: controller.getViewport(),
      dpr: window.devicePixelRatio || 1,
    });
    renderer.render(controller.getStrokes());
    rendererRef.current = renderer;

    return () => {
      rendererRef.current = null;
    };
  }, [controller]);

  useEffect(
    () =>
      controller.subscribe(
        () => {
          rendererRef.current?.update(controller.getStrokes());
        },
        { events: 'all' },
      ),
    [controller],
  );

  useEffect(() => {
    controller.setStrokeStyle({ color: strokeColor, width: strokeWidth });
  }, [controller, strokeColor, strokeWidth]);

  const signatureData = useMemo(
    () => JSON.stringify(controller.toData(), null, 2),
    [controller, snapshot.revision],
  );

  const handleClear = () => {
    controller.clear();
    setStatus('Signature cleared.');
  };

  const handleLoadSample = () => {
    controller.loadData(SAMPLE_SIGNATURE);
    setStatus('Sample signature loaded.');
  };

  const handleCopyData = async () => {
    if (snapshot.isEmpty) return;

    try {
      await navigator.clipboard.writeText(signatureData);
      setStatus('Signature data copied.');
    } catch {
      setStatus('Copy is unavailable. Select the JSON and copy it manually.');
      setShowData(true);
    }
  };

  const download = (href: string, filename: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.click();
  };

  const handleExportImage = () => {
    if (snapshot.isEmpty || !rendererRef.current) return;

    const format = IMAGE_FORMATS.find((item) => item.type === imageFormat);
    if (!format) return;

    download(rendererRef.current.toDataURL({ type: imageFormat }), 'signature.' + format.extension);
    setStatus(format.label + ' image downloaded.');
  };

  const handleExportSvg = () => {
    if (snapshot.isEmpty) return;

    const blob = new Blob([controller.toSvg()], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    download(url, 'signature.svg');
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setStatus('SVG image downloaded.');
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (snapshot.isEmpty && !typedName.trim()) {
      setStatus('Draw a signature or enter the signatory name.');
      return;
    }

    setStatus(
      snapshot.isEmpty ? 'Typed signature is ready to submit.' : 'Signature is ready to submit.',
    );
  };

  return (
    <main id="top" className="page-shell">
      <header className="app-header">
        <a className="example-brand" href="#top">
          <span aria-hidden="true">
            <Pen size={15} />
          </span>
          SignetPad
        </a>
        <p>
          <Code aria-hidden="true" size={15} weight="Outline" />
          React + Canvas example
        </p>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <h1 id="page-title">A signature field with the details people notice.</h1>
        <p className="lede">
          Draw, adjust the next stroke, inspect the vector payload, or use the typed alternative.
          The controller, adapter, and renderer stay separate.
        </p>
      </section>

      <div className="example-grid">
        <form className="signature-card" onSubmit={handleSave}>
          <fieldset>
            <legend>Your signature</legend>
            <p id="signature-help" className="field-help">
              Draw with a mouse, touch, or stylus. Use the actions below to correct a stroke.
            </p>

            <div className="canvas-frame">
              <canvas
                ref={attachCanvas}
                className="signature-canvas"
                width={VIEWPORT.width}
                height={VIEWPORT.height}
                tabIndex={0}
                aria-label="Signature drawing area"
                aria-describedby="signature-help signature-status"
                {...surfaceProps}
              />
            </div>

            <div className="toolbar" aria-label="Signature actions">
              <button type="button" onClick={() => controller.undo()} disabled={!snapshot.canUndo}>
                <Undo aria-hidden="true" size={15} weight="Outline" />
                Undo
              </button>
              <button type="button" onClick={() => controller.redo()} disabled={!snapshot.canRedo}>
                <Redo aria-hidden="true" size={15} weight="Outline" />
                Redo
              </button>
              <button type="button" onClick={handleClear} disabled={snapshot.isEmpty}>
                <Trash aria-hidden="true" size={15} weight="Outline" />
                Clear
              </button>
              <span className="stroke-count">
                {snapshot.strokeCount} {snapshot.strokeCount === 1 ? 'stroke' : 'strokes'}
              </span>
            </div>
          </fieldset>

          <div className="alternative-input">
            <label htmlFor="typed-name">Type the signatory name instead</label>
            <p id="typed-name-help" className="field-help">
              Use this option when drawing is not convenient.
            </p>
            <input
              id="typed-name"
              name="typedName"
              type="text"
              autoComplete="name"
              inputMode="text"
              value={typedName}
              onChange={(event) => setTypedName(event.target.value)}
              aria-describedby="typed-name-help"
            />
          </div>

          <div id="signature-status" className="status" role="status" aria-live="polite">
            {status}
          </div>

          <button className="save-button" type="submit">
            Prepare signature
          </button>
        </form>

        <aside className="control-panel" aria-label="Signature playground controls">
          <div className="panel-heading">
            <h2>Adjust, inspect, reuse.</h2>
          </div>

          <div className="control-group">
            <label htmlFor="stroke-color">Next stroke color</label>
            <div className="color-control">
              <input
                id="stroke-color"
                type="color"
                value={strokeColor}
                onChange={(event) => setStrokeColor(event.target.value)}
              />
              <code>{strokeColor}</code>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="stroke-width">
              Stroke width <output>{strokeWidth}px</output>
            </label>
            <input
              id="stroke-width"
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={strokeWidth}
              onChange={(event) => setStrokeWidth(Number(event.target.value))}
            />
          </div>

          <div className="panel-actions">
            <button type="button" onClick={handleLoadSample}>
              <ArrowRotate aria-hidden="true" size={16} weight="Outline" />
              Load sample
            </button>
            <button
              type="button"
              aria-expanded={showData}
              aria-controls="signature-data"
              onClick={() => setShowData((value) => !value)}
            >
              {showData ? (
                <EyeClosed aria-hidden="true" size={16} weight="Outline" />
              ) : (
                <Eye aria-hidden="true" size={16} weight="Outline" />
              )}
              {showData ? 'Hide data' : 'View data'}
            </button>
            <button type="button" onClick={handleCopyData} disabled={snapshot.isEmpty}>
              <Copy aria-hidden="true" size={16} weight="Outline" />
              Copy JSON
            </button>
          </div>

          <div className="export-group">
            <div className="export-heading">
              <Image aria-hidden="true" size={16} weight="Outline" />
              <label htmlFor="image-format">Export image</label>
            </div>
            <div className="export-actions">
              <select
                id="image-format"
                value={imageFormat}
                onChange={(event) => setImageFormat(event.target.value as typeof imageFormat)}
              >
                {IMAGE_FORMATS.map((format) => (
                  <option key={format.type} value={format.type}>
                    {format.label}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleExportImage} disabled={snapshot.isEmpty}>
                <Download aria-hidden="true" size={16} weight="Outline" />
                Download
              </button>
            </div>
            <button
              type="button"
              className="svg-export"
              onClick={handleExportSvg}
              disabled={snapshot.isEmpty}
            >
              <Code aria-hidden="true" size={16} weight="Outline" />
              Download SVG
            </button>
          </div>

          {showData && (
            <pre id="signature-data" className="data-preview" tabIndex={0}>
              <code>{signatureData}</code>
            </pre>
          )}

          <div className="panel-note">
            <InfoCircle aria-hidden="true" size={17} weight="Outline" />
            <p>
              Style applies to new strokes. Saved signatures remain intact, so review flows stay
              predictable.
            </p>
          </div>
        </aside>
      </div>

      <section className="pattern-grid" aria-label="Example highlights">
        <article>
          <span>01</span>
          <h2>Accessible input</h2>
          <p>
            A clear label, visible focus, corrective actions, status updates, and typed fallback.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>Editable data</h2>
          <p>Inspect and copy versioned vector data instead of capturing a flat image.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Reusable renderer</h2>
          <p>The same controller can drive Canvas here, SVG on native, or your own output.</p>
        </article>
      </section>
    </main>
  );
}

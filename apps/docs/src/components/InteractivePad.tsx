import { useId, useRef, useState } from 'react';
import { Redo, Trash, Undo } from 'reicon-react';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react';
import type { SignatureSnapshot } from 'signetpad';

const VIEWPORT = { width: 720, height: 240 };
const STROKE_COLORS = ['#102935', '#b94d29', '#167769', '#2b67d1'] as const;
const EMPTY_SNAPSHOT: SignatureSnapshot = {
  revision: 0,
  isEmpty: true,
  isDrawing: false,
  strokeCount: 0,
  canUndo: false,
  canRedo: false,
  bounds: null,
};

export function InteractivePad() {
  const ids = useId();
  const padRef = useRef<SignaturePadHandle>(null);
  const [strokeColor, setStrokeColor] = useState<string>(STROKE_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const [message, setMessage] = useState('No signature yet.');

  return (
    <div className="pad-widget">
      <p className="visually-hidden" id={ids + '-help'}>
        Draw with a mouse, touch, or stylus. Use undo, redo, and clear to edit. Color and width
        apply to the next stroke.
      </p>
      <SignaturePad
        ref={padRef}
        className="pad-canvas"
        viewport={VIEWPORT}
        stroke={{ color: strokeColor, width: strokeWidth }}
        tabIndex={0}
        aria-label="Signature drawing area"
        aria-describedby={ids + '-help ' + ids + '-status'}
        onSnapshot={setSnapshot}
      />
      <div className="pad-toolbar">
        <div className="pad-actions" role="group" aria-label="Signature actions">
          <span className="pad-tooltip" data-tooltip="Undo">
            <button
              type="button"
              className="pad-icon-button"
              aria-label="Undo"
              onClick={() => padRef.current?.undo()}
              disabled={!snapshot.canUndo}
            >
              <Undo aria-hidden="true" size={15} weight="Outline" />
            </button>
          </span>
          <span className="pad-tooltip" data-tooltip="Redo">
            <button
              type="button"
              className="pad-icon-button"
              aria-label="Redo"
              onClick={() => padRef.current?.redo()}
              disabled={!snapshot.canRedo}
            >
              <Redo aria-hidden="true" size={15} weight="Outline" />
            </button>
          </span>
          <span className="pad-tooltip" data-tooltip="Clear">
            <button
              type="button"
              className="pad-icon-button"
              aria-label="Clear"
              onClick={() => {
                padRef.current?.clear();
                setMessage('Signature cleared.');
              }}
              disabled={snapshot.isEmpty}
            >
              <Trash aria-hidden="true" size={15} weight="Outline" />
            </button>
          </span>
        </div>
        <div className="pad-style" role="group" aria-label="Stroke style">
          {STROKE_COLORS.map((color) => (
            <span key={color} className="pad-tooltip" data-tooltip="Stroke color">
              <button
                type="button"
                className={'pad-swatch' + (strokeColor === color ? ' is-active' : '')}
                style={{ background: color }}
                aria-label={'Stroke color ' + color}
                aria-pressed={strokeColor === color}
                onClick={() => setStrokeColor(color)}
              />
            </span>
          ))}
          <label className="pad-tooltip" data-tooltip="Custom color">
            <span className="visually-hidden">Custom stroke color</span>
            <span className="pad-custom-color">
              <input
                type="color"
                value={strokeColor}
                onChange={(event) => setStrokeColor(event.target.value)}
              />
            </span>
          </label>
          <label className="pad-width pad-tooltip" data-tooltip={strokeWidth + 'px'}>
            <span className="visually-hidden">Stroke width {strokeWidth} pixels</span>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={strokeWidth}
              aria-valuetext={strokeWidth + ' pixels'}
              onChange={(event) => setStrokeWidth(Number(event.target.value))}
            />
          </label>
        </div>
        <span className="pad-count">
          {snapshot.strokeCount}
          <span className="visually-hidden">
            {snapshot.strokeCount === 1 ? ' stroke' : ' strokes'}
          </span>
        </span>
      </div>
      <p className="visually-hidden" id={ids + '-status'} role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}

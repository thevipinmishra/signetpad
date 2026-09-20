import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Redo, Trash, Undo } from 'reicon-react';
import { useSignaturePad } from 'signetpad/react';
import { createCanvasRenderer, type CanvasRenderer } from 'signetpad/canvas';

const VIEWPORT = { width: 720, height: 240 };
const STROKE_COLORS = ['#102935', '#b94d29', '#167769', '#2b67d1'] as const;

export function InteractivePad() {
  const ids = useId();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const [strokeColor, setStrokeColor] = useState<string>(STROKE_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [message, setMessage] = useState('Ready when you are.');
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
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;
    const renderer = createCanvasRenderer(context, {
      viewport: VIEWPORT,
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
      controller.subscribe(() => rendererRef.current?.update(controller.getStrokes()), {
        events: 'all',
      }),
    [controller],
  );

  useEffect(() => {
    controller.setStrokeStyle({ color: strokeColor, width: strokeWidth });
  }, [controller, strokeColor, strokeWidth]);

  return (
    <div className="pad-widget">
      <p className="visually-hidden" id={ids + '-help'}>
        Draw with a mouse, touch, or stylus. Use undo, redo, and clear to edit. Color and width
        apply to the next stroke.
      </p>
      <canvas
        ref={attachCanvas}
        className="pad-canvas"
        width={VIEWPORT.width}
        height={VIEWPORT.height}
        tabIndex={0}
        aria-label="Signature drawing area"
        aria-describedby={ids + '-help ' + ids + '-status'}
        {...surfaceProps}
      />
      <div className="pad-toolbar">
        <div className="pad-actions" role="group" aria-label="Signature actions">
          <button
            type="button"
            className="pad-icon-button"
            data-tooltip="Undo"
            aria-label="Undo"
            onClick={() => controller.undo()}
            disabled={!snapshot.canUndo}
          >
            <Undo aria-hidden="true" size={15} weight="Outline" />
          </button>
          <button
            type="button"
            className="pad-icon-button"
            data-tooltip="Redo"
            aria-label="Redo"
            onClick={() => controller.redo()}
            disabled={!snapshot.canRedo}
          >
            <Redo aria-hidden="true" size={15} weight="Outline" />
          </button>
          <button
            type="button"
            className="pad-icon-button"
            data-tooltip="Clear"
            aria-label="Clear"
            onClick={() => {
              controller.clear();
              setMessage('Signature cleared.');
            }}
            disabled={snapshot.isEmpty}
          >
            <Trash aria-hidden="true" size={15} weight="Outline" />
          </button>
        </div>
        <div className="pad-style" role="group" aria-label="Stroke style">
          {STROKE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={'pad-swatch' + (strokeColor === color ? ' is-active' : '')}
              style={{ background: color }}
              data-tooltip="Stroke color"
              aria-label={'Stroke color ' + color}
              aria-pressed={strokeColor === color}
              onClick={() => setStrokeColor(color)}
            />
          ))}
          <label className="pad-custom-color" data-tooltip="Custom color">
            <span className="visually-hidden">Custom stroke color</span>
            <input
              type="color"
              value={strokeColor}
              onChange={(event) => setStrokeColor(event.target.value)}
            />
          </label>
          <label className="pad-width" data-tooltip={strokeWidth + 'px'}>
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

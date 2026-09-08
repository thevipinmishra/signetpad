import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Pen, Redo, Trash, Undo } from 'reicon-react';
import { useSignaturePad } from '@signetpad/react';
import { createCanvasRenderer, type CanvasRenderer } from '@signetpad/renderer-canvas';

const VIEWPORT = { width: 720, height: 280 };

export function InteractivePad() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const { controller, snapshot, surfaceProps, surfaceRef } = useSignaturePad({
    viewport: VIEWPORT,
  });
  const [message, setMessage] = useState('Ready when you are.');
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

  return (
    <div className="demo-shell">
      <div className="demo-topline">
        <span>
          <Pen aria-hidden="true" size={15} weight="Outline" />
          Live example
        </span>
        <code>@signetpad/react</code>
      </div>
      <p className="demo-label" id="demo-help">
        Draw with a mouse, touch, or stylus. Your strokes remain editable vector data.
      </p>
      <canvas
        ref={attachCanvas}
        className="demo-canvas"
        width={VIEWPORT.width}
        height={VIEWPORT.height}
        tabIndex={0}
        aria-label="Interactive signature drawing area"
        aria-describedby="demo-help demo-status"
        {...surfaceProps}
      />
      <div className="demo-controls" aria-label="Signature controls">
        <button type="button" onClick={() => controller.undo()} disabled={!snapshot.canUndo}>
          <Undo aria-hidden="true" size={15} weight="Outline" />
          Undo
        </button>
        <button type="button" onClick={() => controller.redo()} disabled={!snapshot.canRedo}>
          <Redo aria-hidden="true" size={15} weight="Outline" />
          Redo
        </button>
        <button
          type="button"
          onClick={() => {
            controller.clear();
            setMessage('Signature cleared.');
          }}
          disabled={snapshot.isEmpty}
        >
          <Trash aria-hidden="true" size={15} weight="Outline" />
          Clear
        </button>
        <span className="demo-count">
          {snapshot.strokeCount} {snapshot.strokeCount === 1 ? 'stroke' : 'strokes'}
        </span>
      </div>
      <div className="demo-status" id="demo-status" role="status" aria-live="polite">
        {message}
      </div>
    </div>
  );
}

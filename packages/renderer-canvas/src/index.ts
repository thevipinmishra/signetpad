import type { SignatureData, SignatureStroke, StrokeStyle, Viewport } from '@signetpad/core';

export interface CanvasRendererOptions {
  /** Logical viewport dimensions. Defaults to the current canvas backing size. */
  viewport?: Viewport;
  /** Backing-store scale. Defaults to 1; pass devicePixelRatio for a crisp display. */
  dpr?: number;
}

export interface CanvasImageOptions {
  /** Any MIME type supported by the browser's canvas encoder. Defaults to PNG. */
  type?: string;
  /** Encoder quality from 0 to 1 when the selected format supports it. */
  quality?: number;
}

export interface CanvasRenderer {
  resize(viewport: Viewport, dpr?: number): void;
  clear(): void;
  /** Redraws every stroke and resets the incremental renderer state. */
  render(strokes: ReadonlyArray<SignatureStroke>): void;
  /** Draws only appended points when the stroke list is append-only. */
  update(strokes: ReadonlyArray<SignatureStroke>): void;
  renderData(data: SignatureData): void;
  /** Encodes the current HTML canvas as a data URL. */
  toDataURL(options?: CanvasImageOptions): string;
  /** Encodes the current HTML or Offscreen canvas as a Blob. */
  toBlob(options?: CanvasImageOptions): Promise<Blob>;
}

type CanvasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

interface RenderedStroke {
  id: string;
  pointCount: number;
  lastPoint: SignatureStroke['points'][number] | null;
  style: StrokeStyle;
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number`);
}

function validateViewport(viewport: Viewport): void {
  assertFinite(viewport.width, 'viewport.width');
  assertFinite(viewport.height, 'viewport.height');
  if (viewport.width < 0 || viewport.height < 0) {
    throw new RangeError('viewport dimensions cannot be negative');
  }
}

function validateDpr(dpr: number): void {
  assertFinite(dpr, 'dpr');
  if (dpr <= 0) throw new RangeError('dpr must be greater than zero');
}

function normalizeImageOptions(options: CanvasImageOptions): Required<CanvasImageOptions> {
  const quality = options.quality ?? 0.92;
  assertFinite(quality, 'quality');
  if (quality < 0 || quality > 1) throw new RangeError('quality must be between 0 and 1');

  return { type: options.type ?? 'image/png', quality };
}

function hasDataUrlEncoder(
  canvas: HTMLCanvasElement | OffscreenCanvas,
): canvas is HTMLCanvasElement {
  return 'toDataURL' in canvas && typeof canvas.toDataURL === 'function';
}

function hasBlobEncoder(canvas: HTMLCanvasElement | OffscreenCanvas): canvas is HTMLCanvasElement {
  return 'toBlob' in canvas && typeof canvas.toBlob === 'function';
}

function sameStyle(a: StrokeStyle, b: StrokeStyle): boolean {
  return (
    a.color === b.color &&
    a.width === b.width &&
    a.opacity === b.opacity &&
    a.cap === b.cap &&
    a.join === b.join
  );
}

function samePoint(
  a: SignatureStroke['points'][number] | null,
  b: SignatureStroke['points'][number] | null,
): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.time === b.time &&
    a.pressure === b.pressure &&
    a.tiltX === b.tiltX &&
    a.tiltY === b.tiltY &&
    a.pointerType === b.pointerType
  );
}

function drawStyle(context: CanvasContext, style: StrokeStyle): void {
  context.strokeStyle = style.color;
  context.fillStyle = style.color;
  context.globalAlpha = style.opacity;
  context.lineWidth = style.width;
  context.lineCap = style.cap;
  context.lineJoin = style.join;
}

function drawStroke(context: CanvasContext, stroke: SignatureStroke): void {
  const [firstPoint] = stroke.points;
  if (!firstPoint) return;

  context.save();
  drawStyle(context, stroke.style);

  if (stroke.points.length === 1) {
    context.beginPath();
    context.arc(firstPoint.x, firstPoint.y, stroke.style.width / 2, 0, Math.PI * 2);
    context.fill();
  } else {
    context.beginPath();
    context.moveTo(firstPoint.x, firstPoint.y);
    for (const point of stroke.points.slice(1)) context.lineTo(point.x, point.y);
    context.stroke();
  }

  context.restore();
}

function drawAppendedPoints(
  context: CanvasContext,
  stroke: SignatureStroke,
  fromPoint: SignatureStroke['points'][number] | null,
  fromPointIndex: number,
): void {
  const firstNewPoint = stroke.points[fromPointIndex];
  if (!firstNewPoint) return;

  context.save();
  drawStyle(context, stroke.style);

  if (!fromPoint && stroke.points.length === 1) {
    context.beginPath();
    context.arc(firstNewPoint.x, firstNewPoint.y, stroke.style.width / 2, 0, Math.PI * 2);
    context.fill();
  } else {
    context.beginPath();
    context.moveTo(fromPoint?.x ?? firstNewPoint.x, fromPoint?.y ?? firstNewPoint.y);
    for (const point of stroke.points.slice(fromPointIndex)) context.lineTo(point.x, point.y);
    context.stroke();
  }

  context.restore();
}

export function createCanvasRenderer(
  context: CanvasContext,
  options: CanvasRendererOptions = {},
): CanvasRenderer {
  const initialViewport = options.viewport ?? {
    width: context.canvas.width,
    height: context.canvas.height,
  };
  let viewport = { ...initialViewport };
  let dpr = options.dpr ?? 1;
  let rendered: RenderedStroke[] = [];

  validateViewport(viewport);
  validateDpr(dpr);

  const resize = (nextViewport: Viewport, nextDpr = dpr): void => {
    validateViewport(nextViewport);
    validateDpr(nextDpr);
    viewport = { ...nextViewport };
    dpr = nextDpr;
    context.canvas.width = Math.round(viewport.width * dpr);
    context.canvas.height = Math.round(viewport.height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    rendered = [];
  };

  const clear = (): void => {
    context.clearRect(0, 0, viewport.width, viewport.height);
    rendered = [];
  };

  const render = (strokes: ReadonlyArray<SignatureStroke>): void => {
    clear();
    for (const stroke of strokes) drawStroke(context, stroke);
    rendered = strokes.map((stroke) => ({
      id: stroke.id,
      pointCount: stroke.points.length,
      lastPoint: stroke.points[stroke.points.length - 1] ?? null,
      style: { ...stroke.style },
    }));
  };

  const update = (strokes: ReadonlyArray<SignatureStroke>): void => {
    const canAppend =
      strokes.length >= rendered.length &&
      rendered.every((previous, index) => {
        const next = strokes[index];
        if (!next || next.id !== previous.id || !sameStyle(next.style, previous.style))
          return false;
        return next.points.length >= previous.pointCount;
      });

    if (!canAppend) {
      render(strokes);
      return;
    }

    for (let index = 0; index < strokes.length; index += 1) {
      const stroke = strokes[index];
      const previous = rendered[index];
      if (!stroke || !previous) {
        if (stroke) drawStroke(context, stroke);
        continue;
      }

      if (stroke.points.length === previous.pointCount) {
        if (!samePoint(stroke.points[stroke.points.length - 1] ?? null, previous.lastPoint)) {
          render(strokes);
          return;
        }
        continue;
      }

      drawAppendedPoints(context, stroke, previous.lastPoint, previous.pointCount);
    }

    rendered = strokes.map((stroke) => ({
      id: stroke.id,
      pointCount: stroke.points.length,
      lastPoint: stroke.points[stroke.points.length - 1] ?? null,
      style: { ...stroke.style },
    }));
  };

  resize(viewport, dpr);

  return {
    resize,
    clear,
    render,
    update,
    renderData(data) {
      resize(data.viewport, dpr);
      render(data.strokes);
    },
    toDataURL(imageOptions = {}) {
      const { type, quality } = normalizeImageOptions(imageOptions);
      const canvas = context.canvas;
      if (!hasDataUrlEncoder(canvas)) {
        throw new TypeError('toDataURL is only available for an HTMLCanvasElement');
      }
      return canvas.toDataURL(type, quality);
    },
    async toBlob(imageOptions = {}) {
      const { type, quality } = normalizeImageOptions(imageOptions);
      const canvas = context.canvas;

      if ('convertToBlob' in canvas && typeof canvas.convertToBlob === 'function') {
        return canvas.convertToBlob({ type, quality });
      }

      if (!hasBlobEncoder(canvas)) {
        throw new TypeError('The current canvas cannot be encoded as a Blob');
      }

      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new TypeError('Canvas encoding returned no Blob'));
          },
          type,
          quality,
        );
      });
    },
  };
}

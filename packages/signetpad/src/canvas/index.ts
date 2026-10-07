import { assertCssColor } from '../color.js';
import { trimSignatureData } from '../geometry.js';
import { averagePressure, needsSegmentedStroke, strokeWidthAt } from '../paths.js';
import type {
  SignatureData,
  SignaturePad,
  SignaturePoint,
  SignatureStroke,
  StrokeStyle,
  Viewport,
} from '../types.js';

export interface CanvasRendererOptions {
  /** Logical viewport dimensions. Defaults to the current canvas backing size. */
  viewport?: Viewport;
  /** Backing-store scale. Defaults to 1; pass devicePixelRatio for a crisp display. */
  dpr?: number;
  /** Scale stroke width by point pressure. Defaults to false. */
  pressureWidth?: boolean;
  /** Fit polylines to cubic curves. Defaults to false. */
  curveFitting?: boolean;
}

export interface CanvasImageOptions {
  /** Any MIME type supported by the browser's canvas encoder. Defaults to PNG. */
  type?: string;
  /** Encoder quality from 0 to 1 when the selected format supports it. */
  quality?: number;
  /** Crop the encoded image to ink bounds before encoding. */
  trim?: boolean;
  /** Extra padding around trimmed ink bounds, in viewport units. Defaults to 0. */
  padding?: number;
}

export interface CanvasRenderer {
  resize(viewport: Viewport, dpr?: number): void;
  clear(): void;
  /** Updates pressure-width and curve-fitting flags used by later draws. */
  setInkOptions(options: { pressureWidth?: boolean; curveFitting?: boolean }): void;
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

export interface AttachCanvasRendererOptions {
  /** Backing-store scale. Defaults to the current `devicePixelRatio`, or 1. */
  dpr?: number;
}

export interface AttachedCanvasRenderer {
  renderer: CanvasRenderer;
  detach: () => void;
}

function resolveDpr(dpr: number | undefined): number {
  if (dpr !== undefined) return dpr;
  const next =
    typeof globalThis.devicePixelRatio === 'number' ? globalThis.devicePixelRatio : Number.NaN;
  return Number.isFinite(next) && next > 0 ? next : 1;
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

function normalizeImageOptions(options: CanvasImageOptions): {
  type: string;
  quality: number;
  trim: boolean;
  padding: number;
} {
  const quality = options.quality ?? 0.92;
  assertFinite(quality, 'quality');
  if (quality < 0 || quality > 1) throw new RangeError('quality must be between 0 and 1');

  const padding = options.padding ?? 0;
  assertFinite(padding, 'padding');
  if (padding < 0) throw new RangeError('padding cannot be negative');

  return {
    type: options.type ?? 'image/png',
    quality,
    trim: options.trim === true,
    padding,
  };
}

function createTempCanvas(width: number, height: number): HTMLCanvasElement {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
    throw new TypeError('trim image export requires a DOM canvas');
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function encodeTrimmedDataURL(
  data: SignatureData,
  type: string,
  quality: number,
  padding: number,
  encodeDpr: number,
): string {
  const trimmed = trimSignatureData(data, { padding });
  const canvas = createTempCanvas(
    trimmed.viewport.width * encodeDpr,
    trimmed.viewport.height * encodeDpr,
  );
  const context = canvas.getContext('2d');
  if (!context) throw new TypeError('Unable to create a 2D canvas context for trim export');

  const renderer = createCanvasRenderer(context, {
    viewport: trimmed.viewport,
    dpr: encodeDpr,
  });
  renderer.render(trimmed.strokes);
  return canvas.toDataURL(type, quality);
}

async function encodeTrimmedBlob(
  data: SignatureData,
  type: string,
  quality: number,
  padding: number,
  encodeDpr: number,
): Promise<Blob> {
  const trimmed = trimSignatureData(data, { padding });
  const canvas = createTempCanvas(
    trimmed.viewport.width * encodeDpr,
    trimmed.viewport.height * encodeDpr,
  );
  const context = canvas.getContext('2d');
  if (!context) throw new TypeError('Unable to create a 2D canvas context for trim export');

  const renderer = createCanvasRenderer(context, {
    viewport: trimmed.viewport,
    dpr: encodeDpr,
  });
  renderer.render(trimmed.strokes);

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

function drawStyle(context: CanvasContext, style: StrokeStyle, lineWidth = style.width): void {
  const color = assertCssColor(style.color, 'stroke.color');
  context.strokeStyle = color;
  context.fillStyle = color;
  context.globalAlpha = style.opacity;
  context.lineWidth = lineWidth;
  context.lineCap = style.cap;
  context.lineJoin = style.join;
}

function strokePolyline(
  context: CanvasContext,
  points: ReadonlyArray<SignaturePoint>,
  curveFitting: boolean,
): void {
  const [firstPoint] = points;
  if (!firstPoint) return;
  context.beginPath();
  context.moveTo(firstPoint.x, firstPoint.y);
  if (!curveFitting || points.length < 3) {
    for (const point of points.slice(1)) context.lineTo(point.x, point.y);
    context.stroke();
    return;
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(0, index - 1)]!;
    const p1 = points[index]!;
    const p2 = points[index + 1]!;
    const p3 = points[Math.min(points.length - 1, index + 2)]!;
    context.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y,
    );
  }
  context.stroke();
}

function drawStroke(
  context: CanvasContext,
  stroke: SignatureStroke,
  pressureWidth: boolean,
  curveFitting: boolean,
): void {
  const [firstPoint] = stroke.points;
  if (!firstPoint) return;

  context.save();

  if (stroke.points.length === 1) {
    const width = strokeWidthAt(stroke.style.width, firstPoint.pressure, pressureWidth);
    drawStyle(context, stroke.style, width);
    context.beginPath();
    context.arc(firstPoint.x, firstPoint.y, width / 2, 0, Math.PI * 2);
    context.fill();
  } else if (needsSegmentedStroke(stroke, pressureWidth)) {
    for (let index = 1; index < stroke.points.length; index += 1) {
      const from = stroke.points[index - 1]!;
      const to = stroke.points[index]!;
      const width = strokeWidthAt(stroke.style.width, averagePressure(from, to), pressureWidth);
      drawStyle(context, stroke.style, width);
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
    }
  } else {
    drawStyle(context, stroke.style);
    strokePolyline(context, stroke.points, curveFitting);
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
  let pressureWidth = options.pressureWidth === true;
  let curveFitting = options.curveFitting === true;
  let rendered: RenderedStroke[] = [];
  let lastStrokes: SignatureStroke[] = [];

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
    lastStrokes = [];
  };

  const render = (strokes: ReadonlyArray<SignatureStroke>): void => {
    context.clearRect(0, 0, viewport.width, viewport.height);
    rendered = [];
    for (const stroke of strokes) drawStroke(context, stroke, pressureWidth, curveFitting);
    lastStrokes = strokes.map((stroke) => ({
      id: stroke.id,
      points: stroke.points.map((point) => ({ ...point })),
      style: { ...stroke.style },
    }));
    rendered = strokes.map((stroke) => ({
      id: stroke.id,
      pointCount: stroke.points.length,
      lastPoint: stroke.points[stroke.points.length - 1] ?? null,
      style: { ...stroke.style },
    }));
  };

  const update = (strokes: ReadonlyArray<SignatureStroke>): void => {
    if (pressureWidth || curveFitting) {
      render(strokes);
      return;
    }

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
        if (stroke) drawStroke(context, stroke, pressureWidth, curveFitting);
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

    lastStrokes = strokes.map((stroke) => ({
      id: stroke.id,
      points: stroke.points.map((point) => ({ ...point })),
      style: { ...stroke.style },
    }));
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
    setInkOptions(next) {
      if (next.pressureWidth !== undefined) pressureWidth = next.pressureWidth === true;
      if (next.curveFitting !== undefined) curveFitting = next.curveFitting === true;
    },
    render,
    update,
    renderData(data) {
      resize(data.viewport, dpr);
      render(data.strokes);
    },
    toDataURL(imageOptions = {}) {
      const { type, quality, trim, padding } = normalizeImageOptions(imageOptions);
      if (trim) {
        return encodeTrimmedDataURL(
          { version: 1, viewport, strokes: lastStrokes },
          type,
          quality,
          padding,
          dpr,
        );
      }

      const canvas = context.canvas;
      if (!hasDataUrlEncoder(canvas)) {
        throw new TypeError('toDataURL is only available for an HTMLCanvasElement');
      }
      return canvas.toDataURL(type, quality);
    },
    async toBlob(imageOptions = {}) {
      const { type, quality, trim, padding } = normalizeImageOptions(imageOptions);
      if (trim) {
        return encodeTrimmedBlob(
          { version: 1, viewport, strokes: lastStrokes },
          type,
          quality,
          padding,
          dpr,
        );
      }

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

/**
 * Paints a controller onto a canvas and keeps the pixels in sync with every point.
 * Returns `null` when the canvas cannot create a 2D context.
 */
export function attachCanvasRenderer(
  canvas: HTMLCanvasElement,
  pad: SignaturePad,
  options: AttachCanvasRendererOptions = {},
): AttachedCanvasRenderer | null {
  const context = canvas.getContext('2d');
  if (!context) return null;

  let viewport = pad.getViewport();
  let behavior = pad.getBehavior();
  const dpr = resolveDpr(options.dpr);
  const renderer = createCanvasRenderer(context, {
    viewport,
    dpr,
    pressureWidth: behavior.pressureWidth,
    curveFitting: behavior.curveFitting,
  });
  renderer.render(pad.getStrokes());

  const detach = pad.subscribe(
    () => {
      const nextBehavior = pad.getBehavior();
      const behaviorChanged =
        nextBehavior.pressureWidth !== behavior.pressureWidth ||
        nextBehavior.curveFitting !== behavior.curveFitting;
      if (behaviorChanged) {
        behavior = nextBehavior;
        renderer.setInkOptions({
          pressureWidth: behavior.pressureWidth,
          curveFitting: behavior.curveFitting,
        });
      }

      const nextViewport = pad.getViewport();
      if (
        behaviorChanged ||
        nextViewport.width !== viewport.width ||
        nextViewport.height !== viewport.height
      ) {
        viewport = nextViewport;
        renderer.resize(viewport, dpr);
        renderer.render(pad.getStrokes());
        return;
      }

      renderer.update(pad.getStrokes());
    },
    { events: 'all' },
  );

  return { renderer, detach };
}

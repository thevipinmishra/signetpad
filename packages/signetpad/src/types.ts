export type PointerType = 'mouse' | 'pen' | 'touch' | 'unknown';

export interface InputPoint {
  x: number;
  y: number;
  time?: number;
  pressure?: number;
  tiltX?: number;
  tiltY?: number;
  pointerType?: PointerType;
}

export interface SignaturePoint {
  x: number;
  y: number;
  time: number;
  pressure?: number;
  tiltX?: number;
  tiltY?: number;
  pointerType?: PointerType;
}

export type StrokeCap = 'butt' | 'round' | 'square';
export type StrokeJoin = 'bevel' | 'miter' | 'round';

export interface StrokeStyle {
  color: string;
  width: number;
  opacity: number;
  cap: StrokeCap;
  join: StrokeJoin;
}

export interface SignatureBehavior {
  /** Minimum distance between retained points, in viewport units. */
  minDistance: number;
  /** Exponential smoothing factor. 0 is raw input, 1 is maximum smoothing. */
  smoothing: number;
  /** Whether a tap with one point should be retained as a dot. */
  allowDots: boolean;
  /** Scale rendered stroke width by point pressure. Defaults to false. */
  pressureWidth: boolean;
  /** Fit polylines to cubic curves in SVG and canvas output. Defaults to false. */
  curveFitting: boolean;
}

export interface SignatureLimits {
  /** Maximum completed strokes retained. Defaults to 500. */
  maxStrokes: number;
  /** Maximum points allowed in one stroke. Defaults to 10_000. */
  maxPointsPerStroke: number;
  /** Maximum undo snapshots retained. Defaults to 100. */
  maxHistory: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface SignatureStroke {
  id: string;
  points: SignaturePoint[];
  style: StrokeStyle;
}

export interface SignatureData {
  version: 1;
  viewport: Viewport;
  strokes: SignatureStroke[];
}

export interface SignatureSvgOptions {
  /** Override the SVG's rendered width without changing its coordinate system. */
  width?: number;
  /** Override the SVG's rendered height without changing its coordinate system. */
  height?: number;
  /** Draw an opaque background rectangle before the signature. */
  background?: string;
  /** Crop the SVG viewBox to ink bounds (plus stroke width and padding). */
  trim?: boolean;
  /** Extra padding around trimmed ink bounds, in viewport units. Defaults to 0. */
  padding?: number;
  /** Scale stroke width by point pressure. Defaults to false. */
  pressureWidth?: boolean;
  /** Fit polylines to cubic curves. Defaults to false. */
  curveFitting?: boolean;
}

export interface SignatureSnapshot {
  revision: number;
  isEmpty: boolean;
  isDrawing: boolean;
  strokeCount: number;
  canUndo: boolean;
  canRedo: boolean;
  bounds: Bounds | null;
}

export interface SignatureSubscriptionOptions {
  /** `all` includes point-level updates; `state` only includes semantic changes. */
  events?: 'all' | 'state';
}

export interface SignaturePadOptions {
  viewport?: Viewport;
  stroke?: Partial<StrokeStyle>;
  behavior?: Partial<SignatureBehavior>;
  /** Caps for strokes, points, and undo history. */
  limits?: Partial<SignatureLimits>;
  clock?: () => number;
  createStrokeId?: () => string;
}

export interface SignaturePad {
  begin(point: InputPoint): boolean;
  move(point: InputPoint): boolean;
  end(): boolean;
  cancel(): boolean;

  undo(): boolean;
  redo(): boolean;
  clear(): boolean;
  reset(): void;

  loadData(data: SignatureData, options?: { resetHistory?: boolean }): void;
  toData(): SignatureData;
  /** Returns a portable, standalone SVG image of the current signature. */
  toSvg(options?: SignatureSvgOptions): string;
  getStrokes(): ReadonlyArray<SignatureStroke>;
  getSnapshot(): SignatureSnapshot;
  getViewport(): Viewport;
  setViewport(viewport: Viewport): void;
  getBehavior(): SignatureBehavior;
  setStrokeStyle(style: Partial<StrokeStyle>): void;
  setBehavior(behavior: Partial<SignatureBehavior>): void;

  subscribe(listener: () => void, options?: SignatureSubscriptionOptions): () => void;
}

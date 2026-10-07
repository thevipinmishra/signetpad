import { assertCssColor } from './color.js';
import { cloneStrokes, distanceSquared, getBounds } from './geometry.js';
import { toSvg } from './svg.js';
import type {
  InputPoint,
  SignatureBehavior,
  SignatureData,
  SignatureLimits,
  SignaturePad,
  SignaturePadOptions,
  SignaturePoint,
  SignatureSnapshot,
  SignatureStroke,
  SignatureSubscriptionOptions,
  StrokeStyle,
  Viewport,
} from './types.js';

const DEFAULT_VIEWPORT: Viewport = { width: 600, height: 240 };

const DEFAULT_STYLE: StrokeStyle = {
  color: '#111827',
  width: 2,
  opacity: 1,
  cap: 'round',
  join: 'round',
};

const DEFAULT_BEHAVIOR: SignatureBehavior = {
  minDistance: 0.5,
  smoothing: 0.35,
  allowDots: true,
  pressureWidth: false,
  curveFitting: false,
};

const DEFAULT_LIMITS: SignatureLimits = {
  maxStrokes: 500,
  maxPointsPerStroke: 10_000,
  maxHistory: 100,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

function validateViewport(viewport: Viewport): Viewport {
  assertFinite(viewport.width, 'viewport.width');
  assertFinite(viewport.height, 'viewport.height');

  if (viewport.width < 0 || viewport.height < 0) {
    throw new RangeError('viewport dimensions cannot be negative');
  }

  return { width: viewport.width, height: viewport.height };
}

function normalizePoint(input: InputPoint, now: () => number): SignaturePoint {
  assertFinite(input.x, 'point.x');
  assertFinite(input.y, 'point.y');
  if (input.time !== undefined) assertFinite(input.time, 'point.time');
  if (input.pressure !== undefined) assertFinite(input.pressure, 'point.pressure');
  if (input.tiltX !== undefined) assertFinite(input.tiltX, 'point.tiltX');
  if (input.tiltY !== undefined) assertFinite(input.tiltY, 'point.tiltY');

  const time = input.time ?? now();
  assertFinite(time, 'point.time');

  const point: SignaturePoint = {
    x: input.x,
    y: input.y,
    time,
  };

  if (input.pressure !== undefined) point.pressure = clamp(input.pressure, 0, 1);
  if (input.tiltX !== undefined) point.tiltX = input.tiltX;
  if (input.tiltY !== undefined) point.tiltY = input.tiltY;
  if (input.pointerType !== undefined) point.pointerType = input.pointerType;

  return point;
}

function validateLimits(limits: SignatureLimits): SignatureLimits {
  assertFinite(limits.maxStrokes, 'limits.maxStrokes');
  assertFinite(limits.maxPointsPerStroke, 'limits.maxPointsPerStroke');
  assertFinite(limits.maxHistory, 'limits.maxHistory');
  if (limits.maxStrokes < 1) throw new RangeError('limits.maxStrokes must be at least 1');
  if (limits.maxPointsPerStroke < 1) {
    throw new RangeError('limits.maxPointsPerStroke must be at least 1');
  }
  if (limits.maxHistory < 1) throw new RangeError('limits.maxHistory must be at least 1');
  return {
    maxStrokes: Math.floor(limits.maxStrokes),
    maxPointsPerStroke: Math.floor(limits.maxPointsPerStroke),
    maxHistory: Math.floor(limits.maxHistory),
  };
}

function validateData(data: SignatureData, limits: SignatureLimits): void {
  if (data.version !== 1)
    throw new RangeError(`Unsupported signature data version: ${data.version}`);
  validateViewport(data.viewport);

  if (data.strokes.length > limits.maxStrokes) {
    throw new RangeError(`Signature exceeds maxStrokes (${limits.maxStrokes})`);
  }

  for (const stroke of data.strokes) {
    if (!stroke.id) throw new TypeError('Every stroke must have an id');
    if (!stroke.points.length) throw new TypeError('Every stroke must have at least one point');
    if (stroke.points.length > limits.maxPointsPerStroke) {
      throw new RangeError(`Stroke exceeds maxPointsPerStroke (${limits.maxPointsPerStroke})`);
    }
    validateStyle(stroke.style);
    for (const point of stroke.points) {
      assertFinite(point.x, 'point.x');
      assertFinite(point.y, 'point.y');
      assertFinite(point.time, 'point.time');
      if (point.pressure !== undefined) {
        assertFinite(point.pressure, 'point.pressure');
        if (point.pressure < 0 || point.pressure > 1) {
          throw new RangeError('point.pressure must be 0..1');
        }
      }
      if (point.tiltX !== undefined) assertFinite(point.tiltX, 'point.tiltX');
      if (point.tiltY !== undefined) assertFinite(point.tiltY, 'point.tiltY');
    }
  }
}

export function createSignaturePad(options: SignaturePadOptions = {}): SignaturePad {
  let viewport = validateViewport(options.viewport ?? DEFAULT_VIEWPORT);
  let style: StrokeStyle = { ...DEFAULT_STYLE, ...options.stroke };
  let behavior: SignatureBehavior = { ...DEFAULT_BEHAVIOR, ...options.behavior };
  const limits = validateLimits({ ...DEFAULT_LIMITS, ...options.limits });
  const clock = options.clock ?? Date.now;
  const createStrokeId = options.createStrokeId ?? (() => `stroke-${++strokeSequence}`);

  style = validateStyle(style);
  validateBehavior(behavior);

  let strokes: SignatureStroke[] = [];
  let activeStroke: SignatureStroke | null = null;
  let history: SignatureStroke[][] = [];
  let future: SignatureStroke[][] = [];
  let futureBeforeStroke: SignatureStroke[][] | null = null;
  let strokeCheckpointed = false;
  let revision = 0;
  let cachedSnapshot: SignatureSnapshot | null = null;
  const listeners = new Map<() => void, SignatureSubscriptionOptions>();

  const emit = (event: 'all' | 'state' = 'state'): void => {
    revision += 1;
    cachedSnapshot = null;
    for (const [listener, subscription] of listeners) {
      if (event === 'state' || subscription.events !== 'state') listener();
    }
  };

  const trimHistory = (): void => {
    while (history.length > limits.maxHistory) history.shift();
  };

  const checkpoint = (): void => {
    if (!strokeCheckpointed) {
      history.push(cloneStrokes(strokes));
      trimHistory();
      futureBeforeStroke = future;
      future = [];
      strokeCheckpointed = true;
    }
  };

  const allStrokes = (): SignatureStroke[] =>
    activeStroke ? cloneStrokes([...strokes, activeStroke]) : cloneStrokes(strokes);

  const cancelActiveStroke = (): boolean => {
    if (!activeStroke) return false;

    activeStroke = null;
    if (strokeCheckpointed) {
      history.pop();
      future = futureBeforeStroke ?? [];
    }
    futureBeforeStroke = null;
    strokeCheckpointed = false;
    emit();
    return true;
  };

  const pad: SignaturePad = {
    begin(input) {
      if (activeStroke) cancelActiveStroke();
      if (strokes.length >= limits.maxStrokes) {
        throw new RangeError(`Signature exceeds maxStrokes (${limits.maxStrokes})`);
      }

      const point = normalizePoint(input, clock);
      activeStroke = {
        id: createStrokeId(),
        points: [point],
        style: { ...style },
      };
      emit();
      return true;
    },

    move(input) {
      if (!activeStroke) return false;

      const rawPoint = normalizePoint(input, clock);
      const previous = activeStroke.points[activeStroke.points.length - 1];
      if (!previous) return false;

      if (distanceSquared(previous, rawPoint) < behavior.minDistance ** 2) return false;
      if (activeStroke.points.length >= limits.maxPointsPerStroke) {
        throw new RangeError(`Stroke exceeds maxPointsPerStroke (${limits.maxPointsPerStroke})`);
      }

      checkpoint();
      const smoothing = behavior.smoothing;
      const point: SignaturePoint = {
        x: previous.x + (rawPoint.x - previous.x) * (1 - smoothing),
        y: previous.y + (rawPoint.y - previous.y) * (1 - smoothing),
        time: rawPoint.time,
      };

      if (rawPoint.pressure !== undefined) point.pressure = rawPoint.pressure;
      if (rawPoint.tiltX !== undefined) point.tiltX = rawPoint.tiltX;
      if (rawPoint.tiltY !== undefined) point.tiltY = rawPoint.tiltY;
      if (rawPoint.pointerType !== undefined) point.pointerType = rawPoint.pointerType;

      activeStroke.points.push(point);
      emit('all');
      return true;
    },

    end() {
      if (!activeStroke) return false;
      if (!behavior.allowDots && activeStroke.points.length === 1) {
        cancelActiveStroke();
        return false;
      }

      checkpoint();
      strokes.push(activeStroke);
      activeStroke = null;
      futureBeforeStroke = null;
      strokeCheckpointed = false;
      emit();
      return true;
    },

    cancel: cancelActiveStroke,

    undo() {
      if (activeStroke) return cancelActiveStroke();
      const previous = history.pop();
      if (!previous) return false;

      future.push(cloneStrokes(strokes));
      strokes = previous;
      emit();
      return true;
    },

    redo() {
      if (activeStroke) return false;
      const next = future.pop();
      if (!next) return false;

      history.push(cloneStrokes(strokes));
      trimHistory();
      strokes = next;
      emit();
      return true;
    },

    clear() {
      if (activeStroke) cancelActiveStroke();
      if (!strokes.length) return false;

      checkpoint();
      strokes = [];
      strokeCheckpointed = false;
      futureBeforeStroke = null;
      emit();
      return true;
    },

    reset() {
      activeStroke = null;
      strokes = [];
      history = [];
      future = [];
      futureBeforeStroke = null;
      strokeCheckpointed = false;
      emit();
    },

    loadData(data, loadOptions = {}) {
      validateData(data, limits);
      activeStroke = null;
      strokes = cloneStrokes(data.strokes);
      viewport = { ...data.viewport };
      futureBeforeStroke = null;
      strokeCheckpointed = false;
      if (loadOptions.resetHistory ?? true) {
        history = [];
        future = [];
      }
      emit();
    },

    toData() {
      return {
        version: 1,
        viewport: { ...viewport },
        strokes: allStrokes(),
      };
    },

    toSvg(svgOptions = {}) {
      return toSvg(
        {
          version: 1,
          viewport: { ...viewport },
          strokes: allStrokes(),
        },
        {
          pressureWidth: behavior.pressureWidth,
          curveFitting: behavior.curveFitting,
          ...svgOptions,
        },
      );
    },

    getStrokes() {
      return allStrokes();
    },

    getSnapshot() {
      if (cachedSnapshot) return cachedSnapshot;

      const currentStrokes = allStrokes();
      cachedSnapshot = {
        revision,
        isEmpty: currentStrokes.length === 0,
        isDrawing: activeStroke !== null,
        strokeCount: currentStrokes.length,
        canUndo: activeStroke !== null || history.length > 0,
        canRedo: activeStroke === null && future.length > 0,
        bounds: getBounds(currentStrokes),
      };
      return cachedSnapshot;
    },

    getViewport() {
      return { ...viewport };
    },

    getBehavior() {
      return { ...behavior };
    },

    setViewport(nextViewport) {
      const next = validateViewport(nextViewport);
      if (next.width === viewport.width && next.height === viewport.height) return;
      viewport = next;
      emit();
    },

    setStrokeStyle(nextStyle) {
      const next = validateStyle({ ...style, ...nextStyle });
      if (
        next.color === style.color &&
        next.width === style.width &&
        next.opacity === style.opacity &&
        next.cap === style.cap &&
        next.join === style.join
      ) {
        return;
      }
      style = next;
      emit();
    },

    setBehavior(nextBehavior) {
      const next = { ...behavior, ...nextBehavior };
      validateBehavior(next);
      if (
        next.minDistance === behavior.minDistance &&
        next.smoothing === behavior.smoothing &&
        next.allowDots === behavior.allowDots &&
        next.pressureWidth === behavior.pressureWidth &&
        next.curveFitting === behavior.curveFitting
      ) {
        return;
      }
      behavior = next;
      emit();
    },

    subscribe(listener, subscription = {}) {
      listeners.set(listener, subscription);
      return () => listeners.delete(listener);
    },
  };

  return pad;
}

let strokeSequence = 0;

function validateStyle(style: StrokeStyle): StrokeStyle {
  const color = assertCssColor(style.color, 'stroke.color');
  assertFinite(style.width, 'stroke.width');
  assertFinite(style.opacity, 'stroke.opacity');
  if (style.width < 0) throw new RangeError('stroke.width cannot be negative');
  if (style.opacity < 0 || style.opacity > 1) throw new RangeError('stroke.opacity must be 0..1');
  if (!['butt', 'round', 'square'].includes(style.cap)) {
    throw new RangeError(`Unsupported stroke cap: ${style.cap}`);
  }
  if (!['bevel', 'miter', 'round'].includes(style.join)) {
    throw new RangeError(`Unsupported stroke join: ${style.join}`);
  }
  return { ...style, color };
}

function validateBehavior(behavior: SignatureBehavior): void {
  assertFinite(behavior.minDistance, 'behavior.minDistance');
  assertFinite(behavior.smoothing, 'behavior.smoothing');
  if (behavior.minDistance < 0) throw new RangeError('behavior.minDistance cannot be negative');
  if (behavior.smoothing < 0 || behavior.smoothing > 1) {
    throw new RangeError('behavior.smoothing must be 0..1');
  }
  if (typeof behavior.allowDots !== 'boolean') {
    throw new TypeError('behavior.allowDots must be a boolean');
  }
  if (typeof behavior.pressureWidth !== 'boolean') {
    throw new TypeError('behavior.pressureWidth must be a boolean');
  }
  if (typeof behavior.curveFitting !== 'boolean') {
    throw new TypeError('behavior.curveFitting must be a boolean');
  }
}

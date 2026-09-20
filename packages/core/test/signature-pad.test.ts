import { describe, expect, it } from 'vitest';
import { createSignaturePad, toSvg } from '../src/index.js';

describe('createSignaturePad', () => {
  it('captures a versioned vector signature', () => {
    const pad = createSignaturePad({
      viewport: { width: 100, height: 50 },
      clock: () => 10,
      createStrokeId: () => 'signature-1',
    });

    expect(pad.begin({ x: 10, y: 20, pressure: 2 })).toBe(true);
    expect(pad.move({ x: 30, y: 20, time: 20, pressure: 0.5 })).toBe(true);
    expect(pad.end()).toBe(true);

    expect(pad.toData()).toEqual({
      version: 1,
      viewport: { width: 100, height: 50 },
      strokes: [
        {
          id: 'signature-1',
          points: [
            { x: 10, y: 20, time: 10, pressure: 1 },
            { x: 23, y: 20, time: 20, pressure: 0.5 },
          ],
          style: {
            color: '#111827',
            width: 2,
            opacity: 1,
            cap: 'round',
            join: 'round',
          },
        },
      ],
    });
  });

  it('supports undo and redo without mutating returned data', () => {
    const pad = createSignaturePad({ createStrokeId: () => 'one' });
    pad.begin({ x: 0, y: 0 });
    pad.end();

    const data = pad.toData();
    data.strokes[0]!.points[0]!.x = 999;
    expect(pad.toData().strokes[0]!.points[0]!.x).toBe(0);

    expect(pad.undo()).toBe(true);
    expect(pad.getSnapshot().isEmpty).toBe(true);
    expect(pad.redo()).toBe(true);
    expect(pad.getSnapshot().strokeCount).toBe(1);
  });

  it('filters nearby points and can discard dots', () => {
    const pad = createSignaturePad({
      behavior: { minDistance: 5, allowDots: false },
    });

    pad.begin({ x: 0, y: 0 });
    expect(pad.move({ x: 1, y: 1 })).toBe(false);
    expect(pad.end()).toBe(false);
    expect(pad.getSnapshot().isEmpty).toBe(true);
  });

  it('notifies subscribers and supports loading data', () => {
    const pad = createSignaturePad();
    let notifications = 0;
    const unsubscribe = pad.subscribe(() => notifications++);

    pad.loadData({
      version: 1,
      viewport: { width: 20, height: 20 },
      strokes: [
        {
          id: 'loaded',
          points: [{ x: 1, y: 2, time: 3 }],
          style: { color: 'black', width: 1, opacity: 1, cap: 'round', join: 'round' },
        },
      ],
    });

    expect(notifications).toBe(1);
    expect(pad.getSnapshot().bounds).toEqual({ minX: 1, minY: 2, maxX: 1, maxY: 2 });
    unsubscribe();
    pad.reset();
    expect(notifications).toBe(1);
  });

  it('keeps snapshots stable and separates point updates from state updates', () => {
    const pad = createSignaturePad();
    let allEvents = 0;
    let stateEvents = 0;
    pad.subscribe(() => allEvents++);
    pad.subscribe(() => stateEvents++, { events: 'state' });

    expect(pad.getSnapshot()).toBe(pad.getSnapshot());
    pad.begin({ x: 0, y: 0 });
    pad.move({ x: 10, y: 10 });

    expect(allEvents).toBe(2);
    expect(stateEvents).toBe(1);
    expect(pad.getSnapshot().isDrawing).toBe(true);
  });

  it('exports standalone SVG for strokes and dots', () => {
    const pad = createSignaturePad({
      viewport: { width: 120, height: 60 },
      createStrokeId: () => 'signature',
      stroke: { color: '#123456', width: 4 },
    });
    pad.begin({ x: 10, y: 20 });
    pad.move({ x: 40, y: 30 });
    pad.end();
    pad.begin({ x: 70, y: 40 });
    pad.end();

    expect(pad.toSvg({ background: '#ffffff' })).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60"><rect width="100%" height="100%" fill="#ffffff"/><path d="M 10 20 L 29.5 26.5" fill="none" stroke="#123456" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="1"/><circle cx="70" cy="40" r="2" fill="#123456" fill-opacity="1"/></svg>',
    );
  });

  it('rejects invalid data when serializing SVG directly', () => {
    expect(() =>
      toSvg({
        version: 1,
        viewport: { width: 1, height: 1 },
        strokes: [
          {
            id: 'invalid',
            points: [{ x: 0, y: 0, time: 0 }],
            style: {
              color: 'black',
              width: 1,
              opacity: 1,
              cap: 'round\" onload=\"alert(1)',
              join: 'round',
            } as never,
          },
        ],
      }),
    ).toThrow('Unsupported stroke cap');
  });

  it('cancels an in-progress stroke and restores redo history', () => {
    const pad = createSignaturePad({ createStrokeId: () => 'kept' });
    pad.begin({ x: 0, y: 0 });
    pad.end();
    pad.undo();

    pad.begin({ x: 4, y: 5 });
    pad.move({ x: 20, y: 20 });
    expect(pad.cancel()).toBe(true);
    expect(pad.getSnapshot()).toMatchObject({
      isEmpty: true,
      isDrawing: false,
      canRedo: true,
    });
    expect(pad.redo()).toBe(true);
    expect(pad.getSnapshot().strokeCount).toBe(1);
  });

  it('clear is undoable and reset forgets history', () => {
    const pad = createSignaturePad();
    pad.begin({ x: 1, y: 1 });
    pad.end();

    expect(pad.clear()).toBe(true);
    expect(pad.getSnapshot().isEmpty).toBe(true);
    expect(pad.undo()).toBe(true);
    expect(pad.getSnapshot().strokeCount).toBe(1);

    pad.reset();
    expect(pad.getSnapshot()).toMatchObject({
      isEmpty: true,
      canUndo: false,
      canRedo: false,
    });
  });

  it('rejects invalid input, styles, and stored data', () => {
    const pad = createSignaturePad();

    expect(() => pad.begin({ x: Number.NaN, y: 0 })).toThrow('point.x');
    expect(() => pad.setViewport({ width: -1, height: 10 })).toThrow('cannot be negative');
    expect(() => pad.setStrokeStyle({ opacity: 2 })).toThrow('stroke.opacity');
    expect(() => pad.setBehavior({ smoothing: 4 })).toThrow('behavior.smoothing');
    expect(() =>
      pad.loadData({
        version: 2 as never,
        viewport: { width: 10, height: 10 },
        strokes: [],
      }),
    ).toThrow('Unsupported signature data version');
    expect(() =>
      pad.loadData({
        version: 1,
        viewport: { width: 10, height: 10 },
        strokes: [
          {
            id: '',
            points: [{ x: 1, y: 1, time: 1 }],
            style: { color: 'black', width: 1, opacity: 1, cap: 'round', join: 'round' },
          },
        ],
      }),
    ).toThrow('Every stroke must have an id');
  });

  it('escapes SVG attributes and can keep history when loading data', () => {
    const pad = createSignaturePad({
      viewport: { width: 40, height: 20 },
      stroke: { color: 'red"><script>', width: 2 },
    });
    pad.begin({ x: 1, y: 2 });
    pad.end();

    expect(pad.toSvg({ background: 'white"><img' })).toContain('fill="white&quot;&gt;&lt;img"');
    expect(pad.toSvg()).toContain('fill="red&quot;&gt;&lt;script&gt;"');

    pad.loadData(
      {
        version: 1,
        viewport: { width: 8, height: 8 },
        strokes: [],
      },
      { resetHistory: false },
    );
    expect(pad.getSnapshot().canUndo).toBe(true);

    const replaced = createSignaturePad();
    replaced.begin({ x: 1, y: 1 });
    replaced.end();
    replaced.loadData({
      version: 1,
      viewport: { width: 8, height: 8 },
      strokes: [],
    });
    expect(replaced.getSnapshot().canUndo).toBe(false);
  });

  it('updates viewport, style, and behavior after creation', () => {
    const pad = createSignaturePad();
    pad.setViewport({ width: 320, height: 120 });
    pad.setStrokeStyle({ color: '#ff0000', width: 5 });
    pad.setBehavior({ minDistance: 0, smoothing: 0, allowDots: true });
    pad.begin({ x: 1, y: 1 });
    pad.end();

    expect(pad.getViewport()).toEqual({ width: 320, height: 120 });
    expect(pad.toData().strokes[0]?.style).toMatchObject({ color: '#ff0000', width: 5 });
  });
});

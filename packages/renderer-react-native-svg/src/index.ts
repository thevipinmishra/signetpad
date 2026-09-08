import { createElement, useEffect, useState, type ComponentType } from 'react';
import Svg, { Circle, Path, type SvgProps } from 'react-native-svg';
import type { SignaturePad, SignatureStroke, Viewport } from '@signetpad/core';
import { strokeToSvgPath } from './path.js';

export { strokeToSvgPath } from './path.js';

export interface SignatureSvgProps extends Omit<SvgProps, 'children' | 'viewBox'> {
  pad?: SignaturePad;
  strokes?: ReadonlyArray<SignatureStroke>;
  viewport?: Viewport;
}

type CircleElementProps = {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity: number;
};

type PathElementProps = {
  d: string;
  fill: 'none';
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
  strokeLinecap: SignatureStroke['style']['cap'];
  strokeLinejoin: SignatureStroke['style']['join'];
};

const SvgElement = Svg as unknown as ComponentType<SvgProps>;
const CircleElement = Circle as unknown as ComponentType<CircleElementProps>;
const PathElement = Path as unknown as ComponentType<PathElementProps>;

function useLiveStrokes(pad: SignaturePad | undefined): ReadonlyArray<SignatureStroke> {
  const [strokes, setStrokes] = useState<ReadonlyArray<SignatureStroke>>(
    () => pad?.getStrokes() ?? [],
  );

  useEffect(() => {
    if (!pad) return;

    return pad.subscribe(() => setStrokes(pad.getStrokes()));
  }, [pad]);

  return strokes;
}

/**
 * Renders core strokes as React Native SVG elements. Pass `strokes` for controlled rendering or
 * `pad` to subscribe to live point-level updates. The SVG is visual-only and ignores touch input.
 */
export function SignatureSvg({ pad, strokes, viewport, ...svgProps }: SignatureSvgProps) {
  const liveStrokes = useLiveStrokes(pad);
  const renderedStrokes = strokes ?? liveStrokes;
  const resolvedViewport = viewport ?? pad?.getViewport() ?? { width: 600, height: 240 };
  const children = renderedStrokes.map((stroke) => {
    if (stroke.points.length === 1) {
      const point = stroke.points[0]!;
      return createElement(CircleElement, {
        key: stroke.id,
        cx: point.x,
        cy: point.y,
        r: stroke.style.width / 2,
        fill: stroke.style.color,
        opacity: stroke.style.opacity,
      });
    }

    return createElement(PathElement, {
      key: stroke.id,
      d: strokeToSvgPath(stroke),
      fill: 'none',
      stroke: stroke.style.color,
      strokeWidth: stroke.style.width,
      strokeOpacity: stroke.style.opacity,
      strokeLinecap: stroke.style.cap,
      strokeLinejoin: stroke.style.join,
    });
  });

  return createElement(
    SvgElement,
    {
      ...svgProps,
      width: svgProps.width ?? resolvedViewport.width,
      height: svgProps.height ?? resolvedViewport.height,
      viewBox: `0 0 ${resolvedViewport.width} ${resolvedViewport.height}`,
      pointerEvents: 'none',
    },
    children,
  );
}

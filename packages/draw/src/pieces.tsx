import { cssColor } from "@chalk/look";
import { curveCatmullRom, curveNatural, line, symbol } from "d3-shape";
import type { JSX } from "preact";
import { memo } from "preact/compat";
import { chevron } from "./shapes";
import { toPixels, useSpace } from "./stage";

/**
 * The pieces props and art are drawn with. Every piece:
 * - takes positions in the stage's own numbers, never pixels;
 * - takes colours as a look role or a hex (`cssColor`), never anything else;
 * - draws its shape at the origin and moves it with `transform`, so moving it never redraws it;
 * - is memoised: it redraws only when its own inputs (or the stage's scales) change.
 */

const colorStyle = (color: string | undefined): JSX.CSSProperties | undefined =>
  color === undefined ? undefined : { "--piece-color": cssColor(color) };

export type Tick = { value: number; label?: string; class?: string };

export type AxisProps = {
  /** Where the axis runs, in px from the top (a one-dimensional stage) or in the stage's y units. */
  y: number;
  ticks: readonly Tick[];
  /** Chevrons at both ends: the line goes on. */
  hasEnds?: boolean;
  /** How far below the axis the labels sit, px. */
  labelGap?: number;
};

function sameTicks(a: readonly Tick[], b: readonly Tick[]): boolean {
  return (
    a.length === b.length &&
    a.every((t, i) => {
      const u = b[i];
      return u !== undefined && t.value === u.value && t.label === u.label && t.class === u.class;
    })
  );
}

/** An axis across the whole stage, with ticks and their labels. */
export const Axis = memo(
  function Axis({ y, ticks, hasEnds = false, labelGap = 30 }: AxisProps): JSX.Element {
    const space = useSpace();
    const [, py] = toPixels(space, 0, y);
    const end = symbol(chevron, 70)() ?? "";
    return (
      <g class="draw-axis">
        <line class="draw-axis-line" x1={4} y1={py} x2={space.width - 4} y2={py} />
        {hasEnds && (
          <>
            <path class="draw-axis-end" d={end} transform={`translate(${space.width - 5} ${py})`} />
            <path class="draw-axis-end" d={end} transform={`translate(5 ${py}) scale(-1 1)`} />
          </>
        )}
        {ticks.map((tick) => (
          <g
            key={tick.value}
            class={tick.class === undefined ? "draw-tick" : `draw-tick ${tick.class}`}
            transform={`translate(${space.x(tick.value)} ${py})`}
          >
            <line y1={-9} y2={9} />
            {tick.label !== undefined && tick.label !== "" && (
              <text y={labelGap} text-anchor="middle">
                {tick.label}
              </text>
            )}
          </g>
        ))}
      </g>
    );
  },
  (a, b) =>
    a.y === b.y &&
    a.hasEnds === b.hasEnds &&
    a.labelGap === b.labelGap &&
    sameTicks(a.ticks, b.ticks),
);

export type DotProps = {
  at: number;
  /** In the stage's y units, or px on a one-dimensional stage. */
  y: number;
  r?: number;
  color?: string;
  class?: string;
};

/** One dot, with a ring of the page's colour so it stands out on a line. */
export const Dot = memo(function Dot({ at, y, r = 6, color, class: extra }: DotProps): JSX.Element {
  const space = useSpace();
  const [px, py] = toPixels(space, at, y);
  return (
    <circle
      class={extra === undefined ? "draw-dot" : `draw-dot ${extra}`}
      r={r}
      transform={`translate(${px} ${py})`}
      style={colorStyle(color)}
    />
  );
});

export type MarkProps = {
  at: number;
  y: number;
  label: string;
  /** Which row of labels above the line (0 is nearest). */
  row?: number;
  /** Where the label's centre goes, px, when it must be nudged to stay on the stage. */
  labelX?: number;
  color?: string;
};

/** A labelled point on a line: a dot, a stem and the label above it. */
export const Mark = memo(function Mark({
  at,
  y,
  label,
  row = 0,
  labelX,
  color,
}: MarkProps): JSX.Element {
  const space = useSpace();
  const [px, py] = toPixels(space, at, y);
  const labelY = -26 - row * 22;
  return (
    <g class="draw-mark" transform={`translate(${px} ${py})`} style={colorStyle(color)}>
      <line y1={labelY + 5} y2={0} />
      <circle r={6} />
      <text x={labelX === undefined ? 0 : labelX - px} y={labelY} text-anchor="middle">
        {label}
      </text>
    </g>
  );
});

export type CurveProps = {
  /** y for each x, in the stage's units. */
  fn: (x: number) => number;
  from: number;
  to: number;
  samples?: number;
  color?: string;
  class?: string;
};

/** The graph of a function, smoothed through samples (d3-shape). Needs a two-dimensional stage. */
export const Curve = memo(function Curve({
  fn,
  from,
  to,
  samples = 64,
  color,
  class: extra,
}: CurveProps): JSX.Element {
  const space = useSpace();
  const xs = Array.from({ length: samples + 1 }, (_, i) => from + ((to - from) * i) / samples);
  const d =
    line<number>()
      .x((v) => space.x(v))
      .y((v) => toPixels(space, v, fn(v))[1])
      .curve(curveNatural)(xs) ?? "";
  return (
    <path
      class={extra === undefined ? "draw-curve" : `draw-curve ${extra}`}
      d={d}
      style={colorStyle(color)}
    />
  );
});

export type LineProps = {
  from: number;
  to: number;
  /** In the stage's y units, or px on a one-dimensional stage. */
  y: number;
  isThin?: boolean;
  color?: string;
};

/** A straight stretch of line between two numbers (a part of an axis, a span, a bar). */
export const Line = memo(function Line({
  from,
  to,
  y,
  isThin = false,
  color,
}: LineProps): JSX.Element {
  const space = useSpace();
  const [x1, py] = toPixels(space, from, y);
  const [x2] = toPixels(space, to, y);
  return (
    <line
      class={isThin ? "draw-line is-thin" : "draw-line"}
      x1={x1}
      y1={py}
      x2={x2}
      y2={py}
      style={colorStyle(color)}
    />
  );
});

export const LabelSize = { Small: "small", Normal: "normal", Large: "large" } as const;
export type LabelSize = (typeof LabelSize)[keyof typeof LabelSize];

export type LabelProps = {
  at: number;
  y: number;
  text: string;
  size?: LabelSize;
  color?: string;
  /** Which edge of the text sits at `at`. */
  anchor?: "start" | "middle" | "end";
};

/** A few words or a glyph (ℕ, √2) placed in the stage's numbers. */
export const Label = memo(function Label({
  at,
  y,
  text,
  size = LabelSize.Normal,
  color,
  anchor = "middle",
}: LabelProps): JSX.Element {
  const space = useSpace();
  const [px, py] = toPixels(space, at, y);
  return (
    <text
      class={`draw-label is-${size}`}
      x={px}
      y={py}
      text-anchor={anchor}
      style={colorStyle(color)}
    >
      {text}
    </text>
  );
});

export type TrailProps = {
  /** The points it passes through, in the stage's units ([x, y] each). */
  points: readonly (readonly [number, number])[];
  /** How far along it is drawn as done (0 to 1 of the points), in the done colour. */
  done?: number;
  class?: string;
};

/** A smooth road through points (a chapter's path from concept to concept), d3-shape's curve. */
export const Trail = memo(function Trail({
  points,
  done = 0,
  class: extra,
}: TrailProps): JSX.Element {
  const space = useSpace();
  const path = line<readonly [number, number]>()
    .x(([x, y]) => toPixels(space, x, y)[0])
    .y(([x, y]) => toPixels(space, x, y)[1])
    .curve(curveCatmullRom.alpha(0.5));
  const doneCount = Math.max(
    0,
    Math.min(points.length, Math.round(done * (points.length - 1)) + 1),
  );
  return (
    <g class={extra === undefined ? "draw-trail" : `draw-trail ${extra}`}>
      <path class="draw-trail-road" d={path(points) ?? ""} />
      {doneCount > 1 && <path class="draw-trail-done" d={path(points.slice(0, doneCount)) ?? ""} />}
    </g>
  );
});

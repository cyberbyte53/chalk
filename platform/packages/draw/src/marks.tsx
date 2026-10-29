/** @jsxImportSource preact */
import type { ComponentChildren, JSX } from "preact";
import { type KitProps, fx, kitClass } from "./kit";
import type { Pt } from "./labels";

/**
 * Geometry marks, in px: angle arcs, right-angle squares, equal-length ticks, parallel arrows, a
 * side's length label and an arrowhead. Stateless; the caller turns its model points into px.
 */

/** The shape of an arrowhead: its length, its half-width as a share of the length, and where its tip sits past the anchor point. */
export type ArrowheadShape = { size: number; width: number; tip: number };

/** Tip at the anchor, 9 px long: an arrow's end, or a ray's mid-arrow (lens, mirrors). */
export const HEAD_TIP: ArrowheadShape = { size: 9, width: 0.55, tip: 0 };
/** Centred on the anchor, 12 px long (refraction, plane mirror, ray angle). */
export const HEAD_MIDDLE: ArrowheadShape = { size: 12, width: 5 / 12, tip: 5 };

export type ArrowheadProps = KitProps & {
  /** Where the anchor sits, px. */
  at: Pt;
  /** The direction it points, as a vector (dx, dy) in px. */
  toward: Pt;
  shape?: ArrowheadShape;
};

/** A small filled triangle pointing along `toward`. */
export function Arrowhead({
  at,
  toward,
  shape = HEAD_TIP,
  part,
  class: extra,
}: ArrowheadProps): JSX.Element {
  const angle = (Math.atan2(toward[1], toward[0]) * 180) / Math.PI;
  const { size, width, tip } = shape;
  const back = tip - size;
  const half = size * width;
  return (
    <path
      class={kitClass("kit-arrowhead", extra)}
      data-part={part}
      d={`M${tip} 0 L${back} ${-half} L${back} ${half} Z`}
      transform={`translate(${at[0]} ${at[1]}) rotate(${angle})`}
    />
  );
}

/** The signed turn from the ray v→p to the ray v→q, in (−π, π]: the smaller angle. */
function turn(v: Pt, p: Pt, q: Pt): { from: number; by: number } {
  const from = Math.atan2(p[1] - v[1], p[0] - v[0]);
  let by = Math.atan2(q[1] - v[1], q[0] - v[0]) - from;
  while (by > Math.PI) by -= 2 * Math.PI;
  while (by < -Math.PI) by += 2 * Math.PI;
  return { from, by };
}

export type AngleArcProps = KitProps & {
  vertex: Pt;
  p: Pt;
  q: Pt;
  /** The inner arc's radius, px. */
  r?: number;
  /** How many arcs (1–3), 3.5 px apart: angles marked equal. */
  count?: number;
  /** Words or a value written inside the angle, just past the arcs. */
  label?: string;
  /** How far past the outer arc the label's centre sits, px. */
  labelGap?: number;
  /** Anything to draw at the label's spot instead of text (it is placed there by a transform). */
  children?: ComponentChildren;
};

/** Arcs marking the (smaller) angle at a vertex between the rays to p and q, with an optional label inside it. */
export function AngleArc({
  vertex: v,
  p,
  q,
  r = 14,
  count = 1,
  label,
  labelGap = 10,
  children,
  part,
  class: extra,
}: AngleArcProps): JSX.Element {
  const { from, by } = turn(v, p, q);
  const sweep = by > 0 ? 1 : 0;
  const d = Array.from({ length: count }, (_, i) => {
    const ri = r + i * 3.5;
    const sx = v[0] + ri * Math.cos(from);
    const sy = v[1] + ri * Math.sin(from);
    const ex = v[0] + ri * Math.cos(from + by);
    const ey = v[1] + ri * Math.sin(from + by);
    return `M${fx(sx)} ${fx(sy)} A ${ri} ${ri} 0 0 ${sweep} ${fx(ex)} ${fx(ey)}`;
  }).join(" ");
  const mid = from + by / 2;
  const lr = r + (count - 1) * 3.5 + labelGap;
  const lx = v[0] + lr * Math.cos(mid);
  const ly = v[1] + lr * Math.sin(mid);
  return (
    <g class={kitClass("kit-angle", extra)} data-part={part}>
      <path d={d} />
      {label !== undefined && (
        <text x={lx} y={ly + 3.5} text-anchor="middle">
          {label}
        </text>
      )}
      {children !== undefined && <g transform={`translate(${lx} ${ly})`}>{children}</g>}
    </g>
  );
}

export type RightAngleProps = KitProps & { vertex: Pt; p: Pt; q: Pt; size?: number };

/** The small square marking a right angle at a vertex between the rays to p and q. */
export function RightAngle({
  vertex: v,
  p,
  q,
  size = 9,
  part,
  class: extra,
}: RightAngleProps): JSX.Element {
  const unit = (t: Pt): Pt => {
    const dx = t[0] - v[0];
    const dy = t[1] - v[1];
    const l = Math.hypot(dx, dy) || 1;
    return [(dx / l) * size, (dy / l) * size];
  };
  const a = unit(p);
  const b = unit(q);
  return (
    <path
      class={kitClass("kit-right", extra)}
      data-part={part}
      d={`M${fx(v[0] + a[0])} ${fx(v[1] + a[1])} L${fx(v[0] + a[0] + b[0])} ${fx(v[1] + a[1] + b[1])} L${fx(v[0] + b[0])} ${fx(v[1] + b[1])}`}
    />
  );
}

/** A segment's middle and unit direction. */
function middleOf(a: Pt, b: Pt): { m: Pt; ux: number; uy: number } {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return {
    m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
    ux: (b[0] - a[0]) / l,
    uy: (b[1] - a[1]) / l,
  };
}

export type SegmentMarkProps = KitProps & { from: Pt; to: Pt; count?: number };

/** Short ticks across a segment's middle, marking equal lengths (|, ||, |||). */
export function EqualTicks({
  from,
  to,
  count = 1,
  part,
  class: extra,
}: SegmentMarkProps): JSX.Element {
  const { m, ux, uy } = middleOf(from, to);
  const d = Array.from({ length: count }, (_, i) => {
    const off = (i - (count - 1) / 2) * 4;
    const cx = m[0] + ux * off;
    const cy = m[1] + uy * off;
    return `M${fx(cx - uy * 5)} ${fx(cy + ux * 5)} L${fx(cx + uy * 5)} ${fx(cy - ux * 5)}`;
  }).join(" ");
  return <path class={kitClass("kit-ticks", extra)} data-part={part} d={d} />;
}

/** Open arrowheads on a segment's middle, pointing from → to, marking it parallel to others with the same count (>, >>). */
export function ParallelArrows({
  from,
  to,
  count = 1,
  part,
  class: extra,
}: SegmentMarkProps): JSX.Element {
  const { m, ux, uy } = middleOf(from, to);
  const d = Array.from({ length: count }, (_, i) => {
    const cx = m[0] + ux * (i * 5 - (count - 1) * 2.5);
    const cy = m[1] + uy * (i * 5 - (count - 1) * 2.5);
    return `M${fx(cx - ux * 4 - uy * 4)} ${fx(cy - uy * 4 + ux * 4)} L${fx(cx)} ${fx(cy)} L${fx(cx - ux * 4 + uy * 4)} ${fx(cy - uy * 4 - ux * 4)}`;
  }).join(" ");
  return <path class={kitClass("kit-parallel", extra)} data-part={part} d={d} />;
}

/** How a side's label is pushed off it. */
export const LabelPush = {
  /** Along the side's normal, on the side away from `away`. */
  Normal: "normal",
  /** Along the line from `away` through the side's middle (the triangle props' copies). */
  Radial: "radial",
} as const;
export type LabelPush = (typeof LabelPush)[keyof typeof LabelPush];

export type SideLabelProps = KitProps & {
  from: Pt;
  to: Pt;
  text: string;
  /** A point on the inside (the shape's centre): the label goes the other way. Without it, the normal to the left of from → to. */
  away?: Pt;
  push?: LabelPush;
  /** How far from the side's middle, px. */
  gap?: number;
};

/** A side's length (or name) written at its middle, pushed off the side so it never sits on the line. */
export function SideLabel({
  from,
  to,
  text,
  away,
  push = LabelPush.Normal,
  gap = 10,
  part,
  class: extra,
}: SideLabelProps): JSX.Element {
  const { m, ux, uy } = middleOf(from, to);
  let nx = uy;
  let ny = -ux;
  if (away !== undefined) {
    const ax = m[0] - away[0];
    const ay = m[1] - away[1];
    if (push === LabelPush.Radial) {
      const l = Math.hypot(ax, ay) || 1;
      nx = ax / l;
      ny = ay / l;
    } else if (nx * ax + ny * ay < 0) {
      nx = -nx;
      ny = -ny;
    }
  }
  return (
    <text
      class={kitClass("kit-length", extra)}
      data-part={part}
      x={m[0] + nx * gap}
      y={m[1] + ny * gap + 4}
      text-anchor="middle"
    >
      {text}
    </text>
  );
}

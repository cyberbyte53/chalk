import type { Box } from "@chalk/prop";

/**
 * The figures' geometry in units (y up), and each view's pixel layout at a given width. The views
 * and the props' `locate` both use these, so a part is pointed at where it is drawn.
 */

export type Point = { x: number; y: number };

/** The smallest box around some points, padded so a finger-sized pointer fits. */
export function around(points: readonly { x: number; y: number }[], pad = 14): Box {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  return { x, y, width: Math.max(...xs) + pad - x, height: Math.max(...ys) + pad - y };
}

// ---- rootBuilder ----

/** The tallest perpendicular the builder allows. */
export const MAX_HEIGHT = 5;

/**
 * Where the hypotenuse's tip is while the compass swings it about 0: at `swing` 0 it stands at the
 * top of the perpendicular, at 1 it lies on the line at √(base² + height²).
 */
export function swingTip(baseLength: number, height: number, swing: number): Point {
  const length = Math.hypot(baseLength, height);
  const angle = Math.atan2(height, baseLength) * (1 - swing);
  return { x: length * Math.cos(angle), y: length * Math.sin(angle) };
}

export type BuilderLayout = {
  /** Pixels per unit. */
  unit: number;
  /** x of 0 on the line. */
  originX: number;
  /** y of the line. */
  axisY: number;
  height: number;
  /** How many whole units of grid stand above the line. */
  gridHeight: number;
};

const BUILDER_LEFT = 26;
const BUILDER_RIGHT = 34;
const BUILDER_TOP = 46;
const BUILDER_BOTTOM = 100;
const BUILDER_MAX_UNIT = 110;

/** The builder at this width: the line from 0 to `maxValue`, and room above for any triangle. */
export function builderLayout(maxValue: number, width: number): BuilderLayout {
  // The tallest triangle that fits stands on a base of 1: 1 + h² ≤ maxValue².
  const gridHeight = Math.min(MAX_HEIGHT, Math.floor(Math.sqrt(maxValue * maxValue - 1) + 1e-9));
  const room = width - BUILDER_LEFT - BUILDER_RIGHT;
  const unit = Math.min(BUILDER_MAX_UNIT, room / maxValue);
  const originX = BUILDER_LEFT + (room - unit * maxValue) / 2;
  const axisY = BUILDER_TOP + gridHeight * unit;
  return { unit, originX, axisY, height: axisY + BUILDER_BOTTOM, gridHeight };
}

export function builderPx(layout: BuilderLayout, p: Point): Point {
  return { x: layout.originX + p.x * layout.unit, y: layout.axisY - p.y * layout.unit };
}

// ---- rootSpiral ----

/**
 * The square-root spiral's points P0 = O, P1, …, P`count`: OP1 = 1 along the x axis, and each
 * P(k+1) is P(k) plus a unit step perpendicular to OPk, turning anticlockwise. So OPk = √k.
 */
export function spiralPoints(count: number): Point[] {
  const points: Point[] = [{ x: 0, y: 0 }];
  if (count < 1) return points;
  let p: Point = { x: 1, y: 0 };
  points.push(p);
  for (let k = 1; k < count; k++) {
    const length = Math.hypot(p.x, p.y);
    p = { x: p.x - p.y / length, y: p.y + p.x / length };
    points.push(p);
  }
  return points;
}

export type SpiralLayout = { scale: number; height: number; px: (p: Point) => Point };

const SPIRAL_MARGIN = 30;
const SPIRAL_MAX_SCALE = 120;

/** The spiral with `steps` triangles, scaled to fit the width (and never taller than wide). */
export function spiralLayout(steps: number, width: number): SpiralLayout {
  const points = spiralPoints(steps + 1);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const room = width - 2 * SPIRAL_MARGIN;
  const scale = Math.min(SPIRAL_MAX_SCALE, room / (maxX - minX), room / (maxY - minY));
  const left = (width - (maxX - minX) * scale) / 2;
  const height = (maxY - minY) * scale + 2 * SPIRAL_MARGIN;
  return {
    scale,
    height,
    px: (p) => ({ x: left + (p.x - minX) * scale, y: SPIRAL_MARGIN + (maxY - p.y) * scale }),
  };
}

// ---- rootSemicircle ----

/** Fig 1.15–1.17 in units, A at 0: AB = x, BC = 1, O the midpoint of AC, D above B on the circle. */
export type SemicircleFigure = {
  a: number;
  b: number;
  c: number;
  o: number;
  radius: number;
  d: Point;
  /** BD, worked out from the circle (it is √x). */
  bd: number;
  /** E, where BD lands when swung about B onto the line. */
  e: number;
};

export function semicircleFigure(x: number): SemicircleFigure {
  const a = 0;
  const b = x;
  const c = x + 1;
  const o = (a + c) / 2;
  const radius = c - o;
  // D is where the perpendicular at B meets the circle: OD = radius, so BD² = OD² − OB².
  const bd = Math.sqrt(radius * radius - (b - o) * (b - o));
  return { a, b, c, o, radius, d: { x: b, y: bd }, bd, e: b + bd };
}

/** Where D is while BD swings about B down onto the line (0: upright, 1: lying on the line at E). */
export function swungD(figure: SemicircleFigure, swing: number): Point {
  const angle = (Math.PI / 2) * (1 - swing);
  return { x: figure.b + figure.bd * Math.cos(angle), y: figure.bd * Math.sin(angle) };
}

export type SemicircleLayout = {
  unit: number;
  /** x of B in pixels. */
  bX: number;
  axisY: number;
  height: number;
  /** How many units the frame holds across. */
  span: number;
};

const SEMI_PAD = 22;
const SEMI_TOP = 34;
const SEMI_BOTTOM = 84;
/** Frame widths in units; the figure takes the smallest that holds it, so a drag doesn't rescale. */
const SEMI_SPANS = [2, 3, 4.5, 6.5, 9, 12, 16] as const;
const SEMI_MAX_SPAN = 16;
const SEMI_ROOM = 1.06;

/** How far the figure reaches right of B: to C, or to the last whole tick past E. */
export function rightOfB(x: number): number {
  return Math.max(1, Math.ceil(Math.sqrt(x) - 1e-9));
}

/**
 * The semicircle figure at this width: the frame is the smallest span that holds A to the far right
 * with a little room, with the right end fixed and A free on the left (so dragging A left has room).
 * Its height is the same for every span: the tallest semicircle is half the frame.
 */
export function semicircleLayout(x: number, width: number): SemicircleLayout {
  const needed = (x + rightOfB(x)) * SEMI_ROOM;
  const span = SEMI_SPANS.find((s) => needed <= s) ?? SEMI_MAX_SPAN;
  const unit = (width - 2 * SEMI_PAD) / span;
  const bX = width - SEMI_PAD - rightOfB(x) * unit;
  const axisY = SEMI_TOP + (span / 2) * unit;
  return { unit, bX, axisY, height: axisY + SEMI_BOTTOM, span };
}

/** The largest x a drag can reach in this frame: A at the left edge, the semicircle inside. */
export function semicircleDragLimit(layout: SemicircleLayout): number {
  const byEdge = (layout.bX - SEMI_PAD) / layout.unit;
  const byTop = layout.span - 1;
  return Math.min(byEdge, byTop);
}

export function semicirclePx(layout: SemicircleLayout, x: number, p: Point): Point {
  return { x: layout.bX + (p.x - x) * layout.unit, y: layout.axisY - p.y * layout.unit };
}

import type { JSX } from "preact";

/**
 * Drawing solids, kept inside this package so it can move to a shared geometry kit later. A solid
 * stands on a vertical axis (x across, y up, z towards the viewer), seen from a little above: a
 * circle at height y becomes an ellipse whose height is squashed by sin φ, φ the tilt. Boxes can
 * also turn about the axis (yaw). Everything is in model units (cm, m) until `Frame` scales it.
 */

export type Frame = {
  /** Pixels per model unit. */
  k: number;
  /** The axis' pixel x. */
  cx: number;
  /** The pixel y of model height 0 on the axis. */
  baseY: number;
  /** sin and cos of the tilt. */
  sin: number;
  cos: number;
  /** Turn about the axis, in radians (boxes only; round solids look the same). */
  yaw: number;
};

/** The picture's tilt choices: how far above the viewer looks from, in degrees. */
export const TILTS = [12, 20, 28] as const;
/** The yaw choices for boxes, in degrees. */
export const YAWS = [-30, -15, 15, 30] as const;

/** What a part needs for fitting: the heights it spans and its widest radius (half-width). */
export type Extent = { y0: number; y1: number; r: number };

/**
 * Scales a set of parts to fit `width` × `height` px with `pad` px around. Round parts' ellipses
 * stick out below and above by r·sin φ; that's allowed for.
 */
export function fit(
  parts: readonly Extent[],
  width: number,
  height: number,
  tiltDeg: number,
  yawDeg = 0,
  pad = 22,
): Frame {
  const phi = (tiltDeg * Math.PI) / 180;
  const sin = Math.sin(phi);
  const cos = Math.cos(phi);
  const yLo = Math.min(...parts.map((p) => p.y0));
  const yHi = Math.max(...parts.map((p) => p.y1));
  const r = Math.max(...parts.map((p) => p.r));
  const tall = (yHi - yLo) * cos + 2 * r * sin;
  const k = Math.max(0.01, Math.min((width - 2 * pad) / (2 * r), (height - 2 * pad) / tall));
  const baseY = height - pad - k * r * sin + k * yLo * cos;
  return { k, cx: width / 2, baseY, sin, cos, yaw: (yawDeg * Math.PI) / 180 };
}

/** The pixel point of model (x, y, z). */
export function at(f: Frame, x: number, y: number, z = 0): [number, number] {
  const X = x * Math.cos(f.yaw) + z * Math.sin(f.yaw);
  const depth = -x * Math.sin(f.yaw) + z * Math.cos(f.yaw);
  return [f.cx + f.k * X, f.baseY - f.k * y * f.cos + f.k * depth * f.sin];
}

/** The ellipse a circle of radius r at height y becomes: centre and radii, in px. */
export function ring(f: Frame, y: number, r: number) {
  const [x, cy] = at(f, 0, y);
  return { x, y: cy, rx: f.k * r, ry: Math.max(0.6, f.k * r * f.sin) };
}

const n = (v: number) => Math.round(v * 10) / 10;

/** The near (lower) half of an ellipse, left to right, as path commands from its left end. */
function nearHalf(e: { x: number; y: number; rx: number; ry: number }, leftToRight = true): string {
  return leftToRight
    ? `A ${n(e.rx)} ${n(e.ry)} 0 0 0 ${n(e.x + e.rx)} ${n(e.y)}`
    : `A ${n(e.rx)} ${n(e.ry)} 0 0 1 ${n(e.x - e.rx)} ${n(e.y)}`;
}

/** The far (upper) half of an ellipse from its left end to its right end. */
function farHalfPath(e: { x: number; y: number; rx: number; ry: number }): string {
  return `M ${n(e.x - e.rx)} ${n(e.y)} A ${n(e.rx)} ${n(e.ry)} 0 0 1 ${n(e.x + e.rx)} ${n(e.y)}`;
}

/** A whole ellipse. */
function Ellipse({
  e,
  cls,
}: {
  e: { x: number; y: number; rx: number; ry: number };
  cls: string;
}): JSX.Element {
  return <ellipse class={cls} cx={n(e.x)} cy={n(e.y)} rx={n(e.rx)} ry={n(e.ry)} />;
}

/** The far half of a circle's ellipse, dashed: an edge hidden behind the solid. */
function Hidden({ e }: { e: { x: number; y: number; rx: number; ry: number } }): JSX.Element {
  return <path class="so-hidden" d={farHalfPath(e)} />;
}

/** How a part is drawn: as solid material, a cavity cut out of it, or a see-through outline. */
export const Look = { Solid: "solid", Cut: "cut", Ghost: "ghost" } as const;
export type Look = (typeof Look)[keyof typeof Look];

/** The css class of a part's body, by look and colour slot (1–4). */
export function bodyClass(look: Look, tone: number): string {
  return look === Look.Solid
    ? `so-body so-tone-${tone}`
    : look === Look.Cut
      ? "so-cut"
      : "so-ghost";
}

/** A cylinder standing between heights y0 and y1. The top face can be left off (an open vessel). */
export function Cylinder({
  f,
  y0,
  y1,
  r,
  look = Look.Solid,
  tone = 1,
  hasTop = true,
}: {
  f: Frame;
  y0: number;
  y1: number;
  r: number;
  look?: Look;
  tone?: number;
  hasTop?: boolean;
}): JSX.Element {
  const b = ring(f, y0, r);
  const t = ring(f, y1, r);
  const side = `M ${n(t.x - t.rx)} ${n(t.y)} L ${n(b.x - b.rx)} ${n(b.y)} ${nearHalf(b)} L ${n(t.x + t.rx)} ${n(t.y)} ${nearHalf(t, false)} Z`;
  const body = bodyClass(look, tone);
  return (
    <g class="so-part">
      {look === Look.Solid && <Hidden e={b} />}
      <path class={body} d={side} />
      {look === Look.Solid && hasTop && <Ellipse e={t} cls={`${body} so-face`} />}
      {!hasTop && <Ellipse e={t} cls="so-rim" />}
      {look !== Look.Solid && <Hidden e={b} />}
    </g>
  );
}

/** A cone: base circle at yBase, apex at yApex (above or below the base). */
export function Cone({
  f,
  yBase,
  yApex,
  r,
  look = Look.Solid,
  tone = 1,
  hasBase = true,
}: {
  f: Frame;
  yBase: number;
  yApex: number;
  r: number;
  look?: Look;
  tone?: number;
  hasBase?: boolean;
}): JSX.Element {
  const b = ring(f, yBase, r);
  const [ax, ay] = at(f, 0, yApex);
  const body = bodyClass(look, tone);
  if (yApex > yBase) {
    const side = `M ${n(ax)} ${n(ay)} L ${n(b.x - b.rx)} ${n(b.y)} ${nearHalf(b)} Z`;
    return (
      <g class="so-part">
        <Hidden e={b} />
        <path class={body} d={side} />
      </g>
    );
  }
  // Apex below: the base is on top and seen whole.
  const side = `M ${n(b.x - b.rx)} ${n(b.y)} ${nearHalf(b)} L ${n(ax)} ${n(ay)} Z`;
  return (
    <g class="so-part">
      <path class={body} d={side} />
      {hasBase ? <Ellipse e={b} cls={`${body} so-face`} /> : <Ellipse e={b} cls="so-rim" />}
    </g>
  );
}

/** A frustum between heights y0 (radius rBottom) and y1 (radius rTop). */
export function Frustum({
  f,
  y0,
  y1,
  rBottom,
  rTop,
  look = Look.Solid,
  tone = 1,
  hasTop = true,
}: {
  f: Frame;
  y0: number;
  y1: number;
  rBottom: number;
  rTop: number;
  look?: Look;
  tone?: number;
  hasTop?: boolean;
}): JSX.Element {
  const b = ring(f, y0, rBottom);
  const t = ring(f, y1, rTop);
  const side = `M ${n(t.x - t.rx)} ${n(t.y)} L ${n(b.x - b.rx)} ${n(b.y)} ${nearHalf(b)} L ${n(t.x + t.rx)} ${n(t.y)} ${nearHalf(t, false)} Z`;
  const body = bodyClass(look, tone);
  return (
    <g class="so-part">
      <Hidden e={b} />
      <path class={body} d={side} />
      {hasTop ? <Ellipse e={t} cls={`${body} so-face`} /> : <Ellipse e={t} cls="so-rim" />}
    </g>
  );
}

/**
 * A hemisphere with its flat face at yFlat: a dome above it (`isUp`) or a bowl below it. A bowl's
 * flat face is on top and seen whole (unless something sits on it: `hasFace` false).
 */
export function Hemisphere({
  f,
  yFlat,
  r,
  isUp,
  look = Look.Solid,
  tone = 1,
  hasFace = true,
}: {
  f: Frame;
  yFlat: number;
  r: number;
  isUp: boolean;
  look?: Look;
  tone?: number;
  hasFace?: boolean;
}): JSX.Element {
  const e = ring(f, yFlat, r);
  const R = f.k * r;
  const body = bodyClass(look, tone);
  if (isUp) {
    const d = `M ${n(e.x - e.rx)} ${n(e.y)} A ${n(R)} ${n(R)} 0 0 1 ${n(e.x + e.rx)} ${n(e.y)} ${nearHalf(e, false)} Z`;
    return (
      <g class="so-part">
        <path class={body} d={d} />
        {look !== Look.Solid && <Hidden e={e} />}
      </g>
    );
  }
  const d = `M ${n(e.x - e.rx)} ${n(e.y)} A ${n(R)} ${n(R)} 0 0 0 ${n(e.x + e.rx)} ${n(e.y)} A ${n(e.rx)} ${n(e.ry)} 0 0 0 ${n(e.x - e.rx)} ${n(e.y)} Z`;
  return (
    <g class="so-part">
      <path class={body} d={d} />
      {hasFace ? <Ellipse e={e} cls={`${body} so-face`} /> : <Ellipse e={e} cls="so-rim" />}
    </g>
  );
}

/** A whole sphere centred at height yc, with its equator. */
export function Sphere({
  f,
  yc,
  r,
  look = Look.Solid,
  tone = 1,
}: {
  f: Frame;
  yc: number;
  r: number;
  look?: Look;
  tone?: number;
}): JSX.Element {
  const e = ring(f, yc, r);
  return (
    <g class="so-part">
      <circle class={bodyClass(look, tone)} cx={n(e.x)} cy={n(e.y)} r={n(f.k * r)} />
      <path class="so-equator" d={`M ${n(e.x - e.rx)} ${n(e.y)} ${nearHalf(e)}`} />
      <Hidden e={e} />
    </g>
  );
}

/**
 * A box (cuboid or cube) between heights y0 and y1, `l` across and `b` deep, turned by the frame's
 * yaw. Faces turned towards the viewer are filled; edges round the hidden corner are dashed.
 */
export function Box({
  f,
  y0,
  y1,
  l,
  b,
  look = Look.Solid,
  tone = 1,
  hasTop = true,
}: {
  f: Frame;
  y0: number;
  y1: number;
  l: number;
  b: number;
  look?: Look;
  tone?: number;
  hasTop?: boolean;
}): JSX.Element {
  const xs = [-l / 2, l / 2];
  const zs = [-b / 2, b / 2];
  const P = (i: number, j: number, y: number) => at(f, xs[i] as number, y, zs[j] as number);
  const poly = (pts: [number, number][]) =>
    `${pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${n(x)} ${n(y)}`).join(" ")} Z`;
  const s = Math.sin(f.yaw);
  // Which side faces turn towards the viewer (their outward normal has positive depth).
  // The −x face (index 0) comes towards the viewer when sin(yaw) > 0.
  const xFace = s > 0 ? 0 : 1;
  const seesX = Math.abs(s) > 1e-6;
  const zFace = 1; // the +z face (front) is always seen for |yaw| < 90°
  const body = bodyClass(look, tone);
  const front = poly([P(0, zFace, y0), P(1, zFace, y0), P(1, zFace, y1), P(0, zFace, y1)]);
  const side = poly([P(xFace, 0, y0), P(xFace, 1, y0), P(xFace, 1, y1), P(xFace, 0, y1)]);
  const top = poly([P(0, 0, y1), P(1, 0, y1), P(1, 1, y1), P(0, 1, y1)]);
  // The hidden corner: bottom, back, on the side not seen.
  const hx = 1 - xFace;
  const corner = P(hx, 0, y0);
  const hiddenEdges = [P(1 - hx, 0, y0), P(hx, 1, y0), P(hx, 0, y1)].map((q) => (
    <line
      key={`${q[0]}-${q[1]}`}
      class="so-hidden"
      x1={n(corner[0])}
      y1={n(corner[1])}
      x2={n(q[0])}
      y2={n(q[1])}
    />
  ));
  return (
    <g class="so-part">
      {look === Look.Solid && hiddenEdges}
      {seesX && <path class={`${body} so-side`} d={side} />}
      <path class={body} d={front} />
      {hasTop ? <path class={`${body} so-face`} d={top} /> : <path class="so-rim" d={top} />}
      {look !== Look.Solid && hiddenEdges}
    </g>
  );
}

/** A labelled radius: a line from the axis to the rim at height y, the label above it. */
export function RadiusMark({
  f,
  y,
  r,
  label,
  isBelow = false,
}: {
  f: Frame;
  y: number;
  r: number;
  label: string;
  isBelow?: boolean;
}): JSX.Element {
  const [x0, y0] = at(f, 0, y);
  const x1 = x0 + f.k * r;
  return (
    <g class="so-dim">
      <line x1={n(x0)} y1={n(y0)} x2={n(x1)} y2={n(y0)} />
      <circle cx={n(x0)} cy={n(y0)} r={1.8} />
      <text
        class="so-dim-text"
        x={n((x0 + x1) / 2)}
        y={n(y0 + (isBelow ? 13 : -5))}
        text-anchor="middle"
      >
        {label}
      </text>
    </g>
  );
}

/** A labelled height: a bracket beside the solid at pixel x, from height y0 to y1. */
export function HeightMark({
  f,
  y0,
  y1,
  x,
  label,
  side = "right",
}: {
  f: Frame;
  y0: number;
  y1: number;
  /** The model x of the bracket (past the solid's widest point). */
  x: number;
  label: string;
  side?: "left" | "right";
}): JSX.Element {
  const [px, py0] = at(f, x, y0);
  const [, py1] = at(f, x, y1);
  const tick = side === "right" ? -4 : 4;
  return (
    <g class="so-dim">
      <path
        d={`M ${n(px + tick)} ${n(py0)} H ${n(px)} V ${n(py1)} H ${n(px + tick)}`}
        fill="none"
      />
      <text
        class="so-dim-text"
        x={n(px + (side === "right" ? 5 : -5))}
        y={n((py0 + py1) / 2 + 4)}
        text-anchor={side === "right" ? "start" : "end"}
      >
        {label}
      </text>
    </g>
  );
}

/** A height drawn up the axis (inside a cone): dashed, labelled beside it. */
export function AxisMark({
  f,
  y0,
  y1,
  label,
}: {
  f: Frame;
  y0: number;
  y1: number;
  label: string;
}): JSX.Element {
  const [x, a] = at(f, 0, y0);
  const [, b] = at(f, 0, y1);
  return (
    <g class="so-dim">
      <line class="so-axis" x1={n(x)} y1={n(a)} x2={n(x)} y2={n(b)} />
      <text class="so-dim-text" x={n(x - 5)} y={n((a + b) / 2 + 4)} text-anchor="end">
        {label}
      </text>
    </g>
  );
}

/** A label beside the right slant edge of a cone or frustum, between two rim points. */
export function SlantMark({
  f,
  yLow,
  rLow,
  yHigh,
  rHigh,
  label,
}: {
  f: Frame;
  yLow: number;
  rLow: number;
  yHigh: number;
  rHigh: number;
  label: string;
}): JSX.Element {
  const [x0, y0] = at(f, rLow, yLow);
  const [x1, y1] = at(f, rHigh, yHigh);
  return (
    <g class="so-dim">
      <line class="so-slant" x1={n(x0)} y1={n(y0)} x2={n(x1)} y2={n(y1)} />
      <text class="so-dim-text" x={n((x0 + x1) / 2 + 7)} y={n((y0 + y1) / 2)} text-anchor="start">
        {label}
      </text>
    </g>
  );
}

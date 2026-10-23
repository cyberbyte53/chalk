import { useSpace } from "@chalk/draw";
import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import { clipLine, px, toModel, unitPx, windowOf } from "./frame";
import { type Pt, add, scale, sub } from "./geometry";
import { type Obstacles, placeLabels } from "./labels";

/**
 * Geometry drawing pieces in model units (cm, y up): they sit inside a @chalk/draw <Stage> whose x
 * and y ranges come from `frameOf`, and turn points into pixels with the stage's scales. Every
 * piece draws only with the look's tokens through gk-* classes (kit.css).
 *
 * Tones: main (the figure), accent (what the page is about), result (what the student found),
 * construction (light working lines and arcs), muted (context), wrong (a mistake shown on purpose).
 * `isNew` draws a line or arc on as if by pencil (reduced motion: it simply appears).
 */

export type Tone = "main" | "accent" | "result" | "construction" | "muted" | "wrong";

const toneClass = (tone: Tone | undefined, isNew?: boolean, dashed?: boolean): string =>
  `gk-ink gk-${tone ?? "main"}${isNew ? " gk-new" : ""}${dashed ? " gk-dashed" : ""}`;

const f = (n: number) => n.toFixed(1);

/** A line segment from one point to another. */
export function Seg({
  from,
  to,
  tone,
  dashed,
  isNew,
  part,
}: {
  from: Pt;
  to: Pt;
  tone?: Tone;
  dashed?: boolean;
  isNew?: boolean;
  part?: string;
}): JSX.Element {
  const space = useSpace();
  const a = px(space, from);
  const b = px(space, to);
  return (
    <line
      class={toneClass(tone, isNew, dashed)}
      x1={f(a[0])}
      y1={f(a[1])}
      x2={f(b[0])}
      y2={f(b[1])}
      pathLength={isNew ? 1 : undefined}
      data-part={part}
    />
  );
}

/**
 * A straight line through a point in a direction, drawn edge to edge of the stage; `isRay` draws
 * only the half from the point forwards, `extend` stops `extend` units past the point each way.
 */
export function InfiniteLine({
  through,
  dir,
  isRay,
  extend,
  tone,
  dashed,
  isNew,
  part,
}: {
  through: Pt;
  dir: Pt;
  isRay?: boolean;
  extend?: number;
  tone?: Tone;
  dashed?: boolean;
  isNew?: boolean;
  part?: string;
}): JSX.Element | null {
  const space = useSpace();
  const len = Math.hypot(dir[0], dir[1]) || 1;
  const u: Pt = [dir[0] / len, dir[1] / len];
  let ends: [Pt, Pt] | null;
  if (extend !== undefined) {
    ends = [add(through, scale(u, isRay ? 0 : -extend)), add(through, scale(u, extend))];
  } else {
    ends = clipLine(through, u, windowOf(space));
    if (ends !== null && isRay) {
      const forward = (p: Pt) => (p[0] - through[0]) * u[0] + (p[1] - through[1]) * u[1];
      const far = forward(ends[0]) > forward(ends[1]) ? ends[0] : ends[1];
      ends = [through, far];
    }
  }
  if (ends === null) return null;
  return <Seg from={ends[0]} to={ends[1]} tone={tone} dashed={dashed} isNew={isNew} part={part} />;
}

/** A whole circle. */
export function CircleShape({
  centre,
  r,
  tone,
  isFilled,
  dashed,
  isNew,
  part,
}: {
  centre: Pt;
  r: number;
  tone?: Tone;
  isFilled?: boolean;
  dashed?: boolean;
  isNew?: boolean;
  part?: string;
}): JSX.Element {
  const space = useSpace();
  const c = px(space, centre);
  return (
    <circle
      class={`${toneClass(tone, isNew, dashed)}${isFilled ? " gk-filled" : ""}`}
      cx={f(c[0])}
      cy={f(c[1])}
      r={f(r * unitPx(space))}
      pathLength={isNew ? 1 : undefined}
      data-part={part}
    />
  );
}

/** The SVG path of an arc in pixels, from model angle `from` anticlockwise to `to` (degrees). */
export function arcD(c: Pt, rPx: number, from: number, to: number, startWithMove = true): string {
  let span = to - from;
  while (span < 0) span += 360;
  while (span > 360) span -= 360;
  const at = (a: number): Pt => [
    c[0] + rPx * Math.cos((a * Math.PI) / 180),
    c[1] - rPx * Math.sin((a * Math.PI) / 180),
  ];
  const s = at(from);
  if (span >= 359.999) {
    const half = at(from + 180);
    return `${startWithMove ? `M${f(s[0])} ${f(s[1])} ` : ""}A ${f(rPx)} ${f(rPx)} 0 1 0 ${f(half[0])} ${f(half[1])} A ${f(rPx)} ${f(rPx)} 0 1 0 ${f(s[0])} ${f(s[1])}`;
  }
  const e = at(from + span);
  return `${startWithMove ? `M${f(s[0])} ${f(s[1])} ` : ""}A ${f(rPx)} ${f(rPx)} 0 ${span > 180 ? 1 : 0} 0 ${f(e[0])} ${f(e[1])}`;
}

/** An arc of a circle from angle `from` anticlockwise to angle `to` (degrees, model). */
export function ArcShape({
  centre,
  r,
  from,
  to,
  tone,
  isNew,
  part,
}: {
  centre: Pt;
  r: number;
  from: number;
  to: number;
  tone?: Tone;
  isNew?: boolean;
  part?: string;
}): JSX.Element {
  const space = useSpace();
  return (
    <path
      class={toneClass(tone ?? "construction", isNew)}
      d={arcD(px(space, centre), r * unitPx(space), from, to)}
      pathLength={isNew ? 1 : undefined}
      data-part={part}
    />
  );
}

/** A filled region bounded by straight sides. */
export function Region({
  points,
  tone,
  part,
}: {
  points: readonly Pt[];
  tone?: Tone;
  part?: string;
}): JSX.Element {
  const space = useSpace();
  const d = `${points.map((p, i) => `${i === 0 ? "M" : "L"}${f(px(space, p)[0])} ${f(px(space, p)[1])}`).join(" ")} Z`;
  return <path class={`gk-region gk-${tone ?? "accent"}`} d={d} data-part={part} />;
}

/** A sector (pizza slice) of a circle, filled: centre to the arc from `from` to `to`. */
export function SectorShape({
  centre,
  r,
  from,
  to,
  tone,
  part,
}: {
  centre: Pt;
  r: number;
  from: number;
  to: number;
  tone?: Tone;
  part?: string;
}): JSX.Element {
  const space = useSpace();
  const c = px(space, centre);
  const rp = r * unitPx(space);
  const s: Pt = [
    c[0] + rp * Math.cos((from * Math.PI) / 180),
    c[1] - rp * Math.sin((from * Math.PI) / 180),
  ];
  return (
    <path
      class={`gk-region gk-${tone ?? "accent"}`}
      d={`M${f(c[0])} ${f(c[1])} L${f(s[0])} ${f(s[1])} ${arcD(c, rp, from, to, false)} Z`}
      data-part={part}
    />
  );
}

/** A segment of a circle (between a chord and its arc), filled. */
export function CircleSegmentShape({
  centre,
  r,
  from,
  to,
  tone,
  part,
}: {
  centre: Pt;
  r: number;
  from: number;
  to: number;
  tone?: Tone;
  part?: string;
}): JSX.Element {
  const space = useSpace();
  const c = px(space, centre);
  const rp = r * unitPx(space);
  return (
    <path
      class={`gk-region gk-${tone ?? "accent"}`}
      d={`${arcD(c, rp, from, to)} Z`}
      data-part={part}
    />
  );
}

/** A point: a filled dot, a hollow ring, or the small cross-dot of a centre. */
export function PointDot({
  at,
  kind = "solid",
  tone,
  isNew,
  part,
}: {
  at: Pt;
  kind?: "solid" | "hollow" | "centre";
  tone?: Tone;
  isNew?: boolean;
  part?: string;
}): JSX.Element {
  const space = useSpace();
  const p = px(space, at);
  return (
    <circle
      class={`gk-dot gk-dot-${kind} gk-${tone ?? "main"}${isNew ? " gk-pop" : ""}`}
      cx={f(p[0])}
      cy={f(p[1])}
      r={kind === "centre" ? 2.6 : 4}
      data-part={part}
    />
  );
}

/**
 * An angle mark at a vertex between the rays to p and q (the smaller angle), with up to three arcs
 * and an optional label just outside them, inside the angle.
 */
export function AngleMark({
  vertex,
  p,
  q,
  radius = 16,
  count = 1,
  label,
  tone,
  part,
}: {
  vertex: Pt;
  p: Pt;
  q: Pt;
  radius?: number;
  count?: number;
  label?: string;
  tone?: Tone;
  part?: string;
}): JSX.Element {
  const space = useSpace();
  const v = px(space, vertex);
  const a = px(space, p);
  const b = px(space, q);
  const a1 = Math.atan2(a[1] - v[1], a[0] - v[0]);
  let d = Math.atan2(b[1] - v[1], b[0] - v[0]) - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const arcs = Array.from({ length: count }, (_, i) => {
    const r = radius + i * 3.5;
    const s: Pt = [v[0] + r * Math.cos(a1), v[1] + r * Math.sin(a1)];
    const e: Pt = [v[0] + r * Math.cos(a1 + d), v[1] + r * Math.sin(a1 + d)];
    return `M${f(s[0])} ${f(s[1])} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${f(e[0])} ${f(e[1])}`;
  }).join(" ");
  const midA = a1 + d / 2;
  const lr = radius + (count - 1) * 3.5 + 6 + (label === undefined ? 0 : label.length * 2.6);
  return (
    <g class={`gk-angle gk-${tone ?? "muted"}`} data-part={part}>
      <path d={arcs} />
      {label !== undefined && (
        <text
          x={f(v[0] + lr * Math.cos(midA))}
          y={f(v[1] + lr * Math.sin(midA) + 3.5)}
          text-anchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** The small square marking a right angle at a vertex between the rays to p and q. */
export function RightMark({
  vertex,
  p,
  q,
  size = 9,
  part,
}: {
  vertex: Pt;
  p: Pt;
  q: Pt;
  size?: number;
  part?: string;
}): JSX.Element {
  const space = useSpace();
  const v = px(space, vertex);
  const u = (t: Pt): Pt => {
    const w = sub(px(space, t), v);
    const l = Math.hypot(w[0], w[1]) || 1;
    return [(w[0] / l) * size, (w[1] / l) * size];
  };
  const a = u(p);
  const b = u(q);
  return (
    <path
      class="gk-right"
      d={`M${f(v[0] + a[0])} ${f(v[1] + a[1])} L${f(v[0] + a[0] + b[0])} ${f(v[1] + a[1] + b[1])} L${f(v[0] + b[0])} ${f(v[1] + b[1])}`}
      data-part={part}
    />
  );
}

/** Short ticks across a segment's middle, marking equal lengths (|, ||, |||). */
export function EqualTicks({
  from,
  to,
  count = 1,
}: {
  from: Pt;
  to: Pt;
  count?: number;
}): JSX.Element {
  const space = useSpace();
  const a = px(space, from);
  const b = px(space, to);
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const ux = (b[0] - a[0]) / l;
  const uy = (b[1] - a[1]) / l;
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = Array.from({ length: count }, (_, i) => {
    const off = (i - (count - 1) / 2) * 4;
    const c: Pt = [m[0] + ux * off, m[1] + uy * off];
    return `M${f(c[0] - uy * 5)} ${f(c[1] + ux * 5)} L${f(c[0] + uy * 5)} ${f(c[1] - ux * 5)}`;
  }).join(" ");
  return <path class="gk-ticks" d={d} />;
}

/** Arrowheads on a segment's middle, marking it parallel to others with the same count (>, >>). */
export function ParallelMarks({
  from,
  to,
  count = 1,
}: {
  from: Pt;
  to: Pt;
  count?: number;
}): JSX.Element {
  const space = useSpace();
  const a = px(space, from);
  const b = px(space, to);
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const ux = (b[0] - a[0]) / l;
  const uy = (b[1] - a[1]) / l;
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = Array.from({ length: count }, (_, i) => {
    const c: Pt = [
      m[0] + ux * (i * 5 - (count - 1) * 2.5),
      m[1] + uy * (i * 5 - (count - 1) * 2.5),
    ];
    return `M${f(c[0] - ux * 4 - uy * 4)} ${f(c[1] - uy * 4 + ux * 4)} L${f(c[0])} ${f(c[1])} L${f(c[0] - ux * 4 + uy * 4)} ${f(c[1] - uy * 4 - ux * 4)}`;
  }).join(" ");
  return <path class="gk-parallel" d={d} />;
}

export type LabelItem = {
  id: string;
  /** The point the label names (model units). */
  at: Pt;
  text: string;
  /** "point" for a vertex or point name, "length" for a measurement, "note" for a short remark. */
  kind?: "point" | "length" | "note";
  tone?: Tone;
  /** Screen direction to try first (0 right, 90 down); default away from `away`. */
  prefer?: number;
  /** A model point to push away from (a shape's centre). */
  away?: Pt;
  gap?: number;
};

/**
 * Text labels placed so they don't sit on each other or on the drawing's lines. Pass the drawing's
 * lines and circles (model units) as obstacles; labels are placed in the order given.
 */
export function Labels({
  items,
  segments = [],
  circles = [],
}: {
  items: readonly LabelItem[];
  segments?: readonly (readonly [Pt, Pt])[];
  circles?: readonly { c: Pt; r: number }[];
}): JSX.Element {
  const space = useSpace();
  const k = unitPx(space);
  const sizeOf = (kind?: LabelItem["kind"]) => (kind === "point" || kind === undefined ? 13 : 11);
  const obstacles: Obstacles = {
    segments: segments.map(([a, b]) => [px(space, a), px(space, b)] as const),
    circles: circles.map((c) => ({ c: px(space, c.c), r: c.r * k })),
  };
  const placed = placeLabels(
    items.map((l) => ({
      id: l.id,
      at: px(space, l.at),
      text: l.text,
      size: sizeOf(l.kind),
      prefer: l.prefer,
      away: l.away === undefined ? undefined : px(space, l.away),
      gap: l.gap ?? (l.kind === "point" || l.kind === undefined ? 9 : 8),
    })),
    { width: space.width, height: space.height },
    obstacles,
  );
  return (
    <g class="gk-labels">
      {placed.map((b, i) => {
        const item = items[i] as LabelItem;
        return (
          <text
            key={b.id}
            class={`gk-label gk-label-${item.kind ?? "point"} gk-${item.tone ?? "main"}`}
            x={f(b.x + b.width / 2)}
            y={f(b.y + b.height * 0.78)}
            text-anchor="middle"
          >
            {item.text}
          </text>
        );
      })}
    </g>
  );
}

/**
 * A point the learner can drag or move with the arrow keys. It reports where it was dropped in
 * model units (the prop snaps it and calls its own action); arrow keys report a direction.
 */
export function DragHandle({
  at,
  label,
  onMove,
  onStep,
  isEnabled = true,
  part,
}: {
  at: Pt;
  label: string;
  onMove: (to: Pt) => void;
  onStep?: (dir: Pt) => void;
  isEnabled?: boolean;
  part?: string;
}): JSX.Element {
  const space = useSpace();
  const p = px(space, at);
  const dragging = useRef(false);
  const toLocal = (e: PointerEvent): Pt | null => {
    const svg = (e.currentTarget as SVGElement).ownerSVGElement;
    const m = svg?.getScreenCTM();
    if (svg === null || svg === undefined || m === null || m === undefined) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return toModel(space, [pt.x, pt.y]);
  };
  return (
    <g
      class={`gk-handle${isEnabled ? "" : " is-off"}`}
      data-part={part}
      tabIndex={isEnabled ? 0 : -1}
      // biome-ignore lint/a11y/useSemanticElements: SVG has no <button>; this <g> takes focus and keys itself
      role="button"
      aria-label={label}
      onPointerDown={(e) => {
        if (!isEnabled) return;
        dragging.current = true;
        (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const m = toLocal(e);
        if (m !== null) onMove(m);
      }}
      onPointerUp={(e) => {
        dragging.current = false;
        (e.currentTarget as SVGElement).releasePointerCapture(e.pointerId);
      }}
      onKeyDown={(e) => {
        if (!isEnabled || onStep === undefined) return;
        const dir: Record<string, Pt> = {
          ArrowLeft: [-1, 0],
          ArrowRight: [1, 0],
          ArrowUp: [0, 1],
          ArrowDown: [0, -1],
        };
        const d = dir[e.key];
        if (d !== undefined) {
          e.preventDefault();
          onStep(d);
        }
      }}
    >
      <circle class="gk-handle-halo" cx={f(p[0])} cy={f(p[1])} r={16} />
      <circle class="gk-handle-dot" cx={f(p[0])} cy={f(p[1])} r={6} />
    </g>
  );
}

import type { JSX } from "preact";
import type { Pt } from "./geometry";

/**
 * Small drawing helpers shared by the triangle props: a fit from model coordinates (y up) to
 * pixels, vertex labels pushed out from a shape's centre, angle arcs and right-angle marks.
 */

export type Fit = { x: (p: Pt) => number; y: (p: Pt) => number; px: (p: Pt) => Pt; k: number };

/** Fits model points (y up) into a box of pixels, keeping the aspect, with a margin. */
export function fitPoints(
  pts: readonly Pt[],
  box: { left: number; top: number; width: number; height: number },
  margin = 18,
): Fit {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = Math.max(maxX - minX, 1e-6);
  const h = Math.max(maxY - minY, 1e-6);
  const k = Math.min((box.width - 2 * margin) / w, (box.height - 2 * margin) / h);
  const ox = box.left + (box.width - w * k) / 2 - minX * k;
  const oy = box.top + (box.height + h * k) / 2 + minY * k;
  const x = (p: Pt) => ox + p[0] * k;
  const y = (p: Pt) => oy - p[1] * k;
  return { x, y, px: (p) => [x(p), y(p)], k };
}

export const pathOf = (pts: readonly Pt[], closed = true): string =>
  `${pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ")}${closed ? " Z" : ""}`;

/** The centroid of some pixel points. */
export function centreOf(pts: readonly Pt[]): Pt {
  const n = pts.length;
  return [pts.reduce((a, p) => a + p[0], 0) / n, pts.reduce((a, p) => a + p[1], 0) / n];
}

/** A label just outside a vertex, pushed away from the shape's centre. */
export function VertexLabel({
  at,
  centre,
  text,
  cls = "tg-vertex",
  gap = 11,
}: {
  at: Pt;
  centre: Pt;
  text: string;
  cls?: string;
  gap?: number;
}): JSX.Element {
  const dx = at[0] - centre[0];
  const dy = at[1] - centre[1];
  const len = Math.hypot(dx, dy) || 1;
  return (
    <text
      class={cls}
      x={at[0] + (dx / len) * gap}
      y={at[1] + (dy / len) * gap + 4}
      text-anchor="middle"
    >
      {text}
    </text>
  );
}

/** An angle arc at pixel vertex v between the directions to p and q, with an optional label inside. */
export function AngleArc({
  v,
  p,
  q,
  r = 14,
  label,
  cls = "tg-arc",
}: {
  v: Pt;
  p: Pt;
  q: Pt;
  r?: number;
  label?: string;
  cls?: string;
}): JSX.Element {
  const a1 = Math.atan2(p[1] - v[1], p[0] - v[0]);
  let a2 = Math.atan2(q[1] - v[1], q[0] - v[0]);
  let d = a2 - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  a2 = a1 + d;
  const s: Pt = [v[0] + r * Math.cos(a1), v[1] + r * Math.sin(a1)];
  const e: Pt = [v[0] + r * Math.cos(a2), v[1] + r * Math.sin(a2)];
  const mid = a1 + d / 2;
  const lr = r + 10;
  return (
    <g class={cls}>
      <path
        d={`M${s[0].toFixed(1)} ${s[1].toFixed(1)} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`}
      />
      {label !== undefined && (
        <text
          x={v[0] + lr * Math.cos(mid)}
          y={v[1] + lr * Math.sin(mid) + 3.5}
          text-anchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** A right-angle mark at pixel vertex v between the directions to p and q. */
export function RightMark({
  v,
  p,
  q,
  size = 9,
}: { v: Pt; p: Pt; q: Pt; size?: number }): JSX.Element {
  const u = (t: Pt): Pt => {
    const dx = t[0] - v[0];
    const dy = t[1] - v[1];
    const l = Math.hypot(dx, dy) || 1;
    return [(dx / l) * size, (dy / l) * size];
  };
  const a = u(p);
  const b = u(q);
  return (
    <path
      class="tg-right"
      d={`M${v[0] + a[0]} ${v[1] + a[1]} L${v[0] + a[0] + b[0]} ${v[1] + a[1] + b[1]} L${v[0] + b[0]} ${v[1] + b[1]}`}
    />
  );
}

/** A side's length written at its middle, pushed away from the shape's centre. */
export function SideLabel({
  p,
  q,
  centre,
  text,
  gap = 10,
  cls = "tg-length",
}: {
  p: Pt;
  q: Pt;
  centre: Pt;
  text: string;
  gap?: number;
  cls?: string;
}): JSX.Element {
  const m: Pt = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const dx = m[0] - centre[0];
  const dy = m[1] - centre[1];
  const len = Math.hypot(dx, dy) || 1;
  return (
    <text
      class={cls}
      x={m[0] + (dx / len) * gap}
      y={m[1] + (dy / len) * gap + 4}
      text-anchor="middle"
    >
      {text}
    </text>
  );
}

/** Small arrowheads on a segment's middle marking it as parallel to another (>, >>). */
export function ParallelMark({ p, q, count = 1 }: { p: Pt; q: Pt; count?: number }): JSX.Element {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  const m: Pt = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const marks = Array.from({ length: count }, (_, i) => {
    const c: Pt = [
      m[0] + ux * (i * 5 - (count - 1) * 2.5),
      m[1] + uy * (i * 5 - (count - 1) * 2.5),
    ];
    return `M${c[0] - ux * 4 - uy * 4} ${c[1] - uy * 4 + ux * 4} L${c[0]} ${c[1]} L${c[0] - ux * 4 + uy * 4} ${c[1] - uy * 4 - ux * 4}`;
  });
  return <path class="tg-parallel" d={marks.join(" ")} />;
}

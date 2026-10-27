import type { Space } from "@chalk/draw";
import type { Pt } from "./geometry";

/**
 * The window of model space a drawing shows: x and y ranges for a <Stage> that hold every point
 * with a margin and keep one unit the same length across and up (circles stay round).
 */
export function frameOf(
  points: readonly Pt[],
  size: { width: number; height: number },
  margin = 20,
): { x: [number, number]; y: [number, number] } {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const w = Math.max(maxX - minX, 1e-6);
  const h = Math.max(maxY - minY, 1e-6);
  const k = Math.min((size.width - 2 * margin) / w, (size.height - 2 * margin) / h);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const halfW = size.width / k / 2;
  const halfH = size.height / k / 2;
  return { x: [cx - halfW, cx + halfW], y: [cy - halfH, cy + halfH] };
}

/** A model point in pixels on this stage (y down). */
export function px(space: Space, p: Pt): Pt {
  return [space.x(p[0]), space.y === null ? p[1] : space.y(p[1])];
}

/** How many pixels one model unit is on this stage. */
export function unitPx(space: Space): number {
  return Math.abs(space.x(1) - space.x(0));
}

/** A pixel point back in model units (for dragging). */
export function toModel(space: Space, p: Pt): Pt {
  return [space.x.invert(p[0]), space.y === null ? p[1] : space.y.invert(p[1])];
}

/** The model-space rectangle the stage shows: [xMin, xMax, yMin, yMax]. */
export function windowOf(space: Space): [number, number, number, number] {
  const [x0, x1] = space.x.domain() as [number, number];
  const [y0, y1] = (space.y?.domain() ?? [0, 0]) as [number, number];
  return [Math.min(x0, x1), Math.max(x0, x1), Math.min(y0, y1), Math.max(y0, y1)];
}

/**
 * The part of the infinite line through p (direction u) that the window shows, or null if the
 * line misses it.
 */
export function clipLine(
  p: Pt,
  u: Pt,
  win: readonly [number, number, number, number],
): [Pt, Pt] | null {
  const [x0, x1, y0, y1] = win;
  let t0 = Number.NEGATIVE_INFINITY;
  let t1 = Number.POSITIVE_INFINITY;
  const clip = (d: number, lo: number, hi: number, at: number) => {
    if (Math.abs(d) < 1e-12) return at >= lo && at <= hi;
    const a = (lo - at) / d;
    const b = (hi - at) / d;
    t0 = Math.max(t0, Math.min(a, b));
    t1 = Math.min(t1, Math.max(a, b));
    return true;
  };
  if (!clip(u[0], x0, x1, p[0]) || !clip(u[1], y0, y1, p[1]) || t0 > t1) return null;
  return [
    [p[0] + u[0] * t0, p[1] + u[1] * t0],
    [p[0] + u[0] * t1, p[1] + u[1] * t1],
  ];
}

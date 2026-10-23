import type { Pt } from "./geometry";

/**
 * Label placement that keeps labels off each other and off the drawing's lines. Pure, in pixels
 * (y down), so it can be tested without a browser.
 *
 * Each label has an anchor (the point it names) and tries a ring of spots around it, nearest
 * first, in the order of its preferred direction. A spot scores a penalty for every other label it
 * covers, every line it crosses, every circle edge it sits on and for leaving the frame; the
 * cheapest spot wins. Labels are placed in the order given, so put the important ones first.
 */

export type LabelRequest = {
  id: string;
  /** The point the label names, in px. */
  at: Pt;
  text: string;
  /** Font size in px (default 13). */
  size?: number;
  /** The direction to try first, in degrees on screen (0 = right, 90 = down); default: away from `away`. */
  prefer?: number;
  /** A point to push away from (a shape's centre), used when `prefer` is not given. */
  away?: Pt;
  /** How far from the anchor the label's middle sits, in px (default 12). */
  gap?: number;
};

export type Placed = { id: string; x: number; y: number; width: number; height: number };

export type Obstacles = {
  /** Lines drawn on the picture, in px. */
  segments?: readonly (readonly [Pt, Pt])[];
  /** Circles drawn on the picture (their edges), in px. */
  circles?: readonly { c: Pt; r: number }[];
  /** Boxes already taken (other text, controls drawn in the SVG). */
  boxes?: readonly { x: number; y: number; width: number; height: number }[];
};

/** About how wide a run of text is: digits and letters average 0.6 em; subscripts are counted too. */
export function textWidth(text: string, size = 13): number {
  return Math.max(1, [...text].length) * size * 0.6;
}

type Box = { x: number; y: number; width: number; height: number };

const overlap = (a: Box, b: Box): number => {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};

/** Whether segment p–q passes through the box (its interior, slightly shrunk). */
function crosses(p: Pt, q: Pt, b: Box): boolean {
  const pad = 1;
  const x0 = b.x + pad;
  const x1 = b.x + b.width - pad;
  const y0 = b.y + pad;
  const y1 = b.y + b.height - pad;
  // Liang–Barsky clip: does any part of the segment fall inside?
  let t0 = 0;
  let t1 = 1;
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const edges: [number, number][] = [
    [-dx, p[0] - x0],
    [dx, x1 - p[0]],
    [-dy, p[1] - y0],
    [dy, y1 - p[1]],
  ];
  for (const [pp, qq] of edges) {
    if (pp === 0) {
      if (qq < 0) return false;
    } else {
      const t = qq / pp;
      if (pp < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return true;
}

/** Whether a circle's edge runs through the box. */
function onCircleEdge(c: Pt, r: number, b: Box): boolean {
  const corners: Pt[] = [
    [b.x, b.y],
    [b.x + b.width, b.y],
    [b.x, b.y + b.height],
    [b.x + b.width, b.y + b.height],
  ];
  const inside = corners.map((k) => Math.hypot(k[0] - c[0], k[1] - c[1]) < r);
  if (inside.some((v) => v) && inside.some((v) => !v)) return true;
  // A box wholly inside or outside can still be crossed by the edge on one side.
  const nx = Math.max(b.x, Math.min(c[0], b.x + b.width));
  const ny = Math.max(b.y, Math.min(c[1], b.y + b.height));
  const near = Math.hypot(nx - c[0], ny - c[1]);
  return inside.every((v) => !v) && near < r - 0.5;
}

/**
 * Places every label; returns each one's box (x, y = top-left) so the caller draws the text at its
 * middle: x + width / 2, y + height * 0.78 (the baseline).
 */
export function placeLabels(
  labels: readonly LabelRequest[],
  frame: { width: number; height: number },
  obstacles: Obstacles = {},
): Placed[] {
  const placed: Placed[] = [];
  const taken: Box[] = [...(obstacles.boxes ?? [])];
  for (const l of labels) {
    const size = l.size ?? 13;
    const width = textWidth(l.text, size) + 4;
    const height = size + 4;
    const gap = l.gap ?? 12;
    const first =
      l.prefer ??
      (l.away === undefined
        ? 315
        : (Math.atan2(l.at[1] - l.away[1], l.at[0] - l.away[0]) * 180) / Math.PI);
    let best: { box: Box; cost: number } | null = null;
    for (const ring of [1, 1.6, 2.3]) {
      for (let i = 0; i < 16; i++) {
        // Alternate either side of the preferred direction: 0, +22.5, −22.5, +45, …
        const turn = (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2) * 22.5;
        const a = ((first + turn) * Math.PI) / 180;
        const dx = Math.cos(a);
        const dy = Math.sin(a);
        // The box's middle sits `gap` out, plus half its own size in that direction.
        const r = gap * ring + Math.abs(dx) * (width / 2 - 4) + Math.abs(dy) * (height / 2 - 4);
        const cx = l.at[0] + dx * r;
        const cy = l.at[1] + dy * r;
        const box = { x: cx - width / 2, y: cy - height / 2, width, height };
        let cost = (ring - 1) * 6 + Math.abs(turn) / 45;
        if (box.x < 0 || box.y < 0 || box.x + width > frame.width || box.y + height > frame.height)
          cost += 200;
        for (const t of taken) cost += overlap(box, t) * 4;
        for (const [p, q] of obstacles.segments ?? []) if (crosses(p, q, box)) cost += 40;
        for (const c of obstacles.circles ?? []) if (onCircleEdge(c.c, c.r, box)) cost += 25;
        if (best === null || cost < best.cost) best = { box, cost };
        if (cost < 0.5) break;
      }
      if (best !== null && best.cost < 2) break;
    }
    const box = (best as { box: Box }).box;
    taken.push(box);
    placed.push({ id: l.id, ...box });
  }
  return placed;
}

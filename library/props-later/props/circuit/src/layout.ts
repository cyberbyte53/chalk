/** Grid → pixels for the circuit diagram. Shared by the view and `locate`, so both agree. */

export type Point = { x: number; y: number };
type GridNode = { id: string; x: number; y: number };
type Joined = { id: string; from: string; to: string };

/** Space round the drawing, for labels and readings. */
export const PAD = 40;
/** The largest grid step, so a tiny circuit isn't drawn huge. */
const MAX_UNIT = 72;
/** Half the length of a drawn symbol along its component, at most. */
export const SYMBOL_HALF = 18;
/** Tap targets are at least this big (finger-sized). */
export const HIT_SIZE = 48;

export type Layout = {
  unit: number;
  width: number;
  height: number;
  at: (node: GridNode) => Point;
};

/** Fits the grid of nodes used into the width, centred. */
export function layoutFor(nodes: readonly GridNode[], width: number): Layout {
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = xs.length > 0 ? Math.min(...xs) : 0;
  const maxX = xs.length > 0 ? Math.max(...xs) : 0;
  const minY = ys.length > 0 ? Math.min(...ys) : 0;
  const maxY = ys.length > 0 ? Math.max(...ys) : 0;
  const spanX = Math.max(1, maxX - minX);
  const spanY = maxY - minY;
  const unit = Math.max(8, Math.min(MAX_UNIT, (width - 2 * PAD) / spanX));
  const left = (width - (maxX - minX) * unit) / 2;
  return {
    unit,
    width,
    height: spanY * unit + 2 * PAD,
    at: (node) => ({ x: left + (node.x - minX) * unit, y: PAD + (node.y - minY) * unit }),
  };
}

/** Where one component is drawn: its path from `from` to `to`, and its symbol's place. */
export type Placement = {
  /** The path the wire takes: from the `from` node, out to the side if shared, to the `to` node. */
  path: readonly Point[];
  /** The middle of the symbol. */
  mid: Point;
  /** Direction of the symbol, `from` → `to`, in degrees. */
  angle: number;
  /** Half the symbol's length (smaller when the nodes are close). */
  half: number;
  /** Unit vector across the component, pointing away from the middle of the circuit (labels go there). */
  outward: Point;
};

/**
 * Places every component. Components joining the same two nodes are drawn side by side, bowed
 * out from the straight line between them, so a voltmeter across a bulb is seen next to it.
 */
export function placeAll(
  layout: Layout,
  nodes: readonly GridNode[],
  components: readonly Joined[],
): Map<string, Placement> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const pairKey = (c: Joined) => [c.from, c.to].sort().join("|");
  const sharing = new Map<string, Joined[]>();
  for (const c of components) sharing.set(pairKey(c), [...(sharing.get(pairKey(c)) ?? []), c]);
  const points = nodes.map((n) => layout.at(n));
  const centre = {
    x: points.reduce((sum, p) => sum + p.x, 0) / Math.max(1, points.length),
    y: points.reduce((sum, p) => sum + p.y, 0) / Math.max(1, points.length),
  };
  const out = new Map<string, Placement>();
  for (const c of components) {
    const fromNode = byId.get(c.from);
    const toNode = byId.get(c.to);
    if (fromNode === undefined || toNode === undefined) continue;
    const a = layout.at(fromNode);
    const b = layout.at(toNode);
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const along = { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
    // A normal that doesn't depend on which way round the component was given.
    const [first] = [c.from, c.to].sort();
    const sign = first === c.from ? 1 : -1;
    const normal = { x: along.y * sign, y: -along.x * sign };
    const group = sharing.get(pairKey(c)) ?? [c];
    const index = group.indexOf(c);
    const spacing = Math.min(44, layout.unit * 0.9);
    const bow = (index - (group.length - 1) / 2) * spacing;
    const a2 = { x: a.x + normal.x * bow, y: a.y + normal.y * bow };
    const b2 = { x: b.x + normal.x * bow, y: b.y + normal.y * bow };
    const path = bow === 0 ? [a, b] : [a, a2, b2, b];
    const mid = { x: (a2.x + b2.x) / 2, y: (a2.y + b2.y) / 2 };
    const away = (mid.x - centre.x) * normal.x + (mid.y - centre.y) * normal.y;
    // A component drawn side by side with others labels on its own side; a lone one, outside.
    const flip = bow !== 0 ? Math.sign(bow) : away < 0 ? -1 : 1;
    out.set(c.id, {
      path,
      mid,
      angle: (Math.atan2(along.y, along.x) * 180) / Math.PI,
      half: Math.max(4, Math.min(SYMBOL_HALF, length / 2 - 4)),
      outward: { x: normal.x * flip, y: normal.y * flip },
    });
  }
  return out;
}

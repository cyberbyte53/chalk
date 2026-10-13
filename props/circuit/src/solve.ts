/**
 * A solver for networks of ideal two-ended elements: sources (fixed voltage, no resistance),
 * resistances, shorts (no resistance) and gaps (no conduction). It knows networks, not bulbs.
 *
 * How:
 * 1. Shorts join their ends into one group of equal potential (union-find).
 * 2. Sources join groups too, with a fixed potential difference (union-find with offsets). A loop
 *    of sources and shorts whose voltages don't add up to zero has no answer: a short circuit.
 * 3. Only resistances join different groups. Kirchhoff's current law for each group gives nodal
 *    equations; each connected piece is grounded on its own; Gaussian elimination with partial
 *    pivoting solves them, a vanishing pivot being treated as a free value set to 0.
 * 4. Inside each group the current through shorts and sources is shared as if each had the same
 *    tiny resistance (the limit a real circuit approaches): one more small nodal solve.
 *
 * A piece that is shorted has no finite answer: every potential and current in it is 0 and it is
 * flagged. Nothing returned is ever NaN or infinite.
 */

export const ElementKind = {
  Source: "source",
  Resistance: "resistance",
  Short: "short",
  Gap: "gap",
} as const;
export type ElementKind = (typeof ElementKind)[keyof typeof ElementKind];

/** One element between nodes `from` and `to` (indices). A source holds V(to) − V(from) = volts. */
export type Element =
  | { kind: typeof ElementKind.Source; from: number; to: number; volts: number }
  | { kind: typeof ElementKind.Resistance; from: number; to: number; ohms: number }
  | { kind: typeof ElementKind.Short | typeof ElementKind.Gap; from: number; to: number };

export type Solution = {
  /** Each node's potential, relative to its own piece's ground. */
  potential: readonly number[];
  /** Each element's current from its `from` end to its `to` end, through the element. */
  current: readonly number[];
  /** Which connected piece each node belongs to (pieces are joined by conducting elements). */
  piece: readonly number[];
  /** Whether each node's piece is shorted (has no finite answer). */
  isShortedNode: readonly boolean[];
  /** Whether each element is a source caught in a short circuit. */
  isShortedSource: readonly boolean[];
};

const TINY = 1e-12;

/** Cleans a computed number: never NaN or infinite, and rounding dust becomes exactly 0. */
export function clean(x: number): number {
  return Number.isFinite(x) && Math.abs(x) > TINY ? x : 0;
}

/**
 * Solves A x = b by Gaussian elimination with partial pivoting. A singular system (a pivot that
 * vanishes) gets that unknown set to 0 rather than NaN. Does not change its arguments.
 */
export function solveLinear(
  matrix: readonly (readonly number[])[],
  rhs: readonly number[],
): number[] {
  const n = rhs.length;
  const a = matrix.map((row) => [...row]);
  const b = [...rhs];
  const at = (r: number, c: number): number => a[r]?.[c] ?? 0;
  let scale = 0;
  for (const row of a) for (const v of row) scale = Math.max(scale, Math.abs(v));
  const eps = 1e-12 * (scale || 1);
  const pivotRow: number[] = new Array(n).fill(-1);
  let row = 0;
  for (let col = 0; col < n && row < n; col++) {
    let best = row;
    for (let r = row + 1; r < n; r++) if (Math.abs(at(r, col)) > Math.abs(at(best, col))) best = r;
    if (Math.abs(at(best, col)) <= eps) continue; // free unknown: left at 0
    [a[row], a[best]] = [a[best] ?? [], a[row] ?? []];
    [b[row], b[best]] = [b[best] ?? 0, b[row] ?? 0];
    const pivot = at(row, col);
    for (let r = row + 1; r < n; r++) {
      const factor = at(r, col) / pivot;
      if (factor === 0) continue;
      const target = a[r];
      const source = a[row];
      if (target === undefined || source === undefined) continue;
      for (let c = col; c < n; c++) target[c] = (target[c] ?? 0) - factor * (source[c] ?? 0);
      b[r] = (b[r] ?? 0) - factor * (b[row] ?? 0);
    }
    pivotRow[col] = row;
    row++;
  }
  const x: number[] = new Array(n).fill(0);
  for (let col = n - 1; col >= 0; col--) {
    const r = pivotRow[col] ?? -1;
    if (r < 0) continue;
    let sum = b[r] ?? 0;
    for (let c = col + 1; c < n; c++) sum -= at(r, c) * (x[c] ?? 0);
    x[col] = clean(sum / at(r, col));
  }
  return x;
}

/** Union-find over 0..n-1. */
function unionFind(n: number) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => {
    let root = i;
    while (parent[root] !== root) root = parent[root] ?? root;
    let x = i;
    while (parent[x] !== root) {
      const next = parent[x] ?? root;
      parent[x] = root;
      x = next;
    }
    return root;
  };
  const join = (i: number, j: number): void => {
    const ri = find(i);
    const rj = find(j);
    if (ri !== rj) parent[rj] = ri;
  };
  return { find, join };
}

/**
 * Union-find with offsets: potential(i) = potential(root) + offset(i). Joining with a fixed
 * difference that contradicts what is already known marks the group bad.
 */
function offsetUnionFind(n: number) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const offset: number[] = new Array(n).fill(0); // potential(i) − potential(parent(i))
  const isBad: boolean[] = new Array(n).fill(false);
  const find = (i: number): { root: number; offset: number } => {
    const p = parent[i] ?? i;
    if (p === i) return { root: i, offset: 0 };
    const up = find(p);
    parent[i] = up.root;
    offset[i] = (offset[i] ?? 0) + up.offset;
    return { root: up.root, offset: offset[i] ?? 0 };
  };
  /** Requires potential(j) − potential(i) = difference. */
  const join = (i: number, j: number, difference: number): void => {
    const a = find(i);
    const b = find(j);
    if (a.root === b.root) {
      const isConsistent =
        Math.abs(b.offset - a.offset - difference) <= 1e-9 * (1 + Math.abs(difference));
      if (!isConsistent) isBad[a.root] = true;
      return;
    }
    parent[b.root] = a.root;
    offset[b.root] = a.offset + difference - b.offset;
    isBad[a.root] = (isBad[a.root] ?? false) || (isBad[b.root] ?? false);
  };
  const isBadRoot = (root: number): boolean => isBad[root] ?? false;
  return { find, join, isBadRoot };
}

/** Solves a network of `nodeCount` nodes. Pure. */
export function solveNetwork(nodeCount: number, elements: readonly Element[]): Solution {
  // 1. Shorts: groups of equal potential.
  const shorts = unionFind(nodeCount);
  for (const e of elements) if (e.kind === ElementKind.Short) shorts.join(e.from, e.to);

  // 2. Sources: groups joined with fixed differences.
  const fixed = offsetUnionFind(nodeCount);
  for (const e of elements) {
    if (e.kind === ElementKind.Source) fixed.join(shorts.find(e.from), shorts.find(e.to), e.volts);
  }
  const groupOf = (node: number) => fixed.find(shorts.find(node));

  // Pieces: joined by anything that conducts.
  const pieces = unionFind(nodeCount);
  for (const e of elements) if (e.kind !== ElementKind.Gap) pieces.join(e.from, e.to);
  const piece = Array.from({ length: nodeCount }, (_, i) => pieces.find(i));
  const isBadPiece = new Set<number>();
  for (let i = 0; i < nodeCount; i++) {
    if (fixed.isBadRoot(groupOf(i).root)) isBadPiece.add(piece[i] ?? i);
  }
  const isShortedNode = piece.map((p) => isBadPiece.has(p));

  // 3. Nodal equations for the groups; one ground group per piece.
  const unknownOf = new Map<number, number>(); // group root → unknown index
  const groundedPieces = new Set<number>();
  for (let i = 0; i < nodeCount; i++) {
    const root = groupOf(i).root;
    const p = piece[i] ?? i;
    if (isBadPiece.has(p) || unknownOf.has(root)) continue;
    if (!groundedPieces.has(p)) {
      groundedPieces.add(p);
      unknownOf.set(root, -1); // the ground
      continue;
    }
    unknownOf.set(root, unknownOf.size - groundedPieces.size);
  }
  const size = unknownOf.size - groundedPieces.size;
  const matrix = Array.from({ length: size }, () => new Array<number>(size).fill(0));
  const rhs = new Array<number>(size).fill(0);
  const add = (r: number, c: number, v: number) => {
    const row = matrix[r];
    if (r >= 0 && c >= 0 && row !== undefined) row[c] = (row[c] ?? 0) + v;
  };
  for (const e of elements) {
    if (e.kind !== ElementKind.Resistance || isShortedNode[e.from]) continue;
    const a = groupOf(e.from);
    const b = groupOf(e.to);
    if (a.root === b.root) continue;
    const g = 1 / e.ohms;
    const ia = unknownOf.get(a.root) ?? -1;
    const ib = unknownOf.get(b.root) ?? -1;
    const push = g * (a.offset - b.offset); // current a → b that the offsets alone drive
    add(ia, ia, g);
    add(ia, ib, -g);
    add(ib, ib, g);
    add(ib, ia, -g);
    if (ia >= 0) rhs[ia] = (rhs[ia] ?? 0) - push;
    if (ib >= 0) rhs[ib] = (rhs[ib] ?? 0) + push;
  }
  const groupPotential = solveLinear(matrix, rhs);
  const potential = Array.from({ length: nodeCount }, (_, i) => {
    if (isShortedNode[i]) return 0;
    const g = groupOf(i);
    const k = unknownOf.get(g.root) ?? -1;
    return clean((k >= 0 ? (groupPotential[k] ?? 0) : 0) + g.offset);
  });

  // Currents through resistances, and what they bring into each node.
  const current: number[] = new Array(elements.length).fill(0);
  const inflow: number[] = new Array(nodeCount).fill(0);
  elements.forEach((e, k) => {
    if (e.kind !== ElementKind.Resistance || isShortedNode[e.from]) return;
    const i = clean(((potential[e.from] ?? 0) - (potential[e.to] ?? 0)) / e.ohms);
    current[k] = i;
    inflow[e.from] = (inflow[e.from] ?? 0) - i;
    inflow[e.to] = (inflow[e.to] ?? 0) + i;
  });

  // 4. Share each group's current among its shorts and sources, as equal tiny resistances.
  const inner = elements
    .map((e, k) => ({ e, k }))
    .filter(
      ({ e }) =>
        (e.kind === ElementKind.Short || e.kind === ElementKind.Source) && !isShortedNode[e.from],
    );
  const innerIndex = new Map<number, number>(); // node → unknown index (grounds absent)
  const groundedGroups = new Set<number>();
  for (let i = 0; i < nodeCount; i++) {
    if (isShortedNode[i]) continue;
    const root = groupOf(i).root;
    if (!groundedGroups.has(root)) groundedGroups.add(root);
    else innerIndex.set(i, innerIndex.size);
  }
  const m = innerIndex.size;
  const laplacian = Array.from({ length: m }, () => new Array<number>(m).fill(0));
  const injection = new Array<number>(m).fill(0);
  for (const [node, row] of innerIndex) injection[row] = inflow[node] ?? 0;
  const addL = (r: number | undefined, c: number | undefined, v: number) => {
    const line = r === undefined ? undefined : laplacian[r];
    if (line !== undefined && c !== undefined) line[c] = (line[c] ?? 0) + v;
  };
  for (const { e } of inner) {
    if (e.from === e.to) continue;
    const ra = innerIndex.get(e.from);
    const rb = innerIndex.get(e.to);
    addL(ra, ra, 1);
    addL(rb, rb, 1);
    addL(ra, rb, -1);
    addL(rb, ra, -1);
  }
  const share = solveLinear(laplacian, injection);
  const phi = (node: number) => {
    const r = innerIndex.get(node);
    return r === undefined ? 0 : (share[r] ?? 0);
  };
  for (const { e, k } of inner) current[k] = clean(phi(e.from) - phi(e.to));

  const isShortedSource = elements.map(
    (e) => e.kind === ElementKind.Source && fixed.isBadRoot(groupOf(e.from).root),
  );
  return { potential, current, piece, isShortedNode, isShortedSource };
}

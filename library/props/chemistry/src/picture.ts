import { Side, type Term } from "./balance";
import { MAX_COEFFICIENT } from "./formula";
import { type AtomSpot, type Shape, shapeOf } from "./molecule";

/**
 * Where everything in the picture goes, in px, from the equation and the width: each molecule's
 * column, its copies, and every atom. Pure, so the regrouping (every atom on the left paired with
 * one of its element on the right) is tested without drawing.
 */

/** One atom in the picture, in px. */
export type AtomAt = { element: string; x: number; y: number; r: number };

/** One copy of a molecule: its centre, and how big it is drawn now (popping in or out: 0 to 1). */
export type Copy = { x: number; y: number; grown: number };

export type Column = {
  side: Side;
  index: number;
  term: Term;
  shape: Shape;
  /** Its centre across, in px. */
  x: number;
  width: number;
  copies: Copy[];
};

export type Picture = {
  width: number;
  height: number;
  /** Px per atom radius. */
  unit: number;
  /** Where the molecules sit: below the sides' names. */
  top: number;
  columns: Column[];
  /** The "+" between molecules, in px across. */
  plusses: number[];
  arrow: { x0: number; x1: number; y: number };
  /** The middle of each side, across. */
  middles: Record<Side, number>;
};

const PAD = 6;
const ARROW = 34;
const PLUS = 14;
/** Rows of copies a column holds: up to three one above another, then two to a row. */
const ROWS = Math.ceil(MAX_COEFFICIENT / 2);
/** The biggest an atom is drawn, in px. */
const MAX_UNIT = 22;
/** Room round a molecule, in atom radii. */
const GAP = 0.5;
/** The narrowest a molecule's column is: room for its − and +. */
const CONTROLS = 64;
/** Room above the molecules for the sides' names. */
const HEAD = 22;

const perRowOf = (n: number) => (n > ROWS ? 2 : 1);

/** Where the copies of a column sit, for this many, centred in its box. */
function slotsOf(
  n: number,
  x: number,
  midY: number,
  shape: Shape,
  unit: number,
  rowH: number,
): { x: number; y: number }[] {
  const perRow = perRowOf(n);
  const rows = Math.ceil(n / perRow);
  const colW = (shape.width + GAP) * unit;
  return Array.from({ length: n }, (_, k) => {
    const row = Math.floor(k / perRow);
    const inRow = row === rows - 1 ? n - row * perRow : perRow;
    const col = k % perRow;
    return {
      x: x + (col - (inRow - 1) / 2) * colW,
      y: midY + (row - (rows - 1) / 2) * rowH,
    };
  });
}

/** The pop: how far (0 to 1) it has gone, and which molecule from which coefficient. */
export type Pop = { side: Side; index: number; was: number } | null;

/** A pop's ease: past full size and back, so a new molecule bounces in. */
const backOut = (p: number) => {
  const c = 1.9;
  return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2;
};
const smooth = (p: number) => p * p * (3 - 2 * p);

export function pictureOf(
  sides: { reactants: readonly Term[]; products: readonly Term[] },
  width: number,
  pop: Pop = null,
  popped = 0,
): Picture {
  const sideW = (width - ARROW - 2 * PAD) / 2;
  const startOf: Record<Side, number> = {
    [Side.Reactants]: PAD,
    [Side.Products]: PAD + sideW + ARROW,
  };
  // Each molecule's width, in atom radii, as many to a row as it will sit.
  const countOf = (side: Side, index: number, term: Term) =>
    Math.max(term.coefficient, pop?.side === side && pop.index === index ? pop.was : 0);
  const need = (side: Side, index: number, term: Term, shape: Shape) =>
    perRowOf(countOf(side, index, term)) * (shape.width + GAP);
  // One size of atom everywhere, so the same atom is the same size on both sides: the biggest at
  // which every side fits, each molecule as wide as it needs, and never too narrow for its − and +.
  const roomOf = (side: Side) => sideW - PLUS * (sides[side].length - 1);
  const narrowest = (side: Side) => Math.min(CONTROLS, roomOf(side) / sides[side].length);
  const unitFor = (side: Side) => {
    const terms = sides[side];
    const room = roomOf(side);
    const least = narrowest(side);
    const needs = terms.map((term, i) => need(side, i, term, shapeOf(term.formula)));
    let unit = room / needs.reduce((a, b) => a + b, 0);
    // Those narrower than the controls take the controls' width; the rest share what is left.
    const narrow = needs.filter((n) => n * unit < least);
    const wide = needs.filter((n) => n * unit >= least);
    if (narrow.length > 0 && wide.length > 0)
      unit = (room - least * narrow.length) / wide.reduce((a, b) => a + b, 0);
    return unit;
  };
  const unit = Math.min(MAX_UNIT, unitFor(Side.Reactants), unitFor(Side.Products));
  const laid = ([Side.Reactants, Side.Products] as const).flatMap((side) => {
    const terms = sides[side];
    const shapes = terms.map((term) => shapeOf(term.formula));
    const widths = terms.map((term, i) =>
      Math.max(narrowest(side), need(side, i, term, shapes[i] as Shape) * unit),
    );
    const total = widths.reduce((a, b) => a + b, 0) + PLUS * (terms.length - 1);
    // The side's molecules, centred in it.
    let at = startOf[side] + (sideW - total) / 2;
    return terms.map((term, index) => {
      const width = widths[index] as number;
      const x = at + width / 2;
      at += width + PLUS;
      return { side, index, term, shape: shapes[index] as Shape, x, width };
    });
  });
  const rowH = (Math.max(...laid.map((c) => c.shape.height)) + 0.6) * unit;
  // Room for two rows at least, so a second copy never moves what is below; more as they come.
  const rows = Math.max(
    2,
    ...laid.map((c) => {
      const n = Math.max(
        c.term.coefficient,
        pop?.side === c.side && pop.index === c.index ? pop.was : 0,
      );
      return Math.ceil(n / perRowOf(n));
    }),
  );
  const height = HEAD + rows * rowH + PAD;
  const midY = HEAD + (rows * rowH) / 2;
  const columns: Column[] = laid.map((c) => {
    const now = c.term.coefficient;
    const isPopping = pop !== null && pop.side === c.side && pop.index === c.index && popped < 1;
    if (!isPopping) {
      const copies = slotsOf(now, c.x, midY, c.shape, unit, rowH).map((p) => ({ ...p, grown: 1 }));
      return { ...c, copies };
    }
    const was = pop.was;
    const before = slotsOf(was, c.x, midY, c.shape, unit, rowH);
    const after = slotsOf(now, c.x, midY, c.shape, unit, rowH);
    const e = smooth(popped);
    const copies = Array.from({ length: Math.max(was, now) }, (_, k) => {
      const a = before[k];
      const b = after[k];
      if (a !== undefined && b !== undefined)
        return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, grown: 1 };
      if (b !== undefined) return { ...b, grown: Math.max(0, backOut(popped)) };
      const leaving = a as { x: number; y: number };
      return { ...leaving, grown: 1 - e };
    });
    return { ...c, copies };
  });
  const plusses = columns.flatMap((c) => (c.index === 0 ? [] : [c.x - c.width / 2 - PLUS / 2]));
  return {
    width,
    height,
    unit,
    top: HEAD,
    columns,
    plusses,
    arrow: { x0: PAD + sideW + 5, x1: PAD + sideW + ARROW - 5, y: midY },
    middles: {
      [Side.Reactants]: PAD + sideW / 2,
      [Side.Products]: PAD + sideW + ARROW + sideW / 2,
    },
  };
}

/** Every atom of one copy, in px. */
export function atomsAt(shape: Shape, copy: Copy, unit: number): AtomAt[] {
  return shape.atoms.map((a: AtomSpot) => ({
    element: a.element,
    x: copy.x + a.x * unit * copy.grown,
    y: copy.y + a.y * unit * copy.grown,
    r: a.r * unit * copy.grown,
  }));
}

/** Every atom on one side, molecule by molecule, copy by copy. */
export function sideAtoms(picture: Picture, side: Side): AtomAt[] {
  return picture.columns
    .filter((c) => c.side === side)
    .flatMap((c) => c.copies.flatMap((copy) => atomsAt(c.shape, copy, picture.unit)));
}

/**
 * Each atom on the left and where it goes on the right: the k-th atom of an element on the left
 * becomes the k-th of that element on the right. Only for a balanced equation (else some atom
 * would have nowhere to go, or come from nowhere): the pairs then use every atom exactly once.
 */
export function pairsOf(picture: Picture): { from: AtomAt; to: AtomAt }[] {
  const left = sideAtoms(picture, Side.Reactants);
  const right = sideAtoms(picture, Side.Products);
  const taken = new Map<string, number>();
  return left.flatMap((from) => {
    const k = taken.get(from.element) ?? 0;
    taken.set(from.element, k + 1);
    const to = right.filter((a) => a.element === from.element)[k];
    return to === undefined ? [] : [{ from, to }];
  });
}

/** How long, as a share of the whole flight, the last atom waits after the first sets off. */
const STAGGER = 0.55;

/** Where the j-th of n flying atoms is, `g` (0 to 1) through the regrouping. */
export function flightAt(
  pair: { from: AtomAt; to: AtomAt },
  j: number,
  n: number,
  g: number,
  lift: number,
): AtomAt {
  const delay = n > 1 ? (STAGGER * j) / (n - 1) : 0;
  const p = smooth(Math.max(0, Math.min(1, (g - delay) / (1 - STAGGER))));
  // Up over the arrow and down again; every other one under it, so they don't all queue.
  const arc = Math.sin(Math.PI * p) * lift * (j % 2 === 0 ? -1 : 0.6);
  const { from, to } = pair;
  if (p <= 0) return from;
  if (p >= 1) return to;
  return {
    element: from.element,
    x: from.x + (to.x - from.x) * p,
    y: from.y + (to.y - from.y) * p + arc,
    r: from.r + (to.r - from.r) * p,
  };
}

import type { Box } from "@chalk/prop";
import {
  MINUS,
  type Term,
  addLikeTerms,
  magnitudeText,
  multiply,
  termText,
  termValue,
} from "./surd";

/** One tile: the product of row `row`'s term and column `col`'s term, simplified. */
export type Tile = Term & { row: number; col: number; key: string };

/** A piece of a written line, centred at `x`. `key` is the tile it came from; `term` the result term. */
export type Token = {
  text: string;
  x: number;
  width: number;
  isSign: boolean;
  key?: string;
  term?: number;
};

export type Line = { y: number; size: number; tokens: Token[]; box: Box };

export type Layout = {
  width: number;
  height: number;
  headerY: number;
  headerSize: number;
  columns: { x: number; width: number }[];
  rows: { y: number; height: number }[];
  leftLabels: Box[];
  rightLabels: Box[];
  tiles: (Tile & { box: Box })[];
  expanded: Line;
  result: Line;
  /** The round `=` the learner taps to combine. */
  button: { x: number; y: number; r: number };
};

const PAD = 4;
const HEADER_H = 40;
const TOP_LABEL_H = 44;
const MIN_COLUMN = 58;
const MIN_ROW = 52;
const GAP = 3;

/** Roughly how wide text is in the display font, in ems. Each token is placed on its own. */
export function emWidth(text: string): number {
  let w = 0;
  for (const ch of text) {
    if (ch === " ") w += 0.25;
    else if (ch === "(" || ch === ")") w += 0.33;
    else if (ch === "²") w += 0.32;
    else if (ch === "√") w += 0.58;
    else if (ch === "+" || ch === MINUS || ch === "=" || ch === "×") w += 0.56;
    else w += 0.55;
  }
  return w;
}

/** Splits `total` among `weights` in proportion, but none smaller than `min`. */
export function share(weights: readonly number[], total: number, min: number): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  let out = weights.map((w) => (total * w) / sum);
  const small = out.map((v) => v < min);
  if (small.some((x) => x) && !small.every((x) => x)) {
    const fixed = small.filter((x) => x).length * min;
    const restWeight = weights.reduce((a, w, i) => (small[i] === true ? a : a + w), 0);
    out = weights.map((w, i) => (small[i] === true ? min : ((total - fixed) * w) / restWeight));
  } else if (small.every((x) => x)) {
    out = weights.map(() => total / weights.length);
  }
  return out;
}

/** Every tile, row-major. */
export function tilesOf(left: readonly Term[], right: readonly Term[]): Tile[] {
  return left.flatMap((a, row) =>
    right.map((b, col) => ({ ...multiply(a, b), row, col, key: `${row}-${col}` })),
  );
}

type Item = { text: string; isSign: boolean; key?: string; term?: number };

/** Items of a written sum: "=", then each term, signs between. */
function sumItems(terms: readonly (Term & { key?: string; term?: number })[]): Item[] {
  const items: Item[] = [{ text: "=", isSign: true }];
  if (terms.length === 0) items.push({ text: "0", isSign: false });
  terms.forEach((t, i) => {
    const tag = {
      ...(t.key !== undefined && { key: t.key }),
      ...(t.term !== undefined && { term: t.term }),
    };
    if (i === 0) items.push({ text: termText(t), isSign: false, ...tag });
    else {
      items.push({ text: t.coefficient < 0 ? MINUS : "+", isSign: true });
      items.push({ text: magnitudeText(t), isSign: false, ...tag });
    }
  });
  return items;
}

/** Lays items out on one line centred at `centre`, shrinking the type until it fits `max`. */
function line(items: readonly Item[], y: number, size: number, centre: number, edge: number): Line {
  const max = edge - 2 * PAD;
  const gapEm = 0.38;
  const total = (s: number) =>
    items.reduce((a, it) => a + emWidth(it.text) * s, 0) + gapEm * s * (items.length - 1);
  let fitted = size;
  while (fitted > 11 && total(fitted) > max) fitted -= 0.5;
  const width = total(fitted);
  const left = Math.min(Math.max(centre - width / 2, PAD), edge - PAD - width);
  let x = left;
  const tokens: Token[] = items.map((it) => {
    const w = emWidth(it.text) * fitted;
    const token: Token = { ...it, x: x + w / 2, width: w };
    x += w + gapEm * fitted;
    return token;
  });
  return {
    y,
    size: fitted,
    tokens,
    box: { x: left - 4, y: y - fitted, width: width + 8, height: fitted * 1.35 },
  };
}

/** Where everything is drawn at this width. Pure: the view and `locate` both use it. */
export function layoutOf(left: readonly Term[], right: readonly Term[], width: number): Layout {
  const leftChars = Math.max(...left.map((t) => emWidth(termText(t))));
  const labelColumn = Math.min(92, Math.max(46, leftChars * 20 + 16));
  const gridX = labelColumn;
  const gridY = HEADER_H + TOP_LABEL_H;
  const gridWidth = Math.max(MIN_COLUMN * right.length, width - gridX - PAD);
  const colWeights = right.map((t) => Math.abs(termValue(t)));
  const rowWeights = left.map((t) => Math.abs(termValue(t)));
  const colSum = colWeights.reduce((a, b) => a + b, 0);
  const rowSum = rowWeights.reduce((a, b) => a + b, 0);
  const maxHeight = left.length === 1 ? 130 : 220;
  const gridHeight = Math.min(
    maxHeight,
    Math.max(MIN_ROW * left.length, (gridWidth * rowSum) / colSum),
  );
  const colWidths = share(colWeights, gridWidth, MIN_COLUMN);
  const rowHeights = share(rowWeights, gridHeight, MIN_ROW);

  let cx = gridX;
  const columns = colWidths.map((w) => {
    const c = { x: cx, width: w };
    cx += w;
    return c;
  });
  let cy = gridY;
  const rows = rowHeights.map((h) => {
    const r = { y: cy, height: h };
    cy += h;
    return r;
  });

  const tiles = tilesOf(left, right).map((t) => {
    const c = columns[t.col] ?? { x: gridX, width: gridWidth };
    const r = rows[t.row] ?? { y: gridY, height: gridHeight };
    return {
      ...t,
      box: {
        x: c.x + GAP / 2,
        y: r.y + GAP / 2,
        width: c.width - GAP,
        height: r.height - GAP,
      },
    };
  });

  const rightLabels = columns.map((c) => ({
    x: c.x + 2,
    y: HEADER_H,
    width: c.width - 4,
    height: TOP_LABEL_H - 4,
  }));
  const leftLabels = rows.map((r) => ({
    x: 0,
    y: r.y,
    width: labelColumn - 6,
    height: r.height,
  }));

  const gridBottom = gridY + gridHeight;
  const centre = gridX + gridWidth / 2;
  const expanded = line(sumItems(tiles), gridBottom + 34, 19, centre, width);
  const terms = addLikeTerms(tiles).map((t, term) => ({ ...t, term }));
  const result = line(sumItems(terms), expanded.y + 50, 30, centre, width);
  const button = { x: centre, y: result.y - 11, r: 24 };

  return {
    width,
    height: result.y + 16,
    headerY: 27,
    headerSize: 21,
    columns,
    rows,
    leftLabels,
    rightLabels,
    tiles,
    expanded,
    result,
    button,
  };
}

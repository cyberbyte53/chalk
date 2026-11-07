import { type DrawnObject, type Rule, area, intersect, union } from "./objects";
import type { Word } from "./read";
import type { Box } from "./schema";

/**
 * A figure's and a table's box from what the PDF drew (platform/docs/plans/sources.md, round 2): the
 * reader draws a rough box by eye; `snap` makes it the box of the PDF's own objects in it with its
 * words, and `tableCells` reads a table's cells from its drawn rules. Both only measure: they raise
 * issues for the reader to fix or answer, and judge nothing.
 */

export const SnapIssue = {
  /** An object runs over the rough box's edge: the figure would be cut off. */
  Crosses: "crosses",
  /** Nothing drawn in the rough box: a figure of words alone, or a box in the wrong place. */
  NoObjects: "no objects",
} as const;
export type SnapIssue = (typeof SnapIssue)[keyof typeof SnapIssue];

export const TableIssue = {
  /** Fewer than two horizontal and two vertical rules: the reader marks its rows. */
  NoRules: "no rules",
} as const;
export type TableIssue = (typeof TableIssue)[keyof typeof TableIssue];

export type Snapped = {
  /** The objects' box with the words in the rough box: the crop. */
  box: Box;
  /** The objects inside the rough box or crossing its edge. */
  objects: DrawnObject[];
  /** The words in the rough box (the caption and the figure's labels), in the order given. */
  words: Word[];
  issues: { kind: SnapIssue; question: string }[];
};

/** A line's box has no area: measured as if half a point thick. */
const thick = (b: Box): Box => [b[0] - 0.25, b[1] - 0.25, b[2] + 0.25, b[3] + 0.25];
/** How much of `b` is inside `a`, 0 to 1. */
const shareIn = (a: Box, b: Box) => area(intersect(a, thick(b))) / area(thick(b));
const centreIn = (b: Box, w: Word) => {
  const [x, y] = [(w.x0 + w.x1) / 2, (w.y0 + w.y1) / 2];
  return x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3];
};
const boxOfWord = (w: Word): Box => [w.x0, w.y0, w.x1, w.y1];
const round = (b: Box) => `[${b.map(Math.round).join(", ")}]`;

/**
 * Less of an object than this inside the rough box is a neighbour's reaching into it (a panel's
 * border, a column's rule), not the figure's.
 */
const SOME = 0.5;
/** An object sticking out of the rough box by less than this (points) is inside it. */
const STICKS_OUT = 3;
/**
 * A panel the figure sits on surrounds the rough box with room to spare (or holds other blocks'
 * words outside it, below): past two opposite edges,
 * each by more than this share of the box's size that way (and at least `STICKS_OUT`). A figure's own
 * drawing is inside the box or sticks out of it a little (a photo the box was drawn just inside).
 */
const ROOM = 0.25;

/** Whether an object surrounds the rough box with room to spare on two opposite sides. */
function surrounds(rough: Box, b: Box): boolean {
  const [w, h] = [rough[2] - rough[0], rough[3] - rough[1]];
  const past = (by: number, size: number) => by > Math.max(STICKS_OUT, ROOM * size);
  return (
    (past(rough[0] - b[0], w) && past(b[2] - rough[2], w)) ||
    (past(rough[1] - b[1], h) && past(b[3] - rough[3], h))
  );
}

/** The parts of `b` outside `rough`: up to four strips. */
function outsideOf(rough: Box, b: Box): Box[] {
  const across: Box[] = [
    [b[0], b[1], Math.min(b[2], rough[0]), b[3]],
    [Math.max(b[0], rough[2]), b[1], b[2], b[3]],
  ];
  const down: Box[] = [
    [b[0], b[1], b[2], Math.min(b[3], rough[1])],
    [b[0], Math.max(b[1], rough[3]), b[2], b[3]],
  ];
  // A strip is out of the box along one axis; along the other it can be a line's no width.
  return [...across.filter((s) => s[2] - s[0] > 0.5), ...down.filter((s) => s[3] - s[1] > 0.5)];
}

/**
 * The box of the objects inside or crossing the rough box, with the words whose middle is in it
 * (pass the figure's own words, or the page's); an issue for each object crossing the rough box's
 * edge (the figure cut off), none for a panel the figure sits on (one surrounding the rough box).
 * A panel is an object that surrounds the rough box with room to spare, or holds words of other
 * blocks outside it (`others`: a box's heading, its paragraph).
 * `shows`, when given, says whether a part of the page shows anything (from its image): an object
 * whose part outside shows nothing (a photo's white margin) is not cut off.
 */
export function snap(
  rough: Box,
  objects: readonly DrawnObject[],
  words: readonly Word[],
  page: { shows?: (part: Box) => boolean; others?: readonly Word[] } = {},
): Snapped {
  const { shows, others = [] } = page;
  const holdsOthers = (b: Box) => others.some((w) => centreIn(b, w) && !centreIn(rough, w));
  const issues: Snapped["issues"] = [];
  const kept: DrawnObject[] = [];
  for (const o of objects) {
    const share = shareIn(rough, o.box);
    if (share < SOME) continue;
    const out = Math.max(
      rough[0] - o.box[0],
      rough[1] - o.box[1],
      o.box[2] - rough[2],
      o.box[3] - rough[3],
    );
    if (out <= STICKS_OUT) {
      kept.push(o);
      continue;
    }
    if (surrounds(rough, o.box) || holdsOthers(o.box)) continue;
    kept.push(o);
    if (shows !== undefined && !outsideOf(rough, o.box).some(shows)) continue;
    issues.push({
      kind: SnapIssue.Crosses,
      question: `${o.kind} ${round(o.box)} runs ${Math.round(out)} points over the rough box ${round(rough)}'s edge: is the figure cut off?`,
    });
  }
  const inside = words.filter((w) => centreIn(rough, w));
  const boxes = [...kept.map((o) => o.box), ...inside.map(boxOfWord)];
  if (kept.length === 0)
    issues.push({
      kind: SnapIssue.NoObjects,
      question: `nothing is drawn in the rough box ${round(rough)}: a figure of words alone, or a box in the wrong place?`,
    });
  const box = boxes.reduce<Box | undefined>(
    (a, b) => (a === undefined ? b : union(a, b)),
    undefined,
  );
  return { box: box ?? rough, objects: kept, words: inside, issues };
}

export type Cell = {
  /** Its first row and column, from 0, and how many it spans. */
  row: number;
  column: number;
  rows: number;
  columns: number;
  box: Box;
  /** Its words in reading order (lines top to bottom, each left to right). */
  words: Word[];
  text: string;
};

export type Table = {
  rows: number;
  columns: number;
  /** Row by row, each row left to right, a merged cell once (at its first row and column). */
  cells: Cell[];
  /** The words in the rough box outside every cell: the caption, a note. */
  outside: Word[];
  issues: { kind: TableIssue; question: string }[];
};

/** Rules this near (points) are the same line. */
const SAME_LINE = 2;
/** A boundary is drawn when rules cover this much of it. */
const DRAWN = 0.5;

type Line = { at: number; spans: [number, number][] };

/** Rules along one axis grouped into lines: where each is, and the stretches it is drawn over. */
function lines(rules: readonly Rule[], horizontal: boolean): Line[] {
  const items = rules
    .map((r) =>
      horizontal
        ? { at: (r[1] + r[3]) / 2, from: r[0], to: r[2] }
        : { at: (r[0] + r[2]) / 2, from: r[1], to: r[3] },
    )
    .sort((a, b) => a.at - b.at);
  const out: Line[] = [];
  for (const it of items) {
    const last = out.at(-1);
    if (last !== undefined && it.at - last.at <= SAME_LINE) last.spans.push([it.from, it.to]);
    else out.push({ at: it.at, spans: [[it.from, it.to]] });
  }
  return out;
}

/** How much of `[from, to]` a line's spans cover, 0 to 1. */
function covered(line: Line, from: number, to: number): number {
  const parts = line.spans
    .map(([a, b]): [number, number] => [Math.max(a, from), Math.min(b, to)])
    .filter(([a, b]) => b > a)
    .sort((p, q) => p[0] - q[0]);
  let total = 0;
  let end = from;
  for (const [a, b] of parts) {
    total += Math.max(0, b - Math.max(a, end));
    end = Math.max(end, b);
  }
  return to > from ? total / (to - from) : 0;
}

/** Words in reading order: lines (middles within half a word's height) top to bottom, each left to right. */
function readingOrder(words: readonly Word[]): Word[] {
  const byTop = [...words].sort((a, b) => a.y0 + a.y1 - (b.y0 + b.y1));
  const rows: Word[][] = [];
  for (const w of byTop) {
    const row = rows.at(-1);
    const first = row?.[0];
    const mid = (w.y0 + w.y1) / 2;
    if (
      row !== undefined &&
      first !== undefined &&
      Math.abs(mid - (first.y0 + first.y1) / 2) < (first.y1 - first.y0) / 2
    )
      row.push(w);
    else rows.push([w]);
  }
  return rows.flatMap((r) => r.sort((a, b) => a.x0 - b.x0));
}

/**
 * A table's cells from its drawn rules (the horizontal and vertical lines in the rough box): the grid
 * of every line, two neighbours merged where no rule is drawn between them (a cell spanning columns
 * or rows), a line drawn nowhere between cells dropped (an underline); each word placed in the cell
 * holding its middle. A table without rules: no cells, an issue for the reader to mark its rows.
 */
export function tableCells(
  rough: Box,
  objects: readonly DrawnObject[],
  words: readonly Word[],
): Table {
  const near: Box = [
    rough[0] - SAME_LINE,
    rough[1] - SAME_LINE,
    rough[2] + SAME_LINE,
    rough[3] + SAME_LINE,
  ];
  const rules = objects.flatMap((o) => o.rules).filter((r) => shareIn(near, r) > 0.5);
  const flat = (r: Rule) => r[3] - r[1] <= r[2] - r[0];
  let hs = lines(rules.filter(flat), true);
  let vs = lines(
    rules.filter((r) => !flat(r)),
    false,
  );
  const inRough = words.filter((w) => centreIn(rough, w));
  const none = (): Table => ({
    rows: 0,
    columns: 0,
    cells: [],
    outside: inRough,
    issues: [
      {
        kind: TableIssue.NoRules,
        question: `the table in ${round(rough)} has ${hs.length} horizontal and ${vs.length} vertical rules: mark its rows`,
      },
    ],
  });
  if (hs.length < 2 || vs.length < 2) return none();

  // Lines between cells drawn nowhere (an underline, a tick) are dropped, until none is.
  for (let changed = true; changed; ) {
    changed = false;
    const keepH = hs.filter(
      (h, i) =>
        i === 0 ||
        i === hs.length - 1 ||
        vs.slice(1).some((v, j) => covered(h, vs[j]?.at ?? 0, v.at) >= DRAWN),
    );
    const keepV = vs.filter(
      (v, j) =>
        j === 0 ||
        j === vs.length - 1 ||
        hs.slice(1).some((h, i) => covered(v, hs[i]?.at ?? 0, h.at) >= DRAWN),
    );
    changed = keepH.length !== hs.length || keepV.length !== vs.length;
    hs = keepH;
    vs = keepV;
  }
  if (hs.length < 2 || vs.length < 2) return none();

  const [R, C] = [hs.length - 1, vs.length - 1];
  const parent = Array.from({ length: R * C }, (_, k) => k);
  const find = (k: number): number => {
    let r = k;
    while (parent[r] !== r) r = parent[r] ?? r;
    parent[k] = r;
    return r;
  };
  const join = (a: number, b: number) => {
    parent[find(b)] = find(a);
  };
  const at = (i: number) => hs[i]?.at ?? 0;
  const xt = (j: number) => vs[j]?.at ?? 0;
  for (let i = 0; i < R; i += 1)
    for (let j = 0; j < C; j += 1) {
      const v = vs[j + 1];
      if (j + 1 < C && v !== undefined && covered(v, at(i), at(i + 1)) < DRAWN)
        join(i * C + j, i * C + j + 1);
      const h = hs[i + 1];
      if (i + 1 < R && h !== undefined && covered(h, xt(j), xt(j + 1)) < DRAWN)
        join(i * C + j, (i + 1) * C + j);
    }
  const groups = new Map<number, number[]>();
  for (let k = 0; k < R * C; k += 1) groups.set(find(k), [...(groups.get(find(k)) ?? []), k]);

  const used = new Set<Word>();
  const cells: Cell[] = [...groups.values()]
    .map((ks) => {
      const rowsOf = ks.map((k) => Math.floor(k / C));
      const colsOf = ks.map((k) => k % C);
      const [r0, r1, c0, c1] = [
        Math.min(...rowsOf),
        Math.max(...rowsOf),
        Math.min(...colsOf),
        Math.max(...colsOf),
      ];
      const box: Box = [xt(c0), at(r0), xt(c1 + 1), at(r1 + 1)];
      const mine = readingOrder(words.filter((w) => !used.has(w) && centreIn(box, w)));
      for (const w of mine) used.add(w);
      return {
        row: r0,
        column: c0,
        rows: r1 - r0 + 1,
        columns: c1 - c0 + 1,
        box,
        words: mine,
        text: mine.map((w) => w.text).join(" "),
      };
    })
    .sort((a, b) => a.row - b.row || a.column - b.column);
  return { rows: R, columns: C, cells, outside: inRough.filter((w) => !used.has(w)), issues: [] };
}

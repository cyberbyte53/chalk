import { z } from "zod";
import { type Words, bracketTex, clean, isRounded, numTex, round } from "./numbers";

/**
 * The statistics of grouped data, NCERT Ch14: class marks, the mean by the direct, assumed-mean
 * and step-deviation methods, the mode, cumulative frequencies, the median and the ogives. Plain
 * numbers; every formula is the textbook's.
 */

/** One row of a frequency table: the class lo – hi (or a single value x = lo when ungrouped). */
export const rowSchema = z
  .object({
    lo: z.number().min(-1e7).max(1e7),
    hi: z.number().min(-1e7).max(1e7),
    f: z.number().int().min(0).max(1e6),
    /** What the class column says instead of "lo - hi" (e.g. "Below 140"), or null. */
    label: z
      .object({ en: z.string().max(40), hi: z.string().max(40) })
      .strict()
      .nullable(),
  })
  .strict();
export type Row = z.infer<typeof rowSchema>;

/** A row with no special label. */
export const row = (lo: number, hi: number, f: number): Row => ({ lo, hi, f, label: null });

/** The rows' class column, as text. */
export function classText(r: Row, locale = "en", isGrouped = true): string {
  if (r.label !== null) return locale === "hi" ? r.label.hi : r.label.en;
  return isGrouped ? `${numTex(r.lo)} - ${numTex(r.hi)}` : numTex(r.lo);
}

/** The class mark (upper + lower) / 2; for ungrouped data the value itself. */
export const classMark = (r: Row, isGrouped = true): number =>
  isGrouped ? clean((r.lo + r.hi) / 2) : r.lo;

export const totalOf = (rows: readonly Row[]): number => rows.reduce((t, r) => t + r.f, 0);

export const Method = { Direct: "direct", Assumed: "assumed", Step: "step" } as const;
export type Method = (typeof Method)[keyof typeof Method];

/** Σfᵢxᵢ / Σfᵢ: the mean (all three methods give this). */
export function meanOf(rows: readonly Row[], isGrouped = true): number {
  const n = totalOf(rows);
  if (n === 0) return 0;
  return clean(rows.reduce((t, r) => t + r.f * classMark(r, isGrouped), 0) / n);
}

/** The middle class mark, NCERT's usual assumed mean. */
export function middleMark(rows: readonly Row[], isGrouped = true): number {
  const marks = rows.map((r) => classMark(r, isGrouped));
  return marks[Math.floor((marks.length - 1) / 2)] ?? 0;
}

/** The class size of the first class (NCERT's h), or 1 for ungrouped data. */
export const classSize = (rows: readonly Row[]): number => {
  const first = rows[0];
  return first === undefined ? 1 : clean(first.hi - first.lo) || 1;
};

/** Every column the mean table can show, worked out. */
export type MeanColumns = {
  x: number[];
  fx: number[];
  d: number[];
  fd: number[];
  u: number[];
  fu: number[];
  sumF: number;
  sumFX: number;
  sumFD: number;
  sumFU: number;
};

export function meanColumns(
  rows: readonly Row[],
  a: number,
  h: number,
  isGrouped = true,
): MeanColumns {
  const x = rows.map((r) => classMark(r, isGrouped));
  const fx = rows.map((r, i) => clean(r.f * (x[i] ?? 0)));
  const d = x.map((v) => clean(v - a));
  const fd = rows.map((r, i) => clean(r.f * (d[i] ?? 0)));
  const u = d.map((v) => clean(v / (h || 1)));
  const fu = rows.map((r, i) => clean(r.f * (u[i] ?? 0)));
  const sum = (xs: number[]) => clean(xs.reduce((t, v) => t + v, 0));
  return {
    x,
    fx,
    d,
    fd,
    u,
    fu,
    sumF: totalOf(rows),
    sumFX: sum(fx),
    sumFD: sum(fd),
    sumFU: sum(fu),
  };
}

const eqOr = (x: number) => (isRounded(x) ? "\\approx" : "=");

/** The working for the mean by a method, as TeX lines. */
export function meanWorking(
  rows: readonly Row[],
  method: Method,
  a: number,
  h: number,
  isGrouped = true,
): string[] {
  const c = meanColumns(rows, a, h, isGrouped);
  const mean = meanOf(rows, isGrouped);
  if (method === Method.Direct)
    return [
      `\\bar{x} = \\frac{\\Sigma f_i x_i}{\\Sigma f_i} = \\frac{${numTex(c.sumFX)}}{${c.sumF}} ${eqOr(mean)} ${numTex(mean)}`,
    ];
  if (method === Method.Assumed) {
    const dbar = clean(c.sumFD / c.sumF);
    return [
      `\\bar{x} = a + \\frac{\\Sigma f_i d_i}{\\Sigma f_i} = ${numTex(a)} + \\frac{${bracketTex(c.sumFD)}}{${c.sumF}}`,
      `= ${numTex(a)} + ${bracketTex(dbar)} ${eqOr(mean)} ${numTex(mean)}`,
    ];
  }
  const ubar = clean(c.sumFU / c.sumF);
  return [
    `\\bar{x} = a + h\\left(\\frac{\\Sigma f_i u_i}{\\Sigma f_i}\\right) = ${numTex(a)} + ${numTex(h)} \\times \\frac{${bracketTex(c.sumFU)}}{${c.sumF}}`,
    `= ${numTex(a)} + ${bracketTex(clean(h * ubar))} ${eqOr(mean)} ${numTex(mean)}`,
  ];
}

/** The index of the modal class (the first with the highest frequency). */
export function modalIndex(rows: readonly Row[]): number {
  let best = 0;
  rows.forEach((r, i) => {
    if (r.f > (rows[best]?.f ?? -1)) best = i;
  });
  return best;
}

/** The pieces of the mode formula: l, h, f₁, f₀, f₂. */
export type ModeParts = { l: number; h: number; f1: number; f0: number; f2: number };
export function modeParts(rows: readonly Row[]): ModeParts {
  const i = modalIndex(rows);
  const r = rows[i] as Row;
  return {
    l: r.lo,
    h: clean(r.hi - r.lo),
    f1: r.f,
    f0: rows[i - 1]?.f ?? 0,
    f2: rows[i + 1]?.f ?? 0,
  };
}

/** Mode = l + (f₁ − f₀) / (2f₁ − f₀ − f₂) × h. */
export function modeOf(rows: readonly Row[]): number {
  const { l, h, f1, f0, f2 } = modeParts(rows);
  const den = 2 * f1 - f0 - f2;
  return den === 0 ? l : clean(l + ((f1 - f0) / den) * h);
}

export function modeWorking(rows: readonly Row[]): string[] {
  const { l, h, f1, f0, f2 } = modeParts(rows);
  const mode = modeOf(rows);
  return [
    "\\text{Mode} = l + \\left(\\frac{f_1 - f_0}{2f_1 - f_0 - f_2}\\right) \\times h",
    `= ${numTex(l)} + \\left(\\frac{${f1} - ${f0}}{2 \\times ${f1} - ${f0} - ${f2}}\\right) \\times ${numTex(h)}`,
    `${eqOr(mode)} ${numTex(mode)}`,
  ];
}

/** Less-than cumulative frequencies: cf of each class (frequencies so far). */
export function cumulative(rows: readonly Row[]): number[] {
  let t = 0;
  return rows.map((r) => {
    t += r.f;
    return t;
  });
}

/** More-than cumulative frequencies: how many are at or above each class's lower limit. */
export function cumulativeMore(rows: readonly Row[]): number[] {
  const n = totalOf(rows);
  let before = 0;
  return rows.map((r) => {
    const at = n - before;
    before += r.f;
    return at;
  });
}

/** Frequencies back from less-than cumulative frequencies (NCERT Example 7). */
export function frequenciesFrom(cf: readonly number[]): number[] {
  return cf.map((c, i) => c - (i === 0 ? 0 : (cf[i - 1] ?? 0)));
}

/** The median class: the first whose cumulative frequency is more than n/2 (or reaches it). */
export function medianIndex(rows: readonly Row[]): number {
  const half = totalOf(rows) / 2;
  const cf = cumulative(rows);
  const i = cf.findIndex((c) => c > half);
  return i === -1 ? rows.length - 1 : i;
}

export type MedianParts = { l: number; n: number; cf: number; f: number; h: number };
export function medianParts(rows: readonly Row[]): MedianParts {
  const i = medianIndex(rows);
  const r = rows[i] as Row;
  return {
    l: r.lo,
    n: totalOf(rows),
    cf: cumulative(rows)[i - 1] ?? 0,
    f: r.f,
    h: clean(r.hi - r.lo),
  };
}

/** Median = l + (n/2 − cf) / f × h. */
export function medianOf(rows: readonly Row[]): number {
  const { l, n, cf, f, h } = medianParts(rows);
  return f === 0 ? l : clean(l + ((n / 2 - cf) / f) * h);
}

export function medianWorking(rows: readonly Row[]): string[] {
  const { l, n, cf, f, h } = medianParts(rows);
  const median = medianOf(rows);
  return [
    "\\text{Median} = l + \\left(\\frac{\\frac{n}{2} - cf}{f}\\right) \\times h",
    `= ${numTex(l)} + \\left(\\frac{${numTex(n / 2)} - ${cf}}{${f}}\\right) \\times ${numTex(h)}`,
    `${eqOr(median)} ${numTex(median)}`,
  ];
}

/** The less-than ogive's points: (upper limit, cumulative frequency). */
export function lessThanPoints(rows: readonly Row[]): [number, number][] {
  const cf = cumulative(rows);
  return rows.map((r, i) => [r.hi, cf[i] ?? 0]);
}

/** The more-than ogive's points: (lower limit, how many at or above it). */
export function moreThanPoints(rows: readonly Row[]): [number, number][] {
  const cf = cumulativeMore(rows);
  return rows.map((r, i) => [r.lo, cf[i] ?? 0]);
}

/**
 * Where a rising curve (joined points) reaches height y: its x, by straight lines between the
 * points. For the less-than ogive and y = n/2 this is exactly the median formula.
 */
export function xAtHeight(points: readonly [number, number][], y: number): number | null {
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1] as [number, number];
    const [x1, y1] = points[i] as [number, number];
    if ((y0 <= y && y <= y1) || (y1 <= y && y <= y0)) {
      if (y1 === y0) return x0;
      return clean(x0 + ((y - y0) / (y1 - y0)) * (x1 - x0));
    }
  }
  return null;
}

/** Where the two ogives cross (they meet at height n/2, over the median). */
export function ogiveCrossing(rows: readonly Row[]): [number, number] | null {
  const half = totalOf(rows) / 2;
  const x = xAtHeight(lessThanPoints(rows), half);
  return x === null ? null : [x, clean(half)];
}

/** The empirical relationship NCERT notes: 3 Median = Mode + 2 Mean. */
export const empiricalMedian = (mode: number, mean: number): number => clean((mode + 2 * mean) / 3);

/** Words used in the tables. */
export const STAT_WORDS = {
  total: { en: "Total", hi: "योग" },
  classInterval: { en: "Class", hi: "वर्ग" },
  frequency: { en: "f", hi: "f" },
  cf: { en: "cf", hi: "cf" },
} as const satisfies Record<string, Words>;

/** For the derived values: a number rounded the NCERT way. */
export const ncert = (x: number) => round(x, 2);

/** The row at index i (the first row if i is out of range; tables always have rows). */
export const rowAt = (rows: readonly Row[], i: number): Row => rows[i] ?? (rows[0] as Row);

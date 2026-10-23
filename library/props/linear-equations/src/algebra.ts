import Fraction from "fraction.js";

/**
 * The maths of a pair of linear equations, exactly. A line is a₁x + b₁y + c₁ = 0 (NCERT's general
 * form); its coefficients are stored as numbers and worked with as fractions, so 0.2, 24/5 and 1/3
 * stay exact and "equal ratios" means equal, not nearly equal.
 */

/** ax + by + c = 0, with a and b not both 0. */
export type Line = { readonly a: number; readonly b: number; readonly c: number };
export type Point = readonly [number, number];

/** How the two lines of a pair sit (NCERT Fig 3.1). */
export const Relation = {
  Intersecting: "intersecting",
  Parallel: "parallel",
  Coincident: "coincident",
} as const;
export type Relation = (typeof Relation)[keyof typeof Relation];

/** What that means for the equations (NCERT 3.3). */
export const Consistency = {
  /** Exactly one solution. */
  Consistent: "consistent",
  /** No solution. */
  Inconsistent: "inconsistent",
  /** Infinitely many solutions (and so consistent). */
  Dependent: "dependent",
} as const;
export type Consistency = (typeof Consistency)[keyof typeof Consistency];

/** How the ratios compare: a₁/a₂ ≠ b₁/b₂; a₁/a₂ = b₁/b₂ ≠ c₁/c₂; or all three equal. */
export const RatioTest = {
  Unequal: "a≠b",
  EqualButC: "a=b≠c",
  AllEqual: "a=b=c",
} as const;
export type RatioTest = (typeof RatioTest)[keyof typeof RatioTest];

/** A number as an exact fraction (0.2 → 1/5; 4.8 → 24/5). */
export const frac = (n: number | Fraction): Fraction =>
  n instanceof Fraction ? n : new Fraction(n);

/** Fraction parts are bigints; these read them. */
export const isZero = (f: Fraction): boolean => f.n === 0n;
export const isWhole = (f: Fraction): boolean => f.d === 1n;
export const isNegative = (f: Fraction): boolean => f.s < 0n && f.n !== 0n;

/** a₁b₂ − a₂b₁: zero exactly when the lines are parallel or the same. */
export function determinant(l1: Line, l2: Line): Fraction {
  return frac(l1.a).mul(l2.b).sub(frac(l2.a).mul(l1.b));
}

export function relationOf(l1: Line, l2: Line): Relation {
  if (!isZero(determinant(l1, l2))) return Relation.Intersecting;
  // Same direction: the same line exactly when c is in the same proportion as a and b.
  const ac = frac(l1.a).mul(l2.c).sub(frac(l2.a).mul(l1.c));
  const bc = frac(l1.b).mul(l2.c).sub(frac(l2.b).mul(l1.c));
  return isZero(ac) && isZero(bc) ? Relation.Coincident : Relation.Parallel;
}

export function consistencyOf(relation: Relation): Consistency {
  return relation === Relation.Intersecting
    ? Consistency.Consistent
    : relation === Relation.Parallel
      ? Consistency.Inconsistent
      : Consistency.Dependent;
}

/** The one common solution (cross-multiplication), or null when there isn't exactly one. */
export function solutionOf(l1: Line, l2: Line): [Fraction, Fraction] | null {
  const det = determinant(l1, l2);
  if (isZero(det)) return null;
  const x = frac(l1.b).mul(l2.c).sub(frac(l2.b).mul(l1.c)).div(det);
  const y = frac(l1.c).mul(l2.a).sub(frac(l2.c).mul(l1.a)).div(det);
  return [x, y];
}

/** a₁/a₂, b₁/b₂, c₁/c₂, each null when its bottom is 0. */
export function ratiosOf(
  l1: Line,
  l2: Line,
): { a: Fraction | null; b: Fraction | null; c: Fraction | null } {
  const r = (top: number, bottom: number) => (bottom === 0 ? null : frac(top).div(bottom));
  return { a: r(l1.a, l2.a), b: r(l1.b, l2.b), c: r(l1.c, l2.c) };
}

/** Which of NCERT's three ratio cases the pair is in (it follows from the relation). */
export function ratioTestOf(l1: Line, l2: Line): RatioTest {
  const relation = relationOf(l1, l2);
  return relation === Relation.Intersecting
    ? RatioTest.Unequal
    : relation === Relation.Parallel
      ? RatioTest.EqualButC
      : RatioTest.AllEqual;
}

/** ax + by + c at a point: 0 means the point is on the line. */
export function leftSide(line: Line, x: number, y: number): Fraction {
  return frac(line.a).mul(x).add(frac(line.b).mul(y)).add(line.c);
}

export const isOnLine = (line: Line, x: number, y: number): boolean => isZero(leftSide(line, x, y));

/** y on the line at x (null for a vertical line). */
export function yAt(line: Line, x: number): Fraction | null {
  if (line.b === 0) return null;
  return frac(line.c).add(frac(line.a).mul(x)).neg().div(line.b);
}

/** x on the line at y (null for a horizontal line). */
export function xAt(line: Line, y: number): Fraction | null {
  if (line.a === 0) return null;
  return frac(line.c).add(frac(line.b).mul(y)).neg().div(line.a);
}

/** The line through two different points, with whole coefficients in lowest terms, a > 0 (or b > 0). */
export function lineThrough(p: Point, q: Point): Line {
  const [px, py] = [frac(p[0]), frac(p[1])];
  const [qx, qy] = [frac(q[0]), frac(q[1])];
  const a = qy.sub(py);
  const b = px.sub(qx);
  const c = a.mul(px).add(b.mul(py)).neg();
  // Clear the denominators, then divide out the common factor.
  const gcdBig = (x: bigint, y: bigint): bigint => {
    let [u, v] = [x < 0n ? -x : x, y < 0n ? -y : y];
    while (v) [u, v] = [v, u % v];
    return u;
  };
  const scale = [a, b, c].reduce((m, f) => (m * f.d) / gcdBig(m, f.d), 1n);
  let whole = [a, b, c].map((f) => (f.s * f.n * scale) / f.d);
  const g = whole.reduce((m, v) => gcdBig(m, v), 0n) || 1n;
  whole = whole.map((v) => v / g);
  const [A, B] = whole as [bigint, bigint, bigint];
  if (A < 0n || (A === 0n && B < 0n)) whole = whole.map((v) => -v);
  const [a1, b1, c1] = whole.map((v) => Number(v) + 0) as [number, number, number];
  return { a: a1, b: b1, c: c1 };
}

export type Window = {
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
};

const inWindow = (w: Window, x: number, y: number) =>
  x >= w.xMin && x <= w.xMax && y >= w.yMin && y <= w.yMax;

/**
 * Two points on the line to hold it by, the way NCERT's tables pick them: whole-number points in
 * view, preferring where it meets the axes and far apart. Falls back to any two points in view.
 */
export function handlesOf(line: Line, w: Window): [Point, Point] {
  const lattice: Point[] = [];
  const xs = Math.ceil(w.xMin);
  const xe = Math.floor(w.xMax);
  if (line.b === 0) {
    // A vertical line x = k: hold it a quarter of the way in from the bottom and the top.
    const x = xAt(line, 0)?.valueOf() ?? 0;
    const tall = w.yMax - w.yMin;
    return [
      [x, Math.round(w.yMin + tall * 0.25)],
      [x, Math.round(w.yMin + tall * 0.75)],
    ];
  }
  for (let x = xs; x <= xe; x++) {
    const y = yAt(line, x);
    if (y !== null && isWhole(y) && inWindow(w, x, y.valueOf())) lattice.push([x, y.valueOf()]);
  }
  if (lattice.length >= 2) {
    // First the point on the y-axis (x = 0) or the x-axis (y = 0); then the other axis point, or
    // else the nearest whole-number point at least 2 away (NCERT's (0, 5) and (4, 2)).
    const first = [...lattice].sort(
      (p, q) => score(q) - score(p) || Math.abs(p[0]) - Math.abs(q[0]),
    )[0] as Point;
    const others = lattice.filter((p) => p !== first);
    const outside = (p: Point) => (p[0] < 0 || p[1] < 0 ? 1 : 0);
    const apart = others
      .filter((p) => dist(p, first) >= 2)
      .sort((p, q) => dist(p, first) - dist(q, first) || outside(p) - outside(q));
    const onAxis = apart.find((p) => p[0] === 0 || p[1] === 0);
    const partner = onAxis ?? apart[0] ?? (others[0] as Point);
    return [first, partner];
  }
  // No two whole-number points in view: two points a quarter in from each side.
  const x1 = w.xMin + (w.xMax - w.xMin) * 0.25;
  const x2 = w.xMin + (w.xMax - w.xMin) * 0.75;
  return [
    [x1, yAt(line, x1)?.valueOf() ?? 0],
    [x2, yAt(line, x2)?.valueOf() ?? 0],
  ];
}

const score = (p: Point) => (p[0] === 0 ? 2 : 0) + (p[1] === 0 ? 1 : 0);
const dist = (p: Point, q: Point) => Math.hypot(p[0] - q[0], p[1] - q[1]);

/** Where the line meets an axis: the x-axis (y = 0) or the y-axis (x = 0); null if it never does. */
export function meetsAxis(line: Line, axis: "x" | "y"): [Fraction, Fraction] | null {
  if (axis === "x") {
    const x = xAt(line, 0);
    return x === null ? null : [x, frac(0)];
  }
  const y = yAt(line, 0);
  return y === null ? null : [frac(0), y];
}

/** The triangle two intersecting lines make with an axis (NCERT Ex 3.2 Q7), or null. */
export function triangleWith(l1: Line, l2: Line, axis: "x" | "y"): [Fraction, Fraction][] | null {
  const meet = solutionOf(l1, l2);
  const p = meetsAxis(l1, axis);
  const q = meetsAxis(l2, axis);
  if (meet === null || p === null || q === null) return null;
  if (p[0].equals(q[0]) && p[1].equals(q[1])) return null;
  return [meet, p, q];
}

/* ---- writing numbers and equations ---- */

/** A fraction as TeX: 3, −2, \frac{19}{29}, −\frac{1}{3}. */
export function fracTex(f: Fraction | number): string {
  const v = frac(f);
  if (isWhole(v)) return `${isNegative(v) ? "-" : ""}${v.n}`;
  return `${isNegative(v) ? "-" : ""}\\frac{${v.n}}{${v.d}}`;
}

/** A fraction as plain text: 3, −2, 19/29. */
export function fracText(f: Fraction | number): string {
  const v = frac(f);
  const body = isWhole(v) ? `${v.n}` : `${v.n}/${v.d}`;
  return `${isNegative(v) ? "−" : ""}${body}`;
}

/** A number for a table or a label: whole numbers as they are, others as a short fraction. */
export const niceText = (n: number): string => fracText(frac(n).simplify(1e-9));

type Term = { coefficient: Fraction; name: string };

/**
 * Terms joined the book's way: 2x + 3y, x − 2y, −x + 5, 0. A term's coefficient 1 is not written;
 * a zero term is left out. `tex` decides the minus sign and fractions.
 */
export function joinTerms(terms: Term[], tex: boolean): string {
  const minus = tex ? "-" : "−";
  const shown = terms.filter((t) => !isZero(t.coefficient));
  if (shown.length === 0) return "0";
  return shown
    .map((t, i) => {
      const isMinus = isNegative(t.coefficient);
      const size = t.coefficient.abs();
      const number = tex ? fracTex(size) : fracText(size);
      const body = t.name === "" ? number : size.equals(1) ? t.name : `${number}${t.name}`;
      if (i === 0) return isMinus ? `${minus}${body}` : body;
      return isMinus ? ` ${minus} ${body}` : ` + ${body}`;
    })
    .join("");
}

/** How an equation is written: a₁x + b₁y = k (the book's word problems) or a₁x + b₁y + c₁ = 0. */
export const EquationForm = { Equals: "equals", General: "general" } as const;
export type EquationForm = (typeof EquationForm)[keyof typeof EquationForm];

export function equationOf(
  line: Line,
  names: readonly [string, string],
  form: EquationForm,
  tex: boolean,
): string {
  const [x, y] = names;
  if (form === EquationForm.General) {
    const left = joinTerms(
      [
        { coefficient: frac(line.a), name: x },
        { coefficient: frac(line.b), name: y },
        { coefficient: frac(line.c), name: "" },
      ],
      tex,
    );
    return `${left} = 0`;
  }
  const left = joinTerms(
    [
      { coefficient: frac(line.a), name: x },
      { coefficient: frac(line.b), name: y },
    ],
    tex,
  );
  const k = frac(line.c).neg();
  return `${left} = ${tex ? fracTex(k) : fracText(k)}`;
}

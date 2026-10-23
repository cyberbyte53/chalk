/**
 * Polynomials as coefficient lists, highest power first: x² − 2x − 3 is [1, −2, −3]. The laws every
 * prop in this package shares: evaluating, multiplying out from zeroes, finding real zeroes, and
 * writing a polynomial the textbook's way.
 */

/** Coefficients, highest power first. The first is never 0 (except for the zero polynomial, []). */
export type Poly = readonly number[];

/** How close two numbers must be to count as equal (the props work on a 0.5 grid and small integers). */
export const EPS = 1e-9;

export function degreeOf(p: Poly): number {
  return Math.max(0, p.length - 1);
}

/** Drops leading zeros: [0, 0, 1, 2] → [1, 2]. */
export function trim(p: Poly): number[] {
  const start = p.findIndex((c) => Math.abs(c) > EPS);
  return start === -1 ? [] : p.slice(start).map(clean);
}

/** p(x), by Horner's rule. */
export function valueAt(p: Poly, x: number): number {
  return p.reduce((acc, c) => acc * x + c, 0);
}

export function derivativeOf(p: Poly): number[] {
  const n = degreeOf(p);
  return p.slice(0, -1).map((c, i) => c * (n - i));
}

export function times(p: Poly, q: Poly): number[] {
  if (p.length === 0 || q.length === 0) return [];
  const out = new Array<number>(p.length + q.length - 1).fill(0);
  p.forEach((a, i) => {
    q.forEach((b, j) => {
      out[i + j] = (out[i + j] ?? 0) + a * b;
    });
  });
  return out.map(clean);
}

/** k(x − z₁)(x − z₂)…, multiplied out. */
export function fromZeroes(leading: number, zeroes: readonly number[]): number[] {
  return zeroes.reduce<number[]>((p, z) => times(p, [1, -z]), [leading]);
}

/** a(x − h)² + k, multiplied out. */
export function fromVertex(leading: number, h: number, k: number): number[] {
  return [leading, -2 * leading * h, leading * h * h + k].map(clean);
}

/** Rounds away float noise: 2.9999999999 → 3, 1e-17 → 0. */
export function clean(x: number): number {
  const r = Math.round(x * 1e9) / 1e9;
  return Object.is(r, -0) ? 0 : r;
}

/** A real zero and how many times it repeats (2 where the graph touches the axis). */
export type Zero = { x: number; multiplicity: number };

/**
 * Every real zero, smallest first, with its multiplicity. Between two neighbouring turning points
 * a polynomial is monotonic, so it crosses the axis at most once there: bisect each such stretch,
 * and check each turning point itself for a zero the graph only touches.
 */
export function realZeroes(p: Poly): Zero[] {
  const q = trim(p);
  const n = degreeOf(q);
  if (n === 0) return [];
  const lead = q[0] ?? 1;
  if (n === 1) return [{ x: clean(-(q[1] ?? 0) / lead), multiplicity: 1 }];
  const bound = 1 + Math.max(...q.slice(1).map((c) => Math.abs(c / lead)));
  const turning = realZeroes(derivativeOf(q)).map((z) => z.x);
  const marks = [-bound, ...turning, bound];
  const found: number[] = [];
  for (let i = 0; i < marks.length - 1; i++) {
    const lo = marks[i] ?? 0;
    const hi = marks[i + 1] ?? 0;
    const flo = valueAt(q, lo);
    const fhi = valueAt(q, hi);
    if (Math.abs(flo) < 1e-9) found.push(lo);
    if (flo * fhi < 0) found.push(bisect(q, lo, hi));
  }
  if (Math.abs(valueAt(q, bound)) < 1e-9) found.push(bound);
  const distinct = [...new Set(found.map(snapNice))].sort((a, b) => a - b);
  return distinct.map((x) => ({ x, multiplicity: multiplicityAt(q, x) }));
}

function bisect(p: Poly, lo: number, hi: number): number {
  let a = lo;
  let b = hi;
  const fa = valueAt(p, a);
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2;
    const fm = valueAt(p, m);
    if (fm === 0) return m;
    if (Math.sign(fm) === Math.sign(fa)) a = m;
    else b = m;
  }
  return (a + b) / 2;
}

/** How many of p, p′, p″, … vanish at x. */
function multiplicityAt(p: Poly, x: number): number {
  let count = 0;
  let d: Poly = p;
  while (d.length > 1 && Math.abs(valueAt(d, x)) < 1e-6 * Math.max(1, ...d.map(Math.abs))) {
    count++;
    d = derivativeOf(d);
  }
  return Math.max(1, count);
}

/** A float that is really a fraction or surd, made exact enough to compare: 0.4999999999 → 0.5. */
function snapNice(x: number): number {
  const nice = niceNumber(x);
  return nice.isExact ? nice.value : clean(x);
}

/** Every real zero listed with repeats: (x − 1)²(x + 2) → [−2, 1, 1]. */
export function zeroesWithRepeats(p: Poly): number[] {
  return realZeroes(p).flatMap((z) => Array.from({ length: z.multiplicity }, () => z.x));
}

/** A number as the book would write it: an integer, a fraction, a surd, or 2 decimals. */
export type Nice = {
  value: number;
  /** In LaTeX: "-\frac{3}{2}", "2 + \sqrt{3}". */
  tex: string;
  /** In plain text: "−3/2", "2 + √3". */
  text: string;
  /** False when it is only a 2-decimal approximation. */
  isExact: boolean;
};

const MINUS = "−";

export function niceNumber(x: number): Nice {
  if (Math.abs(x - Math.round(x)) < 1e-7) {
    const n = Math.round(x);
    return { value: n, tex: String(n), text: n < 0 ? `${MINUS}${-n}` : String(n), isExact: true };
  }
  for (let d = 2; d <= 12; d++) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < 1e-7) {
      const sign = n < 0 ? "-" : "";
      return {
        value: n / d,
        tex: `${sign}\\frac{${Math.abs(n)}}{${d}}`,
        text: `${n < 0 ? MINUS : ""}${Math.abs(n)}/${d}`,
        isExact: true,
      };
    }
  }
  // m ± √n, m ± k√n or ±√(n/d), with m an integer or half: what quadratics with integer
  // coefficients give.
  for (const m of [
    0,
    ...Array.from({ length: 40 }, (_, i) => (i % 2 === 0 ? 1 : -1) * Math.ceil((i + 1) / 2) * 0.5),
  ]) {
    const r = x - m;
    const sq = r * r;
    for (const d of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      const n = Math.round(sq * d * d);
      if (n <= 0 || Math.abs(n / (d * d) - sq) > 1e-7) continue;
      const root = Math.sqrt(n);
      if (Math.abs(root - Math.round(root)) < 1e-9) continue;
      const [rootK, inside] = simplifyRoot(n);
      // (k√m)/d with k and d sharing a factor is not in lowest terms: 3√15/9 is √15/3.
      const common = gcd(rootK, d);
      const k = rootK / common;
      const den = d / common;
      const coefTex = k === 1 ? "" : String(k);
      const surdTex = `${coefTex}\\sqrt{${inside}}`;
      const surdText = `${k === 1 ? "" : k}√${inside}`;
      const tex = den === 1 ? surdTex : `\\frac{${surdTex}}{${den}}`;
      const text = den === 1 ? surdText : `${surdText}/${den}`;
      const mNice = m === 0 ? null : niceNumber(m);
      const sign = r < 0 ? "-" : "+";
      const textSign = r < 0 ? MINUS : "+";
      if (mNice === null) {
        return {
          value: x,
          tex: r < 0 ? `-${tex}` : tex,
          text: r < 0 ? `${MINUS}${text}` : text,
          isExact: true,
        };
      }
      return {
        value: x,
        tex: `${mNice.tex} ${sign} ${tex}`,
        text: `${mNice.text} ${textSign} ${text}`,
        isExact: true,
      };
    }
  }
  const rounded = Math.round(x * 100) / 100;
  return {
    value: x,
    tex: String(rounded),
    text: rounded < 0 ? `${MINUS}${-rounded}` : String(rounded),
    isExact: false,
  };
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/** √n as k√m with m square-free: 12 → [2, 3]. */
function simplifyRoot(n: number): [number, number] {
  let k = 1;
  let m = n;
  for (let f = 2; f * f <= m; f++) {
    while (m % (f * f) === 0) {
      k *= f;
      m /= f * f;
    }
  }
  return [k, m];
}

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (k: number) => [...String(k)].map((d) => SUPERSCRIPT[Number(d)]).join("");

/** A polynomial in LaTeX, the book's way: 2x^{2} - 8x + 6, with fractions and surds. */
export function polyTex(p: Poly, variable = "x"): string {
  return writePoly(
    p,
    variable,
    (c) => niceNumber(c).tex,
    (k) => (k === 1 ? variable : `${variable}^{${k}}`),
    "-",
  );
}

/** A polynomial in plain text: 2x² − 8x + 6. */
export function polyText(p: Poly, variable = "x"): string {
  return writePoly(
    p,
    variable,
    (c) => niceNumber(c).text,
    (k) => (k === 1 ? variable : `${variable}${sup(k)}`),
    MINUS,
  );
}

function writePoly(
  p: Poly,
  _variable: string,
  number: (c: number) => string,
  power: (k: number) => string,
  minus: string,
): string {
  const q = trim(p);
  if (q.length === 0) return "0";
  const n = degreeOf(q);
  const parts: string[] = [];
  q.forEach((c, i) => {
    if (Math.abs(c) < EPS) return;
    const k = n - i;
    const size = Math.abs(c);
    const isOne = Math.abs(size - 1) < EPS;
    const body = k === 0 ? number(size) : `${isOne ? "" : number(size)}${power(k)}`;
    const isFirst = parts.length === 0;
    const isNegative = c < 0;
    parts.push(
      isFirst ? `${isNegative ? minus : ""}${body}` : `${isNegative ? minus : "+"} ${body}`,
    );
  });
  return parts.join(" ");
}

/** k(x − z₁)(x − z₂)… in LaTeX, with repeated factors as powers: (x - 1)^{2}(x + 2). */
export function factoredTex(leading: number, zeroes: readonly number[], variable = "x"): string {
  const counts = new Map<number, number>();
  for (const z of zeroes) counts.set(clean(z), (counts.get(clean(z)) ?? 0) + 1);
  const factors = [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([z, m]) => {
      const inner =
        z === 0 ? variable : `${variable} ${z > 0 ? "-" : "+"} ${niceNumber(Math.abs(z)).tex}`;
      const factor = z === 0 && m === 1 ? variable : `(${inner})`;
      return m === 1 ? factor : `${factor}^{${m}}`;
    });
  const k =
    Math.abs(leading - 1) < EPS ? "" : Math.abs(leading + 1) < EPS ? "-" : niceNumber(leading).tex;
  return `${k}${factors.join("")}` || k || "1";
}

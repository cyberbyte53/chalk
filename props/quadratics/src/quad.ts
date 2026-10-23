/**
 * The maths of quadratic equations: discriminant, roots (exact when the coefficients are whole
 * numbers), factor pairs for splitting the middle term, and TeX for all of it.
 */

/** Words a prop shows itself, in both languages. */
export type Words = { readonly en: string; readonly hi: string };
export const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

/** Rounds away floating dust: 0.30000000000000004 → 0.3, −0 → 0. */
export function clean(x: number): number {
  const r = Math.round(x * 1e9) / 1e9;
  return Object.is(r, -0) ? 0 : r;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

export const isWhole = (x: number) => Number.isInteger(x);

/** b² − 4ac. */
export function discriminant(a: number, b: number, c: number): number {
  return clean(b * b - 4 * a * c);
}

export const Nature = { TwoDistinct: "twoDistinct", TwoEqual: "twoEqual", None: "none" } as const;
export type Nature = (typeof Nature)[keyof typeof Nature];

export function natureOf(d: number): Nature {
  return d > 0 ? Nature.TwoDistinct : d === 0 ? Nature.TwoEqual : Nature.None;
}

export const NATURE_WORDS: Record<Nature, Words> = {
  [Nature.TwoDistinct]: { en: "two different real roots", hi: "दो भिन्न वास्तविक मूल" },
  [Nature.TwoEqual]: { en: "two equal real roots", hi: "दो बराबर वास्तविक मूल" },
  [Nature.None]: { en: "no real roots", hi: "कोई वास्तविक मूल नहीं" },
};

/** The real roots of ax² + bx + c = 0, smallest first; a repeated root appears twice. */
export function realRoots(a: number, b: number, c: number): number[] {
  if (a === 0) return b === 0 ? [] : [clean(-c / b)];
  const d = discriminant(a, b, c);
  if (d < 0) return [];
  const r = Math.sqrt(d);
  const one = clean((-b - r) / (2 * a));
  const two = clean((-b + r) / (2 * a));
  return one <= two ? [one, two] : [two, one];
}

/** √n = k√m with m square-free (n a whole number ≥ 0). */
export function simplifySqrt(n: number): [number, number] {
  if (n === 0) return [0, 1];
  let k = 1;
  let m = n;
  for (let f = 2; f * f <= m; f++) {
    while (m % (f * f) === 0) {
      m /= f * f;
      k *= f;
    }
  }
  return [k, m];
}

/** A fraction p/q in TeX, reduced, the sign in front: −\frac{3}{2}, 12, \frac{1}{4}. */
export function fracTex(p: number, q: number): string {
  if (q === 0) return "\\infty";
  const sign = p * q < 0 ? "-" : "";
  const g = gcd(p, q) || 1;
  const n = Math.abs(p) / g;
  const d = Math.abs(q) / g;
  return d === 1 ? `${sign}${n}` : `${sign}\\frac{${n}}{${d}}`;
}

/** The same as plain text: −3/2. */
export function fracText(p: number, q: number): string {
  const sign = p * q < 0 ? "−" : "";
  const g = gcd(p, q) || 1;
  const n = Math.abs(p) / g;
  const d = Math.abs(q) / g;
  return d === 1 ? `${sign}${n}` : `${sign}${n}/${d}`;
}

/** A number for display: whole numbers as they are, others to 2 decimal places. */
export function numText(x: number): string {
  const v = clean(x);
  const t = isWhole(v) ? String(Math.abs(v)) : Math.abs(v).toFixed(2).replace(/0$/, "");
  return v < 0 ? `−${t}` : t;
}
export function numTex(x: number): string {
  const v = clean(x);
  const t = isWhole(v) ? String(Math.abs(v)) : Math.abs(v).toFixed(2).replace(/0$/, "");
  return v < 0 ? `-${t}` : t;
}

/**
 * The roots in exact form, as TeX, when a, b, c are whole numbers: ["1", "\frac{3}{2}"], or
 * ["\frac{3 + \sqrt{19}}{5}", "\frac{3 - \sqrt{19}}{5}"]. Equal roots come twice. None: [].
 * Otherwise decimals.
 */
export function rootsTex(a: number, b: number, c: number): string[] {
  const d = discriminant(a, b, c);
  if (a === 0 || d < 0) return realRoots(a, b, c).map(numTex);
  if (!(isWhole(a) && isWhole(b) && isWhole(c))) return realRoots(a, b, c).map(numTex);
  const [k, m] = simplifySqrt(d);
  if (m === 1) {
    // Rational roots: (−b ± k) / 2a, smallest first.
    const lo = -b - k;
    const hi = -b + k;
    return a > 0
      ? [fracTex(lo, 2 * a), fracTex(hi, 2 * a)]
      : [fracTex(hi, 2 * a), fracTex(lo, 2 * a)];
  }
  // (−b ± k√m) / 2a, with the common factor of b, k and 2a taken out.
  let p = -b;
  let q = k;
  let den = 2 * a;
  if (den < 0) {
    p = -p;
    den = -den;
  }
  const g = gcd(gcd(p, q), den) || 1;
  p /= g;
  q /= g;
  den /= g;
  const root = q === 1 ? `\\sqrt{${m}}` : `${q}\\sqrt{${m}}`;
  const top = (sign: "+" | "-") =>
    p === 0 ? `${sign === "-" ? "-" : ""}${root}` : `${p} ${sign} ${root}`;
  const wrap = (t: string) => (den === 1 ? t : `\\frac{${t}}{${den}}`);
  return [wrap(top("-")), wrap(top("+"))];
}

/** ax² + bx + c in TeX, the textbook's way (2x^2 + x - 300, x^2 - 9, -5t^2 + 20t). */
export function quadTex(a: number, b: number, c: number, v = "x"): string {
  const terms: string[] = [];
  const add = (coef: number, body: string) => {
    if (coef === 0) return;
    const abs = Math.abs(coef);
    const shown = body !== "" && abs === 1 ? "" : numTex(abs);
    const sign = coef < 0 ? "-" : "+";
    terms.push(
      terms.length === 0 ? `${coef < 0 ? "-" : ""}${shown}${body}` : ` ${sign} ${shown}${body}`,
    );
  };
  add(a, `${v}^2`);
  add(b, v);
  add(c, "");
  return terms.length === 0 ? "0" : terms.join("");
}

/** The same as plain text: 2x² + x − 300. */
export function quadText(a: number, b: number, c: number, v = "x"): string {
  return quadTex(a, b, c, v).replace(/\^2/g, "²").replace(/ - /g, " − ").replace(/^-/, "−");
}

/** A linear factor (px + q) in TeX: (2x - 3), (x + 12). */
export function linearTex(p: number, q: number, v = "x"): string {
  const lead = p === 1 ? "" : p === -1 ? "-" : String(p);
  if (q === 0) return `${lead}${v}`;
  return `(${lead}${v} ${q < 0 ? "-" : "+"} ${Math.abs(q)})`;
}

/**
 * Every pair (p, q) of whole numbers with p × q = n, as the middle-term splitter offers them:
 * for each divisor d ≤ √|n|, the pair (d, n/d) and (−d, −n/d). n = 0 gives no pairs here.
 */
export function factorPairs(n: number): [number, number][] {
  if (!isWhole(n) || n === 0) return [];
  const pairs: [number, number][] = [];
  const m = Math.abs(n);
  for (let d = 1; d * d <= m; d++) {
    if (m % d !== 0) continue;
    pairs.push([d, n / d]);
    pairs.push([-d, -n / d]);
  }
  return pairs;
}

/** The pair that splits bx for ax² + bx + c: p × q = ac and p + q = b. Null if none. */
export function splitPair(a: number, b: number, c: number): [number, number] | null {
  if (!(isWhole(a) && isWhole(b) && isWhole(c)) || a === 0) return null;
  if (c === 0) return null;
  return factorPairs(a * c).find(([p, q]) => p + q === b) ?? null;
}

/**
 * The working once the middle term is split as px + qx: the two groups, the factors and the roots.
 * ax² + px + qx + c = g₁x(rx + s) + g₂(rx + s) = (g₁x + g₂)(rx + s).
 */
export type SplitWorking = {
  /** 2x^2 - 2x - 3x + 3 */
  split: string;
  /** 2x(x - 1) - 3(x - 1) */
  grouped: string;
  /** (2x - 3)(x - 1) */
  factored: string;
  /** Each factor's root, in factor order, as TeX. */
  roots: [string, string];
  /** As numbers. */
  values: [number, number];
};

export function splitWorking(
  a: number,
  p: number,
  q: number,
  c: number,
  v = "x",
): SplitWorking | null {
  if (a === 0 || p * q !== a * c) return null;
  let g1 = gcd(a, p) || Math.abs(a);
  if (a < 0) g1 = -g1;
  const r = a / g1;
  const s = p / g1;
  if (q % r !== 0) return null;
  const g2 = q / r;
  if (g2 * s !== c) return null;
  const termsTex = (coef: number, body: string, first: boolean) => {
    const abs = Math.abs(coef);
    const shown = body !== "" && abs === 1 ? "" : String(abs);
    if (first) return `${coef < 0 ? "-" : ""}${shown}${body}`;
    return ` ${coef < 0 ? "-" : "+"} ${shown}${body}`;
  };
  const split =
    termsTex(a, `${v}^2`, true) +
    termsTex(p, v, false) +
    termsTex(q, v, false) +
    termsTex(c, "", false);
  const inner = linearTex(r, s, v);
  const lead = g1 === 1 ? v : g1 === -1 ? `-${v}` : `${g1}${v}`;
  const second = `${g2 < 0 ? " - " : " + "}${Math.abs(g2) === 1 ? "" : Math.abs(g2)}`;
  const grouped = `${lead}${inner}${second}${inner}`;
  const factored = `${linearTex(g1, g2, v)}${inner}`;
  return {
    split,
    grouped,
    factored,
    roots: [fracTex(-g2, g1), fracTex(-s, r)],
    values: [clean(-g2 / g1), clean(-s / r)],
  };
}

/** (x + b/2)² − (b/2)², for completing the square on x² + bx. */
export function completedTex(b: number, v = "x"): string {
  const inside = b < 0 ? `${v} - ${fracTex(-b, 2)}` : `${v} + ${fracTex(b, 2)}`;
  return `\\left(${inside}\\right)^2 - ${fracTex(b * b, 4)}`;
}

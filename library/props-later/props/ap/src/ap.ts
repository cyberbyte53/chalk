/**
 * The maths of arithmetic progressions: terms, differences, the nth term, which term a value is,
 * and sums. Plain numbers, cleaned of floating dust; exact fractions only where a lesson asks
 * "is n a whole number?".
 */

/** Words a prop shows itself, in both languages. */
export type Words = { readonly en: string; readonly hi: string };
export const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

/** Rounds away floating dust: 0.30000000000000004 → 0.3, −0 → 0. */
export function clean(x: number): number {
  const r = Math.round(x * 1e9) / 1e9;
  return Object.is(r, -0) ? 0 : r;
}

export const isWhole = (x: number): boolean => Number.isInteger(clean(x));

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** A number as the page shows it: up to 4 decimals, a true minus sign, Indian grouping of thousands. */
export function numText(x: number): string {
  const v = clean(x);
  const abs = Math.abs(v);
  const t = isWhole(abs)
    ? abs.toLocaleString("en-IN")
    : abs.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return v < 0 ? `−${t}` : t;
}

/** The same for TeX: an ASCII minus, no grouping commas (KaTeX spaces them oddly). */
export function numTex(x: number): string {
  const v = clean(x);
  const abs = Math.abs(v);
  const t = isWhole(abs) ? String(abs) : abs.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return v < 0 ? `-${t}` : t;
}

/** A difference with its sign always shown: +3, −30, +0. */
export function signedText(x: number): string {
  const v = clean(x);
  return v < 0 ? numText(v) : `+${numText(v)}`;
}

/** A number in brackets when negative, for substituting into a formula: 5 → 5, −3 → (−3). */
export function bracketTex(x: number): string {
  return clean(x) < 0 ? `(${numTex(x)})` : numTex(x);
}

/** The nth term a + (n − 1)d. */
export function termOf(a: number, d: number, n: number): number {
  return clean(a + (n - 1) * d);
}

/** The first `count` terms of the AP with first term a and common difference d. */
export function termsOf(a: number, d: number, count: number): number[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) => termOf(a, d, i + 1));
}

/** Each term minus the one before it: a₂ − a₁, a₃ − a₂, … */
export function differences(values: readonly number[]): number[] {
  return values.slice(1).map((v, i) => clean(v - (values[i] as number)));
}

/** Whether a list is an AP: every difference the same. A list of one or two numbers always is. */
export function isAP(values: readonly number[]): boolean {
  const diffs = differences(values);
  return diffs.every((x) => Math.abs(x - (diffs[0] as number)) < 1e-9);
}

/** The index (0-based, into the differences) of the first difference that breaks the pattern, or null. */
export function firstBreak(values: readonly number[]): number | null {
  const diffs = differences(values);
  const i = diffs.findIndex((x) => Math.abs(x - (diffs[0] as number)) >= 1e-9);
  return i < 0 ? null : i;
}

/** Sₙ = n/2 [2a + (n − 1)d]. */
export function sumOf(a: number, d: number, n: number): number {
  return clean((n / 2) * (2 * a + (n - 1) * d));
}

/** How many decimal places a number needs (up to 6). */
function places(x: number): number {
  for (let k = 0; k <= 6; k++) if (isWhole(x * 10 ** k)) return k;
  return 6;
}

/** An exact fraction p/q in lowest terms, q > 0. */
export type Fraction = { p: number; q: number };

/**
 * Which term the value is: n with a + (n − 1)d = value, i.e. n = (value − a)/d + 1, exactly, as a
 * fraction. Null when d = 0 (every term is a, so the question has no single answer).
 */
export function nFor(a: number, d: number, value: number): Fraction | null {
  if (clean(d) === 0) return null;
  const k = Math.max(places(a), places(d), places(value));
  const s = 10 ** k;
  let p = Math.round((value - a) * s) + Math.round(d * s);
  let q = Math.round(d * s);
  if (q < 0) [p, q] = [-p, -q];
  const g = gcd(p, q) || 1;
  return { p: p / g, q: q / g };
}

/** A fraction as text: 35, 151/3, −2. */
export function fracText(f: Fraction): string {
  return f.q === 1 ? numText(f.p) : `${numText(f.p)}/${f.q}`;
}

/** A fraction as TeX: 35, \frac{151}{3}, -\frac{1}{2}. */
export function fracTex(f: Fraction): string {
  if (f.q === 1) return numTex(f.p);
  const sign = f.p < 0 ? "-" : "";
  return `${sign}\\frac{${Math.abs(f.p)}}{${f.q}}`;
}

/** Whether the value is a term of the AP: n is a positive whole number. */
export function isTermValue(a: number, d: number, value: number): boolean {
  if (clean(d) === 0) return clean(value - a) === 0;
  const f = nFor(a, d, value);
  return f !== null && f.q === 1 && f.p >= 1;
}

/** The general form of term k (1-based) as text: a, a + d, a + 2d, … */
export function generalText(k: number): string {
  if (k <= 1) return "a";
  if (k === 2) return "a + d";
  return `a + ${k - 1}d`;
}

/** English ordinals: 1st, 2nd, 3rd, 11th, 22nd. */
export function ordinal(n: number): string {
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 13) return `${n}th`;
  const m = n % 10;
  return `${n}${m === 1 ? "st" : m === 2 ? "nd" : m === 3 ? "rd" : "th"}`;
}

/** "the 35th term" / "35वाँ पद". */
export function termName(locale: string, n: number): string {
  return locale === "hi" ? `${n}वाँ पद` : `the ${ordinal(n)} term`;
}

/** Subscript digits for labels drawn in SVG: a₁₂. */
export function sub(n: number | string): string {
  const map = "₀₁₂₃₄₅₆₇₈₉";
  return String(n)
    .replace(/[0-9]/g, (c) => map[Number(c)] as string)
    .replace(/n/g, "ₙ");
}

/** A value with its unit: ₹8,500 or 45 cm. Units that are symbols (₹) go first. */
export function withUnit(x: number, unit: string): string {
  if (unit === "") return numText(x);
  if (unit === "₹") return x < 0 ? `−₹${numText(-x)}` : `₹${numText(x)}`;
  return `${numText(x)} ${unit}`;
}

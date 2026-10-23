/**
 * Shared number helpers for the statistics and probability props: words in two languages, numbers
 * cleaned of floating dust, rounding the way NCERT prints answers (two decimals), and exact
 * fractions for probabilities.
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

/** Rounded to `places` decimals (NCERT gives answers to 2). */
export function round(x: number, places = 2): number {
  const k = 10 ** places;
  return clean(Math.round(clean(x) * k) / k);
}

/** A number as the page shows it: up to `places` decimals, a true minus sign. */
export function numText(x: number, places = 2): string {
  const v = round(x, places);
  const abs = Math.abs(v);
  const t = isWhole(abs) ? String(abs) : abs.toFixed(places).replace(/0+$/, "").replace(/\.$/, "");
  return v < 0 ? `−${t}` : t;
}

/** The same for TeX: an ASCII minus. */
export function numTex(x: number, places = 2): string {
  return numText(x, places).replace("−", "-");
}

/** In brackets when negative, for substituting into a formula. */
export function bracketTex(x: number, places = 2): string {
  return round(x, places) < 0 ? `(${numTex(x, places)})` : numTex(x, places);
}

/** Whether rounding to `places` lost anything (so the page writes ≈, not =). */
export const isRounded = (x: number, places = 2): boolean => round(x, places) !== clean(x);

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** A fraction in lowest terms. */
export type Fraction = { readonly num: number; readonly den: number };
export function simplify(num: number, den: number): Fraction {
  if (den === 0) return { num: 0, den: 1 };
  const g = gcd(num, den) || 1;
  const sign = den < 0 ? -1 : 1;
  return { num: (sign * num) / g, den: (sign * den) / g };
}

/** A fraction as TeX: 5/36 → \frac{5}{36}; 0 → 0; 1 → 1. */
export function fracTex(f: Fraction): string {
  if (f.num === 0) return "0";
  if (f.den === 1) return String(f.num);
  return `\\frac{${f.num}}{${f.den}}`;
}

/** A fraction as plain text: 5/36, 0, 1. */
export function fracText(f: Fraction): string {
  if (f.num === 0) return "0";
  if (f.den === 1) return String(f.num);
  return `${f.num}/${f.den}`;
}

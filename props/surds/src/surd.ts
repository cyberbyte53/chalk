/** coefficient × √radicand. Radicand 1 is a rational term. Both whole numbers. */
export type Term = { coefficient: number; radicand: number };

export const MINUS = "−";

/** n = outside² × inside with inside square-free, by trial division. n ≥ 1. */
export function simplifyRoot(n: number): { outside: number; inside: number } {
  let outside = 1;
  let inside = n;
  for (let p = 2; p * p <= inside; p++) {
    while (inside % (p * p) === 0) {
      inside /= p * p;
      outside *= p;
    }
  }
  return { outside, inside };
}

/** The product of two terms, simplified: √2·√8 = 4, 3√2·√6 = 6√3. */
export function multiply(a: Term, b: Term): Term {
  const { outside, inside } = simplifyRoot(a.radicand * b.radicand);
  return { coefficient: a.coefficient * b.coefficient * outside, radicand: inside };
}

/** A term with its root simplified (√8 → 2√2). */
export function simplify(t: Term): Term {
  const { outside, inside } = simplifyRoot(t.radicand);
  return { coefficient: t.coefficient * outside, radicand: inside };
}

/** Like terms (same simplified radicand) added, zeros dropped, rational first, then by radicand. */
export function addLikeTerms(terms: readonly Term[]): Term[] {
  const byRadicand = new Map<number, number>();
  for (const t of terms.map(simplify))
    byRadicand.set(t.radicand, (byRadicand.get(t.radicand) ?? 0) + t.coefficient);
  return [...byRadicand]
    .filter(([, coefficient]) => coefficient !== 0)
    .sort(([a], [b]) => a - b)
    .map(([radicand, coefficient]) => ({ coefficient, radicand }));
}

/** The size of a term without its sign: "3√2", "√5", "7". */
export function magnitudeText(t: Term): string {
  const c = Math.abs(t.coefficient);
  if (t.radicand === 1) return String(c);
  return c === 1 ? `√${t.radicand}` : `${c}√${t.radicand}`;
}

/** A term on its own, signed: "−√15", "6√3". */
export function termText(t: Term): string {
  return `${t.coefficient < 0 ? MINUS : ""}${magnitudeText(t)}`;
}

/** A sum of terms as written: "6 + 3√2 − √6"; "0" for none. */
export function sumText(terms: readonly Term[]): string {
  if (terms.length === 0) return "0";
  return terms
    .map((t, i) =>
      i === 0 ? termText(t) : `${t.coefficient < 0 ? MINUS : "+"} ${magnitudeText(t)}`,
    )
    .join(" ");
}

/** A factor as written in a product: "(√5 + √3)"; a single term bare ("√7") unless negative. */
export function factorText(terms: readonly Term[]): string {
  const first = terms[0];
  if (terms.length === 1 && first !== undefined && first.coefficient > 0) return termText(first);
  return `(${sumText(terms)})`;
}

/** The term's value as a float (for drawing sizes and for checking, never for equality). */
export function termValue(t: Term): number {
  return t.coefficient * Math.sqrt(t.radicand);
}

export function sumValue(terms: readonly Term[]): number {
  return terms.reduce((sum, t) => sum + termValue(t), 0);
}

import Fraction from "fraction.js";

/**
 * Exact polynomial arithmetic for the box, with fraction.js: coefficients stay fractions (3/2, not
 * 1.5000000001), so every cell and every remainder is exactly what the book writes.
 */

/** A term c·xᵏ. */
export type Term = { coefficient: Fraction; power: number };

/** Coefficients (highest first) as terms, zero terms left out. */
export function termsOf(coefficients: readonly number[]): Term[] {
  const n = coefficients.length - 1;
  return coefficients
    .map((c, i) => ({ coefficient: new Fraction(c), power: n - i }))
    .filter((t) => !t.coefficient.equals(0));
}

/** One cell of the box: the product of its row's term and its column's term. */
export type Cell = { row: number; column: number; term: Term };

/** Multiplying: every row term times every column term. */
export function productCells(rows: readonly Term[], columns: readonly Term[]): Cell[] {
  return rows.flatMap((r, row) =>
    columns.map((c, column) => ({
      row,
      column,
      term: { coefficient: r.coefficient.mul(c.coefficient), power: r.power + c.power },
    })),
  );
}

/** Like terms collected: the polynomial the cells add up to, highest power first. */
export function collect(terms: readonly Term[]): Term[] {
  const byPower = new Map<number, Fraction>();
  for (const t of terms)
    byPower.set(t.power, (byPower.get(t.power) ?? new Fraction(0)).add(t.coefficient));
  return [...byPower.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([power, coefficient]) => ({ coefficient, power }))
    .filter((t) => !t.coefficient.equals(0));
}

/** One step of long division: the next quotient term, and what it uses up. */
export type DivisionStep = {
  /** The quotient term found: the remaining polynomial's first term ÷ the divisor's first term. */
  quotient: Term;
  /** Its column of the box: each divisor term times the quotient term. */
  cells: Term[];
  /** What is left of the dividend after taking this column away. */
  remaining: Term[];
};

const degree = (terms: readonly Term[]) => (terms.length === 0 ? -1 : (terms[0]?.power ?? -1));

/** Takes `b` from `a`, collected. */
function minus(a: readonly Term[], b: readonly Term[]): Term[] {
  return collect([...a, ...b.map((t) => ({ coefficient: t.coefficient.neg(), power: t.power }))]);
}

/**
 * Every step of dividing `dividend` by `divisor`: stop when what is left has a smaller degree than
 * the divisor (or nothing is left). Then dividend = divisor × quotient + remainder.
 */
export function divisionSteps(
  dividend: readonly number[],
  divisor: readonly number[],
): DivisionStep[] {
  const g = termsOf(divisor);
  const lead = g[0];
  if (lead === undefined) return [];
  const steps: DivisionStep[] = [];
  let remaining = collect(termsOf(dividend));
  while (remaining.length > 0 && degree(remaining) >= lead.power) {
    const first = remaining[0];
    if (first === undefined) break;
    const quotient: Term = {
      coefficient: first.coefficient.div(lead.coefficient),
      power: first.power - lead.power,
    };
    const cells = g.map((t) => ({
      coefficient: t.coefficient.mul(quotient.coefficient),
      power: t.power + quotient.power,
    }));
    remaining = minus(remaining, cells);
    steps.push({ quotient, cells, remaining });
  }
  return steps;
}

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (k: number) => [...String(k)].map((d) => SUP[Number(d)]).join("");

/** A fraction in LaTeX: 3, -\frac{1}{2}. */
export function fractionTex(f: Fraction): string {
  const n = Number(f.s) * Number(f.n);
  const d = Number(f.d);
  if (d === 1) return String(n);
  return `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${d}}`;
}

function fractionText(f: Fraction): string {
  const n = Number(f.n);
  const d = Number(f.d);
  return `${Number(f.s) < 0 ? "−" : ""}${d === 1 ? n : `${n}/${d}`}`;
}

/** One term in LaTeX, sign included: -5x^{2}, \frac{1}{2}x, 3. */
export function termTex(t: Term, v: string): string {
  const size = t.coefficient.abs();
  const sign = Number(t.coefficient.s) < 0 ? "-" : "";
  const power = t.power === 0 ? "" : t.power === 1 ? v : `${v}^{${t.power}}`;
  const number = t.power > 0 && size.equals(1) ? "" : fractionTex(size);
  return `${sign}${number}${power}`;
}

export function termText(t: Term, v: string): string {
  const size = t.coefficient.abs();
  const sign = Number(t.coefficient.s) < 0 ? "−" : "";
  const power = t.power === 0 ? "" : t.power === 1 ? v : `${v}${sup(t.power)}`;
  const number = t.power > 0 && size.equals(1) ? "" : fractionText(size);
  return `${sign}${number}${power}`;
}

/** A polynomial (terms, highest first) in LaTeX: x^{2} - 2x - 3; "0" for none. */
export function termsTex(terms: readonly Term[], v: string): string {
  if (terms.length === 0) return "0";
  return terms
    .map((t, i) => {
      const body = termTex(t, v);
      if (i === 0) return body;
      return body.startsWith("-") ? `- ${body.slice(1)}` : `+ ${body}`;
    })
    .join(" ");
}

export function termsText(terms: readonly Term[], v: string): string {
  if (terms.length === 0) return "0";
  return terms
    .map((t, i) => {
      const body = termText(t, v);
      if (i === 0) return body;
      return body.startsWith("−") ? `− ${body.slice(1)}` : `+ ${body}`;
    })
    .join(" ");
}

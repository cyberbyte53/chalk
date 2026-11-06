/**
 * Chemical formulae, read the way a Class 10 book writes them: element symbols, counts as
 * subscripts, brackets for groups (Ca(OH)2, Pb(NO3)2). No charges, no hydrates.
 */

/** How many atoms of each element one molecule holds, in the order they first appear. */
export type AtomCounts = Readonly<Record<string, number>>;

const TOKEN = /([A-Z][a-z]?)|(\()|(\))|(\d+)/g;

/** Reads a formula into atom counts; throws on anything it can't read. */
export function atomsOf(formula: string): AtomCounts {
  const stack: Record<string, number>[] = [{}];
  const order: string[] = [];
  let last:
    | { kind: "element"; symbol: string }
    | { kind: "group"; group: Record<string, number> }
    | undefined;
  let read = 0;
  for (const match of formula.matchAll(TOKEN)) {
    if (match.index !== read) throw new Error(`Can't read the formula ${formula}`);
    read = match.index + match[0].length;
    const [, symbol, open, close, digits] = match;
    const top = stack[stack.length - 1] as Record<string, number>;
    if (symbol !== undefined) {
      top[symbol] = (top[symbol] ?? 0) + 1;
      if (!order.includes(symbol)) order.push(symbol);
      last = { kind: "element", symbol };
    } else if (open !== undefined) {
      stack.push({});
      last = undefined;
    } else if (close !== undefined) {
      if (stack.length < 2) throw new Error(`Unmatched ) in ${formula}`);
      const group = stack.pop() as Record<string, number>;
      const outer = stack[stack.length - 1] as Record<string, number>;
      for (const [el, n] of Object.entries(group)) outer[el] = (outer[el] ?? 0) + n;
      last = { kind: "group", group };
    } else if (digits !== undefined) {
      const n = Number(digits);
      if (last === undefined || n < 2) throw new Error(`A count in the wrong place in ${formula}`);
      if (last.kind === "element") top[last.symbol] = (top[last.symbol] ?? 0) + (n - 1);
      else for (const [el, m] of Object.entries(last.group)) top[el] = (top[el] ?? 0) + m * (n - 1);
      last = undefined;
    }
  }
  if (read !== formula.length || stack.length !== 1 || formula.length === 0)
    throw new Error(`Can't read the formula ${formula}`);
  const counts = stack[0] as Record<string, number>;
  return Object.fromEntries(order.map((el) => [el, counts[el] as number]));
}

/** True if the formula can be read. */
export function isFormula(formula: string): boolean {
  try {
    atomsOf(formula);
    return true;
  } catch {
    return false;
  }
}

/** The formula split into text and subscript runs, for drawing: H2SO4 → H, 2, SO, 4. */
export function formulaRuns(formula: string): { text: string; isSub: boolean; at: number }[] {
  return [...formula.matchAll(/(\d+)|([^\d]+)/g)].map((match) => ({
    text: match[0],
    isSub: match[1] !== undefined,
    at: match.index,
  }));
}

const SUB = "₀₁₂₃₄₅₆₇₈₉";
/** The formula as plain text with subscript digits (H₂SO₄), for descriptions and labels. */
export function prettyFormula(formula: string): string {
  return formula.replace(/\d/g, (d) => SUB[Number(d)] as string);
}

/** One side of an equation: formulae and how many of each. */
export type Side = readonly { formula: string; coefficient: number }[];

/** Atoms of each element on one side, counting coefficients. */
export function tallyOf(side: Side): Record<string, number> {
  const tally: Record<string, number> = {};
  for (const { formula, coefficient } of side)
    for (const [el, n] of Object.entries(atomsOf(formula)))
      tally[el] = (tally[el] ?? 0) + n * coefficient;
  return tally;
}

/** Every element in the equation, in the order it first appears (left side first). */
export function elementsOf(left: readonly string[], right: readonly string[]): string[] {
  const order: string[] = [];
  for (const formula of [...left, ...right])
    for (const el of Object.keys(atomsOf(formula))) if (!order.includes(el)) order.push(el);
  return order;
}

/** Largest coefficient a molecule can have (and the solver tries). */
export const MAX_COEFFICIENT = 6;

/**
 * The smallest whole-number coefficients that balance the equation (smallest total, then the
 * earliest formula smallest), each from 1 to MAX_COEFFICIENT, or null if none do. Left first.
 */
export function balancingCoefficients(
  left: readonly string[],
  right: readonly string[],
): number[] | null {
  const formulae = [...left, ...right];
  const elements = elementsOf(left, right);
  // Each element's atoms per molecule, positive on the left, negative on the right.
  const rows = elements.map((el) =>
    formulae.map((formula, i) => (atomsOf(formula)[el] ?? 0) * (i < left.length ? 1 : -1)),
  );
  const n = formulae.length;
  const c = new Array<number>(n).fill(1);
  const search = (i: number, rest: number): boolean => {
    if (i === n - 1) {
      if (rest < 1 || rest > MAX_COEFFICIENT) return false;
      c[i] = rest;
      return rows.every((row) => row.reduce((sum, a, j) => sum + a * (c[j] as number), 0) === 0);
    }
    for (let v = 1; v <= Math.min(MAX_COEFFICIENT, rest - (n - 1 - i)); v++) {
      c[i] = v;
      if (search(i + 1, rest - v)) return true;
    }
    return false;
  };
  // Totals in increasing order, so the first hit is the smallest.
  for (let total = n; total <= n * MAX_COEFFICIENT; total++) if (search(0, total)) return [...c];
  return null;
}

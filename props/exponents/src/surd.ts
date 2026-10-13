/**
 * Exact arithmetic for a^(m/n) along two routes. A number on a route is (p/q)^(1/k) with whole
 * numbers p, q (BigInt, coprime) and k ≥ 1; k is lowered whenever p and q are perfect powers, so a
 * value is exact (rational) exactly when k comes down to 1.
 */

export const MIN_BASE = 1;
export const MAX_BASE = 1000;
export const MAX_POWER = 6;
export const MIN_ROOT = 1;
export const MAX_ROOT = 6;
/** The biggest a^|m| either route may pass through (it has to fit a node on a phone). */
export const MAX_SHOWN = 10n ** 12n;

export const StepKind = { Root: "root", Power: "power", Reciprocal: "reciprocal" } as const;
export type StepKind = (typeof StepKind)[keyof typeof StepKind];

/** (numerator / denominator)^(1 / index). */
export type Surd = { numerator: bigint; denominator: bigint; index: number };

export type Step = {
  kind: StepKind;
  /** The symbol on the arrow: "∛", "²", "1/x". */
  operation: string;
  value: number;
  valueText: string;
  isExact: boolean;
};

/** The whole-number kth root of x if there is one, else undefined (x ≥ 0, k ≥ 1). */
export function wholeRoot(x: bigint, k: number): bigint | undefined {
  if (k === 1 || x < 2n) return x;
  // A float guess is within one of the true root for x ≤ 10¹⁸; check its neighbours exactly.
  const guess = BigInt(Math.round(Number(x) ** (1 / k)));
  for (const r of [guess - 1n, guess, guess + 1n]) if (r >= 0n && r ** BigInt(k) === x) return r;
  return undefined;
}

const PRIMES = [2, 3, 5, 7, 11, 13];

/** Lowers the index while numerator and denominator are both perfect powers of one of its factors. */
function simplify(s: Surd): Surd {
  let { numerator, denominator, index } = s;
  for (const p of PRIMES) {
    while (index % p === 0) {
      const top = wholeRoot(numerator, p);
      const bottom = wholeRoot(denominator, p);
      if (top === undefined || bottom === undefined) break;
      numerator = top;
      denominator = bottom;
      index /= p;
    }
  }
  return { numerator, denominator, index };
}

export function wholeNumber(n: number): Surd {
  return { numerator: BigInt(n), denominator: 1n, index: 1 };
}

export function rootOf(s: Surd, n: number): Surd {
  return simplify({ ...s, index: s.index * n });
}

export function powerOf(s: Surd, m: number): Surd {
  const e = BigInt(m);
  return simplify({ numerator: s.numerator ** e, denominator: s.denominator ** e, index: s.index });
}

export function reciprocalOf(s: Surd): Surd {
  return { numerator: s.denominator, denominator: s.numerator, index: s.index };
}

export function isExactSurd(s: Surd): boolean {
  return s.index === 1;
}

export function numberOf(s: Surd): number {
  return (Number(s.numerator) / Number(s.denominator)) ** (1 / s.index);
}

/** An approximate value to 4 significant figures, never in e-notation (the numbers here allow it). */
export function approximate(v: number): string {
  if (v >= 1) return v.toFixed(Math.max(0, 3 - Math.floor(Math.log10(v))));
  return v.toPrecision(4);
}

export function textOf(s: Surd): string {
  if (!isExactSurd(s)) return `≈ ${approximate(numberOf(s))}`;
  return s.denominator === 1n ? `${s.numerator}` : `${s.numerator}/${s.denominator}`;
}

const SUPERSCRIPT = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

/** A whole number in superscript digits: 12 → "¹²". */
export function superscript(n: number): string {
  return [...String(n)].map((d) => (d === "-" ? "⁻" : (SUPERSCRIPT[Number(d)] ?? d))).join("");
}

/** √, ∛, ∜, then ⁵√, ⁶√. */
export function rootSign(n: number): string {
  if (n === 2) return "√";
  if (n === 3) return "∛";
  if (n === 4) return "∜";
  return `${superscript(n)}√`;
}

export const RECIPROCAL_SIGN = "1/x";

/** Whether a^|m| fits (the biggest number either route shows). */
export function isShowable(base: number, power: number): boolean {
  return BigInt(base) ** BigInt(Math.abs(power)) <= MAX_SHOWN;
}

type Operation = { kind: StepKind; by: number };

function operationsFor(power: number, root: number, isRootFirst: boolean): Operation[] {
  const rootStep: Operation[] = root > 1 ? [{ kind: StepKind.Root, by: root }] : [];
  const m = Math.abs(power);
  const powerStep: Operation[] = m > 1 ? [{ kind: StepKind.Power, by: m }] : [];
  const reciprocal: Operation[] = power < 0 ? [{ kind: StepKind.Reciprocal, by: 1 }] : [];
  return isRootFirst
    ? [...rootStep, ...powerStep, ...reciprocal]
    : [...powerStep, ...rootStep, ...reciprocal];
}

function apply(s: Surd, op: Operation): Surd {
  if (op.kind === StepKind.Root) return rootOf(s, op.by);
  if (op.kind === StepKind.Power) return powerOf(s, op.by);
  return reciprocalOf(s);
}

function symbolOf(op: Operation): string {
  if (op.kind === StepKind.Root) return rootSign(op.by);
  if (op.kind === StepKind.Power) return superscript(op.by);
  return RECIPROCAL_SIGN;
}

/** The steps from a to a^(m/n), root first or power first, each worked out exactly. */
export function routeOf(base: number, power: number, root: number, isRootFirst: boolean): Step[] {
  let at = wholeNumber(base);
  return operationsFor(power, root, isRootFirst).map((op) => {
    at = apply(at, op);
    return {
      kind: op.kind,
      operation: symbolOf(op),
      value: numberOf(at),
      valueText: textOf(at),
      isExact: isExactSurd(at),
    };
  });
}

/** a^(m/n) itself, exactly. */
export function exponentValue(base: number, power: number, root: number): Surd {
  const raised = powerOf(wholeNumber(base), Math.abs(power));
  const rooted = rootOf(raised, root);
  return power < 0 ? reciprocalOf(rooted) : rooted;
}

/** The order the power moves along when stepped: it skips 0. */
export const POWERS: readonly number[] = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6];

/** m moved `by` places along −6 … −1, 1 … 6, held to the ends. */
export function nextPower(power: number, by: number): number {
  const at = POWERS.indexOf(power);
  const to = Math.min(POWERS.length - 1, Math.max(0, at + by));
  return POWERS[to] ?? power;
}

/** The expression as text: "27^(2/3)", "2^(−3)". */
export function expressionTextOf(base: number, power: number, root: number): string {
  const m = power < 0 ? `−${-power}` : `${power}`;
  if (root === 1) return power < 0 ? `${base}^(${m})` : `${base}^${m}`;
  return `${base}^(${m}/${root})`;
}

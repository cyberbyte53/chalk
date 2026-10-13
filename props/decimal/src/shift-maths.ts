/**
 * Recurring decimals written as whole . prefix (block repeated forever), and what multiplying by
 * powers of 10 and subtracting does to them. Exact: BigInt for anything compared for equality.
 * Pure arithmetic, no UI.
 */

/** x = whole . prefix block block block … */
export type Recurring = { readonly whole: number; readonly prefix: string; readonly block: string };

/** A fraction in lowest terms (denominator positive). */
export type Fraction = { readonly numerator: bigint; readonly denominator: bigint };

const TEN = 10n;

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}

export function reduce(numerator: bigint, denominator: bigint): Fraction {
  const g = gcd(numerator, denominator);
  if (g === 0n) return { numerator: 0n, denominator: 1n };
  const sign = denominator < 0n ? -1n : 1n;
  return { numerator: (sign * numerator) / g, denominator: (sign * denominator) / g };
}

/**
 * The digit of x at a place: place 1 is the first digit after the point, 2 the next; place 0 is the
 * units digit, -1 the tens, and so on (0 beyond the whole part's own digits). Digits as written.
 */
export function digitAt(x: Recurring, place: number): number {
  if (place >= 1) {
    const i = place - 1;
    const char =
      i < x.prefix.length ? x.prefix[i] : x.block[(i - x.prefix.length) % x.block.length];
    return Number(char ?? "0");
  }
  const whole = String(x.whole);
  return Number(whole[whole.length - 1 + place] ?? "0");
}

/** The shortest block that repeats ("33" → 1, "3535" → 2, "35" → 2). */
export function shortestPeriod(block: string): number {
  for (let d = 1; d < block.length; d++) {
    if (block.length % d !== 0) continue;
    let isPeriod = true;
    for (let i = d; i < block.length; i++) if (block[i] !== block[i - d]) isPeriod = false;
    if (isPeriod) return d;
  }
  return block.length;
}

/** x as p/q in lowest terms: (whole·10^p + prefix)·(10^b − 1) + block over (10^b − 1)·10^p. */
export function fractionOf(x: Recurring): Fraction {
  const nines = TEN ** BigInt(x.block.length) - 1n;
  const shift = TEN ** BigInt(x.prefix.length);
  const head = BigInt(x.whole) * shift + BigInt(x.prefix === "" ? "0" : x.prefix);
  return reduce(head * nines + BigInt(x.block), nines * shift);
}

/** What multiplies x on a tape or in the difference, as written on the left: "x", "100x", "99x". */
export function multipleLabel(multiple: bigint | number): string {
  return BigInt(multiple) === 1n ? "x" : `${multiple}x`;
}

/** 10^power as a BigInt. */
export function powerOfTen(power: number): bigint {
  return TEN ** BigInt(power);
}

/** The whole-number part of 10^power × x, as written (no leading zeros, at least "0"). */
export function integerText(x: Recurring, power: number): string {
  let digits = String(x.whole);
  for (let place = 1; place <= power; place++) digits += String(digitAt(x, place));
  return digits.replace(/^0+(?=\d)/, "");
}

/** `count` digits after the point of 10^power × x, as written. */
export function digitsAfterPoint(x: Recurring, power: number, count: number): string {
  let out = "";
  for (let column = 1; column <= count; column++) out += String(digitAt(x, power + column));
  return out;
}

/** How many digits after the point a tape's text shows: past the prefix, then three blocks (at least 6). */
export function digitsInText(x: Recurring, power: number): number {
  return Math.max(6, Math.max(0, x.prefix.length - power) + 3 * x.block.length);
}

/** One tape as an equation: "100x = 23.535353…". */
export function tapeText(x: Recurring, power: number): string {
  const after = digitsAfterPoint(x, power, digitsInText(x, power));
  return `${multipleLabel(powerOfTen(power))} = ${integerText(x, power)}.${after}…`;
}

/** The two tapes' tails agree forever: the shift is a positive multiple of the shortest period. */
export function areTailsLinedUp(x: Recurring, top: number, bottom: number): boolean {
  const shift = top - bottom;
  return shift > 0 && shift % shortestPeriod(x.block) === 0;
}

/**
 * The first column after the point (from 1) from which the two tapes' digits agree forever, or
 * undefined when the tails are not lined up. Column c holds x's place c + power on each tape.
 */
export function tailStart(x: Recurring, top: number, bottom: number): number | undefined {
  if (!areTailsLinedUp(x, top, bottom)) return undefined;
  // From here on both tapes are inside the repeating part, a whole number of periods apart.
  let column = Math.max(1, x.prefix.length + 1 - bottom);
  while (column > 1 && digitAt(x, column - 1 + top) === digitAt(x, column - 1 + bottom)) column--;
  return column;
}

/** (10^top − 10^bottom) × x, exactly, in lowest terms. */
export function differenceOf(x: Recurring, top: number, bottom: number): Fraction {
  const f = fractionOf(x);
  return reduce((powerOfTen(top) - powerOfTen(bottom)) * f.numerator, f.denominator);
}

/** A non-negative fraction's decimal by long division: whole part, digits, and where it repeats. */
export type Expansion = {
  whole: bigint;
  /** Digits after the point up to the end of the first repeating block (or to the last digit). */
  digits: number[];
  /** Digits before the repeating block (if it ends: how many digits it has). */
  start: number;
  /** How many digits repeat; 0 if it ends. */
  length: number;
};

export function expand(f: Fraction): Expansion {
  const whole = f.numerator / f.denominator;
  let remainder = f.numerator % f.denominator;
  const digits: number[] = [];
  const seenAt = new Map<bigint, number>();
  for (let i = 0; ; i++) {
    if (remainder === 0n) return { whole, digits, start: i, length: 0 };
    const earlier = seenAt.get(remainder);
    if (earlier !== undefined) return { whole, digits, start: earlier, length: i - earlier };
    seenAt.set(remainder, i);
    remainder *= TEN;
    digits.push(Number(remainder / f.denominator));
    remainder %= f.denominator;
  }
}

/** The digit at `place` (from 1) after the point of an expansion, using its repeat. */
export function expansionDigit(e: Expansion, place: number): number {
  const i = place - 1;
  if (i < e.digits.length) return e.digits[i] ?? 0;
  if (e.length === 0) return 0;
  return e.digits[e.start + ((i - e.start) % e.length)] ?? 0;
}

/** A fraction as a decimal: exact if it ends ("23.3", "3"), else past the prefix and three blocks, then "…". */
export function decimalText(f: Fraction): string {
  const e = expand(f);
  if (e.length === 0)
    return e.digits.length === 0 ? `${e.whole}` : `${e.whole}.${e.digits.join("")}`;
  const count = Math.max(6, e.start + 3 * e.length);
  let after = "";
  for (let place = 1; place <= count; place++) after += String(expansionDigit(e, place));
  return `${e.whole}.${after}…`;
}

/** "233/990", or "1" when the denominator is 1. */
export function fractionText(f: Fraction): string {
  return f.denominator === 1n ? `${f.numerator}` : `${f.numerator}/${f.denominator}`;
}

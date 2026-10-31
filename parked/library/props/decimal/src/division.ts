/** Long division of p by q, digit by digit. Pure arithmetic, no UI. */

export function greatestCommonDivisor(a: number, b: number): number {
  let x = a;
  let y = b;
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** Whether p/q terminates: in lowest terms, q has no prime factors other than 2 and 5. */
export function isTerminating(numerator: number, denominator: number): boolean {
  let q = denominator / greatestCommonDivisor(numerator, denominator);
  while (q % 2 === 0) q /= 2;
  while (q % 5 === 0) q /= 5;
  return q === 1;
}

/** One step: the remainder times 10, divided by q, gives a digit and the next remainder. */
export function step(remainder: number, denominator: number): { digit: number; remainder: number } {
  const dividend = remainder * 10;
  return { digit: Math.floor(dividend / denominator), remainder: dividend % denominator };
}

/** The whole part, the first `count` digits after the point, and the remainder before and after each. */
export function divide(
  numerator: number,
  denominator: number,
  count: number,
): { wholePart: number; digits: number[]; remainders: number[] } {
  const wholePart = Math.floor(numerator / denominator);
  let remainder = numerator % denominator;
  const digits: number[] = [];
  const remainders = [remainder];
  for (let i = 0; i < count; i++) {
    const next = step(remainder, denominator);
    digits.push(next.digit);
    remainder = next.remainder;
    remainders.push(remainder);
  }
  return { wholePart, digits, remainders };
}

/**
 * Where the repeating block starts (digits after the point before it) and how long it is.
 * Terminating: start is how many digits there are, length 0. Remainders are less than q,
 * so within q steps one is 0 or one comes back.
 */
export function repeatingBlock(
  numerator: number,
  denominator: number,
): { start: number; length: number } {
  const seenAt = new Map<number, number>();
  let remainder = numerator % denominator;
  for (let i = 0; ; i++) {
    if (remainder === 0) return { start: i, length: 0 };
    const earlier = seenAt.get(remainder);
    if (earlier !== undefined) return { start: earlier, length: i - earlier };
    seenAt.set(remainder, i);
    remainder = step(remainder, denominator).remainder;
  }
}

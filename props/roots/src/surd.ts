/**
 * Square roots as exact maths: perfect squares by integer arithmetic, and √ text. Lengths that are
 * compared for equality are kept as whole numbers (n for √n) or whole tenths (x = tenths / 10).
 */

export const ROOT_SIGN = "√";

/** The whole-number square root of n, or undefined when n is not a perfect square (n ≥ 0, whole). */
export function wholeRoot(n: number): number | undefined {
  if (!Number.isInteger(n) || n < 0) return undefined;
  let r = Math.floor(Math.sqrt(n));
  // Correct any floating error in the guess, using integers only.
  while (r * r > n) r -= 1;
  while ((r + 1) * (r + 1) <= n) r += 1;
  return r * r === n ? r : undefined;
}

export function isPerfectSquare(n: number): boolean {
  return wholeRoot(n) !== undefined;
}

/** The largest whole number whose square is at most n (n ≥ 0, whole). */
export function floorRoot(n: number): number {
  let r = Math.floor(Math.sqrt(n));
  while (r * r > n) r -= 1;
  while ((r + 1) * (r + 1) <= n) r += 1;
  return r;
}

/** √n as maths: "√5", or "2" when n = 4. */
export function rootText(n: number): string {
  const whole = wholeRoot(n);
  return whole === undefined ? `${ROOT_SIGN}${n}` : `${whole}`;
}

/** A length given in whole tenths, as text: 93 → "9.3", 90 → "9". */
export function tenthsText(tenths: number): string {
  const sign = tenths < 0 ? "−" : "";
  const t = Math.abs(tenths);
  const whole = Math.floor(t / 10);
  const rest = t % 10;
  return rest === 0 ? `${sign}${whole}` : `${sign}${whole}.${rest}`;
}

/** A length given in whole hundredths, as text without trailing zeros: 515 → "5.15", 250 → "2.5". */
export function hundredthsText(hundredths: number): string {
  const sign = hundredths < 0 ? "−" : "";
  const h = Math.abs(hundredths);
  const whole = Math.floor(h / 100);
  const rest = h % 100;
  if (rest === 0) return `${sign}${whole}`;
  const digits = rest % 10 === 0 ? `${rest / 10}` : `${rest}`.padStart(2, "0");
  return `${sign}${whole}.${digits}`;
}

/** x in whole tenths (x = 9.3 → 93). */
export function toTenths(x: number): number {
  return Math.round(x * 10);
}

/** Whether a number is a whole number of tenths (within floating error). */
export function isWholeTenths(x: number): boolean {
  return Math.abs(x * 10 - Math.round(x * 10)) < 1e-6;
}

/**
 * √x for x in tenths, as maths: "√9.3", or "3" when x = 9. A whole number of tenths k/10 has a
 * rational root only when k/10 is a whole perfect square (10k = s² forces 10 | s, so k = 10t²).
 */
export function rootOfTenthsText(tenths: number): string {
  if (tenths % 10 === 0) return rootText(tenths / 10);
  return `${ROOT_SIGN}${tenthsText(tenths)}`;
}

export function isTenthsPerfectSquare(tenths: number): boolean {
  return tenths % 10 === 0 && isPerfectSquare(tenths / 10);
}

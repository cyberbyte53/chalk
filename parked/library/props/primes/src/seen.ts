/**
 * How the props write what they show: shared by their views and their one-line summaries.
 */

/** The factor pairs offered for splitting v: 2 × 180, 3 × 120, … (smaller factor first). */
export function factorPairs(v: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let d = 2; d * d <= v; d++) if (v % d === 0) pairs.push([d, v / d]);
  return pairs;
}

/** A shelf's label: 3q, 3q + 1, … */
export function shelfName(b: number, r: number): string {
  return r === 0 ? `${b}q` : `${b}q + ${r}`;
}

/** How many numbers a shelf shows; older ones fold into "+k". */
export const SHOWN_PER_SHELF = 8;

/** Turns of a gear as the counter shows them: whole, or to two places. */
export function turnsText(turns: number): string {
  const whole = Math.round(turns * 100) / 100;
  return Number.isInteger(whole) ? String(whole) : whole.toFixed(2);
}

/** Longest a number is written out in full; longer ones are cut in the middle. */
export const LONGEST = 24;

/** A long number as the headline shows it: its first 8 and last 10 digits around "…". */
export function shortenedText(digits: string): string {
  return digits.length > LONGEST ? `${digits.slice(0, 8)}…${digits.slice(-10)}` : digits;
}

/** "1 square", "3 squares". */
export function count(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** Superscript digits: 2 → ², for powers written inline. */
export function sup(k: number): string {
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  return [...String(k)].map((d) => SUP[Number(d)]).join("");
}

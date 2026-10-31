import { type Bag, bagOf } from "@chalk/prop-primes";

/** A bag as LaTeX, the book's way: {2:3, 3:2, 5:1} → 2^{3} \times 3^{2} \times 5. */
export function bagTex(bag: Bag): string {
  const primes = Object.keys(bag)
    .map(Number)
    .filter((p) => (bag[p] ?? 0) > 0)
    .sort((a, b) => a - b);
  if (primes.length === 0) return "1";
  return primes
    .map((p) => ((bag[p] ?? 0) === 1 ? `${p}` : `${p}^{${bag[p]}}`))
    .join(String.raw` \times `);
}

/** n's prime factorisation as LaTeX: 360 → 2^{3} \times 3^{2} \times 5. */
export function primesTex(n: number): string {
  return bagTex(bagOf(n));
}

/** A fraction as LaTeX. */
export function frac(top: string | number, bottom: string | number): string {
  return String.raw`\frac{${top}}{${bottom}}`;
}

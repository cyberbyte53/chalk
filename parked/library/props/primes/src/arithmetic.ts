/**
 * Whole-number arithmetic every prop in this package shares: primes, prime factorisation, HCF and
 * LCM. A number's prime factorisation is kept as a bag: how many of each prime it holds.
 */

/** A number's prime factorisation: prime → how many times it divides the number. 360 → {2:3, 3:2, 5:1}. */
export type Bag = Readonly<Record<number, number>>;

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** The bag of a whole number ≥ 1 (1 has an empty bag). */
export function bagOf(n: number): Bag {
  if (!Number.isInteger(n) || n < 1) throw new Error(`bagOf: ${n} is not a whole number ≥ 1`);
  const bag: Record<number, number> = {};
  let rest = n;
  for (let p = 2; p * p <= rest; p++) {
    while (rest % p === 0) {
      bag[p] = (bag[p] ?? 0) + 1;
      rest /= p;
    }
  }
  if (rest > 1) bag[rest] = (bag[rest] ?? 0) + 1;
  return bag;
}

/** The primes in a bag, smallest first. */
export function primesIn(bag: Bag): number[] {
  return Object.keys(bag)
    .map(Number)
    .filter((p) => (bag[p] ?? 0) > 0)
    .sort((a, b) => a - b);
}

/** How many beads a bag holds (with repeats): 360 → 6. */
export function size(bag: Bag): number {
  return primesIn(bag).reduce((sum, p) => sum + (bag[p] ?? 0), 0);
}

/** The number a bag makes. */
export function productOf(bag: Bag): number {
  return primesIn(bag).reduce((product, p) => product * p ** (bag[p] ?? 0), 1);
}

/** Every bead counted k times: the bag of nᵏ. */
export function times(bag: Bag, k: number): Bag {
  return Object.fromEntries(primesIn(bag).map((p) => [p, (bag[p] ?? 0) * k]));
}

/** Both bags poured together: the bag of a product. */
export function join(a: Bag, b: Bag): Bag {
  const out: Record<number, number> = {};
  for (const p of [...primesIn(a), ...primesIn(b)]) out[p] = (a[p] ?? 0) + (b[p] ?? 0);
  return out;
}

/** What every bag shares: the smaller count of each prime (the HCF's bag). */
export function common(bags: readonly Bag[]): Bag {
  if (bags.length === 0) return {};
  const out: Record<number, number> = {};
  for (const p of primesIn(bags[0] ?? {})) {
    const least = Math.min(...bags.map((b) => b[p] ?? 0));
    if (least > 0) out[p] = least;
  }
  return out;
}

/** Everything any bag has: the larger count of each prime (the LCM's bag). */
export function covering(bags: readonly Bag[]): Bag {
  const out: Record<number, number> = {};
  for (const bag of bags)
    for (const p of primesIn(bag)) out[p] = Math.max(out[p] ?? 0, bag[p] ?? 0);
  return out;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

export function lcm(a: number, b: number): number {
  return a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcd(a, b);
}

/** A bag written the book's way: 2³ × 3² × 5 (1 for the empty bag). */
export function bagText(bag: Bag): string {
  const primes = primesIn(bag);
  if (primes.length === 0) return "1";
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (k: number) => [...String(k)].map((d) => SUP[Number(d)]).join("");
  return primes.map((p) => ((bag[p] ?? 0) === 1 ? `${p}` : `${p}${sup(bag[p] ?? 0)}`)).join(" × ");
}

/** One division of Euclid's algorithm: a = b × q + r, with 0 ≤ r < b. */
export type DivisionStep = { a: number; b: number; q: number; r: number };

/** a = b × q + r, 0 ≤ r < b (Euclid's division lemma). */
export function divide(a: number, b: number): DivisionStep {
  if (b <= 0) throw new Error(`divide: divisor ${b} must be positive`);
  const q = Math.floor(a / b);
  return { a, b, q, r: a - b * q };
}

/** Euclid's algorithm on the larger and smaller of two numbers: every division until r = 0. */
export function euclidSteps(x: number, y: number): DivisionStep[] {
  let a = Math.max(x, y);
  let b = Math.min(x, y);
  const steps: DivisionStep[] = [];
  while (b > 0) {
    const step = divide(a, b);
    steps.push(step);
    a = b;
    b = step.r;
  }
  return steps;
}

/** The colour slot a prime's beads are drawn in: 2, 3, 5 and 7 have their own, the rest share. */
export function toneOf(prime: number): string {
  switch (prime) {
    case 2:
      return "two";
    case 3:
      return "three";
    case 5:
      return "five";
    case 7:
      return "seven";
    default:
      return "other";
  }
}

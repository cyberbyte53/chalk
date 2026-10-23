import { describe, expect, it } from "vitest";
import {
  bagOf,
  bagText,
  common,
  covering,
  divide,
  euclidSteps,
  gcd,
  isPrime,
  join,
  lcm,
  productOf,
  size,
  times,
} from "./arithmetic";

describe("primes and bags", () => {
  it("knows the primes below 30", () => {
    const primes = Array.from({ length: 30 }, (_, i) => i).filter(isPrime);
    expect(primes).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  });

  it("factorises the book's numbers (NCERT 1.3, Example 4, Ex 1.2 Q1)", () => {
    expect(bagText(bagOf(32760))).toBe("2³ × 3² × 5 × 7 × 13");
    expect(bagText(bagOf(140))).toBe("2² × 5 × 7");
    expect(bagText(bagOf(156))).toBe("2² × 3 × 13");
    expect(bagText(bagOf(3825))).toBe("3² × 5² × 17");
    expect(bagText(bagOf(5005))).toBe("5 × 7 × 11 × 13");
    expect(bagText(bagOf(7429))).toBe("17 × 19 × 23");
    expect(bagText(bagOf(1))).toBe("1");
  });

  it("a bag multiplies back to its number, for every number up to 5000", () => {
    for (let n = 1; n <= 5000; n++) expect(productOf(bagOf(n))).toBe(n);
  });

  it("the bag of a product is both bags together; of nᵏ, n's bag k times", () => {
    for (const [a, b] of [
      [12, 35],
      [360, 84],
      [17, 17],
    ] as const) {
      expect(join(bagOf(a), bagOf(b))).toEqual(bagOf(a * b));
    }
    expect(times(bagOf(6), 3)).toEqual(bagOf(216));
    expect(size(bagOf(360))).toBe(6);
  });
});

describe("HCF and LCM (NCERT 1.3, Examples 5–7)", () => {
  it("from the bags: smallest counts for the HCF, largest for the LCM", () => {
    expect(productOf(common([bagOf(6), bagOf(20)]))).toBe(2);
    expect(productOf(covering([bagOf(6), bagOf(20)]))).toBe(60);
    expect(productOf(common([bagOf(6), bagOf(72), bagOf(120)]))).toBe(6);
    expect(productOf(covering([bagOf(6), bagOf(72), bagOf(120)]))).toBe(360);
    expect(productOf(common([bagOf(96), bagOf(404)]))).toBe(4);
    expect(productOf(covering([bagOf(96), bagOf(404)]))).toBe(9696);
  });

  it("agree with gcd and lcm, and HCF × LCM = a × b for every pair up to 120", () => {
    for (let a = 2; a <= 120; a++) {
      for (let b = 2; b <= 120; b++) {
        const h = productOf(common([bagOf(a), bagOf(b)]));
        const l = productOf(covering([bagOf(a), bagOf(b)]));
        expect(h).toBe(gcd(a, b));
        expect(l).toBe(lcm(a, b));
        expect(h * l).toBe(a * b);
      }
    }
  });

  it("HCF × LCM is not the product for three numbers (NCERT's remark after Example 7)", () => {
    const bags = [bagOf(6), bagOf(72), bagOf(120)];
    expect(productOf(common(bags)) * productOf(covering(bags))).not.toBe(6 * 72 * 120);
  });
});

describe("Euclid's division lemma and algorithm (NCERT 1.2)", () => {
  it("a = bq + r with 0 ≤ r < b, for every a ≤ 300 and b ≤ 20", () => {
    for (let a = 0; a <= 300; a++) {
      for (let b = 1; b <= 20; b++) {
        const { q, r } = divide(a, b);
        expect(b * q + r).toBe(a);
        expect(r).toBeGreaterThanOrEqual(0);
        expect(r).toBeLessThan(b);
      }
    }
  });

  it("HCF(4052, 12576) = 4 in the book's seven steps (Example 1)", () => {
    const steps = euclidSteps(4052, 12576);
    expect(steps.map((s) => [s.a, s.b, s.q, s.r])).toEqual([
      [12576, 4052, 3, 420],
      [4052, 420, 9, 272],
      [420, 272, 1, 148],
      [272, 148, 1, 124],
      [148, 124, 1, 24],
      [124, 24, 5, 4],
      [24, 4, 6, 0],
    ]);
  });

  it("the last divisor is the HCF, for every pair up to 150", () => {
    for (let a = 1; a <= 150; a++) {
      for (let b = 1; b <= 150; b++) expect(euclidSteps(a, b).at(-1)?.b).toBe(gcd(a, b));
    }
  });
});

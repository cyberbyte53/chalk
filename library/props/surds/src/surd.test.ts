import { describe, expect, it } from "vitest";
import {
  type Term,
  addLikeTerms,
  factorText,
  multiply,
  simplifyRoot,
  sumText,
  termText,
} from "./surd";

const t = (coefficient: number, radicand = 1): Term => ({ coefficient, radicand });

describe("surd arithmetic", () => {
  it("pulls square factors out of a root by trial division", () => {
    expect(simplifyRoot(1)).toEqual({ outside: 1, inside: 1 });
    expect(simplifyRoot(16)).toEqual({ outside: 4, inside: 1 });
    expect(simplifyRoot(12)).toEqual({ outside: 2, inside: 3 });
    expect(simplifyRoot(60)).toEqual({ outside: 2, inside: 15 });
    expect(simplifyRoot(72)).toEqual({ outside: 6, inside: 2 });
    expect(simplifyRoot(199)).toEqual({ outside: 1, inside: 199 });
    expect(simplifyRoot(40000)).toEqual({ outside: 200, inside: 1 });
  });

  it("multiplies terms and simplifies: √2·√8 = 4, √6·√10 = 2√15, 3√2·√6 = 6√3", () => {
    expect(multiply(t(1, 2), t(1, 8))).toEqual(t(4));
    expect(multiply(t(1, 6), t(1, 10))).toEqual(t(2, 15));
    expect(multiply(t(3, 2), t(1, 6))).toEqual(t(6, 3));
    expect(multiply(t(-1, 7), t(1, 7))).toEqual(t(-7));
    expect(multiply(t(3), t(2, 5))).toEqual(t(6, 5));
  });

  it("adds like terms, drops zeros, puts the rational term first", () => {
    expect(addLikeTerms([t(1, 6), t(3), t(-1, 2), t(2, 2)])).toEqual([t(3), t(1, 2), t(1, 6)]);
    expect(addLikeTerms([t(1, 15), t(-1, 15)])).toEqual([]);
    expect(addLikeTerms([t(1, 8), t(-2, 2)])).toEqual([]);
  });

  it("writes terms, sums and factors the textbook way", () => {
    expect(termText(t(-1, 15))).toBe("−√15");
    expect(termText(t(6, 3))).toBe("6√3");
    expect(termText(t(7))).toBe("7");
    expect(sumText([t(6), t(3, 2), t(2, 3), t(1, 6)])).toBe("6 + 3√2 + 2√3 + √6");
    expect(sumText([t(5), t(-1, 15)])).toBe("5 − √15");
    expect(sumText([])).toBe("0");
    expect(factorText([t(1, 5), t(1, 3)])).toBe("(√5 + √3)");
    expect(factorText([t(3), t(-1, 3)])).toBe("(3 − √3)");
    expect(factorText([t(1, 7)])).toBe("√7");
    expect(factorText([t(-1, 7)])).toBe("(−√7)");
  });
});

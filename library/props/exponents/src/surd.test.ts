import { describe, expect, it } from "vitest";
import {
  approximate,
  exponentValue,
  isShowable,
  nextPower,
  rootSign,
  routeOf,
  superscript,
  textOf,
  wholeRoot,
} from "./surd";

/** The whole-number kth root by plain search: written separately from the model on purpose. */
function searchRoot(x: number, k: number): number | undefined {
  for (let r = 0; r ** k <= x; r++) if (r ** k === x) return r;
  return undefined;
}

describe("whole-number roots", () => {
  it("agree with a plain search for every x ≤ 5000 and k ≤ 6", () => {
    for (let k = 1; k <= 6; k++) {
      for (let x = 0; x <= 5000; x++) {
        const found = wholeRoot(BigInt(x), k);
        const expected = searchRoot(x, k);
        expect(found === undefined ? undefined : Number(found)).toBe(expected);
      }
    }
  });

  it("find roots of big perfect powers exactly, and miss their neighbours", () => {
    for (const [r, k] of [
      [1000, 4],
      [999, 4],
      [100, 6],
      [31, 6],
      [9999, 3],
      [999_999, 2],
    ] as const) {
      const x = BigInt(r) ** BigInt(k);
      expect(wholeRoot(x, k)).toBe(BigInt(r));
      expect(wholeRoot(x + 1n, k)).toBeUndefined();
      expect(wholeRoot(x - 1n, k)).toBeUndefined();
    }
  });
});

describe("symbols and text", () => {
  it("writes roots and powers the textbook way", () => {
    expect([2, 3, 4, 5, 6].map(rootSign)).toEqual(["√", "∛", "∜", "⁵√", "⁶√"]);
    expect(superscript(2)).toBe("²");
    expect(superscript(12)).toBe("¹²");
  });

  it("writes approximations to 4 significant figures, never in e-notation", () => {
    expect(approximate(Math.SQRT2)).toBe("1.414");
    expect(approximate(2 ** (2 / 3))).toBe("1.587");
    expect(approximate(1000 ** 0.5)).toBe("31.62");
    expect(approximate(1 / Math.SQRT2)).toBe("0.7071");
    expect(approximate(1e-6 * Math.PI)).not.toContain("e");
  });

  it("writes exact values as whole numbers or fractions", () => {
    expect(textOf(exponentValue(125, -1, 3))).toBe("1/5");
    expect(textOf(exponentValue(2, -3, 1))).toBe("1/8");
    expect(textOf(exponentValue(27, 2, 3))).toBe("9");
    expect(textOf(exponentValue(2, 1, 2))).toBe("≈ 1.414");
  });
});

describe("the 10¹² rule and stepping m", () => {
  it("allows a^|m| up to 10¹² and no more", () => {
    expect(isShowable(1000, 4)).toBe(true);
    expect(isShowable(100, -6)).toBe(true);
    expect(isShowable(1000, 5)).toBe(false);
    expect(isShowable(999, 6)).toBe(false);
  });

  it("steps m along −6 … −1, 1 … 6, skipping 0 and held to the ends", () => {
    expect(nextPower(-1, 1)).toBe(1);
    expect(nextPower(1, -1)).toBe(-1);
    expect(nextPower(-2, 3)).toBe(2);
    expect(nextPower(6, 1)).toBe(6);
    expect(nextPower(-6, -5)).toBe(-6);
  });
});

describe("routes over many generated a^(m/n)", () => {
  it("both routes end on the same number, which is Math.pow(a, m/n)", () => {
    // A fixed walk over the space (no Math.random): every n and m, bases spread over 1–1000.
    let checked = 0;
    for (let a = 1; a <= 1000; a += 7) {
      for (let n = 1; n <= 6; n++) {
        for (let m = -6; m <= 6; m++) {
          if (m === 0 || !isShowable(a, m)) continue;
          const one = routeOf(a, m, n, true).at(-1);
          const two = routeOf(a, m, n, false).at(-1);
          const expected = a ** (m / n);
          const tolerance = 1e-9 * Math.max(1, expected);
          if (one === undefined || two === undefined) {
            expect(a ** (m / n)).toBe(a); // no steps: a^(1/1)
            continue;
          }
          expect(Math.abs(one.value - expected)).toBeLessThan(tolerance);
          expect(Math.abs(two.value - expected)).toBeLessThan(tolerance);
          expect(one.valueText).toBe(two.valueText);
          expect(one.isExact).toBe(two.isExact);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(5000);
  });

  it("an end value is exact exactly when a^|m| has a whole nth root", () => {
    for (let a = 1; a <= 300; a++) {
      for (let n = 2; n <= 6; n++) {
        for (const m of [1, 2, 3, -2]) {
          if (!isShowable(a, m)) continue;
          const isWhole = wholeRoot(BigInt(a) ** BigInt(Math.abs(m)), n) !== undefined;
          expect(routeOf(a, m, n, false).at(-1)?.isExact).toBe(isWhole);
          expect(routeOf(a, m, n, true).at(-1)?.isExact).toBe(isWhole);
        }
      }
    }
  });
});

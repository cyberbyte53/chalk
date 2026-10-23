import { describe, expect, it } from "vitest";
import { divisionSteps, termsOf, termsText } from "./box-algebra";
import {
  factoredTex,
  fromVertex,
  fromZeroes,
  niceNumber,
  polyTex,
  polyText,
  realZeroes,
  valueAt,
  zeroesWithRepeats,
} from "./poly";

describe("polynomials: the book's own cases", () => {
  it("p(x) = x² − 3x − 4: p(2) = −6, p(−1) = p(4) = 0", () => {
    const p = [1, -3, -4];
    expect(valueAt(p, 2)).toBe(-6);
    expect(valueAt(p, -1)).toBe(0);
    expect(zeroesWithRepeats(p)).toEqual([-1, 4]);
  });

  it("multiplies out from zeroes: 2(x − 1)(x − 3) = 2x² − 8x + 6", () => {
    expect(fromZeroes(2, [1, 3])).toEqual([2, -8, 6]);
    expect(polyText(fromZeroes(2, [1, 3]))).toBe("2x² − 8x + 6");
  });

  it("finds zeroes that are fractions, surds and repeats", () => {
    expect(zeroesWithRepeats([3, 5, -2])).toEqual([-2, 1 / 3]); // 3x² + 5x − 2
    expect(realZeroes([1, 0, -3]).map((z) => niceNumber(z.x).text)).toEqual(["−√3", "√3"]);
    expect(realZeroes([4, -4, 1])).toEqual([{ x: 0.5, multiplicity: 2 }]); // 4s² − 4s + 1
    expect(realZeroes([1, 0, 1])).toEqual([]); // x² + 1 never meets the axis
    expect(zeroesWithRepeats([1, 0, -4, 0])).toEqual([-2, 0, 2]); // x³ − 4x
    expect(realZeroes([1, -1, 0, 0])).toEqual([
      { x: 0, multiplicity: 2 },
      { x: 1, multiplicity: 1 },
    ]); // x³ − x² = x²(x − 1)
  });

  it("Example 9's quartic: zeroes ±√2, 1/2 and 1", () => {
    const zeroes = zeroesWithRepeats([2, -3, -3, 6, -2]).map((x) => niceNumber(x).text);
    expect(zeroes).toEqual(["−√2", "1/2", "1", "√2"]);
  });

  it("writes 2 ± √3 and other zeroes from Exercise 2.4", () => {
    expect(niceNumber(2 + Math.sqrt(3)).text).toBe("2 + √3");
    expect(niceNumber(2 - Math.sqrt(3)).text).toBe("2 − √3");
    expect(niceNumber(Math.sqrt(5 / 3)).text).toBe("√15/3");
    expect(niceNumber(-1.5).tex).toBe("-\\frac{3}{2}");
  });

  it("writes polynomials the book's way", () => {
    expect(polyTex([1, 7, 10])).toBe("x^{2} + 7x + 10");
    expect(polyText([6, -7, -3])).toBe("6x² − 7x − 3");
    expect(polyText([4, 1, 1], "u")).toBe("4u² + u + 1");
    expect(polyText([-1, 0, 0, 5])).toBe("−x³ + 5");
    expect(factoredTex(2, [1, 3])).toBe("2(x - 3)(x - 1)");
    expect(factoredTex(1, [1, 1, -2])).toBe("(x - 1)^{2}(x + 2)");
  });

  it("a vertex form multiplies out: (x − 1)² − 4 = x² − 2x − 3", () => {
    expect(fromVertex(1, 1, -4)).toEqual([1, -2, -3]);
  });
});

describe("division: dividend = divisor × quotient + remainder", () => {
  const divide = (p: number[], g: number[]) => {
    const steps = divisionSteps(p, g);
    return {
      quotient: termsText(
        steps.map((s) => s.quotient),
        "x",
      ),
      remainder: termsText(steps.at(-1)?.remaining ?? termsOf(p), "x"),
    };
  };

  it("Example 6: 2x² + 3x + 1 ÷ (x + 2) = 2x − 1, remainder 3", () => {
    expect(divide([2, 3, 1], [1, 2])).toEqual({ quotient: "2x − 1", remainder: "3" });
  });
  it("Example 7: 3x³ + x² + 2x + 5 ÷ (x² + 2x + 1) = 3x − 5, remainder 9x + 10", () => {
    expect(divide([3, 1, 2, 5], [1, 2, 1])).toEqual({ quotient: "3x − 5", remainder: "9x + 10" });
  });
  it("Example 8: −x³ + 3x² − 3x + 5 ÷ (−x² + x − 1) = x − 2, remainder 3", () => {
    expect(divide([-1, 3, -3, 5], [-1, 1, -1])).toEqual({ quotient: "x − 2", remainder: "3" });
  });
  it("Example 9: the quartic ÷ (x² − 2) = 2x² − 3x + 1 exactly", () => {
    expect(divide([2, -3, -3, 6, -2], [1, 0, -2])).toEqual({
      quotient: "2x² − 3x + 1",
      remainder: "0",
    });
  });
  it("Exercise 2.3: x⁴ − 5x + 6 ÷ (2 − x²) = −x² − 2, remainder −5x + 10", () => {
    expect(divide([1, 0, 0, -5, 6], [-1, 0, 2])).toEqual({
      quotient: "−x² − 2",
      remainder: "−5x + 10",
    });
  });
  it("keeps fractions exact: x² + 1 ÷ (2x) = x/2, remainder 1", () => {
    expect(divide([1, 0, 1], [2, 0])).toEqual({ quotient: "1/2x", remainder: "1" });
  });
  it("divisor × quotient + remainder gives the dividend back, for many cases", () => {
    for (let a = -3; a <= 3; a++)
      for (let b = -3; b <= 3; b++)
        for (const g of [
          [1, a],
          [2, b, a],
          [1, 0, b],
        ]) {
          if (g[0] === 0) continue;
          const p = [1, a, b, a + b, 3];
          const steps = divisionSteps(p, g);
          const q = steps.map((s) => s.quotient);
          const r = steps.at(-1)?.remaining ?? [];
          const back = new Array<number>(p.length).fill(0);
          for (const qt of q)
            for (const gt of termsOf(g)) {
              const i = p.length - 1 - (qt.power + gt.power);
              back[i] = (back[i] ?? 0) + Number(qt.coefficient.mul(gt.coefficient).valueOf());
            }
          for (const rt of r)
            back[p.length - 1 - rt.power] =
              (back[p.length - 1 - rt.power] ?? 0) + Number(rt.coefficient.valueOf());
          expect(back.map((x) => Math.round(x * 1e9) / 1e9)).toEqual(p);
          expect((r[0]?.power ?? -1) < g.length - 1).toBe(true);
        }
  });
});

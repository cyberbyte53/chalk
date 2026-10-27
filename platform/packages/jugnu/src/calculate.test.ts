import { describe, expect, it } from "vitest";
import { evaluateCalculation } from "./calculate";

describe("Jugnu's calculator", () => {
  const scope = (name: string) => {
    if (name === "line") return { marker: 1.5 };
    if (name === "coin") return { heads: 47, count: 100 };
    throw new Error(`No prop "${name}"`);
  };

  it("reads the board's values and does maths and logic", () => {
    expect(evaluateCalculation("line.marker * line.marker", scope)).toBe(2.25);
    expect(evaluateCalculation("line.marker ^ 2 > 2.02", scope)).toBe(true);
    expect(evaluateCalculation("1.98 <= line.marker^2 and line.marker^2 <= 2.02", scope)).toBe(
      false,
    );
    expect(evaluateCalculation("not (coin.count == 100)", scope)).toBe(false);
    expect(evaluateCalculation("fixed(line.marker, 2)", scope)).toBe("1.50");
  });

  it("refuses anything that isn't maths over the board", () => {
    expect(() => evaluateCalculation("alert(1)", scope)).toThrow(/Unknown function/);
    expect(() => evaluateCalculation("line.marker = 2", scope)).toThrow();
    expect(() => evaluateCalculation("coin.flips", scope)).toThrow(/doesn't exist/);
  });
});

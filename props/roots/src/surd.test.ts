import { describe, expect, it } from "vitest";
import {
  floorRoot,
  hundredthsText,
  isPerfectSquare,
  isTenthsPerfectSquare,
  rootOfTenthsText,
  rootText,
  tenthsText,
  wholeRoot,
} from "./surd";

describe("surd", () => {
  it("finds perfect squares exactly, even large ones", () => {
    const squares = new Set(Array.from({ length: 2001 }, (_, k) => k * k));
    for (let n = 0; n <= 4_000_000; n += n < 2000 ? 1 : 997) {
      expect(isPerfectSquare(n)).toBe(squares.has(n));
    }
    expect(wholeRoot(10 ** 14)).toBe(10 ** 7);
    expect(wholeRoot(10 ** 14 + 1)).toBeUndefined();
    expect(wholeRoot(2.25)).toBeUndefined();
    expect(floorRoot(8)).toBe(2);
    expect(floorRoot(9)).toBe(3);
  });

  it("writes roots as maths", () => {
    expect(rootText(2)).toBe("√2");
    expect(rootText(4)).toBe("2");
    expect(rootText(8)).toBe("√8");
    expect(tenthsText(93)).toBe("9.3");
    expect(tenthsText(90)).toBe("9");
    expect(tenthsText(5)).toBe("0.5");
    expect(hundredthsText(515)).toBe("5.15");
    expect(hundredthsText(250)).toBe("2.5");
    expect(hundredthsText(5)).toBe("0.05");
    expect(rootOfTenthsText(93)).toBe("√9.3");
    expect(rootOfTenthsText(90)).toBe("3");
    expect(rootOfTenthsText(20)).toBe("√2");
  });

  it("a whole number of tenths has a whole root only when it is a whole perfect square", () => {
    for (let t = 1; t <= 2000; t++) {
      // √(t/10) = √(10t)/10: rational only when 10t is a perfect square.
      const isRational = isPerfectSquare(10 * t);
      expect(isTenthsPerfectSquare(t)).toBe(isRational);
    }
  });
});

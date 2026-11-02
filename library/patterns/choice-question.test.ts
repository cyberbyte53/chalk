import { describe, expect, it } from "vitest";
import { seedOf, settle } from "./choice-question";

describe("settle: a question's options in a fixed shuffled order", () => {
  it("is the same order every build for the same seed", () => {
    expect(settle(["a", "b", "c", "d"], 12345)).toEqual(settle(["a", "b", "c", "d"], 12345));
  });

  it("puts the first-written option (every question's answer) anywhere, about equally", () => {
    for (const n of [3, 4, 6]) {
      const at = new Array<number>(n).fill(0);
      const tries = 6000;
      for (let k = 0; k < tries; k++) {
        const out = settle([...Array(n).keys()], seedOf(`q${k}|prompt ${k * 7}|ids`));
        at[out.indexOf(0)] = (at[out.indexOf(0)] ?? 0) + 1;
      }
      // Each place within a fifth of its fair share.
      for (const count of at) expect(Math.abs(count - tries / n)).toBeLessThan(tries / n / 5);
    }
  });

  it("keeps every option, once", () => {
    expect(settle([1, 2, 3, 4, 5], seedOf("x")).sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

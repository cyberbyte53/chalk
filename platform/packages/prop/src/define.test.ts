import { describe, expect, it } from "vitest";
import { purposeOf } from "./define";

describe("what a prop is for", () => {
  it("is the first sentence of its describe, whole numbers and all", () => {
    expect(purposeOf({ describe: "A multiple-choice question." })).toBe(
      "A multiple-choice question.",
    );
    expect(
      purposeOf({
        describe: "A fraction 3/8 = 0.375 as beads.\n  Cancel crosses out shared primes.",
      }),
    ).toBe("A fraction 3/8 = 0.375 as beads.");
    expect(purposeOf({ describe: "Words on the board" })).toBe("Words on the board");
  });
});

import { describe, expect, it } from "vitest";
import { siteFrom, siteHere } from "./site";

describe("where a piece was written", () => {
  it("ignores frames outside content/ (this test lives in platform/)", () => {
    expect(siteHere()).toBeUndefined();
  });

  it("opens the lesson's line, not the kit's", () => {
    const frames = ["content/b/c/kit.ts:20", "content/b/c/l/overview.ts:33"];
    expect(siteFrom(frames)).toBe("content/b/c/l/overview.ts:33");
    expect(siteFrom(["library/patterns/x.ts:4", "content/b/c/kit.ts:9"])).toBe(
      "content/b/c/kit.ts:9",
    );
  });
});

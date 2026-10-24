import { describe, expect, it } from "vitest";
import { siteHere } from "./site";

describe("siteHere", () => {
  it("ignores frames outside content/ (this test lives in platform/)", () => {
    expect(siteHere()).toBeUndefined();
  });
});

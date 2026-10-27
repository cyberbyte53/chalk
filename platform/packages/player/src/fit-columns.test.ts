import { describe, expect, it } from "vitest";
import { balanced } from "./fit-columns";

describe("balanced", () => {
  it("evens the rows out", () => {
    expect(balanced(9, 7)).toBe(5);
    expect(balanced(6, 4)).toBe(3);
  });
  it("never leaves a last row half empty", () => {
    expect(balanced(3, 2)).toBe(1);
    expect(balanced(5, 4)).toBe(3);
  });
  it("keeps a full row whole", () => {
    expect(balanced(3, 3)).toBe(3);
    expect(balanced(4, 3)).toBe(2);
  });
});

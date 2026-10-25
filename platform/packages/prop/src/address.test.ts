import { describe, expect, it } from "vitest";
import { joinPath, namesOf, pathOf, segment } from "./address";

describe("addresses", () => {
  it("joins names with / and splits back to the same names", () => {
    expect(pathOf("mirror", "objectArrow", "object")).toBe("mirror/objectArrow/object");
    expect(namesOf("mirror/objectArrow/object")).toEqual(["mirror", "objectArrow", "object"]);
    expect(joinPath("mirror", "", "objectArrow/object")).toBe("mirror/objectArrow/object");
  });

  it("writes a / in a name from data as %2F, so it always splits back", () => {
    expect(segment("mark:1/2")).toBe("mark:1%2F2");
    expect(pathOf("line", "mark:1/2")).toBe("line/mark:1%2F2");
    expect(namesOf("line/mark:1%2F2")).toEqual(["line", "mark:1/2"]);
    expect(namesOf(pathOf("x", "100%/2"))).toEqual(["x", "100%/2"]);
  });
});

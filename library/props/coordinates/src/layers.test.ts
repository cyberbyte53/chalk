import { asAnyProp, hostOf } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { coordinatePlane } from "./coordinate-plane";

describe("which layers a board can ever have on", () => {
  it("those on as it starts, and those an action can turn on; not the others", () => {
    const host = hostOf(asAnyProp(coordinatePlane));
    // movePoint changes `point`, so reading may come on anywhere; nothing changes walkFrom.
    const ever = host?.layersEverOn({ ...coordinatePlane.defaults, places: [{ x: 1, y: 1 }] });
    expect(ever).toContain("places");
    expect(ever).toContain("reading");
    expect(ever).not.toContain("walker");
  });
});

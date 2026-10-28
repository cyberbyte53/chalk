import { describe, expect, it } from "vitest";
import { propBoard } from "./prop-board";

describe("a prop on its own", () => {
  it("is a board with that one prop on it, at its defaults or the fields given", () => {
    const bare = propBoard("numberLine");
    expect(bare.name).toBe("numberLine");
    expect(bare.root).toEqual({
      kind: "column",
      name: "page",
      children: [{ kind: "prop", name: "numberLine", prop: "numberLine" }],
    });
    expect(bare.is).toEqual([]);
    const set = propBoard("numberLine", { from: 1, to: 2 });
    expect(set.root.kind === "column" && set.root.children[0]).toMatchObject({
      with: { from: 1, to: 2 },
    });
  });
});

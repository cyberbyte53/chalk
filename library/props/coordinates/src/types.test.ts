import { does } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { coordinatePlane } from "./coordinate-plane";

/**
 * A host's actions keep the arguments each layer's action takes, so a view or a lesson that sends
 * the wrong ones doesn't compile. The marked lines must fail to compile.
 */
describe("the plane's actions, as written", () => {
  it("take exactly their own arguments", () => {
    const a = coordinatePlane.actions;
    // @ts-expect-error a clue is a number, not words
    does(a.giveClue, { clue: "first" }, 1);
    // @ts-expect-error no such direction
    does(a.step, { direction: "upp" }, "upp");
    // @ts-expect-error a field the action doesn't take
    does(a.chooseTarget, { x: 1, y: 2, z: 3 }, "1,2");
    expect(does(a.giveClue, { clue: 1 }, 1)["data-part"]).toBe("giveClue:1");
  });
});

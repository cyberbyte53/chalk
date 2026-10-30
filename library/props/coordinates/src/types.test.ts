import { does } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { clues } from "./clues";
import { coordinatePlane } from "./coordinate-plane";
import { places } from "./places";
import { walker } from "./walker";

/**
 * Each part's actions keep the arguments they take, and so do the group's (each part's by path),
 * so a view or a lesson that sends the wrong ones doesn't compile. The marked lines must fail to
 * compile.
 */
describe("the plane's actions, as written", () => {
  it("take exactly their own arguments", () => {
    // @ts-expect-error a clue is a number, not words
    does(clues.actions.giveClue, { clue: "first" }, 1);
    // @ts-expect-error no such direction
    does(walker.actions.step, { direction: "upp" }, "upp");
    // @ts-expect-error a field the action doesn't take
    does(places.actions.chooseTarget, { x: 1, y: 2, z: 3 }, "1,2");
    expect(does(clues.actions.giveClue, { clue: 1 }, 1)["data-part"]).toBe("giveClue:1");
  });
  it("the group's, by path, take the same arguments as the part's own", () => {
    // Only compiled: the group runs a part's action by path, it isn't a view's input.
    const compiled = () => {
      const a = coordinatePlane.actions;
      // @ts-expect-error a clue is a number, not words
      does(a["clues.giveClue"], { clue: "first" }, 1);
      // @ts-expect-error no such direction
      does(a["walker.step"], { direction: "upp" }, "upp");
      // @ts-expect-error a field the action doesn't take
      does(a["places.chooseTarget"], { x: 1, y: 2, z: 3 }, "1,2");
      does(a["clues.giveClue"], { clue: 1 }, 1);
    };
    expect(typeof compiled).toBe("function");
  });
});

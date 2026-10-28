import type { PropPage } from "@chalk/player";
import { describe, expect, it } from "vitest";
import { fieldUse, propLine } from "./prop-text";

const page: PropPage = {
  address: "library/props/p/plane",
  pkg: "p",
  type: "plane",
  role: "explainer",
  purpose: "A plane.",
  describe: "A plane.",
  fields: [
    { name: "x", takes: "number", isInput: false, changedBy: ["move"] },
    { name: "scene", takes: "text", isInput: false, changedBy: [] },
    { name: "label", takes: "text", isInput: false, changedBy: [] },
    { name: "walkX", takes: "number", isInput: false, changedBy: ["walk"] },
  ],
  actions: [
    { name: "move", takes: "", describe: "", isByLearner: true },
    { name: "walk", takes: "", describe: "", isByLearner: false },
    { name: "zoom", takes: "", describe: "", isByLearner: false },
  ],
  signals: [],
};

describe("a prop's page", () => {
  it("lists it on one line: address, role, what it is for, how many boards use it", () => {
    const uses = [
      { board: "b/c/l/one", piece: "plane", given: [], binds: [], calls: [] },
      { board: "b/c/l/one", piece: "other", given: [], binds: [], calls: [] },
    ];
    expect(propLine(page, uses)).toBe(
      "library/props/p/plane · explainer · A plane. · used on 1 board",
    );
  });

  it("measures field use: settings and lesson actions no board uses, and what one board uses", () => {
    const uses = [
      { board: "b/c/l/one", piece: "plane", given: ["x", "scene"], binds: [], calls: ["walk"] },
      { board: "b/c/l/two", piece: "plane", given: ["x"], binds: [], calls: [] },
    ];
    const { unused, once } = fieldUse(page, uses);
    // walkX is its own state, move is the learner's: neither is the boards' to use.
    expect(unused).toEqual(["label", "zoom"]);
    expect([...once]).toEqual([
      ["scene", "b/c/l/one"],
      ["walk", "b/c/l/one"],
    ]);
  });
});

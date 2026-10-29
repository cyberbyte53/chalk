import { type PropModule, checkProp, describeView } from "@chalk/player";
import { type Element, initialState, viewOf } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { coordinatePlaneProp } from "./index";
import { Marks, Scene } from "./plane";
import { Reading } from "./reading";

/** The plane placed with these fields, as the student sees it (read from what its view draws). */
function seen(
  given: Readonly<Record<string, unknown>> = {},
  module: PropModule = coordinatePlaneProp,
) {
  const start = initialState(module.def, given);
  if (!start.isOk) throw new Error(start.errors.join("; "));
  const described = describeView(module, viewOf(module.def, start.state));
  const at = (id: string): Element | undefined => described.elements.find((e) => e.id === id);
  return { ...described, ids: described.elements.map((e) => e.id), at };
}

const houses = Array.from({ length: 3 }, (_, i) =>
  Array.from({ length: 2 }, (_, j) => ({ x: i + 1, y: j + 1 })),
).flat();

/** Each kind of board the flow places it on. */
const town = {
  window: { xMin: 0, xMax: 4, yMin: 0, yMax: 3 },
  marks: Marks.Counts,
  scene: Scene.Town,
  axisNames: [
    { en: "Street number", hi: "गली नंबर" },
    { en: "House number", hi: "मकान नंबर" },
  ],
  places: houses,
  walkFrom: { x: 0, y: 0 },
};
const axes = { showDirections: true, window: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 } };
const apart = { apart: { x: 2, y: 1 }, showOrigin: false };
const reading = { point: { x: 2, y: -1 }, reading: Reading.Pair };
const guessing = { point: { x: -2, y: 1 }, isReadingHidden: true };
const clues = {
  clueChoices: [
    { words: { en: "On the x-axis", hi: "x-अक्ष पर" }, y: 0 },
    { words: { en: "3 to the right", hi: "3 दाईं ओर" }, x: 3 },
  ],
  hidden: { x: 3, y: 0 },
  canHide: true,
};
const plotting = {
  toPlot: [
    { x: 1, y: 2 },
    { x: 0, y: -1.25 },
  ],
  showTable: true,
  showSwaps: true,
  scaleChoices: [1, 2],
};
const dice = {
  counters: [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ],
  window: { xMin: 0, xMax: 10, yMin: 0, yMax: 10 },
  hasGrid: true,
};
const figure = {
  canShowPoints: true,
  points: [
    { name: "B", x: -2, y: 2, isShown: false, hasDropLines: true, tone: "main" },
    { name: "D", x: 2, y: 2, isShown: true, hasDropLines: false, tone: "main" },
  ],
};

describe("coordinatePlane, used the way the boards use it", () => {
  it("every input says what it does, and every learner's action has one", () => {
    expect(
      checkProp(coordinatePlaneProp, [
        town,
        { ...town, along: 2, up: 1 },
        axes,
        apart,
        reading,
        guessing,
        clues,
        plotting,
        { ...plotting, plotted: [{ x: 1, y: 2, isRight: true }] },
        dice,
        figure,
      ]),
    ).toEqual([]);
  });
});

describe("what the student sees", () => {
  it("the town: the lines' names, a button on every street and house number, a house to tap, Riya", () => {
    const s = seen(town);
    expect(s.at("xName")?.value).toBe("Street number");
    expect(s.at("yName")?.value).toBe("House number");
    expect(s.ids).toContain("lightLine:x2");
    expect(s.ids).toContain("chooseTarget:2,1");
    expect(s.at("walker")).toMatchObject({ value: { x: 0, y: 0 }, words: "Riya (0, 0)" });
    expect(s.at("setAlong")).toMatchObject({ value: 0, isByHand: true });
  });
  it("Aman's house, once chosen, is written by its full address", () => {
    const s = seen({ ...town, target: { x: 3, y: 2 } });
    expect(s.at("target")).toMatchObject({
      value: { x: 3, y: 2 },
      words: "Aman's house: Street number 3, House number 2",
    });
  });
  it("Riya at the end of her walk says where she is, and whether it is Aman's house", () => {
    const there = seen({ ...town, target: { x: 3, y: 2 }, along: 3, up: 2, walked: 5 });
    expect(there.at("whereWalker")?.words).toBe(
      "Riya is at Aman's house! Street number 3, House number 2",
    );
    const wrong = seen({ ...town, target: { x: 3, y: 2 }, along: 2, up: 3, walked: 5 });
    expect(wrong.at("whereWalker")?.words).toBe(
      "Riya: Street number 2, House number 3. That isn't Aman's house.",
    );
  });
  it("a point read as far as the board writes it; in a guessing round, only ?", () => {
    expect(seen(reading).at("point")).toMatchObject({ value: { x: 2, y: -1 }, words: "(2, −1)" });
    const g = seen(guessing);
    expect(g.at("point")).toMatchObject({ value: null, words: "?" });
    expect(g.ids).toContain("showReading");
  });
  it("the hidden point is known, not shown, until the learner asks", () => {
    const s = seen(clues);
    expect(s.ids).not.toContain("hidden");
    expect(s.hidden).toMatchObject({ hidden: { x: 3, y: 0 } });
    expect(s.ids).toContain("giveClue:0");
  });
  it("the dice game: both counters, the throw, whose turn", () => {
    const s = seen(dice);
    expect(s.at("counter1")?.words).toBe("Riya (0, 0)");
    expect(s.at("counter2")?.words).toBe("Aman (0, 0)");
    expect(s.ids).toContain("throwDice");
  });
  it("no Next point button unless the board gives one: the lesson shows the points itself", () => {
    expect(seen({ ...figure, canShowPoints: false }).ids).not.toContain("showPoint");
  });
  it("a figure's points show one at a time, by name, with the next behind a button", () => {
    const s = seen(figure);
    expect(s.at("pointD")).toMatchObject({ value: { x: 2, y: 2 }, words: "D" });
    expect(s.ids).not.toContain("pointB");
    expect(s.ids).toContain("showPoint");
  });
});

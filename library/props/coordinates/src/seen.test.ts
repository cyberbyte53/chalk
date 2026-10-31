import { type PropModule, type PropView, checkProp, describeView } from "@chalk/player";
import type { Element } from "@chalk/prop";
import { Board } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { coordinatePlaneProp } from "./index";
import { Marks, Scene } from "./plane";
import { Reading } from "./reading";
import { Roads } from "./walker";

/** The plane placed with these fields, as the student sees it (read from what its view draws). */
function seen(
  given: Readonly<Record<string, unknown>> = {},
  module: PropModule = coordinatePlaneProp,
) {
  const board = new Board(module.def, given as never);
  board.runUntilIdle();
  const raw = describeView(module, board.read() as unknown as PropView);
  // A non-breaking space keeps a pair on one line; read it as the space it is.
  const described = {
    ...raw,
    elements: raw.elements.map((e) =>
      e.words === undefined ? e : { ...e, words: e.words.replace(/\u00a0/g, " ") },
    ),
  };
  const at = (id: string): Element | undefined => described.elements.find((e) => e.id === id);
  return { ...described, ids: described.elements.map((e) => e.id), at };
}

const houses = Array.from({ length: 3 }, (_, i) =>
  Array.from({ length: 2 }, (_, j) => ({ x: i + 1, y: j + 1 })),
).flat();

/** Each kind of board the flow places it on, given part by part. */
const town = {
  plane: {
    window: { xMin: 0, xMax: 4, yMin: 0, yMax: 3 },
    marks: Marks.Counts,
    scene: Scene.Town,
    axisNames: [
      { en: "Street number", hi: "गली नंबर" },
      { en: "House number", hi: "मकान नंबर" },
    ],
  },
  places: { places: houses },
  walker: { walkFrom: { x: 0, y: 0 }, roads: Roads.Town },
};
/** The town with these places' and Riya's fields changed. */
const inTown = (
  placesGiven: Readonly<Record<string, unknown>>,
  walkerGiven: Readonly<Record<string, unknown>> = {},
) => ({
  ...town,
  places: { ...town.places, ...placesGiven },
  walker: { ...town.walker, ...walkerGiven },
});
const axes = {
  plane: { showDirections: true, window: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 } },
};
const apart = { plane: { apart: { x: 2, y: 1 }, showOrigin: false } };
const reading = { reading: { point: { x: 2, y: -1 }, reading: Reading.Pair } };
const guessing = { reading: { point: { x: -2, y: 1 }, isReadingHidden: true } };
const clues = {
  clues: {
    clueChoices: [
      { words: { en: "On the x-axis", hi: "x-अक्ष पर" }, y: 0 },
      { words: { en: "3 to the right", hi: "3 दाईं ओर" }, x: 3 },
    ],
    hidden: { x: 3, y: 0 },
    canHide: true,
  },
};
const plottingGiven = {
  toPlot: [
    { x: 1, y: 2 },
    { x: 0, y: -1.25 },
  ],
  showTable: true,
  showSwaps: true,
  scaleChoices: [1, 2],
};
const plotting = { plotting: plottingGiven };
const dice = {
  plane: { window: { xMin: 0, xMax: 10, yMin: 0, yMax: 10 }, hasGrid: true },
  dice: {
    counters: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
  },
};
const figurePlane = {
  canShowPoints: true,
  points: [
    { name: "B", x: -2, y: 2, isShown: false, hasDropLines: true, tone: "main" },
    { name: "D", x: 2, y: 2, isShown: true, hasDropLines: false, tone: "main" },
  ],
};
const figure = { plane: figurePlane };

describe("coordinatePlane, used the way the boards use it", () => {
  it("every input says what it does, and every learner's action has one", () => {
    expect(
      checkProp(coordinatePlaneProp, [
        town,
        inTown(
          {},
          {
            at: { x: 2, y: 0 },
            trail: [
              { x: 1, y: 0 },
              { x: 2, y: 0 },
            ],
          },
        ),
        axes,
        apart,
        reading,
        guessing,
        clues,
        plotting,
        { plotting: { ...plottingGiven, plotted: [{ x: 1, y: 2, isRight: true }] } },
        dice,
        figure,
      ]),
    ).toEqual([]);
  });
});

describe("what the student sees", () => {
  it("the town: the lines' names, a button on every street and house number, a house to tap, Riya", () => {
    const s = seen(town);
    expect(s.at("plane/xName")?.value).toBe("Street number");
    expect(s.at("plane/yName")?.value).toBe("House number");
    expect(s.ids).toContain("plane/tapNumber:x2");
    expect(s.ids).toContain("places/chooseTarget:2,1");
    expect(s.at("walker/walker")).toMatchObject({ value: { x: 0, y: 0 }, words: "Riya (0, 0)" });
    // The arrows: only → leads anywhere from the corner (no street goes up there).
    expect(s.at("walker/step:right")?.isOff).toBeUndefined();
    expect(s.at("walker/step:up")?.isOff).toBe(true);
    expect(s.at("walker/step:left")?.isOff).toBe(true);
  });
  it("Aman's house, once chosen, is written by its full address", () => {
    const s = seen(inTown({ target: { x: 3, y: 2 } }));
    expect(s.at("places/target")).toMatchObject({
      value: { x: 3, y: 2 },
      words: "Aman's house: Street number 3, House number 2",
    });
  });
  it("Riya's line says where she is as she walks, and that she's there at Aman's house", () => {
    const route = [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
    ];
    const onTheWay = seen(inTown({ target: { x: 3, y: 2 } }, { at: { x: 3, y: 1 }, trail: route }));
    expect(onTheWay.at("walker/whereWalker")?.words).toBe("Riya: Street number 3, House number 1");
    const there = seen(
      inTown({ target: { x: 3, y: 2 } }, { at: { x: 3, y: 2 }, trail: [...route, { x: 3, y: 2 }] }),
    );
    expect(there.at("walker/whereWalker")?.words).toBe(
      "Riya is at Aman's house! Street number 3, House number 2",
    );
  });
  it("a measured distance carries its unit", () => {
    const s = seen({ reading: { point: { x: 3, y: 2 }, reading: Reading.Distances, unit: "m" } });
    expect(s.at("reading/point")?.words).toBe("3 m, 2 m");
  });
  it("a question can turn the readouts off: no address above, no line under", () => {
    const s = seen(
      inTown(
        { target: { x: 3, y: 2 }, showAddress: false },
        {
          showWhere: false,
          at: { x: 3, y: 0 },
          trail: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
          ],
        },
      ),
    );
    expect(s.ids).not.toContain("places/target");
    expect(s.ids).not.toContain("walker/whereWalker");
  });
  it("a point read as far as the board writes it; in a guessing round, only ?", () => {
    expect(seen(reading).at("reading/point")).toMatchObject({
      value: { x: 2, y: -1 },
      words: "(2, −1)",
    });
    const g = seen(guessing);
    expect(g.at("reading/point")).toMatchObject({ value: null, words: "?" });
    expect(g.ids).toContain("reading/showReading");
  });
  it("the hidden point is known, not shown, until the learner asks", () => {
    const s = seen(clues);
    expect(s.ids).not.toContain("clues/hidden");
    expect(s.hidden).toMatchObject({ clues: { hidden: { x: 3, y: 0 } } });
    expect(s.ids).toContain("clues/giveClue:0");
  });
  it("the dice game: both counters, the throw, whose turn", () => {
    const s = seen(dice);
    expect(s.at("dice/counter1")?.words).toBe("Riya (0, 0)");
    expect(s.at("dice/counter2")?.words).toBe("Aman (0, 0)");
    expect(s.ids).toContain("dice/throwDice");
  });
  it("no Next point button unless the board gives one: the lesson shows the points itself", () => {
    expect(seen({ plane: { ...figurePlane, canShowPoints: false } }).ids).not.toContain(
      "plane/showPoint",
    );
  });
  it("a figure's points show one at a time, by name, with the next behind a button", () => {
    const s = seen(figure);
    expect(s.at("plane/pointD")).toMatchObject({ value: { x: 2, y: 2 }, words: "D" });
    expect(s.ids).not.toContain("plane/pointB");
    expect(s.ids).toContain("plane/showPoint");
  });
});

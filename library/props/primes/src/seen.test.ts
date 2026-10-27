import { type PropModule, checkProp, describeView } from "@chalk/player";
import { type Element, initialState, viewOf } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  billSplitProp,
  factorTreeProp,
  lapRaceProp,
  primeTowersProp,
  stickMeasureProp,
  sweetShareProp,
  tenMakerProp,
} from "./index";
import { TenStage } from "./ten-maker";

/** A prop placed with these fields, as the student sees it (read from what its view draws). */
function seen(module: PropModule, given: Readonly<Record<string, unknown>> = {}) {
  const start = initialState(module.def, given);
  if (!start.isOk) throw new Error(start.errors.join("; "));
  const described = describeView(module, viewOf(module.def, start.state));
  const at = (id: string): Element | undefined => described.elements.find((e) => e.id === id);
  return { ...described, ids: described.elements.map((e) => e.id), at };
}

describe("every prop here, used the way a lesson uses it", () => {
  it.each([
    ["sweetShare", sweetShareProp, [{}, { isEditable: true, showSum: true, showLog: true }]],
    ["factorTree", factorTreeProp, [{}, { isEditable: true }]],
    ["stickMeasure", stickMeasureProp, [{}, { isEditable: true, pieceChoices: [2, 3, 6] }]],
    ["lapRace", lapRaceProp, [{}]],
    ["primeTowers", primeTowersProp, [{ choices: ["hcf", "lcm", "product"], isEditable: true }]],
    ["tenMaker", tenMakerProp, [{ numerator: 3, denominator: 8 }, { isEditable: true }]],
    ["billSplit", billSplitProp, [{}]],
  ] as const)(
    "%s: every input says what it does, and every learner's action has one",
    (_, module, starts) => {
      expect(checkProp(module, starts)).toEqual([]);
    },
  );
});

describe("sweetShare: what the student sees", () => {
  it("the box, the plates and the buttons; the answer known but not shown", () => {
    const s = seen(sweetShareProp, { sweets: 17, friends: 5 });
    expect(s.ids).toEqual(["box", "plates", "giveRound", "startAgain"]);
    expect(s.at("box")).toEqual({ id: "box", value: 17, words: "17 sweets" });
    expect(s.at("giveRound")?.does).toBe("giveRound");
    expect(s.at("startAgain")).toEqual({ id: "startAgain", isOff: true });
    expect(s.hidden).toEqual({ quotient: 3, remainder: 2 });
  });
  it("the sum and the log when the page wants them; a and b when they can be changed", () => {
    const s = seen(sweetShareProp, {
      sweets: 20,
      friends: 6,
      rounds: 2,
      showSum: true,
      showLog: true,
      isEditable: true,
    });
    expect(s.ids.slice(0, 2)).toEqual(["setSweets", "setFriends"]);
    expect(s.at("setFriends")).toEqual({
      id: "setFriends",
      value: 6,
      does: "setFriends",
      isByHand: true,
    });
    expect(s.at("sum")?.words).toBe("20 = 6 × 2 + 8");
    expect(s.at("log")?.value).toEqual([
      { rounds: 0, box: 20 },
      { rounds: 1, box: 14 },
      { rounds: 2, box: 8 },
    ]);
  });
});

describe("factorTree: what the student sees", () => {
  it("a picked end offers its pairs; every node can be pointed at", () => {
    const s = seen(factorTreeProp, {
      number: 360,
      splits: [{ node: "r", factor: 10 }],
      selected: "r0",
    });
    expect(s.ids).toEqual(expect.arrayContaining(["node:r0", "node:r1", "pairs", "split:2"]));
    expect(s.at("node:r")?.words).toBe("360, split into 10 × 36");
    // An end not split yet can be picked: it does select, and is named by what it shows.
    expect(s.at("node:r1")?.does).toBe("select");
  });
  it("complete: the primes and the equation", () => {
    const s = seen(factorTreeProp, {
      number: 12,
      splits: [
        { node: "r", factor: 2 },
        { node: "r1", factor: 2 },
      ],
    });
    expect(s.at("equation")?.words).toBe("12 = 2² × 3");
    expect(s.at("prime:2")?.value).toBe(2);
  });
});

describe("tenMaker: what the student sees", () => {
  it("one button for the next step, the working so far, and the decimal known but not shown", () => {
    const s = seen(tenMakerProp, { numerator: 3, denominator: 8, stage: TenStage.Given });
    expect(s.ids).toEqual(["beads", "working", "cancel", "startAgain"]);
    expect(s.hidden).toEqual({ decimal: "0.375" });
    expect(
      seen(tenMakerProp, { numerator: 3, denominator: 8, stage: TenStage.ToppedUp }).at("beads")
        ?.words,
    ).toBe("3 tens");
  });
  it("a prime with no partner is named, and Add goes dead", () => {
    const s = seen(tenMakerProp, { numerator: 1, denominator: 7, stage: TenStage.Paired });
    expect(s.at("beads")?.words).toBe("0 tens; no partner possible: 7");
    expect(s.at("topUp")?.isOff).toBe(true);
  });
});

describe("stickMeasure: what the student sees", () => {
  it("what's laid and left over, and the steps so far", () => {
    const start = { stickA: 18, stickB: 12 };
    expect(seen(stickMeasureProp, start).ids).toEqual(["sticks", "lay", "startAgain"]);
    const laid = seen(stickMeasureProp, { ...start, isLaid: true });
    expect(laid.ids).toContain("keep");
    expect(laid.at("working")?.value).toEqual(["12 fits 1 time along 18, 6 left over"]);
    const done = seen(stickMeasureProp, { ...start, rounds: 1, isLaid: true });
    expect(done.at("lay")?.isOff).toBe(true);
  });
  it("marks pieces along every stick", () => {
    const s = seen(stickMeasureProp, {
      stickA: 18,
      stickB: 12,
      isLaid: true,
      piece: 4,
      pieceChoices: [3, 4],
      canLay: false,
    });
    // Without Lay and Keep the steps aren't written: the pieces are the point here.
    expect(s.ids).toEqual(["sticks", "tryPiece:3", "tryPiece:4"]);
    expect(s.at("tryPiece:4")?.args).toEqual({ length: 0 });
  });
});

describe("lapRace: what the student sees", () => {
  it("the track, the clock, both logs and the buttons, as drawn", () => {
    const s = seen(lapRaceProp, { time: 36 });
    expect(s.ids).toEqual(["track", "clock", "logA", "logB", "play", "startAgain"]);
    expect(s.at("logA")?.words).toBe("Sonia at the start at 18 (18 × 1), 36 (18 × 2)");
    expect(s.at("clock")?.value).toBe(36);
  });
});

describe("primeTowers: what the student sees", () => {
  it("each prime's towers, the result and the buttons", () => {
    const s = seen(primeTowersProp, { show: "hcf", choices: ["hcf", "lcm"] });
    expect(s.ids).toEqual(["tower:2", "tower:3", "result", "show:hcf", "show:lcm"]);
    expect(s.at("tower:2")?.words).toBe("2: 18 has 1, 12 has 2");
    expect(s.at("result")?.value).toBe("HCF = 2 × 3 = 6");
  });
});

describe("billSplit: what the student sees", () => {
  it("a button per size, and the shares tried", () => {
    const s = seen(billSplitProp, { tried: [3, 8], chosen: 8 });
    expect(s.at("split:8")).toMatchObject({ does: "split", args: { n: 8 } });
    expect(s.at("shares")?.value).toEqual([
      { n: 3, share: "₹33.(3)", ends: false },
      { n: 8, share: "₹12.5", ends: true },
    ]);
  });
});

import type { PropViewProps } from "@chalk/player";
import { type AnyPropDef, type StoredState, asAnyProp, observationOf, viewOf } from "@chalk/prop";
import type { ComponentType } from "preact";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { billSplit } from "./bill-split";
import { BillSplitView } from "./bill-split-view";
import { factorTree } from "./factor-tree";
import { FactorTreeView } from "./factor-tree-view";
import { lapRace } from "./lap-race";
import { LapRaceView } from "./lap-race-view";
import { hcfLine, lcmLine, primeTowers } from "./prime-towers";
import { PrimeTowersView } from "./prime-towers-view";
import { stickMeasure } from "./stick-measure";
import { StickMeasureView } from "./stick-measure-view";
import { sweetShare } from "./sweet-share";
import { SweetShareView } from "./sweet-share-view";
import { TenStage, tenMaker } from "./ten-maker";
import { TenMakerView } from "./ten-maker-view";

const noop = () => undefined;

const extra = {
  isEditable: false,
  cancelLabel: { en: "Cancel", hi: "काटो" },
  pairLabel: { en: "Pair into tens", hi: "दहाई में जोड़ो" },
  topUpLabel: { en: "Add {p}s", hi: "{p} जोड़ो" },
};

/** Any prop's view (each is typed by its own prop). */
type AnyView = (props: never) => unknown;

/** The view drawn at phone width, as HTML. */
function drawn(def: AnyPropDef, View: AnyView, s: StoredState): string {
  const props: PropViewProps = {
    view: viewOf(def, s),
    locale: "en",
    width: 360,
    call: noop,
    signal: noop,
  };
  return renderToString(h(View as unknown as ComponentType<PropViewProps>, props));
}

/** Every element's id is tagged `data-part` in the view drawn from the same state */
function expectAddressable(def: AnyPropDef, View: AnyView, s: StoredState) {
  const html = drawn(def, View, s);
  const seen = observationOf(def, s);
  const tagged = new Set([...html.matchAll(/data-part="([^"]+)"/g)].map((m) => m[1]));
  for (const e of seen.elements) expect(tagged, `${def.type}: ${e.id}`).toContain(e.id);
  return { seen, html, ids: seen.elements.map((e) => e.id) };
}

const shown = (def: AnyPropDef, s: StoredState, id: string) =>
  observationOf(def, s).elements.find((e) => e.id === id)?.value;

describe("sweetShare: what the student sees", () => {
  const def = asAnyProp(sweetShare);
  const start = {
    sweets: 17,
    friends: 5,
    rounds: 0,
    isEditable: false,
    showSum: false,
    showLog: false,
    shareLabel: { en: "Give everyone one", hi: "सबको एक दो" },
    roundsLabel: { en: "Rounds", hi: "बारियाँ" },
    boxLabel: { en: "Left in the box", hi: "डिब्बे में बचीं" },
  };
  it("names the plates, the box and the buttons; keeps the answer hidden until it ends", () => {
    const { seen, ids } = expectAddressable(def, SweetShareView, start);
    expect(ids).toEqual(["plates", "box", "giveRound", "startAgain"]);
    expect(seen.hidden).toEqual({ rounds: 3, box: 2 });
    const done = { ...start, rounds: 3, showSum: true };
    const end = expectAddressable(def, SweetShareView, done);
    expect(end.seen.hidden).toBeUndefined();
    expect(shown(def, done, "sum")).toBe("17 = 5 × 3 + 2");
    expect(shown(def, done, "giveRound")).toBe("disabled");
  });
  it("keeps a row for every round when the log is on", () => {
    const s = { ...start, sweets: 20, friends: 6, rounds: 2, showLog: true };
    expectAddressable(def, SweetShareView, s);
    expect(shown(def, s, "log")).toEqual([
      "0 rounds: 20 left in the box",
      "1 round: 14 left in the box",
      "2 rounds: 8 left in the box",
    ]);
  });
  it("shows a and b only when they can be changed", () => {
    const { ids } = expectAddressable(def, SweetShareView, { ...start, isEditable: true });
    expect(ids.slice(0, 2)).toEqual(["a", "b"]);
  });
});

describe("factorTree: what the student sees", () => {
  const def = asAnyProp(factorTree);
  it("before a split: only the number, with the factorisation hidden", () => {
    const s = { number: 360, splits: [], selected: null, isEditable: false };
    const { seen, ids } = expectAddressable(def, FactorTreeView, s);
    expect(ids).toEqual(["node:r", "startAgain"]);
    expect(seen.hidden).toEqual({ factorisation: "2³ × 3² × 5" });
  });
  it("a picked end offers its pairs; every node and pair can be pointed at", () => {
    const s = {
      number: 360,
      splits: [{ node: "r", factor: 10 }],
      selected: "r0",
      isEditable: false,
    };
    const { ids } = expectAddressable(def, FactorTreeView, s);
    expect(ids).toEqual(expect.arrayContaining(["node:r0", "node:r1", "pairs", "pair:2"]));
    expect(shown(def, s, "node:r")).toBe("360, split into 10 × 36");
  });
  it("complete: the primes and equation, nothing hidden", () => {
    const s = {
      number: 12,
      splits: [
        { node: "r", factor: 2 },
        { node: "r1", factor: 2 },
      ],
      selected: null,
      isEditable: false,
    };
    const { seen } = expectAddressable(def, FactorTreeView, s);
    expect(seen.hidden).toBeUndefined();
    expect(shown(def, s, "equation")).toBe("12 = 2² × 3");
  });
});

describe("tenMaker: what the student sees", () => {
  const def = asAnyProp(tenMaker);
  it("one button for the next step, the working so far, and the decimal hidden until the end", () => {
    const s = { numerator: 3, denominator: 8, stage: TenStage.Given, ...extra };
    const given = expectAddressable(def, TenMakerView, s);
    expect(given.ids).toEqual(["beads", "working", "cancel", "startAgain"]);
    expect(given.seen.hidden).toEqual({ decimal: "0.375" });
    expect(expectAddressable(def, TenMakerView, { ...s, stage: TenStage.Cancelled }).ids).toContain(
      "pair",
    );
    const topped = { ...s, stage: TenStage.ToppedUp };
    const after = expectAddressable(def, TenMakerView, topped);
    expect(after.seen.hidden).toBeUndefined();
    expect(shown(def, topped, "beads")).toBe("3 tens");
  });
  it("a prime with no partner is named, and Add goes dead", () => {
    const s = { numerator: 1, denominator: 7, stage: TenStage.Paired, ...extra };
    const { seen } = expectAddressable(def, TenMakerView, s);
    expect(shown(def, s, "beads")).toBe("0 tens; no partner possible: 7");
    expect(seen.hidden).toEqual({ decimal: "does not terminate" });
    expect(shown(def, s, "topUp")).toBe("disabled");
  });
});

describe("stickMeasure: what the student sees", () => {
  const def = asAnyProp(stickMeasure);
  const start = { ...stickMeasure.defaults, stickA: 18, stickB: 12 };
  it("says what's laid and left over, in the lesson's words, and hides the answer till the end", () => {
    const { seen, ids } = expectAddressable(def, StickMeasureView, start);
    expect(ids).toEqual(["sticks", "lay", "startAgain"]);
    expect(seen.hidden).toEqual({ hcf: 6 });
    const laid = { ...start, isLaid: true };
    expect(expectAddressable(def, StickMeasureView, laid).ids).toContain("keep");
    expect(shown(def, laid, "working")).toEqual(["12 fits 1 time along 18, 6 left over"]);
    const done = { ...start, rounds: 1, isLaid: true };
    expect(expectAddressable(def, StickMeasureView, done).seen.hidden).toBeUndefined();
    expect(shown(def, done, "lay")).toBe("disabled");
    expect(shown(def, done, "working")).toEqual([
      "12 fits 1 time along 18, 6 left over",
      "6 fits 2 times along 12, nothing left over",
    ]);
  });
  it("marks pieces along every stick and writes letters in a proof", () => {
    const s = { ...start, isLaid: true, piece: 4, pieceChoices: [3, 4], canLay: false };
    const { ids } = expectAddressable(def, StickMeasureView, s);
    // Without Lay and Keep the steps aren't written: the pieces are the point here.
    expect(ids).toEqual(["sticks", "piece-3", "piece-4"]);
    expect(shown(def, s, "sticks")).toBe(
      "a stick of 18 and a stick of 12; 12 laid along 18 1 time: 6 left over; pieces of 4 marked: 18 leaves 2, 12 fits, 6 leaves 2",
    );
    const lettered = { ...start, isLaid: true, letters: { long: "a", short: "b", left: "r" } };
    expect(expectAddressable(def, StickMeasureView, lettered).ids).not.toContain("working");
  });
});

describe("lapRace: what the student sees", () => {
  const def = asAnyProp(lapRace);
  it("names the track, clock, both logs and the buttons, as drawn", () => {
    const s = { ...lapRace.defaults, time: 36 };
    const { ids, seen } = expectAddressable(def, LapRaceView, s);
    expect(ids).toEqual(["track", "clock", "logA", "logB", "play", "startAgain"]);
    expect(shown(def, s, "logA")).toBe("Sonia at the start at 18 (18 × 1), 36 (18 × 2)");
    expect(shown(def, s, "logB")).toBe(
      "Ravi at the start at 12 (12 × 1), 24 (12 × 2), 36 (12 × 3)",
    );
    expect(seen.hidden).toBeUndefined();
    expect(observationOf(def, { ...s, time: 24 }).hidden).toEqual({ lcm: 36 });
  });
});

describe("primeTowers: what the student sees", () => {
  const def = asAnyProp(primeTowers);
  it("names each prime's towers, the result and the buttons, as drawn", () => {
    const s = { ...primeTowers.defaults, show: "hcf" as const };
    const { ids } = expectAddressable(def, PrimeTowersView, s);
    expect(ids).toEqual(["tower:2", "tower:3", "result", "hcf", "lcm"]);
    expect(shown(def, s, "tower:2")).toBe("2: 18 has 1, 12 has 2");
    expect(hcfLine(18, 12)).toBe("2 × 3 = 6");
    expect(lcmLine(18, 12)).toBe("2² × 3² = 36");
    expect(
      expectAddressable(def, PrimeTowersView, { ...s, show: "product" as const }).ids,
    ).toContain("result");
    const typed = { ...primeTowers.defaults, isEditable: true };
    expect(expectAddressable(def, PrimeTowersView, typed).ids.slice(0, 2)).toEqual(["a", "b"]);
  });
});

describe("billSplit: what the student sees", () => {
  const def = asAnyProp(billSplit);
  it("a button per size, and the shares tried", () => {
    const s = { ...billSplit.defaults, tried: [3, 8], chosen: 8 };
    const { ids } = expectAddressable(def, BillSplitView, s);
    expect(ids).toEqual([...billSplit.defaults.sizes.map((n) => `size-${n}`), "shares"]);
    expect(shown(def, s, "shares")).toEqual(["3: ₹33.(3)", "8: ₹12.5"]);
  });
});

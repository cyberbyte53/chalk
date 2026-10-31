import { type Raised, asAnyProp, initialState } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import type { ZodType, z } from "zod";
import { clues, stillPossible } from "./clues";
import { coordinatePlane } from "./coordinate-plane";
import { dice, throwOf } from "./dice";
import { places } from "./places";
import { Marks, Scene, placeOf, plane } from "./plane";
import { plotting } from "./plotting";
import { reading } from "./reading";
import { door } from "./test-door";
import { Direction, Roads, stepFrom, walker } from "./walker";

/** A part, or the whole plane, placed with these fields, as a board would place it. */
function start<P extends { readonly state: ZodType }>(
  def: P,
  given: Readonly<Record<string, unknown>> = {},
): z.infer<P["state"]> {
  const made = initialState(asAnyProp(def as never), given);
  if (!made.isOk) throw new Error(made.errors.join("; "));
  return made.state as z.infer<P["state"]>;
}

const signals = (emit: readonly { signal: string }[]) => emit.map((e) => e.signal);

const whole = door(coordinatePlane);
type Whole = ReturnType<typeof town>;
const onPlane = door(plane);
const onWalker = door(walker);
type Walker = ReturnType<typeof walkerInTown>;
const onPlaces = door(places);
const onReading = door(reading);
const onClues = door(clues);
const onPlotting = door(plotting);
const onDice = door(dice);
type Dice = z.infer<typeof dice.state>;

/** Lesson 1's town: streets counted from 1 along the main road, houses up each street. */
const houses = Array.from({ length: 5 }, (_, i) =>
  Array.from({ length: 4 }, (_, j) => ({ x: i + 1, y: j + 1 })),
).flat();
const townWindow = { xMin: 0, xMax: 6, yMin: 0, yMax: 5 };
const axisNames = [
  { en: "Street number", hi: "गली नंबर" },
  { en: "House number", hi: "मकान नंबर" },
];
const townPlane = { window: townWindow, marks: Marks.Counts, scene: Scene.Town, axisNames };
/** The whole town: the plane, its houses, and Riya at the corner. */
const town = () =>
  start(coordinatePlane, {
    plane: townPlane,
    places: { places: houses },
    walker: { walkFrom: { x: 0, y: 0 }, roads: Roads.Town },
  });
/** The houses alone, given the plane's fields they are drawn by. */
const housesAlone = () => start(places, { window: townWindow, axisNames, places: houses });
/** Riya alone in the town, given the plane's fields she walks by. */
const walkerInTown = () =>
  start(walker, {
    window: townWindow,
    marks: Marks.Counts,
    scene: Scene.Town,
    axisNames,
    walkFrom: { x: 0, y: 0 },
    roads: Roads.Town,
  });

type Played<S> = { state: S; emit: readonly Raised[] };
/** Riya taps her way along: each tap one block, played to its end. */
const walkWith =
  <S>(
    play: (s: S, direction: Direction) => Promise<Played<S>>,
    run: (s: S, direction: Direction) => Played<S>,
  ) =>
  async (s: S, ...directions: Direction[]) => {
    let now = s;
    const emitted: string[] = [];
    for (const direction of directions) {
      let out: Played<S>;
      try {
        out = await play(now, direction);
      } catch {
        // A blocked step doesn't take time: it stays put and says so.
        out = run(now, direction);
      }
      now = out.state;
      emitted.push(...signals(out.emit));
    }
    return { state: now, emitted };
  };
/** Riya on her own. */
const walk = walkWith<Walker>(
  (s, direction) => onWalker.play(s, "step", { direction }),
  (s, direction) => onWalker.run(s, "step", { direction }),
);
/** Riya in the whole town, where Aman's house is the places'. */
const walkInTown = walkWith<Whole>(
  (s, direction) => whole.play(s, "walker.step", { direction }),
  (s, direction) => whole.run(s, "walker.step", { direction }),
);
const along = (n: number) => Array<Direction>(n).fill(Direction.Right);
const up = (n: number) => Array<Direction>(n).fill(Direction.Up);

describe("the town: Aman's house is any house a tap makes it, and Riya walks there on the roads", () => {
  it("a tap on Street 4, House 3 makes it Aman's house; a tap off the houses does nothing", () => {
    const out = onPlaces.run(housesAlone(), "chooseTarget", { x: 4, y: 3 });
    expect(out.state.target).toEqual({ x: 4, y: 3 });
    expect(out.emit).toEqual([
      { signal: "targetChosen", payload: { x: 4, y: 3, isAnother: false } },
    ]);
    expect(onPlaces.run(out.state, "chooseTarget", { x: 6, y: 5 }).state).toEqual(out.state);
  });
  it("a board that fixes Aman's house: taps don't move it", () => {
    const s = { ...housesAlone(), target: { x: 2, y: 1 }, canChooseTarget: false };
    expect(onPlaces.run(s, "chooseTarget", { x: 4, y: 3 }).state.target).toEqual({ x: 2, y: 1 });
  });
  it("the target must be a house: a state with it elsewhere is refused", () => {
    expect(onPlaces.rejects(housesAlone(), { target: { x: 6, y: 5 } })).toBe(true);
  });
  it("4 blocks right, then 3 up: she stands at Aman's house, and says she has arrived", async () => {
    const s = whole.run(town(), "places.chooseTarget", { x: 4, y: 3 }).state;
    const { state, emitted } = await walkInTown(s, ...along(4), ...up(3));
    expect(state.walker.at).toEqual({ x: 4, y: 3 });
    expect(state.walker.isWalking).toBe(false);
    expect(emitted).toEqual([...Array(7).fill("walker.stepped"), "walker.arrived"]);
    expect(state.walker.trail).toHaveLength(7);
  });
  it("each tap goes on from where she is: no going back to the corner", async () => {
    const first = await walk(walkerInTown(), ...along(2));
    const then = await walk(first.state, ...along(1), ...up(2));
    expect(then.state.at).toEqual({ x: 3, y: 2 });
    expect(then.state.trail).toHaveLength(5);
  });
  it("going back the way she came takes those blocks off her route: it runs from the start to her", async () => {
    const out = await walk(walkerInTown(), ...along(3), Direction.Left, Direction.Left);
    expect(out.state.at).toEqual({ x: 1, y: 0 });
    expect(out.state.trail).toEqual([{ x: 1, y: 0 }]);
    const back = await walk(out.state, Direction.Left);
    expect(back.state.trail).toEqual([]);
  });
  it("the town grown past the corner: west along the road, south on a street, up her corner's street", () => {
    const grown = (at: { x: number; y: number }) => ({
      ...walkerInTown(),
      window: { xMin: -4.5, xMax: 4.5, yMin: -3.5, yMax: 3.5 },
      at,
    });
    expect(stepFrom(grown({ x: 0, y: 0 }), Direction.Left)).toEqual({ to: { x: -1, y: 0 } });
    expect(stepFrom(grown({ x: 0, y: 0 }), Direction.Up)).toEqual({ to: { x: 0, y: 1 } });
    expect(stepFrom(grown({ x: -2, y: 0 }), Direction.Down)).toEqual({ to: { x: -2, y: -1 } });
    // Lesson 1's town, which starts at the corner: none of that.
    expect("blocked" in stepFrom({ ...walkerInTown(), at: { x: 2, y: 0 } }, Direction.Down)).toBe(
      true,
    );
  });
  it("in the town she walks only on roads: across on the main road, up and down a street", async () => {
    // From the corner there is no street going up; from up a street there's no road across.
    expect(stepFrom(walkerInTown(), Direction.Up)).toEqual({ blocked: "no street going up here" });
    const onStreet = (await walk(walkerInTown(), ...along(2), ...up(1))).state;
    expect("blocked" in stepFrom(onStreet, Direction.Right)).toBe(true);
    expect("blocked" in stepFrom(onStreet, Direction.Left)).toBe(true);
    const blocked = await walk(onStreet, Direction.Right);
    expect(blocked.state.at).toEqual({ x: 2, y: 1 });
    expect(blocked.emitted).toEqual(["blocked"]);
    // Nothing below the main road, and nothing off the map.
    expect("blocked" in stepFrom(walkerInTown(), Direction.Down)).toBe(true);
    expect("blocked" in stepFrom(walkerInTown(), Direction.Left)).toBe(true);
  });
  it("so in the town, any walk to a house is along the main road first, then up its street", async () => {
    // Every road route from the corner to (a, b): her x changes only while y is 0.
    for (const [a, b] of [
      [4, 3],
      [1, 4],
      [5, 1],
    ] as const) {
      const { state } = await walk(walkerInTown(), ...along(a), ...up(b));
      let lastAcross = -1;
      state.trail.forEach((p, i) => {
        if (p.y === 0) lastAcross = i;
      });
      expect(state.trail.slice(lastAcross + 1).every((p) => p.x === a)).toBe(true);
      expect(state.at).toEqual({ x: a, y: b });
    }
  });
  it("on a grid every line is a road: she can turn anywhere", async () => {
    const city = start(walker, {
      window: { xMin: 0, xMax: 5, yMin: 0, yMax: 5 },
      walkFrom: { x: 0, y: 0 },
    });
    const { state } = await walk(
      city,
      Direction.Up,
      Direction.Right,
      Direction.Up,
      Direction.Right,
    );
    expect(state.at).toEqual({ x: 2, y: 2 });
  });
  it("↺ takes her back to the start and clears her route", async () => {
    const { state } = await walk(walkerInTown(), ...along(3));
    expect(onWalker.run(state, "backToStart").state).toMatchObject({
      at: { x: 0, y: 0 },
      trail: [],
    });
  });
  it("she can't stand off the map", () => {
    expect(onWalker.rejects(walkerInTown(), { at: { x: 9, y: 0 } })).toBe(true);
  });
  it("walkTo: a lesson walks her from the start to (x, y), along then up, block by block", async () => {
    const s = start(walker, { walkFrom: { x: 0, y: 0 } });
    const played = await onWalker.play(s, "walkTo", { x: -3, y: 2 });
    expect(played.state.at).toEqual({ x: -3, y: 2 });
    expect(played.state.trail).toEqual([
      { x: -1, y: 0 },
      { x: -2, y: 0 },
      { x: -3, y: 0 },
      { x: -3, y: 1 },
      { x: -3, y: 2 },
    ]);
    expect(signals(played.emit)).toEqual(Array(5).fill("stepped"));
  });
  it("Street 4 lit: the four houses on it", () => {
    // A tap on the plane's street number lights the places; the number shows pressed.
    const out = whole.run(town(), "plane.tapNumber", { axis: "x", value: 4 });
    const seen = whole.look(out.state) as { places: { litCount: number }; plane: { lit: unknown } };
    expect(seen.places.litCount).toBe(4);
    expect(seen.plane.lit).toEqual({ axis: "x", value: 4 });
    const lit = out.emit.find((e) => e.signal === "places.lineLit");
    expect(lit?.payload).toEqual({ axis: "x", value: 4, count: 4 });
  });
  it("counts start from 1 at the corner: a town can't reach below 0", () => {
    const s = start(plane, townPlane);
    expect(onPlane.rejects(s, { window: { xMin: -2, xMax: 6, yMin: 0, yMax: 5 } })).toBe(true);
  });
});

describe("reading a point: its quadrant follows its signs", () => {
  it("each sign pattern is its quadrant; a 0 puts it on an axis", () => {
    expect(placeOf({ x: 2, y: 3 })).toBe("I");
    expect(placeOf({ x: -2, y: 3 })).toBe("II");
    expect(placeOf({ x: -2, y: -3 })).toBe("III");
    expect(placeOf({ x: 2, y: -3 })).toBe("IV");
    expect(placeOf({ x: 0, y: -3 })).toBe("y-axis");
    expect(placeOf({ x: 5, y: 0 })).toBe("x-axis");
    expect(placeOf({ x: 0, y: 0 })).toBe("O");
  });
  it("Fig. 3.14's points are where the book says", () => {
    const fig: [number, number, string][] = [
      [-5, 2, "II"],
      [6, 2, "I"],
      [0, 5, "y-axis"],
      [-3, 0, "x-axis"],
      [-5, -3, "III"],
      [2, -4, "IV"],
      [-3, -5, "III"],
      [5, -5, "IV"],
    ];
    for (const [x, y, place] of fig) expect(placeOf({ x, y })).toBe(place);
  });
  it("a drag snaps to the step and stays on the plane; abscissa and ordinate read off it", () => {
    const out = onReading.run(start(reading), "movePoint", { x: 2.3, y: -1.6 });
    expect(out.state.point).toEqual({ x: 2, y: -2 });
    expect(onReading.look(out.state)).toMatchObject({ abscissa: 2, ordinate: -2, place: "IV" });
    expect(onReading.run(start(reading), "movePoint", { x: 40, y: -40 }).state.point).toEqual({
      x: 6,
      y: -5,
    });
    const quarters = onReading.run(start(reading, { pointStep: 0.25 }), "movePoint", {
      x: 1.3,
      y: 0.6,
    });
    expect(quarters.state.point).toEqual({ x: 1.25, y: 0.5 });
  });
  it("each quadrant is remembered the first time the point is in it, not on an axis", () => {
    let s = start(reading);
    const entered: unknown[] = [];
    for (const p of [
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 0, y: 3 },
      { x: -1, y: 2 },
      { x: 3, y: 3 },
    ]) {
      const out = onReading.run(s, "movePoint", p);
      s = out.state;
      entered.push(...out.emit.filter((e) => e.signal === "enteredQuadrant"));
    }
    expect(s.visited).toEqual(["I", "II"]);
    expect(entered).toHaveLength(2);
  });
  it("a guessing round hides the reading until it is shown", () => {
    const asked = onReading.run(start(reading), "askAt", { x: -3, y: 4 }).state;
    expect(asked).toMatchObject({ point: { x: -3, y: 4 }, isReadingHidden: true });
    const shown = onReading.run(asked, "showReading");
    expect(shown.state.isReadingHidden).toBe(false);
    expect(shown.emit).toEqual([{ signal: "readingShown", payload: { x: -3, y: 4 } }]);
  });
});

describe("the plane's own parts, named when the lesson defines them", () => {
  it("the two number lines glide until their zeroes meet: then they are the axes, and O shows", async () => {
    const s = start(plane, { apart: { x: 3, y: -2 }, showOrigin: false });
    expect(onPlane.look(s).isCrossed).toBe(false);
    const played = await onPlane.play(s, "bringTogether");
    expect(played.state).toMatchObject({ apart: { x: 0, y: 0 }, showOrigin: true });
    expect(signals(played.emit)).toEqual(["crossed"]);
    // On the way, the line only ever comes closer.
    const gaps = played.frames.map((f) => Math.hypot(f.apart.x, f.apart.y));
    for (let i = 1; i < gaps.length; i++)
      expect(gaps[i]).toBeLessThanOrEqual((gaps[i - 1] ?? 0) + 1e-9);
  });
  it("the sweep names I, II, III, IV in turn", async () => {
    const played = await onPlane.play(start(plane), "numberQuadrants");
    expect(played.frames.map((f) => f.quadrantsNamed)).toEqual([0, 1, 2, 3, 4]);
    expect(signals(played.emit)).toEqual(["quadrantsNumbered"]);
  });
  it("a figure's points come one at a time, or the one named", () => {
    const points = ["B", "D", "L"].map((name, i) => ({
      name,
      x: i,
      y: i,
      isShown: false,
      hasDropLines: false,
      tone: "main" as const,
    }));
    let s = start(plane, { points });
    s = onPlane.run(s, "showPoint", {}).state;
    s = onPlane.run(s, "showPoint", { name: "L" }).state;
    expect(s.points.map((p) => p.isShown)).toEqual([true, false, true]);
    expect(onPlane.run(s, "showAllPoints").state.points.every((p) => p.isShown)).toBe(true);
  });
  it("a tap names the part", () => {
    expect(onPlane.run(start(plane), "namePart", { part: "OX′" }).state.named).toBe("OX′");
  });
  it("a window must run low to high", () => {
    expect(onPlane.rejects(start(plane), { window: { xMin: 3, xMax: 3, yMin: 0, yMax: 1 } })).toBe(
      true,
    );
  });
});

describe("clues: each narrows where the hidden point can be", () => {
  const choices = [
    {
      words: { en: "In the upper half", hi: "ऊपरी आधे में" },
      region: { xMin: -6, xMax: 6, yMin: 0, yMax: 5 },
    },
    { words: { en: "5 cm from the left edge", hi: "बाएँ किनारे से 5 cm" }, x: 5 },
    { words: { en: "2 cm from the bottom", hi: "नीचे से 2 cm" }, y: 2 },
    { words: { en: "3 cm from the bottom", hi: "नीचे से 3 cm" }, y: 3 },
  ];
  const s = () => start(clues, { clueChoices: choices, hidden: { x: 5, y: 2 } });
  it("a phrase leaves a region, one distance a line, both distances one point", () => {
    expect(stillPossible(s(), []).kind).toBe("anywhere");
    expect(stillPossible(s(), [0]).kind).toBe("region");
    expect(stillPossible(s(), [0, 1])).toMatchObject({ kind: "line", axis: "x", value: 5 });
    expect(stillPossible(s(), [1, 2])).toEqual({ kind: "point", x: 5, y: 2 });
    expect(stillPossible(s(), [2, 3]).kind).toBe("nowhere");
  });
  it("giving the second distance pins the point", () => {
    let st = onClues.run(s(), "giveClue", { clue: 1 }).state;
    const out = onClues.run(st, "giveClue", { clue: 2 });
    st = out.state;
    expect(st.given).toEqual([1, 2]);
    expect(out.emit.map((e) => e.payload)).toEqual([{ still: "point" }, { x: 5, y: 2 }]);
    expect(onClues.run(st, "giveClue", { clue: 2 }).state).toEqual(st);
  });
  it("the hidden point is known but not on screen until shown; a learner hides one only when allowed", () => {
    expect(clues.offScreen).toContain("hidden");
    expect(onClues.run(s(), "hideAt", { x: 1, y: 1 }).state.hidden).toEqual({ x: 5, y: 2 });
    const mine = onClues.run({ ...s(), canHide: true, given: [0] }, "hideAt", { x: 1, y: 1 }).state;
    expect(mine).toMatchObject({ hidden: { x: 1, y: 1 }, given: [] });
    expect(onClues.run(mine, "showHidden").state.isHiddenShown).toBe(true);
  });
});

describe("plotting: Exercise 3.3's table", () => {
  const table = [
    { x: -2, y: 8 },
    { x: -1, y: 7 },
    { x: 0, y: -1.25 },
    { x: 1, y: 3 },
    { x: 3, y: -1 },
  ];
  const window = { xMin: -4, xMax: 4, yMin: -3, yMax: 9 };
  const s = () => start(plotting, { toPlot: table, window });
  it("a dot where the pair says is right; the pair swapped is wrong", () => {
    const right = onPlotting.run(s(), "plotAt", { x: -2, y: 8 });
    expect(right.state.plotted).toEqual([{ x: -2, y: 8, isRight: true }]);
    const wrong = onPlotting.run(right.state, "plotAt", { x: 7, y: -1 });
    expect(wrong.state.plotted[1]).toEqual({ x: 7, y: -1, isRight: false });
    expect(onPlotting.look(wrong.state).next).toEqual({ x: 0, y: -1.25 });
  });
  it("a decimal between the marks: (0, −1.25)", () => {
    let st = s();
    for (let i = 0; i < 2; i++) st = onPlotting.run(st, "plotNext").state;
    expect(onPlotting.run(st, "plotAt", { x: 0, y: -1.25 }).state.plotted[2]?.isRight).toBe(true);
  });
  it("every pair plotted, then nothing more", () => {
    let st = s();
    const all: string[] = [];
    for (let i = 0; i < table.length; i++) {
      const out = onPlotting.run(st, "plotNext");
      st = out.state;
      all.push(...signals(out.emit));
    }
    expect(all.at(-1)).toBe("allPlotted");
    expect(onPlotting.look(st).next).toBe(null);
    expect(onPlotting.run(st, "plotNext").state).toEqual(st);
  });
  it("a bigger scale shows more; a smaller one lets a point fall off", () => {
    // The learner chooses the scale on the table; the plane changes its own marks and window.
    const onTable = () =>
      start(coordinatePlane, { plane: { window }, plotting: { toPlot: table } });
    const doubled = whole.run(onTable(), "plotting.chooseScale", { every: 2 }).state;
    expect(doubled.plane).toMatchObject({
      tickEvery: 2,
      window: { xMin: -8, xMax: 8, yMin: -6, yMax: 18 },
    });
    expect(whole.look(doubled).plotting).toMatchObject({ offPlane: [] });
    const halved = whole.run(onTable(), "plotting.chooseScale", { every: 0.5 });
    expect(halved.state.plane.tickEvery).toBe(0.5);
    // Off the window the plotting is given now, whatever the plane made of the scale.
    expect((whole.look(halved.state).plotting as { offPlane: unknown }).offPlane).toEqual([
      { n: 0, x: -2, y: 8 },
      { n: 1, x: -1, y: 7 },
      { n: 4, x: 3, y: -1 },
    ]);
  });
});

/** One throw, played to its end: a miss is instant, a move takes time. */
async function throwOnce(s: Dice): Promise<Dice> {
  try {
    return (await onDice.play(s, "throwDice")).state;
  } catch {
    return onDice.run(s, "throwDice").state;
  }
}

describe("the dice game", () => {
  const game = (seed: number) =>
    start(dice, {
      counters: [
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      ],
      seed,
    });
  it("the same seed gives the same throws, each die 1 to 6, and all six come up", () => {
    const seen = new Set<number>();
    for (let n = 0; n < 200; n++) {
      const t = throwOf(7, n);
      expect(t).toEqual(throwOf(7, n));
      for (const v of [t.red, t.green]) {
        expect(v >= 1 && v <= 6).toBe(true);
        seen.add(v);
      }
    }
    expect(seen.size).toBe(6);
  });
  it("a throw walks the counter along by red, then up by green, and passes the turn", async () => {
    const t = throwOf(3, 0);
    const played = await onDice.play(game(3), "throwDice");
    expect(played.state.counters[0]).toEqual({ x: t.red, y: t.green });
    expect(played.state).toMatchObject({ turn: 1, throwsMade: 1, lastThrow: t });
    // Every frame on the way is on a line: along first.
    const path = played.frames.map((f) => f.counters[0]);
    expect(path.filter((p) => p !== undefined && p.y > 0 && p.x < t.red)).toEqual([]);
  });
  it("a die that would pass 10 isn't used: the counter moves by the other alone", async () => {
    const t = throwOf(5, 0);
    // At 10 across: red can't be used, so only green moves it (if green fits).
    const s = {
      ...game(5),
      counters: [
        { x: 10, y: 0 },
        { x: 0, y: 0 },
      ],
    };
    const played = await onDice.play(s, "throwDice");
    expect(played.state.counters[0]).toEqual({ x: 10, y: t.green });
    expect(signals(played.emit)).not.toContain("missed");
  });
  it("a counter at 10 on one line still gets to (10, 10): no game is stuck", async () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      let s: Dice = {
        ...game(seed),
        counters: [
          { x: 10, y: 0 },
          { x: 0, y: 0 },
        ],
      };
      for (let n = 0; n < 400 && s.winner === null; n++) s = await throwOnce(s);
      expect(s.winner).not.toBe(null);
    }
  });
  it("only when both dice would pass 10 is the turn missed, and the counter stays", () => {
    const t = throwOf(5, 0);
    const s = {
      ...game(5),
      counters: [
        { x: 11 - t.red, y: 11 - t.green },
        { x: 0, y: 0 },
      ],
    };
    const out = onDice.run(s, "throwDice");
    expect(out.state.counters).toEqual(s.counters);
    expect(signals(out.emit)).toEqual(["thrown", "missed"]);
    expect(out.state.turn).toBe(1);
  });
  it("landing on the other counter sends it home", async () => {
    const t = throwOf(9, 0);
    const s = {
      ...game(9),
      counters: [
        { x: 0, y: 0 },
        { x: t.red, y: t.green },
      ],
    };
    const played = await onDice.play(s, "throwDice");
    expect(played.state.counters[1]).toEqual({ x: 0, y: 0 });
    expect(signals(played.emit)).toContain("sentHome");
  });
  it("many throws: counters stay on the board and the turn passes each time", async () => {
    for (const seed of [1, 2, 3]) {
      let s: Dice = game(seed);
      for (let n = 0; n < 60 && s.winner === null; n++) {
        const before = s.turn;
        s = await throwOnce(s);
        if (s.winner === null) expect(s.turn).toBe(1 - before);
        for (const c of s.counters) expect(c.x <= 10 && c.y <= 10).toBe(true);
      }
      expect(s.throwsMade).toBeGreaterThan(0);
    }
  });
  it("a new game goes on along the seed's throws, so it isn't the same game again", async () => {
    const s = await throwOnce(game(4));
    const again = onDice.run(s, "startAgain").state;
    expect(again).toMatchObject({ winner: null, turn: 0, throwsMade: 1, lastThrow: null });
    expect(again.counters).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });
});

describe("streets rise from the road: the number line first, then the town", () => {
  it("with no street risen, Riya can walk the road but not up it", () => {
    const s = { ...walkerInTown(), upLines: [] as number[], at: { x: 4, y: 0 } };
    expect(stepFrom(s, Direction.Up)).toEqual({ blocked: "this street isn't there yet" });
    expect("to" in stepFrom(s, Direction.Right)).toBe(true);
  });
  it("Street 4 rises: it grows, then counts as risen, and Riya can walk up it", async () => {
    const t = town();
    const s = {
      ...t,
      plane: { ...t.plane, upLines: [] as number[] },
      walker: { ...t.walker, at: { x: 4, y: 0 } },
    };
    const played = await whole.play(s, "plane.raiseUpLine", { at: 4 });
    expect(played.state.plane).toMatchObject({ upLines: [4], rising: null });
    const heights = played.frames.flatMap((f) =>
      f.plane.rising === null ? [] : [f.plane.rising.height],
    );
    for (let i = 1; i < heights.length; i++)
      expect(heights[i]).toBeGreaterThanOrEqual(heights[i - 1] ?? 0);
    expect(signals(played.emit)).toEqual(["plane.risen"]);
    // Riya walks by the plane's streets: the one just risen is hers to walk up.
    const riya = whole.look(played.state).walker as Walker;
    expect("to" in stepFrom(riya, Direction.Up)).toBe(true);
    const walked = await walkInTown(played.state, Direction.Up);
    expect(walked.state.walker.at).toEqual({ x: 4, y: 1 });
  });
  it("then every street rises, one after another, and the town is as usual", async () => {
    const played = await onPlane.play(
      start(plane, { ...townPlane, upLines: [4] }),
      "raiseAllUpLines",
    );
    expect(played.state.upLines).toBe(null);
    expect(signals(played.emit)).toEqual(Array(5).fill("risen"));
  });
});

describe("a new house is a new walk", () => {
  it("the first house is only marked: Riya stays where she is", () => {
    const t = town();
    const s = { ...t, walker: { ...t.walker, at: { x: 4, y: 0 }, trail: [{ x: 1, y: 0 }] } };
    expect(whole.run(s, "places.chooseTarget", { x: 4, y: 3 }).state.walker.at).toEqual({
      x: 4,
      y: 0,
    });
  });
  it("making another house Aman's sends Riya back to the corner", () => {
    const t = town();
    const s = {
      ...t,
      places: { ...t.places, target: { x: 1, y: 1 } },
      walker: {
        ...t.walker,
        at: { x: 2, y: 3 },
        trail: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 2, y: 3 },
        ],
      },
    };
    const out = whole.run(s, "places.chooseTarget", { x: 4, y: 3 });
    expect(out.state.places.target).toEqual({ x: 4, y: 3 });
    expect(out.state.walker).toMatchObject({ at: { x: 0, y: 0 }, trail: [] });
  });
});

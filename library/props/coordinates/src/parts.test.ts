import { Board, type BoardEvent, prop } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { cluesReads, stillPossible } from "./clues";
import { clues } from "./clues";
import { throwOf } from "./dice";
import { dice } from "./dice";
import { placeOf, windowSchema } from "./plane";
import { plane } from "./plane";
import { plottingReads } from "./plotting";
import { plotting } from "./plotting";
import { readingReads } from "./reading";
import { reading } from "./reading";

// The clues, plotting, the dice and a point's reading on the event model, each held alone by a
// tiny holder that has what it needs as its own variables. The same laws as model.test.ts's.

/** What the board told, in order: signal names, and payloads. */
function hearing(board: Board) {
  const told: { signal: string; payload: unknown }[] = [];
  board.listen((e: BoardEvent) => {
    if (e.kind === "tell") told.push({ signal: e.signal, payload: e.payload });
  });
  return {
    told,
    signals: () => told.map((e) => e.signal),
    clear: () => told.splice(0),
  };
}

/** A copy of what a prop reads now (variables, needs, facts), to compare whole. */
const snapshot = (o: object) => ({ ...o });

describe("reading a point: its quadrant follows its signs", () => {
  const holder = prop({
    type: "readingHolder",
    describe: "test",
    variables: z.object({ window: windowSchema }).strict(),
    start: readingReads.defaults,
    children: { reading },
  });
  const board = (given: Record<string, unknown> = {}) => {
    const b = new Board(holder, { reading: given });
    return { b, ...hearing(b), read: () => b.read<typeof holder>().reading };
  };
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
    const one = board();
    one.b.input("reading", "movePoint", { x: 2.3, y: -1.6 });
    expect(one.read().point).toEqual({ x: 2, y: -2 });
    expect(one.read()).toMatchObject({ abscissa: 2, ordinate: -2, place: "IV" });
    const far = board();
    far.b.input("reading", "movePoint", { x: 40, y: -40 });
    expect(far.read().point).toEqual({ x: 6, y: -5 });
    const quarters = board({ pointStep: 0.25 });
    quarters.b.input("reading", "movePoint", { x: 1.3, y: 0.6 });
    expect(quarters.read().point).toEqual({ x: 1.25, y: 0.5 });
  });
  it("each quadrant is remembered the first time the point is in it, not on an axis", () => {
    const { b, read, signals } = board();
    for (const p of [
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 0, y: 3 },
      { x: -1, y: 2 },
      { x: 3, y: 3 },
    ])
      b.input("reading", "movePoint", p);
    expect(read().visited).toEqual(["I", "II"]);
    expect(signals().filter((s) => s === "enteredQuadrant")).toHaveLength(2);
  });
  it("a guessing round hides the reading until it is shown", () => {
    const { b, read, told, clear } = board();
    b.send("reading", "askAt", { x: -3, y: 4 });
    expect(read()).toMatchObject({ point: { x: -3, y: 4 }, isReadingHidden: true });
    clear();
    b.input("reading", "showReading");
    expect(read().isReadingHidden).toBe(false);
    expect(told).toEqual([{ signal: "readingShown", payload: { x: -3, y: 4 } }]);
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
  const holder = prop({
    type: "cluesHolder",
    describe: "test",
    variables: z
      .object({ window: windowSchema, unit: z.string().max(4), isPlaneFree: z.boolean() })
      .strict(),
    start: { ...cluesReads.defaults, unit: "", isPlaneFree: true },
    children: { clues },
  });
  const board = (given: Record<string, unknown> = {}) => {
    const b = new Board(holder, {
      clues: { clueChoices: choices, hidden: { x: 5, y: 2 }, ...given },
    });
    return { b, ...hearing(b), read: () => b.read<typeof holder>().clues };
  };
  it("a phrase leaves a region, one distance a line, both distances one point", () => {
    const s = board().read();
    expect(stillPossible(s, []).kind).toBe("anywhere");
    expect(stillPossible(s, [0]).kind).toBe("region");
    expect(stillPossible(s, [0, 1])).toMatchObject({ kind: "line", axis: "x", value: 5 });
    expect(stillPossible(s, [1, 2])).toEqual({ kind: "point", x: 5, y: 2 });
    expect(stillPossible(s, [2, 3]).kind).toBe("nowhere");
  });
  it("giving the second distance pins the point", () => {
    const { b, read, told, clear } = board();
    b.input("clues", "giveClue", { clue: 1 });
    clear();
    b.input("clues", "giveClue", { clue: 2 });
    expect(read().given).toEqual([1, 2]);
    expect(told.map((e) => e.payload)).toEqual([{ still: "point" }, { x: 5, y: 2 }]);
    expect(read().still).toEqual({ kind: "point", x: 5, y: 2 });
    const before = snapshot(read());
    b.input("clues", "giveClue", { clue: 2 });
    expect(snapshot(read())).toEqual(before);
  });
  it("a learner hides a point only when allowed, and it shows when asked", () => {
    // The hidden point is known, but off the screen.
    expect(clues.offScreen).toContain("hidden");
    const fixed = board();
    fixed.b.input("clues", "hideAt", { x: 1, y: 1 });
    expect(fixed.read().hidden).toEqual({ x: 5, y: 2 });
    const mine = board({ canHide: true, given: [0] });
    mine.b.input("clues", "hideAt", { x: 1, y: 1 });
    expect(mine.read()).toMatchObject({ hidden: { x: 1, y: 1 }, given: [] });
    mine.b.input("clues", "showHidden");
    expect(mine.read().isHiddenShown).toBe(true);
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
  const holder = prop({
    type: "plottingHolder",
    describe: "test",
    variables: z.object({ window: windowSchema, tickEvery: z.number().positive() }).strict(),
    start: plottingReads.defaults,
    children: { plotting },
  });
  const board = () => {
    const b = new Board(holder, { window, plotting: { toPlot: table } });
    return { b, ...hearing(b), read: () => b.read<typeof holder>().plotting };
  };
  it("a dot where the pair says is right; the pair swapped is wrong", () => {
    const { b, read } = board();
    b.input("plotting", "plotAt", { x: -2, y: 8 });
    expect(read().plotted).toEqual([{ x: -2, y: 8, isRight: true }]);
    b.input("plotting", "plotAt", { x: 7, y: -1 });
    expect(read().plotted[1]).toEqual({ x: 7, y: -1, isRight: false });
    expect(read().next).toEqual({ x: 0, y: -1.25 });
  });
  it("a decimal between the marks: (0, −1.25)", () => {
    const { b, read } = board();
    for (let i = 0; i < 2; i++) b.send("plotting", "plotNext");
    b.input("plotting", "plotAt", { x: 0, y: -1.25 });
    expect(read().plotted[2]?.isRight).toBe(true);
  });
  it("every pair plotted, then nothing more", () => {
    const { b, read, signals } = board();
    for (let i = 0; i < table.length; i++) b.send("plotting", "plotNext");
    expect(signals().at(-1)).toBe("allPlotted");
    expect(read().next).toBe(null);
    const before = snapshot(read());
    b.send("plotting", "plotNext");
    expect(snapshot(read())).toEqual(before);
  });
  it("a bigger scale shows more; a smaller one lets a point fall off", () => {
    // The learner chooses the scale on the table; the plane changes its own marks and window. A
    // holder that, as the coordinate plane does, hears the choice and gives the plane's window.
    const onTable = prop({
      type: "tableHolder",
      describe: "test",
      children: { plane, plotting },
      give: {
        plane: { isAlone: () => false, canTapNumbers: () => false, lit: () => null },
        plotting: { window: (me) => me.plane.window, tickEvery: (me) => me.plane.tickEvery },
      },
      hear: { "plotting.scaleChosen": (_, p, t) => t.to.plane.setScale({ every: p.every }) },
    });
    const at = (every: number) => {
      const b = new Board(onTable, { plane: { window }, plotting: { toPlot: table } });
      b.input("plotting", "chooseScale", { every });
      return b.read<typeof onTable>();
    };
    const doubled = at(2);
    expect(doubled.plane).toMatchObject({
      tickEvery: 2,
      window: { xMin: -8, xMax: 8, yMin: -6, yMax: 18 },
    });
    expect(doubled.plotting.offPlane).toEqual([]);
    const halved = at(0.5);
    expect(halved.plane.tickEvery).toBe(0.5);
    // Off the window the plotting is given now, whatever the plane made of the scale.
    expect(halved.plotting.offPlane).toEqual([
      { n: 0, x: -2, y: 8 },
      { n: 1, x: -1, y: 7 },
      { n: 4, x: 3, y: -1 },
    ]);
  });
});

describe("the dice game", () => {
  const holder = prop({ type: "diceHolder", describe: "test", children: { dice } });
  const game = (seed: number, given: Record<string, unknown> = {}) => {
    const b = new Board(holder, {
      dice: {
        counters: [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ],
        seed,
        ...given,
      },
    });
    const read = () => b.read<typeof holder>().dice;
    /** One throw, played to its end (a miss is instant, a move takes time). */
    const throwOnce = () => {
      b.input("dice", "throwDice");
      b.runUntilIdle();
    };
    return { b, ...hearing(b), read, throwOnce };
  };
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
  it("a throw walks the counter along by red, then up by green, and passes the turn", () => {
    const t = throwOf(3, 0);
    const { b, read } = game(3);
    b.input("dice", "throwDice");
    expect(b.isBusy).toBe(true);
    // Every frame on the way is on a line: along first.
    const path = [];
    for (let at = 0; b.isBusy; at += 1 / 60) {
      b.advanceTo(at);
      path.push(read().counters[0]);
    }
    expect(read().counters[0]).toEqual({ x: t.red, y: t.green });
    expect(read()).toMatchObject({ turn: 1, throwsMade: 1, lastThrow: t });
    expect(path.filter((p) => p !== undefined && p.y > 0 && p.x < t.red)).toEqual([]);
  });
  it("a die that would pass 10 isn't used: the counter moves by the other alone", () => {
    const t = throwOf(5, 0);
    // At 10 across: red can't be used, so only green moves it (if green fits).
    const { read, signals, throwOnce } = game(5, {
      counters: [
        { x: 10, y: 0 },
        { x: 0, y: 0 },
      ],
    });
    throwOnce();
    expect(read().counters[0]).toEqual({ x: 10, y: t.green });
    expect(signals()).not.toContain("missed");
  });
  it("a counter at 10 on one line still gets to (10, 10): no game is stuck", () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const { read, throwOnce } = game(seed, {
        counters: [
          { x: 10, y: 0 },
          { x: 0, y: 0 },
        ],
      });
      for (let n = 0; n < 400 && read().winner === null; n++) throwOnce();
      expect(read().winner).not.toBe(null);
    }
  });
  it("only when both dice would pass 10 is the turn missed, and the counter stays", () => {
    const t = throwOf(5, 0);
    const counters = [
      { x: 11 - t.red, y: 11 - t.green },
      { x: 0, y: 0 },
    ];
    const { b, read, signals } = game(5, { counters });
    b.input("dice", "throwDice");
    expect(b.isBusy).toBe(false);
    expect(read().counters).toEqual(counters);
    expect(signals()).toEqual(["thrown", "missed"]);
    expect(read().turn).toBe(1);
  });
  it("landing on the other counter sends it home", () => {
    const t = throwOf(9, 0);
    const { read, signals, throwOnce } = game(9, {
      counters: [
        { x: 0, y: 0 },
        { x: t.red, y: t.green },
      ],
    });
    throwOnce();
    expect(read().counters[1]).toEqual({ x: 0, y: 0 });
    expect(signals()).toContain("sentHome");
  });
  it("many throws: counters stay on the board and the turn passes each time", () => {
    for (const seed of [1, 2, 3]) {
      const { read, throwOnce } = game(seed);
      for (let n = 0; n < 60 && read().winner === null; n++) {
        const before = read().turn;
        throwOnce();
        if (read().winner === null) expect(read().turn).toBe(1 - before);
        for (const c of read().counters) expect(c.x <= 10 && c.y <= 10).toBe(true);
      }
      expect(read().throwsMade).toBeGreaterThan(0);
    }
  });
  it("a new game goes on along the seed's throws, so it isn't the same game again", () => {
    const { b, read, throwOnce } = game(4);
    throwOnce();
    b.input("dice", "startAgain");
    expect(read()).toMatchObject({ winner: null, turn: 0, throwsMade: 1, lastThrow: null });
    expect(read().counters).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);
  });
});

describe("the plane's own parts, named when the lesson defines them", () => {
  const board = (given: Record<string, unknown> = {}) => {
    const b = new Board(plane, given as never);
    return { b, ...hearing(b), read: () => b.read<typeof plane>() };
  };
  it("the two number lines glide until their zeroes meet: then they are the axes, and O shows", () => {
    const { b, read, signals } = board({ apart: { x: 3, y: -2 }, showOrigin: false });
    expect(read().isCrossed).toBe(false);
    b.send("", "bringTogether");
    // On the way, the line only ever comes closer.
    const gaps: number[] = [];
    for (let t = 0.05; t <= 4; t += 0.05) {
      b.advanceTo(t);
      gaps.push(Math.hypot(read().apart.x, read().apart.y));
    }
    for (let i = 1; i < gaps.length; i++)
      expect(gaps[i]).toBeLessThanOrEqual((gaps[i - 1] ?? 0) + 1e-9);
    b.runUntilIdle();
    expect(read()).toMatchObject({ apart: { x: 0, y: 0 }, showOrigin: true });
    expect(signals()).toContain("crossed");
  });
  it("the sweep names I, II, III, IV in turn", () => {
    const { b, read, signals } = board();
    b.send("", "numberQuadrants");
    const named = [read().quadrantsNamed];
    for (let t = 0.05; t <= 6; t += 0.05) {
      b.advanceTo(t);
      if (named.at(-1) !== read().quadrantsNamed) named.push(read().quadrantsNamed);
    }
    expect(named).toEqual([0, 1, 2, 3, 4]);
    expect(signals()).toContain("quadrantsNumbered");
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
    const { b, read } = board({ points });
    b.send("", "showPoint", {});
    b.send("", "showPoint", { name: "L" });
    expect(read().points.map((p) => p.isShown)).toEqual([true, false, true]);
    b.send("", "showAllPoints");
    expect(read().points.every((p) => p.isShown)).toBe(true);
  });
  it("a tap names the part", () => {
    const { b, read } = board();
    b.input("", "namePart", { part: "OX′" });
    expect(read().named).toBe("OX′");
  });
  it("a window must run low to high", () => {
    expect(() => board({ window: { xMin: 3, xMax: 3, yMin: 0, yMax: 1 } })).toThrow();
  });
});

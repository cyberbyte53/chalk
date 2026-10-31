import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Board } from "./board";
import { type VoiceTools, action, prop, signal } from "./define";
import { sequence } from "./helpers";
import { type Heard, type Voice, timedVoice } from "./voice";

// A small town on the event model: the plane owns which streets are up, places own the target,
// the walker needs both and walks block by block. The board (the lesson) is the outermost prop.

const point = z.object({ x: z.number(), y: z.number() }).strict();
type Point = z.infer<typeof point>;

const plane = prop({
  type: "plane",
  describe: "Streets rising from a main road.",
  variables: z.object({ upLines: z.array(z.number().int()), rise: z.number() }).strict(),
  start: { upLines: [], rise: 0 },
  actions: { raiseStreet: action({ at: z.number().int() }) },
  signals: { risen: signal({ at: z.number().int() }) },
  on: {
    raiseStreet: (me, { at }, t) =>
      !me.upLines.includes(at) && [
        t.set({ rise: 0 }),
        t.move("rise", 1, 1, {
          atEnd: [t.set({ upLines: [...me.upLines, at] }), t.tell.risen({ at })],
        }),
      ],
  },
});

const places = prop({
  type: "places",
  describe: "Houses; one may be the target.",
  variables: z.object({ target: point.nullable() }).strict(),
  start: { target: null },
  actions: { chooseTarget: action(point.shape, { from: "screen" }) },
  signals: { targetChosen: signal({ ...point.shape, isAnother: z.boolean() }) },
  on: {
    chooseTarget: (me, p, t) => [
      t.set({ target: p }),
      t.tell.targetChosen({ ...p, isAnother: me.target !== null }),
    ],
  },
});

const BLOCK = 0.3;
const walker = prop({
  type: "walker",
  describe: "Riya, walking the roads block by block.",
  variables: z.object({ at: point, isWalking: z.boolean() }).strict(),
  start: { at: { x: 0, y: 0 }, isWalking: false },
  needs: z.object({ upLines: z.array(z.number()), target: point.nullable() }).strict(),
  facts: { isAtTarget: (me) => me.target !== null && same(me.at, me.target) },
  actions: {
    step: action({ direction: z.enum(["up", "right"]) }, { from: "screen" }),
    backToStart: action({}, { from: "screen" }),
  },
  signals: {
    stepped: signal(point.shape),
    arrived: signal(point.shape),
    blocked: signal({ why: z.string() }),
  },
  on: {
    step: (me, { direction }, t) => {
      if (me.isWalking) return;
      if (direction === "up" && !me.upLines.includes(me.at.x))
        return t.tell.blocked({ why: "this street isn't there yet" });
      const to =
        direction === "up" ? { x: me.at.x, y: me.at.y + 1 } : { x: me.at.x + 1, y: me.at.y };
      const isThere = me.target !== null && same(to, me.target);
      return [
        t.set({ isWalking: true }),
        t.move("at", to, BLOCK, {
          atEnd: [
            t.set({ isWalking: false }),
            t.tell.stepped(to),
            ...(isThere ? [t.tell.arrived(to)] : []),
          ],
        }),
      ];
    },
    backToStart: (_, __, t) => [t.stop(), t.set({ at: { x: 0, y: 0 }, isWalking: false })],
  },
});

const town = prop({
  type: "town",
  describe: "The plane, its places and Riya, together.",
  children: { plane, places, walker },
  give: { walker: { upLines: (me) => me.plane.upLines, target: (me) => me.places.target } },
  hear: {
    // Another house: Riya goes back to the corner.
    "places.targetChosen": (_, p, t) => p.isAnother && t.to.walker.backToStart(),
  },
});

function same(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

/** What happened, in order, for the tests to read. */
const heard: string[] = [];
const lesson = prop({
  type: "lesson",
  describe: "Finding Aman's house.",
  variables: z.object({ shown: z.array(z.string()), isPassed: z.boolean() }).strict(),
  start: { shown: [], isPassed: false },
  children: { town },
  hear: {
    "town.walker.stepped": (_, p, t) => {
      heard.push(`stepped ${p.x},${p.y}`);
      return p.x === 4 && p.y === 0 && t.to.town.plane.raiseStreet({ at: 4 });
    },
    "town.plane.risen": (me, p, t) => {
      heard.push(`risen ${p.at}`);
      return [
        t.set({ shown: [...me.shown, "fiveHouses"] }),
        t.later(2.5, t.to.town.places.chooseTarget({ x: 4, y: 5 })),
      ];
    },
    "town.places.targetChosen": () => void heard.push("targetChosen"),
    "town.walker.arrived": (me, p, t) => {
      heard.push(`arrived ${p.x},${p.y}`);
      return [t.set({ shown: [...me.shown, "found"], isPassed: true })];
    },
  },
});

/** Taps, each played out to the end (as a check plays a board). */
function tap(board: Board, path: string, act: string, payload = {}): void {
  board.input(path, act, payload);
  board.runUntilIdle();
}

describe("a board on the event model: Finding Aman's house", () => {
  it("plays through: road, the street rises, a beat, the house, up the street, found", () => {
    heard.length = 0;
    const board = new Board(lesson);
    for (let i = 0; i < 4; i++) tap(board, "town/walker", "step", { direction: "right" });
    expect(board.read<typeof lesson>().town.plane.upLines).toEqual([4]);
    expect(board.read<typeof lesson>().town.places.target).toEqual({ x: 4, y: 5 });
    for (let i = 0; i < 5; i++) tap(board, "town/walker", "step", { direction: "up" });
    expect(heard).toEqual([
      "stepped 1,0",
      "stepped 2,0",
      "stepped 3,0",
      "stepped 4,0",
      "risen 4",
      "targetChosen",
      "stepped 4,1",
      "stepped 4,2",
      "stepped 4,3",
      "stepped 4,4",
      "stepped 4,5",
      "arrived 4,5",
    ]);
    const read = board.read<typeof lesson>();
    expect(read.shown).toEqual(["fiveHouses", "found"]);
    expect(read.isPassed).toBe(true);
    expect(read.town.walker.isAtTarget).toBe(true);
    // 9 blocks, a 1 s rise and a 2.5 s beat, on the board's clock, checked in no time.
    expect(board.now).toBeCloseTo(9 * BLOCK + 1 + 2.5);
  });

  it("refuses up before the street has risen, reading the plane through its need", () => {
    heard.length = 0;
    const board = new Board(lesson);
    const blocked: string[] = [];
    const watching = prop({
      type: "watching",
      describe: "Hears Riya refuse.",
      children: { town },
      hear: { "town.walker.blocked": (_, p) => void blocked.push(p.why) },
    });
    const b2 = new Board(watching);
    tap(b2, "town/walker", "step", { direction: "up" });
    expect(blocked).toEqual(["this street isn't there yet"]);
    expect(b2.read<typeof watching>().town.walker.at).toEqual({ x: 0, y: 0 });
    expect(board.read<typeof lesson>().town.walker.at).toEqual({ x: 0, y: 0 });
  });

  it("reads a moving variable where it is now", () => {
    const board = new Board(lesson);
    board.input("town/walker", "step", { direction: "right" });
    board.advanceTo(BLOCK / 2);
    expect(board.read<typeof lesson>().town.walker.at.x).toBeCloseTo(0.5);
    expect(board.read<typeof lesson>().town.walker.isWalking).toBe(true);
    board.advanceTo(BLOCK);
    expect(board.read<typeof lesson>().town.walker.at).toEqual({ x: 1, y: 0 });
    expect(board.read<typeof lesson>().town.walker.isWalking).toBe(false);
  });

  it("instant events run like calls: a signal's effects finish before the rule's next out", () => {
    heard.length = 0;
    const order: string[] = [];
    const a = prop({
      type: "a",
      describe: "Tells two things.",
      actions: { go: action() },
      signals: { first: signal(), second: signal() },
      on: { go: (_, __, t) => [t.tell.first(), t.tell.second()] },
    });
    const b = prop({
      type: "b",
      describe: "Notes what it is asked.",
      actions: { note: action({ what: z.string() }) },
      on: { note: (_, p) => void order.push(p.what) },
    });
    const both = prop({
      type: "both",
      describe: "Hears a, asks b.",
      children: { a, b },
      hear: {
        "a.first": (_, __, t) => [
          t.to.b.note({ what: "first" }),
          t.to.b.note({ what: "first, again" }),
        ],
        "a.second": (_, __, t) => t.to.b.note({ what: "second" }),
      },
    });
    new Board(both).send("a", "go");
    expect(order).toEqual(["first", "first, again", "second"]);
  });

  it("a signal stays with the town that told it: two towns on one board", () => {
    const told: string[] = [];
    const two = prop({
      type: "two",
      describe: "Two towns.",
      children: { left: town, right: town },
      hear: {
        "left.walker.stepped": () => void told.push("left"),
        "right.walker.stepped": () => void told.push("right"),
      },
    });
    const board = new Board(two);
    tap(board, "right/walker", "step", { direction: "right" });
    expect(told).toEqual(["right"]);
    expect(board.read<typeof two>().left.walker.at).toEqual({ x: 0, y: 0 });
  });

  it("a new house mid-walk: Riya stops where she is and goes back (her queued arrival dropped)", () => {
    const board = new Board(lesson);
    board.input("town/walker", "step", { direction: "right" });
    board.advanceTo(0.1);
    board.send("town/places", "chooseTarget", { x: 2, y: 0 });
    board.input("town/places", "chooseTarget", { x: 3, y: 0 });
    board.runUntilIdle();
    expect(board.read<typeof lesson>().town.walker.at).toEqual({ x: 0, y: 0 });
    expect(board.queued).toEqual([]);
  });

  it("the student taking over drops what the lesson queued for that prop", () => {
    const board = new Board(lesson);
    for (let i = 0; i < 3; i++) tap(board, "town/walker", "step", { direction: "right" });
    board.input("town/walker", "step", { direction: "right" });
    // The street rises (1 s); then the lesson's chooseTarget waits 2.5 s. The student picks a house first.
    board.advanceTo(board.now + BLOCK + 1);
    expect(board.queued.map((q) => q.owner)).toEqual([""]);
    board.input("town/places", "chooseTarget", { x: 4, y: 2 });
    expect(board.queued).toEqual([]);
    board.runUntilIdle();
    expect(board.read<typeof lesson>().town.places.target).toEqual({ x: 4, y: 2 });
  });

  it("the student taking over drops only the lesson's step for that prop, not the rest of its entry", () => {
    const told: string[] = [];
    const script = prop({
      type: "script",
      describe: "Later: walk Riya, and note it.",
      variables: z.object({ notes: z.array(z.string()) }).strict(),
      start: { notes: [] },
      actions: { go: action() },
      children: { town },
      on: {
        go: (me, _, t) =>
          t.later(
            1,
            t.to.town.walker.step({ direction: "right" }),
            t.set({ notes: [...me.notes, "1 s"] }),
          ),
      },
      hear: { "town.walker.stepped": () => void told.push("stepped") },
    });
    const board = new Board(script);
    board.send("", "go");
    board.input("town/walker", "backToStart");
    board.runUntilIdle();
    expect(board.read<typeof script>().notes).toEqual(["1 s"]);
    expect(told).toEqual([]);
  });

  it("refuses a time below zero, and a 'later' of 0 that keeps coming back", () => {
    const bad = prop({
      type: "bad",
      describe: "Asks for odd times.",
      actions: { back: action(), forever: action() },
      on: {
        back: (_, __, t) => t.later(-1, t.self.back()),
        forever: (_, __, t) => t.later(0, t.self.forever()),
      },
    });
    expect(() => new Board(bad).send("", "back")).toThrow(/later of -1 seconds/);
    const board = new Board(bad);
    board.send("", "forever");
    expect(() => board.advanceTo(1)).toThrow(/keeps coming back/);
  });

  it("a malformed tap is refused before it is logged or drops anything", () => {
    const board = new Board(lesson);
    expect(() => board.input("town/walker", "step", { direction: "down" })).toThrow(/direction/);
    expect(board.log).toEqual([]);
  });

  it("replaying the student's taps with their times gives the same board", () => {
    const board = new Board(lesson);
    board.input("town/walker", "step", { direction: "right" });
    board.advanceTo(0.5);
    board.input("town/walker", "step", { direction: "right" });
    board.advanceTo(0.7);
    board.input("town/places", "chooseTarget", { x: 3, y: 0 });
    board.advanceTo(1.4);

    const again = Board.replay(lesson, {}, board.log, 1.4);
    expect(again.read<typeof lesson>().town.walker.at).toEqual(
      board.read<typeof lesson>().town.walker.at,
    );
    expect(again.read<typeof lesson>().town.places.target).toEqual({ x: 3, y: 0 });
  });

  it("same-time entries come out in the order they were queued; a sequence waits between steps", () => {
    const order: string[] = [];
    const clock = prop({
      type: "clock",
      describe: "Notes what falls due.",
      actions: { go: action(), note: action({ what: z.string() }) },
      on: {
        go: (_, __, t) => [
          t.later(1, t.self.note({ what: "a" })),
          t.later(1, t.self.note({ what: "b" })),
          ...sequence(
            t.self.note({ what: "now" }),
            0.5,
            t.self.note({ what: "half" }),
            1,
            t.self.note({ what: "later" }),
          ),
        ],
        note: (_, p) => void order.push(p.what),
      },
    });
    const board = new Board(clock);
    board.send("", "go");
    board.runUntilIdle();
    expect(order).toEqual(["now", "half", "a", "b", "later"]);
  });

  it("a chain that comes back round is stopped, naming its path", () => {
    const echo = prop({
      type: "echo",
      describe: "Asks itself again, forever.",
      actions: { again: action() },
      on: { again: (_, __, t) => t.self.again() },
    });
    expect(() => new Board(echo).send("", "again")).toThrow(
      /go round without end: board.again → board.again/,
    );
  });

  it("checks what crosses a boundary: payloads, the student's actions, own variables", () => {
    const board = new Board(lesson);
    expect(() => board.input("town/walker", "step", { direction: "sideways" })).toThrow(
      /direction/,
    );
    expect(() => board.input("town/plane", "raiseStreet", { at: 2 })).toThrow(
      /isn't the student's/,
    );
    expect(() => board.send("town/plane", "raiseStreet", { at: 1.5 })).toThrow(/at/);
    expect(() => new Board(lesson, { town: { walker: { at: { x: 0 } } } })).toThrow(/at/);
    expect(() => new Board(lesson, { town: { walker: { speed: 2 } } })).toThrow(
      /"speed" isn't one of its variables/,
    );
  });

  it("a holder must give every need of every child: by name, or by `give`", () => {
    expect(() =>
      prop({ type: "bare", describe: "Holds Riya, gives her nothing.", children: { walker } }),
    ).toThrow(/needs upLines, target/);
    // Giving one need doesn't give the others.
    expect(() =>
      prop({
        type: "half",
        describe: "Gives Riya her target only.",
        children: { walker },
        give: { walker: { target: () => null } },
      }),
    ).toThrow(/needs upLines/);
    // A child's name isn't a value: a child called `target` doesn't give the need `target`.
    expect(() =>
      prop({
        type: "named",
        describe: "Has a child called target.",
        variables: z.object({ upLines: z.array(z.number()) }).strict(),
        start: { upLines: [] },
        children: { walker, target: places },
      }),
    ).toThrow(/needs target/);
    // What is given is what the child needs: checked as it is read.
    const wrong = prop({
      type: "wrong",
      describe: "Gives Riya streets as words.",
      variables: z.object({ upLines: z.array(z.string()), target: point.nullable() }).strict(),
      start: { upLines: ["four"], target: null },
      children: { walker },
    });
    expect(() => new Board(wrong).read<typeof wrong>().walker.upLines).toThrow(/needs upLines/);
    // By name: a holder that has `upLines` and `target` itself gives them without a line.
    const plain = prop({
      type: "plain",
      describe: "Has what Riya needs under the same names.",
      variables: z.object({ upLines: z.array(z.number()), target: point.nullable() }).strict(),
      start: { upLines: [0], target: { x: 0, y: 1 } },
      children: { walker },
    });
    const board = new Board(plain);
    tap(board, "walker", "step", { direction: "up" });
    expect(board.read<typeof plain>().walker.isAtTarget).toBe(true);
  });

  it("types: payloads, rules and reads are checked by the compiler", () => {
    prop({
      type: "typed",
      describe: "Only compiles when it fits.",
      children: { town },
      hear: {
        // @ts-expect-error: the plane tells `risen`, not `rose`
        "town.plane.rose": () => undefined,
        "town.walker.arrived": (_, p, t) => [
          // @ts-expect-error: chooseTarget carries x and y
          t.to.town.places.chooseTarget({ x: p.x }),
          // @ts-expect-error: a town has no `river`
          t.to.town.river,
        ],
      },
    });
    expect(true).toBe(true);
  });
});

describe("the voice: the board asks, the voice tells back", () => {
  // A narrator that says one line and records what happens around it.
  const narrator = prop({
    type: "narrator",
    describe: "Says a line; notes when it is done, and why each step runs.",
    variables: z.object({ done: z.array(z.string()), causes: z.array(z.boolean()) }).strict(),
    start: { done: [], causes: [] },
    actions: {
      speak: action({ line: z.string() }),
      tap: action({}, { from: "screen" }),
      later: action(),
      done: action({ line: z.string() }),
    },
    on: {
      speak: (_, { line }, t) =>
        (t as unknown as VoiceTools).say(line, { atEnd: [t.self.done({ line })] }),
      // A tap sets something going: its later step is the student's too.
      tap: (me, _, t) => [
        t.set({ causes: [...me.causes, (t as unknown as VoiceTools).cause.byStudent] }),
        t.later(1, t.self.later()),
      ],
      later: (me, _, t) =>
        t.set({ causes: [...me.causes, (t as unknown as VoiceTools).cause.byStudent] }),
      done: (me, { line }, t) => t.set({ done: [...me.done, line] }),
    },
  });

  /** A voice the test drives: it tells back only when told to. */
  const handVoice = () => {
    const said: { line: string; hear: (what: Heard) => void }[] = [];
    let stops = 0;
    const voice: Voice = {
      say: (line, hear) => void said.push({ line, hear }),
      stop: () => void stops++,
    };
    return { voice, said, stops: () => stops };
  };

  it("never knows a line's length: a line is done when the voice says it ended", () => {
    const { voice, said } = handVoice();
    const board = new Board(narrator, {}, { voice });
    board.send("", "speak", { line: "hello" });
    board.advanceTo(100);
    expect(board.read("")).toMatchObject({ done: [] });
    said[0]?.hear("started");
    said[0]?.hear("ended");
    board.advanceTo(100);
    expect(board.read("")).toMatchObject({ done: ["hello"] });
  });

  it("a line cut is done too: what waits on it always happens, and the voice is stopped", () => {
    const { voice, said, stops } = handVoice();
    const board = new Board(narrator, {}, { voice });
    board.send("", "speak", { line: "first" });
    said[0]?.hear("started");
    board.send("", "speak", { line: "second" });
    board.advanceTo(0);
    expect(board.read("")).toMatchObject({ done: ["first"] });
    expect(stops()).toBe(1);
    // What the voice tells late of the cut line is old news.
    said[0]?.hear("ended");
    board.advanceTo(0);
    expect(board.read("")).toMatchObject({ done: ["first"] });
  });

  it("a voice keeping time on the board's clock ends a line after its length", () => {
    const board = new Board(narrator, {}, { voice: (b) => timedVoice(b, () => 2) });
    board.send("", "speak", { line: "hello" });
    board.advanceTo(1.9);
    expect(board.read("")).toMatchObject({ done: [] });
    board.advanceTo(2);
    expect(board.read("")).toMatchObject({ done: ["hello"] });
  });

  it("what a tap sets going is the student's; what the board does on its own is not", () => {
    const board = new Board(narrator);
    board.input("", "tap");
    board.runUntilIdle();
    board.send("", "later");
    expect(board.read("")).toMatchObject({ causes: [true, true, false] });
  });
});

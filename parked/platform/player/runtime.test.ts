import { Actor, type Board, type BoardAt, boardSchema } from "@chalk/content";
import {
  BOARD,
  PropRole,
  actionsFor,
  defineProp,
  raise,
  repeat,
  say,
  seq,
  set,
  signal,
  tween,
  waitUntil,
} from "@chalk/prop";
import { defineGroup } from "@chalk/prop";
import { effect } from "@preact/signals-core";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { type PropModule, propModule } from "./prop-module";
import { BoardRuntime, type RuntimeServices, type SignalRecord } from "./runtime";

// ---- test props: a coin (instant + signals), a dial (tween), a label (IS input), a speaker (task) ----

const coinState = z
  .object({ heads: z.number().int(), count: z.number().int(), next: z.enum(["H", "T"]) })
  .strict();
type CoinState = z.infer<typeof coinState>;
const coinAct = actionsFor<CoinState>();
const coinSignals = { landed: signal("Landed `face` up", { face: z.enum(["H", "T"]) }) };
const coin = defineProp({
  type: "coin",
  role: PropRole.Explainer,
  describe: "A coin that lands on `next` (tests decide; no randomness here)",
  state: coinState,
  defaults: { heads: 0, count: 0, next: "H" },
  actions: {
    toss: coinAct({
      describe: "Toss",
      changes: ["heads", "count"],
      args: z.object({}).strict(),
      run: (s) =>
        set(
          { heads: s.heads + (s.next === "H" ? 1 : 0), count: s.count + 1 },
          raise(coinSignals.landed, { face: s.next }),
        ),
    }),
  },
  signals: coinSignals,
});

const dialState = z.object({ at: z.number().min(0).max(10) }).strict();
type DialState = z.infer<typeof dialState>;
const dialAct = actionsFor<DialState>();
const dial = defineProp({
  type: "dial",
  role: PropRole.Explainer,
  describe: "A dial",
  state: dialState,
  defaults: { at: 0 },
  actions: {
    turnTo: dialAct({
      describe: "Turn over time",
      changes: ["at"],
      args: z.object({ to: z.number(), over: z.number() }).strict(),
      run: (_s, a) => tween(a.over, { at: a.to }),
    }),
    setTo: dialAct({
      describe: "Set at once",
      args: z.object({ to: z.number() }).strict(),
      changes: ["at"],
      run: (_s, a) => set({ at: a.to }),
    }),
    // Says it changes nothing, then changes `at`: a prop bug the runtime refuses.
    sneak: dialAct({
      describe: "Changes what it doesn't declare",
      args: z.object({}).strict(),
      changes: [],
      run: () => set({ at: 9 }),
    }),
  },
});

const labelState = z.object({ text: z.record(z.string(), z.string()), value: z.number() }).strict();
type LabelState = z.infer<typeof labelState>;
const labelAct = actionsFor<LabelState>();
const label = defineProp({
  type: "label",
  role: PropRole.Explainer,
  describe: "A label",
  state: labelState,
  defaults: { text: { en: "", hi: "" }, value: 0 },
  inputs: ["text", "value"],
  actions: {
    setValue: labelAct({
      describe: "Set",
      changes: ["value"],
      args: z.object({ v: z.number() }).strict(),
      run: (_s, a) => set({ value: a.v }),
    }),
    say: labelAct({
      describe: "Say",
      changes: [],
      args: z.object({}).strict(),
      run: () => say(),
    }),
  },
  speech: (s) => ({ say: s.text }),
});

const tickerState = z
  .object({ isRunning: z.boolean(), ticks: z.number().int(), at: z.number() })
  .strict();
type TickerState = z.infer<typeof tickerState>;
const tickerAct = actionsFor<TickerState>();
const tickerSignals = {
  ticked: signal("A tick: `ticks` so far", { ticks: z.number() }),
  glided: signal("Glided"),
  three: signal("Three"),
};
const tick = tickerAct({
  describe: "One tick",
  changes: ["ticks"],
  internal: true,
  args: z.object({}).strict(),
  run: (s) => set({ ticks: s.ticks + 1 }, raise(tickerSignals.ticked, { ticks: s.ticks + 1 })),
});
/** Steps as data: a repeat with an internal tick, a glide, and a wait for its own state. */
const ticker = defineProp({
  type: "ticker",
  role: PropRole.Explainer,
  describe: "Ticks while running; glides `at`",
  state: tickerState,
  defaults: { isRunning: false, ticks: 0, at: 0 },
  actions: {
    start: tickerAct({
      describe: "Tick every 0.1 s until stopped",
      changes: ["isRunning"],
      args: z.object({}).strict(),
      run: () => seq(set({ isRunning: true }), repeat(0.1, tick, { while: (s) => s.isRunning })),
    }),
    tick,
    stop: tickerAct({
      describe: "Stop",
      changes: ["isRunning"],
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isRunning: false }),
    }),
    glide: tickerAct({
      describe: "Glide `at` to 10 over a second, then say so",
      changes: ["at"],
      args: z.object({}).strict(),
      run: () => seq(tween(1, { at: 10 }), set({}, raise(tickerSignals.glided))),
    }),
    nudge: tickerAct({
      describe: "The learner moves `at` by hand",
      changes: ["at"],
      byLearner: true,
      args: z.object({ to: z.number() }).strict(),
      run: (_s, a) => set({ at: a.to }),
    }),
    afterThree: tickerAct({
      describe: "Wait until three ticks, then say so",
      changes: [],
      args: z.object({}).strict(),
      run: () =>
        seq(
          waitUntil((s) => s.ticks >= 3),
          set({}, raise(tickerSignals.three)),
        ),
    }),
  },
  signals: tickerSignals,
});

/** The test props draw nothing: these tests are about the board's state, not what is shown. */
const Nothing = () => null;
const defs: Record<string, PropModule> = {
  ticker: propModule(ticker, Nothing),
  coin: propModule(coin, Nothing),
  dial: propModule(dial, Nothing),
  label: propModule(label, Nothing),
};

// ---- fake services: frames advance only when the test says so; speech finishes when told ----

function fakeServices() {
  let now = 0;
  let pending: ((now: number) => void)[] = [];
  const spoken: string[] = [];
  const speeches: (() => void)[] = [];
  const errors: string[] = [];
  const services: RuntimeServices = {
    now: () => now,
    frame: (callback) => {
      pending.push(callback);
      return () => {
        pending = pending.filter((c) => c !== callback);
      };
    },
    speak: (prop) =>
      new Promise((resolve) => {
        spoken.push(prop.name);
        speeches.push(resolve);
      }),
    onError: (message) => errors.push(message),
  };
  /** Moves time on by `ms`, one frame at a time. */
  const advance = async (ms: number, step = 16) => {
    for (let t = 0; t < ms; t += step) {
      now += step;
      const due = pending;
      pending = [];
      for (const callback of due) callback(now);
      await Promise.resolve();
    }
  };
  const finishSpeaking = async () => {
    speeches.shift()?.();
    await flush();
  };
  return { services, advance, spoken, finishSpeaking, errors };
}

const flush = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

function boardOf(input: unknown): Board {
  return boardSchema.parse(input);
}

const props = (...children: unknown[]) => ({ kind: "column", name: "page", children });

describe("BoardRuntime", () => {
  it("keeps IS rules true as state changes", () => {
    const { services } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "coin", prop: "coin" },
        { kind: "prop", name: "score", prop: "label" },
      ),
      is: [
        {
          set: "score.text",
          to: (at: BoardAt) => ({
            en: `Heads: ${at("coin").heads} / ${at("coin").count}`,
            hi: `चित: ${at("coin").heads}`,
          }),
        },
      ],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    expect(runtime.getView("score").text).toEqual({ en: "Heads: 0 / 0", hi: "चित: 0" });
    void runtime.call("coin", "toss");
    expect(runtime.getView("score").text).toEqual({ en: "Heads: 1 / 1", hi: "चित: 1" });
  });

  it("settles IS rules that feed each other, whatever order they are listed in, noting what each reads", () => {
    const { services } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "coin", prop: "coin" },
        { kind: "prop", name: "first", prop: "label" },
        { kind: "prop", name: "second", prop: "label" },
      ),
      // second reads first, but is listed before it
      is: [
        { set: "second.value", to: (at: BoardAt) => (at("first").value as number) + 1 },
        { set: "first.value", to: (at: BoardAt) => (at("coin").count as number) * 10 },
      ],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    expect(runtime.getView("second").value).toBe(1);
    void runtime.call("coin", "toss");
    expect(runtime.getView("first").value).toBe(10);
    expect(runtime.getView("second").value).toBe(11);
    expect(runtime.boundReads("second").get("value")).toEqual(["first.value"]);
  });

  it("notes what a rule reads each time it runs, down whichever branch it takes", () => {
    const { services } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "coin", prop: "coin" },
        { kind: "prop", name: "dial", prop: "dial" },
        { kind: "prop", name: "shown", prop: "label" },
      ),
      is: [
        {
          set: "shown.value",
          to: (at: BoardAt) => ((at("coin").count as number) > 0 ? (at("dial").at as number) : 0),
        },
      ],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    expect(runtime.boundReads("shown").get("value")).toEqual(["coin.count"]);
    void runtime.call("coin", "toss");
    expect(runtime.boundReads("shown").get("value")).toEqual(["coin.count", "dial.at"]);
  });

  it("reads a piece named or given as itself, in rules and conditions", () => {
    const { services } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "coin", prop: "coin" },
        { kind: "prop", name: "first", prop: "label" },
        { kind: "prop", name: "second", prop: "label" },
        { kind: "prop", name: "dial", prop: "dial" },
      ),
      // second reads first, but is listed before it; a piece is named or given as itself
      is: [
        { set: "second.value", to: (at: BoardAt) => (at("first").value as number) + 1 },
        { set: "first.value", to: (at: BoardAt) => (at({ name: "coin" }).count as number) * 10 },
      ],
      when: [
        {
          on: "coin.landed",
          if: (at: BoardAt) => (at("coin").count as number) >= 2,
          do: { call: "dial.setTo", args: { to: 9 } },
        },
      ],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    expect(runtime.getView("second").value).toBe(1);
    void runtime.call("coin", "toss");
    expect(runtime.getView("second").value).toBe(11);
    expect(runtime.getView("dial").at).toBe(0);
    void runtime.call("coin", "toss");
    expect(runtime.getView("dial").at).toBe(9);
    // What a rule reads is known, for the snapshot's "worked out from".
    expect(runtime.snapshot().nodes.find((n) => n.path === "second")?.bound.value?.from).toEqual([
      "first.value",
    ]);
  });

  it("saves the board as plain facts by address, and loads it back only if they fit", () => {
    const { services } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props({ kind: "prop", name: "dial", prop: "dial" }),
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    void runtime.call("dial", "setTo", { to: 4 }, Actor.Learner);
    const saved = runtime.save();
    expect(saved.dial).toEqual({ facts: { at: 4 }, isTouched: true });

    const copy = new BoardRuntime(board, (t) => defs[t], services);
    copy.load(saved);
    expect(copy.getView("dial").at).toBe(4);
    expect(copy.isTouched("dial")).toBe(true);
    // Facts its prop refuses, or a node not on the board: refused, nothing changed.
    const other = new BoardRuntime(board, (t) => defs[t], services);
    expect(() => other.load({ dial: { facts: { at: 99 }, isTouched: false } })).toThrow(/dial/);
    expect(() => other.load({ gone: saved.dial } as never)).toThrow(/not on this board/);
    expect(other.getView("dial").at).toBe(0);
  });

  it("numbers every action and signal, and says which act set each one off", async () => {
    const { services, advance } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "coin", prop: "coin" },
        { kind: "prop", name: "ticker", prop: "ticker" },
      ),
      when: [{ on: "coin.landed", do: { call: "ticker.glide" } }],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    const actions: { prop: string; action: string; n: number; cause?: number; isStep: boolean }[] =
      [];
    const signals: { prop: string; signal: string; n: number; from?: number }[] = [];
    runtime.onAction(({ prop, action, n, cause, isStep }) =>
      actions.push({ prop, action, n, isStep, ...(cause !== undefined ? { cause } : {}) }),
    );
    runtime.onSignal(({ prop, signal, n, from }) =>
      signals.push({ prop, signal, n, ...(from !== undefined ? { from } : {}) }),
    );
    void runtime.call("coin", "toss", {}, Actor.Learner);
    await advance(1100);
    runtime.signal("coin", "landed", { face: "T" });
    const toss = actions[0];
    expect(toss).toMatchObject({ prop: "coin", action: "toss", isStep: false });
    expect(toss?.cause).toBeUndefined();
    // Its signal, the rule's action it set off and that action's signal all point back to it.
    expect(signals[0]).toMatchObject({ prop: "coin", signal: "landed", from: toss?.n });
    expect(actions[1]).toMatchObject({ prop: "ticker", action: "glide", cause: toss?.n });
    expect(signals[1]).toMatchObject({ prop: "ticker", signal: "glided", from: toss?.n });
    // A signal a view raised is an act itself; what it sets off points back to it.
    const raised = signals[2];
    expect(raised?.from).toBeUndefined();
    expect(actions[2]).toMatchObject({ action: "glide", cause: raised?.n });
  });

  it("refuses a signal that doesn't carry what its prop says, wherever it was raised", () => {
    const { services, errors } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props({ kind: "prop", name: "coin", prop: "coin" }),
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    const heard: string[] = [];
    runtime.onSignal(({ signal }) => heard.push(signal));
    // A view raising it with a face that isn't one: reported, and nothing answers it.
    runtime.signal("coin", "landed", { face: "edge" });
    runtime.signal("coin", "landed", {});
    expect(heard).toEqual([]);
    expect(errors).toEqual([
      expect.stringMatching(/coin.landed carries {"face":"edge"}: face/),
      expect.stringMatching(/coin.landed carries {}: face/),
    ]);
    runtime.signal("coin", "landed", { face: "H" });
    expect(heard).toEqual(["landed"]);
  });

  it("marks a prop's own steps over time as steps, not acts", async () => {
    const { services, advance } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props({ kind: "prop", name: "ticker", prop: "ticker" }),
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    const seen: { action: string; isStep: boolean; cause?: number }[] = [];
    runtime.onAction(({ action, isStep, cause }) =>
      seen.push({ action, isStep, ...(cause !== undefined ? { cause } : {}) }),
    );
    void runtime.call("ticker", "start", {}, Actor.Learner);
    await advance(250);
    expect(seen[0]).toEqual({ action: "start", isStep: false });
    expect(seen.slice(1).every((a) => a.action === "tick" && a.isStep)).toBe(true);
    expect(seen.length).toBeGreaterThan(1);
  });

  it("re-reads a prop's view only when that prop changed", () => {
    const { services } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "coin", prop: "coin" },
        { kind: "prop", name: "dial", prop: "dial" },
      ),
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    let dialReads = 0;
    const stop = effect(() => {
      runtime.getView("dial");
      dialReads++;
    });
    void runtime.call("coin", "toss");
    void runtime.call("coin", "toss");
    expect(dialReads).toBe(1);
    void runtime.call("dial", "setTo", { to: 3 });
    expect(dialReads).toBe(2);
    stop();
  });

  it("refuses an action that would set a field an IS owns", async () => {
    const { services, errors } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "coin", prop: "coin" },
        { kind: "prop", name: "score", prop: "label" },
      ),
      is: [{ set: "score.value", to: (at: BoardAt) => (at("coin").count as number) * 10 }],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    await runtime.call("score", "setValue", { v: 5 });
    expect(runtime.getView("score").value).toBe(0);
    expect(errors[0]).toMatch(/set by an IS rule/);
  });

  it("answers WHEN rules in order, with conditions", () => {
    const { services } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "coin", prop: "coin" },
        { kind: "prop", name: "dial", prop: "dial" },
      ),
      when: [
        { on: "coin.landed", do: { call: "dial.setTo", args: { to: 1 } } },
        {
          on: "coin.landed",
          if: (at: BoardAt) => (at("coin").count as number) >= 3,
          do: { call: "dial.setTo", args: { to: 9 } },
        },
      ],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    const seen: SignalRecord[] = [];
    runtime.onSignal((r) => seen.push(r));
    void runtime.call("coin", "toss", {}, Actor.Learner);
    expect(runtime.getView("dial").at).toBe(1);
    void runtime.call("coin", "toss");
    void runtime.call("coin", "toss");
    expect(runtime.getView("dial").at).toBe(9);
    expect(seen.map((r) => [r.prop, r.signal, r.actor])).toEqual([
      ["coin", "landed", Actor.Learner],
      ["coin", "landed", Actor.Lesson],
      ["coin", "landed", Actor.Lesson],
    ]);
  });

  it("works out arguments written as code when the action is called", () => {
    const { services } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "coin", prop: "coin" },
        { kind: "prop", name: "dial", prop: "dial" },
      ),
      when: [
        {
          on: "coin.landed",
          do: {
            call: "dial.setTo",
            args: (at: BoardAt) => ({ to: (at("coin").count as number) * 2 }),
          },
        },
      ],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    void runtime.call("coin", "toss");
    expect(runtime.getView("dial").at).toBe(2);
    void runtime.call("coin", "toss");
    expect(runtime.getView("dial").at).toBe(4);
  });

  it("plays a script: speech WITH a tween, THEN the next step once both finish", async () => {
    const { services, advance, spoken, finishSpeaking } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "maya", prop: "label", with: { text: { en: "Hi", hi: "नमस्ते" } } },
        { kind: "prop", name: "dial", prop: "dial" },
        { kind: "prop", name: "coin", prop: "coin" },
      ),
      when: [
        {
          on: "board.started",
          do: [
            { par: [{ call: "maya.say" }, { call: "dial.turnTo", args: { to: 10, over: 1 } }] },
            { call: "coin.toss" },
          ],
        },
      ],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    runtime.start();
    await flush();
    expect(spoken).toEqual(["maya"]);
    await advance(500);
    const midway = runtime.getView("dial").at as number;
    expect(midway).toBeGreaterThan(2);
    expect(midway).toBeLessThan(8);
    await advance(600);
    expect(runtime.getView("dial").at).toBe(10);
    expect(runtime.getView("coin").count).toBe(0); // still waiting for Maya
    await finishSpeaking();
    expect(runtime.getView("coin").count).toBe(1);
  });

  it("says what is still going on until the board has settled", async () => {
    const { services, advance } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "dial", prop: "dial" },
        { kind: "prop", name: "coin", prop: "coin" },
      ),
      when: [
        {
          on: "board.started",
          do: [
            { call: "dial.turnTo", args: { to: 10, over: 1 } },
            { wait: 1 },
            { call: "coin.toss" },
          ],
        },
      ],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    expect(runtime.busyWith()).toEqual([]);
    runtime.start();
    await flush();
    expect(runtime.busyWith()).toEqual(["a script answering board.started", "dial"]);
    await advance(1100);
    // The glide is done; the script is waiting its second.
    expect(runtime.busyWith()).toEqual(["a script answering board.started"]);
    await advance(1100);
    expect(runtime.getView("coin").count).toBe(1);
    expect(runtime.busyWith()).toEqual([]);
  });

  it("lets the learner win: touching a prop stops the lesson's tween on it", async () => {
    const { services, advance } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props({ kind: "prop", name: "dial", prop: "dial" }),
      when: [{ on: "board.started", do: { call: "dial.turnTo", args: { to: 10, over: 1 } } }],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    runtime.start();
    await advance(300);
    await runtime.call("dial", "setTo", { to: 2 }, Actor.Learner);
    await advance(1000);
    expect(runtime.getView("dial").at).toBe(2);
    expect(runtime.isTouched("dial")).toBe(true);
  });

  it("pauses everything moving, and carries on after", async () => {
    const { services, advance } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "dial", prop: "dial" },
        { kind: "prop", name: "coin", prop: "coin" },
      ),
      when: [{ on: "board.started", do: [{ wait: 1 }, { call: "coin.toss" }] }],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    runtime.start();
    await advance(500);
    runtime.pause();
    await advance(2000);
    expect(runtime.getView("coin").count).toBe(0);
    runtime.resume();
    await advance(600);
    await flush();
    expect(runtime.getView("coin").count).toBe(1);
  });

  it("shows and hides props, and passes, through the board prop", async () => {
    const { services } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props({ kind: "prop", name: "coin", prop: "coin", isHidden: true }),
      when: [
        {
          on: "coin.landed",
          do: [{ call: "board.show", args: { name: "coin" } }, { call: "board.pass" }],
        },
      ],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    expect(runtime.isHidden("coin")).toBe(true);
    await runtime.call("coin", "toss");
    await flush();
    expect(runtime.isHidden("coin")).toBe(false);
    expect(runtime.getView(BOARD).isPassed).toBe(true);
  });

  it("stops everything when the board goes away", async () => {
    const { services, advance } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props({ kind: "prop", name: "coin", prop: "coin" }),
      when: [{ on: "board.started", do: [{ wait: 0.5 }, { call: "coin.toss" }] }],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    runtime.start();
    runtime.dispose();
    await advance(1000);
    expect(runtime.getView("coin").count).toBe(0);
  });

  it("refuses a change outside the fields an action declares, whoever acts", async () => {
    const { services, errors } = fakeServices();
    const board = new BoardRuntime(
      boardOf({
        name: "b",
        root: {
          name: "page",
          kind: "column",
          children: [{ name: "d", kind: "prop", prop: "dial" }],
        },
      }),
      (t) => defs[t],
      services,
    );
    await board.call("d", "setTo", { to: 3 }, Actor.Learner);
    expect(board.getStored("d").at).toBe(3);
    await board.call("d", "sneak", {}, Actor.Learner);
    expect(board.getStored("d").at).toBe(3);
    expect(errors.join()).toMatch(/d\.sneak changed at, outside what it declares/);
  });

  it("runs a group placed on a board: children's laws, links, routes, and board rules reading inside it", async () => {
    // A dial whose `at` is bound to a label's value; dragging the dial is routed to the label.
    const pair = defineGroup({
      type: "pair",
      role: PropRole.Explainer,
      describe: "a dial bound to a value",
      children: { value: label, dial },
      is: { dial: (s) => ({ at: s.value.value }) },
      route: {
        dial: {
          setTo: (_s, a, run) => [run.value.setValue({ v: a.to })],
          turnTo: (_s, a, run) => [run.value.setValue({ v: a.to })],
          sneak: () => undefined,
        },
      },
      summary: () => "a pair",
      layout: { kind: "column", children: ["value", "dial"] },
    });
    const { services, errors } = fakeServices();
    const board = new BoardRuntime(
      boardOf({
        name: "b",
        root: {
          name: "page",
          kind: "column",
          children: [
            { name: "p", kind: "prop", prop: "pair", with: { value: { value: 2 } } },
            { name: "shown", kind: "prop", prop: "label" },
          ],
        },
        is: [
          {
            set: "shown.value",
            to: (at: BoardAt) => ((at("p").dial as { at: number }).at as number) * 10,
          },
        ],
      }),
      (t) => (t === "pair" ? propModule(pair, Nothing) : defs[t]),
      services,
    );
    // The dial's `at` is bound: not stored, read through the view.
    expect(board.getStored("p").dial).toEqual({});
    expect(board.getView("p").dial).toMatchObject({ at: 2 });
    // A field the board binds is not stored either.
    expect(board.getStored("shown").value).toBeUndefined();
    expect(board.getView("shown").value).toBe(20);
    await board.call("p", "dial.setTo", { to: 7 }, Actor.Learner);
    expect(board.getStored("p").value).toMatchObject({ value: 7 });
    expect(board.getView("p").dial).toMatchObject({ at: 7 });
    expect(board.getView("shown").value).toBe(70);
    expect(errors).toEqual([]);
    // Writing it is refused, and reported when the lesson does it.
    await board.call("shown", "setValue", { v: 1 });
    expect(board.getView("shown").value).toBe(70);
    expect(errors.join()).toMatch(/shown: value is set by an IS rule/);
  });

  it("forks: a copy of the board now, changed without touching the original", async () => {
    const { services } = fakeServices();
    const board = new BoardRuntime(
      boardOf({
        name: "b",
        root: {
          name: "page",
          kind: "column",
          children: [
            { name: "d", kind: "prop", prop: "dial" },
            { name: "shown", kind: "prop", prop: "label" },
          ],
        },
        is: [{ set: "shown.value", to: (at: BoardAt) => (at("d").at as number) + 1 }],
      }),
      (t) => defs[t],
      services,
    );
    await board.call("d", "setTo", { to: 3 }, Actor.Learner);
    const copy = board.fork();
    expect(copy.getView("shown").value).toBe(4);
    expect(copy.isTouched("d")).toBe(true);
    await copy.call("d", "setTo", { to: 5 }, Actor.Learner);
    expect(copy.getView("shown").value).toBe(6);
    expect(board.getView("shown").value).toBe(4);
    // Restoring an old snapshot that still holds a bound field: the board works it out again.
    board.restoreFacts(
      new Map([
        ["d", { at: 9 }],
        ["shown", { text: { en: "", hi: "" }, value: 0 }],
      ]),
    );
    expect(board.getView("shown").value).toBe(10);
  });
  it("runs steps as data: a repeat ticks on the board's clock until its test fails", async () => {
    const { services, advance } = fakeServices();
    const board = new BoardRuntime(
      boardOf({ name: "b", root: props({ kind: "prop", name: "t", prop: "ticker" }) }),
      (t) => defs[t],
      services,
    );
    const heard: string[] = [];
    board.onSignal((r) => heard.push(r.signal));
    let isDone = false;
    void board.call("t", "start").then(() => {
      isDone = true;
    });
    await advance(350);
    expect(board.getView("t").ticks).toBe(3);
    expect(heard.filter((s) => s === "ticked")).toHaveLength(3);
    // The learner stops it: the repeat ends at its next turn, and `start` finishes.
    await board.call("t", "stop", {}, Actor.Learner);
    await advance(200);
    expect(board.getView("t").ticks).toBe(3);
    expect(isDone).toBe(true);
    // Ticks are the prop's own: Jugnu can't call one.
    expect(board.whyNotJugnu("t", "tick")).toMatch(/step of the prop's own/);
  });

  it("waits for a prop's own state: at once if it already holds", async () => {
    const { services, advance } = fakeServices();
    const board = new BoardRuntime(
      boardOf({ name: "b", root: props({ kind: "prop", name: "t", prop: "ticker" }) }),
      (t) => defs[t],
      services,
    );
    const heard: string[] = [];
    board.onSignal((r) => heard.push(r.signal));
    void board.call("t", "afterThree");
    void board.call("t", "start");
    await advance(250);
    expect(heard).not.toContain("three");
    await advance(200);
    expect(heard).toContain("three");
    await board.call("t", "stop");
    await board.call("t", "afterThree");
    expect(heard.filter((s) => s === "three")).toHaveLength(2);
  });

  it("the learner wins: a lesson's glide stops when they move what it moves", async () => {
    const { services, advance } = fakeServices();
    const board = new BoardRuntime(
      boardOf({ name: "b", root: props({ kind: "prop", name: "t", prop: "ticker" }) }),
      (t) => defs[t],
      services,
    );
    const heard: string[] = [];
    board.onSignal((r) => heard.push(r.signal));
    void board.call("t", "glide");
    await advance(300);
    const midway = board.getView("t").at as number;
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(10);
    await board.call("t", "nudge", { to: 2 }, Actor.Learner);
    await advance(1000);
    expect(board.getView("t").at).toBe(2);
    expect(heard).not.toContain("glided");
    // Left alone, it runs to the end and says so.
    void board.call("t", "glide");
    await advance(1100);
    expect(board.getView("t").at).toBe(10);
    expect(heard).toContain("glided");
  });
});

describe("the one snapshot, act and watch", () => {
  const make = () => {
    const { services } = fakeServices();
    return new BoardRuntime(
      boardOf({
        name: "b",
        root: props(
          { kind: "prop", name: "d", prop: "dial", with: { at: 2 } },
          { kind: "prop", name: "shown", prop: "label" },
        ),
        is: [{ set: "shown.value", to: (at: BoardAt) => (at("d").at as number) * 10 }],
        when: [{ on: "board.started", do: { call: "shown.say" } }],
      }),
      (t) => defs[t],
      services,
    );
  };

  it("reads every node by address, with what is bound into it and where from", () => {
    const snap = make().snapshot();
    expect(snap.nodes.map((n) => n.path)).toEqual(["d", "shown"]);
    const shown = snap.nodes.find((n) => n.path === "shown");
    expect(shown?.bound.value).toEqual({ value: 20, from: ["d.at"] });
  });

  it("acts on a node by address and says what moved", async () => {
    const board = make();
    const heard: string[] = [];
    board.watch((e) =>
      heard.push(`${e.kind} ${e.node} ${e.kind === "signal" ? e.signal : e.action}`),
    );
    const done = await board.act({ node: "d", action: "setTo", args: { to: 5 } }, Actor.Learner);
    expect(done.refused).toBeUndefined();
    expect(done.changed).toEqual(
      expect.arrayContaining([
        { path: "d.at", was: 2, now: 5 },
        { path: "shown.value", was: 20, now: 50 },
      ]),
    );
    expect(heard).toContain("action d setTo");
    const no = await board.act({ node: "nowhere", action: "x" });
    expect(no.refused).toMatch(/no prop "nowhere"/);
  });
});

import { Actor, type Board, boardSchema } from "@chalk/content";
import {
  type AnyPropDef,
  BOARD,
  actionsFor,
  asAnyProp,
  defineProp,
  set,
  task,
  tween,
} from "@chalk/prop";
import { defineGroup } from "@chalk/prop";
import { effect } from "@preact/signals-core";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { BoardRuntime, type RuntimeServices, type SignalRecord } from "./runtime";

// ---- test props: a coin (instant + signals), a dial (tween), a label (IS input), a speaker (task) ----

const coinState = z
  .object({ heads: z.number().int(), count: z.number().int(), next: z.enum(["H", "T"]) })
  .strict();
type CoinState = z.infer<typeof coinState>;
const coinAct = actionsFor<CoinState>();
const coin = defineProp({
  type: "coin",
  describe: "A coin that lands on `next` (tests decide; no randomness here)",
  state: coinState,
  defaults: { heads: 0, count: 0, next: "H" },
  actions: {
    toss: coinAct({
      describe: "Toss",
      args: z.object({}).strict(),
      run: (s) =>
        set(
          { heads: s.heads + (s.next === "H" ? 1 : 0), count: s.count + 1 },
          { signal: "landed", payload: { face: s.next } },
        ),
    }),
  },
  signals: { landed: { describe: "Landed" } },
});

const dialState = z.object({ at: z.number().min(0).max(10) }).strict();
type DialState = z.infer<typeof dialState>;
const dialAct = actionsFor<DialState>();
const dial = defineProp({
  type: "dial",
  describe: "A dial",
  state: dialState,
  defaults: { at: 0 },
  actions: {
    turnTo: dialAct({
      describe: "Turn over time",
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
  describe: "A label",
  state: labelState,
  defaults: { text: { en: "", hi: "" }, value: 0 },
  inputs: ["text", "value"],
  actions: {
    setValue: labelAct({
      describe: "Set",
      args: z.object({ v: z.number() }).strict(),
      run: (_s, a) => set({ value: a.v }),
    }),
    say: labelAct({
      describe: "Say",
      args: z.object({}).strict(),
      run: () => task((c) => c.speak()),
    }),
  },
  speech: (s) => ({ say: s.text }),
});

const defs: Record<string, AnyPropDef> = {
  coin: asAnyProp(coin),
  dial: asAnyProp(dial),
  label: asAnyProp(label),
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
          text: { en: "Heads: {coin.heads} / {coin.count}", hi: "चित: {coin.heads}" },
        },
      ],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    expect(runtime.getView("score").text).toEqual({ en: "Heads: 0 / 0", hi: "चित: 0" });
    void runtime.call("coin", "toss");
    expect(runtime.getView("score").text).toEqual({ en: "Heads: 1 / 1", hi: "चित: 1" });
  });

  it("settles IS rules that feed each other, whatever order they are listed in", () => {
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
        { set: "second.value", to: "first.value + 1" },
        { set: "first.value", to: "coin.count * 10" },
      ],
    });
    const runtime = new BoardRuntime(board, (t) => defs[t], services);
    expect(runtime.getView("second").value).toBe(1);
    void runtime.call("coin", "toss");
    expect(runtime.getView("first").value).toBe(10);
    expect(runtime.getView("second").value).toBe(11);
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
      is: [{ set: "score.value", to: "coin.count * 10" }],
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
        { on: "coin.landed", if: "coin.count >= 3", do: { call: "dial.setTo", args: { to: 9 } } },
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

  it("works out expression arguments when the action is called", () => {
    const { services } = fakeServices();
    const board = boardOf({
      name: "b",
      root: props(
        { kind: "prop", name: "coin", prop: "coin" },
        { kind: "prop", name: "dial", prop: "dial" },
      ),
      when: [
        { on: "coin.landed", do: { call: "dial.setTo", args: { to: { expr: "coin.count * 2" } } } },
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
      describe: "a dial bound to a value",
      children: { value: label, dial },
      is: { dial: (s) => ({ at: s.value.value }) },
      route: {
        "dial.setTo": (_s, a) => [["value.setValue", { v: a.to }]],
        "dial.turnTo": (_s, a) => [["value.setValue", { v: a.to }]],
        "dial.sneak": () => undefined,
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
        is: [{ set: "shown.value", to: "p.dial.at * 10" }],
      }),
      (t) => (t === "pair" ? pair : defs[t]),
      services,
    );
    // The dial's `at` is bound: not stored, read through the view.
    expect(board.getStored("p").dial).toEqual({});
    expect(board.getView("p").dial).toMatchObject({ at: 2 });
    expect(board.getStored("shown").value).toBe(20);
    await board.call("p", "dial.setTo", { to: 7 }, Actor.Learner);
    expect(board.getStored("p").value).toMatchObject({ value: 7 });
    expect(board.getView("p").dial).toMatchObject({ at: 7 });
    expect(board.getStored("shown").value).toBe(70);
    expect(errors).toEqual([]);
  });
});

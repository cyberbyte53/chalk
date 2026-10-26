import { Actor, type EventEntry, lessonSchema } from "@chalk/content";
import { BoardRuntime, type RuntimeServices, recordBoard } from "@chalk/player";
import { BOARD } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import coinLesson from "../../../platform/studio/evals/boards/does-a-coin-settle.json";
import doesItEnd from "../../../platform/studio/evals/boards/does-it-end.json";
import { propDefs } from "./index";

// Real lessons, real props, fake time: the whole board model end to end, without a browser.

function fakeTime() {
  let now = 0;
  let pending: ((now: number) => void)[] = [];
  const spoken: string[] = [];
  const services: RuntimeServices = {
    now: () => now,
    frame: (callback) => {
      pending.push(callback);
      return () => {
        pending = pending.filter((c) => c !== callback);
      };
    },
    speak: async (prop) => {
      spoken.push(prop.name);
    },
    onError: (message) => {
      throw new Error(message);
    },
  };
  const advance = async (seconds: number) => {
    for (let t = 0; t < seconds * 1000; t += 16) {
      now += 16;
      const due = pending;
      pending = [];
      for (const callback of due) callback(now);
      for (let i = 0; i < 5; i++) await Promise.resolve();
    }
  };
  return { services, advance, spoken };
}

describe("does a coin settle?", () => {
  const lesson = lessonSchema.parse(coinLesson);
  const tossing = lesson.boards[0];
  if (tossing === undefined) throw new Error("no first board");

  it("one press tosses once and plots the point", async () => {
    const { services, advance } = fakeTime();
    const runtime = new BoardRuntime(tossing, (type) => propDefs[type], services);
    runtime.start();
    await runtime.call("tossOnce", "press", {}, Actor.Learner);
    await advance(0.1);
    expect(runtime.getView("coin").count).toBe(1);
    expect(runtime.getView("chart").points).toEqual([[1, runtime.getView("coin").headsFraction]]);
  });

  it("toss 100: the timer drives the coin, the coin drives the graph, Maya speaks at 100", async () => {
    const { services, advance, spoken } = fakeTime();
    const runtime = new BoardRuntime(tossing, (type) => propDefs[type], services);
    runtime.start();
    await runtime.call("tossMany", "press", {}, Actor.Learner);
    await advance(0.5);
    // Buttons are off while the timer runs (an IS rule), so a second press does nothing.
    expect(runtime.getView("tossMany").isEnabled).toBe(false);
    expect(runtime.getView("clock").isRunning).toBe(true);
    await advance(5);
    const coin = runtime.getView("coin");
    expect(coin.count).toBe(100);
    expect(runtime.getView("chart").points).toHaveLength(100);
    expect(runtime.getView("clock").isRunning).toBe(false);
    expect(runtime.getView("tossOnce").isEnabled).toBe(true);
    expect(runtime.isHidden("mayaSettles")).toBe(false);
    expect(spoken).toContain("mayaSettles");
    expect(runtime.getView(BOARD).isPassed).toBe(true);
    // A fair coin after 100 tosses: near a half, not exactly a half every time.
    expect(Math.abs((coin.headsFraction as number) - 0.5)).toBeLessThan(0.15);
  });

  it("records what the learner did and every signal, linked to its cause; not the coin's own steps", async () => {
    const { services, advance } = fakeTime();
    const runtime = new BoardRuntime(tossing, (type) => propDefs[type], services);
    // The channel, as the board sees it: each entry gets the next seq.
    const seen: (EventEntry & { seq: number })[] = [];
    const record = (entry: EventEntry) => seen.push({ ...entry, seq: seen.length }) - 1;
    const recorder = recordBoard(runtime, record, "o1");
    recorder.open({ locale: "en" });
    runtime.start();
    await runtime.call("tossMany", "press", {}, Actor.Learner);
    await advance(5);
    recorder.close();
    expect(seen[0]?.kind).toBe("open");
    expect(seen.at(-1)?.kind).toBe("close");
    // One cause: the press. The hundred tosses it set off are the props' own steps and the
    // lesson's rules, so they aren't causes; their signals point back to the press.
    const causes = seen.filter((e) => e.kind === "cause");
    expect(causes.map((e) => e.payload)).toEqual([{ action: "press", args: {} }]);
    const press = causes[0]?.seq;
    const signals = seen.filter((e) => e.kind === "signal");
    expect(signals[0]?.payload).toMatchObject({ signal: "started", from: null });
    const after = signals.slice(1);
    expect(after.length).toBeGreaterThan(1);
    expect(after.every((e) => e.kind === "signal" && e.payload.from === press)).toBe(true);
    expect(new Set(seen.map((e) => e.opening))).toEqual(new Set(["o1"]));
  });

  it("stops ticking when the board goes away", async () => {
    const { services, advance } = fakeTime();
    const runtime = new BoardRuntime(tossing, (type) => propDefs[type], services);
    runtime.start();
    await runtime.call("tossMany", "press", {}, Actor.Learner);
    await advance(1);
    const count = runtime.getView("coin").count;
    runtime.dispose();
    await advance(2);
    expect(runtime.getView("coin").count).toBe(count);
  });
});

describe("does the decimal ever end?", () => {
  const lesson = lessonSchema.parse(doesItEnd);
  const board = lesson.boards[2];
  if (board === undefined) throw new Error("no 22 ÷ 7 board");

  it("the timer divides 22 by 7 until a remainder comes back, then stops and passes", async () => {
    const { services, advance, spoken } = fakeTime();
    const runtime = new BoardRuntime(board, (type) => propDefs[type], services);
    runtime.start();
    await runtime.call("divide", "press", {}, Actor.Learner);
    expect(runtime.getView("divide").isEnabled).toBe(false);
    await advance(5);
    const division = runtime.getView("division");
    expect(division.hasRepeated).toBe(true);
    expect(division.digits).toBe("142857");
    expect(runtime.getView("clock").isRunning).toBe(false);
    expect(spoken).toContain("mayaPi");
    expect(runtime.getView(BOARD).isPassed).toBe(true);
    // Done: the button stays off, since there is nothing left to show.
    expect(runtime.getView("divide").isEnabled).toBe(false);
  });
});

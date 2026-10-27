import { Actor, type EventEntry } from "@chalk/content";
import { BoardRuntime, type RuntimeServices, recordBoard } from "@chalk/player";
import { BOARD } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { propDefs } from "./index";
import { testLesson } from "./test-lesson";

// A lesson built as content is, real props, fake time: the whole board model end to end, without a browser.

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

const [, race, divide] = testLesson().boards;
if (race === undefined || divide === undefined) throw new Error("no test boards");

describe("two runners", () => {
  it("play glides the clock on the board's time; at 12 they meet, the note is said, the board passes", async () => {
    const { services, advance, spoken } = fakeTime();
    const runtime = new BoardRuntime(race, (type) => propDefs[type], services);
    runtime.start();
    // Play resolves when the clock arrives, on the board's time: don't wait for it here.
    void runtime.call("runners", "play", {}, Actor.Learner);
    await advance(0.1);
    const early = runtime.getView("runners");
    expect(early.isRunning).toBe(true);
    expect(early.time as number).toBeGreaterThan(0);
    expect(early.time as number).toBeLessThan(12);
    await advance(10);
    expect(runtime.getView("runners")).toMatchObject({ time: 12, isRunning: false });
    expect(runtime.isHidden("met")).toBe(false);
    expect(spoken).toContain("met");
    expect(runtime.getView(BOARD).isPassed).toBe(true);
  });

  it("records what the learner did and every signal, linked to its cause; not the props' own steps", async () => {
    const { services, advance } = fakeTime();
    const runtime = new BoardRuntime(race, (type) => propDefs[type], services);
    // The channel, as the board sees it: each entry gets the next seq.
    const seen: (EventEntry & { seq: number })[] = [];
    const record = (entry: EventEntry) => seen.push({ ...entry, seq: seen.length }) - 1;
    const recorder = recordBoard(runtime, record, "o1");
    recorder.open({ locale: "en" });
    runtime.start();
    void runtime.call("runners", "play", {}, Actor.Learner);
    await advance(10);
    recorder.close();
    expect(seen[0]?.kind).toBe("open");
    expect(seen.at(-1)?.kind).toBe("close");
    // One cause: the press. Arriving is the race's own step, and the board passing is the
    // lesson's rule, so they aren't causes; their signals point back to the press.
    const causes = seen.filter((e) => e.kind === "cause");
    expect(causes.map((e) => e.payload)).toEqual([{ action: "play", args: {} }]);
    const press = causes[0]?.seq;
    const signals = seen.filter((e) => e.kind === "signal");
    expect(signals[0]?.payload).toMatchObject({ signal: "started", from: null });
    const after = signals.slice(1);
    expect(after.map((e) => e.kind === "signal" && e.payload.signal)).toContain("met");
    expect(after.every((e) => e.kind === "signal" && e.payload.from === press)).toBe(true);
    expect(new Set(seen.map((e) => e.opening))).toEqual(new Set(["o1"]));
  });

  it("stops the clock when the board goes away", async () => {
    const { services, advance } = fakeTime();
    const runtime = new BoardRuntime(race, (type) => propDefs[type], services);
    runtime.start();
    void runtime.call("runners", "play", {}, Actor.Learner);
    await advance(0.5);
    const time = runtime.getView("runners").time;
    runtime.dispose();
    await advance(2);
    expect(runtime.getView("runners").time).toBe(time);
  });
});

describe("does 22 ÷ 7 end?", () => {
  it("a digit a tap, until a remainder comes back; then the note is said and the board passes", async () => {
    const { services, advance, spoken } = fakeTime();
    const runtime = new BoardRuntime(divide, (type) => propDefs[type], services);
    runtime.start();
    for (let i = 0; i < 7 && runtime.getView("division").hasRepeated !== true; i++)
      await runtime.call("division", "nextDigit", {}, Actor.Learner);
    await advance(0.1);
    const division = runtime.getView("division");
    expect(division.hasRepeated).toBe(true);
    expect(division.digits).toBe("142857");
    expect(spoken).toContain("repeats");
    expect(runtime.getView(BOARD).isPassed).toBe(true);
  });
});

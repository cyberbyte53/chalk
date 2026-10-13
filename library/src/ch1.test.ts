import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Actor, type Board, lessonSchema } from "@chalk/content";
import { BoardRuntime, type RuntimeServices } from "@chalk/player";
import { BOARD } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { propDefs } from "./index";

// Every board of Class 9 Maths Chapter 1, played the way a student would: real lessons, real props,
// fake time. A board passes only if a learner doing the right thing gets Continue.

const folder = new URL("../../content/class9-maths/ch1-number-systems/lessons/", import.meta.url)
  .pathname;
const lessons = readdirSync(folder)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => lessonSchema.parse(JSON.parse(readFileSync(join(folder, f), "utf8"))));

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

type Play = {
  runtime: BoardRuntime;
  advance: (seconds: number) => Promise<void>;
  act: (prop: string, action: string, args?: Record<string, unknown>) => Promise<void>;
  view: (prop: string) => Record<string, unknown>;
};

function typeOf(board: Board, name: string): string | undefined {
  const find = (p: Board["root"]): string | undefined => {
    if (p.name === name && p.kind === "prop") return p.prop;
    if ("children" in p) {
      for (const c of p.children) {
        const found = find(c);
        if (found !== undefined) return found;
      }
    }
    return undefined;
  };
  return find(board.root);
}

/** What a student does on each kind of board: the moves that answer it. */
async function solve(board: Board, play: Play): Promise<void> {
  const { act, view, advance } = play;
  const has = (type: string) => play.runtime.propNames().find((n) => typeOf(board, n) === type);

  const sorter = has("numberSorter");
  if (sorter !== undefined) {
    const right = view(sorter).rightPlace as Record<string, string>;
    for (const [card, place] of Object.entries(right)) {
      await act(sorter, "pick", { card });
      await act(sorter, "drop", { place });
    }
  }
  if (board.name === "sixBetween") {
    for (let i = 0; i < 5; i++) await act("line", "changeParts", { by: 1 });
  }
  if (board.name === "hunt") await act("line", "moveMarker", { to: 1.4142 });
  if (board.name.startsWith("twoPointSix")) {
    for (let i = 0; i < 3; i++) {
      await act("zoom", "press");
      await advance(2.5);
    }
  }
  if (board.name === "fourPlaces") {
    for (let i = 0; i < 4; i++) {
      await act("zoom", "press");
      await advance(2.5);
    }
  }

  const builder = has("rootBuilder");
  if (builder !== undefined) {
    if (board.name === "placeRootFive") await act(builder, "setBase", { n: 4 });
    for (let i = 0; i < 3 && view(BOARD).isPassed !== true; i++) {
      if (view(builder).canSwing === true) await act(builder, "swing");
      await advance(3);
    }
  }
  const spiral = has("rootSpiral");
  if (spiral !== undefined) {
    while ((view(spiral).steps as number) < 9) {
      await act(spiral, "addStep");
      await advance(1.6);
    }
  }
  const semicircle = has("rootSemicircle");
  if (semicircle !== undefined && board.name !== "xIsFour") {
    if (board.name === "rootNinePointThree") await act(semicircle, "setX", { x: 9.3 });
    await act(semicircle, "swing");
    await advance(3);
  }

  const division = has("decimalExpansion");
  if (division !== undefined && !play.runtime.isHidden(division)) {
    for (let i = 0; i < 30; i++) {
      const d = view(division);
      if (d.hasEnded === true || view(BOARD).isPassed === true) break;
      if (d.hasRepeated === true && (d.isAskingDigit === true || (d.digitsShown as number) >= 6)) {
        break;
      }
      if (d.isAskingDigit === true) {
        const digit = Math.floor((d.partialDividend as number) / (d.denominator as number));
        await act(division, "tryDigit", { digit });
      } else {
        await act(division, "nextDigit");
      }
      await advance(0.2);
    }
  }

  const tapes = has("decimalShift");
  if (tapes !== undefined) {
    const t = view(tapes);
    const want = (t.prefix as string).length + (t.block as string).length;
    if (t.topPower === 0 && t.bottomPower === 0) {
      for (let i = 0; i < want; i++) await act(tapes, "shift", { tape: "top", by: 1 });
    }
    if (view(tapes).topPower !== view(tapes).bottomPower) {
      await act(tapes, "subtract");
      await advance(2.5);
    }
  }

  const tiles = has("surdTiles");
  if (tiles !== undefined && !play.runtime.isHidden(tiles)) {
    if (view(tiles).canChangeRight === true) await act(tiles, "flipSign", { term: 1 });
    else await act(tiles, "combine");
    await advance(3);
  }

  const routes = has("exponentRoutes");
  if (routes !== undefined && !play.runtime.isHidden(routes)) {
    const steps = view(routes).stepCount as number;
    for (let i = 0; i < steps; i++) {
      await act(routes, "stepRootFirst");
      await act(routes, "stepPowerFirst");
    }
  }

  // The board's question, if it has one: the right option, or Check on the goal.
  const choice = has("choice");
  if (choice !== undefined) {
    await act(choice, "select", { option: view(choice).answer as string });
    await act(choice, "check");
  }
  const goal = has("goal");
  if (goal !== undefined) {
    await advance(0.5);
    await act(goal, "check");
  }
}

describe("Class 9 Maths, Chapter 1: every board can be passed", () => {
  it("has its eleven lessons, in order", () => {
    expect(lessons.map((l) => l.id.split("/").at(-1))).toEqual([
      "families-of-numbers",
      "always-one-more-between",
      "a-length-no-fraction-names",
      "why-fractions-repeat",
      "repeating-decimals-to-fractions",
      "decimals-that-never-settle",
      "a-decimal-is-an-address",
      "adding-and-multiplying-irrationals",
      "square-root-of-any-number",
      "rationalising-with-tiles",
      "exponents-that-are-fractions",
    ]);
  });

  for (const lesson of lessons) {
    describe(lesson.title.en, () => {
      for (const board of lesson.boards) {
        it(`${board.name}: a learner doing the right thing gets Continue`, async () => {
          const { services, advance } = fakeTime();
          const runtime = new BoardRuntime(board, (type) => propDefs[type], services);
          runtime.start();
          const play: Play = {
            runtime,
            advance,
            act: async (prop, action, args = {}) => {
              // A timed action finishes on the board's clock, which only moves when we advance it.
              void runtime.call(prop, action, args, Actor.Learner);
              await advance(0.05);
            },
            view: (prop) => runtime.getView(prop) as Record<string, unknown>,
          };
          await advance(1);
          await solve(board, play);
          await advance(12);
          expect(runtime.getView(BOARD).isPassed).toBe(true);
          runtime.dispose();
        }, 30_000);
      }
    });
  }
});

describe("Class 9 Maths, Chapter 1: wrong answers get the nudge, not the answer", () => {
  it("shifting a 2-digit block by one place: the tails don't cancel, Arjun says why, no Continue", async () => {
    const board = lessons[4]?.boards.find((b) => b.name === "twoDigitBlock");
    if (board === undefined) throw new Error("no twoDigitBlock board");
    const { services, advance } = fakeTime();
    const runtime = new BoardRuntime(board, (type) => propDefs[type], services);
    runtime.start();
    void runtime.call("tapes", "shift", { tape: "top", by: 1 }, Actor.Learner);
    await advance(0.1);
    void runtime.call("tapes", "subtract", {}, Actor.Learner);
    await advance(3);
    expect(runtime.isHidden("arjunMisaligned")).toBe(false);
    expect(runtime.getView(BOARD).isPassed).toBe(false);
  });

  it("12/4 left in Q gets asked to work out 12 ÷ 4", async () => {
    const lesson = lessons[0];
    const board = lesson?.boards.find((b) => b.name === "rationals");
    if (board === undefined) throw new Error("no rationals board");
    const { services, advance } = fakeTime();
    const runtime = new BoardRuntime(board, (type) => propDefs[type], services);
    runtime.start();
    const right = runtime.getView("sorter").rightPlace as Record<string, string>;
    for (const [card, place] of Object.entries(right)) {
      await runtime.call("sorter", "pick", { card }, Actor.Learner);
      const where = card === "twelveQuarters" ? "rational" : place;
      await runtime.call("sorter", "drop", { place: where }, Actor.Learner);
    }
    await runtime.call("sortQ", "check", {}, Actor.Learner);
    await advance(0.5);
    const q = runtime.getView("sortQ");
    expect(q.status).toBe("wrong");
    expect((q.feedback as { en: string }).en).toContain("12 ÷ 4");
    expect(runtime.getView(BOARD).isPassed).toBe(false);
  });

  it("six parts for six numbers between 3 and 4 gets the fence-post nudge", async () => {
    const board = lessons[1]?.boards.find((b) => b.name === "sixBetween");
    if (board === undefined) throw new Error("no sixBetween board");
    const { services, advance } = fakeTime();
    const runtime = new BoardRuntime(board, (type) => propDefs[type], services);
    runtime.start();
    for (let i = 0; i < 4; i++) await runtime.call("line", "changeParts", { by: 1 }, Actor.Learner);
    await runtime.call("makeSix", "check", {}, Actor.Learner);
    await advance(0.5);
    expect((runtime.getView("makeSix").feedback as { en: string }).en).toContain(
      "cut marks between",
    );
  });
});

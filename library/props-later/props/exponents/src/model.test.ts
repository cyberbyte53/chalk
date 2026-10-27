import {
  type Effect,
  EffectKind,
  type Emit,
  type StoredState,
  type TaskContext,
  applyPatch,
  asAnyProp,
  isInstant,
  prepareAction,
  runEffect,
  viewOf,
} from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  ExponentRoutesSignal,
  type ExponentRoutesState,
  NumberField,
  Route,
  type RouteStep,
  STEP_SECONDS,
  canChange,
  exponentRoutes,
} from "./model";

const def = asAnyProp(exponentRoutes);

type View = ExponentRoutesState & {
  stepCount: number;
  routeRootFirst: RouteStep[];
  routePowerFirst: RouteStep[];
  expressionText: string;
  value: number;
  valueText: string;
  isExact: boolean;
  hasRootFirstArrived: boolean;
  hasPowerFirstArrived: boolean;
  haveRoutesMet: boolean;
};

function numbers(
  base: number,
  power: number,
  root: number,
  more: Partial<ExponentRoutesState> = {},
): ExponentRoutesState {
  return { ...exponentRoutes.defaults, base, power, root, ...more };
}

function look(state: ExponentRoutesState): View {
  return viewOf(def, state) as unknown as View;
}

/** Runs an instant action through the one door; returns the new state and what it announced. */
function run(
  state: ExponentRoutesState,
  name: string,
  args: Record<string, unknown> = {},
): { state: ExponentRoutesState; emit: readonly Emit[] } {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as ExponentRoutesState, emit: result.effect.emit };
}

function isRefused(state: ExponentRoutesState, name: string, args: Record<string, unknown> = {}) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) return true;
  if (result.effect.kind !== EffectKind.Set) return false;
  return !applyPatch(def, state, result.effect.set).isOk;
}

const texts = (route: readonly RouteStep[]) => route.map((s) => s.valueText);
const operations = (route: readonly RouteStep[]) => route.map((s) => s.operation);

describe("exponentRoutes: known by hand (NCERT §1.6)", () => {
  it("4^(3/2): √4 = 2 then 2³ = 8; 4³ = 64 then √64 = 8", () => {
    const v = look(numbers(4, 3, 2));
    expect(operations(v.routeRootFirst)).toEqual(["√", "³"]);
    expect(texts(v.routeRootFirst)).toEqual(["2", "8"]);
    expect(operations(v.routePowerFirst)).toEqual(["³", "√"]);
    expect(texts(v.routePowerFirst)).toEqual(["64", "8"]);
    expect(v.valueText).toBe("8");
    expect(v.expressionText).toBe("4^(3/2)");
  });

  it("27^(2/3): 3 then 9, and 729 then 9 (not 18, not 729, not 81)", () => {
    const v = look(numbers(27, 2, 3));
    expect(texts(v.routeRootFirst)).toEqual(["3", "9"]);
    expect(texts(v.routePowerFirst)).toEqual(["729", "9"]);
    expect(v.value).toBe(9);
    expect(v.isExact).toBe(true);
  });

  it("Exercise 1.6, both routes", () => {
    const cases: [number, number, number, string][] = [
      [64, 1, 2, "8"],
      [32, 1, 5, "2"],
      [125, 1, 3, "5"],
      [9, 3, 2, "27"],
      [32, 2, 5, "4"],
      [16, 3, 4, "8"],
      [125, -1, 3, "1/5"],
    ];
    for (const [a, m, n, expected] of cases) {
      const v = look(numbers(a, m, n));
      expect(v.routeRootFirst.at(-1)?.valueText).toBe(expected);
      expect(v.routePowerFirst.at(-1)?.valueText).toBe(expected);
      expect(v.valueText).toBe(expected);
      expect(v.isExact).toBe(true);
      for (const step of [...v.routeRootFirst, ...v.routePowerFirst])
        expect(step.isExact).toBe(true);
    }
  });

  it("intermediates of the other Exercise 1.6 cases", () => {
    expect(texts(look(numbers(9, 3, 2)).routeRootFirst)).toEqual(["3", "27"]);
    expect(texts(look(numbers(9, 3, 2)).routePowerFirst)).toEqual(["729", "27"]);
    expect(texts(look(numbers(32, 2, 5)).routeRootFirst)).toEqual(["2", "4"]);
    expect(texts(look(numbers(32, 2, 5)).routePowerFirst)).toEqual(["1024", "4"]);
    expect(texts(look(numbers(16, 3, 4)).routeRootFirst)).toEqual(["2", "8"]);
    expect(texts(look(numbers(16, 3, 4)).routePowerFirst)).toEqual(["4096", "8"]);
  });

  it("a power or root of 1 is left out: 64^(1/2) is one step √ on both routes", () => {
    const v = look(numbers(64, 1, 2));
    expect(v.stepCount).toBe(1);
    expect(operations(v.routeRootFirst)).toEqual(["√"]);
    expect(operations(v.routePowerFirst)).toEqual(["√"]);
  });

  it("negative powers end with 1/x on both routes and never turn negative", () => {
    const two = look(numbers(2, -3, 1));
    expect(two.expressionText).toBe("2^(−3)");
    expect(operations(two.routeRootFirst)).toEqual(["³", "1/x"]);
    expect(texts(two.routeRootFirst)).toEqual(["8", "1/8"]);
    expect(two.value).toBe(1 / 8);

    const v = look(numbers(125, -1, 3));
    expect(operations(v.routeRootFirst)).toEqual(["∛", "1/x"]);
    expect(texts(v.routeRootFirst)).toEqual(["5", "1/5"]);
    expect(texts(v.routePowerFirst)).toEqual(["5", "1/5"]);

    const both = look(numbers(8, -2, 3));
    expect(operations(both.routeRootFirst)).toEqual(["∛", "²", "1/x"]);
    expect(texts(both.routeRootFirst)).toEqual(["2", "4", "1/4"]);
    expect(texts(both.routePowerFirst)).toEqual(["64", "4", "1/4"]);
    expect(both.stepCount).toBe(3);

    for (let a = 1; a <= 50; a++) {
      for (const m of [-1, -2, -3]) {
        for (let n = 1; n <= 4; n++) {
          const w = look(numbers(a, m, n));
          for (const step of [...w.routeRootFirst, ...w.routePowerFirst]) {
            expect(step.value).toBeGreaterThan(0);
            expect(step.valueText.startsWith("-")).toBe(false);
          }
        }
      }
    }
  });

  it("2^(1/2) ≈ 1.414 is marked inexact on both routes", () => {
    const v = look(numbers(2, 1, 2));
    expect(texts(v.routeRootFirst)).toEqual(["≈ 1.414"]);
    expect(texts(v.routePowerFirst)).toEqual(["≈ 1.414"]);
    expect(v.routeRootFirst[0]?.isExact).toBe(false);
    expect(v.routePowerFirst[0]?.isExact).toBe(false);
    expect(v.isExact).toBe(false);
  });

  it("2^(2/3): ∛2 ≈ 1.260 then ≈ 1.587; 4 then ∛4 ≈ 1.587", () => {
    const v = look(numbers(2, 2, 3));
    expect(texts(v.routeRootFirst)).toEqual(["≈ 1.260", "≈ 1.587"]);
    expect(texts(v.routePowerFirst)).toEqual(["4", "≈ 1.587"]);
    expect(v.routePowerFirst[0]?.isExact).toBe(true);
  });

  it("4^(2/4) passes through √2 on one route and still ends exactly on 2", () => {
    const v = look(numbers(4, 2, 4));
    expect(texts(v.routeRootFirst)).toEqual(["≈ 1.414", "2"]);
    expect(v.routeRootFirst.map((s) => s.isExact)).toEqual([false, true]);
    expect(texts(v.routePowerFirst)).toEqual(["16", "2"]);
    expect(v.isExact).toBe(true);
  });

  it("1000³ = 1000000000 fits; 1000⁴ is the biggest kind it shows", () => {
    expect(texts(look(numbers(1000, 3, 2)).routePowerFirst)[0]).toBe("1000000000");
    expect(texts(look(numbers(1000, 4, 3)).routePowerFirst)).toEqual(["1000000000000", "10000"]);
  });

  it("a^(1/1) has no steps, and its routes have met at once", () => {
    const v = look(numbers(7, 1, 1));
    expect(v.stepCount).toBe(0);
    expect(v.haveRoutesMet).toBe(true);
    expect(v.valueText).toBe("7");
    expect(v.expressionText).toBe("7^1");
  });
});

describe("exponentRoutes: actions", () => {
  const start = numbers(27, 2, 3);

  it("stepRootFirst shows one more step, keeps the numbers and the other route", () => {
    const once = run(start, "stepRootFirst");
    expect(once.state).toEqual({ ...start, rootFirstStep: 1 });
    expect(once.emit).toEqual([
      { signal: ExponentRoutesSignal.Stepped, payload: { route: Route.RootFirst, step: 1 } },
    ]);
    expect(look(once.state).routeRootFirst.map((s) => s.isShown)).toEqual([true, false]);
    const twice = run(once.state, "stepRootFirst");
    expect(look(twice.state).hasRootFirstArrived).toBe(true);
    expect(look(twice.state).haveRoutesMet).toBe(false);
    expect(twice.emit.map((e) => e.signal)).toEqual([ExponentRoutesSignal.Stepped]);
  });

  it("stepping stops at the last step (does nothing, says nothing)", () => {
    const done = numbers(27, 2, 3, { rootFirstStep: 2 });
    const again = run(done, "stepRootFirst");
    expect(again.state).toEqual(done);
    expect(again.emit).toEqual([]);
  });

  it("the second route arriving announces that the routes met, with the value", () => {
    const one = numbers(27, 2, 3, { rootFirstStep: 2, powerFirstStep: 1 });
    const met = run(one, "stepPowerFirst");
    expect(met.state.powerFirstStep).toBe(2);
    expect(met.emit).toEqual([
      { signal: ExponentRoutesSignal.Stepped, payload: { route: Route.PowerFirst, step: 2 } },
      { signal: ExponentRoutesSignal.RoutesMet, payload: { valueText: "9" } },
    ]);
    expect(look(met.state).haveRoutesMet).toBe(true);
  });

  it("hideSteps puts both routes back to 0 and keeps the numbers", () => {
    const shown = numbers(27, 2, 3, { rootFirstStep: 2, powerFirstStep: 1 });
    expect(run(shown, "hideSteps").state).toEqual(start);
  });

  it("setNumbers gives a new expression with no steps shown", () => {
    const shown = numbers(27, 2, 3, { rootFirstStep: 2, powerFirstStep: 2 });
    const next = run(shown, "setNumbers", { base: 125, power: -1, root: 3 }).state;
    expect(next).toEqual(numbers(125, -1, 3));
  });

  it("changeBase / changePower / changeRoot move one number, hide the steps, keep the rest", () => {
    const open = numbers(27, 2, 3, { canChangeNumbers: true, rootFirstStep: 1 });
    expect(run(open, "changeBase", { by: 1 }).state).toEqual({
      ...open,
      base: 28,
      rootFirstStep: 0,
    });
    expect(run(open, "changePower", { by: -1 }).state).toMatchObject({
      power: 1,
      base: 27,
      root: 3,
    });
    expect(run(open, "changeRoot", { by: -1 }).state).toMatchObject({
      root: 2,
      base: 27,
      power: 2,
    });
  });

  it("changePower skips 0 both ways", () => {
    const open = numbers(8, 1, 3, { canChangeNumbers: true });
    const down = run(open, "changePower", { by: -1 }).state;
    expect(down.power).toBe(-1);
    expect(run(down, "changePower", { by: 1 }).state.power).toBe(1);
  });

  it("changes are held to the ends and then do nothing", () => {
    const top = numbers(2, 6, 6, { canChangeNumbers: true });
    expect(run(top, "changeRoot", { by: 1 }).state).toEqual(top);
    expect(run(top, "changePower", { by: 1 }).state).toEqual(top);
    const bottom = numbers(1, -6, 1, { canChangeNumbers: true });
    expect(run(bottom, "changeBase", { by: -1 }).state).toEqual(bottom);
    expect(run(bottom, "changeRoot", { by: -1 }).state).toEqual(bottom);
    expect(run(bottom, "changePower", { by: -1 }).state).toEqual(bottom);
    expect(
      run(numbers(990, 2, 3, { canChangeNumbers: true }), "changeBase", { by: 50 }).state.base,
    ).toBe(1000);
    expect(canChange(top, NumberField.Root, 1)).toBe(false);
    expect(canChange(top, NumberField.Root, -1)).toBe(true);
  });

  it("the learner's buttons are refused when the numbers can't change", () => {
    const fixed = numbers(27, 2, 3);
    expect(isRefused(fixed, "changeBase", { by: 1 })).toBe(true);
    expect(isRefused(fixed, "changePower", { by: 1 })).toBe(true);
    expect(isRefused(fixed, "changeRoot", { by: 1 })).toBe(true);
    expect(canChange(fixed, NumberField.Base, 1)).toBe(false);
  });

  it("a change that would make a^|m| more than 10¹² is refused", () => {
    const edge = numbers(1000, 4, 3, { canChangeNumbers: true });
    expect(isRefused(edge, "changePower", { by: 1 })).toBe(true);
    expect(canChange(edge, NumberField.Power, 1)).toBe(false);
    expect(isRefused(numbers(100, 6, 2, { canChangeNumbers: true }), "changeBase", { by: 1 })).toBe(
      true,
    );
  });

  it("only the steps and the number buttons are the learner's; showBoth gives it away", () => {
    const byLearner = Object.entries(exponentRoutes.actions)
      .filter(([, spec]) => spec.byLearner === true)
      .map(([name]) => name)
      .sort();
    expect(byLearner).toEqual(
      ["changeBase", "changePower", "changeRoot", "stepPowerFirst", "stepRootFirst"].sort(),
    );
    expect(exponentRoutes.actions.showBoth?.reveals).toBe(true);
    expect(exponentRoutes.actions.stepRootFirst?.reveals).toBeUndefined();
  });
});

/** Plays showBoth with a clock that never waits, every change through the one door. */
async function playShowBoth(state: ExponentRoutesState) {
  const result = prepareAction(def, state, "showBoth", {});
  if (!result.isOk) throw new Error(result.errors.join("; "));
  const effect: Effect<StoredState> = result.effect;
  if (isInstant(effect)) throw new Error("showBoth should be timed");
  let now: StoredState = state;
  const waits: number[] = [];
  const emitted: Emit[] = [];
  const states: ExponentRoutesState[] = [];
  const context: TaskContext<StoredState> = {
    speak: async () => {},
    wait: async (seconds) => {
      waits.push(seconds);
    },
    call: async (action, args) => {
      const step = prepareAction(def, now, action, args);
      if (!step.isOk) throw new Error(step.errors.join("; "));
      await runEffect(step.effect, context);
    },
    set: (patch) => {
      const next = applyPatch(def, now, patch);
      expect(next.isOk).toBe(true);
      if (next.isOk) now = next.state;
      states.push(now as ExponentRoutesState);
    },
    get: () => now,
    emit: (signal, payload) =>
      emitted.push(payload === undefined ? { signal } : { signal, payload }),
  };
  await runEffect(effect, context);
  return { end: now as ExponentRoutesState, waits, emitted, states };
}

describe("exponentRoutes: showBoth", () => {
  it("alternates the routes 0.7 s apart through the one door, and ends with them met", async () => {
    const { end, waits, emitted, states } = await playShowBoth(numbers(8, -2, 3));
    expect(states.map((s) => [s.rootFirstStep, s.powerFirstStep])).toEqual([
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2],
      [3, 2],
      [3, 3],
    ]);
    expect(waits).toEqual(Array(5).fill(STEP_SECONDS));
    expect(look(end).haveRoutesMet).toBe(true);
    expect(emitted.filter((e) => e.signal === ExponentRoutesSignal.RoutesMet)).toEqual([
      { signal: ExponentRoutesSignal.RoutesMet, payload: { valueText: "1/4" } },
    ]);
    expect(emitted.filter((e) => e.signal === ExponentRoutesSignal.Stepped)).toHaveLength(6);
  });

  it("carries on from where the routes are, and does nothing once they have met", async () => {
    const part = await playShowBoth(numbers(27, 2, 3, { rootFirstStep: 2 }));
    expect(part.states.map((s) => s.powerFirstStep)).toEqual([1, 2]);
    const done = await playShowBoth(numbers(27, 2, 3, { rootFirstStep: 2, powerFirstStep: 2 }));
    expect(done.states).toEqual([]);
    expect(done.emitted).toEqual([]);
  });

  it("passes the one door at every step for many expressions", async () => {
    for (let a = 1; a <= 200; a += 13) {
      for (let n = 1; n <= 6; n++) {
        for (const m of [-3, -1, 1, 2, 5]) {
          const s = numbers(a, m, n);
          if (!applyPatch(def, s, {}).isOk) continue;
          const { end } = await playShowBoth(s);
          expect(look(end).haveRoutesMet).toBe(true);
        }
      }
    }
  });
});

describe("exponentRoutes: refusals", () => {
  const ok = numbers(27, 2, 3);
  it("refuses numbers out of range, a power of 0, and too many steps", () => {
    expect(applyPatch(def, ok, { base: 0 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { base: 1001 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { base: 2.5 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { power: 0 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { power: 7 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { root: 0 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { root: 7 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { rootFirstStep: 3 }).isOk).toBe(false);
    expect(applyPatch(def, numbers(64, 1, 2), { powerFirstStep: 2 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { rootFirstStep: -1 }).isOk).toBe(false);
  });

  it("refuses a^|m| over 10¹², whatever the root", () => {
    expect(applyPatch(def, ok, { base: 1000, power: 5, root: 5 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { base: 999, power: -6, root: 6 }).isOk).toBe(false);
    expect(applyPatch(def, ok, { base: 1000, power: -4, root: 6 }).isOk).toBe(true);
    expect(isRefused(ok, "setNumbers", { base: 1000, power: 6, root: 6 })).toBe(true);
    expect(isRefused(ok, "setNumbers", { base: 8, power: 0, root: 3 })).toBe(true);
  });
});

describe("exponentRoutes: parts", () => {
  const parts = (s: ExponentRoutesState) => exponentRoutes.parts?.(viewOf(def, s) as never) ?? [];

  it("names the expression, each step of each route, and the meeting node", () => {
    expect(parts(numbers(27, 2, 3))).toEqual([
      "start",
      "exponent",
      "base",
      "power",
      "root",
      "routeRootFirst:1",
      "routeRootFirst:2",
      "routePowerFirst:1",
      "routePowerFirst:2",
      "end",
    ]);
    expect(parts(numbers(2, -3, 1))).not.toContain("root");
  });

  it("locates every part inside the prop at phone widths", () => {
    for (const s of [
      numbers(27, 2, 3),
      numbers(8, -2, 3),
      numbers(64, 1, 2),
      numbers(1000, 4, 3),
    ]) {
      for (const width of [200, 340, 380]) {
        for (const part of parts(s)) {
          const box = exponentRoutes.locate?.(viewOf(def, s) as never, part, width);
          expect(box, part).toBeDefined();
          if (box === undefined) continue;
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual(width);
          expect(box.y).toBeGreaterThanOrEqual(0);
        }
      }
    }
    const locate = (part: string) =>
      exponentRoutes.locate?.(viewOf(def, numbers(27, 2, 3)) as never, part, 340);
    expect(locate("routeRootFirst:3")).toBeUndefined();
    expect(locate("nothing")).toBeUndefined();
    const left = locate("routeRootFirst:1");
    const right = locate("routePowerFirst:1");
    expect(left !== undefined && right !== undefined && left.x < right.x).toBe(true);
  });
});

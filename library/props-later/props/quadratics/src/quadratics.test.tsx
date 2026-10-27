import type { PropViewProps } from "@chalk/player";
import {
  type AnyPropDef,
  EffectKind,
  type StoredState,
  applyPatch,
  asAnyProp,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import type { ComponentType } from "preact";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { AreaAction, AreaSignal, type AreaState, areaBuilder, areaOf } from "./area";
import { AreaView } from "./area-view";
import {
  Nature,
  completedTex,
  discriminant,
  factorPairs,
  natureOf,
  quadTex,
  realRoots,
  rootsTex,
  simplifySqrt,
  splitPair,
  splitWorking,
} from "./quad";
import { Coefficient, RootsAction, type RootsState, rootsGraph } from "./roots";
import { RootsView } from "./roots-view";
import { QuadraticSceneKind, quadraticScene } from "./scene";
import { QuadraticSceneView } from "./scene-view";
import { SplitAction, SplitSignal, type SplitState, middleSplit } from "./split";
import { SplitView } from "./split-view";
import { TILE_STEPS, TilesAction, TilesSignal, type TilesState, squareTiles } from "./tiles";
import { TilesView } from "./tiles-view";

const area = asAnyProp(areaBuilder);
const split = asAnyProp(middleSplit);
const tiles = asAnyProp(squareTiles);
const roots = asAnyProp(rootsGraph);
const scene = asAnyProp(quadraticScene);

function run<S extends StoredState>(
  def: AnyPropDef,
  state: S,
  action: string,
  args: Record<string, unknown> = {},
) {
  const result = prepareAction(def, state, action, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  const effect = result.effect;
  if (effect.kind !== EffectKind.Set) throw new Error(`${action} should be instant`);
  const next = applyPatch(def, state, effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as S, emit: effect.emit };
}

const look = (def: AnyPropDef, s: StoredState) => viewOf(def, s) as Record<string, unknown>;

function drawn(
  def: AnyPropDef,
  View: ComponentType<PropViewProps>,
  s: StoredState,
  width = 360,
  locale: "en" | "hi" = "en",
): string {
  return renderToString(
    <View
      view={viewOf(def, s)}
      locale={locale}
      width={width}
      call={() => undefined}
      signal={() => undefined}
    />,
  );
}

/** Every element is tagged `data-part` in the view (or found by `locate`), and nothing reads NaN. */
function expectGood(def: AnyPropDef, View: ComponentType<PropViewProps>, s: StoredState) {
  for (const width of [300, 340, 420])
    for (const locale of ["en", "hi"] as const) {
      const html = drawn(def, View, s, width, locale);
      expect(html, `${def.type} at ${width} ${locale}`).not.toMatch(/NaN|undefined|Infinity/);
    }
  const html = drawn(def, View, s);
  const tagged = new Set([...html.matchAll(/data-part="([^"]+)"/g)].map((m) => m[1]));
  for (const e of observationOf(def, s).elements) {
    const found =
      tagged.has(e.id) || def.locate?.(viewOf(def, s) as never, e.id, 360) !== undefined;
    expect(found, `${def.type}: ${e.id}`).toBe(true);
  }
}

describe("the maths", () => {
  it("discriminant and nature (NCERT Examples 16–18, 13)", () => {
    expect(discriminant(2, -4, 3)).toBe(-8);
    expect(natureOf(discriminant(2, -4, 3))).toBe(Nature.None);
    expect(discriminant(1, 7, -60)).toBe(289);
    expect(natureOf(discriminant(3, -2, 1 / 3))).toBe(Nature.TwoEqual);
    expect(natureOf(discriminant(3, -5, 2))).toBe(Nature.TwoDistinct);
    expect(natureOf(discriminant(1, 4, 5))).toBe(Nature.None);
  });

  it("real roots, smallest first", () => {
    expect(realRoots(2, -5, 3)).toEqual([1, 1.5]);
    expect(realRoots(2, 1, -300)).toEqual([-12.5, 12]);
    expect(realRoots(1, 2, -143)).toEqual([-13, 11]);
    expect(realRoots(1, 48, -324)).toEqual([-54, 6]);
    expect(realRoots(1, 4, 5)).toEqual([]);
    const [r1, r2] = realRoots(2, -2 * Math.SQRT2, 1);
    expect(r1).toBeCloseTo(Math.SQRT1_2, 6);
    expect(r2).toBeCloseTo(Math.SQRT1_2, 6);
  });

  it("exact roots, as the book writes them", () => {
    expect(rootsTex(2, -5, 3)).toEqual(["1", "\\frac{3}{2}"]);
    expect(rootsTex(6, -1, -2)).toEqual(["-\\frac{1}{2}", "\\frac{2}{3}"]);
    expect(rootsTex(5, -6, -2)).toEqual(["\\frac{3 - \\sqrt{19}}{5}", "\\frac{3 + \\sqrt{19}}{5}"]);
    expect(rootsTex(3, -6, 2)).toEqual(["\\frac{3 - \\sqrt{3}}{3}", "\\frac{3 + \\sqrt{3}}{3}"]);
    expect(rootsTex(1, -3, 1)).toEqual(["\\frac{3 - \\sqrt{5}}{2}", "\\frac{3 + \\sqrt{5}}{2}"]);
    expect(rootsTex(1, -4, 4)).toEqual(["2", "2"]);
    expect(rootsTex(-1, 0, 9)).toEqual(["-3", "3"]);
    expect(rootsTex(4, 3, 5)).toEqual([]);
  });

  it("square roots simplify", () => {
    expect(simplifySqrt(12)).toEqual([2, 3]);
    expect(simplifySqrt(19)).toEqual([1, 19]);
    expect(simplifySqrt(72)).toEqual([6, 2]);
    expect(simplifySqrt(289)).toEqual([17, 1]);
  });

  it("exact roots satisfy the equation, over many whole-number equations", () => {
    for (let a = -4; a <= 4; a++) {
      if (a === 0) continue;
      for (let b = -9; b <= 9; b++)
        for (let c = -9; c <= 9; c++) {
          const rs = realRoots(a, b, c);
          const d = discriminant(a, b, c);
          expect(rs.length).toBe(d < 0 ? 0 : 2);
          for (const r of rs) expect(a * r * r + b * r + c).toBeCloseTo(0, 6);
          // Sum and product of the roots (Ch2).
          if (rs.length === 2) {
            expect((rs[0] ?? 0) + (rs[1] ?? 0)).toBeCloseTo(-b / a, 6);
            expect((rs[0] ?? 0) * (rs[1] ?? 0)).toBeCloseTo(c / a, 6);
          }
        }
    }
  });

  it("the textbook's way of writing a quadratic", () => {
    expect(quadTex(2, 1, -300)).toBe("2x^2 + x - 300");
    expect(quadTex(-5, 20, 0, "t")).toBe("-5t^2 + 20t");
    expect(quadTex(1, 0, -9)).toBe("x^2 - 9");
    expect(quadTex(1, -1, 0)).toBe("x^2 - x");
  });

  it("completing the square (Fig 4.2)", () => {
    expect(completedTex(4)).toBe("\\left(x + 2\\right)^2 - 4");
    expect(completedTex(3)).toBe("\\left(x + \\frac{3}{2}\\right)^2 - \\frac{9}{4}");
    // x² + bx = (x + b/2)² − (b/2)² for every x.
    for (let b = 1; b <= 12; b++)
      for (const x of [-3, 0, 1.5, 7])
        expect(x * x + b * x).toBeCloseTo((x + b / 2) ** 2 - (b / 2) ** 2, 9);
  });

  it("factor pairs and the middle-term split (Examples 3, 4, 6)", () => {
    expect(factorPairs(6)).toEqual([
      [1, 6],
      [-1, -6],
      [2, 3],
      [-2, -3],
    ]);
    expect(factorPairs(-600)).toContainEqual([-24, 25]);
    expect(splitPair(2, -5, 3)).toEqual([-2, -3]);
    expect(splitPair(6, -1, -2)).toEqual([3, -4]);
    expect(splitPair(2, 1, -300)).toEqual([-24, 25]);
    expect(splitPair(1, 1, 1)).toBeNull();
    expect(splitPair(1, -3, 1)).toBeNull();
  });

  it("the grouping works out like the book", () => {
    const ex3 = splitWorking(2, -2, -3, 3);
    expect(ex3?.split).toBe("2x^2 - 2x - 3x + 3");
    expect(ex3?.grouped).toBe("2x(x - 1) - 3(x - 1)");
    expect(ex3?.factored).toBe("(2x - 3)(x - 1)");
    expect(ex3?.values).toEqual([1.5, 1]);
    const ex4 = splitWorking(6, 3, -4, -2);
    expect(ex4?.grouped).toBe("3x(2x + 1) - 2(2x + 1)");
    expect(ex4?.factored).toBe("(3x - 2)(2x + 1)");
    const ex6 = splitWorking(2, -24, 25, -300);
    expect(ex6?.grouped).toBe("2x(x - 12) + 25(x - 12)");
    expect(ex6?.factored).toBe("(2x + 25)(x - 12)");
    expect(ex6?.values).toEqual([-12.5, 12]);
    expect(splitWorking(2, 1, 1, 3)).toBeNull();
  });

  it("a whole-number split exists exactly when the roots are rational (c ≠ 0)", () => {
    for (let a = 1; a <= 6; a++)
      for (let b = -12; b <= 12; b++)
        for (let c = -12; c <= 12; c++) {
          if (c === 0) continue;
          const d = discriminant(a, b, c);
          const isRational = d >= 0 && simplifySqrt(d)[1] === 1;
          const pair = splitPair(a, b, c);
          expect(pair !== null, `${a} ${b} ${c}`).toBe(isRational);
          if (pair !== null) {
            const w = splitWorking(a, pair[0], pair[1], c);
            expect(w, `${a} ${b} ${c}`).not.toBeNull();
            for (const r of w?.values ?? []) expect(a * r * r + b * r + c).toBeCloseTo(0, 6);
          }
        }
  });
});

describe("areaBuilder", () => {
  const s0 = { ...areaBuilder.defaults, x: 11 } as AreaState;
  it("hits the prayer hall's 300 m² at x = 12 (length 25)", () => {
    const { state, emit } = run(area, s0, AreaAction.Nudge, { by: 1 });
    expect(state.x).toBe(12);
    expect(areaOf(state)).toBe(300);
    expect(emit.map((e) => e.signal)).toContain(AreaSignal.Hit);
    expect(look(area, state).length).toBe(25);
    expect(look(area, state).isOnTarget).toBe(true);
  });
  it("never makes the length negative", () => {
    const s = { ...s0, m: -1, n: 30, x: 29, xMax: 40, target: null } as AreaState;
    const up = run(area, s, AreaAction.Nudge, { by: 1 });
    expect(up.state.x).toBe(29);
  });
  it("draws well", () => {
    expectGood(area, AreaView, s0);
    expectGood(area, AreaView, { ...s0, x: 12 });
    expectGood(area, AreaView, { ...s0, target: null, showEquation: false });
    expectGood(area, AreaView, { ...s0, m: -1, n: 40, x: 10, target: 300, xMax: 39 });
  });
});

describe("middleSplit", () => {
  const s0 = middleSplit.defaults as SplitState;
  it("checks a wrong pick and a right pick", () => {
    const wrong = run(split, s0, SplitAction.Pick, { p: 1, q: 6 });
    expect(look(split, wrong.state).isRight).toBe(false);
    expect(wrong.emit[0]?.signal).toBe(SplitSignal.Picked);
    expect(wrong.emit[0]?.payload).toMatchObject({ isRight: false });
    const right = run(split, wrong.state, SplitAction.Pick, { p: -2, q: -3 });
    expect(look(split, right.state).isRight).toBe(true);
    expect((look(split, right.state).working as { factored: string }).factored).toBe(
      "(2x - 3)(x - 1)",
    );
  });
  it("solves", () => {
    const s = { ...s0, a: 2, b: 1, c: -300 };
    const solved = run(split, s, SplitAction.Solve);
    expect(solved.state.picked).toEqual([-24, 25]);
  });
  it("says when there's no whole-number pair", () => {
    expect(look(split, { ...s0, a: 1, b: -3, c: 1 }).hasWholeSplit).toBe(false);
  });
  it("draws well", () => {
    expectGood(split, SplitView, s0);
    expectGood(split, SplitView, { ...s0, picked: [1, 6] });
    expectGood(split, SplitView, { ...s0, picked: [-2, -3] });
    expectGood(split, SplitView, { ...s0, a: 2, b: 1, c: -300, picked: [-24, 25] });
    expectGood(split, SplitView, { ...s0, a: 1, b: -3, c: 1 });
  });
});

describe("squareTiles", () => {
  const s0 = squareTiles.defaults as TilesState;
  it("steps through and completes the square", () => {
    let s = s0;
    const seen: string[] = [];
    for (let i = 0; i < TILE_STEPS; i++) {
      const r = run(tiles, s, TilesAction.Next);
      s = r.state;
      seen.push(...r.emit.map((e) => e.signal));
    }
    expect(s.step).toBe(0);
    expect(seen.filter((x) => x === TilesSignal.Completed)).toHaveLength(1);
  });
  it("x² + 4x − 5 = 0 gives (x + 2)² = 9, roots −5 and 1", () => {
    const s = { ...s0, c: -5, step: 3 };
    expect(look(tiles, s).rightSide).toBe(9);
    expect(look(tiles, s).roots).toEqual(["-5", "1"]);
    expect(look(tiles, { ...s0, c: 5 }).hasRealRoots).toBe(false);
  });
  it("draws every step, odd and even b", () => {
    for (const b of [1, 3, 4, 12])
      for (let step = 0; step < TILE_STEPS; step++)
        expectGood(tiles, TilesView, { ...s0, b, step, c: -5, canSetB: true });
  });
});

describe("rootsGraph", () => {
  const rocket = {
    ...rootsGraph.defaults,
    a: -5,
    b: 20,
    c: 0,
    variable: "t",
    yName: "h",
    window: { xMin: -1, xMax: 5, yMin: -5, yMax: 30 },
    canSet: [],
    canSetLevel: true,
    levelLabel: "15 m",
  } as RootsState;
  it("Kabir's rocket: 15 m at t = 1 and 3, 20 m once at t = 2, never 25 m", () => {
    expect(look(roots, { ...rocket, level: 15 }).roots).toEqual([1, 3]);
    expect(look(roots, { ...rocket, level: 20 }).roots).toEqual([2, 2]);
    expect(look(roots, { ...rocket, level: 20 }).nature).toBe(Nature.TwoEqual);
    expect(look(roots, { ...rocket, level: 25 }).nature).toBe(Nature.None);
    expect(look(roots, { ...rocket, level: 25 }).discriminant).toBe(-100);
  });
  it("a steps over 0", () => {
    const s = { ...rootsGraph.defaults, a: 1, canSet: [Coefficient.A] } as RootsState;
    const { state } = run(roots, s, RootsAction.Nudge, { name: Coefficient.A, by: -1 });
    expect(state.a).toBe(-1);
  });
  it("only nudges what the lesson lets it", () => {
    const s = { ...rootsGraph.defaults, canSet: [Coefficient.C] } as RootsState;
    const { state } = run(roots, s, RootsAction.Nudge, { name: Coefficient.B, by: 1 });
    expect(state.b).toBe(s.b);
  });
  it("draws well", () => {
    expectGood(roots, RootsView, rootsGraph.defaults as RootsState);
    for (const level of [15, 20, 25]) expectGood(roots, RootsView, { ...rocket, level });
    expectGood(roots, RootsView, { ...(rootsGraph.defaults as RootsState), a: 2, b: -4, c: 3 });
    expectGood(roots, RootsView, {
      ...(rootsGraph.defaults as RootsState),
      a: 5,
      b: -6,
      c: -2,
      canSet: [Coefficient.A, Coefficient.B, Coefficient.C],
    });
  });
});

describe("quadraticScene", () => {
  it("draws every scene", () => {
    for (const kind of Object.values(QuadraticSceneKind)) {
      const s = { scene: kind };
      for (const width of [300, 420]) {
        const html = drawn(scene, QuadraticSceneView, s, width);
        expect(html).not.toMatch(/NaN|undefined/);
      }
      expect(observationOf(scene, s).summary.length).toBeGreaterThan(40);
    }
  });
});

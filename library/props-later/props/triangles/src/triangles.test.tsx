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
import { AreaAction, AreaMode, AreaSignal, type AreaState, areaRatioOf, areaTiles } from "./areas";
import {
  BptAction,
  BptMode,
  BptSignal,
  type BptState,
  isParallelOf,
  proportionLine,
  ratioDOf,
  ratioEOf,
} from "./bpt";
import { defs } from "./defs";
import {
  anglesOf,
  areaOf,
  isTriangle,
  oppositeSide,
  placeTriangle,
  ratioText,
  sidesFromBaseAngles,
} from "./geometry";
import { trianglesProps } from "./index";
import {
  MatchAction,
  MatchEdit,
  MatchSide,
  MatchSignal,
  type MatchState,
  isSimilarMatch,
  ratiosOfMatch,
  triangleMatch,
} from "./match";
import {
  PythAction,
  PythMode,
  PythSide,
  PythSignal,
  type PythState,
  altitudeOf,
  pythagoras,
  rightAtOf,
} from "./pythagoras";
import { TrianglesSceneKind, trianglesScene } from "./scene";
import {
  ShadowAction,
  ShadowMode,
  ShadowObject,
  type ShadowState,
  lampShadowOf,
  objectShadowOf,
  shadowHeight,
} from "./shadow";
import {
  SimilarAction,
  SimilarPair,
  SimilarShape,
  type SimilarState,
  anglesEqualOf,
  isSimilarOf,
  ratiosEqualOf,
  similarFigures,
} from "./similar";

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
const signals = (emit: readonly { signal: string }[]) => emit.map((e) => e.signal);

const sim = asAnyProp(similarFigures);
const bpt = asAnyProp(proportionLine);
const match = asAnyProp(triangleMatch);
const area = asAnyProp(areaTiles);
const pyth = asAnyProp(pythagoras);
const shadow = asAnyProp(shadowHeight);

describe("plane geometry", () => {
  it("finds the angles of a triangle from its sides", () => {
    const [A, B, C] = anglesOf({ ab: 3, bc: 4, ca: 5 });
    expect(B).toBeCloseTo(90, 9);
    expect(A + B + C).toBeCloseTo(180, 9);
    const eq = anglesOf({ ab: 2, bc: 2, ca: 2 });
    for (const x of eq) expect(x).toBeCloseTo(60, 9);
  });
  it("places a triangle with B at the origin and C on the x-axis", () => {
    const t = placeTriangle({ ab: 3, bc: 4, ca: 5 });
    expect(t.a[0]).toBeCloseTo(0, 9);
    expect(t.a[1]).toBeCloseTo(3, 9);
    expect(t.c).toEqual([4, 0]);
  });
  it("builds triangles from SAS and from a base and two angles", () => {
    expect(oppositeSide(3, 4, 90)).toBeCloseTo(5, 9);
    const s = sidesFromBaseAngles(3, 60, 40);
    if (s === null) throw new Error("no triangle");
    const [, B, C] = anglesOf(s);
    expect(B).toBeCloseTo(60, 6);
    expect(C).toBeCloseTo(40, 6);
    expect(sidesFromBaseAngles(3, 100, 90)).toBeNull();
  });
  it("tells triangles from lengths that can't make one", () => {
    expect(isTriangle({ ab: 3, bc: 8, ca: 6 })).toBe(true);
    expect(isTriangle({ ab: 1, bc: 2, ca: 3 })).toBe(false);
    expect(areaOf({ ab: 3, bc: 4, ca: 5 })).toBeCloseTo(6, 9);
  });
  it("writes ratios simply", () => {
    expect(ratioText(1.5)).toBe("3 : 2");
    expect(ratioText(0.25)).toBe("1 : 4");
  });
});

describe("similar figures (NCERT 6.2)", () => {
  const base = similarFigures.defaults as SimilarState;
  it("an enlargement is similar for every scale factor", () => {
    for (const shape of Object.values(SimilarShape))
      for (const scale of [0.5, 1, 1.25, 2, 3])
        expect(isSimilarOf({ ...base, shape, scale })).toBe(true);
  });
  it("a square and a rectangle: angles equal, sides not in one ratio (Fig 6.6)", () => {
    const s = { ...base, pair: SimilarPair.SquareRectangle, scale: 1.5 };
    expect(anglesEqualOf(s)).toBe(true);
    expect(ratiosEqualOf(s)).toBe(false);
    expect(isSimilarOf(s)).toBe(false);
    expect(isSimilarOf({ ...s, scale: 1 })).toBe(true);
  });
  it("a square and a rhombus: sides in one ratio, angles not equal (Fig 6.7)", () => {
    const s = { ...base, pair: SimilarPair.SquareRhombus, scale: 1.5, angle: 60 };
    expect(ratiosEqualOf(s)).toBe(true);
    expect(anglesEqualOf(s)).toBe(false);
    expect(isSimilarOf({ ...s, angle: 90 })).toBe(true);
  });
  it("a shadow under a bulb is similar to the card (Activity 1)", () => {
    expect(isSimilarOf({ ...base, pair: SimilarPair.Shadow, scale: 2.25 })).toBe(true);
  });
  it("the learner scales in quarters, within bounds", () => {
    const up = run(sim, { ...base, scale: 3 }, SimilarAction.NudgeScale, { by: 1 });
    expect(up.state.scale).toBe(3);
    expect(up.emit).toEqual([]);
    const down = run(sim, base, SimilarAction.NudgeScale, { by: -1 });
    expect(down.state.scale).toBe(1.25);
    expect(signals(down.emit)).toEqual(["changed"]);
  });
});

describe("the Basic Proportionality Theorem (NCERT 6.3)", () => {
  const base = proportionLine.defaults as BptState;
  it("a line parallel to BC cuts AB and AC in the same ratio, wherever it is", () => {
    for (const d of [0.2, 0.4, 0.6, 0.8]) {
      const s = { ...base, d, parts: 5 };
      expect(ratioDOf(s)).toBeCloseTo(ratioEOf(s), 9);
      expect(isParallelOf(s)).toBe(true);
    }
  });
  it("Activity 2: D at the third of five equal parts gives 3 : 2", () => {
    expect(ratioText(ratioDOf({ d: 0.6 }))).toBe("3 : 2");
  });
  it("Exercise 6.2 Q2: decides whether EF ∥ QR from the lengths", () => {
    const free = { ...base, mode: BptMode.Free, parts: null };
    // (i) PE = 3.9, EQ = 3, PF = 3.6, FR = 2.4: 1.3 ≠ 1.5
    expect(isParallelOf({ ...free, d: 3.9 / 6.9, e: 3.6 / 6 })).toBe(false);
    // (ii) PE = 4, QE = 4.5, PF = 8, RF = 9: 8/9 = 8/9
    expect(isParallelOf({ ...free, d: 4 / 8.5, e: 8 / 17 })).toBe(true);
    // (iii) PQ = 1.28, PR = 2.56, PE = 0.18, PF = 0.36
    expect(isParallelOf({ ...free, d: 0.18 / 1.28, e: 0.36 / 2.56 })).toBe(true);
  });
  it("in free mode, the line becomes parallel when the ratios match (the converse)", () => {
    const s = { ...base, mode: BptMode.Free, canMoveE: true, d: 0.6, e: 0.4 };
    const r = run(bpt, s, BptAction.MoveE, { by: 1 });
    expect(r.state.e).toBeCloseTo(0.6, 9);
    expect(signals(r.emit)).toEqual([BptSignal.Changed, BptSignal.Parallel]);
  });
  it("D stays on the marks and inside AB", () => {
    const r = run(bpt, { ...base, d: 0.8 }, BptAction.MoveD, { by: 1 });
    expect(r.state.d).toBe(0.8);
  });
});

describe("criteria for similarity (NCERT 6.4)", () => {
  const base = triangleMatch.defaults as MatchState;
  it("Activity 5 (SSS): 3, 6, 8 and 4.5, 9, 12 are similar, each ratio 2/3", () => {
    expect(isSimilarMatch(base)).toBe(true);
    for (const r of ratiosOfMatch(base)) expect(r).toBeCloseTo(2 / 3, 9);
  });
  it("changing one side breaks SSS", () => {
    const r = run(match, base, MatchAction.NudgeSide, { side: MatchSide.BC, by: 1 });
    expect(isSimilarMatch(r.state)).toBe(false);
    const back = run(match, r.state, MatchAction.NudgeSide, { side: MatchSide.BC, by: -1 });
    expect(signals(back.emit)).toEqual([MatchSignal.Changed, MatchSignal.Similar]);
  });
  it("Activity 6 (SAS): AB = 2, ∠A = 50°, AC = 4 and DE = 3, ∠D = 50°, DF = 6", () => {
    const first = { ab: 2, ca: 4, bc: oppositeSide(2, 4, 50) };
    const second = { ab: 3, ca: 6, bc: oppositeSide(3, 6, 50) };
    const s = { ...base, first, second, edit: MatchEdit.Sas };
    expect(isSimilarMatch(s)).toBe(true);
    // open ∠D: no longer similar; close it again: similar
    const wider = run(match, s, MatchAction.NudgeAngle, { at: 0, by: 1 });
    expect(isSimilarMatch(wider.state)).toBe(false);
    expect(
      isSimilarMatch(run(match, wider.state, MatchAction.NudgeAngle, { at: 0, by: -1 }).state),
    ).toBe(true);
  });
  it("Activity 4 (AAA): BC = 3, EF = 5, ∠B = ∠E = 60°, ∠C = ∠F = 40° gives every ratio 0.6", () => {
    const first = sidesFromBaseAngles(3, 60, 40);
    const second = sidesFromBaseAngles(5, 60, 40);
    if (first === null || second === null) throw new Error("no triangle");
    const s = { ...base, first, second, edit: MatchEdit.Angles };
    for (const r of ratiosOfMatch(s)) expect(r).toBeCloseTo(0.6, 9);
    // changing EF keeps the angles, so they stay similar
    const longer = run(match, s, MatchAction.NudgeSide, { side: MatchSide.BC, by: 1 });
    expect(isSimilarMatch(longer.state)).toBe(true);
  });
  it("scale mode keeps the shape", () => {
    const s = { ...base, edit: MatchEdit.Scale };
    const r = run(match, s, MatchAction.NudgeScale, { by: 1 });
    expect(isSimilarMatch(r.state)).toBe(true);
    expect(r.state.second.ab).toBeCloseTo(3 * 1.75, 9);
  });
  it("refuses a change that breaks the triangle", () => {
    const s = {
      ...base,
      first: { ab: 1, bc: 1, ca: 1 },
      second: { ab: 1, bc: 1, ca: 1.9 },
      step: 0.5,
    };
    const r = run(match, s, MatchAction.NudgeSide, { side: MatchSide.CA, by: 1 });
    expect(r.state.second.ca).toBe(1.9);
  });
});

describe("areas of similar triangles (NCERT 6.5)", () => {
  const base = areaTiles.defaults as AreaState;
  it("sides 2 : 3 give areas 4 : 9; Exercise 6.4 Q9: sides 4 : 9 give 16 : 81", () => {
    expect(areaRatioOf({ ...base, small: 2, big: 3 })).toBeCloseTo(4 / 9, 6);
    expect(areaRatioOf({ ...base, small: 4, big: 8 })).toBeCloseTo(1 / 4, 6);
    expect((4 / 9) ** 2).toBeCloseTo(16 / 81, 12);
  });
  it("Example 9: XY halves the area when XB/AB = 1/√2", () => {
    const s = { ...base, mode: AreaMode.Half, t: 0.7 };
    const r = run(area, s, AreaAction.MoveLine, { by: 1 });
    expect(r.state.t).toBeCloseTo(0.71, 9);
    expect(signals(r.emit)).toContain(AreaSignal.Halved);
    expect(areaRatioOf({ ...base, mode: AreaMode.Half, t: Math.SQRT1_2 })).toBeCloseTo(0.5, 6);
  });
  it("the midpoint triangle is a quarter (Exercise 6.4 Q5)", () => {
    expect(areaRatioOf({ ...base, mode: AreaMode.Midpoints })).toBe(0.25);
  });
});

describe("Pythagoras (NCERT 6.6)", () => {
  const base = pythagoras.defaults as PythState;
  it("3, 4 → 5, and the squares add up", () => {
    const v = viewOf(pyth, base) as Record<string, unknown>;
    expect(v.hypotenuse).toBe(5);
    expect(v.squares).toEqual({ ab: 9, bc: 16, ca: 25 });
  });
  it("the altitude: AD·AC = AB², CD·AC = BC² (Theorem 6.7, 6.8)", () => {
    const { ad, cd, bd } = altitudeOf({ ab: 3, bc: 4 });
    expect(ad * 5).toBeCloseTo(9, 9);
    expect(cd * 5).toBeCloseTo(16, 9);
    expect(ad + cd).toBeCloseTo(5, 9);
    expect(bd * bd).toBeCloseTo(ad * cd, 9);
  });
  it("Example 11: a ladder 2.5 m out, reaching 6 m up, is 6.5 m long", () => {
    const v = viewOf(pyth, { ...base, ab: 6, bc: 2.5 }) as Record<string, unknown>;
    expect(v.hypotenuse).toBe(6.5);
  });
  it("Exercise 6.5 Q1 and Q17: which triangles are right-angled (Theorem 6.9)", () => {
    const c = { ...base, mode: PythMode.Converse };
    expect(rightAtOf({ ...c, ab: 7, bc: 24, ca: 25 })).toBe("B");
    expect(rightAtOf({ ...c, ab: 3, bc: 8, ca: 6 })).toBeNull();
    expect(rightAtOf({ ...c, ab: 50, bc: 80, ca: 100 })).toBeNull();
    expect(rightAtOf({ ...c, ab: 13, bc: 12, ca: 5 })).toBe("C");
    expect(rightAtOf({ ...c, ab: 6 * Math.sqrt(3), bc: 6, ca: 12 })).toBe("B");
  });
  it("converse mode says when a right angle appears", () => {
    const s = { ...base, mode: PythMode.Converse, ab: 3, bc: 4, ca: 6 };
    const r = run(pyth, s, PythAction.NudgeSide, { side: PythSide.CA, by: -1 });
    expect(signals(r.emit)).toEqual([PythSignal.Changed, PythSignal.RightAngle]);
  });
  it("the proof steps stop at the end", () => {
    let s: PythState = { ...base, mode: PythMode.Altitude };
    for (let i = 0; i < 5; i++) s = run(pyth, s, PythAction.Next).state;
    expect(s.step).toBe(3);
  });
});

describe("heights from shadows", () => {
  const base = shadowHeight.defaults as ShadowState;
  it("Exercise 6.3 Q15: a 6 m pole with a 4 m shadow; a 28 m shadow belongs to a 42 m tower", () => {
    expect(objectShadowOf({ stickHeight: 6, stickShadow: 4, objectHeight: 42 })).toBe(28);
  });
  it("Example 7: a 0.9 m girl 4.8 m from a 3.6 m lamp has a 1.6 m shadow", () => {
    expect(lampShadowOf({ lampHeight: 3.6, personHeight: 0.9, distance: 4.8 })).toBe(1.6);
  });
  it("moving the sun changes both shadows but not their ratio to the heights", () => {
    const r = run(shadow, base, ShadowAction.NudgeSun, { by: 1 });
    const s = r.state;
    expect(objectShadowOf(s) / s.objectHeight).toBeCloseTo(s.stickShadow / s.stickHeight, 9);
    expect(s.stickShadow).not.toBe(base.stickShadow);
  });
  it("walking away lengthens the shadow (lamp)", () => {
    const s = { ...base, mode: ShadowMode.Lamp };
    const r = run(shadow, s, ShadowAction.Walk, { by: 1 });
    expect(lampShadowOf(r.state)).toBeGreaterThan(lampShadowOf(s));
  });
  it("keeps the answer hidden until the last step", () => {
    const o = observationOf(shadow, base);
    expect(o.hidden).toEqual({ answer: 15 });
    let s: ShadowState = base;
    for (let i = 0; i < 3; i++) s = run(shadow, s, ShadowAction.Next).state;
    expect(observationOf(shadow, s).hidden).toBeUndefined();
  });
});

describe("the package", () => {
  it("lists every definition in defs.ts", () => {
    expect(defs.map((d) => d.type).sort()).toEqual(trianglesProps.map((m) => m.def.type).sort());
  });

  const cases: [AnyPropDef, ComponentType<PropViewProps>, StoredState[]][] = trianglesProps.map(
    (m) => {
      const d = m.def.defaults as StoredState;
      const extra: StoredState[] =
        m.def.type === "similarFigures"
          ? Object.values(SimilarPair).map((pair) => ({ ...d, pair, canSetAngle: true }))
          : m.def.type === "proportionLine"
            ? [{ ...d, mode: BptMode.Free, canMoveE: true, e: 0.4, showLengths: true }]
            : m.def.type === "triangleMatch"
              ? Object.values(MatchEdit).map((edit) => ({ ...d, edit }))
              : m.def.type === "areaTiles"
                ? [
                    { ...d, mode: AreaMode.Half, t: 0.71 },
                    { ...d, mode: AreaMode.Midpoints, names: ["A", "B", "C", "D", "E", "F"] },
                    { ...d, small: 1, big: 8 },
                  ]
                : m.def.type === "pythagoras"
                  ? [
                      { ...d, mode: PythMode.Altitude, step: 3 },
                      { ...d, mode: PythMode.Converse, ca: 6 },
                      { ...d, ab: 6, bc: 2.5 },
                    ]
                  : m.def.type === "shadowHeight"
                    ? [
                        { ...d, step: 3, object: ShadowObject.Tree },
                        {
                          ...d,
                          object: ShadowObject.Tower,
                          stickHeight: 6,
                          stickShadow: 4,
                          objectHeight: 42,
                        },
                        { ...d, mode: ShadowMode.Lamp, step: 2 },
                      ]
                    : Object.values(TrianglesSceneKind).map((scene) => ({ scene }));
      return [m.def, m.View, [d, ...extra]];
    },
  );
  for (const [def, View, states] of cases)
    it(`draws ${def.type} in English and Hindi at phone widths`, () => {
      for (const s of states)
        for (const locale of ["en", "hi"] as const)
          for (const width of [300, 340, 420]) {
            const html = renderToString(
              <View
                view={viewOf(def, s)}
                locale={locale}
                width={width}
                call={() => undefined}
                signal={() => undefined}
              />,
            );
            expect(html).not.toMatch(/NaN|undefined|Infinity/);
            const o = observationOf(def, s);
            expect(o.summary.length).toBeGreaterThan(10);
          }
    });
  it("the scene prop has a picture for every kind", () => {
    const scene = asAnyProp(trianglesScene);
    for (const k of Object.values(TrianglesSceneKind))
      expect(observationOf(scene, { scene: k }).summary.length).toBeGreaterThan(40);
  });
});

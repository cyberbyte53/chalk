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
import {
  ClinoAction,
  ClinoSignal,
  type ClinoState,
  ClinoTarget,
  clinometer,
  computedHeightOf,
  isSightedOf,
  trueAngleOf,
} from "./clinometer";
import { defs } from "./defs";
import {
  HeightsAction,
  HeightsSignal,
  type HeightsState,
  heightFinder,
  stepCountOf,
} from "./heights";
import {
  DivideBy,
  IdentityAction,
  type IdentityState,
  checkOf,
  sidesOf,
  unitIdentity,
} from "./identity";
import { trigonometryProps } from "./index";
import { PROBLEMS, Problem } from "./problems";
import {
  RatioReference,
  RatiosAction,
  RatiosSignal,
  type RatiosState,
  lengthsOf,
  trigRatios,
  valuesOf,
  workingOf,
} from "./ratios";
import { TrigSceneKind, trigScene } from "./scene";
import {
  SpecialAction,
  SpecialMode,
  SpecialSignal,
  type SpecialState,
  specialAngles,
} from "./special";
import {
  EXACT,
  PARTNER,
  type Pt,
  RATIOS,
  Ratio,
  SPECIAL_ANGLES,
  deg,
  ratioValue,
  simplifySqrt,
} from "./trig";

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

const ratios = asAnyProp(trigRatios);
const special = asAnyProp(specialAngles);
const identity = asAnyProp(unitIdentity);
const heights = asAnyProp(heightFinder);
const clino = asAnyProp(clinometer);

/** Evaluates the TeX of Table 8.1 (only the forms it uses). */
function texValue(t: string): number {
  const s = t
    .replace(/\\sqrt\{?(\d+)\}?/g, "Math.sqrt[$1]")
    .replace(/\\(?:t|d)?frac\{([^}]*)\}\{([^}]*)\}/g, "($1)/($2)")
    .replace(/\[(\d+)\]/g, "($1)")
    .replace(/(\d)\s*Math/g, "$1*Math")
    .replace(/\)\s*Math/g, ")*Math");
  return Function(`return (${s});`)() as number;
}

describe("the ratios", () => {
  it("Table 8.1 matches the numbers, with tan 90°, sec 90°, cot 0° and cosec 0° not defined", () => {
    for (const a of SPECIAL_ANGLES)
      for (const r of RATIOS) {
        const tex = EXACT[a][r];
        const v = ratioValue(r, a);
        if (tex === null) expect(v).toBeNull();
        else expect(texValue(tex)).toBeCloseTo(v as number, 9);
      }
    expect(EXACT[90].tan).toBeNull();
    expect(EXACT[90].sec).toBeNull();
    expect(EXACT[0].cot).toBeNull();
    expect(EXACT[0].cosec).toBeNull();
    expect(ratioValue(Ratio.Sin, 30)).toBe(0.5);
    expect(ratioValue(Ratio.Tan, 45)).toBe(1);
    expect(ratioValue(Ratio.Cos, 60)).toBe(0.5);
  });
  it("the three identities hold at every angle and for every division", () => {
    for (let a = 5; a <= 85; a += 5) {
      const s = ratioValue(Ratio.Sin, a) as number;
      const c = ratioValue(Ratio.Cos, a) as number;
      const t = ratioValue(Ratio.Tan, a) as number;
      expect(s * s + c * c).toBeCloseTo(1, 12);
      expect(1 + t * t).toBeCloseTo((ratioValue(Ratio.Sec, a) as number) ** 2, 9);
      expect((ratioValue(Ratio.Cot, a) as number) ** 2 + 1).toBeCloseTo(
        (ratioValue(Ratio.Cosec, a) as number) ** 2,
        9,
      );
      for (const divideBy of Object.values(DivideBy)) {
        const st: IdentityState = { ...(identity.defaults as IdentityState), angle: a, divideBy };
        const k = checkOf(st);
        expect(k.legs).toBeCloseTo(k.hyp, 6);
      }
    }
    const one = sidesOf({ ...(identity.defaults as IdentityState), divideBy: DivideBy.Adjacent });
    expect(one.ab).toBeCloseTo(1, 12);
  });
  it("complementary partners agree: sin(90° − A) = cos A and so on (Examples 9–11)", () => {
    for (const a of [10, 25, 30, 48, 67])
      for (const r of RATIOS)
        expect(ratioValue(PARTNER[r], 90 - a) as number).toBeCloseTo(ratioValue(r, a) as number, 9);
    // Example 9: tan 65° / cot 25° = 1.
    expect(
      (ratioValue(Ratio.Tan, 65) as number) / (ratioValue(Ratio.Cot, 25) as number),
    ).toBeCloseTo(1, 12);
    // Example 11: sin 67° + cos 75° = cos 23° + sin 15°.
    expect(
      (ratioValue(Ratio.Sin, 67) as number) + (ratioValue(Ratio.Cos, 75) as number),
    ).toBeCloseTo(
      (ratioValue(Ratio.Cos, 23) as number) + (ratioValue(Ratio.Sin, 15) as number),
      12,
    );
  });
  it("NCERT 8.3 examples and exercise answers", () => {
    const v = (r: Ratio, a: number) => ratioValue(r, a) as number;
    // Example 7: sin(A − B) = 1/2, cos(A + B) = 1/2 → A = 45°, B = 15°.
    expect(v(Ratio.Sin, 30)).toBeCloseTo(0.5, 12);
    expect(v(Ratio.Cos, 60)).toBeCloseTo(0.5, 12);
    // Example 8: 5cos²60 + 4sec²30 − tan²45 over sin²30 + cos²30 = 67/12.
    const ex8 =
      (5 * v(Ratio.Cos, 60) ** 2 + 4 * v(Ratio.Sec, 30) ** 2 - v(Ratio.Tan, 45) ** 2) /
      (v(Ratio.Sin, 30) ** 2 + v(Ratio.Cos, 30) ** 2);
    expect(ex8).toBeCloseTo(67 / 12, 9);
    // Exercise 8.2 Q2: 2tan30°/(1 + tan²30°) = sin 60°.
    expect((2 * v(Ratio.Tan, 30)) / (1 + v(Ratio.Tan, 30) ** 2)).toBeCloseTo(v(Ratio.Sin, 60), 12);
    // sin 2A = 2 sin A only at A = 0°.
    expect(v(Ratio.Sin, 60)).not.toBeCloseTo(2 * v(Ratio.Sin, 30), 3);
  });
  it("simplifies surds", () => {
    expect(simplifySqrt(8)).toEqual([2, 2]);
    expect(simplifySqrt(12)).toEqual([2, 3]);
    expect(simplifySqrt(7)).toEqual([1, 7]);
  });
});

describe("trigRatios", () => {
  const d = ratios.defaults as RatiosState;
  it("scaling the triangle changes the sides but not the ratios", () => {
    const a = valuesOf(d);
    const big = run(ratios, d, RatiosAction.NudgeSize, { by: 1 });
    expect(lengthsOf(big.state).ac).toBe(d.size + 1);
    const b = valuesOf(big.state);
    for (const r of RATIOS) expect(b[r] as number).toBeCloseTo(a[r] as number, 9);
    expect(signals(big.emit)).toContain(RatiosSignal.Changed);
  });
  it("swapping the reference angle swaps opposite and adjacent", () => {
    const s = { ...d, canSwap: true };
    const { state, emit } = run(ratios, s, RatiosAction.Swap);
    expect(state.reference).toBe(RatioReference.C);
    expect(signals(emit)).toContain(RatiosSignal.Swapped);
    const v = valuesOf(state);
    const w = valuesOf(d);
    expect(v.sin as number).toBeCloseTo(w.cos as number, 9);
    expect(v.tan as number).toBeCloseTo(w.cot as number, 9);
  });
  it("sin A = 1/3 gives AB = 2√2k (NCERT 8.2)", () => {
    const s: RatiosState = {
      ...d,
      given: { ratio: Ratio.Sin, num: 1, den: 3 },
      canStep: true,
      step: 0,
    };
    const v = valuesOf(s);
    expect(v.sin as number).toBeCloseTo(1 / 3, 9);
    expect(v.cos as number).toBeCloseTo((2 * Math.SQRT2) / 3, 9);
    const w = workingOf(s).join(" ");
    expect(w).toContain("2\\sqrt{2}k");
  });
  it("Example 1: tan A = 4/3 gives sin A = 4/5 and cos A = 3/5", () => {
    const s: RatiosState = { ...d, given: { ratio: Ratio.Tan, num: 4, den: 3 } };
    const v = valuesOf(s);
    expect(v.sin as number).toBeCloseTo(0.8, 9);
    expect(v.cos as number).toBeCloseTo(0.6, 9);
    expect(v.sec as number).toBeCloseTo(5 / 3, 9);
    const steps = [];
    let st = { ...s, canStep: true };
    for (let i = 0; i < 3; i++) {
      const r = run(ratios, st, RatiosAction.Next);
      st = r.state;
      steps.push(...signals(r.emit));
    }
    expect(st.step).toBe(3);
    expect(steps).toContain(RatiosSignal.Stepped);
  });
  it("Example 3: 29-21-20 triangle gives cos²θ − sin²θ = 41/841", () => {
    const s: RatiosState = { ...d, given: { ratio: Ratio.Cos, num: 21, den: 29 } };
    const v = valuesOf(s);
    expect(v.sin as number).toBeCloseTo(20 / 29, 9);
    expect((v.cos as number) ** 2 - (v.sin as number) ** 2).toBeCloseTo(41 / 841, 9);
  });
  it("rejects an impossible given ratio", () => {
    expect(applyPatch(ratios, d, { given: { ratio: Ratio.Sin, num: 3, den: 2 } }).isOk).toBe(false);
    expect(applyPatch(ratios, d, { given: { ratio: Ratio.Sin, num: 1, den: 3 } }).isOk).toBe(true);
  });
});

describe("specialAngles", () => {
  const d = special.defaults as SpecialState;
  it("the half-square fills the 45° column at its last step", () => {
    let s = d;
    const out: string[] = [];
    for (let i = 0; i < 4; i++) {
      const r = run(special, s, SpecialAction.Next);
      s = r.state;
      out.push(...signals(r.emit));
    }
    expect(s.filled).toContain(45);
    expect(out).toContain(SpecialSignal.Filled);
  });
  it("the half-equilateral fills 30° and 60°", () => {
    let s: SpecialState = { ...d, mode: SpecialMode.Equilateral };
    for (let i = 0; i < 4; i++) s = run(special, s, SpecialAction.Next).state;
    expect(s.filled).toEqual(expect.arrayContaining([30, 60]));
  });
  it("turning A to 0° and 90° fills those columns", () => {
    let s: SpecialState = { ...d, mode: SpecialMode.Limits, angle: 10, angleStep: 5 };
    s = run(special, s, SpecialAction.Nudge, { by: -1 }).state;
    const r = run(special, s, SpecialAction.Nudge, { by: -1 });
    expect(r.state.angle).toBe(0);
    expect(r.state.filled).toContain(0);
    expect(signals(r.emit)).toContain(SpecialSignal.Filled);
    s = { ...r.state, angle: 85 };
    expect(run(special, s, SpecialAction.Nudge, { by: 1 }).state.filled).toContain(90);
  });
});

describe("unitIdentity", () => {
  it("switching the division changes the identity and emits", () => {
    const d = identity.defaults as IdentityState;
    const r = run(identity, d, IdentityAction.Divide, { by: DivideBy.Opposite });
    expect(r.state.divideBy).toBe(DivideBy.Opposite);
    expect(r.emit.length).toBe(1);
  });
});

/** The angle at v between the directions to p and q (°). */
function angleAt(v: Pt, p: Pt, q: Pt): number {
  const a = Math.atan2(p[1] - v[1], p[0] - v[0]);
  const b = Math.atan2(q[1] - v[1], q[0] - v[0]);
  let x = Math.abs(deg(a - b));
  if (x > 180) x = 360 - x;
  return x;
}

describe("heightFinder problems", () => {
  for (const id of Object.values(Problem)) {
    const p = PROBLEMS[id];
    it(`${id}: the figure is drawn to its angles and the answer is in the figure`, () => {
      const at = (n: string): Pt => {
        const q = p.points[n];
        if (q === undefined) throw new Error(`${id}: no point ${n}`);
        return q;
      };
      for (const a of p.arcs) {
        const m = /^(\d+(?:\.\d+)?)°$/.exec(a.text);
        if (m === null) continue;
        expect(angleAt(at(a.at), at(a.a), at(a.b))).toBeCloseTo(Number(m[1]), 6);
      }
      for (const r of p.rights) expect(angleAt(at(r.at), at(r.a), at(r.b))).toBeCloseTo(90, 6);
      for (const n of [
        ...p.labels,
        ...p.sights.flat(),
        ...p.horizontals.flat(),
        ...p.guides.flat(),
        ...p.lengths.flatMap((l) => [l.a, l.b]),
      ])
        at(n);
      // The answer is a length in the figure: between two points, or a height or a horizontal gap.
      const pts = Object.values(p.points);
      const found = pts.some((u) =>
        pts.some(
          (v) =>
            Math.abs(Math.hypot(u[0] - v[0], u[1] - v[1]) - p.value) < 1e-6 ||
            Math.abs(Math.abs(u[1] - v[1]) - p.value) < 1e-6 ||
            Math.abs(Math.abs(u[0] - v[0]) - p.value) < 1e-6,
        ),
      );
      expect(found).toBe(true);
      expect(p.steps.length).toBeGreaterThan(1);
      expect(p.steps.length).toBeLessThanOrEqual(6);
      expect(p.question.hi.length).toBeGreaterThan(5);
      expect(p.answer.hi.length).toBeGreaterThan(5);
    });
  }
  it("the NCERT answers", () => {
    const r3 = Math.sqrt(3);
    expect(PROBLEMS[Problem.Ex1Tower].value).toBeCloseTo(15 * r3, 9);
    expect(PROBLEMS[Problem.Ex3Chimney].value).toBeCloseTo(30, 9);
    expect(PROBLEMS[Problem.Ex4Flagstaff].value).toBeCloseTo(10 * (r3 - 1), 9);
    expect(PROBLEMS[Problem.Ex5Shadow].value).toBeCloseTo(20 * r3, 9);
    expect(PROBLEMS[Problem.Ex6Buildings].value).toBeCloseTo(4 * (3 + r3), 9);
    expect(PROBLEMS[Problem.Ex7Bridge].value).toBeCloseTo(3 * (r3 + 1), 9);
    expect(PROBLEMS[Problem.Q5Kite].value).toBeCloseTo(40 * r3, 9);
    expect(PROBLEMS[Problem.Q13Ships].value).toBeCloseTo(75 * (r3 - 1), 9);
    expect(PROBLEMS[Problem.Q14Balloon].value).toBeCloseTo(58 * r3, 9);
    expect(PROBLEMS[Problem.FortTower].value).toBeCloseTo(31.5, 9);
    expect(PROBLEMS[Problem.KiteString].value).toBeCloseTo(PROBLEMS[Problem.FortTower].value, 9);
  });
  it("Next reveals the working and the last line solves", () => {
    let s: HeightsState = heights.defaults as HeightsState;
    const out: string[] = [];
    for (let i = 0; i < stepCountOf(s); i++) {
      const r = run(heights, s, HeightsAction.Next);
      s = r.state;
      out.push(...signals(r.emit));
    }
    expect(out.at(-1)).toBe(HeightsSignal.Solved);
    expect(observationOf(heights, s).hidden).toBeUndefined();
    expect(run(heights, s, HeightsAction.Next).emit).toEqual([]);
  });
});

describe("clinometer", () => {
  it("tilting onto the top sights it and works out the height", () => {
    // Kabir, 30 m from the tower, eye 1.5 m: the top is at 45°.
    const d = clino.defaults as ClinoState;
    expect(trueAngleOf(d)).toBeCloseTo(45, 9);
    let s: ClinoState = { ...d, tilt: 35 };
    s = run(clino, s, ClinoAction.Tilt, { by: 1 }).state;
    expect(isSightedOf(s)).toBe(false);
    const r = run(clino, s, ClinoAction.Tilt, { by: 1 });
    expect(r.state.tilt).toBe(45);
    expect(signals(r.emit)).toContain(ClinoSignal.Sighted);
    expect(computedHeightOf(r.state)).toBeCloseTo(31.5, 9);
    // Already sighted: no second Sighted.
    expect(
      signals(run(clino, { ...r.state, tiltStep: 1 }, ClinoAction.Tilt, { by: 1 }).emit),
    ).not.toContain(ClinoSignal.Sighted);
  });
  it("walking away lowers the angle", () => {
    const s: ClinoState = { ...(clino.defaults as ClinoState), canWalk: true };
    const r = run(clino, s, ClinoAction.Walk, { by: 1 });
    expect(r.state.distance).toBe(35);
    expect(trueAngleOf(r.state)).toBeLessThan(trueAngleOf(s));
  });
});

describe("views", () => {
  it("defs and modules list the same props", () => {
    expect(defs.map((x) => x.type).sort()).toEqual(trigonometryProps.map((m) => m.def.type).sort());
  });
  const cases: [AnyPropDef, ComponentType<PropViewProps>, StoredState[]][] = trigonometryProps.map(
    (m) => {
      const d = m.def.defaults as StoredState;
      const extra: StoredState[] =
        m.def.type === "trigRatios"
          ? [
              { ...d, reference: RatioReference.C, showPairs: true, canSwap: true },
              { ...d, given: { ratio: Ratio.Sin, num: 1, den: 3 }, step: 3, canStep: true },
              { ...d, given: { ratio: Ratio.Tan, num: 4, den: 3 }, step: 1, canStep: true },
              { ...d, angle: 5, size: 1 },
              { ...d, angle: 85, size: 12, shown: RATIOS },
            ]
          : m.def.type === "specialAngles"
            ? [
                { ...d, step: 4, filled: [45] },
                { ...d, mode: SpecialMode.Equilateral, step: 2 },
                { ...d, mode: SpecialMode.Equilateral, step: 4, filled: [30, 45, 60] },
                { ...d, mode: SpecialMode.Limits, angle: 0, filled: [0] },
                { ...d, mode: SpecialMode.Limits, angle: 90, filled: [0, 30, 45, 60, 90] },
              ]
            : m.def.type === "unitIdentity"
              ? [
                  { ...d, divideBy: DivideBy.Adjacent, angle: 60 },
                  { ...d, divideBy: DivideBy.Opposite, angle: 20 },
                  { ...d, angle: 5 },
                  { ...d, angle: 85, divideBy: DivideBy.Opposite },
                ]
              : m.def.type === "heightFinder"
                ? Object.values(Problem).flatMap((problem) => [
                    { ...d, problem },
                    { ...d, problem, step: PROBLEMS[problem].steps.length },
                  ])
                : m.def.type === "clinometer"
                  ? [
                      { ...d, tilt: 45 },
                      {
                        ...d,
                        target: ClinoTarget.Kite,
                        targetHeight: 31.5,
                        distance: 52,
                        tilt: 30,
                        canWalk: true,
                      },
                      { ...d, target: ClinoTarget.Flag, targetHeight: 12, distance: 5, tilt: 85 },
                      { ...d, target: ClinoTarget.Tree, targetHeight: 8, distance: 60, tilt: 0 },
                    ]
                  : Object.values(TrigSceneKind).map((scene) => ({ scene }));
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
    const scene = asAnyProp(trigScene);
    for (const k of Object.values(TrigSceneKind))
      expect(observationOf(scene, { scene: k }).summary.length).toBeGreaterThan(40);
  });
});

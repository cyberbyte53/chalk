import { readFileSync } from "node:fs";
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
  ComboAction,
  ComboSignal,
  type ComboState,
  Sum,
  comboBuilder,
  groupsOf,
  sumsOf,
} from "./combo";
import { ComboView } from "./combo-view";
import { ComboKind, comboOf, totalOf } from "./combos";
import { defs } from "./defs";
import {
  FrustumAction,
  FrustumMeasure,
  FrustumSignal,
  type FrustumState,
  FrustumStep,
  frustumCut,
  frustumNumbers,
} from "./frustum";
import { FrustumView, frustumLines } from "./frustum-view";
import { solidsProps } from "./index";
import {
  RecastAction,
  RecastKind,
  RecastSignal,
  type RecastState,
  answerOf,
  meltRecast,
  recastOf,
} from "./recast";
import { RecastView, linesOf } from "./recast-view";
import { SolidsSceneKind, solidsScene } from "./scene";
import { SolidsSceneView } from "./scene-view";
import {
  type Dims,
  Pi,
  Solid,
  conesOfFrustum,
  measuresOf,
  numText,
  piValue,
  slantOfCone,
  workTex,
} from "./solids";
import { Measure, ViewerAction, ViewerSignal, type ViewerState, solidViewer } from "./viewer";
import { ViewerView } from "./viewer-view";

const viewer = asAnyProp(solidViewer);
const combo = asAnyProp(comboBuilder);
const recast = asAnyProp(meltRecast);
const frustum = asAnyProp(frustumCut);
const scene = asAnyProp(solidsScene);

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
const signals = (emit: readonly { signal: string }[]) => emit.map((e) => e.signal);

const D: Dims = { l: 1, b: 1, h: 1, a: 1, r: 1, r1: 2, r2: 1 };
const P7 = piValue(Pi.Sevenths);

describe("the formulas (Class IX recap)", () => {
  it("cuboid, cube", () => {
    const c = measuresOf(Solid.Cuboid, { ...D, l: 6, b: 4, h: 10 }, P7);
    expect(c.curved).toBe(200);
    expect(c.total).toBe(248);
    expect(c.volume).toBe(240);
    const q = measuresOf(Solid.Cube, { ...D, a: 5 }, P7);
    expect([q.curved, q.total, q.volume]).toEqual([100, 150, 125]);
  });

  it("cylinder, cone, sphere, hemisphere with π = 22/7", () => {
    const cyl = measuresOf(Solid.Cylinder, { ...D, r: 3.5, h: 10 }, P7);
    expect(cyl.curved).toBeCloseTo(220, 9);
    expect(cyl.total).toBeCloseTo(297, 9);
    expect(cyl.volume).toBeCloseTo(385, 9);
    const cone = measuresOf(Solid.Cone, { ...D, r: 7, h: 24 }, P7);
    expect(cone.slant).toBe(25);
    expect(cone.curved).toBeCloseTo(550, 9);
    expect(cone.total).toBeCloseTo(704, 9);
    expect(cone.volume).toBeCloseTo(1232, 9);
    const sph = measuresOf(Solid.Sphere, { ...D, r: 7 }, P7);
    expect(sph.total).toBeCloseTo(616, 9);
    expect(sph.volume).toBeCloseTo(1437.33, 2);
    const hemi = measuresOf(Solid.Hemisphere, { ...D, r: 7 }, P7);
    expect(hemi.curved).toBeCloseTo(308, 9);
    expect(hemi.total).toBeCloseTo(462, 9);
  });

  it("frustum formulas agree with big cone minus small cone", () => {
    for (const [r1, r2, h] of [
      [28, 7, 45],
      [17.5, 15, 14],
      [20, 8, 16],
      [2, 1, 14],
    ] as const) {
      const { h1, h2 } = conesOfFrustum(r1, r2, h);
      const m = measuresOf(Solid.Frustum, { ...D, r1, r2, h }, P7);
      expect(m.volume).toBeCloseTo((P7 / 3) * (r1 * r1 * h1 - r2 * r2 * h2), 6);
      expect(m.curved).toBeCloseTo(P7 * (r1 * slantOfCone(r1, h1) - r2 * slantOfCone(r2, h2)), 6);
    }
  });

  it("writes worked lines with the numbers and answer", () => {
    const lines = workTex(Solid.Cylinder, { ...D, r: 3.5, h: 10 }, Pi.Sevenths, "cm", "curved");
    expect(lines[0]).toContain("2\\pi rh = 2 \\times \\frac{22}{7} \\times 3.5 \\times 10");
    expect(lines.at(-1)).toContain("= 220");
    const cone = workTex(Solid.Cone, { ...D, r: 7, h: 24 }, Pi.Sevenths, "cm", "total");
    expect(cone[0]).toContain("l = \\sqrt{r^2 + h^2}");
    expect(numText(1131428.571)).toBe("11,31,428.57");
  });
});

describe("combinations of solids (NCERT 13.2, 13.3)", () => {
  const totals = (kind: ComboKind, sum: "surface" | "volume") =>
    (comboOf(kind)[sum] ?? []).map((g) => totalOf(g));
  it("surface areas: the examples", () => {
    expect(totals(ComboKind.Lattu, "surface")[0]).toBeCloseTo(39.6, 0);
    expect(totals(ComboKind.Block, "surface")[0]).toBeCloseTo(163.86, 6);
    const [orange, yellow] = totals(ComboKind.Rocket, "surface");
    expect(orange).toBeCloseTo(63.585, 6);
    expect(yellow).toBeCloseTo(195.465, 6);
    expect(totals(ComboKind.BirdBath, "surface")[0]).toBeCloseTo(33000, 6);
  });
  it("surface areas: Exercise 13.1", () => {
    expect(totals(ComboKind.TwoCubes, "surface")[0]).toBe(160);
    expect(totals(ComboKind.Vessel, "surface")[0]).toBeCloseTo(572, 6);
    expect(totals(ComboKind.Toy, "surface")[0]).toBeCloseTo(214.5, 6);
    expect(totals(ComboKind.CubeDome, "surface")[0]).toBeCloseTo(332.5, 6);
    expect(totals(ComboKind.Capsule, "surface")[0]).toBeCloseTo(220, 6);
    const tent = totals(ComboKind.Tent, "surface")[0] ?? 0;
    expect(tent).toBeCloseTo(44, 6);
    expect(tent * 500).toBeCloseTo(22000, 4);
    expect(totals(ComboKind.ConeHollow, "surface")[0]).toBeCloseTo(17.6, 6);
    expect(totals(ComboKind.Scooped, "surface")[0]).toBeCloseTo(374, 6);
  });
  it("volumes: Examples 6, 7 and Exercise 13.2", () => {
    const [apparent, actual] = totals(ComboKind.Glass, "volume");
    expect(apparent).toBeCloseTo(196.25, 6);
    expect(actual).toBeCloseTo(163.54, 2);
    const [toy, gap] = totals(ComboKind.ToyInCylinder, "volume");
    expect(toy).toBeCloseTo(25.12, 6);
    expect(gap).toBeCloseTo(25.12, 6);
    expect(totals(ComboKind.ConeOnDome, "volume")[0]).toBeCloseTo(Math.PI, 9);
    expect(totals(ComboKind.Model, "volume")[0]).toBeCloseTo(66, 6);
    expect(Math.round(totals(ComboKind.GulabJamun, "volume")[1] ?? 0)).toBe(338);
    expect(totals(ComboKind.InTank, "volume")[0]).toBeCloseTo(1131428.57, 1);
    expect(totals(ComboKind.Flask, "volume")[0]).toBeCloseTo(346.51, 2);
  });
  it("every combination has at least one sum and only positive terms", () => {
    for (const kind of Object.values(ComboKind)) {
      const c = comboOf(kind);
      expect(sumsOf(kind).length).toBeGreaterThan(0);
      for (const g of [...(c.surface ?? []), ...(c.volume ?? [])])
        for (const t of g.terms) expect(t.value).toBeGreaterThan(0);
    }
  });
  it("reveals terms one at a time, says when done, splits and joins", () => {
    const s0 = { ...(comboBuilder.defaults as ComboState), kind: ComboKind.Block };
    const a = run(combo, s0, ComboAction.Reveal);
    expect(a.state.revealed).toBe(1);
    expect(signals(a.emit)).toEqual([ComboSignal.Revealed]);
    const b = run(combo, run(combo, a.state, ComboAction.Reveal).state, ComboAction.Reveal);
    expect(signals(b.emit)).toEqual([ComboSignal.Revealed, ComboSignal.Done]);
    expect(run(combo, b.state, ComboAction.Reveal).emit).toEqual([]);
    expect(look(combo, b.state).totals).toEqual([163.86]);
    const c = run(combo, s0, ComboAction.Split, { apart: true });
    expect(c.state.isApart).toBe(true);
    expect(signals(c.emit)).toEqual([ComboSignal.Split]);
    const d = run(combo, { ...s0, canSwitch: true }, ComboAction.Show, { sum: Sum.Volume });
    expect(d.emit).toEqual([]);
    const k = run(combo, s0, ComboAction.SetKind, { kind: ComboKind.Glass });
    expect(k.state.sum).toBe(Sum.Volume);
    expect(groupsOf(k.state).length).toBe(2);
  });
});

describe("converting solids (NCERT 13.4)", () => {
  const ans = (k: RecastKind) => answerOf(recastOf(k));
  it("solves the examples and exercises", () => {
    expect(ans(RecastKind.ClayCone)).toBeCloseTo(6, 6);
    expect(ans(RecastKind.Sump)).toBeCloseTo(47.5, 6);
    expect(2 * ans(RecastKind.Wire)).toBeCloseTo(1 / 15, 9);
    expect(ans(RecastKind.SphereToCylinder)).toBeCloseTo(2.744, 6);
    expect(ans(RecastKind.ThreeSpheres)).toBeCloseTo(12, 6);
    expect(ans(RecastKind.Well)).toBeCloseTo(2.5, 6);
    expect(ans(RecastKind.IceCream)).toBe(10);
    expect(ans(RecastKind.Coins)).toBe(400);
    expect(ans(RecastKind.SandHeap)).toBeCloseTo(36, 6);
    expect(slantOfCone(ans(RecastKind.SandHeap), 24)).toBeCloseTo(12 * Math.sqrt(13), 5);
    expect(ans(RecastKind.Pipe) / 3000).toBeCloseTo(5 / 3, 6);
    expect(ans(RecastKind.LeadShots)).toBe(100);
  });
  it("steps to the answer and announces it", () => {
    let s = { ...(meltRecast.defaults as RecastState) };
    const seen: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      const r = run(recast, s, RecastAction.Step);
      s = r.state;
      seen.push(...signals(r.emit));
    }
    expect(s.step).toBe(3);
    expect(seen.filter((x) => x === RecastSignal.Solved)).toHaveLength(1);
    expect(run(recast, s, RecastAction.Step).emit).toEqual([]);
    expect(look(recast, s).answer).toBe(6);
    expect(linesOf(recastOf(RecastKind.ClayCone), 3).at(-1)).toBe("r = 6\\ \\text{cm}");
    expect(run(recast, s, RecastAction.Back).state.step).toBe(0);
  });
});

describe("the frustum (NCERT 13.5)", () => {
  const base = frustumCut.defaults as FrustumState;
  it("Example 12: the cones' heights and the frustum's measures", () => {
    const n = frustumNumbers(base);
    expect(n.h2).toBeCloseTo(15, 9);
    expect(n.h1).toBeCloseTo(60, 9);
    expect(n.volume).toBeCloseTo(48510, 6);
    // NCERT rounds l to 49.65 and gets 5461.5 and 8079.5.
    expect(Math.abs(n.curved - 5461.5)).toBeLessThan(3);
    expect(Math.abs(n.total - 8079.5)).toBeLessThan(3);
  });
  it("Example 13, Exercise 13.4 Q1 and Q4", () => {
    const jaggery = frustumNumbers({ ...base, r1: 17.5, r2: 15, h: 14 });
    expect(jaggery.volume).toBeCloseTo(11641.67, 2);
    expect((jaggery.volume * 1.2) / 1000).toBeCloseTo(13.97, 2);
    expect(frustumNumbers({ ...base, r1: 2, r2: 1, h: 14 }).volume).toBeCloseTo(102.67, 2);
    const milk = frustumNumbers({ ...base, r1: 20, r2: 8, h: 16, pi: Pi.Hundredths });
    expect((milk.volume / 1000) * 20).toBeCloseTo(209, 0);
  });
  it("steps, says when the small cone comes off, and refuses r2 ≥ r1", () => {
    const a = run(frustum, base, FrustumAction.Step);
    const b = run(frustum, a.state, FrustumAction.Step);
    expect(b.state.step).toBe(FrustumStep.Lifted);
    expect(signals(b.emit)).toEqual([FrustumSignal.Stepped, FrustumSignal.Cut]);
    expect(run(frustum, base, FrustumAction.SetDims, { r2: 30 }).state.r2).toBe(7);
    expect(run(frustum, base, FrustumAction.Pick, { measure: FrustumMeasure.Curved }).emit).toEqual(
      [],
    );
    const lines = frustumLines({ ...base, step: FrustumStep.Frustum });
    expect(lines.join(" ")).toContain("48{,}510");
    expect(look(frustum, base).volume).toBe(48510);
  });
});

describe("solidViewer", () => {
  const base = solidViewer.defaults as ViewerState;
  it("unfolds, turns and nudges only when allowed", () => {
    expect(run(viewer, base, ViewerAction.Unfold, { on: true }).emit).toEqual([]);
    const u = run(viewer, { ...base, canUnfold: true }, ViewerAction.Unfold, { on: true });
    expect(u.state.isNet).toBe(true);
    expect(signals(u.emit)).toEqual([ViewerSignal.Unfolded]);
    const n = run(viewer, { ...base, canSetDims: true }, ViewerAction.Nudge, { name: "h", by: 1 });
    expect(n.state.dims.h).toBe(10.5);
    expect(signals(n.emit)).toEqual([ViewerSignal.Changed]);
    expect(look(viewer, base).curved).toBe(220);
  });
  it("keeps a frustum's r2 below r1", () => {
    const s = {
      ...base,
      solid: Solid.Frustum,
      canSetDims: true,
      dims: { ...base.dims, r1: 3, r2: 2.5 },
    };
    expect(run(viewer, s, ViewerAction.Nudge, { name: "r2", by: 1 }).state.dims.r2).toBe(2.5);
  });
});

type View = ComponentType<PropViewProps>;

describe("views", () => {
  const vBase = solidViewer.defaults as ViewerState;
  const cases: [string, AnyPropDef, View, StoredState][] = [
    ...Object.values(Solid).flatMap((solid): [string, AnyPropDef, View, StoredState][] => [
      [
        `viewer ${solid}`,
        viewer,
        ViewerView,
        {
          ...vBase,
          solid,
          measure: Measure.Total,
          measures: [Measure.Curved, Measure.Total, Measure.Volume],
        },
      ],
      [
        `net ${solid}`,
        viewer,
        ViewerView,
        {
          ...vBase,
          solid,
          isNet: true,
          canUnfold: true,
          canTurn: true,
          canSetDims: true,
          measure: Measure.Curved,
        },
      ],
    ]),
    ...Object.values(ComboKind).flatMap((kind): [string, AnyPropDef, View, StoredState][] => {
      const sum = sumsOf(kind)[0] ?? Sum.Surface;
      const n = (comboOf(kind)[sum] ?? []).reduce((a, g) => a + g.terms.length, 0);
      return [
        [
          `combo ${kind}`,
          combo,
          ComboView,
          { ...(comboBuilder.defaults as ComboState), kind, sum, revealed: n },
        ],
        [
          `combo ${kind} apart`,
          combo,
          ComboView,
          { ...(comboBuilder.defaults as ComboState), kind, sum, isApart: true, canSwitch: true },
        ],
      ];
    }),
    ...Object.values(RecastKind).flatMap((kind): [string, AnyPropDef, View, StoredState][] =>
      [0, 1, 2, 3].map((step) => [
        `recast ${kind} ${step}`,
        recast,
        RecastView,
        { ...(meltRecast.defaults as RecastState), kind, step },
      ]),
    ),
    ...[0, 1, 2, 3].flatMap((step): [string, AnyPropDef, View, StoredState][] =>
      Object.values(FrustumMeasure).map((measure) => [
        `frustum ${step} ${measure}`,
        frustum,
        FrustumView,
        { ...(frustumCut.defaults as FrustumState), step, measure, canPick: true },
      ]),
    ),
    ...Object.values(SolidsSceneKind).map((kind): [string, AnyPropDef, View, StoredState] => [
      `scene ${kind}`,
      scene,
      SolidsSceneView,
      { scene: kind },
    ]),
  ];
  for (const [name, def, View, s] of cases) {
    it(`draws ${name} in both languages at phone widths`, () => {
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
        }
      expect(observationOf(def, s).summary.length).toBeGreaterThan(10);
    });
  }

  it("lists every prop in defs and in the modules", () => {
    expect(defs.map((d) => d.type).sort()).toEqual(solidsProps.map((m) => m.def.type).sort());
  });

  it("draws with look tokens only", () => {
    const css = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/);
  });
});

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
  CircleAreaAction,
  CircleAreaMode,
  CircleAreaSignal,
  type CircleAreaState,
  areaOf,
  circleArea,
  circumferenceOf,
  sliceOf,
} from "./circle-area";
import {
  CombinedAction,
  CombinedKind,
  CombinedSignal,
  type CombinedState,
  combinedFigures,
  totalOf,
} from "./combined";
import {
  ConstructionAction,
  ConstructionKind,
  ConstructionSignal,
  type ConstructionState,
  construction,
  resultOf,
  similarPoints,
  stepCountOf,
  stepsOf,
  tangentsAtAnglePoints,
  tangentsFromPointPoints,
} from "./construction";
import { defs } from "./defs";
import { FigureAction, FigureSignal, type FigureState, geoFigure } from "./figure";
import { circlesProps } from "./index";
import { angleAt, circleCircle, dist, dot, lineCircle, sub, tangentPoints } from "./kit/geometry";
import { placeLabels } from "./kit/labels";
import { pathD } from "./kit/path";
import {
  LineCircleAction,
  LineCircleMode,
  LineCircleSignal,
  type LineCircleState,
  LineKind,
  kindOf,
  lineAndCircle,
  oqOf,
} from "./line-circle";
import { PiValue } from "./pi";
import { CirclesSceneKind, circlesScene } from "./scene";
import {
  SectorAction,
  SectorShow,
  type SectorState,
  majorSectorAreaOf,
  sectorAreaOf,
  sectorSegment,
  segmentAreaOf,
  triangleAreaOf,
} from "./sector";
import {
  PointPlace,
  TangentsAction,
  TangentsSignal,
  type TangentsState,
  angleAtOOf,
  angleAtPOf,
  contactsOf,
  lengthOf,
  placeOf,
  tangentCountOf,
  tangentsFromPoint,
} from "./tangents";

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

const lc = asAnyProp(lineAndCircle);
const tg = asAnyProp(tangentsFromPoint);
const cons = asAnyProp(construction);
const area = asAnyProp(circleArea);
const sec = asAnyProp(sectorSegment);
const comb = asAnyProp(combinedFigures);

describe("circle geometry", () => {
  it("meets a line and a circle in 0, 1 or 2 points", () => {
    expect(lineCircle([0, 5], [1, 0], [0, 0], 3)).toHaveLength(0);
    expect(lineCircle([0, 3], [1, 0], [0, 0], 3, 1e-9)).toHaveLength(1);
    expect(lineCircle([0, 1], [1, 0], [0, 0], 3)).toHaveLength(2);
  });
  it("finds the points of contact of the tangents from P, each ⟂ to its radius", () => {
    const P = [5, 0] as const;
    const pts = tangentPoints(P, [0, 0], 3);
    expect(pts).toHaveLength(2);
    for (const q of pts) {
      expect(dist(q, [0, 0])).toBeCloseTo(3, 9);
      expect(dot(sub(q, [0, 0]), sub(P, q))).toBeCloseTo(0, 9);
      expect(dist(P, q)).toBeCloseTo(4, 9);
    }
  });
  it("meets two circles", () => {
    const pts = circleCircle([0, 0], 5, [6, 0], 5);
    expect(pts).toHaveLength(2);
    for (const p of pts) expect(p[0]).toBeCloseTo(3, 9);
  });
});

describe("lines and circles (NCERT 10.1–10.2)", () => {
  const base = lineAndCircle.defaults as LineCircleState;
  it("a sliding line misses, cuts or touches", () => {
    expect(kindOf({ ...base, offset: 4.5 })).toBe(LineKind.NonIntersecting);
    expect(kindOf({ ...base, offset: 1.5 })).toBe(LineKind.Secant);
    expect(kindOf({ ...base, offset: 3 })).toBe(LineKind.Tangent);
    expect(kindOf({ ...base, offset: -3 })).toBe(LineKind.Tangent);
  });
  it("signals when the line becomes a tangent", () => {
    let s: LineCircleState = { ...base, offset: 4.5 };
    s = run(lc, s, LineCircleAction.Move, { by: -1 }).state;
    const r = run(lc, s, LineCircleAction.Move, { by: -1 });
    expect(r.state.offset).toBe(3);
    expect(signals(r.emit)).toContain(LineCircleSignal.Touched);
  });
  it("a line turning about P is the tangent only at turn 0", () => {
    const rot = { ...base, mode: LineCircleMode.Rotate };
    expect(kindOf({ ...rot, turn: 0 })).toBe(LineKind.Tangent);
    expect(kindOf({ ...rot, turn: 30 })).toBe(LineKind.Secant);
  });
  it("Theorem 10.1: OQ > OP for every other Q on the tangent", () => {
    const sh = { ...base, mode: LineCircleMode.Shortest };
    expect(oqOf({ ...sh, along: 0 })).toBeCloseTo(3, 9);
    for (const along of [-4, -1, 0.5, 2, 5]) expect(oqOf({ ...sh, along })).toBeGreaterThan(3);
  });
});

describe("tangents from a point (NCERT 10.3, Theorem 10.2)", () => {
  const base = tangentsFromPoint.defaults as TangentsState;
  it("counts 0, 1 and 2 tangents", () => {
    expect(tangentCountOf({ ...base, d: 2 })).toBe(0);
    expect(placeOf({ ...base, d: 3 })).toBe(PointPlace.On);
    expect(tangentCountOf({ ...base, d: 3 })).toBe(1);
    expect(tangentCountOf({ ...base, d: 5 })).toBe(2);
  });
  it("the two tangents are equal and the angles add to 180°", () => {
    for (const d of [3.5, 5, 8, 12]) {
      const s = { ...base, d };
      const [q, r] = contactsOf(s);
      expect(dist([d, 0], q as never)).toBeCloseTo(dist([d, 0], r as never), 9);
      expect(lengthOf(s)).toBeCloseTo(Math.sqrt(d * d - 9), 9);
      expect((angleAtPOf(s) ?? 0) + (angleAtOOf(s) ?? 0)).toBeCloseTo(180, 6);
    }
  });
  it("Exercise 10.1 Q1-style: OQ = 25, PQ = 24 gives r = 7", () => {
    expect(lengthOf({ ...base, r: 7, d: 25 })).toBeCloseTo(24, 9);
  });
  it("signals when P moves outside", () => {
    const r = run(tg, { ...base, d: 3 }, TangentsAction.Move, { by: 1 });
    expect(signals(r.emit)).toContain(TangentsSignal.Outside);
  });
  it("snaps a drag of P to the step, within 0 to 4r, and only when P can move", () => {
    const s = { ...base, d: 1, step: 1, canMove: true };
    expect(run(tg, s, TangentsAction.SetDistance, { d: 4.4, isSnapped: true }).state.d).toBe(4);
    expect(run(tg, s, TangentsAction.SetDistance, { d: 40, isSnapped: true }).state.d).toBe(12);
    expect(
      run(tg, { ...s, canMove: false }, TangentsAction.SetDistance, { d: 4, isSnapped: true }).state
        .d,
    ).toBe(1);
    expect(run(tg, s, TangentsAction.SetDistance, { d: 4.4 }).state.d).toBe(4.4);
  });
});

describe("constructions (NCERT 11, Ex 10/11)", () => {
  const base = construction.defaults as ConstructionState;
  it("divides 7.6 cm in 5 : 8 (Ex 11.1 Q1)", () => {
    const s = { ...base, length: 7.6, m: 5, n: 8 };
    const r = resultOf(s);
    expect(r.ac).toBeCloseTo(7.6 * (5 / 13), 9);
    expect((r.ac ?? 0) / (r.cb ?? 1)).toBeCloseTo(5 / 8, 9);
    expect(resultOf({ ...s, kind: ConstructionKind.DivideAlt }).ac).toBeCloseTo(r.ac ?? 0, 9);
  });
  it("the parallel through A_m really lands at AC = m/(m+n)·AB", () => {
    // The step draws A_m C parallel to A_(m+n) B: check that C, from the items, is where it should be.
    const s = { ...base, length: 7.6, m: 3, n: 2 };
    const steps = stepsOf(s);
    const seg = steps[4]?.items.find((it) => it.k === "seg" && it.tone === "result");
    const join = steps[3]?.items[0];
    if (seg?.k !== "seg" || join?.k !== "seg") throw new Error("missing lines");
    const u = sub(seg.to, seg.from);
    const v = sub(join.to, join.from);
    expect(u[0] * v[1] - u[1] * v[0]).toBeCloseTo(0, 9);
    expect(seg.to[0]).toBeCloseTo(7.6 * 0.6, 9);
    expect(seg.to[1]).toBeCloseTo(0, 9);
  });
  it("makes similar triangles with scale 3/4 and 5/3 (Examples 1 and 2)", () => {
    for (const [m, n] of [
      [3, 4],
      [5, 3],
    ] as const) {
      const s = { ...base, kind: ConstructionKind.Similar, m, n, ab: 5, bc: 6, ca: 7 };
      const { A, B, C, A2, C2 } = similarPoints(s);
      expect(dist(A2, B) / dist(A, B)).toBeCloseTo(m / n, 9);
      expect(dist(C2, B) / dist(C, B)).toBeCloseTo(m / n, 9);
      expect(dist(A2, C2) / dist(A, C)).toBeCloseTo(m / n, 9);
      expect(stepCountOf(s)).toBe(7);
    }
  });
  it("the tangents from P touch the circle with OQ ⟂ PQ (Construction 11.3)", () => {
    const s = { ...base, kind: ConstructionKind.TangentsFromPoint, r: 6, d: 10 };
    const { O, P, Q, R } = tangentsFromPointPoints(s);
    for (const X of [Q, R]) {
      expect(dist(O, X)).toBeCloseTo(6, 9);
      expect(dot(sub(X, O), sub(P, X))).toBeCloseTo(0, 9);
      expect(dist(P, X)).toBeCloseTo(8, 9);
    }
  });
  it("tangents inclined at the given angle (Ex 11.2 Q4)", () => {
    for (const angle of [60, 45, 90, 120]) {
      const s = { ...base, kind: ConstructionKind.TangentsAtAngle, r: 5, angle };
      const { O, A, B, P } = tangentsAtAnglePoints(s);
      expect(angleAt(P, A, B)).toBeCloseTo(angle, 6);
      expect(dot(sub(A, O), sub(P, A))).toBeCloseTo(0, 6);
      expect(dot(sub(B, O), sub(P, B))).toBeCloseTo(0, 6);
      expect(resultOf(s).angle).toBeCloseTo(angle, 6);
    }
  });
  it("steps forward and signals done on the last step", () => {
    let s: ConstructionState = { ...base, kind: ConstructionKind.TangentsFromPoint };
    const n = stepCountOf(s);
    let last: string[] = [];
    for (let i = 0; i < n - 1; i++) {
      const r = run(cons, s, ConstructionAction.Next);
      s = r.state;
      last = signals(r.emit);
    }
    expect(s.step).toBe(n - 1);
    expect(last).toContain(ConstructionSignal.Done);
    expect(run(cons, s, ConstructionAction.Next).emit).toHaveLength(0);
    expect(run(cons, s, ConstructionAction.Reset).state.step).toBe(0);
  });
  it("every step of every construction has words in both languages", () => {
    for (const kind of Object.values(ConstructionKind))
      for (const st of stepsOf({
        ...base,
        kind,
        ...(kind === ConstructionKind.Similar ? { m: 3, n: 4 } : {}),
      })) {
        expect(st.caption.en.length).toBeGreaterThan(5);
        expect(st.caption.hi).toMatch(/[ऀ-ॿ]/);
      }
  });
});

describe("areas related to circles (NCERT 12)", () => {
  it("circumference and area with π = 22/7 (Example 1: r = 35 m)", () => {
    const s = { ...(circleArea.defaults as CircleAreaState), r: 35 };
    expect(circumferenceOf(s)).toBeCloseTo(220, 9);
    expect(areaOf(s)).toBeCloseTo(3850, 9);
  });
  it("the slices tile a strip πr long and r high", () => {
    const s = { ...(circleArea.defaults as CircleAreaState), r: 7, slices: 16, isArranged: true };
    const xs = Array.from({ length: 16 }, (_, i) => sliceOf(s, i).apex[0]);
    const arc = (2 * Math.PI * 7) / 16;
    expect(Math.min(...xs)).toBeCloseTo(-Math.PI * 3.5 + arc / 2, 9);
    expect(Math.max(...xs)).toBeCloseTo(Math.PI * 3.5, 9);
  });
  it("rolls a full turn and arranges, with signals", () => {
    let s = { ...(circleArea.defaults as CircleAreaState), mode: CircleAreaMode.Roll };
    let last: string[] = [];
    for (let i = 0; i < 8; i++) {
      const r = run(area, s, CircleAreaAction.Roll, { by: 1 });
      s = r.state;
      last = signals(r.emit);
    }
    expect(last).toContain(CircleAreaSignal.Rolled);
    expect(signals(run(area, s, CircleAreaAction.Arrange).emit)).toContain(
      CircleAreaSignal.Arranged,
    );
  });
  it("sector and segment (Examples 2 and 3)", () => {
    const ex2 = {
      ...(sectorSegment.defaults as SectorState),
      r: 4,
      theta: 30,
      pi: PiValue.Decimal,
    };
    expect(sectorAreaOf(ex2)).toBeCloseTo(12.56 / 3, 9);
    expect(majorSectorAreaOf(ex2)).toBeCloseTo(3.14 * 16 - 12.56 / 3, 9);
    const ex3 = { ...(sectorSegment.defaults as SectorState), r: 21, theta: 120 };
    expect(sectorAreaOf(ex3)).toBeCloseTo(462, 9);
    expect(triangleAreaOf(ex3)).toBeCloseTo((441 / 4) * Math.sqrt(3), 9);
    expect(segmentAreaOf(ex3)).toBeCloseTo((21 / 4) * (88 - 21 * Math.sqrt(3)), 9);
  });
  it("turns θ in steps and snaps a drag", () => {
    const s = sectorSegment.defaults as SectorState;
    expect(run(sec, s, SectorAction.Turn, { by: 1 }).state.theta).toBe(135);
    expect(run(sec, s, SectorAction.SetAngle, { theta: 61, isSnapped: true }).state.theta).toBe(60);
    expect(segmentAreaOf({ ...s, theta: 360 })).toBeCloseTo((22 / 7) * 441, 9);
  });
  it("combined figures give the book's answers (Examples 4–6)", () => {
    expect(totalOf({ kind: CombinedKind.LawnBeds })).toBe(4032);
    expect(totalOf({ kind: CombinedKind.FourCircles })).toBe(42);
    expect(totalOf({ kind: CombinedKind.Petals })).toBe(57);
  });
  it("steps through a combined figure to its total", () => {
    let s: CombinedState = { kind: CombinedKind.Petals, step: 0, canStep: true };
    let last: string[] = [];
    for (let i = 0; i < 4; i++) {
      const r = run(comb, s, CombinedAction.Next);
      s = r.state;
      last = signals(r.emit);
    }
    expect(last).toContain(CombinedSignal.Done);
  });
  it("taps a figure through its steps, and rejects a figure naming a missing point", () => {
    const fig = asAnyProp(geoFigure);
    let s: FigureState = {
      ...(geoFigure.defaults as FigureState),
      captions: [
        { en: "one", hi: "एक" },
        { en: "two", hi: "दो" },
      ],
    };
    const r = run(fig, s, FigureAction.Next);
    s = r.state as FigureState;
    expect(s.step).toBe(1);
    expect(signals(r.emit)).toContain(FigureSignal.Done);
    expect(run(fig, s, FigureAction.Next).state.step).toBe(1);
    expect(run(fig, s, FigureAction.Back).state.step).toBe(0);
    expect(geoFigure.invariant?.({ ...s, items: [{ kind: "seg", a: "A", b: "Z" }] })).toContain(
      "Z",
    );
  });
});

describe("the geometry kit", () => {
  it("places labels without overlapping each other", () => {
    const placed = placeLabels(
      [
        { id: "a", at: [100, 100], text: "A" },
        { id: "b", at: [104, 100], text: "B" },
        { id: "c", at: [100, 104], text: "C" },
        { id: "d", at: [102, 102], text: "12.5 cm" },
      ],
      { width: 300, height: 200 },
      {
        segments: [
          [
            [0, 100],
            [300, 100],
          ],
        ],
      },
    );
    for (let i = 0; i < placed.length; i++)
      for (let j = i + 1; j < placed.length; j++) {
        const p = placed[i] as (typeof placed)[number];
        const q = placed[j] as (typeof placed)[number];
        const overlaps =
          p.x < q.x + q.width &&
          q.x < p.x + p.width &&
          p.y < q.y + q.height &&
          q.y < p.y + p.height;
        expect(overlaps).toBe(false);
      }
  });
  it("draws arcs both ways round", () => {
    const id = (p: readonly [number, number]) => [p[0], -p[1]] as [number, number];
    expect(pathD([{ k: "A", c: [0, 0], r: 1, from: 0, to: 90 }], id, 10)).toMatch(
      /A10\.0 10\.0 0 0 0/,
    );
    expect(pathD([{ k: "A", c: [0, 0], r: 1, from: 90, to: 0, cw: true }], id, 10)).toMatch(
      /A10\.0 10\.0 0 0 1/,
    );
  });
});

describe("the package", () => {
  it("defs match the props, with describe() and actions that emit from run", () => {
    expect(defs.map((d) => d.type)).toEqual(circlesProps.map((m) => m.def.type));
    for (const d of defs) expect(d.describe.length).toBeGreaterThan(120);
  });
  const variants: Record<string, StoredState[]> = {
    lineCircle: [
      { ...(lineAndCircle.defaults as LineCircleState), offset: 3, showRadius: true },
      { ...(lineAndCircle.defaults as LineCircleState), offset: 1.5, showChord: true },
      { ...(lineAndCircle.defaults as LineCircleState), mode: LineCircleMode.Rotate, turn: 0 },
      { ...(lineAndCircle.defaults as LineCircleState), mode: LineCircleMode.Shortest },
    ],
    tangentsFromPoint: [
      { ...(tangentsFromPoint.defaults as TangentsState), d: 2 },
      { ...(tangentsFromPoint.defaults as TangentsState), d: 3 },
      {
        ...(tangentsFromPoint.defaults as TangentsState),
        d: 6,
        showAngles: true,
        showBisector: true,
      },
    ],
    construction: Object.values(ConstructionKind).flatMap((kind) => {
      const s = {
        ...(construction.defaults as ConstructionState),
        kind,
        ...(kind === ConstructionKind.Similar ? { m: 5, n: 3 } : {}),
      };
      return Array.from({ length: stepCountOf(s) }, (_, step) => ({ ...s, step }));
    }),
    circleArea: [
      { ...(circleArea.defaults as CircleAreaState), isArranged: true, slices: 16 },
      ...[0, 3, 8].map((rolled) => ({
        ...(circleArea.defaults as CircleAreaState),
        mode: CircleAreaMode.Roll,
        rolled,
      })),
    ],
    sectorSegment: [
      {
        ...(sectorSegment.defaults as SectorState),
        show: SectorShow.Segment,
        showMajor: true,
        showArc: true,
      },
      { ...(sectorSegment.defaults as SectorState), theta: 240, show: SectorShow.Segment },
      { ...(sectorSegment.defaults as SectorState), theta: 0 },
      { ...(sectorSegment.defaults as SectorState), theta: 360 },
    ],
    combinedFigures: Object.values(CombinedKind).flatMap((kind) =>
      Array.from({ length: 6 }, (_, step) => ({ kind, step, canStep: true })).filter(
        (s) =>
          s.step < (kind === CombinedKind.LawnBeds ? 7 : kind === CombinedKind.FourCircles ? 4 : 5),
      ),
    ),
    circlesScene: Object.values(CirclesSceneKind).map((scene) => ({ scene })),
    geoFigure: [0, 1, 2].map((step) => ({
      points: [
        { name: "A", at: [2, 4] },
        { name: "B", at: [0, 0] },
        { name: "C", at: [6, 0] },
        { name: "D", at: [1, 2], step: 1 },
        { name: "E", at: [4, 2], step: 1 },
        { name: "M", at: [2.5, 2.5], step: 2, isUnnamed: true },
      ],
      items: [
        { kind: "seg", a: "A", b: "B" },
        { kind: "seg", a: "B", b: "C" },
        { kind: "seg", a: "C", b: "A" },
        { kind: "seg", a: "D", b: "E", step: 1 },
        { kind: "parallel", a: "D", b: "E", step: 1 },
        { kind: "parallel", a: "B", b: "C", step: 1 },
        { kind: "seg", a: "B", b: "E", step: 2, dashed: true, tone: "construction" },
        { kind: "poly", pts: ["B", "D", "E"], step: 2 },
        { kind: "right", at: "B", p: "C", q: [0, 1] },
        { kind: "angle", at: "C", p: "B", q: "A", label: "30°" },
        { kind: "ticks", a: "A", b: "D", count: 2 },
        { kind: "circle", c: "A", r: 1, dashed: true, step: 2 },
        { kind: "arc", c: "B", r: 1, from: 0, to: 60 },
        {
          kind: "path",
          step: 2,
          cmds: [
            { k: "M", p: "C" },
            { k: "A", c: "C", r: 1, from: 90, to: 180 },
            { k: "L", p: "C" },
            { k: "Z" },
          ],
        },
        { kind: "note", at: [3, -0.4], text: "6 cm" },
      ],
      captions: [
        { en: "Triangle ABC.", hi: "त्रिभुज ABC।" },
        { en: "DE ∥ BC.", hi: "DE ∥ BC।" },
        { en: "Join BE.", hi: "BE को मिलाओ।" },
      ],
      step,
      canStep: true,
      height: 220,
      about: "Triangle ABC with DE parallel to BC.",
    })),
  };
  for (const m of circlesProps) {
    const View = m.View as ComponentType<PropViewProps>;
    it(`draws ${m.def.type} in English and Hindi at 300–420 px`, () => {
      for (const s of [m.def.defaults as StoredState, ...(variants[m.def.type] ?? [])])
        for (const locale of ["en", "hi"] as const)
          for (const width of [300, 340, 420]) {
            const html = renderToString(
              <View
                view={viewOf(m.def, s)}
                locale={locale}
                width={width}
                call={() => undefined}
                signal={() => undefined}
              />,
            );
            expect(html).not.toMatch(/NaN|undefined|Infinity/);
            expect(observationOf(m.def, s).summary.length).toBeGreaterThan(10);
          }
    });
  }
  it("the scene prop describes every picture", () => {
    const scene = asAnyProp(circlesScene);
    for (const k of Object.values(CirclesSceneKind))
      expect(observationOf(scene, { scene: k }).summary.length).toBeGreaterThan(40);
  });
});

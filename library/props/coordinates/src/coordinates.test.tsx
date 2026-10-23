import type { PropViewProps } from "@chalk/player";
import {
  type AnyPropDef,
  EffectKind,
  type StoredState,
  applyPatch,
  asAnyProp,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import type { ComponentType } from "preact";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { PlaneAction, type PlaneState, coordinatePlane, d2Of, workingOf } from "./coordinate-plane";
import { defs } from "./defs";
import { coordinatesProps } from "./index";
import {
  bracketOf,
  centroidOf,
  coordText,
  dist2,
  divide,
  isCollinear,
  midpointOf,
  ratioNear,
  sqrtText,
  triangleAreaOf,
} from "./plane";
import { CoordinatesSceneKind, coordinatesScene } from "./scene";
import {
  SectionAction,
  SectionSignal,
  type SectionState,
  pointOf,
  sectionDivider,
} from "./section-divider";
import { AreaAction, AreaSignal, type AreaState, areaOf, triangleArea } from "./triangle-area";

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

const plane = asAnyProp(coordinatePlane);
const sec = asAnyProp(sectionDivider);
const area = asAnyProp(triangleArea);

describe("distance formula (NCERT 7.2, Ex 7.1)", () => {
  it("matches the textbook's distances", () => {
    expect(dist2([4, 0], [6, 0])).toBe(4);
    expect(dist2([4, 0], [0, 3])).toBe(25);
    expect(dist2([6, 0], [0, 8])).toBe(100);
    expect(sqrtText(dist2([4, 6], [6, 8]))).toBe("2√2");
    expect(sqrtText(dist2([6, 4], [-5, -3]))).toBe("√170");
    expect(sqrtText(dist2([0, 0], [36, 15]))).toBe("39");
    expect(sqrtText(dist2([2, 3], [4, 1]))).toBe("2√2");
    expect(sqrtText(dist2([-5, 7], [-1, 3]))).toBe("4√2");
  });
  it("Example 1: a right triangle by the converse of Pythagoras", () => {
    const P: [number, number] = [3, 2];
    const Q: [number, number] = [-2, -3];
    const R: [number, number] = [2, 3];
    expect(dist2(P, Q) + dist2(P, R)).toBe(dist2(Q, R));
  });
  it("Example 3 and Ex 7.1 Q3: collinear by distances and by area", () => {
    expect(sqrtText(dist2([3, 1], [6, 4]))).toBe("3√2");
    expect(isCollinear([3, 1], [6, 4], [8, 6])).toBe(true);
    expect(isCollinear([1, 5], [2, 3], [-2, -11])).toBe(false);
  });
  it("Example 5: (0, 9) is equidistant from (6, 5) and (−4, 3)", () => {
    expect(dist2([0, 9], [6, 5])).toBe(dist2([0, 9], [-4, 3]));
  });
  it("writes surds in simplest form, halves too", () => {
    expect(sqrtText(25)).toBe("5");
    expect(sqrtText(68)).toBe("2√17");
    expect(sqrtText(15.25)).toBe("√61/2");
    expect(sqrtText(0)).toBe("0");
  });
  it("snaps a drag to the grid, only for a movable point, inside the window", () => {
    const s = coordinatePlane.defaults as PlaneState;
    const r = run(plane, s, PlaneAction.SetPoint, { i: 1, x: 7.2, y: 8.6, isSnapped: true });
    expect(r.state.points[1]).toMatchObject({ x: 7, y: 9 });
    expect(d2Of(r.state)).toBe(9 + 9);
    expect(
      run(plane, s, PlaneAction.SetPoint, { i: 0, x: 1, y: 1, isSnapped: true }).state,
    ).toEqual(s);
    expect(
      run(plane, s, PlaneAction.SetPoint, { i: 1, x: 40, y: 40, isSnapped: true }).state.points[1],
    ).toMatchObject({ x: 10, y: 10 });
    const n = run(plane, s, PlaneAction.Nudge, { i: 1, dx: -1, dy: 1 });
    expect(n.state.points[1]).toMatchObject({ x: 5, y: 9 });
    expect(signals(n.emit)).toContain("changed");
  });
  it("works the formula out with brackets for negatives", () => {
    const s = {
      ...(coordinatePlane.defaults as PlaneState),
      points: [
        { name: "P", x: 6, y: 4 },
        { name: "Q", x: -5, y: -3 },
      ],
    };
    const w = workingOf(s);
    expect(w[0]).toContain("(-5 - 6)^2");
    expect(w[1]).toContain("= 170");
    expect(w[2]).toBe("PQ = \\sqrt{170}");
  });
  it("steps through the derivation and stops at the ends", () => {
    let s: PlaneState = { ...(coordinatePlane.defaults as PlaneState), proof: true };
    for (let i = 0; i < 6; i++) s = run(plane, s, PlaneAction.Next).state;
    expect(s.step).toBe(4);
    s = run(plane, s, PlaneAction.Again).state;
    expect(s.step).toBe(0);
  });
});

describe("section formula (NCERT 7.3, Ex 7.2)", () => {
  it("the relay tower and the examples", () => {
    expect(divide([0, 0], [36, 15], 1, 2)).toEqual([12, 5]);
    expect(divide([4, -3], [8, 5], 3, 1)).toEqual([7, 3]);
    expect(divide([-6, 10], [3, -8], 2, 7)).toEqual([-4, 6]);
    expect(divide([2, -2], [-7, 4], 1, 2)).toEqual([-1, 0]);
    expect(divide([2, -2], [-7, 4], 2, 1)).toEqual([-4, 2]);
    expect(coordText(divide([5, -6], [-1, -4], 5, 1)[1])).toBe("−13/3");
    expect(divide([-1, 7], [4, -3], 2, 3)).toEqual([1, 3]);
    expect(midpointOf([2, 25], [8, 20])).toEqual([5, 22.5]);
    expect(divide([-2, -2], [2, -4], 3, 4).map(coordText)).toEqual(["−2/7", "−20/7"]);
  });
  it("a drag along AB settles on the nearest simple ratio", () => {
    expect(ratioNear(1 / 3, 8)).toEqual([1, 2]);
    expect(ratioNear(0.5, 8)).toEqual([1, 1]);
    expect(ratioNear(0.74, 8)).toEqual([3, 1]);
    expect(ratioNear(0.22, 9)).toEqual([2, 7]);
  });
  it("signals the mid-point and stops at 1", () => {
    const s = sectionDivider.defaults as SectionState;
    const r = run(sec, s, SectionAction.SetAlong, { t: 0.49 });
    expect([r.state.m, r.state.n]).toEqual([1, 1]);
    expect(signals(r.emit)).toContain(SectionSignal.Midpoint);
    expect(pointOf(r.state)).toEqual([18, 7.5]);
    expect(run(sec, r.state, SectionAction.NudgeM, { by: -1 }).state.m).toBe(1);
    expect(run(sec, r.state, SectionAction.NudgeN, { by: 1 }).state.n).toBe(2);
  });
  it("moves an end only when the ends are movable", () => {
    const s = sectionDivider.defaults as SectionState;
    expect(run(sec, s, SectionAction.SetEnd, { end: "b", x: 30, y: 12 }).state.b).toEqual([36, 15]);
    const m = run(sec, { ...s, canMove: true }, SectionAction.SetEnd, {
      end: "b",
      x: 29.6,
      y: 12.2,
    });
    expect(m.state.b).toEqual([30, 12]);
  });
});

describe("area of a triangle (NCERT 7.4, Ex 7.3)", () => {
  it("matches the textbook's examples", () => {
    expect(triangleAreaOf([1, -1], [-4, 6], [-3, -5])).toBe(24);
    expect(bracketOf([5, 2], [4, 7], [7, -4])).toBe(-4);
    expect(triangleAreaOf([5, 2], [4, 7], [7, -4])).toBe(2);
    expect(triangleAreaOf([-1.5, 3], [6, -2], [-3, 4])).toBe(0);
    expect(isCollinear([2, 3], [4, 0], [6, -3])).toBe(true);
    expect(
      triangleAreaOf([-5, 7], [-4, -5], [4, 5]) + triangleAreaOf([-4, -5], [-1, -6], [4, 5]),
    ).toBe(72);
    expect(triangleAreaOf([2, 3], [-1, 0], [2, -4])).toBe(10.5);
    expect(triangleAreaOf([-5, -1], [3, -5], [5, 2])).toBe(32);
  });
  it("the mission's herb patch is 16 m² and the centroid is the average", () => {
    expect(triangleAreaOf([2, 1], [8, 3], [4, 7])).toBe(16);
    expect(centroidOf([4, 2], [6, 5], [1, 4]).map(coordText)).toEqual(["11/3", "11/3"]);
  });
  it("signals when a dragged vertex makes the points collinear", () => {
    const s: AreaState = {
      ...(triangleArea.defaults as AreaState),
      points: [
        { name: "A", x: 3, y: 3 },
        { name: "B", x: 1, y: 1 },
        { name: "C", x: 5, y: 3 },
      ],
    };
    const r = run(area, s, AreaAction.SetPoint, { i: 0, x: 3.1, y: 1.9, isSnapped: true });
    expect(areaOf(r.state)).toBe(0);
    expect(signals(r.emit)).toContain(AreaSignal.Collinear);
    const moved = run(area, r.state, AreaAction.Nudge, { i: 0, dx: 0, dy: 1 });
    expect(areaOf(moved.state)).toBe(2);
  });
  it("won't put two vertices on one spot", () => {
    const s = triangleArea.defaults as AreaState;
    const r = run(area, s, AreaAction.SetPoint, { i: 0, x: 2, y: 1, isSnapped: true });
    expect(r.state).toEqual(s);
  });
});

describe("the package", () => {
  it("lists every prop in defs and as a module, each with a describe", () => {
    expect(defs.map((d) => d.type).sort()).toEqual(coordinatesProps.map((p) => p.def.type).sort());
    for (const d of defs) expect(d.describe.length).toBeGreaterThan(40);
  });
  it("renders every prop and scene at phone widths", () => {
    for (const mod of coordinatesProps) {
      const View = mod.View as ComponentType<PropViewProps>;
      const states =
        mod.def.type === coordinatesScene.type
          ? Object.values(CoordinatesSceneKind).map((scene) => ({ scene }))
          : [mod.def.defaults, { ...(mod.def.defaults as object), proof: true, step: 2 }];
      for (const state of states)
        for (const width of [300, 420])
          for (const locale of ["en", "hi"] as const) {
            if (mod.def.type === sectionDivider.type && "proof" in state) continue;
            const html = renderToString(
              <View
                view={viewOf(mod.def, state as StoredState)}
                width={width}
                locale={locale}
                call={() => undefined}
                signal={() => undefined}
              />,
            );
            expect(html).toContain("<svg");
          }
    }
  });
});

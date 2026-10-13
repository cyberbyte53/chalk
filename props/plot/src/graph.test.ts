import { EffectKind, applyPatch, asAnyProp, prepareAction, viewOf } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { type GraphState, MAX_POINTS, graph } from "./graph";

const def = asAnyProp(graph);

function add(state: GraphState, x: number, y: number): GraphState {
  const result = prepareAction(def, state, "addPoint", { x, y });
  if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("addPoint failed");
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return next.state as GraphState;
}

describe("graph", () => {
  it("adds points and grows the x axis to fit them", () => {
    const after = add(add(graph.defaults, 1, 0.2), 25, 0.6);
    expect(viewOf(def, after).count).toBe(2);
    expect(viewOf(def, after).lastY).toBe(0.6);
    expect(after.xMax).toBe(25);
  });

  it("keeps state small: only the newest points", () => {
    let state = graph.defaults;
    for (let i = 1; i <= MAX_POINTS + 5; i++) state = add(state, i, 0.5);
    expect(state.points.length).toBe(MAX_POINTS);
    expect(state.points[0]?.[0]).toBe(6);
  });

  it("refuses an upside-down y axis", () => {
    expect(applyPatch(def, graph.defaults, { yMax: -1 }).isOk).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  FrameKind,
  childrenFor,
  compositeOf,
  defineComposite,
  defineHost,
  defineLayer,
} from "./compose";
import { actionsFor, defineProp, set } from "./define";
import { observationOf } from "./state";

type Axis = { from: number; to: number };
const axis = defineLayer({
  name: "axis",
  frame: FrameKind.Axis,
  describe: "the window",
  fields: { from: z.number(), to: z.number() },
  defaults: { from: 0, to: 10 },
  actions: {},
  observe: (s: Axis) => ({ summary: `${s.from} to ${s.to}`, elements: [{ id: "axis" }] }),
});
type Dot = Axis & { dot: number | null };
const onDot = actionsFor<Dot>();
const dot = defineLayer({
  name: "dot",
  frame: FrameKind.Axis,
  describe: "a dot",
  fields: { dot: z.number().nullable() },
  defaults: { dot: null },
  actions: {
    put: onDot({
      describe: "",
      args: z.object({ at: z.number() }).strict(),
      changes: ["dot"],
      run: (_s, a) => set({ dot: a.at }),
    }),
  },
  observe: (s: Dot) =>
    s.dot === null ? { elements: [] } : { elements: [{ id: "dot", value: s.dot }] },
});
type Fixed = Axis & { isFixed: boolean };
const fixed = defineLayer({
  name: "fixed",
  frame: FrameKind.Axis,
  describe: "whole numbers only",
  fields: { isFixed: z.boolean() },
  defaults: { isFixed: false },
  excludes: { dot: "a fixed scale has no free points" },
  actions: {},
  observe: (s: Fixed) => (s.isFixed ? { elements: [{ id: "fixed" }] } : { elements: [] }),
});

const host = defineHost({
  type: "testLine",
  describe: "a test line",
  frame: FrameKind.Axis,
  core: axis,
  layers: [dot, fixed],
  window: (s) => ({ from: s.from, to: s.to }),
  pixels: (s, width) => ({ from: s.from, to: s.to, width, y: 0, toX: (v) => v }),
});

describe("hosts and layers", () => {
  it("puts every layer's fields side by side, and describes only the layers showing something", () => {
    expect(host.defaults).toEqual({ from: 0, to: 10, dot: null, isFixed: false });
    expect(observationOf(host as never, host.defaults).elements.map((e) => e.id)).toEqual(["axis"]);
    const withDot = { ...host.defaults, dot: 3 };
    expect(observationOf(host as never, withDot).elements.map((e) => e.id)).toEqual([
      "axis",
      "dot",
    ]);
    expect(host.host.layersOn(withDot)).toEqual(["dot"]);
    expect(host.host.ownerOf("put")).toBe("dot");
    expect(host.host.ownerOf("from")).toBeUndefined();
  });

  it("refuses two parts claiming one field, and a layer needing one that isn't there", () => {
    const twin = defineLayer({ ...dot, name: "twin" });
    expect(() => defineHost({ ...hostSpec(), layers: [dot, twin] })).toThrow(/field "dot"/);
    const needy = defineLayer({
      ...fixed,
      name: "needy",
      fields: { other: z.boolean() },
      defaults: { other: false },
      needs: ["ghost"],
    });
    expect(() => defineHost({ ...hostSpec(), layers: [needy] })).toThrow(/needs layer ghost/);
  });

  it("finds layers that exclude each other on together, from the state or the actions a board uses", () => {
    expect(host.host.clashes({ ...host.defaults, isFixed: true })).toEqual([]);
    expect(host.host.clashes({ ...host.defaults, isFixed: true, dot: 2 })[0]).toMatch(
      /fixed and dot can't be on together/,
    );
    expect(host.host.clashes({ ...host.defaults, isFixed: true }, ["put"])).toHaveLength(1);
  });
});

function hostSpec() {
  return {
    type: "t",
    describe: "",
    frame: FrameKind.Axis,
    core: axis,
    window: (s: Axis) => ({ from: s.from, to: s.to }),
    pixels: (s: Axis, width: number) => ({
      from: s.from,
      to: s.to,
      width,
      y: 0,
      toX: (v: number) => v,
    }),
  } as const;
}

describe("composites", () => {
  const counter = defineProp({
    type: "counter",
    describe: "",
    state: z.object({ n: z.number() }).strict(),
    defaults: { n: 0 },
    actions: {
      bump: actionsFor<{ n: number }>()({
        describe: "",
        byLearner: true,
        args: z.object({}).strict(),
        changes: ["n"],
        run: (s) => set({ n: s.n + 1 }),
      }),
    },
    observe: (s) => ({
      summary: "",
      elements: [
        { id: "n", value: s.n },
        { id: "plus", does: "bump" },
      ],
    }),
  });
  type P = { total: number };
  const kid = childrenFor<P>();
  const pair = defineComposite({
    type: "pair",
    describe: "two counters showing one total",
    state: z.object({ total: z.number() }).strict(),
    defaults: { total: 5 },
    actions: {
      add: actionsFor<P>()({
        describe: "",
        byLearner: true,
        args: z.object({}).strict(),
        changes: ["total"],
        run: (s) => set({ total: s.total + 1 }),
      }),
    },
    children: {
      left: kid(counter, (s) => ({ n: s.total }), { bump: () => ["add", {}] }),
      right: kid(counter, (s) => ({ n: s.total * 2 })),
    },
    order: ["left", "right"],
    summary: (s) => `total ${s.total}`,
  });

  it("draws each child from the parent's one state, under the child's name", () => {
    const seen = observationOf(pair as never, { total: 5 });
    expect(seen.summary).toBe("total 5");
    expect(seen.elements).toEqual([
      { id: "left › n", value: 5 },
      { id: "left › plus", does: "left › bump" },
      { id: "right › n", value: 10 },
      // Not routed: the right child's button does nothing here.
      { id: "right › plus" },
    ]);
  });

  it("routes what the learner does to a child to the parent's action, or nowhere", () => {
    const layout = compositeOf(pair as never);
    expect(layout?.route({ total: 5 }, "left", "bump", {})).toEqual(["add", {}]);
    expect(layout?.route({ total: 5 }, "right", "bump", {})).toBeUndefined();
  });

  it("refuses a child state its schema rejects", () => {
    const bad = defineComposite({
      ...pair,
      type: "bad",
      children: { left: kid(counter, () => ({ n: "x" as never })) },
      order: ["left"],
      summary: () => "",
    });
    expect(() => observationOf(bad as never, { total: 1 })).toThrow(/bad › left/);
  });
});

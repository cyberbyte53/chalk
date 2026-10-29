import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineHost, isLayerOn, layersFor, onWhen } from "./compose";
import { type FrameSpec, PropRole, actionsFor, nameOf, set } from "./define";

type Axis = { from: number; to: number };
const axis = layersFor<Axis>()({
  name: "axis",
  frame: "axis",
  describe: "the window",
  fields: { from: z.number(), to: z.number() },
  defaults: { from: 0, to: 10 },
});
type Dot = Axis & { dot: number | null };
const onDot = actionsFor<Dot>();
const dot = layersFor<Dot>()({
  name: "dot",
  frame: "axis",
  describe: "a dot",
  fields: { dot: z.number().nullable() },
  defaults: { dot: null },
  on: onWhen(["dot"], (s) => s.dot !== null),
  actions: {
    put: onDot({
      describe: "Put the dot",
      args: z.object({ at: z.number() }).strict(),
      changes: ["dot"],
      run: (_s, a) => set({ dot: a.at }),
    }),
  },
});
type Fixed = Axis & { isFixed: boolean };
const fixed = layersFor<Fixed>()({
  name: "fixed",
  frame: "axis",
  describe: "whole numbers only",
  fields: { isFixed: z.boolean() },
  defaults: { isFixed: false },
  offScreen: ["isFixed"],
  excludes: { dot: "a fixed scale has no free points" },
  on: onWhen(["isFixed"], (s) => s.isFixed),
});

const frame: FrameSpec<Axis> = {
  kind: "axis",
  pixels: (s, width) => ({
    width,
    height: 40,
    toPx: (x) => [((x - s.from) / (s.to - s.from)) * width, 20],
    fromPx: (px) => [s.from + (px / width) * (s.to - s.from), 0],
  }),
};

const host = defineHost({
  type: "testLine",
  role: PropRole.Explainer,
  describe: "a test line",
  frame,
  core: axis,
  layers: [dot, fixed],
});

describe("hosts and layers", () => {
  it("puts every layer's fields side by side, names its actions, and knows which layers are on", () => {
    expect(host.defaults).toEqual({ from: 0, to: 10, dot: null, isFixed: false });
    expect(nameOf(host.actions.put)).toBe("put");
    expect(host.host.layersOn(host.defaults)).toEqual([]);
    expect(host.host.layersOn({ ...host.defaults, dot: 3 })).toEqual(["dot"]);
    expect(host.host.ownerOf("put")).toBe("dot");
    expect(host.host.ownerOf("from")).toBeUndefined();
    expect(host.frame?.kind).toBe("axis");
    expect(host.offScreen).toEqual(["isFixed"]);
  });

  it("refuses two parts claiming one field, a layer on another frame, and one needing a missing layer", () => {
    const spec = { type: "t", describe: "", role: PropRole.Explainer, frame, core: axis } as const;
    const twin = { ...dot, name: "twin" };
    expect(() => defineHost({ ...spec, layers: [dot, twin] })).toThrow(/field "dot"/);
    const flat = { ...fixed, name: "flat", frame: "plane" as const };
    expect(() => defineHost({ ...spec, layers: [flat] })).toThrow(/draws on plane/);
    const needy = {
      ...fixed,
      name: "needy",
      fields: { other: z.boolean() },
      defaults: { other: false },
      needs: ["ghost"],
    };
    expect(() => defineHost({ ...spec, layers: [needy] })).toThrow(/needs layer ghost/);
  });

  it("finds layers that exclude each other on together, from the state or the actions a board uses", () => {
    expect(host.host.clashes({ ...host.defaults, isFixed: true })).toEqual([]);
    expect(host.host.clashes({ ...host.defaults, isFixed: true, dot: 2 })[0]).toMatch(
      /fixed and dot can't be on together/,
    );
    expect(host.host.clashes({ ...host.defaults, isFixed: true }, ["put"])).toHaveLength(1);
  });
});

describe("a layer's on-rule", () => {
  it("is given only the fields it names, so what it reads is known", () => {
    // A rule reading a field it didn't name doesn't compile, and at run time the field isn't there.
    // @ts-expect-error: `from` is not named
    const sly = onWhen<Dot, "dot">(["dot"], (s) => s.dot !== null || s.from === 0);
    expect(sly.is({ from: 0, to: 10, dot: null })).toBe(false);
    expect(isLayerOn(dot, { from: 0, to: 10, dot: 3 })).toBe(true);
  });
});

import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type Dims, Pi, Solid, clean, formulasOf, measuresOf, piValue, withUnit } from "./solids";

/**
 * One basic solid (the Class IX recap the chapter is built on): drawn from a little above with its
 * measurements labelled (r, h, l, …), or opened out flat into its net, so the curved surface is seen
 * as the rectangle (cylinder), sector (cone) or ring piece (frustum) it really is. The learner can
 * turn the picture, open and close the net, and change the measurements; the curved and total
 * surface areas and the volume follow.
 */

export const ViewerAction = {
  Unfold: "unfold",
  Turn: "turn",
  Nudge: "nudge",
  Pick: "pick",
  SetSolid: "setSolid",
  SetDims: "setDims",
} as const;
export const ViewerSignal = {
  Unfolded: "unfolded",
  Turned: "turned",
  Changed: "changed",
  Picked: "picked",
} as const;
export const ViewerDerived = {
  Curved: "curved",
  Total: "total",
  Volume: "volume",
  Slant: "slant",
} as const;
export const ViewerPart = {
  Picture: "picture",
  Net: "net",
  Formulas: "formulas",
  Unfold: "unfold",
  Turn: "turn",
  Steppers: "steppers",
  Measures: "measures",
} as const;

/** Which measure is lit up: none, the curved (lateral) surface, the total surface, or the volume. */
export const Measure = {
  None: "none",
  Curved: "curved",
  Total: "total",
  Volume: "volume",
} as const;
export type Measure = (typeof Measure)[keyof typeof Measure];

/** The measurement names a learner can step, per solid. */
export const DIM_NAMES: Record<Solid, readonly (keyof Dims)[]> = {
  [Solid.Cuboid]: ["l", "b", "h"],
  [Solid.Cube]: ["a"],
  [Solid.Cylinder]: ["r", "h"],
  [Solid.Cone]: ["r", "h"],
  [Solid.Sphere]: ["r"],
  [Solid.Hemisphere]: ["r"],
  [Solid.Frustum]: ["r1", "r2", "h"],
};

/** How many turn positions the picture has. */
export const TURNS = 4;

const dimsSchema = z
  .object({
    l: z.number().positive().max(1e6),
    b: z.number().positive().max(1e6),
    h: z.number().positive().max(1e6),
    a: z.number().positive().max(1e6),
    r: z.number().positive().max(1e6),
    r1: z.number().positive().max(1e6),
    r2: z.number().positive().max(1e6),
  })
  .strict();

const viewerState = z
  .object({
    solid: z.nativeEnum(Solid),
    dims: dimsSchema,
    /** The unit of every measurement ("cm", "m", "mm"). */
    unit: z.string().max(4),
    pi: z.nativeEnum(Pi),
    /** The flat net instead of the solid. */
    isNet: z.boolean(),
    /** Which of the TURNS views (tilt and, for boxes, turn about the axis). */
    turn: z
      .number()
      .int()
      .min(0)
      .max(TURNS - 1),
    /** The measure lit up and worked out under the picture. */
    measure: z.nativeEnum(Measure),
    /** The measures the learner can pick between (empty: no buttons). */
    measures: z.array(z.nativeEnum(Measure)).max(4),
    showDims: z.boolean(),
    /** The formulas, with the numbers put in. */
    showFormula: z.boolean(),
    canUnfold: z.boolean(),
    canTurn: z.boolean(),
    canSetDims: z.boolean(),
    /** How much one press of a stepper changes a measurement. */
    dimStep: z.number().positive().max(1000),
  })
  .strict();
export type ViewerState = z.infer<typeof viewerState>;

export function measuresOfState(s: Pick<ViewerState, "solid" | "dims" | "pi">) {
  return measuresOf(s.solid, s.dims, piValue(s.pi));
}

/** The tilt (degrees) and box yaw (degrees) of a turn position. */
export function turnAngles(turn: number): { tilt: number; yaw: number } {
  return [
    { tilt: 20, yaw: 25 },
    { tilt: 28, yaw: -25 },
    { tilt: 14, yaw: 40 },
    { tilt: 24, yaw: -40 },
  ][turn] as { tilt: number; yaw: number };
}

function checkDims(s: Pick<ViewerState, "solid" | "dims">): string | undefined {
  if (s.solid === Solid.Frustum && s.dims.r2 >= s.dims.r1)
    return "a frustum needs r1 (the larger end) bigger than r2";
  return undefined;
}

function changed(s: ViewerState): Emit {
  const m = measuresOfState(s);
  return {
    signal: ViewerSignal.Changed,
    payload: {
      dims: s.dims,
      curved: clean(m.curved),
      total: clean(m.total),
      volume: clean(m.volume),
    },
  };
}

/** The measurement values for reading, e.g. "r = 3.5 cm, h = 12 cm". */
export function dimsText(s: Pick<ViewerState, "solid" | "dims" | "unit">): string {
  return DIM_NAMES[s.solid].map((k) => `${k} = ${withUnit(s.dims[k], s.unit)}`).join(", ");
}

const NAMES: Record<Solid, string> = {
  [Solid.Cuboid]: "cuboid",
  [Solid.Cube]: "cube",
  [Solid.Cylinder]: "cylinder",
  [Solid.Cone]: "cone",
  [Solid.Sphere]: "sphere",
  [Solid.Hemisphere]: "hemisphere",
  [Solid.Frustum]: "frustum of a cone",
};

const NETS: Record<Solid, string> = {
  [Solid.Cuboid]: "six rectangles in a cross",
  [Solid.Cube]: "six equal squares in a cross",
  [Solid.Cylinder]: "a rectangle 2πr long and h high, with a circle at each end",
  [Solid.Cone]: "a sector of a circle of radius l whose arc is 2πr long, with the base circle",
  [Solid.Sphere]: "no flat net; its surface equals four circles of radius r",
  [Solid.Hemisphere]:
    "no flat net; its curved surface equals two circles of radius r, plus the flat base circle",
  [Solid.Frustum]: "a piece of a ring (a big sector minus a small one), with the two end circles",
};

const act = actionsFor<ViewerState>();

export const solidViewer = defineProp({
  type: "solidViewer",
  describe:
    "One basic solid (cuboid, cube, cylinder, cone, sphere, hemisphere, or frustum of a cone) drawn from a little above with its measurements labelled (r, h, slant height l, …), or opened out into its flat net so the curved surface shows as a rectangle (cylinder), a sector (cone) or a ring piece (frustum); a sphere's surface is shown as four circles. Under the picture: the curved (or lateral) surface area, total surface area and volume, with the formula and the numbers. The learner can turn the picture, open and close the net, pick which measure to see, and step the measurements.",
  state: viewerState,
  defaults: {
    solid: Solid.Cylinder,
    dims: { l: 6, b: 4, h: 10, a: 5, r: 3.5, r1: 6, r2: 3 },
    unit: "cm",
    pi: Pi.Sevenths,
    isNet: false,
    turn: 0,
    measure: Measure.None,
    measures: [],
    showDims: true,
    showFormula: true,
    canUnfold: false,
    canTurn: false,
    canSetDims: false,
    dimStep: 0.5,
  },
  inputs: ["canUnfold", "canTurn", "canSetDims", "showDims", "showFormula"],
  invariant: checkDims,
  derived: {
    [ViewerDerived.Curved]: {
      describe: "The curved surface area (lateral surface area for a cuboid or cube)",
      compute: (s) => clean(measuresOfState(s).curved),
    },
    [ViewerDerived.Total]: {
      describe: "The total surface area",
      compute: (s) => clean(measuresOfState(s).total),
    },
    [ViewerDerived.Volume]: {
      describe: "The volume",
      compute: (s) => clean(measuresOfState(s).volume),
    },
    [ViewerDerived.Slant]: {
      describe: "The slant height l of a cone or frustum, or null",
      compute: (s) => {
        const l = measuresOfState(s).slant;
        return l === null ? null : clean(l);
      },
    },
  },
  actions: {
    [ViewerAction.Unfold]: act({
      describe: "Open the solid out into its flat net (on: true) or fold it back (on: false)",
      byLearner: true,
      args: z.object({ on: z.boolean() }).strict(),
      run: (s, a) =>
        !s.canUnfold || a.on === s.isNet
          ? set({})
          : set({ isNet: a.on }, { signal: ViewerSignal.Unfolded, payload: { isNet: a.on } }),
    }),
    [ViewerAction.Turn]: act({
      describe: "Look at the solid from a slightly different direction",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canTurn) return set({});
        const turn = (s.turn + a.by + TURNS) % TURNS;
        return set({ turn }, { signal: ViewerSignal.Turned, payload: { turn } });
      },
    }),
    [ViewerAction.Nudge]: act({
      describe:
        "Make one measurement (r, h, l, b, a, r1, r2) one step bigger (by: 1) or smaller (by: −1)",
      byLearner: true,
      args: z
        .object({
          name: z.enum(["l", "b", "h", "a", "r", "r1", "r2"]),
          by: z.union([z.literal(1), z.literal(-1)]),
        })
        .strict(),
      run: (s, a) => {
        if (!s.canSetDims || !DIM_NAMES[s.solid].includes(a.name)) return set({});
        const value = clean(s.dims[a.name] + a.by * s.dimStep);
        if (value <= 0) return set({});
        const dims = { ...s.dims, [a.name]: value };
        const next = { ...s, dims };
        if (checkDims(next) !== undefined) return set({});
        return set({ dims }, changed(next));
      },
    }),
    [ViewerAction.Pick]: act({
      describe: "Light up and work out one measure: curved surface, total surface or volume",
      byLearner: true,
      args: z.object({ measure: z.nativeEnum(Measure) }).strict(),
      run: (s, a) =>
        !s.measures.includes(a.measure)
          ? set({})
          : set(
              { measure: a.measure },
              { signal: ViewerSignal.Picked, payload: { measure: a.measure } },
            ),
    }),
    [ViewerAction.SetSolid]: act({
      describe: "Show a different solid (the net closes)",
      args: z.object({ solid: z.nativeEnum(Solid) }).strict(),
      run: (s, a) => {
        const next = { ...s, solid: a.solid, isNet: false };
        return checkDims(next) === undefined
          ? set({ solid: a.solid, isNet: false }, changed(next))
          : set({});
      },
    }),
    [ViewerAction.SetDims]: act({
      describe: "Set the measurements",
      args: z.object({ dims: dimsSchema.partial() }).strict(),
      run: (s, a) => {
        const dims = { ...s.dims, ...a.dims };
        const next = { ...s, dims };
        return checkDims(next) === undefined ? set({ dims }, changed(next)) : set({});
      },
    }),
  },
  signals: {
    [ViewerSignal.Unfolded]: { describe: "The net was opened or closed; the payload says which" },
    [ViewerSignal.Turned]: { describe: "The picture was turned" },
    [ViewerSignal.Changed]: {
      describe: "A measurement changed; the payload has the measurements and the three answers",
    },
    [ViewerSignal.Picked]: { describe: "The learner picked a measure to work out" },
  },
  observe: (s) => {
    const m = measuresOfState(s);
    const f = formulasOf(s.solid);
    const elements: Element[] = [
      {
        id: s.isNet ? ViewerPart.Net : ViewerPart.Picture,
        value: s.isNet
          ? `the net of the ${NAMES[s.solid]}: ${NETS[s.solid]}`
          : `a ${NAMES[s.solid]}${s.showDims ? ` with ${dimsText(s)}` : ""}${m.slant === null ? "" : `, slant height l = ${withUnit(m.slant, s.unit)}`}`,
      },
    ];
    if (s.measure !== Measure.None) {
      const value =
        s.measure === Measure.Curved
          ? `curved surface area = ${f.curved} = ${withUnit(m.curved, s.unit, 2)}`
          : s.measure === Measure.Total
            ? `total surface area = ${f.total} = ${withUnit(m.total, s.unit, 2)}`
            : `volume = ${f.volume} = ${withUnit(m.volume, s.unit, 3)}`;
      elements.push({ id: ViewerPart.Formulas, value });
    }
    if (s.measures.length > 0)
      elements.push({ id: ViewerPart.Measures, value: `buttons: ${s.measures.join(", ")}` });
    return {
      summary: `A ${NAMES[s.solid]} (${dimsText(s)})${s.isNet ? ", opened out into its net" : ""}.`,
      elements,
      hidden: {
        curved: clean(m.curved),
        total: clean(m.total),
        volume: clean(m.volume),
      },
    };
  },
  parts: (s) => [
    s.isNet ? ViewerPart.Net : ViewerPart.Picture,
    ...(s.measure !== Measure.None ? [ViewerPart.Formulas] : []),
    ...(s.canUnfold ? [ViewerPart.Unfold] : []),
    ...(s.canTurn && !s.isNet ? [ViewerPart.Turn] : []),
    ...(s.canSetDims ? [ViewerPart.Steppers] : []),
    ...(s.measures.length > 0 ? [ViewerPart.Measures] : []),
  ],
});

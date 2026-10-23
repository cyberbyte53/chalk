import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  Pi,
  Solid,
  clean,
  conesOfFrustum,
  measuresOf,
  piValue,
  slantOfCone,
  withUnit,
} from "./solids";

/**
 * The frustum of a cone (13.5) as Example 12 explains it: a big cone, cut by a plane parallel to its
 * base, with the small cone on top taken away. Similar triangles give the cones' heights
 * (h₂ = h·r₂/(r₁ − r₂), h₁ = h + h₂); the frustum's volume and curved surface are the big cone's
 * minus the small cone's, which tidy into the frustum formulas.
 */

export const FrustumAction = {
  Step: "step",
  Back: "back",
  Pick: "pick",
  SetDims: "setDims",
} as const;
export const FrustumSignal = { Stepped: "stepped", Cut: "cut", Picked: "picked" } as const;
export const FrustumDerived = {
  H1: "h1",
  H2: "h2",
  Slant: "slant",
  Volume: "volume",
  Curved: "curved",
  Total: "total",
} as const;
export const FrustumPart = {
  Picture: "picture",
  Lines: "lines",
  Step: "step",
  Back: "back",
  Measures: "measures",
} as const;

/** 0, the whole cone; 1, the cutting plane; 2, the small cone lifted off; 3, the frustum and its formula. */
export const FrustumStep = { Cone: 0, Plane: 1, Lifted: 2, Frustum: 3 } as const;
export const FRUSTUM_STEPS = 4;

export const FrustumMeasure = { Volume: "volume", Curved: "curved", Total: "total" } as const;
export type FrustumMeasure = (typeof FrustumMeasure)[keyof typeof FrustumMeasure];

const frustumState = z
  .object({
    /** The radius of the larger end (the big cone's base). */
    r1: z.number().positive().max(1e5),
    /** The radius of the smaller end (where the cut is). */
    r2: z.number().positive().max(1e5),
    /** The frustum's height. */
    h: z.number().positive().max(1e5),
    unit: z.string().max(4),
    pi: z.nativeEnum(Pi),
    step: z
      .number()
      .int()
      .min(0)
      .max(FRUSTUM_STEPS - 1),
    measure: z.nativeEnum(FrustumMeasure),
    showLines: z.boolean(),
    canStep: z.boolean(),
    canPick: z.boolean(),
  })
  .strict();
export type FrustumState = z.infer<typeof frustumState>;

export type FrustumNumbers = {
  h1: number;
  h2: number;
  l: number;
  l1: number;
  l2: number;
  volume: number;
  curved: number;
  total: number;
  bigVolume: number;
  smallVolume: number;
  bigCurved: number;
  smallCurved: number;
};

/** Every number of the cut: both cones' heights and slants, and the frustum's three measures. */
export function frustumNumbers(s: Pick<FrustumState, "r1" | "r2" | "h" | "pi">): FrustumNumbers {
  const p = piValue(s.pi);
  const { h1, h2 } = conesOfFrustum(s.r1, s.r2, s.h);
  const l1 = slantOfCone(s.r1, h1);
  const l2 = slantOfCone(s.r2, h2);
  const m = measuresOf(Solid.Frustum, { l: 1, b: 1, a: 1, r: 1, r1: s.r1, r2: s.r2, h: s.h }, p);
  return {
    h1,
    h2,
    l: m.slant ?? 0,
    l1,
    l2,
    volume: m.volume,
    curved: m.curved,
    total: m.total,
    bigVolume: (p * s.r1 * s.r1 * h1) / 3,
    smallVolume: (p * s.r2 * s.r2 * h2) / 3,
    bigCurved: p * s.r1 * l1,
    smallCurved: p * s.r2 * l2,
  };
}

const STEP_EN = ["the whole cone", "the cutting plane", "the small cone lifted off", "the frustum"];

const act = actionsFor<FrustumState>();

export const frustumCut = defineProp({
  type: "frustumCut",
  describe:
    "A frustum of a cone made by cutting a cone with a plane parallel to its base and removing the small cone on top, in steps: the whole cone (radius r₁, height h₁); the cutting plane at the frustum's height h; the small cone (radius r₂, height h₂) lifted off; the frustum with r₁, r₂, h and slant height l. Under it, h₂ from similar triangles, and the volume (or curved or total surface area) as the big cone's minus the small cone's, which equals the frustum formula.",
  state: frustumState,
  defaults: {
    r1: 28,
    r2: 7,
    h: 45,
    unit: "cm",
    pi: Pi.Sevenths,
    step: 0,
    measure: FrustumMeasure.Volume,
    showLines: true,
    canStep: true,
    canPick: false,
  },
  inputs: ["showLines", "canStep", "canPick"],
  invariant: (s) => (s.r2 >= s.r1 ? "r1 (the larger end) must be bigger than r2" : undefined),
  derived: {
    [FrustumDerived.H1]: {
      describe: "The whole cone's height h₁",
      compute: (s) => clean(frustumNumbers(s).h1),
    },
    [FrustumDerived.H2]: {
      describe: "The small cone's height h₂",
      compute: (s) => clean(frustumNumbers(s).h2),
    },
    [FrustumDerived.Slant]: {
      describe: "The frustum's slant height l",
      compute: (s) => clean(frustumNumbers(s).l),
    },
    [FrustumDerived.Volume]: {
      describe: "The frustum's volume",
      compute: (s) => clean(frustumNumbers(s).volume),
    },
    [FrustumDerived.Curved]: {
      describe: "The frustum's curved surface area",
      compute: (s) => clean(frustumNumbers(s).curved),
    },
    [FrustumDerived.Total]: {
      describe: "The frustum's total surface area",
      compute: (s) => clean(frustumNumbers(s).total),
    },
  },
  actions: {
    [FrustumAction.Step]: act({
      describe: "Go on to the next step (cone → plane → small cone lifted off → frustum)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.step >= FRUSTUM_STEPS - 1) return set({});
        const step = s.step + 1;
        const emits: Emit[] = [{ signal: FrustumSignal.Stepped, payload: { step } }];
        if (step === FrustumStep.Lifted)
          emits.push({
            signal: FrustumSignal.Cut,
            payload: { step, h2: clean(frustumNumbers(s).h2) },
          });
        return set({ step }, ...emits);
      },
    }),
    [FrustumAction.Back]: act({
      describe: "Go back to the whole cone",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.canStep || s.step === 0
          ? set({})
          : set({ step: 0 }, { signal: FrustumSignal.Stepped, payload: { step: 0 } }),
    }),
    [FrustumAction.Pick]: act({
      describe: "Work out the volume, the curved surface area or the total surface area",
      byLearner: true,
      args: z.object({ measure: z.nativeEnum(FrustumMeasure) }).strict(),
      run: (s, a) =>
        !s.canPick || a.measure === s.measure
          ? set({})
          : set(
              { measure: a.measure },
              { signal: FrustumSignal.Picked, payload: { measure: a.measure } },
            ),
    }),
    [FrustumAction.SetDims]: act({
      describe: "Set the frustum's radii and height (r1 > r2)",
      args: z
        .object({
          r1: z.number().positive().max(1e5).optional(),
          r2: z.number().positive().max(1e5).optional(),
          h: z.number().positive().max(1e5).optional(),
        })
        .strict(),
      run: (s, a) => {
        const next = { r1: a.r1 ?? s.r1, r2: a.r2 ?? s.r2, h: a.h ?? s.h };
        return next.r2 >= next.r1 ? set({}) : set(next);
      },
    }),
  },
  signals: {
    [FrustumSignal.Stepped]: { describe: "The learner moved to another step; the payload has it" },
    [FrustumSignal.Cut]: {
      describe: "The small cone was lifted off; the payload has its height h₂",
    },
    [FrustumSignal.Picked]: { describe: "The learner picked a measure to work out" },
  },
  observe: (s) => {
    const n = frustumNumbers(s);
    const u = s.unit;
    const elements: Element[] = [
      {
        id: FrustumPart.Picture,
        value:
          s.step === FrustumStep.Frustum
            ? `a frustum: r₁ = ${withUnit(s.r1, u)}, r₂ = ${withUnit(s.r2, u)}, h = ${withUnit(s.h, u)}, l = ${withUnit(n.l, u)}`
            : `a cone of radius ${withUnit(s.r1, u)} and height h₁ = ${withUnit(n.h1, u)}${s.step >= FrustumStep.Plane ? `, cut at height ${withUnit(s.h, u)} where the radius is ${withUnit(s.r2, u)}` : ""}${s.step >= FrustumStep.Lifted ? `; the small cone (height h₂ = ${withUnit(n.h2, u)}) lifted off` : ""}`,
      },
    ];
    if (s.showLines && s.step === FrustumStep.Frustum)
      elements.push({
        id: FrustumPart.Lines,
        value:
          s.measure === FrustumMeasure.Volume
            ? `volume = big cone − small cone = ${withUnit(n.bigVolume, u, 3)} − ${withUnit(n.smallVolume, u, 3)} = ${withUnit(n.volume, u, 3)}`
            : s.measure === FrustumMeasure.Curved
              ? `curved surface = ${withUnit(n.bigCurved, u, 2)} − ${withUnit(n.smallCurved, u, 2)} = π(r₁ + r₂)l = ${withUnit(n.curved, u, 2)}`
              : `total surface = π(r₁ + r₂)l + πr₁² + πr₂² = ${withUnit(n.total, u, 2)}`,
      });
    return {
      summary: `A frustum of a cone: ${STEP_EN[s.step]} (step ${s.step + 1} of ${FRUSTUM_STEPS}).`,
      elements,
      hidden: {
        h1: clean(n.h1),
        h2: clean(n.h2),
        volume: clean(n.volume),
        curved: clean(n.curved),
        total: clean(n.total),
      },
    };
  },
  parts: (s) => [
    FrustumPart.Picture,
    ...(s.showLines ? [FrustumPart.Lines] : []),
    ...(s.canStep && s.step < FRUSTUM_STEPS - 1 ? [FrustumPart.Step] : []),
    ...(s.canStep && s.step > 0 ? [FrustumPart.Back] : []),
    ...(s.canPick && s.step === FrustumStep.Frustum ? [FrustumPart.Measures] : []),
  ],
});

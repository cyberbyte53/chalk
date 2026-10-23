import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { ImageAt, NORMAL_NEAR_CM, farPointWith, focusOn, nearPointWith, rangeOf } from "./optics";
import { dioptres, num } from "./words";

/**
 * The human eye seen from the side, focusing on an object near or far. The lens thickens (ciliary
 * muscles contracted) for near things and thins (relaxed) for far ones; rays from the object meet
 * on the retina when the eye can manage it, or in front of or behind it when it can't. A faulty eye
 * (myopia, hypermetropia, presbyopia) and a spectacle lens in front of it show the defects and their
 * correction.
 */

export const EyeDefect = {
  Normal: "normal",
  Myopia: "myopia",
  Hypermetropia: "hypermetropia",
  Presbyopia: "presbyopia",
} as const;
export type EyeDefect = (typeof EyeDefect)[keyof typeof EyeDefect];

export const Light = { Bright: "bright", Dim: "dim" } as const;
export type Light = (typeof Light)[keyof typeof Light];

/** Each eye's far point (null: infinity) and near point, cm, as NCERT's examples have them. */
export const DEFECTS: Record<EyeDefect, { farCm: number | null; nearCm: number }> = {
  [EyeDefect.Normal]: { farCm: null, nearCm: NORMAL_NEAR_CM },
  // Riya: the blackboard blurs beyond 2 m, so she needs −0.5 D. (For NCERT's numbers pass
  // farPointCm: 120 for in-text question 2, or 80 for Exercise 6.)
  [EyeDefect.Myopia]: { farCm: 200, nearCm: 15 },
  // Exercise 7: near point 1 m.
  [EyeDefect.Hypermetropia]: { farCm: null, nearCm: 100 },
  // Grandpa: the ciliary muscles have weakened, the near point has receded.
  [EyeDefect.Presbyopia]: { farCm: null, nearCm: 100 },
};

export const EyeAction = {
  MoveObject: "moveObject",
  SetCorrection: "setCorrection",
  SetLight: "setLight",
  SetDefect: "setDefect",
} as const;
export const EyeSignal = { Changed: "changed" } as const;
export const EyeDerived = {
  IsSharp: "isSharp",
  ImageAt: "imageAt",
  Power: "power",
  Effort: "effort",
  Muscles: "muscles",
  FarPoint: "farPoint",
  NearPoint: "nearPoint",
  CanSeeFar: "canSeeFar",
} as const;
export const EyePart = {
  Eye: "eye",
  Object: "object",
  Lens: "lens",
  Retina: "retina",
  Spectacles: "spectacles",
  Sees: "sees",
  Readout: "readout",
  Controls: "controls",
} as const;

export const Muscles = { Relaxed: "relaxed", Contracting: "contracting", Full: "full" } as const;
export type Muscles = (typeof Muscles)[keyof typeof Muscles];

/** Distances the object can be put at, cm, nearest first; null is "far away". */
export const OBJECT_STOPS: readonly (number | null)[] = [10, 15, 25, 50, 100, 200, 500, null];
/** Spectacle powers in steps of a quarter dioptre. */
export const CORRECTION_STEP = 0.25;
export const CORRECTION_LIMIT = 8;

const eyeState = z
  .object({
    defect: z.nativeEnum(EyeDefect),
    /** The eye's own far point, cm; null: infinity (a normal far point). */
    farPointCm: z.number().min(10).max(1000).nullable(),
    /** The eye's own near point, cm. */
    nearPointCm: z.number().min(5).max(500),
    /** Where the object is, cm in front of the eye; null: far away (as good as infinity). */
    objectCm: z.number().min(5).max(1000).nullable(),
    /** A spectacle lens in front of the eye, dioptres (− concave, + convex); null: no glasses. */
    correction: z.number().min(-CORRECTION_LIMIT).max(CORRECTION_LIMIT).nullable(),
    light: z.nativeEnum(Light),
    /** Names of the parts: cornea, iris, pupil, lens, ciliary muscles, retina, optic nerve. */
    showNames: z.boolean(),
    showRays: z.boolean(),
    /** A small picture of what the person sees: an eye chart, sharp or blurred. */
    showSees: z.boolean(),
    /** Near point, far point and the power in use under the picture. */
    showReadout: z.boolean(),
    /** Buttons to move the object nearer or farther. */
    canMoveObject: z.boolean(),
    /** Buttons to put on a spectacle lens and change its power. */
    canSetCorrection: z.boolean(),
    canSetLight: z.boolean(),
    canSetDefect: z.boolean(),
  })
  .strict();
export type EyeState = z.infer<typeof eyeState>;

/** A state for one of the eyes, with its own near and far points. */
export function eyeFor(defect: EyeDefect, more: Partial<EyeState> = {}): Partial<EyeState> {
  const d = DEFECTS[defect];
  return { defect, farPointCm: d.farCm, nearPointCm: d.nearCm, ...more };
}

export function focusOf(
  s: Pick<EyeState, "farPointCm" | "nearPointCm" | "objectCm" | "correction">,
) {
  return focusOn(s.objectCm, rangeOf(s.farPointCm, s.nearPointCm), s.correction);
}

export function musclesOf(effort: number): Muscles {
  if (effort < 0.02) return Muscles.Relaxed;
  if (effort > 0.98) return Muscles.Full;
  return Muscles.Contracting;
}

/** Far point with the glasses on: a number of cm, Infinity, or NaN when nothing far is sharp. */
export function farOf(s: Pick<EyeState, "farPointCm" | "nearPointCm" | "correction">): number {
  const far = farPointWith(rangeOf(s.farPointCm, s.nearPointCm), s.correction);
  return far === null ? Number.POSITIVE_INFINITY : far;
}

export function nearOf(s: Pick<EyeState, "farPointCm" | "nearPointCm" | "correction">): number {
  return nearPointWith(rangeOf(s.farPointCm, s.nearPointCm), s.correction);
}

const DEFECT_NAMES: Record<EyeDefect, string> = {
  [EyeDefect.Normal]: "a normal eye",
  [EyeDefect.Myopia]: "a myopic (near-sighted) eye",
  [EyeDefect.Hypermetropia]: "a hypermetropic (far-sighted) eye",
  [EyeDefect.Presbyopia]: "an old eye with presbyopia",
};

const where = (cm: number | null): string =>
  cm === null ? "far away" : `${num(cm, 0)} cm from the eye`;

export function describeEye(s: EyeState): string {
  const f = focusOf(s);
  const glasses =
    s.correction === null
      ? ""
      : ` wearing a ${s.correction < 0 ? "concave" : "convex"} lens of ${dioptres(s.correction)} D,`;
  const image =
    f.imageAt === ImageAt.Retina
      ? "the rays meet on the retina: sharp"
      : f.imageAt === ImageAt.InFront
        ? "the rays meet in front of the retina and spread again: blurred"
        : "the rays reach the retina before they meet: blurred";
  const lens =
    musclesOf(f.effort) === Muscles.Relaxed
      ? "the ciliary muscles are relaxed and the lens is thin"
      : "the ciliary muscles contract and the lens is thicker";
  return `${DEFECT_NAMES[s.defect]},${glasses} looking at an object ${where(s.objectCm)}: ${lens}; ${image}.`;
}

const act = actionsFor<EyeState>();
const changed = (next: EyeState) => {
  const f = focusOf(next);
  return {
    signal: EyeSignal.Changed,
    payload: { isSharp: f.imageAt === ImageAt.Retina, imageAt: f.imageAt },
  };
};

export const eyeModel = defineProp({
  type: "eyeModel",
  describe:
    "The human eye from the side (cornea, iris and pupil, eye lens with its ciliary muscles, retina, optic nerve) looking at an object near or far. The eye adjusts its lens as far as it can: thin for far objects, thick for near ones. Rays from the object meet on the retina (sharp) or in front of it or behind it (blurred). It can be a normal, myopic, hypermetropic or presbyopic eye, with a concave or convex spectacle lens in front of it.",
  state: eyeState,
  defaults: {
    defect: EyeDefect.Normal,
    farPointCm: null,
    nearPointCm: NORMAL_NEAR_CM,
    objectCm: null,
    correction: null,
    light: Light.Bright,
    showNames: false,
    showRays: true,
    showSees: true,
    showReadout: false,
    canMoveObject: true,
    canSetCorrection: false,
    canSetLight: false,
    canSetDefect: false,
  },
  inputs: [
    "showNames",
    "showRays",
    "showSees",
    "showReadout",
    "canMoveObject",
    "canSetCorrection",
    "canSetLight",
    "canSetDefect",
  ],
  derived: {
    [EyeDerived.IsSharp]: {
      describe: "The object's image lands on the retina (the person sees it sharply)",
      compute: (s) => focusOf(s).imageAt === ImageAt.Retina,
    },
    [EyeDerived.ImageAt]: {
      describe: "Where the rays meet: 'retina', 'inFront' (of the retina) or 'behind' it",
      compute: (s) => focusOf(s).imageAt,
    },
    [EyeDerived.Power]: {
      describe: "Total power in use, eye plus spectacles, dioptres",
      compute: (s) => Number(focusOf(s).power.toFixed(2)),
    },
    [EyeDerived.Effort]: {
      describe: "How hard the ciliary muscles work: 0 relaxed, 1 fully contracted",
      compute: (s) => Number(focusOf(s).effort.toFixed(3)),
    },
    [EyeDerived.Muscles]: {
      describe: "The ciliary muscles: 'relaxed', 'contracting' or 'full' (as far as they go)",
      compute: (s) => musclesOf(focusOf(s).effort),
    },
    [EyeDerived.FarPoint]: {
      describe:
        "The far point with any glasses on, cm; null when it is at infinity (or nothing far is sharp)",
      compute: (s) => {
        const far = farOf(s);
        return Number.isFinite(far) ? Number(far.toFixed(1)) : null;
      },
    },
    [EyeDerived.NearPoint]: {
      describe: "The near point with any glasses on, cm; null when nothing can be made sharp",
      compute: (s) => {
        const near = nearOf(s);
        return Number.isFinite(near) ? Number(near.toFixed(1)) : null;
      },
    },
    [EyeDerived.CanSeeFar]: {
      describe: "A far-away object can be seen sharply (the far point is at infinity)",
      compute: (s) => farOf(s) === Number.POSITIVE_INFINITY,
    },
  },
  actions: {
    [EyeAction.MoveObject]: act({
      describe: "Put the object at a distance from the eye, cm (null: far away)",
      byLearner: true,
      args: z.object({ cm: z.number().min(5).max(1000).nullable() }).strict(),
      run: (s, a) => set({ objectCm: a.cm }, changed({ ...s, objectCm: a.cm })),
    }),
    [EyeAction.SetCorrection]: act({
      describe: "Put a spectacle lens of this power (dioptres) in front of the eye, or none (null)",
      byLearner: true,
      args: z
        .object({ power: z.number().min(-CORRECTION_LIMIT).max(CORRECTION_LIMIT).nullable() })
        .strict(),
      run: (s, a) => set({ correction: a.power }, changed({ ...s, correction: a.power })),
    }),
    [EyeAction.SetLight]: act({
      describe: "Bright or dim light: the iris makes the pupil small or large",
      byLearner: true,
      args: z.object({ light: z.nativeEnum(Light) }).strict(),
      run: (s, a) => set({ light: a.light }, changed({ ...s, light: a.light })),
    }),
    [EyeAction.SetDefect]: act({
      describe:
        "Make it a normal, myopic, hypermetropic or presbyopic eye (its own near and far points)",
      byLearner: true,
      args: z.object({ defect: z.nativeEnum(EyeDefect) }).strict(),
      run: (s, a) => {
        const d = DEFECTS[a.defect];
        const next = { defect: a.defect, farPointCm: d.farCm, nearPointCm: d.nearCm };
        return set(next, changed({ ...s, ...next }));
      },
    }),
  },
  signals: {
    [EyeSignal.Changed]: {
      describe:
        "The object, the glasses, the light or the eye changed; the payload says whether the picture is sharp and where the rays meet",
    },
  },
  observe: (s) => {
    const f = focusOf(s);
    const elements: Element[] = [
      { id: EyePart.Eye, value: DEFECT_NAMES[s.defect] },
      { id: EyePart.Object, value: where(s.objectCm) },
      {
        id: EyePart.Lens,
        value: `${musclesOf(f.effort)} muscles, power in use ${num(f.power, 2)} D`,
      },
      { id: EyePart.Retina, value: f.imageAt },
    ];
    if (s.correction !== null)
      elements.push({ id: EyePart.Spectacles, value: `${dioptres(s.correction)} D` });
    if (s.showSees)
      elements.push({
        id: EyePart.Sees,
        value: f.imageAt === ImageAt.Retina ? "the chart, sharp" : "the chart, blurred",
      });
    if (s.showReadout) {
      const far = farOf(s);
      const near = nearOf(s);
      elements.push({
        id: EyePart.Readout,
        value: `near point ${Number.isFinite(near) ? `${num(near, 0)} cm` : "none"}, far point ${far === Number.POSITIVE_INFINITY ? "infinity" : Number.isFinite(far) ? `${num(far, 0)} cm` : "none"}`,
      });
    }
    return { summary: describeEye(s), elements };
  },
  parts: (s) => [
    EyePart.Eye,
    EyePart.Object,
    EyePart.Lens,
    EyePart.Retina,
    ...(s.correction !== null || s.canSetCorrection ? [EyePart.Spectacles] : []),
    ...(s.showSees ? [EyePart.Sees] : []),
    ...(s.showReadout ? [EyePart.Readout] : []),
    ...(s.canMoveObject || s.canSetCorrection || s.canSetLight || s.canSetDefect
      ? [EyePart.Controls]
      : []),
  ],
});

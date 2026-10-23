import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean, deg, numText, rad } from "./trig";

/**
 * Grandpa's clinometer (NCERT 9.2 Activity): a protractor with a plumb line. The observer stands
 * some metres from an object and tilts the sighting arm until the line of sight meets its top;
 * the plumb reads the angle of elevation. Then height = eye height + distance × tan θ.
 */

export const ClinoTarget = { Tower: "tower", Kite: "kite", Flag: "flag", Tree: "tree" } as const;
export type ClinoTarget = (typeof ClinoTarget)[keyof typeof ClinoTarget];

export const ClinoAction = { Tilt: "tilt", Walk: "walk", Reset: "reset" } as const;
export const ClinoSignal = { Changed: "changed", Sighted: "sighted" } as const;
export const ClinoDerived = {
  TrueAngle: "trueAngle",
  IsSighted: "isSighted",
  ComputedHeight: "computedHeight",
  Working: "working",
} as const;
export const ClinoPart = {
  Figure: "figure",
  Dial: "dial",
  Readout: "readout",
  Working: "working",
  Controls: "controls",
} as const;

/** How close (°) the sight must be to the top to count as sighted. */
export const SIGHT_TOLERANCE = 1;
export const DISTANCE_MIN = 5;
export const DISTANCE_MAX = 60;

const clinoState = z
  .object({
    target: z.nativeEnum(ClinoTarget),
    /** Height of the target's top above the ground (m). */
    targetHeight: z.number().positive().max(100),
    /** Distance along the ground from the observer to the target's foot (m). */
    distance: z.number().min(DISTANCE_MIN).max(DISTANCE_MAX),
    /** Observer's eye above the ground (m). */
    eyeHeight: z.number().min(0).max(3),
    /** The clinometer's reading (°). */
    tilt: z.number().int().min(0).max(85),
    tiltStep: z.number().int().min(1).max(15),
    walkStep: z.number().positive().max(20),
    canTilt: z.boolean(),
    canWalk: z.boolean(),
    showWorking: z.boolean(),
  })
  .strict();
export type ClinoState = z.infer<typeof clinoState>;

/** The real angle of elevation of the top from the eye (°). */
export const trueAngleOf = (s: ClinoState): number =>
  clean(deg(Math.atan2(s.targetHeight - s.eyeHeight, s.distance)));
export const isSightedOf = (s: ClinoState): boolean =>
  Math.abs(s.tilt - trueAngleOf(s)) <= SIGHT_TOLERANCE;
/** The height worked out from the reading: eye + d tan θ. */
export const computedHeightOf = (s: ClinoState): number =>
  clean(s.eyeHeight + s.distance * Math.tan(rad(s.tilt)));

export function workingOf(s: ClinoState): string[] {
  const d = numText(s.distance, 1);
  const e = numText(s.eyeHeight, 2);
  const h = clean(s.distance * Math.tan(rad(s.tilt)));
  return [
    `\\tan ${s.tilt}^\\circ = \\dfrac{h}{${d}}`,
    `h = ${d} \\times \\tan ${s.tilt}^\\circ = ${d} \\times ${numText(Math.tan(rad(s.tilt)), 3)} \\approx ${numText(h, 1)}\\text{ m}`,
    `\\text{height} = h + ${e} \\approx ${numText(computedHeightOf(s), 1)}\\text{ m}`,
  ];
}

const act = actionsFor<ClinoState>();
const by = z.union([z.literal(1), z.literal(-1)]);

function changed(s: ClinoState, patch: Partial<ClinoState>) {
  const next = { ...s, ...patch };
  const sighted = isSightedOf(next);
  const emits: Emit[] = [
    {
      signal: ClinoSignal.Changed,
      payload: { tilt: next.tilt, distance: next.distance, isSighted: sighted },
    },
  ];
  if (sighted && !isSightedOf(s))
    emits.push({
      signal: ClinoSignal.Sighted,
      payload: {
        tilt: next.tilt,
        distance: next.distance,
        isSighted: true,
        height: computedHeightOf(next),
      },
    });
  return set(patch, ...emits);
}

export const clinometer = defineProp({
  type: "clinometer",
  describe:
    "Grandpa's homemade clinometer (NCERT 9.2 activity): a protractor with a straw to sight along and a plumb line that hangs straight down. The observer stands some metres from a tower, a kite, a flag on a pole or a tree; the learner tilts the sight until the dashed line of sight meets the top (Sighted), and walks nearer or further. The dial shows the angle of elevation read off the plumb; underneath, the working h = d × tan θ and height = h + eye height. Teaches the angle of elevation and that the reading changes as you walk.",
  state: clinoState,
  defaults: {
    target: ClinoTarget.Tower,
    targetHeight: 31.5,
    distance: 30,
    eyeHeight: 1.5,
    tilt: 20,
    tiltStep: 5,
    walkStep: 5,
    canTilt: true,
    canWalk: false,
    showWorking: true,
  },
  inputs: ["canTilt", "canWalk", "showWorking"],
  invariant: (s) =>
    s.eyeHeight >= s.targetHeight ? "the target must be above the eye" : undefined,
  derived: {
    [ClinoDerived.TrueAngle]: {
      describe: "The real angle of elevation of the top (°)",
      compute: trueAngleOf,
    },
    [ClinoDerived.IsSighted]: {
      describe: `Whether the reading is within ${SIGHT_TOLERANCE}° of the real angle`,
      compute: isSightedOf,
    },
    [ClinoDerived.ComputedHeight]: {
      describe: "The height worked out from the reading, eye + d tan θ (m)",
      compute: computedHeightOf,
    },
    [ClinoDerived.Working]: { describe: "The working as TeX lines", compute: workingOf },
  },
  actions: {
    [ClinoAction.Tilt]: act({
      describe: "Tilt the sight up (by: 1) or down (by: −1) by one step",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => {
        if (!s.canTilt) return set({});
        const tilt = Math.min(85, Math.max(0, s.tilt + a.by * s.tiltStep));
        if (tilt === s.tilt) return set({});
        return changed(s, { tilt });
      },
    }),
    [ClinoAction.Walk]: act({
      describe: "Walk towards the target (by: −1) or away from it (by: 1) by one step",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => {
        if (!s.canWalk) return set({});
        const distance = clean(
          Math.min(DISTANCE_MAX, Math.max(DISTANCE_MIN, s.distance + a.by * s.walkStep)),
        );
        if (distance === s.distance) return set({});
        return changed(s, { distance });
      },
    }),
    [ClinoAction.Reset]: act({
      describe: "Lower the sight to level",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => (s.tilt === 0 ? set({}) : changed(s, { tilt: 0 })),
    }),
  },
  signals: {
    [ClinoSignal.Changed]: { describe: "The reading or the distance changed" },
    [ClinoSignal.Sighted]: {
      describe:
        "The line of sight just reached the top; the payload has the reading and the height",
    },
  },
  observe: (s) => {
    const sighted = isSightedOf(s);
    const elements: Element[] = [
      {
        id: ClinoPart.Figure,
        value: `observer with eye ${numText(s.eyeHeight)} m up, ${numText(s.distance, 1)} m from a ${s.target}; the line of sight is tilted ${s.tilt}°${sighted ? " and meets the top" : s.tilt < trueAngleOf(s) ? ", below the top" : ", above the top"}`,
      },
      { id: ClinoPart.Readout, value: `reading ${s.tilt}°, distance ${numText(s.distance, 1)} m` },
    ];
    if (s.showWorking && sighted)
      elements.push({ id: ClinoPart.Working, value: workingOf(s).join("; ") });
    return {
      summary: `Clinometer reading ${s.tilt}° at ${numText(s.distance, 1)} m from the ${s.target}${sighted ? `: sighted, so the height ≈ ${numText(computedHeightOf(s), 1)} m` : ""}.`,
      elements,
      hidden: sighted
        ? undefined
        : { trueAngle: numText(trueAngleOf(s), 1), height: numText(s.targetHeight, 1) },
    };
  },
  parts: (s) => [
    ClinoPart.Figure,
    ClinoPart.Dial,
    ClinoPart.Readout,
    ...(s.showWorking && isSightedOf(s) ? [ClinoPart.Working] : []),
    ...(s.canTilt || s.canWalk ? [ClinoPart.Controls] : []),
  ],
});

import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean, numText } from "./geometry";

/**
 * Heights from shadows, by similar triangles (NCERT Example 7, Exercise 6.3 Q15).
 * - sun: a stick and a tall object (a water tank, a tower, a pole, a tree) stand upright in the
 *   same sunlight. The sun's rays are parallel, so the two right triangles (height, shadow, ray)
 *   have equal angles and are similar (AA): height ÷ shadow is the same for both. The learner can
 *   move the sun: both shadows change, the ratio stays the same for both.
 * - lamp: a lamp-post and a person walking away from it; the person's shadow x satisfies
 *   (d + x)/x = lamp height ÷ person's height, so it grows as they walk.
 * Stepped: the two triangles, the equation from similarity, the answer.
 */

export const ShadowMode = { Sun: "sun", Lamp: "lamp" } as const;
export type ShadowMode = (typeof ShadowMode)[keyof typeof ShadowMode];

export const ShadowObject = { Tank: "tank", Tower: "tower", Pole: "pole", Tree: "tree" } as const;
export type ShadowObject = (typeof ShadowObject)[keyof typeof ShadowObject];

export const ShadowAction = {
  NudgeSun: "nudgeSun",
  Walk: "walk",
  Next: "next",
  Reset: "reset",
} as const;
export const ShadowSignal = { Changed: "changed", Stepped: "stepped", Solved: "solved" } as const;
export const ShadowDerived = {
  ObjectShadow: "objectShadow",
  Answer: "answer",
  Ratio: "ratio",
  Working: "working",
} as const;
export const ShadowPart = {
  Picture: "picture",
  Triangles: "triangles",
  Working: "working",
  Answer: "answer",
  Controls: "controls",
  Next: "next",
} as const;

/** Lines of working after the bare picture. */
export const SHADOW_STEPS = 3;

const shadowState = z
  .object({
    mode: z.nativeEnum(ShadowMode),
    object: z.nativeEnum(ShadowObject),
    /** Sun mode: the stick's height and its shadow (m); the object's true height (hidden until solved). */
    stickHeight: z.number().min(0.1).max(10),
    stickShadow: z.number().min(0.1).max(20),
    objectHeight: z.number().min(0.5).max(200),
    /** Lamp mode: the lamp's height, the person's height and how far they have walked (m). */
    lampHeight: z.number().min(0.5).max(20),
    personHeight: z.number().min(0.3).max(3),
    distance: z.number().min(0).max(50),
    /** How far one tap walks (m). */
    walkStep: z.number().min(0.1).max(10),
    /** How many lines of working are shown. */
    step: z.number().int().min(0).max(SHADOW_STEPS),
    canMove: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type ShadowState = z.infer<typeof shadowState>;

/** The object's shadow in the same sunlight: its height × (stick shadow ÷ stick height). */
export const objectShadowOf = (
  s: Pick<ShadowState, "stickHeight" | "stickShadow" | "objectHeight">,
): number => clean((s.objectHeight * s.stickShadow) / s.stickHeight);

/** The person's shadow under the lamp: h·d/(H − h). */
export const lampShadowOf = (
  s: Pick<ShadowState, "lampHeight" | "personHeight" | "distance">,
): number => clean((s.personHeight * s.distance) / (s.lampHeight - s.personHeight));

/** What is being found: the object's height (sun) or the person's shadow (lamp). */
export const answerOf = (s: ShadowState): number =>
  s.mode === ShadowMode.Sun ? clean(s.objectHeight) : lampShadowOf(s);

/** The working, as TeX lines: the similar triangles, the equation, the answer. */
export function workingOf(s: ShadowState): string[] {
  if (s.mode === ShadowMode.Sun) {
    const s2 = objectShadowOf(s);
    return [
      "\\triangle_1 \\sim \\triangle_2\\ (\\text{AA})",
      `\\dfrac{h}{${numText(s2)}} = \\dfrac{${numText(s.stickHeight)}}{${numText(s.stickShadow)}}`,
      `h = ${numText(s2)} \\times \\dfrac{${numText(s.stickHeight)}}{${numText(s.stickShadow)}} = ${numText(s.objectHeight)}\\ \\text{m}`,
    ];
  }
  const x = lampShadowOf(s);
  return [
    "\\triangle ABE \\sim \\triangle CDE\\ (\\text{AA})",
    `\\dfrac{${numText(s.distance)} + x}{x} = \\dfrac{${numText(s.lampHeight)}}{${numText(s.personHeight)}}`,
    `x = ${numText(x)}\\ \\text{m}`,
  ];
}

function changed(s: ShadowState): Emit[] {
  return [
    {
      signal: ShadowSignal.Changed,
      payload:
        s.mode === ShadowMode.Sun
          ? { stickShadow: s.stickShadow, objectShadow: objectShadowOf(s) }
          : { distance: s.distance, shadow: lampShadowOf(s) },
    },
  ];
}

const act = actionsFor<ShadowState>();
const by = z.union([z.literal(1), z.literal(-1)]);

export const shadowHeight = defineProp({
  type: "shadowHeight",
  describe:
    "Measuring a height you can't reach with similar triangles and shadows. Sun mode: a stick and a tall object (water tank, tower, pole, tree) stand upright in the same sunlight; the parallel sun rays make the two right triangles (height, shadow, ray) similar by AA, so height ÷ shadow is the same for both and the object's height follows from its shadow (NCERT Ex 6.3 Q15). The learner can move the sun: both shadows change together. Lamp mode is NCERT Example 7: a person walks away from a lamp-post and their shadow x satisfies (d + x)/x = lamp height ÷ person's height. The working is revealed step by step.",
  state: shadowState,
  defaults: {
    mode: ShadowMode.Sun,
    object: ShadowObject.Tank,
    stickHeight: 1.5,
    stickShadow: 1,
    objectHeight: 15,
    lampHeight: 3.6,
    personHeight: 0.9,
    distance: 4.8,
    walkStep: 1.2,
    step: 0,
    canMove: true,
    canStep: true,
  },
  inputs: ["canMove", "canStep"],
  invariant: (s) =>
    s.personHeight >= s.lampHeight ? "the person is taller than the lamp" : undefined,
  derived: {
    [ShadowDerived.ObjectShadow]: {
      describe: "The object's shadow in the same sunlight (m)",
      compute: objectShadowOf,
    },
    [ShadowDerived.Answer]: {
      describe: "What is found: the object's height (sun) or the person's shadow (lamp), in m",
      compute: answerOf,
    },
    [ShadowDerived.Ratio]: {
      describe: "Shadow ÷ height: the same for everything upright in this light (sun mode)",
      compute: (s) => clean(s.stickShadow / s.stickHeight),
    },
    [ShadowDerived.Working]: { describe: "The working, as TeX lines", compute: workingOf },
  },
  actions: {
    [ShadowAction.NudgeSun]: act({
      describe:
        "Lower the sun so shadows lengthen (by: 1) or raise it so they shorten (by: −1) (sun mode)",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => {
        if (!s.canMove || s.mode !== ShadowMode.Sun) return set({});
        const step = clean(s.stickHeight / 5);
        const stickShadow = clean(
          Math.min(3 * s.stickHeight, Math.max(step, s.stickShadow + a.by * step)),
        );
        if (stickShadow === s.stickShadow) return set({});
        return set({ stickShadow }, ...changed({ ...s, stickShadow }));
      },
    }),
    [ShadowAction.Walk]: act({
      describe: "Walk away from the lamp (by: 1) or back towards it (by: −1) (lamp mode)",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => {
        if (!s.canMove || s.mode !== ShadowMode.Lamp) return set({});
        const distance = clean(Math.min(50, Math.max(0, s.distance + a.by * s.walkStep)));
        if (distance === s.distance) return set({});
        return set({ distance }, ...changed({ ...s, distance }));
      },
    }),
    [ShadowAction.Next]: act({
      describe: "Show the next line of working",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.step >= SHADOW_STEPS) return set({});
        const step = s.step + 1;
        const out: Emit[] = [{ signal: ShadowSignal.Stepped, payload: { step } }];
        if (step === SHADOW_STEPS)
          out.push({ signal: ShadowSignal.Solved, payload: { answer: answerOf(s) } });
        return set({ step }, ...out);
      },
    }),
    [ShadowAction.Reset]: act({
      describe: "Hide the working again",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: {
    [ShadowSignal.Changed]: {
      describe: "The sun moved or the person walked; the payload has the new shadows",
    },
    [ShadowSignal.Stepped]: { describe: "A line of working was shown" },
    [ShadowSignal.Solved]: { describe: "The answer is shown; the payload has it" },
  },
  observe: (s) => {
    const work = workingOf(s);
    const elements: Element[] = [];
    let summary: string;
    if (s.mode === ShadowMode.Sun) {
      const s2 = objectShadowOf(s);
      summary = `A ${numText(s.stickHeight)} m stick casts a ${numText(s.stickShadow)} m shadow; the ${s.object} casts a ${numText(s2)} m shadow.`;
      elements.push({
        id: ShadowPart.Picture,
        value: `stick ${numText(s.stickHeight)} m, shadow ${numText(s.stickShadow)} m; ${s.object} height ${s.step >= SHADOW_STEPS ? `${numText(s.objectHeight)} m` : "?"}, shadow ${numText(s2)} m`,
      });
    } else {
      summary = `A ${numText(s.personHeight)} m person ${numText(s.distance)} m from a ${numText(s.lampHeight)} m lamp-post.`;
      elements.push({
        id: ShadowPart.Picture,
        value: `lamp ${numText(s.lampHeight)} m, person ${numText(s.personHeight)} m at ${numText(s.distance)} m; shadow ${s.step >= SHADOW_STEPS ? `${numText(lampShadowOf(s))} m` : "x"}`,
      });
    }
    if (s.step >= 1) elements.push({ id: ShadowPart.Triangles, value: work[0] as string });
    if (s.step >= 2)
      elements.push({ id: ShadowPart.Working, value: work.slice(1, s.step).join("; ") });
    if (s.step >= SHADOW_STEPS) elements.push({ id: ShadowPart.Answer, value: work[2] as string });
    if (s.canMove)
      elements.push({
        id: ShadowPart.Controls,
        value: s.mode === ShadowMode.Sun ? "move the sun" : "walk",
      });
    return {
      summary,
      elements,
      hidden: s.step >= SHADOW_STEPS ? undefined : { answer: answerOf(s) },
    };
  },
  parts: (s) => [
    ShadowPart.Picture,
    ...(s.step >= 1 ? [ShadowPart.Triangles] : []),
    ...(s.step >= 2 ? [ShadowPart.Working] : []),
    ...(s.step >= SHADOW_STEPS ? [ShadowPart.Answer] : []),
    ...(s.canMove ? [ShadowPart.Controls] : []),
    ...(s.canStep ? [ShadowPart.Next] : []),
  ],
});

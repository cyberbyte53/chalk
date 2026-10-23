import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean, numText, ratioValue } from "./trig";

/**
 * The three identities from Pythagoras (NCERT 8.5). In right triangle ABC (right angle at B),
 * AB² + BC² = AC². Dividing by AC² makes the hypotenuse 1 and the legs cos A and sin A:
 * cos²A + sin²A = 1. Dividing by AB² makes the adjacent side 1: 1 + tan²A = sec²A. Dividing by
 * BC² makes the opposite side 1: cot²A + 1 = cosec²A. The learner turns A and switches what is
 * divided by; the squares on the sides show the areas adding up for every angle.
 */

export const DivideBy = {
  Hypotenuse: "hypotenuse",
  Adjacent: "adjacent",
  Opposite: "opposite",
} as const;
export type DivideBy = (typeof DivideBy)[keyof typeof DivideBy];

export const IdentityAction = { NudgeAngle: "nudgeAngle", Divide: "divide" } as const;
export const IdentitySignal = { Changed: "changed" } as const;
export const IdentityDerived = { Sides: "sides", Identity: "identity", Check: "check" } as const;
export const IdentityPart = {
  Triangle: "triangle",
  Squares: "squares",
  Check: "check",
  Controls: "controls",
} as const;

const identityState = z
  .object({
    /** Angle A (°). */
    angle: z.number().int().min(5).max(85),
    angleStep: z.number().int().min(1).max(15),
    divideBy: z.nativeEnum(DivideBy),
    /** Draw a square on each side, its area written inside. */
    showSquares: z.boolean(),
    canSetAngle: z.boolean(),
    canDivide: z.boolean(),
  })
  .strict();
export type IdentityState = z.infer<typeof identityState>;

/** The three sides after dividing: AB (adjacent), BC (opposite), AC (hypotenuse). */
export function sidesOf(s: IdentityState): { ab: number; bc: number; ac: number } {
  const sin = ratioValue("sin", s.angle) ?? 0;
  const cos = ratioValue("cos", s.angle) ?? 0;
  const k = s.divideBy === DivideBy.Hypotenuse ? 1 : s.divideBy === DivideBy.Adjacent ? cos : sin;
  return { ab: clean(cos / k), bc: clean(sin / k), ac: clean(1 / k) };
}

/** The identity this division gives, as TeX. */
export const IDENTITY_TEX: Record<DivideBy, string> = {
  [DivideBy.Hypotenuse]: "\\cos^2 A + \\sin^2 A = 1",
  [DivideBy.Adjacent]: "1 + \\tan^2 A = \\sec^2 A",
  [DivideBy.Opposite]: "\\cot^2 A + 1 = \\operatorname{cosec}^2 A",
};

/** The names of AB, BC, AC after the division (TeX). */
export const SIDE_NAMES: Record<DivideBy, { ab: string; bc: string; ac: string }> = {
  [DivideBy.Hypotenuse]: { ab: "\\cos A", bc: "\\sin A", ac: "1" },
  [DivideBy.Adjacent]: { ab: "1", bc: "\\tan A", ac: "\\sec A" },
  [DivideBy.Opposite]: { ab: "\\cot A", bc: "1", ac: "\\operatorname{cosec} A" },
};

/** The check with numbers: the two squares on the legs and the square on the hypotenuse. */
export function checkOf(s: IdentityState): { legs: number; hyp: number; tex: string } {
  const { ab, bc, ac } = sidesOf(s);
  const legs = clean(ab * ab + bc * bc);
  const hyp = clean(ac * ac);
  return {
    legs,
    hyp,
    tex: `${numText(ab * ab, 3)} + ${numText(bc * bc, 3)} = ${numText(hyp, 3)}`,
  };
}

const act = actionsFor<IdentityState>();
const by = z.union([z.literal(1), z.literal(-1)]);

export const unitIdentity = defineProp({
  type: "unitIdentity",
  describe:
    "The trigonometric identities from Pythagoras (NCERT 8.5). A right triangle ABC, right-angled at B, with angle A; AB² + BC² = AC² divided by AC² gives a triangle with hypotenuse 1 and legs cos A and sin A, so cos²A + sin²A = 1; divided by AB² gives legs 1 and tan A with hypotenuse sec A, so 1 + tan²A = sec²A; divided by BC² gives legs cot A and 1 with hypotenuse cosec A, so cot²A + 1 = cosec²A. The learner turns angle A and switches the division; squares on the sides show the two smaller areas always adding up to the biggest, with the numbers checked underneath.",
  state: identityState,
  defaults: {
    angle: 35,
    angleStep: 5,
    divideBy: DivideBy.Hypotenuse,
    showSquares: true,
    canSetAngle: true,
    canDivide: true,
  },
  inputs: ["showSquares", "canSetAngle", "canDivide"],
  derived: {
    [IdentityDerived.Sides]: {
      describe: "AB, BC and AC after the division (numbers)",
      compute: sidesOf,
    },
    [IdentityDerived.Identity]: {
      describe: "The identity this division gives, as TeX",
      compute: (s) => IDENTITY_TEX[s.divideBy],
    },
    [IdentityDerived.Check]: {
      describe: "The sum of the squares on the legs and the square on the hypotenuse (equal)",
      compute: checkOf,
    },
  },
  actions: {
    [IdentityAction.NudgeAngle]: act({
      describe: "Make angle A bigger (by: 1) or smaller (by: −1) by one step",
      byLearner: true,
      args: z.object({ by }).strict(),
      run: (s, a) => {
        if (!s.canSetAngle) return set({});
        const angle = Math.min(85, Math.max(5, s.angle + a.by * s.angleStep));
        if (angle === s.angle) return set({});
        const next = { ...s, angle };
        const c = checkOf(next);
        return set(
          { angle },
          { signal: IdentitySignal.Changed, payload: { angle, legs: c.legs, hyp: c.hyp } },
        );
      },
    }),
    [IdentityAction.Divide]: act({
      describe:
        "Divide AB² + BC² = AC² by the square of a side: hypotenuse (sin, cos), adjacent (tan, sec) or opposite (cot, cosec)",
      byLearner: true,
      args: z.object({ by: z.nativeEnum(DivideBy) }).strict(),
      run: (s, a) => {
        if (!s.canDivide || a.by === s.divideBy) return set({});
        const next = { ...s, divideBy: a.by };
        const c = checkOf(next);
        return set(
          { divideBy: a.by },
          {
            signal: IdentitySignal.Changed,
            payload: { divideBy: a.by, identity: IDENTITY_TEX[a.by], legs: c.legs, hyp: c.hyp },
          },
        );
      },
    }),
  },
  signals: {
    [IdentitySignal.Changed]: {
      describe: "The angle or the division changed; the payload has the new sums",
    },
  },
  observe: (s) => {
    const sides = sidesOf(s);
    const names = SIDE_NAMES[s.divideBy];
    const c = checkOf(s);
    const elements: Element[] = [
      {
        id: IdentityPart.Triangle,
        value: `right triangle ABC, right angle at B, angle A = ${s.angle}°; AB = ${names.ab} = ${numText(sides.ab, 3)}, BC = ${names.bc} = ${numText(sides.bc, 3)}, AC = ${names.ac} = ${numText(sides.ac, 3)}`,
      },
    ];
    if (s.showSquares)
      elements.push({
        id: IdentityPart.Squares,
        value: `squares on the sides: ${numText(sides.ab ** 2, 3)}, ${numText(sides.bc ** 2, 3)} and ${numText(sides.ac ** 2, 3)}`,
      });
    elements.push({ id: IdentityPart.Check, value: `${IDENTITY_TEX[s.divideBy]}: ${c.tex}` });
    return {
      summary: `Dividing AB² + BC² = AC² by the ${s.divideBy === DivideBy.Hypotenuse ? "hypotenuse" : s.divideBy === DivideBy.Adjacent ? "adjacent side" : "opposite side"}'s square gives ${IDENTITY_TEX[s.divideBy]}; at A = ${s.angle}°, ${c.tex}.`,
      elements,
    };
  },
  parts: (s) => [
    IdentityPart.Triangle,
    ...(s.showSquares ? [IdentityPart.Squares] : []),
    IdentityPart.Check,
    ...(s.canSetAngle || s.canDivide ? [IdentityPart.Controls] : []),
  ],
});

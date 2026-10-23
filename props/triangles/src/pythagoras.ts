import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { anglesOf, clean, isTriangle, near, numText } from "./geometry";

/**
 * The Pythagoras Theorem by similarity (NCERT 6.6), in a triangle ABC right-angled at B.
 * - squares: a square on each side; the square on the hypotenuse AC has the area of the other two
 *   together (AC² = AB² + BC²).
 * - altitude: the steps of the proof. BD ⊥ AC; ∆ADB ~ ∆ABC gives AD·AC = AB²; ∆BDC ~ ∆ABC gives
 *   CD·AC = BC²; adding, AC² = AB² + BC² (Theorems 6.7, 6.8).
 * - converse: any three sides; when the square of one equals the sum of the squares of the other two,
 *   the angle opposite it is a right angle (Theorem 6.9).
 */

export const PythMode = { Squares: "squares", Altitude: "altitude", Converse: "converse" } as const;
export type PythMode = (typeof PythMode)[keyof typeof PythMode];

export const PythSide = { AB: "ab", BC: "bc", CA: "ca" } as const;
export type PythSide = (typeof PythSide)[keyof typeof PythSide];

export const PythAction = {
  NudgeSide: "nudgeSide",
  SetSides: "setSides",
  Next: "next",
  Reset: "reset",
} as const;
export const PythSignal = {
  Changed: "changed",
  Stepped: "stepped",
  RightAngle: "rightAngle",
} as const;
export const PythDerived = {
  Hypotenuse: "hypotenuse",
  Squares: "squares",
  IsRight: "isRight",
  RightAt: "rightAt",
  AngleB: "angleB",
  AD: "ad",
  CD: "cd",
  BD: "bd",
} as const;
export const PythPart = {
  Triangle: "triangle",
  Squares: "squares",
  Altitude: "altitude",
  Working: "working",
  Verdict: "verdict",
  Controls: "controls",
  Next: "next",
} as const;

/** Steps of the altitude proof after the bare triangle. */
export const PROOF_STEPS = 3;

const pythState = z
  .object({
    mode: z.nativeEnum(PythMode),
    /** AB and BC: the two sides that meet at B (the legs, when B is a right angle). */
    ab: z.number().min(0.1).max(1000),
    bc: z.number().min(0.1).max(1000),
    /** CA: used in converse mode (in the others it is the hypotenuse, worked out). */
    ca: z.number().min(0.1).max(1000),
    /** How many proof steps are shown (altitude mode). */
    step: z.number().int().min(0).max(PROOF_STEPS),
    /** Names of A, B, C, D (D: the foot of the perpendicular from B). */
    names: z.array(z.string().min(1).max(3)).length(4),
    /** How far one tap changes a side. */
    sideStep: z.number().min(0.1).max(100),
    unit: z.string().max(4),
    canSetSides: z.boolean(),
    canStep: z.boolean(),
    /** Write each square's area inside it. */
    showAreas: z.boolean(),
  })
  .strict();
export type PythState = z.infer<typeof pythState>;

/** The sides AB, BC, CA as drawn: in squares and altitude modes CA is the hypotenuse. */
export function sidesOf(s: Pick<PythState, "mode" | "ab" | "bc" | "ca">): {
  ab: number;
  bc: number;
  ca: number;
} {
  return s.mode === PythMode.Converse
    ? { ab: s.ab, bc: s.bc, ca: s.ca }
    : { ab: s.ab, bc: s.bc, ca: clean(Math.hypot(s.ab, s.bc)) };
}

export function squaresOf(s: Pick<PythState, "mode" | "ab" | "bc" | "ca">): {
  ab: number;
  bc: number;
  ca: number;
} {
  const t = sidesOf(s);
  return { ab: clean(t.ab ** 2), bc: clean(t.bc ** 2), ca: clean(t.ca ** 2) };
}

/** The vertex with a right angle (the square of the opposite side = sum of the other two), or null. */
export function rightAtOf(s: Pick<PythState, "mode" | "ab" | "bc" | "ca">): "A" | "B" | "C" | null {
  const q = squaresOf(s);
  if (near(q.ca, q.ab + q.bc, 1e-9)) return "B";
  if (near(q.bc, q.ab + q.ca, 1e-9)) return "A";
  if (near(q.ab, q.bc + q.ca, 1e-9)) return "C";
  return null;
}

export const angleBOf = (s: Pick<PythState, "mode" | "ab" | "bc" | "ca">): number => {
  const t = sidesOf(s);
  return isTriangle(t) ? Math.round(anglesOf(t)[1] * 10) / 10 : Number.NaN;
};

/** AD, CD, BD for the perpendicular BD to AC in the right triangle. */
export function altitudeOf(s: Pick<PythState, "ab" | "bc">): {
  ad: number;
  cd: number;
  bd: number;
} {
  const ac = Math.hypot(s.ab, s.bc);
  return {
    ad: clean((s.ab * s.ab) / ac),
    cd: clean((s.bc * s.bc) / ac),
    bd: clean((s.ab * s.bc) / ac),
  };
}

function changed(before: PythState, after: PythState): Emit[] {
  const out: Emit[] = [
    { signal: PythSignal.Changed, payload: { sides: sidesOf(after), rightAt: rightAtOf(after) } },
  ];
  if (after.mode === PythMode.Converse && rightAtOf(after) !== null && rightAtOf(before) === null)
    out.push({ signal: PythSignal.RightAngle, payload: { at: rightAtOf(after) } });
  return out;
}

const act = actionsFor<PythState>();
const by = z.union([z.literal(1), z.literal(-1)]);

export const pythagoras = defineProp({
  type: "pythagoras",
  describe:
    "The Pythagoras Theorem (NCERT 6.6) in a triangle ABC right-angled at B. Squares mode draws a square on each side: the square on the hypotenuse AC equals the other two together. Altitude mode steps through the proof by similarity: the perpendicular BD to AC makes ∆ADB ~ ∆ABC (so AD·AC = AB²) and ∆BDC ~ ∆ABC (so CD·AC = BC²); adding gives AC² = AB² + BC². Converse mode takes any three sides and says whether the square of one equals the sum of the squares of the others, which makes the angle opposite it a right angle.",
  state: pythState,
  defaults: {
    mode: PythMode.Squares,
    ab: 3,
    bc: 4,
    ca: 5,
    step: 0,
    names: ["A", "B", "C", "D"],
    sideStep: 1,
    unit: "",
    canSetSides: true,
    canStep: true,
    showAreas: true,
  },
  inputs: ["canSetSides", "canStep", "showAreas"],
  invariant: (s) => (!isTriangle(sidesOf(s)) ? "the sides don't make a triangle" : undefined),
  derived: {
    [PythDerived.Hypotenuse]: {
      describe:
        "AC worked out as √(AB² + BC²) (squares and altitude modes), or as given (converse)",
      compute: (s) => sidesOf(s).ca,
    },
    [PythDerived.Squares]: { describe: "AB², BC², CA²", compute: squaresOf },
    [PythDerived.IsRight]: {
      describe: "Whether the triangle has a right angle",
      compute: (s) => rightAtOf(s) !== null,
    },
    [PythDerived.RightAt]: {
      describe: "The vertex with the right angle (A, B, C) or null",
      compute: rightAtOf,
    },
    [PythDerived.AngleB]: { describe: "The angle B in degrees", compute: angleBOf },
    [PythDerived.AD]: {
      describe: "AD, where BD ⊥ AC (altitude mode)",
      compute: (s) => altitudeOf(s).ad,
    },
    [PythDerived.CD]: { describe: "CD (altitude mode)", compute: (s) => altitudeOf(s).cd },
    [PythDerived.BD]: { describe: "BD (altitude mode)", compute: (s) => altitudeOf(s).bd },
  },
  actions: {
    [PythAction.NudgeSide]: act({
      describe:
        "Lengthen (by: 1) or shorten (by: −1) a side: AB or BC (the hypotenuse follows), or in converse mode any of AB, BC, CA",
      byLearner: true,
      args: z.object({ side: z.nativeEnum(PythSide), by }).strict(),
      run: (s, a) => {
        if (!s.canSetSides) return set({});
        if (a.side === PythSide.CA && s.mode !== PythMode.Converse) return set({});
        const v = clean(s[a.side] + a.by * s.sideStep);
        if (v <= 0) return set({});
        const next = { ...s, [a.side]: v };
        if (!isTriangle(sidesOf(next))) return set({});
        return set({ [a.side]: v }, ...changed(s, next));
      },
    }),
    [PythAction.SetSides]: act({
      describe: "Set the sides (CA only matters in converse mode)",
      args: z
        .object({
          ab: z.number().positive(),
          bc: z.number().positive(),
          ca: z.number().positive().optional(),
        })
        .strict(),
      run: (s, a) => {
        const next = { ...s, ab: a.ab, bc: a.bc, ca: a.ca ?? s.ca };
        if (!isTriangle(sidesOf(next))) return set({});
        return set({ ab: next.ab, bc: next.bc, ca: next.ca }, ...changed(s, next));
      },
    }),
    [PythAction.Next]: act({
      describe: "Show the next step of the proof (altitude mode)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.mode !== PythMode.Altitude || s.step >= PROOF_STEPS) return set({});
        return set(
          { step: s.step + 1 },
          { signal: PythSignal.Stepped, payload: { step: s.step + 1 } },
        );
      },
    }),
    [PythAction.Reset]: act({
      describe: "Start the proof again",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: {
    [PythSignal.Changed]: {
      describe: "A side changed; the payload has the sides and where any right angle is",
    },
    [PythSignal.Stepped]: { describe: "A proof step was shown; the payload has the step" },
    [PythSignal.RightAngle]: {
      describe: "In converse mode the triangle has just become right-angled",
    },
  },
  observe: (s) => {
    const [A, B, C, D] = s.names as [string, string, string, string];
    const t = sidesOf(s);
    const q = squaresOf(s);
    const u = s.unit === "" ? "" : ` ${s.unit}`;
    const right = rightAtOf(s);
    const elements: Element[] = [
      {
        id: PythPart.Triangle,
        value: `${A}${B} = ${numText(t.ab)}${u}, ${B}${C} = ${numText(t.bc)}${u}, ${C}${A} = ${numText(t.ca)}${u}`,
      },
    ];
    if (s.mode === PythMode.Squares && s.showAreas)
      elements.push({
        id: PythPart.Squares,
        value: `squares ${numText(q.ab)}, ${numText(q.bc)}, ${numText(q.ca)}: ${numText(q.ab)} + ${numText(q.bc)} = ${numText(q.ca)}`,
      });
    if (s.mode === PythMode.Altitude) {
      const lines = [
        `${B}${D} ⊥ ${A}${C}`,
        `∆${A}${D}${B} ~ ∆${A}${B}${C}, so ${A}${D}·${A}${C} = ${A}${B}²`,
        `∆${B}${D}${C} ~ ∆${A}${B}${C}, so ${C}${D}·${A}${C} = ${B}${C}²`,
        `adding: ${A}${C}² = ${A}${B}² + ${B}${C}²`,
      ];
      elements.push({ id: PythPart.Working, value: lines.slice(0, s.step + 1).join("; ") });
    }
    if (s.mode === PythMode.Converse)
      elements.push({
        id: PythPart.Verdict,
        value:
          right === null
            ? `no right angle: ∠${B} = ${numText(angleBOf(s), 1)}°`
            : `right angle at ${right === "A" ? A : right === "B" ? B : C}`,
      });
    if (s.canSetSides) elements.push({ id: PythPart.Controls, value: "change the sides" });
    return {
      summary:
        s.mode === PythMode.Converse
          ? `Triangle ${A}${B}${C} with sides ${numText(t.ab)}, ${numText(t.bc)}, ${numText(t.ca)}${u}.`
          : `Triangle ${A}${B}${C}, right-angled at ${B}, with ${A}${B} = ${numText(t.ab)}${u} and ${B}${C} = ${numText(t.bc)}${u}.`,
      elements,
      hidden: s.mode === PythMode.Converse ? { rightAt: right } : { hypotenuse: t.ca },
    };
  },
  parts: (s) => [
    PythPart.Triangle,
    ...(s.mode === PythMode.Squares ? [PythPart.Squares] : []),
    ...(s.mode === PythMode.Altitude ? [PythPart.Altitude, PythPart.Working] : []),
    ...(s.mode === PythMode.Altitude && s.canStep ? [PythPart.Next] : []),
    ...(s.mode === PythMode.Converse ? [PythPart.Verdict] : []),
    ...(s.canSetSides ? [PythPart.Controls] : []),
  ],
});

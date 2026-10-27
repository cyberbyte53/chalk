import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Döbereiner's triads (NCERT 5.1.1): three elements with similar properties, written in order of
 * increasing atomic mass. In a triad the middle element's mass is roughly the average of the other
 * two. The learner steps from the three cards to the average, then the verdict.
 */

/** The groups of three the chapter uses, with the masses it prints. */
export const TriadSet = {
  LiNaK: "LiNaK",
  CaSrBa: "CaSrBa",
  ClBrI: "ClBrI",
  NPAs: "NPAs",
} as const;
export type TriadSet = (typeof TriadSet)[keyof typeof TriadSet];

export const TRIADS: Readonly<Record<TriadSet, readonly [string, number][]>> = {
  LiNaK: [
    ["Li", 6.9],
    ["Na", 23.0],
    ["K", 39.0],
  ],
  CaSrBa: [
    ["Ca", 40.1],
    ["Sr", 87.6],
    ["Ba", 137.3],
  ],
  ClBrI: [
    ["Cl", 35.5],
    ["Br", 79.9],
    ["I", 126.9],
  ],
  NPAs: [
    ["N", 14.0],
    ["P", 31.0],
    ["As", 74.9],
  ],
};

/** Within this share of the middle mass counts as "roughly the average". */
export const TRIAD_TOLERANCE = 0.03;

/** Step 0: the three cards. 1: the average of the outer two. 2: the verdict. */
export const TRIAD_STEPS = 3;

export function averageOf(set: TriadSet): number {
  const t = TRIADS[set];
  return (
    Math.round((((t[0] as [string, number])[1] + (t[2] as [string, number])[1]) / 2) * 100) / 100
  );
}

export function middleOf(set: TriadSet): number {
  return (TRIADS[set][1] as [string, number])[1];
}

export function isTriad(set: TriadSet): boolean {
  const mid = middleOf(set);
  return Math.abs(averageOf(set) - mid) / mid <= TRIAD_TOLERANCE;
}

export const TriadAction = { Next: "next", Reset: "reset", Pick: "pick" } as const;
export const TriadSignal = { Stepped: "stepped", Judged: "judged", Picked: "picked" } as const;
export const TriadDerived = {
  Average: "average",
  Middle: "middle",
  IsTriad: "isTriad",
  IsDone: "isDone",
} as const;
export const TriadPart = {
  Cards: "cards",
  Average: "average",
  Verdict: "verdict",
  Next: "next",
  Pick: "pick",
} as const;

const triadState = z
  .object({
    set: z.nativeEnum(TriadSet),
    step: z
      .number()
      .int()
      .min(0)
      .max(TRIAD_STEPS - 1),
    canStep: z.boolean(),
    /** Groups the learner may switch to; empty: this one only. */
    choices: z.array(z.nativeEnum(TriadSet)),
  })
  .strict();
export type TriadState = z.infer<typeof triadState>;

export function describeTriad(s: TriadState): string {
  const t = TRIADS[s.set];
  const cards = t.map(([sym, m]) => `${sym} (${m})`).join(", ");
  if (s.step === 0) return `Three element cards in order of mass: ${cards}.`;
  const avg = `The average of the first and last masses is ${averageOf(s.set)}; the middle mass is ${middleOf(s.set)}.`;
  if (s.step === 1) return `${cards}. ${avg}`;
  return `${cards}. ${avg} ${isTriad(s.set) ? "They are close: a Döbereiner triad." : "They are far apart: not a triad."}`;
}

const act = actionsFor<TriadState>();

export const triadChecker = defineProp({
  type: "triadChecker",
  describe:
    "Döbereiner's triads: three element cards in order of increasing atomic mass. Stepping on shows the average of the first and last masses beside the middle one, then whether they are close enough to make a triad. Groups: Li/Na/K, Ca/Sr/Ba, Cl/Br/I (triads) and N/P/As (not a triad).",
  state: triadState,
  defaults: { set: TriadSet.LiNaK, step: 0, canStep: true, choices: [] },
  inputs: ["canStep", "choices"],
  derived: {
    [TriadDerived.Average]: {
      describe: "The average of the first and last atomic masses",
      compute: (s) => averageOf(s.set),
    },
    [TriadDerived.Middle]: {
      describe: "The middle element's atomic mass",
      compute: (s) => middleOf(s.set),
    },
    [TriadDerived.IsTriad]: {
      describe: "Whether the middle mass is roughly the average (a Döbereiner triad)",
      compute: (s) => isTriad(s.set),
    },
    [TriadDerived.IsDone]: {
      describe: "The verdict is showing",
      compute: (s) => s.step === TRIAD_STEPS - 1,
    },
  },
  actions: {
    [TriadAction.Next]: act({
      describe: "Show the next step: the average, then the verdict",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (s.step >= TRIAD_STEPS - 1) return set({});
        const step = s.step + 1;
        return set(
          { step },
          step === TRIAD_STEPS - 1
            ? { signal: TriadSignal.Judged, payload: { set: s.set, isTriad: isTriad(s.set) } }
            : { signal: TriadSignal.Stepped, payload: { step } },
        );
      },
    }),
    [TriadAction.Reset]: act({
      describe: "Back to the three cards",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [TriadAction.Pick]: act({
      describe: "Try another group of three (one of `choices`)",
      byLearner: true,
      args: z.object({ set: z.nativeEnum(TriadSet) }).strict(),
      run: (s, a) =>
        s.choices.includes(a.set)
          ? set({ set: a.set, step: 0 }, { signal: TriadSignal.Picked, payload: { set: a.set } })
          : set({}),
    }),
  },
  signals: {
    [TriadSignal.Stepped]: { describe: "Moved to `step`" },
    [TriadSignal.Judged]: { describe: "The verdict is shown: `isTriad`" },
    [TriadSignal.Picked]: { describe: "Switched to the group `set`" },
  },
  observe: (s) => ({
    summary: describeTriad(s),
    elements: [
      { id: TriadPart.Cards, value: TRIADS[s.set].map(([sym, m]) => `${sym} ${m}`).join(", ") },
      ...(s.step >= 1 ? [{ id: TriadPart.Average, value: String(averageOf(s.set)) }] : []),
      ...(s.step >= 2
        ? [{ id: TriadPart.Verdict, value: isTriad(s.set) ? "a triad" : "not a triad" }]
        : []),
    ],
  }),
  parts: (s) => [
    TriadPart.Cards,
    ...(s.step >= 1 ? [TriadPart.Average] : []),
    ...(s.step >= 2 ? [TriadPart.Verdict] : []),
    ...(s.canStep ? [TriadPart.Next] : []),
    ...(s.choices.length > 0 ? [TriadPart.Pick] : []),
  ],
});

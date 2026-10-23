import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * New plants from a piece of a plant (NCERT 8.2.5 and the tissue-culture box), one method at a
 * time, step by step: potato pieces with and without buds (Activity 8.5), Bryophyllum leaf buds,
 * money-plant pieces with a leaf vs between leaves (Activity 8.6), layering, grafting, tissue
 * culture.
 */

export const Method = {
  Potato: "potato",
  Bryophyllum: "bryophyllum",
  MoneyPlant: "moneyPlant",
  Layering: "layering",
  Grafting: "grafting",
  TissueCulture: "tissueCulture",
} as const;
export type Method = (typeof Method)[keyof typeof Method];

export const METHOD_STEPS: Readonly<Record<Method, number>> = {
  potato: 3,
  bryophyllum: 3,
  moneyPlant: 3,
  layering: 3,
  grafting: 3,
  tissueCulture: 4,
};

export const MAX_PROPAGATION_STEPS = 4;

export const PropagationAction = { Next: "next", Reset: "reset", Choose: "choose" } as const;
export const PropagationSignal = { Stepped: "stepped", Chosen: "chosen" } as const;
export const PropagationDerived = {
  StepCount: "stepCount",
  IsDone: "isDone",
  Grew: "grew",
} as const;
export const PropagationPart = { Picture: "picture", Next: "next", Choices: "choices" } as const;

const propagationState = z
  .object({
    method: z.nativeEnum(Method),
    step: z
      .number()
      .int()
      .min(0)
      .max(MAX_PROPAGATION_STEPS - 1),
    showNames: z.boolean(),
    canStep: z.boolean(),
    /** Methods the learner can switch between; empty: none. */
    choices: z.array(z.nativeEnum(Method)),
  })
  .strict();
export type PropagationState = z.infer<typeof propagationState>;

export const stepsOfMethod = (m: Method): number => METHOD_STEPS[m];

/**
 * The experiments' results, once they are showing: which pieces grew. Potato: the two pieces with
 * a bud; money plant: the piece with a leaf. Null before the result step, and for the methods that
 * aren't experiments.
 */
export function grewOf(s: Pick<PropagationState, "method" | "step">): string | null {
  if (s.step < stepsOfMethod(s.method) - 1) return null;
  if (s.method === Method.Potato) return "piecesWithBuds";
  if (s.method === Method.MoneyPlant) return "pieceWithLeaf";
  return null;
}

const WORDS: Readonly<Record<Method, readonly string[]>> = {
  potato: [
    "Day 0: a potato cut into four pieces; two have a notch with a bud (an 'eye'), two don't. They sit on wet cotton.",
    "Day 3: the pieces with a bud begin to sprout.",
    "Day 7: only the pieces with a bud have green shoots and roots. The pieces without a bud have not grown.",
  ],
  bryophyllum: [
    "A Bryophyllum leaf: buds grow in the notches along its edge.",
    "The leaf falls on the soil.",
    "The buds develop into new little plants.",
  ],
  moneyPlant: [
    "Day 0: two money-plant pieces in water: one with a leaf, one cut from between two leaves.",
    "Day 5: the piece with a leaf grows roots.",
    "Day 10: the piece with a leaf has roots and a fresh leaf; the piece from between two leaves has grown nothing.",
  ],
  layering: [
    "Layering: a low branch of the plant is bent down and covered with soil, still joined to the parent.",
    "Roots grow from the buried part of the branch.",
    "The rooted branch is cut from the parent: a new plant.",
  ],
  grafting: [
    "Grafting: a rooted plant (the stock) and a cut shoot of the plant we want (the scion).",
    "The scion is joined to the cut stock and tied firmly.",
    "They grow as one plant, and it bears the scion's flowers.",
  ],
  tissueCulture: [
    "Tissue culture: cells are taken from the growing tip of a plant.",
    "In an artificial medium they divide rapidly into a small group of cells, a callus.",
    "In another medium, with hormones for growth and differentiation, the callus forms plantlets.",
    "The plantlets are placed in soil and grow into mature plants. Many plants from one parent, disease-free.",
  ],
};

export function describePropagation(s: PropagationState): string {
  const w = WORDS[s.method];
  return w[s.step] ?? w[0] ?? "";
}

const act = actionsFor<PropagationState>();

export const plantPropagation = defineProp({
  type: "plantPropagation",
  describe:
    "New plants from parts of a plant, step by step: potato pieces with/without a bud on wet cotton (Activity 8.5), Bryophyllum leaf buds, money-plant pieces with a leaf vs from between two leaves (Activity 8.6), layering, grafting (stock + scion), and tissue culture (tip cells → callus → plantlets → soil).",
  state: propagationState,
  defaults: {
    method: Method.Potato,
    step: 0,
    showNames: true,
    canStep: true,
    choices: [],
  },
  inputs: ["method", "showNames", "canStep", "choices"],
  invariant: (s) =>
    s.step < stepsOfMethod(s.method) ? undefined : "step is past the last step for this method",
  derived: {
    [PropagationDerived.StepCount]: {
      describe: "How many steps this method's picture has",
      compute: (s) => stepsOfMethod(s.method),
    },
    [PropagationDerived.IsDone]: {
      describe: "The last step is showing",
      compute: (s) => s.step === stepsOfMethod(s.method) - 1,
    },
    [PropagationDerived.Grew]: {
      describe:
        "The experiment's result once it shows: 'piecesWithBuds' (potato), 'pieceWithLeaf' (money plant), else null",
      compute: (s) => grewOf(s),
    },
  },
  actions: {
    [PropagationAction.Next]: act({
      describe: "Show the next step (stays on the last)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, stepsOfMethod(s.method) - 1);
        return set({ step }, { signal: PropagationSignal.Stepped, payload: { step } });
      },
    }),
    [PropagationAction.Reset]: act({
      describe: "Back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [PropagationAction.Choose]: act({
      describe: "Switch to another method (from `choices`), at its first step",
      byLearner: true,
      args: z.object({ method: z.nativeEnum(Method) }).strict(),
      run: (_s, a) =>
        set(
          { method: a.method, step: 0 },
          { signal: PropagationSignal.Chosen, payload: { method: a.method } },
        ),
    }),
  },
  signals: {
    [PropagationSignal.Stepped]: { describe: "Moved to `step`" },
    [PropagationSignal.Chosen]: { describe: "The learner picked `method`" },
  },
  observe: (s) => ({
    summary: describePropagation(s),
    elements: [{ id: PropagationPart.Picture, value: describePropagation(s) }],
  }),
  parts: (s) =>
    s.choices.length > 0
      ? [PropagationPart.Picture, PropagationPart.Next, PropagationPart.Choices]
      : [PropagationPart.Picture, PropagationPart.Next],
});

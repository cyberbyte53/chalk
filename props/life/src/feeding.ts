import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * How single-celled organisms take in food (NCERT 6.2.3). Amoeba, step by step: food nearby;
 * temporary finger-like extensions (pseudopodia) flow round it; they fuse into a food vacuole;
 * inside, the food is broken down and the simple substances diffuse into the cytoplasm, and what
 * can't be digested is thrown out at the surface. Paramoecium: a cell of fixed shape covered in
 * cilia, whose beating sweeps food to one particular spot, where it is taken in.
 */

export const FeedingKind = { Amoeba: "amoeba", Paramoecium: "paramoecium" } as const;
export type FeedingKind = (typeof FeedingKind)[keyof typeof FeedingKind];

export const AMOEBA_STEPS = 4;
export const PARAMOECIUM_STEPS = 2;

export const FeedingAction = { Next: "next", Reset: "reset" } as const;
export const FeedingSignal = { Stepped: "stepped" } as const;
export const FeedingDerived = { StepCount: "stepCount", IsDone: "isDone" } as const;
export const FeedingPart = { Cell: "cell", Next: "next" } as const;

const feedingState = z
  .object({
    kind: z.nativeEnum(FeedingKind),
    step: z
      .number()
      .int()
      .min(0)
      .max(AMOEBA_STEPS - 1),
    showNames: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type FeedingState = z.infer<typeof feedingState>;

export const feedingSteps = (kind: FeedingKind): number =>
  kind === FeedingKind.Amoeba ? AMOEBA_STEPS : PARAMOECIUM_STEPS;

const AMOEBA_WORDS = [
  "An Amoeba, a single cell with no fixed shape, near a food particle.",
  "It pushes out temporary finger-like extensions of its surface (pseudopodia) that flow round the food.",
  "The extensions fuse over the food, trapping it in a food vacuole inside the cell.",
  "Inside the food vacuole the food is broken down into simple substances, which diffuse into the cytoplasm. The undigested remains move to the surface and are thrown out.",
] as const;

const PARAMOECIUM_WORDS = [
  "A Paramoecium: a single cell with a definite shape, covered in tiny hair-like cilia.",
  "The cilia beat and sweep food to one particular spot on the cell (the oral groove), where it is taken in to form a food vacuole.",
] as const;

export function describeFeeding(s: FeedingState): string {
  const words = s.kind === FeedingKind.Amoeba ? AMOEBA_WORDS : PARAMOECIUM_WORDS;
  return words[s.step] ?? words[0];
}

const act = actionsFor<FeedingState>();

export const cellFeeding = defineProp({
  type: "cellFeeding",
  describe:
    "How a single cell takes in food. Amoeba (4 steps): food nearby, pseudopodia flow round it, a food vacuole forms, the food is digested and diffuses into the cytoplasm while waste is thrown out. Paramoecium (2 steps): cilia sweep food to one fixed spot where it is taken in.",
  state: feedingState,
  defaults: { kind: FeedingKind.Amoeba, step: 0, showNames: true, canStep: true },
  inputs: ["kind", "showNames", "canStep"],
  invariant: (s) =>
    s.step < feedingSteps(s.kind) ? undefined : "step is past the last step for this organism",
  derived: {
    [FeedingDerived.StepCount]: {
      describe: "How many steps this organism's feeding has",
      compute: (s) => feedingSteps(s.kind),
    },
    [FeedingDerived.IsDone]: {
      describe: "The last step is showing",
      compute: (s) => s.step === feedingSteps(s.kind) - 1,
    },
  },
  actions: {
    [FeedingAction.Next]: act({
      describe: "Show the next step (stays on the last)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, feedingSteps(s.kind) - 1);
        return set({ step }, { signal: FeedingSignal.Stepped, payload: { step } });
      },
    }),
    [FeedingAction.Reset]: act({
      describe: "Back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: { [FeedingSignal.Stepped]: { describe: "Moved to `step`" } },
  observe: (s) => ({
    summary: describeFeeding(s),
    elements: [{ id: FeedingPart.Cell, value: describeFeeding(s) }],
  }),
  parts: () => [FeedingPart.Cell, FeedingPart.Next],
});

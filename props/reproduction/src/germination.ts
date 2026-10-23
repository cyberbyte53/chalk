import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Activity 8.7 and Fig 8.9: Bengal gram (chana) seeds soaked overnight, kept under a wet cloth for
 * a day, then cut open; and a seed germinating: the radicle (future root), the plumule (future
 * shoot) and the cotyledons (food store).
 */

export const GERMINATION_STEPS = 4;

export const GerminationAction = { Next: "next", Reset: "reset" } as const;
export const GerminationSignal = { Stepped: "stepped" } as const;
export const GerminationDerived = { IsDone: "isDone" } as const;
export const GerminationPart = { Picture: "picture", Next: "next" } as const;

const germinationState = z
  .object({
    step: z
      .number()
      .int()
      .min(0)
      .max(GERMINATION_STEPS - 1),
    showNames: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type GerminationState = z.infer<typeof germinationState>;

const WORDS = [
  "Dry Bengal gram (chana) seeds.",
  "Soaked overnight in water, the seeds swell.",
  "Kept under a wet cloth for a day, a tiny root (the radicle) pushes out of each seed.",
  "A seed cut open: two cotyledons (the food store), the radicle (future root) and the plumule (future shoot). Under the right conditions the embryo grows into a seedling: germination.",
] as const;

export const describeGermination = (s: GerminationState): string => WORDS[s.step] ?? WORDS[0];

const act = actionsFor<GerminationState>();

export const seedGermination = defineProp({
  type: "seedGermination",
  describe:
    "Activity 8.7 step by step: dry chana, soaked overnight (swollen), under a wet cloth for a day (radicle out), then one cut open showing cotyledons, radicle and plumule (Fig 8.9).",
  state: germinationState,
  defaults: { step: 0, showNames: true, canStep: true },
  inputs: ["showNames", "canStep"],
  derived: {
    [GerminationDerived.IsDone]: {
      describe: "The cut-open seed (the last step) is showing",
      compute: (s) => s.step === GERMINATION_STEPS - 1,
    },
  },
  actions: {
    [GerminationAction.Next]: act({
      describe: "Show the next step (stays on the last)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, GERMINATION_STEPS - 1);
        return set({ step }, { signal: GerminationSignal.Stepped, payload: { step } });
      },
    }),
    [GerminationAction.Reset]: act({
      describe: "Back to the dry seeds",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: { [GerminationSignal.Stepped]: { describe: "Moved to `step`" } },
  observe: (s) => ({
    summary: describeGermination(s),
    elements: [{ id: GerminationPart.Picture, value: describeGermination(s) }],
  }),
  parts: () => [GerminationPart.Picture, GerminationPart.Next],
});

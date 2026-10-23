import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Why sexual reproduction needs special germ cells (NCERT 8.3.1). Three modes:
 *  - doubling: if two parents simply combined their full DNA, each generation would have twice as
 *    much: 4 → 8 → 16 chromosomes, which would mess up the cell's control;
 *  - halving: special cells made by meiosis carry half (2 of 4); two of them fuse into a zygote
 *    with 4 again, the same as the parents;
 *  - gametes: in very simple organisms the two germ cells are alike; in complex ones one is large
 *    with a food store (the female gamete, egg) and one small and motile (the male gamete, sperm).
 */

export const GermMode = { Doubling: "doubling", Halving: "halving", Gametes: "gametes" } as const;
export type GermMode = (typeof GermMode)[keyof typeof GermMode];

/** Chromosomes in a body cell of the made-up organism drawn here. */
export const BODY_CHROMOSOMES = 4;

export const GERM_STEPS: Readonly<Record<GermMode, number>> = {
  doubling: 3,
  halving: 3,
  gametes: 2,
};

export const GermAction = { Next: "next", Reset: "reset" } as const;
export const GermSignal = { Stepped: "stepped" } as const;
export const GermDerived = {
  StepCount: "stepCount",
  IsDone: "isDone",
  ChildChromosomes: "childChromosomes",
} as const;
export const GermPart = { Picture: "picture", Next: "next" } as const;

const germState = z
  .object({
    mode: z.nativeEnum(GermMode),
    step: z.number().int().min(0).max(2),
    showNames: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type GermState = z.infer<typeof germState>;

/**
 * The newest cells' chromosome count at this step: doubling 4, 8, 16; halving 4, 2 (germ cells),
 * 4 (zygote). Null in gametes mode.
 */
export function chromosomesAt(s: Pick<GermState, "mode" | "step">): number | null {
  if (s.mode === GermMode.Doubling) return BODY_CHROMOSOMES * 2 ** s.step;
  if (s.mode === GermMode.Halving) return s.step === 1 ? BODY_CHROMOSOMES / 2 : BODY_CHROMOSOMES;
  return null;
}

const WORDS: Readonly<Record<GermMode, readonly string[]>> = {
  doubling: [
    "Two parents, each with 4 chromosomes in every body cell.",
    "If they simply combined all their DNA, the child would have 8 chromosomes: twice as much.",
    "The next generation would have 16, then 32. That much DNA would mess up the control of the cell. This cannot work.",
  ],
  halving: [
    "Two parents, each with 4 chromosomes in every body cell.",
    "Special cells in special organs divide by meiosis into germ cells with only half: 2 chromosomes each.",
    "Two germ cells fuse into a zygote with 4 chromosomes, the same as the parents. The number is re-established every generation.",
  ],
  gametes: [
    "In very simple organisms the two germ cells are not very different, or are even alike.",
    "In complex organisms they specialise: one is large and carries a food store (the female gamete, egg); the other is small and can move (the male gamete, sperm).",
  ],
};

export function describeGerm(s: GermState): string {
  const w = WORDS[s.mode];
  return w[s.step] ?? w[0] ?? "";
}

const act = actionsFor<GermState>();

export const germCells = defineProp({
  type: "germCells",
  describe:
    "Why germ cells carry half the DNA. Doubling mode (3 steps): combining full sets doubles the chromosomes every generation (4 → 8 → 16). Halving mode (3 steps): meiosis makes germ cells with half (2), and fusion restores 4 in the zygote. Gametes mode (2 steps): similar germ cells in simple organisms; a large food-storing egg (female gamete) and a small motile sperm (male gamete) in complex ones.",
  state: germState,
  defaults: { mode: GermMode.Halving, step: 0, showNames: true, canStep: true },
  inputs: ["mode", "showNames", "canStep"],
  invariant: (s) =>
    s.step < GERM_STEPS[s.mode] ? undefined : "step is past the last step for this mode",
  derived: {
    [GermDerived.StepCount]: {
      describe: "How many steps this mode has",
      compute: (s) => GERM_STEPS[s.mode],
    },
    [GermDerived.IsDone]: {
      describe: "The last step is showing",
      compute: (s) => s.step === GERM_STEPS[s.mode] - 1,
    },
    [GermDerived.ChildChromosomes]: {
      describe:
        "Chromosomes in the newest cells shown: doubling 4/8/16; halving 4, then 2 (germ cells), then 4 (zygote); null for gametes",
      compute: (s) => chromosomesAt(s),
    },
  },
  actions: {
    [GermAction.Next]: act({
      describe: "Show the next step (stays on the last)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, GERM_STEPS[s.mode] - 1);
        return set({ step }, { signal: GermSignal.Stepped, payload: { step } });
      },
    }),
    [GermAction.Reset]: act({
      describe: "Back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
  },
  signals: { [GermSignal.Stepped]: { describe: "Moved to `step`" } },
  observe: (s) => ({
    summary: describeGerm(s),
    elements: [{ id: GermPart.Picture, value: describeGerm(s) }],
  }),
  parts: () => [GermPart.Picture, GermPart.Next],
});

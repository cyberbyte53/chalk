import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Why offspring are similar but not identical (NCERT 8.1, 8.1.1). Three modes:
 *  - copy: a cell copies its DNA (one small change creeps in), builds extra cellular apparatus,
 *    and divides into two similar cells;
 *  - generations: 1 → 2 → 4 → 8 cells; small changes pile up, and one drastic change makes a cell
 *    that cannot work and dies;
 *  - niche: bacteria in temperate water, two of them heat-resistant variants; the water warms,
 *    only the variants survive, and they multiply. Variation helps the species survive.
 * The DNA is drawn as a strip of SEGMENTS blocks; a changed block is marked.
 */

export const DnaMode = { Copy: "copy", Generations: "generations", Niche: "niche" } as const;
export type DnaMode = (typeof DnaMode)[keyof typeof DnaMode];

export const SEGMENTS = 8;
export const DNA_STEPS = 4;

export const DnaAction = { Next: "next", Reset: "reset" } as const;
export const DnaSignal = { Stepped: "stepped" } as const;
export const DnaDerived = {
  StepCount: "stepCount",
  IsDone: "isDone",
  Cells: "cells",
  Alive: "alive",
  Survivors: "survivors",
} as const;
export const DnaPart = { Picture: "picture", Next: "next" } as const;

/** One cell of the generations tree: which DNA blocks have changed, and whether it can live. */
export type Lineage = { changed: readonly number[]; isDead: boolean };

/**
 * The family tree, generation by generation: each cell's accumulated changes. Fixed, so the
 * picture is the same every time. Generation 3 has one cell with a drastic change (it dies).
 */
export const GENERATIONS: readonly (readonly Lineage[])[] = [
  [{ changed: [], isDead: false }],
  [
    { changed: [], isDead: false },
    { changed: [2], isDead: false },
  ],
  [
    { changed: [], isDead: false },
    { changed: [5], isDead: false },
    { changed: [2], isDead: false },
    { changed: [2, 6], isDead: false },
  ],
  [
    { changed: [], isDead: false },
    { changed: [1], isDead: false },
    { changed: [5], isDead: false },
    { changed: [5, 3], isDead: false },
    { changed: [2], isDead: false },
    { changed: [2, 0, 1, 4, 7], isDead: true },
    { changed: [2, 6], isDead: false },
    { changed: [2, 6, 0], isDead: false },
  ],
];

/** Niche mode: 12 bacteria, two of them (indices 3 and 8) heat-resistant variants. */
export const BACTERIA = 12;
export const RESISTANT: readonly number[] = [3, 8];

const dnaState = z
  .object({
    mode: z.nativeEnum(DnaMode),
    step: z
      .number()
      .int()
      .min(0)
      .max(DNA_STEPS - 1),
    showNames: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type DnaState = z.infer<typeof dnaState>;

/** Cells showing in generations mode at this step (1, 2, 4, 8). */
export const cellsAt = (step: number): number => 2 ** step;

/** Niche mode: how many bacteria are alive at this step. */
export function survivorsAt(step: number): number {
  if (step <= 1) return BACTERIA;
  if (step === 2) return RESISTANT.length;
  return RESISTANT.length * 4;
}

const COPY_WORDS = [
  "A cell with its DNA, the blueprint for the body's design, in its nucleus.",
  "The cell builds a copy of its DNA. The copying is very good but not perfect: one small block of the copy has changed.",
  "The cell also builds extra cellular apparatus, so each DNA copy will have its own.",
  "The cell divides into two cells, each with one DNA copy. They are similar, but not identical.",
] as const;

const GENERATION_WORDS = [
  "Generation 0: one cell.",
  "Generation 1: two cells. One copy picked up a small change.",
  "Generation 2: four cells. Each copy carries the changes of the copy it came from, plus new ones.",
  "Generation 3: eight cells, similar but subtly different. One copy changed so much that it cannot work with its cell, and that cell dies.",
] as const;

const NICHE_WORDS = [
  "Bacteria living in temperate water. Most are alike; two are variants that can stand heat.",
  "The water warms up, say through global warming.",
  "Most of the bacteria die. Only the two heat-resistant variants survive.",
  "The survivors grow and multiply. The population lives on, thanks to variation.",
] as const;

export function describeDna(s: DnaState): string {
  const words =
    s.mode === DnaMode.Copy
      ? COPY_WORDS
      : s.mode === DnaMode.Generations
        ? GENERATION_WORDS
        : NICHE_WORDS;
  return words[s.step] ?? words[0];
}

const act = actionsFor<DnaState>();

export const dnaCopy = defineProp({
  type: "dnaCopy",
  describe:
    "Why offspring are similar but not identical. Copy mode (4 steps): a cell copies its DNA with one small change, builds extra apparatus and divides. Generations mode (4 steps): 1 → 2 → 4 → 8 cells; small changes pile up and one drastic change makes a cell that dies. Niche mode (4 steps): bacteria in temperate water, the water warms, only two heat-resistant variants survive, then multiply.",
  state: dnaState,
  defaults: { mode: DnaMode.Copy, step: 0, showNames: true, canStep: true },
  inputs: ["mode", "showNames", "canStep"],
  derived: {
    [DnaDerived.StepCount]: { describe: "How many steps this mode has", compute: () => DNA_STEPS },
    [DnaDerived.IsDone]: {
      describe: "The last step is showing",
      compute: (s) => s.step === DNA_STEPS - 1,
    },
    [DnaDerived.Cells]: {
      describe: "Generations mode: how many cells there are now (1, 2, 4, 8)",
      compute: (s) => (s.mode === DnaMode.Generations ? cellsAt(s.step) : null),
    },
    [DnaDerived.Alive]: {
      describe: "Generations mode: how many of those cells can live",
      compute: (s) =>
        s.mode === DnaMode.Generations
          ? (GENERATIONS[s.step] ?? []).filter((c) => !c.isDead).length
          : null,
    },
    [DnaDerived.Survivors]: {
      describe: "Niche mode: how many bacteria are alive now",
      compute: (s) => (s.mode === DnaMode.Niche ? survivorsAt(s.step) : null),
    },
  },
  actions: {
    [DnaAction.Next]: act({
      describe: "Show the next step (stays on the last)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, DNA_STEPS - 1);
        return set({ step }, { signal: DnaSignal.Stepped, payload: { step } });
      },
    }),
    [DnaAction.Reset]: act({
      describe: "Back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }, { signal: DnaSignal.Stepped, payload: { step: 0 } }),
    }),
  },
  signals: { [DnaSignal.Stepped]: { describe: "Moved to `step`" } },
  observe: (s) => ({
    summary: describeDna(s),
    elements: [{ id: DnaPart.Picture, value: describeDna(s) }],
  }),
  parts: () => [DnaPart.Picture, DnaPart.Next],
});

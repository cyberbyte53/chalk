import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * How single organisms make new ones (NCERT 8.2.1–8.2.4, 8.2.6), one organism at a time, step by
 * step: binary fission (Amoeba in any plane; Leishmania in a definite orientation), multiple
 * fission (Plasmodium), budding in yeast (Activity 8.1), fragmentation (Spirogyra), regeneration
 * (Planaria), budding (Hydra) and spores (Rhizopus, the bread mould of Activity 8.2). The lesson
 * may offer a row of organisms to choose between.
 */

export const Organism = {
  Amoeba: "amoeba",
  Leishmania: "leishmania",
  Plasmodium: "plasmodium",
  Yeast: "yeast",
  Spirogyra: "spirogyra",
  Planaria: "planaria",
  Hydra: "hydra",
  Rhizopus: "rhizopus",
} as const;
export type Organism = (typeof Organism)[keyof typeof Organism];

export const Mode = {
  BinaryFission: "binaryFission",
  MultipleFission: "multipleFission",
  Budding: "budding",
  Fragmentation: "fragmentation",
  Regeneration: "regeneration",
  Spores: "spores",
} as const;
export type Mode = (typeof Mode)[keyof typeof Mode];

/** Each organism: its mode, how many steps its picture has, and how many new individuals result. */
export const ORGANISMS: Readonly<Record<Organism, { mode: Mode; steps: number; makes: number }>> = {
  amoeba: { mode: Mode.BinaryFission, steps: 4, makes: 2 },
  leishmania: { mode: Mode.BinaryFission, steps: 3, makes: 2 },
  plasmodium: { mode: Mode.MultipleFission, steps: 3, makes: 8 },
  yeast: { mode: Mode.Budding, steps: 3, makes: 2 },
  spirogyra: { mode: Mode.Fragmentation, steps: 3, makes: 3 },
  planaria: { mode: Mode.Regeneration, steps: 3, makes: 3 },
  hydra: { mode: Mode.Budding, steps: 4, makes: 2 },
  rhizopus: { mode: Mode.Spores, steps: 3, makes: 6 },
};

export const MAX_ASEXUAL_STEPS = 4;

export const AsexualAction = { Next: "next", Reset: "reset", Choose: "choose" } as const;
export const AsexualSignal = { Stepped: "stepped", Chosen: "chosen" } as const;
export const AsexualDerived = {
  StepCount: "stepCount",
  IsDone: "isDone",
  Mode: "mode",
  Makes: "makes",
} as const;
export const AsexualPart = { Picture: "picture", Next: "next", Choices: "choices" } as const;

const asexualState = z
  .object({
    organism: z.nativeEnum(Organism),
    step: z
      .number()
      .int()
      .min(0)
      .max(MAX_ASEXUAL_STEPS - 1),
    showNames: z.boolean(),
    canStep: z.boolean(),
    /** Organisms the learner can switch between (buttons above the picture); empty: none. */
    choices: z.array(z.nativeEnum(Organism)),
  })
  .strict();
export type AsexualState = z.infer<typeof asexualState>;

export const stepsOf = (o: Organism): number => ORGANISMS[o].steps;

const WORDS: Readonly<Record<Organism, readonly string[]>> = {
  amoeba: [
    "An Amoeba: a single cell.",
    "Its nucleus divides into two.",
    "The cell pinches in two; in Amoeba the split can be in any plane.",
    "Two daughter Amoebae: binary fission.",
  ],
  leishmania: [
    "A Leishmania cell (it causes kala-azar), with a whip-like structure at one end.",
    "It divides lengthwise, in a definite orientation to the whip-like structure.",
    "Two daughter cells, each with its own whip: binary fission.",
  ],
  plasmodium: [
    "A Plasmodium cell, the malarial parasite.",
    "Its nucleus divides many times, so the cell holds many nuclei.",
    "The cell divides into many daughter cells at once: multiple fission.",
  ],
  yeast: [
    "A yeast cell in sugar water.",
    "It puts out a small bud.",
    "The bud grows, separates and grows further: budding.",
  ],
  spirogyra: [
    "A Spirogyra filament: a thread of cells.",
    "On maturing it simply breaks into smaller pieces, or fragments.",
    "Each fragment grows into a new individual: fragmentation.",
  ],
  planaria: [
    "A Planaria, a simple animal.",
    "It is cut into pieces.",
    "Each piece grows into a complete Planaria: regeneration. Specialised cells multiply and become all the cell types and tissues.",
  ],
  hydra: [
    "A Hydra, a simple many-celled animal that lives in water.",
    "Repeated cell division at one spot makes an outgrowth: a bud.",
    "The bud develops into a tiny Hydra.",
    "When fully mature it detaches and lives on its own: budding.",
  ],
  rhizopus: [
    "Bread mould (Rhizopus): thread-like hyphae spread over the bread. They are not reproductive parts.",
    "Tiny blob-on-a-stick structures grow: the blobs are sporangia, full of spores.",
    "The sporangia burst. The spores, with thick protective walls, land on a moist surface and grow into new moulds: spore formation.",
  ],
};

export function describeAsexual(s: AsexualState): string {
  const w = WORDS[s.organism];
  return w[s.step] ?? w[0] ?? "";
}

const act = actionsFor<AsexualState>();

export const asexualModes = defineProp({
  type: "asexualModes",
  describe:
    "How one organism makes new ones, step by step: binary fission (Amoeba, any plane; Leishmania, definite orientation), multiple fission (Plasmodium), budding (yeast, Hydra), fragmentation (Spirogyra), regeneration (Planaria) and spores (Rhizopus bread mould: hyphae, sporangia, spores). Optionally a row of organisms to choose between.",
  state: asexualState,
  defaults: {
    organism: Organism.Amoeba,
    step: 0,
    showNames: true,
    canStep: true,
    choices: [],
  },
  inputs: ["organism", "showNames", "canStep", "choices"],
  invariant: (s) =>
    s.step < stepsOf(s.organism) ? undefined : "step is past the last step for this organism",
  derived: {
    [AsexualDerived.StepCount]: {
      describe: "How many steps this organism's picture has",
      compute: (s) => stepsOf(s.organism),
    },
    [AsexualDerived.IsDone]: {
      describe: "The last step is showing",
      compute: (s) => s.step === stepsOf(s.organism) - 1,
    },
    [AsexualDerived.Mode]: {
      describe:
        "The mode of reproduction: binaryFission, multipleFission, budding, fragmentation, regeneration or spores",
      compute: (s) => ORGANISMS[s.organism].mode,
    },
    [AsexualDerived.Makes]: {
      describe: "How many individuals the last step shows (spores and Plasmodium: many)",
      compute: (s) => ORGANISMS[s.organism].makes,
    },
  },
  actions: {
    [AsexualAction.Next]: act({
      describe: "Show the next step (stays on the last)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, stepsOf(s.organism) - 1);
        return set({ step }, { signal: AsexualSignal.Stepped, payload: { step } });
      },
    }),
    [AsexualAction.Reset]: act({
      describe: "Back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [AsexualAction.Choose]: act({
      describe: "Switch to another organism (from `choices`), at its first step",
      byLearner: true,
      args: z.object({ organism: z.nativeEnum(Organism) }).strict(),
      run: (_s, a) =>
        set(
          { organism: a.organism, step: 0 },
          {
            signal: AsexualSignal.Chosen,
            payload: { organism: a.organism, mode: ORGANISMS[a.organism].mode },
          },
        ),
    }),
  },
  signals: {
    [AsexualSignal.Stepped]: { describe: "Moved to `step`" },
    [AsexualSignal.Chosen]: { describe: "The learner picked `organism` (its `mode` too)" },
  },
  observe: (s) => ({
    summary: describeAsexual(s),
    elements: [{ id: AsexualPart.Picture, value: describeAsexual(s) }],
  }),
  parts: (s) =>
    s.choices.length > 0
      ? [AsexualPart.Picture, AsexualPart.Next, AsexualPart.Choices]
      : [AsexualPart.Picture, AsexualPart.Next],
});

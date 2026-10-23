import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Sexual reproduction in flowering plants (NCERT 8.3.2), on a longitudinal section of a flower
 * (Fig 8.7). Modes:
 *  - parts: tap a part for its name and job (sepal, petal, anther, filament, stigma, style, ovary,
 *    ovule);
 *  - types: bisexual (Hibiscus, mustard: stamens and pistil) vs unisexual (papaya, watermelon:
 *    stamens or pistil);
 *  - pollination: self (same flower) vs cross (another flower), by wind, water or animals;
 *  - fertilisation (4 steps): pollen on the stigma → a tube grows through the style → reaches the
 *    ovule → the male germ cell fuses with the egg cell: a zygote (Fig 8.8);
 *  - fruit (3 steps): zygote → embryo in the ovule → ovule becomes a seed, ovary ripens into a fruit
 *    → the other parts shrivel and fall.
 */

export const FlowerMode = {
  Parts: "parts",
  Types: "types",
  Pollination: "pollination",
  Fertilisation: "fertilisation",
  Fruit: "fruit",
} as const;
export type FlowerMode = (typeof FlowerMode)[keyof typeof FlowerMode];

export const FlowerPart = {
  Sepal: "sepal",
  Petal: "petal",
  Anther: "anther",
  Filament: "filament",
  Stigma: "stigma",
  Style: "style",
  Ovary: "ovary",
  Ovule: "ovule",
} as const;
export type FlowerPart = (typeof FlowerPart)[keyof typeof FlowerPart];

export const FlowerType = { Bisexual: "bisexual", Unisexual: "unisexual" } as const;
export type FlowerType = (typeof FlowerType)[keyof typeof FlowerType];

export const Pollination = { Self: "self", Cross: "cross" } as const;
export type Pollination = (typeof Pollination)[keyof typeof Pollination];

export const Agent = { Wind: "wind", Water: "water", Animal: "animal" } as const;
export type Agent = (typeof Agent)[keyof typeof Agent];

export const FLOWER_STEPS: Readonly<Record<FlowerMode, number>> = {
  parts: 1,
  types: 1,
  pollination: 1,
  fertilisation: 4,
  fruit: 3,
};

/** Which reproductive organ each part belongs to: stamen (male), pistil (female), or neither. */
export const ORGAN: Readonly<Record<FlowerPart, "stamen" | "pistil" | null>> = {
  sepal: null,
  petal: null,
  anther: "stamen",
  filament: "stamen",
  stigma: "pistil",
  style: "pistil",
  ovary: "pistil",
  ovule: "pistil",
};

export const PART_JOBS: Readonly<Record<FlowerPart, string>> = {
  sepal: "Sepals: the green outer parts that protect the flower in bud.",
  petal: "Petals: often bright and scented, attracting insects that carry pollen.",
  anther:
    "Anther: the top of the stamen (the male reproductive part); it makes the yellowish pollen grains.",
  filament: "Filament: the stalk of the stamen that holds up the anther.",
  stigma:
    "Stigma: the top of the pistil (the female reproductive part), often sticky; pollen lands here.",
  style: "Style: the long middle part of the pistil; the pollen tube grows down through it.",
  ovary: "Ovary: the swollen bottom of the pistil; it holds the ovules and ripens into the fruit.",
  ovule: "Ovule: inside the ovary; each has an egg cell, the female germ cell, and becomes a seed.",
};

export const FlowerAction = {
  Tap: "tap",
  Next: "next",
  Reset: "reset",
  SetPollination: "setPollination",
  SetAgent: "setAgent",
  SetType: "setType",
} as const;
export const FlowerSignal = { Tapped: "tapped", Stepped: "stepped", Changed: "changed" } as const;
export const FlowerDerived = {
  StepCount: "stepCount",
  IsDone: "isDone",
  Job: "job",
  Organ: "organ",
} as const;
export const FlowerPartId = {
  Picture: "picture",
  Next: "next",
  Choices: "choices",
  ...FlowerPart,
} as const;

const flowerState = z
  .object({
    mode: z.nativeEnum(FlowerMode),
    step: z.number().int().min(0).max(3),
    selected: z.nativeEnum(FlowerPart).nullable(),
    flowerType: z.nativeEnum(FlowerType),
    pollination: z.nativeEnum(Pollination),
    agent: z.nativeEnum(Agent),
    showNames: z.boolean(),
    canTap: z.boolean(),
    canStep: z.boolean(),
    /** Types / pollination modes: buttons to switch the type, the kind, the agent. */
    canChoose: z.boolean(),
  })
  .strict();
export type FlowerState = z.infer<typeof flowerState>;

const STEP_WORDS: Readonly<Record<"fertilisation" | "fruit", readonly string[]>> = {
  fertilisation: [
    "A pollen grain has landed on the stigma.",
    "A tube grows out of the pollen grain and travels down through the style.",
    "The pollen tube reaches an ovule in the ovary.",
    "The male germ cell from the pollen fuses with the egg cell in the ovule: fertilisation. The fused cell is the zygote.",
  ],
  fruit: [
    "After fertilisation, the zygote divides several times to form an embryo inside the ovule.",
    "The ovule develops a tough coat and becomes a seed. The ovary grows and ripens into a fruit.",
    "Petals, sepals, stamens, style and stigma shrivel and fall off. The fruit holds the seeds; each seed holds the future plant (the embryo).",
  ],
};

export function describeFlower(s: FlowerState): string {
  switch (s.mode) {
    case FlowerMode.Parts:
      return s.selected === null
        ? "A longitudinal section of a flower: sepals, petals, stamens (anther on a filament) and, in the centre, the pistil (stigma, style, ovary with ovules)."
        : PART_JOBS[s.selected];
    case FlowerMode.Types:
      return s.flowerType === FlowerType.Bisexual
        ? "A bisexual flower (like Hibiscus or mustard) has both stamens and a pistil."
        : "Unisexual flowers (like papaya or watermelon) have either stamens or a pistil: a male flower and a female flower.";
    case FlowerMode.Pollination:
      return s.pollination === Pollination.Self
        ? "Self-pollination: pollen moves from the anther to the stigma of the same flower."
        : `Cross-pollination: pollen is carried from one flower to the stigma of another, here by ${s.agent === Agent.Animal ? "an insect" : s.agent}.`;
    case FlowerMode.Fertilisation:
    case FlowerMode.Fruit:
      return STEP_WORDS[s.mode][s.step] ?? STEP_WORDS[s.mode][0] ?? "";
  }
}

const act = actionsFor<FlowerState>();
const changed = (s: FlowerState) => ({
  signal: FlowerSignal.Changed,
  payload: { flowerType: s.flowerType, pollination: s.pollination, agent: s.agent },
});

export const flower = defineProp({
  type: "flower",
  describe:
    "A flower in longitudinal section. Parts mode: tap sepal/petal/anther/filament/stigma/style/ovary/ovule for its name and job. Types: bisexual (Hibiscus, mustard) vs unisexual (papaya). Pollination: self vs cross, by wind, water or an animal. Fertilisation (4 steps): pollen on stigma, tube through style, reaches ovule, fusion → zygote. Fruit (3 steps): embryo, seed and fruit, other parts fall.",
  state: flowerState,
  defaults: {
    mode: FlowerMode.Parts,
    step: 0,
    selected: null,
    flowerType: FlowerType.Bisexual,
    pollination: Pollination.Cross,
    agent: Agent.Animal,
    showNames: true,
    canTap: true,
    canStep: true,
    canChoose: true,
  },
  inputs: [
    "mode",
    "showNames",
    "canTap",
    "canStep",
    "canChoose",
    "flowerType",
    "pollination",
    "agent",
  ],
  invariant: (s) =>
    s.step < FLOWER_STEPS[s.mode] ? undefined : "step is past the last step for this mode",
  derived: {
    [FlowerDerived.StepCount]: {
      describe: "How many steps this mode has (1 for parts, types, pollination)",
      compute: (s) => FLOWER_STEPS[s.mode],
    },
    [FlowerDerived.IsDone]: {
      describe: "The last step is showing",
      compute: (s) => s.step === FLOWER_STEPS[s.mode] - 1,
    },
    [FlowerDerived.Job]: {
      describe: "Parts mode: the tapped part's job, or null",
      compute: (s) => (s.selected === null ? null : PART_JOBS[s.selected]),
    },
    [FlowerDerived.Organ]: {
      describe:
        "Parts mode: the tapped part belongs to the 'stamen', the 'pistil', or neither (null)",
      compute: (s) => (s.selected === null ? null : ORGAN[s.selected]),
    },
  },
  actions: {
    [FlowerAction.Tap]: act({
      describe: "Tap a part of the flower to see its name and job",
      byLearner: true,
      args: z.object({ part: z.nativeEnum(FlowerPart) }).strict(),
      run: (_s, a) =>
        set(
          { selected: a.part },
          { signal: FlowerSignal.Tapped, payload: { part: a.part, organ: ORGAN[a.part] } },
        ),
    }),
    [FlowerAction.Next]: act({
      describe: "Show the next step (stays on the last)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = Math.min(s.step + 1, FLOWER_STEPS[s.mode] - 1);
        return set({ step }, { signal: FlowerSignal.Stepped, payload: { step } });
      },
    }),
    [FlowerAction.Reset]: act({
      describe: "Back to the first step",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [FlowerAction.SetPollination]: act({
      describe: "Choose self- or cross-pollination",
      byLearner: true,
      args: z.object({ pollination: z.nativeEnum(Pollination) }).strict(),
      run: (s, a) =>
        set({ pollination: a.pollination }, changed({ ...s, pollination: a.pollination })),
    }),
    [FlowerAction.SetAgent]: act({
      describe: "Choose what carries the pollen in cross-pollination: wind, water or an animal",
      byLearner: true,
      args: z.object({ agent: z.nativeEnum(Agent) }).strict(),
      run: (s, a) => set({ agent: a.agent }, changed({ ...s, agent: a.agent })),
    }),
    [FlowerAction.SetType]: act({
      describe: "Show a bisexual or unisexual flower",
      byLearner: true,
      args: z.object({ flowerType: z.nativeEnum(FlowerType) }).strict(),
      run: (s, a) => set({ flowerType: a.flowerType }, changed({ ...s, flowerType: a.flowerType })),
    }),
  },
  signals: {
    [FlowerSignal.Tapped]: {
      describe: "The learner tapped `part` (its `organ`: stamen, pistil or null)",
    },
    [FlowerSignal.Stepped]: { describe: "Moved to `step`" },
    [FlowerSignal.Changed]: { describe: "The flower type, pollination kind or agent changed" },
  },
  observe: (s) => ({
    summary: describeFlower(s),
    elements: [{ id: FlowerPartId.Picture, value: describeFlower(s) }],
  }),
  parts: (s) => {
    const base: string[] = [FlowerPartId.Picture];
    if (s.mode === FlowerMode.Parts) base.push(...Object.values(FlowerPart));
    if (FLOWER_STEPS[s.mode] > 1) base.push(FlowerPartId.Next);
    if (s.canChoose && (s.mode === FlowerMode.Types || s.mode === FlowerMode.Pollination))
      base.push(FlowerPartId.Choices);
    return base;
  },
});

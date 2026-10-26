import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * A jar-world (NCERT 15.1, Activities 15.1–15.2): a sealed jar of pond water the learner fills.
 * Living parts (biotic): water plants (producers), snails and small fish (consumers), bacteria and
 * fungi (decomposers). Non-living parts (abiotic): water, sunlight, air from a pump. The jar keeps
 * itself going only with all three kinds of living things, light for the plants, and not more fish
 * than the plants can feed and give oxygen to.
 */

/** More fish than this and the plants can't keep up: the water fouls and oxygen runs short. */
export const FISH_LIMIT = 3;
export const MAX_FISH = 6;
export const MAX_SNAILS = 4;

export const EcoAction = {
  Toggle: "toggle",
  SetFish: "setFish",
  SetSnails: "setSnails",
} as const;
export const EcoSignal = { Changed: "changed", Sustained: "sustained" } as const;
export const EcoDerived = {
  Producers: "producers",
  Consumers: "consumers",
  Decomposers: "decomposers",
  Biotic: "biotic",
  Abiotic: "abiotic",
  Problems: "problems",
  IsSelfSustaining: "isSelfSustaining",
} as const;
export const EcoPart = { Jar: "jar", Checklist: "checklist", Controls: "controls" } as const;

/** What the learner can switch on and off. */
export const EcoThing = {
  Sun: "sun",
  Plants: "plants",
  Decomposers: "decomposers",
  Pump: "pump",
} as const;
export type EcoThing = (typeof EcoThing)[keyof typeof EcoThing];

/** What goes wrong in a jar that can't keep itself going. */
export const EcoProblem = {
  NoLight: "noLight",
  NoProducers: "noProducers",
  NoConsumers: "noConsumers",
  NoDecomposers: "noDecomposers",
  TooManyFish: "tooManyFish",
} as const;
export type EcoProblem = (typeof EcoProblem)[keyof typeof EcoProblem];

const ecoState = z
  .object({
    isSunny: z.boolean(),
    hasPlants: z.boolean(),
    hasDecomposers: z.boolean(),
    hasPump: z.boolean(),
    fish: z.number().int().min(0).max(MAX_FISH),
    snails: z.number().int().min(0).max(MAX_SNAILS),
    /** Labels each living thing producer / consumer / decomposer. */
    showRoles: z.boolean(),
    /** The "what the jar needs" checklist beside the jar. */
    showChecklist: z.boolean(),
    canToggle: z.boolean(),
    canSetAnimals: z.boolean(),
  })
  .strict();
export type EcoState = z.infer<typeof ecoState>;

type Jar = Pick<
  EcoState,
  "isSunny" | "hasPlants" | "hasDecomposers" | "hasPump" | "fish" | "snails"
>;

export function problemsOf(s: Jar): EcoProblem[] {
  const out: EcoProblem[] = [];
  if (!s.hasPlants) out.push(EcoProblem.NoProducers);
  else if (!s.isSunny) out.push(EcoProblem.NoLight);
  if (s.fish + s.snails === 0) out.push(EcoProblem.NoConsumers);
  if (!s.hasDecomposers) out.push(EcoProblem.NoDecomposers);
  if (s.fish > FISH_LIMIT) out.push(EcoProblem.TooManyFish);
  return out;
}

/** A jar that keeps itself going: no problems. The pump adds oxygen but can't fix a missing part. */
export const isSelfSustaining = (s: Jar): boolean => problemsOf(s).length === 0;

export function bioticOf(s: Jar): string[] {
  const out: string[] = [];
  if (s.hasPlants) out.push("waterPlants");
  if (s.snails > 0) out.push("snails");
  if (s.fish > 0) out.push("fish");
  if (s.hasDecomposers) out.push("bacteriaAndFungi");
  return out;
}

export function abioticOf(s: Jar): string[] {
  const out = ["water", "minerals"];
  if (s.isSunny) out.push("sunlight");
  if (s.hasPump) out.push("pumpedAir");
  return out;
}

const PROBLEM_WORDS: Readonly<Record<EcoProblem, string>> = {
  noLight: "the plants have no light, so they can't make food or oxygen",
  noProducers: "there are no producers, so nothing makes food from sunlight",
  noConsumers: "there are no consumers",
  noDecomposers: "there are no decomposers, so dead remains and waste pile up and the water fouls",
  tooManyFish: `there are more than ${FISH_LIMIT} fish for the plants to feed and give oxygen to`,
};

export function describeEcosystem(s: EcoState): string {
  const living = [
    s.hasPlants ? "water plants" : null,
    s.snails > 0 ? `${s.snails} snail${s.snails === 1 ? "" : "s"}` : null,
    s.fish > 0 ? `${s.fish} small fish` : null,
    s.hasDecomposers ? "bacteria and fungi" : null,
  ].filter((x) => x !== null);
  const jar = `A sealed jar of pond water${s.isSunny ? " in sunlight" : " in the dark"}${s.hasPump ? ", with an air pump" : ""}, holding ${living.length === 0 ? "nothing living" : living.join(", ")}.`;
  const problems = problemsOf(s);
  return problems.length === 0
    ? `${jar} It keeps itself going: producers, consumers and decomposers are all there.`
    : `${jar} It can't keep itself going: ${problems.map((p) => PROBLEM_WORDS[p]).join("; ")}.`;
}

const act = actionsFor<EcoState>();

function changed(before: EcoState, next: EcoState) {
  const ok = isSelfSustaining(next);
  const emit: Emit[] = [
    {
      signal: EcoSignal.Changed,
      payload: { isSelfSustaining: ok, problems: problemsOf(next) },
    },
  ];
  if (ok && !isSelfSustaining(before)) emit.push({ signal: EcoSignal.Sustained, payload: {} });
  return emit;
}

const KEY: Readonly<Record<EcoThing, keyof Jar>> = {
  sun: "isSunny",
  plants: "hasPlants",
  decomposers: "hasDecomposers",
  pump: "hasPump",
};

export const ecosystem = defineProp({
  type: "ecosystem",
  describe:
    "A jar-world ecosystem the learner fills: sunlight, water plants (producers), snails and small fish (consumers), bacteria and fungi (decomposers) and an air pump. Living (biotic) and non-living (abiotic) parts are listed. The jar keeps itself going only with producers, consumers and decomposers, light for the plants, and no more than 3 fish; otherwise it says what goes wrong.",
  state: ecoState,
  defaults: {
    isSunny: true,
    hasPlants: false,
    hasDecomposers: false,
    hasPump: false,
    fish: 4,
    snails: 0,
    showRoles: true,
    showChecklist: true,
    canToggle: true,
    canSetAnimals: true,
  },
  inputs: ["showRoles", "showChecklist", "canToggle", "canSetAnimals"],
  derived: {
    [EcoDerived.Producers]: {
      describe: "Whether the jar has producers (water plants)",
      compute: (s) => s.hasPlants,
    },
    [EcoDerived.Consumers]: {
      describe: "How many consumers (snails and fish) the jar holds",
      compute: (s) => s.snails + s.fish,
    },
    [EcoDerived.Decomposers]: {
      describe: "Whether the jar has decomposers (bacteria and fungi)",
      compute: (s) => s.hasDecomposers,
    },
    [EcoDerived.Biotic]: {
      describe: "The living (biotic) parts in the jar",
      compute: (s) => bioticOf(s),
    },
    [EcoDerived.Abiotic]: {
      describe: "The non-living (abiotic) parts of the jar",
      compute: (s) => abioticOf(s),
    },
    [EcoDerived.Problems]: {
      describe:
        "What stops the jar keeping itself going: noLight, noProducers, noConsumers, noDecomposers, tooManyFish",
      compute: (s) => problemsOf(s),
    },
    [EcoDerived.IsSelfSustaining]: {
      describe: "Whether the jar keeps itself going with no help",
      compute: (s) => isSelfSustaining(s),
    },
  },
  actions: {
    [EcoAction.Toggle]: act({
      describe: "Switch sunlight, the water plants, the decomposers or the air pump on or off",
      byLearner: true,
      args: z.object({ thing: z.nativeEnum(EcoThing), on: z.boolean() }).strict(),
      run: (s, a) => {
        const patch = { [KEY[a.thing]]: a.on } as Partial<EcoState>;
        return set(patch, ...changed(s, { ...s, ...patch }));
      },
    }),
    [EcoAction.SetFish]: act({
      describe: `Put 0 to ${MAX_FISH} small fish in the jar`,
      byLearner: true,
      args: z.object({ n: z.number().int().min(0).max(MAX_FISH) }).strict(),
      run: (s, a) => set({ fish: a.n }, ...changed(s, { ...s, fish: a.n })),
    }),
    [EcoAction.SetSnails]: act({
      describe: `Put 0 to ${MAX_SNAILS} snails in the jar`,
      byLearner: true,
      args: z.object({ n: z.number().int().min(0).max(MAX_SNAILS) }).strict(),
      run: (s, a) => set({ snails: a.n }, ...changed(s, { ...s, snails: a.n })),
    }),
  },
  signals: {
    [EcoSignal.Changed]: {
      describe: "Something in the jar changed; the payload says whether it keeps itself going",
    },
    [EcoSignal.Sustained]: {
      describe: "The jar has just become able to keep itself going",
    },
  },
  observe: (s) => ({
    summary: describeEcosystem(s),
    elements: [{ id: EcoPart.Jar, value: describeEcosystem(s) }],
  }),
  parts: () => [EcoPart.Jar, EcoPart.Checklist, EcoPart.Controls],
});

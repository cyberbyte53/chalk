import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  LETTER,
  type Share,
  Trait,
  allLooks,
  expectedPlants,
  genotypesOfCross,
  growPlants,
  isGenotype,
  isPure,
  lookKey,
  lookOf,
  looksOfCross,
  punnett,
  ratioOf,
  tidy,
} from "./genetics";

/**
 * Mendel's garden: two pea plants are crossed. Their germ cells, the Punnett square of what the
 * offspring can be, and a field of plants grown from the cross (counted). F1 plants can be
 * self-pollinated to give F2.
 */

export const CrossAction = {
  SetParent: "setParent",
  Cross: "cross",
  Grow: "grow",
  SelfF1: "selfF1",
  Reset: "reset",
} as const;
export const CrossSignal = { Crossed: "crossed", Grown: "grown", Selfed: "selfed" } as const;
export const CrossDerived = {
  LookRatio: "lookRatio",
  GenotypeRatio: "genotypeRatio",
  Expected: "expected",
  IsUniform: "isUniform",
  ParentLooks: "parentLooks",
  Offspring: "offspring",
} as const;
export const CrossPart = {
  ParentA: "parentA",
  ParentB: "parentB",
  Gametes: "gametes",
  Punnett: "punnett",
  Field: "field",
  Controls: "controls",
} as const;
export const GrowMode = { Chance: "chance", Expected: "expected" } as const;
export type GrowMode = (typeof GrowMode)[keyof typeof GrowMode];
export const Parent = { A: "a", B: "b" } as const;
export type Parent = (typeof Parent)[keyof typeof Parent];

const grownSchema = z
  .object({
    counts: z.record(z.string(), z.number().int().min(0)),
    total: z.number().int().min(0),
  })
  .strict();

const crossState = z
  .object({
    /** One trait (a monohybrid cross) or two (a dihybrid cross). */
    traits: z.array(z.nativeEnum(Trait)).min(1).max(2),
    /** The two parents' genotypes, written the textbook's way ("Tt", "RRyy"). */
    parentA: z.string(),
    parentB: z.string(),
    /** Which generation the parents are: 0 the parents (P), 1 the F1 (so the offspring are F2). */
    generation: z.number().int().min(0).max(2),
    /** Whether the cross has been made (the Punnett square and offspring shown). */
    isCrossed: z.boolean(),
    showGametes: z.boolean(),
    showPunnett: z.boolean(),
    showGenotypes: z.boolean(),
    canSetParents: z.boolean(),
    canSelf: z.boolean(),
    canGrow: z.boolean(),
    /** How many plants Grow grows, and whether by chance or exactly the expected shares. */
    growCount: z.number().int().min(1).max(2000),
    growMode: z.nativeEnum(GrowMode),
    /** The plants grown from the cross, counted by look; null until grown. */
    grown: grownSchema.nullable(),
    seed: z.number().int().min(0),
  })
  .strict();
export type CrossState = z.infer<typeof crossState>;

/** What the offspring of the cross look like, each look's share (dominant looks first). */
export function offspringOf(s: Pick<CrossState, "traits" | "parentA" | "parentB">): Share[] {
  return looksOfCross(s.traits, s.parentA, s.parentB);
}

/** The cross's look ratio ("3:1", "9:3:3:1", "1" when all look alike). */
export function lookRatioOf(s: Pick<CrossState, "traits" | "parentA" | "parentB">): string {
  return ratioOf(offspringOf(s).map((x) => x.count));
}

/** The cross's genotype ratio, from all-dominant down ("1:2:1"). */
export function genotypeRatioOf(s: Pick<CrossState, "traits" | "parentA" | "parentB">): string {
  return ratioOf(genotypesOfCross(s.parentA, s.parentB, s.traits).map((x) => x.count));
}

/** Whether every offspring has the same genotype (so F1 can be self-pollinated). */
export function isUniform(s: Pick<CrossState, "parentA" | "parentB">): boolean {
  return new Set(punnett(s.parentA, s.parentB).cells.flat()).size === 1;
}

const GENERATION_NAMES = ["P", "F1", "F2"] as const;

/** The generation the offspring belong to: F1 from the parents, F2 from F1 plants. */
export function offspringGeneration(s: Pick<CrossState, "generation">): string {
  return GENERATION_NAMES[Math.min(2, s.generation + 1)] ?? "F2";
}

/** The parents' generation name. */
export function parentGeneration(s: Pick<CrossState, "generation">): string {
  return GENERATION_NAMES[s.generation] ?? "P";
}

function describeLook(s: Pick<CrossState, "traits">, g: string): string {
  return lookKey(s.traits, lookOf(s.traits, g));
}

const act = actionsFor<CrossState>();

export const crossSimulator = defineProp({
  type: "crossSimulator",
  describe:
    "Mendel's pea garden: two pea plants (their genotypes written like Tt or RrYy, the capital the dominant version) are crossed for one or two traits: height (tall T, short t), seed shape (round R, wrinkled r), seed colour (yellow Y, green y), flower colour (violet W, white w). Shows each parent's germ cells (one copy of each gene), the Punnett square of possible offspring with their looks and genotypes, and a field of plants grown from the cross with counts. F1 plants can be self-pollinated to give F2.",
  state: crossState,
  defaults: {
    traits: [Trait.Height],
    parentA: "TT",
    parentB: "tt",
    generation: 0,
    isCrossed: false,
    showGametes: true,
    showPunnett: true,
    showGenotypes: true,
    canSetParents: false,
    canSelf: true,
    canGrow: true,
    growCount: 100,
    growMode: GrowMode.Chance,
    grown: null,
    seed: 7,
  },
  inputs: [
    "traits",
    "parentA",
    "parentB",
    "showGametes",
    "showPunnett",
    "showGenotypes",
    "canSetParents",
    "canSelf",
    "canGrow",
    "growCount",
    "growMode",
  ],
  invariant: (s) =>
    isGenotype(s.traits, s.parentA) && isGenotype(s.traits, s.parentB)
      ? undefined
      : `each parent needs one pair of letters per trait (${s.traits.map((t) => LETTER[t]).join(", ")})`,
  derived: {
    [CrossDerived.LookRatio]: {
      describe:
        "The offspring's looks as a ratio, dominant looks first (3:1, 9:3:3:1, 1 if all alike)",
      compute: (s) => lookRatioOf(s),
    },
    [CrossDerived.GenotypeRatio]: {
      describe: "The offspring's genotypes as a ratio, from all-dominant down (1:2:1)",
      compute: (s) => genotypeRatioOf(s),
    },
    [CrossDerived.Expected]: {
      describe: "Each look's expected fraction of the offspring",
      compute: (s) => Object.fromEntries(offspringOf(s).map((x) => [x.key, x.fraction])),
    },
    [CrossDerived.IsUniform]: {
      describe: "Whether all the offspring have the same genotype",
      compute: (s) => isUniform(s),
    },
    [CrossDerived.ParentLooks]: {
      describe: "What the two parents look like",
      compute: (s) => [describeLook(s, s.parentA), describeLook(s, s.parentB)],
    },
    [CrossDerived.Offspring]: {
      describe: "The offspring generation's name (F1 or F2)",
      compute: (s) => offspringGeneration(s),
    },
  },
  actions: {
    [CrossAction.SetParent]: act({
      describe: "Choose one parent's genotype (e.g. Tt); clears the cross",
      byLearner: true,
      args: z.object({ which: z.nativeEnum(Parent), genotype: z.string() }).strict(),
      run: (s, a) => {
        const g = tidy(a.genotype);
        if (!isGenotype(s.traits, g)) return set({});
        return set({
          ...(a.which === Parent.A ? { parentA: g } : { parentB: g }),
          isCrossed: false,
          grown: null,
          generation: 0,
        });
      },
    }),
    [CrossAction.Cross]: act({
      describe: "Cross the two parents: show the germ cells' Punnett square and the offspring",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        set(
          { isCrossed: true },
          {
            signal: CrossSignal.Crossed,
            payload: { ratio: lookRatioOf(s), generation: offspringGeneration(s) },
          },
        ),
    }),
    [CrossAction.Grow]: act({
      describe:
        "Grow plants from the cross (growCount of them, by chance or exactly the expected shares) and count each look",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const n = s.growCount;
        const grown =
          s.growMode === GrowMode.Expected
            ? { counts: expectedPlants(s.traits, s.parentA, s.parentB, n), seed: s.seed }
            : growPlants(s.traits, s.parentA, s.parentB, n, s.seed);
        return set(
          { isCrossed: true, grown: { counts: grown.counts, total: n }, seed: grown.seed },
          { signal: CrossSignal.Grown, payload: { counts: grown.counts, total: n } },
        );
      },
    }),
    [CrossAction.SelfF1]: act({
      describe:
        "Self-pollinate the F1 plants: an F1 plant becomes both parents, so the next offspring are F2 (only when all F1 plants are alike)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const f1 = punnett(s.parentA, s.parentB).cells.flat();
        const g = f1[0];
        if (g === undefined || !isUniform(s) || s.generation >= 1) return set({});
        return set(
          { parentA: g, parentB: g, generation: 1, isCrossed: false, grown: null },
          { signal: CrossSignal.Selfed, payload: { genotype: g } },
        );
      },
    }),
    [CrossAction.Reset]: act({
      describe: "Back to before the cross (parents kept)",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ isCrossed: false, grown: null }),
    }),
  },
  signals: {
    [CrossSignal.Crossed]: {
      describe: "The cross was made; `ratio` is the offspring's look ratio",
    },
    [CrossSignal.Grown]: { describe: "Plants were grown and counted; `counts` by look" },
    [CrossSignal.Selfed]: { describe: "F1 plants were self-pollinated; they are now the parents" },
  },
  observe: (s) => {
    const elements: Element[] = [
      {
        id: CrossPart.ParentA,
        value: `${parentGeneration(s)} parent: ${describeLook(s, s.parentA)}${s.showGenotypes ? ` (${s.parentA})` : ""}`,
      },
      {
        id: CrossPart.ParentB,
        value: `${parentGeneration(s)} parent: ${describeLook(s, s.parentB)}${s.showGenotypes ? ` (${s.parentB})` : ""}`,
      },
    ];
    if (s.showGametes)
      elements.push({
        id: CrossPart.Gametes,
        value: `germ cells: ${[...new Set(punnett(s.parentA, s.parentB).rows)].join(", ")} × ${[...new Set(punnett(s.parentA, s.parentB).columns)].join(", ")}`,
      });
    if (s.isCrossed && s.showPunnett) {
      const shares = offspringOf(s)
        .map((x) => `${x.count}/${punnett(s.parentA, s.parentB).cells.flat().length} ${x.key}`)
        .join(", ");
      elements.push({
        id: CrossPart.Punnett,
        value: `${offspringGeneration(s)} offspring: ${shares}${
          s.showGenotypes
            ? `; genotypes ${genotypesOfCross(s.parentA, s.parentB, s.traits)
                .map((x) => `${x.count} ${x.key}`)
                .join(", ")}`
            : ""
        }`,
      });
    }
    if (s.grown !== null)
      elements.push({
        id: CrossPart.Field,
        value: `${s.grown.total} plants grown: ${allLooks(s.traits)
          .map((k) => `${s.grown?.counts[k] ?? 0} ${k}`)
          .join(", ")}`,
      });
    return {
      summary: `A cross of a ${describeLook(s, s.parentA)} pea plant with a ${describeLook(s, s.parentB)} one${s.isCrossed ? `: the ${offspringGeneration(s)} offspring come out ${lookRatioOf(s)} by look` : ", not crossed yet"}.`,
      elements,
      hidden: s.isCrossed
        ? undefined
        : { expectedRatio: lookRatioOf(s), arePure: [isPure(s.parentA), isPure(s.parentB)] },
    };
  },
  parts: (s) => [
    CrossPart.ParentA,
    CrossPart.ParentB,
    ...(s.showGametes ? [CrossPart.Gametes] : []),
    ...(s.isCrossed && s.showPunnett ? [CrossPart.Punnett] : []),
    ...(s.grown !== null ? [CrossPart.Field] : []),
    CrossPart.Controls,
  ],
});

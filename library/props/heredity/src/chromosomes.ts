import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { nextRandom } from "./genetics";

/**
 * Chromosomes passing from parents to child (NCERT 9.2.3, 9.2.4). Each body cell has chromosomes
 * in pairs; a germ cell gets one of each pair; an egg and a sperm fuse and the pairs are back,
 * one of each pair from each parent. In sex-determination mode the parents are XX and XY.
 */

export const ShuffleMode = { Pairs: "pairs", Sex: "sex" } as const;
export type ShuffleMode = (typeof ShuffleMode)[keyof typeof ShuffleMode];
export const Sperm = { X: "x", Y: "y" } as const;
export type Sperm = (typeof Sperm)[keyof typeof Sperm];

export const ShuffleAction = {
  Next: "next",
  Shuffle: "shuffle",
  PickSperm: "pickSperm",
  Grow: "grow",
  Reset: "reset",
} as const;
export const ShuffleSignal = { Stepped: "stepped", Shuffled: "shuffled", Grown: "grown" } as const;
export const ShuffleDerived = {
  GermCellCount: "germCellCount",
  ZygoteCount: "zygoteCount",
  ChildSex: "childSex",
  GirlsFraction: "girlsFraction",
} as const;
export const ShufflePart = {
  Mother: "mother",
  Father: "father",
  Egg: "egg",
  Sperm: "sperm",
  Zygote: "zygote",
  Babies: "babies",
  Next: "next",
  Controls: "controls",
} as const;

/** The steps, in order: parents' cells, germ cells, fusion, the new cell. */
export const SHUFFLE_STEPS = 4;
export const ShuffleStep = { Parents: 0, GermCells: 1, Fusion: 2, Zygote: 3 } as const;

const shuffleState = z
  .object({
    mode: z.nativeEnum(ShuffleMode),
    /** How many chromosome pairs each body cell is drawn with (pairs mode). */
    pairs: z.number().int().min(1).max(4),
    step: z
      .number()
      .int()
      .min(0)
      .max(SHUFFLE_STEPS - 1),
    /** Sex mode: which sperm reaches the egg, once chosen. */
    sperm: z.nativeEnum(Sperm).nullable(),
    /** Sex mode: babies counted after Grow. */
    babies: z
      .object({ girls: z.number().int().min(0), boys: z.number().int().min(0) })
      .strict()
      .nullable(),
    canStep: z.boolean(),
    canShuffle: z.boolean(),
    canPickSperm: z.boolean(),
    canGrow: z.boolean(),
    growCount: z.number().int().min(1).max(2000),
    seed: z.number().int().min(0),
  })
  .strict();
export type ShuffleState = z.infer<typeof shuffleState>;

/** Which copy of each pair the egg and the sperm get (0 = the parent's mother's, 1 = father's). */
export function germPicks(seed: number, pairs: number): { egg: number[]; sperm: number[] } {
  const egg: number[] = [];
  const sperm: number[] = [];
  let s = seed;
  for (let i = 0; i < pairs; i++) {
    const a = nextRandom(s);
    const b = nextRandom(a.seed);
    s = b.seed;
    egg.push(a.value < 0.5 ? 0 : 1);
    sperm.push(b.value < 0.5 ? 0 : 1);
  }
  return { egg, sperm };
}

/** The child's sex, once the sperm is known: an X from the father makes a girl, a Y a boy. */
export function childSexOf(s: Pick<ShuffleState, "mode" | "sperm" | "step">): string | null {
  if (s.mode !== ShuffleMode.Sex || s.sperm === null || s.step < ShuffleStep.Fusion) return null;
  return s.sperm === Sperm.X ? "girl" : "boy";
}

/** Chromosomes in a germ cell and in the new cell (sex mode: one ordinary pair and the sex pair). */
export function countsOf(s: Pick<ShuffleState, "mode" | "pairs">): {
  germ: number;
  zygote: number;
} {
  const pairs = s.mode === ShuffleMode.Sex ? 2 : s.pairs;
  return { germ: pairs, zygote: 2 * pairs };
}

const STEP_WORDS: Readonly<Record<ShuffleMode, readonly string[]>> = {
  [ShuffleMode.Pairs]: [
    "Mother's and father's body cells: chromosomes come in pairs, one of each pair from their own mother and one from their own father.",
    "Germ cells: the egg and the sperm each get only one chromosome of every pair, half the usual number; which one of each pair is a matter of chance.",
    "Fertilisation: the egg and the sperm fuse.",
    "The new cell has pairs again: in every pair one chromosome came from the mother and one from the father.",
  ],
  [ShuffleMode.Sex]: [
    "Mother's body cell: 22 ordinary pairs (one drawn) and the sex chromosomes X and X. Father's: 22 ordinary pairs and a mismatched pair, X and a short Y.",
    "Germ cells: every egg gets an X; half the sperm get an X and half a Y.",
    "Fertilisation: one sperm fuses with the egg.",
    "The baby: XX is a girl, XY a boy; the father's sperm decided which.",
  ],
};

export function describeShuffle(s: ShuffleState): string {
  const words = STEP_WORDS[s.mode][s.step] ?? "";
  const sex = childSexOf(s);
  return sex === null
    ? words
    : `${words} This sperm carried ${s.sperm === Sperm.X ? "an X" : "a Y"}: a ${sex}.`;
}

const act = actionsFor<ShuffleState>();

export const chromosomeShuffle = defineProp({
  type: "chromosomeShuffle",
  describe:
    "Chromosomes from parents to child, in four steps: the parents' body cells with chromosomes in pairs (each coloured by which grandparent it came from), germ cells with one of each pair, an egg and a sperm fusing, and the new cell with pairs again, one of each pair from each parent. Sex-determination mode: mother XX, father XY; eggs all X, sperm X or Y; XX a girl, XY a boy; many babies counted come out about half and half.",
  state: shuffleState,
  defaults: {
    mode: ShuffleMode.Pairs,
    pairs: 3,
    step: 0,
    sperm: null,
    babies: null,
    canStep: true,
    canShuffle: true,
    canPickSperm: false,
    canGrow: false,
    growCount: 100,
    seed: 3,
  },
  inputs: ["mode", "pairs", "canStep", "canShuffle", "canPickSperm", "canGrow", "growCount"],
  derived: {
    [ShuffleDerived.GermCellCount]: {
      describe: "How many chromosomes a germ cell has (half a body cell's)",
      compute: (s) => countsOf(s).germ,
    },
    [ShuffleDerived.ZygoteCount]: {
      describe: "How many chromosomes the new cell has (pairs again)",
      compute: (s) => countsOf(s).zygote,
    },
    [ShuffleDerived.ChildSex]: {
      describe: "Sex mode: girl or boy, once a sperm has fused with the egg; null before",
      compute: (s) => childSexOf(s),
    },
    [ShuffleDerived.GirlsFraction]: {
      describe: "Sex mode: the fraction of girls among the babies counted; null before Grow",
      compute: (s) =>
        s.babies === null || s.babies.girls + s.babies.boys === 0
          ? null
          : s.babies.girls / (s.babies.girls + s.babies.boys),
    },
  },
  actions: {
    [ShuffleAction.Next]: act({
      describe: "Show the next step (after the last, back to the parents)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const step = (s.step + 1) % SHUFFLE_STEPS;
        let sperm = s.sperm;
        let seed = s.seed;
        if (step === ShuffleStep.Parents) sperm = null;
        if (s.mode === ShuffleMode.Sex && step === ShuffleStep.Fusion && sperm === null) {
          const r = nextRandom(seed);
          seed = r.seed;
          sperm = r.value < 0.5 ? Sperm.X : Sperm.Y;
        }
        return set({ step, sperm, seed }, { signal: ShuffleSignal.Stepped, payload: { step } });
      },
    }),
    [ShuffleAction.Shuffle]: act({
      describe: "Make new germ cells: a fresh chance pick of one chromosome from each pair",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const r = nextRandom(s.seed);
        return set(
          { seed: r.seed, step: Math.max(s.step, ShuffleStep.GermCells), sperm: null },
          { signal: ShuffleSignal.Shuffled, payload: {} },
        );
      },
    }),
    [ShuffleAction.PickSperm]: act({
      describe: "Sex mode: let the X sperm or the Y sperm reach the egg",
      byLearner: true,
      args: z.object({ sperm: z.nativeEnum(Sperm) }).strict(),
      run: (s, a) =>
        set(
          { sperm: a.sperm, step: ShuffleStep.Zygote },
          { signal: ShuffleSignal.Stepped, payload: { step: ShuffleStep.Zygote } },
        ),
    }),
    [ShuffleAction.Grow]: act({
      describe: "Sex mode: count growCount babies, each from a sperm picked by chance",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        let girls = 0;
        let seed = s.seed;
        for (let i = 0; i < s.growCount; i++) {
          const r = nextRandom(seed);
          seed = r.seed;
          if (r.value < 0.5) girls++;
        }
        const babies = { girls, boys: s.growCount - girls };
        return set({ babies, seed }, { signal: ShuffleSignal.Grown, payload: babies });
      },
    }),
    [ShuffleAction.Reset]: act({
      describe: "Back to the parents' cells",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ step: 0, sperm: null, babies: null }),
    }),
  },
  signals: {
    [ShuffleSignal.Stepped]: { describe: "A step was shown; `step` is the one now shown" },
    [ShuffleSignal.Shuffled]: { describe: "New germ cells were made by chance" },
    [ShuffleSignal.Grown]: { describe: "Babies were counted; `girls` and `boys`" },
  },
  observe: (s) => {
    const c = countsOf(s);
    const elements: Element[] = [
      { id: ShufflePart.Mother, value: "the mother's body cell, chromosomes in pairs" },
      { id: ShufflePart.Father, value: "the father's body cell, chromosomes in pairs" },
    ];
    if (s.step >= ShuffleStep.GermCells) {
      elements.push({ id: ShufflePart.Egg, value: `an egg with ${c.germ} chromosomes` });
      elements.push({
        id: ShufflePart.Sperm,
        value:
          s.mode === ShuffleMode.Sex
            ? "sperm, half carrying X and half Y"
            : `a sperm with ${c.germ} chromosomes`,
      });
    }
    if (s.step >= ShuffleStep.Zygote)
      elements.push({
        id: ShufflePart.Zygote,
        value: `the new cell, ${c.zygote} chromosomes in pairs${childSexOf(s) === null ? "" : `: ${childSexOf(s)}`}`,
      });
    if (s.babies !== null)
      elements.push({
        id: ShufflePart.Babies,
        value: `${s.babies.girls} girls and ${s.babies.boys} boys`,
      });
    return { summary: describeShuffle(s), elements };
  },
  parts: (s) => [
    ShufflePart.Mother,
    ShufflePart.Father,
    ...(s.step >= ShuffleStep.GermCells ? [ShufflePart.Egg, ShufflePart.Sperm] : []),
    ...(s.step >= ShuffleStep.Zygote ? [ShufflePart.Zygote] : []),
    ...(s.babies !== null ? [ShufflePart.Babies] : []),
    ShufflePart.Controls,
  ],
});

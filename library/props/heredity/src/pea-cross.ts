import { Ease, PropRole, action, prop, signal } from "@chalk/prop";
import { z } from "zod";

/** One copy of the gene for height: T (tall, dominant) or t (short, recessive). */
export const Gene = { Tall: "T", Short: "t" } as const;
export type Gene = (typeof Gene)[keyof typeof Gene];

const geneSchema = z.nativeEnum(Gene);
/** A plant's two copies. */
export const genesSchema = z.tuple([geneSchema, geneSchema]);
export type Genes = z.infer<typeof genesSchema>;

/** How a plant looks: tall if it has any T, short only when both copies are t. */
export const isTallOf = (genes: Genes): boolean => genes.includes(Gene.Tall);

/** A plant's genes as the book writes them: the dominant copy first ("Tt", never "tT"). */
export const genesWord = (genes: Genes): string =>
  isTallOf(genes) && genes[1] === Gene.Tall ? `${genes[1]}${genes[0]}` : genes.join("");

/**
 * The four children of a cross, the boxes of its Punnett square: box `2i + j` gets the first
 * parent's copy i and the second parent's copy j.
 */
export function punnettOf(a: Genes, b: Genes): Genes[] {
  return [
    [a[0], b[0]],
    [a[0], b[1]],
    [a[1], b[0]],
    [a[1], b[1]],
  ];
}

/** How many of these plants are tall and how many short. */
export function countOf(plants: readonly Genes[]): { tall: number; short: number } {
  const tall = plants.filter(isTallOf).length;
  return { tall, short: plants.length - tall };
}

/** How far a child has grown, 0 to 1, when `grown` of the four have (one after another). */
export const growthOf = (grown: number, child: number): number =>
  Math.max(0, Math.min(1, grown - child));

const PURE_TALL: Genes = [Gene.Tall, Gene.Tall];
const PURE_SHORT: Genes = [Gene.Short, Gene.Short];

/** Seconds the two chosen take to rise to the parents' row; seconds the student's cross takes. */
export const SECONDS_TO_RISE = 1.2;
export const SECONDS_TO_GROW = 3;

const child = z.number().int().min(0).max(3);
const count = z.number().int().min(0).max(4);

/**
 * Mendel's pea garden, for one gene: height. Each plant carries two copies (T tall, dominant; t
 * short, recessive), drawn as two beads at its base. Two parents are crossed: each gives one copy
 * to each child, so the children are the four boxes of a Punnett square, and they grow up from
 * the soil one after another. Two children can then become the parents of the next generation.
 */
export const peaCross = prop({
  type: "peaCross",
  role: PropRole.Explainer,
  describe:
    "Mendel's pea plants and one gene, for height: each plant carries two copies, T (tall, dominant) or t (short, recessive), drawn as two beads at its base; a plant is tall if it has any T. Two parents are crossed: each gives one of its copies to each child, so the four children are the boxes of a Punnett square, and they grow up from the soil one by one. Two children can become the parents of the next generation: TT × tt gives all tall (each with a hidden t); two of those give 3 tall : 1 short.",
  variables: z
    .object({
      /** The two parents' genes. */
      parents: z.tuple([genesSchema, genesSchema]),
      /** Which generation the parents are: 0 is P, 1 is F1, … */
      generation: z.number().int().min(0).max(20),
      /** How many of the four children have grown (a planned move: a fraction is one growing). */
      grown: z.number().min(0).max(4),
      /** The children picked to be the next parents, by box. */
      chosen: z.array(child).max(2),
      /** 0 to 1: how far the two chosen have risen to the parents' row (a planned move). */
      rising: z.number().min(0).max(1),
      isGenesShown: z.boolean(),
    })
    .strict(),
  start: {
    parents: [PURE_TALL, PURE_SHORT],
    generation: 0,
    grown: 0,
    chosen: [],
    rising: 0,
    isGenesShown: true,
  },
  facts: {
    children: (me) => punnettOf(me.parents[0], me.parents[1]),
    isCrossed: (me) => me.grown >= 4,
    tall: (me) => countOf(punnettOf(me.parents[0], me.parents[1])).tall,
    short: (me) => countOf(punnettOf(me.parents[0], me.parents[1])).short,
    parentLooks: (me) => me.parents.map((g) => (isTallOf(g) ? "tall" : "short")),
  },
  actions: {
    cross: action(
      { seconds: z.number().positive().max(30) },
      {
        describe:
          "Cross the two parents: their four children grow up one after another, over `seconds`",
      },
    ),
    nextGeneration: action(
      { seconds: z.number().positive().max(30), children: z.tuple([child, child]).optional() },
      {
        describe:
          "Two children (these, else the two chosen, else the first two) rise to be the parents, and their four children grow over `seconds`",
      },
    ),
    showGenes: action(
      { isShown: z.boolean() },
      { describe: "Draw or hide each plant's two beads" },
    ),
    crossParents: action(
      {},
      { from: "screen", describe: "Cross the two parents (the student's Cross)" },
    ),
    choose: action(
      { child },
      { from: "screen", describe: "Pick a grown child as a next parent, or unpick it" },
    ),
    crossChosen: action(
      {},
      { from: "screen", describe: "The two picked children become the parents, and are crossed" },
    ),
    startAgain: action(
      {},
      { from: "screen", describe: "Back to a pure tall (TT) and a pure short (tt), nothing grown" },
    ),
  },
  signals: {
    sprouted: signal({ child, isTall: z.boolean() }),
    crossed: signal({ tall: count, short: count, generation: z.number().int().min(1) }),
    risen: signal({ generation: z.number().int().min(1) }),
  },
  on: {
    cross: (me, { seconds }, t) => {
      if (me.grown > 0 || me.rising > 0) return;
      const each = seconds / 4;
      const kids = punnettOf(me.parents[0], me.parents[1]);
      const { tall, short } = countOf(kids);
      const sprouted = (k: number) =>
        t.tell.sprouted({ child: k, isTall: isTallOf(kids[k] as Genes) });
      // The last child is grown when the move ends: it sprouts, then the cross is done.
      return [
        t.move("grown", 4, seconds, {
          atEnd: [sprouted(3), t.tell.crossed({ tall, short, generation: me.generation + 1 })],
        }),
        ...[0, 1, 2].map((k) => t.later(each * (k + 1), sprouted(k))),
      ];
    },
    nextGeneration: (me, { seconds, children }, t) => {
      if (me.grown < 4 || me.rising > 0) return;
      const pair: [number, number] =
        children ?? (me.chosen.length === 2 ? [me.chosen[0] ?? 0, me.chosen[1] ?? 1] : [0, 1]);
      if (pair[0] === pair[1]) return;
      const kids = punnettOf(me.parents[0], me.parents[1]);
      const a = kids[pair[0]] as Genes;
      const b = kids[pair[1]] as Genes;
      const generation = me.generation + 1;
      return [
        t.set({ chosen: pair }),
        t.move("rising", 1, SECONDS_TO_RISE, {
          ease: Ease.Smooth,
          atEnd: [
            t.set({ parents: [a, b], generation, grown: 0, chosen: [], rising: 0 }),
            t.tell.risen({ generation }),
            t.self.cross({ seconds }),
          ],
        }),
      ];
    },
    showGenes: (_, { isShown }, t) => t.set({ isGenesShown: isShown }),
    crossParents: (_, __, t) => t.self.cross({ seconds: SECONDS_TO_GROW }),
    choose: (me, { child: k }, t) => {
      if (me.grown < 4 || me.rising > 0) return;
      const chosen = me.chosen.includes(k)
        ? me.chosen.filter((c) => c !== k)
        : [...me.chosen, k].slice(-2);
      return t.set({ chosen });
    },
    crossChosen: (me, _, t) => {
      const [a, b] = me.chosen;
      if (a === undefined || b === undefined) return;
      return t.self.nextGeneration({ seconds: SECONDS_TO_GROW, children: [a, b] });
    },
    startAgain: (_, __, t) => [
      t.stop(),
      t.set({ parents: [PURE_TALL, PURE_SHORT], generation: 0, grown: 0, chosen: [], rising: 0 }),
    ],
  },
  summary: (me) => {
    const [a, b] = me.parents;
    const cross = `${genesWord(a)} × ${genesWord(b)}`;
    if (me.grown < 4) return `A cross of ${cross} pea plants, its children not grown yet.`;
    return `A cross of ${cross} pea plants: ${me.tall} tall : ${me.short} short.`;
  },
  invariant: (s) =>
    new Set(s.chosen).size !== s.chosen.length
      ? "a child is picked twice"
      : s.rising > 0 && s.chosen.length !== 2
        ? "only two picked children rise"
        : s.chosen.length > 0 && s.grown < 4
          ? "only grown children can be picked"
          : undefined,
});

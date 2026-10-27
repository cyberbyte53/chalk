import { localizedSchema } from "@chalk/content";
import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type Bag, bagOf, gcd, lcm, primesIn } from "./arithmetic";
import { button } from "./seen";

export const MAX_PAIRED = 99_999;

export const BeadPairAction = {
  Pair: "pair",
  PairAll: "pairAll",
  StartAgain: "startAgain",
} as const;

export const BeadPairDerived = {
  IsDone: "isDone",
  Hcf: "hcf",
  Lcm: "lcm",
} as const;

export const BeadPairSignal = { Paired: "paired", NoMatch: "noMatch", Done: "done" } as const;

const beadPairState = z
  .object({
    /** The two numbers whose primes are paired. */
    numberA: z.number().int().min(2).max(MAX_PAIRED),
    numberB: z.number().int().min(2).max(MAX_PAIRED),
    /** The pairs made so far: one entry per pair, the prime on both its beads. */
    pairs: z.array(z.number().int().min(2)),
    /** Whether the HCF and LCM are written out once every pair is made. */
    showResult: z.boolean(),
    /** The two result lines' names, from the lesson. */
    hcfLabel: localizedSchema,
    lcmLabel: localizedSchema,
  })
  .strict();
export type BeadPairState = z.infer<typeof beadPairState>;

const act = actionsFor<BeadPairState>();
const none = z.object({}).strict();

const countIn = (pairs: readonly number[], p: number) => pairs.filter((q) => q === p).length;

/** How many pairs a prime can make: the fewer of its beads in the two numbers. */
function pairable(s: BeadPairState): Bag {
  const a = bagOf(s.numberA);
  const b = bagOf(s.numberB);
  const out: Record<number, number> = {};
  for (const p of primesIn(a)) {
    const k = Math.min(a[p] ?? 0, b[p] ?? 0);
    if (k > 0) out[p] = k;
  }
  return out;
}

const isDoneOf = (s: BeadPairState) => {
  const can = pairable(s);
  return primesIn(can).every((p) => countIn(s.pairs, p) === can[p]);
};

/** One number's beads in the order drawn: its paired beads (smallest prime first), then the rest. */
export function rowOf(n: number, pairs: readonly number[]): { prime: number; isPaired: boolean }[] {
  const bag = bagOf(n);
  const paired = [...pairs].sort((x, y) => x - y).map((prime) => ({ prime, isPaired: true }));
  const rest = primesIn(bag).flatMap((p) =>
    Array.from({ length: (bag[p] ?? 0) - countIn(pairs, p) }, () => ({
      prime: p,
      isPaired: false,
    })),
  );
  return [...paired, ...rest];
}

/** The beads as words: "2 3 | 3" — paired, then left over. */
export function rowText(n: number, pairs: readonly number[]): string {
  const row = rowOf(n, pairs);
  const paired = row.filter((b) => b.isPaired).map((b) => b.prime);
  const rest = row.filter((b) => !b.isPaired).map((b) => b.prime);
  return `${n}: paired ${paired.length > 0 ? paired.join(" × ") : "none"}; left over ${
    rest.length > 0 ? rest.join(" × ") : "none"
  }`;
}

/** The HCF from the pairs: one bead of each pair. "2 × 3 = 6". */
export function hcfText(s: BeadPairState): string {
  const ps = [...s.pairs].sort((x, y) => x - y);
  return ps.length === 0 ? "1" : `${ps.join(" × ")} = ${gcd(s.numberA, s.numberB)}`;
}

/** The LCM: one bead of each pair, then every bead left over. "2 × 3 × 3 × 2 = 36". */
export function lcmText(s: BeadPairState): string {
  const ps = [...s.pairs].sort((x, y) => x - y);
  const restA = rowOf(s.numberA, s.pairs)
    .filter((b) => !b.isPaired)
    .map((b) => b.prime);
  const restB = rowOf(s.numberB, s.pairs)
    .filter((b) => !b.isPaired)
    .map((b) => b.prime);
  return `${[...ps, ...restA, ...restB].join(" × ")} = ${lcm(s.numberA, s.numberB)}`;
}

/**
 * Two numbers' primes as two rows of beads. The learner pairs a bead in one row with the same prime
 * in the other, each bead used once. The pairs are what both numbers share: their product is the
 * HCF. One bead of each pair and every bead left over make the LCM: the smallest number holding all
 * of both numbers' beads.
 */
export const beadPair = defineProp({
  type: "beadPair",
  describe:
    "Two numbers' prime factors as two rows of beads. The learner pairs equal primes across the rows, each bead used once (a 2 in one row with a 2 in the other). The paired beads are the primes both numbers share: one from each pair multiplies to the HCF. One bead from each pair together with every unpaired bead multiplies to the LCM. So each pair gives one bead to the HCF and one to the LCM, which is why HCF × LCM = a × b.",
  state: beadPairState,
  defaults: {
    numberA: 18,
    numberB: 12,
    pairs: [],
    showResult: true,
    hcfLabel: { en: "HCF", hi: "HCF" },
    lcmLabel: { en: "LCM", hi: "LCM" },
  },
  inputs: ["showResult"],
  derived: {
    [BeadPairDerived.IsDone]: {
      describe: "Every bead that can be paired is paired",
      compute: isDoneOf,
    },
    [BeadPairDerived.Hcf]: {
      describe: "HCF of the two numbers",
      compute: (s) => gcd(s.numberA, s.numberB),
    },
    [BeadPairDerived.Lcm]: {
      describe: "LCM of the two numbers",
      compute: (s) => lcm(s.numberA, s.numberB),
    },
  },
  actions: {
    [BeadPairAction.Pair]: act({
      describe:
        "Pair a bead of this prime with the same prime in the other row (the learner taps a bead)",
      byLearner: true,
      args: z.object({ prime: z.number().int().min(2) }).strict(),
      run: (s, a) => {
        const can = pairable(s)[a.prime] ?? 0;
        if (countIn(s.pairs, a.prime) >= can) {
          return set({}, { signal: BeadPairSignal.NoMatch, payload: { prime: a.prime } });
        }
        const next = { ...s, pairs: [...s.pairs, a.prime] };
        const emits: Emit[] = [{ signal: BeadPairSignal.Paired, payload: { prime: a.prime } }];
        if (isDoneOf(next)) {
          emits.push({
            signal: BeadPairSignal.Done,
            payload: { hcf: gcd(s.numberA, s.numberB), lcm: lcm(s.numberA, s.numberB) },
          });
        }
        return set({ pairs: next.pairs }, ...emits);
      },
    }),
    [BeadPairAction.PairAll]: act({
      describe: "Make every pair",
      reveals: true,
      args: none,
      run: (s) => {
        if (isDoneOf(s)) return set({});
        const can = pairable(s);
        const pairs = primesIn(can).flatMap((p) => Array.from({ length: can[p] ?? 0 }, () => p));
        return set(
          { pairs },
          {
            signal: BeadPairSignal.Done,
            payload: { hcf: gcd(s.numberA, s.numberB), lcm: lcm(s.numberA, s.numberB) },
          },
        );
      },
    }),
    [BeadPairAction.StartAgain]: act({
      describe: "Undo every pair",
      byLearner: true,
      args: none,
      run: () => set({ pairs: [] }),
    }),
  },
  signals: {
    [BeadPairSignal.Paired]: { describe: "A pair was made, of `prime`" },
    [BeadPairSignal.NoMatch]: {
      describe: "The learner tapped a bead with no unpaired match in the other row, `prime`",
    },
    [BeadPairSignal.Done]: { describe: "Every pair is made; the `hcf` and `lcm`" },
  },
  invariant: (s) => {
    const can = pairable(s);
    for (const p of new Set(s.pairs)) {
      if (countIn(s.pairs, p) > (can[p] ?? 0)) return `more pairs of ${p} than both numbers hold`;
    }
    return undefined;
  },
  observe: (s) => {
    const done = isDoneOf(s);
    return {
      summary: `The primes of ${s.numberA} and ${s.numberB} as beads, ${s.pairs.length} pairs made${done ? ", every pair made" : ""}`,
      elements: [
        { id: "rowA", value: rowText(s.numberA, s.pairs) },
        { id: "rowB", value: rowText(s.numberB, s.pairs) },
        ...(done && s.showResult
          ? [
              { id: "hcf", value: `HCF = ${hcfText(s)}` },
              { id: "lcm", value: `LCM = ${lcmText(s)}` },
            ]
          : []),
        button("startAgain", s.pairs.length > 0),
      ],
      ...(done
        ? {}
        : { hidden: { hcf: gcd(s.numberA, s.numberB), lcm: lcm(s.numberA, s.numberB) } }),
    };
  },
});

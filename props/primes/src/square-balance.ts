import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type Bag, bagOf, bagText, join, primesIn, times } from "./arithmetic";

export const MAX_SIDE_NUMBER = 9_999;
export const MAX_ROOT = 99;

export const SquareBalanceAction = { SetA: "setA", SetB: "setB", SetRoot: "setRoot" } as const;

export const SquareBalanceDerived = {
  Left: "left",
  Right: "right",
  LeftBag: "leftBag",
  RightBag: "rightBag",
  IsBalanced: "isBalanced",
  OddOnRight: "oddOnRight",
  LeftText: "leftText",
  RightText: "rightText",
} as const;

const side = z.number().int().min(1).max(MAX_SIDE_NUMBER);

const squareBalanceState = z
  .object({
    /** n under the root: the scale tests whether √n could be a/b, i.e. a² = n × b². */
    root: z.number().int().min(2).max(MAX_ROOT),
    a: side,
    b: side,
  })
  .strict();
export type SquareBalanceState = z.infer<typeof squareBalanceState>;

const leftBagOf = (s: SquareBalanceState): Bag => times(bagOf(s.a), 2);
const rightBagOf = (s: SquareBalanceState): Bag => join(bagOf(s.root), times(bagOf(s.b), 2));

/** The primes a bag holds an odd number of. */
export function oddPrimes(bag: Bag): number[] {
  return primesIn(bag).filter((p) => (bag[p] ?? 0) % 2 === 1);
}

const act = actionsFor<SquareBalanceState>();

/**
 * A balance with a² on one pan and n × b² on the other, both as bags of primes. A square's bag has
 * an even number of every prime; if n isn't a perfect square some prime is odd in n, so it is odd on
 * the right pan whatever b is. The pans can never hold the same bag: √n is not a/b.
 */
export const squareBalance = defineProp({
  type: "squareBalance",
  describe:
    "A balance testing whether √n = a/b, i.e. whether a² = n × b², with each side drawn as its bag of primes. a²'s bag has an even count of every prime (it is a's bag twice). If n is not a perfect square, some prime has an odd count in n, so the right pan always has an odd count of it: the bags can never match, which is why √n is irrational. 17/12 is close for √2 (289 against 288) but never equal.",
  state: squareBalanceState,
  defaults: { root: 2, a: 17, b: 12 },
  derived: {
    [SquareBalanceDerived.Left]: { describe: "a²", compute: (s) => s.a * s.a },
    [SquareBalanceDerived.Right]: { describe: "n × b²", compute: (s) => s.root * s.b * s.b },
    [SquareBalanceDerived.LeftBag]: { describe: "a²'s bag", compute: leftBagOf },
    [SquareBalanceDerived.RightBag]: { describe: "n × b²'s bag", compute: rightBagOf },
    [SquareBalanceDerived.LeftText]: {
      describe: "a² the book's way",
      compute: (s) => bagText(leftBagOf(s)),
    },
    [SquareBalanceDerived.RightText]: {
      describe: "n × b² the book's way",
      compute: (s) => bagText(rightBagOf(s)),
    },
    [SquareBalanceDerived.IsBalanced]: {
      describe: "a² = n × b² (only possible when n is a perfect square)",
      compute: (s) => s.a * s.a === s.root * s.b * s.b,
    },
    [SquareBalanceDerived.OddOnRight]: {
      describe: "The primes the right pan holds an odd number of (the left pan never has one)",
      compute: (s) => oddPrimes(rightBagOf(s)),
    },
  },
  actions: {
    [SquareBalanceAction.SetA]: act({
      describe: "Try another a (the learner's − and + buttons)",
      byLearner: true,
      args: z.object({ a: side }).strict(),
      run: (_s, args) => set({ a: args.a }),
    }),
    [SquareBalanceAction.SetB]: act({
      describe: "Try another b",
      byLearner: true,
      args: z.object({ b: side }).strict(),
      run: (_s, args) => set({ b: args.b }),
    }),
    [SquareBalanceAction.SetRoot]: act({
      describe: "Test another √n",
      byLearner: true,
      args: z.object({ root: z.number().int().min(2).max(MAX_ROOT) }).strict(),
      run: (_s, args) => set({ root: args.root }),
    }),
  },
  observe: (s) => {
    const left = leftBagOf(s);
    const right = rightBagOf(s);
    const odd = oddPrimes(right);
    // Both pans show a row for every prime either holds, with its count (0 if none).
    const primes = primesIn(join(left, right));
    const rows = (bag: Bag) =>
      primes.map((p) => `${p}: ${bag[p] ?? 0}${odd.includes(p) ? " (ringed)" : ""}`).join(", ");
    const l = s.a * s.a;
    const r = s.root * s.b * s.b;
    const sign = l === r ? "=" : l > r ? ">" : "<";
    return {
      summary: `a balance: a² = ${l} on the left, ${s.root} × b² = ${r} on the right, ${l} ${sign} ${r}`,
      elements: [
        { id: "beam", value: l === r ? "level" : l > r ? "left pan lower" : "right pan lower" },
        { id: "leftPan", value: `a² = ${s.a}² = ${l}; prime counts ${rows(left)}` },
        {
          id: "rightPan",
          value: `${s.root} × b² = ${s.root} × ${s.b}² = ${r}; prime counts ${rows(right)}`,
        },
        { id: "a", value: s.a },
        { id: "b", value: s.b },
        { id: "n", value: s.root },
      ],
    };
  },
});

import { type Emit, PropRole, actionsFor, defineProp, raise, set, signal } from "@chalk/prop";
import { z } from "zod";
import { type Bag, bagOf, bagText, isPrime } from "./arithmetic";

export const MAX_TREE_NUMBER = 999_999;
export const ROOT = "r";

const splitSchema = z
  .object({
    /** The node split: "r" is the number itself, its two branches "r0" and "r1", and so on. */
    node: z.string().regex(/^r[01]*$/),
    /** The factor written on its left branch; the right branch is value ÷ factor. */
    factor: z.number().int().min(2),
  })
  .strict();

const factorTreeState = z
  .object({
    number: z.number().int().min(2).max(MAX_TREE_NUMBER),
    /** The learner's splits, in the order made. */
    splits: z.array(splitSchema),
    /** The end the learner tapped, whose factor pairs are offered, or null. */
    selected: z
      .string()
      .regex(/^r[01]*$/)
      .nullable(),
    /** Whether the learner can type the number at the top. */
    isEditable: z.boolean(),
  })
  .strict();
export type FactorTreeState = z.infer<typeof factorTreeState>;

/** A node of the tree: its value and its two branches if it has been split. */
export type TreeNode = {
  id: string;
  value: number;
  isPrime: boolean;
  depth: number;
  children: readonly [string, string] | null;
};

/** The tree the splits make, root first, then each node's branches (breadth first). */
export function nodesOf(s: Pick<FactorTreeState, "number" | "splits">): TreeNode[] {
  const byNode = new Map(s.splits.map((sp) => [sp.node, sp.factor]));
  const out: TreeNode[] = [];
  const queue: { id: string; value: number }[] = [{ id: ROOT, value: s.number }];
  while (queue.length > 0) {
    const next = queue.shift();
    if (next === undefined) break;
    const factor = byNode.get(next.id);
    const children = factor === undefined ? null : ([`${next.id}0`, `${next.id}1`] as const);
    out.push({
      id: next.id,
      value: next.value,
      isPrime: isPrime(next.value),
      depth: next.id.length - 1,
      children,
    });
    if (factor !== undefined) {
      queue.push(
        { id: `${next.id}0`, value: factor },
        { id: `${next.id}1`, value: next.value / factor },
      );
    }
  }
  return out;
}

/** The unsplit ends of the tree. */
function leavesOf(nodes: readonly TreeNode[]): TreeNode[] {
  return nodes.filter((n) => n.children === null);
}

/** The primes at the ends of the tree so far, as a bag (composite ends not counted yet). */
function primeBagOf(nodes: readonly TreeNode[]): Bag {
  const bag: Record<number, number> = {};
  for (const leaf of leavesOf(nodes))
    if (leaf.isPrime) bag[leaf.value] = (bag[leaf.value] ?? 0) + 1;
  return bag;
}

/** Why a split can't be made, or undefined if it can. */
export function whyNotSplit(
  s: Pick<FactorTreeState, "number" | "splits">,
  node: string,
  factor: number,
): string | undefined {
  const target = nodesOf(s).find((n) => n.id === node);
  if (target === undefined) return `there is no node ${node}`;
  if (target.children !== null) return `${target.value} is already split`;
  if (target.isPrime) return `${target.value} is prime: it can't be split`;
  if (factor <= 1 || factor >= target.value || target.value % factor !== 0) {
    return `${factor} is not a factor of ${target.value} between 1 and ${target.value}`;
  }
  return undefined;
}

const act = actionsFor<FactorTreeState>();
const none = z.object({}).strict();

/** Splits every composite end at its smallest prime until only primes are left. */
function splitEverything(s: Pick<FactorTreeState, "number" | "splits">): FactorTreeState["splits"] {
  const splits = [...s.splits];
  for (;;) {
    const open = leavesOf(nodesOf({ number: s.number, splits })).find((n) => !n.isPrime);
    if (open === undefined) return splits;
    const smallest = Number(Object.keys(bagOf(open.value))[0]);
    splits.push({ node: open.id, factor: smallest });
  }
}

const signals = {
  split: signal("An end, `node`, was split by `factor`", {
    node: z.string().min(1),
    factor: z.number().int().min(2),
  }),
  completed: signal("Every end is prime: `primes` is the factorisation", {
    primes: z.string().min(1),
  }),
};
/**
 * A factor tree: the number at the top, split into two factors, each split again until every end is
 * prime. However the splits are chosen, the primes at the ends are the same (the Fundamental
 * Theorem of Arithmetic): they fall into the number's bag of primes.
 */
export const factorTree = defineProp({
  type: "factorTree",
  role: PropRole.Explainer,
  describe:
    "A factor tree. The number at the top is split into two factors, and each factor that isn't prime is split again, until every end is a prime. The primes at the ends are the number's prime factorisation; whichever splits are chosen, the ends are the same primes (the Fundamental Theorem of Arithmetic).",
  state: factorTreeState,
  defaults: { number: 360, splits: [], selected: null, isEditable: false },
  // The factorisation, until the tree gets there.
  offScreen: ["primes"],
  derived: {
    nodes: {
      describe: "The tree: { id, value, isPrime, depth, children }, root first",
      compute: nodesOf,
    },
    isComplete: {
      describe: "Every end of the tree is prime",
      compute: (s) => leavesOf(nodesOf(s)).every((n) => n.isPrime),
    },
    bag: {
      describe: "The primes at the ends so far, by prime: how many of each",
      compute: (s) => primeBagOf(nodesOf(s)),
    },
    bagText: {
      describe: "The primes at the ends so far, the book's way: 2³ × 3² × 5",
      compute: (s) => bagText(primeBagOf(nodesOf(s))),
    },
    primes: {
      describe: "The number's prime factorisation, whatever the tree shows yet",
      compute: (s) => bagText(bagOf(s.number)),
    },
  },
  actions: {
    select: act({
      describe: "Pick an end to split (the learner's tap; again to put it down)",
      changes: ["selected"],
      byLearner: true,
      args: z.object({ node: z.string() }).strict(),
      run: (s, a) => {
        const target = nodesOf(s).find((n) => n.id === a.node);
        if (target === undefined || target.isPrime || target.children !== null) return set({});
        return set({ selected: s.selected === a.node ? null : a.node });
      },
    }),
    split: act({
      describe: "Split an end into two factors: `factor` and value ÷ factor (the learner's tap)",
      changes: ["splits", "selected"],
      byLearner: true,
      args: z.object({ node: z.string(), factor: z.number().int() }).strict(),
      run: (s, a) => {
        if (whyNotSplit(s, a.node, a.factor) !== undefined) return set({});
        const splits = [...s.splits, { node: a.node, factor: a.factor }];
        const nodes = nodesOf({ number: s.number, splits });
        const emits: Emit[] = [raise(signals.split, { node: a.node, factor: a.factor })];
        if (leavesOf(nodes).every((n) => n.isPrime)) {
          emits.push(raise(signals.completed, { primes: bagText(primeBagOf(nodes)) }));
        }
        return set({ splits, selected: null }, ...emits);
      },
    }),
    splitAll: act({
      describe: "Finish the tree, splitting each end at its smallest prime",
      changes: ["splits", "selected"],
      reveals: true,
      args: none,
      run: (s) => {
        if (leavesOf(nodesOf(s)).every((n) => n.isPrime)) return set({});
        const splits = splitEverything(s);
        return set(
          { splits, selected: null },
          raise(signals.completed, { primes: bagText(bagOf(s.number)) }),
        );
      },
    }),
    setNumber: act({
      describe: "A new number at the top, unsplit",
      changes: ["number", "splits", "selected"],
      byLearner: true,
      args: z.object({ number: z.number().int().min(2).max(MAX_TREE_NUMBER) }).strict(),
      run: (_s, a) => set({ number: a.number, splits: [], selected: null }),
    }),
    startAgain: act({
      describe: "Take every split back",
      changes: ["splits", "selected"],
      byLearner: true,
      args: none,
      run: () => set({ splits: [], selected: null }),
    }),
  },
  signals,
  invariant: (s) => {
    let partial: Pick<FactorTreeState, "number" | "splits"> = { number: s.number, splits: [] };
    for (const sp of s.splits) {
      const why = whyNotSplit(partial, sp.node, sp.factor);
      if (why !== undefined) return `split ${sp.node} by ${sp.factor}: ${why}`;
      partial = { number: s.number, splits: [...partial.splits, sp] };
    }
    return undefined;
  },
  summary: (s) => {
    const ends = leavesOf(nodesOf(s));
    return `a factor tree of ${s.number}${s.splits.length === 0 ? ", not split yet" : `: its ends are ${ends.map((n) => n.value).join(" × ")}${ends.every((n) => n.isPrime) ? ", every one prime" : ""}`}`;
  },
});

/**
 * Where a picture's labels go, all together: a pure function of measured boxes (no page, no clock, no
 * `Math.random`), so the same boxes always give the same places. platform/docs/plans/label-placement.md.
 *
 * Each label has spots in its order of preference, each with a cost of its own (what it covers that
 * isn't a label, off the picture, nearer another's thing). Two labels' spots clash fully when their inked
 * letters overlap, and a quarter (NEAR) when only within a gap of each other: near is less bad than
 * on. A layout's cost is the spots' own costs, its clashes between labels, and each spot's rank,
 * weighted so all ranks together stay under the least clash: untangling a clash is always worth a
 * less preferred spot.
 *
 * Labels whose spots can never clash don't affect each other, so they are solved in groups: a lone
 * label takes its cheapest spot; a small group is solved exactly (branch and bound); a big one by
 * simulated annealing as Christensen, Marks and Shieber (1995) give it, from fixed seeds.
 */

import { LABEL_WEIGHTS } from "./label-weights";

/** A box on the page, px. */
export type Box = { l: number; t: number; r: number; b: number };

export type LabelProblem = {
  /**
   * Each label's spots: its box there (its line's height), its inked letters' box, and that spot's
   * own cost (before its rank).
   */
  labels: readonly { spots: readonly { box: Box; ink: Box; cost: number }[]; gap: number }[];
};

/** What two things only near each other (within a gap, not overlapping) cost, against overlapping. */
export const NEAR = LABEL_WEIGHTS.near;

/** Labels in a group of at most this many are solved exactly. */
const EXACT_UP_TO = 9;
/** The exact search gives way to annealing after this many steps (a group too tangled to prove). */
const EXACT_STEPS = 20000;

export const boxesClash = (a: Box, b: Box, gap: number): boolean =>
  a.l - gap < b.r && b.l - gap < a.r && a.t - gap < b.b && b.t - gap < a.b;

/** A seeded random number in [0, 1) (mulberry32). */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** What every way of solving a problem shares: spots' own costs, neighbours, groups. */
function prepare(problem: LabelProblem) {
  const { labels } = problem;
  const n = labels.length;
  const most = Math.max(1, ...labels.map((l) => l.spots.length));
  const rankWeight = NEAR / (n * most + 1);
  const own = labels.map((l) => l.spots.map((s, k) => s.cost + k * rankWeight));
  /** What label i at spot k and label j at spot m cost together: 1 on, NEAR near, else 0. */
  const clash = (i: number, k: number, j: number, m: number) => {
    const l = labels[i];
    const o = labels[j];
    const a = l?.spots[k];
    const b = o?.spots[m];
    if (l === undefined || o === undefined || a === undefined || b === undefined) return 0;
    return boxesClash(a.ink, b.ink, 0)
      ? LABEL_WEIGHTS.onLabel
      : boxesClash(a.box, b.box, Math.max(l.gap, o.gap))
        ? LABEL_WEIGHTS.onLabel * NEAR
        : 0;
  };
  const cheapest = (i: number) => {
    const c = own[i] ?? [];
    let best = 0;
    for (let k = 1; k < c.length; k++) if ((c[k] ?? 0) < (c[best] ?? 0)) best = k;
    return best;
  };
  // A spot that can't be in a best layout is dropped: one costing, on its own, at least what the
  // label's cheapest spot costs plus the most that spot could pay in clashes. Moving the label
  // from it to the cheapest never costs more, wherever the others are. Exact, not a guess.
  const keep: number[][] = own.map((cs, i) => {
    const b = cheapest(i);
    let most = 0;
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      let worst = 0;
      for (let m = 0; m < (labels[j]?.spots.length ?? 0); m++)
        worst = Math.max(worst, clash(i, b, j, m));
      most += worst;
    }
    const bound = (cs[b] ?? 0) + most;
    return cs.flatMap((c, k) => (k === b || c < bound ? [k] : []));
  });
  // For each kept spot, the other labels' kept spots that clash with it (its neighbours), and what
  // each costs. A move looks only at these, not at every label.
  const near: { j: number; k: number; cost: number }[][][] = own.map((cs, i) =>
    cs.map((_, k) =>
      (keep[i] ?? []).includes(k)
        ? keep.flatMap((ms, j) =>
            j === i
              ? []
              : ms.flatMap((m) => {
                  const cost = clash(i, k, j, m);
                  return cost > 0 ? [{ j, k: m, cost }] : [];
                }),
          )
        : [],
    ),
  );
  // Groups: labels joined when any of their spots clash.
  const parent = [...Array(n).keys()];
  const root = (x: number): number => {
    let r = x;
    while (parent[r] !== r) r = parent[r] ?? r;
    return r;
  };
  for (let i = 0; i < n; i++)
    for (const spot of near[i] ?? []) for (const { j } of spot) parent[root(i)] = root(j);
  const byRoot = new Map<number, number[]>();
  for (let i = 0; i < n; i++) byRoot.set(root(i), [...(byRoot.get(root(i)) ?? []), i]);
  /** A group's cost with its labels where `at` says. */
  const groupCost = (at: readonly number[], g: readonly number[]) => {
    let c = 0;
    for (const i of g) {
      c += own[i]?.[at[i] ?? 0] ?? 0;
      for (const o of near[i]?.[at[i] ?? 0] ?? []) if (o.j > i && at[o.j] === o.k) c += o.cost;
    }
    return c;
  };
  return { n, own, near, keep, cheapest, groups: [...byRoot.values()], groupCost };
}

/** The annealing's seeds, one run each. */
export const SEEDS: readonly number[] = [1, 2, 3, 4, 5];

/**
 * Each label's spot: an index into its spots. `seeds`: the annealing's runs (all of them, or one,
 * when the runs are shared between workers and put together by `bestOf`).
 */
export function solveLabels(problem: LabelProblem, seeds: readonly number[] = SEEDS): number[] {
  const { n, own, near, keep, cheapest, groups, groupCost: costOf } = prepare(problem);
  const at = new Array<number>(n).fill(0);
  const groupCost = (g: readonly number[]) => costOf(at, g);

  /** Which labels count where they are: a group's, or (searching) those placed so far. */
  const isIn = new Array<boolean>(n).fill(false);
  /** A label's cost at a spot, with its clashes with the labels that count, where they are. */
  const costAt = (i: number, k: number) => {
    let c = own[i]?.[k] ?? 0;
    for (const o of near[i]?.[k] ?? []) if (isIn[o.j] && at[o.j] === o.k) c += o.cost;
    return c;
  };

  for (const g of groups) {
    for (const i of g) at[i] = cheapest(i);
    if (g.length === 1) continue;
    const floor = g.reduce((s, i) => s + (own[i]?.[cheapest(i)] ?? 0), 0);
    if (groupCost(g) <= floor + 1e-9) continue;
    if (g.length <= EXACT_UP_TO && exact(g)) continue;
    for (const i of g) isIn[i] = true;
    anneal(g, floor);
    for (const i of g) isIn[i] = false;
  }
  return at;

  /** Branch and bound over a group; false if it gave up (too many steps). */
  function exact(g: readonly number[]): boolean {
    const rest = new Array<number>(g.length + 1).fill(0);
    for (let a = g.length - 1; a >= 0; a--)
      rest[a] = (rest[a + 1] ?? 0) + (own[g[a] ?? 0]?.[cheapest(g[a] ?? 0)] ?? 0);
    let best = Number.POSITIVE_INFINITY;
    let bestAt: number[] = [];
    let steps = 0;
    const go = (a: number, sofar: number): boolean => {
      if (++steps > EXACT_STEPS) return false;
      if (sofar + (rest[a] ?? 0) >= best - 1e-9) return true;
      if (a === g.length) {
        best = sofar;
        bestAt = g.map((i) => at[i] ?? 0);
        return true;
      }
      const i = g[a] ?? 0;
      let isOn = true;
      for (const k of keep[i] ?? []) {
        if (!isOn) break;
        at[i] = k;
        const cost = costAt(i, k);
        isIn[i] = true;
        isOn = go(a + 1, sofar + cost);
        isIn[i] = false;
      }
      return isOn;
    };
    const isDone = go(0, 0);
    if (isDone) for (const [a, i] of g.entries()) at[i] = bestAt[a] ?? 0;
    return isDone;
  }

  /**
   * Christensen, Marks and Shieber (1995): a random start; a label chosen from all of them, moved
   * to another of its spots; a worse layout kept with probability e^(−ΔE/T); T first such that a
   * rise of 1 is kept 2 times in 3, then ×0.9 after 20n moves or 5n kept; at most 50 stages, and
   * done at a stage that keeps nothing. A run from each seed, the best kept (ties: the earlier
   * seed), stopping at a run that reaches the floor.
   */
  function anneal(g: readonly number[], floor: number): void {
    const m = g.length;
    let best = Number.POSITIVE_INFINITY;
    let bestAt: number[] = [];
    for (const seed of seeds) {
      if (best <= floor + 1e-9) break;
      const random = seeded(seed);
      for (const i of g) at[i] = keep[i]?.[Math.floor(random() * (keep[i]?.length ?? 1))] ?? 0;
      let temperature = -1 / Math.log(2 / 3);
      for (let stage = 0; stage < 50; stage++) {
        let kept = 0;
        for (let move = 0; move < 20 * m && kept <= 5 * m; move++) {
          const i = g[Math.floor(random() * m)] ?? 0;
          const choices = keep[i] ?? [];
          if (choices.length < 2) continue;
          const was = at[i] ?? 0;
          const from = choices.indexOf(was);
          let pick = Math.floor(random() * (choices.length - 1));
          if (pick >= from) pick += 1;
          const k = choices[pick] ?? was;
          const rise = costAt(i, k) - costAt(i, was);
          if (rise <= 0 || random() < Math.exp(-rise / temperature)) {
            at[i] = k;
            kept++;
          }
        }
        if (kept === 0) break;
        temperature *= 0.9;
      }
      const cost = groupCost(g);
      if (cost < best - 1e-9) {
        best = cost;
        bestAt = g.map((i) => at[i] ?? 0);
      }
    }
    for (const [a, i] of g.entries()) at[i] = bestAt[a] ?? 0;
  }
}

/**
 * The answers of runs from different seeds (in the seeds' order) put together as one solve from
 * all of them would: in each group, the cheapest (ties: the earlier seed). A group the floor
 * already settles is the same in every answer.
 */
export function bestOf(problem: LabelProblem, answers: readonly (readonly number[])[]): number[] {
  const { n, groups, groupCost } = prepare(problem);
  const at = [...(answers[0] ?? new Array<number>(n).fill(0))];
  for (const g of groups) {
    let best = answers[0] ?? at;
    for (const answer of answers.slice(1))
      if (groupCost(answer, g) < groupCost(best, g) - 1e-9) best = answer;
    for (const i of g) at[i] = best[i] ?? 0;
  }
  return at;
}

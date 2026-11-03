import { describe, expect, it } from "vitest";
import {
  type Box,
  type LabelProblem,
  SEEDS,
  bestOf,
  boxesClash,
  solveLabels,
} from "./label-solver";
import { LABEL_WEIGHTS, weightRules } from "./label-weights";

/** A seeded random number, for boards made up the same every run. */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Labels of 38×12 round dots on a square, each with 8 spots round its dot. */
function board(labels: number, size: number, seed: number): LabelProblem {
  const random = seeded(seed);
  const offsets = [
    [8, -20],
    [-46, -20],
    [-46, 6],
    [8, 6],
    [-19, -26],
    [10, -6],
    [-19, 12],
    [-48, -6],
  ] as const;
  return {
    labels: Array.from({ length: labels }, () => {
      const x = 20 + random() * (size - 40);
      const y = 20 + random() * (size - 40);
      return {
        gap: 2,
        spots: offsets.map(([dx, dy]) => {
          const box: Box = { l: x + dx, t: y + dy, r: x + dx + 38, b: y + dy + 12 };
          return { box, ink: box, cost: 0 };
        }),
      };
    }),
  };
}

/** What a layout costs, as the solver counts it (spots' ranks aside): every clash between labels. */
function clashes(problem: LabelProblem, at: readonly number[]): number {
  let n = 0;
  for (let i = 0; i < at.length; i++)
    for (let j = i + 1; j < at.length; j++) {
      const a = problem.labels[i]?.spots[at[i] ?? 0];
      const b = problem.labels[j]?.spots[at[j] ?? 0];
      if (a !== undefined && b !== undefined && boxesClash(a.ink, b.ink, 0)) n++;
    }
  return n;
}

/** The fewest clashes any layout has, trying every one. */
function fewest(problem: LabelProblem): number {
  const n = problem.labels.length;
  const at = new Array<number>(n).fill(0);
  let best = Number.POSITIVE_INFINITY;
  const go = (i: number) => {
    if (i === n) {
      best = Math.min(best, clashes(problem, at));
      return;
    }
    for (let k = 0; k < (problem.labels[i]?.spots.length ?? 0); k++) {
      at[i] = k;
      go(i + 1);
    }
  };
  go(0);
  return best;
}

describe("placing labels together", () => {
  it("a lone label takes its first spot that costs nothing", () => {
    const box = (l: number): Box => ({ l, t: 0, r: l + 10, b: 10 });
    const at = solveLabels({
      labels: [
        {
          gap: 0,
          spots: [
            { box: box(0), ink: box(0), cost: 1 },
            { box: box(20), ink: box(20), cost: 0 },
            { box: box(40), ink: box(40), cost: 0 },
          ],
        },
      ],
    });
    expect(at).toEqual([1]);
  });

  it("finds the fewest clashes there can be, on crowded small boards", () => {
    for (let seed = 1; seed <= 12; seed++) {
      const problem = board(6, 120, seed);
      expect(clashes(problem, solveLabels(problem))).toBe(fewest(problem));
    }
  });

  it("gives the same places for the same boxes, every time", () => {
    const problem = board(20, 220, 7);
    expect(solveLabels(problem)).toEqual(solveLabels(problem));
  });

  it("gives the same places with its runs shared out (a run a worker) as all at once", () => {
    for (let seed = 1; seed <= 6; seed++) {
      const problem = board(16, 200, seed);
      const shared = bestOf(
        problem,
        SEEDS.map((s) => solveLabels(problem, [s])),
      );
      expect(shared).toEqual(solveLabels(problem));
    }
  });
});

describe("the weights", () => {
  it("keep their order", () => {
    expect(weightRules(LABEL_WEIGHTS)).toEqual([]);
  });
  it("say which order a change breaks", () => {
    // Near a word at a quarter cost more than across a line: Riya's name crossed an axis.
    expect(weightRules({ ...LABEL_WEIGHTS, near: 0.25 })).toEqual([
      "near a word or label costs less than across a line (else a label crosses an axis to keep off a word it only comes near)",
    ]);
  });
});

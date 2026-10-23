import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  COLOUR_WORDS,
  type Colour,
  DEFAULT_FACES,
  Experiment,
  type Setup,
  draw,
  favourableCount,
  marbleSchema,
  outcomesOf,
  probabilityOf,
  totalOutcomes,
  wordsSchema,
} from "./chance";
import { clean, fracText, numText } from "./numbers";

/**
 * Doing an experiment many times (NCERT 15.1, Class IX's experimental probability): toss a coin,
 * throw a die or two, spin a spinner or draw from a bag, 1, 10, 100 or 1000 times at once. The
 * running fraction of times the event happened is drawn against the number of trials, next to
 * the theoretical probability (favourable ÷ all), and settles towards it as the trials grow, the
 * way Buffon's, Kerrich's and Pearson's coin tosses did.
 */

export const RunAction = { Run: "run", Reset: "reset" } as const;
export const RunSignal = { Ran: "ran", Many: "many" } as const;
export const RunDerived = {
  Empirical: "empirical",
  Theoretical: "theoretical",
  TheoreticalText: "theoreticalText",
  Gap: "gap",
} as const;
export const RunPart = {
  Picture: "picture",
  Graph: "graph",
  Counts: "counts",
  Run: "run",
  Reset: "reset",
} as const;

/** Trials after which the run counts as "many" (the fraction has had time to settle). */
export const MANY = 1000;
/** Most trials a run can reach. */
export const MAX_TRIALS = 100000;
/** Points kept for the graph. */
const HISTORY = 60;

export const setupFields = {
  kind: z.nativeEnum(Experiment),
  /** The six faces of the die (NCERT Ex 15.2 Q2 uses 1, 2, 2, 3, 3, 6). */
  faces: z.array(z.number().int().min(0).max(99)).length(6),
  marbles: z.array(marbleSchema).max(6),
  sectors: z.array(wordsSchema).max(8),
};

const runState = z
  .object({
    ...setupFields,
    /** The event, as the ids of its favourable outcomes. */
    favourable: z.array(z.string().max(8)).max(52),
    /** What the event is called ("a head", "a sum of 8"). */
    eventLabel: wordsSchema,
    trials: z.number().int().min(0).max(MAX_TRIALS),
    hits: z.number().int().min(0).max(MAX_TRIALS),
    /** The last outcome's id, or null before the first trial. */
    last: z.string().max(8).nullable(),
    /** (trials, fraction) after each run, for the graph. */
    history: z.array(z.tuple([z.number().int().min(0), z.number().min(0).max(1)])).max(HISTORY),
    seed: z.number().int().min(0),
    /** The batch sizes offered as buttons. */
    batches: z.array(z.number().int().min(1).max(10000)).min(1).max(4),
    /** Show the theoretical probability's line on the graph. */
    showTheory: z.boolean(),
    canRun: z.boolean(),
  })
  .strict();
export type RunState = z.infer<typeof runState>;

export const setupOf = (s: Pick<RunState, "kind" | "faces" | "marbles" | "sectors">): Setup => ({
  kind: s.kind,
  faces: s.faces,
  marbles: s.marbles,
  sectors: s.sectors,
});

export const empiricalOf = (s: Pick<RunState, "trials" | "hits">) =>
  s.trials === 0 ? 0 : clean(s.hits / s.trials);
export const theoreticalOf = (s: RunState) => {
  const p = probabilityOf(setupOf(s), s.favourable);
  return clean(p.num / p.den);
};

/** Runs `times` more trials: the new counts, last outcome and seed. */
export function runTrials(
  s: RunState,
  times: number,
): Pick<RunState, "trials" | "hits" | "last" | "seed"> {
  const set = new Set(s.favourable);
  const setup = setupOf(s);
  let seed = s.seed;
  let hits = s.hits;
  let last = s.last;
  const n = Math.min(times, MAX_TRIALS - s.trials);
  for (let i = 0; i < n; i++) {
    const r = draw(setup, seed);
    seed = r.seed;
    last = r.id;
    if (set.has(r.id)) hits += 1;
  }
  return { trials: s.trials + n, hits, last, seed };
}

const act = actionsFor<RunState>();

export const chanceRun = defineProp({
  type: "chanceRun",
  describe:
    "An experiment run many times: a coin, two coins, a die, two dice, a spinner or a bag of marbles. The learner runs it 1, 10, 100 or 1000 times at a press; the counts (trials, times the event happened) and the experimental probability (happened ÷ trials) update, and a graph shows that fraction against the number of trials beside the theoretical probability (favourable outcomes ÷ all outcomes). With few trials the fraction jumps about; with many it settles near the theoretical value. Seeded, so a run can be replayed.",
  state: runState,
  defaults: {
    kind: Experiment.Coin,
    faces: [...DEFAULT_FACES],
    marbles: [],
    sectors: [],
    favourable: ["H"],
    eventLabel: { en: "a head", hi: "चित" },
    trials: 0,
    hits: 0,
    last: null,
    history: [],
    seed: 7,
    batches: [1, 10, 100, 1000],
    showTheory: true,
    canRun: true,
  },
  inputs: ["canRun", "showTheory"],
  invariant: (s) => {
    if (s.hits > s.trials) return "more hits than trials";
    const ids = new Set(outcomesOf(setupOf(s)).map((o) => o.id));
    if (ids.size === 0) return "the experiment has no outcomes";
    if (s.favourable.some((id) => !ids.has(id)))
      return "the event lists an outcome the experiment doesn't have";
    if (s.kind === Experiment.Spinner && s.sectors.length < 2)
      return "a spinner needs at least 2 sectors";
    if (s.kind === Experiment.Bag && s.marbles.every((m) => m.count === 0))
      return "the bag is empty";
    if (s.kind === Experiment.Cards) return "cards are shown with the outcome space, not run";
    return undefined;
  },
  derived: {
    [RunDerived.Empirical]: {
      describe: "Experimental probability: hits ÷ trials",
      compute: empiricalOf,
    },
    [RunDerived.Theoretical]: {
      describe: "Theoretical probability as a decimal",
      compute: theoreticalOf,
    },
    [RunDerived.TheoreticalText]: {
      describe: "Theoretical probability as a fraction, e.g. 5/36",
      compute: (s) => fracText(probabilityOf(setupOf(s), s.favourable)),
    },
    [RunDerived.Gap]: {
      describe: "How far the experimental probability is from the theoretical",
      compute: (s) => clean(Math.abs(empiricalOf(s) - theoreticalOf(s))),
    },
  },
  actions: {
    [RunAction.Run]: act({
      describe: "Do the experiment this many more times (one of the batch sizes)",
      byLearner: true,
      args: z.object({ times: z.number().int().min(1).max(10000) }).strict(),
      run: (s, a) => {
        if (!s.canRun || !s.batches.includes(a.times) || s.trials >= MAX_TRIALS) return set({});
        const next = runTrials(s, a.times);
        const fraction = next.trials === 0 ? 0 : clean(next.hits / next.trials);
        const history = [...s.history, [next.trials, fraction] as [number, number]].slice(-HISTORY);
        const crossed = s.trials < MANY && next.trials >= MANY;
        return set(
          { ...next, history },
          { signal: RunSignal.Ran, payload: { trials: next.trials, hits: next.hits, fraction } },
          ...(crossed
            ? [{ signal: RunSignal.Many, payload: { trials: next.trials, fraction } }]
            : []),
        );
      },
    }),
    [RunAction.Reset]: act({
      describe: "Clear the counts (the random sequence carries on)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => (s.canRun ? set({ trials: 0, hits: 0, last: null, history: [] }) : set({})),
    }),
  },
  signals: {
    [RunSignal.Ran]: { describe: "A batch was run; the payload has trials, hits and the fraction" },
    [RunSignal.Many]: {
      describe: `The run passed ${MANY} trials; the payload has the fraction`,
      isCommit: true,
    },
  },
  observe: (s) => {
    const setup = setupOf(s);
    const p = probabilityOf(setup, s.favourable);
    const lastLabel = outcomesOf(setup).find((o) => o.id === s.last)?.label ?? "";
    const what =
      s.kind === Experiment.Bag
        ? `a bag of ${s.marbles.map((m) => `${m.count} ${COLOUR_WORDS[m.colour as Colour].en}`).join(", ")} marbles`
        : s.kind;
    const elements: Element[] = [
      {
        id: RunPart.Picture,
        value: s.last === null ? `${what}, not yet tried` : `${what}, last outcome ${lastLabel}`,
      },
      {
        id: RunPart.Counts,
        value: `${s.trials} trials, ${s.eventLabel.en} ${s.hits} times, experimental probability ${numText(empiricalOf(s), 3)}${
          s.showTheory ? `, theoretical ${fracText(p)}` : ""
        }`,
      },
      {
        id: RunPart.Graph,
        value:
          s.history.length === 0
            ? "an empty graph"
            : `the fraction after each run: ${s.history.map(([n, f]) => `${n}: ${numText(f, 3)}`).join(", ")}`,
      },
    ];
    return {
      summary: `Running an experiment (${what}), event: ${s.eventLabel.en}. ${favourableCount(setup, s.favourable)} of ${totalOutcomes(setup)} outcomes are favourable.`,
      elements,
    };
  },
  parts: (s) => [
    RunPart.Picture,
    RunPart.Counts,
    RunPart.Graph,
    ...(s.canRun ? [RunPart.Run] : []),
    ...(s.canRun && s.trials > 0 ? [RunPart.Reset] : []),
  ],
});

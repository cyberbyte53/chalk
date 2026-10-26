import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  DEFAULT_FACES,
  Experiment,
  complementOf,
  favourableCount,
  outcomesOf,
  probabilityOf,
  totalOutcomes,
  wordsSchema,
} from "./chance";
import { setupFields, setupOf } from "./chance-run";
import { type Fraction, fracText } from "./numbers";

/**
 * All the outcomes of an experiment laid out at once (NCERT 15.2): the 36 of two dice as a 6 × 6
 * grid, the 52 cards by suit, the 4 of two coins, the 6 of a die. An event is a set of them: the
 * author can light it up, the learner can tap outcomes to build it, and the count turns into
 * P(E) = favourable ÷ all. Showing the complement lights everything else: P(not E) = 1 − P(E).
 */

export const SpaceAction = {
  Toggle: "toggle",
  Clear: "clear",
  ShowEvent: "showEvent",
  ShowComplement: "showComplement",
} as const;
export const SpaceSignal = { Toggled: "toggled", Matched: "matched", Shown: "shown" } as const;
export const SpaceDerived = {
  Total: "total",
  Favourable: "favourableCount",
  Probability: "probability",
  Complement: "complement",
  Picked: "pickedCount",
  IsMatched: "isMatched",
} as const;
export const SpacePart = {
  Grid: "grid",
  Count: "count",
  Complement: "complement",
  Clear: "clear",
  Show: "show",
} as const;

const spaceState = z
  .object({
    ...setupFields,
    /** The event's outcome ids (what "show the event" lights, and the learner's target). */
    favourable: z.array(z.string().max(8)).max(52),
    eventLabel: wordsSchema,
    /** Outcomes the learner has tapped. */
    picked: z.array(z.string().max(8)).max(52),
    isEventShown: z.boolean(),
    isComplementShown: z.boolean(),
    /** The learner taps outcomes to build the event. */
    canPick: z.boolean(),
    /** Show the count and P(E) for what is lit. */
    showCount: z.boolean(),
  })
  .strict();
export type SpaceState = z.infer<typeof spaceState>;

const SPACE_KINDS: readonly string[] = [
  Experiment.Coin,
  Experiment.TwoCoins,
  Experiment.Die,
  Experiment.TwoDice,
  Experiment.Cards,
];

const sameSet = (a: readonly string[], b: readonly string[]) => {
  const sa = new Set(a);
  return sa.size === new Set(b).size && b.every((x) => sa.has(x));
};

/** The outcomes lit as "the event": the learner's picks while picking, else the author's event. */
export const litOf = (s: SpaceState): readonly string[] =>
  s.canPick && !s.isEventShown ? s.picked : s.isEventShown ? s.favourable : [];

export const isMatched = (s: SpaceState) => s.canPick && sameSet(s.picked, s.favourable);

export const probabilityLit = (s: SpaceState): Fraction => probabilityOf(setupOf(s), litOf(s));

const act = actionsFor<SpaceState>();

export const outcomeSpace = defineProp({
  type: "outcomeSpace",
  describe:
    "Every outcome of an experiment laid out at once: two dice as a 6 × 6 grid (first die down, second across), a pack of 52 cards in four rows by suit, two coins (HH, HT, TH, TT), one die or one coin. An event is a set of outcomes: it can be lit up, or the learner taps outcomes to build it, and the count shows P(E) = favourable ÷ all, in lowest terms. Showing the complement lights the rest: P(not E) = 1 − P(E).",
  state: spaceState,
  defaults: {
    kind: Experiment.TwoDice,
    faces: [...DEFAULT_FACES],
    marbles: [],
    sectors: [],
    favourable: ["2-6", "3-5", "4-4", "5-3", "6-2"],
    eventLabel: { en: "the sum is 8", hi: "योग 8 है" },
    picked: [],
    isEventShown: true,
    isComplementShown: false,
    canPick: false,
    showCount: true,
  },
  inputs: ["canPick", "showCount"],
  invariant: (s) => {
    if (!SPACE_KINDS.includes(s.kind))
      return "the outcome space shows coins, a die, two dice or cards";
    const ids = new Set(outcomesOf(setupOf(s)).map((o) => o.id));
    if (s.favourable.some((id) => !ids.has(id)))
      return "the event lists an outcome the experiment doesn't have";
    if (s.picked.some((id) => !ids.has(id))) return "a picked outcome isn't in the experiment";
    return undefined;
  },
  derived: {
    [SpaceDerived.Total]: {
      describe: "Number of outcomes in all",
      compute: (s) => totalOutcomes(setupOf(s)),
    },
    [SpaceDerived.Favourable]: {
      describe: "Number of outcomes favourable to the event",
      compute: (s) => favourableCount(setupOf(s), s.favourable),
    },
    [SpaceDerived.Probability]: {
      describe: "P(E) as a fraction in lowest terms",
      compute: (s) => fracText(probabilityOf(setupOf(s), s.favourable)),
    },
    [SpaceDerived.Complement]: {
      describe: "P(not E) as a fraction in lowest terms",
      compute: (s) => fracText(probabilityOf(setupOf(s), complementOf(setupOf(s), s.favourable))),
    },
    [SpaceDerived.Picked]: {
      describe: "How many outcomes the learner has picked",
      compute: (s) => s.picked.length,
    },
    [SpaceDerived.IsMatched]: {
      describe: "The learner's picks are exactly the event",
      compute: isMatched,
    },
  },
  actions: {
    [SpaceAction.Toggle]: act({
      describe: "Pick or unpick one outcome",
      byLearner: true,
      args: z.object({ id: z.string().max(8) }).strict(),
      run: (s, a) => {
        if (!s.canPick || s.isEventShown) return set({});
        if (!outcomesOf(setupOf(s)).some((o) => o.id === a.id)) return set({});
        const picked = s.picked.includes(a.id)
          ? s.picked.filter((x) => x !== a.id)
          : [...s.picked, a.id];
        const next = { ...s, picked };
        const matched = isMatched(next) && !isMatched(s);
        return set(
          { picked },
          { signal: SpaceSignal.Toggled, payload: { id: a.id, count: picked.length } },
          ...(matched ? [{ signal: SpaceSignal.Matched, payload: { count: picked.length } }] : []),
        );
      },
    }),
    [SpaceAction.Clear]: act({
      describe: "Unpick everything",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => (s.canPick ? set({ picked: [] }) : set({})),
    }),
    [SpaceAction.ShowEvent]: act({
      describe: "Light up (or hide) the event's outcomes",
      byLearner: true,
      args: z.object({ isShown: z.boolean() }).strict(),
      run: (s, a) =>
        set(
          { isEventShown: a.isShown },
          { signal: SpaceSignal.Shown, payload: { what: "event", isShown: a.isShown } },
        ),
    }),
    [SpaceAction.ShowComplement]: act({
      describe: "Light up (or hide) the complement: every outcome NOT in the event",
      byLearner: true,
      args: z.object({ isShown: z.boolean() }).strict(),
      run: (s, a) =>
        set(
          { isComplementShown: a.isShown },
          { signal: SpaceSignal.Shown, payload: { what: "complement", isShown: a.isShown } },
        ),
    }),
  },
  signals: {
    [SpaceSignal.Toggled]: {
      describe: "An outcome was picked or unpicked; the payload has the count",
    },
    [SpaceSignal.Matched]: {
      describe: "The learner's picks are now exactly the event",
    },
    [SpaceSignal.Shown]: { describe: "The event or the complement was lit up or hidden" },
  },
  observe: (s) => {
    const setup = setupOf(s);
    const outcomes = outcomesOf(setup);
    const lit = new Set(litOf(s));
    const label = (ids: Iterable<string>) => {
      const set = new Set(ids);
      return outcomes.filter((o) => set.has(o.id)).map((o) => o.label);
    };
    const total = totalOutcomes(setup);
    const comp = complementOf(setup, s.favourable);
    const elements: Element[] = [
      {
        id: SpacePart.Grid,
        value: `${total} outcomes; lit: ${lit.size === 0 ? "none" : label(lit).join(" ")}${
          s.canPick ? `; picked by the learner: ${s.picked.length}` : ""
        }`,
      },
    ];
    if (s.showCount)
      elements.push({
        id: SpacePart.Count,
        value: `${lit.size} of ${total} favourable, P = ${fracText(probabilityLit(s))}`,
      });
    if (s.isComplementShown)
      elements.push({
        id: SpacePart.Complement,
        value: `not (${s.eventLabel.en}): ${comp.length} outcomes, P = ${fracText(probabilityOf(setup, comp))}`,
      });
    return {
      summary: `The outcomes of ${s.kind}; event: ${s.eventLabel.en}.${s.canPick ? " The learner taps the outcomes of the event." : ""}`,
      elements,
      hidden: { favourable: s.favourable.length, matched: isMatched(s) },
    };
  },
  parts: (s) => [
    SpacePart.Grid,
    ...(s.showCount ? [SpacePart.Count] : []),
    ...(s.isComplementShown ? [SpacePart.Complement] : []),
    ...(s.canPick && s.picked.length > 0 ? [SpacePart.Clear] : []),
    SpacePart.Show,
  ],
});

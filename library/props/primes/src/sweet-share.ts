import { localizedSchema } from "@chalk/content";
import { type Emit, actionsFor, defineProp, raise, set, signal } from "@chalk/prop";
import { z } from "zod";
import { divide } from "./arithmetic";
import { count } from "./seen";

/** The most sweets in the box, and the most friends round the table. */
export const MAX_SWEETS = 120;
export const MAX_FRIENDS = 12;

const sweetShareState = z
  .object({
    /** a: how many sweets in the box at the start. */
    sweets: z.number().int().min(0).max(MAX_SWEETS),
    /** b: how many friends share them. */
    friends: z.number().int().min(1).max(MAX_FRIENDS),
    /** How many rounds are given so far: each round, every friend gets one sweet. */
    rounds: z.number().int().min(0),
    /** Whether the learner can change a and b. */
    isEditable: z.boolean(),
    /** Whether a = b × rounds + box is written under the table. */
    showSum: z.boolean(),
    /** Whether a row is kept for every round given: the round, each friend's sweets, the box. */
    showLog: z.boolean(),
    /** The words on the share button, from the lesson. */
    shareLabel: localizedSchema,
    /** The log's two column names, from the lesson. */
    roundsLabel: localizedSchema,
    boxLabel: localizedSchema,
  })
  .strict();
export type SweetShareState = z.infer<typeof sweetShareState>;

const act = actionsFor<SweetShareState>();
const none = z.object({}).strict();
const value = (max: number, min: number) =>
  z.object({ value: z.number().int().min(min).max(max) }).strict();

const boxOf = (s: SweetShareState) => s.sweets - s.friends * s.rounds;
const isOverOf = (s: SweetShareState) => boxOf(s) < s.friends;

const signals = {
  round: signal("A round was given; `rounds` so far and the `box` left"),
  over: signal("The box holds fewer sweets than friends: no round is possible; `q` and `r`"),
};
/**
 * Euclid's division lemma as a game: a sweets shared among b friends one round at a time, every
 * friend one sweet a round. A round is given while the box holds at least b; the game stops itself
 * when it holds fewer. Then the rounds are q, the box is r, a = bq + r and 0 ≤ r < b.
 */
export const sweetShare = defineProp({
  type: "sweetShare",
  describe:
    "a sweets shared equally among b friends, one round at a time: each round every friend gets one sweet from the box. A round can be given only while the box holds at least b sweets, so the game ends by itself with fewer than b left. At the end the rounds are the quotient q and the box is the remainder r: a = b × q + r with 0 ≤ r < b, and only one such q and r.",
  state: sweetShareState,
  defaults: {
    sweets: 17,
    friends: 5,
    rounds: 0,
    isEditable: false,
    showSum: false,
    showLog: false,
    shareLabel: { en: "Give everyone one", hi: "सबको एक दो" },
    roundsLabel: { en: "Rounds", hi: "बारियाँ" },
    boxLabel: { en: "Left in the box", hi: "डिब्बे में बचीं" },
  },
  inputs: ["isEditable", "showSum", "showLog"],
  // The answer, before the game gets there.
  offScreen: ["quotient", "remainder"],
  derived: {
    box: {
      describe: "The sweets still in the box",
      compute: boxOf,
    },
    canGiveRound: {
      describe: "The box holds at least one sweet for every friend",
      compute: (s) => !isOverOf(s),
    },
    isOver: {
      describe: "No round is possible: the box holds fewer sweets than there are friends",
      compute: isOverOf,
    },
    quotient: {
      describe: "q: how many rounds the game gives in all",
      compute: (s) => divide(s.sweets, s.friends).q,
    },
    remainder: {
      describe: "r: what the box holds when the game ends, always fewer than b",
      compute: (s) => divide(s.sweets, s.friends).r,
    },
  },
  actions: {
    giveRound: act({
      describe: "Give every friend one more sweet from the box (the learner's round button)",
      byLearner: true,
      changes: ["rounds"],
      args: none,
      run: (s) => {
        if (isOverOf(s)) return set({});
        const next = { ...s, rounds: s.rounds + 1 };
        const emits: Emit[] = [raise(signals.round, { rounds: next.rounds, box: boxOf(next) })];
        if (isOverOf(next)) {
          emits.push(raise(signals.over, { q: next.rounds, r: boxOf(next) }));
        }
        return set({ rounds: next.rounds }, ...emits);
      },
    }),
    giveAll: act({
      describe: "Give every round at once",
      reveals: true,
      changes: ["rounds"],
      args: none,
      run: (s) => {
        const { q, r } = divide(s.sweets, s.friends);
        if (s.rounds >= q) return set({});
        return set({ rounds: q }, raise(signals.over, { q, r }));
      },
    }),
    startAgain: act({
      describe: "Put every sweet back in the box",
      byLearner: true,
      changes: ["rounds"],
      args: none,
      run: () => set({ rounds: 0 }),
    }),
    setSweets: act({
      describe: "Change a, the sweets in the box; the sharing starts again",
      byLearner: true,
      changes: ["sweets", "rounds"],
      args: value(MAX_SWEETS, 0),
      run: (_s, a) => set({ sweets: a.value, rounds: 0 }),
    }),
    setFriends: act({
      describe: "Change b, how many friends; the sharing starts again",
      byLearner: true,
      changes: ["friends", "rounds"],
      args: value(MAX_FRIENDS, 1),
      run: (_s, a) => set({ friends: a.value, rounds: 0 }),
    }),
  },
  signals,
  invariant: (s) =>
    boxOf(s) >= 0
      ? undefined
      : `${s.rounds} rounds for ${s.friends} friends needs ${s.friends * s.rounds} sweets, more than ${s.sweets}`,
  summary: (s) =>
    `${count(s.sweets, "sweet")} shared among ${count(s.friends, "friend")}: ${count(s.rounds, "round")} given, each friend has ${s.rounds}, ${s.box} in the box${s.isOver ? "; no round is possible" : ""}`,
});

import { localizedSchema } from "@chalk/content";
import { actionsFor, layersFor, set, signal } from "@chalk/prop";
import { z } from "zod";
import { type PlaneCore, pointSchema } from "./plane";

export const throwSchema = z
  .object({ red: z.number().int().min(1).max(6), green: z.number().int().min(1).max(6) })
  .strict();

export type DiceState = PlaneCore & {
  counters: z.infer<typeof pointSchema>[];
  playerNames: z.infer<typeof localizedSchema>[];
  turn: number;
  lastThrow: z.infer<typeof throwSchema> | null;
  seed: number;
  throwsMade: number;
  goal: number;
  winner: number | null;
};

const act = actionsFor<DiceState>();
const none = z.object({}).strict();

export const diceSignals = {
  thrown: signal("Player `player` threw red `red` and green `green`"),
  counterMoved: signal("Player `player`'s counter walked to (`x`, `y`)"),
  missed: signal("Player `player` misses the turn: the move would pass `goal`"),
  sentHome: signal("Player `player`'s counter was landed on and goes back to (0, 0)"),
  won: signal("Player `player` reached (`goal`, `goal`) first"),
};

export const dice = layersFor<DiceState>()({
  name: "dice",
  frame: "plane",
  describe:
    "The dice game for two: both counters start at (0, 0). A throw of a red and a green die walks the player's counter along by red, then up by green. A move that would take either coordinate past the goal is missed; landing on the other counter sends it back to (0, 0). First to (goal, goal) wins. The dice are seeded, so a game can be played again exactly.",
  fields: {
    /** Each player's counter, or none: no game. */
    counters: z.array(pointSchema).max(2),
    playerNames: z.array(localizedSchema).max(2),
    /** Whose turn: 0 or 1. */
    turn: z.number().int().min(0).max(1),
    lastThrow: throwSchema.nullable(),
    /** The dice's seed: the same seed, the same throws. */
    seed: z.number().int().min(0),
    throwsMade: z.number().int().min(0),
    goal: z.number().int().min(2).max(20),
    winner: z.number().int().min(0).max(1).nullable(),
  },
  defaults: {
    counters: [],
    playerNames: [
      { en: "Riya", hi: "रिया" },
      { en: "Aman", hi: "अमन" },
    ],
    turn: 0,
    lastThrow: null,
    seed: 1,
    throwsMade: 0,
    goal: 10,
    winner: null,
  },
  offScreen: ["seed"],
  isOn: (s) => s.counters.length > 0,
  actions: {
    throwDice: act({
      describe:
        "Throw both dice for the player whose turn it is; the counter walks along by red, then up by green (the learner's Throw; timed)",
      byLearner: true,
      args: none,
      changes: ["counters", "turn", "lastThrow", "throwsMade", "winner"],
      run: () => set({}),
    }),
    startAgain: act({
      describe: "Both counters back to (0, 0), a new game (the learner's ↺)",
      byLearner: true,
      args: none,
      changes: ["counters", "turn", "lastThrow", "throwsMade", "winner"],
      run: () => set({}),
    }),
  },
  signals: diceSignals,
  invariant: (s) =>
    s.counters.some((c) => c.x < 0 || c.y < 0 || c.x > s.goal || c.y > s.goal)
      ? `a counter is off the board: both coordinates stay from 0 to ${s.goal}`
      : undefined,
});

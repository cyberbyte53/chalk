import { localizedSchema } from "@chalk/content";
import {
  type Effect,
  type Emit,
  actionsFor,
  layersFor,
  onWhen,
  raise,
  seq,
  set,
  signal,
  wait,
} from "@chalk/prop";
import { z } from "zod";
import { type PlaneCore, type Point, pointSchema } from "./plane";

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

/** Seconds a counter takes from one line to the next. */
const SECONDS_PER_LINE = 0.18;

/** A number from 0 to 1, the same for the same seed and n (mulberry32). */
function chance(seed: number, n: number): number {
  let t = (seed * 2654435761 + n * 40503 + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** The n-th throw of a game with this seed: red and green, 1 to 6 each. */
export function throwOf(seed: number, n: number): { red: number; green: number } {
  return {
    red: 1 + Math.floor(chance(seed, 2 * n) * 6),
    green: 1 + Math.floor(chance(seed, 2 * n + 1) * 6),
  };
}

const act = actionsFor<DiceState>();
const none = z.object({}).strict();

export const diceSignals = {
  thrown: signal("Player `player` threw red `red` and green `green`"),
  counterMoved: signal("Player `player`'s counter walked to (`x`, `y`)"),
  missed: signal("Player `player` misses the turn: both dice would take the counter past `goal`"),
  sentHome: signal("Player `player`'s counter was landed on and goes back to (0, 0)"),
  won: signal("Player `player` reached (`goal`, `goal`) first"),
};

export const dice = layersFor<DiceState>()({
  name: "dice",
  frame: "plane",
  describe:
    "The dice game for two: both counters start at (0, 0). A throw of a red and a green die walks the player's counter along by red, then up by green. A die that would take its coordinate past the goal isn't used, and the counter moves by the other alone; when both would, the turn is missed; landing on the other counter sends it back to (0, 0). First to (goal, goal) wins. The dice are seeded, so a game can be played again exactly.",
  fields: {
    /** Each player's counter, or none: no game. */
    counters: z.array(pointSchema).max(2),
    playerNames: z.array(localizedSchema).max(2),
    /** Whose turn: 0 or 1. */
    turn: z.number().int().min(0).max(1),
    lastThrow: throwSchema.nullable(),
    /** The dice's seed: the same seed, the same throws. */
    seed: z.number().int().min(0),
    /** Every throw so far, across games: the next throw is the seed's next. */
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
  on: onWhen(["counters"], (s) => s.counters.length > 0),
  actions: {
    throwDice: act({
      describe:
        "Throw both dice for the player whose turn it is; the counter walks along by red, then up by green, skipping a die that would pass the goal (the learner's Throw; timed)",
      byLearner: true,
      args: none,
      changes: ["counters", "turn", "lastThrow", "throwsMade", "winner"],
      run: (s) => {
        const me = s.turn;
        const from = s.counters[me];
        if (s.winner !== null || from === undefined) return set({});
        const thrown = throwOf(s.seed, s.throwsMade);
        const other = 1 - me;
        const rolled = set<DiceState>(
          { lastThrow: thrown, throwsMade: s.throwsMade + 1 },
          raise(diceSignals.thrown, { player: me, ...thrown }),
        );
        // A die that would take its coordinate past the goal isn't used (else a counter at 10 on
        // one coordinate could never move again); when neither can be used, the turn is missed.
        const along = from.x + thrown.red <= s.goal ? thrown.red : 0;
        const up = from.y + thrown.green <= s.goal ? thrown.green : 0;
        const to = { x: from.x + along, y: from.y + up };
        if (along === 0 && up === 0)
          return set(
            { lastThrow: thrown, throwsMade: s.throwsMade + 1, turn: other },
            raise(diceSignals.thrown, { player: me, ...thrown }),
            raise(diceSignals.missed, { player: me, goal: s.goal }),
          );
        // The counter walks along by red, then up by green, a line at a time.
        const at = (p: Point) => s.counters.map((c, i) => (i === me ? p : c));
        const walk: Effect<DiceState>[] = [];
        for (let k = 1; k <= along + up; k++) {
          const p = k <= along ? { x: from.x + k, y: from.y } : { x: to.x, y: from.y + k - along };
          walk.push(wait(SECONDS_PER_LINE), set({ counters: at(p) }));
        }
        const them = s.counters[other];
        const isOnThem =
          them !== undefined && them.x === to.x && them.y === to.y && (to.x !== 0 || to.y !== 0);
        const isWon = to.x === s.goal && to.y === s.goal;
        const counters = s.counters.map((c, i) =>
          i === me ? to : i === other && isOnThem ? { x: 0, y: 0 } : c,
        );
        const emit: Emit[] = [raise(diceSignals.counterMoved, { player: me, ...to })];
        if (isOnThem) emit.push(raise(diceSignals.sentHome, { player: other }));
        if (isWon) emit.push(raise(diceSignals.won, { player: me }));
        return seq(
          rolled,
          ...walk,
          set({ counters, turn: isWon ? me : other, winner: isWon ? me : null }, ...emit),
        );
      },
    }),
    startAgain: act({
      describe: "Both counters back to (0, 0), a new game (the learner's ↺)",
      byLearner: true,
      args: none,
      changes: ["counters", "turn", "lastThrow", "throwsMade", "winner"],
      run: (s) =>
        // throwsMade isn't reset: the next game goes on along the seed's throws, so it differs.
        set({
          counters: s.counters.map(() => ({ x: 0, y: 0 })),
          turn: 0,
          lastThrow: null,
          winner: null,
        }),
    }),
  },
  signals: diceSignals,
  invariant: (s) =>
    s.counters.some((c) => c.x < 0 || c.y < 0 || c.x > s.goal || c.y > s.goal)
      ? `a counter is off the board: both coordinates stay from 0 to ${s.goal}`
      : undefined,
});

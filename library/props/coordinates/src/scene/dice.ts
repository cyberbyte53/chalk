import { localizedSchema } from "@chalk/content";
import { PropRole } from "@chalk/prop";
import { type Out, action, prop, signal } from "@chalk/prop";
import { z } from "zod";
import { throwOf, throwSchema } from "../dice";
import { type Point, pointSchema } from "../plane";

/**
 * The dice game, on the event model: a throw walks the player's counter along by red, then up by
 * green, a line at a time (each line a "later" on the board's clock). The dice are seeded, so a
 * game can be played again exactly. It needs nothing from the plane.
 */

/** Seconds a counter takes from one line to the next. */
const SECONDS_PER_LINE = 0.18;

/** Who: player 0 or 1. A die's face: 1 to 6. A counter's coordinate: a whole number from 0. */
const player = z.number().int().min(0).max(1);
const face = z.number().int().min(1).max(6);
const coordinate = z.number().int().min(0);

export const dice = prop({
  type: "sceneDice",
  role: PropRole.Explainer,
  // The seed decides every throw: known, never shown.
  offScreen: ["seed"],
  describe:
    "The dice game for two: both counters start at (0, 0). A throw of a red and a green die walks the player's counter along by red, then up by green. A die that would take its coordinate past the goal isn't used, and the counter moves by the other alone; when both would, the turn is missed; landing on the other counter sends it back to (0, 0). First to (goal, goal) wins. The dice are seeded, so a game can be played again exactly.",
  variables: z
    .object({
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
    })
    .strict(),
  start: {
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
  actions: {
    throwDice: action(
      {},
      {
        from: "screen",
        describe:
          "Throw both dice for the player whose turn it is; the counter walks along by red, then up by green, skipping a die that would pass the goal (the learner's Throw; timed)",
      },
    ),
    startAgain: action(
      {},
      { from: "screen", describe: "Both counters back to (0, 0), a new game (the learner's ↺)" },
    ),
  },
  signals: {
    thrown: signal({ player, red: face, green: face }),
    counterMoved: signal({ player, x: coordinate, y: coordinate }),
    missed: signal({ player, goal: z.number().int().min(2) }),
    sentHome: signal({ player }),
    won: signal({ player }),
  },
  on: {
    throwDice: (s, _, t) => {
      const me = s.turn;
      const from = s.counters[me];
      if (s.winner !== null || from === undefined) return;
      const thrown = throwOf(s.seed, s.throwsMade);
      const other = 1 - me;
      const rolled = [
        t.set({ lastThrow: thrown, throwsMade: s.throwsMade + 1 }),
        t.tell.thrown({ player: me, ...thrown }),
      ];
      // A die that would take its coordinate past the goal isn't used (else a counter at 10 on
      // one coordinate could never move again); when neither can be used, the turn is missed.
      const along = from.x + thrown.red <= s.goal ? thrown.red : 0;
      const up = from.y + thrown.green <= s.goal ? thrown.green : 0;
      const to = { x: from.x + along, y: from.y + up };
      if (along === 0 && up === 0)
        return [...rolled, t.set({ turn: other }), t.tell.missed({ player: me, goal: s.goal })];
      // The counter walks along by red, then up by green, a line at a time.
      const at = (p: Point) => s.counters.map((c, i) => (i === me ? p : c));
      const walk: Out[] = [];
      for (let k = 1; k <= along + up; k++) {
        const p = k <= along ? { x: from.x + k, y: from.y } : { x: to.x, y: from.y + k - along };
        walk.push(t.later(SECONDS_PER_LINE * k, t.set({ counters: at(p) })));
      }
      const them = s.counters[other];
      const isOnThem =
        them !== undefined && them.x === to.x && them.y === to.y && (to.x !== 0 || to.y !== 0);
      const isWon = to.x === s.goal && to.y === s.goal;
      const counters = s.counters.map((c, i) =>
        i === me ? to : i === other && isOnThem ? { x: 0, y: 0 } : c,
      );
      return [
        ...rolled,
        ...walk,
        t.later(
          SECONDS_PER_LINE * (along + up),
          t.set({ counters, turn: isWon ? me : other, winner: isWon ? me : null }),
          t.tell.counterMoved({ player: me, ...to }),
          ...(isOnThem ? [t.tell.sentHome({ player: other })] : []),
          ...(isWon ? [t.tell.won({ player: me })] : []),
        ),
      ];
    },
    // throwsMade isn't reset: the next game goes on along the seed's throws, so it differs.
    startAgain: (s, _, t) =>
      t.set({
        counters: s.counters.map(() => ({ x: 0, y: 0 })),
        turn: 0,
        lastThrow: null,
        winner: null,
      }),
  },
  invariant: (s) =>
    s.counters.some((c) => c.x < 0 || c.y < 0 || c.x > s.goal || c.y > s.goal)
      ? `a counter is off the board: both coordinates stay from 0 to ${s.goal}`
      : s.counters.length > s.playerNames.length
        ? "every counter needs its player's name"
        : undefined,
});

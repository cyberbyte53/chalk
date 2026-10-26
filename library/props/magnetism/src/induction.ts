import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Electromagnetic induction (NCERT 13.5).
 * - Magnet mode (Activity 13.8): a coil AB joined to a galvanometer; a bar magnet faces end B.
 *   Moving the N pole towards the coil kicks the needle right for a moment; moving it away kicks
 *   it left; holding it still gives nothing. Moving the coil instead of the magnet does the same,
 *   and an S pole gives the opposite kicks: only the relative motion matters.
 * - Two-coils mode (Activity 13.9): coil 1 with a battery and key, coil 2 with a galvanometer on
 *   the same roll. Closing the key kicks the needle one way, opening it the other; a steady
 *   current gives nothing.
 * `kick` is the last momentary swing (+1 right, −1 left, 0 none); `flicks` counts them, so the
 * needle can swing and come back each time.
 */

export const InductionMode = { Magnet: "magnet", TwoCoils: "twoCoils" } as const;
export type InductionMode = (typeof InductionMode)[keyof typeof InductionMode];

/** Where the magnet is from the coil. */
export const Place = { Away: "away", Near: "near", Inside: "inside" } as const;
export type Place = (typeof Place)[keyof typeof Place];
const PLACE_ORDER: readonly Place[] = [Place.Away, Place.Near, Place.Inside];

export const Mover = { Magnet: "magnet", Coil: "coil" } as const;
export type Mover = (typeof Mover)[keyof typeof Mover];

export const InductionAction = {
  Move: "move",
  Hold: "hold",
  FlipMagnet: "flipMagnet",
  SetMover: "setMover",
  SetKey: "setKey",
} as const;
export const InductionSignal = { Kicked: "kicked" } as const;
export const InductionDerived = { LastKick: "lastKick", Gap: "gap" } as const;
export const InductionPart = {
  Magnet: "magnet",
  Coil: "coil",
  Galvanometer: "galvanometer",
  Key: "key",
  Controls: "controls",
} as const;

const inductionState = z
  .object({
    mode: z.nativeEnum(InductionMode),
    /** The magnet's pole that faces the coil's end B. */
    pole: z.enum(["N", "S"]),
    /** How close the magnet and coil are. */
    at: z.nativeEnum(Place),
    /** What the learner moves: the magnet or the coil. */
    mover: z.nativeEnum(Mover),
    /** Two-coils mode: coil 1's key is closed. */
    isClosed: z.boolean(),
    /** The last momentary swing of the needle: +1 right, −1 left, 0 none. */
    kick: z.number().int().min(-1).max(1),
    /** How many swings so far. */
    flicks: z.number().int().min(0),
    showCurrent: z.boolean(),
    canFlip: z.boolean(),
    canSetMover: z.boolean(),
  })
  .strict();
export type InductionState = z.infer<typeof inductionState>;

/**
 * The needle's kick for a move from one place to another: coming closer with N facing → right;
 * moving apart → left; S facing reverses both; no change → none.
 */
export function kickFor(pole: "N" | "S", from: Place, to: Place): -1 | 0 | 1 {
  const d = PLACE_ORDER.indexOf(to) - PLACE_ORDER.indexOf(from);
  if (d === 0) return 0;
  const closer = d > 0 ? 1 : -1;
  return (closer * (pole === "N" ? 1 : -1)) as -1 | 1;
}

/** Two coils: switching coil 1 on kicks one way (right), off the other (left). */
export const kickForKey = (wasClosed: boolean, isClosed: boolean): -1 | 0 | 1 =>
  wasClosed === isClosed ? 0 : isClosed ? 1 : -1;

const KICK_WORDS = { "1": "right", "-1": "left", "0": "none" } as const;
export const kickWord = (k: number) => KICK_WORDS[String(k) as "1" | "-1" | "0"];

export function describeInduction(s: InductionState): string {
  const needle =
    s.kick === 0
      ? "The galvanometer's needle rests at zero."
      : `The galvanometer's needle has just kicked to the ${kickWord(s.kick)} and swings back to zero.`;
  if (s.mode === InductionMode.TwoCoils)
    return `Two coils on one paper roll: coil 1 (more turns) with a battery and a key, which is ${s.isClosed ? "closed: a steady current flows in coil 1" : "open"}; coil 2 is joined to a galvanometer. ${needle}`;
  const where = s.at === Place.Away ? "far from" : s.at === Place.Near ? "close to" : "pushed into";
  return `A coil AB joined to a galvanometer; a bar magnet with its ${s.pole} pole facing end B is ${where} the coil. The learner moves the ${s.mover}. ${needle}`;
}

const act = actionsFor<InductionState>();
const kicked = (k: number, s: Pick<InductionState, "mode">) => ({
  signal: InductionSignal.Kicked,
  payload: { kick: k, direction: kickWord(k), mode: s.mode },
});

export const induction = defineProp({
  type: "induction",
  describe:
    "Electromagnetic induction (NCERT 13.5): a coil joined to a centre-zero galvanometer. Magnet mode (Activity 13.8): move a bar magnet (or the coil) closer or apart; the needle kicks one way coming closer and the other going apart, opposite for an S pole, and nothing while they're still. Two-coils mode (Activity 13.9): closing or opening the key of coil 1 kicks the needle of coil 2 one way, then the other; a steady current gives nothing.",
  state: inductionState,
  defaults: {
    mode: InductionMode.Magnet,
    pole: "N",
    at: Place.Away,
    mover: Mover.Magnet,
    isClosed: false,
    kick: 0,
    flicks: 0,
    showCurrent: false,
    canFlip: true,
    canSetMover: false,
  },
  inputs: ["showCurrent", "canFlip", "canSetMover"],
  derived: {
    [InductionDerived.LastKick]: {
      describe: "The needle's last momentary swing: right, left, or none",
      compute: (s) => kickWord(s.kick),
    },
    [InductionDerived.Gap]: {
      describe: "How close the magnet and coil are: away, near or inside",
      compute: (s) => s.at,
    },
  },
  actions: {
    [InductionAction.Move]: act({
      describe:
        "Move the magnet (or the coil) so they end up away, near, or with the magnet inside the coil",
      byLearner: true,
      args: z.object({ to: z.nativeEnum(Place) }).strict(),
      run: (s, a) => {
        const k = kickFor(s.pole, s.at, a.to);
        return set({ at: a.to, kick: k, flicks: k === 0 ? s.flicks : s.flicks + 1 }, kicked(k, s));
      },
    }),
    [InductionAction.Hold]: act({
      describe: "Hold everything still: no change, no current",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ kick: 0 }, kicked(0, s)),
    }),
    [InductionAction.FlipMagnet]: act({
      describe: "Turn the magnet round so the other pole faces the coil (it starts away again)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ pole: s.pole === "N" ? "S" : "N", at: Place.Away, kick: 0 }),
    }),
    [InductionAction.SetMover]: act({
      describe: "Choose what moves: the magnet or the coil",
      byLearner: true,
      args: z.object({ mover: z.nativeEnum(Mover) }).strict(),
      run: (_s, a) => set({ mover: a.mover }),
    }),
    [InductionAction.SetKey]: act({
      describe: "Two coils: close or open coil 1's key",
      byLearner: true,
      args: z.object({ isClosed: z.boolean() }).strict(),
      run: (s, a) => {
        const k = kickForKey(s.isClosed, a.isClosed);
        return set(
          { isClosed: a.isClosed, kick: k, flicks: k === 0 ? s.flicks : s.flicks + 1 },
          kicked(k, s),
        );
      },
    }),
  },
  signals: {
    [InductionSignal.Kicked]: {
      describe:
        "Something moved or switched; the payload says which way the needle kicked (or none)",
    },
  },
  observe: (s) => ({
    summary: describeInduction(s),
    elements: [
      ...(s.mode === InductionMode.Magnet
        ? [{ id: InductionPart.Magnet, value: `${s.pole} pole facing the coil, ${s.at}` }]
        : [{ id: InductionPart.Key, value: s.isClosed ? "closed" : "open" }]),
      {
        id: InductionPart.Coil,
        value: s.mode === InductionMode.Magnet ? "coil AB" : "coils 1 and 2",
      },
      {
        id: InductionPart.Galvanometer,
        value: s.kick === 0 ? "at zero" : `kicked ${kickWord(s.kick)}`,
      },
    ],
  }),
  parts: (s) => [
    ...(s.mode === InductionMode.Magnet ? [InductionPart.Magnet] : [InductionPart.Key]),
    InductionPart.Coil,
    InductionPart.Galvanometer,
    InductionPart.Controls,
  ],
});

import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/**
 * Activity 13.7: a small aluminium rod AB hangs from two wires between the poles of a horseshoe
 * magnet, and is seen end-on (end A towards you). The field runs straight up the page (N pole
 * below) or down (magnet turned over). A current through the rod from B to A comes out of the
 * page (⊙); from A to B it goes in (⊗). The force on it is I × B (Fleming's left-hand rule),
 * across the page, so the rod swings left or right: B → A with the field up pushes it left.
 * The force grows with the current, the strength of the magnet and the length of the rod.
 */

export const RodAction = {
  SetCurrent: "setCurrent",
  SetKey: "setKey",
  FlipMagnet: "flipMagnet",
  SetMagnet: "setMagnet",
  SetLength: "setLength",
} as const;
export const RodSignal = { Swung: "swung" } as const;
export const RodDerived = { Force: "force", Push: "push", Swing: "swing" } as const;
export const RodPart = {
  Magnet: "magnet",
  Rod: "rod",
  Force: "force",
  Controls: "controls",
} as const;

export const MAX_ROD_CURRENT = 3;
/** The swing (degrees) for one unit of force: current × field × length. */
export const DEG_PER_UNIT = 5;

const rodState = z
  .object({
    /** Current size, 0 to 3 units. */
    current: z.number().int().min(0).max(MAX_ROD_CURRENT),
    /** Which way the current flows along the rod. */
    isFromBToA: z.boolean(),
    isKeyClosed: z.boolean(),
    /** The magnet's N pole is below the rod, so the field points up (NCERT's set-up). */
    isFieldUp: z.boolean(),
    /** A stronger horse-shoe magnet: twice the field. */
    isStrongMagnet: z.boolean(),
    /** A rod twice as long between the poles. */
    isLongRod: z.boolean(),
    showForce: z.boolean(),
    showField: z.boolean(),
    canSetCurrent: z.boolean(),
    canFlip: z.boolean(),
    canSetMagnet: z.boolean(),
    canSetLength: z.boolean(),
  })
  .strict();
export type RodState = z.infer<typeof rodState>;

const flows = (s: Pick<RodState, "current" | "isKeyClosed">) => s.isKeyClosed && s.current > 0;

/** The force's size in units: current × field × length (0 with the key open). */
export function forceOf(s: RodState): number {
  if (!flows(s)) return 0;
  return s.current * (s.isStrongMagnet ? 2 : 1) * (s.isLongRod ? 2 : 1);
}

/**
 * Which way the rod is pushed. Current ⊙ (B → A) is +z, the field up is +y; F = I × B:
 * z × y = −x, to the left. Each reversal flips it.
 */
export function pushOf(s: RodState): "left" | "right" | null {
  if (forceOf(s) === 0) return null;
  const sign = (s.isFromBToA ? 1 : -1) * (s.isFieldUp ? 1 : -1);
  return sign > 0 ? "left" : "right";
}

/** The rod's swing from hanging straight, in degrees: + is to the right. */
export function swingOf(s: RodState): number {
  const p = pushOf(s);
  if (p === null) return 0;
  return (p === "right" ? 1 : -1) * Math.min(35, DEG_PER_UNIT * forceOf(s));
}

export function describeRod(s: RodState): string {
  const field = `The field between the poles points ${s.isFieldUp ? "up (N pole below)" : "down (N pole above)"}${s.isStrongMagnet ? ", from a strong magnet" : ""}.`;
  const rod = `The ${s.isLongRod ? "long " : ""}aluminium rod AB hangs between the poles, end A towards you.`;
  const current = !s.isKeyClosed
    ? "The key is open: no current, and the rod hangs straight."
    : s.current === 0
      ? "The key is closed but the current is zero; the rod hangs straight."
      : `A current of ${s.current} unit${s.current === 1 ? "" : "s"} flows from ${s.isFromBToA ? "B to A (out of the page)" : "A to B (into the page)"}, and the rod is pushed ${pushOf(s)}, swinging ${Math.abs(swingOf(s))}°.`;
  return `${rod} ${field} ${current}`;
}

const act = actionsFor<RodState>();
const swung = (s: RodState) => ({
  signal: RodSignal.Swung,
  payload: { push: pushOf(s), force: forceOf(s), swing: swingOf(s) },
});

export const forceOnRod = defineProp({
  type: "forceOnRod",
  describe:
    "Activity 13.7: an aluminium rod hanging between the poles of a horse-shoe magnet, seen end-on. Closing the key sends a current through it and the rod swings sideways: the force is at right angles to both the current and the field (Fleming's left-hand rule). Reversing the current or turning the magnet over reverses the swing; more current, a stronger magnet or a longer rod swings it further.",
  state: rodState,
  defaults: {
    current: 2,
    isFromBToA: true,
    isKeyClosed: false,
    isFieldUp: true,
    isStrongMagnet: false,
    isLongRod: false,
    showForce: true,
    showField: true,
    canSetCurrent: true,
    canFlip: true,
    canSetMagnet: false,
    canSetLength: false,
  },
  inputs: ["showForce", "showField", "canSetCurrent", "canFlip", "canSetMagnet", "canSetLength"],
  derived: {
    [RodDerived.Force]: {
      describe: "The force's size in units (current × field strength × length), 0 with no current",
      compute: (s) => forceOf(s),
    },
    [RodDerived.Push]: {
      describe: "Which way the rod is pushed: left, right, or null with no current",
      compute: (s) => pushOf(s),
    },
    [RodDerived.Swing]: {
      describe: "How far the rod swings from straight, degrees (+ right, − left)",
      compute: (s) => swingOf(s),
    },
  },
  actions: {
    [RodAction.SetKey]: act({
      describe: "Close or open the key",
      byLearner: true,
      args: z.object({ isClosed: z.boolean() }).strict(),
      run: (s, a) => set({ isKeyClosed: a.isClosed }, swung({ ...s, isKeyClosed: a.isClosed })),
    }),
    [RodAction.SetCurrent]: act({
      describe: "Set the current's size (0–3) and which way it flows (B → A or A → B)",
      byLearner: true,
      args: z
        .object({
          current: z.number().int().min(0).max(MAX_ROD_CURRENT),
          isFromBToA: z.boolean(),
        })
        .strict(),
      run: (s, a) =>
        set(
          { current: a.current, isFromBToA: a.isFromBToA },
          swung({ ...s, current: a.current, isFromBToA: a.isFromBToA }),
        ),
    }),
    [RodAction.FlipMagnet]: act({
      describe: "Turn the magnet over: the field reverses",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => set({ isFieldUp: !s.isFieldUp }, swung({ ...s, isFieldUp: !s.isFieldUp })),
    }),
    [RodAction.SetMagnet]: act({
      describe: "Use the ordinary or the stronger horse-shoe magnet",
      byLearner: true,
      args: z.object({ isStrong: z.boolean() }).strict(),
      run: (s, a) =>
        set({ isStrongMagnet: a.isStrong }, swung({ ...s, isStrongMagnet: a.isStrong })),
    }),
    [RodAction.SetLength]: act({
      describe: "Use the short rod or one twice as long",
      byLearner: true,
      args: z.object({ isLong: z.boolean() }).strict(),
      run: (s, a) => set({ isLongRod: a.isLong }, swung({ ...s, isLongRod: a.isLong })),
    }),
  },
  signals: {
    [RodSignal.Swung]: {
      describe: "Something changed; the payload has which way the rod is pushed and how far",
      isCommit: true,
    },
  },
  observe: (s) => ({
    summary: describeRod(s),
    elements: [
      { id: RodPart.Magnet, value: s.isFieldUp ? "field up" : "field down" },
      {
        id: RodPart.Rod,
        value:
          forceOf(s) === 0 ? "hanging straight" : `swung ${pushOf(s)} ${Math.abs(swingOf(s))}°`,
      },
      ...(s.showForce && forceOf(s) > 0 ? [{ id: RodPart.Force, value: pushOf(s) }] : []),
    ],
  }),
  parts: (s) => [
    RodPart.Magnet,
    RodPart.Rod,
    ...(s.showForce && forceOf(s) > 0 ? [RodPart.Force] : []),
    RodPart.Controls,
  ],
});

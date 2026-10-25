import { type Element, type Emit, actionsFor, defineProp, repeat, seq, set } from "@chalk/prop";
import { z } from "zod";
import { num, sig } from "./words";

/**
 * Charge flowing along a metal wire past one marked cross-section (NCERT 12.1). The current is
 * how much charge crosses that section each second, I = Q/t. A timer counts the charge that
 * crosses in t seconds. The moving charges can be drawn as conventional current (positive
 * charges, from + to −), as the electrons that really move (the other way), or both.
 */

export const ChargeAction = {
  SetCurrent: "setCurrent",
  Count: "count",
  Tick: "tick",
  Reset: "reset",
  SetShow: "setShow",
} as const;
export const ChargeSignal = { CurrentSet: "currentSet", Counted: "counted" } as const;
export const ChargeDerived = {
  Coulombs: "coulombs",
  Electrons: "electrons",
  PerSecond: "perSecond",
} as const;
export const ChargePart = {
  Wire: "wire",
  Section: "section",
  Counter: "counter",
  Controls: "controls",
} as const;

/** What the moving charges are drawn as. */
export const ChargeShow = {
  Conventional: "conventional",
  Electrons: "electrons",
  Both: "both",
} as const;
export type ChargeShow = (typeof ChargeShow)[keyof typeof ChargeShow];

/** The charge of one electron, in coulombs (its size; the sign is negative). */
export const ELECTRON_CHARGE = 1.6e-19;
export const MAX_AMPS = 5;
/** The learner's steps of current. */
export const AMP_STEP = 0.5;

const chargeState = z
  .object({
    /** The current, A. */
    amps: z.number().min(0).max(MAX_AMPS),
    /** Seconds counted so far. */
    seconds: z.number().min(0).max(600),
    isCounting: z.boolean(),
    /** How long one count runs, s. */
    countFor: z.number().int().min(1).max(60),
    show: z.nativeEnum(ChargeShow),
    /** Show the counter (t, Q = It). */
    showCount: z.boolean(),
    /** Show how many electrons the counted charge is. */
    showElectrons: z.boolean(),
    canSetCurrent: z.boolean(),
    canCount: z.boolean(),
  })
  .strict();
export type ChargeState = z.infer<typeof chargeState>;

export const coulombsOf = (s: Pick<ChargeState, "amps" | "seconds">) =>
  Math.round(s.amps * s.seconds * 1000) / 1000;
export const electronsOf = (coulombs: number) => coulombs / ELECTRON_CHARGE;

export function describeCharge(s: ChargeState): string {
  const what =
    s.show === ChargeShow.Electrons
      ? "electrons drifting from the − end towards the + end"
      : s.show === ChargeShow.Conventional
        ? "conventional current (positive charges) flowing from the + end towards the − end"
        : "conventional current flowing one way and the electrons drifting the other way";
  const flow =
    s.amps === 0
      ? "No current: nothing crosses the marked section."
      : `A current of ${num(s.amps)} A: ${num(s.amps)} coulomb of charge crosses the marked section every second, shown as ${what}.`;
  const count =
    s.seconds === 0
      ? ""
      : ` In ${num(s.seconds, 1)} s, Q = I × t = ${num(s.amps)} A × ${num(s.seconds, 1)} s = ${num(coulombsOf(s), 3)} C crossed${s.showElectrons ? `, about ${sig(electronsOf(coulombsOf(s)))} electrons` : ""}.`;
  return `A metal wire with one cross-section marked. ${flow}${count}`;
}

const act = actionsFor<ChargeState>();

/** Seconds the count moves on each step. */
const COUNT_STEP = 0.25;

/** The count is done: what it found. */
const countedAt = (s: ChargeState): Emit => ({
  signal: ChargeSignal.Counted,
  payload: { seconds: s.seconds, amps: s.amps, coulombs: coulombsOf(s) },
});

export const chargeFlow = defineProp({
  type: "chargeFlow",
  describe:
    "Charge flowing along a metal wire past one marked cross-section (NCERT 12.1): the current I is the charge crossing that section each second, I = Q/t, in amperes (1 A = 1 C/s). The learner sets the current and runs a timer that counts the charge crossing in t seconds, Q = It, and how many electrons that is (1 C ≈ 6 × 10¹⁸ electrons, each 1.6 × 10⁻¹⁹ C). Charges are drawn as conventional current (+ to −), as electrons (moving the other way), or both.",
  state: chargeState,
  defaults: {
    amps: 0.5,
    seconds: 0,
    isCounting: false,
    countFor: 10,
    show: ChargeShow.Conventional,
    showCount: true,
    showElectrons: false,
    canSetCurrent: true,
    canCount: true,
  },
  inputs: ["show", "showCount", "showElectrons", "canSetCurrent", "canCount", "countFor"],
  derived: {
    [ChargeDerived.Coulombs]: {
      describe: "Charge counted so far, Q = I × t, in coulombs",
      compute: (s) => coulombsOf(s),
    },
    [ChargeDerived.Electrons]: {
      describe: "How many electrons the counted charge is (Q ÷ 1.6 × 10⁻¹⁹ C)",
      compute: (s) => electronsOf(coulombsOf(s)),
    },
    [ChargeDerived.PerSecond]: {
      describe: "Coulombs crossing the section each second: the current in amperes",
      compute: (s) => s.amps,
    },
  },
  actions: {
    [ChargeAction.SetCurrent]: act({
      describe: "Set the current (A); the count starts again from zero",
      byLearner: true,
      args: z.object({ amps: z.number().min(0).max(MAX_AMPS) }).strict(),
      run: (_s, a) =>
        set(
          { amps: a.amps, seconds: 0, isCounting: false },
          { signal: ChargeSignal.CurrentSet, payload: { amps: a.amps } },
        ),
    }),
    [ChargeAction.Count]: act({
      describe:
        "Start the clock from zero and count the charge crossing the section for `countFor` seconds",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (s.countFor <= 0)
          return set({ seconds: 0, isCounting: false }, countedAt({ ...s, seconds: 0 }));
        return seq(
          set({ seconds: 0, isCounting: true }),
          repeat(COUNT_STEP, ChargeAction.Tick, { while: (now) => now.isCounting }),
        );
      },
    }),
    [ChargeAction.Tick]: act({
      describe: "Move the clock on by one step (its own clock)",
      internal: true,
      args: z.object({}).strict(),
      run: (s) => {
        const seconds = Math.min(s.countFor, Math.round((s.seconds + COUNT_STEP) * 100) / 100);
        if (seconds < s.countFor) return set({ seconds });
        return set({ seconds, isCounting: false }, countedAt({ ...s, seconds }));
      },
    }),
    [ChargeAction.Reset]: act({
      describe: "Stop and clear the count",
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ seconds: 0, isCounting: false }),
    }),
    [ChargeAction.SetShow]: act({
      describe: "Draw the charges as conventional current, electrons, or both",
      byLearner: true,
      args: z.object({ show: z.nativeEnum(ChargeShow) }).strict(),
      run: (_s, a) => set({ show: a.show }),
    }),
  },
  signals: {
    [ChargeSignal.CurrentSet]: { describe: "The learner set the current", isCommit: true },
    [ChargeSignal.Counted]: {
      describe: "A count finished; the payload has seconds, amps and coulombs",
      isCommit: true,
    },
  },
  observe: (s) => {
    const elements: Element[] = [
      { id: ChargePart.Wire, value: `current ${num(s.amps)} A` },
      { id: ChargePart.Section, value: "the marked cross-section" },
    ];
    if (s.showCount)
      elements.push({
        id: ChargePart.Counter,
        value: `t = ${num(s.seconds, 1)} s, Q = ${num(coulombsOf(s), 3)} C`,
      });
    return {
      summary: describeCharge(s),
      elements,
      hidden: s.showCount ? {} : { coulombs: coulombsOf(s) },
    };
  },
  parts: (s) => [
    ChargePart.Wire,
    ChargePart.Section,
    ...(s.showCount ? [ChargePart.Counter] : []),
    ...(s.canSetCurrent || s.canCount ? [ChargePart.Controls] : []),
  ],
});

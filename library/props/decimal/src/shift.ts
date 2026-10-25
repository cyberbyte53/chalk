import { actionsFor, defineProp, emit, seq, set, tween } from "@chalk/prop";
import { z } from "zod";
import {
  type Recurring,
  areTailsLinedUp,
  decimalText,
  differenceOf,
  digitsAfterPoint,
  digitsInText,
  fractionOf,
  fractionText,
  integerText,
  multipleLabel,
  powerOfTen,
  shortestPeriod,
  tapeText,
} from "./shift-maths";

export const Tape = { Top: "top", Bottom: "bottom" } as const;
export type Tape = (typeof Tape)[keyof typeof Tape];

export const DecimalShiftSignal = { Shifted: "shifted", Subtracted: "subtracted" } as const;

export const DecimalShiftPart = {
  TopTape: "topTape",
  BottomTape: "bottomTape",
  TopDigitPrefix: "topDigit:",
  BottomDigitPrefix: "bottomDigit:",
  Tail: "tail",
  TopShift: "topShift",
  BottomShift: "bottomShift",
  Minus: "minus",
  Difference: "difference",
  Result: "result",
} as const;

export const MAX_WHOLE = 999;
export const MAX_POWER = 6;
/** How long the subtraction takes, in seconds. */
export const SUBTRACT_SECONDS = 1.4;
/** How many digits after the point each tape draws (the view fades the last ones out). */
export const DIGITS_DRAWN = 12;

const whole = z.number().int().min(0).max(MAX_WHOLE);
const prefix = z.string().regex(/^\d{0,4}$/, "the non-repeating digits: 0 to 4 digits");
const block = z
  .string()
  .regex(/^\d{1,4}$/, "the repeating block: 1 to 4 digits")
  .refine((b) => !/^0+$/.test(b), "the repeating block can't be all zeros");
const power = z.number().int().min(0).max(MAX_POWER);
const tape = z.nativeEnum(Tape);

const decimalShiftState = z
  .object({
    /** The whole-number part of x. */
    whole,
    /** The digits after the point that do not repeat. */
    prefix,
    /** The digits that repeat forever. */
    block,
    /** The top tape shows 10^topPower × x. */
    topPower: power,
    /** The bottom tape shows 10^bottomPower × x. */
    bottomPower: power,
    /** How far the subtraction has gone: 0 lined up, 1 subtracted. */
    cancel: z.number().min(0).max(1),
    /** Whether the line x = p/q may be shown. */
    showResult: z.boolean(),
  })
  .strict();
export type DecimalShiftState = z.infer<typeof decimalShiftState>;

const act = actionsFor<DecimalShiftState>();

/** One tape at a new power, un-subtracted. */
function moveTape(t: Tape, to: number): Partial<DecimalShiftState> {
  return t === Tape.Top ? { topPower: to, cancel: 0 } : { bottomPower: to, cancel: 0 };
}

function isLinedUp(s: DecimalShiftState): boolean {
  return areTailsLinedUp(s, s.topPower, s.bottomPower);
}

function isDifferenceWhole(s: DecimalShiftState): boolean {
  return (
    s.topPower > s.bottomPower && differenceOf(s, s.topPower, s.bottomPower).denominator === 1n
  );
}

function multiplier(s: DecimalShiftState): number {
  return Number(powerOfTen(s.topPower) - powerOfTen(s.bottomPower));
}

/** x as written: "0.2353535…". */
function xText(x: Recurring): string {
  return `${integerText(x, 0)}.${digitsAfterPoint(x, 0, digitsInText(x, 0))}…`;
}

/**
 * Shift and subtract: a recurring decimal x on two tapes, 10^topPower × x over 10^bottomPower × x.
 * Subtracting takes the tails away exactly when they are lined up. It knows recurring decimals,
 * nothing about any lesson.
 */
export const decimalShift = defineProp({
  type: "decimalShift",
  describe:
    "A recurring decimal x = whole.prefix followed by block repeated forever, on two tapes: the top shows 10^topPower × x, the bottom 10^bottomPower × x. ×10 slides the digits one place left. Subtracting the bottom from the top cancels the infinite tails exactly when they are lined up (the shift is a whole number of repeating blocks); what is left is (10^topPower − 10^bottomPower) × x, a decimal that ends, so x = p/q.",
  state: decimalShiftState,
  defaults: {
    whole: 0,
    prefix: "",
    block: "3",
    topPower: 1,
    bottomPower: 0,
    cancel: 0,
    showResult: false,
  },
  derived: {
    numerator: {
      describe: "x as p/q in lowest terms: p",
      compute: (s) => Number(fractionOf(s).numerator),
    },
    denominator: {
      describe: "x as p/q in lowest terms: q",
      compute: (s) => Number(fractionOf(s).denominator),
    },
    period: {
      describe: "The length of the shortest repeating block",
      compute: (s) => shortestPeriod(s.block),
    },
    xText: { describe: 'x as written, e.g. "0.2353535…"', compute: xText },
    topText: {
      describe: 'The top tape as an equation, e.g. "100x = 23.535353…"',
      compute: (s) => tapeText(s, s.topPower),
    },
    bottomText: {
      describe: 'The bottom tape as an equation, e.g. "x = 0.2353535…"',
      compute: (s) => tapeText(s, s.bottomPower),
    },
    multiplier: {
      describe: "10^topPower − 10^bottomPower: how many x are left after subtracting (99)",
      compute: multiplier,
    },
    areTailsLinedUp: {
      describe:
        "From some place on, the two tapes' digits after the point agree forever (the shift is a positive multiple of the period)",
      compute: isLinedUp,
    },
    isDifferenceWhole: {
      describe: "Top minus bottom is a whole number (every digit after the point cancels)",
      compute: isDifferenceWhole,
    },
    differenceText: {
      describe:
        'Top minus bottom: "99x = 23.3" exactly when lined up, else the first digits then "…"; "" unless the top tape is the larger',
      compute: (s) =>
        s.topPower > s.bottomPower
          ? `${multipleLabel(multiplier(s))} = ${decimalText(differenceOf(s, s.topPower, s.bottomPower))}`
          : "",
    },
    hasSubtracted: { describe: "The subtraction is done", compute: (s) => s.cancel === 1 },
    isResultShown: {
      describe: "The line x = p/q is on screen (showResult, subtracted, tails lined up)",
      compute: (s) => s.showResult && s.cancel === 1 && isLinedUp(s),
    },
    resultText: {
      describe: 'x as p/q in lowest terms, e.g. "x = 233/990"',
      compute: (s) => `x = ${fractionText(fractionOf(s))}`,
    },
  },
  inputs: ["showResult"],
  offScreen: ["numerator", "denominator", "period", "resultText"],
  actions: {
    shift: act({
      describe:
        "Multiply (by 1) or divide (by -1) one tape by 10: its digits slide one place. Un-subtracts. Keeps x and the other tape. Does nothing past 0 or 6.",
      byLearner: true,
      args: z.object({ tape, by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        const next = (a.tape === Tape.Top ? s.topPower : s.bottomPower) + a.by;
        if (next < 0 || next > MAX_POWER) return set({});
        return set(moveTape(a.tape, next), {
          signal: DecimalShiftSignal.Shifted,
          payload: { tape: a.tape, power: next },
        });
      },
    }),
    setPower: act({
      describe: "Show 10^power × x on one tape. Un-subtracts. Keeps x and the other tape.",
      args: z.object({ tape, power }).strict(),
      run: (_s, a) =>
        set(moveTape(a.tape, a.power), {
          signal: DecimalShiftSignal.Shifted,
          payload: { tape: a.tape, power: a.power },
        }),
    }),
    subtract: act({
      describe: `Subtract the bottom tape from the top, over ${SUBTRACT_SECONDS} s (lined-up tails cancel). Needs the top tape to be the larger. Keeps x and both tapes.`,
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (s.topPower <= s.bottomPower) {
          throw new Error(
            "the top tape must show the larger multiple of x (topPower > bottomPower) to subtract",
          );
        }
        if (s.cancel === 1) return set({});
        // Moving the tapes or the number meanwhile un-subtracts, which stops the glide.
        const end = { ...s, cancel: 1 };
        return seq(
          tween(SUBTRACT_SECONDS * (1 - s.cancel), { cancel: 1 }),
          emit(DecimalShiftSignal.Subtracted, {
            isLinedUp: isLinedUp(end),
            isWhole: isDifferenceWhole(end),
            multiplier: multiplier(end),
          }),
        );
      },
    }),
    startAgain: act({
      describe: "Un-subtract: the two tapes lined up again. Keeps x and both tapes.",
      args: z.object({}).strict(),
      run: () => set({ cancel: 0 }),
    }),
    setNumber: act({
      describe:
        "A new x = whole.prefix then block repeated forever. Un-subtracts. Keeps both tapes' powers.",
      args: z.object({ whole, prefix, block }).strict(),
      run: (_s, a) => set({ whole: a.whole, prefix: a.prefix, block: a.block, cancel: 0 }),
    }),
    revealResult: act({
      describe: "Show the line x = p/q (drawn once subtracted with the tails lined up)",
      reveals: true,
      args: z.object({}).strict(),
      run: () => set({ showResult: true }),
    }),
  },
  signals: {
    [DecimalShiftSignal.Shifted]: {
      describe: "A tape was multiplied or divided by 10; `tape` and its new `power`",
    },
    [DecimalShiftSignal.Subtracted]: {
      describe:
        "The subtraction finished; `isLinedUp` (the tails cancelled), `isWhole` (what is left is whole), `multiplier` (99)",
    },
  },
  parts: (s) => {
    const out: string[] = [
      DecimalShiftPart.TopTape,
      DecimalShiftPart.BottomTape,
      DecimalShiftPart.TopShift,
      DecimalShiftPart.BottomShift,
      DecimalShiftPart.Minus,
    ];
    for (let n = 1; n <= DIGITS_DRAWN; n++) {
      out.push(
        `${DecimalShiftPart.TopDigitPrefix}${n}`,
        `${DecimalShiftPart.BottomDigitPrefix}${n}`,
      );
    }
    if (isLinedUp(s)) out.push(DecimalShiftPart.Tail);
    if (s.cancel === 1 && s.topPower > s.bottomPower) out.push(DecimalShiftPart.Difference);
    if (s.showResult && s.cancel === 1 && isLinedUp(s)) out.push(DecimalShiftPart.Result);
    return out;
  },
  invariant: (s) =>
    s.cancel > 0 && s.topPower <= s.bottomPower
      ? "cancel can be above 0 only when the top tape is the larger (topPower > bottomPower)"
      : undefined,
});

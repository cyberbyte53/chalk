import { type Emit, PropRole, actionsFor, defineProp, raise, set, signal } from "@chalk/prop";
import { z } from "zod";
import { divide, isTerminating, repeatingBlock, step } from "./division";

export const MAX_NUMERATOR = 99_999;
export const MAX_DENOMINATOR = 999;
/** The most digits after the point it will work out. */
export const MAX_DIGITS = 60;

const numerator = z.number().int().min(0).max(MAX_NUMERATOR);
const denominator = z.number().int().min(1).max(MAX_DENOMINATOR);

const decimalExpansionState = z
  .object({
    /** p, the number being divided. */
    numerator,
    /** q, the number it is divided by. */
    denominator,
    /** How many digits after the decimal point have been worked out. */
    digitsShown: z.number().int().min(0).max(MAX_DIGITS),
    /** Whether the remainder clock is drawn beside the division. */
    isClockShown: z.boolean(),
    /** Whether the learner works out each next digit (a digit pad) instead of tapping for it. */
    isAskingDigit: z.boolean(),
    /** Whether the learner can type p and q. */
    isEditable: z.boolean(),
    /** The digit the learner last tried that doesn't fit, or null. */
    rejectedDigit: z.number().int().min(0).max(9).nullable(),
  })
  .strict();
export type DecimalExpansionState = z.infer<typeof decimalExpansionState>;

const act = actionsFor<DecimalExpansionState>();

/** How far the division can go: to its last digit if it terminates, else as far as it shows. */
function lastDigit(s: DecimalExpansionState): number {
  const block = repeatingBlock(s.numerator, s.denominator);
  return block.length === 0 ? block.start : MAX_DIGITS;
}

function hasEnded(s: DecimalExpansionState): boolean {
  const block = repeatingBlock(s.numerator, s.denominator);
  return block.length === 0 && s.digitsShown >= block.start;
}

function hasRepeated(s: DecimalExpansionState): boolean {
  const block = repeatingBlock(s.numerator, s.denominator);
  return block.length > 0 && s.digitsShown >= block.start + block.length;
}

/** The number divided at the next step: the latest remainder with a 0 brought down. */
function partialDividend(s: DecimalExpansionState): number {
  return (divide(s.numerator, s.denominator, s.digitsShown).remainders.at(-1) ?? 0) * 10;
}

/** The signals for the end or the repeat coming into view on the way from `before` to `after`. */
function milestones(before: DecimalExpansionState, after: DecimalExpansionState): Emit[] {
  const out: Emit[] = [];
  if (!hasEnded(before) && hasEnded(after)) out.push(raise(signals.ended));
  if (!hasRepeated(before) && hasRepeated(after)) {
    const { start, length } = repeatingBlock(after.numerator, after.denominator);
    out.push(raise(signals.repeated, { start, length }));
  }
  return out;
}

function decimalText(s: DecimalExpansionState): string {
  const { wholePart, digits } = divide(s.numerator, s.denominator, s.digitsShown);
  const after = digits.join("");
  if (hasEnded(s)) return after === "" ? `${wholePart}` : `${wholePart}.${after}`;
  return after === "" ? `${wholePart}…` : `${wholePart}.${after}…`;
}

const digit = z.number().int().min(0).max(9);
const whole = z.number().int().min(0);

const signals = {
  digitFound: signal(
    "One more digit was worked out; `position` (from 1 after the point), `digit`, and the `remainder` left",
    { position: z.number().int().min(1), digit, remainder: whole },
  ),
  ended: signal("The remainder became 0: the expansion terminates"),
  repeated: signal(
    "A remainder came back: the `length` digits after the first `start` repeat from here on",
    { start: whole, length: z.number().int().min(1) },
  ),
  digitRejected: signal(
    "The learner tried a digit that doesn't fit: `digit`, the `dividend` it was for, `product` (digit × denominator) and `isTooBig` (the product is more than the dividend; otherwise the remainder would be too big)",
    { digit, dividend: whole, product: whole, isTooBig: z.boolean() },
  ),
};
/** Turning p/q into a decimal by long division, one digit at a time. It knows division, nothing about any lesson. */
export const decimalExpansion = defineProp({
  type: "decimalExpansion",
  role: PropRole.Explainer,
  describe:
    "The long division of numerator by denominator, worked out one digit after the decimal point at a time, with the remainder at each step. Either a remainder becomes 0 (the expansion terminates) or a remainder comes back and the digits repeat from there.",
  state: decimalExpansionState,
  defaults: {
    numerator: 1,
    denominator: 7,
    digitsShown: 0,
    isClockShown: false,
    isAskingDigit: false,
    isEditable: false,
    rejectedDigit: null,
  },
  derived: {
    wholePart: {
      describe: "The whole-number part",
      compute: (s) => Math.floor(s.numerator / s.denominator),
    },
    digits: {
      describe: "The digits after the decimal point worked out so far, as text",
      compute: (s) => divide(s.numerator, s.denominator, s.digitsShown).digits.join(""),
    },
    remainders: {
      describe:
        "The remainder at each step: the first is left after the whole part, then one after each digit",
      compute: (s) => divide(s.numerator, s.denominator, s.digitsShown).remainders,
    },
    remainder: {
      describe: "The latest remainder",
      compute: (s) => divide(s.numerator, s.denominator, s.digitsShown).remainders.at(-1) ?? 0,
    },
    isTerminating: {
      describe:
        "Whether the decimal expansion terminates (in lowest terms, the denominator has no prime factors but 2 and 5)",
      compute: (s) => isTerminating(s.numerator, s.denominator),
    },
    repeatStart: {
      describe:
        "How many digits after the point come before the repeating block (if it terminates: how many digits it has)",
      compute: (s) => repeatingBlock(s.numerator, s.denominator).start,
    },
    repeatLength: {
      describe: "How many digits repeat (0 if it terminates)",
      compute: (s) => repeatingBlock(s.numerator, s.denominator).length,
    },
    hasEnded: {
      describe: "It terminates and its last digit is shown (a remainder of 0 has been reached)",
      compute: hasEnded,
    },
    hasRepeated: {
      describe: "A remainder already seen has come back in what is shown",
      compute: hasRepeated,
    },
    decimalText: {
      describe: 'What is shown, as text, e.g. "3.142857…" or "0.125"',
      compute: decimalText,
    },
    partialDividend: {
      describe:
        "The number divided at the next step: the latest remainder times 10 (a 0 brought down)",
      compute: partialDividend,
    },
    slots: {
      describe:
        "How many different non-zero remainders dividing by the denominator can leave (denominator − 1): the slots on the remainder clock",
      compute: (s) => s.denominator - 1,
    },
  },
  offScreen: ["isTerminating", "repeatStart", "repeatLength"],
  summary: (s) =>
    `${s.numerator} ÷ ${s.denominator} worked out to ${s.digitsShown} digits: ${s.decimalText}${
      s.hasEnded ? ", and it ends" : s.hasRepeated ? ", and a remainder came back: it repeats" : ""
    }`,
  actions: {
    nextDigit: act({
      describe:
        "Work out one more digit (the learner's tap). Keeps the fraction. Does nothing once it has ended.",
      changes: ["digitsShown", "rejectedDigit"],
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (hasEnded(s) || s.digitsShown >= MAX_DIGITS) return set({});
        const after = { ...s, digitsShown: s.digitsShown + 1 };
        const next = step(partialDividend(s) / 10, s.denominator);
        return set(
          { digitsShown: after.digitsShown, rejectedDigit: null },
          raise(signals.digitFound, {
            position: after.digitsShown,
            digit: next.digit,
            remainder: next.remainder,
          }),
          ...milestones(s, after),
        );
      },
    }),
    tryDigit: act({
      describe:
        'The learner\'s answer to "how many times does the denominator go into the partial dividend?". If it is the next digit, the step is done (as nextDigit); if not, nothing moves and `digitRejected` says whether it was too big or too small.',
      changes: ["rejectedDigit", "digitsShown"],
      byLearner: true,
      args: z.object({ digit: z.number().int().min(0).max(9) }).strict(),
      run: (s, a) => {
        if (hasEnded(s) || s.digitsShown >= MAX_DIGITS) return set({});
        const dividend = partialDividend(s);
        const next = step(dividend / 10, s.denominator);
        const right = next.digit;
        if (a.digit !== right) {
          const product = a.digit * s.denominator;
          return set(
            { rejectedDigit: a.digit },
            raise(signals.digitRejected, {
              digit: a.digit,
              dividend,
              product,
              isTooBig: product > dividend,
            }),
          );
        }
        const after = { ...s, digitsShown: s.digitsShown + 1 };
        return set(
          { digitsShown: after.digitsShown, rejectedDigit: null },
          raise(signals.digitFound, {
            position: after.digitsShown,
            digit: right,
            remainder: next.remainder,
          }),
          ...milestones(s, after),
        );
      },
    }),
    askForDigits: act({
      describe: "Turn the digit pad on (the learner works out each digit) or off (a tap does it)",
      changes: ["isAskingDigit", "rejectedDigit"],
      args: z.object({ isAsking: z.boolean() }).strict(),
      run: (_s, a) => set({ isAskingDigit: a.isAsking, rejectedDigit: null }),
    }),
    showClock: act({
      describe: "Show or hide the remainder clock",
      changes: ["isClockShown"],
      args: z.object({ isShown: z.boolean() }).strict(),
      run: (_s, a) => set({ isClockShown: a.isShown }),
    }),
    showDigits: act({
      describe:
        "Show this many digits after the point (no more than it has, if it terminates). Keeps the fraction.",
      changes: ["digitsShown", "rejectedDigit"],
      args: z.object({ count: z.number().int().min(0).max(MAX_DIGITS) }).strict(),
      run: (s, a) => {
        const after = { ...s, digitsShown: Math.min(a.count, lastDigit(s)) };
        return set(
          { digitsShown: after.digitsShown, rejectedDigit: null },
          ...milestones(s, after),
        );
      },
    }),
    completeDivision: act({
      describe:
        "Carry on until the division ends or a remainder comes back (or the most digits it shows). Keeps the fraction.",
      changes: ["digitsShown", "rejectedDigit"],
      args: z.object({}).strict(),
      reveals: true,
      run: (s) => {
        const { start, length } = repeatingBlock(s.numerator, s.denominator);
        const after = { ...s, digitsShown: Math.min(start + length, MAX_DIGITS) };
        return set(
          { digitsShown: after.digitsShown, rejectedDigit: null },
          ...milestones(s, after),
        );
      },
    }),
    startAgain: act({
      describe: "Go back to no digits worked out. Keeps the fraction.",
      changes: ["digitsShown", "rejectedDigit"],
      byLearner: true,
      args: z.object({}).strict(),
      run: () => set({ digitsShown: 0, rejectedDigit: null }),
    }),
    setFraction: act({
      describe:
        "Divide a new fraction, with no digits worked out yet (the learner types it when editable)",
      changes: ["numerator", "denominator", "digitsShown", "rejectedDigit"],
      byLearner: true,
      args: z.object({ numerator, denominator }).strict(),
      run: (_s, a) =>
        set({
          numerator: a.numerator,
          denominator: a.denominator,
          digitsShown: 0,
          rejectedDigit: null,
        }),
    }),
  },
  signals,
  invariant: (s) => {
    const last = lastDigit(s);
    return s.digitsShown > last
      ? `${s.numerator}/${s.denominator} ends after ${last} digits, so digitsShown can be at most ${last}`
      : undefined;
  },
});

import { localizedSchema } from "@chalk/content";
import { type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { type Bag, bagOf, gcd, primesIn } from "./arithmetic";
import { button, sup } from "./seen";

export const MAX_TERM = 99_999;

/**
 * How far the fraction has been taken: as given; common primes cancelled (lowest terms); the
 * denominator's 2s and 5s paired into tens; the missing partners added above and below, so the
 * denominator is a power of 10.
 */
export const TenStage = {
  Given: "given",
  Cancelled: "cancelled",
  Paired: "paired",
  ToppedUp: "toppedUp",
} as const;
export type TenStage = (typeof TenStage)[keyof typeof TenStage];

export const TenMakerAction = {
  SetFraction: "setFraction",
  Cancel: "cancel",
  Pair: "pair",
  TopUp: "topUp",
  StartAgain: "startAgain",
} as const;

export const TenMakerDerived = {
  Lowest: "lowest",
  Twos: "twos",
  Fives: "fives",
  Others: "others",
  CanEnd: "canEnd",
  Places: "places",
  Multiplier: "multiplier",
  Decimal: "decimal",
} as const;

export const TenMakerSignal = {
  Cancelled: "cancelled",
  Paired: "paired",
  ToppedUp: "toppedUp",
  CantTopUp: "cantTopUp",
} as const;

const tenMakerState = z
  .object({
    numerator: z.number().int().min(0).max(MAX_TERM),
    denominator: z.number().int().min(1).max(MAX_TERM),
    stage: z.nativeEnum(TenStage),
    /** Whether the learner can type p and q. */
    isEditable: z.boolean(),
    /** The buttons' words, from the lesson. `topUpLabel` has {p}: the prime added ("Add 5s"). */
    cancelLabel: localizedSchema,
    pairLabel: localizedSchema,
    topUpLabel: localizedSchema,
  })
  .strict();
export type TenMakerState = z.infer<typeof tenMakerState>;

const lowestOf = (s: { numerator: number; denominator: number }) => {
  const g = gcd(s.numerator, s.denominator) || 1;
  return { numerator: s.numerator / g, denominator: s.denominator / g };
};

/** Everything in a bag that is not a 2 or a 5. */
const othersOf = (bag: Bag): Bag =>
  Object.fromEntries(
    primesIn(bag)
      .filter((p) => p !== 2 && p !== 5)
      .map((p) => [p, bag[p] ?? 0]),
  );

/** The lowest-terms denominator's 2s, 5s and other primes, and how to make it a power of 10. */
export function tensOf(numerator: number, denominator: number) {
  const low = lowestOf({ numerator, denominator });
  const bag = bagOf(low.denominator);
  const twos = bag[2] ?? 0;
  const fives = bag[5] ?? 0;
  const others = othersOf(bag);
  const places = Math.max(twos, fives);
  return {
    low,
    twos,
    fives,
    others,
    canEnd: primesIn(others).length === 0,
    places,
    /** The prime the top-up adds (the shorter of the 2s and 5s), or null when they're level. */
    missing: twos < fives ? 2 : fives < twos ? 5 : null,
    multiplier: 2 ** (places - twos) * 5 ** (places - fives),
  };
}

/** The fraction in lowest terms as a terminating decimal, or null if it doesn't terminate. */
export function terminatingDecimal(numerator: number, denominator: number): string | null {
  const { low, canEnd, places } = tensOf(numerator, denominator);
  if (!canEnd) return null;
  const scaled = (BigInt(low.numerator) * 10n ** BigInt(places)) / BigInt(low.denominator);
  const digits = scaled.toString().padStart(places + 1, "0");
  if (places === 0) return digits;
  return `${digits.slice(0, -places)}.${digits.slice(-places)}`;
}

/** A number as its primes: "2³ × 5", "1" for 1. */
export function primesText(n: number): string {
  const bag = bagOf(n);
  const parts = primesIn(bag).map((p) =>
    (bag[p] ?? 0) === 1 ? `${p}` : `${p}${sup(bag[p] ?? 0)}`,
  );
  return parts.length === 0 ? String(n) : parts.join(" × ");
}

/** The working, one line per step taken: "7/40", "= 7/(2³ × 5)", "= (7 × 5²)/(2³ × 5³)", … */
export function workingOf(s: TenMakerState): string[] {
  const t = tensOf(s.numerator, s.denominator);
  const { low } = t;
  const lines = [`${s.numerator}/${s.denominator}`];
  if (s.stage === TenStage.Given) return lines;
  lines.push(
    low.numerator !== s.numerator ? `= ${low.numerator}/${low.denominator}` : "nothing to cancel",
  );
  if (s.stage === TenStage.Cancelled) return lines;
  const q = primesText(low.denominator);
  if (q !== String(low.denominator))
    lines.push(`= ${low.numerator}/${q.includes("×") ? `(${q})` : q}`);
  if (s.stage !== TenStage.ToppedUp || !t.canEnd) return lines;
  if (t.missing !== null) {
    const add = t.places - (t.missing === 2 ? t.twos : t.fives);
    const extra = add === 1 ? `${t.missing}` : `${t.missing}${sup(add)}`;
    lines.push(`= (${low.numerator} × ${extra})/(${primesText(low.denominator * t.multiplier)})`);
  }
  lines.push(`= ${low.numerator * t.multiplier}/${10 ** t.places}`);
  lines.push(`= ${terminatingDecimal(s.numerator, s.denominator)}`);
  return lines;
}

const act = actionsFor<TenMakerState>();
const none = z.object({}).strict();

/**
 * A fraction drawn as primes: the numerator's beads above the bar, the denominator's below, one
 * column per prime. Cancel crosses out the beads the two share; Pair links each 2 below with a 5
 * into a ten; Add puts the missing partners in, above and below alike, until the denominator is all
 * tens: a power of 10. A prime other than 2 or 5 below has no partner, so the decimal never ends.
 */
export const tenMaker = defineProp({
  type: "tenMaker",
  describe:
    "A fraction p/q as prime beads, the numerator's above the bar and the denominator's below. Cancel crosses out the primes they share (lowest terms). Pair links each 2 in the denominator with a 5: a ten. Add puts in the missing 2s or 5s, top and bottom alike, so every bead below is in a ten and the denominator is 10ⁿ (3/8 = 375/1000 = 0.375). A 3, 7 or any other prime below has no partner, so the decimal never terminates.",
  state: tenMakerState,
  defaults: {
    numerator: 3,
    denominator: 8,
    stage: TenStage.Given,
    isEditable: false,
    cancelLabel: { en: "Cancel", hi: "काटो" },
    pairLabel: { en: "Pair into tens", hi: "दहाई में जोड़ो" },
    topUpLabel: { en: "Add {p}s", hi: "{p} जोड़ो" },
  },
  derived: {
    [TenMakerDerived.Lowest]: {
      describe: "p/q in lowest terms: { numerator, denominator }",
      compute: lowestOf,
    },
    [TenMakerDerived.Twos]: {
      describe: "2s in the lowest-terms denominator",
      compute: (s) => tensOf(s.numerator, s.denominator).twos,
    },
    [TenMakerDerived.Fives]: {
      describe: "5s in the lowest-terms denominator",
      compute: (s) => tensOf(s.numerator, s.denominator).fives,
    },
    [TenMakerDerived.Others]: {
      describe: "Primes other than 2 and 5 in the lowest-terms denominator (no partner for a ten)",
      compute: (s) => tensOf(s.numerator, s.denominator).others,
    },
    [TenMakerDerived.CanEnd]: {
      describe: "The decimal terminates: the lowest-terms denominator has only 2s and 5s",
      compute: (s) => tensOf(s.numerator, s.denominator).canEnd,
    },
    [TenMakerDerived.Places]: {
      describe: "Decimal places when it terminates: the larger of the 2s and 5s",
      compute: (s) => tensOf(s.numerator, s.denominator).places,
    },
    [TenMakerDerived.Multiplier]: {
      describe: "What top and bottom are multiplied by to make the denominator a power of 10",
      compute: (s) => tensOf(s.numerator, s.denominator).multiplier,
    },
    [TenMakerDerived.Decimal]: {
      describe: "The terminating decimal, or null if it doesn't terminate",
      compute: (s) => terminatingDecimal(s.numerator, s.denominator),
    },
  },
  actions: {
    [TenMakerAction.SetFraction]: act({
      describe: "A new fraction, as given",
      changes: ["numerator", "denominator", "stage"],
      byLearner: true,
      args: z
        .object({
          numerator: z.number().int().min(0).max(MAX_TERM),
          denominator: z.number().int().min(1).max(MAX_TERM),
        })
        .strict(),
      run: (_s, a) =>
        set({ numerator: a.numerator, denominator: a.denominator, stage: TenStage.Given }),
    }),
    [TenMakerAction.Cancel]: act({
      describe: "Cross out the primes top and bottom share: lowest terms (the learner's button)",
      changes: ["stage"],
      byLearner: true,
      args: none,
      run: (s) =>
        s.stage !== TenStage.Given
          ? set({})
          : set(
              { stage: TenStage.Cancelled },
              { signal: TenMakerSignal.Cancelled, payload: lowestOf(s) },
            ),
    }),
    [TenMakerAction.Pair]: act({
      describe:
        "Link each 2 in the denominator with a 5 into a ten (the learner's button). If every bead is then in a ten, the denominator is already 10ⁿ; a prime other than 2 or 5 can't pair.",
      changes: ["stage"],
      byLearner: true,
      args: none,
      run: (s) => {
        if (s.stage !== TenStage.Cancelled) return set({});
        const t = tensOf(s.numerator, s.denominator);
        const emits: Emit[] = [
          {
            signal: TenMakerSignal.Paired,
            payload: { tens: Math.min(t.twos, t.fives), others: primesIn(t.others) },
          },
        ];
        if (!t.canEnd)
          emits.push({ signal: TenMakerSignal.CantTopUp, payload: { others: primesIn(t.others) } });
        if (t.canEnd && t.missing === null) {
          emits.push({
            signal: TenMakerSignal.ToppedUp,
            payload: { decimal: terminatingDecimal(s.numerator, s.denominator) },
          });
          return set({ stage: TenStage.ToppedUp }, ...emits);
        }
        return set({ stage: TenStage.Paired }, ...emits);
      },
    }),
    [TenMakerAction.TopUp]: act({
      describe:
        "Add the missing 2s or 5s, top and bottom alike, so every bead below is in a ten (the learner's button)",
      changes: ["stage"],
      byLearner: true,
      reveals: true,
      args: none,
      run: (s) => {
        const t = tensOf(s.numerator, s.denominator);
        if (s.stage !== TenStage.Paired || !t.canEnd) return set({});
        return set(
          { stage: TenStage.ToppedUp },
          {
            signal: TenMakerSignal.ToppedUp,
            payload: { decimal: terminatingDecimal(s.numerator, s.denominator) },
          },
        );
      },
    }),
    [TenMakerAction.StartAgain]: act({
      describe: "Back to the fraction as given",
      changes: ["stage"],
      byLearner: true,
      args: none,
      run: () => set({ stage: TenStage.Given }),
    }),
  },
  signals: {
    [TenMakerSignal.Cancelled]: { describe: "Common primes crossed out: lowest terms" },
    [TenMakerSignal.Paired]: {
      describe: "The denominator's 2s and 5s linked into `tens`; `others` have no partner",
    },
    [TenMakerSignal.ToppedUp]: { describe: "The denominator is a power of 10: `decimal`" },
    [TenMakerSignal.CantTopUp]: {
      describe: "A prime other than 2 or 5 is in the denominator: `others`, so it never terminates",
    },
  },
  observe: (s) => {
    const t = tensOf(s.numerator, s.denominator);
    const working = workingOf(s);
    const isPaired = s.stage === TenStage.Paired || s.stage === TenStage.ToppedUp;
    const isTopped = s.stage === TenStage.ToppedUp;
    const tens = isTopped ? t.places : Math.min(t.twos, t.fives);
    const others = primesIn(t.others).flatMap((p) =>
      Array.from({ length: t.others[p] ?? 0 }, () => p),
    );
    const leftover =
      t.twos > t.fives
        ? `${t.twos - t.fives} 2s`
        : t.fives > t.twos
          ? `${t.fives - t.twos} 5s`
          : "";
    const below = !isPaired
      ? `the denominator's primes: ${primesText(s.stage === TenStage.Given ? s.denominator : t.low.denominator)}`
      : `${tens} tens${!isTopped && leftover !== "" ? `; ${leftover} without a partner` : ""}${others.length > 0 ? `; no partner possible: ${others.join(", ")}` : ""}`;
    const next =
      s.stage === TenStage.Given
        ? button("cancel")
        : s.stage === TenStage.Cancelled
          ? button("pair")
          : s.stage === TenStage.Paired
            ? button("topUp", t.canEnd)
            : null;
    return {
      summary: `the fraction ${working.join(" ")} as prime beads, numerator above the bar and denominator below`,
      elements: [
        ...(s.isEditable
          ? [
              { id: "p", value: s.numerator },
              { id: "q", value: s.denominator },
            ]
          : []),
        { id: "beads", value: below },
        { id: "working", value: working },
        ...(next === null ? [] : [next]),
        button("startAgain", s.stage !== TenStage.Given),
      ],
      ...(isTopped
        ? {}
        : {
            hidden: {
              decimal: terminatingDecimal(s.numerator, s.denominator) ?? "does not terminate",
            },
          }),
    };
  },
});

import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  clean,
  differences,
  firstBreak,
  generalText,
  isAP,
  numText,
  signedText,
  termsOf,
  withUnit,
} from "./ap";

/**
 * A list of numbers drawn as bars, one per term (a₁, a₂, …). Either built from a first term a and
 * a common difference d (the learner can change both), or a given list to test. The learner reveals
 * the differences one at a time, the next term minus this one: if every difference is the same,
 * the list is an arithmetic progression; one that differs and it isn't.
 */

export const SequenceAction = {
  SetValues: "setValues",
  SetA: "setA",
  SetD: "setD",
  NudgeA: "nudgeA",
  NudgeD: "nudgeD",
  Reveal: "reveal",
  RevealAll: "revealAll",
  Hide: "hide",
} as const;
export const SequenceSignal = {
  Changed: "changed",
  Revealed: "revealed",
  Decided: "decided",
} as const;
export const SequenceDerived = {
  Terms: "terms",
  Differences: "differences",
  IsAP: "isAP",
  CommonDifference: "commonDifference",
  NextTerms: "nextTerms",
  Verdict: "verdict",
} as const;
export const SequencePart = {
  Bars: "bars",
  Differences: "differences",
  General: "general",
  Next: "next",
  StepA: "stepA",
  StepD: "stepD",
  Reveal: "reveal",
  Verdict: "verdict",
} as const;

/** What the revealed differences say so far. */
export const Verdict = { Unknown: "unknown", IsAP: "isAP", NotAP: "notAP" } as const;
export type Verdict = (typeof Verdict)[keyof typeof Verdict];

const MAX_TERMS = 12;

const sequenceState = z
  .object({
    /** A given list to test, or null: the list is built from a and d. */
    values: z.array(z.number()).min(2).max(MAX_TERMS).nullable(),
    /** How each given value is written, as TeX (fractions, √): same length as values, or null. */
    labels: z.array(z.string().max(40)).max(MAX_TERMS).nullable(),
    /** The first term, when built from a and d. */
    a: z.number().min(-100000).max(100000),
    /** The common difference, when built from a and d. */
    d: z.number().min(-100000).max(100000),
    /** How many terms are drawn, when built from a and d. */
    count: z.number().int().min(2).max(MAX_TERMS),
    /** How far one tap moves a and d. */
    aStep: z.number().positive(),
    dStep: z.number().positive(),
    canSetA: z.boolean(),
    canSetD: z.boolean(),
    /** How many differences are shown so far (the first `shown` of them). */
    shown: z
      .number()
      .int()
      .min(0)
      .max(MAX_TERMS - 1),
    canReveal: z.boolean(),
    /** Write a, a + d, a + 2d, … under the bars. */
    showGeneral: z.boolean(),
    /** Faded next terms after the list (only once it is known to be an AP). */
    showNext: z.number().int().min(0).max(3),
    /** Dots after the last term: the list goes on (an infinite AP). */
    isEndless: z.boolean(),
    /** The unit of every term ("₹", "cm", or ""). */
    unit: z.string().max(4),
  })
  .strict();
export type SequenceState = z.infer<typeof sequenceState>;

/** The terms on show. */
export function valuesOf(s: Pick<SequenceState, "values" | "a" | "d" | "count">): number[] {
  return s.values === null ? termsOf(s.a, s.d, s.count) : s.values.map(clean);
}

/** What the differences revealed so far say. */
export function verdictOf(s: SequenceState): Verdict {
  const values = valuesOf(s);
  const brk = firstBreak(values);
  if (brk !== null && brk < s.shown) return Verdict.NotAP;
  if (s.shown >= values.length - 1) return Verdict.IsAP;
  return Verdict.Unknown;
}

/** The common difference, or null if the list isn't an AP. */
export function commonDifference(s: SequenceState): number | null {
  const values = valuesOf(s);
  return isAP(values) ? (differences(values)[0] ?? 0) : null;
}

/** The next three terms, if the list is an AP. */
export function nextTerms(s: SequenceState): number[] {
  const values = valuesOf(s);
  const d = commonDifference(s);
  const last = values[values.length - 1] as number;
  return d === null ? [] : [1, 2, 3].map((k) => clean(last + k * d));
}

function changed(s: SequenceState): Emit {
  return { signal: SequenceSignal.Changed, payload: { values: valuesOf(s) } };
}

/** The signals after revealing up to `shown` differences. */
function revealed(before: SequenceState, after: SequenceState): Emit[] {
  const values = valuesOf(after);
  const diffs = differences(values);
  const out: Emit[] = [];
  for (let i = before.shown; i < after.shown; i++) {
    out.push({
      signal: SequenceSignal.Revealed,
      payload: {
        index: i,
        difference: diffs[i],
        isSame: Math.abs((diffs[i] as number) - (diffs[0] as number)) < 1e-9,
      },
    });
  }
  const was = verdictOf(before);
  const now = verdictOf(after);
  if (was === Verdict.Unknown && now !== Verdict.Unknown) {
    out.push({
      signal: SequenceSignal.Decided,
      payload: { isAP: now === Verdict.IsAP, d: commonDifference(after) },
    });
  }
  return out;
}

const act = actionsFor<SequenceState>();

export const apSequence = defineProp({
  type: "apSequence",
  describe:
    "A list of numbers drawn as bars, one per term (a₁, a₂, a₃, …), going up or down from a zero line. Either built from a first term a and a common difference d (each can be changed), or a given list to test. The learner reveals the differences one at a time, each term subtracted from the next one: when every difference is the same the list is an arithmetic progression with that common difference; one different difference (shown in red) and it is not. It can write the general form a, a + d, a + 2d, … under the bars and show the next terms faded.",
  state: sequenceState,
  defaults: {
    values: null,
    labels: null,
    a: 6,
    d: 3,
    count: 5,
    aStep: 1,
    dStep: 1,
    canSetA: false,
    canSetD: false,
    shown: 0,
    canReveal: true,
    showGeneral: false,
    showNext: 0,
    isEndless: true,
    unit: "",
  },
  inputs: ["canSetA", "canSetD", "canReveal", "showGeneral", "showNext"],
  invariant: (s) =>
    s.labels !== null && s.values !== null && s.labels.length !== s.values.length
      ? "labels must match values, one each"
      : s.shown > valuesOf(s).length - 1
        ? "more differences shown than there are"
        : undefined,
  derived: {
    [SequenceDerived.Terms]: { describe: "The terms on show, first to last", compute: valuesOf },
    [SequenceDerived.Differences]: {
      describe: "Each term minus the one before it (a₂ − a₁, a₃ − a₂, …), all of them",
      compute: (s) => differences(valuesOf(s)),
    },
    [SequenceDerived.IsAP]: {
      describe: "Whether the list is an arithmetic progression (every difference the same)",
      compute: (s) => isAP(valuesOf(s)),
    },
    [SequenceDerived.CommonDifference]: {
      describe: "The common difference d, or null if the list is not an AP",
      compute: commonDifference,
    },
    [SequenceDerived.NextTerms]: {
      describe: "The next three terms, if the list is an AP (else empty)",
      compute: nextTerms,
    },
    [SequenceDerived.Verdict]: {
      describe:
        "What the differences revealed so far show: unknown (not all revealed, none different yet), isAP (all revealed and equal) or notAP (one revealed is different)",
      compute: verdictOf,
    },
  },
  actions: {
    [SequenceAction.SetValues]: act({
      describe:
        "Put a given list to test (and how to write each value, or null), hiding the differences",
      args: z
        .object({
          values: z.array(z.number()).min(2).max(MAX_TERMS),
          labels: z.array(z.string().max(40)).max(MAX_TERMS).nullable(),
        })
        .strict(),
      run: (s, a) => {
        const next = { ...s, values: a.values, labels: a.labels, shown: 0 };
        return set({ values: a.values, labels: a.labels, shown: 0 }, changed(next));
      },
    }),
    [SequenceAction.SetA]: act({
      describe: "Set the first term a (the list is built from a and d)",
      args: z.object({ a: z.number() }).strict(),
      run: (s, a) => {
        const next = { ...s, values: null, labels: null, a: clean(a.a) };
        return set({ values: null, labels: null, a: next.a }, changed(next));
      },
    }),
    [SequenceAction.SetD]: act({
      describe: "Set the common difference d (the list is built from a and d)",
      args: z.object({ d: z.number() }).strict(),
      run: (s, a) => {
        const next = { ...s, values: null, labels: null, d: clean(a.d) };
        return set({ values: null, labels: null, d: next.d }, changed(next));
      },
    }),
    [SequenceAction.NudgeA]: act({
      describe: "Make the first term a one step bigger (by: 1) or smaller (by: −1)",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canSetA || s.values !== null) return set({});
        const next = { ...s, a: clean(s.a + a.by * s.aStep) };
        return set({ a: next.a }, changed(next));
      },
    }),
    [SequenceAction.NudgeD]: act({
      describe: "Make the common difference d one step bigger (by: 1) or smaller (by: −1)",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canSetD || s.values !== null) return set({});
        const next = { ...s, d: clean(s.d + a.by * s.dStep) };
        return set({ d: next.d }, changed(next));
      },
    }),
    [SequenceAction.Reveal]: act({
      describe: "Show the next difference (the next term minus this one)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const total = valuesOf(s).length - 1;
        if (!s.canReveal || s.shown >= total || verdictOf(s) === Verdict.NotAP) return set({});
        const next = { ...s, shown: s.shown + 1 };
        return set({ shown: next.shown }, ...revealed(s, next));
      },
    }),
    [SequenceAction.RevealAll]: act({
      describe: "Show every difference at once",
      args: z.object({}).strict(),
      run: (s) => {
        const next = { ...s, shown: valuesOf(s).length - 1 };
        return set({ shown: next.shown }, ...revealed(s, next));
      },
    }),
    [SequenceAction.Hide]: act({
      describe: "Hide the differences again",
      args: z.object({}).strict(),
      run: () => set({ shown: 0 }),
    }),
  },
  signals: {
    [SequenceSignal.Changed]: { describe: "The list changed; the payload has the values" },
    [SequenceSignal.Revealed]: {
      describe:
        "A difference was revealed; the payload has its index (0 = a₂ − a₁), the difference and whether it matches the first one",
    },
    [SequenceSignal.Decided]: {
      describe:
        "The revealed differences now settle it; the payload says whether the list is an AP and its common difference (null if not)",
    },
  },
  observe: (s) => {
    const values = valuesOf(s);
    const diffs = differences(values);
    const verdict = verdictOf(s);
    const shownText =
      s.shown === 0
        ? "no differences shown yet"
        : `differences shown: ${diffs.slice(0, s.shown).map(signedText).join(", ")}`;
    const listText = values.map((v) => withUnit(v, s.unit)).join(", ") + (s.isEndless ? ", …" : "");
    const elements: Element[] = [
      { id: SequencePart.Bars, value: listText },
      { id: SequencePart.Differences, value: shownText },
    ];
    if (s.showGeneral)
      elements.push({
        id: SequencePart.General,
        value: values.map((_, i) => generalText(i + 1)).join(", "),
      });
    const next = nextTerms(s).slice(0, s.showNext);
    if (next.length > 0 && verdict === Verdict.IsAP)
      elements.push({ id: SequencePart.Next, value: `next: ${next.map(numText).join(", ")}` });
    if (s.canSetA && s.values === null)
      elements.push({ id: SequencePart.StepA, value: `a = ${numText(s.a)}` });
    if (s.canSetD && s.values === null)
      elements.push({ id: SequencePart.StepD, value: `d = ${numText(s.d)}` });
    if (verdict !== Verdict.Unknown)
      elements.push({
        id: SequencePart.Verdict,
        value:
          verdict === Verdict.IsAP
            ? `every difference is ${signedText(diffs[0] ?? 0)}: an AP with d = ${numText(diffs[0] ?? 0)}`
            : "a difference is not the same: not an AP",
      });
    const built = s.values === null ? ` (a = ${numText(s.a)}, d = ${numText(s.d)})` : "";
    return {
      summary: `The list ${listText}${built}; ${shownText}.`,
      elements,
      hidden: {
        isAP: isAP(values),
        differences: diffs,
      },
    };
  },
  parts: (s) => [
    SequencePart.Bars,
    ...(s.shown > 0 ? [SequencePart.Differences] : []),
    ...(s.showGeneral ? [SequencePart.General] : []),
    ...(s.showNext > 0 && verdictOf(s) === Verdict.IsAP ? [SequencePart.Next] : []),
    ...(s.canSetA && s.values === null ? [SequencePart.StepA] : []),
    ...(s.canSetD && s.values === null ? [SequencePart.StepD] : []),
    ...(s.canReveal ? [SequencePart.Reveal] : []),
    ...(verdictOf(s) !== Verdict.Unknown ? [SequencePart.Verdict] : []),
  ],
});

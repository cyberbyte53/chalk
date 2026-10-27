import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean, numText } from "./numbers";
import {
  classText,
  cumulative,
  cumulativeMore,
  medianIndex,
  medianOf,
  medianParts,
  medianWorking,
  ncert,
  rowAt,
  rowSchema,
  totalOf,
} from "./stats";

/**
 * The median of grouped data (NCERT 14.4) worked in a cumulative-frequency table: the classes
 * and frequencies; the cumulative frequency column (less-than, or more-than for reading); n/2 and
 * the median class (the first whose cf passes n/2); the pieces l, cf, f, h; then the formula. When
 * the data comes as cumulative frequencies (Example 7), the second step works the frequencies out
 * by subtraction instead.
 */

export const MedianAction = { Next: "next", Back: "back", Reset: "reset", Pick: "pick" } as const;
export const MedianSignal = { Stepped: "stepped", Picked: "picked", Done: "done" } as const;
export const MedianDerived = {
  Cumulative: "cumulative",
  N: "n",
  Half: "half",
  MedianIndex: "medianIndex",
  Median: "median",
  Parts: "parts",
  Working: "working",
} as const;
export const MedianPart = {
  Table: "table",
  Half: "half",
  Working: "working",
  Result: "result",
  Next: "next",
  Back: "back",
} as const;

export const Given = { Frequencies: "frequencies", Cumulative: "cumulative" } as const;
export type Given = (typeof Given)[keyof typeof Given];
export const CfKind = { LessThan: "lessThan", MoreThan: "moreThan" } as const;
export type CfKind = (typeof CfKind)[keyof typeof CfKind];

/** 0 the table; 1 the other column; 2 n/2 and the median class; 3 l, cf, f, h; 4 the median. */
export const MEDIAN_STEPS = 4;

const wordsSchema = z.object({ en: z.string().max(40), hi: z.string().max(40) }).strict();

const medianState = z
  .object({
    rows: z.array(rowSchema).min(2).max(14),
    given: z.nativeEnum(Given),
    /** Less-than cf (used for the median) or more-than (for reading only: no median steps). */
    cfKind: z.nativeEnum(CfKind),
    step: z.number().int().min(0).max(MEDIAN_STEPS),
    picked: z.number().int().min(0).nullable(),
    classHeading: wordsSchema,
    freqHeading: wordsSchema,
    canStep: z.boolean(),
    /** At step 1, the learner taps the row they think is the median class. */
    canPick: z.boolean(),
  })
  .strict();
export type MedianState = z.infer<typeof medianState>;

/** A more-than table is read, not used for the median: it stops after its column. */
export const lastMedianStep = (s: Pick<MedianState, "cfKind">) =>
  s.cfKind === CfKind.MoreThan ? 1 : MEDIAN_STEPS;

export const cfOf = (s: Pick<MedianState, "rows" | "cfKind">) =>
  s.cfKind === CfKind.MoreThan ? cumulativeMore(s.rows) : cumulative(s.rows);

const act = actionsFor<MedianState>();

export const medianTable = defineProp({
  type: "medianTable",
  describe:
    "The median of grouped data (NCERT 14.4) in a cumulative-frequency table. Steps: the classes and frequencies; the cumulative frequency (cf) column, each the total so far (less-than type; a more-than table counts from the top instead and is only read); n/2 and the median class, the first class whose cf is more than n/2; the pieces l (its lower limit), cf (the cf of the class before), f (its frequency) and h (its width); then Median = l + ((n/2 − cf)/f) × h. If the data is given as cumulative frequencies (less than 140, less than 145, …), the second step finds each class's frequency by subtracting. The learner can be asked to tap the median class.",
  state: medianState,
  defaults: {
    rows: [
      { lo: 0, hi: 10, f: 5, label: null },
      { lo: 10, hi: 20, f: 3, label: null },
      { lo: 20, hi: 30, f: 4, label: null },
      { lo: 30, hi: 40, f: 3, label: null },
      { lo: 40, hi: 50, f: 3, label: null },
      { lo: 50, hi: 60, f: 4, label: null },
      { lo: 60, hi: 70, f: 7, label: null },
      { lo: 70, hi: 80, f: 9, label: null },
      { lo: 80, hi: 90, f: 7, label: null },
      { lo: 90, hi: 100, f: 8, label: null },
    ],
    given: Given.Frequencies,
    cfKind: CfKind.LessThan,
    step: 0,
    picked: null,
    classHeading: { en: "Marks", hi: "अंक" },
    freqHeading: { en: "Students", hi: "विद्यार्थी" },
    canStep: true,
    canPick: false,
  },
  inputs: ["canStep", "canPick"],
  invariant: (s) => {
    if (s.step > lastMedianStep(s)) return "a more-than table has no median steps";
    if (s.picked !== null && s.picked >= s.rows.length) return "picked is not a class";
    if (totalOf(s.rows) === 0) return "the frequencies add up to 0";
    return undefined;
  },
  derived: {
    [MedianDerived.Cumulative]: { describe: "The cf column", compute: cfOf },
    [MedianDerived.N]: {
      describe: "n, the number of observations",
      compute: (s) => totalOf(s.rows),
    },
    [MedianDerived.Half]: { describe: "n/2", compute: (s) => clean(totalOf(s.rows) / 2) },
    [MedianDerived.MedianIndex]: {
      describe: "The median class (0-based)",
      compute: (s) => medianIndex(s.rows),
    },
    [MedianDerived.Median]: {
      describe: "The median, rounded to 2 decimals",
      compute: (s) => ncert(medianOf(s.rows)),
    },
    [MedianDerived.Parts]: { describe: "l, n, cf, f, h", compute: (s) => medianParts(s.rows) },
    [MedianDerived.Working]: {
      describe: "The formula lines as TeX",
      compute: (s) => medianWorking(s.rows),
    },
  },
  actions: {
    [MedianAction.Next]: act({
      describe: "Show the next step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.step >= lastMedianStep(s)) return set({});
        // With canPick, the learner names the median class instead of being shown it.
        if (s.canPick && s.step === 1 && s.picked !== medianIndex(s.rows)) return set({});
        const step = s.step + 1;
        const out: Emit[] = [{ signal: MedianSignal.Stepped, payload: { step } }];
        if (step === MEDIAN_STEPS)
          out.push({ signal: MedianSignal.Done, payload: { median: ncert(medianOf(s.rows)) } });
        return set({ step }, ...out);
      },
    }),
    [MedianAction.Back]: act({
      describe: "Go back one step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.canStep || s.step === 0
          ? set({})
          : set(
              { step: s.step - 1 },
              { signal: MedianSignal.Stepped, payload: { step: s.step - 1 } },
            ),
    }),
    [MedianAction.Reset]: act({
      describe: "Back to the bare table",
      args: z.object({}).strict(),
      run: () => set({ step: 0, picked: null }),
    }),
    [MedianAction.Pick]: act({
      describe: "Tap a row as the median class (once the cf column is shown); right moves on",
      byLearner: true,
      args: z.object({ index: z.number().int().min(0) }).strict(),
      run: (s, a) => {
        if (!s.canPick || s.step < 1 || a.index >= s.rows.length) return set({});
        const isRight = a.index === medianIndex(s.rows);
        return set(
          { picked: a.index, step: isRight ? Math.max(2, s.step) : s.step },
          { signal: MedianSignal.Picked, payload: { index: a.index, isRight } },
        );
      },
    }),
  },
  signals: {
    [MedianSignal.Stepped]: { describe: "A step was shown; the payload has the step" },
    [MedianSignal.Picked]: {
      describe:
        "The learner tapped a row; the payload has its index and whether it is the median class",
    },
    [MedianSignal.Done]: { describe: "The median is worked out; the payload has the median" },
  },
  observe: (s) => {
    const cf = cfOf(s);
    const i = medianIndex(s.rows);
    const p = medianParts(s.rows);
    const showF = s.given === Given.Frequencies || s.step >= 1;
    const showCf = s.given === Given.Cumulative || s.step >= 1;
    const elements: Element[] = [
      {
        id: MedianPart.Table,
        value: s.rows
          .map(
            (r, k) =>
              `${classText(r)}${showF ? `: f = ${r.f}` : ""}${showCf ? `, cf = ${cf[k]}` : ""}${
                s.step >= 2 && k === i ? " (median class)" : ""
              }`,
          )
          .join("; "),
      },
    ];
    if (s.step >= 2)
      elements.push({ id: MedianPart.Half, value: `n = ${p.n}, n/2 = ${numText(p.n / 2)}` });
    if (s.step >= 3)
      elements.push({
        id: MedianPart.Working,
        value: `l = ${numText(p.l)}, cf = ${p.cf}, f = ${p.f}, h = ${numText(p.h)}${
          s.step === MEDIAN_STEPS ? `; ${medianWorking(s.rows).join(" ")}` : ""
        }`,
      });
    if (s.step === MEDIAN_STEPS)
      elements.push({ id: MedianPart.Result, value: `median = ${numText(medianOf(s.rows))}` });
    return {
      summary: `A cumulative-frequency table of ${p.n} observations for the median (step ${s.step} of ${lastMedianStep(s)}).`,
      elements,
      hidden: { medianClass: classText(rowAt(s.rows, i)), median: ncert(medianOf(s.rows)) },
    };
  },
  parts: (s) => [
    MedianPart.Table,
    ...(s.step >= 2 ? [MedianPart.Half] : []),
    ...(s.step >= 3 ? [MedianPart.Working] : []),
    ...(s.step === MEDIAN_STEPS ? [MedianPart.Result] : []),
    ...(s.canStep && s.step < lastMedianStep(s) ? [MedianPart.Next] : []),
    ...(s.canStep && s.step > 0 ? [MedianPart.Back] : []),
  ],
});

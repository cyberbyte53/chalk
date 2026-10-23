import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean, isWhole, numText } from "./numbers";
import {
  Method,
  type Row,
  classMark,
  classSize,
  classText,
  meanColumns,
  meanOf,
  meanWorking,
  middleMark,
  ncert,
  rowSchema,
} from "./stats";

/**
 * The mean of a frequency table, worked column by column the NCERT way (Tables 14.1–14.8): the
 * classes and frequencies, then the class marks xᵢ, then the products fᵢxᵢ (direct method), or the
 * deviations dᵢ = xᵢ − a and fᵢdᵢ (assumed-mean method), or uᵢ = (xᵢ − a)/h and fᵢuᵢ (step-deviation
 * method), then the totals and the formula. All three methods give the same mean.
 */

export const MeanAction = {
  Next: "next",
  Back: "back",
  Reset: "reset",
  SetMethod: "setMethod",
  NudgeA: "nudgeA",
  ShowAll: "showAll",
} as const;
export const MeanSignal = { Stepped: "stepped", Done: "done", Changed: "changed" } as const;
export const MeanDerived = {
  Marks: "marks",
  Mean: "mean",
  SumF: "sumF",
  SumFX: "sumFX",
  SumFD: "sumFD",
  SumFU: "sumFU",
  Working: "working",
  StepCount: "stepCount",
} as const;
export const MeanPart = {
  Table: "table",
  Working: "working",
  Result: "result",
  Next: "next",
  Back: "back",
  Methods: "methods",
  StepA: "stepA",
} as const;
export { Method };

/** The columns each method reveals, one per step, after the classes and frequencies. */
export const Column = {
  X: "x",
  FX: "fx",
  D: "d",
  FD: "fd",
  U: "u",
  FU: "fu",
} as const;
export type Column = (typeof Column)[keyof typeof Column];

export const COLUMNS: Record<Method, readonly Column[]> = {
  [Method.Direct]: [Column.X, Column.FX],
  [Method.Assumed]: [Column.X, Column.D, Column.FD],
  [Method.Step]: [Column.X, Column.D, Column.U, Column.FU],
};

const wordsSchema = z.object({ en: z.string().max(40), hi: z.string().max(40) }).strict();

const meanState = z
  .object({
    rows: z.array(rowSchema).min(1).max(14),
    /** False: each row is a single value xᵢ = lo (NCERT Table 14.1). */
    isGrouped: z.boolean(),
    method: z.nativeEnum(Method),
    /** The assumed mean a (one of the class marks), or null for the middle one. */
    a: z.number().nullable(),
    /** The step h, or null for the class size. */
    h: z.number().positive().nullable(),
    /** How many working steps are shown: 0 the table, then one column per step, then the mean. */
    step: z.number().int().min(0).max(5),
    /** The class column's heading and the frequency column's ("Marks", "Number of students"). */
    classHeading: wordsSchema,
    freqHeading: wordsSchema,
    canStep: z.boolean(),
    /** Buttons to switch method (the same data, three ways). */
    canSetMethod: z.boolean(),
    /** − / + to move the assumed mean to another class mark (Activity 1: the mean doesn't change). */
    canSetA: z.boolean(),
  })
  .strict();
export type MeanState = z.infer<typeof meanState>;

export const aOf = (s: Pick<MeanState, "rows" | "a" | "isGrouped">) =>
  s.a ?? middleMark(s.rows, s.isGrouped);
export const hOf = (s: Pick<MeanState, "rows" | "h" | "isGrouped">) =>
  s.h ?? (s.isGrouped ? classSize(s.rows) : 1);
/** The last step: every column of the method, then the mean. */
export const lastStepOf = (s: Pick<MeanState, "method">) => COLUMNS[s.method].length + 1;
export const meanOfState = (s: Pick<MeanState, "rows" | "isGrouped">) =>
  meanOf(s.rows, s.isGrouped);
export const workingOf = (s: MeanState) =>
  meanWorking(s.rows, s.method, aOf(s), hOf(s), s.isGrouped);
/** The columns shown at the current step. */
export const shownColumns = (s: MeanState): Column[] =>
  COLUMNS[s.method].slice(0, Math.min(s.step, COLUMNS[s.method].length));

const METHOD_WORDS = {
  [Method.Direct]: { en: "direct method", hi: "प्रत्यक्ष विधि" },
  [Method.Assumed]: { en: "assumed-mean method", hi: "कल्पित माध्य विधि" },
  [Method.Step]: { en: "step-deviation method", hi: "पग-विचलन विधि" },
};
export const methodWords = (m: Method) => METHOD_WORDS[m];

function changed(s: MeanState): Emit {
  return { signal: MeanSignal.Changed, payload: { method: s.method, a: aOf(s) } };
}

const act = actionsFor<MeanState>();

export const meanTable = defineProp({
  type: "meanTable",
  describe:
    "The mean of a frequency table (grouped or not), worked column by column as in NCERT Ch14: the classes and frequencies fᵢ; then the class marks xᵢ = (upper + lower)/2; then, by the direct method, fᵢxᵢ and x̄ = Σfᵢxᵢ/Σfᵢ; by the assumed-mean method, dᵢ = xᵢ − a, fᵢdᵢ and x̄ = a + Σfᵢdᵢ/Σfᵢ; by the step-deviation method, uᵢ = (xᵢ − a)/h, fᵢuᵢ and x̄ = a + h·Σfᵢuᵢ/Σfᵢ. The learner steps through the columns; the lesson may let them switch method or move the assumed mean a, and the mean stays the same.",
  state: meanState,
  defaults: {
    rows: [
      { lo: 10, hi: 25, f: 2, label: null },
      { lo: 25, hi: 40, f: 3, label: null },
      { lo: 40, hi: 55, f: 7, label: null },
      { lo: 55, hi: 70, f: 6, label: null },
      { lo: 70, hi: 85, f: 6, label: null },
      { lo: 85, hi: 100, f: 6, label: null },
    ],
    isGrouped: true,
    method: Method.Direct,
    a: null,
    h: null,
    step: 0,
    classHeading: { en: "Marks", hi: "अंक" },
    freqHeading: { en: "Students", hi: "विद्यार्थी" },
    canStep: true,
    canSetMethod: false,
    canSetA: false,
  },
  inputs: ["canStep", "canSetMethod", "canSetA"],
  invariant: (s) => {
    if (s.step > lastStepOf(s)) return "step is past the last step of this method";
    const marks = s.rows.map((r) => classMark(r, s.isGrouped));
    if (s.a !== null && !marks.some((x) => clean(x) === clean(s.a ?? 0)))
      return "the assumed mean a must be one of the class marks";
    if (s.rows.reduce((t, r) => t + r.f, 0) === 0) return "the frequencies add up to 0";
    return undefined;
  },
  derived: {
    [MeanDerived.Marks]: {
      describe: "The class marks xᵢ",
      compute: (s) => s.rows.map((r) => classMark(r, s.isGrouped)),
    },
    [MeanDerived.Mean]: {
      describe: "The mean x̄, rounded to 2 decimals (the same by every method)",
      compute: (s) => ncert(meanOfState(s)),
    },
    [MeanDerived.SumF]: {
      describe: "Σfᵢ",
      compute: (s) => meanColumns(s.rows, aOf(s), hOf(s), s.isGrouped).sumF,
    },
    [MeanDerived.SumFX]: {
      describe: "Σfᵢxᵢ",
      compute: (s) => meanColumns(s.rows, aOf(s), hOf(s), s.isGrouped).sumFX,
    },
    [MeanDerived.SumFD]: {
      describe: "Σfᵢdᵢ with dᵢ = xᵢ − a",
      compute: (s) => meanColumns(s.rows, aOf(s), hOf(s), s.isGrouped).sumFD,
    },
    [MeanDerived.SumFU]: {
      describe: "Σfᵢuᵢ with uᵢ = (xᵢ − a)/h",
      compute: (s) => meanColumns(s.rows, aOf(s), hOf(s), s.isGrouped).sumFU,
    },
    [MeanDerived.Working]: { describe: "The formula lines as TeX", compute: workingOf },
    [MeanDerived.StepCount]: {
      describe: "How many steps this method has",
      compute: lastStepOf,
    },
  },
  actions: {
    [MeanAction.Next]: act({
      describe: "Show the next column (or, at the end, the mean)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.step >= lastStepOf(s)) return set({});
        const step = s.step + 1;
        const out: Emit[] = [{ signal: MeanSignal.Stepped, payload: { step } }];
        if (step === lastStepOf(s))
          out.push({ signal: MeanSignal.Done, payload: { mean: ncert(meanOfState(s)) } });
        return set({ step }, ...out);
      },
    }),
    [MeanAction.Back]: act({
      describe: "Hide the last column shown",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.canStep || s.step === 0
          ? set({})
          : set(
              { step: s.step - 1 },
              { signal: MeanSignal.Stepped, payload: { step: s.step - 1 } },
            ),
    }),
    [MeanAction.Reset]: act({
      describe: "Back to the bare table",
      args: z.object({}).strict(),
      run: () => set({ step: 0 }),
    }),
    [MeanAction.ShowAll]: act({
      describe: "Show every column and the mean at once",
      args: z.object({}).strict(),
      run: (s) => set({ step: lastStepOf(s) }),
    }),
    [MeanAction.SetMethod]: act({
      describe:
        "Work the same table by another method (direct, assumed, step); the steps start again",
      byLearner: true,
      args: z.object({ method: z.nativeEnum(Method) }).strict(),
      run: (s, a) => {
        if (!s.canSetMethod || a.method === s.method) return set({});
        const next = { ...s, method: a.method, step: 0 };
        return set({ method: a.method, step: 0 }, changed(next));
      },
    }),
    [MeanAction.NudgeA]: act({
      describe:
        "Move the assumed mean a to the next class mark up (by: 1) or down (by: −1); the mean stays the same",
      byLearner: true,
      args: z.object({ by: z.union([z.literal(1), z.literal(-1)]) }).strict(),
      run: (s, a) => {
        if (!s.canSetA) return set({});
        const marks = s.rows.map((r) => classMark(r, s.isGrouped));
        const i = marks.findIndex((x) => clean(x) === clean(aOf(s)));
        const j = Math.max(0, Math.min(marks.length - 1, i + a.by));
        if (j === i) return set({});
        const next = { ...s, a: marks[j] ?? null };
        return set({ a: next.a }, changed(next));
      },
    }),
  },
  signals: {
    [MeanSignal.Stepped]: { describe: "A column was shown or hidden; the payload has the step" },
    [MeanSignal.Done]: { describe: "The mean is shown; the payload has the mean" },
    [MeanSignal.Changed]: { describe: "The method or the assumed mean changed" },
  },
  observe: (s) => {
    const c = meanColumns(s.rows, aOf(s), hOf(s), s.isGrouped);
    const shown = shownColumns(s);
    const rows = s.rows
      .map((r, i) => {
        const cells = [`${classText(r, "en", s.isGrouped)}: f = ${r.f}`];
        for (const col of shown) cells.push(`${col} = ${numText(c[col][i] ?? 0)}`);
        return cells.join(", ");
      })
      .join("; ");
    const elements: Element[] = [{ id: MeanPart.Table, value: rows }];
    if (s.step === lastStepOf(s)) {
      elements.push({ id: MeanPart.Working, value: workingOf(s).join(" ") });
      elements.push({ id: MeanPart.Result, value: `mean = ${numText(meanOfState(s))}` });
    }
    if (s.canSetA) elements.push({ id: MeanPart.StepA, value: `a = ${numText(aOf(s))}` });
    return {
      summary: `The mean of ${c.sumF} values by the ${METHOD_WORDS[s.method].en}${
        s.method === Method.Direct ? "" : `, assumed mean a = ${numText(aOf(s))}`
      }${s.method === Method.Step ? `, h = ${numText(hOf(s))}` : ""} (step ${s.step} of ${lastStepOf(s)}).`,
      elements,
      hidden: { mean: ncert(meanOfState(s)) },
    };
  },
  parts: (s) => [
    MeanPart.Table,
    ...(s.step === lastStepOf(s) ? [MeanPart.Working, MeanPart.Result] : []),
    ...(s.canStep && s.step < lastStepOf(s) ? [MeanPart.Next] : []),
    ...(s.canStep && s.step > 0 ? [MeanPart.Back] : []),
    ...(s.canSetMethod ? [MeanPart.Methods] : []),
    ...(s.canSetA ? [MeanPart.StepA] : []),
  ],
});

/** For a page that wants to say whether the mean is a whole number. */
export const isWholeMean = (s: MeanState) => isWhole(meanOfState(s));
export type { Row };

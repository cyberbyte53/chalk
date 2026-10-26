import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { clean, numText } from "./numbers";
import {
  classText,
  meanOf,
  modalIndex,
  modeOf,
  modeParts,
  modeWorking,
  ncert,
  rowAt,
  rowSchema,
} from "./stats";

/**
 * The mode of grouped data (NCERT 14.3) on a histogram: the bars, then the modal class (the
 * tallest bar), then the pieces of the formula marked on the picture (l at the modal class's left
 * edge, h its width, f₁ its height, f₀ and f₂ its neighbours'), then the formula and the mode as a
 * point inside the modal class. The learner can be asked to tap the modal class.
 */

export const ModeAction = {
  Next: "next",
  Back: "back",
  Reset: "reset",
  Pick: "pick",
} as const;
export const ModeSignal = { Stepped: "stepped", Picked: "picked", Done: "done" } as const;
export const ModeDerived = {
  ModalIndex: "modalIndex",
  Mode: "mode",
  Parts: "parts",
  Working: "working",
  Mean: "mean",
} as const;
export const ModePart = {
  Chart: "chart",
  Working: "working",
  Result: "result",
  Next: "next",
  Back: "back",
} as const;

/** 0 the histogram; 1 the modal class; 2 l, h, f₀, f₁, f₂ marked; 3 the formula and the mode. */
export const MODE_STEPS = 3;

const wordsSchema = z.object({ en: z.string().max(40), hi: z.string().max(40) }).strict();

const modeState = z
  .object({
    rows: z.array(rowSchema).min(2).max(12),
    step: z.number().int().min(0).max(MODE_STEPS),
    /** The class the learner tapped, or null. */
    picked: z.number().int().min(0).nullable(),
    classHeading: wordsSchema,
    freqHeading: wordsSchema,
    canStep: z.boolean(),
    /** The learner taps a bar to name the modal class (step 0 → 1 when right). */
    canPick: z.boolean(),
    /** A line at the mean, to compare mode and mean (Example 6). */
    showMean: z.boolean(),
  })
  .strict();
export type ModeState = z.infer<typeof modeState>;

const act = actionsFor<ModeState>();

export const modeChart = defineProp({
  type: "modeChart",
  describe:
    "The mode of grouped data on a histogram (NCERT 14.3). Steps: the histogram of the classes; the modal class (the tallest bar) picked out; the pieces of the formula marked on the bars (l, the modal class's lower limit; h, its width; f₁ its frequency; f₀ and f₂ the frequencies of the classes before and after); then Mode = l + (f₁ − f₀)/(2f₁ − f₀ − f₂) × h worked out and marked inside the modal class. The learner may be asked to tap the modal class first; a line at the mean can be shown to compare.",
  state: modeState,
  defaults: {
    rows: [
      { lo: 1, hi: 3, f: 7, label: null },
      { lo: 3, hi: 5, f: 8, label: null },
      { lo: 5, hi: 7, f: 2, label: null },
      { lo: 7, hi: 9, f: 2, label: null },
      { lo: 9, hi: 11, f: 1, label: null },
    ],
    step: 0,
    picked: null,
    classHeading: { en: "Family size", hi: "परिवार का आकार" },
    freqHeading: { en: "Families", hi: "परिवार" },
    canStep: true,
    canPick: false,
    showMean: false,
  },
  inputs: ["canStep", "canPick", "showMean"],
  invariant: (s) => {
    const h = clean((s.rows[0]?.hi ?? 0) - (s.rows[0]?.lo ?? 0));
    if (s.rows.some((r) => clean(r.hi - r.lo) !== h))
      return "the mode formula needs classes of equal size";
    if (s.rows.some((r, i) => i > 0 && clean(r.lo) !== clean(s.rows[i - 1]?.hi ?? 0)))
      return "the classes must follow on from each other";
    if (s.picked !== null && s.picked >= s.rows.length) return "picked is not a class";
    return undefined;
  },
  derived: {
    [ModeDerived.ModalIndex]: {
      describe: "Which class is the modal class (0-based)",
      compute: (s) => modalIndex(s.rows),
    },
    [ModeDerived.Mode]: {
      describe: "The mode, rounded to 2 decimals",
      compute: (s) => ncert(modeOf(s.rows)),
    },
    [ModeDerived.Parts]: { describe: "l, h, f₁, f₀, f₂", compute: (s) => modeParts(s.rows) },
    [ModeDerived.Working]: {
      describe: "The formula lines as TeX",
      compute: (s) => modeWorking(s.rows),
    },
    [ModeDerived.Mean]: {
      describe: "The mean, for comparing",
      compute: (s) => ncert(meanOf(s.rows)),
    },
  },
  actions: {
    [ModeAction.Next]: act({
      describe: "Show the next step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.step >= MODE_STEPS) return set({});
        const step = s.step + 1;
        const out: Emit[] = [{ signal: ModeSignal.Stepped, payload: { step } }];
        if (step === MODE_STEPS)
          out.push({ signal: ModeSignal.Done, payload: { mode: ncert(modeOf(s.rows)) } });
        return set({ step }, ...out);
      },
    }),
    [ModeAction.Back]: act({
      describe: "Go back one step",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.canStep || s.step === 0
          ? set({})
          : set(
              { step: s.step - 1 },
              { signal: ModeSignal.Stepped, payload: { step: s.step - 1 } },
            ),
    }),
    [ModeAction.Reset]: act({
      describe: "Back to the bare histogram",
      args: z.object({}).strict(),
      run: () => set({ step: 0, picked: null }),
    }),
    [ModeAction.Pick]: act({
      describe: "Tap a bar as the modal class; if it's right, the modal class is shown",
      byLearner: true,
      args: z.object({ index: z.number().int().min(0) }).strict(),
      run: (s, a) => {
        if (!s.canPick || a.index >= s.rows.length) return set({});
        const isRight = a.index === modalIndex(s.rows);
        return set(
          { picked: a.index, step: isRight ? Math.max(1, s.step) : s.step },
          { signal: ModeSignal.Picked, payload: { index: a.index, isRight } },
        );
      },
    }),
  },
  signals: {
    [ModeSignal.Stepped]: { describe: "A step was shown; the payload has the step" },
    [ModeSignal.Picked]: {
      describe:
        "The learner tapped a bar; the payload has its index and whether it is the modal class",
    },
    [ModeSignal.Done]: { describe: "The mode is worked out; the payload has the mode" },
  },
  observe: (s) => {
    const m = modalIndex(s.rows);
    const p = modeParts(s.rows);
    const elements: Element[] = [
      {
        id: ModePart.Chart,
        value: [
          `bars: ${s.rows.map((r) => `${classText(r)} (${r.f})`).join(", ")}`,
          s.step >= 1 ? `modal class ${classText(rowAt(s.rows, m))} highlighted` : "",
          s.step >= 2
            ? `l = ${numText(p.l)}, h = ${numText(p.h)}, f₁ = ${p.f1}, f₀ = ${p.f0}, f₂ = ${p.f2}`
            : "",
          s.picked !== null ? `the learner tapped ${classText(rowAt(s.rows, s.picked))}` : "",
          s.showMean ? `a line at the mean ${numText(meanOf(s.rows))}` : "",
        ]
          .filter((x) => x !== "")
          .join("; "),
      },
    ];
    if (s.step === MODE_STEPS) {
      elements.push({ id: ModePart.Working, value: modeWorking(s.rows).join(" ") });
      elements.push({ id: ModePart.Result, value: `mode = ${numText(modeOf(s.rows))}` });
    }
    return {
      summary: `A histogram of ${s.rows.length} classes for finding the mode (step ${s.step} of ${MODE_STEPS}).`,
      elements,
      hidden: { modalClass: classText(rowAt(s.rows, m)), mode: ncert(modeOf(s.rows)) },
    };
  },
  parts: (s) => [
    ModePart.Chart,
    ...(s.step === MODE_STEPS ? [ModePart.Working, ModePart.Result] : []),
    ...(s.canStep && s.step < MODE_STEPS ? [ModePart.Next] : []),
    ...(s.canStep && s.step > 0 ? [ModePart.Back] : []),
  ],
});

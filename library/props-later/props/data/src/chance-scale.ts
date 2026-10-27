import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { wordsSchema } from "./chance";
import { clean, fracText, simplify } from "./numbers";

/**
 * The probability line from 0 (impossible) to 1 (sure), NCERT 15.2: events are placed on it one
 * at a time, and for the one in focus the complement is drawn as the rest of the bar, so that
 * P(E) + P(not E) = 1 can be seen.
 */

export const ScaleAction = {
  Next: "next",
  Back: "back",
  Focus: "focus",
  ShowComplement: "showComplement",
} as const;
export const ScaleSignal = { Placed: "placed", Done: "done" } as const;
export const ScaleDerived = { Shown: "shown", Values: "values" } as const;
export const ScalePart = {
  Line: "line",
  Bar: "bar",
  Next: "next",
  Back: "back",
  Complement: "complement",
} as const;

const itemSchema = z
  .object({
    label: wordsSchema,
    num: z.number().int().min(0),
    den: z.number().int().min(1),
  })
  .strict();
export type ScaleItem = z.infer<typeof itemSchema>;

const scaleState = z
  .object({
    items: z.array(itemSchema).min(1).max(8),
    /** How many items are on the line. */
    shown: z.number().int().min(0).max(8),
    /** The item whose complement the bar shows (an index into items). */
    focus: z.number().int().min(0).max(7),
    isComplementShown: z.boolean(),
    canStep: z.boolean(),
  })
  .strict();
export type ScaleState = z.infer<typeof scaleState>;

export const chanceValue = (i: ScaleItem) => clean(i.num / i.den);
export const itemText = (i: ScaleItem) => fracText(simplify(i.num, i.den));
export const complementText = (i: ScaleItem) => fracText(simplify(i.den - i.num, i.den));

const act = actionsFor<ScaleState>();

export const chanceScale = defineProp({
  type: "chanceScale",
  describe:
    "The probability line from 0 (impossible) through 1/2 (as likely as not) to 1 (sure). Events are placed on it one at a time at their probability (num/den, shown in lowest terms). For the event in focus a bar beneath splits the whole, 1, into P(E) and P(not E), so the complement is the rest: P(not E) = 1 − P(E).",
  state: scaleState,
  defaults: {
    items: [
      { label: { en: "a die shows 8", hi: "पासे पर 8 आए" }, num: 0, den: 6 },
      { label: { en: "a die shows 4", hi: "पासे पर 4 आए" }, num: 1, den: 6 },
      { label: { en: "a coin shows a head", hi: "सिक्के पर चित आए" }, num: 1, den: 2 },
      { label: { en: "a die shows less than 7", hi: "पासे पर 7 से कम आए" }, num: 6, den: 6 },
    ],
    shown: 0,
    focus: 1,
    isComplementShown: false,
    canStep: true,
  },
  inputs: ["canStep"],
  invariant: (s) => {
    if (s.items.some((i) => i.num > i.den)) return "a probability can't be more than 1";
    if (s.shown > s.items.length) return "more items shown than there are";
    if (s.focus >= s.items.length) return "the focus is past the last item";
    return undefined;
  },
  derived: {
    [ScaleDerived.Shown]: { describe: "How many events are on the line", compute: (s) => s.shown },
    [ScaleDerived.Values]: {
      describe: "Each event's probability as a decimal",
      compute: (s) => s.items.map(chanceValue),
    },
  },
  actions: {
    [ScaleAction.Next]: act({
      describe: "Place the next event on the line (it becomes the focus)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (!s.canStep || s.shown >= s.items.length) return set({});
        const shown = s.shown + 1;
        const item = s.items[shown - 1];
        return set(
          { shown, focus: shown - 1 },
          {
            signal: ScaleSignal.Placed,
            payload: { index: shown - 1, value: item ? chanceValue(item) : 0 },
          },
          ...(shown === s.items.length ? [{ signal: ScaleSignal.Done, payload: {} }] : []),
        );
      },
    }),
    [ScaleAction.Back]: act({
      describe: "Take the last event off the line",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        !s.canStep || s.shown === 0
          ? set({})
          : set({ shown: s.shown - 1, focus: Math.max(0, Math.min(s.focus, s.shown - 2)) }),
    }),
    [ScaleAction.Focus]: act({
      describe: "Choose which placed event the bar shows",
      byLearner: true,
      args: z.object({ index: z.number().int().min(0).max(7) }).strict(),
      run: (s, a) =>
        a.index < Math.max(1, s.shown) && a.index < s.items.length
          ? set({ focus: a.index })
          : set({}),
    }),
    [ScaleAction.ShowComplement]: act({
      describe: "Show or hide the complement on the bar",
      byLearner: true,
      args: z.object({ isShown: z.boolean() }).strict(),
      run: (_s, a) => set({ isComplementShown: a.isShown }),
    }),
  },
  signals: {
    [ScaleSignal.Placed]: {
      describe: "An event was placed on the line; the payload has its value",
    },
    [ScaleSignal.Done]: { describe: "Every event is on the line" },
  },
  observe: (s) => {
    const placed = s.items.slice(0, s.shown);
    const focus = s.items[s.focus];
    const elements: Element[] = [
      {
        id: ScalePart.Line,
        value:
          placed.length === 0
            ? "an empty line from 0 (impossible) to 1 (sure)"
            : placed.map((i) => `${i.label.en} at ${itemText(i)}`).join("; "),
      },
    ];
    if (focus !== undefined && s.shown > 0)
      elements.push({
        id: ScalePart.Bar,
        value: `${focus.label.en}: ${itemText(focus)}${
          s.isComplementShown ? `, not: ${complementText(focus)}, together 1` : ""
        }`,
      });
    return {
      summary: `A probability line, ${s.shown} of ${s.items.length} events placed.`,
      elements,
    };
  },
  parts: (s) => [
    ScalePart.Line,
    ...(s.shown > 0 ? [ScalePart.Bar, ScalePart.Complement] : []),
    ...(s.canStep && s.shown < s.items.length ? [ScalePart.Next] : []),
    ...(s.canStep && s.shown > 0 ? [ScalePart.Back] : []),
  ],
});

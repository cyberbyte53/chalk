import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";

/** Small props: a stepper, a line of maths, a symbol button. Each knows nothing about any lesson. */

// ---- stepper ----

export const StepperAction = { Change: "change" } as const;
export const StepperSignal = { Changed: "changed" } as const;
export const StepperPart = { Less: "less", Value: "value", More: "more" } as const;

const stepperState = z
  .object({
    /** What the number is called, shown before it: x, n. */
    name: z.string().min(1).max(8),
    value: z.number(),
    /** How it's written, when not as plain digits (½, −3.6); null for plain. */
    shown: z.string().max(24).nullable(),
    step: z.number().positive(),
    min: z.number(),
    max: z.number(),
  })
  .strict();
export type StepperState = z.infer<typeof stepperState>;
const onStepper = actionsFor<StepperState>();

/** The value after one step either way, inside the range. */
export const stepped = (s: StepperState, by: 1 | -1): number =>
  Math.min(s.max, Math.max(s.min, Number((s.value + by * s.step).toFixed(10))));

export const stepper = defineProp({
  type: "stepper",
  isExplainer: false,
  describe: "− value +: a named number the learner nudges by `step`, between `min` and `max`.",
  state: stepperState,
  defaults: { name: "x", value: 0, shown: null, step: 1, min: -10, max: 10 },
  actions: {
    [StepperAction.Change]: onStepper({
      describe: "Set the number to `to` (a − or + press steps it by `step`)",
      byLearner: true,
      args: z.object({ to: z.number() }).strict(),
      changes: ["value"],
      run: (s, a) => {
        const to = Math.min(s.max, Math.max(s.min, a.to));
        return set({ value: to }, { signal: StepperSignal.Changed, payload: { to } });
      },
    }),
  },
  signals: { [StepperSignal.Changed]: { describe: "The number changed: `to`" } },
  invariant: (s) => (s.min <= s.max ? undefined : "min must not be above max"),
  anatomy: {
    [StepperPart.Less]: {
      is: "control",
      name: (s) => `${s.name} − ${s.step}`,
      press: {
        action: StepperAction.Change,
        args: (s) => ({ to: stepped(s, -1) }),
        enabled: (s) => stepped(s, -1) < s.value,
      },
    },
    [StepperPart.Value]: {
      is: "readout",
      value: (s) => s.value,
      words: (s) => `${s.name} = ${s.shown ?? s.value}`,
    },
    [StepperPart.More]: {
      is: "control",
      name: (s) => `${s.name} + ${s.step}`,
      press: {
        action: StepperAction.Change,
        args: (s) => ({ to: stepped(s, 1) }),
        enabled: (s) => stepped(s, 1) > s.value,
      },
    },
  },
  summary: (s) => `${s.name} = ${s.shown ?? s.value}, stepped by ${s.step}`,
});

// ---- mathLine ----

export const MathLinePart = { Line: "line" } as const;
const mathLineState = z
  .object({
    /** The maths, in TeX; empty shows the placeholder. */
    tex: z.string().max(400),
    /** Shown while there is nothing to write. */
    placeholder: z.string().max(40),
    /** Puts what follows the last " = " on a line of its own (long workings). */
    isSplit: z.boolean(),
  })
  .strict();
export type MathLineState = z.infer<typeof mathLineState>;

export const mathLine = defineProp({
  type: "mathLine",
  isExplainer: false,
  describe: "One line of typeset maths (an equation, a working).",
  state: mathLineState,
  defaults: { tex: "", placeholder: "…", isSplit: false },
  inputs: ["tex"],
  actions: {},
  anatomy: {
    [MathLinePart.Line]: {
      is: "readout",
      value: (s) => (s.tex === "" ? null : s.tex),
      words: (s) => (s.tex === "" ? s.placeholder : undefined),
    },
  },
  summary: (s) => (s.tex === "" ? "an empty line of maths" : "a line of maths"),
});

// ---- iconButton ----

export const IconButtonAction = { Press: "press" } as const;
export const IconButtonSignal = { Pressed: "pressed" } as const;
export const IconButtonPart = { Button: "button" } as const;
const iconButtonState = z
  .object({
    symbol: z.string().min(1).max(4),
    /** What it does, for screen readers (it shows no words). */
    label: z.string().min(1).max(60),
    isEnabled: z.boolean(),
  })
  .strict();
export type IconButtonState = z.infer<typeof iconButtonState>;
const onIcon = actionsFor<IconButtonState>();

export const iconButton = defineProp({
  type: "iconButton",
  isExplainer: false,
  describe: "A round button with a symbol (↺, ×) and no words. Pressing it raises `pressed`.",
  state: iconButtonState,
  defaults: { symbol: "↺", label: "Again", isEnabled: true },
  inputs: ["isEnabled"],
  actions: {
    [IconButtonAction.Press]: onIcon({
      describe: "Press it (what the learner's tap does)",
      byLearner: true,
      args: z.object({}).strict(),
      changes: [],
      run: (s) => (s.isEnabled ? set({}, { signal: IconButtonSignal.Pressed }) : set({})),
    }),
  },
  signals: { [IconButtonSignal.Pressed]: { describe: "It was pressed" } },
  anatomy: {
    [IconButtonPart.Button]: {
      is: "control",
      value: (s) => s.label,
      name: (s) => s.label,
      press: { action: IconButtonAction.Press, enabled: (s) => s.isEnabled },
    },
  },
  summary: (s) => `a ${s.symbol} button: ${s.label}${s.isEnabled ? "" : " (off)"}`,
});

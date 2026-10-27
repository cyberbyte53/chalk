import { type Element, type Emit, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import {
  type Term,
  collect,
  divisionSteps,
  productCells,
  termText,
  termsOf,
  termsText,
} from "./box-algebra";
import { button } from "./seen";

/** Multiply two polynomials cell by cell, or divide one by another column by column. */
export const BoxMode = { Multiply: "multiply", Divide: "divide" } as const;
export type BoxMode = (typeof BoxMode)[keyof typeof BoxMode];

export const PolyBoxAction = {
  Next: "next",
  All: "all",
  StartAgain: "startAgain",
  SetProblem: "setProblem",
} as const;

export const PolyBoxDerived = {
  StepCount: "stepCount",
  IsDone: "isDone",
  Result: "result",
  Quotient: "quotient",
  Remainder: "remainder",
} as const;

export const PolyBoxSignal = { Stepped: "stepped", Finished: "finished" } as const;

const coefficients = z.array(z.number()).min(1).max(6);

const polyBoxState = z
  .object({
    mode: z.nativeEnum(BoxMode),
    /** Multiply: the factor down the side. Divide: the divisor. Highest power first. */
    side: coefficients,
    /** Multiply: the factor along the top. (Divide: unused.) */
    top: coefficients,
    /** Divide: the dividend. (Multiply: unused.) */
    dividend: coefficients,
    /** Multiply: cells filled, row by row. Divide: quotient terms found. */
    steps: z.number().int().min(0),
    variable: z.string().regex(/^[a-z]$/),
  })
  .strict();
export type PolyBoxState = z.infer<typeof polyBoxState>;

/** How many steps the problem takes: every cell, or every quotient term. */
export function stepCountOf(s: PolyBoxState): number {
  return s.mode === BoxMode.Multiply
    ? termsOf(s.side).length * termsOf(s.top).length
    : divisionSteps(s.dividend, s.side).length;
}

function product(s: PolyBoxState): Term[] {
  return collect(productCells(termsOf(s.side), termsOf(s.top)).map((c) => c.term));
}

function quotientOf(s: PolyBoxState): Term[] {
  return divisionSteps(s.dividend, s.side).map((step) => step.quotient);
}

function remainderOf(s: PolyBoxState): Term[] {
  return divisionSteps(s.dividend, s.side).at(-1)?.remaining ?? collect(termsOf(s.dividend));
}

const act = actionsFor<PolyBoxState>();
const none = z.object({}).strict();

function finished(s: PolyBoxState): Emit {
  const v = s.variable;
  return s.mode === BoxMode.Multiply
    ? { signal: PolyBoxSignal.Finished, payload: { result: termsText(product(s), v) } }
    : {
        signal: PolyBoxSignal.Finished,
        payload: { quotient: termsText(quotientOf(s), v), remainder: termsText(remainderOf(s), v) },
      };
}

/**
 * The box method. Multiplying: one factor's terms down the side, the other's along the top, and
 * each cell is its row term times its column term; like terms (cells of the same power, the same
 * colour) add up to the product. Dividing: the divisor down the side and the quotient grows along
 * the top, one column per step: the next quotient term is what's left's first term ÷ the divisor's
 * first term, and its column is taken away from what's left. It stops when what's left has a
 * smaller degree than the divisor: that is the remainder, and dividend = divisor × quotient + remainder.
 */
export const polyBox = defineProp({
  type: "polyBox",
  describe:
    "The box method for polynomials. Multiplying, the cells are every term of one factor times every term of the other, and cells of the same power (same colour) add up to the product; for (x − α)(x − β) the cells are x², −αx, −βx and αβ, so the x-coefficient is −(α + β) and the constant is αβ. Dividing, the divisor is down the side and each step adds a quotient term along the top: what's left's first term ÷ the divisor's first term. The column it makes is taken away from what's left, until what's left has a smaller degree than the divisor. Then dividend = divisor × quotient + remainder, like a = bq + r for numbers.",
  state: polyBoxState,
  defaults: {
    mode: BoxMode.Divide,
    side: [1, 2],
    top: [1, -3],
    dividend: [2, 3, 1],
    steps: 0,
    variable: "x",
  },
  derived: {
    [PolyBoxDerived.StepCount]: {
      describe: "How many steps it takes in all",
      compute: stepCountOf,
    },
    [PolyBoxDerived.IsDone]: {
      describe: "Every step is done",
      compute: (s) => s.steps >= stepCountOf(s),
    },
    [PolyBoxDerived.Result]: {
      describe: "Multiplying: the product, written out",
      compute: (s) => (s.mode === BoxMode.Multiply ? termsText(product(s), s.variable) : null),
    },
    [PolyBoxDerived.Quotient]: {
      describe: "Dividing: the whole quotient, written out",
      compute: (s) => (s.mode === BoxMode.Divide ? termsText(quotientOf(s), s.variable) : null),
    },
    [PolyBoxDerived.Remainder]: {
      describe: "Dividing: the remainder, written out (0 when the divisor is a factor)",
      compute: (s) => (s.mode === BoxMode.Divide ? termsText(remainderOf(s), s.variable) : null),
    },
  },
  actions: {
    [PolyBoxAction.Next]: act({
      describe:
        "Do the next step: fill the next cell, or find the next quotient term (the learner's button)",
      byLearner: true,
      args: none,
      run: (s) => {
        const total = stepCountOf(s);
        if (s.steps >= total) return set({});
        const steps = s.steps + 1;
        const emits: Emit[] = [{ signal: PolyBoxSignal.Stepped, payload: { step: steps } }];
        if (steps === total) emits.push(finished(s));
        return set({ steps }, ...emits);
      },
    }),
    [PolyBoxAction.All]: act({
      describe: "Do every step at once",
      reveals: true,
      args: none,
      run: (s) => {
        const total = stepCountOf(s);
        return s.steps >= total ? set({}) : set({ steps: total }, finished(s));
      },
    }),
    [PolyBoxAction.StartAgain]: act({
      describe: "Empty the box",
      byLearner: true,
      args: none,
      run: () => set({ steps: 0 }),
    }),
    [PolyBoxAction.SetProblem]: act({
      describe: "A new problem, box empty: multiply side × top, or divide dividend by side",
      args: z
        .object({
          mode: z.nativeEnum(BoxMode),
          side: coefficients,
          top: coefficients,
          dividend: coefficients,
        })
        .strict(),
      run: (_s, a) =>
        set({ mode: a.mode, side: a.side, top: a.top, dividend: a.dividend, steps: 0 }),
    }),
  },
  signals: {
    [PolyBoxSignal.Stepped]: { describe: "A step was done: `step` is how many so far" },
    [PolyBoxSignal.Finished]: {
      describe:
        "Every step is done: `result` (multiplying), or `quotient` and `remainder` (dividing)",
    },
  },
  invariant: (s) => {
    if (termsOf(s.side).length === 0) return "the side can't be 0";
    if (s.steps > stepCountOf(s))
      return `steps ${s.steps} is more than the ${stepCountOf(s)} there are`;
    return undefined;
  },
  observe: (s) => {
    const v = s.variable;
    const side = termsOf(s.side);
    const elements: Element[] = [];
    side.forEach((t, i) => {
      elements.push({ id: `side:${i}`, value: termText(t, v) });
    });
    if (s.mode === BoxMode.Multiply) {
      const top = termsOf(s.top);
      top.forEach((t, j) => {
        elements.push({ id: `top:${j}`, value: termText(t, v) });
      });
      const cells = productCells(side, top);
      for (const c of cells.slice(0, s.steps)) {
        elements.push({ id: `cell:${c.row}:${c.column}`, value: termText(c.term, v) });
      }
      const isDone = s.steps >= cells.length;
      if (isDone) elements.push({ id: "result", value: termsText(product(s), v) });
      elements.push(button("next", !isDone), button("startAgain", s.steps > 0));
      return {
        summary: `the box for (${termsText(side, v)})(${termsText(top, v)}), ${s.steps} of ${cells.length} cells filled`,
        elements,
        ...(isDone ? {} : { hidden: { product: termsText(product(s), v) } }),
      };
    }
    const steps = divisionSteps(s.dividend, s.side);
    const done = steps.slice(0, s.steps);
    done.forEach((step, j) => {
      elements.push({ id: `top:${j}`, value: termText(step.quotient, v) });
      step.cells.forEach((cell, i) => {
        elements.push({ id: `cell:${i}:${j}`, value: termText(cell, v) });
      });
    });
    const left = done.at(-1)?.remaining ?? collect(termsOf(s.dividend));
    const isDone = s.steps >= steps.length;
    elements.push({ id: "dividend", value: termsText(collect(termsOf(s.dividend)), v) });
    // What's left is drawn only once a step is done (before, it is just the dividend again).
    if (s.steps > 0) {
      elements.push({
        id: "left",
        value: `${termsText(left, v)}${isDone ? " (the remainder)" : ""}`,
      });
    }
    elements.push(button("next", !isDone), button("startAgain", s.steps > 0));
    return {
      summary: `dividing ${termsText(collect(termsOf(s.dividend)), v)} by ${termsText(side, v)} in a box: ${s.steps} of ${steps.length} quotient terms found${isDone ? `; quotient ${termsText(quotientOf(s), v)}, remainder ${termsText(remainderOf(s), v)}` : ""}`,
      elements,
      ...(isDone
        ? {}
        : {
            hidden: {
              quotient: termsText(quotientOf(s), v),
              remainder: termsText(remainderOf(s), v),
            },
          }),
    };
  },
});

import { type Element, actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { EquationForm, type Line, equationOf, fracText } from "./algebra";
import {
  type Isolate,
  Method,
  Outcome,
  StepKind,
  type Worked,
  canIsolate,
  easiestEliminate,
  easiestIsolate,
  stepText,
  workedSolution,
} from "./steps";

/**
 * A pair of linear equations solved on paper, one step at a time, by substitution, elimination or
 * cross-multiplication. The learner chooses which variable to write in terms of the other (or to
 * remove), then reveals the working. When a variable vanishes, the statement left over decides:
 * true means infinitely many solutions, false means none.
 */

export const SolveStepsAction = {
  Choose: "choose",
  Next: "next",
  Reset: "reset",
  ShowAll: "showAll",
} as const;

export const SolveStepsSignal = { Chosen: "chosen", Stepped: "stepped" } as const;

export const SolveStepsDerived = {
  StepCount: "stepCount",
  IsDone: "isDone",
  NeedsChoice: "needsChoice",
  Outcome: "outcome",
  Solution: "solution",
} as const;

export const SolveStepsPart = {
  Equations: "equations",
  Choices: "choices",
  Diagram: "diagram",
  Step: "step",
  Next: "next",
} as const;

const number = z.number().finite().min(-1e7).max(1e7);
const lineSchema = z
  .object({ a: number, b: number, c: number })
  .strict()
  .refine((l) => l.a !== 0 || l.b !== 0, "a and b can't both be 0");
const variable = z.string().regex(/^[a-z]$/);
const index = z.union([z.literal(0), z.literal(1)]);

const solveStepsState = z
  .object({
    /** The pair, each a x + b y + c = 0. */
    equations: z.tuple([lineSchema, lineSchema]),
    /** The variables' letters: x and y, or s and t, p and q, u and v… */
    variables: z.tuple([variable, variable]),
    /** How (1) and (2) are written: a x + b y = k, or a x + b y + c = 0. */
    form: z.nativeEnum(EquationForm),
    method: z.nativeEnum(Method),
    /** Substitution: which variable is written in terms of the other, from which equation. Null: not chosen yet. */
    isolate: z.object({ equation: index, variable: index }).strict().nullable(),
    /** Elimination: which variable (0: the first, 1: the second) is removed. Null: not chosen yet. */
    eliminate: index.nullable(),
    /** How many steps of working are shown. */
    step: z.number().int().min(0).max(20),
    /** Whether the learner picks the variable (buttons); if not, the easiest one is used. */
    canChoose: z.boolean(),
    /** Whether the learner reveals the steps with a "next" button. */
    canStep: z.boolean(),
    /** Whether the working ends by checking the answer in both equations. */
    showCheck: z.boolean(),
    /** Cross-multiplication: the b₁ c₁ a₁ b₁ arrow diagram above the working. */
    showDiagram: z.boolean(),
  })
  .strict();
export type SolveStepsState = z.infer<typeof solveStepsState>;

const act = actionsFor<SolveStepsState>();

/** Whether the learner still has to pick a variable before any working shows. */
export function needsChoice(s: SolveStepsState): boolean {
  if (!s.canChoose) return false;
  if (s.method === Method.Substitution) return s.isolate === null;
  if (s.method === Method.Elimination) return s.eliminate === null;
  return false;
}

/** The variable choice the working uses: the learner's, or the easiest. */
export function choiceOf(s: SolveStepsState): { isolate: Isolate; eliminate: 0 | 1 } {
  const isolate =
    s.isolate !== null && canIsolate(s.equations, s.isolate)
      ? s.isolate
      : easiestIsolate(s.equations);
  return { isolate, eliminate: s.eliminate ?? easiestEliminate(s.equations) };
}

/** The whole worked solution (without the check, if it is switched off). */
export function workedOf(s: SolveStepsState): Worked {
  const w = workedSolution(s.equations, s.variables, s.form, s.method, choiceOf(s));
  return s.showCheck ? w : { ...w, steps: w.steps.filter((x) => x.kind !== StepKind.Check) };
}

const shownSteps = (s: SolveStepsState) =>
  needsChoice(s) ? 0 : Math.min(s.step, workedOf(s).steps.length);

const methodWords: Record<Method, string> = {
  [Method.Substitution]: "substitution",
  [Method.Elimination]: "elimination",
  [Method.CrossMultiplication]: "cross-multiplication",
};

const outcomeWords: Record<Outcome, string> = {
  [Outcome.Unique]: "exactly one solution",
  [Outcome.None]: "no solution",
  [Outcome.InfinitelyMany]: "infinitely many solutions",
};

export const solveSteps = defineProp({
  type: "solveSteps",
  describe:
    "A pair of linear equations in two variables solved step by step on paper, the book's way, in exact fractions. Substitution: write one variable in terms of the other from one equation, put it into the other, solve, put back. Elimination: multiply the equations so one variable's coefficients have the same size, add or subtract to remove it, solve, put back. Cross-multiplication: x/(b₁c₂ − b₂c₁) = y/(c₁a₂ − c₂a₁) = 1/(a₁b₂ − a₂b₁), with the arrow diagram. If a variable vanishes, the leftover statement decides: true (18 = 18) means infinitely many solutions, false (0 = 9) means none. The learner chooses the variable and reveals each step.",
  state: solveStepsState,
  defaults: {
    equations: [
      { a: 7, b: -15, c: -2 },
      { a: 1, b: 2, c: -3 },
    ],
    variables: ["x", "y"],
    form: EquationForm.Equals,
    method: Method.Substitution,
    isolate: null,
    eliminate: null,
    step: 0,
    canChoose: true,
    canStep: true,
    showCheck: true,
    showDiagram: true,
  },
  inputs: ["canChoose", "canStep", "showCheck", "showDiagram"],
  derived: {
    [SolveStepsDerived.StepCount]: {
      describe: "How many steps the whole working has",
      compute: (s) => workedOf(s).steps.length,
    },
    [SolveStepsDerived.IsDone]: {
      describe: "Whether every step is shown",
      compute: (s) => !needsChoice(s) && s.step >= workedOf(s).steps.length,
    },
    [SolveStepsDerived.NeedsChoice]: {
      describe: "Whether the learner must first pick which variable to write or remove",
      compute: needsChoice,
    },
    [SolveStepsDerived.Outcome]: {
      describe: "unique, none or infinitelyMany (known to the prop; shown when the working ends)",
      compute: (s) => workedOf(s).outcome,
    },
    [SolveStepsDerived.Solution]: {
      describe: "The solution [x, y] as numbers, or null when there isn't exactly one",
      compute: (s) => {
        const p = workedOf(s).solution;
        return p === null ? null : [p[0].valueOf(), p[1].valueOf()];
      },
    },
  },
  actions: {
    [SolveStepsAction.Choose]: act({
      describe:
        "Pick the variable (the learner's tap): for substitution, which variable from which equation is written in terms of the other; for elimination, which variable is removed. The working starts again from step 1",
      byLearner: true,
      args: z
        .object({
          isolate: z.object({ equation: index, variable: index }).strict().optional(),
          eliminate: index.optional(),
        })
        .strict(),
      run: (s, a) => {
        if (s.method === Method.Substitution && a.isolate !== undefined) {
          if (!canIsolate(s.equations, a.isolate)) return set({});
          return set(
            { isolate: a.isolate, step: 1 },
            { signal: SolveStepsSignal.Chosen, payload: { isolate: a.isolate } },
          );
        }
        if (s.method === Method.Elimination && a.eliminate !== undefined) {
          return set(
            { eliminate: a.eliminate, step: 1 },
            { signal: SolveStepsSignal.Chosen, payload: { eliminate: a.eliminate } },
          );
        }
        return set({});
      },
    }),
    [SolveStepsAction.Next]: act({
      describe: "Show the next step of working (the learner's tap)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        if (needsChoice(s)) return set({});
        const w = workedOf(s);
        if (s.step >= w.steps.length) return set({});
        const step = s.step + 1;
        const isDone = step >= w.steps.length;
        return set(
          { step },
          {
            signal: SolveStepsSignal.Stepped,
            payload: { step, isDone, outcome: isDone ? w.outcome : null },
          },
        );
      },
    }),
    [SolveStepsAction.Reset]: act({
      describe: "Clear the working (and the learner's choice, if they choose)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        set({
          step: 0,
          ...(s.canChoose ? { isolate: null, eliminate: null } : {}),
        }),
    }),
    [SolveStepsAction.ShowAll]: act({
      describe: "Show every step at once (the lesson's move, e.g. to recap)",
      args: z.object({}).strict(),
      run: (s) => {
        const w = workedOf(s);
        return set(
          { step: w.steps.length, ...choiceFill(s) },
          {
            signal: SolveStepsSignal.Stepped,
            payload: { step: w.steps.length, isDone: true, outcome: w.outcome },
          },
        );
      },
    }),
  },
  signals: {
    [SolveStepsSignal.Chosen]: {
      describe: "The learner picked a variable: `isolate` {equation, variable} or `eliminate`",
    },
    [SolveStepsSignal.Stepped]: {
      describe: "Another step shows: `step`, `isDone`, and `outcome` once the working ends",
    },
  },
  invariant: (s) =>
    s.isolate !== null && !canIsolate(s.equations, s.isolate)
      ? "that equation has no such variable to write in terms of the other"
      : undefined,
  observe: (s) => {
    const w = workedOf(s);
    const shown = shownSteps(s);
    const eqs = s.equations.map((l: Line) => equationOf(l, s.variables, s.form, false));
    const elements: Element[] = [
      { id: SolveStepsPart.Equations, value: `(1) ${eqs[0]}; (2) ${eqs[1]}` },
    ];
    if (needsChoice(s))
      elements.push({
        id: SolveStepsPart.Choices,
        value:
          s.method === Method.Substitution
            ? "buttons: which variable to write in terms of the other, from which equation"
            : "buttons: which variable to remove",
      });
    w.steps.slice(0, shown).forEach((step, i) => {
      elements.push({
        id: `${SolveStepsPart.Step}:${i}`,
        value: `${step.caption.en} ${stepText(step)}`,
      });
    });
    if (s.canStep && !needsChoice(s) && shown < w.steps.length)
      elements.push({ id: SolveStepsPart.Next, value: "next step" });
    const done = !needsChoice(s) && shown >= w.steps.length;
    const answer =
      w.solution === null
        ? outcomeWords[w.outcome]
        : `${s.variables[0]} = ${fracText(w.solution[0])}, ${s.variables[1]} = ${fracText(w.solution[1])}`;
    return {
      summary: `solving (1) ${eqs[0]} and (2) ${eqs[1]} by ${methodWords[s.method]}: ${needsChoice(s) ? "waiting for the learner to choose the variable" : `${shown} of ${w.steps.length} steps shown${done ? `, ${answer}` : ""}`}`,
      elements,
      hidden: done ? undefined : { answer, steps: w.steps.slice(shown).map((x) => stepText(x)) },
    };
  },
  parts: (s) => {
    const shown = shownSteps(s);
    return [
      SolveStepsPart.Equations,
      ...(needsChoice(s) ? [SolveStepsPart.Choices] : []),
      ...(s.method === Method.CrossMultiplication && s.showDiagram ? [SolveStepsPart.Diagram] : []),
      ...Array.from({ length: shown }, (_, i) => `${SolveStepsPart.Step}:${i}`),
      ...(s.canStep && !needsChoice(s) && shown < workedOf(s).steps.length
        ? [SolveStepsPart.Next]
        : []),
    ];
  },
});

/** When everything is shown at once, the choice is filled in with the easiest one. */
function choiceFill(s: SolveStepsState): Partial<SolveStepsState> {
  if (!needsChoice(s)) return {};
  const c = choiceOf(s);
  return s.method === Method.Substitution ? { isolate: c.isolate } : { eliminate: c.eliminate };
}

export { Method, Outcome };

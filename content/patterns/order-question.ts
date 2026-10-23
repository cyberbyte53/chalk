import { type BoardKit, type PlacedOf, theBoard } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { QuestionAction, QuestionSignal } from "@chalk/prop";
import { OrderStepsAction, orderStepsDef } from "@chalk/prop-basics";

/** One step of an argument to put in order; `hint` says what it needs before it. */
export type OrderStep = { id: string; label: Localized; hint?: Localized };

/**
 * Put an argument's steps in order: the steps offered in `shown` order, right in `answers` order
 * (more than one when some steps can swap). Its witness places the first answer and checks; a note
 * check swaps the first two lines that can't swap.
 */
export function orderQuestion(
  b: BoardKit,
  spec: {
    name?: string;
    prompt: Localized;
    steps: readonly OrderStep[];
    /** The order the steps are offered in (a shuffle), as ids. */
    shown: readonly string[];
    answers: readonly (readonly string[])[];
    isHidden?: boolean;
    passes?: boolean;
  },
): PlacedOf<typeof orderStepsDef> {
  const byId = new Map(spec.steps.map((s) => [s.id, s]));
  if (spec.shown.length !== spec.steps.length || spec.shown.some((id) => !byId.has(id))) {
    throw new Error("orderQuestion: `shown` must list every step once");
  }
  const first = spec.answers[0];
  if (first === undefined) throw new Error("orderQuestion: give at least one right order");
  const ask = b.prop(
    orderStepsDef,
    spec.name ?? "ask",
    {
      prompt: spec.prompt,
      steps: spec.shown.map((id) => {
        const step = byId.get(id) as OrderStep;
        return step.hint === undefined ? { id, label: step.label } : { ...step };
      }),
      answers: spec.answers.map((a) => [...a]),
    },
    { isHidden: spec.isHidden === true },
  );
  if (spec.passes !== false) b.when(ask.on(QuestionSignal.Correct), theBoard.pass());
  b.witness(
    ...first.map((step) => ask.learner(OrderStepsAction.Place, { step })),
    ask.learner(QuestionAction.Check),
  );
  // A wrong order: the last two lines swapped, unless some right order allows that.
  const swapped = [...first.slice(0, -2), first.at(-1) as string, first.at(-2) as string];
  const isAllowed = spec.answers.some((a) => a.every((id, i) => swapped[i] === id));
  const misplaced = byId.get(first.at(-1) as string);
  if (!isAllowed && misplaced?.hint !== undefined) {
    b.noteCheck({
      steps: [
        ...swapped.map((step) => ask.learner(OrderStepsAction.Place, { step })),
        ask.learner(QuestionAction.Check),
      ],
      feedback: misplaced.hint,
    });
  }
  return ask;
}

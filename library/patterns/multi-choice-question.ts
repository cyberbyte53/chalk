import { type BoardKit, type PlacedOf, theBoard } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { QuestionAction, QuestionSignal } from "@chalk/prop";
import { MultiChoiceAction, multiChoiceDef } from "@chalk/prop-basics";
import type { Option } from "./choice-question";

/**
 * A question with several right options: tap each one that's right, then Check. Its witness picks
 * every answer; a note check per wrong option with feedback, and one for leaving a right one out.
 */
export function multiChoiceQuestion(
  b: BoardKit,
  spec: {
    name?: string;
    prompt: Localized;
    options: readonly Option[];
    answers: readonly string[];
    /** Said when every pick is right but some right ones are missing. */
    missing: Localized;
    isHidden?: boolean;
    /** Whether a right answer lets the learner go on (default true). */
    passes?: boolean;
  },
): PlacedOf<typeof multiChoiceDef> {
  const ids = spec.options.map((o) => o.id);
  for (const a of spec.answers) {
    if (!ids.includes(a)) throw new Error(`multiChoiceQuestion: "${a}" is not one of the options`);
  }
  if (new Set(ids).size !== ids.length)
    throw new Error("multiChoiceQuestion: two options share an id");
  const ask = b.prop(
    multiChoiceDef,
    spec.name ?? "ask",
    {
      prompt: spec.prompt,
      options: spec.options.map((o) =>
        o.feedback === undefined ? { id: o.id, label: o.label } : { ...o },
      ),
      answers: [...spec.answers],
      missing: spec.missing,
    },
    { isHidden: spec.isHidden === true },
  );
  if (spec.passes !== false) b.when(ask.on(QuestionSignal.Correct), theBoard.pass());
  b.witness(
    ...spec.answers.map((option) => ask.learner(MultiChoiceAction.Toggle, { option })),
    ask.learner(QuestionAction.Check),
  );
  for (const o of spec.options) {
    if (spec.answers.includes(o.id) || o.feedback === undefined) continue;
    b.noteCheck({
      steps: [
        ask.learner(MultiChoiceAction.Toggle, { option: o.id }),
        ask.learner(QuestionAction.Check),
      ],
      feedback: o.feedback,
    });
  }
  const first = spec.answers[0];
  if (spec.answers.length > 1 && first !== undefined) {
    b.noteCheck({
      steps: [
        ask.learner(MultiChoiceAction.Toggle, { option: first }),
        ask.learner(QuestionAction.Check),
      ],
      feedback: spec.missing,
    });
  }
  return ask;
}

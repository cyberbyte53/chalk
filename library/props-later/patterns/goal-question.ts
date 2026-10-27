import type { AnyPlaced, BoardKit, Expr, PlacedOf, Rule, Step } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { QuestionAction, QuestionSignal } from "@chalk/prop";
import { goalDef } from "@chalk/prop-basics";

/** A wrong answer worth a note: when it holds, how a learner reaches it, and what they are told. */
export type Note = { when: Expr; say: Localized; reach: readonly Step[] };

/**
 * "Get this prop into a state, then Check": the goal prop, its IS (what counts as right), a note per
 * known wrong answer, and Continue once it's right. `solve` is how a learner gets it right; the build
 * plays it, and each note's `reach`. The concept it tests is written in by the build.
 */
export function goalQuestion(
  b: BoardKit,
  spec: {
    about: AnyPlaced;
    prompt: Localized;
    isMet: Expr;
    solve: readonly Step[];
    notes?: readonly Note[];
  },
): PlacedOf<typeof goalDef> {
  const goal = b.prop(goalDef, "goal", { prompt: spec.prompt, about: spec.about.name });
  b.is(goal.field("isMet"), spec.isMet);
  for (const note of spec.notes ?? []) {
    b.when(
      goal.on(QuestionSignal.Wrong),
      goal.call(QuestionAction.GiveFeedback, { text: note.say }),
      note.when,
    );
    b.noteCheck({ steps: [...note.reach, goal.learner(QuestionAction.Check)], feedback: note.say });
  }
  b.witness(...spec.solve, goal.learner(QuestionAction.Check));
  return goal;
}

/** A wrong answer worth a note: when it holds (a condition on the board), how to reach it, and what the learner is told. */
export type GoalNote = { when: Rule<boolean>; say: Localized; reach: readonly Step[] };

/**
 * "Get this prop into a state, then Check": `met` says what counts as right, as a condition on the
 * board (`(at) => at(line).marker ** 2 > 1.99`), read when the learner checks; each note is told
 * when its condition holds on a wrong answer. `solve` is how a learner gets it right (played at
 * build, with each note's `reach`).
 */
export function goal(
  b: BoardKit,
  spec: {
    about: AnyPlaced;
    prompt: Localized;
    met: Rule<boolean>;
    solve: readonly Step[];
    notes?: readonly GoalNote[];
    name?: string;
  },
): PlacedOf<typeof goalDef> {
  const ask = b.prop(goalDef, spec.name ?? "goal", { prompt: spec.prompt, about: spec.about.name });
  b.is(ask.field("isMet"), spec.met);
  for (const note of spec.notes ?? []) {
    b.when(
      ask.on(QuestionSignal.Wrong),
      ask.call(QuestionAction.GiveFeedback, { text: note.say }),
      note.when,
    );
    b.noteCheck({ steps: [...note.reach, ask.learner(QuestionAction.Check)], feedback: note.say });
  }
  b.witness(...spec.solve, ask.learner(QuestionAction.Check));
  return ask;
}

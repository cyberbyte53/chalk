import type { AnyPlaced, BoardKit, PlacedOf, Rule, Step } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { goalDef } from "@chalk/prop-basics";

/** A wrong answer worth a note: when the prop is in that state, what the learner is told. */
export type CheckNote = {
  /** The wrong state, as a condition on the board (Riya at the swapped house). */
  when: Rule<boolean>;
  say: Localized;
  /** How a learner gets the prop into that state (played at build, to check the note shows). */
  reach: readonly Step[];
};

/**
 * A question answered in a prop: "do it, then Check". The family places the prop as it wants it,
 * then says here what counts as right (`isRight`, a condition on the board read when the learner
 * presses Check), how a learner gets it right (`solve`, played at build), and a note for each wrong
 * state worth one. Check records the attempt; a wrong one can be tried again.
 */
export function check(
  b: BoardKit,
  spec: {
    /** The prop the learner works in. */
    about: AnyPlaced;
    prompt: Localized;
    isRight: Rule<boolean>;
    solve: readonly Step[];
    notes?: readonly CheckNote[];
    name?: string;
  },
): PlacedOf<typeof goalDef> {
  const ask = b.prop(goalDef, spec.name ?? "ask", { prompt: spec.prompt, about: spec.about.name });
  b.is(ask.input.isMet, spec.isRight);
  for (const note of spec.notes ?? []) {
    b.when(ask.on.wrong, ask.call.giveFeedback({ text: note.say }), note.when);
    b.noteCheck({ steps: [...note.reach, ask.learner.check()], feedback: note.say });
  }
  b.witness(...spec.solve, ask.learner.check());
  return ask;
}

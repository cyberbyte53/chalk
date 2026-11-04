import { type Placed, type Says, type SceneUse, type Step, cue, place, tap } from "@chalk/author";
import type { Localized } from "@chalk/content";
import { AnswerStatus, type Color } from "@chalk/prop";
import { TextStyle, choice as choiceProp, goal, text } from "@chalk/prop-basics";
import { type Option, seedOf, settle, wordsOf } from "./choice-question";

/**
 * Words and questions for a board. A question comes with what it adds
 * to the scene (`use`): its witness, its note checks, and for a check, whether it is right (a need
 * the scene gives) and the note for each wrong state worth one.
 */

/**
 * What a line says, when it isn't the words shown (`says`: any words, for the ear), and who says it
 * (`speaker`, a character of the book's cast; the narrator when left out). platform/docs/sound.md.
 */
export type { Says } from "@chalk/author";

/** Words on a board: a title, a paragraph, a note, a definition set apart. */
export const words = {
  title: (line: Localized, s: Says = {}) => place(text, { text: line, style: TextStyle.Title }, s),
  body: (line: Localized, s: Says = {}) => place(text, { text: line, style: TextStyle.Body }, s),
  note: (line: Localized, s: Says = {}) => place(text, { text: line, style: TextStyle.Note }, s),
  definition: (line: Localized, color: Color | null = null, s: Says = {}) =>
    place(text, { text: line, style: TextStyle.Definition, color }, s),
};

/** How a scene reads a piece: by its name. */
type Read = (piece: string) => Readonly<Record<string, unknown>>;

/** A wrong state worth a note: when it holds, what the learner is told, and how one gets there. */
export type Note = { when: (read: Read) => boolean; say: Localized; reach: readonly Step[] };

/**
 * "Do it in the prop, then Check": the answer is the state of `about`. `isRight` reads the board;
 * `answer` reads it as the words the learner sees on it ("(−1, 3)"; null for nothing to say),
 * what their try is recorded as; `solve` is how a learner gets it right (the witness).
 */
export function check(spec: {
  name?: string;
  about: string;
  prompt: Localized;
  /** What the question says, when it isn't its prompt as shown. */
  says?: Localized;
  isRight: (read: Read) => boolean;
  answer?: (read: Read) => Localized | null;
  solve: readonly Step[];
  notes?: readonly Note[];
}): { piece: Placed<typeof goal>; use: SceneUse } {
  const name = spec.name ?? "ask";
  const piece = place(
    goal,
    { prompt: spec.prompt, about: spec.about },
    spec.says === undefined ? {} : { says: spec.says },
  );
  const reader = (me: Readonly<Record<string, Readonly<Record<string, unknown>>>>) =>
    ((piece: string) => me[piece] ?? {}) as Read;
  const notes = spec.notes ?? [];
  type T = { to: Record<string, { giveFeedback: (p: { text: Localized }) => unknown }> };
  return {
    piece,
    use: {
      give: {
        [name]: {
          isMet: (me: never) => spec.isRight(reader(me)),
          answer: (me: never) => spec.answer?.(reader(me)) ?? null,
        },
      },
      hear: {
        [`${name}.wrong`]: ((
          me: Record<string, Readonly<Record<string, unknown>>>,
          _: unknown,
          t: T,
        ) => {
          const note = notes.find((n) => n.when(reader(me)));
          return note !== undefined && t.to[name]?.giveFeedback({ text: note.say });
        }) as never,
      },
      witness: [...spec.solve, tap(name, "check")],
      noteChecks: notes.map((n) => ({ steps: [...n.reach, tap(name, "check")], feedback: n.say })),
    },
  };
}

/**
 * A multiple-choice question: options shuffled the same way every build (unless `keepOrder`), its
 * witness (the answer, Check) and a note check for each wrong option with feedback.
 */
export function choice(spec: {
  name?: string;
  prompt: Localized;
  /** What the question says, when it isn't its prompt as shown. */
  says?: Localized;
  options: readonly Option[];
  answer: string;
  keepOrder?: boolean;
}): { piece: Placed<typeof choiceProp>; use: SceneUse } {
  const name = spec.name ?? "ask";
  if (!spec.options.some((o) => o.id === spec.answer))
    throw new Error(`choice: the answer "${spec.answer}" is not one of the options`);
  const ids = spec.options.map((o) => o.id);
  if (new Set(ids).size !== ids.length) throw new Error("choice: two options share an id");
  // Two options a student can't tell apart: one of them is right and wrong at once.
  for (const locale of ["en", "hi"] as const) {
    const labels = spec.options.map((o) => o.label[locale]);
    const twice = labels.find((label, i) => labels.indexOf(label) !== i);
    if (twice !== undefined) throw new Error(`choice: two options read the same ("${twice}")`);
  }
  const shown =
    spec.keepOrder === true
      ? spec.options
      : settle(spec.options, seedOf(`${name}|${wordsOf(spec.prompt)}|${ids.join(",")}`));
  const piece = place(
    choiceProp,
    {
      prompt: spec.prompt,
      options: shown.map((o) =>
        o.feedback === undefined
          ? { id: o.id, label: o.label }
          : { id: o.id, label: o.label, feedback: o.feedback },
      ),
      answer: spec.answer,
    },
    spec.says === undefined ? {} : { says: spec.says },
  );
  const notes = spec.options.filter((o) => o.id !== spec.answer && o.feedback !== undefined);
  return {
    piece,
    use: {
      // Each wrong option's note is said when that option is checked: the student hears why.
      cues: Object.fromEntries(
        notes.map((o) => [
          `${name}-${o.id}-note`,
          cue(o.feedbackSays ?? (o.feedback as Localized), {
            when: `${name}.checked`,
            where: { optionId: o.id, status: AnswerStatus.Wrong },
            about: name,
          }),
        ]),
      ),
      witness: [tap(name, "select", { option: spec.answer }), tap(name, "check")],
      noteChecks: notes.map((o) => ({
        steps: [tap(name, "select", { option: o.id }), tap(name, "check")],
        feedback: o.feedback as Localized,
      })),
    },
  };
}

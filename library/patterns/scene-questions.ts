import { type ScenePlaced, type SceneUse, type Step, place, tap } from "@chalk/author";
import type { Localized } from "@chalk/content";
import type { Color } from "@chalk/prop";
import { TextStyle, sceneChoice, sceneGoal, sceneText } from "@chalk/prop-basics";
import { type Option, seedOf, settle } from "./choice-question";

/**
 * Words and questions for scenes (boards on the event model). A question comes with what it adds
 * to the scene (`use`): its witness, its note checks, and for a check, whether it is right (a need
 * the scene gives) and the note for each wrong state worth one.
 */

/**
 * How a line is said, when it isn't just its screen words: `speak`, the words for the ear ("√2" is
 * said "square root of 2"), and `speaker`, a character of the cast (the narrator when left out).
 */
export type Said = { speak?: Localized; speaker?: string };
const said = (s: Said) => ({
  ...(s.speak === undefined ? {} : { speak: s.speak }),
  ...(s.speaker === undefined ? {} : { speaker: s.speaker }),
});

/** Words on a board: a title, a paragraph, a note, a definition set apart. */
export const words = {
  title: (text: Localized, s: Said = {}) =>
    place(sceneText, { text, style: TextStyle.Title, ...said(s) }),
  body: (text: Localized, s: Said = {}) =>
    place(sceneText, { text, style: TextStyle.Body, ...said(s) }),
  note: (text: Localized, s: Said = {}) =>
    place(sceneText, { text, style: TextStyle.Note, ...said(s) }),
  definition: (text: Localized, color: Color | null = null, s: Said = {}) =>
    place(sceneText, { text, style: TextStyle.Definition, color, ...said(s) }),
};

/** How a scene reads a piece: by its name. */
type Read = (piece: string) => Readonly<Record<string, unknown>>;

/** A wrong state worth a note: when it holds, what the learner is told, and how one gets there. */
export type SceneNote = { when: (read: Read) => boolean; say: Localized; reach: readonly Step[] };

/**
 * "Do it in the prop, then Check": the answer is the state of `about`. `isRight` reads the board;
 * `solve` is how a learner gets it right (the witness).
 */
export function check(spec: {
  name?: string;
  about: string;
  prompt: Localized;
  /** The prompt's spoken words, when they aren't its screen words. */
  speak?: Localized;
  isRight: (read: Read) => boolean;
  solve: readonly Step[];
  notes?: readonly SceneNote[];
}): { piece: ScenePlaced<typeof sceneGoal>; use: SceneUse } {
  const name = spec.name ?? "ask";
  const piece = place(sceneGoal, {
    prompt: spec.prompt,
    about: spec.about,
    ...(spec.speak === undefined ? {} : { speak: spec.speak }),
  });
  const reader = (me: Readonly<Record<string, Readonly<Record<string, unknown>>>>) =>
    ((piece: string) => me[piece] ?? {}) as Read;
  const notes = spec.notes ?? [];
  type T = { to: Record<string, { giveFeedback: (p: { text: Localized }) => unknown }> };
  return {
    piece,
    use: {
      give: { [name]: { isMet: (me: never) => spec.isRight(reader(me)) } },
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
  /** The prompt's spoken words, when they aren't its screen words. */
  speak?: Localized;
  options: readonly Option[];
  answer: string;
  keepOrder?: boolean;
}): { piece: ScenePlaced<typeof sceneChoice>; use: SceneUse } {
  const name = spec.name ?? "ask";
  if (!spec.options.some((o) => o.id === spec.answer))
    throw new Error(`choice: the answer "${spec.answer}" is not one of the options`);
  const ids = spec.options.map((o) => o.id);
  if (new Set(ids).size !== ids.length) throw new Error("choice: two options share an id");
  const shown =
    spec.keepOrder === true
      ? spec.options
      : settle(spec.options, seedOf(`${name}|${spec.prompt.en}|${ids.join(",")}`));
  const piece = place(sceneChoice, {
    prompt: spec.prompt,
    ...(spec.speak === undefined ? {} : { speak: spec.speak }),
    options: shown.map((o) => (o.feedback === undefined ? { id: o.id, label: o.label } : { ...o })),
    answer: spec.answer,
  });
  return {
    piece,
    use: {
      witness: [tap(name, "select", { option: spec.answer }), tap(name, "check")],
      noteChecks: spec.options
        .filter((o) => o.id !== spec.answer && o.feedback !== undefined)
        .map((o) => ({
          steps: [tap(name, "select", { option: o.id }), tap(name, "check")],
          feedback: o.feedback as Localized,
        })),
    },
  };
}
